import axios from "axios";
import dotenv from "dotenv";
import ImageOwnerModel from "../models/ImageOwnerModel";
import GoogleTokenModel from "../models/GoogleTokenModel";
import { fetchImageMetadata } from "../utils/googleMedia";

dotenv.config();

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1s

export async function pollImageMetadata() {
  const processingList = await ImageOwnerModel.find({
    status: "processing",
    mediaId: { $ne: null },
    imageUrl: null,
    type: { $ne: "edit-image" },
  })
    .sort({ updatedAt: 1 })
    .limit(10);

  const tasks = processingList.map((record: any) => {
    return (async () => {
      try {
        if (!record.googleEmail) return;

        const tokenDoc = await GoogleTokenModel.findOne({
          email: record.googleEmail,
          isActive: true,
        });
        if (!tokenDoc) return;

        const mediaId = record.mediaId;
        const { imageUrl, aspectRatio } = await fetchImageMetadata(
          mediaId,
          record.googleEmail,
          MAX_RETRIES,
          RETRY_DELAY,
          tokenDoc.accessToken
        );

        // Nếu vẫn không lấy được imageUrl chuẩn thì bỏ qua
        if (!imageUrl || imageUrl.includes("lh3.googleusercontent")) {
          console.log(
            `⏳ Chưa sẵn sàng (${mediaId}) → ${imageUrl || "no URL"}`
          );
          return;
        }

        // ✅ Đã sẵn sàng → cập nhật
        record.imageUrl = imageUrl;
        record.aspectRatio = aspectRatio || null;
        record.status = "done";
        record.errorMessage = null;
        await record.save();

        console.log(`✅ Updated metadata for ${mediaId}`);
      } catch (err: any) {
        const message = err?.response?.data
          ? JSON.stringify(err.response.data, null, 2)
          : err.message || "Unknown error";

        console.error(
          `❌ Error polling metadata for ${record._id}: ${message}`
        );

        // Nếu lỗi auth → khóa token lại
        if (message.includes("UNAUTHENTICATED") && record.googleEmail) {
          await GoogleTokenModel.updateOne(
            { email: record.googleEmail },
            { isActive: false, note: "auth error (poll job)" }
          );
          console.warn(`🔴 Token disabled for email: ${record.googleEmail}`);
        }
      }
    })();
  });

  await Promise.allSettled(tasks);
}

// ✅ Lock tránh overlap
let isPolling = false;

setInterval(async () => {
  if (isPolling) return;
  isPolling = true;
  try {
    await pollImageMetadata();
  } catch (err) {
    console.error("⚠️ Poll job error:", err);
  }
  isPolling = false;
}, 15000);