// services/wan/requestWanTextToVideo.ts
import axios from "axios";
import { WAN_T2V_SIZES, WanT2VModel } from "./wanSizes";
import { validateWanSize } from "./validateWanSize";

interface RequestWanTextToVideoParams {
  prompt: string;
  token: string;
  duration?: number;

  size?: string;

  audio?: boolean;
  shotType?: "single" | "multi";
  audioUrl?: string;
}

export async function requestWanTextToVideo({
  prompt,
  token,
  duration = 10,

  // ⚠️ default theo spec wan2.6-t2v
  size = "1920*1080",

  audio = false,
  shotType = "multi",
  audioUrl,
}: RequestWanTextToVideoParams) {
  const model: WanT2VModel = "wan2.6-t2v";

  // ✅ VALIDATE SIZE TRƯỚC KHI GỌI API
  validateWanSize(model, size);

  const url =
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis";

  const body: any = {
    model,
    input: {
      prompt,
    },
    parameters: {
      size, // ✅ width*height only
      duration,
      audio,
      shot_type: shotType,
      prompt_extend: true,
    },
  };

  if (audioUrl) {
    body.input.audio_url = audioUrl;
  }

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
    raw: res.data,
  };
}
