import axios from "axios";
import { VideoJobType } from "../../../../models/VideoJobModelV2";

export async function runGommoRequest(job: any) {
  // 👉 stringify sớm để reuse khi catch
  let payloadString = "";

  try {
    const accessToken = process.env.GOMMO_API_KEY;
    if (!accessToken) throw new Error("GOMMO_MISSING_ACCESS_TOKEN");

    const body = new URLSearchParams();

    /* =========================
       REQUIRED
    ========================= */
    body.append("access_token", accessToken);
    body.append("domain", "aivideoauto.com");
    body.append("model", job.engine.model);

    body.append("mode", job.enginePayload.mode || "fast");

    if (!job.enginePayload?.prompt) {
      throw new Error("GOMMO_MISSING_PROMPT");
    }

    body.append("prompt", job.enginePayload.prompt);

    /* =========================
       OPTIONAL CONFIG
    ========================= */
    body.append("privacy", job.enginePayload.privacy || "PRIVATE");
    body.append("ratio", job.config?.aspectRatio || "16:9");
    body.append("resolution", job.config?.resolution || "720p");
    body.append("duration", String(job.config?.duration || 8));

    /* =========================
       🔥 REFERENCE IMAGES
    ========================= */
    const images: any[] = Array.isArray(job.input?.images)
      ? job.input.images
      : [];

    const validImages = images.filter(
      (url) => typeof url === "string" && url.trim().length > 0
    );

    if (validImages.length > 0) {
      if (job.type === VideoJobType.INGREDIENT) {
        validImages.forEach((url, index) => {
          body.append(`references[${index}][url]`, url);
        });
      } else if (job.type === VideoJobType.IMAGE_TO_ANIMATION) {
        body.append("video_url", job.input?.videos?.[0]);
        body.append("image_url", job.input?.images?.[0]);
        body.append("subType", "motion");
        body.append("ratio", "default");
      } else if (job.type === VideoJobType.SWAP_CHARACTER) {
        body.append("video_url", job.input?.videos?.[0]);
        body.append("image_url", job.input?.images?.[0]);
        body.append("subType", "replace");
        body.append("ratio", "default");
      } else {
        validImages.forEach((url, index) => {
          body.append(`images[${index}][url]`, url);
        });
      }
    }

    // ✅ lưu payload string để dùng khi error
    payloadString = body.toString();

    /* =========================
       REQUEST
    ========================= */
    const res = await axios.post(
      "https://api.gommo.net/ai/create-video",
      payloadString,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "https://aivideoauto.com",
          Referer: "https://aivideoauto.com/",
        },
        timeout: 60_000,
      }
    );

    const info = res.data?.videoInfo;
    if (!info?.id_base) {
      const err: any = new Error("GOMMO_CREATE_FAILED");
      err.raw = {
        response: res.data,
        payload: payloadString,
      };
      throw err;
    }

    return {
      taskId: info.id_base,
      accessToken,
      raw: res.data,
    };
  } catch (err: any) {
    // 🧠 attach payload + response nếu có
    err.raw = {
      payload: payloadString,
      response: err?.raw || err?.response?.data,
    };

    console.error(`❌ [GommoVideo] job=${job?._id} err=${err?.message}`);

    throw err;
  }
}
