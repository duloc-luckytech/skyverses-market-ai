import express from "express";
import VideoJob, { VideoJobStatus } from "../models/VideoJobModelV2";
import { authenticate } from "./auth";
import { getAccessTokenForJob } from "../utils/getAccessTokenForJob";
import { getCookieForJob } from "../utils/getCookieForJob";

export const EXECUTION_CONFIGS = ["router_a"] as const;

export type ExecutionConfig = (typeof EXECUTION_CONFIGS)[number];

export function pickRandomExecutionConfig(): ExecutionConfig {
  return EXECUTION_CONFIGS[
    Math.floor(Math.random() * EXECUTION_CONFIGS.length)
  ];
}

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: VideoJobs
 *   description: Async video generation jobs (text-to-video, image-to-video, third-party engines)
 */

/* =====================================================
   CREATE VIDEO JOB
===================================================== */
/**
 * @swagger
 * /video-jobs:
 *   post:
 *     summary: Create a new video generation job
 *     tags: [VideoJobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, config, engine, enginePayload]
 *             properties:
 *               type:
 *                 type: string
 *                 example: text_to_video
 *
 *               input:
 *                 type: object
 *                 description: Input data for generation
 *                 example:
 *                   images:
 *                     -
 *
 *               config:
 *                 type: object
 *                 required: [duration]
 *                 properties:
 *                   duration:
 *                     type: number
 *                     example: 8
 *                   aspectRatio:
 *                     type: string
 *                     example: 16:9
 *                   resolution:
 *                     type: string
 *                     example: 720p
 *
 *               engine:
 *                 type: object
 *                 required: [provider, model]
 *                 properties:
 *                   provider:
 *                     type: string
 *                     example: gommo
 *                   model:
 *                     type: string
 *                     example: veo_3_1
 *
 *               enginePayload:
 *                 type: object
 *                 description: Raw payload for third-party engine (Gommo)
 *                 example:
 *                   accessToken: YOUR_GOMMO_ACCESS_TOKEN
 *                   prompt: A cinematic anime character walking through a neon city
 *                   privacy: PRIVATE
 *                   translateToEn: true
 *                   projectId: default
 *                   mode: relaxed
 *                   typeVideo: text-to-video
 *     responses:
 *       200:
 *         description: Job created successfully
 *       400:
 *         description: Invalid payload
 */
router.post("/", authenticate, async (req: any, res) => {
  const { type, input, config, engine, enginePayload } = req.body;

  if (!type || !engine?.provider || !engine?.model) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  let executor;
  if (engine?.provider == "fxlab") {
    executor = await getCookieForJob()
  }

  const job = await VideoJob.create({
    userId: req.user.userId,
    type,
    input,
    config,
    engine,
    enginePayload,
    executor,
    status: VideoJobStatus.PENDING,
  });

  console.log(`🎬 [VID] CREATE job=${job._id} engine=${engine.provider} model=${engine.model} type=${type}`);

  res.json({
    success: true,
    data: {
      status: job.status,
      jobId: job._id,
    },
  });
});

/* =====================================================
   GET VIDEO JOB DETAIL
===================================================== */
/**
 * @swagger
 * /video-jobs/{id}:
 *   get:
 *     summary: Get detail of a video job
 *     tags: [VideoJobs]
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
 *         description: Video job detail
 *       404:
 *         description: Job not found
 */
