import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import AiPrompt from "../models/AiPrompt";
import crypto from "crypto";
import { authenticate } from "./auth";
import UserModel from "../models/UserModel";
import path from "path";
import rateLimit from "express-rate-limit";

const fileLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests" },

  keyGenerator: (req): string => {
    const xfwd = req.headers["x-forwarded-for"];
    if (typeof xfwd === "string") {
      return xfwd.split(",")[0].trim();
    }

    const ip = Array.isArray(xfwd) ? xfwd[0] : req.ip || "unknown";

    return ip.toString();
  },
});

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ========================================================
   Helper Functions
======================================================== */

// 🔥 Remove BOM + normalize header
function normalizeHeader(h: string) {
  if (!h) return "";
  return h
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
}

// Extract URLs inside parentheses (…)
function parseExamples(text: string): string[] {
  if (!text) return [];

  const parts = text
    .split(/,(?=(?:[^\(]*\([^\)]*\))*[^\)]*$)/)
    .map((s) => s.trim());

  const urls: string[] = [];
  for (const part of parts) {
    const match = part.match(/\((https?:\/\/.*?)\)/);
    if (match) urls.push(match[1]);
  }
  return urls;
}

function parseTags(raw: string): string[] {
  if (!raw) return [];
  return raw
    .replace(/🎨/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Always get column regardless of header formatting
function getColumn(row: any, key: string) {
  const nk = normalizeHeader(key);

  const found = Object.keys(row).find((col) => normalizeHeader(col) === nk);

  return found ? row[found] : "";
}

// Shorten long text for title
function shorten(text: string, max = 48) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

/* ========================================================
   📌 1) IMPORT CSV
======================================================== */
router.post("/import/prompts", upload.single("file"), async (req: any, res) => {
  const rows: any[] = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      if (!rows.length) {
        return res.status(400).json({ error: "CSV empty" });
      }

      // Extract raw headers + normalized headers
      const rawHeaders = Object.keys(rows[0]);
      const headers = rawHeaders.map((h) => normalizeHeader(h));

      let docs: any[] = [];

      /* ------------------------------------------------------
         Detect IMAGE CSV
         Must contain "full prompt"
      ------------------------------------------------------ */
      const isImageCSV = headers.includes("full prompt");

      /* ------------------------------------------------------
         Detect VIDEO CSV
         Must contain both "details" and "prompt"
         (note: "details" may contain BOM in raw)
      ------------------------------------------------------ */
      const isVideoCSV =
        headers.includes("details") && headers.includes("prompt");

      /* ======================================================
         IMAGE CSV
      ====================================================== */
      if (isImageCSV) {
        docs = rows.map((r) => {
          const fullPrompt = getColumn(r, "Full Prompt");
          const attachments = getColumn(
            r,
            "Attachments (Downloadable, Expand)"
          );

          return {
            type: "image",
            sourceCSV: "image",

            title: shorten(fullPrompt),
            prompt: fullPrompt,

            platform: getColumn(r, "Category"),
            tags: parseTags(getColumn(r, "Type")),

            localExamples: parseExamples(attachments),
            exampleStatus: "processing",
            raw: r,
          };
        });
      } else if (isVideoCSV) {
        /* ======================================================
         VIDEO CSV
      ====================================================== */
        docs = rows.map((r) => {
          const details = getColumn(r, "Details");

          return {
            type: "video",
            sourceCSV: "video",

            title: shorten(details),
            prompt: getColumn(r, "Prompt"),

            platform: getColumn(r, "Type"),
            tags: parseTags(getColumn(r, "Tags")),

            localExamples: parseExamples(getColumn(r, "Still Shot/Video")),
            exampleStatus: "processing",
            raw: r,
          };
        });
      } else {
        /* ======================================================
         UNKNOWN CSV
      ====================================================== */
        return res.status(400).json({
          error: "CSV format not recognized",
          headers: rawHeaders,
          normalizedHeaders: headers,
        });
      }

      /* ======================================================
         INSERT INTO DB
      ====================================================== */
      await AiPrompt.insertMany(docs);
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        imported: docs.length,
        detected: docs[0].sourceCSV,
      });
    });
});

