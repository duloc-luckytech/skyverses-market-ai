import VideoConcatJob from "../models/VideoConcatJobModel";
import GoogleTokenModel from "../models/GoogleTokenModel";
import {
  runConcatenateVideos,
  pollConcatenationStatus,
} from "../utils/labsConcatUtils";
import { saveTempVideo } from "../utils/tempStorage";

/* ---------------------- Cấu hình ---------------------- */
const MAX_PER_USER = 3; // mỗi user tối đa 3 job đang chạy
const USER_DELAY_MS = 30_000; // delay 30s giữa các job 1 user
const LOOP_INTERVAL = 15_000; // mỗi 15s quét job mới

/* ---------------------- Bộ nhớ tạm ---------------------- */
const activeUserJobs: Record<string, { running: number; lastRunAt: number }> =
  {};

/* ====================================================== */
/* 🔁 Hàm chính xử lý batch job nối video                 */
/* ====================================================== */
export async function processPendingConcatJobs() {
  const pendingJobs = await VideoConcatJob.find({ status: "pending" })
    .sort({ createdAt: 1 })
    .limit(30);

  if (!pendingJobs.length) return;

  const jobsByUser: Record<string, any[]> = {};

  for (const job of pendingJobs) {
    const key = job.userId?.toString() || "unknown";
    if (!jobsByUser[key]) jobsByUser[key] = [];
    jobsByUser[key].push(job);
  }

  for (const [userId, jobs] of Object.entries(jobsByUser)) {
    const state = activeUserJobs[userId] || { running: 0, lastRunAt: 0 };

    if (state.running >= MAX_PER_USER) continue;
    if (Date.now() - state.lastRunAt < USER_DELAY_MS) continue;

    const job = jobs[0];
    activeUserJobs[userId] = {
      running: state.running + 1,
      lastRunAt: Date.now(),
    };

    handleConcatJob(job)
      .catch((err) =>
        console.error(`❌ [User:${userId}] Job ${job._id} error:`, err.message)
      )
      .finally(() => {
        const s = activeUserJobs[userId];
        if (s) s.running = Math.max(0, (s.running || 1) - 1);
      });

    await new Promise((r) => setTimeout(r, USER_DELAY_MS));
  }
}

/* ====================================================== */
/* 🎞 Xử lý từng job nối video (SỬA TOÀN BỘ)              */
/* ====================================================== */
async function handleConcatJob(job: any) {
  console.log(
    `🧩 [Concat] Start job ${job._id} | user=${job.userId} | google=${job.googleEmail}`
  );

  try {
    await VideoConcatJob.updateOne(
      { _id: job._id },
      { $set: { status: "processing", startedAt: new Date() } }
    );

    // --------------------------------------------------
    // 🔥 ONLY USE OWNER TOKEN — NO TOKEN BORROWING
    // --------------------------------------------------
    const tokenDoc = await GoogleTokenModel.findOne({
      email: job.googleEmail,
      isActive: true,
    }).lean();

    if (!tokenDoc) {
      console.error(`❌ No active token for owner: ${job.googleEmail}`);

      await VideoConcatJob.updateOne(
        { _id: job._id },
        {
          $set: {
            status: "failed",
            error: `Owner token missing or inactive: ${job.googleEmail}`,
            finishedAt: new Date(),
          },
        }
      );

      return; // STOP HERE
    }

    const { accessToken, cookieToken }: any = tokenDoc;

    // ==========================================================
    // 1️⃣ Validate segments
    // ==========================================================
    if (!job.segments || !Array.isArray(job.segments)) {
      throw new Error("Invalid segments in job");
    }

    const inputVideos = job.segments.map((seg: any) => ({
      mediaGenerationId: seg.mediaId,
      startTimeOffset: `${Number(seg.start).toFixed(9)}s`,
      endTimeOffset: `${Number(seg.end).toFixed(9)}s`,
    }));

    // ==========================================================
    // 2️⃣ Submit concat request
    // ==========================================================

    const operationName = await runConcatenateVideos({
      token: accessToken,
      cookieToken,
      projectId: job.projectId || "labs",
      segments: job.segments,
    });

    await VideoConcatJob.updateOne(
      { _id: job._id },
      { $set: { operationName } }
    );

    // ==========================================================
    // 3️⃣ Poll status
    // ==========================================================
    const { encodedVideo, status } = await pollConcatenationStatus({
      token: accessToken,
      email: tokenDoc.email,
      jobId: job._id.toString(),
      operationName,
    });

    let filePath: string | undefined;

    if (encodedVideo) {
      filePath = saveTempVideo(job._id.toString(), encodedVideo);
    }

    // ==========================================================
    // 4️⃣ Update job status
    // ==========================================================
    await VideoConcatJob.updateOne(
      { _id: job._id },
      {
        $set: {
          filePath: filePath || null,
          encodedVideo: null,
          status:
            status === "MEDIA_GENERATION_STATUS_SUCCESSFUL" ? "done" : "failed",
          finishedAt: new Date(),
        },
      }
    );

    console.log(`✅ [Concat] Done job ${job._id} (${job.googleEmail})`);
  } catch (err: any) {
    console.error(`❌ [Concat] Job ${job._id} failed:`, err.message);

    await VideoConcatJob.updateOne(
      { _id: job._id },
      {
        $set: {
          status: "failed",
          error: err.message,
          finishedAt: new Date(),
        },
      }
    );
  }
}
/* ====================================================== */
/* ⏱️ Cron job chạy định kỳ mỗi 15s                       */
/* ====================================================== */
setInterval(() => {
  processPendingConcatJobs().catch((err) =>
    console.error("⚠️ processPendingConcatJobs error:", err)
  );
}, LOOP_INTERVAL);
