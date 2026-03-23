import express from "express";
import { init, initExtend } from "../services/extendToVideo/init";
import axios from "axios";
import { authenticate } from "./auth";
import ffmpeg from "fluent-ffmpeg";
import { fetchImageMetadata } from "../utils/googleMedia";
import ImageOwnerModel from "../models/ImageOwnerModel";
import GoogleTokenModel from "../models/GoogleTokenModel";
import UserModel from "../models/UserModel";
import VideoJobModel from "../models/VideoJobModel";
import fs from "fs";
import { checkUserVideoPermission } from "../utils/checkVideoQuota";
import { makeSlug } from "../utils/makeSlug";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: AI Video
 *     description: AI Video Generation (Vertex AI Veo3)
 */

/**
 * @swagger
 * /extend-to-video/text-to-video:
 *   post:
 *     summary: Create AI video generation job (Vertex AI Veo3)
 *     tags:
 *       - AI Video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "A cinematic sunrise over a futuristic city skyline, flying cars, ultra-realistic."
 *               duration:
 *                 type: integer
 *                 example: 4
 *               resolution:
 *                 type: string
 *                 example: "720p"
 *               aspectRatio:
 *                 type: string
 *                 example: "VIDEO_ASPECT_RATIO_LANDSCAPE"
 *               generateAudio:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobId:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post("/text-to-video", authenticate, async (req: any, res) => {
  try {
    const {
      prompt,
      duration,
      projectName,
      resolution,
      aspectRatio,
      generateAudio,
      projectId,
    } = req.body;
    const userId = req.user?.userId;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const check = await checkUserVideoPermission(userId);

    if (!check.ok) {
      return res.status(check.status).json({
        success: false,
        message: check.message,
      });
    }

    // ✅ Gọi service generate video (có tạo job trong DB)
    const result = await init(
      prompt,
      duration || 8,
      {
        resolution: resolution || "720p",
        aspectRatio: aspectRatio || "16:9",
        generateAudio: generateAudio ?? true,
      },
      userId,
      projectName,
      projectId
    );

    // ✅ Trả về cho FE jobId (FE sẽ poll job theo ID)
    res.json({
      success: true,
      message: "Video generation job created.",
      jobId: result.jobId,
    });
  } catch (err: any) {
    console.error("❌ Error in /generate-video:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: AI Video
 *     description: AI Video Generation (Vertex AI Veo3)
 */
/**
 * @swagger
 * /extend-to-video:
 *   post:
 *     summary: Extend existing AI video using start/end frame range
 *     tags:
 *       - AI Video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Extend scene with evening city lights and flying drones."
 *               duration:
 *                 type: integer
 *                 example: 8
 *               resolution:
 *                 type: string
 *                 example: "720p"
 *               aspectRatio:
 *                 type: string
 *                 example: "VIDEO_ASPECT_RATIO_LANDSCAPE"
 *               generateAudio:
 *                 type: boolean
 *                 example: true
 *               projectName:
 *                 type: string
 *                 example: "My Awesome Video Project"
 *               mediaIdInputExtend:
 *                 type: string
 *                 example: "1234abcd-5678-ef90-xyz"
 *               startTime:
 *                 type: integer
 *                 example: 0
 *                 description: Frame to start extending from (calculated from user timeline)
 *               endTime:
 *                 type: integer
 *                 example: 8
 *                 description: Frame to stop extending
 *     responses:
 *       200:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobId:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post("/", authenticate, async (req: any, res) => {
  try {
    const {
      prompt,
      duration,
      resolution,
      aspectRatio,
      generateAudio,
      projectName,
      mediaIdInputExtend,
      startTime,
      endTime,
      projectId,
    } = req.body;

    const userId = req.user?.userId;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const check = await checkUserVideoPermission(userId);

    if (!check.ok) {
      return res.status(check.status).json({
        success: false,
        message: check.message,
      });
    }

    // ✅ Gọi init() với frame range
    const result = await initExtend(
      prompt,
      duration || 8,
      {
        resolution: resolution || "720p",
        aspectRatio: aspectRatio || "16:9",
        generateAudio: generateAudio ?? true,
      },
      userId,
      projectName,
      projectId,
      mediaIdInputExtend,
      startTime,
      endTime
    );

    res.json({
      success: true,
      message: "Extend video job created.",
      jobId: result.jobId,
    });
  } catch (err: any) {
    console.error("❌ Error in /extend-to-video:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /generate-video/{id}:
 *   get:
 *     summary: Get video generation job status
 *     tags:
 *       - AI Video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to check
 *     responses:
 *       200:
 *         description: Job info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 prompt:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, processing, done, error]
 *                 progress:
 *                   type: number
 *                 fileUrl:
 *                   type: string
 *                 errorMessage:
 *                   type: string
 */
