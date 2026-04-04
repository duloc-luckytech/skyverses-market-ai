// ✅ routes/workerRouter.ts — Generic External Worker API Factory
// Dùng chung cho fxflow, grok, và bất kỳ provider nào trong tương lai
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

/* =====================================================
   SYSTEM SETTING (shared model)
===================================================== */
const SystemSettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const SystemSetting = (mongoose.models.SystemSetting || mongoose.model("SystemSetting", SystemSettingSchema)) as mongoose.Model<any>;

/* =====================================================
   PROVIDER CONFIG — Mỗi provider có config mặc định riêng
   nhưng dùng chung cấu trúc
===================================================== */
interface ProviderConfig {
  enabled: boolean;
  routingPercent: number;
  videoQuality: string;
  imageModel: string;
}

const PROVIDER_DEFAULTS: Record<string, ProviderConfig> = {
  fxflow: {
    enabled: true,
    routingPercent: 100,
    videoQuality: "relaxed",
    imageModel: "NARWHAL",
  },
  grok: {
    enabled: true,
    routingPercent: 0,       // Mặc định 0% — admin bật lên từ CMS
    videoQuality: "relaxed",
    imageModel: "NARWHAL",
  },
};

/** Lấy config cho provider từ DB, fallback to defaults */
export async function getProviderConfig(provider: string): Promise<ProviderConfig> {
  const defaults = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.fxflow;
  try {
    const setting = await SystemSetting.findOne({ key: provider }).lean() as any;
    return { ...defaults, ...(setting?.value || {}) };
  } catch {
    return defaults;
  }
}

/* =====================================================
   OWNER HELPERS — Dùng chung cho tất cả providers
   Owner model (FxflowOwner) giờ thêm field `provider`
   để phân biệt owner thuộc provider nào
===================================================== */
export async function pickRandomActiveOwner(provider?: string): Promise<string | null> {
  try {
    const filter: any = { status: "active" };
    if (provider) filter.provider = provider;
    const owners = await FxflowOwner.find(filter).lean();
    if (!owners.length) {
      // Fallback: nếu không tìm được owner theo provider → tìm tất cả
      if (provider) {
        const allOwners = await FxflowOwner.find({ status: "active" }).lean();
        if (!allOwners.length) return null;
        const pick = allOwners[Math.floor(Math.random() * allOwners.length)];
        return pick.name;
      }
      return null;
    }
    const pick = owners[Math.floor(Math.random() * owners.length)];
    return pick.name;
  } catch {
    return null;
  }
}

/**
 * Sticky owner per user:
 * 1. User đã có owner cho provider + owner còn active → dùng luôn
 * 2. User chưa có / owner inactive → random owner mới, lưu vào user
 *
 * ownerField: tên field trên User model ("fxflowOwner" | "grokOwner" | ...)
 */
export async function getOrAssignOwnerForUser(
  userId: string,
  provider: string = "fxflow",
): Promise<string | null> {
  // Map provider → field trên User model
  const ownerField = provider === "grok" ? "grokOwner" : "fxflowOwner";

  try {
    const UserModel = (await import("../models/UserModel")).default;
    const user = await UserModel.findById(userId);
    if (!user) return await pickRandomActiveOwner(provider);

    // Nếu user đã có owner → check active
    const currentOwner = (user as any)[ownerField];
    if (currentOwner) {
      const existing = await FxflowOwner.findOne({
        name: currentOwner,
        status: "active",
      }).lean();

      if (existing) return currentOwner; // ✅ still active → reuse
    }

    // Owner chưa có hoặc inactive → pick mới
    const newOwner = await pickRandomActiveOwner(provider);
    if (newOwner) {
      (user as any)[ownerField] = newOwner;
      await user.save();
      console.log(`👤 [${provider.toUpperCase()}] Assigned owner "${newOwner}" to user ${user.email}`);
    }

    return newOwner;
  } catch (err) {
    console.error(`[${provider.toUpperCase()}] getOrAssignOwnerForUser error:`, err);
    return await pickRandomActiveOwner(provider);
  }
}

/* =====================================================
   MAPPING HELPERS — Dùng chung cho tất cả providers
===================================================== */

/** Map internal model name → worker model name */
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

