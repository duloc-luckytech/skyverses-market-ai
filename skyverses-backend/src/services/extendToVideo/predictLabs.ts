import axios from "axios";
import crypto from "crypto";

interface PredictLabsOptions {
  prompt: string;
  recaptchaToken?:string;
  aspectRatio?: "VIDEO_ASPECT_RATIO_LANDSCAPE" | "VIDEO_ASPECT_RATIO_PORTRAIT";
  modelKey?: string;
  seed?: number;
  token: string;
  projectId: string;
}

interface PredictLabsResult {
  operation: { name: string };
  sceneId: string;
  status: string;
}

/* -----------------------------------------------------
 * 🔁 Safe axios POST with retry (ECONNRESET / ETIMEDOUT)
 * --------------------------------------------------- */
async function safeAxiosPost(
  url: string,
  data: any,
  options: any,
  retries = 3,
  timeout = 120_000 // ⏱️ 120s timeout mỗi lần request
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.post(url, data, {
        ...options,
        timeout,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
    } catch (err: any) {
      const code = err.code || "";
      if (["ECONNRESET", "ETIMEDOUT"].includes(code)) {
        console.warn(`⚠️ predictLabsBatchVideo retry ${i + 1}/${retries} after ${code}...`);
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("❌ predictLabsBatchVideo failed after max retries (ECONNRESET/ETIMEDOUT).");
}

/* -----------------------------------------------------
 * 🎬 Gọi Google Labs Veo3 - Text → Video
 * --------------------------------------------------- */
export async function predictLabsBatchVideo({
  prompt,
  token,
  recaptchaToken,
  projectId,
  aspectRatio,
  seed = Math.floor(Math.random() * 10000),
}: PredictLabsOptions): Promise<PredictLabsResult[]> {
  const url =
    "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoText";

  const selectedModelKey =
    aspectRatio === "VIDEO_ASPECT_RATIO_PORTRAIT"
      ? "veo_3_1_t2v_fast_portrait_ultra"
      : "veo_3_1_t2v_fast_ultra";

  const body = {
    clientContext: {
      projectId,
      recaptchaToken,
      tool: "PINHOLE",
      userPaygateTier: "PAYGATE_TIER_TWO",
    },
    requests: [
      {
        aspectRatio,
        seed,
        textInput: { prompt },
        videoModelKey: selectedModelKey,
        metadata: { sceneId: crypto.randomUUID() },
      },
    ],
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "text/plain;charset=UTF-8",
    Origin: "https://labs.google",
    Referer: "https://labs.google/",
    "User-Agent": "Mozilla/5.0",
  };

  try {
    // ✅ Gọi API với timeout + retry an toàn
    const res = await safeAxiosPost(url, body, { headers }, 3, 120_000);
    const ops = res.data?.operations;

    if (!Array.isArray(ops) || ops.length === 0) {
      throw new Error("❌ Không có operation nào trả về từ Labs API.");
    }

    const results: PredictLabsResult[] = ops.map((item: any) => ({
      operation: item.operation,
      sceneId: item.sceneId,
      status: item.status,
    }));

    return results;
  } catch (err: any) {
    const fullMessage = err?.response?.data
      ? `❌ predictLabsBatchVideo error:\n${JSON.stringify(err.response.data, null, 2)}`
      : `❌ predictLabsBatchVideo unknown error:\n${JSON.stringify(err, null, 2)}`;
    throw new Error(fullMessage);
  }
}