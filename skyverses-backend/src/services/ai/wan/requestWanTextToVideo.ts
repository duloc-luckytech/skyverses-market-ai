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
  // ✅ validate size theo model
  validateWanSize(model, size);

  // ✅ normalize duration theo model
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
      duration: safeDuration, // ✅ GUARANTEED VALID
      audio,
      shot_type: shotType,
      prompt_extend: true,
    },
  };

  if (audioUrl) {
    body.input.audio_url = audioUrl;
  }
  console.log('body',body)
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
    throw new Error("WAN T2V: task_id not returned");
  }

  return {
    taskId,
    model,
    size,
    duration: safeDuration,
    raw: res.data,
  };
}