router.get("/:id", async (req, res) => {
  try {
    const job = await VideoJobModel.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(job);
  } catch (err: any) {
    console.error("⚠️ Error fetching job:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /generate-video/{id}/download:
 *   get:
 *     summary: Download generated video file (valid within 10 minutes)
 *     tags:
 *       - AI Video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to download
 *     responses:
 *       200:
 *         description: Video file
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Job or file not found
 *       410:
 *         description: File expired
 */

router.get("/:id/download", async (req, res) => {
  const { id } = req.params;

  try {
    const job = await VideoJobModel.findById(id).lean();

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== "done" || !job.fileUrl) {
      return res.status(400).json({ error: "Video is not ready yet" });
    }

    // ✅ Gọi GCS để lấy file
    const response = await axios.get(job.fileUrl, {
      responseType: "arraybuffer",
    });

    res.set({
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="video_${id}.mp4"`,
    });

    res.send(Buffer.from(response.data));
  } catch (err: any) {
    console.error("❌ Error in /:id/download:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /generate-video/{id}/stream:
 *   get:
 *     summary: Stream video for preview (within 10 minutes)
 *     tags:
 *       - AI Video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to stream
 *     responses:
 *       200:
 *         description: Video stream
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Job or file not found
 *       410:
 *         description: File expired
 */
router.get("/:id/stream", async (req, res) => {
  const { id } = req.params;

  try {
    const job = await VideoJobModel.findById(id).lean();

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== "done" || !job.fileUrl) {
      return res.status(400).json({ error: "Video is not ready yet" });
    }

    // ✅ Redirect trực tiếp tới GCS signed URL
    return res.redirect(job.fileUrl);
  } catch (err: any) {
    console.error("❌ Error in /:id/stream:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /generate-video/cut-frame:
 *   post:
 *     summary: Cut a frame from a video at a given time (in seconds)
 *     tags:
 *       - AI Video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoUrl:
 *                 type: string
 *               time:
 *                 type: number
 *     responses:
 *       200:
 *         description: PNG frame image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post("/cut-frame", authenticate, async (req: any, res) => {
  const { videoUrl, time, fileName } = req.body;
  const userId = req?.user?.userId || null;

  if (!videoUrl || typeof time !== "number") {
    return res.status(400).json({ error: "Missing videoUrl or time" });
  }

  try {
    const timestamp = Date.now();
    const tempVideoPath = `/tmp/video_${timestamp}.mp4`;

    const safeFileName =
      typeof fileName === "string" && fileName.trim()
        ? fileName.trim().replace(/[^\w\-]+/g, "_")
        : `frame_${timestamp}`;
    const outputFileName = `${safeFileName}.png`;
    const tempFramePath = `/tmp/${outputFileName}`;

    // 1️⃣ Tải video tạm
    const writer = fs.createWriteStream(tempVideoPath);
    const videoRes = await axios.get(videoUrl, { responseType: "stream" });
    await new Promise((resolve, reject) => {
      videoRes.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // 2️⃣ Cắt frame
    await new Promise((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .screenshots({
          timestamps: [time],
          filename: outputFileName,
          folder: "/tmp",
          size: "1280x720",
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const user = await UserModel.findById(userId).lean();
    if (!user?.googleId) throw new Error("No googleId");

    const gToken = await GoogleTokenModel.findById(user.googleId);
    if (!gToken?.isActive) throw new Error("Google token inactive");

    // 3️⃣ Tạo record DB trước (processing)
    const record = await ImageOwnerModel.create({
      userId,
      googleEmail: gToken.email,
      mediaId: null,
      width: null,
      height: null,
      imageUrl: null,
      status: "processing",
      originalName: outputFileName,
    });

    // 4️⃣ Trả về ngay cho frontend
    res.json({
      success: true,
      status: "processing",
      _id: record._id,
      fileName: outputFileName,
      time,
    });

    // 5️⃣ Xử lý async upload Google AI Sandbox
    (async () => {
      try {
        const token = gToken.accessToken;
        const email = gToken.email;

        const buffer = fs.readFileSync(tempFramePath);
        const base64 = buffer.toString("base64");

        const payload = {
          clientContext: { sessionId: `${Date.now()}`, tool: "ASSET_MANAGER" },
          imageInput: {
            aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE",
            isUserUploaded: true,
            mimeType: "image/png",
            rawImageBytes: base64,
          },
        };

        const uploadRes = await axios.post(
          "https://aisandbox-pa.googleapis.com/v1:uploadUserImage",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const mediaId = uploadRes.data?.mediaGenerationId?.mediaGenerationId;
        if (!mediaId) throw new Error("Upload returned no mediaId");

        const width = uploadRes.data?.width;
        const height = uploadRes.data?.height;

        const { imageUrl } = await fetchImageMetadata(
          mediaId,
          email,
          5,
          1000,
          token
        );

        await ImageOwnerModel.findByIdAndUpdate(record._id, {
          googleEmail: email,
          mediaId,
          width,
          height,
          imageUrl,
          status: "done",
        });

        fs.unlinkSync(tempVideoPath);
        fs.unlinkSync(tempFramePath);

        console.log(`✅ Cut frame done: ${outputFileName}`);
      } catch (err: any) {
        console.error(`❌ Background cut-frame upload failed:`, err.message);
        await ImageOwnerModel.findByIdAndUpdate(record._id, {
          status: "error",
        });
      }
    })();
  } catch (err: any) {
    console.error("❌ Cut frame error:", err);
    return res.status(500).json({ error: "Failed to cut frame" });
  }
});

/**
 * @swagger
 * /generate-video/{id}:
 *   delete:
 *     summary: Delete a generated video job
 *     tags:
 *       - AI Video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của video job cần xoá
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Job not found
 */

router.delete("/:id", authenticate, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const job = await VideoJobModel.findById(id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // ✅ Chỉ cho phép xoá nếu là chủ sở hữu
    if (job.userId?.toString() !== userId?.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this video" });
    }

    // ✅ Xoá khỏi MongoDB

    await VideoJobModel.deleteOne({ _id: id });

    res.json({ success: true, message: "Video job deleted." });
  } catch (err: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/history/list", authenticate, async (req: any, res) => {
  try {
    const userId = req.user?.userId;

    // ⏱️ Tính thời gian 1 giờ trước
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const history = await VideoJobModel.find({
      userId,
      type: { $in: ["text-for-extend", "extend-to-video"] },
      status: "done",
      createdAt: { $gte: oneHourAgo }, // ⬅️ chỉ lấy trong 1 giờ gần nhất
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({ data: history || [] });
  } catch (err) {
    console.error("❌ Lỗi load history extend:", err);
    return res.status(500).json({ message: "Không thể tải lịch sử" });
  }
});

/**
 * @swagger
 * /extend-to-video/multi:
 *   post:
 *     summary: Generate multi-scene batch video (text → independent + extend chain)
 *     tags:
 *       - AI Video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               promptList:
 *                 type: array
 *                 items:
 *                   type: string
 *               aspectRatio:
 *                 type: string
 *               resolution:
 *                 type: string
 *               projectId:
 *                 type: string
 *               projectName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Created multi-scene jobs
 */
router.post("/multi", authenticate, async (req: any, res) => {
  const {
    prompts,
    aspectRatio = "VIDEO_ASPECT_RATIO_LANDSCAPE",
    resolution = "720p",
    projectId,
    projectName,
  } = req.body;

  const userId = req.user?.userId;

  if (!prompts?.length) {
    return res.status(400).json({ error: "Missing promptList" });
  }

  const groupName = `multi_${userId}_${Date.now()}`;
  const jobIds: string[] = [];

  for (let i = 0; i < prompts.length; i++) {
    const job = await VideoJobModel.create({
      userId,
      projectId,
      promptSlug: makeSlug(prompts[i]),
      projectName,
      prompt: prompts[i],
      sceneIndex: i,
      groupName,
      previousJobId: i === 0 ? null : jobIds[i - 1],

      // ⭐ TYPE MULTI-SCENE
      type: i === 0 ? "multi-scene-initial" : "multi-scene-extend",

      // ⭐ STATUS CHUẨN
      status: i === 0 ? "queued" : "blocked",

      aspectRatio,
      resolution,
    });

    jobIds.push(job._id.toString());
  }

  return res.json({
    success: true,
    groupName,
    totalScenes: prompts.length,
    jobIds,
  });
});
export default router;
