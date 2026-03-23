import { requestVideo } from "./request";
import { safeAxiosPost } from "../../utils/safeAxiosPost";
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import ImageBase64ForJobModel from "../../models/ImageBase64ForJobModel";
import { PLAN_LIMITS } from "../../constanst/index";
import { markChargedIfNeeded } from "../utils/markChargedIfNeeded";
const MAX_ERROR_RETRY = 3;
const MAX_CALLS_PER_BATCH = 1;

/* --------------------------------------------------------
 * 🧩 Upload ảnh (start + end)
 * -------------------------------------------------------- */
async function uploadImageForJob(
  record: any,
  token: string,
  email: string,
  jobId: string
) {
  const upload = async (base64: string, label: string) => {
    const payload = {
      clientContext: { sessionId: `${Date.now()}`, tool: "ASSET_MANAGER" },
      imageInput: {
        aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE",
        isUserUploaded: true,
        mimeType: "image/jpeg",
        rawImageBytes: base64,
      },
    };
    try {
      console.log(`🖼️ [${email}] Uploading ${label} image for job ${jobId}...`);
      const res = await safeAxiosPost(
        "https://aisandbox-pa.googleapis.com/v1:uploadUserImage",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 60_000,
        },
      );
      const id = res.data?.mediaGenerationId?.mediaGenerationId;
      if (id) console.log(`✅ Uploaded ${label} image → ${id}`);
      return id;
    } catch (err: any) {
      console.error(`❌ Upload ${label} failed:`, err.message);
      return null;
    }
  };

  const [startId, endId] = await Promise.all([
    record.base64 ? upload(record.base64, "start") : null,
    record.endBase64 ? upload(record.endBase64, "end") : null,
  ]);

  const mediaIds = [startId, endId].filter(Boolean);
  if (mediaIds.length >= 2) {
    await VideoJobModel.findByIdAndUpdate(jobId, { listIdImage: mediaIds });
    console.log(`✅ [${email}] Uploaded 2 images for job ${jobId}.`);
  } else console.warn(`⚠️ [${email}] Missing one of start/end images.`);
  return mediaIds;
}

/* --------------------------------------------------------
 * 🔹 Submit Start-End Jobs (no polling)
 * -------------------------------------------------------- */
export async function submitStartEndJobs() {
  const allJobs = await VideoJobModel.find({
    type: "start-end-image-redirect",
    $or: [{ status: "pending" }, { status: "error" }],
    operationName: { $exists: false },
  })
    .sort({ createdAt: 1 })
    .limit(100);

  if (!allJobs.length) {
    console.log("✅ No start-end jobs to submit.");
    return;
  }

  // Gom theo user
  const grouped = new Map<string, any[]>();
  for (const job of allJobs) {
    if (!job.userId) continue;
    const list = grouped.get(job.userId.toString()) || [];
    list.push(job);
    grouped.set(job.userId.toString(), list);
  }

  const users = await UserModel.find({
    _id: { $in: [...grouped.keys()] },
  }).lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  for (const [userId, jobs] of grouped.entries()) {
    const user = userMap.get(userId);
    if (!user?.googleId) continue;

    const plan = user.plan;
    const limit = PLAN_LIMITS[plan] ?? 1;
    const recentCount = await VideoJobModel.countDocuments({
      userId,
      type: "start-end-image-redirect",
      sentProcessAt: { $gte: new Date(Date.now() - 30_000) },
    });
    if (recentCount >= limit) continue;

    const tokenDoc = await GoogleTokenModel.findOne({
      _id: user.googleId,
      isActive: true,
    }).lean();
    if (!tokenDoc?.accessToken) continue;

    const { accessToken: token, email } = tokenDoc;

    const jobsToSend = jobs.slice(0, MAX_CALLS_PER_BATCH);
    for (const job of jobsToSend)
      await handleSubmitJob(job, token, email, userId);
  }

  console.log("✅ Submit round complete for start-end-image jobs.");
}

/* --------------------------------------------------------
 * 🔹 Xử lý gửi từng job
 * -------------------------------------------------------- */
async function handleSubmitJob(
  job: any,
  token: string,
  email: string,
  userId: string
) {
  const jobId = job._id.toString();
  const { prompt, aspectRatio, errorCount = 0 } = job;

  try {
    if (job.status === "error" && errorCount >= MAX_ERROR_RETRY) {
      await VideoJobModel.findByIdAndUpdate(jobId, { status: "reject" });
      return;
    }

    await markChargedIfNeeded(jobId, userId);

    // Upload ảnh nếu chưa có
    let mediaIds = job.listIdImage;
    if (!mediaIds?.length) {
      const record = await ImageBase64ForJobModel.findOne({ jobId });
      if (!record) return;
      mediaIds = await uploadImageForJob(record, token, email, jobId);
      if (!mediaIds?.length) return;
    }

    const [res] = await requestVideo({
      prompt,
      quantity:job.quantity,
      startImageMediaId: mediaIds[0],
      endImageMediaId: mediaIds[1],
      token,
      aspectRatio: aspectRatio || "VIDEO_ASPECT_RATIO_LANDSCAPE",
    });

    const { operation, sceneId } = res;
    const opName = operation.name;

    await VideoJobModel.findByIdAndUpdate(jobId, {
      operationName: opName,
      sceneId,
      sentByEmail: email,
      sentProcessAt: new Date(),
      status: "pending",
    });

    console.log(`🕓 [${email}] Queued job ${jobId} with ${opName}`);
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      String(err);

    // 🔥 Nếu lỗi UNAUTHENTICATED → disable token ngay
    if (message.includes("UNAUTHENTICATED") && email) {
      console.warn(`🔴 Token ${email} bị vô hiệu hóa (UNAUTHENTICATED).`);

      await GoogleTokenModel.updateOne(
        { email },
        {
          isActive: false,
          note: message,
          lastActiveAt: new Date(),
        }
      );

      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "reject",
        refunded: true,
        refundedAt: new Date(),
        errorMessage: message,
        $inc: { errorCount: 1 },
        updatedAt: new Date(),
      });
      const refund = job.resolution === "1080p" ? 2 : 1;
      await UserModel.findByIdAndUpdate(job.userId, {
        $inc: { videoUsed: -refund },
      });

      return; // ⛔ không chạy xử lý lỗi thường nữa
    }

    // ❌ Lỗi bình thường → error
    await VideoJobModel.findByIdAndUpdate(jobId, {
      status: "error",
      errorMessage: message,
      $inc: { errorCount: 1 },
      updatedAt: new Date(),
    });
  }
}

/* --------------------------------------------------------
 * 🕒 Chạy định kỳ submit
 * -------------------------------------------------------- */
setInterval(submitStartEndJobs, 15_000);
