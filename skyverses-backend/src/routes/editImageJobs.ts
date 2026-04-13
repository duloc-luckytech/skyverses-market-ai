// ✅ routes/editImageJobs.ts — Edit Image Job API
// Tạo và poll kết quả các job chỉnh sửa ảnh (crop, draw) qua FxFlow worker
import express from "express";
import EditImageJob, { EditImageJobStatus } from "../models/EditImageJob";
import { getOrAssignOwnerForUser } from "./fxflow";
import { authenticate } from "./auth";

const router = express.Router();

/* =====================================================
   POST /edit-image-jobs — Tạo edit-image job mới
   Body: {
     mediaId: string,
     projectId: string,      // tạm thời fake
     editType: "crop" | "draw",
     cropCoordinates?: { top, left, right, bottom },
     drawPayload?: any,
   }
   Auth: optional (nếu gọi từ desktop app có thể skip)
===================================================== */
router.post("/", async (req: any, res) => {
  try {
    const {
      mediaId,
      projectId,
      editType,
      cropCoordinates,
      drawPayload,
    } = req.body;

    // ── Validate ─────────────────────────────────────────
    if (!mediaId || !projectId || !editType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: mediaId, projectId, editType",
      });
    }

    if (!["crop", "draw"].includes(editType)) {
      return res.status(400).json({
        success: false,
        message: 'editType must be "crop" or "draw"',
      });
    }

    if (editType === "crop") {
      const c = cropCoordinates;
      if (!c || c.top == null || c.left == null || c.right == null || c.bottom == null) {
        return res.status(400).json({
          success: false,
          message: "cropCoordinates {top, left, right, bottom} required for crop",
        });
      }
    }

    // ── Pick sticky fxflow owner ──────────────────────────
    const userId = req.user?.userId || null;
    let owner: string | null = null;
    if (userId) {
      owner = await getOrAssignOwnerForUser(userId, "fxflow");
    } else {
      // Không có userId → pick random owner
      const { pickRandomActiveOwner } = await import("./workerRouter");
      owner = await pickRandomActiveOwner("fxflow");
    }

    // ── Create job ────────────────────────────────────────
    const job = await EditImageJob.create({
      userId: userId || undefined,
      owner,
      mediaId,
      projectId,
      editType,
      cropCoordinates: editType === "crop" ? cropCoordinates : undefined,
      drawPayload:     editType === "draw" ? drawPayload : undefined,
      status: EditImageJobStatus.PENDING,
    });

    console.log(
      `✂️ [EDIT-IMG] CREATE job=${job._id} editType=${editType} mediaId=${mediaId} owner=${owner}`
    );

    return res.json({
      success: true,
      data: {
        jobId:  String(job._id),
        status: job.status,
        owner,
      },
    });
  } catch (err: any) {
    console.error("[EDIT-IMG] POST / error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* =====================================================
   GET /edit-image-jobs/:id — Poll job status
===================================================== */
router.get("/:id", async (req, res) => {
  try {
    const job = await EditImageJob.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.json({
      success: true,
      data: {
        jobId:    String(job._id),
        status:   job.status,
        editType: job.editType,
        result:   job.result || null,
        error:    job.error  || null,
        progress: job.progress || null,
      },
    });
  } catch (err: any) {
    console.error("[EDIT-IMG] GET /:id error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* =====================================================
   POST /edit-image-jobs/:id/cancel — Cancel pending job
===================================================== */
router.post("/:id/cancel", authenticate, async (req: any, res) => {
  try {
    const job = await EditImageJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.status !== EditImageJobStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: "Can only cancel PENDING jobs",
      });
    }

    job.status = EditImageJobStatus.CANCELLED;
    await job.save();

    console.log(`🚫 [EDIT-IMG] CANCELLED job=${job._id}`);
    return res.json({ success: true });
  } catch (err: any) {
    console.error("[EDIT-IMG] POST /:id/cancel error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
