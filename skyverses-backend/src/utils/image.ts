import axios, { AxiosResponse } from "axios";

/* API ENDPOINTS */
const FLOW_MEDIA_URL_1 =
  "https://aisandbox-pa.googleapis.com/v1/projects/2a7395e5-6231-4026-b601-729f69322648/flowMedia:batchGenerateImages";

const FLOW_MEDIA_URL_2 =
  "https://aisandbox-pa.googleapis.com/v1/projects/553b4282-92aa-43d7-93ac-440fd02cfa62/flowMedia:batchGenerateImages";

/* -----------------------------
   📌 TYPES
----------------------------- */
export interface FlowMediaRequest {
  accessToken: string;
  prompt: string;
  baseImageMediaId: string;
  seed?: number;
  aspect?: string;
  sessionId?: string;
}

export interface FlowMediaResponseItem {
  name: string;
  workflowId: string;
  image?: {
    generatedImage?: { encodedImage?: string };
  };
}

export interface FlowMediaBatchResponse {
  media: FlowMediaResponseItem[];
}

export interface GeneratedFlowImage {
  base64: string;
  mediaName: string;
  workflowId: string;
  mimeType: string;
}

/* =====================================================================
   🚀 FUNCTION 1 — generateFlowImage (có base image)
===================================================================== */
export async function generateFlowImage({
  accessToken,
  prompt,
  baseImageMediaId,
  seed = 343614,
  aspect = "IMAGE_ASPECT_RATIO_LANDSCAPE",
  sessionId = `${Date.now()}`,
}: FlowMediaRequest): Promise<GeneratedFlowImage> {
  if (!accessToken) throw new Error("Missing accessToken");
  if (!baseImageMediaId) throw new Error("Missing baseImageMediaId");

  const payload = {
    requests: [
      {
        clientContext: { sessionId: `;${sessionId}` },
        seed,
        imageModelName: "GEM_PIX",
        imageAspectRatio: aspect,
        prompt,
        imageInputs: [
          {
            name: baseImageMediaId,
            imageInputType: "IMAGE_INPUT_TYPE_BASE_IMAGE",
          },
        ],
      },
    ],
  };

  try {
    const res: AxiosResponse<FlowMediaBatchResponse> = await axios.post(
      FLOW_MEDIA_URL_1,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "text/plain;charset=UTF-8",
          Accept: "*/*",
          Origin: "https://labs.google",
          Referer: "https://labs.google/",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0",
        },
      }
    );

    const mediaItem = res.data?.media?.[0];
    if (!mediaItem) throw new Error("FlowMedia returned empty media[]");

    const encoded = mediaItem.image?.generatedImage?.encodedImage;
    if (!encoded) throw new Error("Missing encodedImage in response");

    return {
      base64: encoded,
      mediaName: mediaItem.name,
      workflowId: mediaItem.workflowId,
      mimeType: "image/png",
    };
  } catch (error: any) {
    console.error(
      "❌ generateFlowImage error:",
      error?.response?.data || error
    );
    throw error;
  }
}

/* =====================================================================
   🚀 FUNCTION 2 — generateFlowImageNoBase (NEW VERSION)
   → đúng 100% theo cURL bạn đưa
===================================================================== */
export async function generateFlowImageBananaPro(params: {
  accessToken: string;
  projectId: string;
  mode: string;
  prompts: string | string[];
  aspect?: string;
  seeds?: number[];
  sessionId?: string;
}): Promise<
  {
    imageUrl: string | null;
    mediaGenerationId: string | null;
  }[]
