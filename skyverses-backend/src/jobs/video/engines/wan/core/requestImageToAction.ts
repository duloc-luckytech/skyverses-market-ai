// services/wan/requestWanImageMoveWithVideo.ts
import axios from "axios";

interface RequestWanImageMoveParams {
  imageUrl: string;
  videoUrl: string;
  token: string; // DashScope API Key
  mode?: "wan-std";
}

/**
 * Image + Video → Motion Video
 * Clone theo API: wan2.2-animate-move
 */
export async function requestImageToAction({
  imageUrl,
  videoUrl,
  token,
  mode = "wan-std",
}: RequestWanImageMoveParams) {
  const url =
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/image2video/video-synthesis";

  const res = await axios.post(
    url,
    {
      model: "wan2.2-animate-move",
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
    throw new Error("WAN_MOVE: task_id not returned");
  }

  return {
    taskId,
    raw: res.data,
  };
}