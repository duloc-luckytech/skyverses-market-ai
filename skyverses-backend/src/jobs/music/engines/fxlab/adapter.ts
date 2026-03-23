// jobs/video/engines/fxlab/adapter.ts
import { PollAdapter } from "../../polling/pollEngine";

export const FxlabPollAdapter: PollAdapter = {
  pollEndpoint(jobId: string, context?: any) {
    const token = context?.accessToken;

    if (!token) {
      throw new Error("FXLAB_POLL_MISSING_ACCESS_TOKEN");
    }

    return {
      url: "https://aisandbox-pa.googleapis.com/v1/video:batchCheckAsyncVideoGenerationStatus",
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain;charset=UTF-8",
        Origin: "https://labs.google",
        Referer: "https://labs.google/",
      },
      body: {
        operations: [
          {
            operation: { name: jobId },
          },
        ],
      },
    };
  },

  /* =========================
     DONE = có ít nhất 1 SUCCESS
  ========================== */
  isDone(data: any) {
    const ops = data?.operations || [];
    return ops.some(
      (op: any) => op.status === "MEDIA_GENERATION_STATUS_SUCCESSFUL"
    );
  },

  /* =========================
     ERROR = ALL FAILED
  ========================== */
  isError(data: any) {
    const ops = data?.operations || [];
    if (!ops.length) return false;

    return ops.every(
      (op: any) => op.status === "MEDIA_GENERATION_STATUS_FAILED"
    );
  },

  /* =========================
     RESULT
  ========================== */
  extractResult(data: any) {
    const ops = data?.operations || [];
    const getData = ops.map((op: any) => {
      const video = op.operation?.metadata?.video || op.result?.video || {};
      return {
        videoUrl: video.fifeUrl,
        raw: op.operation?.metadata?.video,
      };
    });

    return getData[0];
  },

  /* =========================
     ERROR DETAIL
  ========================== */
  extractError(data: any) {
    const ops = data?.operations || [];

    return ops
      .filter((op: any) => op.status === "MEDIA_GENERATION_STATUS_FAILED")
      .map((op: any) => ({
        sceneId: op.sceneId,
        reason:
          op.operation?.error?.message ||
          op.operation?.error?.code ||
          "UNKNOWN_ERROR",
      }));
  },
};
