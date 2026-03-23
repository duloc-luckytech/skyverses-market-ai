import VideoJobModel from "../../models/VideoJobModel";
import { makeSlug } from "../../utils/makeSlug";

export async function init(
  prompt: string,
  durationSeconds = 8,
  veoConfig: Record<string, any> = {},
  userId: any,
  projectName: string,
  projectId: string,
  mediaIdInputExtend?: string,
  startTime?: string,
  endTime?: string,
) {


  // ✅ Tạo job trong DB (chưa gửi Google)
  const job = await VideoJobModel.create({
    prompt,
    duration: durationSeconds,
    resolution: veoConfig.resolution || "720p",
    aspectRatio: veoConfig.aspectRatio || "VIDEO_ASPECT_RATIO_LANDSCAPE",
    generateAudio: veoConfig.generateAudio ?? true,
    status: "pending", // chờ cron xử lý
    progress: 0,
    type: "text-for-extend",
    promptSlug: makeSlug(prompt),
    fileUrl: "",
    projectName,
    userId: userId || null,
    mediaIdInputExtend: mediaIdInputExtend || null,
    startTime,
    endTime,
    projectId
  });

  const jobId = job._id.toString();

  console.log(
    `🆕 Created Labs job ${jobId} [extend-to-video] | Time: ${startTime ?? "?"} → ${endTime ?? "?"}`
  );

  return {
    jobId,
    message: "Labs video job created. Will be processed by cron soon.",
  };
}

export async function initExtend(
  prompt: string,
  durationSeconds = 8,
  veoConfig: Record<string, any> = {},
  userId: any,
  projectName: string,
  projectId: string,
  mediaIdInputExtend?: string,
  startTime?: string,
  endTime?: string,
) {


  // ✅ Tạo job trong DB (chưa gửi Google)
  const job = await VideoJobModel.create({
    prompt,
    duration: durationSeconds,
    resolution: veoConfig.resolution || "720p",
    aspectRatio: veoConfig.aspectRatio || "VIDEO_ASPECT_RATIO_LANDSCAPE",
    generateAudio: veoConfig.generateAudio ?? true,
    status: "pending", // chờ cron xử lý
    progress: 0,
    type: "extend-to-video",
    promptSlug: makeSlug(prompt),
    fileUrl: "",
    projectName,
    projectId,
    userId: userId || null,
    mediaIdInputExtend: mediaIdInputExtend || null,
    startTime,
    endTime,
  });

  const jobId = job._id.toString();

  console.log(
    `🆕 Created Labs job ${jobId} [extend-to-video] | Time: ${startTime ?? "?"} → ${endTime ?? "?"}`
  );

  return {
    jobId,
    message: "Labs video job created. Will be processed by cron soon.",
  };
}