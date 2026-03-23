import express from "express";
import { authenticate } from "./auth";
import { init } from "../services/imageStartToVideo/init";
import GoogleTokenModel from "../models/GoogleTokenModel";
import ImageBase64ForJobModel from "../models/ImageBase64ForJobModel";
import UserModel from "../models/UserModel";
import multer from "multer";
import { checkUserVideoPermission } from "../utils/checkVideoQuota";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // tối đa 10MB
});
/**
 * @swagger
 * /generate-video-start-image:
 *   post:
 *     summary: Gửi prompt + 1 ảnh (startImage) để tạo video từ ảnh bắt đầu
 *     tags:
 *       - AI Video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - startImage
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "A lone samurai standing in the rain"
 *               startImage:
 *                 type: string
 *                 example: "CAMaJDAzMzA0MWUzLWQzYjUtNDc5Ni04MjZjLWEwNmZiNzAyZTg2ZiIDQ0FFKiQwNDUwMzZhMC03NTkxLTRhMzItYTU5Ni1lMjJiNDI2OWM3MzU"
 *     responses:
 *       200:
 *         description: Thành công - trả về object chứa jobId và prompt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: object
 *       400:
 *         description: Thiếu thông tin
 *       500:
 *         description: Lỗi xử lý nội bộ
 */

router.post(
  "/generate-video-start-image",
  authenticate,
  async (req: any, res: any) => {
    const {
      prompt,
      startImage,
      resolution,
      aspectRatio,
      projectId,
      projectName,
      groupName,
      freeCredit,
      quantity = 1,
      images,
      model,
      source,
      mode
    } = req.body;
    const userId = req.user?.userId || null;

    if (!prompt || !startImage) {
      return res
        .status(400)
        .json({ success: false, error: "⚠️ Missing prompt or startImage" });
    }

    const check = await checkUserVideoPermission(userId);

    if (!check.ok) {
      return res.status(check.status).json({
        success: false,
        message: check.message,
      });
    }

    try {
      const result = await init({
        prompt,
        startImage,
        aspectRatio,
        userId,
        type: "start-image",
        resolution,
        images,
        source,
        model,
        mode,
        projectId,
        projectName,
        freeCredit,
        groupName,
        quantity
      });

      return res.json({ success: true, result });
    } catch (err: any) {
      console.error("❌ Failed to create start-image job:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

router.post(
  "/generate-video-start-image/upload",
  authenticate,
  upload.single("file"),
  async (req: any, res: any) => {
    const file = req.file;
    const userId = req.user?.userId || null;
    const prompt = req.body.prompt;
    const aspectRatio = req.body.aspectRatio;
    const resolution = req.body.resolution;
    const projectId = req.body.projectId;
    const projectName = req.body.projectName;
    const groupName = req.body.groupName;
    const freeCredit = req.body.freeCredit;
    const quantity = req.body.quantity;
    

    if (!prompt || !file) {
      return res
        .status(400)
        .json({ success: false, error: "⚠️ Missing prompt or file" });
    }

    const check = await checkUserVideoPermission(userId);

    if (!check.ok) {
      return res.status(check.status).json({
        success: false,
        message: check.message,
      });
    }

    try {
      // 1️⃣ Tạo job tạm (startImage = null)
      const result = await init({
        prompt,
        startImage: null,
        aspectRatio,
        userId,
        type: "start-image-redirect",
        resolution,
        projectId,
        projectName,
        freeCredit,
        groupName,
        quantity
      });

      const jobId = result?.jobId;
      if (!jobId) {
        return res
          .status(500)
          .json({ success: false, error: "❌ Không tạo được jobId" });
      }

      // 2️⃣ Convert ảnh thành base64
      const base64 = file.buffer.toString("base64"); // ✅ KHÔNG cần fs.readFileSync

      const user = await UserModel.findById(userId).lean();
      if (!user?.googleId) throw new Error("❌ User chưa gán Google token");

      const gToken = await GoogleTokenModel.findById(user.googleId);
      if (!gToken?.isActive) throw new Error("❌ Google token không hợp lệ");

      // 3️⃣ Lưu vào DB để cron xử lý sau
      await ImageBase64ForJobModel.create({
        base64,
        type: "start-image",
        jobId,
        userId,
      });

      return res.json({ success: true, result });
    } catch (err: any) {
      console.error("❌ Upload start-image error:", err);
      return res.status(500).json({ success: false, error: err.message });
    } finally {
    }
  }
);
export default router;
