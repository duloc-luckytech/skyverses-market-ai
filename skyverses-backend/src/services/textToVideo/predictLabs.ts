import axios from "axios";
import crypto from "crypto";

interface PredictLabsOptions {
  prompt: string;
  recaptchaToken?: string;
  quantity?:number;
  freeCredit:boolean,
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
 * 🔁 Safe axios POST (retry khi ECONNRESET / ETIMEDOUT / ECONNABORTED)
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
      if (
        err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT" ||
        err.code === "ECONNABORTED"
      ) {
        console.warn(
          `⚠️ predictLabsBatchVideo retry ${i + 1}/${retries} after ${
            err.code
          }...`
        );
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("❌ predictLabsBatchVideo failed after max retries.");
}

/* -----------------------------------------------------
 * 🚀 Gọi API Text → Video Generation (Google Labs Veo3)
 * --------------------------------------------------- */
export async function predictLabsBatchVideo({
  prompt,
  quantity=1,
  token,
  freeCredit = false,
  projectId,
  recaptchaToken,
  aspectRatio = "VIDEO_ASPECT_RATIO_LANDSCAPE",
  seed = Math.floor(Math.random() * 10000),
}: PredictLabsOptions): Promise<PredictLabsResult[]> {
  const url =
    "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoText";

  const baseModelKey =
    aspectRatio === "VIDEO_ASPECT_RATIO_PORTRAIT"
      ? "veo_3_1_t2v_fast_portrait_ultra"
      : "veo_3_1_t2v_fast_ultra";

  // ⭐ Free credit → dùng relaxed model
  const selectedModelKey = freeCredit
    ? `${baseModelKey}_relaxed`
    : baseModelKey;

  /* ============================================================
      TẠO NHIỀU REQUEST THEO QUALITY
     ============================================================ */
  const requests = Array.from({ length: quantity }).map(() => ({
    aspectRatio,
    seed: Math.floor(Math.random() * 100000), // hoặc dùng seed chung
    textInput: { prompt },
    videoModelKey: selectedModelKey,
    metadata: { sceneId: crypto.randomUUID() },
  }));

  const requestBody = {
    clientContext: {
      projectId,
      tool: "PINHOLE",
      userPaygateTier: "PAYGATE_TIER_TWO",
      recaptchaToken
    },
    requests,
  };

  const headers = {
    accept: "*/*",
    "accept-language":
      "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,fr-FR;q=0.6,fr;q=0.5",
    authorization: `Bearer ${token}`,
    "cache-control": "no-cache",
    "content-type": "text/plain;charset=UTF-8",
    origin: "https://labs.google",
    pragma: "no-cache",
    priority: "u=1, i",
    referer: "https://labs.google/",
    "sec-ch-ua":
      '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    "x-browser-channel": "stable",
    "x-browser-copyright": "Copyright 2025 Google LLC. All rights reserved.",
    "x-browser-validation": "jFliu1AvGMEE7cpr93SSytkZ8D4=",
    "x-browser-year": "2025",
    "x-client-data": "CJK2yQEIpLbJAQipncoBCPvbygEIkqHLAQj0o8sBCIagzQEIkIfPAQ==",
  };

  try {
    const res = await safeAxiosPost(
      url,
      JSON.stringify(requestBody),
      {
        headers,
        transformRequest: [(data: any) => data],
        timeout: 120_000, // ⏱️ Timeout 2 phút
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
      3 // retry tối đa 3 lần
    );

    const ops = res.data?.operations;
    if (!Array.isArray(ops) || ops.length === 0) {
      throw new Error("❌ Không có operation nào trả về từ Labs API.");
    }

    return ops.map((item: any) => ({
      operation: item.operation,
      sceneId: item.sceneId,
      status: item.status,
    }));
  } catch (err: any) {
    const message = err?.response?.data
      ? `❌ predictLabsBatchVideo error:\n${JSON.stringify(
          err.response.data,
          null,
          2
        )}`
      : `❌ predictLabsBatchVideo unknown error:\n${JSON.stringify(
          err,
          null,
          2
        )}`;
    throw new Error(message);
  }
}
