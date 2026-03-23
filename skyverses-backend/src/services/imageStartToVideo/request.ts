import axios from "axios";
import crypto from "crypto";

interface GenerateStartImageVideoOptions {
  prompt: string;
  startImageMediaId: string;
  token: string;
  quantity?: number;
  recaptchaToken?: string;

  freeCredit?: boolean; // ⭐ THÊM freeCredit

  aspectRatio?: "VIDEO_ASPECT_RATIO_LANDSCAPE" | "VIDEO_ASPECT_RATIO_PORTRAIT";
  modelKey?: string;
  seed?: number;
  projectId?: string;
}

interface GenerateSceneResult {
  operation: { name: string };
  sceneId: string;
  status: string;
}

/* -----------------------------------------------------
 * 🔁 Safe axios POST
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
          `⚠️ generateVideoFromStartImage retry ${i + 1}/${retries} after ${
            err.code
          }...`
        );
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("❌ generateVideoFromStartImage failed after max retries.");
}

/* -----------------------------------------------------
 * 🚀 Start Image → Video Generation
 * --------------------------------------------------- */
export async function generateVideoFromStartImage({
  prompt,
  startImageMediaId,
  token,
  quantity = 1,
  freeCredit = false, // ⭐ THÊM freeCredit
  recaptchaToken,
  aspectRatio = "VIDEO_ASPECT_RATIO_LANDSCAPE",
  seed = Math.floor(Math.random() * 10000),
  projectId = "fc7b59a3-685a-4801-97d0-4fd949c9ea4f",
}: GenerateStartImageVideoOptions): Promise<GenerateSceneResult[]> {
  const url =
    "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoStartImage";

  /* -----------------------------------------------------
   * 🎯 MODEL KEY — hỗ trợ freeCredit_relaxed
   * --------------------------------------------------- */
  const baseLandscape = "veo_3_1_i2v_s_fast_ultra";
  const basePortrait = "veo_3_1_i2v_s_fast_portrait_ultra";

  const selectedModelKey =
    aspectRatio === "VIDEO_ASPECT_RATIO_LANDSCAPE"
      ? baseLandscape + (freeCredit ? "_relaxed" : "")
      : basePortrait + (freeCredit ? "_relaxed" : "");

  /* -----------------------------------------------------
   * 🔁 Tạo nhiều request theo quantity
   * --------------------------------------------------- */
  const requests = Array.from({ length: quantity }).map(() => ({
    aspectRatio,
    seed: Math.floor(Math.random() * 10_000),
    textInput: { prompt },
    videoModelKey: selectedModelKey,
    startImage: { mediaId: startImageMediaId },
    metadata: { sceneId: crypto.randomUUID() },
  }));

  const requestBody = {
    clientContext: {
      projectId,
      recaptchaToken,
      tool: "PINHOLE",
      userPaygateTier: "PAYGATE_TIER_TWO",
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
        timeout: 120_000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
      3
    );

    const ops = res.data?.operations;
    if (!Array.isArray(ops) || ops.length === 0)
      throw new Error("❌ Không có operation nào trả về từ Labs API.");

    return ops.map((item: any) => ({
      operation: item.operation,
      sceneId: item.sceneId,
      status: item.status,
    }));
  } catch (err: any) {
    const message = err?.response?.data
      ? `❌ generateVideoFromStartImage error:\n${JSON.stringify(
          err.response.data,
          null,
          2
        )}`
      : `❌ generateVideoFromStartImage unknown error:\n${JSON.stringify(
          err,
          null,
          2
        )}`;

    throw new Error(message);
  }
}


