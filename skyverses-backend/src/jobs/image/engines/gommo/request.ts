import axios from "axios";

/**
 * Create IMAGE job via GOMMO
 * - Text → Image
 * - Image reference → Image (subjects)
 * - Edit image → Image (base64)
 * - NO POLL (create only)
 */
export async function runGommoImageRequest(job: any) {
  let payloadString = "";

  try {
    const accessToken = process.env.GOMMO_API_KEY;
    if (!accessToken) throw new Error("GOMMO_MISSING_ACCESS_TOKEN");

    if (!job.enginePayload?.prompt) {
      throw new Error("GOMMO_IMAGE_MISSING_PROMPT");
    }

    /* =============================
       BUILD FORM BODY
    ============================== */
    const body = new URLSearchParams();

    body.append("access_token", accessToken);
    body.append("domain", "aivideoauto.com");
    body.append("action_type", "create");

    body.append("model", job.engine.model); // google_image_gen_4_5
    body.append("prompt", `${job.enginePayload.prompt}`);
    body.append("privacy", job.enginePayload.privacy || "PRIVATE");

    if (job.enginePayload?.category) {
      body.append("category", job.enginePayload.category);
    }

    body.append("mode", job.enginePayload?.mode || "cheap");
    body.append("resolution", job.enginePayload?.resolution || "1k");

    body.append("sync", "false");
    body.append("project_id", job.enginePayload.projectId || "default");

    body.append(
      "ratio",
      (job.config?.aspectRatio || "1:1").replace(":", "_")
    );

    /* =============================
       🖼️ EDIT IMAGE (BASE64)
    ============================== */
    if (job.enginePayload.editImage === true) {
      if (!job.enginePayload.base64Image) {
        throw new Error("GOMMO_IMAGE_MISSING_BASE64");
      }

      body.append("editImage", "true");
      body.append("base64Image", job.enginePayload.base64Image);
    }
    /* =============================
       🔗 IMAGE REFERENCES (subjects)
    ============================== */
    else if (Array.isArray(job.input?.images)) {
      job.input.images.forEach((url: string, idx: number) => {
        if (!url) return;
        body.append(`subjects[${idx}][url]`, url);
      });
    }

    // 👉 lưu payload để dùng khi error
    payloadString = body.toString();

    /* =============================
       REQUEST (BROWSER-LIKE)
    ============================== */
    const res = await axios.post(
      "https://api.gommo.net/ai/generateImage",
      payloadString,
      {
        timeout: 60_000,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "*/*",

          Origin: "https://aivideoauto.com",
          Referer: "https://aivideoauto.com/",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",

          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/143.0.0.0 Safari/537.36",

          "Sec-Fetch-Site": "cross-site",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
        },
      }
    );

    const data = res.data;
    const info = data?.imageInfo;

    if (!info?.id_base) {
      const err: any = new Error("GOMMO_IMAGE_CREATE_FAILED");
      err.raw = {
        payload: payloadString,
        response: data,
      };
      throw err;
    }

    /* =============================
       RETURN TASK INFO ONLY
    ============================== */
    return {
      taskId: info.id_base,
      accessToken,
      raw: data,
    };

  } catch (err: any) {
    // 🧠 gắn payload + response để debug
    err.raw = {
      payload: payloadString,
      response: err?.raw || err?.response?.data,
    };

    console.error(`❌ [GommoImage] job=${job?._id} err=${err?.message}`);

    throw err;
  }
}