// cron/multi/multiSubmit.ts
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import axios from "axios";

import { predictLabsBatchVideo } from "./predictLabs";
import { createScene } from "../../utils/labsSceneUtils";
import { markChargedIfNeeded } from "../utils/markChargedIfNeeded";
import { getCaptchaToken } from "../../utils/getCaptchaToken";
import CaptchaToken from "../../models/CaptchaToken.model";

const MAX_ERROR_RETRY = 5;
const MAX_PARALLEL_PER_USER = 3;
const MAX_PARALLEL_GLOBAL = 15;

export async function multiSubmit() {
  /* ---------------------------------------------------------
   * 1. Unlock stuck jobs (submitting > 20s)
   -------------------------------------------------------- */
  await VideoJobModel.updateMany(
    {
      status: "submitting",
      updatedAt: { $lte: new Date(Date.now() - 20_000) },
    },
    { status: "queued" }
  );

  /* ---------------------------------------------------------
   * 2. Pick candidate jobs
   -------------------------------------------------------- */
  const rawJobs = await VideoJobModel.find({
    type: { $in: ["multi-scene-initial", "multi-scene-extend"] },
    status: { $in: ["queued"] },
  })
    .sort({ createdAt: 1 })
    .limit(300)
    .lean();

  if (!rawJobs.length) return;

  const readyJobs: any[] = [];

  // scene extend phải đợi scene trước DONE
  for (const job of rawJobs) {
    if (job.sceneIndex === 0) {
      readyJobs.push(job);
      continue;
    }

    const prev = await VideoJobModel.findById(job.previousJobId).lean();
    if (prev && prev.status === "done" && prev.mediaVideoId) {
      readyJobs.push(job);
    }
  }

  if (!readyJobs.length) return;

  /* ---------------------------------------------------------
   * 3. Group by user
   -------------------------------------------------------- */
  const grouped = new Map<string, any[]>();

  for (const j of readyJobs) {
    const uid = j.userId.toString();
    if (!grouped.has(uid)) grouped.set(uid, []);
    grouped.get(uid)!.push(j);
  }

  const users = await UserModel.find({ _id: { $in: [...grouped.keys()] } });
  const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

  /* ---------------------------------------------------------
   * 4. Parallel submit with global throttle
   -------------------------------------------------------- */
  let running = 0;

  await Promise.allSettled(
    [...grouped.entries()].map(async ([userId, list]) => {
      const user = userMap.get(userId);
      if (!user || !user.googleId) return;

      const tokenDoc = await GoogleTokenModel.findById(user.googleId).lean();
      if (!tokenDoc?.accessToken) return;

      const limited = list.slice(0, MAX_PARALLEL_PER_USER);

      for (const job of limited) {
        if (running >= MAX_PARALLEL_GLOBAL) break;

        running++;
        handleSubmitMulti(job).finally(() => {
          running--;
        });
      }
    })
  );
}

/* -----------------------------------------------------
 * HANDLE ONE MULTI-SCENE JOB (WITH CAPTCHA)
 * --------------------------------------------------- */
