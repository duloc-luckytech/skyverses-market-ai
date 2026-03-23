// services/ai/gommo/requestGommoCreateVideo.ts
import axios from "axios";

/* ======================================================
   TYPES
====================================================== */

export interface GommoCreateVideoParams {
  accessToken: string;

  prompt: string;
  model: string; // vd: veo_3_1
  privacy?: "PRIVATE" | "PUBLIC";

  translateToEn?: boolean;
  projectId?: string;

  ratio?: string; // vd: 16:9
  resolution?: string; // vd: 720p
  duration?: number; // giây
  mode?: string; // fast | relaxed

  images?: string[];
}

export interface GommoCreateVideoResult {
  idBase: string;
  taskId: string;
  status: string;
  creditFee?: number;
  raw: any;
}

/* ======================================================
   🟢 CREATE VIDEO (GOMMO)
   - POST
   - x-www-form-urlencoded
   - Browser-like headers
====================================================== */
export async function requestGommoVideo(
  params: GommoCreateVideoParams
): Promise<GommoCreateVideoResult> {
  const {
    accessToken,
    prompt,
    model = "veo_3_1",
    privacy = "PRIVATE",

    translateToEn = true,
    projectId = "default",

    ratio = "16:9",
    resolution = "720p",
    duration = 8,
    mode = "relaxed",

    images = [],
  } = params;

  /* ================= BUILD BODY ================= */
  const body = new URLSearchParams();

  body.append("access_token", accessToken);
  body.append("domain", "aivideoauto.com");

  body.append("model", model);
  body.append("privacy", privacy);
  body.append("prompt", prompt);
  body.append("translate_to_en", String(translateToEn));
  body.append("project_id", projectId);

  body.append("ratio", ratio);
  body.append("resolution", resolution);
  body.append("duration", String(duration));
  body.append("mode", mode);

  if (Array.isArray(images)) {
    images.forEach((url, idx) => {
      if (!url) return;
      body.append(`images[${idx}][url]`, url);
    });
  }
  /* ================= REQUEST ================= */
  const res = await axios.post(
    "https://api.gommo.net/ai/create-video",
    body.toString(),
    {
      timeout: 120_000,
      headers: {
        // core
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",

        // browser-like (QUAN TRỌNG)
        Origin: "https://aivideoauto.com",
        Referer: "https://aivideoauto.com/",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",

        // UA
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/143.0.0.0 Safari/537.36",

        // sec headers
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
      },
    }
  );

  const data = res.data;
  console.log("🟢 Gommo create-video >>", data);

  const info = data?.videoInfo;
  if (!info?.id_base) {
    throw new Error("GOMMO create-video failed: no id_base");
  }

  return {
    idBase: info.id_base,
    taskId: info.id_base,
    status: info.status,
    creditFee: info.credit_fee,

    raw: data,
  };
}
