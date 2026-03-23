import axios from "axios";

interface PollLabsOperationOptions {
  operations: {
    sceneId: string;
    operationName: string;
  }[];
  token: string;
  maxAttempts?: number;
  delayMs?: number;
}

/* -----------------------------------------------------
 * 🔁 Hàm post an toàn (retry khi ECONNRESET/ETIMEDOUT)
 * --------------------------------------------------- */
async function safeAxiosPost(url: string, data: any, options: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.post(url, data, options);
    } catch (err: any) {
      if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
        console.warn(`⚠️ Retry ${i + 1}/${retries} after ${err.code}...`);
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("❌ Failed after max retries (ECONNRESET/ETIMEDOUT).");
}

/* -----------------------------------------------------
 * 🎯 Poll trạng thái batch video generation (Google Labs Veo3)
 * --------------------------------------------------- */
export async function pollLabsOperation({
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
    operations: operations.map((op) => ({
      operation: { name: op.operationName },
      sceneId: op.sceneId,
      status: "MEDIA_GENERATION_STATUS_PENDING",
    })),
  };

  for (let i = 1; i <= maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, delayMs));

    try {
      // ✅ Thêm timeout + retry
      const res = await safeAxiosPost(
        url,
        payload,
        {
          headers,
          timeout: 120_000, // ⏱️ 2 phút
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
        3 // retry 3 lần nếu mạng chập chờn
      );

      const ops = res.data?.operations || [];
      const remainingCredits = res.data?.remainingCredits ?? -1;

      const completed: any[] = [];
      const failed: any[] = [];

      for (const op of ops) {
        const sceneId = op.sceneId;
        const status = op.status;

        if (status === "MEDIA_GENERATION_STATUS_SUCCESSFUL") {
          const video = op.operation.metadata?.video;
          completed.push({
            sceneId,
            fileUrl: video?.fifeUrl,
            prompt: video?.prompt,
            model: video?.model,
            aspectRatio: video?.aspectRatio,
            seed: video?.seed,
          });
        } else if (status === "MEDIA_GENERATION_STATUS_FAILED") {
          const reason = op.operation?.error?.message || "Unknown error";
          failed.push({ sceneId, reason });
        }
      }

      if (completed.length + failed.length === operations.length) {
        return {
          completed,
          failed,
          remainingCredits,
        };
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message;
      console.error("❌ PollLabs error:", msg);
    }
  }

  throw new Error(
    "❌ Timeout: Not all operations finished within polling window"
  );
}