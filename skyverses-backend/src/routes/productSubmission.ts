import express from "express";
import ProductSubmission from "../models/ProductSubmission.model";
import { authenticate } from "./auth";

const router = express.Router();

/* =====================================================
   USER – SUBMIT PRODUCT (authenticated)
===================================================== */
router.post("/", authenticate, async (req: any, res) => {
  try {
    const {
      productName, productSlug, category, complexity,
      shortDescription, fullDescription, demoType, tags,
      thumbnailUrl, galleryUrls, demoUrl, priceCredits, isFree, platforms,
      aiModels, features, apiEndpoint, documentation,
      creatorName, creatorEmail, creatorStudio, creatorWebsite,
      creatorTelegram, additionalNotes,
    } = req.body;

    if (!productName || !category || !shortDescription || !creatorName || !creatorEmail) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productName, category, shortDescription, creatorName, creatorEmail",
      });
    }

    const submission = await ProductSubmission.create({
      productName,
      productSlug: productSlug || productName.toLowerCase().replace(/\s+/g, "-"),
      category,
      complexity: complexity || "Standard",
      shortDescription,
      fullDescription: fullDescription || "",
      demoType: demoType || "text",
      tags: Array.isArray(tags) ? tags : (tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
      thumbnailUrl: thumbnailUrl || "",
      galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : (galleryUrls || "").split("\n").filter(Boolean),
      demoUrl: demoUrl || "",
      priceCredits: Number(priceCredits) || 0,
      isFree: !!isFree,
      platforms: Array.isArray(platforms) ? platforms : ["web"],
      aiModels: Array.isArray(aiModels) ? aiModels : (aiModels || "").split(",").map((m: string) => m.trim()).filter(Boolean),
      features: Array.isArray(features) ? features : (features || "").split("\n").filter(Boolean),
      apiEndpoint: apiEndpoint || "",
      documentation: documentation || "",
      creatorId: req.user?._id?.toString() || "",
      creatorName,
      creatorEmail,
      creatorStudio: creatorStudio || "",
      creatorWebsite: creatorWebsite || "",
      creatorTelegram: creatorTelegram || "",
      additionalNotes: additionalNotes || "",
      status: "pending",
    });

    return res.json({ success: true, data: submission });
  } catch (err: any) {
    console.error("[ProductSubmission Create]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   USER – GET MY SUBMISSIONS
===================================================== */
router.get("/mine", authenticate, async (req: any, res) => {
  try {
    const submissions = await ProductSubmission.find({
      creatorId: req.user._id.toString(),
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data: submissions });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN – GET ALL SUBMISSIONS (with filters)
===================================================== */
router.get("/", authenticate, async (req: any, res) => {
  try {
    const { status, category, q } = req.query;
    const filter: any = {};

    if (status && status !== "all") filter.status = status;
    if (category) filter.category = category;
    if (q) {
      const regex = new RegExp(q as string, "i");
      filter.$or = [
        { productName: regex },
        { creatorName: regex },
        { creatorEmail: regex },
        { shortDescription: regex },
      ];
    }

    const submissions = await ProductSubmission.find(filter).sort({ createdAt: -1 });
    const stats = {
      total: await ProductSubmission.countDocuments(),
      pending: await ProductSubmission.countDocuments({ status: "pending" }),
      reviewing: await ProductSubmission.countDocuments({ status: "reviewing" }),
      approved: await ProductSubmission.countDocuments({ status: "approved" }),
      rejected: await ProductSubmission.countDocuments({ status: "rejected" }),
      published: await ProductSubmission.countDocuments({ status: "published" }),
    };

    return res.json({ success: true, data: submissions, stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN – UPDATE STATUS + FEEDBACK
===================================================== */
router.put("/:id/review", authenticate, async (req: any, res) => {
  try {
    const { status, adminFeedback } = req.body;

    if (!["pending", "reviewing", "approved", "rejected", "published"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const update: any = {
      status,
      reviewedBy: req.user?.name || "Admin",
      reviewedAt: new Date(),
    };
    if (adminFeedback !== undefined) update.adminFeedback = adminFeedback;

    const submission = await ProductSubmission.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    return res.json({ success: true, data: submission });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN – DELETE SUBMISSION
===================================================== */
router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    await ProductSubmission.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
