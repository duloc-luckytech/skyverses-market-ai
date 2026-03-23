import VideoJob from "../models/VideoJobModel";
import CaptchaToken from "../models/CaptchaToken.model";

export const retryPermissionDeniedVideoJobs = async () => {
  try {

    const jobs = await VideoJob.find({
      status: "error",
      errorMessage: { $regex: "PERMISSION_DENIED", $options: "i" },
    });

    if (jobs.length > 0) {
      console.log(
        `♻️ Found ${jobs.length} PERMISSION_DENIED jobs → reset to pending`
      );
    }

    for (const job of jobs) {
      await VideoJob.findByIdAndUpdate(job._id, {
        status: "pending",
        updatedAt: new Date(),
      });
    }

    const deleted = await CaptchaToken.deleteMany({
      status: "used",
    });

    if (deleted.deletedCount) {
      console.log(`🧹 Deleted ${deleted.deletedCount} used captcha(s) `);
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const deletedPending = await CaptchaToken.deleteMany({
      status: "pending",
      createdAt: { $lte: fiveMinutesAgo },
    });

    if (deletedPending.deletedCount) {
      console.log(
        `🧹 Deleted ${deleted.deletedCount} expired pending captcha(s)`
      );
    }
  } catch (err) {
    console.error("❌ retryPermissionDeniedVideoJobs error:", err);
  }
};

setInterval(async () => {
  try {
    await retryPermissionDeniedVideoJobs();
  } finally {
  }
}, 15_000);
