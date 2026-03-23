// jobs/image/engines/runImageEnginePoll.ts

import ImageJob, {
  ImageJobStatus,
  ImageEngineProvider,
} from "../../../models/ImageJob";

import { pollEngineJob } from "../polling/pollEngine";
import { GommoImagePollAdapter } from "./gommo/adapter";
import { RunningHubImagePollAdapter } from "./running/adapter";

import { VeoPollAdapter } from "./veo/adapter";
import { FxlabPollAdapter } from "./fxlab/adapter";

/* =====================================================
   🔄 ENGINE FALLBACK CHAIN
   Thứ tự ưu tiên: gommo → (engine khác sẽ thêm sau)
   Khi engine timeout/error, chuyển sang engine kế tiếp
====================================================== */
const IMAGE_ENGINE_FALLBACK_CHAIN: ImageEngineProvider[] = [
  ImageEngineProvider.GOMMO,
  // TODO: thêm engine fallback tại đây
  // ImageEngineProvider.RUNNING,
];

const POLL_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

export async function runImageEnginePoll(job: any) {
  if (!job.engineResponse?.taskId || !job.engineResponse?.pollStartedAt) {
    throw new Error("MISSING_ENGINE_POLL_CONTEXT");
  }

  /* =====================================================
     ⏱ CHECK POLL TIMEOUT (30s)
     Nếu quá 30s mà chưa done → chuyển engine fallback
  ====================================================== */
  const pollAge = Date.now() - new Date(job.engineResponse.pollStartedAt).getTime();

  if (pollAge > POLL_TIMEOUT_MS) {
    const currentEngine = job.engine.provider;
    const failedEngines: string[] = job.failedEngines || [];

    // Tìm engine tiếp theo trong chain chưa thử
    const nextEngine = IMAGE_ENGINE_FALLBACK_CHAIN.find(
      (e) => e !== currentEngine && !failedEngines.includes(e)
    );

    if (nextEngine) {
      console.warn(
        `⏱ [ImagePoll] Job ${job._id} timeout after ${Math.round(pollAge / 1000)}s on ${currentEngine}. Switching to ${nextEngine}...`
      );

      // Lưu engine đã fail
      job.failedEngines = [...failedEngines, currentEngine];
      job.engine.provider = nextEngine;
      job.status = ImageJobStatus.PENDING;
      job.engineResponse = null;
      job.progress = { percent: 0, step: "engine_fallback" };
      job.error = null;
      await job.save();
      return;
    }

    // Không còn engine nào trong chain → log warning, tiếp tục poll
    console.warn(
      `⏱ [ImagePoll] Job ${job._id} timeout ${Math.round(pollAge / 1000)}s on ${currentEngine}. No fallback engine available. Continuing poll...`
    );
  }

  /* =====================================================
     🔍 SELECT POLL ADAPTER
  ====================================================== */
  let adapter: any;

  switch (job.engine.provider) {
    case ImageEngineProvider.GOMMO:
      adapter = GommoImagePollAdapter;
      break;

    case ImageEngineProvider.VEO:
      adapter = VeoPollAdapter;
      break;

    case ImageEngineProvider.WAN:
      adapter = GommoImagePollAdapter;
      break;

    case ImageEngineProvider.RUNNING:
      adapter = RunningHubImagePollAdapter;
      break;

    default:
      throw new Error("UNSUPPORTED_ENGINE");
  }

  /* =====================================================
     POLL ONCE (NON-BLOCKING)
  ====================================================== */
  const poll = await pollEngineJob(
    {
      jobId: job.engineResponse.taskId,
      pollStartedAt: job.engineResponse.pollStartedAt,
    },
    adapter,
    {},
    {
      accessToken: job.engineResponse.accessToken,
    }
  );

  /* ⏳ CHƯA XONG → ĐỂ WORKER POLL LẠI */
  if (!poll.done) {
    return;
  }

  /* =====================================================
     DONE
  ====================================================== */
  job.result = poll.result;
  job.status = ImageJobStatus.DONE;
  job.progress = { percent: 100, step: "done" };

  const elapsed = Math.round((Date.now() - new Date(job.engineResponse.pollStartedAt).getTime()) / 1000);
  console.log(`✅ [IMG] DONE (poll) job=${job._id} engine=${job.engine.provider} ${elapsed}s`);

  await job.save();
}

