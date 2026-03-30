// ✅ routes/fxflow.ts — FXFlow External Worker API
import express from "express";
import mongoose from "mongoose";
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
import ImageOwnerModel from "../models/ImageOwnerModel";
import FxflowOwner from "../models/FxflowOwner.model";
import { authenticate } from "./auth";

const router = express.Router();

/* =====================================================
   SYSTEM SETTING (shared model from config.ts)
===================================================== */
const SystemSettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const SystemSetting = (mongoose.models.SystemSetting || mongoose.model("SystemSetting", SystemSettingSchema)) as mongoose.Model<any>;

/* =====================================================
   FXFLOW CONFIG DEFAULTS
===================================================== */
const DEFAULT_FXFLOW_CONFIG = {
  enabled: true,
  routingPercent: 100,       // 0-100: % traffic gommo → fxflow (hiện tại 100% test)
  videoQuality: "relaxed",   // "fast" | "relaxed" | "quality"
  imageModel: "NARWHAL",     // default model cho image
};

/** Lấy fxflow config từ DB, fallback to defaults */
async function getFxflowConfig() {
  try {
    const setting = await SystemSetting.findOne({ key: "fxflow" }).lean() as any;
    return { ...DEFAULT_FXFLOW_CONFIG, ...(setting?.value || {}) };
  } catch {
    return DEFAULT_FXFLOW_CONFIG;
  }
}

/* =====================================================
   OWNER HELPER
   Sticky assignment: user giữ 1 owner cố định.
   Chỉ random lại khi owner đó inactive hoặc chưa có.
===================================================== */
export async function pickRandomActiveOwner(): Promise<string | null> {
  try {
    const owners = await FxflowOwner.find({ status: "active" }).lean();
    if (!owners.length) return null;
    const pick = owners[Math.floor(Math.random() * owners.length)];
    return pick.name;
  } catch {
    return null;
  }
}

/**
 * Sticky owner per user:
 * 1. User đã có fxflowOwner + owner còn active → dùng luôn
 * 2. User chưa có / owner inactive → random owner mới, lưu vào user
 */
export async function getOrAssignOwnerForUser(userId: string): Promise<string | null> {
  try {
    const User = (await import("../models/UserModel")).default;
    const user = await User.findById(userId);
    if (!user) return await pickRandomActiveOwner();

    // Nếu user đã có owner → check active
    if (user.fxflowOwner) {
      const existing = await FxflowOwner.findOne({
        name: user.fxflowOwner,
        status: "active",
      }).lean();

      if (existing) return user.fxflowOwner; // ✅ still active → reuse
    }

    // Owner chưa có hoặc inactive → pick mới
    const newOwner = await pickRandomActiveOwner();
    if (newOwner) {
      user.fxflowOwner = newOwner;
      await user.save();
      console.log(`👤 [FXFlow] Assigned owner "${newOwner}" to user ${user.email}`);
    }

    return newOwner;
  } catch (err) {
    console.error("[FXFlow] getOrAssignOwnerForUser error:", err);
    return await pickRandomActiveOwner();
  }
}

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
    case "3:4":
      return "portrait";
    case "1:1":
      return "square";
    case "16:9":
    case "4:3":
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
    case VideoJobType.INGREDIENT:
      return "charsync";
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
   ✅ Hỗ trợ ?owner=acc1 để lọc theo owner