/** Map internal aspect ratio → worker format */
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

/** Map internal video type → worker videoMode */
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

/** Map internal quality/mode → worker quality */
function mapQuality(mode?: string): string {
  if (mode === "relaxed" || mode === "quality") return mode;
  return "fast";
}

/* =====================================================
   REFUND HELPER — Dùng chung
===================================================== */
async function refundCredits(job: any, source: string, providerLabel: string) {
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
    note: `Auto-refund ${providerLabel} failed job: ${job._id}`,
  });

  console.log(
    `💳 [${providerLabel}][REFUND] ${user.email} +${job.creditsUsed} CR (${source}: ${job._id})`
  );
}

/* =====================================================
   IMAGE / VIDEO COMPLETE HANDLERS — Dùng chung
===================================================== */
async function handleImageComplete(
  job: any,
  result: { status: string; resultUrl?: string; mediaId?: string; error?: string },
  res: any,
  provider: string,
) {
  const label = provider.toUpperCase();

  if (result.status === "done") {
    job.status = ImageJobStatus.DONE;
    job.progress = { percent: 100, step: "done" };
    job.result = {
      images: result.resultUrl ? [result.resultUrl] : [],
      thumbnail: result.resultUrl,
      imageId: result.mediaId,
    };

    job.engineResponse = {
      ...job.engineResponse,
      [`${provider}MediaId`]: result.mediaId,
    };

    await job.save();

    console.log(
      `✅ [${label}][IMG] DONE job=${job._id} mediaId=${result.mediaId} owner=${job.owner}`
    );

    // 📚 Auto-save vào thư viện (ImageOwner)
    try {
      await ImageOwnerModel.create({
        userId: job.userId,
        imageUrl: result.resultUrl,
        mediaId: result.mediaId || null,
        type: "ai-generated",
        source: provider,
        prompt: job.enginePayload?.prompt || job.input?.prompt || "",
        originalName: `AI_${String(job._id).slice(-6)}`,
        status: "done",
      });
      console.log(`📚 [${label}][IMG] Saved to library for user=${job.userId}`);
    } catch (libErr) {
      console.error(`⚠️ [${label}][IMG] Failed to save to library:`, libErr);
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
    message: result.error || `${label} image generation failed`,
  };
  await job.save();

  // 💳 Auto-refund
  await refundCredits(job, `${provider}_image_error`, label);

  console.error(
    `❌ [${label}][IMG] ERROR job=${job._id} err=${result.error}`
  );

  return res.json({
    success: true,
    id: String(job._id),
    status: "error",
  });
}

async function handleVideoComplete(
  job: any,
  result: { status: string; resultUrl?: string; mediaId?: string; error?: string },
  res: any,
  provider: string,
) {
  const label = provider.toUpperCase();

  if (result.status === "done") {
    job.status = VideoJobStatus.DONE;
    job.progress = { percent: 100, step: "done" };
    job.result = {
      videoUrl: result.resultUrl,
      thumbnailUrl: result.resultUrl,
    };

    job.engineResponse = {
      ...job.engineResponse,
      [`${provider}MediaId`]: result.mediaId,
    };

    await job.save();

    console.log(
      `✅ [${label}][VID] DONE job=${job._id} mediaId=${result.mediaId} owner=${job.owner}`
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
    code: `${label}_ERROR`,
    message: result.error || `${label} video generation failed`,
    userMessage: result.error || "Video tạo thất bại. Hệ thống đã hoàn credit.",
  };
  await job.save();

  // 💳 Auto-refund
  await refundCredits(job, `${provider}_video_error`, label);

  console.error(
    `❌ [${label}][VID] ERROR job=${job._id} err=${result.error}`
  );

  return res.json({
    success: true,
    id: String(job._id),
    status: "error",
  });
}

/* =====================================================
   IMAGE UPLOAD → VIDEO CHAINING — Dùng chung
===================================================== */
async function chainMediaIdToVideoJob(record: any, mediaId: string, provider: string) {
  try {
    const payload = record.pendingVideoPayload;
    if (!payload) return;

    const field = record.videoJobField || "startImage";
    const input = { ...payload.input };

    if (field === "startImage") {
      input.startImage = mediaId;
    } else if (field === "endImage") {
      input.endImage = mediaId;
    } else if (field.startsWith("images.")) {
      const idx = parseInt(field.split(".")[1] || "0");
      const imgs = [...(input.images || [])];
      imgs[idx] = mediaId;
      input.images = imgs;
    }

    const videoJob = await VideoJob.create({
      userId: payload.userId,
      type: payload.type,
      input,
      config: payload.config,
      engine: payload.engine,
      enginePayload: payload.enginePayload,
      status: VideoJobStatus.PENDING,
      creditsUsed: 0,
      owner: payload.owner,
    });

    record.videoJobId = String(videoJob._id);
    await record.save();

    console.log(
      `🔗 [${provider.toUpperCase()}] Created VideoJob ${videoJob._id} with mediaId=${mediaId} ` +
      `(field=${field}, type=${payload.type}, owner=${payload.owner}) ✅`
    );
  } catch (err) {
    console.error(`❌ [${provider.toUpperCase()}] chainMediaIdToVideoJob error:`, err);
  }
}

async function failLinkedVideoJob(record: any, errorMsg: string, provider: string) {
  try {
    if (!record.pendingVideoPayload) return;

    console.log(
      `❌ [${provider.toUpperCase()}] Image upload FAILED for pending video task. ` +
      `ImageOwner=${record._id} Error: ${errorMsg}`
    );

    record.pendingVideoPayload = null;
    await record.save();
  } catch (err) {
    console.error(`❌ [${provider.toUpperCase()}] failLinkedVideoJob error:`, err);
  }
}

/* =====================================================
   🏭 FACTORY: createWorkerRouter(provider)
   Tạo Express Router với đầy đủ endpoints cho 1 provider
   Mount: router.use("/fxflow", createWorkerRouter("fxflow"))
          router.use("/grok",   createWorkerRouter("grok"))
===================================================== */
export function createWorkerRouter(provider: string) {
  const router = express.Router();
  const LABEL = provider.toUpperCase();

  // Map provider → engine provider enum value
  const imageProvider = provider as ImageEngineProvider;
  const videoProvider = provider as VideoEngineProvider;

  /* ─── GET /tasks/pending ─────────────────────────── */
  router.get("/tasks/pending", async (req, res) => {
    try {
      const config = await getProviderConfig(provider);
      const ownerFilter = req.query.owner as string | undefined;
      const typeFilter = req.query.type as string | undefined;

      const fetchImage = !typeFilter || typeFilter === "image";
      const fetchVideo = !typeFilter || typeFilter === "video" || typeFilter === "charsync";

      const tasks: any[] = [];

      // 1️⃣ Fetch pending IMAGE jobs
      if (fetchImage) {
        const imageFilter: any = {
          status: ImageJobStatus.PENDING,
          "engine.provider": imageProvider,
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
          "engine.provider": videoProvider,
        };
        if (ownerFilter) videoFilter.owner = ownerFilter;

        if (typeFilter === "charsync") {
          videoFilter.type = VideoJobType.INGREDIENT;
        }
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

          const quality = mapQuality(job.enginePayload?.mode) || config.videoQuality || "relaxed";
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
      console.error(`[${LABEL}] GET /tasks/pending error:`, err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  /* ─── POST /tasks/:id/complete ───────────────────── */
  router.post("/tasks/:id/complete", async (req, res) => {
    try {
      const taskId = req.params.id;
      const { status, resultUrl, mediaId, error } = req.body;

      if (!taskId || !status) {
        return res.status(400).json({ message: "Missing id or status" });
      }

      let imageJob = await ImageJob.findById(taskId);
      if (imageJob) {
        return await handleImageComplete(imageJob, { status, resultUrl, mediaId, error }, res, provider);
      }

      let videoJob = await VideoJob.findById(taskId);
      if (videoJob) {
        return await handleVideoComplete(videoJob, { status, resultUrl, mediaId, error }, res, provider);
      }

      return res.status(404).json({ message: "Task not found" });
    } catch (err: any) {
      console.error(`[${LABEL}] POST /tasks/:id/complete error:`, err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  /* ─── GET /config ────────────────────────────────── */
  router.get("/config", async (_req, res) => {
    try {
      const config = await getProviderConfig(provider);
      res.json({ success: true, data: config });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  /* ─── PUT /config ────────────────────────────────── */
  router.put("/config", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const defaults = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.fxflow;
      const allowedKeys = ["enabled", "routingPercent", "videoQuality", "imageModel"];
      const update: any = {};
      for (const key of allowedKeys) {
        if (req.body[key] !== undefined) update[key] = req.body[key];
      }

      const result = await SystemSetting.findOneAndUpdate(
        { key: provider },
        { $set: { value: { ...defaults, ...update } } },
        { upsert: true, new: true }
      );

      console.log(`⚙️ [${LABEL}] Config updated:`, result.value);
      res.json({ success: true, data: result.value });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  /* ─── OWNER CRUD ─────────────────────────────────── */
  router.get("/owners", async (_req, res) => {
    try {
      const filter: any = {};
      // Nếu owner model có field provider → filter theo provider
      // Fallback: lấy tất cả (backward compatible)
      filter.$or = [
        { provider: provider },
        { provider: { $exists: false } },
        { provider: null },
      ];
      const owners = await FxflowOwner.find(filter).sort({ createdAt: 1 }).lean();
      res.json({ success: true, data: owners });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

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
        provider,  // ✅ Gán provider cho owner
      });

      console.log(`👤 [${LABEL}] Owner created: ${owner.name} (${owner.status})`);
      res.json({ success: true, data: owner });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

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

      console.log(`👤 [${LABEL}] Owner updated: ${owner.name} → ${owner.status}`);
      res.json({ success: true, data: owner });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  router.delete("/owners/:id", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const owner = await FxflowOwner.findByIdAndDelete(req.params.id);
      if (!owner) {
        return res.status(404).json({ success: false, message: "Owner not found" });
      }

      console.log(`🗑️ [${LABEL}] Owner deleted: ${owner.name}`);
      res.json({ success: true, message: `Deleted owner: ${owner.name}` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  /* ─── GET /image/upload-tasks ────────────────────── */
  router.get("/image/upload-tasks", async (req, res) => {
    try {
      const owner = req.query.owner?.toString() || null;
      const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);

      const query: any = {
        status: "pending-fxflow-upload",
        imageUrl: { $ne: null },
      };

      if (owner) {
        query.source = owner;
      }

      const pendingImages = await ImageOwnerModel.find(query)
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();

      if (pendingImages.length === 0) {
        return res.json({ tasks: [] });
      }

      const ids = pendingImages.map((img: any) => img._id);
      await ImageOwnerModel.updateMany(
        { _id: { $in: ids } },
        { $set: { status: "processing" } }
      );

      const tasks = pendingImages.map((img: any) => ({
        jobId: String(img._id),
        imageUrl: img.imageUrl,
        fileName: img.originalName || "image.jpg",
        priority: 1,
      }));

      console.log(`📸 [${LABEL}] Dispatched ${tasks.length} image upload tasks`);
      return res.json({ tasks });
    } catch (err: any) {
      console.error(`[${LABEL}] GET /image/upload-tasks error:`, err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  /* ─── POST /image/upload-result ──────────────────── */
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

        console.log(`✅ [${LABEL}] Image upload done: ${id} → mediaId=${mediaId}`);

        await chainMediaIdToVideoJob(record, mediaId, provider);
      } else if (status === "error") {
        const retryCount = (record.retryCount || 0) + 1;
        record.retryCount = retryCount;

        if (retryCount >= 3) {
          record.status = "fail";
          record.errorMessage = error || "Upload failed after 3 retries";
          console.log(`❌ [${LABEL}] Image upload FAILED (max retries): ${id}`);

          await failLinkedVideoJob(record, error || "Reference image upload failed after 3 retries", provider);
        } else {
          record.status = "pending-fxflow-upload";
          record.errorMessage = error || "Upload failed, retrying...";
          console.log(`🔄 [${LABEL}] Image upload retry ${retryCount}/3: ${id}`);
        }

        await record.save();
      } else {
        return res.status(400).json({ message: "Invalid status or missing mediaId" });
      }

      return res.json({ success: true });
    } catch (err: any) {
      console.error(`[${LABEL}] POST /image/upload-result error:`, err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
}
