import {
  ImageEngineProvider,
  ImageJobStatus,
} from "../../../models/ImageJob";
import { refundJobCredits } from "../../../utils/refundJobCredits";

import { runGommoImageRequest } from "./gommo/request";
import { runVideoRequestForWan } from "./running/request";
import { runFxlabRequest } from "./fxlab/request";

export async function runImageEngineRequest(job: any) {
  if (!job.engine?.provider) {
    throw new Error("ENGINE_PROVIDER_MISSING");
  }

  try {
    job.status = ImageJobStatus.PROCESSING;
    await job.save();

    let result: any;

    switch (job.engine.provider) {
      case ImageEngineProvider.GOMMO:
        result = await runGommoImageRequest(job);
        break;

      case ImageEngineProvider.RUNNING:
        result = await runVideoRequestForWan(job);
        break;

      case ImageEngineProvider.FXLAB:
        try {
          result = await runFxlabRequest(job);
        } catch (fxlabErr: any) {
          console.warn(
            `⚠️ [ImageEngine] Fxlab failed for job ${job._id}: ${fxlabErr.message}. Falling back to Gommo...`
          );

          // Switch engine to Gommo
          job.engine.provider = ImageEngineProvider.GOMMO;
          job.engine.model = job.engine.model || "google_image_gen_4_5";

          // Rebuild enginePayload for Gommo format
          job.enginePayload = {
            ...job.enginePayload,
            mode: job.enginePayload?.mode || "cheap",
            resolution: job.enginePayload?.resolution || "1k",
            privacy: job.enginePayload?.privacy || "PRIVATE",
            projectId: job.enginePayload?.projectId || "default",
          };

          await job.save();

          console.log(
            `🔄 [ImageEngine] Retrying job ${job._id} with Gommo engine...`
          );
          result = await runGommoImageRequest(job);
        }
        break;

      default:
        throw new Error(`UNSUPPORTED_ENGINE: ${job.engine.provider}`);
    }

    console.log(`🚀 [IMG] SENT job=${job._id} engine=${job.engine.provider} taskId=${result.taskId || 'sync'}`);

    /* =====================================================
       DETECT SYNC vs ASYNC result
    ====================================================== */

    // FXLAB = always sync
    if (job.engine.provider === ImageEngineProvider.FXLAB) {
      job.result = result;
      job.status = ImageJobStatus.DONE;
      job.progress = { percent: 100, step: "done" };
    }
    // Gommo can return sync (status=SUCCESS in create response)
    else if (
      result.raw?.imageInfo?.status === "SUCCESS" &&
      result.raw?.imageInfo?.url
    ) {
      console.log(`✅ [IMG] DONE (sync) job=${job._id} url=${result.raw.imageInfo.url?.substring(0, 60)}...`);
      const info = result.raw.imageInfo;
      job.result = {
        images: info.url ? [info.url] : [],
        thumbnail: info.url_preview || info.url,
        imageId: info.image_id,
      };
      job.status = ImageJobStatus.DONE;
      job.progress = { percent: 100, step: "done" };
    }
    // Async: needs polling
    else {
      job.engineResponse = {
        taskId: result.taskId,
        accessToken: result.accessToken,
        raw: result.raw,
        pollStartedAt: new Date(),
      };
      job.progress = { percent: 20, step: "requested" };
      console.log(`🔄 [IMG] ASYNC job=${job._id} taskId=${result.taskId} → polling`);
    }

    await job.save();
  } catch (err: any) {
    job.status = ImageJobStatus.ERROR;
    job.error = { message: err.message };
    await job.save();
    await refundJobCredits(job, "image_engine_error");
    throw err;
  }
}