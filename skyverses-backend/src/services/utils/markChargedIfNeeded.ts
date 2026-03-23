import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";

export async function markChargedIfNeeded(jobId: string, userId: string) {
  const job = await VideoJobModel.findById(jobId).lean();

  if (!job) return;

  // Đã charge rồi → bỏ qua
  if (job.charged) return;

  // Tính số lượng quota sẽ + thêm
  let chargeAmount = 1 * (job?.quantity || 1); // mặc định

  // ⭐ Nếu render 1080p → charge 2
  if (job.resolution === "1080p" || job.resolution === "1080") {
    chargeAmount = 2 * (job?.quantity || 1);
  }

  // Đánh dấu đã charge job
  await VideoJobModel.findByIdAndUpdate(jobId, {
    charged: true,
    chargedAt: new Date(),
  });

  if (job?.freeCredit == false) {
    // Tăng quota cho user
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { videoUsed: chargeAmount },
    });
  }
}
