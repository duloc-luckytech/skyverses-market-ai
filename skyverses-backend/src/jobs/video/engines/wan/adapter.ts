import { PollAdapter } from "../../polling/pollEngine";

/**
 * WAN Poll Adapter
 * Tuân thủ PollAdapter contract
 */
export const WanPollAdapter: PollAdapter = {
  /**
   * Return HTTP polling config
   */
  pollEndpoint(jobId: string, context?: any) {
    const apiKey = context?.accessToken;

    if (!apiKey) {
      throw new Error("WAN_POLL_MISSING_API_KEY");
    }

    return {
      url: `https://dashscope-intl.aliyuncs.com/api/v1/tasks/${jobId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };
  },

  /**
   * DONE khi WAN trả SUCCEEDED
   */
  isDone(data: any) {
    console.log('data>>',data)
    return data?.output?.task_status === "SUCCEEDED";
  },

  /**
   * ERROR khi FAILED hoặc CANCELED
   */
  isError(data: any) {
    const status = data?.output?.task_status;
    return status === "FAILED" || status === "CANCELED";
  },

  /**
   * Lấy kết quả video
   */
  extractResult(data: any) {
    return {
      videoUrl: data?.output?.video_url || data?.output?.results?.video_url,
      raw: data,
    };
  },

  /**
   * Lấy lỗi
   */
  extractError(data: any) {
    return data?.error || data?.output;
  },
};