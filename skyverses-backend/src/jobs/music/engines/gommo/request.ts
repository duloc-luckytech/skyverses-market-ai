import axios from "axios";

export async function runGommoMusicRequest(job: any) {
  const accessToken = process.env.GOMMO_API_KEY;
  if (!accessToken) throw new Error("GOMMO_MISSING_ACCESS_TOKEN");

  const body = new URLSearchParams();

  /* =========================
     REQUIRED (MATCH CURL)
  ========================= */
  body.append("access_token", accessToken);
  body.append("domain", "aivideoauto.com");
  body.append(
    "name",
    job.enginePayload?.title ||
      job.enginePayload?.name ||
      "AI Music"
  );
  body.append("model", job.engine.model);
  body.append("prompt", job.enginePayload.prompt);

  /* =========================
     OPTIONAL (MATCH CURL)
  ========================= */
  if (job.enginePayload?.styles || job.enginePayload?.tags) {
    body.append(
      "styles",
      job.enginePayload.styles || job.enginePayload.tags
    );
  }

  body.append(
    "project_id",
    job.enginePayload?.projectId || "5a1f50fe10ddbb5d"
  );

  /* =========================
     REQUEST
  ========================= */
  const res = await axios.post(
    "https://api.gommo.net/api/apps/go-mmo/ai_musics/create",
    body.toString(),
    {
      headers: {
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded",

        // browser-like headers (giữ giống curl)
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
      timeout: 60_000,
    }
  );

  /* =========================
     RESPONSE PARSE (MATCH API)
  ========================= */
  const item = res.data?.data?.[0];

  if (!item?.id_base) {
    throw {
      code: "GOMMO_MUSIC_CREATE_FAILED",
      raw: res.data,
    };
  }

  return {
    taskId: item.id_base,   // ⭐ id_base
    accessToken,
    raw: res.data,
  };
}