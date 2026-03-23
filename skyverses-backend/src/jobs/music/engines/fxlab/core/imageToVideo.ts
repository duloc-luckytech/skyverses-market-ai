// services/fxlab/generateVideoFromStartImageSimple.ts
import axios from "axios";
import crypto from "crypto";

interface GenerateStartImageSceneOptions {
  prompt: string;
  startImageMediaId: string;

  quantity?: number;
  freeCredit?: boolean;

  aspectRatio?: "VIDEO_ASPECT_RATIO_LANDSCAPE" | "VIDEO_ASPECT_RATIO_PORTRAIT";
  token: string;
  recaptchaToken: string;
}

export async function imageToVideo({
  prompt,
  startImageMediaId,
  token,
  recaptchaToken,

  quantity = 1,
  freeCredit = false,
  aspectRatio = "VIDEO_ASPECT_RATIO_LANDSCAPE",
}: GenerateStartImageSceneOptions) {
  const url =
    "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoStartImage";

  /* =========================
     MODEL SELECTION
  ========================== */
  const baseLandscape = "veo_3_1_i2v_s_fast_ultra";
  const basePortrait = "veo_3_1_i2v_s_fast_portrait_ultra";

  const selectedModelKey =
    aspectRatio === "VIDEO_ASPECT_RATIO_LANDSCAPE"
      ? baseLandscape + (freeCredit ? "_relaxed" : "")
      : basePortrait + (freeCredit ? "_relaxed" : "");

  const PROJECT_ID = "fc7b59a3-685a-4801-97d0-4fd949c9ea4f";

  /* =========================
     BUILD REQUESTS
  ========================== */
  const requests = Array.from({ length: quantity }).map(() => ({
    aspectRatio,
    seed: Math.floor(Math.random() * 10000),
    textInput: { prompt },
    videoModelKey: selectedModelKey,
    startImage: {
      mediaId: startImageMediaId,
    },
    metadata: {
      sceneId: crypto.randomUUID(),
    },
  }));

  const requestBody = {
    clientContext: {
      projectId: PROJECT_ID,
      recaptchaToken,
      tool: "PINHOLE",
      userPaygateTier: "PAYGATE_TIER_TWO",
    },
    requests,
  };

  const headers = {
    accept: "*/*",
    authorization: `Bearer ${token}`,
    "content-type": "text/plain;charset=UTF-8",
    origin: "https://labs.google",
    referer: "https://labs.google/",
    "cache-control": "no-cache",
    pragma: "no-cache",
    priority: "u=1, i",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  };

  try {
    const response = await axios.post(url, JSON.stringify(requestBody), {
      headers,
      timeout: 180_000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      transformRequest: [(data) => data],
    });

    const ops = response.data?.operations;
    if (!Array.isArray(ops) || ops.length === 0) {
      throw new Error("❌ No operations returned from Labs StartImage API.");
    }

    return {
      taskId: ops[0].operation?.name,
      accessToken: token,
      raw: response.data,
    };
  } catch (err: any) {
    const fullMessage = err?.response?.data
      ? `❌ generateVideoFromStartImageSimple error:\n${JSON.stringify(
          err.response.data,
          null,
          2
        )}`
      : `❌ generateVideoFromStartImageSimple unknown error:\n${JSON.stringify(
          err,
          null,
          2
        )}`;

    throw new Error(fullMessage);
  }
}