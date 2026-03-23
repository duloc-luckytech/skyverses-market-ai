import { PollAdapter } from "../../polling/pollEngine";

/**
 * Gommo MUSIC Poll Adapter
 * Match EXACT curl:
 * POST /api/apps/go-mmo/ai_musics/getInfo
 */
export const GommoMusicPollAdapter: PollAdapter = {
  pollEndpoint(jobId: string, context?: any) {
    if (!context?.accessToken) {
      throw new Error("GOMMO_MUSIC_POLL_MISSING_ACCESS_TOKEN");
    }

    const body = new URLSearchParams({
      access_token: context.accessToken,
      domain: "aivideoauto.com",
      id_base: jobId,
      project_id: context.projectId || "5a1f50fe10ddbb5d",
    }).toString();

    return {
      url: "https://api.gommo.net/api/apps/go-mmo/ai_musics/getInfo",
      method: "POST",
      body,
      headers: {
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded",

        // Browser-like headers (IMPORTANT)
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
    };
  },

  /* =====================================================
     STATUS CHECK
  ====================================================== */

  // DONE khi đã có audio_url
  isDone(data: any) {
    return Boolean(data?.musicInfo?.status=='success');
  },

  // ERROR khi deleted hoặc message lỗi
  isError(data: any) {
    const info = data?.musicInfo;
    return (
      info?.is_deleted === "1" ||
      info?.status === "error"
    );
  },

  /* =====================================================
     RESULT / ERROR EXTRACTION
  ====================================================== */

  extractResult(data: any) {
    const info = data?.musicInfo;

    return {
      type: "audio",
      audioUrl: info?.audio_url,
      coverUrl: info?.cover_url,
      duration: info?.duration || 0,
      provider: "gommo-music",
      raw: info,
    };
  },

  extractError(data: any) {
    return data?.musicInfo || data;
  },
};