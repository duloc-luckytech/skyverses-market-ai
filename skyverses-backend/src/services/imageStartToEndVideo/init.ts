import VideoJobModel from "../../models/VideoJobModel";
import { makeSlug } from "../../utils/makeSlug";

/**
 * 🖼️ Tạo 1 job từ startImage + endImage → video
 */
export async function generateLabsStartAndEndImageJob({
  startImage,
  endImage,
  prompt,
  aspectRatio ,
  userId,
  type,
  resolution,
  groupName,
  freeCredit,
  quantity=1,
  images,
  model,
  source,
  mode,
}: any) {
  // ⚙️ Chuẩn hóa mảng listIdImage
  const listIdImage =
    startImage || endImage
      ? [startImage, endImage].filter(Boolean) // chỉ lấy phần tử có giá trị
      : [];

  const job: any = await VideoJobModel.create({
    userId,
    prompt,
    images,
    model,
    mode,
    source,
    duration: 8,
    resolution,
    aspectRatio,
    generateAudio: false,
    status: "pending",
    promptSlug: makeSlug(prompt),
    progress: 0,
    fileUrl: "",
    type,
    freeCredit,
    quantity,
    listIdImage, // ✅ rỗng nếu cả 2 null
    createdAt: new Date(),
    updatedAt: new Date(),
    groupName
  });

  console.log(
    `🆕 Created Labs START-END-IMAGE job ${job._id.toString()} (waiting for cron)`
  );

  return {
    jobId: job._id.toString(),
    startImage,
    endImage,
    prompt,
  };
}