router.get("/:id", authenticate, async (req: any, res) => {
  const job = await VideoJob.findOne({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!job) return res.status(404).json({ message: "Not found" });
  res.json({
    status: "success",
    data: {
      status: job.status,
      jobId: job._id,
      error: {
        message: job?.error?.message,
        userMessage: job?.error?.userMessage,
      },
      result: job.result,
    },
  });
});

/**
 * @swagger
 * /video-jobs:
 *   get:
 *     summary: Get list of video jobs
 *     tags: [VideoJobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 */
router.get("/", authenticate, async (req: any, res) => {
  try {
    const {
      status = "done",
      type,
      provider,
      model,
      q,
      page = 1,
      limit = 10,
      sort = "createdAt",
    } = req.query;

    const query: any = {
      userId: req.user.userId,
    };

    // ---- FILTERS ----
    if (status) query.status = status;
    if (type) query.type = type;
    if (provider) query["engine.provider"] = provider;
    if (model) query["engine.model"] = model;

    // ---- SEARCH ----
    if (q) {
      query.$or = [
        { "input.prompt": { $regex: q, $options: "i" } },
        { _id: q }, // search by jobId
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      VideoJob.find(query)
        .sort({ [sort]: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select({
          status: 1,
          type: 1,
          input: 1,
          engine: 1,
          result: 1,
          enginePayload: 1,
          error: 1,
          createdAt: 1,
        })
        .lean(),

      VideoJob.countDocuments(query),
    ]);

    res.json({
      success: true,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
      data: jobs.map((job) => ({
        jobId: job._id,
        status: job.status,
        type: job.type,
        provider: job.engine?.provider,
        model: job.engine?.model,
        mode: job.enginePayload?.mode,
        prompt: job.enginePayload?.prompt,
        thumbnail: job.result?.thumbnailUrl,
        videoUrl: job.result?.videoUrl,
        createdAt: job.createdAt,
        error: job.error
          ? {
            message: job.error.message,
            userMessage: job.error.userMessage,
          }
          : null,
      })),
    });
  } catch (err) {
    console.error("[VideoJobs] list error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* =====================================================
   CANCEL VIDEO JOB
===================================================== */
/**
 * @swagger
 * /video-jobs/{id}/cancel:
 *   post:
 *     summary: Cancel a queued video job
 *     tags: [VideoJobs]
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
 *         description: Job cancelled successfully
 *       400:
 *         description: Job cannot be cancelled
 *       404:
 *         description: Job not found
 */
router.post("/:id/cancel", authenticate, async (req: any, res) => {
  const job = await VideoJob.findOne({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!job) return res.status(404).json({ message: "Not found" });
  if (job.status !== VideoJobStatus.PENDING) {
    return res.status(400).json({ message: "Cannot cancel" });
  }

  job.status = VideoJobStatus.CANCELLED;
  await job.save();

  res.json({ success: true });
});

/* =====================================================
   GET PENDING FXLAB JOBS (FOR LABS WORKER)
===================================================== */
/**
 * @swagger
 * /video-jobs/pending/fxlab:
 *   get:
 *     summary: Get pending video jobs for FX Labs worker
 *     tags: [VideoJobs]
 *     description: |
 *       Used by Labs extension worker.
 *       Returns a list of pending video jobs whose engine.provider = fxlab.
 *
 *     responses:
 *       200:
 *         description: List of pending FXLab jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       jobId:
 *                         type: string
 *                         example: 65f0d0c3a9b2a9e4c4c12345
 *                       type:
 *                         type: string
 *                         example: text-to-video
 *                       engine:
 *                         type: object
 *                         properties:
 *                           provider:
 *                             type: string
 *                             example: fxlab
 *                           model:
 *                             type: string
 *                             example: veo_3_1
 *                       config:
 *                         type: object
 *                         example:
 *                           duration: 8
 *                           aspectRatio: 16:9
 *
 *       500:
 *         description: Internal server error
 */
router.get("/pending/fxlab", async (req, res) => {
  try {
    const { executor } = req.query;

    if (!executor) {
      return res.status(400).json({
        message: "MISSING_EXECUTOR",
      });
    }

    const jobs = await VideoJob.find({
      status: VideoJobStatus.PENDING,
      "engine.provider": "fxlab",
      // 🔑 lọc theo executor
      executor,
    })
      .sort({ createdAt: 1 })
      .limit(1)
      .select({
        _id: 1,
        type: 1,
        executor: 1,
        engine: 1,
        config: 1,
        input: 1,
        enginePayload: 1,
        createdAt: 1,
      })
      .lean();
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

    res.json({ jobs });
  } catch (err) {
    console.error("[VideoJobs] pending fxlab error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/submit-result-video/fxlab", async (req: any, res: any) => {
  try {
    const { resultVideo, jobId, status, errorMessage } = req.body;



    const job = await VideoJob.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "VideoJob not found",
      });
    }


    if (status === 'failed') {

      job.status = VideoJobStatus.ERROR;
      job.error = JSON.parse(errorMessage);

    } else {
      const { operations } = resultVideo;
      const taskId = operations[0]?.operation?.name;
      const accessToken = await getAccessTokenForJob();


      job.engineResponse = {
        taskId: taskId,
        accessToken,
        pollStartedAt: new Date(),
      };

      job.status = VideoJobStatus.PROCESSING;

    }



    await job.save();

    return res.json({
      success: true,
      jobId: job._id,
      status: job.status,
    });
  } catch (err: any) {
    console.error("[POST /submit-result-video/fxlab]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/fxlab/submit-captcha", async (req, res) => {
  try {
    const { jobId, captchaToken } = req.body;

    if (!jobId || !captchaToken) {
      return res.status(400).json({ message: "Missing jobId or captchaToken" });
    }

    // 🔐 atomic update: chỉ nhận job đang PENDING
    let job = await VideoJob.findById(jobId);

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
