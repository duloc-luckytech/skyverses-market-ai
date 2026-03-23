import express from "express";
import axios from "axios";
import VideoConcatJob from "../models/VideoConcatJobModel";
import VideoJobModel from "../models/VideoJobModel";
import UserModel from "../models/UserModel";
import mongoose from "mongoose";
import { makeSlug } from "../utils/makeSlug";
import { authenticate } from "./auth";
import GoogleTokenModel from "../models/GoogleTokenModel";
import fs from "fs";
import path from "path";
import multer from "multer";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: AI Video
 *     description: API xử lý video AI — gồm proxy phát video, nối clip, và kiểm tra trạng thái concat
 */

/**
 * @swagger
 * /video/video-proxy:
 *   get:
 *     summary: Proxy phát video từ Google Storage hoặc bên thứ 3
 *     description: |
 *       Proxy để bypass CORS khi phát video từ Google Storage, Labs, GCS...
 *       Hỗ trợ **HTTP Range requests** để tua, phát từng đoạn hoặc ghép clip.
 *     tags: [AI Video]
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL gốc của video cần proxy
 *       - in: header
 *         name: Range
 *         schema:
 *           type: string
 *         description: Header Range (trình duyệt gửi khi tua / stream video)
 *     responses:
 *       200:
 *         description: Stream video thành công
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Thiếu tham số URL
 *       500:
 *         description: Lỗi khi tải video từ nguồn gốc
 */
router.get("/video-proxy", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const targetUrl = String(url);
    const range = req.headers.range;
    const headers: Record<string, string> = {};
    if (range) headers.Range = range;

    const response = await axios.get(targetUrl, {
      responseType: "stream",
      headers,
    });

    res.status(response.status);
    for (const [key, value] of Object.entries(response.headers)) {
      if (value) res.setHeader(key, value as string);
    }

    // ✅ Bỏ chặn CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    response.data.pipe(res);
  } catch (err: any) {
    res
      .status(err?.response?.status || 500)
      .send(err?.response?.statusText || "Error fetching video");
  }
});

/**
 * @swagger
 * /video/concat:
 *   post:
 *     summary: Tạo job nối video có trim (start/end)
 *     description: |
 *       Tạo 1 job nối video kèm start/end. Mỗi segment sẽ chỉ dùng phần video đã trim.
 *     tags: [AI Video]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               segments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     mediaId:
 *                       type: string
 *                     start:
 *                       type: number
 *                       description: thời gian bắt đầu (giây)
 *                     end:
 *                       type: number
 *                       description: thời gian kết thúc (giây)
 *                 example:
 *                   - mediaId: "abc123"
 *                     start: 0.5
 *                     end: 5.8
 *                   - mediaId: "xyz456"
 *                     start: 1.2
 *                     end: 6.0
 *     responses:
 *       200:
 *         description: Tạo job thành công
 */

