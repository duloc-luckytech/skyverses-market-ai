import { getAuthToken } from "./auth";
import { predictLabsBatchVideo } from "./predictLabs";
import { pollLabsOperation } from "./pollLabsOperation";
import VideoJobModel from "../../models/VideoJobModel";
import {makeSlug} from '../../utils/makeSlug'

const LABS_MODEL_KEY =
  process.env.VEO_LABS_MODEL_KEY || "veo_3_1_t2v_fast_ultra";
const LABS_PROJECT_ID = process.env.VEO_LABS_PROJECT_ID || "labs";

/**
 * 🎬 Hàm tạo video từ Google Labs Veo API (async)
 */
export async function generateLabsVideo(
  prompt: string,
  durationSeconds = 8,
  veoConfig: Record<string, any> = {},
  userId?: string
) {
  console.log("🎬 Starting Labs video generation...");
  console.log("🧠 Prompt:", prompt);

  // ✅ Tạo job trong DB
  const job = await VideoJobModel.create({
    prompt,
    promptSlug: makeSlug(prompt),
    duration: durationSeconds,
    resolution: veoConfig.resolution || "720p",
    aspectRatio: veoConfig.aspectRatio || "16:9",
    generateAudio: veoConfig.generateAudio ?? true,
    status: "pending",
    progress: 0,
    fileUrl: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const jobId = job._id.toString();
  console.log(`🆕 Created Labs job: ${jobId}`);

  (async () => {
    try {
      const token = await getAuthToken();

      // 🔁 Gửi batch request đến Labs API
      const operations = await predictLabsBatchVideo({
        prompt,
        token,
        projectId: LABS_PROJECT_ID,
        modelKey: LABS_MODEL_KEY,
        aspectRatio: veoConfig.aspectRatio || "VIDEO_ASPECT_RATIO_LANDSCAPE",
      });

      const { operation, sceneId } = operations[0]; // dùng phần tử đầu
      const operationName = operation.name;

      console.log("📡 Labs operation:", operationName);

      // ✅ Update DB với operationName
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "processing",
        operationName,
        updatedAt: new Date(),
      });

      // ⏳ Poll kết quả
      const result = await pollLabsOperation({
        operations: [{ sceneId, operationName }], // <-- fixed: pass operationName
        token,
        maxAttempts: veoConfig.maxAttempts || 60,
        delayMs: veoConfig.pollDelayMs || 5000,
      });

      const completed = result.completed?.[0];
      const fileUrl = completed?.fileUrl;

      if (!fileUrl) throw new Error("❌ No video URL returned from Labs");

      // ✅ Cập nhật DB khi xong
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "done",
        progress: 100,
        fileUrl,
        completedAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Labs job ${jobId} completed.`);
    } catch (err: any) {
      console.error(`❌ Labs job ${jobId} failed:`, err.message);
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "error",
        errorMessage: err.message,
        updatedAt: new Date(),
      });
    }
  })();

  return {
    jobId,
    message: "Labs video job created and processing in background.",
  };
}
