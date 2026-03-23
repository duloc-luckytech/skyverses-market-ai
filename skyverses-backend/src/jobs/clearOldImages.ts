// jobs/clearOldImages.ts
import ImageOwnerModel from "../models/ImageOwnerModel";
import ImageBase64Model from "../models/ImageBase64Model";
import ImageBase64ForJobModel from "../models/ImageBase64ForJobModel";
import cron from "node-cron";

/**
 * MongoDB luôn lưu createdAt theo UTC.
 * Chỉ cần subtract giờ trực tiếp mà KHÔNG convert sang UTC+7.
 */
export async function clearOldImages() {
  try {
    const now = new Date();

    // 8 giờ trước (cho ImageOwner)
    const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

    // 2 giờ trước (cho Base64)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Xoá ImageOwner quá 8 tiếng
    const ownerOldRes = await ImageOwnerModel.deleteMany({
      createdAt: { $lt: eightHoursAgo },
    });

    // Xoá ImageOwner status reject
    const ownerRejectRes = await ImageOwnerModel.deleteMany({
      status: "reject",
    });

    // Xoá ImageBase64 quá 2 tiếng
    const base64Res = await ImageBase64Model.deleteMany({
      createdAt: { $lt: twoHoursAgo },
    });

    // Xoá ImageBase64ForJob quá 2 tiếng
    const jobRes = await ImageBase64ForJobModel.deleteMany({
      createdAt: { $lt: twoHoursAgo },
    });

    const totalDeleted =
      (ownerOldRes.deletedCount || 0) +
      (ownerRejectRes.deletedCount || 0) +
      (base64Res.deletedCount || 0) +
      (jobRes.deletedCount || 0);

    console.log(`🧹 clearOldImages() → Xoá ${totalDeleted} items`);
  } catch (err: any) {
    console.error("❌ clearOldImages() error:", err);
  }
}

// Chạy mỗi 5 phút
cron.schedule("*/5 * * * *", async () => {
  await clearOldImages();
});