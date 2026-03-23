import { safeAxiosPost } from "./safeAxiosPost";
import VideoJobModel from "../models/VideoJobModel";
import UserModel from "../models/UserModel";
import { REJECT_ERRORS } from "../constanst/index";

interface PollVideoOptions {
  operations: {
    operation: { name: string };
    sceneId: string;
  }[];
  jobId: string;
  token: string;
}

function isFatalModelError(reason: string) {
  if (!reason) return false;

  const r = reason.toLowerCase();

  return (
    r.includes("failed to parse json") ||
    r.includes("invalid response from gemini") ||
    r.includes("failed to get combined chunks") ||
    r.includes("ret_check failure") ||
    r.includes("lmroot")
  );
}

export async function pollVideoUniversal({
  operations,
  jobId,
  token,
}: PollVideoOptions): Promise<{
  completed: any[];
  failed: any[];
  remainingCredits: number;
}> {
  const job = await VideoJobModel.findById(jobId);
  if (!job) throw new Error("Job not found: " + jobId);

  const url =
    "https://aisandbox-pa.googleapis.com/v1/video:batchCheckAsyncVideoGenerationStatus";

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "text/plain;charset=UTF-8",
    Origin: "https://labs.google",
    Referer: "https://labs.google/",
  };

  const payload = { operations };
  const ERROR_WINDOW = 8 * 60 * 1000;

  try {
    const res = await safeAxiosPost(url, payload, {
      headers,
      timeout: 120_000,
    });

    const ops = res.data?.operations || [];
    const remainingCredits = res.data?.remainingCredits ?? -1;

    const completed: any[] = [];
    const failed: any[] = [];

    /* =====================================================
      PARSE OPS
    ===================================================== */
    for (const op of ops) {
      const status = op.status;
      const sceneId = op.sceneId;

      const reason =
        op.operation?.error?.message ||
        op.operation?.error?.code ||
        "Unknown error";

      const metadata = op.operation?.metadata || {};
      const video = metadata.video || op.result?.video || {};

      console.log("status>>>", jobId, status, reason);

      if (
        status === "MEDIA_GENERATION_STATUS_ACTIVE" ||
        status === "MEDIA_GENERATION_STATUS_PENDING"
      ) {
        continue;
      }

      if (status === "MEDIA_GENERATION_STATUS_SUCCESSFUL") {
        completed.push({
          sceneId,
          fileUrl:
            video?.fifeUrl || video?.servingBaseUri || video?.videoUri || "",
          prompt: video?.prompt || "",
          model: video?.model || "",
          aspectRatio: video?.aspectRatio || "",
          seed: video?.seed || 0,
          mediaGenerationId: video?.mediaGenerationId || "",
        });

        if (job.errorStartedAt) {
          job.errorStartedAt = null;
          await job.save();
        }
        continue;
      }

      if (status === "MEDIA_GENERATION_STATUS_FAILED") {
        // 🚨 FATAL MODEL ERROR → REJECT IMMEDIATELY
        if (isFatalModelError(reason)) {
          console.error("⛔ FATAL MODEL ERROR → REJECT", {
            jobId,
            sceneId,
            reason,
          });
      
          const refundPerOp = job.resolution === "1080p" ? 2 : 1;
          const totalOps = job.listOperations?.length || 1;
          const refundAmount = refundPerOp * totalOps;
      
          await VideoJobModel.findByIdAndUpdate(jobId, {
            status: "reject",
            errorReason: reason,
            completedAt: new Date(),
            refunded: true,
            refundedAt: new Date(),
          });
      
          if (!job.freeCredit) {
            await UserModel.findByIdAndUpdate(job.userId, {
              $inc: { videoUsed: -refundAmount },
            });
          }
      
          return {
            completed: [],
            failed: [{ sceneId, reason }],
            remainingCredits,
          };
        }
      
        // ❗ non-fatal failed → xử lý bình thường
        failed.push({ sceneId, reason });
      
        if (!job.errorStartedAt) {
          job.errorStartedAt = new Date();
          await job.save();
        }
      }
    }

    /* =====================================================
      POST-PARSE METRICS
    ===================================================== */
    const hasSuccess = completed.length > 0;
    const now = Date.now();
    const jobCreatedAt = job.createdAt?.getTime() || now;
    const elapsedFromCreate = now - jobCreatedAt;

    const totalOps = job.listOperations?.length || 1;
    const refundPerOp = job.resolution === "1080p" ? 2 : 1;
    const refundAmount = totalOps * refundPerOp;

    /* =====================================================
      ALL FAILED + HIGH TRAFFIC → PENDING
    ===================================================== */
    const allFailedHighTraffic =
      ops.length > 0 &&
      ops.every(
        (op: any) =>
          op.status === "MEDIA_GENERATION_STATUS_FAILED" &&
          op.operation?.error?.message === "PUBLIC_ERROR_HIGH_TRAFFIC"
      );

    if (allFailedHighTraffic) {
      console.warn(
        "⚠️ PUBLIC_ERROR_HIGH_TRAFFIC – reset job to pending:",
        jobId
      );

      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "pending",
        $unset: {
          operationName: 1,
        },

        listOperations: [],
        sentByEmail: null,
        sentProcessAt: null,

        // 🔑 CỰC QUAN TRỌNG
        charged: false,
        chargedAt: null,

        // retry info
        errorReason: "PUBLIC_ERROR_HIGH_TRAFFIC",
        errorStartedAt: null,

        updatedAt: new Date(),
      });

      if (!job.freeCredit) {
        await UserModel.findByIdAndUpdate(job.userId, {
          $inc: { videoUsed: -refundAmount },
        });
        console.log("💰 REFUND:", {
          user: job.userId,
          refundAmount,
          resolution: job.resolution,
          totalOps,
        });
      }

      throw new Error("ALL_FAILED_HIGH_TRAFFIC");
    }

    /* =====================================================
      ⭐ FORCE DONE IF HAS SUCCESS & > 8 MIN
    ===================================================== */
    if (hasSuccess && elapsedFromCreate > ERROR_WINDOW) {
      console.log("✅ FORCE DONE after 8min (has success):", jobId);

      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "done",
        completedAt: new Date(),
        errorReason: failed.length > 0 ? "PARTIAL_FAILED_HIGH_TRAFFIC" : null,
      });
      throw new Error("PARTIAL_FAILED_HIGH_TRAFFIC");
    }

    /* =====================================================
      FULL SUCCESS
    ===================================================== */
    if (completed.length === operations.length) {
      return { completed, failed: [], remainingCredits };
    }

    /* =====================================================
      PARTIAL SUCCESS (STILL IN WINDOW)
    ===================================================== */
    if (hasSuccess) {
      return { completed, failed, remainingCredits };
    }

    /* =====================================================
      TIMEOUT > 8 MIN (NO SUCCESS)
    ===================================================== */
    if (job.errorStartedAt) {
      const elapsed = Date.now() - job.errorStartedAt.getTime();

      if (elapsed > ERROR_WINDOW) {
        await VideoJobModel.findByIdAndUpdate(jobId, {
          status: "reject",
          errorReason: "TIMEOUT >8min",
          completedAt: new Date(),
          refunded: true,
          refundedAt: new Date(),
        });

        if (!job.freeCredit) {
          await UserModel.findByIdAndUpdate(job.userId, {
            $inc: { videoUsed: -refundAmount },
          });
        }

        return { completed: [], failed, remainingCredits };
      }
    }

    /* =====================================================
      HARD ERROR
    ===================================================== */
    const hardErr = failed.find((f) => REJECT_ERRORS.includes(f.reason));
    if (hardErr) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "reject",
        errorReason: hardErr.reason,
        completedAt: new Date(),
        refunded: true,
        refundedAt: new Date(),
      });

      if (!job.freeCredit) {
        await UserModel.findByIdAndUpdate(job.userId, {
          $inc: { videoUsed: -refundAmount },
        });
      }

      return {
        completed: [],
        failed: [hardErr],
        remainingCredits,
      };
    }

    /* =====================================================
      DEFAULT
    ===================================================== */
    return { completed, failed, remainingCredits };
  } catch (err: any) {
    throw new Error(
      err.response?.data?.error?.message || err.message || "Unknown Poll Error"
    );
  }
}
