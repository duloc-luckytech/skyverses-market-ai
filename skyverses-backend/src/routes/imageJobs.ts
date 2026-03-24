import express from "express";
import ImageJob, {
  ImageJobStatus,
  ImageJobType,
  ImageEngineProvider,
} from "../models/ImageJob";
import { authenticate } from "../routes/auth";
import { getAccessTokenForJob } from "../utils/getAccessTokenForJob";
import { buildFinalImagePayload } from "../utils/buildFinalImagePayload";
import ModelPricingMatrix from "../models/ModelPricingMatrix.model";
import User from "../models/UserModel";
import CreditTransaction from "../models/CreditTransaction.model";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ImageJobs
 *   description: AI Image generation jobs (async, polling-based)
 */

/* =====================================================
   CREATE IMAGE JOB
===================================================== */
/**
 * @swagger
 * /image-jobs:
 *   post:
 *     summary: Create an AI image generation job
 *     tags: [ImageJobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, engine, enginePayload]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [text_to_image, image_to_image, image_variation, image_upscale, image_edit]
 *                 example: text_to_image
 *               input:
 *                 type: object
 *                 properties:
 *                   prompt:
 *                     type: string
 *                     example: A cinematic cyberpunk dog walking in the rain
 *                   image:
 *                     type: string
 *                     example: https://cdn.example.com/input.png
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                   mask:
 *                     type: string
 *                     example: https://cdn.example.com/mask.png
 *               config:
 *                 type: object
 *                 properties:
 *                   width:
 *                     type: number
 *                     example: 1024
 *                   height:
 *                     type: number
 *                     example: 1024
 *                   aspectRatio:
 *                     type: string
 *                     example: 1:1
 *                   seed:
 *                     type: number
 *                   style:
 *                     type: string
 *                     example: cinematic
 *               engine:
 *                 type: object
 *                 required: [provider, model]
 *                 properties:
 *                   provider:
 *                     type: string
 *                     enum: [gommo, gemini, stable_diffusion, leonardo, fxlab]
 *                     example: gommo
 *                   model:
 *                     type: string
 *                     example: google_image_gen_4_5
 *               enginePayload:
 *                 type: object
 *                 description: Raw payload passed to the image engine
 *                 example:
 *                   prompt: A walking dog
 *                   privacy: PRIVATE
 *                   projectId: default
 *     responses:
 *       200:
 *         description: Image job created
 *       400:
 *         description: Invalid payload
 */
router.post("/", authenticate, async (req: any, res) => {
  const { type, input = {}, config = {}, engine, enginePayload } = req.body;

  if (!type || !engine?.provider || !engine?.model || !enginePayload) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  // ─── CREDIT DEDUCTION ───────────────────────────────
  const pricingModel = await ModelPricingMatrix.findOne({
    modelKey: engine.model,
    status: "active",
  });

  let creditCost = 0;
  if (pricingModel?.pricing) {
    // Get cost from pricing matrix: pricing[resolution]["0"] for images
    const resolutions = Object.keys(pricingModel.pricing);
    if (resolutions.length > 0) {
      const firstRes = resolutions[0];
      const durations = pricingModel.pricing[firstRes];
      creditCost = typeof durations === "number" ? durations : (durations?.["0"] || durations?.["1"] || Object.values(durations || {})[0] || 0);
    }
  }

  if (creditCost > 0) {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "USER_NOT_FOUND" });
    }
    if (user.creditBalance < creditCost) {
      return res.status(400).json({ message: "INSUFFICIENT_CREDITS", required: creditCost, balance: user.creditBalance });
    }

    // Atomic deduction
    user.creditBalance -= creditCost;
    await user.save();

    await CreditTransaction.create({
      userId: user._id,
      type: "CONSUME",
      amount: -creditCost,
      balanceAfter: user.creditBalance,
      source: "image_generation",
      note: `Image: ${engine.model} | ${type}`,
    });

    console.log(`💳 [CREDIT] ${user.email} -${creditCost} CR (image: ${engine.model}) → balance: ${user.creditBalance}`);
  }
  // ─── END CREDIT DEDUCTION ───────────────────────────

  const finalPayload = buildFinalImagePayload({ input, config, engine });

  /* =====================================================
     🎲 DYNAMIC PROVIDER SELECTION: gommo ↔ fxflow
     - Chỉ áp dụng cho model Google (imagen, google_image_gen/banana)
     - Model khác (Midjourney, Kling, etc.) → luôn gommo
     Config từ SystemSetting (CMS quản lý)
  ====================================================== */
  const finalEngine = { ...engine };
  const imgModelKey = (finalEngine.model || "").toLowerCase();
  const isGoogleImageModel = imgModelKey.includes("imagen") || imgModelKey.includes("google_image_gen");

  if (finalEngine.provider === "gommo" && isGoogleImageModel) {
    try {
      const mongoose = require("mongoose");
      const SystemSetting = mongoose.models.SystemSetting;
      const setting = SystemSetting ? await SystemSetting.findOne({ key: "fxflow" }).lean() : null;
      const fxConfig = { enabled: true, routingPercent: 100, ...(setting?.value || {}) };

      if (fxConfig.enabled && Math.random() * 100 < fxConfig.routingPercent) {
        finalEngine.provider = "fxflow";
        console.log(`🎲 [IMG] ${imgModelKey} → fxflow (routing: ${fxConfig.routingPercent}%)`);
      }
    } catch {
      // Fallback: giữ gommo nếu lỗi đọc config
    }
  }

  const job = await ImageJob.create({
    userId: req.user.userId,
    type,
    input,
    config,
    engine: finalEngine,
    finalPayload,
    enginePayload,
    status: ImageJobStatus.PENDING,
    creditsUsed: creditCost,
  });

  console.log(`📸 [IMG] CREATE job=${job._id} engine=${finalEngine.provider} model=${finalEngine.model} type=${type} cost=${creditCost}`);

  res.json({
    success: true,
    data: {
      status: job.status,
      jobId: job._id,
      result: job.result,
      creditsUsed: creditCost,
    },
  });
});

