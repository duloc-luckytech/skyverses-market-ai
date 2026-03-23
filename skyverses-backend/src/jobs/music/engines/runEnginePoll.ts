// jobs/video/engines/runVideoEnginePoll.ts
import {
  VideoEngineProvider,
  VideoJobStatus,
} from "../../../models/VideoJobModelV2";

import { pollEngineJob } from "../polling/pollEngine";
import { GommoMusicPollAdapter } from "./gommo/adapter";
import { VeoPollAdapter } from "./veo/adapter";
import { FxlabPollAdapter } from "./fxlab/adapter";
import { WanPollAdapter } from "./wan/adapter";

import UserModel from "../../../models/UserModel";

/* =====================================================
   REFUND HELPER (INLINE – có thể tách utils sau)
===================================================== */
async function refundCreditsIfNeeded(job: any, reason: string) {
  // ❌ Không refund nếu:
  if (
    !job.creditsUsed ||
    job.creditsUsed <= 0 ||
    job.refundedAt || // đã refund rồi
    job.status === VideoJobStatus.DONE // đã giao hàng
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
}

/* =====================================================
   MAIN POLL FUNCTION
===================================================== */
export async function runVideoEnginePoll(job: any) {
  if (!job.engineResponse?.taskId || !job.engineResponse?.pollStartedAt) {
    throw new Error("MISSING_ENGINE_POLL_CONTEXT");
  }

  let adapter: any;

  switch (job.engine.provider) {
    case VideoEngineProvider.GOMMO:
      adapter = GommoMusicPollAdapter;
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
         DONE → SUCCESS (NO REFUND)
      ====================================================== */
    job.result = poll.result;
    job.status = VideoJobStatus.DONE;
    job.progress = { percent: 100, step: "done" };

    await job.save();
    return;
  } catch (err: any) {
    /* =====================================================
         POLL ERROR
      ====================================================== */
    console.error("❌ runVideoEnginePoll ERROR:", err);

    job.status = VideoJobStatus.ERROR;
    job.progress = { percent: 0, step: "error" };

    job.error = {
      stage: "poll",
      provider: job.engine.provider,
      code: err?.code || "ENGINE_POLL_FAILED",
      message: err?.message || "Unknown poll error",
      raw: err?.raw || err?.response?.data || err,
      userMessage:
        err?.userMessage ||
        "Video gặp lỗi trong quá trình xử lý. Hệ thống đã hoàn credit.",
    };

    await job.save();

    /* =====================================================
         💰 REFUND CREDIT
      ====================================================== */
    await refundCreditsIfNeeded(job, job.error?.code || 'ENGINE_POLL_FAILED');

    // ❌ KHÔNG throw → tránh crash worker
    return;
  }
}