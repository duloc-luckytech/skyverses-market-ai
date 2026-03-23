import VideoJob from "../models/VideoJobModel";
import { hoursAgoUTC } from "../utils/time";
import cron from "node-cron";
import UserModel from "../models/UserModel";

export const clearStuckVideoJobs = async () => {
  const cutoff = hoursAgoUTC(10); // 10 hours ago (UTC)

  try {
    const stuckJobs = await VideoJob.find({
      status: "processing",
      createdAt: { $lt: cutoff },
      refunded: { $ne: true }, // ⭐ Chỉ xử lý job chưa refund
    });

    if (stuckJobs.length > 0) {
      console.log(`⚠️ Found ${stuckJobs.length} stuck video jobs to refund`);
    }

    for (const job of stuckJobs) {
      const refund = job.resolution === "1080p" ? 2 : 1;

      // ⭐ Hoàn tiền cho user
      await UserModel.findByIdAndUpdate(job.userId, {
        $inc: { videoUsed: -refund },
      });

      // ⭐ Đánh dấu job đã refund để không hoàn lại lần sau
      await VideoJob.findByIdAndUpdate(job._id, {
        refunded: true,
        status: "reject",
        errorReason: "TIMEOUT_EXCEEDED",
        refundedAt: new Date(),
      });
    }
  } catch (err) {
    console.error("❌ clearStuckVideoJobs error:", err);
  }
};

// Chạy mỗi 5 phút
cron.schedule("*/2 * * * *", async () => {
  console.log("⏳ Cron: clearStuckVideoJobs running...");
  await clearStuckVideoJobs();
});
