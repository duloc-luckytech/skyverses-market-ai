// jobs/image/worker.ts
import ImageJob, {
  ImageJobStatus,
  ImageEngineProvider,
} from "../../models/ImageJob";

import { runImageEngineRequest } from "./engines/runImageEngineRequest";
import { runImageEnginePoll } from "./engines/runImageEnginePoll";
import { refundJobCredits } from "../../utils/refundJobCredits";

const MAX_CONCURRENCY = 3;

/* =====================================================
   🚀 MAIN WORKER
===================================================== */
export async function processImageJobs() {
  /* =========================
     1️⃣ REQUEST PHASE (up to 3 jobs)
  ========================= */

  const pendingJobs = await ImageJob.find({
    status: ImageJobStatus.PENDING,
    "engine.provider": { $nin: [ImageEngineProvider.FXFLOW, ImageEngineProvider.GROK] }, // fxflow/grok dùng flow riêng (external worker)
  })
    .sort({ createdAt: -1 }) // 🔥 mới nhất trước
    .limit(MAX_CONCURRENCY);

  await Promise.allSettled(
    pendingJobs.map(async (job) => {
      // 🔐 atomic lock từng job
      const locked = await ImageJob.findOneAndUpdate(
        {
          _id: job._id,
          status: ImageJobStatus.PENDING,
        },
        {
          $set: {
            status: ImageJobStatus.PROCESSING,
            processingAt: new Date(),
          },
        },
        { new: true }
      );

      if (!locked) return;

      console.log(`⚡ [IMG] PICK job=${locked._id} engine=${locked.engine?.provider}`);

      try {
        await runImageEngineRequest(locked);
      } catch (err: any) {
        locked.status = ImageJobStatus.ERROR;
        locked.error = { message: err.message };
        await locked.save();
        await refundJobCredits(locked, "image_worker_error");
      }
    })
  );

  /* =========================
     2️⃣ POLL PHASE (up to 3 jobs)
  ========================= */

  const pollingJobs = await ImageJob.find({
    status: ImageJobStatus.PROCESSING,
  })
    .sort({ updatedAt: -1 })
    .limit(MAX_CONCURRENCY);

  await Promise.allSettled(
    pollingJobs.map(async (job) => {
      try {
        await runImageEnginePoll(job);
      } catch (err: any) {
        job.status = ImageJobStatus.REJECT;
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
  processImageJobs().catch(console.error);
}, 15000);