/* =====================================================
   LIST IMAGE JOBS (USER)
===================================================== */
/**
 * @swagger
 * /image-jobs:
 *   get:
 *     summary: List image jobs of current user
 *     tags: [ImageJobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: done
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *     responses:
 *       200:
 *         description: List of image jobs
 */
router.get("/", authenticate, async (req: any, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query: any = { userId: req.user.userId };
  if (status) query.status = status;

  const data = await ImageJob.find(query)
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const total = await ImageJob.countDocuments(query);

  res.json({
    data,
    pagination: {
      page: +page,
      limit: +limit,
      total,
    },
  });
});

/* =====================================================
   GET IMAGE JOB DETAIL
===================================================== */
/**
 * @swagger
 * /image-jobs/{id}:
 *   get:
 *     summary: Get image job detail
 *     tags: [ImageJobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image job detail
 *       404:
 *         description: Job not found
 */
router.get("/:id", authenticate, async (req: any, res) => {
  const job = await ImageJob.findOne({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!job) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json({
    status: job.status,
    data: {
      status: job.status,
      jobId: job._id,
      result: job.result,
    },
  });
});

/* =====================================================
   CANCEL IMAGE JOB
===================================================== */
/**
 * @swagger
 * /image-jobs/{id}/cancel:
 *   post:
 *     summary: Cancel a pending image job
 *     tags: [ImageJobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job cancelled
 *       400:
 *         description: Cannot cancel
 *       404:
 *         description: Job not found
 */
router.post("/:id/cancel", authenticate, async (req: any, res) => {
  const job = await ImageJob.findOne({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!job) {
    return res.status(404).json({ message: "Not found" });
  }

  if (![ImageJobStatus.PENDING, ImageJobStatus.POLLING].includes(job.status)) {
    return res.status(400).json({ message: "Cannot cancel job" });
  }

  job.status = ImageJobStatus.CANCELLED;
  await job.save();

  // ─── REFUND CREDITS ─────────────────────────────
  let refunded = 0;
  if (job.creditsUsed && job.creditsUsed > 0) {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.creditBalance += job.creditsUsed;
      await user.save();
      refunded = job.creditsUsed;

      await CreditTransaction.create({
        userId: user._id,
        type: "REFUND",
        amount: job.creditsUsed,
        balanceAfter: user.creditBalance,
        source: "image_cancel",
        note: `Refund cancelled image job: ${job._id}`,
      });

      console.log(`💳 [REFUND] ${user.email} +${refunded} CR (cancelled image job: ${job._id})`);
    }
  }

  res.json({ success: true, refunded });
});

router.get("/pending/fxlab", async (req, res) => {
  try {
    const jobs = await ImageJob.find({
      status: ImageJobStatus.PENDING,
      "engine.provider": "fxlab",

      // 🔑 chỉ lấy job chưa có captcha
      recaptchaToken: { $exists: false },
    })
      .sort({ createdAt: 1 })
      .limit(5)
      .select({
        _id: 1,
        type: 1,
        engine: 1,
        config: 1,
        input: 1,
        enginePayload: 1,
        createdAt: 1,
        finalPayload: 1
      })
      .lean();

    if (!jobs.length) {
      return res.json({
        success: true,
        jobs: [],
      });
    }

    // 🔐 lấy accessToken cho batch
    const accessToken = await getAccessTokenForJob();

    const jobsWithToken = jobs.map((job) => ({
      ...job,
      accessToken,
    }));

    return res.json({
      success: true,
      jobs: jobsWithToken,
    });
  } catch (err) {
    console.error("[ImageJobs] pending fxlab error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/submit-result-image/fxlab", async (req: any, res: any) => {
  try {
    const { resultImage, jobId } = req.body;

    if (!resultImage) {
      return res.status(400).json({
        success: false,
        message: "Missing resultImage",
      });
    }

    const job = await ImageJob.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "ImageJob not found",
      });
    }

    const { media } = resultImage;
    const data = media[0]?.image?.generatedImage;

    job.result = {
      images: data.fifeUrl ? [data.fifeUrl] : [],
      thumbnail: data.fifeUrl,
      imageId: data.mediaGenerationId,
      raw: data,
    } as any;

    job.status = ImageJobStatus.DONE;
    job.progress = { percent: 100, step: "done" };

    await job.save();

    return res.json({
      success: true,
      jobId: job._id,
      status: job.status,
    });
  } catch (err: any) {
    console.error("[POST /submit-result-image/fxlab]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/submit-captcha/fxlab", async (req, res) => {
  try {
    const { jobId, captchaToken } = req.body;

    if (!jobId || !captchaToken) {
      return res.status(400).json({ message: "Missing jobId or captchaToken" });
    }

    // 🔐 atomic update: chỉ nhận job đang PENDING
    let job = await ImageJob.findById(jobId);

    if (!job) {
      return res.status(409).json({
        message: "Job not found or already taken",
      });
    }
    job.recaptchaToken = captchaToken;
    job.save();

    res.json({
      success: true,
      data: {
        jobId: job._id,
        status: job.status,
      },
    });
  } catch (err) {
    console.error("[VideoJobs] submit captcha fxlab error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
