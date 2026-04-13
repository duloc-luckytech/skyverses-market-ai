import express from "express";
import multer from "multer";
import fs from "fs/promises"; // ✅ Dùng fs async
import path from "path";
import axios from "axios";
import GoogleTokenModel from "../models/GoogleTokenModel";
import ImageOwnerModel from "../models/ImageOwnerModel";
import { authenticate } from "./auth";
import UserModel from "../models/UserModel";
import { checkPlanValidity } from "../utils/checkPlanValidity";
import ImageBase64Model from "../models/ImageBase64Model"; // ✅ THÊM
import PromptGenerationJob from "../models/PromptGenerationJob"; // ✅ THÊM
import ProviderTokenModel from "../models/ProviderToken.model";
import { downloadVideoFromUrl } from "../utils/downloadVideoFromUrl";
import { getAccessTokenForJob } from "../utils/getAccessTokenForJob";
import FxflowOwner from "../models/FxflowOwner.model"; // ✅ For auto-assigning upload owner

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // 👈 lưu vào RAM

const PREVIEW_DIR = path.join(__dirname, "../../uploads/previews");

// ✅ Tạo thư mục preview async, không block
(async () => {
  try {
    await fs.access(PREVIEW_DIR);
  } catch {
    await fs.mkdir(PREVIEW_DIR, { recursive: true });
  }
})();

/**
 * @swagger
 * /upload-media:
 *   post:
 *     summary: Upload hình ảnh để lấy mediaId từ Google AI Sandbox
 *     tags:
 *       - AI Sandbox
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh JPEG/PNG cần upload
 *               token:
 *                 type: string
 *                 description: Google OAuth2 Bearer token
 *     responses:
 *       200:
 *         description: Trả về mediaId dùng trong video API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 mediaId:
 *                   type: string
 *                 width:
 *                   type: integer
 *                 height:
 *                   type: integer
 *       400:
 *         description: Thiếu file hoặc token
 *       500:
 *         description: Lỗi từ phía server hoặc Google API
 */
