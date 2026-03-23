import axios from "axios";

const MAX_POLL_TIME = 10 * 60 * 1000; // 10 minutes

/* =====================================================
   POLL ADAPTER INTERFACE
===================================================== */
export interface PollAdapter {
  pollEndpoint(
    jobId: string,
    context?: any
  ): {
    url: string;
    method?: "GET" | "POST";
    body?: any;
    headers?: Record<string, string>;
  };

  isDone(data: any): boolean;
  isError(data: any): boolean;

  extractResult(data: any): any;
  extractError?(data: any): any;
}

/* =====================================================
   SINGLE POLL ENGINE (NO LOOP)
===================================================== */
export async function pollEngineJob(
  params: {
    jobId: string;
    pollStartedAt: Date;
  },
  adapter: PollAdapter,
  baseHeaders: Record<string, string> = {},
  context?: any
) {
  const { jobId, pollStartedAt } = params;
  const now = Date.now();



  /* ⛔ TIMEOUT CHECK */
  if (now - pollStartedAt.getTime() >= MAX_POLL_TIME) {
    console.error(`🔴 [POLL][TIMEOUT] jobId=${jobId}`);
    const err: any = new Error("ENGINE_TIMEOUT");
    err.code = "ENGINE_TIMEOUT";
    err.meta = { jobId };
    throw err;
  }

  /* 🔍 BUILD REQUEST FROM ADAPTER */
  const req = adapter.pollEndpoint(jobId, context);

  let data: any;

  try {
    const res = await axios({
      url: req.url,
      method: req.method || "GET",
      data: req.body,
      headers: {
        ...baseHeaders,
        ...req.headers,
      },
      timeout: 30_000,
    });

    data = res.data;

  } catch (error: any) {
    console.error(`🔴 [POLL][REQUEST_FAILED]`, {
      jobId,
      message: error.message,
      response: error.response?.data,
    });
    throw error;
  }

  /* ❌ ENGINE ERROR */
  if (adapter.isError(data)) {
    console.error(
      `🔴 [POLL][ENGINE_ERROR]`,
      adapter.extractError?.(data) ?? data
    );

    const err: any = new Error("ENGINE_ERROR");
    err.code = "ENGINE_ERROR";
    err.raw = adapter.extractError?.(data) ?? data;
    throw err;
  }

  /* ✅ DONE */
  if (adapter.isDone(data)) {
    console.log(`🟢 [POLL][DONE] jobId=${jobId}`);
    return {
      done: true,
      result: adapter.extractResult(data),
    };
  }

  /* ⏳ NOT READY */
  return {
    done: false,
  };
}