/* ========================================================
   📌 2) GET LIST
======================================================== */
router.get("/prompt/list", async (req, res) => {
  try {
    const items = await AiPrompt.find({}).sort({ createdAt: -1 }).limit(500);
    res.json({ items });
  } catch {
    res.status(500).json({ error: "Cannot load prompts" });
  }
});

/* ========================================================
   📌 NEW: PAGINATED LIST — GET /prompt/list-paged
======================================================== */
router.get("/prompt/list-paged", authenticate, async (req: any, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 30;

    const keyword = (req.query.keyword as string) || "";
    const type = req.query.type as string;
    const platform = req.query.platform as string;
    const tag = req.query.tag as string;

    const seed = Number(req.query.seed) || Date.now();

    // ============================
    // 1) LẤY USER TỪ DB
    // ============================
    const userId = req.user?.userId;
    const user = await UserModel.findById(userId).lean();

    const userPlan = user?.plan || "free";
    const role = user?.role || "user";

    // ============================
    // 2) SHARE ACCESS FILTER
    // ============================
    let shareFilter: any = {};

    if (role === "admin" || role === "master") {
      // full quyền
    } else {
      switch (userPlan) {
        case "free":
          shareFilter.shareAccess = "all";
          break;

        case "trial":
          shareFilter.shareAccess = { $in: ["trial", "all"] };
          break;

        case "plan1":
          shareFilter.shareAccess = { $in: ["plan1", "all"] };
          break;

        case "plan2":
          shareFilter.shareAccess = {
            $in: ["plan2", "plan1", "trial", "all"],
          };
          break;

        default:
          shareFilter.shareAccess = "all";
      }
    }

    // ============================
    // 3) MAIN FILTER
    // ============================
    const filter: any = {
      type: "video",
      ...shareFilter,
    };

    if (keyword) {
      filter.$or = [
        { title: new RegExp(keyword, "i") },
        { prompt: new RegExp(keyword, "i") },
      ];
    }

    if (type && type !== "all") filter.type = type;
    if (platform && platform !== "all") filter.platform = platform;
    if (tag && tag !== "all") filter.tags = tag;

    // ============================
    // 4) RANDOM + PAGING
    // ============================
    const allIds = await AiPrompt.find(filter).select("_id");

    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const shuffled = allIds
      .map((item: any) => ({
        _id: item._id,
        randomSort: seededRandom(
          seed +
            parseInt(
              crypto
                .createHash("md5")
                .update(item._id.toString())
                .digest("hex")
                .substring(0, 8),
              16
            )
        ),
      }))
      .sort((a, b) => a.randomSort - b.randomSort);

    const total = shuffled.length;
    const totalPages = Math.ceil(total / pageSize);

    const pageIds = shuffled
      .slice((page - 1) * pageSize, page * pageSize)
      .map((x) => x._id);

    const items = await AiPrompt.find({ _id: { $in: pageIds } });

    res.json({
      success: true,
      page,
      pageSize,
      seed,
      total,
      totalPages,
      items,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cannot load paged prompts" });
  }
});
/* ========================================================
   📌 3) GET DETAIL
======================================================== */
router.get("/prompt/:id", async (req, res) => {
  try {
    const item = await AiPrompt.findById(req.params.id);
    res.json({ item });
  } catch {
    res.status(404).json({ error: "Prompt not found" });
  }
});

/* ========================================================
   📌 4) UPDATE PROMPT
======================================================== */
router.patch("/prompt/:id", async (req, res) => {
  try {
    const updated = await AiPrompt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ success: true, item: updated });
  } catch {
    res.status(500).json({ error: "Cannot update prompt" });
  }
});

/* ========================================================
   📌 5) DELETE ONE
======================================================== */
router.delete("/prompt/:id", async (req, res) => {
  try {
    await AiPrompt.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Cannot delete prompt" });
  }
});

