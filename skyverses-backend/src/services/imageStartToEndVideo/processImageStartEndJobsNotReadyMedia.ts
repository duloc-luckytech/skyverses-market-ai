import { requestVideo } from "./request";
import { pollVideoUniversal } from "../../utils/pollVideoUniversal";

import requestUpsample1080p from "../../utils/requestUpsample1080p";
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import ImageBase64ForJobModel from "../../models/ImageBase64ForJobModel";
import { safeAxiosPost } from "../../utils/safeAxiosPost";
import { markChargedIfNeeded } from "../utils/markChargedIfNeeded";

const MAX_ERROR_RETRY = 3;
const MAX_CALLS_PER_BATCH = 1;

/* ================================================================
 *  🔥 WORKER CHUNG — xử lý FREE & PAID
 * ================================================================ */
export async function processImageStartEndJobsNotReadyMediaInternal(
  freeMode: boolean
) {
  const allJobs = await VideoJobModel.find({
    type: "start-end-image-redirect",
    freeCredit: freeMode,
    status: { $in: ["pending", "processing", "partial", "error"] }, // ⭐ NOW SUPPORTS PARTIAL & PROCESSING
  })
    .sort({ createdAt: 1 })
    .limit(100);

  if (!allJobs.length) return;

  /* ---------------- GROUP BY USER ---------------- */
  const groupedByUser = new Map<string, any[]>();
  for (const job of allJobs) {
    const uid = job.userId?.toString();
    if (!uid) continue;

    const arr = groupedByUser.get(uid) || [];
    arr.push(job);
    groupedByUser.set(uid, arr);
  }

  const users = await UserModel.find({
    _id: { $in: [...groupedByUser.keys()] },
  }).lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  /* ---------------- TOKEN AVAILABLE ---------------- */
  const IDLE_THRESHOLD = new Date(Date.now() - 2 * 60 * 1000);

  const tokens = await GoogleTokenModel.find({
    isActive: true,
    $expr: { $lt: ["$currentLoad", "$maxConcurrent"] },
  }).lean();

  if (!tokens.length) {
    console.log("⚠️ No usable Google token.");
    return;
  }

  tokens.sort((a, b) => {
    const aLast = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
    const bLast = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
    if (aLast !== bLast) return aLast - bLast;
    return (a.currentLoad || 0) - (b.currentLoad || 0);
  });

  const idleTokens = tokens.filter(
    (t) => !t.lastActiveAt || new Date(t.lastActiveAt) < IDLE_THRESHOLD
  );

  const eligibleJobs: {
    job: any;
    token: string;
    tokenId: string;
    email: string;
  }[] = [];

  /* ---------------- ASSIGN TOKEN ---------------- */
  for (const [userId, jobs] of groupedByUser.entries()) {
    const user: any = userMap.get(userId);
    if (!user) continue;

    for (const job of jobs) {
      let tokenDoc: any = null;

      // ưu tiên token chính
      if (user.googleId) {
        tokenDoc = tokens.find(
          (t) => t._id.toString() === user.googleId.toString()
        );
      }

      // fallback → idle token
      if (
        !tokenDoc ||
        (tokenDoc.currentLoad || 0) >= (tokenDoc.maxConcurrent || 1)
      ) {
        tokenDoc = idleTokens.sort(
          (a, b) => (a.currentLoad || 0) - (b.currentLoad || 0)
        )[0];
      }

      if (!tokenDoc?.accessToken) continue;

      eligibleJobs.push({
        job,
        token: tokenDoc.accessToken,
        tokenId: tokenDoc._id.toString(),
        email: tokenDoc.email,
      });
    }
  }

  if (!eligibleJobs.length) return;

  /* ---------------- EXECUTE BY TOKEN ---------------- */
  const batchMap = new Map<
    string,
    { token: string; tokenId: string; jobs: any[] }
  >();

  for (const item of eligibleJobs) {
    if (!batchMap.has(item.email)) {
      batchMap.set(item.email, {
        token: item.token,
        tokenId: item.tokenId,
        jobs: [],
      });
    }
    batchMap.get(item.email)!.jobs.push(item.job);
  }

  await Promise.allSettled(
    [...batchMap.entries()].map(async ([email, { token, tokenId, jobs }]) => {
      const limited = jobs.slice(0, MAX_CALLS_PER_BATCH);

      await GoogleTokenModel.findByIdAndUpdate(tokenId, {
        lastUsedAt: new Date(),
        lastActiveAt: new Date(),
      });

      await Promise.allSettled(
        limited.map((job) =>
          handleJob(job, token, email, tokenId, freeMode)
        )
      );

      await GoogleTokenModel.findByIdAndUpdate(tokenId, {
        lastActiveAt: new Date(),
      });
    })
  );
}

/* ================================================================
 * 🔥 HANDLER — TÁCH FLOW pending VS processing
 * ================================================================ */
