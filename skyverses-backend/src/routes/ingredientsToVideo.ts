import express from "express";
import { init } from "../services/ingredientsToVideo/init";
import { authenticate } from "./auth";
import { checkUserVideoPermission } from "../utils/checkVideoQuota";

const router = express.Router();

/**
 * @swagger
 * /generate-video-scene:
 *   post:
 *     summary: Gửi prompt + mediaIds để tạo scene video bằng Google AI Labs
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
 *               - mediaIds
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "A fantasy dragon flying over a forest"
 *               mediaIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "CAMaJDAzZWQ2ZmFlLTBiYjYtNDIwMi04MGIxLTg1Nzg5NDdlYmE0YyIDQ0FFKiQ3ZjQzMGNkZi0yNzcwLTQ5MjgtYWE0ZC1jODhlMGVlYjVhNDY"
 *                   - "CAMaJDFmZGJkNzllLTc3MWItNGM1Ni04MjMwLWU2Y2NlYWYxZmNhZCIDQ0FFKiQ0MTRlNGYyMi1hYWJhLTRiNDYtOWYwMS00MmUxMGVmYzIxNTQ"
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
  "/generate-video-scene",
  authenticate,
  async (req: any, res: any) => {
    const { prompt, mediaIds, resolution, aspectRatio, groupName,freeCredit, quantity } = req.body;
    const userId = req.user?.userId || null; // ✅ hoặc bạn set cứng để test

    if (!prompt || !mediaIds?.length) {
      return res
        .status(400)
        .json({ success: false, error: "⚠️ Missing prompt or mediaIds" });
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
        mediaIds,
        userId,
        resolution,
        aspectRatio,
        groupName,
        freeCredit,
        quantity
      });

      return res.json({ success: true, result });
    } catch (err: any) {
      console.error("❌ Failed to create scene job:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

export default router;
