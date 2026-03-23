import { PollAdapter } from "../../polling/pollEngine";

/**
 * Gommo Poll Adapter (POST form-urlencoded)
 * Based EXACTLY on real browser request
 */
export const GommoPollAdapter: PollAdapter = {
  pollEndpoint(jobId: string, context?: any) {
    const body = new URLSearchParams({
      access_token: context?.accessToken,
      domain: "aivideoauto.com",
      videoId: jobId,
    }).toString();

    return {
      url: "https://api.gommo.net/ai/video",
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",

        // browser-like (IMPORTANT)
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

  isDone(data: any) {
    return data?.videoInfo?.status === "MEDIA_GENERATION_STATUS_SUCCESSFUL";
  },

  isError(data: any) {
    return data?.videoInfo?.status === "MEDIA_GENERATION_STATUS_FAILED";
  },

  extractResult(data: any) {
    return {
      videoUrl: data?.videoInfo?.download_url,
      thumbnailUrl: data?.videoInfo?.thumbnail_url,
    };
  },

  extractError(data: any) {
    return data?.videoInfo || data;
  },
};
