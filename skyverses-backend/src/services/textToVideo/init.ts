import VideoJobModel from "../../models/VideoJobModel";
import { makeSlug } from "../../utils/makeSlug";
import { normalizeWanDuration } from "../../services/ai/wan/normalizeWanDuration";

function mapResolutionToWanSize(
  resolution: string,
  aspectRatio?: string
): string {
  const isPortrait =
    aspectRatio === "VIDEO_ASPECT_RATIO_PORTRAIT";

  if (resolution === "1080p") {
    return isPortrait ? "1080*1920" : "1920*1080";
  }

  return isPortrait ? "720*1280" : "1280*720";
}

export async function init(
  prompt: string,
  durationSeconds = 8,
  veoConfig: Record<string, any> = {},
  userId: any,
  model: string,
  mode: string,
  source: string,
  recaptchaToken: string,
  quantity: number = 1,
  freeCredit: boolean,
  groupName: any,
  projectName?: string
) {
  /* ================= DEFAULT ================= */
  let duration = durationSeconds;
  let resolution = veoConfig.resolution || "720p";
  let aspectRatio =
    veoConfig.aspectRatio || "VIDEO_ASPECT_RATIO_LANDSCAPE";

  const extraFields: Record<string, any> = {};

  /* ================= WAN PARSE ================= */
  if (model === "wan") {
    // 1️⃣ duration theo rule WAN
    duration = normalizeWanDuration("wan2.6-t2v", durationSeconds);

    // 2️⃣ suy ra size từ resolution + aspect
    const size = mapResolutionToWanSize(resolution, aspectRatio);

    extraFields.size = size;     // ⭐ WAN dùng
    extraFields.taskId = null;   // set sau khi submit

    // 3️⃣ vẫn giữ resolution để FE/UI dùng
    resolution = resolution;
    aspectRatio = aspectRatio;
  }

  /* ================= CREATE JOB ================= */
  const job = await VideoJobModel.create({
    prompt,
    duration,
    resolution,
    mode,
    source,
    aspectRatio,
    generateAudio: veoConfig.generateAudio ?? true,

    status: "pending",
    progress: 0,
    fileUrl: "",
    type: "text",

    userId: userId || null,
    projectName,
    groupName,
    freeCredit,
    quantity,

    model,
    recaptchaToken,
    promptSlug: makeSlug(prompt),

    // WAN-only
    ...extraFields,
  });

  return {
    jobId: job._id.toString(),
    message: `${model.toUpperCase()} video job created.`,
  };
}