router.post(
  "/upload-media",
  authenticate,
  upload.single("file"),
  async (req: any, res) => {
    const file = req.file;
    const userId = req?.user?.userId;

    if (!file) return res.status(400).json({ error: "⚠️ Missing file" });

    const check: any = await checkPlanValidity(userId);
    if (!check.valid)
      return res
        .status(check.status)
        .json({ success: false, error: check.message });

    try {
      const user = await UserModel.findById(userId).lean();
      if (!user?.googleId) throw new Error("❌ User chưa gán Google token");

      const gToken = await GoogleTokenModel.findById(user.googleId);
      if (!gToken?.isActive) throw new Error("❌ Google token không hợp lệ");

      const originalName = file.originalname;

      // ✅ Tạo record ImageOwner trước
      const record = await ImageOwnerModel.create({
        userId,
        googleEmail: gToken.email,
        originalName,
        status: "pending",
        imageUrl: null,
        mediaId: null,
        width: null,
        height: null,
      });

      // ✅ Lưu base64 ở collection riêng
      const base64 = file.buffer.toString("base64");

      await ImageBase64Model.create({
        imageId: record._id,
        base64,
      });

      // ✅ Lưu preview thumbnail
      const previewPath = path.join(PREVIEW_DIR, `${record._id}.jpg`);
      await fs.writeFile(previewPath, file.buffer);

      // 🧹 Giải phóng RAM
      file.buffer = null;

      return res.json({
        success: true,
        _id: record._id,
        originalName,
        status: "pending",
        mediaId: null,
        imageUrl: null,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

/**
 * @swagger
 * /upload-media/list:
 *   get:
 *     summary: Lấy danh sách ảnh đã upload theo user kèm tên ảnh & imageUrl
 *     tags:
 *       - AI Sandbox
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng ảnh mỗi trang (tối đa 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên ảnh (gần đúng)
 *     responses:
 *       200:
 *         description: Danh sách ảnh
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mediaId:
 *                         type: string
 *                       width:
 *                         type: integer
 *                       height:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       imageUrl:
 *                         type: string
 *                         nullable: true
 *                       originalName:
 *                         type: string
 *                         nullable: true
 */
router.get("/upload-media/list", authenticate, async (req: any, res) => {
  const userId = req?.user?.userId;
  if (!userId) return res.status(401).json({ error: "❌ Unauthorized" });

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const search = req.query.search?.toString().trim() || "";
  const source = req.query.source?.toString().trim(); // ✅ NEW

  try {
    /* ==========================
       🔎 FILTER
    ========================== */
    const filter: any = {
      userId,
    };

    // 🔍 search theo originalName
    if (search) {
      filter.originalName = { $regex: search, $options: "i" };
    }

    // 🔌 filter theo source (gommo | fxlab | ...)
    if (source) {
      filter.source = source;
    }

    // ⏰ filter theo maxAge (hours) — chỉ lấy hình trong N giờ gần nhất
    const maxAge = parseFloat(req.query.maxAge as string);
    if (maxAge > 0) {
      const cutoff = new Date(Date.now() - maxAge * 60 * 60 * 1000);
      filter.createdAt = { $gte: cutoff };
    }

    /* ==========================
       📦 QUERY
    ========================== */
    const total = await ImageOwnerModel.countDocuments(filter);

    const imageRecords: any[] = await ImageOwnerModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    /* ==========================
       📤 RESPONSE
    ========================== */
    return res.json({
      total,
      page,
      limit,
      data: imageRecords.map((item) => ({
        _id: item._id,
        mediaId: item.mediaId || null,
        width: item.width || null,
        height: item.height || null,
        createdAt: item.createdAt, // UTC ISODate
        imageUrl: item.imageUrl || null,
        status: item.status || "done",
        aspectRatio: item.aspectRatio || null,
        originalName: item.originalName || null,
        source: item.source || null, // ✅ trả về cho FE filter / badge
      })),
    });
  } catch (err) {
    console.error("❌ Error in /upload-media/list:", err);
    return res.status(500).json({ error: "Lỗi server khi truy vấn ảnh" });
  }
});

/**
 * @swagger
 * /upload-media/detail:
 *   get:
 *     summary: Lấy chi tiết 1 hình ảnh theo mediaId
 *     tags:
 *       - AI Sandbox
 *     parameters:
 *       - in: query
 *         name: mediaId
 *         schema:
 *           type: string
 *         required: true
 *         description: Media ID của ảnh đã upload
 *     responses:
 *       200:
 *         description: Trả về chi tiết hình ảnh
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mediaId:
 *                   type: string
 *                 width:
 *                   type: integer
 *                 height:
 *                   type: integer
 *                 imageUrl:
 *                   type: string
 *                 aspectRatio:
 *                   type: number
 *                 originalName:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Không tìm thấy hình ảnh
 */
router.get("/upload-media/detail", authenticate, async (req: any, res) => {
  const userId = req?.user?.userId;

  try {
    const recordId = req.query.id?.toString();
    if (!userId || !recordId)
      return res.status(400).json({ error: "Thiếu userId hoặc id" });

    const record: any = await ImageOwnerModel.findOne({
      userId,
      _id: recordId,
    });

    if (!record) return res.json(null);

    const recordObj = record.toObject();
    delete recordObj.base64;

    return res.json(recordObj);
  } catch (err: any) {
    return res.status(500).json({ error: "Lỗi server khi lấy chi tiết ảnh" });
  }
});

router.get("/preview/:id", async (req, res) => {
  try {
    const filePath = path.join(PREVIEW_DIR, `${req.params.id}.jpg`);
    await fs.access(filePath); // ✅ không block

    return res.sendFile(filePath);
  } catch {
    return res.status(404).json({ error: "Không tìm thấy preview" });
  }
});

router.get("/upload-media/image-proxy", async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing image URL" });
  }

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"] || "image/png";
    const base64 = Buffer.from(response.data).toString("base64");

    res.json({
      base64: `data:${contentType};base64,${base64}`,
    });
  } catch (err) {
    console.error("❌ Proxy image error:", err);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

/**
 * @swagger
 * /upload-media/clear:
 *   delete:
 *     summary: Xoá toàn bộ hình ảnh (ImageOwner + Base64 + preview) theo user hiện tại
 *     tags:
 *       - AI Sandbox
 *     responses:
 *       200:
 *         description: Đã xoá toàn bộ ảnh thành công
 *       500:
 *         description: Lỗi server khi xoá
 */
router.delete("/upload-media/clear", authenticate, async (req: any, res) => {
  const userId = req?.user?.userId;
  if (!userId) return res.status(401).json({ error: "❌ Unauthorized" });

  try {
    // 🔍 Lấy danh sách ảnh của user
    const images: any = await ImageOwnerModel.find({ userId })
      .select("_id")
      .lean();

    if (!images.length) {
      return res.json({ success: true, message: "Không có ảnh để xoá" });
    }

    const ids = images.map((img: any) => img._id);

    // ✅ Xoá trong Mongo
    await ImageOwnerModel.deleteMany({ _id: { $in: ids } });
    await ImageBase64Model.deleteMany({ imageId: { $in: ids } });

    console.log(`🧹 Cleared ${ids.length} images for user ${userId}`);

    return res.json({
      success: true,
      deleted: ids.length,
      message: `Đã xoá ${ids.length} ảnh thành công`,
    });
  } catch (err: any) {
    console.error("❌ Error in /upload-media/clear:", err);
    return res.status(500).json({ error: "Lỗi server khi xoá ảnh" });
  }
});

/**
 * @swagger
 * /upload-media/delete/{id}:
 *   delete:
 *     summary: Xoá 1 hình ảnh cụ thể theo ID
 *     tags:
 *       - AI Sandbox
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của record trong ImageOwnerModel
 *     responses:
 *       200:
 *         description: Đã xoá ảnh thành công
 *       404:
 *         description: Không tìm thấy ảnh hoặc không thuộc user hiện tại
 *       500:
 *         description: Lỗi server
 */
router.delete(
  "/upload-media/delete/:id",
  authenticate,
  async (req: any, res) => {
    const userId = req?.user?.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: "❌ Unauthorized" });
    if (!id) return res.status(400).json({ error: "Thiếu ID ảnh để xoá" });

    try {
      // 🔍 Kiểm tra quyền sở hữu ảnh
      const record = await ImageOwnerModel.findOne({ _id: id, userId });
      if (!record) {
        return res
          .status(404)
          .json({ error: "Ảnh không tồn tại hoặc không thuộc user này" });
      }

      // ✅ Xoá record chính
      await ImageOwnerModel.deleteOne({ _id: id });

      // ✅ Xoá base64 (nếu còn)
      await ImageBase64Model.deleteMany({ imageId: id });

      // ✅ Xoá preview file (nếu có)
      const previewPath = path.join(PREVIEW_DIR, `${id}.jpg`);
      try {
        await fs.unlink(previewPath);
      } catch {
        /* ignore if not exist */
      }

      console.log(
        `🗑️ [upload-media/delete] Deleted image ${id} for user ${userId}`
      );

      return res.json({
        success: true,
        id,
        message: "Đã xoá ảnh thành công",
      });
    } catch (err: any) {
      console.error("❌ Error in /upload-media/delete/:id:", err.message);
      return res.status(500).json({ error: "Lỗi server khi xoá ảnh" });
    }
  }
);

router.post(
  "/upload-media/upload-media-advanced",
  authenticate,
  upload.single("file"),
  async (req: any, res) => {
    const file = req.file;
    const userId = req?.user?.userId;

    if (!file) {
      return res.status(400).json({ error: "⚠️ Missing file" });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "⚠️ Missing prompt" });
    }

    /* ----------------------------------------------------
         CHECK PLAN
    ---------------------------------------------------- */
    const check: any = await checkPlanValidity(userId);
    if (!check.valid) {
      return res
        .status(check.status)
        .json({ success: false, error: check.message });
    }

    try {
      /* ----------------------------------------------------
           LOAD GOOGLE TOKEN
      ---------------------------------------------------- */
      const user = await UserModel.findById(userId).lean();
      if (!user?.googleId) throw new Error("❌ User chưa gán Google token");

      const gToken = await GoogleTokenModel.findById(user.googleId);
      if (!gToken?.isActive) throw new Error("❌ Google token không hợp lệ");

      const originalName = file.originalname;

      /* ----------------------------------------------------
           CREATE ImageOwner record — type = edit-image
      ---------------------------------------------------- */
      const record = await ImageOwnerModel.create({
        userId,
        googleEmail: gToken.email,
        originalName,
        type: "edit-image", // ⭐ quan trọng
        prompt, // ⭐ quan trọng
        status: "pending", // chờ cron editImageJob xử lý
        mediaIdEdit: null, // vì chưa upload lên Google
        width: null,
        height: null,
        imageUrl: null,
        mediaId: null,
      });

      /* ----------------------------------------------------
           Lưu base64 tạm (sẽ được cron upload)
      ---------------------------------------------------- */
      const base64 = file.buffer.toString("base64");

      await ImageBase64Model.create({
        imageId: record._id,
        base64,
      });

      /* ----------------------------------------------------
           Lưu preview thumbnail vào ổ đĩa
      ---------------------------------------------------- */
      const previewPath = path.join(PREVIEW_DIR, `${record._id}.jpg`);
      await fs.writeFile(previewPath, file.buffer);

      // Giải phóng RAM
      file.buffer = null;

      /* ----------------------------------------------------
           RESPONSE
      ---------------------------------------------------- */
      return res.json({
        success: true,
        _id: record._id,
        originalName,
        prompt,
        status: "pending",
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/upload-media/upload-media-advanced",
  authenticate,
  upload.single("file"),
  async (req: any, res) => {
    const file = req.file;
    const userId = req?.user?.userId;

    if (!file) {
      return res.status(400).json({ error: "⚠️ Missing file" });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "⚠️ Missing prompt" });
    }

    /* ----------------------------------------------------
         CHECK PLAN
    ---------------------------------------------------- */
    const check: any = await checkPlanValidity(userId);
    if (!check.valid) {
      return res
        .status(check.status)
        .json({ success: false, error: check.message });
    }

    try {
      /* ----------------------------------------------------
           LOAD GOOGLE TOKEN
      ---------------------------------------------------- */
      const user = await UserModel.findById(userId).lean();
      if (!user?.googleId) throw new Error("❌ User chưa gán Google token");

      const gToken = await GoogleTokenModel.findById(user.googleId);
      if (!gToken?.isActive) throw new Error("❌ Google token không hợp lệ");

      const originalName = file.originalname;

      /* ----------------------------------------------------
           CREATE ImageOwner record — type = edit-image
      ---------------------------------------------------- */
      const record = await ImageOwnerModel.create({
        userId,
        googleEmail: gToken.email,
        originalName,
        type: "edit-image", // ⭐ quan trọng
        prompt, // ⭐ quan trọng
        status: "pending", // chờ cron editImageJob xử lý
        mediaIdEdit: null, // vì chưa upload lên Google
        width: null,
        height: null,
        imageUrl: null,
        mediaId: null,
      });

      /* ----------------------------------------------------
           Lưu base64 tạm (sẽ được cron upload)
      ---------------------------------------------------- */
      const base64 = file.buffer.toString("base64");

      await ImageBase64Model.create({
        imageId: record._id,
        base64,
      });

      /* ----------------------------------------------------
           Lưu preview thumbnail vào ổ đĩa
      ---------------------------------------------------- */
      const previewPath = path.join(PREVIEW_DIR, `${record._id}.jpg`);
      await fs.writeFile(previewPath, file.buffer);

      // Giải phóng RAM
      file.buffer = null;

      /* ----------------------------------------------------
           RESPONSE
      ---------------------------------------------------- */
      return res.json({
        success: true,
        _id: record._id,
        originalName,
        prompt,
        status: "pending",
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/upload-media/generate-prompt-images",
  authenticate,
  async (req: any, res) => {
    const userId = req?.user?.userId;

    let { prompt, count, aspect, referenceMediaId, mode } = req.body;

    count = Number(count) || 1;
    count = Math.min(Math.max(count, 1), 4);

    if (!prompt) {
      return res.status(400).json({ error: "⚠️ Missing prompt" });
    }

    /* ⭐ CHUẨN HÓA referenceMediaId → ARRAY */
    if (!referenceMediaId) referenceMediaId = [];
    else if (!Array.isArray(referenceMediaId))
      referenceMediaId = [referenceMediaId];

    aspect = aspect || "IMAGE_ASPECT_RATIO_LANDSCAPE";

    /* ----------------------------------------------------
         CHECK PLAN
    ---------------------------------------------------- */
    const check: any = await checkPlanValidity(userId);
    if (!check.valid) {
      return res
        .status(check.status)
        .json({ success: false, error: check.message });
    }

    try {
      /* ----------------------------------------------------
         LOAD GOOGLE TOKEN
      ---------------------------------------------------- */
      const user = await UserModel.findById(userId).lean();
      if (!user?.googleId) throw new Error("❌ User chưa gán Google token");

      const gToken = await GoogleTokenModel.findById(user.googleId);
      if (!gToken?.isActive) throw new Error("❌ Google token không hợp lệ");

      /* ----------------------------------------------------
         GROUP ID
      ---------------------------------------------------- */
      const groupId = `grp_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

      /* ----------------------------------------------------
         TẠO IMAGE OWNER RECORDS
      ---------------------------------------------------- */
      const createdRecords = [];

      for (let i = 0; i < count; i++) {
        const record = await ImageOwnerModel.create({
          userId,
          googleEmail: gToken.email,
          originalName: null,
          prompt,
          groupId,

          type:
            referenceMediaId.length > 0
              ? "prompt-image-reference"
              : "prompt-image",

          status: "pending",
          width: null,
          height: null,
          imageUrl: null,
          mediaId: null,
          mediaIdEdit: null,

          referenceMediaId, // ⭐ ARRAY
        });

        createdRecords.push({
          _id: record._id,
          status: "pending",
        });
      }

      /* ----------------------------------------------------
         SAVE JOB FOR CRON
      ---------------------------------------------------- */
      const seeds = Array.from({ length: count }).map(() =>
        Math.floor(Math.random() * 999999)
      );

      await PromptGenerationJob.create({
        groupId,
        userId,
        googleEmail: gToken.email,
        mode,
        prompt,
        aspect,
        count,
        seeds,

        referenceMediaId, // ⭐ ARRAY

        ownerIds: createdRecords.map((x) => x._id),
        status: "pending",
      });

      /* ----------------------------------------------------
         RESPONSE
      ---------------------------------------------------- */
      return res.json({
        success: true,
        groupId,
        prompt,
        referenceMediaId,
        count,
        items: createdRecords,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

router.get("/upload-media/prompt-result", async (req, res) => {
  try {
    const { groupId } = req.query;

    if (!groupId) {
      return res.status(400).json({ error: "Missing groupId" });
    }

    // 🔍 Lấy job thuộc groupId
    const job = await PromptGenerationJob.findOne({ groupId }).lean();

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // 🔍 Lấy toàn bộ ImageOwner thuộc group
    const items: any = await ImageOwnerModel.find({ groupId }).lean();

    if (!items.length) {
      return res.status(404).json({ error: "No images found for groupId" });
    }

    const total = items.length;
    const done = items.filter((x: any) => x.status === "done").length;
    const failed = items.filter((x: any) => x.status === "fail").length;

    // Hoàn tất nếu done + fail == total
    const isCompleted = done + failed === total;

    return res.json({
      success: true,
      groupId,
      jobStatus: job.status, // pending, processing, done
      total,
      done,
      failed,
      createdAt: job.createdAt,
      completed: isCompleted,
      items: items.map((x: any) => ({
        _id: x._id,
        status: x.status,
        imageUrl: x.imageUrl || null,
        mediaId: x.mediaId || null,
      })),
    });
  } catch (err: any) {
    console.error("❌ Poll error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/upload-media/download", async (req: any, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("Missing url");

    const response = await axios.get(url, {
      responseType: "stream", // ⬅ stream = không bị lỗi size
      validateStatus: () => true, // ⬅ không chặn lỗi HTTP
    });

    // Nếu bị trả về HTML → lỗi
    if (!response.headers["content-type"]?.startsWith("image/")) {
      console.log("❌ ERROR CONTENT", await streamToString(response.data));
      return res.status(500).send("Image download failed");
    }

    // Forward headers
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="download.${getExt(
        response.headers["content-type"]
      )}"`
    );

    response.data.pipe(res);
  } catch (err) {
    console.error("Download proxy error:", err);
    res.status(500).send("Download failed");
  }
});

// Helper
function getExt(contentType: string) {
  return contentType.replace("image/", "");
}

function streamToString(stream: any): Promise<string> {
  const chunks: any[] = [];
  return new Promise((resolve) => {
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString()));
  });
}

router.get("/upload-media/recent", authenticate, async (req: any, res) => {
  try {
    const userId = req?.user?.userId;

    // 8 giờ trước
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);

    const items = await ImageOwnerModel.find({
      userId,
      status: "done",
      updatedAt: { $gte: eightHoursAgo },

      // ⭐ CHỈ LẤY 2 TYPE IMAGE
      type: { $in: ["prompt-image", "prompt-image-reference"] },
    })
      .sort({ updatedAt: -1 }) // mới → cũ
      .limit(20)
      .lean();

    return res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err: any) {
    console.error("❌ Recent images error:", err);
    return res.status(500).json({ error: err.message });
  }
});
/**
 * @swagger
 * /upload-media/bind-media:
 *   post:
 *     summary: Create new ImageOwner record from uploaded Google media
 *     tags:
 *       - AI Sandbox
 */
router.post("/upload-media/bind-media", authenticate, async (req: any, res) => {
  try {
    const userId = req?.user?.userId;
    const { mediaGenerationId, width, height, originalName } = req.body;

    if (!userId || !mediaGenerationId) {
      return res.status(400).json({
        success: false,
        error: "Missing mediaGenerationId",
      });
    }

    /* --------------------------------------------------
         🔐 LOAD USER + GOOGLE TOKEN
      -------------------------------------------------- */
    const user = await UserModel.findById(userId).lean();
    if (!user?.googleId) {
      return res
        .status(400)
        .json({ success: false, error: "User chưa gán Google token" });
    }

    const gToken = await GoogleTokenModel.findById(user.googleId);
    if (!gToken?.isActive) {
      return res
        .status(400)
        .json({ success: false, error: "Google token không hợp lệ" });
    }

    /* --------------------------------------------------
         🔑 NORMALIZE MEDIA ID
      -------------------------------------------------- */
    const mediaId = mediaGenerationId.mediaGenerationId || mediaGenerationId;

    /* --------------------------------------------------
         ✅ CREATE IMAGE OWNER
      -------------------------------------------------- */
    const record = await ImageOwnerModel.create({
      userId,
      googleEmail: gToken.email,

      originalName: originalName || null,

      type: "uploaded-image", // ⭐ phân biệt với prompt / edit
      status: "processing",

      mediaId,
      width: width ?? null,
      height: height ?? null,

      imageUrl: null,
    });

    return res.json({
      success: true,
      data: {
        _id: record._id,
        mediaId: record.mediaId,
        width: record.width,
        height: record.height,
        status: record.status,
        createdAt: record.createdAt,
      },
    });
  } catch (err: any) {
    console.error("❌ bind-media (insert) error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Create image record failed",
    });
  }
});

router.get(
  "/upload-media/google-access-token",
  authenticate,
  async (req: any, res) => {
    const userId = req?.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      /* --------------------------------------------------
         1️⃣ ƯU TIÊN TOKEN OWNER
      -------------------------------------------------- */
      let token = await GoogleTokenModel.findOne({
        ownerId: userId,
        isActive: true,
      }).lean();

      /* --------------------------------------------------
         2️⃣ FALLBACK: TOKEN CÓ userIds
      -------------------------------------------------- */
      if (!token) {
        token = await GoogleTokenModel.findOne({
          userIds: userId,
          isActive: true,
        }).lean();
      }

      if (!token) {
        return res.status(404).json({
          success: false,
          error: "Google token not found for this user",
        });
      }

      /* --------------------------------------------------
         3️⃣ RESPONSE
      -------------------------------------------------- */
      return res.json({
        success: true,
        accessToken: token.accessToken,
        email: token.email,
        tokenId: token._id,
        type: token.type,
        owner: token.ownerId ? String(token.ownerId) === String(userId) : false,
      });
    } catch (err: any) {
      console.error("❌ google-access-token error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to get Google access token",
      });
    }
  }
);

