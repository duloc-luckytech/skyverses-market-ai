import axios from "axios";
import dotenv from "dotenv";
import ImageOwnerModel from "../models/ImageOwnerModel";
import ImageBase64Model from "../models/ImageBase64Model";
import GoogleTokenModel from "../models/GoogleTokenModel";
import UserModel from "../models/UserModel";

dotenv.config();

const MAX_CONCURRENT_PER_EMAIL = 2;
const REQUEST_TIMEOUT = 90_000; // ⏱️ 90s timeout mỗi upload
const RETRY_LIMIT = 3;

/* -------------------------------------------------------
 * 🔁 Safe axios POST (retry khi ECONNRESET / ETIMEDOUT)
 * ----------------------------------------------------- */
async function safeAxiosPost(
  url: string,
  data: any,
  options: any,
  retries = RETRY_LIMIT
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.post(url, data, {
        ...options,
        timeout: REQUEST_TIMEOUT,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
    } catch (err: any) {
      const code = err.code || "";
      if (["ECONNRESET", "ETIMEDOUT"].includes(code)) {
        console.warn(
          `⚠️ Retry uploadUserImage ${i + 1}/${retries} after ${code}...`
        );
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      throw err;
    }
  }
  throw new Error("❌ uploadUserImage failed after max retries.");
}

/* -------------------------------------------------------
 * 🧠 Upload image job processor
 * ----------------------------------------------------- */
export async function uploadImageJob() {
  const processingMap = new Map<string, number>();

  // 1️⃣ Đếm số lượng đang xử lý theo email
  const processingList = await ImageOwnerModel.find({
    status: "processing",
    type: { $ne: "edit-image" },
  }).lean();
  for (const item of processingList) {
    if (item.googleEmail) {
      const count = processingMap.get(item.googleEmail) || 0;
      processingMap.set(item.googleEmail, count + 1);
    }
  }

  // 2️⃣ Lấy pending jobs
  const pendingList = await ImageOwnerModel.find({ status: "pending" })
    .sort({ createdAt: 1 })
    .limit(5);

  const tasks = pendingList.map((record: any) =>
    (async () => {
      try {
        const user = await UserModel.findById(record.userId).lean();
        if (!user?.googleId) return;

        const tokenDoc = await GoogleTokenModel.findById(user.googleId);
        if (!tokenDoc?.isActive) return;

        const email = tokenDoc.email;
        if (!email) return;

        const currentProcessing = processingMap.get(email) || 0;
        if (currentProcessing >= MAX_CONCURRENT_PER_EMAIL) return;

        /* ⏳ Chờ base64 tối đa 10s (3 lần retry) */
        let base64Doc = null;
        const maxWaitTime = 10_000;
        const maxRetries = 3;
        let waited = 0;
        let attempt = 0;

        while (attempt < maxRetries && waited < maxWaitTime) {
          base64Doc = await ImageBase64Model.findOne({ imageId: record._id });
          if (base64Doc?.base64) break;

          const delay = 500 + attempt * 300;
          await new Promise((r) => setTimeout(r, delay));
          waited += delay;
          attempt++;
        }

        if (!base64Doc?.base64) return;

        /* 🧾 Upload payload */
        const payload = {
          clientContext: {
            sessionId: `${Date.now()}`,
            tool: "ASSET_MANAGER",
          },
          imageInput: {
            aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE",
            isUserUploaded: true,
            mimeType: "image/jpeg",
            rawImageBytes: base64Doc.base64,
          },
        };

        /* ✅ Upload ảnh với timeout + retry */
        const uploadRes = await safeAxiosPost(
          "https://aisandbox-pa.googleapis.com/v1:uploadUserImage",
          payload,
          {
            headers: {
              Authorization: `Bearer ${tokenDoc.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const mediaId =
          uploadRes.data?.mediaGenerationId?.mediaGenerationId ||
          uploadRes.data?.mediaGenerationId;
        const width = uploadRes.data?.width;
        const height = uploadRes.data?.height;

        if (!mediaId) throw new Error("❌ Upload returned no mediaId");

        // ✅ Cập nhật record
        record.status = "processing";
        record.googleEmail = email;
        record.mediaId = mediaId;
        record.width = width;
        record.height = height;
        await record.save();

        // 🧹 Xóa base64 sau khi upload thành công
        await ImageBase64Model.deleteOne({ imageId: record._id });
      } catch (err: any) {
        // 🧾 Parse error message & reason
        const errorData = err?.response?.data;
        const message = errorData
          ? JSON.stringify(errorData, null, 2)
          : err.message || "Unknown error";

        const isAuthError = message.includes("UNAUTHENTICATED");

        // 🔍 Extract reason nếu có (VD: PUBLIC_ERROR_MINOR_UPLOAD)
        let errorReason: string | null = null;
        try {
          const details = errorData?.error?.details || [];
          const reasonObj = details.find((d: any) => d?.reason);
          if (reasonObj?.reason) errorReason = reasonObj.reason;
        } catch {}

        // 🛑 Token lỗi → disable token + xóa base64 + record
        if (isAuthError && record.googleEmail) {
          await GoogleTokenModel.updateOne(
            { email: record.googleEmail },
            { isActive: false, note: "Authentication failed" }
          );
          await ImageBase64Model.deleteOne({ imageId: record._id });
          await record.deleteOne();
          return;
        }

        // 🚫 Nếu là lỗi upload nhẹ (ví dụ PUBLIC_ERROR_MINOR_UPLOAD) → reject luôn
        if (
          errorReason === "PUBLIC_ERROR_MINOR_UPLOAD" ||
          errorReason === "PUBLIC_ERROR_SEXUAL" ||
          errorReason === "PUBLIC_ERROR_UNSAFE_GENERATION"
        ) {
          record.status = "reject";
          record.errorReason = errorReason;
          record.errorCode = errorReason;
          record.errorMessage =
            "Image rejected due to Google AI minor upload restriction.";
          await record.save();
          console.warn(`🚫 [${record.originalName}] rejected (${errorReason})`);
          return;
        }

        // ❌ Các lỗi khác → giữ lại để retry
        record.status = "fail";
        record.retryCount = (record.retryCount || 0) + 1;
        record.errorMessage = message;
        if (errorReason) record.errorReason = errorReason;
        await record.save();
      }
    })()
  );

  await Promise.allSettled(tasks);
}

/* -------------------------------------------------------
 * 🕒 Cron lock tránh overlap
 * ----------------------------------------------------- */
let isUploading = false;
setInterval(async () => {
  if (isUploading) return;
  isUploading = true;
  try {
    await uploadImageJob();
  } catch (err) {
    console.error("⚠️ Upload cron error:", err);
  }
  isUploading = false;
}, 30000);
