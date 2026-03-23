// jobs/video/worker.ts
import VideoJob, {
  VideoJobStatus,
  VideoEngineProvider,
  VideoJobType,
} from "../../models/VideoJobModelV2";

import { runVideoEngineRequest } from "./engines/runVideoEngineRequest";
import { runVideoEnginePoll } from "./engines/runVideoEnginePoll";

const MAX_CONCURRENCY = 3;

/* =====================================================
   🚀 VIDEO WORKER
===================================================== */
export async function processVideoJobs() {
  /* =========================
     1️⃣ REQUEST PHASE (up to 3 jobs)
  ========================= */

  const pendingJobs = await VideoJob.find({
    type: { $ne: VideoJobType.TEXT_TO_MUSIC },
    status: VideoJobStatus.PENDING,
    "engine.provider": { $ne: VideoEngineProvider.FXLAB }, // fxlab dùng flow riêng
  })
    .sort({ createdAt: -1 })
    .limit(MAX_CONCURRENCY);

  await Promise.allSettled(
    pendingJobs.map(async (job) => {
      // 🔐 atomic lock
      const locked = await VideoJob.findOneAndUpdate(
        {
          _id: job._id,
          status: VideoJobStatus.PENDING,
        },
        {
          $set: {
            status: VideoJobStatus.PROCESSING,
            processingAt: new Date(),
          },
        },
        { new: true }
      );

      if (!locked) return;

      console.log(`⚡ [VID] PICK job=${locked._id} engine=${locked.engine?.provider} model=${locked.engine?.model}`);

      try {
        await runVideoEngineRequest(locked);
      } catch (err: any) {
        locked.status = VideoJobStatus.ERROR;
        locked.error = { message: err.message };
        await locked.save();
      }
    })
  );

  /* =========================
     2️⃣ POLL PHASE (up to 3 jobs)
  ========================= */

  const pollingJobs = await VideoJob.find({
    status: VideoJobStatus.PROCESSING,
    "engineResponse.taskId": { $exists: true, $ne: null },
  })
    .sort({ updatedAt: -1 })
    .limit(MAX_CONCURRENCY);

  await Promise.allSettled(
    pollingJobs.map(async (job) => {
      try {
        await runVideoEnginePoll(job);
      } catch (err: any) {
        job.status = VideoJobStatus.REJECT;
        job.error = { message: err.message };
        await job.save();
      }
    })
  );
}

/* =========================
   ⏱ Worker loop
========================= */

setInterval(() => {
  processVideoJobs().catch(console.error);
}, 15000);