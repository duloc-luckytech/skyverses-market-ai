import axios from "axios";

/**
 * Poll trạng thái job Vertex AI Veo3 (chỉ đọc tiến độ)
 */
export async function pollOperation({
  operationName,
  projectId,
  locationId,
  modelId,
  apiEndpoint,
  headers,
  maxAttempts = 60,
  delayMs = 10000,
}: any) {
  let videoInfo: any = null;

  for (let i = 1; i <= maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, delayMs));

    try {
      const res = await axios.post(
        `https://${apiEndpoint}/v1/projects/${projectId}/locations/${locationId}/publishers/google/models/${modelId}:fetchPredictOperation`,
        { operationName },
        { headers }
      );

      const progress = res.data?.metadata?.progressPercent ?? 0;
      console.log(`🔁 [${i}] Progress: ${progress}%`);

      if (res.data?.response?.videos?.length) {
        videoInfo = res.data.response.videos[0];
        break;
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message;
      if (msg?.includes("not started")) {
        console.log(`⏳ [${i}] Not ready yet...`);
      } else {
        console.error(`⚠️ Poll error [${i}]: ${msg}`);
      }
    }
  }

  if (!videoInfo) throw new Error("❌ No video returned after polling");
  return videoInfo;
}