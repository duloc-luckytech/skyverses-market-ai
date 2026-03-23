import { PollAdapter } from "../../polling/pollEngine";

/**
 * Fxlab Poll Adapter
 * Fxlab async task status
 */
export const FxlabPollAdapter: PollAdapter = {
  pollEndpoint(jobId: string) {
    return {
      url: `https://api.Fxlab.net/ai/video/status/${jobId}`,
      method: "GET",
    };
  },

  isDone(data: any) {
    return data?.status === "done";
  },

  isError(data: any) {
    return data?.status === "error";
  },

  extractResult(data: any) {
    return data.result;
  },

  extractError(data: any) {
    return data.error;
  },
};