/* ========================================================
   📌 6) BULK DELETE
======================================================== */
router.post("/prompt/bulk-delete", async (req, res) => {
  try {
    await AiPrompt.deleteMany({ _id: { $in: req.body.ids || [] } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Cannot bulk delete" });
  }
});

/* ========================================================
   📌 7) SEARCH
======================================================== */
router.get("/prompt/search", async (req, res) => {
  const { keyword, type, platform, tag } = req.query;

  const query: any = {};

  if (keyword) {
    query.$or = [
      { title: new RegExp(keyword as string, "i") },
      { prompt: new RegExp(keyword as string, "i") },
    ];
  }

  if (type) query.type = type;
  if (platform) query.platform = platform;
  if (tag) query.tags = tag;

  try {
    const items = await AiPrompt.find(query).sort({ createdAt: -1 });
    res.json({ items });
  } catch {
    res.status(500).json({ error: "Search failed" });
  }
});

/* ========================================================
   📌 8) GET DISTINCT PLATFORMS
======================================================== */
router.get("/prompt/platforms", async (req, res) => {
  try {
    const platforms = await AiPrompt.distinct("platform");
    res.json({ platforms });
  } catch {
    res.status(500).json({ error: "Cannot load platforms" });
  }
});

router.post("/prompt/:id/view", async (req, res) => {
  try {
    await AiPrompt.updateOne({ _id: req.params.id }, { $inc: { views: 1 } });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Cannot update view" });
  }
});
router.post("/prompt/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { like } = req.body; // true = like, false = unlike

    await AiPrompt.updateOne({ _id: id }, { $inc: { likes: like ? 1 : -1 } });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Cannot update like" });
  }
});

router.post("/prompt/share", async (req: any, res) => {
  try {
    const { promptId, shareAccess } = req.body;

    if (!promptId || !shareAccess) {
      return res.status(400).json({
        success: false,
        message: "promptId & shareAccess required",
      });
    }

    const allowed = ["none", "trial", "plan1", "plan2", "all"];
    if (!allowed.includes(shareAccess)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shareAccess",
      });
    }

    const updated = await AiPrompt.findByIdAndUpdate(
      promptId,
      { shareAccess },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Prompt not found" });
    }

    res.json({ success: true, updated });
  } catch (e) {
    console.error("Update share error:", e);
    res.status(500).json({ success: false });
  }
});

/* ========================================================
   📌 BULK SHARE
   POST /prompt/share-bulk
======================================================== */
router.post("/prompt/share-bulk", async (req: any, res) => {
  try {
    const { ids, shareAccess } = req.body;

    if (!ids?.length) {
      return res.status(400).json({
        success: false,
        message: "ids required",
      });
    }

    const allowed = ["none", "trial", "plan1", "plan2", "all"];
    if (!allowed.includes(shareAccess)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shareAccess",
      });
    }

    const result = await AiPrompt.updateMany(
      { _id: { $in: ids } },
      { $set: { shareAccess } }
    );

    res.json({
      success: true,
      updatedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Bulk share error:", err);
    res.status(500).json({ success: false });
  }
});

/* ============================
     Route trả file
  ============================ */
router.get("/prompt-file/:filename", fileLimit, async (req, res) => {
  try {
    const filename = req.params.filename;

    // chặn filename chứa path lạ
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(process.cwd(), "uploads", "prompts", filename);

    // kiểm tra file tồn tại trước
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Cache 1 năm — tăng tốc hiển thị hình
    res.setHeader("Cache-Control", "public, max-age=31536000");

    // gửi file
    return res.sendFile(filePath, (err) => {
      if (err) {
        console.error("❌ sendFile error:", err);
        // đảm bảo chỉ gửi response 1 lần
        if (!res.headersSent) {
          return res.status(500).json({ error: "Cannot send file" });
        }
      }
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);

    if (!res.headersSent) {
      return res.status(500).json({ error: "Server error" });
    }
  }
});

export default router;
