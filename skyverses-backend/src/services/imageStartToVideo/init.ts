import VideoJobModel from "../../models/VideoJobModel";
import { makeSlug } from "../../utils/makeSlug";

/**
 * 🖼️ Tạo 1 job từ startImage → video
 */
export async function init({
  startImage,
  prompt,
  aspectRatio,
  userId,
  resolution,
  images,
  type,
  projectId,
  projectName,
  groupName,
  freeCredit,
  quantity = 1,
  model,
  mode,
  source
}: any) {
  const job: any = await VideoJobModel.create({
    userId,
    prompt,
    duration: 8,
    resolution,
    aspectRatio,
    generateAudio: false,
    status: "pending",
    promptSlug: makeSlug(prompt),
    progress: 0,
    fileUrl: "",
    type,
    source,
    images,
    model,
    mode,
    freeCredit,
    projectId,
    projectName,
    quantity,
    groupName,
    listIdImage: startImage ? [startImage] : [], // ✅ field chứa mediaId duy nhất
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(
    `🆕 Created Labs START-IMAGE job ${job._id.toString()} (waiting for cron)`
  );

  return {
    jobId: job._id.toString(),
    prompt: job.prompt,
  };
}
