import express from "express";
import ImageJob, {
  ImageJobStatus,
  ImageJobType,
  ImageEngineProvider,
} from "../models/ImageJob";
import { authenticate } from "./auth";
import User from "../models/UserModel";
import CreditTransaction from "../models/CreditTransaction.model";
import ModelPricingMatrix from "../models/ModelPricingMatrix.model";
import SystemSetting from "../models/SystemSetting.model";

const router = express.Router();

const UPSCALE_DEFAULT_COST = 100;

/* =====================================================
   1. POST /image/upscale-batch
   FE gọi — tạo batch ImageJob type=image_upscale
===================================================== */
router.post("/upscale-batch", authenticate, async (req: any, res) => {
  try {
    const { provider = "fxflow", tasks } = req.body;
    const userId = req.user?.userId;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or empty tasks array",
      });
    }

    // ─── CREDIT CHECK ───
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });
    }

    // Lookup pricing
    let costPerTask = UPSCALE_DEFAULT_COST;
    try {
      const pricing = await ModelPricingMatrix.findOne({
        modelKey: "image_upscale",
        status: "active",
      }).lean();
      if (pricing?.pricing) {
        const resolutions = Object.keys(pricing.pricing);
        if (resolutions.length > 0) {
          const firstRes = resolutions[0];
          const durations = pricing.pricing[firstRes];
          costPerTask = typeof durations === "number" ? durations : (durations?.["0"] || UPSCALE_DEFAULT_COST);
        }
      }
    } catch {}

    const totalCost = tasks.length * costPerTask;
    if (user.creditBalance < totalCost) {
      return res.status(400).json({
        success: false,
        message: "INSUFFICIENT_CREDITS",
        required: totalCost,
        balance: user.creditBalance,
      });
    }

    // ─── DETERMINE PROVIDER ───
    // BE tự random provider giữa fxflow / gommo
    let finalProvider: ImageEngineProvider = ImageEngineProvider.FXFLOW;
    try {
      const setting: any = await SystemSetting.findOne({ key: "upscale_routing" }).lean();
      const config = { fxflowPercent: 100, ...(setting?.value || {}) };

      finalProvider =
        Math.random() * 100 < config.fxflowPercent
          ? ImageEngineProvider.FXFLOW
          : ImageEngineProvider.GOMMO;
    } catch {
      finalProvider = provider === "gommo" ? ImageEngineProvider.GOMMO : ImageEngineProvider.FXFLOW;
    }

    // ─── CREATE JOBS ───
    const createdJobs: Array<{ jobId: string; status: string }> = [];

    for (const task of tasks) {
      const { jobId, urlImage, resolution = "4K" } = task;

      if (!jobId || !urlImage) continue;

      const job = await ImageJob.create({
        userId,
        type: ImageJobType.IMAGE_UPSCALE,
        status: ImageJobStatus.PENDING,

        input: {
          image: urlImage,
        },

        config: {
          aspectRatio: resolution,
        },

        engine: {
          provider: finalProvider,
          model: "image_upscale",
        },

        enginePayload: {
          jobId,
          urlImage,
          resolution,
        },

        creditsUsed: costPerTask,
      });

      createdJobs.push({
        jobId: String(job._id),
        status: job.status,
      });
    }

    // ─── DEDUCT CREDITS ───
    const actualCost = createdJobs.length * costPerTask;
    user.creditBalance -= actualCost;
    await user.save();

    await CreditTransaction.create({
      userId: user._id,
      type: "CONSUME",
      amount: -actualCost,
      balanceAfter: user.creditBalance,
      source: "image_upscale",
      note: `Upscale batch: ${createdJobs.length} images`,
    });

    console.log(
      `📸 [UPSCALE] ${user.email} batch=${createdJobs.length} provider=${finalProvider} cost=${actualCost} balance=${user.creditBalance}`
    );

    return res.json({
      success: true,
      data: {
        accepted: createdJobs.length,
        jobs: createdJobs,
        creditsUsed: actualCost,
      },
    });
  } catch (err: any) {
    console.error("[UPSCALE] batch create error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =====================================================
   2. GET /image/upscale-tasks
   Bên thứ 3 pull — lấy danh sách pending tasks
   Trả format: { tasks: [{ jobId, mediaIdInput, resolution }] }
===================================================== */
router.get("/upscale-tasks/:provider", async (req, res) => {
  try {
    const { provider } = req.params;

    const filter: any = {
      type: ImageJobType.IMAGE_UPSCALE,
      status: ImageJobStatus.PENDING,
    };

    if (provider) {
      filter["engine.provider"] = provider;
    }

    const jobs = await ImageJob.find(filter)
      .sort({ createdAt: 1 })
      .limit(10)
      .select({
        _id: 1,
        enginePayload: 1,
        engine: 1,
        input: 1,
        createdAt: 1,
      })
      .lean();

    // Lookup mediaIdInput từ source ImageJob nếu có
    const tasks = await Promise.all(
      jobs.map(async (job: any) => {
        let mediaIdInput: string | null = null;

        const sourceJobId = job.enginePayload?.sourceImageJobId;
        if (sourceJobId) {
          try {
            const sourceJob = await ImageJob.findById(sourceJobId)
              .select({ "result.imageId": 1 })
              .lean();
            mediaIdInput = (sourceJob as any)?.result?.imageId || null;
          } catch {}
        }

        return {
          jobId: job._id.toString(),
          urlImage: job.enginePayload?.urlImage || job.input?.image || "",
          mediaIdInput,
          resolution: job.enginePayload?.resolution || "4K",
        };
      })
    );

    return res.json({
      success: true,
      tasks,
    });
  } catch (err: any) {
    console.error("[UPSCALE] get tasks error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =====================================================
   3. POST /image/upscale-result
   Bên thứ 3 gửi kết quả khi task done
   Body: { id, status, resultUrl, mediaId }
===================================================== */
router.post("/upscale-result", async (req, res) => {
  try {
    const { id, status, resultUrl, mediaId, error } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Missing id" });
    }

    const job = await ImageJob.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (status === "done" && resultUrl) {
      job.status = ImageJobStatus.DONE;
      job.result = {
        images: [resultUrl],
        thumbnail: resultUrl,
        imageId: mediaId || undefined,
      };
      job.progress = { percent: 100, step: "done" };

      console.log(`✅ [UPSCALE] job=${id} DONE → ${resultUrl}`);
    } else if (status === "error") {
      job.status = ImageJobStatus.ERROR;
      job.error = {
        message: error || "Upscale failed",
      };

      // ─── REFUND CREDITS ───
      if (job.creditsUsed && job.creditsUsed > 0) {
        const user = await User.findById(job.userId);
        if (user) {
          user.creditBalance += job.creditsUsed;
          await user.save();

          await CreditTransaction.create({
            userId: user._id,
            type: "REFUND",
            amount: job.creditsUsed,
            balanceAfter: user.creditBalance,
            source: "image_upscale_error",
            note: `Refund upscale error: ${id}`,
          });

          console.log(
            `💳 [REFUND] ${user.email} +${job.creditsUsed} CR (upscale error: ${id})`
          );
        }
      }

      console.log(`❌ [UPSCALE] job=${id} ERROR → ${error}`);
    } else {
      // processing / partial
      job.status = ImageJobStatus.PROCESSING;
    }

    await job.save();

    return res.json({
      success: true,
      jobId: id,
      status: job.status,
    });
  } catch (err: any) {
    console.error("[UPSCALE] submit result error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =====================================================
   4. GET /image/upscale-status/:jobId
   FE poll — kiểm tra trạng thái job
===================================================== */
router.get("/upscale-status/:jobId", authenticate, async (req: any, res) => {
  try {
    const job = await ImageJob.findOne({
      _id: req.params.jobId,
      userId: req.user.userId,
    })
      .select({
        _id: 1,
        status: 1,
        result: 1,
        error: 1,
        enginePayload: 1,
        config: 1,
      })
      .lean();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const data: any = {
      id: (job as any)._id.toString(),
      status: job.status,
    };

    if (job.status === ImageJobStatus.DONE && job.result) {
      data.resultUrl = job.result.images?.[0] || job.result.thumbnail;
      data.mediaId = job.result.imageId;
      data.width = job.result.width;
      data.height = job.result.height;
    }

    if (job.status === ImageJobStatus.ERROR && job.error) {
      data.error = job.error.message;
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error("[UPSCALE] status check error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =====================================================
   5. POST /image/upscale-from-job
   FE gọi từ page tạo hình — upscale ảnh đã generate
   Body: { imageJobId, resolution }
   BE tự lookup imageUrl từ ImageJob result
===================================================== */
router.post("/upscale-from-job", authenticate, async (req: any, res) => {
  try {
    const { imageJobId, resolution = "4K" } = req.body;
    const userId = req.user?.userId;

    if (!imageJobId) {
      return res.status(400).json({
        success: false,
        message: "Missing imageJobId",
      });
    }

    // ─── LOOKUP SOURCE IMAGE JOB ───
    const sourceJob = await ImageJob.findOne({
      _id: imageJobId,
      userId,
    }).lean();

    if (!sourceJob) {
      return res.status(404).json({
        success: false,
        message: "IMAGE_JOB_NOT_FOUND",
      });
    }

    if (sourceJob.status !== ImageJobStatus.DONE) {
      return res.status(400).json({
        success: false,
        message: "IMAGE_JOB_NOT_COMPLETED",
      });
    }

    const urlImage =
      sourceJob.result?.images?.[0] ||
      sourceJob.result?.thumbnail;

    if (!urlImage) {
      return res.status(400).json({
        success: false,
        message: "IMAGE_JOB_NO_RESULT_URL",
      });
    }

    // ─── CREDIT CHECK ───
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });
    }

    let costPerTask = UPSCALE_DEFAULT_COST;
    try {
      const pricing = await ModelPricingMatrix.findOne({
        modelKey: "image_upscale",
        status: "active",
      }).lean();
      if (pricing?.pricing) {
        const resolutions = Object.keys(pricing.pricing);
        if (resolutions.length > 0) {
          const firstRes = resolutions[0];
          const durations = pricing.pricing[firstRes];
          costPerTask = typeof durations === "number" ? durations : (durations?.["0"] || UPSCALE_DEFAULT_COST);
        }
      }
    } catch {}

    if (user.creditBalance < costPerTask) {
      return res.status(400).json({
        success: false,
        message: "INSUFFICIENT_CREDITS",
        required: costPerTask,
        balance: user.creditBalance,
      });
    }

    // ─── DETERMINE PROVIDER ───
    let finalProvider: ImageEngineProvider = ImageEngineProvider.FXFLOW;
    try {
      const setting: any = await SystemSetting.findOne({ key: "upscale_routing" }).lean();
      const config = { fxflowPercent: 100, ...(setting?.value || {}) };
      finalProvider =
        Math.random() * 100 < config.fxflowPercent
          ? ImageEngineProvider.FXFLOW
          : ImageEngineProvider.GOMMO;
    } catch {
      finalProvider = ImageEngineProvider.FXFLOW;
    }

    // ─── CREATE UPSCALE JOB ───
    const job = await ImageJob.create({
      userId,
      type: ImageJobType.IMAGE_UPSCALE,
      status: ImageJobStatus.PENDING,

      input: {
        image: urlImage,
      },

      config: {
        aspectRatio: resolution,
      },

      engine: {
        provider: finalProvider,
        model: "image_upscale",
      },

      enginePayload: {
        jobId: String(sourceJob._id),
        urlImage,
        resolution,
        sourceImageJobId: imageJobId,
      },

      creditsUsed: costPerTask,
    });

    // ─── DEDUCT CREDITS ───
    user.creditBalance -= costPerTask;
    await user.save();

    await CreditTransaction.create({
      userId: user._id,
      type: "CONSUME",
      amount: -costPerTask,
      balanceAfter: user.creditBalance,
      source: "image_upscale",
      note: `Upscale from image job: ${imageJobId}`,
    });

    console.log(
      `📸 [UPSCALE-FROM-JOB] ${user.email} source=${imageJobId} provider=${finalProvider} cost=${costPerTask} balance=${user.creditBalance}`
    );

    return res.json({
      success: true,
      data: {
        jobId: String(job._id),
        status: job.status,
        creditsUsed: costPerTask,
      },
    });
  } catch (err: any) {
    console.error("[UPSCALE] from-job error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
