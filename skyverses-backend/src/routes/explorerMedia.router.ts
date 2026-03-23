import express from "express";
import ExplorerMedia from "../models/ExplorerMedia.model";
import { authenticate } from "./auth";

const router = express.Router();

/* =====================================================
   PUBLIC – LIST MEDIA (APPROVED ONLY)
===================================================== */
router.get("/", async (req, res) => {
  const { type, category, engine, limit = 24, page = 1 } = req.query;

  const filter: any = { status: "approved" };

  if (type) filter.type = type;
  if (engine) filter.engine = engine;
  if (category) filter.categories = category;

  const data = await ExplorerMedia.find(filter)
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit)
    .lean();

  const total = await ExplorerMedia.countDocuments(filter);

  res.json({
    data,
    pagination: {
      page: +page,
      limit: +limit,
      total,
    },
  });
});

/* =====================================================
   PUBLIC – GET DETAIL + INCREASE VIEW
===================================================== */
router.get("/:id", async (req, res) => {
  const media = await ExplorerMedia.findOneAndUpdate(
    { _id: req.params.id, status: "approved" },
    { $inc: { views: 1 } },
    { new: true }
  ).lean();

  if (!media) {
    return res.status(404).json({ message: "MEDIA_NOT_FOUND" });
  }

  res.json({ data: media });
});

/* =====================================================
   USER – SUBMIT MEDIA (PENDING)
===================================================== */
router.post("/submit", authenticate, async (req: any, res) => {
  const {
    title,
    description,
    type,
    thumbnailUrl,
    mediaUrl,
    tags = [],
    categories = [],
    engine,
    modelKey,
    resolution,
    seed,
    meta,
    prompt,
  } = req.body;

  if (!title || !type || !thumbnailUrl || !mediaUrl) {
    return res.status(400).json({
      message: "MISSING_REQUIRED_FIELDS",
    });
  }

  const media = await ExplorerMedia.create({
    title,
    description,
    type,
    thumbnailUrl,
    mediaUrl,
    tags,
    categories,
    engine,
    modelKey,
    resolution,
    seed,
    prompt,
    meta,

    author: req.user.userId,
    authorName: req.user.email,

    status: "pending",
  });

  res.json({
    success: true,
    data: media,
  });
});

/* =====================================================
   ADMIN – CREATE MEDIA (AUTO APPROVED)
===================================================== */
router.post("/", authenticate, async (req: any, res) => {
  const {
    title,
    description,
    type,
    thumbnailUrl,
    mediaUrl,
    tags = [],
    categories = [],
    engine,
    modelKey,
    resolution,
    prompt,
    seed,
    meta,
    author,
    authorName,
  } = req.body;

  if (!title || !type || !thumbnailUrl || !mediaUrl) {
    return res.status(400).json({
      message: "MISSING_REQUIRED_FIELDS",
    });
  }

  const media = await ExplorerMedia.create({
    title,
    description,
    type,
    thumbnailUrl,
    mediaUrl,
    tags,
    categories,
    engine,
    modelKey,
    resolution,
    seed,
    prompt,
    meta,

    author: author || req.user.userId,
    authorName: authorName || "Skyverses Team",

    status: "approved",
    approvedBy: req.user.userId,
    approvedAt: new Date(),
  });

  res.json({
    success: true,
    data: media,
  });
});

/* =====================================================
   ADMIN – LIST PENDING
===================================================== */
router.get("/admin/pending", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }

  const data = await ExplorerMedia.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ data });
});

/* =====================================================
   ADMIN – APPROVE
===================================================== */
router.post("/:id/approve", authenticate, async (req: any, res) => {


  const media = await ExplorerMedia.findByIdAndUpdate(
    req.params.id,
    {
      status: "approved",
      approvedBy: req.user.userId,
      approvedAt: new Date(),
      rejectedReason: null,
    },
    { new: true }
  );

  if (!media) {
    return res.status(404).json({ message: "MEDIA_NOT_FOUND" });
  }

  res.json({ success: true, data: media });
});

/* =====================================================
   ADMIN – REJECT
===================================================== */
router.post("/:id/reject", authenticate, async (req: any, res) => {


  const { reason } = req.body;

  const media = await ExplorerMedia.findByIdAndUpdate(
    req.params.id,
    {
      status: "rejected",
      rejectedReason: reason || "Not specified",
    },
    { new: true }
  );

  if (!media) {
    return res.status(404).json({ message: "MEDIA_NOT_FOUND" });
  }

  res.json({ success: true, data: media });
});

/* =====================================================
   ADMIN – DELETE
===================================================== */
router.delete("/:id", authenticate, async (req: any, res) => {

  await ExplorerMedia.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
