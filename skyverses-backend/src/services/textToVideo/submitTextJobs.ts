// submitTextJobs.ts — PRIORITY WORKER (Paid: 30s, Free: 60s)

import { predictLabsBatchVideo } from "./predictLabs";
import { requestWanTextToVideo } from "../ai/wan/requestWanTextToVideo";
import { requestGommoVideo } from "../ai/gommo/requestGommoVideo";

import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import ProviderTokenModel from "../../models/ProviderToken.model";

import { PLAN_LIMITS } from "../../constanst/index";
import { markChargedIfNeeded } from "../utils/markChargedIfNeeded";
import { getCaptchaToken } from "../../utils/getCaptchaToken";

const LABS_PROJECT_ID = process.env.VEO_LABS_PROJECT_ID || "labs";

/* -------------------------------------------------------
   🔢 MAX JOB PER USER
--------------------------------------------------------- */
const getBatchLimit = (plan: string): number => PLAN_LIMITS[plan] ?? 2;

/* -------------------------------------------------------
   🔀 SHUFFLE ARRAY
--------------------------------------------------------- */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* -------------------------------------------------------
   🔵 LABS TOKEN CONCURRENCY
--------------------------------------------------------- */
const tokenRunning = new Map<string, number>();
const TOKEN_MAX = 4;

/* -------------------------------------------------------
   🟣 PICK WAN TOKEN
--------------------------------------------------------- */
function pickWanToken(tokens: any[]) {
  const available = tokens.filter(
    (t) => !t.cooldownUntil || t.cooldownUntil < new Date()
  );
  return available[Math.floor(Math.random() * available.length)];
}

/* -------------------------------------------------------
   🟢 PICK GOMMO TOKEN
--------------------------------------------------------- */
function pickGommoToken(tokens: any[]) {
  const available = tokens.filter(
    (t) => !t.cooldownUntil || t.cooldownUntil < new Date()
  );
  return available[Math.floor(Math.random() * available.length)];
}

/* =======================================================
   🚀 SUBMIT LABS + WAN (NO GOMMO)
======================================================= */
async function submitLabsOrWanJob({
  job,
  labsToken,
}: {
  job: any;
  labsToken?: any;
}) {
  try {
    /* ================= WAN ================= */
    if (job.model === "wan") {
      const wanTokens = await ProviderTokenModel.find({
        provider: "wan",
        isActive: true,
      });

      const token = pickWanToken(wanTokens);
      if (!token?.apiKey) return;

      const result = await requestWanTextToVideo({
        prompt: job.prompt,
        token: token.apiKey,
        duration: job.duration || 5,
        size: job.size || "1280*720",
        audio: job.generateAudio === true,
        shotType: job.shotType || "multi",
        audioUrl: job.audioUrl,
      });

      await ProviderTokenModel.findByIdAndUpdate(token._id, {
        lastActiveAt: new Date(),
      });

      await VideoJobModel.findByIdAndUpdate(job._id, {
        provider: "wan",
        status: "processing",
        taskId: result.taskId,
        sentProcessAt: new Date(),
        charged: true,
      });

      return;
    }

    /* ================= LABS ================= */
    const result: any = await predictLabsBatchVideo({
      prompt: job.prompt,
      quantity: job.quantity,
      token: labsToken.accessToken,
      recaptchaToken: job.recaptchaToken,
      freeCredit: job.freeCredit,
      projectId: LABS_PROJECT_ID,
      aspectRatio: job.aspectRatio,
    });

    await ProviderTokenModel.findByIdAndUpdate(labsToken._id, {
      lastActiveAt: new Date(),
    });

    await VideoJobModel.findByIdAndUpdate(job._id, {
      provider: "labs",
      status: "processing",
      operationName: result[0]?.operation?.name,
      sceneId: result[0]?.sceneId,
      listOperations: result,
      sentProcessAt: new Date(),
      charged: true,
    });
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || "";

    await VideoJobModel.findByIdAndUpdate(job._id, {
      status: "error",
      errorMessage: msg,
      $inc: { errorCount: 1 },
    });

    // refund chỉ cho LABS
    if (job.model !== "wan" && job.freeCredit === false) {
      const refund = job.resolution === "1080p" ? 2 : 1;
      await UserModel.findByIdAndUpdate(job.userId, {
        $inc: { videoUsed: -refund },
      });
    }
  }
}

