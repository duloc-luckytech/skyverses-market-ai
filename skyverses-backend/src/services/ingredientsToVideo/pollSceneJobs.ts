// pollSceneJobs.ts
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import requestUpsample1080p from "../../utils/requestUpsample1080p";
import { pollVideoUniversal } from "../../utils/pollVideoUniversal";
import { REJECT_ERRORS } from "../../constanst/index";

const MAX_POLL_DURATION_MS = 30 * 60 * 1000; // 30 phút

/* -----------------------------------------------------
 * 🔹 POLL Scene Jobs
 * --------------------------------------------------- */
export async function pollSceneJobs() {
  const jobs = await VideoJobModel.find({
    type: "scene",
    status: { $in: ["processing", "partial", "error"] },
    operationName: { $exists: true, $ne: null },
  })
    .sort({ updatedAt: 1 })
    .limit(100);

  if (!jobs.length) return;

  /** Group jobs by email */
  const groups = new Map<string, any[]>();
  for (const job of jobs) {
    if (!job.sentByEmail) continue;
    groups.set(job.sentByEmail, [...(groups.get(job.sentByEmail) || []), job]);
  }

  // ⭐ CHẠY NỐI TIẾP TỪNG EMAIL
  for (const [email, jobList] of groups.entries()) {
    const tokenDoc = await GoogleTokenModel.findOne({
      email,
      isActive: true,
    }).lean();

    if (!tokenDoc?.accessToken) continue;
    const token = tokenDoc.accessToken;

    // ⭐ MỖI JOB CHẠY NỐI TIẾP, KHÔNG PARALLEL
    for (const job of jobList) {
      const {
        _id,
        resolution,
        listOperations,
        sentProcessAt,
        sceneId,
      } = job;

      const jobId = String(_id);
      const totalOps = listOperations.length;

      try {
        /* ------------------------------------------------
         * 1) TIMEOUT → reject + refund
         * ----------------------------------------------*/
        if (sentProcessAt) {
          const elapsed = Date.now() - new Date(sentProcessAt).getTime();
          if (elapsed > MAX_POLL_DURATION_MS) {
            await rejectWithRefund(job, "TIMEOUT_EXCEEDED");
            continue;
          }
        }

        /* ------------------------------------------------
         * 2) POLL GOOGLE
         * ----------------------------------------------*/
        const result = await pollVideoUniversal({
          operations: listOperations,
          token,
          jobId,
        });

        const completedOps = result.completed.length;

        /* ------------------------------------------------
         * 3) PENDING → KHÔNG LÀM GÌ
         * ----------------------------------------------*/
        if (completedOps === 0) {
          console.log(`⏳ Scene ${jobId} still pending...`);
          continue;
        }

        /* ------------------------------------------------
         * 4) FULL SUCCESS → DONE
         * ----------------------------------------------*/
        if (completedOps === totalOps) {
          const completed = result.completed[0];

          let fileUrl = completed.fileUrl;

          // 🔼 UPSAMPLE 1080p
          if (
            resolution === "1080p" &&
            completed.mediaGenerationId &&
            job.didUpsample1080p !== true
          ) {
            await VideoJobModel.findByIdAndUpdate(jobId, {
              didUpsample1080p: true,
            });

            try {
              const up = await requestUpsample1080p({
                mediaGenId: completed.mediaGenerationId,
                sceneId,
                token,
              });

              if (up?.fileUrl) fileUrl = up.fileUrl;
            } catch {}
          }

          await VideoJobModel.findByIdAndUpdate(jobId, {
            status: "done",
            fileUrl,
            progress: 100,
            results: result,
            completedAt: new Date(),
          });

          console.log(`🎉 DONE scene job ${jobId}`);
          continue;
        }

        /* ------------------------------------------------
         * 5) PARTIAL → UPDATE STATUS partial
         * ----------------------------------------------*/
        if (completedOps > 0 && completedOps < totalOps) {
          const pct = Math.round((completedOps / totalOps) * 100);

          await VideoJobModel.findByIdAndUpdate(jobId, {
            status: "partial",
            progress: pct,
            fileUrl:result.completed[0]?.fileUrl,
            results: result,
            updatedAt: new Date(),
          });

          console.log(
            `🟡 PARTIAL scene ${jobId} (${completedOps}/${totalOps})`
          );

          continue;
        }

      } catch (err: any) {
        console.error(`❌ pollScene job ${jobId}`, err.message);

        // TOKEN DIE → disable token
        if (err.message.includes("UNAUTHENTICATED")) {
          await GoogleTokenModel.updateOne(
            { email },
            { isActive: false, note: err.message }
          );
          console.warn(`🔴 Token disabled: ${email}`);

          await rejectWithRefund(job, "TOKEN_INVALID");
        }
      }
    }
  }
}

/* -----------------------------------------------------
 *  REJECT + REFUND Helper
 * --------------------------------------------------- */
async function rejectWithRefund(job: any, reason: string) {
  const refundUnit = job.resolution === "1080p" ? 2 : 1;
  const totalRefund = refundUnit * (job.quantity || 1);

  await VideoJobModel.findByIdAndUpdate(job._id, {
    status: "reject",
    completedAt: new Date(),
    refunded: true,
    refundedAt: new Date(),
    errorReason: reason,
  });

  if (!job.freeCredit) {
    await UserModel.findByIdAndUpdate(job.userId, {
      $inc: { videoUsed: -totalRefund },
    });
  }

  console.warn(`⛔ Reject scene job ${job._id}: ${reason} (refund ${totalRefund})`);
}

setInterval(pollSceneJobs, 20_000);