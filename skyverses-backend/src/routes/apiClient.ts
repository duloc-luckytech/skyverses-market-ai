import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel";
import ImageJob, { ImageJobStatus, ImageJobType } from "../models/ImageJob";
import VideoJob, { VideoJobStatus, VideoJobType, VideoEngineProvider } from "../models/VideoJobModelV2";
import { authenticate } from "./auth";
import { getOrAssignOwnerForUser } from "./fxflow";
import { buildFinalImagePayload } from "../utils/buildFinalImagePayload";
import ImageOwnerModel from "../models/ImageOwnerModel";
import BlogPost from "../models/BlogPost.model";
import { PRESET_CREATORS } from "./blog";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "11-aaa-gaxw";

/* ============================================================
   🔒 Middleware: Authenticate via API Token (Bearer)
   — Dùng cho external clients gọi API bằng token admin cấp
============================================================ */
const authenticateApiToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return res.status(401).json({ success: false, message: "Missing API token" });
  }

  try {
    const user = await UserModel.findOne({ apiToken: token }).lean();
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid API token" });
    }

    // ⏰ Check token expiration
    if (user.apiTokenExpiresAt && new Date(user.apiTokenExpiresAt) < new Date()) {
      return res.status(401).json({
        success: false,
        message: "API token has expired",
        expiredAt: user.apiTokenExpiresAt,
      });
    }

    req.user = { userId: user._id.toString(), email: user.email, role: user.role };
    req.apiUser = user;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Token verification failed" });
  }
};

/* ============================================================
   👤 1️⃣ Tạo khách hàng thủ công (Admin only)
   POST /api-client/create-customer
============================================================ */
router.post("/create-customer", authenticate, async (req: any, res) => {
  try {
    const currentUser = req.user;
    if (currentUser.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const { email, name, plan, creditBalance, generateToken, tokenExpiresIn } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email là bắt buộc" });
    }

    // Check duplicate
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email đã tồn tại trong hệ thống",
        userId: existing._id,
      });
    }

    // Generate unique invite code
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let inviteCode = "";
    while (true) {
      inviteCode = "";
      for (let i = 0; i < 8; i++) {
        inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const exists = await UserModel.findOne({ inviteCode });
      if (!exists) break;
    }

    // Generate API token if requested
    let apiToken: string | null = null;
    let apiTokenExpiresAt: Date | null = null;
    if (generateToken) {
      apiToken = `skv_${crypto.randomBytes(32).toString("hex")}`;
      // tokenExpiresIn: number of days, 0 or null = never expires
      if (tokenExpiresIn && tokenExpiresIn > 0) {
        apiTokenExpiresAt = new Date(Date.now() + tokenExpiresIn * 24 * 60 * 60 * 1000);
      }
    }

    const user = await UserModel.create({
      email,
      name: name || email.split("@")[0],
      inviteCode,
      role: "user",
      plan: plan || null,
      creditBalance: creditBalance || 0,
      apiToken,
      apiTokenCreatedAt: apiToken ? new Date() : null,
      apiTokenExpiresAt,
    });

    console.log(`👤 [API-CLIENT] Created customer: ${email} ${apiToken ? '(with token)' : ''}`);

    return res.json({
      success: true,
      message: "✅ Tạo khách hàng thành công",
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        creditBalance: user.creditBalance,
        inviteCode: user.inviteCode,
        apiToken: apiToken, // chỉ trả về 1 lần duy nhất
        apiTokenCreatedAt: user.apiTokenCreatedAt,
        apiTokenExpiresAt: user.apiTokenExpiresAt,
      },
    });
  } catch (err: any) {
    console.error("❌ [POST /api-client/create-customer]", err);
    return res.status(500).json({ success: false, message: err.message || "Internal error" });
  }
});

