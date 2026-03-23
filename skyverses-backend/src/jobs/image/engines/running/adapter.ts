import { PollAdapter } from "../../polling/pollEngine";

/**
 * RunningHub IMAGE Poll Adapter
 * - POST JSON
 * - task/openapi/outputs
 * - Based on REAL RunningHub response
 */
export const RunningHubImagePollAdapter: PollAdapter = {
  /* =============================
     POLL ENDPOINT
  ============================== */
  pollEndpoint(taskId: string, context?: any) {
    const payload = {
      apiKey: context?.accessToken,
      taskId,
    };

    return {
      url: "https://www.runninghub.ai/task/openapi/outputs",
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",

        Origin: "null",
        Referer: "https://www.runninghub.ai/",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/143.0.0.0 Safari/537.36",
      },
    };
  },

  /* =============================
     STATUS CHECK
  ============================== */

  /**
   * DONE khi:
   * - code === 0
   * - data là array
   * - có ít nhất 1 output
   */
  isDone(data: any) {
    console.log('RunningHubImagePollAdapter>>>',data.data)
    return (
      data?.code === 0 &&
      Array.isArray(data?.data) &&
      data.data.length > 0
    );
  },

  /**
   * ERROR khi:
   * - code !== 0
   * - hoặc msg chứa FAILED / ERROR
   */
  isError(data: any) {
    return Boolean(data?.data?.failedReason);
  },

  /* =============================
     NORMALIZE RESULT
  ============================== */
  extractResult(data: any) {
    const outputs = Array.isArray(data?.data) ? data.data : [];

    const images = outputs
      .map((o: any) => o?.fileUrl)
      .filter(Boolean);

    return {
      images,
      thumbnails: images, // RunningHub không tách preview riêng
      raw: outputs,
    };
  },

  extractError(data: any) {
    return {
      code: data?.code,
      msg: data?.msg,
      raw: data,
    };
  },
};