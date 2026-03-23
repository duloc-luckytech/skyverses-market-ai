import axios from "axios";
import crypto from "crypto";

interface GenerateStartEndImageSceneOptions {
  prompt: string;
  startImageMediaId: string;
  endImageMediaId: string;

  quantity?: number;
  freeCredit?: boolean;

  aspectRatio?: "VIDEO_ASPECT_RATIO_LANDSCAPE" | "VIDEO_ASPECT_RATIO_PORTRAIT";
  token: string;
  recaptchaToken: string;
  mode?: string;
}

export async function startEndToVideo({
  prompt,
  startImageMediaId,
  endImageMediaId,
  token,
  recaptchaToken,

  quantity = 1,
  freeCredit = false,
  aspectRatio = "VIDEO_ASPECT_RATIO_LANDSCAPE",
  mode
}: GenerateStartEndImageSceneOptions) {
  const url =
    "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoStartAndEndImage";

  /* =========================
     MODEL SELECTION
  ========================== */
  let modelKey =
    aspectRatio === "VIDEO_ASPECT_RATIO_LANDSCAPE"
      ? "veo_3_1_i2v_s_fast_ultra_fl"
      : "veo_3_1_i2v_s_fast_portrait_ultra_fl";

  if (mode=='relaxed') {
    modelKey =
      aspectRatio === "VIDEO_ASPECT_RATIO_LANDSCAPE"
        ? "veo_3_1_i2v_s_fast_fl_ultra_relaxed"
        : "veo_3_1_i2v_s_fast_portrait_fl_ultra_relaxed";
  }

  const PROJECT_ID = "89056161-9491-4674-8b8e-c47424603dae";

  /* =========================
     BUILD REQUESTS
  ========================== */
  const requests = Array.from({ length: quantity }).map(() => ({
    aspectRatio,
    seed: Math.floor(Math.random() * 10000),
    textInput: { prompt },
    videoModelKey: modelKey,
    startImage: { mediaId: startImageMediaId },
    endImage: { mediaId: endImageMediaId },
    metadata: {
      sceneId: crypto.randomUUID(),
    },
  }));

  const requestBody = {
    clientContext: {
      projectId: PROJECT_ID,
      recaptchaContext: {
        token: recaptchaToken,
        applicationType: "RECAPTCHA_APPLICATION_TYPE_WEB",
      },
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
      throw new Error("❌ No operations returned from Labs Start-End Image API.");
    }

    return {
      taskId: ops[0].operation?.name,
      accessToken: token,
      raw: response.data,
    };
  } catch (err: any) {
    const fullMessage = err?.response?.data
      ? `❌ generateVideoFromStartEndImageSimple error:\n${JSON.stringify(
          err.response.data,
          null,
          2
        )}`
      : `❌ generateVideoFromStartEndImageSimple unknown error:\n${JSON.stringify(
          err,
          null,
          2
        )}`;

    console.error(
      "generateVideoFromStartEndImageSimple error",
      err?.response?.data
    );
    throw new Error(fullMessage);
  }
}