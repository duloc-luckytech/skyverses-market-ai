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
    err.raw = {
      jobId,
      pollStartedAt,
      now,
      maxPollTime: MAX_POLL_TIME,
    };
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

    const err: any = new Error("ENGINE_POLL_REQUEST_FAILED");
    err.code = "ENGINE_POLL_REQUEST_FAILED";
    err.raw = error.response?.data || {
      message: error.message,
      stack: error.stack,
    };
    err.meta = { jobId };

    throw err;
  }

  /* =====================================================
     🚫 SPECIAL CASE: AUDIO FILTERED
  ===================================================== */
  const audioFiltered =
    data?.status === "PUBLIC_ERROR_AUDIO_FILTERED" ||
    data?.error?.code === "PUBLIC_ERROR_AUDIO_FILTERED" ||
    data?.videoInfo?.status === "PUBLIC_ERROR_AUDIO_FILTERED" ||
    data?.output?.status === "PUBLIC_ERROR_AUDIO_FILTERED";

  if (audioFiltered) {
    console.error(`🔴 [POLL][AUDIO_FILTERED]`, { jobId });

    const err: any = new Error(
      "Video không có âm thanh, vui lòng tạo lại #vvf42"
    );
    err.code = "PUBLIC_ERROR_AUDIO_FILTERED";
    err.userMessage = "Video không có âm thanh, vui lòng tạo lại #vvf42";
    err.raw = data;
    err.meta = { jobId };

    throw err;
  }

  /* =====================================================
     🚫 GENERIC ENGINE ERROR (STATUS = ERROR)
  ===================================================== */
  const genericError =
    data?.status === "ERROR" ||
    data?.videoInfo?.status === "ERROR" ||
    data?.output?.task_status === "ERROR";

  if (genericError) {
    console.error(`🔴 [POLL][GENERIC_ERROR]`, {
      jobId,
      raw: data,
    });

    const err: any = new Error(
      "Video vi phạm chính sách hoặc hình ảnh đầu vào bị lỗi"
    );
    err.code = "ENGINE_GENERIC_ERROR";
    err.userMessage =
      "Video vi phạm chính sách hoặc hình ảnh đầu vào bị lỗi";
    err.raw = data;
    err.meta = { jobId };

    throw err;
  }

  /* ❌ ENGINE ERROR (ADAPTER-DEFINED) */
  if (adapter.isError(data)) {
    const rawError = adapter.extractError?.(data) ?? data;

    console.error(`🔴 [POLL][ENGINE_ERROR]`, rawError);

    const err: any = new Error("ENGINE_ERROR");
    err.code = "ENGINE_ERROR";
    err.raw = rawError;
    err.meta = { jobId };

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