/* ============================================================
   🔑 2️⃣ Generate / Regenerate API Token cho user
   POST /api-client/generate-token
============================================================ */
router.post("/generate-token", authenticate, async (req: any, res) => {
  try {
    const currentUser = req.user;
    if (currentUser.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const { userId, tokenExpiresIn } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Thiếu userId" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }

    const newToken = `skv_${crypto.randomBytes(32).toString("hex")}`;
    user.apiToken = newToken;
    user.apiTokenCreatedAt = new Date();
    // tokenExpiresIn: number of days, 0 or null = never expires
    user.apiTokenExpiresAt = (tokenExpiresIn && tokenExpiresIn > 0)
      ? new Date(Date.now() + tokenExpiresIn * 24 * 60 * 60 * 1000)
      : null;
    await user.save();

    console.log(`🔑 [API-CLIENT] Token generated for: ${user.email} (expires: ${user.apiTokenExpiresAt || 'never'})`);

    return res.json({
      success: true,
      message: "✅ Token đã được tạo",
      data: {
        userId: user._id,
        email: user.email,
        apiToken: newToken,
        apiTokenCreatedAt: user.apiTokenCreatedAt,
        apiTokenExpiresAt: user.apiTokenExpiresAt,
      },
    });
  } catch (err: any) {
    console.error("❌ [POST /api-client/generate-token]", err);
    return res.status(500).json({ success: false, message: err.message || "Internal error" });
  }
});

/* ============================================================
   ⏰ 2.5 Update Token Expiry (WITHOUT regenerating token)
   PATCH /api-client/token-expiry
   Body: { userId, tokenExpiresIn }
     tokenExpiresIn: number of days → 0 or null = never expires
============================================================ */
router.patch("/token-expiry", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const { userId, tokenExpiresIn } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Thiếu userId" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }

    if (!user.apiToken) {
      return res.status(400).json({ success: false, message: "User chưa có token" });
    }

    // tokenExpiresIn: 0 or null = never expires
    user.apiTokenExpiresAt = (tokenExpiresIn && tokenExpiresIn > 0)
      ? new Date(Date.now() + tokenExpiresIn * 24 * 60 * 60 * 1000)
      : null;

    await user.save();

    console.log(`⏰ [API-CLIENT] Token expiry updated for: ${user.email} → expires: ${user.apiTokenExpiresAt || 'never'}`);

    return res.json({
      success: true,
      message: "✅ Đã cập nhật thời hạn token",
      data: {
        userId: user._id,
        email: user.email,
        apiTokenExpiresAt: user.apiTokenExpiresAt,
      },
    });
  } catch (err: any) {
    console.error("❌ [PATCH /api-client/token-expiry]", err);
    return res.status(500).json({ success: false, message: err.message || "Internal error" });
  }
});

