// workers/startEndImageWorker.ts
// FULL SUBMIT + POLL WORKER (FINAL VERSION + CAPTCHA)

import { requestVideo } from "./request";
import { pollVideoUniversal } from "../../utils/pollVideoUniversal";
import requestUpsample1080p from "../../utils/requestUpsample1080p";
//
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import ImageOwnerModel from "../../models/ImageOwnerModel";

import { PLAN_LIMITS } from "../../constanst/index";
import { markChargedIfNeeded } from "../utils/markChargedIfNeeded";
import { getCaptchaToken } from "../../utils/getCaptchaToken";
import { requestGommoVideo } from "../../services/ai/gommo/requestGommoVideo";
import { pollGommoTask } from "../../services/ai/gommo/pollGommoTask";

import ProviderTokenModel from "../../models/ProviderToken.model";

interface StartEndJob {
  _id: any;
  source?: string;
  taskId?: string;
  sentByEmail?: string;
  resolution?: string;
  freeCredit?: boolean;
  userId?: any;
}

const MAX_ERROR_RETRY = 10;
const MAX_CALLS_PER_BATCH = 1;
const MIN_INTERVAL_MS = 30_000;

let lastGoogleSubmit = 0;

/* ======================================================================
 * 🔥 1) SUBMIT WORKER — chỉ submit job chưa có operationName
 * ====================================================================== */
async function submitStartEndJobs(freeMode: boolean) {
  const now = Date.now();
  if (now - lastGoogleSubmit < MIN_INTERVAL_MS) return;

  const jobs = await VideoJobModel.find({
    type: "start-end-image",
    freeCredit: freeMode,
    status: { $in: ["pending"] },
  })
    .sort({ createdAt: 1 })
    .limit(50);

  if (!jobs.length) return;

  /* ---------------- GROUP BY USER ---------------- */
  const grouped = new Map<string, any[]>();
  for (const j of jobs) {
    const id = j.userId?.toString();
    if (!id) continue;
    const list = grouped.get(id) || [];
    list.push(j);
    grouped.set(id, list);
  }

  const userIds = [...grouped.keys()];
  const userDocs = await UserModel.find({ _id: { $in: userIds } }).lean();
  const userMap = new Map(userDocs.map((u) => [u._id.toString(), u]));

  const eligible: any[] = [];

  for (const [uid, list] of grouped.entries()) {
    const user = userMap.get(uid);
    if (!user) continue;

    const limit = PLAN_LIMITS[user.plan || "free"] ?? 1;
    const cutoff = new Date(Date.now() - 30 * 1000);

    const recent = await VideoJobModel.countDocuments({
      userId: uid,
      type: "start-end-image",
      freeCredit: freeMode,
      sentProcessAt: { $gte: cutoff },
    });

    if (recent < limit) {
      eligible.push(...list.slice(0, limit - recent));
    }
  }

  const batch = eligible
    .sort((a, b) => +a.createdAt - +b.createdAt)
    .slice(0, MAX_CALLS_PER_BATCH);

  if (!batch.length) return;

  lastGoogleSubmit = now;

  await Promise.all(
    batch.map(async (job) => {
      const jobId = job._id.toString();
  
      try {
        const user = await UserModel.findById(job.userId).lean();
        if (!user) return;
  
        // =======================
        // 🟢 GOMMO (NO CAPTCHA)
        // =======================
        if (job.source === "gommo") {
          await submitGommoStartEndJob(job, user);
          return;
        }
  
        // =======================
        // 🔵 GOOGLE (GIỮ NGUYÊN)
        // =======================
        const captcha = await getCaptchaToken(jobId);
        if (!captcha) return;
  
        await submitGoogleStartEndJob(job, user, captcha);
  
      } catch (err: any) {
        await VideoJobModel.findByIdAndUpdate(job._id, {
          status: "error",
          $inc: { errorCount: 1 },
          errorMessage: err?.message,
        });
      }
    })
  );
}

