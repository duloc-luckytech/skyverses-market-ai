import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel";
import ImageJob, { ImageJobStatus, ImageJobType } from "../models/ImageJob";
import VideoJob, { VideoJobStatus, VideoJobType, VideoEngineProvider } from "../models/VideoJobModelV2";
import { authenticate } from "./auth";
import { getOrAssignOwnerForUser } from "./fxflow";
import { buildFinalImagePayload } from "../utils/buildFinalImagePayload";

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
============================================================ */
router.post("/external/video-task", authenticateApiToken, async (req: any, res) => {
  try {
    const {
      // Flat format (simple)
      prompt,
      type = "text-to-video",
      startImage,
      endImage,
      images,
      referenceVideo,
      audio,
      duration,
      aspectRatio,
      resolution,
      fps,
      style,
      mode,
      // Nested format (same as internal)
      input: rawInput,
      config: rawConfig,
      engine = {},
      enginePayload,
    } = req.body;

    // Support cả 2 format: flat hoặc nested (internal-style)
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

    const config: any = rawConfig ? { ...rawConfig } : {};
    if (duration) config.duration = duration;
    if (aspectRatio) config.aspectRatio = aspectRatio;
    if (resolution) config.resolution = resolution;
    if (fps) config.fps = fps;
    if (style) config.style = style;
    // Defaults
    if (!config.duration) config.duration = 5;
    if (!config.aspectRatio) config.aspectRatio = "16:9";
    if (!config.resolution) config.resolution = "720p";

    const finalEngine = {
      provider: engine.provider || "fxflow",
      model: engine.model || "veo_3_generate",
      version: engine.version || undefined,
    };

    // Build enginePayload for video (simple prompt-based)
    const builtEnginePayload = enginePayload || {
      prompt: input.prompt || "",
      mode: mode || "relaxed",
    };

    // Assign FXFlow owner
    let jobOwner: string | null = null;
    if (finalEngine.provider === "fxflow") {
      jobOwner = await getOrAssignOwnerForUser(req.user.userId);
    }

    const job = await VideoJob.create({
      userId: req.user.userId,
      type,
      input,
      config,
      engine: finalEngine,
      enginePayload: builtEnginePayload,
      status: VideoJobStatus.PENDING,
      creditsUsed: 0,
      owner: jobOwner,
    });

    console.log(`🎬 [EXT-API] Video task created: ${job._id} by ${req.user.email} type=${type} owner=${jobOwner}`);

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
   🔍 1️⃣1️⃣ External API: Get video job detail
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

export default router;
