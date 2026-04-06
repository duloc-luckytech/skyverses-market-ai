import express from "express";
import BlogPost from "../models/BlogPost.model";
import { authenticate } from "./auth";

const router = express.Router();

/* =====================================================
   PUBLIC — LIST PUBLISHED POSTS
   GET /blog?page=1&limit=10&category=tutorials&tag=ai&q=search&lang=en
===================================================== */
router.get("/", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "12",
      category,
      tag,
      q,
      lang = "en",
      featured,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { isPublished: true };

    // Category filter
    if (category) {
      filter.category = { $regex: new RegExp(category as string, "i") };
    }

    // Tag filter
    if (tag) {
      filter.tags = { $regex: new RegExp(tag as string, "i") };
    }

    // Featured filter
    if (featured === "true") {
      filter.isFeatured = true;
    }

    // Keyword search
    if (q) {
      const keyword = decodeURIComponent((q as string).replace(/\+/g, " ")).trim();
      const regex = new RegExp(keyword, "i");
      filter.$or = [
        { [`title.${lang}`]: regex },
        { [`excerpt.${lang}`]: regex },
        { [`content.${lang}`]: regex },
        { tags: regex },
      ];
    }

    const [items, total] = await Promise.all([
      BlogPost.find(filter)
        .select("-content") // Don't send full content in list
        .sort({ isFeatured: -1, order: 1, publishedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    console.error("[Blog List]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   PUBLIC — GET FEATURED POSTS
   GET /blog/featured
===================================================== */
router.get("/featured", async (_req, res) => {
  try {
    const items = await BlogPost.find({ isPublished: true, isFeatured: true })
      .select("-content")
      .sort({ order: 1, publishedAt: -1 })
      .limit(5)
      .lean();

    res.json({ success: true, data: items });
  } catch (err: any) {
    console.error("[Blog Featured]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   PUBLIC — GET CATEGORIES WITH COUNT
   GET /blog/categories
===================================================== */
router.get("/categories", async (_req, res) => {
  try {
    const result = await BlogPost.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: result.map((r) => ({ category: r._id, count: r.count })),
    });
  } catch (err: any) {
    console.error("[Blog Categories]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   PUBLIC — GET SINGLE POST BY SLUG
   GET /blog/:slug
===================================================== */
router.get("/:slug", async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      isPublished: true,
    });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Increment view count (fire-and-forget)
    BlogPost.updateOne(
      { _id: post._id },
      { $inc: { viewCount: 1 } }
    ).catch(() => {});

    res.json({ success: true, data: post });
  } catch (err: any) {
    console.error("[Blog Detail]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — LIST ALL POSTS (including drafts)
   GET /blog/admin/all
===================================================== */
router.get("/admin/all", authenticate, async (req: any, res) => {
  try {
    const items = await BlogPost.find()
      .select("-content")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: items, total: items.length });
  } catch (err: any) {
    console.error("[Blog Admin List]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — GET SINGLE POST BY ID (for editing, includes drafts)
   GET /blog/admin/:id
===================================================== */
router.get("/admin/:id", authenticate, async (req: any, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, data: post });
  } catch (err: any) {
    console.error("[Blog Admin Detail]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — CREATE POST
   POST /blog
===================================================== */
router.post("/", authenticate, async (req: any, res) => {
  try {
    const post = await BlogPost.create(req.body);
    res.json({ success: true, data: post });
  } catch (err: any) {
    console.error("[Blog Create]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — UPDATE POST
   PUT /blog/:id
===================================================== */
router.put("/:id", authenticate, async (req: any, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, data: post });
  } catch (err: any) {
    console.error("[Blog Update]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — DELETE POST
   DELETE /blog/:id
===================================================== */
router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    console.error("[Blog Delete]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — TOGGLE PUBLISH STATUS
   POST /blog/:id/publish
===================================================== */
router.post("/:id/publish", authenticate, async (req: any, res) => {
  try {
    const { isPublished } = req.body;
    const update: any = { isPublished };

    // Set publishedAt when first published
    if (isPublished) {
      const existing = await BlogPost.findById(req.params.id);
      if (existing && !existing.publishedAt) {
        update.publishedAt = new Date();
      }
    }

    const post = await BlogPost.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    res.json({ success: true, data: post });
  } catch (err: any) {
    console.error("[Blog Publish]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
