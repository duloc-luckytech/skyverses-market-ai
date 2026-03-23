import { PollAdapter } from "../../polling/pollEngine";

/**
 * VEO Poll Adapter
 * Google Labs async operation
 */
export const VeoPollAdapter: PollAdapter = {
  pollEndpoint(jobId: string) {
    return {
      url: `https://labs.google.com/video:batchCheckAsyncVideoGenerationStatus?name=${jobId}`,
      method: "GET",
    };
  },

  isDone(data: any) {
    return data?.done === true;
  },

  isError(data: any) {
    return Boolean(data?.error);
  },

  extractResult(data: any) {
    return data.response;
  },

  extractError(data: any) {
    return data.error;
  },
};