/**
 * @swagger
 * /upload-media/google-access-token:
 *   get:
 *     summary: Get Google accessToken from user.googleId
 *     tags:
 *       - AI Sandbox
 *     responses:
 *       200:
 *         description: Google access token
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Google token not found
 */
router.get(
  "/upload-media/google-access-token",
  authenticate,
  async (req: any, res) => {
    const userId = req?.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    //
    try {
      /* --------------------------------------------------
         1️⃣ LOAD USER
      -------------------------------------------------- */
      const user = await UserModel.findById(userId).lean();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      /* --------------------------------------------------
         2️⃣ USER MUST HAVE googleId
      -------------------------------------------------- */
      if (!user.googleId) {
        return res.status(404).json({
          success: false,
          error: "User has no Google token assigned",
        });
      }

      /* --------------------------------------------------
         3️⃣ LOAD GOOGLE TOKEN BY ID
      -------------------------------------------------- */
      const token = await GoogleTokenModel.findById(user.googleId).lean();

      if (!token || !token.isActive) {
        return res.status(404).json({
          success: false,
          error: "Google token is inactive or not found",
        });
      }

      /* --------------------------------------------------
         4️⃣ RESPONSE
      -------------------------------------------------- */
      return res.json({
        success: true,
        accessToken: token.accessToken,
        email: token.email,
        tokenId: token._id,
        type: token.type,
      });
    } catch (err: any) {
      console.error("❌ google-access-token error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to get Google access token",
      });
    }
  }
);

