// processStartImagePoll.ts

import { pollVideoUniversal } from "../../utils/pollVideoUniversal";
import requestUpsample1080p from "../../utils/requestUpsample1080p";

import VideoJobModel from "../../models/VideoJobModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import ProviderTokenModel from "../../models/ProviderToken.model";
import UserModel from "../../models/UserModel";

// 🟢 GOMMO POLL
import { pollGommoTask } from "../ai/gommo/pollGommoTask";

export async function processStartImagePoll() {
  const jobs = await VideoJobModel.find({
    type: "start-image",
    status: { $in: ["processing", "partial", "error"] },
    $or: [
      { source: { $ne: "gommo" }, operationName: { $exists: true } },
      { source: "gommo", taskId: { $exists: true } },
    ],
  })
    .sort({ sentProcessAt: 1 })
    .limit(50);

  if (!jobs.length) return;

  for (const job of jobs) {
    if (job.source === "gommo") {
      await pollStartImageJobGommo(job);
    } else {
      await pollStartImageJobLabs(job);
    }
  }
}

/* ======================================================
   🟢 GOMMO START-IMAGE POLL
====================================================== */
async function pollStartImageJobGommo(job: any) {
  const jobId = job._id.toString();

  const gommoToken = await ProviderTokenModel.findOne({
    provider: "gommo",
    isActive: true,
  }).lean();

  if (!gommoToken?.apiKey) {
    await rejectWithRefund(job, "GOMMO_TOKEN_NOT_AVAILABLE");
    return;
  }

  const result = await pollGommoTask(
    job.taskId,
    gommoToken.apiKey,
    jobId
  );

  // ⏳ CHƯA XONG
  if (
    result.status === "MEDIA_GENERATION_STATUS_PENDING" ||
    result.status === "MEDIA_GENERATION_STATUS_ACTIVE" ||
    result.status === "MEDIA_GENERATION_STATUS_PROCESSING"
  ) {
    return;
  }

  // ❌ FAILED
  if (result.status === "MEDIA_GENERATION_STATUS_FAILED") {
    await rejectWithRefund(job, "GOMMO_FAILED");
    return;
  }

  // ✅ SUCCESS (⚠️ download_url có thể delay)
  if (
    result.status === "MEDIA_GENERATION_STATUS_SUCCESSFUL" &&
    result.videoUrl
  ) {
    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "done",
      fileUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      progress: 100,
      results: result.raw,
      completedAt: new Date(),
    });

    await ProviderTokenModel.findByIdAndUpdate(gommoToken._id, {
      $inc: { successCount: 1 },
      lastActiveAt: new Date(),
    });

    console.log(`✅ GOMMO DONE start-image job ${jobId}`);
    return;
  }

  // ⚠️ SUCCESS nhưng chưa có URL → retry
  if (result.status === "MEDIA_GENERATION_STATUS_SUCCESSFUL") {
    await VideoJobModel.findByIdAndUpdate(jobId, {
      $inc: { errorCount: 1 },
    });
  }
}

/* ======================================================
   🔵 GOOGLE LABS START-IMAGE POLL (GIỮ NGUYÊN)
====================================================== */
async function pollStartImageJobLabs(job: any) {
  const jobId = job._id.toString();
  const totalOps = job.listOperations.length;

  const tokenDoc = await GoogleTokenModel.findOne({
    email: job.sentByEmail,
    isActive: true,
  }).lean();

  if (!tokenDoc?.accessToken) {
    await rejectWithRefund(job, "TOKEN_NOT_AVAILABLE");
    return;
  }

  try {
    const result = await pollVideoUniversal({
      operations: job.listOperations,
      token: tokenDoc.accessToken,
      jobId,
    });

    const completed = result.completed || [];
    const completedCount = completed.length;

    if (completedCount === 0) return;

    let fileUrl = completed[0].fileUrl;
    let mediaGenerationId = completed[0].mediaGenerationId;

    /* 🔼 UPSAMPLE 1080p */
    if (
      job.resolution === "1080p" &&
      mediaGenerationId &&
      !job.didUpsample1080p
    ) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        didUpsample1080p: true,
      });

      try {
        const up = await requestUpsample1080p({
          mediaGenId: mediaGenerationId,
          sceneId: job.sceneId,
          token: tokenDoc.accessToken,
        });

        if (up?.fileUrl) fileUrl = up.fileUrl;
      } catch {}
    }

    const isFull = completedCount === totalOps;
    const isPartial = completedCount > 0 && completedCount < totalOps;

    /* ✅ FULL */
    if (isFull) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "done",
        fileUrl,
        mediaVideoId: mediaGenerationId,
        progress: 100,
        results: result,
        completedAt: new Date(),
      });

      await GoogleTokenModel.findByIdAndUpdate(tokenDoc._id, {
        $inc: { successCount: 1 },
        lastActiveAt: new Date(),
      });

      console.log(`🎉 DONE start-image job ${jobId}`);
      return;
    }

    /* 🟡 PARTIAL */
    if (isPartial) {
      const progress = Math.floor((completedCount / totalOps) * 100);

      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "partial",
        fileUrl,
        progress,
        mediaVideoId: mediaGenerationId,
        results: result,
        updatedAt: new Date(),
      });

      console.log(
        `🟡 PARTIAL start-image ${jobId} → ${completedCount}/${totalOps} (${progress}%)`
      );
      return;
    }
  } catch (err: any) {
    if (err.message?.includes("UNAUTHENTICATED")) {
      await GoogleTokenModel.updateOne(
        { email: job.sentByEmail },
        { isActive: false, note: err.message }
      );

      await rejectWithRefund(job, "TOKEN_INVALID");
      return;
    }

    console.error(`❌ Poll start-image job ${jobId}:`, err?.message);
  }
}

/* ------------------------------------------------------
   ❌ REJECT + REFUND (CHUNG)
------------------------------------------------------ */
async function rejectWithRefund(job: any, reason: string) {
  const refundUnit = job.resolution === "1080p" ? 2 : 1;
  const totalRefund = refundUnit * (job.quantity || 1);

  await VideoJobModel.findByIdAndUpdate(job._id, {
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

  console.warn(
    `⛔ Reject job ${job._id} (${job.type}) | reason=${reason} | refund=${totalRefund}`
  );
}

/* ------------------------------------------------------
   ⏱️ INTERVAL
------------------------------------------------------ */
setInterval(processStartImagePoll, 30_000);