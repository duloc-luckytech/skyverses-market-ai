// pollTextJobs.ts

import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import ProviderTokenModel from "../../models/ProviderToken.model";

import requestUpsample1080p from "../../utils/requestUpsample1080p";
import { pollVideoUniversal } from "../../utils/pollVideoUniversal";

// 🟣 WAN
import { pollWanTask } from "../ai/wan/pollWanTask";

// 🟢 GOMMO
import { pollGommoTask } from "../ai/gommo/pollGommoTask";

const POLL_DELAY_MS = 10_000;
const MAX_ERROR_RETRY = 120;

/* -------------------------------------------------------
   🚀 ENTRY
--------------------------------------------------------- */
export async function pollTextJobs() {
  const jobs = await VideoJobModel.find({
    type: "text",
    status: { $in: ["processing"] },
  })
    .sort({ sentProcessAt: 1 })
    .limit(200);

  if (!jobs.length) return;

  for (const job of jobs) {
    pollOneJob(job);
  }
}

/* -------------------------------------------------------
   🧠 ROUTER
--------------------------------------------------------- */
async function pollOneJob(job: any) {
  if (job.source === "wan") {
    return pollWanJob(job);
  }

  if (job.source === "gommo") {
    return pollGommoJob(job);
  }

  return pollLabsJob(job);
}

/* =======================================================
   🟣 WAN POLL
======================================================= */
async function pollWanJob(job: any) {
  const { _id, taskId } = job;
  const jobId = String(_id);

  const wanToken = await ProviderTokenModel.findOne({
    provider: "wan",
    isActive: true,
  });

  if (!wanToken?.apiKey) {
    await rejectAndRefund(job, "WAN_TOKEN_NOT_AVAILABLE");
    return;
  }

  const result = await pollWanTask(taskId, wanToken.apiKey, jobId);

  if (result.status === "PENDING" || result.status === "RUNNING") {
    return;
  }

  if (result.status === "SUCCEEDED") {
    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "done",
      fileUrl: result.videoUrl,
      results: result.raw,
      progress: 100,
      completedAt: new Date(),
    });

    await ProviderTokenModel.findByIdAndUpdate(wanToken._id, {
      $inc: { successCount: 1 },
      lastActiveAt: new Date(),
    });

    console.log(`✅ WAN DONE job ${jobId}`);
    return;
  }

  if (result.status === "UNKNOWN") {
    await VideoJobModel.findByIdAndUpdate(jobId, {
      $inc: { errorCount: 1 },
    });
  }
}

/* =======================================================
   🟢 GOMMO POLL
======================================================= */
async function pollGommoJob(job: any) {
  const { _id, videoId, taskId } = job; // videoId = id_base
  const jobId = String(_id);

  const gommoToken = await ProviderTokenModel.findOne({
    provider: "gommo",
    isActive: true,
  });

  if (!gommoToken?.apiKey) {
    await rejectAndRefund(job, "GOMMO_TOKEN_NOT_AVAILABLE");
    return;
  }

  const result = await pollGommoTask(taskId, gommoToken.apiKey, jobId);

  if (
    result.status === "MEDIA_GENERATION_STATUS_PENDING" ||
    result.status === "MEDIA_GENERATION_STATUS_ACTIVE" ||
    result.status === "MEDIA_GENERATION_STATUS_PROCESSING"
  ) {
    return;
  }

  if (result.status === "MEDIA_GENERATION_STATUS_SUCCESSFUL") {
    // ⚠️ Gommo có thể SUCCESS trước khi có download_url
    if (!result.videoUrl) return;

    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "done",
      fileUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      results: result.raw,
      progress: 100,
      completedAt: new Date(),
    });

    await ProviderTokenModel.findByIdAndUpdate(gommoToken._id, {
      $inc: { successCount: 1 },
      lastActiveAt: new Date(),
    });

    console.log(`✅ GOMMO DONE job ${jobId}`);
    return;
  }

  if (result.status === "UNKNOWN") {
    await VideoJobModel.findByIdAndUpdate(jobId, {
      $inc: { errorCount: 1 },
    });
  }
}

/* =======================================================
   🔵 LABS POLL
======================================================= */
async function pollLabsJob(job: any) {
  const { _id, sceneId, resolution, listOperations, sentByEmail } = job;

  const jobId = String(_id);

  const tokenDoc = await ProviderTokenModel.findOne({
    provider: "labs",
    email: sentByEmail,
    isActive: true,
  });

  if (!tokenDoc?.accessToken) {
    await rejectAndRefund(job, "TOKEN_NOT_AVAILABLE");
    return;
  }

  try {
    const result = await pollVideoUniversal({
      operations: listOperations,
      token: tokenDoc.accessToken,
      jobId,
    });

    const completed = result.completed?.[0];
    if (!completed) return;

    let fileUrl = completed.fileUrl;

    if (
      resolution === "1080p" &&
      completed.mediaGenerationId &&
      job.didUpsample1080p !== true
    ) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        didUpsample1080p: true,
      });

      const up = await requestUpsample1080p({
        mediaGenId: completed.mediaGenerationId,
        sceneId,
        token: tokenDoc.accessToken,
      });

      if (up?.fileUrl) fileUrl = up.fileUrl;
    }

    const isPartial = result.completed.length < listOperations.length;

    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: isPartial ? "partial" : "done",
      fileUrl,
      results: result,
      progress: 100,
      completedAt: new Date(),
    });

    await ProviderTokenModel.findByIdAndUpdate(tokenDoc._id, {
      $inc: { successCount: 1 },
      lastActiveAt: new Date(),
    });

    console.log(`✅ LABS DONE job ${jobId}`);
  } catch (err: any) {
    if (err.message?.includes("UNAUTHENTICATED")) {
      await ProviderTokenModel.updateOne(
        { _id: tokenDoc._id },
        { isActive: false, note: err.message }
      );
      console.warn(`🔴 Labs token disabled: ${tokenDoc.email}`);
    }

    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "error",
      $inc: { errorCount: 1 },
    });
  }
}

/* -------------------------------------------------------
   ❌ REJECT + REFUND (CHUNG)
--------------------------------------------------------- */
async function rejectAndRefund(job: any, reason: string) {
  await VideoJobModel.findByIdAndUpdate(job._id, {
    status: "reject",
    errorMessage: reason,
    refunded: true,
    refundedAt: new Date(),
  });

  if (!job.freeCredit) {
    const refund = job.resolution === "1080p" ? 2 : 1;
    await UserModel.findByIdAndUpdate(job.userId, {
      $inc: { videoUsed: -(refund * job.quantity) },
    });
  }
}

/* -------------------------------------------------------
   ⏱️ INTERVAL
--------------------------------------------------------- */
setInterval(pollTextJobs, 15_000);
