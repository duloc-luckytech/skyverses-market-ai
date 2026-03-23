import axios from "axios";
import crypto from "crypto"

interface PredictLabsOptions {
  prompt: string;
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

export async function predictLabsBatchVideo({
  prompt,
  token,
  projectId,
  aspectRatio = "VIDEO_ASPECT_RATIO_LANDSCAPE",
  modelKey = "veo_3_1_t2v_fast_ultra",
  seed = Math.floor(Math.random() * 10000),
}: PredictLabsOptions): Promise<PredictLabsResult[]> {
  const url = "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoText";

  const body = {
    clientContext: {
      projectId,
      tool: "PINHOLE",
      userPaygateTier: "PAYGATE_TIER_TWO",
    },
    requests: [
      {
        aspectRatio,
        seed,
        textInput: {
          prompt,
        },
        videoModelKey: modelKey,
        metadata: {
          sceneId: crypto.randomUUID(),
        },
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
    const res = await axios.post(url, body, { headers });
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
    console.error("❌ predictLabsBatchVideo error:", err.response?.data || err.message);
    throw new Error("❌ Gửi prompt tới Labs API thất bại");
  }
}