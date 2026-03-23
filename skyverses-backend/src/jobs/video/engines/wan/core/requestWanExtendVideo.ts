// services/wan/requestWanExtendVideo.ts
import axios from "axios";

interface RequestWanExtendVideoParams {
  prompt: string;
  referenceVideoUrls: string[];
  token: string; // DashScope API Key
  duration?: number;
  size?: string; // "1280*720"
  audio?: boolean;
  shotType?: "single" | "multi";
}

export async function requestWanExtendVideo({
  prompt,
  referenceVideoUrls,
  token,
  duration = 10,
  size = "1280*720",
  audio = false,
  shotType = "multi",
}: RequestWanExtendVideoParams) {
  const url =
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis";

  const res = await axios.post(
    url,
    {
      model: "wan2.6-r2v",
      input: {
        prompt,
        reference_video_urls: referenceVideoUrls,
      },
      parameters: {
        size,
        duration,
        audio,
        shot_type: shotType,
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
    throw new Error("WAN R2V: task_id not returned");
  }

  return {
    taskId,
    raw: res.data,
  };
}