import axios from "axios";
import crypto from "crypto";

interface GenerateSceneOptions {
  prompt: string;
  mediaIds: string[];
  quantity: number;
  freeCredit: boolean;
  aspectRatio?: "VIDEO_ASPECT_RATIO_LANDSCAPE" | "VIDEO_ASPECT_RATIO_PORTRAIT";
  modelKey?: string;
  seed?: number;
  token: string;
  recaptchaToken:string;
  sceneId?: string; // optional custom sceneId
}

interface GenerateSceneResult {
  operation: { name: string };
  sceneId: string;
  status: string;
}

export async function request({
  prompt,
  mediaIds,
  token,
  recaptchaToken,
  quantity = 1,
  aspectRatio,
  freeCredit = false, // ⭐ thêm lựa chọn relaxed
}: GenerateSceneOptions): Promise<GenerateSceneResult[]> {
  const url =
    "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoReferenceImages";

  // ⭐ chọn model theo relaxed mode
  const baseModelKey = "veo_3_0_r2v_fast_ultra";
  const selectedModelKey = freeCredit
    ? baseModelKey + "_relaxed"
    : baseModelKey;

  const PROJECT_ID = "a7ae66df-c025-433d-8109-6f3902692be5";

  const requests = Array.from({ length: quantity }).map(() => ({
    aspectRatio,
    seed: Math.floor(Math.random() * 10000),
    textInput: {
      prompt,
    },
    videoModelKey: selectedModelKey, // ⭐ dùng model đã chọn
    metadata: {
      sceneId: crypto.randomUUID(),
    },
    referenceImages: mediaIds.map((mediaId) => ({
      imageUsageType: "IMAGE_USAGE_TYPE_ASSET",
      mediaId,
    })),
  }));

  const requestBody = {
    clientContext: {
      recaptchaToken,
      projectId: PROJECT_ID,
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
    const response = await axios.post(url, JSON.stringify(requestBody), {
      headers,
      timeout: 180_000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      transformRequest: [(data) => data],
    });

    const ops = response.data?.operations;
    if (!Array.isArray(ops) || ops.length === 0) {
      throw new Error("❌ Không có operation nào trả về từ Labs API.");
    }

    return ops.map((item: any) => ({
      operation: item.operation,
      sceneId: item.sceneId,
      status: item.status,
    }));
  } catch (err: any) {
    const fullMessage = err?.response?.data
      ? `❌ generateVideoSceneFromImages error:\n${JSON.stringify(
          err.response.data,
          null,
          2
        )}`
      : `❌ generateVideoSceneFromImages unknown error:\n${JSON.stringify(
          err,
          null,
          2
        )}`;

    throw new Error(fullMessage);
  }
}
