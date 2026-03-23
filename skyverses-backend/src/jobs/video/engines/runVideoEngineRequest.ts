import {
  VideoEngineProvider,
  VideoJobStatus,
} from "../../../models/VideoJobModelV2";

import UserModel from "../../../models/UserModel";

import { getPricingCredits } from "../../../utils/getPricingCredits";

import { runGommoRequest } from "./gommo/request";
import { runVideoRequestFx } from "./fxlab/request";
import { runVideoRequestForWan } from "./wan/request";

export async function runVideoEngineRequest(job: any) {
  if (!job.engine?.provider) {
    const err: any = new Error("ENGINE_PROVIDER_MISSING");
    err.code = "ENGINE_PROVIDER_MISSING";
    throw err;
  }

  try {
    /* =====================================================
       1️⃣ CALCULATE CREDITS
    ====================================================== */
    const credits = await getPricingCredits({
      engine: job.engine.provider.toLowerCase(),
      modelKey: job.engine.model,
      resolution: job.config?.resolution || "720p",
      duration: job.config?.duration,
      mode: job.enginePayload?.mode,
    });

    /* =====================================================
       2️⃣ DEDUCT USER CREDIT (ATOMIC)
    ====================================================== */
    const user = await UserModel.findOneAndUpdate(
      {
        _id: job.userId,
        creditBalance: { $gte: credits }, // ⭐ chống âm credit
      },
      {
        $inc: { creditBalance: -credits },
      },
      { new: true }
    );

    if (!user) {
      const err: any = new Error("INSUFFICIENT_CREDITS");
      err.code = "INSUFFICIENT_CREDITS";
      err.message = "INSUFFICIENT_CREDITS";
      err.creditsRequired = credits;
      throw err;
    }

    job.creditsUsed = credits;

    await job.save();

    /* =====================================================
       4️⃣ SEND ENGINE REQUEST
    ====================================================== */
    let result: any;

    switch (job.engine.provider) {
      case VideoEngineProvider.GOMMO:
        result = await runGommoRequest(job);
        break;

      case VideoEngineProvider.FXLAB:
        result = await runVideoRequestFx(job);
        break;

      case VideoEngineProvider.WAN:
        result = await runVideoRequestForWan(job);
        break;

      default:
        throw new Error(`UNSUPPORTED_ENGINE: ${job.engine.provider}`);
    }

    /* =====================================================
       5️⃣ UPDATE JOB STATUS
    ====================================================== */
    job.engineResponse = {
      taskId: result.taskId,
      accessToken: result.accessToken,
      raw: result.raw,
      pollStartedAt: new Date(),
    };

    console.log(`🚀 [VID] SENT job=${job._id} engine=${job.engine.provider} taskId=${result.taskId}`);

    job.status = VideoJobStatus.PROCESSING;
    job.progress = { percent: 20, step: "requested" };
    console.log(`🔄 [VID] ASYNC job=${job._id} taskId=${result.taskId} → polling`);

    await job.save();
  } catch (err: any) {
    /* =====================================================
       ERROR HANDLING
    ====================================================== */
    console.error(`❌ [VID] REQUEST ERROR job=${job._id} err=${err?.message}`);

    job.status = VideoJobStatus.ERROR;
    job.progress = { percent: 0, step: "error" };

    job.error = {
      code: err?.code || "ENGINE_REQUEST_FAILED",
      message: err?.message || "Unknown engine request error",
      userMessage: err?.message || err?.code,
      raw: err?.response?.data || err,
    };

    await job.save();

    // ❌ Không refund mặc định
    return;
  }
}