===================================================== */
router.get("/tasks/pending", async (req, res) => {
  try {
    const fxConfig = await getFxflowConfig();
    const ownerFilter = req.query.owner as string | undefined;
    const typeFilter = req.query.type as string | undefined; // "image" | "video" | "charsync" | undefined (all)

    // Determine which types to fetch
    const fetchImage = !typeFilter || typeFilter === "image";
    const fetchVideo = !typeFilter || typeFilter === "video" || typeFilter === "charsync";

    const tasks: any[] = [];

    // 1️⃣ Fetch pending IMAGE jobs
    if (fetchImage) {
      const imageFilter: any = {
        status: ImageJobStatus.PENDING,
        "engine.provider": ImageEngineProvider.FXFLOW,
      };
      if (ownerFilter) imageFilter.owner = ownerFilter;

      const pendingImages = await ImageJob.find(imageFilter)
        .sort({ createdAt: 1 })
        .limit(5)
        .lean();

      for (const job of pendingImages) {
        const task: any = {
          id: String(job._id),
          type: "image",
          prompt: job.enginePayload?.prompt || job.input?.prompt || "",
          owner: job.owner || null,
        };

        const model = mapImageModel(job.engine?.model);
        if (model !== "NARWHAL") task.model = model;

        const aspectRatio = mapAspectRatio(job.config?.aspectRatio);
        if (aspectRatio !== "landscape") task.aspectRatio = aspectRatio;

        const priority = job.enginePayload?.priority;
        if (priority != null && priority !== 1) task.priority = priority;

        const refImages = Array.isArray(job.input?.images) && job.input.images.length > 0
          ? job.input.images
          : (job.input?.image ? [job.input.image] : []);
        if (refImages.length > 0) {
          task.referenceImages = refImages;
        }

        tasks.push(task);
      }
    }

    // 2️⃣ Fetch pending VIDEO jobs
    if (fetchVideo) {
      const videoFilter: any = {
        status: VideoJobStatus.PENDING,
        "engine.provider": VideoEngineProvider.FXFLOW,
      };
      if (ownerFilter) videoFilter.owner = ownerFilter;

      // If type=charsync → only fetch INGREDIENT (charsync) video jobs
      if (typeFilter === "charsync") {
        videoFilter.type = VideoJobType.INGREDIENT;
      }
      // If type=video → exclude charsync (INGREDIENT) jobs
      if (typeFilter === "video") {
        videoFilter.type = { $ne: VideoJobType.INGREDIENT };
      }

      const pendingVideos = await VideoJob.find(videoFilter)
        .sort({ createdAt: 1 })
        .limit(5)
        .lean();

      for (const job of pendingVideos) {
        const videoMode = mapVideoMode(job.type);

        const task: any = {
          id: String(job._id),
          type: videoMode === "charsync" ? "charsync" : "video",
          prompt: job.enginePayload?.prompt || job.input?.prompt || "",
          owner: job.owner || null,
        };

        if (videoMode !== "text") task.videoMode = videoMode;

        const resolution = job.config?.resolution;
        if (resolution) task.resolution = resolution;

        const quality = mapQuality(job.enginePayload?.mode) || fxConfig.videoQuality || "relaxed";
        if (quality !== "fast") task.quality = quality;

        const aspectRatio = mapAspectRatio(job.config?.aspectRatio);
        if (aspectRatio !== "landscape") task.aspectRatio = aspectRatio;

        const priority = job.enginePayload?.priority;
        if (priority != null && priority !== 1) task.priority = priority;

        if (videoMode === "image" || videoMode === "startend") {
          task.startMediaId =
            job.input?.images?.[0] ||
            job.input?.startImage ||
            "";
        }

        if (videoMode === "startend") {
          task.endMediaId =
            job.input?.images?.[1] ||
            job.input?.endImage ||
            "";
        }

        if (videoMode === "charsync") {
          const mediaIds = job.enginePayload?.referenceMediaIds;
          if (Array.isArray(mediaIds) && mediaIds.length > 0) {
            task.referenceMediaIds = mediaIds.filter((id: any) => id != null);
          } else {
            const refImages = job.input?.images;
            if (Array.isArray(refImages) && refImages.length > 0) {
              task.referenceMediaIds = refImages.filter((img: any) => img != null);
            }
          }
        }

        tasks.push(task);
      }
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
      `✅ [FXFlow][IMG] DONE job=${job._id} mediaId=${result.mediaId} owner=${job.owner}`
    );

    // 📚 Auto-save vào thư viện (ImageOwner)
    try {
      await ImageOwnerModel.create({
        userId: job.userId,
        imageUrl: result.resultUrl,
        mediaId: result.mediaId || null,
        type: "ai-generated",
        source: "fxflow",
        prompt: job.enginePayload?.prompt || job.input?.prompt || "",
        originalName: `AI_${String(job._id).slice(-6)}`,
        status: "done",
      });
      console.log(`📚 [FXFlow][IMG] Saved to library for user=${job.userId}`);
    } catch (libErr) {
      console.error(`⚠️ [FXFlow][IMG] Failed to save to library:`, libErr);
    }

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
      `✅ [FXFlow][VID] DONE job=${job._id} mediaId=${result.mediaId} owner=${job.owner}`
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

/* =====================================================
   CMS CONFIG ENDPOINTS
   Admin quản lý fxflow settings từ CMS
===================================================== */

// GET /fxflow/config — Lấy config hiện tại
router.get("/config", async (_req, res) => {
  try {
    const config = await getFxflowConfig();
    res.json({ success: true, data: config });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /fxflow/config — Admin update config
router.put("/config", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowedKeys = ["enabled", "routingPercent", "videoQuality", "imageModel"];
    const update: any = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const result = await SystemSetting.findOneAndUpdate(
      { key: "fxflow" },
      { $set: { value: { ...DEFAULT_FXFLOW_CONFIG, ...update } } },
      { upsert: true, new: true }
    );

    console.log(`⚙️ [FXFlow] Config updated:`, result.value);
    res.json({ success: true, data: result.value });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   FXFLOW OWNER CRUD
   Admin quản lý danh sách owner (acc1, acc2, ...)
===================================================== */

// GET /fxflow/owners — Lấy danh sách tất cả owners
router.get("/owners", async (_req, res) => {
  try {
    const owners = await FxflowOwner.find().sort({ createdAt: 1 }).lean();
    res.json({ success: true, data: owners });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /fxflow/owners — Tạo owner mới
router.post("/owners", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { name, description, status = "active" } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Missing owner name" });
    }

    const existing = await FxflowOwner.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Owner already exists" });
    }

    const owner = await FxflowOwner.create({
      name: name.trim(),
      description: description || "",
      status,
    });

    console.log(`👤 [FXFlow] Owner created: ${owner.name} (${owner.status})`);
    res.json({ success: true, data: owner });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /fxflow/owners/:id — Update owner (toggle status, rename, etc.)
router.put("/owners/:id", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { status, description, name } = req.body;
    const update: any = {};
    if (status !== undefined) update.status = status;
    if (description !== undefined) update.description = description;
    if (name !== undefined) update.name = name.trim();

    const owner = await FxflowOwner.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!owner) {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }

    console.log(`👤 [FXFlow] Owner updated: ${owner.name} → ${owner.status}`);
    res.json({ success: true, data: owner });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /fxflow/owners/:id — Xóa owner
router.delete("/owners/:id", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const owner = await FxflowOwner.findByIdAndDelete(req.params.id);
    if (!owner) {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }

    console.log(`🗑️ [FXFlow] Owner deleted: ${owner.name}`);
    res.json({ success: true, message: `Deleted owner: ${owner.name}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   GET /fxflow/image/upload-tasks
   FXFlow worker polls this to get pending image upload tasks.
   Worker receives imageUrl → uploads to Google → gets mediaId
   → reports back via POST /fxflow/image/upload-result
===================================================== */
router.get("/image/upload-tasks", async (req, res) => {
  try {
    const owner = req.query.owner?.toString() || null;
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);

    const query: any = {
      status: "pending-fxflow-upload",
      imageUrl: { $ne: null }, // Must have CDN URL to upload
    };

    // Optional owner filter (for multi-worker setups)
    if (owner) {
      query.source = owner;
    }

    // Find and atomically mark as "processing" to prevent double-pick
    const pendingImages = await ImageOwnerModel.find(query)
      .sort({ createdAt: 1 }) // oldest first
      .limit(limit)
      .lean();

    if (pendingImages.length === 0) {
      return res.json({ tasks: [] });
    }

    // Mark all as processing atomically
    const ids = pendingImages.map((img: any) => img._id);
    await ImageOwnerModel.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "processing" } }
    );

    // Build task format for worker
    const tasks = pendingImages.map((img: any) => ({
      jobId: String(img._id),
      imageUrl: img.imageUrl,
      fileName: img.originalName || "image.jpg",
      priority: 1,
    }));

    console.log(`📸 [FXFlow] Dispatched ${tasks.length} image upload tasks`);
    return res.json({ tasks });
  } catch (err: any) {
    console.error("[FXFlow] GET /image/upload-tasks error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/* =====================================================
   POST /fxflow/image/upload-result
   FXFlow worker reports upload result here.
   Body: { id, status: "done"|"error", mediaId?, error? }

   ✅ Nếu ImageOwner có videoJobId → chain mediaId vào
   VideoJob và chuyển status từ pending-upload → pending
===================================================== */
router.post("/image/upload-result", async (req, res) => {
  try {
    const { id, status, mediaId, error } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "Missing id or status" });
    }

    const record = await ImageOwnerModel.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Image record not found" });
    }

    if (status === "done" && mediaId) {
      record.status = "done";
      record.mediaId = mediaId;
      await record.save();

      console.log(`✅ [FXFlow] Image upload done: ${id} → mediaId=${mediaId}`);

      // ✅ Chain mediaId into linked VideoJob (if any)
      await chainMediaIdToVideoJob(record, mediaId);
    } else if (status === "error") {
      const retryCount = (record.retryCount || 0) + 1;
      record.retryCount = retryCount;

      if (retryCount >= 3) {
        record.status = "fail";
        record.errorMessage = error || "Upload failed after 3 retries";
        console.log(`❌ [FXFlow] Image upload FAILED (max retries): ${id}`);

        // ✅ Nếu image upload fail max retries → fail luôn VideoJob
        await failLinkedVideoJob(record, error || "Reference image upload failed after 3 retries");
      } else {
        record.status = "pending-fxflow-upload"; // Re-queue for retry
        record.errorMessage = error || "Upload failed, retrying...";
        console.log(`🔄 [FXFlow] Image upload retry ${retryCount}/3: ${id}`);
      }

      await record.save();
    } else {
      return res.status(400).json({ message: "Invalid status or missing mediaId" });
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error("[FXFlow] POST /image/upload-result error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/* =====================================================
   CHAIN MEDIA ID → VIDEO JOB
   Khi image upload xong → gắn mediaId vào VideoJob
   Chỉ chuyển status pending-upload → pending khi TẤT CẢ
   image uploads của video job đã done
===================================================== */
async function chainMediaIdToVideoJob(record: any, mediaId: string) {
  try {
    const videoJobId = record.videoJobId;
    if (!videoJobId) return; // Không link video job → skip

    const videoJob = await VideoJob.findById(videoJobId);
    if (!videoJob) {
      console.warn(`⚠️ [FXFlow] Linked VideoJob not found: ${videoJobId}`);
      return;
    }

    // Chỉ chain nếu video job đang chờ upload
    if (videoJob.status !== VideoJobStatus.PENDING_UPLOAD) {
      console.warn(
        `⚠️ [FXFlow] VideoJob ${videoJobId} status=${videoJob.status}, skip chain`
      );
      return;
    }

    const field = record.videoJobField || "startImage";

    // Gắn mediaId vào đúng field trong input
    if (field === "startImage") {
      videoJob.input = {
        ...videoJob.input,
        startImage: mediaId,
      };
    } else if (field === "endImage") {
      videoJob.input = {
        ...videoJob.input,
        endImage: mediaId,
      };
    } else if (field.startsWith("images.")) {
      const idx = parseInt(field.split(".")[1] || "0");
      const imgs = [...(videoJob.input?.images || [])];
      imgs[idx] = mediaId;
      videoJob.input = {
        ...videoJob.input,
        images: imgs,
      };
    }

    // Check xem TẤT CẢ image uploads của video job đã done chưa
    const pendingUploads = await ImageOwnerModel.countDocuments({
      videoJobId: videoJobId,
      status: { $in: ["pending-fxflow-upload", "processing"] },
    });

    if (pendingUploads === 0) {
      // Tất cả đã done → chuyển video job sang pending
      videoJob.status = VideoJobStatus.PENDING;
      console.log(
        `🔗 [FXFlow] ALL images uploaded → VideoJob ${videoJobId} ready! ` +
        `Status: pending-upload → pending ✅`
      );
    } else {
      console.log(
        `🔗 [FXFlow] Chained mediaId=${mediaId} → VideoJob ${videoJobId} ` +
        `(field=${field}). Still waiting ${pendingUploads} more upload(s)...`
      );
    }

    await videoJob.save();
  } catch (err) {
    console.error(`❌ [FXFlow] chainMediaIdToVideoJob error:`, err);
  }
}

/* =====================================================
   FAIL LINKED VIDEO JOB
   Khi image upload fail max retries → fail VideoJob
===================================================== */
async function failLinkedVideoJob(record: any, errorMsg: string) {
  try {
    const videoJobId = record.videoJobId;
    if (!videoJobId) return;

    const videoJob = await VideoJob.findById(videoJobId);
    if (!videoJob || videoJob.status !== VideoJobStatus.PENDING_UPLOAD) return;

    videoJob.status = VideoJobStatus.ERROR;
    videoJob.error = {
      code: "REFERENCE_IMAGE_UPLOAD_FAILED",
      message: errorMsg,
      userMessage: "Ảnh tham chiếu upload thất bại. Vui lòng thử lại.",
    };
    await videoJob.save();

    // Auto-refund nếu có
    await refundFxflowCredits(videoJob, "ref_image_upload_failed");

    console.log(`❌ [FXFlow] VideoJob ${videoJobId} FAILED due to image upload failure`);
  } catch (err) {
    console.error(`❌ [FXFlow] failLinkedVideoJob error:`, err);
  }
}

export default router;