async function submitGommoStartEndJob(job: any, user: any) {
  const jobId = job._id.toString();

  if (!Array.isArray(job.images) || job.images.length < 2) {
    throw new Error("GOMMO_IMAGES_INVALID");
  }

  const gommoToken = await ProviderTokenModel.findOne({
    provider: "gommo",
    isActive: true,
  }).lean();

  if (!gommoToken?.apiKey) {
    throw new Error("GOMMO_TOKEN_NOT_AVAILABLE");
  }

  // 💳 charge 1 lần
  await markChargedIfNeeded(jobId, user._id);

  const result = await requestGommoVideo({
    accessToken: gommoToken.apiKey,
    prompt: job.prompt,
    model: job.model || "veo_3_1",
    ratio:
      job.aspectRatio === "VIDEO_ASPECT_RATIO_PORTRAIT" ? "9:16" : "16:9",
    resolution: job.resolution || "720p",
    duration: job.duration || 8,
    mode: job.mode || "relaxed",
    images: job.images,
  });

  await VideoJobModel.findByIdAndUpdate(jobId, {
    provider: "gommo",
    source: "gommo",
    status: "processing",
    taskId: result.taskId, // id_base
    sentProcessAt: new Date(),
  });
}

async function submitGoogleStartEndJob(job: any, user: any, captcha: any) {
  const jobId = job._id.toString();

  let tokenDoc: any = null;

  const owner = await ImageOwnerModel.findOne({
    mediaId: job.listIdImage[0],
  }).lean();

  if (owner?.googleEmail) {
    tokenDoc = await GoogleTokenModel.findOne({
      email: owner.googleEmail,
      isActive: true,
    }).lean();
  }

  if (!tokenDoc) {
    tokenDoc = await GoogleTokenModel.findOne({
      _id: user.googleId,
      isActive: true,
    }).lean();
  }

  if (!tokenDoc) return;

  const token = tokenDoc.accessToken;
  const email = tokenDoc.email;

  await markChargedIfNeeded(jobId, user._id);

  const res: any = await requestVideo({
    prompt: job.prompt,
    quantity: job.quantity,
    startImageMediaId: job.listIdImage[0],
    endImageMediaId: job.listIdImage[1],
    token,
    freeCredit: job.freeCredit,
    aspectRatio: job.aspectRatio,
    recaptchaToken: captcha.tokenCaptcha,
  });

  const op = res[0]?.operation;
  const sceneId = res[0]?.sceneId;

  await VideoJobModel.findByIdAndUpdate(jobId, {
    provider: "labs",
    source: "labs",
    operationName: op?.name,
    listOperations: res,
    sceneId,
    status: "processing",
    sentProcessAt: new Date(),
    sentByEmail: email,
  });
}


/* ======================================================================
 * 🔥 2) POLL WORKER — PARTIAL + DONE
 * ====================================================================== */
async function pollStartEndJobs() {
  const jobs = (await VideoJobModel.find({
    type: "start-end-image",
    status: "processing",
  })
    .sort({ updatedAt: 1 })
    .limit(100)
    .lean()) as StartEndJob[];

  if (!jobs.length) return;

  /* ============================
   * 🟢 1. GOMMO JOBS (NO GROUP)
   * ============================ */
  const gommoJobs = jobs.filter((j) => j.source === "gommo");

  for (const job of gommoJobs) {
    await pollOneGommoJob(job);
  }

  /* ============================
   * 🔵 2. GOOGLE JOBS (GROUPED)
   * ============================ */
  const googleJobs = jobs.filter(
    (j) => j.source !== "gommo" && j.sentByEmail
  );

  const groups = new Map<string, any[]>();
  for (const job of googleJobs) {
    const arr = groups.get(job.sentByEmail) || [];
    arr.push(job);
    groups.set(job.sentByEmail, arr);
  }

  for (const [email, list] of groups.entries()) {
    const tokenDoc = await GoogleTokenModel.findOne({
      email,
      isActive: true,
    }).lean();

    if (!tokenDoc?.accessToken) continue;

    const token = tokenDoc.accessToken;

    for (const job of list) {
      await pollOneJob(job, token);
    }
  }
}

