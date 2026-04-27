import express from "express";
import { authenticate } from "./auth";
import ImageJob from "../models/ImageJob";
import VideoJobV2 from "../models/VideoJobModelV2";
import VideoJob from "../models/VideoJobModel";
import EditImageJob from "../models/EditImageJob";

const router = express.Router();

/* ══════════════════════════════════════════
 *  COLLECTION MAP — easy to extend later
 * ══════════════════════════════════════════ */
const COLLECTIONS: Record<string, any> = {
  image: ImageJob,
  videoV2: VideoJobV2,
  video: VideoJob,
  editImage: EditImageJob,
};

/* ──────────────────────────────────────────
 * GET /admin-tasks/stats
 * Returns count-by-status across all collections
 * ────────────────────────────────────────── */
router.get("/stats", authenticate, async (_req: any, res) => {
  try {
    const statuses = ["pending", "processing", "done", "error", "reject", "cancelled", "polling", "capcha"];

    const result: Record<string, Record<string, number>> = {};
    let total = 0;

    for (const [key, Model] of Object.entries(COLLECTIONS)) {
      const counts = await Model.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      result[key] = {};
      for (const c of counts) {
        result[key][c._id] = c.count;
        total += c.count;
      }
    }

    // flatten totals by status
    const byStatus: Record<string, number> = {};
    for (const s of statuses) {
      byStatus[s] = Object.values(result).reduce((acc, col) => acc + (col[s] || 0), 0);
    }

    res.json({ success: true, total, byStatus, byCollection: result });
  } catch (err: any) {
    console.error("❌ [admin-tasks/stats]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ──────────────────────────────────────────
 * GET /admin-tasks
 * List tasks across all (or filtered) collections
 * Query: status, collection, provider, search, page, limit, sortBy, sortOrder
 * ────────────────────────────────────────── */
router.get("/", authenticate, async (req: any, res) => {
  try {
    const {
      status,
      collection,
      provider,
      search,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;
    const sort: any = { [sortBy as string]: sortOrder === "asc" ? 1 : -1 };

    // Decide which collections to query
    const targetCollections: [string, any][] = collection && COLLECTIONS[collection as string]
      ? [[collection as string, COLLECTIONS[collection as string]]]
      : Object.entries(COLLECTIONS);

    // Build filter
    const buildFilter = (colKey: string) => {
      const filter: any = {};
      if (status && status !== "all") filter.status = status;
      if (provider) {
        // image/videoV2/editImage use engine.provider, legacy video uses source
        if (colKey === "video") {
          filter.source = provider;
        } else {
          filter["engine.provider"] = provider;
        }
      }
      if (search) {
        const regex = { $regex: search, $options: "i" };
        if (colKey === "image") {
          filter.$or = [{ "input.prompt": regex }];
        } else if (colKey === "videoV2") {
          filter.$or = [{ "input.prompt": regex }];
        } else if (colKey === "video") {
          filter.$or = [{ prompt: regex }];
        } else {
          filter.$or = [{ mediaId: regex }];
        }
      }
      return filter;
    };

    // Parallel count + fetch
    const allResults: any[] = [];
    let totalCount = 0;

    // If single collection → use native pagination
    if (targetCollections.length === 1) {
      const [colKey, Model] = targetCollections[0];
      const filter = buildFilter(colKey);
      const [docs, count] = await Promise.all([
        Model.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate("userId", "email name avatar")
          .lean(),
        Model.countDocuments(filter),
      ]);
      totalCount = count;
      for (const doc of docs) {
        allResults.push({ ...doc, _collection: colKey });
      }
    } else {
      // Multi-collection: fetch from all, merge, sort, paginate in-memory
      const promises = targetCollections.map(async ([colKey, Model]) => {
        const filter = buildFilter(colKey);
        const [docs, count] = await Promise.all([
          Model.find(filter)
            .sort(sort)
            .limit(500) // cap per-collection for perf
            .populate("userId", "email name avatar")
            .lean(),
          Model.countDocuments(filter),
        ]);
        return { colKey, docs, count };
      });

      const results = await Promise.all(promises);
      for (const { colKey, docs, count } of results) {
        totalCount += count;
        for (const doc of docs) {
          allResults.push({ ...doc, _collection: colKey });
        }
      }

      // Sort merged results
      allResults.sort((a, b) => {
        const aVal = new Date(a[sortBy as string] || a.createdAt).getTime();
        const bVal = new Date(b[sortBy as string] || b.createdAt).getTime();
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    // Paginate (for multi-collection case)
    const paginatedResults = targetCollections.length === 1
      ? allResults
      : allResults.slice(skip, skip + limitNum);

    // Normalize to unified shape
    const tasks = paginatedResults.map((doc) => ({
      _id: doc._id,
      _collection: doc._collection,
      status: doc.status,
      type: doc.type || doc.editType || "unknown",
      provider: doc.engine?.provider || doc.source || "N/A",
      model: doc.engine?.model || doc.model || "N/A",
      prompt: doc.input?.prompt || doc.prompt || doc.mediaId || "",
      user: doc.userId
        ? { _id: doc.userId._id || doc.userId, email: doc.userId.email, name: doc.userId.name }
        : null,
      creditsUsed: doc.creditsUsed || 0,
      error: doc.error?.message || doc.errorMessage || null,
      owner: doc.owner || null,
      progress: doc.progress || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (err: any) {
    console.error("❌ [admin-tasks]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ──────────────────────────────────────────
 * DELETE /admin-tasks/clear
 * Bulk delete tasks by filter
 * Body: { status, collection?, olderThanHours? }
 * ────────────────────────────────────────── */
router.delete("/clear", authenticate, async (req: any, res) => {
  try {
    const { status, collection, olderThanHours } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status is required" });
    }

    const targetCollections: [string, any][] = collection && COLLECTIONS[collection as string]
      ? [[collection as string, COLLECTIONS[collection as string]]]
      : Object.entries(COLLECTIONS);

    const filter: any = {};
    if (status !== "all") filter.status = status;
    if (olderThanHours) {
      filter.createdAt = { $lt: new Date(Date.now() - olderThanHours * 60 * 60 * 1000) };
    }

    let totalDeleted = 0;
    const details: Record<string, number> = {};

    for (const [colKey, Model] of targetCollections) {
      const result = await Model.deleteMany(filter);
      details[colKey] = result.deletedCount || 0;
      totalDeleted += details[colKey];
    }

    console.log(`🗑️ [admin-tasks/clear] Deleted ${totalDeleted} tasks (status=${status}, collection=${collection || "all"})`);

    res.json({ success: true, totalDeleted, details });
  } catch (err: any) {
    console.error("❌ [admin-tasks/clear]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ──────────────────────────────────────────
 * DELETE /admin-tasks/:collection/:id
 * Delete a single task
 * ────────────────────────────────────────── */
router.delete("/:collection/:id", authenticate, async (req: any, res) => {
  try {
    const { collection, id } = req.params;
    const Model = COLLECTIONS[collection];

    if (!Model) {
      return res.status(400).json({ success: false, message: `Unknown collection: ${collection}` });
    }

    const result = await Model.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Deleted" });
  } catch (err: any) {
    console.error("❌ [admin-tasks/delete]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
