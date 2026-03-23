// services/wan/requestWanTextToVideo.ts
import axios from "axios";
import { WanT2VModel } from "./wanModels";
import { validateWanSize } from "./validateWanSize";
import { normalizeWanDuration } from "./normalizeWanDuration";

interface RequestWanTextToVideoParams {
  prompt: string;
  token: string;

  duration?: number;
  size?: string;

  audio?: boolean;
  shotType?: "single" | "multi";
  audioUrl?: string;

  model?: WanT2VModel;
}

export async function requestWanTextToVideo({
  prompt,
  token,

  // ❌ không default duration ở đây
  duration,

  size = "1920*1080",
  audio = false,
  shotType = "single",
  audioUrl,

  model = "wan2.6-t2v",
}: RequestWanTextToVideoParams) {
  try {
    /* =========================
       VALIDATION
    ========================== */
    validateWanSize(model, size);

    const safeDuration = normalizeWanDuration(model, duration);

    const url =
      "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis";

    const body: any = {
      model,
      input: {
        prompt,
      },
      parameters: {
        size,
        duration: safeDuration,
        audio,
        shot_type: shotType,
        prompt_extend: true,
      },
    };

    if (audioUrl) {
      body.input.audio_url = audioUrl;
    }

    console.log("🟣 [WAN T2V] Request body:",token, body);

    const res = await axios.post(url, body, {
      headers: {
        "X-DashScope-Async": "enable",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 120_000,
    });

    const taskId = res.data?.output?.task_id;
    if (!taskId) {
      console.error("❌ [WAN T2V] Missing task_id:", res.data);
      throw new Error("WAN_T2V_TASK_ID_NOT_RETURNED");
    }

    console.log("✅ [WAN T2V] Task created:", taskId);

    return {
      taskId,
      raw: res.data,
    };
  } catch (err: any) {
    /* =========================
       ERROR LOGGING
    ========================== */
    const errData = err?.response?.data;
    const errStatus = err?.response?.status;

    console.error("❌ [WAN T2V] Error occurred");
    console.error("Status:", errStatus);
    console.error("Response data:", errData);
    console.error("Message:", err?.message);
    console.error("Stack:", err?.stack);

    throw new Error(
      errData
        ? `WAN_T2V_ERROR: ${JSON.stringify(errData)}`
        : `WAN_T2V_ERROR: ${err?.message}`
    );
  }
}