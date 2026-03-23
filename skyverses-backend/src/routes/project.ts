import express from "express";
import Project from "../models/ProjectModel"; // 🔥 Model bạn vừa tạo
import { authenticate } from "./auth";
import VideoJob from "../models/VideoJobModel";
import { hoursAgoUTC } from "../utils/time";
import { SYSTEM_CONFIG } from "../constanst/index";

const router = express.Router();

/**
 * @swagger
 * /project:
 *   get:
 *     summary: Lấy danh sách project của user
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Thành công
 */

router.get("/", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    // Lấy mốc thời gian 8 giờ trước theo VN nhưng dùng UTC trong Mongo
    const fromDateUTC = hoursAgoUTC(4); // ← CHUẨN

    const projects = await Project.find({
      userId,
      createdAt: { $gte: fromDateUTC },
    })
      .sort({ createdAt: -1 })
      .lean();

    const enhanced = await Promise.all(
      projects.map(async (p: any) => {
        const totalVideos = await VideoJob.countDocuments({
          projectId: p._id,
        });
        return { ...p, totalVideos };
      })
    );

    return res.json({
      success: true,
      data: enhanced,
    });
  } catch (err: any) {
    console.error("❌ [GET /project]", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /project:
 *   post:
 *     summary: Tạo mới một project
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post("/", authenticate, async (req: any, res) => {
  try {
    const { name, description, slug } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên project không được để trống.",
      });
    }

    const newProject = await Project.create({
      userId: req.user.userId,
      name,
      description,
      slug,
    });

    return res.json({
      success: true,
      data: newProject,
    });
  } catch (err: any) {
    console.error("❌ [POST /project]", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo project.",
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /project/{id}:
 *   delete:
 *     summary: Xoá project theo ID
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;

    const project = await Project.findOne({
      _id: projectId,
      userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy project.",
      });
    }

    await project.deleteOne();

    return res.json({
      success: true,
      message: "Đã xoá project thành công.",
    });
  } catch (err: any) {
    console.error("❌ [DELETE /project]", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xoá project.",
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /project/{id}/videos:
 *   get:
 *     summary: Lấy danh sách video (scene) thuộc projectId
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/:id/videos", authenticate, async (req: any, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;

    // 🔥 Lấy toàn bộ job video thuộc projectId
    const jobs = await VideoJob.find({
      projectId,
      userId,
    }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: jobs,
    });
  } catch (err: any) {
    console.error("❌ [GET /project/:id/videos]", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách cảnh.",
      details: err.message,
    });
  }
});

export default router;
