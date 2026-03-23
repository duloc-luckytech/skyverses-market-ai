import { request } from "./request";
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import { markChargedIfNeeded } from "../utils/markChargedIfNeeded";
import { getCaptchaToken } from "../../utils/getCaptchaToken";
import CaptchaToken from "../../models/CaptchaToken.model";

const MAX_ERROR_RETRY = 20;
const MAX_CALLS_PER_USER = 5;
const USER_COOLDOWN_MS = 5_000;
const userLastSentMap = new Map<string, number>();

/* -----------------------------------------------------
 * 🔹 GET TOKEN BY USER
 * --------------------------------------------------- */
async function getTokenByUserId(userId: string) {
  const user = await UserModel.findById(userId).lean();
  if (!user?.googleId) return null;

  return await GoogleTokenModel.findOne({
    _id: user.googleId,
    isActive: true,
  }).lean();
}

/* -----------------------------------------------------
 * 🔹 SUBMIT 1 SCENE JOB
 * --------------------------------------------------- */
async function handleSubmitSceneJob({
  job,
  userId,
  token,
  email,
  captcha,
}: {
  job: any;
  userId: string;
  token: string;
  email: string;
  captcha: any;
}) {
  const { _id, prompt, listIdImage, aspectRatio, errorCount = 0 } = job;
  const jobId = _id.toString();

  try {
    if (job.status === "error" && errorCount >= MAX_ERROR_RETRY) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "reject",
        errorReason: "MAX_RETRY_EXCEEDED",
        errorMessage: `Job failed ${errorCount} times`,
        completedAt: new Date(),
        refunded: true,
        refundedAt: new Date(),
        updatedAt: new Date(),
      });

      if (job.freeCredit === false) {
        const refund = job.resolution === "1080p" ? 2 : 1;
        await UserModel.findByIdAndUpdate(job.userId, {
          $inc: { videoUsed: -refund },
        });
      }
      return;
    }

    // 🚀 SUBMITTING
    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "submitting",
      updatedAt: new Date(),
    });

    // 🌐 CALL GOOGLE LABS
    const operations = await request({
      prompt,
      quantity: job.quantity,
      mediaIds: listIdImage,
      token,
      aspectRatio,
      freeCredit: job.freeCredit === true,
      recaptchaToken: captcha.tokenCaptcha, // ✅ CAPTCHA
    });

    const { operation, sceneId } = operations[0];

    await VideoJobModel.findByIdAndUpdate(jobId, {
      operationName: operation.name,
      sceneId,
      status: "processing",
      sentProcessAt: new Date(),
      sentByEmail: email,
      listOperations: operations,
      updatedAt: new Date(),
    });



    await markChargedIfNeeded(jobId, userId);
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message;

    if (message?.includes("UNAUTHENTICATED")) {
      await GoogleTokenModel.updateOne(
        { email },
        { isActive: false, note: message, lastActiveAt: new Date() }
      );

      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "reject",
        refunded: true,
        refundedAt: new Date(),
        errorMessage: message,
        updatedAt: new Date(),
      });

      if (job.freeCredit === false) {
        const refund = job.resolution === "1080p" ? 2 : 1;
        await UserModel.findByIdAndUpdate(job.userId, {
          $inc: { videoUsed: -refund },
        });
      }
      return;
    }

    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "error",
      $inc: { errorCount: 1 },
      errorMessage: message,
      updatedAt: new Date(),
    });
  }
}

/* -----------------------------------------------------
 * 🔹 SUBMIT SCENE JOBS (FREE / PAID)
 * --------------------------------------------------- */
async function submitSceneJobs(filterFreeCredit: boolean) {
  const allJobs = await VideoJobModel.find({
    type: "scene",
    status: { $in: ["pending", "error"] },
    freeCredit: filterFreeCredit,
    listIdImage: { $exists: true, $ne: [] },
    operationName: { $exists: false },
  })
    .sort({ createdAt: 1 })
    .limit(100);

  if (!allJobs.length) return;

  const grouped = new Map<string, any[]>();
  for (const job of allJobs) {
    if (!job.userId) continue;
    const list = grouped.get(job.userId.toString()) || [];
    list.push(job);
    grouped.set(job.userId.toString(), list);
  }

  await Promise.allSettled(
    Array.from(grouped.entries()).map(async ([userId, jobs]) => {
      const now = Date.now();
      const last = userLastSentMap.get(userId) || 0;
      if (now - last < USER_COOLDOWN_MS) return;
      userLastSentMap.set(userId, now);

      const tokenDoc = await getTokenByUserId(userId);
      if (!tokenDoc) return;

      const { accessToken: token, email } = tokenDoc;
      const selectedJobs = jobs.slice(0, MAX_CALLS_PER_USER);

      await Promise.allSettled(
        selectedJobs.map(async (job) => {
          // 🔐 GET CAPTCHA ≤ 2 MIN (ATOMIC)
          const captcha = await getCaptchaToken(job._id);
          if (!captcha) {
            // ❗ KHÔNG update job – chờ captcha mới
            return;
          }

          return handleSubmitSceneJob({
            job,
            userId,
            token,
            email,
            captcha,
          });
        })
      );
    })
  );
}

/* -----------------------------------------------------
 * 🕒 INTERVAL
 * --------------------------------------------------- */

// ⭐ PAID — nhanh
setInterval(() => submitSceneJobs(false), 30000);

// ⭐ FREE — chậm
setInterval(() => submitSceneJobs(true), 60000);