> {
  const {
    accessToken,
    projectId,
    prompts,
    mode = "GEM_PIX",
    aspect = "IMAGE_ASPECT_RATIO_LANDSCAPE",
    seeds,
    sessionId = `${Date.now()}`,
  } = params;

  if (!accessToken) throw new Error("Missing accessToken");
  if (!projectId) throw new Error("Missing projectId");

  const url = `https://aisandbox-pa.googleapis.com/v1/projects/${projectId}/flowMedia:batchGenerateImages`;

  const promptList = Array.isArray(prompts) ? prompts : [prompts];
  const count = promptList.length;

  const seedList =
    seeds && seeds.length === count
      ? seeds
      : Array.from({ length: count }).map(() =>
          Math.floor(Math.random() * 999999)
        );

  const requests = promptList.map((prompt, index) => ({
    clientContext: { sessionId: `;${sessionId}` },
    seed: seedList[index],
    imageModelName: mode,
    imageAspectRatio: aspect,
    prompt,
    imageInputs: [],
  }));

  try {
    const res: AxiosResponse<any> = await axios.post(
      url,
      { requests },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "text/plain;charset=UTF-8",
          Accept: "*/*",
          Origin: "https://labs.google",
          Referer: "https://labs.google/",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0",
        },
      }
    );
    console.log('res.data..>',res.data.media.length)
    if (!res.data.media || res.data.media.length === 0) {
      throw new Error("FlowMedia returned empty media[]");
    }
    return res.data.media.map((item: any) => {
      const generated = item.image?.generatedImage || {};

      const imageUrl = generated.fifeUrl || null;
      const mediaGenerationId = generated.mediaGenerationId || null;

      if (!imageUrl && !mediaGenerationId) {
        throw new Error("❌ flowMedia returned no output");
      }

      return {
        imageUrl,
        mediaGenerationId,
      };
    });
  } catch (error: any) {
    console.error(
      "❌ generateFlowImageBananaPro error:",
      error?.response?.data
    );

    //
    throw error;
  }
}

/* =====================================================================
   🚀 FUNCTION 3 — generateFlowImageWithReference  (clone từ cURL)
   → FlowMedia dùng reference image (IMAGE_INPUT_TYPE_REFERENCE)
===================================================================== */

export async function generateFlowImageWithReference(params: {
  accessToken: string;
  projectId: string;
  mode: string;
  prompts: string | string[];
  referenceMediaIds: string[]; // ⭐ ARRAY
  aspect?: string;
  seeds?: number[];
  sessionId?: string;
}) {
  const {
    accessToken,
    projectId,
    prompts,
    mode = "GEM_PIX",
    referenceMediaIds,
    aspect = "IMAGE_ASPECT_RATIO_LANDSCAPE",
    seeds,
    sessionId = `${Date.now()}`,
  } = params;

  if (!accessToken) throw new Error("Missing accessToken");
  if (!referenceMediaIds || referenceMediaIds.length === 0)
    throw new Error("Missing referenceMediaId[]");
  if (!projectId) throw new Error("Missing projectId");

  const url = `https://aisandbox-pa.googleapis.com/v1/projects/${projectId}/flowMedia:batchGenerateImages`;

  const promptList = Array.isArray(prompts) ? prompts : [prompts];
  const count = promptList.length;

  const seedList =
    seeds && seeds.length === count
      ? seeds
      : Array.from({ length: count }).map(() =>
          Math.floor(Math.random() * 900000)
        );

  /* -------------------------------------------
     Build ARRAY imageInputs from referenceMediaId[]
  -------------------------------------------- */
  const imageInputs = referenceMediaIds.map((mediaId) => ({
    name: mediaId,
    imageInputType: "IMAGE_INPUT_TYPE_REFERENCE",
  }));

  /* -------------------------------------------
     Build requests
  -------------------------------------------- */
  const requests = promptList.map((prompt, index) => ({
    clientContext: { sessionId: `;${sessionId}` },
    seed: seedList[index],
    imageModelName: mode,
    imageAspectRatio: aspect,
    prompt,
    imageInputs, // ⭐ đa reference
  }));

  try {
    const res = await axios.post(
      url,
      { requests },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "text/plain;charset=UTF-8",
          Accept: "*/*",
          Origin: "https://labs.google",
          Referer: "https://labs.google/",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0",
        },
      }
    );

    if (!res.data.media?.length) {
      throw new Error("FlowMedia returned empty media[]");
    }

    return res.data.media.map((item: any) => {
      const gen = item.image?.generatedImage || {};

      return {
        imageUrl: gen.fifeUrl || null,
        mediaGenerationId: gen.mediaGenerationId || null,
      };
    });
  } catch (err: any) {
    throw err;
  }
}
