import { Router } from "express";
import Coupon from "../models/Coupon";
import User from "../models/UserModel";
import { authenticate } from "./auth";

const router = Router();

/* ============================================================
   HELPER - Sinh coupon code chuẩn
   Format: COUPON-ABCDEFGH
============================================================ */
function generateCouponCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `COUPON-${out}`;
}

/* ============================================================
   1️⃣ BATCH CREATE COUPONS
============================================================ */
router.post("/batch-create", async (req, res) => {
  try {
    const { amount, title, videoAmount, expireAt } = req.body;

    if (!amount || amount < 1)
      return res
        .status(400)
        .json({ success: false, message: "Số lượng không hợp lệ" });

    if (!videoAmount || videoAmount < 1)
      return res
        .status(400)
        .json({ success: false, message: "videoAmount không hợp lệ" });

    const expire = expireAt ? new Date(expireAt) : null;

    const list = [];

    for (let i = 0; i < amount; i++) {
      list.push({
        code: generateCouponCode(8),
        title: title || "Coupon tặng video",
        videoAmount,
        expireAt: expire,
      });
    }

    const created = await Coupon.insertMany(list);

    return res.json({
      success: true,
      total: created.length,
      data: created,
    });
  } catch (err) {
    console.error("❌ Batch create coupon error:", err);
    res
      .status(500)
      .json({ success: false, message: "Batch create failed", err });
  }
});

/* ============================================================
   2️⃣ LIST COUPONS (ADMIN)
============================================================ */
router.get("/list", async (req, res) => {
  try {
    const list = await Coupon.find()
      .sort({ createdAt: -1 })
      .populate("usedBy", "email avatar name"); // ⭐ thêm dòng này

    return res.json({
      success: true,
      total: list.length,
      data: list,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Load coupon failed" });
  }
});

/* ============================================================
   3️⃣ GET ONE COUPON
============================================================ */
router.get("/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon không tồn tại" });

    res.json({ success: true, data: coupon });
  } catch {
    res.status(500).json({ success: false, message: "Load coupon failed" });
  }
});

/* ============================================================
   4️⃣ UPDATE COUPON (title, expireAt)
============================================================ */
router.put("/:id", async (req, res) => {
  try {
    const updates: any = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.expireAt !== undefined)
      updates.expireAt = new Date(req.body.expireAt);

    const updated = await Coupon.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Coupon không tồn tại" });

    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

/* ============================================================
   5️⃣ DELETE COUPON
============================================================ */
router.delete("/:id", async (req, res) => {
  try {
    const removed = await Coupon.findByIdAndDelete(req.params.id);
    if (!removed)
      return res
        .status(404)
        .json({ success: false, message: "Coupon không tồn tại" });

    res.json({ success: true, message: "Đã xoá coupon", data: removed });
  } catch {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

/* ============================================================
   6️⃣ USER DÙNG COUPON
============================================================ */
router.post("/use", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon)
      return res
        .status(400)
        .json({ success: false, message: "Coupon không tồn tại" });
    if (coupon.expireAt && coupon.expireAt < new Date())
      return res
        .status(400)
        .json({ success: false, message: "Coupon đã hết hạn" });
    if (coupon.isUsed)
      return res
        .status(400)
        .json({ success: false, message: "Coupon đã được sử dụng" });

    // Mark used
    coupon.isUsed = true;
    coupon.usedBy = userId;
    coupon.usedAt = new Date();
    await coupon.save();

    // Update user
    const user: any = await User.findById(userId);
    user.maxVideo += coupon.videoAmount;
    await user.save();

    res.json({
      success: true,
      message: "🎉 Sử dụng coupon thành công",
      addedVideo: coupon.videoAmount,
      newMaxVideo: user.maxVideo,
    });
  } catch (err) {
    console.error("❌ Apply coupon failed", err);
    res.status(500).json({ success: false, message: "Apply coupon failed" });
  }
});

export default router;
