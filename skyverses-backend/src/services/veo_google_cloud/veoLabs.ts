import axios from "axios";
import crypto from "crypto"

interface PredictLabsOptions {
  prompt: string;
  projectId: string;
  modelKey?: string;
  aspectRatio?: "VIDEO_ASPECT_RATIO_LANDSCAPE" | "VIDEO_ASPECT_RATIO_PORTRAIT";
  seed?: number;
  token: string;
}

export async function predictLabsBatchVideo({
  prompt,
  projectId,
  modelKey = "veo_3_1_t2v_fast_ultra",
  aspectRatio = "VIDEO_ASPECT_RATIO_LANDSCAPE",
  seed = Math.floor(Math.random() * 10000),
  token,
}: PredictLabsOptions): Promise<{
  sceneId: string;
  operation: any;
  status: string;
}> {
  const url = "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoText";

  const sceneId = crypto.randomUUID(); // hoặc Date.now().toString()

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
          sceneId,
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

    const data = res.data;
    const op = data?.operations?.[0];

    if (!op?.sceneId || !op?.operation || !op?.status) {
      throw new Error("❌ Không nhận được đủ dữ liệu từ Labs API");
    }

    return {
      sceneId: op.sceneId,
      operation: op.operation,
      status: op.status,
    };
  } catch (err: any) {
    console.error("❌ predictLabsBatchVideo error:", err.response?.data || err.message);
    throw err;
  }
}