/* ============================================================
   🚫 3️⃣ Revoke API Token
   POST /api-client/revoke-token
============================================================ */
router.post("/revoke-token", authenticate, async (req: any, res) => {
  try {
    const currentUser = req.user;
    if (currentUser.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Thiếu userId" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }

    user.apiToken = undefined as any;
    user.apiTokenCreatedAt = undefined as any;
    user.apiTokenExpiresAt = undefined as any;
    await user.save();

    console.log(`🚫 [API-CLIENT] Token revoked for: ${user.email}`);

    return res.json({
      success: true,
      message: "✅ Token đã bị thu hồi",
    });
  } catch (err: any) {
    console.error("❌ [POST /api-client/revoke-token]", err);
    return res.status(500).json({ success: false, message: err.message || "Internal error" });
  }
});

/* ============================================================
   📋 4️⃣ Danh sách API Clients (users có token)
   GET /api-client/list
============================================================ */
router.get("/list", authenticate, async (req: any, res) => {
  try {
    const currentUser = req.user;
    if (currentUser.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const { page = 1, pageSize = 20, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const filter: any = {};
    if (search) {
      filter.$or = [
        { email: new RegExp(String(search), "i") },
        { name: new RegExp(String(search), "i") },
      ];
    }

    const total = await UserModel.countDocuments(filter);
    const users = await UserModel.find(filter)
      .select("_id email name plan creditBalance role apiToken apiTokenCreatedAt apiTokenExpiresAt createdAt lastActiveAt fxflowOwner avatar")
      .sort({ apiTokenCreatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .lean();

    // Mask tokens + compute expiry status
    const now = new Date();
    const maskedUsers = users.map((u: any) => {
      const isExpired = u.apiTokenExpiresAt && new Date(u.apiTokenExpiresAt) < now;
      return {
        ...u,
        apiTokenFull: u.apiToken || null,
        apiToken: u.apiToken
          ? `${u.apiToken.slice(0, 12)}...${u.apiToken.slice(-4)}`
          : null,
        hasToken: !!u.apiToken,
        tokenExpired: isExpired || false,
      };
    });

    return res.json({
      success: true,
      data: maskedUsers,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize)),
    });
  } catch (err: any) {
    console.error("❌ [GET /api-client/list]", err);
    return res.status(500).json({ success: false, message: err.message || "Internal error" });
  }
});

/* ============================================================
   📊 5️⃣ API Client Stats
   GET /api-client/stats
============================================================ */
router.get("/stats", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const totalClients = await UserModel.countDocuments();
    const allTokens = await UserModel.countDocuments({ apiToken: { $exists: true, $ne: null } });
    const expiredTokens = await UserModel.countDocuments({
      apiToken: { $exists: true, $ne: null },
      apiTokenExpiresAt: { $lt: new Date() },
    });
    const activeTokens = allTokens - expiredTokens;
    
    // Pending image tasks
    const pendingImageTasks = await ImageJob.countDocuments({ status: ImageJobStatus.PENDING });
    const totalImageTasks = await ImageJob.countDocuments();

    // Pending video tasks
    const pendingVideoTasks = await VideoJob.countDocuments({ status: VideoJobStatus.PENDING });
    const totalVideoTasks = await VideoJob.countDocuments();

    return res.json({
      success: true,
      totalClients,
      activeTokens,
      pendingTasks: pendingImageTasks + pendingVideoTasks,
      totalTasks: totalImageTasks + totalVideoTasks,
      pendingImageTasks,
      totalImageTasks,
      pendingVideoTasks,
      totalVideoTasks,
    });
  } catch (err: any) {
    console.error("❌ [GET /api-client/stats]", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
});

/* ============================================================
   🎨 6️⃣ External API: Tạo Image Pending Task
   POST /api-client/external/image-task
   — Auth bằng Bearer Token (apiToken)
============================================================ */
router.post("/external/image-task", authenticateApiToken, async (req: any, res) => {
  try {
    const {
      // Flat format (simple)
      prompt,
      negativePrompt,
      image,
      images,
      mask,
      referenceImage,
      type = "text_to_image",
      width,
      height,
      aspectRatio,
      style,
      // Nested format (same as internal)
      input: rawInput,
      config: rawConfig,
      engine = {},
      enginePayload,
    } = req.body;

    // Support cả 2 format: flat hoặc nested (internal-style)
    const input: any = rawInput ? { ...rawInput } : {};
    if (prompt) input.prompt = prompt;
    if (negativePrompt) input.negativePrompt = negativePrompt;
    if (image) input.image = image;
    if (images) input.images = images;
    if (mask) input.mask = mask;
    if (referenceImage) input.referenceImage = referenceImage;

    if (!input.prompt && !input.image) {
      return res.status(400).json({
        success: false,
        message: "Cần ít nhất prompt hoặc image",
      });
    }

    const config: any = rawConfig ? { ...rawConfig } : {};
    if (width) config.width = width;
    if (height) config.height = height;
    if (aspectRatio) config.aspectRatio = aspectRatio;
    if (style) config.style = style;

    const finalEngine = {
      provider: engine.provider || "fxflow",
      model: engine.model || "google_image_gen_4_5",
      version: engine.version || undefined,
    };

    // ✅ Build finalPayload — giống hệt internal flow (imageJobs.ts)
    const finalPayload = buildFinalImagePayload({ input, config, engine: finalEngine });
    // enginePayload: nếu client gửi custom thì dùng, không thì dùng finalPayload
    const resolvedEnginePayload = enginePayload || finalPayload;

    // Assign FXFlow owner
    let jobOwner: string | null = null;
    if (finalEngine.provider === "fxflow") {
      jobOwner = await getOrAssignOwnerForUser(req.user.userId);
    }

    const job = await ImageJob.create({
      userId: req.user.userId,
      type,
      input,
      config,
      engine: finalEngine,
      finalPayload,
      enginePayload: resolvedEnginePayload,
      status: ImageJobStatus.PENDING,
      creditsUsed: 0,
      owner: jobOwner,
    });

    console.log(`🎨 [EXT-API] Image task created: ${job._id} by ${req.user.email} owner=${jobOwner}`);

    return res.json({
      success: true,
      data: {
        jobId: job._id,
        status: job.status,
        type: job.type,
        engine: finalEngine,
        owner: jobOwner,
        createdAt: job.createdAt,
      },
    });
  } catch (err: any) {
    console.error("❌ [POST /api-client/external/image-task]", err);
    return res.status(500).json({ success: false, message: err.message || "Internal error" });
  }
});

/* ============================================================
   📋 7️⃣ External API: List jobs của user
   GET /api-client/external/image-tasks
============================================================ */
router.get("/external/image-tasks", authenticateApiToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query: any = { userId: req.user.userId };
    if (status) query.status = status;

    const data = await ImageJob.find(query)
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .select("_id type status engine input config result progress error creditsUsed owner createdAt updatedAt")
      .lean();

    const total = await ImageJob.countDocuments(query);

    return res.json({
      success: true,
      data,
      pagination: { page: +page, limit: +limit, total },
    });
  } catch (err: any) {
    console.error("❌ [GET /api-client/external/image-tasks]", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
});

/* ============================================================
   🔍 8️⃣ External API: Get job detail
   GET /api-client/external/image-task/:id
============================================================ */
router.get("/external/image-task/:id", authenticateApiToken, async (req: any, res) => {
  try {
    const job = await ImageJob.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    }).lean();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.json({
      success: true,
      data: {
        jobId: job._id,
        type: job.type,
        status: job.status,
        engine: job.engine,
        input: job.input,
        config: job.config,
        result: job.result,
        progress: job.progress,
        error: job.error,
        owner: job.owner,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (err: any) {
    console.error("❌ [GET /api-client/external/image-task/:id]", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
});

/* ============================================================
   🎬 9️⃣ External API: Tạo Video Pending Task
   POST /api-client/external/video-task
   — Auth bằng Bearer Token (apiToken)
   — startImage/endImage/images nhận URL ảnh
   — Backend tự queue upload qua FXFlow → khi có mediaId
     MỚI tạo VideoJob
============================================================ */
router.post("/external/video-task", authenticateApiToken, async (req: any, res) => {
  try {
    const {
      prompt,
      type = "text-to-video",
      startImage,    // URL ảnh (https://...)
      endImage,      // URL ảnh (https://...)
      images,        // Array URL ảnh
      referenceVideo,
      audio,
      duration,
      aspectRatio,
      resolution,
      fps,
      style,
      mode,
      input: rawInput,
      config: rawConfig,
      engine = {},
      enginePayload,
    } = req.body;

    // Build input
    const input: any = rawInput ? { ...rawInput } : {};
    if (prompt) input.prompt = prompt;
    if (startImage) input.startImage = startImage;
    if (endImage) input.endImage = endImage;
    if (images) input.images = images;
    if (referenceVideo) input.referenceVideo = referenceVideo;
    if (audio) input.audio = audio;

    if (!input.prompt && !input.startImage && !input.images?.length) {
      return res.status(400).json({
        success: false,
        message: "Cần ít nhất prompt, startImage hoặc images",
      });
    }

    // Build config
    const config: any = rawConfig ? { ...rawConfig } : {};
    if (duration) config.duration = duration;
    if (aspectRatio) config.aspectRatio = aspectRatio;
    if (resolution) config.resolution = resolution;
    if (fps) config.fps = fps;
    if (style) config.style = style;
    if (!config.duration) config.duration = 5;
    if (!config.aspectRatio) config.aspectRatio = "16:9";
    if (!config.resolution) config.resolution = "720p";

    const finalEngine = {
      provider: engine.provider || "fxflow",
      model: engine.model || "veo_3_generate",
      version: engine.version || undefined,
    };

    const builtEnginePayload = enginePayload || {
      prompt: input.prompt || "",
      mode: mode || "relaxed",
    };

    // Assign FXFlow owner
    let jobOwner: string | null = null;
    if (finalEngine.provider === "fxflow") {
      jobOwner = await getOrAssignOwnerForUser(req.user.userId);
    }

    // ✅ Nếu có image URL (startImage/endImage/images) → vẫn tạo VideoJob trực tiếp
    // FXFlow worker sẽ nhận URL qua startMediaId trong GET /tasks/pending
    // KHÔNG còn queue qua FXFlow image upload (gây cancel)
    const finalType =
      (input.startImage || input.endImage || input.images?.length)
      && type === "text-to-video"
        ? "image-to-video"
        : type;

    console.log(
      `🎬 [EXT-API] Creating VideoJob directly: type=${finalType} ` +
      `startImage=${input.startImage || "none"} owner=${jobOwner}`
    );

    const job = await VideoJob.create({
      userId: req.user.userId,
      type: finalType,
      input,
      config,
      engine: finalEngine,
      enginePayload: builtEnginePayload,
      status: VideoJobStatus.PENDING,
      creditsUsed: 0,
      owner: jobOwner,
    });

    console.log(
      `🎬 [EXT-API] Video task created: ${job._id} by ${req.user.email} ` +
      `type=${finalType} owner=${jobOwner}`
    );

    return res.json({
      success: true,
      data: {
        jobId: job._id,
        status: job.status,
        type: job.type,
        engine: finalEngine,
        owner: jobOwner,
        createdAt: job.createdAt,
      },
    });
  } catch (err: any) {
    console.error("❌ [POST /api-client/external/video-task]", err);
    return res.status(500).json({ success: false, message: err.message || "Internal error" });
  }
});

/* ============================================================
   📋 🔟 External API: List video jobs của user
   GET /api-client/external/video-tasks
============================================================ */
router.get("/external/video-tasks", authenticateApiToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const query: any = { userId: req.user.userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const data = await VideoJob.find(query)
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .select("_id type status engine input config result progress error creditsUsed owner createdAt updatedAt")
      .lean();

    const total = await VideoJob.countDocuments(query);

    return res.json({
      success: true,
      data,
      pagination: { page: +page, limit: +limit, total },
    });
  } catch (err: any) {
    console.error("❌ [GET /api-client/external/video-tasks]", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
});

/* ============================================================
   🔍 1️⃣1️⃣ External API: Poll trạng thái video task
   GET /api-client/external/video-task-status/:id

   Nhận cả 2 loại ID:
   — imageUploadId → trả upload progress + videoJobId khi sẵn sàng
   — videoJobId → trả video generation status + result
============================================================ */
router.get("/external/video-task-status/:id", authenticateApiToken, async (req: any, res) => {
  try {
    const id = req.params.id;

    // 1️⃣ Thử tìm VideoJob trước
    const videoJob = await VideoJob.findOne({
      _id: id,
      userId: req.user.userId,
    }).lean();

    if (videoJob) {
      return res.json({
        success: true,
        phase: "video",
        data: {
          jobId: videoJob._id,
          type: videoJob.type,
          status: videoJob.status,
          engine: videoJob.engine,
          input: videoJob.input,
          config: videoJob.config,
          result: videoJob.result,
          progress: videoJob.progress,
          error: videoJob.error,
          owner: videoJob.owner,
          createdAt: videoJob.createdAt,
          updatedAt: videoJob.updatedAt,
        },
      });
    }

    // 2️⃣ Thử tìm ImageOwner (upload task)
    const imgRecord = await ImageOwnerModel.findOne({
      _id: id,
      userId: req.user.userId,
    }).lean() as any;

    if (imgRecord) {
      // Nếu đã có videoJobId → image upload xong, video đã được tạo
      if (imgRecord.videoJobId) {
        const linkedJob = await VideoJob.findById(imgRecord.videoJobId).lean();
        return res.json({
          success: true,
          phase: "video",
          imageUploadStatus: "done",
          mediaId: imgRecord.mediaId,
          data: linkedJob
            ? {
                jobId: linkedJob._id,
                type: linkedJob.type,
                status: linkedJob.status,
                result: linkedJob.result,
                progress: linkedJob.progress,
                error: linkedJob.error,
                createdAt: linkedJob.createdAt,
                updatedAt: linkedJob.updatedAt,
              }
            : null,
        });
      }

      // Image đang upload hoặc fail
      const uploadStatus = imgRecord.status === "done" ? "done"
        : imgRecord.status === "fail" ? "failed"
        : "uploading";

      return res.json({
        success: true,
        phase: "upload",
        data: {
          imageUploadId: imgRecord._id,
          status: uploadStatus,
          mediaId: imgRecord.mediaId || null,
          errorMessage: imgRecord.errorMessage || null,
          retryCount: imgRecord.retryCount || 0,
          createdAt: imgRecord.createdAt,
          updatedAt: imgRecord.updatedAt,
        },
      });
    }

    return res.status(404).json({ success: false, message: "ID not found" });
  } catch (err: any) {
    console.error("❌ [GET /api-client/external/video-task-status/:id]", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
});

/* ============================================================
   🔍 1️⃣2️⃣ External API: Get video job detail (legacy)
   GET /api-client/external/video-task/:id
============================================================ */
router.get("/external/video-task/:id", authenticateApiToken, async (req: any, res) => {
  try {
    const job = await VideoJob.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    }).lean();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.json({
      success: true,
      data: {
        jobId: job._id,
        type: job.type,
        status: job.status,
        engine: job.engine,
        input: job.input,
        config: job.config,
        result: job.result,
        progress: job.progress,
        error: job.error,
        owner: job.owner,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (err: any) {
    console.error("❌ [GET /api-client/external/video-task/:id]", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
});

/* ============================================================
   📰 EXTERNAL BLOG API — Dành cho bên thứ 3
   Auth bằng Bearer Token (apiToken giống image/video tasks)
   
   Mục đích:
   - Search/query danh sách blog → check duplicate trước khi viết
   - Tạo blog post mới qua API (AI writer, automation tools...)
============================================================ */

/* ─── GET /api-client/external/blog/search ─────────────────
   Search blog posts (all statuses visible to token owner)
   Query params:
     q        — keyword tìm trong title EN/VI, slug, excerpt
     slug     — exact slug match (check duplicate)
     category — filter theo category
     status   — "published" | "draft" | "all" (default: all)
     page     — trang (default: 1)
     limit    — số kết quả (default: 20, max: 50)
─────────────────────────────────────────────────────────── */
router.get("/external/blog/search", authenticateApiToken, async (req: any, res) => {
  try {
    const {
      q,
      slug,
      category,
      status = "all",
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    // Status filter
    if (status === "published") filter.isPublished = true;
    if (status === "draft") filter.isPublished = false;

    // Exact slug match (duplicate check)
    if (slug) {
      filter.slug = String(slug).trim().toLowerCase();
    }

    // Category filter
    if (category) {
      filter.category = { $regex: new RegExp(String(category), "i") };
    }

    // Keyword search across title + slug + excerpt
    if (q && !slug) {
      const keyword = String(q).trim();
      const regex = new RegExp(keyword, "i");
      filter.$or = [
        { "title.en": regex },
        { "title.vi": regex },
        { slug: regex },
        { "excerpt.en": regex },
        { "excerpt.vi": regex },
        { tags: regex },
      ];
    }

    const [items, total] = await Promise.all([
      BlogPost.find(filter)
        .select("_id slug title excerpt category tags isPublished isFeatured viewCount publishedAt createdAt order")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    console.log(`📰 [EXT-BLOG] Search by ${req.user.email}: q="${q || ""}" slug="${slug || ""}" → ${items.length} results`);

    return res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    console.error("❌ [GET /api-client/external/blog/search]", err);
    return res.status(500).json({ success: false, message: err.message || "Internal error" });
  }
});

/* ─── POST /api-client/external/blog ───────────────────────
   Tạo blog post mới (AI writer / automation gửi lên)
   Body:
     slug*         — unique URL slug
     title*        — { en: string, vi?: string, ko?: string, ja?: string }
     content*      — { en: string, vi?: string, ko?: string, ja?: string }
     excerpt       — { en: string, ... }
     coverImage    — URL ảnh bìa
     category      — mặc định "AI Tools"
     tags          — string[]
     isPublished   — mặc định false (tạo nháp trước)
     isFeatured    — mặc định false
     readTime      — số phút (default 5)
     seo           — { metaTitle, metaDescription, ogImage, keywords }
─────────────────────────────────────────────────────────── */
router.post("/external/blog", authenticateApiToken, async (req: any, res) => {
  try {
    const {
      slug,
      title,
      content,
      excerpt,
      coverImage,
      category = "AI Tools",
      tags = [],
      isPublished = false,
      isFeatured = false,
      readTime = 5,
      seo,
      order = 0,
    } = req.body;

    // Validate required fields
    if (!slug || !title?.en || !content?.en) {
      return res.status(400).json({
        success: false,
        message: "Thiếu field bắt buộc: slug, title.en, content.en",
      });
    }

    // Check slug duplicate
    const existing = await BlogPost.findOne({ slug: slug.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Slug đã tồn tại",
        existingId: existing._id,
        existingTitle: (existing as any).title?.en,
      });
    }

    // Auto-assign random creator (same as internal blog.ts)
    const author = PRESET_CREATORS[Math.floor(Math.random() * PRESET_CREATORS.length)];

    const post = await BlogPost.create({
      slug: slug.trim().toLowerCase(),
      title,
      content,
      excerpt: excerpt || { en: "", vi: "", ko: "", ja: "" },
      coverImage: coverImage || "",
      category,
      tags,
      author,
      isPublished,
      isFeatured,
      readTime,
      order,
      seo: seo || {
        metaTitle: title,
        metaDescription: excerpt || { en: "", vi: "" },
        ogImage: coverImage || "",
        keywords: tags,
      },
      publishedAt: isPublished ? new Date() : null,
      viewCount: 0,
    });

    console.log(`📰 [EXT-BLOG] Created post: "${post.slug}" by ${req.user.email} (published=${isPublished})`);

    return res.json({
      success: true,
      data: {
        _id: post._id,
        slug: (post as any).slug,
        title: (post as any).title,
        isPublished: (post as any).isPublished,
        createdAt: post.createdAt,
      },
    });
  } catch (err: any) {
    console.error("❌ [POST /api-client/external/blog]", err);
    return res.status(500).json({ success: false, message: err.message || "Internal error" });
  }
});

/* ─── PUT /api-client/external/blog/:id ────────────────────
   Cập nhật blog post đã tạo
   Chỉ hỗ trợ update các field nội dung, không đổi được author/viewCount
─────────────────────────────────────────────────────────── */
router.put("/external/blog/:id", authenticateApiToken, async (req: any, res) => {
  try {
    const allowedFields = [
      "title", "content", "excerpt", "coverImage", "category",
      "tags", "isPublished", "isFeatured", "readTime", "seo", "order",
    ];

    const update: any = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    // Auto-set publishedAt once when first publishing
    if (update.isPublished === true) {
      const existing = await BlogPost.findById(req.params.id);
      if (existing && !(existing as any).publishedAt) {
        update.publishedAt = new Date();
      }
    }

    const post = await BlogPost.findByIdAndUpdate(req.params.id, update, { new: true })
      .select("_id slug title isPublished isFeatured updatedAt");

    if (!post) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }

    console.log(`📰 [EXT-BLOG] Updated post: "${(post as any).slug}" by ${req.user.email}`);

    return res.json({ success: true, data: post });
  } catch (err: any) {
    console.error("❌ [PUT /api-client/external/blog/:id]", err);
    return res.status(500).json({ success: false, message: err.message || "Internal error" });
  }
});

export default router;

