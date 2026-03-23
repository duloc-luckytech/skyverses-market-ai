import express from "express";
import { authenticate } from "./auth";
import User from "../models/UserModel";
import ShopItem from "../models/ShopItem.model";
import ShopTransaction from "../models/ShopTransaction.model";
import ShopDownload from "../models/ShopDownload.model";

const router = express.Router();

/* =========================
   BANK INFO (DÙNG CHUNG PLAN)
========================= */
const BANK_INFO = {
  bankName: process.env.BANK_INFO_NAME,
  bankCode: process.env.BANK_INFO_CODE,
  accountNumber: process.env.BANK_INFO_ACCOUNT_NUMBER,
  accountName: process.env.BANK_INFO_ACCOUNT_NAME,
};

/* =====================================================
   POST /shop/request-payment
   TẠO QR THANH TOÁN
===================================================== */
router.post("/request-payment", authenticate, async (req: any, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user?.userId;

    if (!userId || !itemId) {
      return res.status(400).json({ success: false });
    }

    /* ---- timestamp MMDDHHmm ---- */
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestamp = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
      now.getHours()
    )}${pad(now.getMinutes())}`;

    /* ---- SHOP ITEM (FAKE / DB SAU) ---- */
    const item =
      (await ShopItem.findOne({ code: itemId })) ||
      ({
        code: itemId,
        priceVND: 199000,
      } as any);

    const amount = item.priceVND;

    /* ---- NOTE (CỰC KỲ QUAN TRỌNG) ---- */
    const note = `${process.env.DOMAIN_NAME}SHOP${itemId}${userId}${timestamp}`;

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    /* ---- QR VIETQR ---- */
    const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${
      BANK_INFO.accountNumber
    }-compact.png?amount=${amount}&addInfo=${encodeURIComponent(note)}`;

    /* ---- LƯU pendingShopPayment ---- */
    await User.findByIdAndUpdate(userId, {
      pendingShopPayment: {
        itemId,
        note,
        amount,
        expiresAt,
        createdAt: new Date(),
      },
    });

    return res.json({
      success: true,
      qrUrl,
      bankName: BANK_INFO.bankName,
      accountNumber: BANK_INFO.accountNumber,
      accountName: BANK_INFO.accountName,
      amount,
      note,
      expiresAt,
    });
  } catch (err: any) {
    console.error("❌ /shop/request-payment", err);
    return res.status(500).json({ success: false });
  }
});

/* =====================================================
   GET /shop/download/:itemId
   FE POLL DOWNLOAD
===================================================== */
router.get("/download/:itemId", authenticate, async (req: any, res) => {
  const userId = req.user?.userId;
  const { itemId } = req.params;

  if (!userId || !itemId) {
    return res.json({ status: "error" });
  }

  const download = await ShopDownload.findOne({ userId, itemId });

  if (!download) {
    return res.json({ status: "processing" });
  }

  return res.json({
    status: "ready",
    downloadUrl: download.downloadUrl,
    licenseKey: download.licenseKey,
  });
});

/* =====================================================
   FAKE BANK CONFIRM HOOK
   (CRON / MANUAL CALL)
===================================================== */
router.post("/_fake-bank-confirm", async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or itemId",
      });
    }

    /* =========================
         LOAD USER + ITEM
      ========================= */
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const item = await ShopItem.findOne({ _id: itemId, active: true });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shop item not found",
      });
    }

    const amount = item.priceVND;

    /* =========================
         CREATE TRANSACTION
      ========================= */
    const transaction = await ShopTransaction.create({
      userId: user._id,
      itemId: item._id,
      amount,
      note: `FAKE_BANK_CONFIRM_${Date.now()}`,
      status: "paid",
      paidAt: new Date(),
    });

    /* =========================
         CREATE DOWNLOAD (FAKE)
      ========================= */
    const download = await ShopDownload.create({
      userId: user._id,
      itemId: item._id,
      downloadUrl: "https://example.com/downloads/fake-tool-source.zip",
      licenseKey: `SHOP-${item.code}-${Math.random()
        .toString(36)
        .slice(2, 10)
        .toUpperCase()}`,
      createdAt: new Date(),
    });

    /* =========================
         GRANT OWNERSHIP
      ========================= */
    user.ownedTools = Array.from(
      new Set([...(user.ownedTools || []), item.code])
    );

    // nếu còn field pending cũ → clear cho sạch
    user.pendingShopPayment = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Fake bank confirm success",
      transaction,
      download,
    });
  } catch (err: any) {
    console.error("❌ /shop/_fake-bank-confirm", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

router.get("/items", authenticate, async (req: any, res) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).lean();
    const ownedTools: string[] = user?.ownedTools || [];

    const items = await ShopItem.find({ active: true })
      .sort({ createdAt: 1 })
      .lean();

    /* ---------------------------------------------
         MAP DATA → FE FORMAT
      --------------------------------------------- */
    const result = items.map((item: any) => ({
      id: item._id, // FE dùng id
      name: item.name,
      priceVND: item.priceVND,
      billing: item.billing || "lifetime",

      shortDesc: item.shortDesc || "",
      fullDesc: item.fullDesc || "",

      target: item.target || "",
      level: item.level || "Beginner",

      highlightPoints: item.highlightPoints || [],
      features: item.features || [],
      steps: item.steps || [],

      videoUrl: item.videoUrl || "",

      badge: item.badge,
      highlight: item.highlight || false,

      owned: ownedTools.includes(item.code),
    }));

    return res.json({
      success: true,
      items: result,
    });
  } catch (err) {
    console.error("❌ /shop/items", err);
    return res.status(500).json({
      success: false,
      message: "Không lấy được danh sách shop",
    });
  }
});

router.get("/shop-items", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const search = String(req.query.search || "");

    const query: any = {};
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const [items, totalItems] = await Promise.all([
      ShopItem.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      ShopItem.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: items,
      totalItems,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("❌ GET /shop-items", err);
    return res.status(500).json({ success: false });
  }
});

router.post("/shop-items", async (req, res) => {
  try {
    const exists = await ShopItem.findOne({ code: req.body.code });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Item code already exists",
      });
    }

    const item = await ShopItem.create(req.body);

    return res.json({
      success: true,
      data: item,
    });
  } catch (err: any) {
    console.error("❌ POST /shop-items", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/shop-items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ShopItem.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (err: any) {
    console.error("❌ PUT /shop-items/:id", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
router.delete("/shop-items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ShopItem.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.json({
      success: true,
      message: "Deleted",
    });
  } catch (err: any) {
    console.error("❌ DELETE /shop-items/:id", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
router.get("/shop-items/:id", async (req, res) => {
  try {
    const item = await ShopItem.findById(req.params.id).lean();
    if (!item) {
      return res.status(404).json({ success: false });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});
export default router;
