import axios from "axios";
import VideoJobModel from "../../models/VideoJobModel";

/**
 * Gọi Vertex AI Veo3 predictLongRunning
 * và đồng thời tạo VideoJob trong MongoDB
 */
export async function predictLongRunning({
  projectId,
  locationId,
  modelId,
  apiEndpoint,
  prompt,
  durationSeconds,
  headers,
  veoConfig = {},
}: {
  projectId: string;
  locationId: string;
  modelId: string;
  apiEndpoint: string;
  prompt: string;
  durationSeconds: number;
  headers: any;
  veoConfig?: Record<string, any>;
}) {
  if (!prompt) throw new Error("❌ Missing prompt input");

  // ✅ Chuẩn bị body gửi Vertex AI
  const body = {
    endpoint: `projects/${projectId}/locations/${locationId}/publishers/google/models/${modelId}`,
    instances: [{ prompt }],
    parameters: {
      aspectRatio: "16:9",
      sampleCount: 1,
      durationSeconds,
      personGeneration: "allow_all",
      addWatermark: true,
      includeRaiReason: true,
      generateAudio: true,
      resolution: "720p",
      ...veoConfig, // override cấu hình FE
    },
  };

  const url = `https://${apiEndpoint}/v1/projects/${projectId}/locations/${locationId}/publishers/google/models/${modelId}:predictLongRunning`;

  console.log("🚀 Sending Vertex LongRunningPredict...");
  console.log("🧠 Prompt:", prompt);
  console.log("⚙️ Params:", body.parameters);

  // ✅ Gọi API Vertex AI
  const res = await axios.post(url, body, { headers });
  const operationName = res.data?.name;

  if (!operationName) throw new Error("❌ No operation name returned");

  console.log(`📡 Vertex operation: ${operationName}`);

  // ✅ Trả về cả jobId và operationName để tiếp tục poll
  return {
    operationName,
  };
}
