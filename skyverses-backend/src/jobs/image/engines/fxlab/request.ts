import axios from "axios";
import { getAccessTokenForJob } from "../../../../utils/getAccessTokenForJob";

/**
 * Create IMAGE job via Google Labs (AISandbox)
 * - text_to_image
 * - image_to_image (reference)
 */

export async function runFxlabRequest(job: any) {
  const accessToken = await getAccessTokenForJob();
  if (!accessToken) {
    throw new Error("LABS_MISSING_ACCESS_TOKEN");
  }

  const recaptchaToken = null;
  const sessionId = null;

  if (!recaptchaToken) {
    throw new Error("LABS_MISSING_RECAPTCHA_TOKEN");
  }

  const projectId =
    job.enginePayload?.projectId || "22e30795-e8ad-4330-96be-a8d48b65b9c1";

  if (!job.enginePayload?.prompt) {
    throw new Error("LABS_IMAGE_MISSING_PROMPT");
  }

  /* =====================================================
     BUILD REQUESTS
  ====================================================== */
  const requests: any[] = [];

  // =========================
  // TEXT → IMAGE
  // =========================
  if (job.type === "text_to_image") {
    requests.push({
      clientContext: {
        recaptchaContext: {
          token: recaptchaToken,
          applicationType: "RECAPTCHA_APPLICATION_TYPE_WEB",
        },
        sessionId,
        projectId,
        tool: "PINHOLE",
      },

      seed: job.enginePayload?.seed ?? Math.floor(Math.random() * 1_000_000),

      imageModelName: job.enginePayload?.imageModelName || "GEM_PIX_2",

      imageAspectRatio:
        job.enginePayload?.imageAspectRatio || "IMAGE_ASPECT_RATIO_LANDSCAPE",

      prompt: job.enginePayload.prompt,

      imageInputs: [], // ❌ text only
    });
  }

  // =========================
  // IMAGE → IMAGE (REFERENCE)
  // =========================
  if (job.type === "image_to_image") {
    // Normalize: support both input.images (array) and input.image (singular)
    const refImages = Array.isArray(job.input?.images) && job.input.images.length > 0
      ? job.input.images
      : (job.input?.image ? [job.input.image] : []);

    if (!refImages.length) {
      throw new Error("LABS_IMAGE_MISSING_REFERENCE_IMAGE");
    }

    requests.push({
      clientContext: {
        recaptchaContext: {
          token: recaptchaToken,
          applicationType: "RECAPTCHA_APPLICATION_TYPE_WEB",
        },
        sessionId,
        projectId,
        tool: "PINHOLE",
      },

      seed: job.enginePayload?.seed ?? Math.floor(Math.random() * 1_000_000),

      imageModelName: job.enginePayload?.imageModelName || "GEM_PIX_2",

      imageAspectRatio:
        job.enginePayload?.imageAspectRatio || "IMAGE_ASPECT_RATIO_LANDSCAPE",

      prompt: job.enginePayload.prompt,

      // 🔥 REFERENCE IMAGE
      imageInputs: refImages.map((mediaId: string) => ({
        name: mediaId,
        imageInputType: "IMAGE_INPUT_TYPE_REFERENCE",
      })),
    });
  }

  if (!requests.length) {
    throw new Error("LABS_IMAGE_UNSUPPORTED_TYPE");
  }

  /* =====================================================
     FINAL BODY
  ====================================================== */
  const body = {
    clientContext: {
      recaptchaContext: {
        token: recaptchaToken,
        applicationType: "RECAPTCHA_APPLICATION_TYPE_WEB",
      },
      sessionId,
      projectId,
      tool: "PINHOLE",
    },
    requests,
  };

  /* =====================================================
     REQUEST
  ====================================================== */
  const res = await axios.post(
    `https://aisandbox-pa.googleapis.com/v1/projects/${projectId}/flowMedia:batchGenerateImages`,
    JSON.stringify(body),
    {
      timeout: 60_000,
      headers: {
        Accept: "*/*",
        "Content-Type": "text/plain;charset=UTF-8",
        Authorization: `Bearer ${accessToken}`,
        Origin: "https://labs.google",
        Referer: "https://labs.google/",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/144.0.0.0 Safari/537.36",
      },
    }
  );

  const data = res.data?.media?.[0]?.image?.generatedImage;

  if (!data) {
    const err: any = new Error("LABS_IMAGE_CREATE_FAILED");
    err.raw = res.data;
    throw err;
  }

  return {
    images: data.fifeUrl ? [data.fifeUrl] : [],
    thumbnail: data.fifeUrl,
    imageId: data.mediaGenerationId,
    raw: data,
  };
}