router.post("/concat", authenticate, async (req: any, res) => {
  try {
    const { segments } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ⭐ Validate segments
    if (
      !Array.isArray(segments) ||
      segments.length < 1 ||
      !segments.every(
        (s) =>
          s.mediaId &&
          typeof s.start === "number" &&
          typeof s.end === "number" &&
          s.end > s.start
      )
    ) {
      return res.status(400).json({
        error:
          "Invalid segments format. Expect [{ mediaId, start, end }] with end > start",
      });
    }

    /* ----------------------------------------------------
       1️⃣ Lấy User để biết googleId
    ---------------------------------------------------- */
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.googleId) {
      return res.status(400).json({
        error: "User does not have a Google account assigned.",
      });
    }

    /* ----------------------------------------------------
       2️⃣ Lấy đúng GoogleToken theo googleId của user
    ---------------------------------------------------- */
    const tokenDoc = await GoogleTokenModel.findOne({
      _id: user.googleId,
      isActive: true,
    }).lean();

    if (!tokenDoc) {
      return res.status(404).json({
        error: "Google token not found or inactive.",
      });
    }

    const { email } = tokenDoc;

    /* ----------------------------------------------------
       3️⃣ Tạo job concat
    ---------------------------------------------------- */
    const job = await VideoConcatJob.create({
      userId,
      googleEmail: email, // ⭐ Chính xác chủ nhân
      segments,
      mediaIds: segments.map((s) => s.mediaId),
      status: "pending",
    });

    console.log(`🧩 [Concat] Job created by ${email} — id=${job._id}`);

    return res.json({
      success: true,
      jobId: job._id,
      googleEmail: email,
    });
  } catch (err: any) {
    console.error("❌ [Concat] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /video/concat/status/{jobId}:
 *   get:
 *     summary: Lấy trạng thái của job nối video
 *     description: |
 *       FE dùng route này để lấy tiến độ job concat mà không cần gọi Google API trực tiếp.
 *       Backend cron sẽ xử lý nối video & cập nhật trạng thái.
 *     tags: [AI Video]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của job concat
 *     responses:
 *       200:
 *         description: Trả về trạng thái job
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                   example: done
 *                 encodedVideo:
 *                   type: string
 *                   example: https://storage.googleapis.com/ai-sandbox-videofx/video/xxx
 *                 operationName:
 *                   type: string
 *                   example: operations/abc123
 *       404:
 *         description: Job không tồn tại
 *       500:
 *         description: Lỗi hệ thống
 */
router.get("/concat/status/:jobId", async (req, res) => {
  try {
    const job = await VideoConcatJob.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    return res.json({
      success: true,
      status: job.status,
      encodedVideo: job.encodedVideo, // giữ nguyên cho backward
      filePath: job.filePath || null, // ✅ thêm đường dẫn file concat tạm
      operationName: job.operationName,
      updatedAt: job.updatedAt,
    });
  } catch (err: any) {
    console.error("❌ [ConcatStatus] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/concat/file/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const filePath = path.join(process.cwd(), "tmp-videos", `${jobId}.mp4`);

    // Nếu ?check=1 → chỉ trả status chứ không stream (để FE kiểm tra file tồn tại)
    if (req.query.check === "1") {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ exists: false });
      }
      return res.json({ exists: true });
    }

    // --- NORMAL DOWNLOAD ---
    if (!fs.existsSync(filePath))
      return res.status(404).send("Concat file not found");

    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      "Content-Type": "video/mp4",
      "Content-Length": stat.size,
      "Access-Control-Allow-Origin": "*",
    });

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("❌ [ConcatFile] Error:", err);
    res.status(500).send("Error streaming concat video");
  }
});

