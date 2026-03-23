// pollTextJobs.ts
import VideoJobModel from "../../models/VideoJobModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import requestUpsample1080p from "../../utils/requestUpsample1080p";
import { pollVideoUniversal } from "../../utils/pollVideoUniversal";
import UserModel from "../../models/UserModel";

const MAX_ERROR_RETRY = 120;

export async function pollTextJobs() {
  const jobs = await VideoJobModel.find({
    type:  "start-image-redirect",
    status: { $in: ["pending", "partial", "error"] },
    errorCount: { $lt: MAX_ERROR_RETRY },
    operationName: { $exists: true },
  })
    .sort({ sentProcessAt: 1 })
    .limit(200);

  if (!jobs.length) return;

  for (const job of jobs) pollOneJob(job);
}

async function pollOneJob(job: any) {
  const { _id, sceneId, resolution, listOperations } = job;
  const jobId = String(_id);
  const totalOps = listOperations.length;

  /* ----------------------------------------------------------
   * 1) FIND TOKEN
   * --------------------------------------------------------*/
  const tokenDoc = await GoogleTokenModel.findOne({
    email: job.sentByEmail,
    isActive: true,
  });

  if (!tokenDoc) {
    await rejectWithRefund(job, "TOKEN_NOT_AVAILABLE");
    return;
  }

  try {
    /* ----------------------------------------------------------
     * 2) POLL GOOGLE
     * --------------------------------------------------------*/
    const result = await pollVideoUniversal({
      operations: listOperations,
      token: tokenDoc.accessToken,
      jobId,
    });

    const completedList = result.completed || [];
    const completedCount = completedList.length;

    /* ----------------------------------------------------------
     * 3) NO RESULT YET → CONTINUE POLLING
     * --------------------------------------------------------*/
    if (completedCount === 0) return;

    let fileUrl = completedList[0].fileUrl;
    let mediaGenerationId = completedList[0].mediaGenerationId;

    /* ----------------------------------------------------------
     * 4) UPSAMPLE 1080p
     * --------------------------------------------------------*/
    if (
      resolution === "1080p" &&
      mediaGenerationId &&
      !job.didUpsample1080p
    ) {
      await VideoJobModel.findByIdAndUpdate(jobId, { didUpsample1080p: true });

      try {
        const up = await requestUpsample1080p({
          mediaGenId:mediaGenerationId,
          sceneId,
          token: tokenDoc.accessToken,
        });

        if (up?.fileUrl) fileUrl = up.fileUrl;
      } catch {}
    }

    const isFull = completedCount === totalOps;
    const isPartial = completedCount > 0 && completedCount < totalOps;

    /* ----------------------------------------------------------
     * 5) FULL SUCCESS
     * --------------------------------------------------------*/
    if (isFull) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "done",
        fileUrl,
        results: result,
        mediaVideoId:mediaGenerationId,
        progress: 100,
        completedAt: new Date(),
      });

      await GoogleTokenModel.findByIdAndUpdate(tokenDoc._id, {
        $inc: { successCount: 1 },
        lastActiveAt: new Date(),
      });

      console.log(`🎉 DONE text job ${jobId}`);
      return;
    }

    /* ----------------------------------------------------------
     * 6) PARTIAL SUCCESS
     * --------------------------------------------------------*/
    if (isPartial) {
      const progress = Math.floor((completedCount / totalOps) * 100);

      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "partial",
        fileUrl,
        results: result,
        mediaVideoId:mediaGenerationId,
        progress,
        updatedAt: new Date(),
      });

      console.log(
        `🟡 PARTIAL text ${jobId} → ${completedCount}/${totalOps} (${progress}%)`
      );
      return;
    }
  } catch (err: any) {
    /* ----------------------------------------------------------
     * TOKEN DIE
     * --------------------------------------------------------*/
    if (err.message?.includes("UNAUTHENTICATED")) {
      await GoogleTokenModel.updateOne(
        { email: job.sentByEmail },
        { isActive: false, note: err.message }
      );
      console.warn(`🔴 Token disabled: ${job.sentByEmail}`);

      await rejectWithRefund(job, "TOKEN_INVALID");
    }
  }
}

/* ----------------------------------------------------------
 * Reject + Refund Helper
 * --------------------------------------------------------*/
async function rejectWithRefund(job: any, reason: string) {
  const jobId = job._id;
  const refundUnit = job.resolution === "1080p" ? 2 : 1;
  const totalRefund = refundUnit * (job.quantity || 1);

  await VideoJobModel.findByIdAndUpdate(jobId, {
    status: "reject",
    errorReason: reason,
    refunded: true,
    refundedAt: new Date(),
    completedAt: new Date(),
  });

  if (!job.freeCredit) {
    await UserModel.findByIdAndUpdate(job.userId, {
      $inc: { videoUsed: -totalRefund },
    });
  }

  console.warn(`⛔ Reject text job ${jobId}: ${reason} (refund ${totalRefund})`);
}

setInterval(pollTextJobs, 15000);