/* =======================================================
   🟢 SUBMIT GOMMO (ISOLATED)
======================================================= */
async function submitGommoJob(job: any) {
  try {
    const tokens = await ProviderTokenModel.find({
      provider: "gommo",
      isActive: true,
    });
    console.log("tokens>>", tokens);
    const token = pickGommoToken(tokens);
    if (!token?.apiKey) return;

    await markChargedIfNeeded(job._id, job.userId);

    const result = await requestGommoVideo({
      accessToken: token.apiKey,
      prompt: job.prompt,
      model: job.gommoModel || "veo_3_1",
      privacy: "PRIVATE",
      translateToEn: true,
      projectId: job.projectName || "default",
      ratio:
        job.aspectRatio === "VIDEO_ASPECT_RATIO_PORTRAIT" ? "9:16" : "16:9",
      resolution: job.resolution || "720p",
      duration: job.duration || 6,
      mode: job.freeCredit ? "slow" : "fast",
      images: job.images || [],
    });

    await ProviderTokenModel.findByIdAndUpdate(token._id, {
      lastActiveAt: new Date(),
    });

    await VideoJobModel.findByIdAndUpdate(job._id, {
      status: "processing",
      taskId: result.taskId,
      sentProcessAt: new Date(),
      charged: true,
    });
  } catch (err: any) {
    await VideoJobModel.findByIdAndUpdate(job._id, {
      status: "error",
      errorMessage: err?.message || "gommo error",
      $inc: { errorCount: 1 },
    });
  }
}

/* =======================================================
   LOAD JOBS
======================================================= */
async function loadLabsJobs(freeCredit: boolean, limit: number) {
  return VideoJobModel.find({
    type: "text",
    status: "pending",
    freeCredit,
    source: { $ne: "gommo" }, // 🚫 loại gommo
  })
    .sort({ createdAt: 1 })
    .limit(limit);
}

async function loadGommoJobs(limit: number) {
  return VideoJobModel.find({
    type: "text",
    status: "pending",
    source: "gommo",
  })
    .sort({ createdAt: 1 })
    .limit(limit);
}

/* =======================================================
   🔵 LABS + WAN WORKER
======================================================= */
async function runLabsWorker(jobs: any[]) {
  if (!jobs.length) return;

  const grouped = new Map<string, any[]>();
  for (const job of jobs) {
    const uid = String(job.userId);
    grouped.set(uid, [...(grouped.get(uid) || []), job]);
  }

  const users = await UserModel.find({ _id: [...grouped.keys()] });
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  let labsTokens = await ProviderTokenModel.find({
    provider: "labs",
    isActive: true,
  });

  labsTokens = shuffle(labsTokens);

  const tasks: any[] = [];

  for (const [userId, jobs] of grouped.entries()) {
    const user = userMap.get(userId);
    if (!user) continue;

    const batchLimit = getBatchLimit(user.plan);
    const selectedJobs = jobs.slice(0, batchLimit);

    for (const job of selectedJobs) {
      if (job.model === "wan") {
        tasks.push({ job });
        await markChargedIfNeeded(job._id, job.userId);
        continue;
      }

      const token = labsTokens.find(
        (t) => (tokenRunning.get(String(t._id)) || 0) < TOKEN_MAX
      );
      if (!token) continue;

      const captcha = await getCaptchaToken(job._id);
      if (!captcha) continue;

      tokenRunning.set(
        String(token._id),
        (tokenRunning.get(String(token._id)) || 0) + 1
      );

      tasks.push({
        job: { ...job.toObject(), recaptchaToken: captcha.tokenCaptcha },
        labsToken: token,
      });

      await markChargedIfNeeded(job._id, job.userId);
    }
  }

  await Promise.allSettled(tasks.map((t) => submitLabsOrWanJob(t)));

  for (const t of tasks) {
    if (t.labsToken) {
      tokenRunning.set(
        String(t.labsToken._id),
        Math.max(0, (tokenRunning.get(String(t.labsToken._id)) || 1) - 1)
      );
    }
  }
}

/* =======================================================
   🟢 GOMMO WORKER (SEPARATE PIPE)
======================================================= */
async function runGommoWorker() {
  const jobs: any = await loadGommoJobs(100);
  if (!jobs.length) return;

  const users = await UserModel.find({
    _id: [...new Set(jobs.map((j) => j.userId))],
  });
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const runningByUser = new Map<string, number>();

  for (const job of jobs) {
    const uid = String(job.userId);
    const user = userMap.get(uid);
    if (!user) continue;

    const limit = getBatchLimit(user.plan);
    const running = runningByUser.get(uid) || 0;
    if (running >= limit) continue;

    runningByUser.set(uid, running + 1);

    submitGommoJob(job).finally(() => {
      runningByUser.set(uid, (runningByUser.get(uid) || 1) - 1);
    });
  }
}

/* =======================================================
   ⏱️ INTERVAL
======================================================= */
export async function submitPaidJobs() {
  const jobs = await loadLabsJobs(false, 200);
  return runLabsWorker(jobs);
}

export async function submitFreeJobs() {
  const jobs = await loadLabsJobs(true, 50);
  return runLabsWorker(jobs);
}

setInterval(submitPaidJobs, 30000);
setInterval(submitFreeJobs, 60000);
setInterval(runGommoWorker, 15000);
