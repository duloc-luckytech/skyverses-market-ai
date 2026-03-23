// processStartImageSubmit.ts

import { generateVideoFromStartImage } from "./request";
import { requestGommoVideo } from "../ai/gommo/requestGommoVideo";

import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import ProviderTokenModel from "../../models/ProviderToken.model";
import ImageOwnerModel from "../../models/ImageOwnerModel";

import { PLAN_LIMITS } from "../../constanst/index";
import { markChargedIfNeeded } from "../utils/markChargedIfNeeded";
import { getCaptchaToken } from "../../utils/getCaptchaToken";

const MAX_CALLS_PER_BATCH = 3;
const MAX_ERROR_RETRY = 5;

/* -----------------------------------------------------
 * 🔍 Chọn token Google phù hợp nhất (GIỮ NGUYÊN)
 * --------------------------------------------------- */
async function selectBestToken(job: any) {
  const user = await UserModel.findById(job.userId).lean();
  if (!user) return null;

  let tokenDoc = await GoogleTokenModel.findOne({
    _id: user.googleId,
    isActive: true,
  }).lean();

  if (job.listIdImage?.length) {
    const firstImageId = job.listIdImage[0];
    const imageOwner = await ImageOwnerModel.findOne({
      mediaId: firstImageId,
    }).lean();

    if (imageOwner?.googleEmail) {
      const uploadToken = await GoogleTokenModel.findOne({
        email: imageOwner.googleEmail,
        isActive: true,
      }).lean();
      if (uploadToken) tokenDoc = uploadToken;
    }
  }

  return tokenDoc;
}

/* -----------------------------------------------------
 * 🔥 CORE SUBMIT (FREE / PAID)
 * --------------------------------------------------- */
async function processStartImageSubmitCore(isFree: boolean) {
  const allJobs = await VideoJobModel.find({
    type: "start-image",
    status: "pending",
  }).sort({ createdAt: 1 });
  console.log("allJobs>>", allJobs);

  if (!allJobs.length) return;
  const eligible: any[] = [];

  /* -------------------------------------------------
   * 🧮 Filter theo plan + job đang processing
   * ----------------------------------------------- */
  for (const job of allJobs) {
    const user = await UserModel.findById(job.userId).lean();
    if (!user) continue;

    const limit = PLAN_LIMITS[user.plan] ?? 1;

    const activeCount = await VideoJobModel.countDocuments({
      userId: user._id,
      type: "start-image",
      status: "processing",
    });

    if (activeCount < limit) eligible.push(job);
  }

  const jobs = eligible.slice(0, MAX_CALLS_PER_BATCH);
  if (!jobs.length) return;

  await Promise.all(
    jobs.map(async (job) => {
      const jobId = job._id.toString();

      try {
        /* -------------------------------------------
         * ❌ MAX RETRY → REJECT + REFUND
         * ----------------------------------------- */
        if (job.status === "error" && job.errorCount >= MAX_ERROR_RETRY) {
          await VideoJobModel.findByIdAndUpdate(jobId, {
            status: "reject",
            refunded: true,
            refundedAt: new Date(),
            errorReason: "TIMEOUT_EXCEEDED",
          });

          if (!job.freeCredit) {
            const refund = job.resolution === "1080p" ? 2 : 1;
            await UserModel.findByIdAndUpdate(job.userId, {
              $inc: { videoUsed: -refund },
            });
          }
          return;
        }

        /* =================================================
         * 🟢 ROUTER THEO SOURCE
         * ================================================= */

        /* ===============================
         * 🟢 GOMMO START-IMAGE
         * =============================== */
        if (job.source === "gommo") {
          if (!job.images?.length) {
            throw new Error("GOMMO_IMAGES_MISSING");
          }

          const gommoToken = await ProviderTokenModel.findOne({
            provider: "gommo",
            isActive: true,
          }).lean();

          console.log("gommoToken", gommoToken);

          if (!gommoToken?.apiKey) {
            throw new Error("GOMMO_TOKEN_NOT_AVAILABLE");
          }

          const result = await requestGommoVideo({
            accessToken: gommoToken.apiKey,
            prompt: job.prompt,
            model: job.model || "veo_3_1",
            privacy: "PRIVATE",

            ratio:
              job.aspectRatio === "VIDEO_ASPECT_RATIO_PORTRAIT"
                ? "9:16"
                : "16:9",

            resolution: job.resolution || "720p",
            duration: job.duration || 8,
            mode: job.mode || "relaxed",

            images: job.images,
          });

          await VideoJobModel.findByIdAndUpdate(jobId, {
            provider: "gommo",
            source: "gommo",

            status: "processing",
            taskId: result.taskId,
            sentProcessAt: new Date(),
          });
          await markChargedIfNeeded(jobId, job.userId);

          return;
        }

        /* -------------------------------------------
         * 🔐 CAPTCHA
         * ----------------------------------------- */
        const captcha = await getCaptchaToken(jobId);
        if (!captcha) return;

        /* -------------------------------------------


        /* ===============================
         * 🔵 GOOGLE LABS (GIỮ NGUYÊN)
         * =============================== */
        const tokenDoc = await selectBestToken(job);
        if (!tokenDoc) return;

        const { accessToken: token, email } = tokenDoc;

        const response = await generateVideoFromStartImage({
          prompt: job.prompt,
          quantity: job.quantity,
          startImageMediaId: job.listIdImage[0],
          token,
          aspectRatio: job.aspectRatio || "VIDEO_ASPECT_RATIO_LANDSCAPE",
          freeCredit: job.freeCredit,
          recaptchaToken: captcha.tokenCaptcha,
        });

        const { operation, sceneId } = response[0];

        await VideoJobModel.findByIdAndUpdate(jobId, {
          provider: "labs",
          source: "labs",
          status: "processing",
          operationName: operation.name,
          sceneId,
          sentProcessAt: new Date(),
          sentByEmail: email,
          listOperations: response,
        });
        await markChargedIfNeeded(jobId, job.userId);
      } catch (err: any) {
        await VideoJobModel.findByIdAndUpdate(jobId, {
          status: "error",
          $inc: { errorCount: 1 },
          errorMessage: err?.message || JSON.stringify(err),
        });
      }
    })
  );
}

/* -----------------------------------------------------
 * 🌟 PAID / FREE
 * --------------------------------------------------- */
export function processStartImageSubmitPaid() {
  processStartImageSubmitCore(false);
}

export function processStartImageSubmitFree() {
  processStartImageSubmitCore(true);
}

/* -----------------------------------------------------
 * ⏱️ INTERVAL
 * --------------------------------------------------- */
setInterval(processStartImageSubmitPaid, 300_000);
setInterval(processStartImageSubmitFree, 60_000);
