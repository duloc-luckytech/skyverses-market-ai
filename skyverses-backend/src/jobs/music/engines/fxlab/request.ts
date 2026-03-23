import { ingredientsCharacters } from "./core/ingredientsCharacters";
import { textVideo } from "./core/textVideo";
import { imageToVideo } from "./core/imageToVideo";
import { startEndToVideo } from "./core/startEndToVideo";

import { getAccessTokenForJob } from "../../../../utils/getAccessTokenForJob";

/* =========================
   ASPECT RATIO MAPPING
========================= */
export type AspectRatioInput =
  | "16:9"
  | "9:16"
  | "1:1"
  | "landscape"
  | "portrait"
  | "VIDEO_ASPECT_RATIO_LANDSCAPE"
  | "VIDEO_ASPECT_RATIO_PORTRAIT";

export function mapToLabsAspectRatio(
  value?: AspectRatioInput
): "VIDEO_ASPECT_RATIO_LANDSCAPE" | "VIDEO_ASPECT_RATIO_PORTRAIT" | undefined {
  if (!value) return undefined;

  switch (value) {
    case "16:9":
    case "landscape":
    case "VIDEO_ASPECT_RATIO_LANDSCAPE":
      return "VIDEO_ASPECT_RATIO_LANDSCAPE";

    case "9:16":
    case "portrait":
    case "VIDEO_ASPECT_RATIO_PORTRAIT":
      return "VIDEO_ASPECT_RATIO_PORTRAIT";

    case "1:1":
      return "VIDEO_ASPECT_RATIO_LANDSCAPE";

    default:
      return "VIDEO_ASPECT_RATIO_LANDSCAPE";
  }
}

/**
 * VIDEO REQUEST DISPATCHER (FXLAB)
 * -------------------------------
 * - ingredients    → Reference Images → Video
 * - text-to-video  → Text → Video
 * - image-to-video → Start Image → Video
 */
export async function runVideoRequestFx(job: any) {
  const typeVideo = job.type;

  // ⭐ lấy token từ DB
  const accessToken = await getAccessTokenForJob();

  /* =====================================================
     INGREDIENTS (REFERENCE IMAGES → VIDEO)
  ====================================================== */
  if (typeVideo === "ingredients") {
    if (!job.enginePayload?.prompt) {
      throw new Error("FXLAB_MISSING_PROMPT");
    }

    if (!Array.isArray(job.enginePayload?.mediaIds)) {
      throw new Error("FXLAB_MISSING_MEDIA_IDS");
    }

    const info = await ingredientsCharacters({
      prompt: job.enginePayload.prompt,
      mediaIds: job.input.images,
      quantity: job.enginePayload.quantity || 1,
      freeCredit: false,
      aspectRatio: mapToLabsAspectRatio(job.config?.aspectRatio),
      token: accessToken,
      recaptchaToken: job.recaptchaToken,
    });

    return {
      taskId: info.taskId,
      accessToken,
    };
  }

  /* =====================================================
     TEXT → VIDEO
  ====================================================== */
  if (typeVideo === "text-to-video") {
    if (!job.enginePayload?.prompt) {
      throw new Error("FXLAB_MISSING_PROMPT");
    }

    const info = await textVideo({
      prompt: job.enginePayload.prompt,
      quantity: job.enginePayload.quantity || 1,
      freeCredit: false,
      aspectRatio: mapToLabsAspectRatio(job.config?.aspectRatio),
      token: accessToken,
      recaptchaToken: job.recaptchaToken,
    });

    return {
      taskId: info.taskId,
      accessToken,
    };
  }

  /* =====================================================
     IMAGE → VIDEO (START IMAGE)
  ====================================================== */
  if (typeVideo === "image-to-video") {
    if (!job.enginePayload?.prompt) {
      throw new Error("FXLAB_MISSING_PROMPT");
    }

    if (!job.input?.images[0]) {
      throw new Error("FXLAB_MISSING_START_IMAGE_MEDIA_ID");
    }

    const info = await imageToVideo({
      prompt: job.enginePayload.prompt,
      startImageMediaId: job.input.images[0],
      quantity: job.enginePayload.quantity || 1,
      freeCredit: false,
      aspectRatio: mapToLabsAspectRatio(job.config?.aspectRatio),
      token: accessToken,
      recaptchaToken: job.recaptchaToken,
    });

    return {
      taskId: info.taskId,
      accessToken,
    };
  }

  if (typeVideo === "start-end-image") {
    if (!job.input?.images[0] || job.input?.images[1]) {
      throw new Error("FXLAB_MISSING_START_IMAGE_MEDIA_ID");
    }
    const info = await startEndToVideo({
      prompt: job.enginePayload.prompt,
      startImageMediaId: job.input.images[0],
      endImageMediaId: job.input.images[1],
      quantity: job.enginePayload.quantity || 1,
      freeCredit: false,
      aspectRatio: mapToLabsAspectRatio(job.config?.aspectRatio),
      token: accessToken,
      recaptchaToken: job.recaptchaToken,
    });

    return {
      taskId: info.taskId,
      accessToken,
    };
  }

  /* =====================================================
     UNSUPPORTED
  ====================================================== */
  return {
    taskId: null,
    accessToken: null,
  };
}
