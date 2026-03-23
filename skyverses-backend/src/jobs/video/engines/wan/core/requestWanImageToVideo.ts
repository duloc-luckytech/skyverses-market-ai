// services/wan/requestWanImageToVideo.ts
import axios from "axios";

interface RequestWanImageToVideoParams {
  prompt: string;
  imageUrl: string;
  token: string; // DashScope API Key
  duration?: number;
  resolution?: "480P" | "720P" | "1080P";
  audio?: boolean;
  shotType?: "single" | "multi";
}

export async function requestWanImageToVideo({
  prompt,
  imageUrl,
  token,
  duration = 10,
  resolution = "720P",
  audio = false,
  shotType = "multi",
}: RequestWanImageToVideoParams) {
  const url =
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis";

  const res = await axios.post(
    url,
    {
      model: "wan2.6-i2v",
      input: {
        prompt,
        img_url: imageUrl,
      },
      parameters: {
        duration,
        resolution,
        audio,
        shot_type: shotType,
        prompt_extend: true,
      },
    },
    {
      headers: {
        "X-DashScope-Async": "enable",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 120_000,
    }
  );

  const taskId = res.data?.output?.task_id;
  if (!taskId) {
    throw new Error("WAN: task_id not returned");
  }

  return {
    taskId,
    raw: res.data,
  };
}