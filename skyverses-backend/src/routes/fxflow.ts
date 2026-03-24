// ✅ routes/fxflow.ts — FXFlow External Worker API
import express from "express";
import VideoJob, {
  VideoJobStatus,
  VideoEngineProvider,
  VideoJobType,
} from "../models/VideoJobModelV2";
import ImageJob, {
  ImageJobStatus,
  ImageEngineProvider,
} from "../models/ImageJob";
import User from "../models/UserModel";
import CreditTransaction from "../models/CreditTransaction.model";

const router = express.Router();

/* =====================================================
   MAPPING HELPERS
===================================================== */

/** Map internal model name → fxflow model name */
function mapImageModel(engineModel?: string): string {
  if (!engineModel) return "NARWHAL";

  const key = engineModel.toLowerCase();

  // Exact match first
  if (key === "gem_pix_2" || key === "gempix2") return "GEM_PIX_2";
  if (key === "imagen_3_5" || key === "imagen3_5") return "IMAGEN_3_5";
  if (key === "narwhal") return "NARWHAL";

  // Pattern matching
  if (key.includes("imagen")) return "IMAGEN_3_5";
  if (key.includes("gem") || key.includes("google_image_gen")) return "GEM_PIX_2";

  // Default
  return "NARWHAL";
}

/** Map internal aspect ratio → fxflow format */
function mapAspectRatio(ratio?: string): string {
  switch (ratio) {
    case "9:16":
      return "portrait";
    case "1:1":
      return "square";
    case "16:9":
    default:
      return "landscape";
  }
}

/** Map internal video type → fxflow videoMode */
function mapVideoMode(type?: string): string {
  switch (type) {
    case VideoJobType.IMAGE_TO_VIDEO:
    case VideoJobType.IMAGE_TO_ANIMATION:
      return "image";
    case VideoJobType.START_END_IMAGE:
      return "startend";
    case VideoJobType.TEXT_TO_VIDEO:
    default:
      return "text";
  }
}

/** Map internal quality/mode → fxflow quality */
function mapQuality(mode?: string): string {
  if (mode === "relaxed" || mode === "quality") return mode;
  return "fast";
}