router.get("/statistic", async (req: any, res) => {
  try {
    const { userId } = req.query;

    /* ================================
       1) Build match condition
    ================================= */
    const match: any = {};
    if (userId) {
      try {
        match.userId = new mongoose.Types.ObjectId(userId);
      } catch (e) {
        return res.json({
          success: true,
          total: 0,
          status: { pending: 0, processing: 0, done: 0, error: 0 },
          types: {
            text: 0,
            scene: 0,
            startImageGroup: 0,
            startEndGroup: 0,
            extendGroup: 0,
          },
        });
      }
    }

    /* ================================
       2) FAST AGGREGATION USING $facet
    ================================= */
    const result = await VideoJobModel.aggregate([
      { $match: match },

      {
        $facet: {
          // ----- Count by status -----
          status: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],

          // ----- Count by type -----
          types: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
              },
            },
          ],

          // ----- Total documents -----
          total: [{ $count: "total" }],
        },
      },
    ]);

    const facet = result[0] || {};

    /* ================================
       3) Parse RESULT
    ================================= */
    const total = facet.total?.[0]?.total || 0;

    const statusMap = {
      pending: 0,
      processing: 0,
      done: 0,
      error: 0,
    };

    facet.status?.forEach((s: any) => {
      if (s._id === "pending") statusMap.pending = s.count;
      else if (s._id === "processing") statusMap.processing = s.count;
      else if (s._id === "done") statusMap.done = s.count;
      else if (["error", "reject"].includes(s._id)) statusMap.error += s.count;
    });

    const typeMap = {
      text: 0,
      scene: 0,
      startImageGroup: 0,
      startEndGroup: 0,
      extendGroup: 0,
    };

    facet.types?.forEach((t: any) => {
      if (t._id === "text") typeMap.text = t.count;
      else if (t._id === "scene") typeMap.scene = t.count;
      else if (["start-image", "start-image-redirect"].includes(t._id))
        typeMap.startImageGroup += t.count;
      else if (["start-end-image", "start-end-image-redirect"].includes(t._id))
        typeMap.startEndGroup += t.count;
      else if (["text-for-extend", "extend-to-video"].includes(t._id))
        typeMap.extendGroup += t.count;
    });

    /* ================================
       4) RESPONSE
    ================================= */
    return res.json({
      success: true,
      userId: userId || null,
      total,
      status: statusMap,
      types: typeMap,
    });
  } catch (err: any) {
    console.error("❌ [VideoStatistic] Aggregate Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/statistic/chart", async (req: any, res) => {
  try {
    let { range = "7", type = "all", mode = "day", userId = null } = req.query;

    /* ============================
         SAFE QUERY OBJECT
    ============================ */
    const query: any = {};

    if (userId) {
      try {
        query.userId = new mongoose.Types.ObjectId(userId);
      } catch (e) {
        return res.json({
          success: true,
          chart: [],
          total: 0,
          mode,
          userId,
        });
      }
    }

    /* ============================
         FILTER TYPE GROUP
    ============================ */
    const typeMap: any = {
      text: ["text"],
      scene: ["scene"],
      "start-image": ["start-image", "start-image-redirect"],
      "start-end-image": ["start-end-image", "start-end-image-redirect"],
      extend: ["text-for-extend", "extend-to-video"],
    };

    if (type !== "all" && typeMap[type]) {
      query.type = { $in: typeMap[type] };
    }

    /* ============================
         FILTER DATE RANGE
    ============================ */
    if (range !== "all" && mode === "day") {
      const days = parseInt(range);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      query.createdAt = { $gte: fromDate };
    }

    /* =======================================
         MODE = DAY (YYYY-MM-DD)
    ======================================== */
    if (mode === "day") {
      const pipeline: any = [
        { $match: query },

        {
          $project: {
            localDate: {
              $dateToString: {
                timezone: "+07:00",
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          },
        },

        {
          $group: {
            _id: "$localDate",
            count: { $sum: 1 },
          },
        },

        { $sort: { _id: 1 } },
      ];

      const raw = await VideoJobModel.aggregate(pipeline);

      const chart = raw.map((r) => ({
        date: r._id,
        count: r.count,
      }));

      return res.json({
        success: true,
        mode,
        range,
        type,
        userId,
        total: chart.reduce((a, b) => a + b.count, 0),
        chart,
      });
    }

    /* =======================================
         MODE = HOUR (0–23)
    ======================================== */
    if (mode === "hour") {
      const pipeline: any = [
        { $match: query },

        {
          $project: {
            localHour: {
              $hour: {
                date: "$createdAt",
                timezone: "+07:00",
              },
            },
          },
        },

        {
          $group: {
            _id: "$localHour",
            count: { $sum: 1 },
          },
        },

        { $sort: { _id: 1 } },
      ];

      const raw = await VideoJobModel.aggregate(pipeline);

      const buckets = Array.from({ length: 24 }, (_, hr) => ({
        hour: `${hr}h`,
        count: raw.find((r) => r._id === hr)?.count || 0,
      }));

      return res.json({
        success: true,
        mode,
        type,
        userId,
        total: buckets.reduce((a, b) => a + b.count, 0),
        chart: buckets,
      });
    }

    return res.json({ success: true, total: 0, chart: [] });
  } catch (err: any) {
    console.error("❌ [VideoChart] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/list", async (req: any, res) => {
  try {
    const { page = 1, limit = 20, status, userId, type, keyword } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    /* ---------------------------
       BUILD QUERY
    ----------------------------*/
    const query: any = {};

    // Status
    if (status) {
      query.status = status === "error" ? { $in: ["error", "reject"] } : status;
    }

    // User
    if (userId) query.userId = userId;

    // Type
    if (type) query.type = type;

    /* ---------------------------
       🔍 SEARCH BY promptSlug
    ----------------------------*/
    if (keyword && keyword.trim() !== "") {
      const slug = makeSlug(keyword.trim());
      query.promptSlug = { $regex: slug, $options: "i" };
    }

    /* ---------------------------
       COUNT
    ----------------------------*/
    const total = await VideoJobModel.countDocuments(query);

    /* ---------------------------
       PAGINATION
    ----------------------------*/
    const items = await VideoJobModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    /* ---------------------------
       RESPONSE
    ----------------------------*/
    return res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      items,
    });
  } catch (err: any) {
    console.error("❌ [VideoListAPI] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});
router.get("/history", authenticate, async (req: any, res) => {
  try {
    let { page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    // ============================
    // 📌 Base query
    // ============================
    const query: any = {
      status: "done",
      fileUrl: { $exists: true, $ne: "" },
      groupName: { $exists: true, $ne: "" },
    };

    // Lọc theo user
    if (userId) {
      try {
        query.userId = new mongoose.Types.ObjectId(userId);
      } catch (e) {
        return res.json({
          success: true,
          history: [],
          totalVideoByGroup: {},
          page,
          limit,
        });
      }
    }

    // Chỉ lấy video 8 tiếng gần nhất
    const eightHoursAgoUTC = new Date(Date.now() - 8 * 3600 * 1000);
    query.createdAt = { $gte: eightHoursAgoUTC };

    // ============================
    // 📌 FETCH PAGE (NHANH)
    // ============================
    const history: any = await VideoJobModel.find(query)
      .sort({ createdAt: -1 }) // sort nhanh theo index
      .skip(skip)
      .limit(limit)
      .lean();

    // Nếu trang không có dữ liệu → trả luôn
    if (!history.length) {
      return res.json({
        success: true,
        history: [],
        totalVideoByGroup: {},
        page,
        limit,
      });
    }

    // ============================
    // 📌 LẤY DANH SÁCH GROUP TRONG TRANG
    // ============================
    const groupsInPage = [...new Set(history.map((v: any) => v.groupName))];

    // ============================
    // 📌 GROUP ONLY THESE GROUPS (SIÊU NHANH)
    // ============================
    const totalByGroup = await VideoJobModel.aggregate([
      {
        $match: {
          userId: query.userId,
          status: "done",
          groupName: { $in: groupsInPage },
          createdAt: { $gte: eightHoursAgoUTC },
        },
      },
      {
        $group: {
          _id: "$groupName",
          total: { $sum: 1 },
        },
      },
    ]);

    const totalVideoByGroup: Record<string, number> = {};
    totalByGroup.forEach((g) => {
      totalVideoByGroup[g._id] = g.total;
    });

    // ============================
    // 📌 RETURN RESULT
    // ============================
    return res.json({
      success: true,
      history,
      totalVideoByGroup,
      page,
      limit,
    });
  } catch (err: any) {
    console.error("❌ [VideoHistory] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

/* =========================
   MULTER CONFIG
========================= */
const upload = multer({
  storage: multer.diskStorage({
    destination: "/tmp",
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 150 * 1024 * 1024, // 150mb (tuỳ chỉnh)
  },
});

router.post("/video-upload", upload.single("video"), async (req, res) => {
  try {
    const file = req.file;
    const { domain = "aivideoauto.com" } = req.body;
    const accessToken = process.env.GOMMO_API_KEY;

    if (!file || !accessToken) {
      return res.status(400).json({
        message: "Missing video file or accessToken",
      });
    }

    /* =========================
         READ FILE → BASE64
      ========================= */
    const buffer = fs.readFileSync(file.path);
    const base64 = buffer.toString("base64");

    /* =========================
         BUILD FORM BODY
      ========================= */
    const formBody = new URLSearchParams({
      access_token: accessToken,
      domain,
      data: base64,
      file_name: file.originalname,
    }).toString();

    /* =========================
         CALL GOMMO API
      ========================= */
    const response = await axios.post(
      "https://api.gommo.net/ai/video-upload",
      formBody,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "*/*",
        },
        timeout: 120_000,
      }
    );

    /* =========================
         CLEAN TEMP FILE
      ========================= */
    fs.unlinkSync(file.path);

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (err: any) {
    console.error("[Gommo] video-upload error:", err?.response?.data || err);

    return res.status(500).json({
      success: false,
      message: "GOMMO_VIDEO_UPLOAD_FAILED",
      error: err?.response?.data || err.message,
    });
  }
});

export default router;