async function handleSubmitMulti(job: any) {
  const jobId = job._id.toString();

  try {
    /* ---------------- LOCK JOB ---------------- */
    const locked = await VideoJobModel.findOneAndUpdate(
      { _id: jobId, status: { $in: ["queued"] } },
      { status: "submitting", updatedAt: new Date(), operationName: null },
      { new: true }
    );

    if (!locked) return;

    if (locked.status === "error" && locked.errorCount >= MAX_ERROR_RETRY) {
      await VideoJobModel.findByIdAndUpdate(jobId, { status: "reject" });
      return;
    }

    /* --------------------------------------------------
     * 🔐 GET CAPTCHA ≤ 2 MIN (ATOMIC)
     * ------------------------------------------------ */
    const captcha = await getCaptchaToken(jobId);
    if (!captcha) {
      // ❗ Không có captcha → trả job về queued
      await VideoJobModel.findByIdAndUpdate(jobId, { status: "queued" });
      return;
    }

    /* ---------------- CHARGE USER ---------------- */
    await markChargedIfNeeded(jobId, job.userId);

    /* ---------------- GET TOKEN ---------------- */
    let tokenDoc: any;

    if (job.sceneIndex === 0) {
      const user = await UserModel.findById(job.userId);
      if (!user) throw new Error("User not found for scene0");
      tokenDoc = await GoogleTokenModel.findById(user.googleId).lean();
      if (!tokenDoc?.accessToken) throw new Error("Missing token for scene0");

      await VideoJobModel.findByIdAndUpdate(jobId, {
        sentTokenId: tokenDoc._id.toString(),
        sentByEmail: tokenDoc.email,
      });
    } else {
      const root = await VideoJobModel.findOne({
        groupName: job.groupName,
        sceneIndex: 0,
      }).lean();

      if (!root?.sentTokenId) throw new Error("Missing root token info");

      tokenDoc = await GoogleTokenModel.findById(root.sentTokenId).lean();
      if (!tokenDoc?.accessToken) throw new Error("Token from scene0 missing");
    }

    const token = tokenDoc.accessToken;
    const email = tokenDoc.email;
    const projectId = tokenDoc.projectId;
    const cookieToken = tokenDoc.cookieToken;

    /* ------------------------------------------------------
     * CASE A — SCENE 0
     * ---------------------------------------------------- */
    if (job.sceneIndex === 0) {
      console.log(`🎬 [MULTI] Scene0 submit → ${jobId}`);

      const ops = await predictLabsBatchVideo({
        token,
        projectId,
        prompt: job.prompt,
        aspectRatio: job.aspectRatio,
        recaptchaToken: captcha.tokenCaptcha, // ✅ CAPTCHA
      });

      const op = ops[0];
      if (!op?.operation?.name) throw new Error("Empty operation from labs");

      await new Promise((r) => setTimeout(r, 3000));

      await VideoJobModel.findByIdAndUpdate(jobId, {
        operationName: op.operation.name,
        listOperations: ops,
        sceneId: op.sceneId,
        sentByEmail: email,
        sentProcessAt: new Date(),
        status: "processing",
      });

      return;
    }

    /* ------------------------------------------------------
     * CASE B — SCENE EXTEND
     * ---------------------------------------------------- */
    const prev = await VideoJobModel.findById(job.previousJobId).lean();
    if (!prev || prev.status !== "done" || !prev.mediaVideoId)
      throw new Error("Prev scene not ready");

    console.log(`🎬 [MULTI] Extend Scene ${job.sceneIndex} → ${jobId}`);

    const sceneInfo = await createScene({
      token,
      email,
      projectId,
      cookieToken,
      jobId,
      mediaGenId: prev.mediaVideoId,
      startTime: job.startTime || "0s",
      endTime: job.endTime || "7s",
    } as any);

    const videoModelKey =
      job.aspectRatio === "VIDEO_ASPECT_RATIO_PORTRAIT"
        ? "veo_3_1_extend_fast_portrait_ultra"
        : "veo_3_1_extend_fast_landscape_ultra";

    const captchaExtend = await getCaptchaToken(jobId);
    console.log("captchaExtend >>>>", captchaExtend);
    if (!captchaExtend) {
      return;
    }
    const res = await axios.post(
      "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoExtendVideo",
      {
        clientContext: {
          projectId,
          recaptchaToken: captchaExtend.tokenCaptcha,
          tool: "PINHOLE",
          userPaygateTier: "PAYGATE_TIER_TWO",
        },
        requests: [
          {
            textInput: { prompt: job.prompt },
            videoInput: {
              mediaId: sceneInfo.clipId,
              startFrameIndex: sceneInfo.startFrame,
              endFrameIndex: sceneInfo.endFrame,
            },
            videoModelKey,
            aspectRatio: job.aspectRatio,
            metadata: { sceneId: sceneInfo.sceneId },
          },
        ],
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const opName = res.data?.operations?.[0]?.operation?.name;
    if (!opName) throw new Error("Extend returned empty operation");

    await new Promise((r) => setTimeout(r, 3000));

    await VideoJobModel.findByIdAndUpdate(jobId, {
      clipId: sceneInfo.clipId,
      listOperations: [
        {
          operation: { name: opName },
          sceneId: res.data?.operations?.[0].sceneId,
          status: res.data?.operations?.[0].status,
        },
      ],
      sceneId: sceneInfo.sceneId,
      startFrame: sceneInfo.startFrame,
      endFrame: sceneInfo.endFrame,
      operationName: opName,
      sentByEmail: email,
      sentProcessAt: new Date(),
      status: "processing",
    });


    console.log(`⚡ [MULTI] Submitted extend → ${jobId}`);
  } catch (err: any) {
    console.error(`❌ multiSubmit error (${jobId}):`, err.message);

    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "error",
      errorMessage: err.message,
      $inc: { errorCount: 1 },
    });
  }
}

setInterval(multiSubmit, 45_000);