async function handleJob(
  job: any,
  token: string,
  email: string,
  tokenId: string,
  freeMode: boolean
) {
  const jobId = job._id.toString();
  const { prompt, aspectRatio, resolution } = job;

  await markChargedIfNeeded(jobId, job.userId);

  await GoogleTokenModel.findByIdAndUpdate(tokenId, {
    $inc: { currentLoad: 1 },
    lastActiveAt: new Date(),
  });

  try {
    /* ============================
     * 1) FLOW PENDING → REQUESTVIDEO
     * ============================ */
    if (job.status === "pending") {
      let mediaIds = job.listIdImage || [];

      if (!mediaIds.length) {
        mediaIds = await findImageOwnerVideoByJob(
          jobId,
          token,
        );

        if (!mediaIds?.length) return;

        await VideoJobModel.findByIdAndUpdate(jobId, {
          listIdImage: mediaIds,
        });
      }

      const response: any = await requestVideo({
        prompt,
        quantity: job.quantity,
        startImageMediaId: mediaIds[0],
        endImageMediaId: mediaIds[1],
        token,
        freeCredit: freeMode,
        aspectRatio: aspectRatio || "VIDEO_ASPECT_RATIO_LANDSCAPE",
      });

      await VideoJobModel.findByIdAndUpdate(jobId, {
        listOperations: response,
        operationName: response[0]?.operation?.name,
        sentProcessAt: new Date(),
        status: "processing",
      });

      return; // ⭐ next round will poll
    }

    /* ============================
     * 2) FLOW PROCESSING / PARTIAL / ERROR → POLL
     * ============================ */
    const operations = job.listOperations;
    if (!operations?.length) return;

    const resPoll = await pollVideoUniversal({
      token,
      jobId,
      operations,
    });

    const completedList = resPoll.completed || [];
    const totalOps = operations.length;
    const doneCount = completedList.length;

    if (!doneCount) return;

    let fileUrl = completedList[0]?.fileUrl;
    const mediaGenId = completedList[0]?.mediaGenerationId;

    /* ------------ UPSAMPLE ------------ */
    if (resolution === "1080p" && mediaGenId && !job.didUpsample1080p) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        didUpsample1080p: true,
      });

      const up = await requestUpsample1080p({
        mediaGenId,
        sceneId: job.sceneId,
        token,
      });

      if (up?.fileUrl) fileUrl = up.fileUrl;
    }

    /* ========== FULL SUCCESS ========== */
    if (doneCount === totalOps) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "done",
        results: resPoll,
        fileUrl,
        progress: 100,
        completedAt: new Date(),
      });
      return;
    }

    /* ========== PARTIAL ========== */
    if (doneCount > 0 && doneCount < totalOps) {
      const progress = Math.floor((doneCount / totalOps) * 100);

      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "partial",
        results: resPoll,
        fileUrl,
        progress,
      });
      return;
    }

    throw new Error(resPoll.failed?.[0]?.reason || "UNKNOWN");
  } catch (err: any) {
    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "error",
      $inc: { errorCount: 1 },
      errorMessage: err.message,
    });
  } finally {
    await GoogleTokenModel.findByIdAndUpdate(tokenId, {
      $inc: { currentLoad: -1 },
      lastActiveAt: new Date(),
    });
  }
}

/* ================================================================
 * 🔥 Upload ảnh start + end
 * ================================================================ */
export async function findImageOwnerVideoByJob(
  jobId: string,
  token: string
): Promise<string[] | undefined> {
  const record: any = await ImageBase64ForJobModel.findOne({ jobId });
  if (!record) return;

  const uploadImage = async (base64: string) => {
    try {
      const payload = {
        clientContext: { sessionId: `${Date.now()}`, tool: "ASSET_MANAGER" },
        imageInput: {
          aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE",
          isUserUploaded: true,
          mimeType: "image/jpeg",
          rawImageBytes: base64,
        },
      };

      const res = await safeAxiosPost(
        "https://aisandbox-pa.googleapis.com/v1:uploadUserImage",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 60_000,
        }
      );

      return res.data?.mediaGenerationId?.mediaGenerationId;
    } catch {
      return undefined;
    }
  };

  const [startId, endId] = await Promise.all([
    uploadImage(record.base64),
    uploadImage(record.endBase64),
  ]);

  const list = [startId, endId].filter(Boolean) as string[];
  return list.length >= 2 ? list : [];
}

/* ================================================================
 *  SCHEDULE WORKERS
 * ================================================================ */
export function processStartEndJobsFree() {
  return processImageStartEndJobsNotReadyMediaInternal(true);
}

export function processStartEndJobsPaid() {
  return processImageStartEndJobsNotReadyMediaInternal(false);
}

setInterval(processStartEndJobsFree, 60_000);
setInterval(processStartEndJobsPaid, 40_000);