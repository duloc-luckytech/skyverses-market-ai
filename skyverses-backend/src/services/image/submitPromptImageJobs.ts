import PromptGenerationJob from "../../models/PromptGenerationJob";
import ImageOwnerModel from "../../models/ImageOwnerModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import UserModel from "../../models/UserModel";
import {
  generateFlowImageBananaPro,
  generateFlowImageWithReference,
} from "../../utils/image";

const MAX_ERROR_RETRY = 50; // lỗi khác (500, network…)
const MAX_BAD_RETRY = 3; // lỗi 400 hoặc 429 → reject sau 3 lần
const MAX_JOBS_PER_TICK = 20;

// Delay 1 phút 30s cho lỗi 400/429
const BAD_RETRY_DELAY_MS = 90 * 1000;

export async function submitPromptImageJobs() {
  console.log("🚀 Checking pending prompt-image jobs...");

  const jobs = await PromptGenerationJob.find({
    type: "image",
    status: { $in: ["pending", "error"] },
  })
    .sort({ createdAt: 1 })
    .limit(MAX_JOBS_PER_TICK);

  if (jobs.length === 0) {
    console.log("✅ No prompt-image jobs.");
    return;
  }

  const fallbackToken = await GoogleTokenModel.findOne({
    isActive: true,
  }).lean();
  if (!fallbackToken) {
    console.log("❌ No active Google token available!");
    return;
  }

  console.log(`🎯 Using fallback token: ${fallbackToken.email}`);

  for (const job of jobs) {
    const user = await UserModel.findById(job.userId).lean();

    const tokenDoc =
      (user?.googleId
        ? await GoogleTokenModel.findOne({
            _id: user.googleId,
            isActive: true,
          }).lean()
        : null) || fallbackToken;

    await handleSubmitPromptImageJob(job, {
      accessToken: tokenDoc.accessToken,
      projectId: tokenDoc.projectId,
      email: tokenDoc.email,
    } as any);
  }

  console.log("🎯 submitPromptImageJobs done.");
}

/* --------------------------------------------------------
 * HANDLE 1 JOB
 * ------------------------------------------------------ */
async function handleSubmitPromptImageJob(
  job: any,
  tokenInfo: { accessToken: string; projectId: string; email: string }
) {
  const { accessToken, projectId, email } = tokenInfo;

  const jobId = job._id.toString();
  const {
    prompt,
    count,
    seeds,
    aspect,
    errorCount = 0,
    ownerIds = [],
    referenceMediaId,
    mode,
    errorMessage,
    lastTriedAt,
  } = job;

  const now = Date.now();

  /* ============================================================
      0) Detect lỗi 400 hoặc 429
  ============================================================ */
  const isBadRequest400 =
    errorMessage && errorMessage.includes("status code 400");

  const isRateLimit429 =
    errorMessage && errorMessage.includes("status code 429");

  const isBadError = isBadRequest400 || isRateLimit429;

  /* ============================================================
      1) Nếu là lỗi 400/429 → bắt buộc phải đợi 90s mới retry
  ============================================================ */
  if (isBadError && lastTriedAt && now - lastTriedAt < BAD_RETRY_DELAY_MS) {
    const remain = BAD_RETRY_DELAY_MS - (now - lastTriedAt);
    console.log(
      `⏳ Job ${jobId} cooling down (${Math.ceil(remain / 1000)}s left) → skip`
    );
    return;
  }

  /* ============================================================
      2) Nếu lỗi 400/429 xảy ra 3 lần → reject
  ============================================================ */
  if (isBadError && errorCount >= MAX_BAD_RETRY) {
    console.log(`❌ Job ${jobId} failed (400/429) 3 times → REJECT`);

    await ImageOwnerModel.updateMany(
      { _id: { $in: ownerIds } },
      {
        status: "reject",
        errorMessage: "400/429 occurred 3 times",
      }
    );

    await PromptGenerationJob.findByIdAndUpdate(jobId, {
      status: "reject",
      errorMessage: "400/429 occurred 3 times",
      updatedAt: new Date(),
    });

    return;
  }

  /* ============================================================
      3) Lỗi khác nhưng vượt 50 → stop retry
  ============================================================ */
  if (!isBadError && errorCount >= MAX_ERROR_RETRY) {
    await PromptGenerationJob.findByIdAndUpdate(jobId, {
      status: "error",
      updatedAt: new Date(),
    });

    return;
  }

  /* ============================================================
      4) Thực thi generate
  ============================================================ */
  try {
    let results = [];

    if (Array.isArray(referenceMediaId) && referenceMediaId.length > 0) {
      results = await generateFlowImageWithReference({
        accessToken,
        projectId,
        prompts: Array(count).fill(prompt),
        aspect,
        seeds,
        referenceMediaIds: referenceMediaId,
        mode,
      });
    } else {
      results = await generateFlowImageBananaPro({
        accessToken,
        projectId,
        prompts: Array(count).fill(prompt),
        aspect,
        seeds,
        mode,
      });
    }

    // Fix mismatch
    if (!results || results.length < ownerIds.length) {
      const safe = [];
      for (let i = 0; i < ownerIds.length; i++) {
        safe.push(results[i] || { imageUrl: null, mediaGenerationId: null });
      }
      results = safe;
    }

    // Update image owners
    for (let i = 0; i < ownerIds.length; i++) {
      const ownerId = ownerIds[i];
      const { mediaGenerationId, imageUrl } = results[i];

      await ImageOwnerModel.findByIdAndUpdate(ownerId, {
        status: "done",
        imageUrl,
        mediaId: mediaGenerationId,
      });
    }

    // Update job done
    await PromptGenerationJob.findByIdAndUpdate(jobId, {
      status: "done",
      lastTriedAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Job ${jobId} solved by ${email}`);
  } catch (err: any) {
    const msg = err?.response?.data
      ? JSON.stringify(err.response.data, null, 2)
      : err.message || "Unknown error";

    if (msg.includes("UNAUTHENTICATED")) {
      await GoogleTokenModel.updateOne(
        { email },
        { isActive: false, note: msg }
      );

      await PromptGenerationJob.findByIdAndUpdate(jobId, {
        status: "reject",
        $inc: { errorCount: 1 },
        errorMessage: err.message,
        lastTriedAt: new Date(), // quan trọng
        updatedAt: new Date(),
      });

      return;
    }
    await PromptGenerationJob.findByIdAndUpdate(jobId, {
      status: "error",
      $inc: { errorCount: 1 },
      errorMessage: err.message,
      lastTriedAt: new Date(), // quan trọng
      updatedAt: new Date(),
    });
  }
}

/* --------------------------------------------------------
 * CRON
 * ------------------------------------------------------ */
setInterval(submitPromptImageJobs, 30000);
