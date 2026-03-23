import express from "express";
import { authenticate } from "./auth";
import { generateLabsStartAndEndImageJob } from "../services/imageStartToEndVideo/init";
import GoogleTokenModel from "../models/GoogleTokenModel";
import ImageBase64ForJobModel from "../models/ImageBase64ForJobModel";
import UserModel from "../models/UserModel";
import { checkUserVideoPermission } from "../utils/checkVideoQuota";

import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // tối đa 10MB
});
const router = express.Router();

/**
 * @swagger
 * /generate-video-start-end-image:
 *   post:
 *     summary: Gửi prompt + 2 ảnh (startImage, endImage) để tạo video chuyển cảnh từ đầu đến cuối
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
 *               - endImage
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "A camera circles the hero before the big battle"
 *               startImage:
 *                 type: string
 *                 example: "MEDIA_ID_START"
 *               endImage:
 *                 type: string
 *                 example: "MEDIA_ID_END"
 *               aspectRatio:
 *                 type: string
 *                 example: "VIDEO_ASPECT_RATIO_LANDSCAPE"
 *     responses:
 *       200:
 *         description: Thành công - trả về jobId và prompt
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
  "/generate-video-start-end-image",
  authenticate,
  async (req: any, res: any) => {
    const {  images,
      model,
      source,
      mode,prompt, startImage, endImage, aspectRatio,resolution, groupName, freeCredit, quantity } = req.body;
    const userId = req.user?.userId || null;

    if (!prompt || !startImage || !endImage) {
      return res.status(400).json({
        success: false,
        error: "⚠️ Missing prompt, startImage, or endImage",
      });
    }

    const check = await checkUserVideoPermission(userId);

    if (!check.ok) {
      return res.status(check.status).json({
        success: false,
        message: check.message,
      });
    }

    try {
      const result = await generateLabsStartAndEndImageJob({
        prompt,
        images,
        model,
        mode,
        source,
        startImage,
        endImage,
        aspectRatio,
        userId,
        type:'start-end-image',
        resolution,
        groupName,
        freeCredit,
        quantity
      });

      return res.json({ success: true, result });
    } catch (err: any) {
      console.error("❌ Failed to create start-end-image job:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * @swagger
 * /generate-video-start-end-image/upload:
 *   post:
 *     summary: Upload hai hình ảnh (bắt đầu và kết thúc) để tạo video từ prompt
 *     description: |
 *       API này cho phép upload **2 file ảnh local** (một ảnh bắt đầu và một ảnh kết thúc)
 *       cùng với **prompt** mô tả cảnh. Ảnh sẽ được mã hóa base64 và lưu để cron xử lý sau.
 *     tags:
 *       - AI Video
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               startImage:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh bắt đầu (JPEG/PNG)
 *               endImage:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh kết thúc (JPEG/PNG)
 *               prompt:
 *                 type: string
 *                 description: Prompt mô tả nội dung video
 *               aspectRatio:
 *                 type: string
 *                 example: "16:9"
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   description: Kết quả job được tạo
 *       400:
 *         description: Thiếu dữ liệu (prompt hoặc file)
 *       401:
 *         description: Không có quyền (cần token)
 *       500:
 *         description: Lỗi server hoặc upload thất bại
 */

router.post(
  "/generate-video-start-end-image/upload",
  authenticate,
  upload.fields([
    { name: "startImage", maxCount: 1 },
    { name: "endImage", maxCount: 1 },
  ]),
  async (req: any, res: any) => {
    const startFile = req.files?.startImage?.[0];
    const endFile = req.files?.endImage?.[0];
    const userId = req.user?.userId || null;
    const prompt = req.body.prompt;
    const resolution = req.body.resolution;
    const aspectRatio = req.body.aspectRatio;
    const groupName = req.body.groupName;
    const freeCredit = req.body.freeCredit;
    const quantity = req.body.quantity;
    
    
    
    if (!prompt || !startFile || !endFile) {
      return res
        .status(400)
        .json({ success: false, error: "⚠️ Missing prompt or images" });
    }

    const check = await checkUserVideoPermission(userId);

    if (!check.ok) {
      return res.status(check.status).json({
        success: false,
        message: check.message,
      });
    }

    try {
      // 1️⃣ Tạo job tạm (chưa có mediaId)
      const result = await generateLabsStartAndEndImageJob({
        prompt,
        startImage: null,
        endImage: null,
        aspectRatio,
        userId,
        type:'start-end-image-redirect',
        resolution,
        groupName,
        freeCredit,
        quantity
      });

      const jobId = result?.jobId;
      if (!jobId) {
        return res
          .status(500)
          .json({ success: false, error: "❌ Không tạo được jobId" });
      }

      // 2️⃣ Convert ảnh thành base64
      const startBase64 = startFile.buffer.toString("base64");
      const endBase64 = endFile.buffer.toString("base64");

      const user = await UserModel.findById(userId).lean();
      if (!user?.googleId) throw new Error("❌ User chưa gán Google token");

      const gToken = await GoogleTokenModel.findById(user.googleId);
      if (!gToken?.isActive) throw new Error("❌ Google token không hợp lệ");

      // 3️⃣ Lưu vào DB để cron xử lý sau
      await ImageBase64ForJobModel.create({
        base64: startBase64,
        endBase64: endBase64,
        type: "start-end-image",
        jobId,
        userId,
      });

      return res.json({ success: true, result });
    } catch (err: any) {
      console.error("❌ Upload start-end-image error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

export default router;
