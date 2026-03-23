import { generateVideoFromStartImage } from "./request";
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import ImageBase64ForJobModel from "../../models/ImageBase64ForJobModel";
import axios from "axios";
import { PLAN_LIMITS } from "../../constanst/index";
import { markChargedIfNeeded } from "../utils/markChargedIfNeeded";

const MAX_ERROR_RETRY = 5;
const MAX_CALLS_PER_BATCH = 3;

/* ============================================================
   🧩 Upload image helper
============================================================ */
async function uploadImageForJob(
  record: any,
  token: string,
  email: string,
  userId?: string,
  jobId?: string
) {
  try {
    const payload = {
      clientContext: { sessionId: `${Date.now()}`, tool: "ASSET_MANAGER" },
      imageInput: {
        aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE",
        isUserUploaded: true,
        mimeType: "image/jpeg",
        rawImageBytes: record.base64,
      },
    };

    const res = await axios.post(
      "https://aisandbox-pa.googleapis.com/v1:uploadUserImage",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 90_000,
      }
    );

    const mediaId =
      res.data?.mediaGenerationId?.mediaGenerationId ||
      res.data?.mediaId ||
      res.data?.mediaGenerationId;

    return mediaId;
  } catch (err) {
    const message = err?.response?.data
      ? JSON.stringify(err.response.data, null, 2)
      : err.message || "Unknown error";

    // Nếu lỗi auth → khóa token lại
    if (message.includes("UNAUTHENTICATED") && email) {
      await GoogleTokenModel.updateOne(
        { email: email },
        { isActive: false, note: "auth error (poll job)" }
      );

      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "reject",
        errorReason: "UNAUTHENTICATED",
        errorMessage: "UNAUTHENTICATED",
        completedAt: new Date(),
      });
      console.warn(`🔴 Token disabled for email: ${email}`);
    }

    await ImageBase64ForJobModel.deleteOne({ jobId });
  }
  return undefined;
}

/* ============================================================
   🔥 CORE: xử lý submit jobs (tách theo freeCredit)
============================================================ */
async function submitStartImageJobsCore(isFree: boolean) {
  const jobs = await VideoJobModel.find({
    type: "start-image-redirect",
    freeCredit: isFree,
    $or: [{ status: "pending" }, { status: "error" }],
    operationName: { $exists: false },
  })
    .sort({ createdAt: 1 })
    .limit(100);

  if (!jobs.length) return;

  const grouped = new Map<string, any[]>();
  for (const job of jobs) {
    if (!job.userId) continue;
    const arr = grouped.get(job.userId.toString()) || [];
    arr.push(job);
    grouped.set(job.userId.toString(), arr);
  }

  const users = await UserModel.find({
    _id: { $in: [...grouped.keys()] },
  }).lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  for (const [userId, list] of grouped.entries()) {
    const user = userMap.get(userId);

    if (!user) continue;

    const mainToken = await GoogleTokenModel.findOne({
      _id: user.googleId,
      isActive: true,
    }).lean();

    if (!mainToken?.accessToken) continue;

    const extraTokens = await GoogleTokenModel.find({
      isActive: true,
      email: { $ne: mainToken.email },
      $expr: { $lt: ["$currentLoad", "$maxConcurrent"] },
    })
      .sort({ currentLoad: 1, lastActiveAt: 1 })
      .limit(MAX_CALLS_PER_BATCH - 1)
      .lean();

    const tokens = [mainToken, ...extraTokens];

    const jobsToSend = list.slice(0, tokens.length);

    await Promise.all(
      jobsToSend.map(async (job, index) => {
        const tokenDoc = tokens[index];

        if (!tokenDoc?.accessToken) return;

        const token = tokenDoc.accessToken;
        const email = tokenDoc.email;

        await GoogleTokenModel.findByIdAndUpdate(tokenDoc._id, {
          $inc: { currentLoad: 1 },
          lastActiveAt: new Date(),
        });

        try {
          await handleSubmit(job, userId, token, email);
        } finally {
          await GoogleTokenModel.findByIdAndUpdate(tokenDoc._id, {
            $inc: { currentLoad: -1 },
            lastActiveAt: new Date(),
          });
        }
      })
    );
  }
}

/* ============================================================
   🔹 Submit từng job
============================================================ */
async function handleSubmit(
  job: any,
  userId: string,
  token: string,
  email: string
) {
  const jobId = job._id.toString();

  try {
    if (job.status === "error" && job.errorCount >= MAX_ERROR_RETRY) {
      await VideoJobModel.findByIdAndUpdate(jobId, { status: "reject" });

      if (!job.freeCredit) {
        const refund = job.resolution === "1080p" ? 2 : 1;
        await UserModel.findByIdAndUpdate(job.userId, {
          $inc: { videoUsed: -refund },
        });
      }

      return;
    }

    await markChargedIfNeeded(jobId, userId);

    let mediaId = job.listIdImage?.[0];

    if (!mediaId) {
      const record = await ImageBase64ForJobModel.findOne({ jobId });
      if (!record) return;

      mediaId = await uploadImageForJob(record, token, email, userId, jobId);
      if (!mediaId) return;

      await VideoJobModel.findByIdAndUpdate(jobId, { listIdImage: [mediaId] });
    }

    const response = await generateVideoFromStartImage({
      prompt: job.prompt,
      startImageMediaId: mediaId,
      quantity: job.quantity,
      token,
      freeCredit: job.freeCredit,
      aspectRatio: job.aspectRatio || "VIDEO_ASPECT_RATIO_LANDSCAPE",
    });

    const { operation, sceneId } = response[0];

    await VideoJobModel.findByIdAndUpdate(jobId, {
      operationName: operation.name,
      sceneId,
      status: "pending",
      sentProcessAt: new Date(),
      sentByEmail: email,
      listOperations: response,
    });
  } catch (err) {}
}

/* ============================================================
   ⏱️ Interval tách riêng free / paid
============================================================ */

// ⭐ Trả phí → chạy nhanh hơn
setInterval(() => submitStartImageJobsCore(false), 25_000);

// ⭐ Miễn phí → chạy chậm hơn
setInterval(() => submitStartImageJobsCore(true), 30_000);