/**
 * @swagger
 * /media/image-upload:
 *   post:
 *     summary: Upload image via base64
 *     description: Upload an image using base64 encoding (used for AI image/video pipelines)
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - base64
 *               - fileName
 *               - size
 *             properties:
 *               base64:
 *                 type: string
 *                 description: Base64 encoded image string (without data:image/... prefix)
 *                 example: iVBORw0KGgoAAAANSUhEUgAA...
 *               fileName:
 *                 type: string
 *                 example: character_01.png
 *               size:
 *                 type: number
 *                 description: File size in bytes
 *                 example: 245678
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 imageUrl:
 *                   type: string
 *                   example: https://cdn.example.com/images/character_01.png
 *                 width:
 *                   type: number
 *                   example: 1024
 *                 height:
 *                   type: number
 *                   example: 1024
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Upload failed
 */

router.post("/media/image-upload", authenticate, async (req: any, res) => {
  try {
    const {
      base64,
      fileName,
      size,
      source = "gommo", // "gommo" | "fxlab"
      aspectRatio = "IMAGE_ASPECT_RATIO_LANDSCAPE",
    } = req.body;

    const userId = req?.user?.userId;

    /* =========================
       AUTH & VALIDATION
    ========================== */
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!base64 || !fileName || !size) {
      return res.status(400).json({
        error: "Missing base64 | fileName | size",
      });
    }

    /* =========================
       CREATE IMAGE OWNER RECORD (EARLY)
    ========================== */
    const imageRecord = await ImageOwnerModel.create({
      userId,
      source,
      type: "image",
      originalName: fileName,
      status: "processing-upload",
    });

    let imageUrl: string | null = null;
    let mediaId: string | null = null;
    let width: number | null = null;
    let height: number | null = null;

    /* =====================================================
       STEP 1️⃣ — GOMMO CDN UPLOAD (always — gets imageUrl)
    ====================================================== */
    const body = new URLSearchParams({
      access_token: process.env.GOMMO_API_KEY as string,
      domain: "aivideoauto.com",
      data: base64,
      project_id: "default",
      file_name: fileName,
      size: String(size),
    }).toString();

    const response = await axios.post(
      "https://api.gommo.net/ai/image-upload",
      body,
      {
        timeout: 120_000,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "https://aivideoauto.com",
          Referer: "https://aivideoauto.com/",
        },
      }
    );

    const data = response.data;

    if (!data?.imageInfo?.url) {
      throw new Error("GOMMO_IMAGE_UPLOAD_FAILED");
    }

    imageUrl = data.imageInfo.url;
    width = data.imageInfo?.width;
    height = data.imageInfo?.height;

    /* =====================================================
       STEP 2️⃣ — DEFER GOOGLE UPLOAD TO FXFLOW WORKER
       Default: 100% fxflow. Worker polls GET /fxflow/image/upload-tasks
       and uploads to Google to get mediaId, then reports back.
    ====================================================== */
    imageRecord.imageUrl = imageUrl;
    imageRecord.width = width || undefined;
    imageRecord.height = height || undefined;

    // ✅ Pick a random active fxflow owner and assign to source
    // so that worker query `?owner=X` can find this task
    try {
      const activeOwners = await FxflowOwner.find({
        $or: [
          { provider: "fxflow" },
          { provider: { $exists: false } },
          { provider: null },
        ],
        status: "active",
      }).lean();

      if (activeOwners.length > 0) {
        const randomOwner = activeOwners[Math.floor(Math.random() * activeOwners.length)];
        imageRecord.source = (randomOwner as any).name;
        console.log(`👤 [IMG-UPLOAD] Assigned fxflow owner: ${(randomOwner as any).name} → task ${imageRecord._id}`);
      } else {
        // Fallback: giữ source gốc (gommo/fxlab)
        imageRecord.source = source;
        console.warn(`⚠️ [IMG-UPLOAD] No active fxflow owners found, keeping source=${source}`);
      }
    } catch (ownerErr) {
      imageRecord.source = source;
      console.error(`❌ [IMG-UPLOAD] Failed to pick fxflow owner:`, ownerErr);
    }

    imageRecord.status = "pending-fxflow-upload"; // FXFlow worker will pick this up
    await imageRecord.save();

    console.log(`📸 [IMG] Created upload task: ${imageRecord._id} → fxflow (${fileName})`);

    /* =========================
       SUCCESS RESPONSE
    ========================== */
    return res.json({
      success: true,
      imageId: imageRecord._id,
      imageUrl,
      mediaId: null, // Will be filled async by FXFlow worker
      width,
      height,
      source,
    });
  } catch (err: any) {
    console.error("❌ IMAGE_UPLOAD_ERROR", err?.response?.data || err);

    return res.status(500).json({
      error: "IMAGE_UPLOAD_ERROR",
      message: err?.response?.data || err?.message,
    });
  }
});
router.post("/upload-media/download/by-url", async (req, res) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing fileUrl" });
  }

  try {
    await downloadVideoFromUrl(res, fileUrl);
  } catch (err: any) {
    console.error("❌ download-by-url failed:", err.message);
    res.status(500).json({ error: "Download failed" });
  }
});
router.post("/image/upscale", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing imageUrl",
      });
    }

    const accessToken = process.env.GOMMO_API_KEY;
    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: "GOMMO_MISSING_ACCESS_TOKEN",
      });
    }

    /* =========================
       BUILD FORM BODY
    ========================= */
    const body = new URLSearchParams();
    body.append("access_token", accessToken);
    body.append("domain", "aivideoauto.com");
    body.append("id_base", "image_resolution"); // 👈 upscale tool
    body.append("url", imageUrl);
    body.append("project_id", "default");

    /* =========================
       CALL GOMMO
    ========================= */
    const { data } = await axios.post(
      "https://api.gommo.net/api/apps/go-mmo/ai_templates/tools",
      body.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "https://aivideoauto.com",
          Referer: "https://aivideoauto.com/",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
        },
        timeout: 60_000,
      }
    );

    /* =========================
       PARSE RESPONSE (SAFE)
    ========================= */
    const imageInfo = data?.imageInfo || data?.imageInfo1;
    const resolution = imageInfo?.resolutions?.[0];

    if (!imageInfo || imageInfo.status !== "SUCCESS") {
      return res.status(500).json({
        success: false,
        message: "UPSCALE_NOT_SUCCESS",
        raw: data,
      });
    }

    /* =========================
       NORMALIZED RESPONSE
    ========================= */
    return res.json({
      success: true,
      data: {
        id: imageInfo.id_base,
        type: imageInfo.category || "UPSCALE",
        model: imageInfo.model || "upscale",
        status: imageInfo.status,
        runtime: data.runtime || null,

        creditUsed: Number(imageInfo.credit || 0),

        image: {
          url: imageInfo.url,
          preview: imageInfo.url_preview,
          width: resolution?.width || null,
          height: resolution?.height || null,
          oldWidth: resolution?.old?.width || null,
          oldHeight: resolution?.old?.height || null,
          aspectRatio: resolution?.aspect_ratio || null,
        },

        createdAt: imageInfo.created_at,
      },
    });
  } catch (err: any) {
    console.error("GOMMO_UPSCALE_ERROR:", err?.response?.data || err);

    return res.status(500).json({
      success: false,
      message: "GOMMO_UPSCALE_FAILED",
      error: err?.response?.data || err.message,
    });
  }
});

export default router;
