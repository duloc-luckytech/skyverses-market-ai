// services/wan/requestWanStartEndImageToVideo.ts
import axios from "axios";

interface RequestWanStartEndImageToVideoParams {
  prompt: string;
  firstFrameUrl: string;
  lastFrameUrl: string;
  token: string; // DashScope API Key
  resolution?: "480P" | "720P" | "1080P";
}

export async function requestWanStartEndImageToVideo({
  prompt,
  firstFrameUrl,
  lastFrameUrl,
  token,
  resolution = "480P",
}: RequestWanStartEndImageToVideoParams) {
  const url =
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/image2video/video-synthesis";

  const res = await axios.post(
    url,
    {
      model: "wan2.1-kf2v-plus",
      input: {
        first_frame_url: firstFrameUrl,
        last_frame_url: lastFrameUrl,
        prompt,
      },
      parameters: {
        resolution,
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
    throw new Error("WAN Start-End I2V: task_id not returned");
  }

  return {
    taskId,
    raw: res.data,
  };
}