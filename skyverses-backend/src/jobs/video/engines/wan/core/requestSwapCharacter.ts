// services/wan/requestWanImageMixWithVideo.ts
import axios from "axios";

interface RequestWanImageMixParams {
  imageUrl: string;
  videoUrl: string;
  token: string; // DashScope API Key
  mode?: "wan-std";
}

/**
 * Image + Video → Motion Video (MIX)
 * Clone theo API: wan2.2-animate-mix
 */
export async function requestSwapCharacter({
  imageUrl,
  videoUrl,
  token,
  mode = "wan-std",
}: RequestWanImageMixParams) {
  const url =
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/image2video/video-synthesis";

  const res = await axios.post(
    url,
    {
      model: "wan2.2-animate-mix",
      input: {
        image_url: imageUrl,
        video_url: videoUrl,
      },
      parameters: {
        mode,
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
    throw new Error("WAN_MIX: task_id not returned");
  }

  return {
    taskId,
    raw: res.data,
  };
}