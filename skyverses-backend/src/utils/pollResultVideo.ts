import axios from "axios";

interface PollLabsOperationOptions {
  operations: any;
  token: string;
  maxAttempts?: number;
  delayMs?: number;
}

/* -----------------------------------------------------
 * 🔁 Safe axios POST with retry (ECONNRESET / ETIMEDOUT)
 * --------------------------------------------------- */
async function safeAxiosPost(url: string, data: any, options: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.post(url, data, options);
    } catch (err: any) {
      if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
        console.warn(`⚠️ pollResultVideo retry ${i + 1}/${retries} after ${err.code}...`);
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("❌ pollResultVideo failed after max retries (ECONNRESET/ETIMEDOUT).");
}

/* -----------------------------------------------------
 * 🎯 Poll trạng thái batch video generation (Google Labs Veo3)
 * --------------------------------------------------- */
export async function pollResultVideo({
  operations,
  token,
  maxAttempts = 60,
  delayMs = 10_000,
}: PollLabsOperationOptions): Promise<{
  completed: {
    sceneId: string;
    fileUrl: string;
    prompt: string;
    model: string;
    aspectRatio: string;
    seed: number;
    mediaGenerationId: string;
  }[];
  failed: {
    sceneId: string;
    reason: string;
  }[];
  remainingCredits: number;
}> {
  const url =
    "https://aisandbox-pa.googleapis.com/v1/video:batchCheckAsyncVideoGenerationStatus";

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "text/plain;charset=UTF-8",
    Origin: "https://labs.google",
    Referer: "https://labs.google/",
  };

  const payload = {
    operations
  };

  const startTime = Date.now();

  for (let i = 1; i <= maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, delayMs));

    try {
      const res = await safeAxiosPost(
        url,
        payload,
        {
          headers,
          timeout: 120_000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
        3
      );

      const ops = res.data?.operations || [];
      const remainingCredits = res.data?.remainingCredits ?? -1;

      const completed: any[] = [];
      const failed: any[] = [];

      for (const op of ops) {
        const sceneId = op.sceneId;
        const status = op.status;
        const metadata = op.operation?.metadata;
        const video = metadata?.video || {};

        if (status === "MEDIA_GENERATION_STATUS_SUCCESSFUL") {
          completed.push({
            sceneId,
            fileUrl: video?.fifeUrl || "",
            prompt: video?.prompt || "",
            model: video?.model || "",
            aspectRatio: video?.aspectRatio || "",
            seed: video?.seed || 0,
            mediaGenerationId: video?.mediaGenerationId || "",
          });
        } else if (status === "MEDIA_GENERATION_STATUS_FAILED") {
          const reason = op.operation?.error?.message || "Unknown error";
          failed.push({ sceneId, reason });
        }
      }

      // 🟢 Tất cả jobs đã xử lý
      if (completed.length + failed.length === operations.length) {
        return { completed, failed, remainingCredits };
      }

      if (completed.length > 0) {
        console.log(
          `⏳ Partial progress: ${completed.length}/${operations.length} done... (${i}/${maxAttempts})`
        );
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        "Unknown Poll Error";

      console.error("❌ pollResultVideo error:", msg);

      // 🔥🔥 THROW lỗi thật sự (để handleJob bắt lại)
      throw new Error(err);
    }
  }

  // 🟡 Timeout nhưng không phải lỗi thật → trả về partial để cron tiếp tục vòng khác
  return {
    completed: [],
    failed: [],
    remainingCredits: -1,
  };
}