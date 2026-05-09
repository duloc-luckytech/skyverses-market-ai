import express from "express";
import PromoBanner from "../models/PromoBanner.model";
import { authenticate } from "./auth";

const router = express.Router();

/* =====================================================
   PUBLIC — GET ACTIVE BANNERS
   GET /promo-banners
===================================================== */
router.get("/", async (_req, res) => {
  try {
    const items = await PromoBanner.find({ active: true })
      .sort({ sortOrder: 1 })
      .lean();

    res.json({ success: true, data: items });
  } catch (err: any) {
    console.error("[PromoBanner List]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — LIST ALL BANNERS
   GET /promo-banners/admin/all
===================================================== */
router.get("/admin/all", authenticate, async (_req: any, res) => {
  try {
    const items = await PromoBanner.find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: items, total: items.length });
  } catch (err: any) {
    console.error("[PromoBanner Admin List]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — CREATE BANNER
   POST /promo-banners
===================================================== */
router.post("/", authenticate, async (req: any, res) => {
  try {
    const banner = await PromoBanner.create(req.body);
    res.json({ success: true, data: banner });
  } catch (err: any) {
    console.error("[PromoBanner Create]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — UPDATE BANNER
   PUT /promo-banners/:id
===================================================== */
router.put("/:id", authenticate, async (req: any, res) => {
  try {
    const banner = await PromoBanner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    res.json({ success: true, data: banner });
  } catch (err: any) {
    console.error("[PromoBanner Update]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — TOGGLE ACTIVE
   PATCH /promo-banners/:id/toggle
===================================================== */
router.patch("/:id/toggle", authenticate, async (req: any, res) => {
  try {
    const banner = await PromoBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    banner.active = !banner.active;
    await banner.save();
    res.json({ success: true, data: banner, active: banner.active });
  } catch (err: any) {
    console.error("[PromoBanner Toggle]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — DELETE BANNER
   DELETE /promo-banners/:id
===================================================== */
router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    await PromoBanner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    console.error("[PromoBanner Delete]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
