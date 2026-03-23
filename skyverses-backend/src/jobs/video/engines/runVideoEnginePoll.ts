// jobs/video/engines/runVideoEnginePoll.ts
import {
  VideoEngineProvider,
  VideoJobStatus,
} from "../../../models/VideoJobModelV2";

import { pollEngineJob } from "../polling/pollEngine";
import { GommoPollAdapter } from "./gommo/adapter";
import { VeoPollAdapter } from "./veo/adapter";
import { FxlabPollAdapter } from "./fxlab/adapter";
import { WanPollAdapter } from "./wan/adapter";

import UserModel from "../../../models/UserModel";

/* =====================================================
   🔄 VIDEO ENGINE FALLBACK CHAIN
   Thứ tự ưu tiên: gommo → (engine khác sẽ thêm sau)
====================================================== */
const VIDEO_ENGINE_FALLBACK_CHAIN: VideoEngineProvider[] = [
  VideoEngineProvider.GOMMO,
  // TODO: thêm engine fallback tại đây
];

const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/* =====================================================
   REFUND HELPER
===================================================== */
async function refundCreditsIfNeeded(job: any, reason: string) {
  if (
    !job.creditsUsed ||
    job.creditsUsed <= 0 ||
    job.refundedAt ||
    job.status === VideoJobStatus.DONE
  ) {
    return;
  }

  await UserModel.updateOne(
    { _id: job.userId },
    { $inc: { creditBalance: job.creditsUsed } }
  );

  job.refundedAt = new Date();
  job.refundReason = reason;

  await job.save();
  console.log(`💰 [VID] REFUND job=${job._id} credits=${job.creditsUsed} reason=${reason}`);
}

/* =====================================================
   MAIN POLL FUNCTION
===================================================== */
export async function runVideoEnginePoll(job: any) {
  if (!job.engineResponse?.taskId || !job.engineResponse?.pollStartedAt) {
    throw new Error("MISSING_ENGINE_POLL_CONTEXT");
  }

  /* =====================================================
     ⏱ CHECK POLL TIMEOUT (10 min)
  ====================================================== */
  const pollAge = Date.now() - new Date(job.engineResponse.pollStartedAt).getTime();

  if (pollAge > POLL_TIMEOUT_MS) {
    const currentEngine = job.engine.provider;
    const failedEngines: string[] = job.failedEngines || [];

    // Tìm engine tiếp theo trong chain chưa thử
    const nextEngine = VIDEO_ENGINE_FALLBACK_CHAIN.find(
      (e) => e !== currentEngine && !failedEngines.includes(e)
    );

    if (nextEngine) {
      console.warn(
        `⏱ [VID] TIMEOUT job=${job._id} ${Math.round(pollAge / 1000)}s on ${currentEngine} → fallback ${nextEngine}`
      );
      job.failedEngines = [...failedEngines, currentEngine];
      job.engine.provider = nextEngine;
      job.status = VideoJobStatus.PENDING;
      job.engineResponse = null;
      job.progress = { percent: 0, step: "engine_fallback" };
      job.error = null;
      await job.save();
      return;
    }

    // Hết chain → báo lỗi cho user
    console.error(
      `⏱ [VID] TIMEOUT job=${job._id} ${Math.round(pollAge / 1000)}s on ${currentEngine}. No fallback.`
    );

    job.status = VideoJobStatus.ERROR;
    job.progress = { percent: 0, step: "timeout" };
    job.error = {
      stage: "poll",
      provider: currentEngine,
      code: "ENGINE_TIMEOUT",
      message: `Video generation timed out after ${Math.round(pollAge / 60000)} minutes`,
      userMessage: "Video tạo quá lâu. Vui lòng thử lại hoặc chọn model/mode khác.",
    };
    await job.save();

    await refundCreditsIfNeeded(job, "ENGINE_TIMEOUT");
    return;
  }

  /* =====================================================
     🔍 SELECT POLL ADAPTER
  ====================================================== */
  let adapter: any;

  switch (job.engine.provider) {
    case VideoEngineProvider.GOMMO:
      adapter = GommoPollAdapter;
      break;

    case VideoEngineProvider.VEO:
      adapter = VeoPollAdapter;
      break;

    case VideoEngineProvider.FXLAB:
      adapter = FxlabPollAdapter;
      break;

    case VideoEngineProvider.WAN:
      adapter = WanPollAdapter;
      break;

    default:
      throw new Error("UNSUPPORTED_ENGINE");
  }

  try {
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

    /* ⏳ CHƯA XONG → worker poll lại sau */
    if (!poll.done) {
      return;
    }

    /* =====================================================
       DONE → SUCCESS
    ====================================================== */
    job.result = poll.result;
    job.status = VideoJobStatus.DONE;
    job.progress = { percent: 100, step: "done" };

    const elapsed = Math.round((Date.now() - new Date(job.engineResponse.pollStartedAt).getTime()) / 1000);
    console.log(`✅ [VID] DONE job=${job._id} engine=${job.engine.provider} ${elapsed}s`);

    await job.save();
    return;
  } catch (err: any) {
    /* =====================================================
       POLL ERROR
    ====================================================== */
    console.error(`❌ [VID] POLL ERROR job=${job._id} err=${err?.message}`);

    job.status = VideoJobStatus.ERROR;
    job.progress = { percent: 0, step: "error" };

    job.error = {
      stage: "poll",
      provider: job.engine.provider,
      code: err?.code || "ENGINE_POLL_FAILED",
      message: err?.message || "Unknown poll error",
      userMessage:
        err?.userMessage ||
        "Video gặp lỗi trong quá trình xử lý. Hệ thống đã hoàn credit.",
    };

    await job.save();

    await refundCreditsIfNeeded(job, job.error?.code || 'ENGINE_POLL_FAILED');
    return;
  }
}