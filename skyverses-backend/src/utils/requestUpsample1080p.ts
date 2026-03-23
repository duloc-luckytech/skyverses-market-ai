// ✅ File: utils/labsUpsample.ts
import axios from "axios";
import { pollResultVideo } from "./pollResultVideo";

/* -----------------------------------------------------
 * 🔁 Hàm post có retry khi ECONNRESET / ETIMEDOUT
 * --------------------------------------------------- */
async function safeAxiosPost(
  url: string,
  data: any,
  options: any,
  retries = 3
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.post(url, data, options);
    } catch (err: any) {
      if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
        console.warn(`⚠️ Retry ${i + 1}/${retries} after ${err.code}...`);
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("❌ Failed after max retries (ECONNRESET).");
}

/* -----------------------------------------------------
 * 🎥 Upsample video 1080p
 * --------------------------------------------------- */
export default async function requestUpsample1080p({
  mediaGenId,
  sceneId,
  token,
  aspectRatio = "VIDEO_ASPECT_RATIO_LANDSCAPE"
}: {
  mediaGenId: string;
  sceneId: string;
  token: string;
  aspectRatio?: string;
}) {
  try {
    const url =
      "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoUpsampleVideo";

    const payload = {
      clientContext: {
        sessionId: `${Date.now()}`,
        tool: "ASSET_MANAGER",
      },
      requests: [
        {
          aspectRatio,
          videoInput: { mediaId: mediaGenId },
          videoModelKey: "veo_2_1080p_upsampler_8s",
          metadata: { sceneId },
        },
      ],
    };

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      accept: "*/*",
      origin: "https://labs.google",
      referer: "https://labs.google/",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    };

    // 🕒 Gọi API có timeout + retry
    const upsampleRes = await safeAxiosPost(url, payload, {
      headers,
      timeout: 180_000, // ⏱️ 3 phút (có thể nâng lên 600_000 = 10 phút)
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const upsampleOp =
      upsampleRes.data?.operations?.[0]?.operation?.name ||
      upsampleRes.data?.operation?.name;

    if (!upsampleOp) throw new Error("Không nhận được operation name từ API.");

    console.log(`⏳ Polling upsample op ${upsampleOp}...`);
    const upsampleResult = await pollResultVideo({
      operations: [{ sceneId, operationName: upsampleOp }],
      token,
      maxAttempts: 100,
      delayMs: 10000,
    });

    const upsampleDone = upsampleResult.completed?.[0];
    const upsampleUrl = upsampleDone?.fileUrl;
    const mediaGenerationId = upsampleDone?.mediaGenerationId;

    if (!upsampleUrl)
      throw new Error("Không có fileUrl trả về từ upsample operation.");

    return {
      fileUrl: upsampleUrl,
      metadata: upsampleDone,
      mediaGenerationId,
    };
  } catch (err: any) {
    throw err;
  }
}