/* =====================================================
   GET /tasks/pending
   Bên thứ 3 (fxflow) gọi endpoint này để lấy task về xử lý
===================================================== */
router.get("/tasks/pending", async (req, res) => {
  try {
    // 1️⃣ Fetch pending IMAGE jobs (fxflow)
    const pendingImages = await ImageJob.find({
      status: ImageJobStatus.PENDING,
      "engine.provider": ImageEngineProvider.FXFLOW,
    })
      .sort({ createdAt: 1 }) // oldest first (FIFO)
      .limit(5)
      .lean();

    // 2️⃣ Fetch pending VIDEO jobs (fxflow)
    const pendingVideos = await VideoJob.find({
      status: VideoJobStatus.PENDING,
      "engine.provider": VideoEngineProvider.FXFLOW,
    })
      .sort({ createdAt: 1 })
      .limit(5)
      .lean();

    // 3️⃣ Format tasks theo đúng API contract
    const tasks: any[] = [];

    for (const job of pendingImages) {
      const task: any = {
        id: String(job._id),
        type: "image",
        prompt: job.enginePayload?.prompt || job.input?.prompt || "",
      };

      // Optional: model (default: NARWHAL)
      const model = mapImageModel(job.engine?.model);
      if (model !== "NARWHAL") task.model = model;

      // Optional: aspectRatio (default: landscape)
      const aspectRatio = mapAspectRatio(job.config?.aspectRatio);
      if (aspectRatio !== "landscape") task.aspectRatio = aspectRatio;

      // Optional: priority (default: 1)
      const priority = job.enginePayload?.priority;
      if (priority != null && priority !== 1) task.priority = priority;

      tasks.push(task);
    }

    for (const job of pendingVideos) {
      const task: any = {
        id: String(job._id),
        type: "video",
        prompt: job.enginePayload?.prompt || job.input?.prompt || "",
      };

      // Optional: videoMode (default: "text")
      const videoMode = mapVideoMode(job.type);
      if (videoMode !== "text") task.videoMode = videoMode;

      // Optional: quality (default: "fast")
      const quality = mapQuality(job.enginePayload?.mode);
      if (quality !== "fast") task.quality = quality;

      // Optional: aspectRatio (default: "landscape")
      const aspectRatio = mapAspectRatio(job.config?.aspectRatio);
      if (aspectRatio !== "landscape") task.aspectRatio = aspectRatio;

      // Optional: priority (default: 1)
      const priority = job.enginePayload?.priority;
      if (priority != null && priority !== 1) task.priority = priority;

      // startMediaId — required khi videoMode = "image" hoặc "startend"
      // FE gửi: input.images = [startUrl, endUrl]
      if (videoMode === "image" || videoMode === "startend") {
        task.startMediaId =
          job.input?.images?.[0] ||
          job.input?.startImage ||
          "";
      }

      // endMediaId — required khi videoMode = "startend"
      // FE gửi: input.images = [startUrl, endUrl]
      if (videoMode === "startend") {
        task.endMediaId =
          job.input?.images?.[1] ||
          job.input?.endImage ||
          "";
      }

      tasks.push(task);
    }

    // Sort by priority (2=high first, 0=low last)
    tasks.sort((a, b) => (b.priority ?? 1) - (a.priority ?? 1));

    return res.json({ tasks });
  } catch (err: any) {
    console.error("[FXFlow] GET /tasks/pending error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/* =====================================================
   POST /tasks/:id/complete
   FXFlow worker submits results here
===================================================== */
router.post("/tasks/:id/complete", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status, resultUrl, mediaId, error } = req.body;

    if (!taskId || !status) {
      return res.status(400).json({ message: "Missing id or status" });
    }

    // 🔍 Try IMAGE job first, then VIDEO
    let imageJob = await ImageJob.findById(taskId);

    if (imageJob) {
      return await handleImageComplete(imageJob, {
        status,
        resultUrl,
        mediaId,
        error,
      }, res);
    }

    let videoJob = await VideoJob.findById(taskId);

    if (videoJob) {
      return await handleVideoComplete(videoJob, {
        status,
        resultUrl,
        mediaId,
        error,
      }, res);
    }

    return res.status(404).json({ message: "Task not found" });
  } catch (err: any) {
    console.error("[FXFlow] POST /tasks/:id/complete error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/* =====================================================
   HANDLE IMAGE COMPLETE
===================================================== */
async function handleImageComplete(
  job: any,
  result: { status: string; resultUrl?: string; mediaId?: string; error?: string },
  res: any
) {
  if (result.status === "done") {
    job.status = ImageJobStatus.DONE;
    job.progress = { percent: 100, step: "done" };
    job.result = {
      images: result.resultUrl ? [result.resultUrl] : [],
      thumbnail: result.resultUrl,
      imageId: result.mediaId,
    };

    // Save mediaId in engineResponse for potential video chaining
    job.engineResponse = {
      ...job.engineResponse,
      fxflowMediaId: result.mediaId,
    };

    await job.save();

    console.log(
      `✅ [FXFlow][IMG] DONE job=${job._id} mediaId=${result.mediaId}`
    );

    return res.json({
      success: true,
      id: String(job._id),
      status: "done",
    });
  }

  // ❌ ERROR
  job.status = ImageJobStatus.ERROR;
  job.progress = { percent: 0, step: "error" };
  job.error = {
    message: result.error || "FXFlow image generation failed",
  };
  await job.save();

  // 💳 Auto-refund
  await refundFxflowCredits(job, "fxflow_image_error");

  console.error(
    `❌ [FXFlow][IMG] ERROR job=${job._id} err=${result.error}`
  );

  return res.json({
    success: true,
    id: String(job._id),
    status: "error",
  });
}

/* =====================================================
   HANDLE VIDEO COMPLETE
===================================================== */
async function handleVideoComplete(
  job: any,
  result: { status: string; resultUrl?: string; mediaId?: string; error?: string },
  res: any
) {
  if (result.status === "done") {
    job.status = VideoJobStatus.DONE;
    job.progress = { percent: 100, step: "done" };
    job.result = {
      videoUrl: result.resultUrl,
      thumbnailUrl: result.resultUrl, // fxflow doesn't provide separate thumbnail
    };

    job.engineResponse = {
      ...job.engineResponse,
      fxflowMediaId: result.mediaId,
    };

    await job.save();

    console.log(
      `✅ [FXFlow][VID] DONE job=${job._id} mediaId=${result.mediaId}`
    );

    return res.json({
      success: true,
      id: String(job._id),
      status: "done",
    });
  }

  // ❌ ERROR
  job.status = VideoJobStatus.ERROR;
  job.progress = { percent: 0, step: "error" };
  job.error = {
    code: "FXFLOW_ERROR",
    message: result.error || "FXFlow video generation failed",
    userMessage: result.error || "Video tạo thất bại. Hệ thống đã hoàn credit.",
  };
  await job.save();

  // 💳 Auto-refund
  await refundFxflowCredits(job, "fxflow_video_error");

  console.error(
    `❌ [FXFlow][VID] ERROR job=${job._id} err=${result.error}`
  );

  return res.json({
    success: true,
    id: String(job._id),
    status: "error",
  });
}

/* =====================================================
   REFUND HELPER
===================================================== */
async function refundFxflowCredits(job: any, source: string) {
  if (!job.creditsUsed || job.creditsUsed <= 0) return;

  const user = await User.findById(job.userId);
  if (!user) return;

  user.creditBalance += job.creditsUsed;
  await user.save();

  await CreditTransaction.create({
    userId: user._id,
    type: "REFUND",
    amount: job.creditsUsed,
    balanceAfter: user.creditBalance,
    source,
    note: `Auto-refund fxflow failed job: ${job._id}`,
  });

  console.log(
    `💳 [FXFlow][REFUND] ${user.email} +${job.creditsUsed} CR (${source}: ${job._id})`
  );
}

export default router;
