import { requestWanTextToVideo } from "./core/requestWanTextToVideo";
import { requestWanImageToVideo } from "./core/requestWanImageToVideo";
import { requestWanStartEndImageToVideo } from "./core/requestWanStartEndImageToVideo";

import { getAccessTokenForJob } from "../../../../utils/getAccessTokenForJob";

/**
 * VIDEO REQUEST DISPATCHER
 * -----------------------
 * - text-to-video        → WAN (T2V)
 * - image-to-video       → WAN (I2V)
 * - start-end-image      → WAN (Start → End Image)
 */
export async function runVideoRequestForWan(job: any) {
  const typeVideo = job.type;

  // ⭐ lấy token WAN từ DB
  const accessToken = await getAccessTokenForJob("wan");

  /* =====================================================
     CASE 1️⃣ — TEXT → VIDEO (WAN)
  ====================================================== */
  if (typeVideo === "text-to-video") {
    if (!job.enginePayload?.prompt) {
      throw new Error("WAN_MISSING_PROMPT");
    }

    const info = await requestWanTextToVideo({
      prompt: job.enginePayload.prompt,
      token: accessToken,

      // optional config
      duration: job.config?.duration,
      size: job.config?.size,
      audio: job.config?.audio,
      shotType: job.config?.shotType,
      audioUrl: job.config?.audioUrl,
      model: job.config?.model,
    });

    return {
      taskId: info.taskId,
      accessToken,
    };
  }

  /* =====================================================
     CASE 2️⃣ — IMAGE → VIDEO (WAN)
  ====================================================== */
  if (typeVideo === "image_to_video") {
    if (!job.enginePayload?.prompt) {
      throw new Error("WAN_MISSING_PROMPT");
    }

    if (!job.input?.images) {
      throw new Error("WAN_MISSING_IMAGE_URL");
    }
    const info = await requestWanImageToVideo({
      prompt: job.enginePayload.prompt,
      imageUrl: job.input.images[0],
      token: accessToken,

      // optional config
      duration: job.config?.duration,
      resolution: job.config?.resolution?.toUpperCase(), // "480P" | "720P" | "1080P"
      audio: job.config?.audio,
      shotType: job.config?.shotType,
    });

    return {
      taskId: info.taskId,
      accessToken,
    };
  }

  /* =====================================================
     CASE 3️⃣ — START → END IMAGE (WAN)
  ====================================================== */
  if (typeVideo === "start_end_image") {
    if (!job.enginePayload?.prompt) {
      throw new Error("WAN_MISSING_PROMPT");
    }

    if (!job.enginePayload?.startImageUrl) {
      throw new Error("WAN_MISSING_START_IMAGE");
    }

    if (!job.enginePayload?.endImageUrl) {
      throw new Error("WAN_MISSING_END_IMAGE");
    }

    const info = await requestWanStartEndImageToVideo({
      prompt: job.enginePayload.prompt,
      firstFrameUrl: job.input?.images[0],
      lastFrameUrl: job.input?.images[1],
      token: accessToken,
      resolution: job.config?.resolution?.toUpperCase(), // "480P" | "720P" | "1080P"
    });

    return {
      taskId: info.taskId,
      accessToken,
    };
  }

  /* =====================================================
     UNKNOWN TYPE
  ====================================================== */
  throw new Error(`UNSUPPORTED_VIDEO_TYPE: ${typeVideo}`);
}
