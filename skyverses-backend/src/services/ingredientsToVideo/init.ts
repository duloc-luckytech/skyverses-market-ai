import VideoJobModel from "../../models/VideoJobModel";
import { makeSlug } from "../../utils/makeSlug";

/**
 * 🎬 Tạo 1 job scene (ảnh → video) từ nhiều mediaId (ảnh)
 */
export async function init({
  mediaIds,
  prompt,
  aspectRatio = "VIDEO_ASPECT_RATIO_LANDSCAPE",
  userId,
  resolution,
  groupName,
  freeCredit,
  quantity=1
}: {
  mediaIds: string[];
  prompt: string;
  resolution?: string;
  aspectRatio?: string;
  userId: string | null;
  groupName: string;
  freeCredit:boolean
  quantity:number
}) {
  if (!mediaIds?.length) {
    throw new Error("❌ mediaIds không được rỗng");
  }

  const job: any = await VideoJobModel.create({
    userId,
    prompt,
    promptSlug: makeSlug(prompt),
    duration: 8,
    resolution: resolution,
    aspectRatio,
    generateAudio: false,
    status: "pending",
    progress: 0,
    fileUrl: "",
    type: "scene",
    quantity,
    groupName,
    freeCredit,
    listIdImage: mediaIds, // ✅ đây là field chứa mảng ảnh
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(
    `🆕 Created Labs SCENE job ${job._id.toString()} (waiting for cron)`
  );

  return {
    jobId: job._id.toString(),
    mediaIds: job.listIdImage,
    prompt: job.prompt,
  };
}