async function pollOneGommoJob(job: any) {
  const jobId = job._id.toString();

  // 🔑 Lấy token Gommo
  const gommoToken = await ProviderTokenModel.findOne({
    provider: "gommo",
    isActive: true,
  }).lean();

  if (!gommoToken?.apiKey) {
    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "reject",
      errorReason: "GOMMO_TOKEN_NOT_AVAILABLE",
    });
    return;
  }

  const result = await pollGommoTask(
    job.taskId,           // id_base
    gommoToken.apiKey,
    jobId
  );

  /* ================= FAILED ================= */
  if (result.status === "MEDIA_GENERATION_STATUS_FAILED") {
    // pollGommoTask đã update DB rồi
    return;
  }

  /* ================= SUCCESS ================= */
  if (result.status === "MEDIA_GENERATION_STATUS_SUCCESSFUL") {
    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "done",
      fileUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      progress: 100,
      completedAt: new Date(),
      results: result.raw,
    });

    console.log(`🎉 DONE GOMMO job ${jobId}`);
    return;
  }

  /* ================= IN PROGRESS ================= */
  await VideoJobModel.findByIdAndUpdate(jobId, {
    status: "processing",
    progress: 50, // hoặc dynamic nếu muốn
    updatedAt: new Date(),
  });
}

async function pollOneJob(job: any, token: string) {
  const jobId = job._id.toString();

  try {
    const resPoll = await pollVideoUniversal({
      token,
      jobId,
      operations: job.listOperations,
    });

    const totalOps = job.listOperations.length;
    const doneOps = resPoll.completed?.length ?? 0;
    if (doneOps === 0) return;

    let fileUrl = resPoll.completed[0].fileUrl;
    const mediaGenId = resPoll.completed[0].mediaGenerationId;

    // ⭐ UPSAMPLE 1080p
    if (job.resolution === "1080p" && mediaGenId && !job.didUpsample1080p) {
      await job.updateOne({ didUpsample1080p: true });
      try {
        const up = await requestUpsample1080p({
          mediaGenId,
          sceneId: job.sceneId,
          token,
        });
        if (up?.fileUrl) fileUrl = up.fileUrl;
      } catch {}
    }

    // ⭐ DONE
    if (doneOps === totalOps) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "done",
        fileUrl,
        results: resPoll,
        progress: 100,
        completedAt: new Date(),
      });
      return;
    }

    // ⭐ PARTIAL
    if (doneOps < totalOps) {
      const progress = Math.floor((doneOps / totalOps) * 100);
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "partial",
        fileUrl,
        progress,
        results: resPoll,
        updatedAt: new Date(),
      });
    }
  } catch (err: any) {
    if (err?.message?.includes("UNAUTHENTICATED")) {
      await GoogleTokenModel.updateOne(
        { email: job.sentByEmail },
        { isActive: false, note: "TOKEN_INVALID" }
      );

      const refund = job.resolution === "1080p" ? 2 : 1;

      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "reject",
        refunded: !job.freeCredit,
        refundedAt: new Date(),
        errorReason: "TOKEN_INVALID",
      });

      if (!job.freeCredit) {
        await UserModel.findByIdAndUpdate(job.userId, {
          $inc: { videoUsed: -refund },
        });
      }
      return;
    }

    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "error",
      $inc: { errorCount: 1 },
      errorMessage: err?.message,
    });
  }
}

/* ======================================================================
 * ⏱️ SCHEDULERS
 * ====================================================================== */

setInterval(() => submitStartEndJobs(false), 30000); // PAID
setInterval(() => submitStartEndJobs(true), 60000); // FREE
setInterval(pollStartEndJobs, 20_000);

export {};
