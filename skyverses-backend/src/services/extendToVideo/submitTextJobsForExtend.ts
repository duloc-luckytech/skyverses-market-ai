// 📁 jobs/submitTextJobsForExtend.ts
import { predictLabsBatchVideo } from "./predictLabs";
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import { PLAN_LIMITS } from "../../constanst/index";
import { markChargedIfNeeded } from "../utils/markChargedIfNeeded";
import { getCaptchaToken } from "../../utils/getCaptchaToken";
import CaptchaToken from "../../models/CaptchaToken.model";

const LABS_PROJECT_ID = process.env.VEO_LABS_PROJECT_ID || "labs";
const MAX_CALLS_PER_BATCH = 5;

// ⭐ CONCURRENCY LIMIT mỗi user
const PER_USER_CONCURRENCY = 2;

export async function submitTextJobsForExtend() {
  const allJobs: any[] = await VideoJobModel.find({
    type: "text-for-extend",
    status: "pending",
    operationName: { $exists: false },
  })
    .sort({ createdAt: 1 })
    .limit(100);

  if (!allJobs.length) {
    console.log("✅ No pending text-for-extend jobs.");
    return;
  }

  console.log(`📌 Found ${allJobs.length} pending text-for-extend jobs`);

  /* =====================================================
   * GROUP BY USER
   * =================================================== */
  const grouped = new Map<string, any[]>();

  for (const job of allJobs) {
    if (!job.userId) continue;
    const key = job.userId.toString();
    const list = grouped.get(key) || [];
    list.push(job);
    grouped.set(key, list);
  }

  const userIds = [...grouped.keys()];
  const users = await UserModel.find({ _id: { $in: userIds } }).lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  /* =====================================================
   * PROCESS EACH USER IN PARALLEL
   * =================================================== */
  await Promise.allSettled(
    [...grouped.entries()].map(async ([userId, jobs]) => {
      const user = userMap.get(userId);
      if (!user || !user.googleId) return;

      const plan = user.plan;
      const limit = PLAN_LIMITS[plan] ?? 1;

      const tokenDoc: any = await GoogleTokenModel.findOne({
        _id: user.googleId,
        isActive: true,
      }).lean();

      if (!tokenDoc?.accessToken) return;

      const pickCount = Math.min(limit, MAX_CALLS_PER_BATCH);
      const jobsToRun = jobs.slice(0, pickCount);

      console.log(
        `👤 [${user.email}] Running ${jobsToRun.length} extend jobs (parallel=${PER_USER_CONCURRENCY})`
      );

      /* =================================================
       * PARALLEL WORKERS (PER USER)
       * =============================================== */
      const queue = [...jobsToRun];

      async function runWorker() {
        while (queue.length) {
          const job = queue.shift();
          if (!job) return;

          const jobId = job._id.toString();

          try {
            /* ---------------------------------------------
             * 🔐 GET CAPTCHA ≤ 2 MIN (ATOMIC)
             * ------------------------------------------- */
            const captcha = await getCaptchaToken(jobId);
            if (!captcha) {
              // ❗ Không update job → chờ captcha mới
              continue;
            }

            console.log(`⚡ Submit extend → ${jobId} via ${tokenDoc.email}`);

            /* ---------------------------------------------
             * 💳 CHARGE (SAU CAPTCHA)
             * ------------------------------------------- */
            await markChargedIfNeeded(jobId, userId);

            /* ---------------------------------------------
             * 🚀 CALL GOOGLE LABS
             * ------------------------------------------- */
            const operations = await predictLabsBatchVideo({
              prompt: job.prompt,
              token: tokenDoc.accessToken,
              projectId: LABS_PROJECT_ID,
              aspectRatio: job.aspectRatio,
              recaptchaToken: captcha.tokenCaptcha, // ✅ CAPTCHA
            });

            const { operation, sceneId } = operations[0];
            const operationName = operation.name;

            await VideoJobModel.findByIdAndUpdate(jobId, {
              operationName,
              sceneId,
              listOperations: operations,
              sentProcessAt: new Date(),
              status: "processing",
              sentByEmail: tokenDoc.email,
              updatedAt: new Date(),
            });

            console.log(`✅ Done submit extend ${jobId}`);
          } catch (err: any) {
            console.error(
              `❌ Extend worker failed job ${jobId}:`,
              err.message || err
            );

            await VideoJobModel.findByIdAndUpdate(jobId, {
              status: "error",
              errorMessage: err.message || err,
              updatedAt: new Date(),
            });
          }
        }
      }

      // Tạo N worker chạy song song cho user
      await Promise.all(
        Array.from({ length: PER_USER_CONCURRENCY }).map(() => runWorker())
      );
    })
  );
}

// ⏱️ AUTO RUN
setInterval(submitTextJobsForExtend, 30_000);
