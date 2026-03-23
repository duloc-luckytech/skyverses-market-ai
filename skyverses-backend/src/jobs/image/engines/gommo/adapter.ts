import { PollAdapter } from "../../polling/pollEngine";

/**
 * Gommo IMAGE Poll Adapter
 * - POST form-urlencoded
 * - Based on REAL poll response
 */
export const GommoImagePollAdapter: PollAdapter = {
  pollEndpoint(jobId: string, context?: any) {
    const body = new URLSearchParams({
      access_token: context?.accessToken,
      domain: "aivideoauto.com",
      id_base: jobId,
    }).toString();

    return {
      url: "https://api.gommo.net/ai/image",
      method: "POST",
      body,
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
    };
  },

  /* =============================
     STATUS
  ============================== */
  isDone(data: any) {
    return data?.imageInfo?.status === "SUCCESS";
  },

  isError(data: any) {
    return data?.imageInfo?.status === "ERROR";
  },

  /* =============================
     NORMALIZE RESULT
  ============================== */
  extractResult(data: any) {
    const info = data?.imageInfo;
    return {
      images: info?.url ? [info.url] : [],
      thumbnail: info?.url_preview || info?.url,
      imageId:info.image_id,
      raw: info,
    };
  },

  extractError(data: any) {
    return data?.imageInfo || data;
  },
};