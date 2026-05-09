import express from "express";
import PromptSet from "../models/PromptSet.model";
import PromptPurchase from "../models/PromptPurchase.model";
import PromptReview from "../models/PromptReview.model";
import PromptWishlist from "../models/PromptWishlist.model";
import SellerFollower from "../models/SellerFollower.model";
import SkyTokenTransaction from "../models/SkyTokenTransaction.model";
import User from "../models/UserModel";
import { authenticate } from "./auth";

const router = express.Router();

const PLATFORM_FEE_PERCENT = 10;

/* =====================================================
   HELPER: Generate slug from title
===================================================== */
function generateSlug(title: string): string {
  const base = (title || "prompt")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${base}-${rnd}`;
}

/* =====================================================
   BROWSE MARKETPLACE (PUBLIC)
===================================================== */
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const category = req.query.category as string;
    const q = req.query.q as string;
    const sort = (req.query.sort as string) || "newest";
    const tags = req.query.tags as string; // comma-separated

    const query: any = { status: "active", isActive: true };

    if (category && category !== "all") query.category = category;
    if (tags) query.tags = { $in: tags.split(",").map((t) => t.trim()) };
    if (q) {
      query.$or = [
        { "title.en": { $regex: q, $options: "i" } },
        { "title.vi": { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    let sortObj: any = { createdAt: -1 };
    if (sort === "popular") sortObj = { purchaseCount: -1, createdAt: -1 };
    if (sort === "price_low") sortObj = { priceSKT: 1 };
    if (sort === "price_high") sortObj = { priceSKT: -1 };

    const [data, total] = await Promise.all([
      PromptSet.find(query)
        .select("-prompts") // KHÔNG trả full prompts cho browse
        .populate("sellerId", "name avatar email")
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PromptSet.countDocuments(query),
    ]);

    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    console.error("❌ [PROMPT MARKET LIST]", err);
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   GET PROMPT SET DETAIL BY SLUG (PUBLIC — no full prompts)
===================================================== */
router.get("/detail/:slug", async (req, res) => {
  try {
    const promptSet = await PromptSet.findOne({
      slug: req.params.slug,
      status: "active",
      isActive: true,
    })
      .select("-prompts.content") // Ẩn nội dung prompt, chỉ trả title + description
      .populate("sellerId", "name avatar email")
      .lean();

    if (!promptSet) return res.status(404).json({ message: "NOT_FOUND" });

    res.json({ data: promptSet });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   PURCHASE PROMPT SET
===================================================== */
router.post("/:id/purchase", authenticate, async (req: any, res) => {
  try {
    const buyerId = req.user.userId;
    const promptSet: any = await PromptSet.findById(req.params.id);
    if (!promptSet || promptSet.status !== "active" || !promptSet.isActive) {
      return res.status(404).json({ message: "PROMPT_SET_NOT_FOUND" });
    }

    // Không được mua prompt của chính mình
    if (String(promptSet.sellerId) === String(buyerId)) {
      return res.status(400).json({ message: "CANNOT_BUY_OWN_PROMPT" });
    }

    // Kiểm tra đã mua chưa
    const existing = await PromptPurchase.findOne({
      buyerId,
      promptSetId: promptSet._id,
    });
    if (existing) {
      return res.status(400).json({ message: "ALREADY_PURCHASED" });
    }

    const priceSKT = promptSet.isFree ? 0 : promptSet.priceSKT;

    // Kiểm tra balance
    const buyer = await User.findById(buyerId);
    if (!buyer) return res.status(404).json({ message: "USER_NOT_FOUND" });

    if (!promptSet.isFree && buyer.skyTokenBalance < priceSKT) {
      return res.status(400).json({ message: "INSUFFICIENT_SKT" });
    }

    const platformFee = Math.floor((priceSKT * PLATFORM_FEE_PERCENT) / 100);
    const sellerReceived = priceSKT - platformFee;

    // === TRANSACTION: Trừ buyer, cộng seller ===
    if (priceSKT > 0) {
      // Trừ buyer
      buyer.skyTokenBalance -= priceSKT;
      await buyer.save();

      await SkyTokenTransaction.create({
        userId: buyer._id,
        type: "CONSUME",
        amount: -priceSKT,
        balanceAfter: buyer.skyTokenBalance,
        source: "prompt_purchase",
        note: `Purchased: ${promptSet.title?.en || promptSet.slug}`,
        meta: { promptSetId: promptSet._id, slug: promptSet.slug },
      });

      // Cộng seller
      const seller = await User.findById(promptSet.sellerId);
      if (seller) {
        seller.skyTokenBalance += sellerReceived;
        await seller.save();

        await SkyTokenTransaction.create({
          userId: seller._id,
          type: "EARN",
          amount: sellerReceived,
          balanceAfter: seller.skyTokenBalance,
          source: "prompt_sale",
          note: `Sold: ${promptSet.title?.en || promptSet.slug}`,
          meta: {
            promptSetId: promptSet._id,
            buyerId: buyer._id,
            platformFee,
          },
        });
      }
    }

    // Tạo record purchase
    await PromptPurchase.create({
      buyerId: buyer._id,
      sellerId: promptSet.sellerId,
      promptSetId: promptSet._id,
      pricePaid: priceSKT,
      sellerReceived,
      platformFee,
      feePercent: PLATFORM_FEE_PERCENT,
    });

    // Update stats
    promptSet.purchaseCount += 1;
    promptSet.totalEarned += sellerReceived;
    await promptSet.save();

    res.json({
      success: true,
      skyTokenBalance: buyer.skyTokenBalance,
      message: "PURCHASE_SUCCESS",
    });
  } catch (err: any) {
    console.error("❌ [PROMPT PURCHASE]", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "ALREADY_PURCHASED" });
    }
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   MY PURCHASES (BUYER — full prompts)
===================================================== */
router.get("/my-purchases", authenticate, async (req: any, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const purchases = await PromptPurchase.find({ buyerId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "promptSetId",
        populate: { path: "sellerId", select: "name avatar" },
      })
      .lean();

    const total = await PromptPurchase.countDocuments({ buyerId: req.user.userId });

    res.json({
      data: purchases,
      pagination: { page, limit, total },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /prompt-market/my-purchases/:id — full prompt content
 */
router.get("/my-purchases/:id", authenticate, async (req: any, res) => {
  try {
    const purchase = await PromptPurchase.findOne({
      _id: req.params.id,
      buyerId: req.user.userId,
    }).lean();

    if (!purchase) return res.status(404).json({ message: "PURCHASE_NOT_FOUND" });

    const promptSet = await PromptSet.findById(purchase.promptSetId)
      .populate("sellerId", "name avatar")
      .lean();

    res.json({ data: { purchase, promptSet } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   SELLER: CREATE PROMPT SET
===================================================== */
router.post("/sell", authenticate, async (req: any, res) => {
  try {
    const sellerId = req.user.userId;
    const { title, description, category, tags, coverImage, priceSKT, isFree, prompts, previewText } = req.body;

    if (!prompts || !prompts.length) {
      return res.status(400).json({ message: "PROMPTS_REQUIRED" });
    }

    const slug = generateSlug(title?.en || title?.vi || "prompt");

    const promptSet = await PromptSet.create({
      sellerId,
      slug,
      title: title || {},
      description: description || {},
      category: category || "other",
      tags: tags || [],
      coverImage,
      priceSKT: isFree ? 0 : (priceSKT || 0),
      isFree: !!isFree,
      prompts,
      previewText: previewText || "",
      status: "active",
    });

    res.json({ success: true, data: promptSet });
  } catch (err: any) {
    console.error("❌ [PROMPT SET CREATE]", err);
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   SELLER: UPDATE PROMPT SET
===================================================== */
router.put("/sell/:id", authenticate, async (req: any, res) => {
  try {
    const promptSet = await PromptSet.findOne({
      _id: req.params.id,
      sellerId: req.user.userId,
    });

    if (!promptSet) return res.status(404).json({ message: "NOT_FOUND_OR_NOT_OWNER" });

    const allowed = [
      "title", "description", "category", "tags", "coverImage",
      "priceSKT", "isFree", "prompts", "previewText",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (promptSet as any)[key] = req.body[key];
      }
    }

    await promptSet.save();
    res.json({ success: true, data: promptSet });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   SELLER: DELETE/ARCHIVE PROMPT SET
===================================================== */
router.delete("/sell/:id", authenticate, async (req: any, res) => {
  try {
    const promptSet = await PromptSet.findOne({
      _id: req.params.id,
      sellerId: req.user.userId,
    });
    if (!promptSet) return res.status(404).json({ message: "NOT_FOUND_OR_NOT_OWNER" });

    promptSet.status = "archived";
    promptSet.isActive = false;
    await promptSet.save();

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   SELLER: MY LISTINGS
===================================================== */
router.get("/my-listings", authenticate, async (req: any, res) => {
  try {
    const data = await PromptSet.find({
      sellerId: req.user.userId,
      status: { $ne: "archived" },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   SELLER: MY EARNINGS
===================================================== */
router.get("/my-earnings", authenticate, async (req: any, res) => {
  try {
    const sellerId = req.user.userId;

    const [totalSales, totalEarned, recentSales] = await Promise.all([
      PromptPurchase.countDocuments({ sellerId }),
      PromptPurchase.aggregate([
        { $match: { sellerId: require("mongoose").Types.ObjectId.createFromHexString(sellerId) } },
        { $group: { _id: null, total: { $sum: "$sellerReceived" } } },
      ]),
      PromptPurchase.find({ sellerId })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("buyerId", "name avatar")
        .populate("promptSetId", "title slug")
        .lean(),
    ]);

    res.json({
      totalSales,
      totalEarned: totalEarned[0]?.total || 0,
      recentSales,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   ADMIN: LIST ALL PROMPT SETS
===================================================== */
router.get("/admin/all", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "FORBIDDEN" });

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 30);

  const [data, total] = await Promise.all([
    PromptSet.find({})
      .populate("sellerId", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    PromptSet.countDocuments({}),
  ]);

  res.json({ data, pagination: { page, limit, total } });
});

/* =====================================================
   ADMIN: UPDATE STATUS (approve/reject)
===================================================== */
router.patch("/admin/:id/status", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "FORBIDDEN" });

  const { status } = req.body;
  if (!["active", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "INVALID_STATUS" });
  }

  const promptSet = await PromptSet.findByIdAndUpdate(
    req.params.id,
    { status, isActive: status === "active" },
    { new: true }
  );

  res.json({ success: true, data: promptSet });
});

/* =====================================================
   ADMIN: DELETE PROMPT SET
===================================================== */
router.delete("/admin/:id", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "FORBIDDEN" });

  await PromptSet.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* =====================================================
   REVIEWS: GET REVIEWS FOR A PROMPT SET
===================================================== */
router.get("/:id/reviews", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      PromptReview.find({ promptSetId: req.params.id })
        .populate("buyerId", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PromptReview.countDocuments({ promptSetId: req.params.id }),
    ]);

    // Aggregate average
    const agg = await PromptReview.aggregate([
      { $match: { promptSetId: new (require("mongoose").Types.ObjectId)(req.params.id) } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const averageRating = agg[0]?.avg ?? 0;
    const reviewCount = agg[0]?.count ?? 0;

    res.json({
      data: reviews,
      pagination: { page, limit, total },
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   REVIEWS: SUBMIT A REVIEW (buyer only)
===================================================== */
router.post("/:id/reviews", authenticate, async (req: any, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }

    // Must have purchased
    const purchased = await PromptPurchase.findOne({
      buyerId: req.user._id,
      promptSetId: req.params.id,
    });
    if (!purchased) {
      return res.status(403).json({ message: "You must purchase this prompt set before reviewing" });
    }

    // Upsert review (one per buyer per prompt set)
    const review = await PromptReview.findOneAndUpdate(
      { buyerId: req.user._id, promptSetId: req.params.id },
      { rating, comment: comment || "" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalculate average on the prompt set
    const agg = await PromptReview.aggregate([
      { $match: { promptSetId: new (require("mongoose").Types.ObjectId)(req.params.id) } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await PromptSet.findByIdAndUpdate(req.params.id, {
      averageRating: Math.round((agg[0]?.avg ?? 0) * 10) / 10,
      reviewCount: agg[0]?.count ?? 0,
    });

    const populated = await PromptReview.findById(review._id).populate("buyerId", "name avatar").lean();
    res.json({ success: true, data: populated });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already reviewed this prompt set" });
    }
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   REVIEWS: DELETE OWN REVIEW
===================================================== */
router.delete("/reviews/:reviewId", authenticate, async (req: any, res) => {
  try {
    const review = await PromptReview.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.buyerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "FORBIDDEN" });
    }

    const promptSetId = review.promptSetId;
    await review.deleteOne();

    // Recalculate
    const agg = await PromptReview.aggregate([
      { $match: { promptSetId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await PromptSet.findByIdAndUpdate(promptSetId, {
      averageRating: Math.round((agg[0]?.avg ?? 0) * 10) / 10,
      reviewCount: agg[0]?.count ?? 0,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   SELLER PROFILE (PUBLIC)
===================================================== */
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findById(sellerId)
      .select("name avatar email specialty bio socialLinks verified createdAt")
      .lean();

    if (!seller) return res.status(404).json({ message: "SELLER_NOT_FOUND" });

    const [listings, totalSalesAgg, followerCount] = await Promise.all([
      PromptSet.find({ sellerId, status: "active", isActive: true })
        .select("-prompts")
        .sort({ createdAt: -1 })
        .lean(),
      PromptPurchase.aggregate([
        { $match: { sellerId: new (require("mongoose").Types.ObjectId)(sellerId) } },
        { $group: { _id: null, count: { $sum: 1 }, earned: { $sum: "$sellerReceived" } } },
      ]),
      SellerFollower.countDocuments({ sellerId }),
    ]);

    const totalSales = totalSalesAgg[0]?.count ?? 0;
    const totalEarned = totalSalesAgg[0]?.earned ?? 0;

    // Calculate average rating across all listings
    const avgRatingAgg = await PromptReview.aggregate([
      { $match: { promptSetId: { $in: listings.map((l: any) => l._id) } } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const badges: Array<{ type: string; label: string }> = [];
    if ((seller as any).verified) badges.push({ type: "verified", label: "Verified Seller" });
    if (totalSales >= 100) badges.push({ type: "top_seller", label: "Top Seller" });
    else if (totalSales >= 10) badges.push({ type: "rising_star", label: "Rising Star" });
    if (listings.length >= 20) badges.push({ type: "prolific", label: "Prolific Creator" });

    const profile = {
      _id: (seller as any)._id,
      name: (seller as any).name,
      avatar: (seller as any).avatar,
      email: (seller as any).email,
      specialty: (seller as any).specialty,
      bio: (seller as any).bio || "",
      socialLinks: (seller as any).socialLinks || {},
      verified: (seller as any).verified || false,
      joinedAt: (seller as any).createdAt,
      badges,
      stats: {
        totalListings: listings.length,
        totalSales,
        totalEarned,
        averageRating: Math.round((avgRatingAgg[0]?.avg ?? 0) * 10) / 10,
        totalReviews: avgRatingAgg[0]?.count ?? 0,
        followerCount,
      },
      listings,
    };

    res.json({ data: profile });
  } catch (err: any) {
    console.error("❌ [SELLER PROFILE]", err);
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   FOLLOW / UNFOLLOW SELLER
===================================================== */
router.post("/seller/:sellerId/follow", authenticate, async (req: any, res) => {
  try {
    const followerId = req.user.userId;
    const { sellerId } = req.params;

    if (followerId === sellerId) {
      return res.status(400).json({ message: "CANNOT_FOLLOW_SELF" });
    }

    const existing = await SellerFollower.findOne({ sellerId, followerId });

    if (existing) {
      await existing.deleteOne();
      const followerCount = await SellerFollower.countDocuments({ sellerId });
      return res.json({ success: true, following: false, followerCount });
    }

    await SellerFollower.create({ sellerId, followerId });
    const followerCount = await SellerFollower.countDocuments({ sellerId });
    res.json({ success: true, following: true, followerCount });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   CHECK IF FOLLOWING SELLER
===================================================== */
router.get("/seller/:sellerId/check-follow", authenticate, async (req: any, res) => {
  try {
    const existing = await SellerFollower.findOne({
      sellerId: req.params.sellerId,
      followerId: req.user.userId,
    });
    res.json({ following: !!existing });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   WISHLIST: GET USER'S WISHLIST
===================================================== */
router.get("/wishlist", authenticate, async (req: any, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const [items, total] = await Promise.all([
      PromptWishlist.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: "promptSetId",
          select: "-prompts",
          populate: { path: "sellerId", select: "name avatar" },
        })
        .lean(),
      PromptWishlist.countDocuments({ userId: req.user.userId }),
    ]);

    // Transform to match frontend PromptWishlistItem shape
    const data = items
      .filter((i: any) => i.promptSetId) // skip if prompt was deleted
      .map((i: any) => ({
        _id: i._id,
        promptSet: i.promptSetId,
        addedAt: i.createdAt,
      }));

    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   WISHLIST: TOGGLE WISHLIST
===================================================== */
router.post("/:id/wishlist", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const promptSetId = req.params.id;

    const existing = await PromptWishlist.findOne({ userId, promptSetId });

    if (existing) {
      await existing.deleteOne();
      const wishlistCount = await PromptWishlist.countDocuments({ promptSetId });
      await PromptSet.findByIdAndUpdate(promptSetId, { wishlistCount });
      return res.json({ success: true, wishlisted: false, wishlistCount });
    }

    await PromptWishlist.create({ userId, promptSetId });
    const wishlistCount = await PromptWishlist.countDocuments({ promptSetId });
    await PromptSet.findByIdAndUpdate(promptSetId, { wishlistCount });
    res.json({ success: true, wishlisted: true, wishlistCount });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.json({ success: true, wishlisted: true, wishlistCount: 0 });
    }
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   WISHLIST: BATCH CHECK IF WISHLISTED
===================================================== */
router.post("/wishlist/check", authenticate, async (req: any, res) => {
  try {
    const { ids } = req.body; // array of promptSetId strings
    if (!ids || !Array.isArray(ids)) {
      return res.json({ data: {} });
    }

    const items = await PromptWishlist.find({
      userId: req.user.userId,
      promptSetId: { $in: ids },
    }).lean();

    const result: Record<string, boolean> = {};
    for (const id of ids) {
      result[id] = items.some((i: any) => String(i.promptSetId) === id);
    }

    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   TRACK VIEW
===================================================== */
router.post("/:id/view", async (req, res) => {
  try {
    await PromptSet.findByIdAndUpdate(req.params.id, {
      $inc: { viewCount: 1 },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   RELATED PROMPTS
===================================================== */
router.get("/related/:slug", async (req, res) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit as string) || 4);
    const promptSet = await PromptSet.findOne({ slug: req.params.slug }).lean();
    if (!promptSet) return res.json({ data: [] });

    const data = await PromptSet.find({
      _id: { $ne: (promptSet as any)._id },
      status: "active",
      isActive: true,
      $or: [
        { category: (promptSet as any).category },
        { tags: { $in: (promptSet as any).tags || [] } },
      ],
    })
      .select("-prompts")
      .populate("sellerId", "name avatar")
      .sort({ purchaseCount: -1 })
      .limit(limit)
      .lean();

    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   CHECK IF PURCHASED
===================================================== */
router.get("/:id/check-purchased", authenticate, async (req: any, res) => {
  try {
    const existing = await PromptPurchase.findOne({
      buyerId: req.user.userId,
      promptSetId: req.params.id,
    });
    res.json({ purchased: !!existing });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
