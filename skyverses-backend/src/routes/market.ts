import express from "express";
import MarketItem from "../models/MarketItem.model";
import { authenticate } from "./auth";

const router = express.Router();
function normalizeQuery(q: string) {
  return decodeURIComponent(q.replace(/\+/g, " ")).trim();
}
/* =====================================================
   PUBLIC – GET MARKET ITEMS
===================================================== */
router.get("/", async (req, res) => {
  try {
    const {
      q,
      lang = "en",
      category,
      isFree,
      featured,
      isActive,
      status,
    } = req.query;

    const filter: any = {};

    /* =========================
       BOOL / STATUS FILTER
    ========================= */
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (status) {
      filter.status = status;
    }

    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    if (isFree !== undefined) {
      filter.isFree = isFree === "true";
    }

    /* =========================
       CATEGORY FILTER
    ========================= */
    if (category) {
      filter[`category.${lang}`] = {
        $regex: decodeURIComponent(category as string),
        $options: "i",
      };
    }

    /* =========================
       KEYWORD SEARCH (FIX +)
    ========================= */
    if (q) {
      const keyword = normalizeQuery(q as string);
      const regex = new RegExp(keyword, "i");

      filter.$or = [
        { [`name.${lang}`]: regex },
        { [`description.${lang}`]: regex },
        { tags: regex },
        { models: regex },
        { industries: regex },
        { "neuralStack.name": regex },
        { "neuralStack.capability.en": regex },
        { "neuralStack.capability.vi": regex },
      ];
    }

    const items = await MarketItem.find(filter).sort({
      order: 1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      total: items.length,
      data: items,
    });
  } catch (err: any) {
    console.error("[MarketItem Search]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
/* =====================================================
   PUBLIC – GET 5 RANDOM ACTIVE ITEMS
===================================================== */
router.get("/random/featured", async (_req, res) => {
  try {
    // 1. Ưu tiên lấy featured = true, sort theo order
    const featuredItems = await MarketItem.find({ isActive: true, featured: true })
      .sort({ order: 1 })
      .limit(5)
      .lean();

    // 2. Nếu chưa đủ 5, bổ sung random từ non-featured
    let result = [...featuredItems];
    if (result.length < 5) {
      const excludeIds = result.map((item: any) => item._id);
      const fillers = await MarketItem.aggregate([
        { $match: { isActive: true, _id: { $nin: excludeIds } } },
        { $sample: { size: 5 - result.length } },
      ]);
      result = [...result, ...fillers];
    }

    res.json({ data: result });
  } catch (err) {
    console.error("❌ GET FEATURED ITEMS ERROR:", err);
    res.status(500).json({ message: "FAILED_TO_FETCH_FEATURED_ITEMS" });
  }
});


/* =====================================================
   PUBLIC – GET ITEM DETAIL
===================================================== */
router.get("/:slug", async (req, res) => {
  const item = await MarketItem.findOne({
    slug: req.params.slug,
    status: "active",
  });

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json({ data: item });
});

/* =====================================================
   ADMIN – CREATE ITEM
===================================================== */
router.post("/", authenticate, async (req: any, res) => {
  const item = await MarketItem.create(req.body);
  res.json({ success: true, data: item });
});

/* =====================================================
   ADMIN – UPDATE ITEM
===================================================== */
router.put("/:id", authenticate, async (req: any, res) => {
  const item = await MarketItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json({ success: true, data: item });
});

/* =====================================================
   ADMIN – DELETE ITEM
===================================================== */
router.delete("/:id", authenticate, async (req: any, res) => {
  await MarketItem.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* =====================================================
   ADMIN – TOGGLE STATUS
===================================================== */
router.post("/:id/status", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { status } = req.body;

  const item = await MarketItem.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json({ success: true, data: item });
});

router.post("/:id/active", authenticate, async (req: any, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "isActive must be boolean",
    });
  }

  const item = await MarketItem.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );

  res.json({ success: true, data: item });
});
export default router;
