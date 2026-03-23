import axios from "axios";
import { createScene } from "../../utils/labsSceneUtils";
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import { markChargedIfNeeded } from "../utils/markChargedIfNeeded";
import { getCaptchaToken } from "../../utils/getCaptchaToken";
import CaptchaToken from "../../models/CaptchaToken.model";

const MAX_ERROR_RETRY = 5;
const MAX_PARALLEL_PER_USER = 5;
const MAX_PARALLEL_GLOBAL = 20;
const LABS_PROJECT_ID = process.env.VEO_LABS_PROJECT_ID || "labs";

/* -----------------------------------------------------
 * 🔥 SUBMIT EXTEND JOBS — WITH CAPTCHA
 * --------------------------------------------------- */
export async function submitSceneJobsForExtend() {
  const allJobs = await VideoJobModel.find({
    type: "extend-to-video",
    mediaIdInputExtend: { $exists: true, $ne: null },
    $or: [
      { status: "pending", operationName: null },
      { status: "error" },
      { status: "submitting" },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(200);

  if (!allJobs.length) return;

  console.log(`🚀 Found ${allJobs.length} extend jobs`);

  const grouped = new Map<string, any[]>();
  for (const job of allJobs) {
    const key = job.userId.toString();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(job);
  }

  const users = await UserModel.find({
    _id: { $in: [...grouped.keys()] },
  }).lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  let running = 0;

  await Promise.allSettled(
    [...grouped.entries()].map(async ([userId, jobs]) => {
      const user = userMap.get(userId);
      if (!user || !user.googleId) return;

      const tokenDoc = await GoogleTokenModel.findById(user.googleId).lean();
      if (!tokenDoc?.accessToken) return;

      const {
        accessToken: token,
        email,
        cookieToken = "",
        projectId = LABS_PROJECT_ID,
      } = tokenDoc;

      const limitedJobs = jobs.slice(0, MAX_PARALLEL_PER_USER);
      console.log(`🎯 [${email}] Pick ${limitedJobs.length} jobs`);

      for (const job of limitedJobs) {
        if (running >= MAX_PARALLEL_GLOBAL) break;

        running++;
        handleSubmitJob(job, token, email, cookieToken, projectId).finally(
          () => running--
        );
      }
    })
  );

  console.log("🎬 submitSceneJobsForExtend finished");
}

/* -----------------------------------------------------
 * 🔥 HANDLE ONE JOB — CAPTCHA SAFE
 * --------------------------------------------------- */
async function handleSubmitJob(
  job: any,
  token: string,
  email: string,
  cookieToken: string,
  projectId: string
) {
  const {
    _id,
    prompt,
    mediaIdInputExtend,
    status,
    errorCount = 0,
    userId,
    aspectRatio,
  } = job;

  const jobId = _id.toString();

  try {
    /* ---------------------------------------
     * 🔒 LOCK JOB
     * ------------------------------------- */
    const locked = await VideoJobModel.findOneAndUpdate(
      {
        _id: jobId,
        status: { $in: ["pending", "error", "submitting"] },
      },
      { status: "submitting", updatedAt: new Date() },
      { new: true }
    );

    if (!locked) return;

    /* ---------------------------------------
     * ❌ MAX RETRY
     * ------------------------------------- */
    if (status === "error" && errorCount >= MAX_ERROR_RETRY) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "reject",
        refunded: true,
        refundedAt: new Date(),
        errorReason: "MAX_RETRY_EXCEEDED",
      });

      const refund = job.resolution === "1080p" ? 2 : 1;
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { videoUsed: -refund },
      });
      return;
    }

    /* ---------------------------------------
     * 🔐 GET CAPTCHA ≤ 2 MIN (ATOMIC)
     * ------------------------------------- */
    const captcha = await getCaptchaToken(jobId);
    if (!captcha) {
      await VideoJobModel.findByIdAndUpdate(jobId, { status: "pending" });
      return;
    }

    /* ---------------------------------------
     * 💰 CHARGE USER (ONCE)
     * ------------------------------------- */
    await markChargedIfNeeded(jobId, userId);

    console.log(`🎥 [${email}] createScene → ${jobId}`);

    /* ---------------------------------------
     * 1️⃣ CREATE SCENE
     * ------------------------------------- */
    const { clipId, sceneId, startFrame, endFrame } = await createScene({
      token,
      cookieToken,
      projectId,
      mediaGenId: mediaIdInputExtend,
      email,
      jobId,
      startTime: job.startTime || "0s",
      endTime: job.endTime || "7s",
    });

    if (!clipId || !sceneId) {
      throw new Error("createScene failed");
    }

    console.log(`💫 [${email}] extendVideo → ${jobId}`);

    /* ---------------------------------------
     * 2️⃣ EXTEND VIDEO (WITH CAPTCHA)
     * ------------------------------------- */
    const operations = await extendVideo({
      token,
      projectId,
      prompt,
      sceneId,
      clipId,
      email,
      jobId,
      startFrame,
      endFrame,
      aspectRatio,
      recaptchaToken: captcha.tokenCaptcha,
    });

    if (!operations?.length) throw new Error("extendVideo empty result");

    await VideoJobModel.findByIdAndUpdate(jobId, {
      clipId,
      sceneId,
      listOperations: operations,
      operationName: operations[0].operation?.name,
      status: "pending",
      sentProcessAt: new Date(),
      sentByEmail: email,
      updatedAt: new Date(),
    });


    console.log(`✅ [${email}] submitted extend job ${jobId}`);
  } catch (err: any) {
    console.error(`❌ [${email}] job ${jobId} error: ${err.message}`);

    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "error",
      $inc: { errorCount: 1 },
      errorMessage: err.message || String(err),
      updatedAt: new Date(),
    });
  }
}

/* -----------------------------------------------------
 * 🔹 EXTEND VIDEO API
 * --------------------------------------------------- */
async function extendVideo({
  token,
  projectId,
  prompt,
  sceneId,
  clipId,
  startFrame,
  endFrame,
  aspectRatio = "VIDEO_ASPECT_RATIO_LANDSCAPE",
  recaptchaToken,
}: any) {
  const videoModelKey =
    aspectRatio === "VIDEO_ASPECT_RATIO_PORTRAIT"
      ? "veo_3_1_extend_fast_portrait_ultra"
      : "veo_3_1_extend_fast_landscape_ultra";

  const res = await axios.post(
    "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoExtendVideo",
    {
      clientContext: {
        projectId,
        recaptchaToken, // ✅ CAPTCHA
        tool: "PINHOLE",
        userPaygateTier: "PAYGATE_TIER_TWO",
      },
      requests: [
        {
          textInput: { prompt },
          videoInput: {
            mediaId: clipId,
            startFrameIndex: startFrame,
            endFrameIndex: endFrame,
          },
          videoModelKey,
          aspectRatio,
          metadata: { sceneId },
        },
      ],
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data?.operations?.map((item: any) => ({
    operation: item.operation,
    sceneId: item.sceneId,
    status: item.status,
  }));
}

/* -----------------------------------------------------
 * 🕒 CRON
 * --------------------------------------------------- */
setInterval(submitSceneJobsForExtend, 20_000);