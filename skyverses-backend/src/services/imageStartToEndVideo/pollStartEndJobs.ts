// pollStartEndJobs.ts
import { pollVideoUniversal } from "../../utils/pollVideoUniversal";
import requestUpsample1080p from "../../utils/requestUpsample1080p";
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";

const MAX_POLL_DURATION_MS = 30 * 60 * 1000; // 30 phút

/* --------------------------------------------------------
 * 🔹 POLL start-end-image (redirect)
 * -------------------------------------------------------- */
export async function pollStartEndJobs() {
  const jobs = await VideoJobModel.find({
    type: "start-end-image-redirect",
    status: { $in: ["processing", "partial", "error"] },
    operationName: { $exists: true, $ne: null },
  })
    .sort({ updatedAt: 1 })
    .limit(100);

  if (!jobs.length) {
    console.log("✅ No start-end-image jobs to poll.");
    return;
  }

  // Group jobs theo email
  const groups = new Map<string, any[]>();
  for (const job of jobs) {
    if (!job.sentByEmail) continue;

    const arr = groups.get(job.sentByEmail) || [];
    arr.push(job);
    groups.set(job.sentByEmail, arr);
  }

  // Chạy từng email nối tiếp → tránh rate limit
  for (const [email, list] of groups.entries()) {
    const tokenDoc = await GoogleTokenModel.findOne({
      email,
      isActive: true,
    }).lean();

    if (!tokenDoc?.accessToken) continue;

    const token = tokenDoc.accessToken;

    for (const job of list) {
      await pollOneStartEndJob(job, token);
    }
  }

  console.log("🎯 Polling round for start-end-image-redirect complete.");
}

/* --------------------------------------------------------
 * 🔹 Poll 1 job
 * -------------------------------------------------------- */
async function pollOneStartEndJob(job: any, token: string) {
  const jobId = job._id.toString();
  const totalOps = job.listOperations.length;
  const email = job.sentByEmail;

  try {
    console.log(`🔍 [${email}] Polling job ${jobId}`);

    const resPoll = await pollVideoUniversal({
      token,
      jobId,
      operations: job.listOperations,
    });

    const completedList = resPoll.completed || [];
    const completedCount = completedList.length;

    // ⏳ Chưa có gì → poll tiếp
    if (completedCount === 0) return;

    // Scene đầu tiên
    let fileUrl = completedList[0].fileUrl;
    const mediaGenId = completedList[0].mediaGenerationId;

    /* --------------------------------------------------------
     * Upsample 1080p
     * ------------------------------------------------------ */
    if (job.resolution === "1080p" && mediaGenId && !job.didUpsample1080p) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        didUpsample1080p: true,
        results: resPoll,
      });

      try {
        const up = await requestUpsample1080p({
          mediaGenId,
          sceneId: job.sceneId,
          token,
        });

        if (up?.fileUrl) fileUrl = up.fileUrl;
      } catch (err) {
        console.warn(`⚠️ Upsample failed (continue with original file).`);
      }
    }

    /* --------------------------------------------------------
     *  FULL SUCCESS
     * ------------------------------------------------------ */
    if (completedCount === totalOps) {
      return await markDone(jobId, fileUrl, resPoll);
    }

    /* --------------------------------------------------------
     *  PARTIAL SUCCESS
     * ------------------------------------------------------ */
    if (completedCount > 0 && completedCount < totalOps) {
      const progress = Math.floor((completedCount / totalOps) * 100);

      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "partial",
        fileUrl,
        progress,
        results: resPoll,
        updatedAt: new Date(),
      });

      console.log(
        `🟡 PARTIAL [${email}] job ${jobId}: ${completedCount}/${totalOps} (${progress}%)`
      );

      return;
    }
  } catch (err: any) {
    console.error(
      `❌ [${job.sentByEmail}] Poll error job ${jobId}:`,
      err?.message
    );

    if (err?.message?.includes("UNAUTHENTICATED")) {
      await GoogleTokenModel.updateOne(
        { email: job.sentByEmail },
        { isActive: false, note: err.message }
      );

      await rejectWithRefund(job, "TOKEN_INVALID");
    }
  }
}

/* --------------------------------------------------------
 * 🔹 Mark Done
 * -------------------------------------------------------- */
async function markDone(jobId: string, fileUrl: string, results: any) {
  await VideoJobModel.findByIdAndUpdate(jobId, {
    status: "done",
    fileUrl,
    results,
    progress: 100,
    completedAt: new Date(),
  });

  console.log(`✅ Job ${jobId} DONE.`);
}

/* --------------------------------------------------------
 * 🔹 Reject + Refund User
 * -------------------------------------------------------- */
async function rejectWithRefund(job: any, reason: string) {
  const refundUnit = job.resolution === "1080p" ? 2 : 1;
  const refundTotal = refundUnit * (job.quantity || 1);

  await VideoJobModel.findByIdAndUpdate(job._id, {
    status: "reject",
    completedAt: new Date(),
    refunded: true,
    refundedAt: new Date(),
    errorReason: reason,
  });

  if (!job.freeCredit) {
    await UserModel.findByIdAndUpdate(job.userId, {
      $inc: { videoUsed: -refundTotal },
    });
  }

  console.warn(
    `⛔ REJECT job ${job._id} (${job.type}) — ${reason} | REFUND = ${refundTotal}`
  );
}

/* --------------------------------------------------------
 * 🔹 Interval chạy poll
 * -------------------------------------------------------- */
setInterval(pollStartEndJobs, 20_000);
