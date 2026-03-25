import express from "express";
import Plan from "../models/PlanModel"; // ✅ Model MongoDB
import { SYSTEM_CONFIG } from "../constanst/index";
import { HOME_BLOCKS_CONFIG } from "../config/marketHomeBlocks";
import { listKeyGommoGenmini } from "../config/keyGenminiGommo";

const router = express.Router();

/**
 * @swagger
 * /config:
 *   get:
 *     summary: Lấy toàn bộ cấu hình hệ thống (plans, resolutions, aspect ratios,...)
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", async (req, res) => {
  try {
    /* ---------------------------------------
     * 🔍 Lấy danh sách plan từ DB
     * --------------------------------------- */
    let plans = await Plan.find().lean();

    /* ---------------------------------------
     * 🎁 Welcome Bonus Credits (configurable from CMS)
     * --------------------------------------- */
    let welcomeBonusCredits = 1000; // default
    try {
      const { default: mongoose } = await import('mongoose');
      const SystemSetting = mongoose.models.SystemSetting || mongoose.model('SystemSetting', new mongoose.Schema({ key: { type: String, unique: true }, value: mongoose.Schema.Types.Mixed }, { timestamps: true }));
      const bonusSetting: any = await SystemSetting.findOne({ key: 'welcomeBonusCredits' }).lean();
      if (bonusSetting?.value) welcomeBonusCredits = bonusSetting.value;
    } catch (e) { /* fallback to default */ }

    /* ---------------------------------------
     * 🔧 Các cấu hình khác
     * --------------------------------------- */
    const resolutions = [
      { label: "720p", value: "1280x720" },
      { label: "1080p", value: "1920x1080" },
      { label: "2K", value: "2560x1440" },
      { label: "4K", value: "3840x2160" },
    ];

    const aspectRatios = [
      { label: "16:9", value: "16:9" },
      { label: "1:1", value: "1:1" },
      { label: "9:16", value: "9:16" },
    ];

    /* ---------------------------------------
     * ✅ Phản hồi kết quả
     * --------------------------------------- */
    return res.json({
      success: true,
      data: {
        plans,
        resolutions,
        aspectRatios,
        defaultMaxPrompt: 5,
        defaultMaxDuration: 8,

        // 📌 Config thời gian tự reset (giờ)
        projectExpireHours: SYSTEM_CONFIG.projectExpireHours,
        videoExpireHours: SYSTEM_CONFIG.videoExpireHours,
        imageExpireHours: SYSTEM_CONFIG.imageExpireHours,
        marketHomeBlock: HOME_BLOCKS_CONFIG,
        listKeyGommoGenmini,
        welcomeBonusCredits,
      },
    });
  } catch (err: any) {
    console.error("❌ [GET /config]", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy config.",
      details: err.message,
    });
  }
});

/* =====================================================
   BANKING CONFIG - GET & UPDATE
===================================================== */
import mongoose from "mongoose";
import { authenticate } from "./auth";

const SystemSettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const SystemSetting = (mongoose.models.SystemSetting || mongoose.model("SystemSetting", SystemSettingSchema)) as mongoose.Model<any>;

// Default banking config from .env
const DEFAULT_BANKING = {
  bankName: process.env.BANK_INFO_NAME || "ACB Bank",
  bankCode: process.env.BANK_INFO_CODE || "ACB",
  accountNumber: process.env.BANK_INFO_ACCOUNT_NUMBER || "",
  accountName: process.env.BANK_INFO_ACCOUNT_NAME || "",
  qrTemplate: "compact2",
  isEnabled: true,
  note: "Thanh toán tự động qua VietQR",
};

router.get("/banking", async (_req, res) => {
  try {
    const setting: any = await SystemSetting.findOne({ key: "banking" }).lean();
    res.json({ success: true, data: setting?.value || DEFAULT_BANKING });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/banking", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const result = await SystemSetting.findOneAndUpdate(
      { key: "banking" },
      { $set: { value: req.body } },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: result.value });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   CRYPTO CONFIG - GET & UPDATE
===================================================== */
const DEFAULT_CRYPTO = {
  walletAddress: "",
  networks: ["bsc", "eth"],
  usdtContractBSC: "0x55d398326f99059fF775485246999027B3197955",
  usdtContractETH: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  isEnabled: true,
  note: "USDT Payment via MetaMask",
};

router.get("/crypto", async (_req, res) => {
  try {
    const setting: any = await SystemSetting.findOne({ key: "crypto" }).lean();
    res.json({ success: true, data: setting?.value || DEFAULT_CRYPTO });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/crypto", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const result = await SystemSetting.findOneAndUpdate(
      { key: "crypto" },
      { $set: { value: req.body } },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: result.value });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
