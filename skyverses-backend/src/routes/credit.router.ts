import express from "express";
import CreditPackage from "../models/CreditPackage.model";
import CreditTransaction from "../models/CreditTransaction.model";
import User from "../models/UserModel";
import { authenticate } from "./auth";
import {isSameDay} from '../utils/isSameDay'

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Credits
 *   description: Credit system APIs (packages, top-up, consume, history)
 */

/* =====================================================
   GET LIST CREDIT PACKAGES (PUBLIC)
===================================================== */
/**
 * @swagger
 * /credits/packages:
 *   get:
 *     summary: Get list of active credit packages
 *     tags: [Credits]
 */
router.get("/packages", async (_req, res) => {
  const packages = await CreditPackage.find({}).sort({ sortOrder: 1 }).lean();

  res.json({
    data: packages.map((pkg: any) => ({
      ...pkg,
      totalCredits: pkg.totalCredits, // ⭐ virtual
    })),
  });
});

/* =====================================================
   GET CURRENT CREDIT BALANCE
===================================================== */
router.get("/balance", authenticate, async (req: any, res) => {
  const user = await User.findById(req.user.userId).select("creditBalance");
  res.json({ creditBalance: user?.creditBalance || 0 });
});

/* =====================================================
   TOP-UP CREDIT (AFTER PAYMENT SUCCESS)
===================================================== */
/**
 * @swagger
 * /credits/top-up:
 *   post:
 *     summary: Top-up credits by selecting a package
 *     tags: [Credits]
 */
router.post("/top-up", authenticate, async (req: any, res) => {
  const { packageCode, paymentMethod = "manual" } = req.body;

  const pkg: any = await CreditPackage.findOne({
    code: packageCode,
    active: true,
  });

  if (!pkg) {
    return res.status(400).json({ message: "INVALID_CREDIT_PACKAGE" });
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ message: "USER_NOT_FOUND" });
  }

  const creditAdded = pkg.totalCredits; // ⭐ QUAN TRỌNG

  /* ================= APPLY CREDIT ================= */
  user.creditBalance += creditAdded;
  await user.save();

  /* ================= LOG TRANSACTION ================= */
  const tx = await CreditTransaction.create({
    userId: user._id,
    type: "TOP_UP",
    amount: creditAdded,
    balanceAfter: user.creditBalance,
    source: paymentMethod,
    note: `Top up package: ${pkg.name}`,
    meta: {
      packageCode: pkg.code,
      baseCredits: pkg.credits,
      bonusPercent: pkg.bonusPercent,
      bonusCredits: pkg.bonusCredits,
      totalCredits: creditAdded,
      price: pkg.price,
      currency: pkg.currency,
    },
  });

  res.json({
    success: true,
    creditAdded,
    creditBalance: user.creditBalance,
    transaction: tx,
  });
});

/* =====================================================
   CONSUME CREDIT (INTERNAL USE)
===================================================== */
router.post("/consume", authenticate, async (req: any, res) => {
  const { amount, reason } = req.body;

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "INVALID_AMOUNT" });
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ message: "USER_NOT_FOUND" });
  }

  if (user.creditBalance < amount) {
    return res.status(400).json({ message: "INSUFFICIENT_CREDITS" });
  }

  user.creditBalance -= amount;
  await user.save();

  const tx = await CreditTransaction.create({
    userId: user._id,
    type: "CONSUME",
    amount: -amount,
    balanceAfter: user.creditBalance,
    source: "system",
    note: reason || "Credit consumption",
  });

  res.json({
    success: true,
    creditBalance: user.creditBalance,
    transaction: tx,
  });
});

/* =====================================================
   CREDIT TRANSACTION HISTORY
===================================================== */
router.get("/history", authenticate, async (req: any, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);

  const query = { userId: req.user.userId };

  const data = await CreditTransaction.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean(); // ⭐ QUAN TRỌNG

  const total = await CreditTransaction.countDocuments(query);

  res.json({
    data,
    pagination: { page, limit, total },
  });
});

/* =====================================================
   USER: MY PURCHASE HISTORY (plan info + purchase list)
===================================================== */
router.get("/my-purchases", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });

    // Import Transaction model
    const { Transaction } = await import("../models/BankTransactionModel");

    // Tìm tất cả giao dịch thành công có planCode
    const txs = await Transaction.find({
      userId,
      status: "success",
      planCode: { $exists: true, $ne: null },
    })
      .sort({ createdAt: -1 })
      .lean();

    const purchases = txs.map((t: any) => ({
      planCode: t.planCode,
      planName: t.planName || t.planCode,
      amount: t.amount || 0,
      memo: t.note,
      purchasedAt: t.createdAt,
      verifiedAt: t.verifiedAt,
    }));

    res.json({
      success: true,
      plan: user.plan || null,
      planExpiresAt: user.planExpiresAt || null,
      purchases,
    });
  } catch (err: any) {
    console.error("❌ [GET /credits/my-purchases]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN ADJUST CREDIT
===================================================== */
router.post("/admin/add", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }

  const { userId, amount, note } = req.body;

  if (typeof amount !== "number") {
    return res.status(400).json({ message: "INVALID_AMOUNT" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "USER_NOT_FOUND" });
  }

  user.creditBalance += amount;
  await user.save();

  const tx = await CreditTransaction.create({
    userId: user._id,
    type: amount > 0 ? "BONUS" : "REFUND",
    amount,
    balanceAfter: user.creditBalance,
    source: "admin",
    note,
  });

  res.json({
    success: true,
    creditBalance: user.creditBalance,
    transaction: tx,
  });
});

/* =====================================================
   ADMIN: GET USER CREDIT HISTORY
===================================================== */
router.get("/admin/user-history/:userId", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }

  const { userId } = req.params;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);

  const query = { userId };
  const [data, total] = await Promise.all([
    CreditTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CreditTransaction.countDocuments(query),
  ]);

  const user = await User.findById(userId).select("email name creditBalance").lean();

  res.json({
    success: true,
    user: user ? { email: user.email, name: user.name, creditBalance: user.creditBalance } : null,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/* =====================================================
   ADMIN: TOP-UP HISTORY (bank + crypto)
===================================================== */
router.get("/admin/top-up-history", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 30);
  const source = req.query.source as string;
  const search = req.query.search as string;

  const query: any = { type: "TOP_UP" };
  if (source) query.source = source;
  if (search) {
    query.$or = [
      { note: { $regex: search, $options: "i" } },
      { source: { $regex: search, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    CreditTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CreditTransaction.countDocuments(query),
  ]);

  const userIds = [...new Set(data.map((d: any) => d.userId?.toString()).filter(Boolean))];
  const users = await User.find({ _id: { $in: userIds } }).select("email name avatar").lean();
  const userMap: Record<string, any> = {};
  users.forEach((u: any) => { userMap[u._id.toString()] = u; });

  const enriched = data.map((tx: any) => ({
    ...tx,
    user: userMap[tx.userId?.toString()] || null,
  }));

  res.json({
    success: true,
    data: enriched,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/* =====================================================
   ADMIN: WEBHOOK LOGS (raw bank payloads)
===================================================== */
router.get("/admin/webhook-logs", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 30);

  const { BankTransactionTemp, BankTransaction } = await import("../models/BankTransactionModel");

  const [tempLogs, totalTemp] = await Promise.all([
    BankTransactionTemp.find()
      .sort({ receivedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BankTransactionTemp.countDocuments(),
  ]);

  const [bankTxns, totalBank] = await Promise.all([
    BankTransaction.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "email name")
      .lean(),
    BankTransaction.countDocuments(),
  ]);

  res.json({
    success: true,
    webhookLogs: tempLogs,
    bankTransactions: bankTxns,
    pagination: {
      page, limit,
      totalLogs: totalTemp,
      totalBankTxns: totalBank,
      totalPages: Math.ceil(Math.max(totalTemp, totalBank) / limit),
    },
  });
});

/* =====================================================
   CLAIM WELCOME CREDIT (ONE-TIME)
===================================================== */
router.post("/claim-welcome", authenticate, async (req: any, res) => {
  const WELCOME_CREDIT = 1000;

  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ message: "USER_NOT_FOUND" });
  }

  if (user.claimWelcomeCredit) {
    return res.status(400).json({
      message: "WELCOME_CREDIT_ALREADY_CLAIMED",
    });
  }

  user.creditBalance += WELCOME_CREDIT;
  user.claimWelcomeCredit = true;
  await user.save();

  const tx = await CreditTransaction.create({
    userId: user._id,
    type: "WELCOME",
    amount: WELCOME_CREDIT,
    balanceAfter: user.creditBalance,
    source: "system",
    note: "Welcome credit",
  });

  res.json({
    success: true,
    creditAdded: WELCOME_CREDIT,
    creditBalance: user.creditBalance,
    transaction: tx,
  });
});

/* =====================================================
   CLAIM DAILY CREDIT (ONCE PER DAY)
===================================================== */
router.post("/claim-daily", authenticate, async (req: any, res) => {
  const DAILY_CREDIT = 100;

  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ message: "USER_NOT_FOUND" });
  }

  const now = new Date();

  // ❌ Đã claim hôm nay
  if (
    user.lastDailyClaimAt &&
    isSameDay(new Date(user.lastDailyClaimAt), now)
  ) {
    return res.status(400).json({
      message: "DAILY_CREDIT_ALREADY_CLAIMED",
      nextClaimAt: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0
      ),
    });
  }

  /* ================= APPLY CREDIT ================= */
  user.creditBalance += DAILY_CREDIT;
  user.lastDailyClaimAt = now;
  await user.save();

  const tx = await CreditTransaction.create({
    userId: user._id,
    type: "DAILY",
    amount: DAILY_CREDIT,
    balanceAfter: user.creditBalance,
    source: "system",
    note: "Daily check-in credit",
  });

  res.json({
    success: true,
    creditAdded: DAILY_CREDIT,
    creditBalance: user.creditBalance,
    transaction: tx,
    claimedAt: now,
  });
});

/* =====================================================
   ADMIN CREATE CREDIT PACKAGE
===================================================== */
router.post("/admin/package", authenticate, async (req: any, res) => {
  const {
    /* BASIC */
    code,
    name,
    description,

    /* CREDIT */
    credits,
    bonusPercent = 0,
    bonusCredits = 0,

    /* PRICE */
    price,
    originalPrice,
    currency = "USD",
    billingCycle = "monthly",
    billedMonths = 1,
    discountPercent,

    /* UI FLAGS */
    popular = false,
    highlight = false,
    badge,
    ribbon,
    ctaText,

    /* FEATURES */
    features = [],
    unlimitedModels = [],

    /* THEME */
    theme,

    /* STATUS */
    active = true,
    sortOrder = 0,
  } = req.body;

  /* ================= VALIDATION ================= */
  if (
    !code ||
    !name ||
    typeof credits !== "number" ||
    typeof price !== "number"
  ) {
    return res.status(400).json({
      message: "INVALID_PACKAGE_PARAMS",
      required: ["code", "name", "credits", "price"],
    });
  }

  const existed = await CreditPackage.findOne({ code });
  if (existed) {
    return res.status(400).json({ message: "PACKAGE_CODE_EXISTS" });
  }

  /* ================= CREATE ================= */
  const pkg = await CreditPackage.create({
    code,
    name,
    description,

    credits,
    bonusPercent,
    bonusCredits,

    price,
    originalPrice,
    currency,
    billingCycle,
    billedMonths,
    discountPercent,

    popular,
    highlight,
    badge,
    ribbon,
    ctaText,

    features,
    unlimitedModels,

    theme,

    active,
    sortOrder,
  });

  res.json({
    success: true,
    data: pkg.toJSON(),
  });
});

/* =====================================================
   ADMIN UPDATE CREDIT PACKAGE
===================================================== */
router.put("/admin/package/:id", authenticate, async (req: any, res) => {
  const { id } = req.params;

  const pkg = await CreditPackage.findById(id);
  if (!pkg) {
    return res.status(404).json({ message: "PACKAGE_NOT_FOUND" });
  }

  const {
    /* BASIC */
    code,
    name,
    description,

    /* CREDIT */
    credits,
    bonusPercent,
    bonusCredits,

    /* PRICE */
    price,
    originalPrice,
    currency,
    billingCycle,
    billedMonths,
    discountPercent,

    /* UI FLAGS */
    popular,
    highlight,
    badge,
    ribbon,
    ctaText,

    /* FEATURES */
    features,
    unlimitedModels,

    /* THEME */
    theme,

    /* STATUS */
    active,
    sortOrder,
  } = req.body;

  /* ================= APPLY UPDATE ================= */
  if (code !== undefined) pkg.code = code;
  if (name !== undefined) pkg.name = name;
  if (description !== undefined) pkg.description = description;

  if (credits !== undefined) pkg.credits = credits;
  if (bonusPercent !== undefined) pkg.bonusPercent = bonusPercent;
  if (bonusCredits !== undefined) pkg.bonusCredits = bonusCredits;

  if (price !== undefined) pkg.price = price;
  if (originalPrice !== undefined) pkg.originalPrice = originalPrice;
  if (currency !== undefined) pkg.currency = currency;
  if (billingCycle !== undefined) pkg.billingCycle = billingCycle;
  if (billedMonths !== undefined) pkg.billedMonths = billedMonths;
  if (discountPercent !== undefined) pkg.discountPercent = discountPercent;

  if (popular !== undefined) pkg.popular = popular;
  if (highlight !== undefined) pkg.highlight = highlight;
  if (badge !== undefined) pkg.badge = badge;
  if (ribbon !== undefined) pkg.ribbon = ribbon;
  if (ctaText !== undefined) pkg.ctaText = ctaText;

  if (features !== undefined) pkg.features = features;
  if (unlimitedModels !== undefined) pkg.unlimitedModels = unlimitedModels;

  if (theme !== undefined) pkg.theme = theme;

  if (active !== undefined) pkg.active = active;
  if (sortOrder !== undefined) pkg.sortOrder = sortOrder;

  await pkg.save();

  res.json({
    success: true,
    data: pkg.toJSON(),
  });
});

router.patch(
  "/admin/package/:id/toggle",
  authenticate,
  async (req: any, res) => {
    const pkg = await CreditPackage.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: "PACKAGE_NOT_FOUND" });
    }

    pkg.active = !pkg.active;
    await pkg.save();

    res.json({ success: true, active: pkg.active });
  }
);

/* =====================================================
   ADMIN DELETE CREDIT PACKAGE
===================================================== */
router.delete("/admin/package/:id", authenticate, async (req: any, res) => {
  const pkg = await CreditPackage.findById(req.params.id);
  if (!pkg) {
    return res.status(404).json({ message: "PACKAGE_NOT_FOUND" });
  }

  await pkg.deleteOne();

  res.json({
    success: true,
    message: "PACKAGE_DELETED",
    id: pkg._id,
  });
});

/* =====================================================
   CREDIT PURCHASE FLOW — QR BANK TRANSFER
   1) POST /credits/purchase/create  → tạo pending tx + memo
   2) GET  /credits/purchase/check/:txId → FE poll check status
   3) POST /credits/purchase/cancel/:txId → huỷ
===================================================== */

import { Transaction, BankTransaction } from "../models/BankTransactionModel";

// Generate standardized memo: SKY {PACKAGE_CODE} {USER_ID_6} {TIMESTAMP}
// Example: SKY ULTIMATE A2B3C4 0323173505
function generateCreditMemo(packageCode: string, userId: string): string {
  const code = packageCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  const uid = userId.slice(-6).toUpperCase();
  const now = new Date();
  const ts = [
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
  // Random 3-char suffix to prevent duplicate key on rapid retries
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `SKY ${code} ${uid} ${ts}${rnd}`;
}


/**
 * POST /credits/purchase/create
 * Body: { packageCode }
 * → Creates a pending Transaction, returns memo for bank transfer
 */
router.post("/purchase/create", authenticate, async (req: any, res) => {
  try {
    const { packageCode } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });

    const pkg: any = await CreditPackage.findOne({ code: packageCode, active: true });
    if (!pkg) return res.status(400).json({ message: "INVALID_PACKAGE" });

    // Cancel any existing pending tx for this user+package
    await Transaction.updateMany(
      { userId: user._id, planCode: packageCode, status: "pending" },
      { $set: { status: "failed", errorMessage: "Replaced by new purchase" } }
    );

    const USD_TO_VND = 26000;
    const amountVND = Math.round(pkg.price * USD_TO_VND);
    const memo = generateCreditMemo(packageCode, String(user._id));

    const tx = await Transaction.create({
      userId: user._id,
      planCode: packageCode,
      note: memo,
      amount: amountVND,
      status: "pending",
    });

    res.json({
      success: true,
      transaction: {
        _id: tx._id,
        memo,
        amount: amountVND,
        packageName: pkg.name,
        credits: pkg.totalCredits || pkg.credits,
        status: "pending",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });
  } catch (err: any) {
    console.error("❌ [CREDIT PURCHASE CREATE]", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Giao dịch trùng lặp, vui lòng thử lại." });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /credits/purchase/check/:txId
 * → FE polls this to check if webhook has matched the bank transfer
 */
router.get("/purchase/check/:txId", authenticate, async (req: any, res) => {
  try {
    const tx: any = await Transaction.findById(req.params.txId).lean();
    if (!tx) return res.status(404).json({ message: "TX_NOT_FOUND" });

    // Check if expired (15 min)
    const isExpired = Date.now() - new Date(tx.createdAt).getTime() > 15 * 60 * 1000;
    if (tx.status === "pending" && isExpired) {
      await Transaction.updateOne({ _id: tx._id }, { $set: { status: "failed", errorMessage: "Expired" } });
      return res.json({ status: "expired" });
    }

    // If still pending, also try to match with recent bank transactions
    if (tx.status === "pending") {
      // Escape memo for regex (contains spaces now)
      const escapedMemo = tx.note.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = await BankTransaction.findOne({
        description: { $regex: escapedMemo, $options: "i" },
        amount: { $gte: tx.amount * 0.99 }, // allow 1% tolerance
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // last 30min
      }).lean();

      if (match) {
        // AUTO-CONFIRM payment
        const user = await User.findById(tx.userId);
        if (user) {
          const pkg: any = await CreditPackage.findOne({ code: tx.planCode, active: true });
          const creditAmount = pkg ? (pkg.totalCredits || pkg.credits) : 0;

          if (creditAmount > 0) {
            user.creditBalance += creditAmount;

            // ✅ Ghi nhận plan từ gói đã mua (để CMS hiển thị đúng)
            if (pkg.code) {
              user.plan = pkg.code;
            }

            await user.save();

            await CreditTransaction.create({
              userId: user._id,
              type: "TOP_UP",
              amount: creditAmount,
              balanceAfter: user.creditBalance,
              source: "bank_transfer",
              note: `QR Payment: ${tx.note}`,
              meta: {
                packageCode: tx.planCode,
                totalCredits: creditAmount,
                bankTransactionId: (match as any).transactionId,
              },
            });

            await Transaction.updateOne(
              { _id: tx._id },
              {
                $set: {
                  status: "success",
                  verifiedAt: new Date(),
                  bankTransactionId: (match as any).transactionId,
                },
              }
            );

            return res.json({
              status: "success",
              creditsAdded: creditAmount,
              creditBalance: user.creditBalance,
            });
          }
        }
      }
    }

    res.json({ status: tx.status });
  } catch (err: any) {
    console.error("❌ [CREDIT PURCHASE CHECK]", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /credits/purchase/cancel/:txId
 */
router.post("/purchase/cancel/:txId", authenticate, async (req: any, res) => {
  try {
    await Transaction.updateOne(
      { _id: req.params.txId, userId: req.user.userId, status: "pending" },
      { $set: { status: "failed", errorMessage: "Cancelled by user" } }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /credits/purchase/crypto
 * Body: { txId, txHash, network, walletAddress }
 * → Called after wallet tx is sent on-chain
 * → Verifies on-chain before crediting
 */

// RPC endpoints for on-chain verification
const CHAIN_RPC: Record<string, string> = {
  bsc: "https://bsc-dataseed.binance.org/",
  eth: "https://ethereum-rpc.publicnode.com",
};

// ERC-20 Transfer event topic: keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// Known USDT contracts (must match config)
const USDT_CONTRACTS: Record<string, string> = {
  bsc: "0x55d398326f99059ff775485246999027b3197955",
  eth: "0xdac17f958d2ee523a2206206994597c13d831ec7",
};

// USDT decimals per network
const USDT_DECIMALS: Record<string, number> = {
  bsc: 18,
  eth: 6,
};

/**
 * Verify a crypto transaction on-chain via JSON-RPC
 * Returns: { verified, recipient, amount, tokenContract } or throws
 */
async function verifyOnChain(txHash: string, network: string, expectedRecipient: string, expectedAmountUSD: number) {
  const rpcUrl = CHAIN_RPC[network];
  if (!rpcUrl) throw new Error(`Unsupported network: ${network}`);

  // 1️⃣ Get transaction receipt
  const receiptRes = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1,
      method: "eth_getTransactionReceipt",
      params: [txHash],
    }),
  });
  const receiptData = await receiptRes.json();
  const receipt = receiptData.result;

  if (!receipt) {
    return { verified: false, reason: "tx_not_found_or_pending" };
  }

  // 2️⃣ Check tx success (status = 0x1)
  if (receipt.status !== "0x1") {
    return { verified: false, reason: "tx_failed" };
  }

  // 3️⃣ Check token contract (to field must be USDT contract)
  const expectedContract = USDT_CONTRACTS[network]?.toLowerCase();
  if (receipt.to?.toLowerCase() !== expectedContract) {
    return { verified: false, reason: "wrong_contract" };
  }

  // 4️⃣ Parse Transfer event logs to verify recipient & amount
  const transferLogs = (receipt.logs || []).filter(
    (log: any) =>
      log.topics &&
      log.topics[0] === TRANSFER_TOPIC &&
      log.address?.toLowerCase() === expectedContract
  );

  if (transferLogs.length === 0) {
    return { verified: false, reason: "no_transfer_event" };
  }

  // Find the log that matches our recipient
  const normalizedRecipient = expectedRecipient.toLowerCase().replace("0x", "").padStart(64, "0");
  const matchingLog = transferLogs.find(
    (log: any) => log.topics[2]?.toLowerCase() === "0x" + normalizedRecipient
  );

  if (!matchingLog) {
    return { verified: false, reason: "wrong_recipient" };
  }

  // 5️⃣ Verify amount (from log data)
  const decimals = USDT_DECIMALS[network] || 18;
  const transferredRaw = BigInt(matchingLog.data);
  const transferredUSD = Number(transferredRaw) / (10 ** decimals);

  // Allow 1% tolerance for rounding
  if (transferredUSD < expectedAmountUSD * 0.99) {
    return {
      verified: false,
      reason: "insufficient_amount",
      expected: expectedAmountUSD,
      received: transferredUSD,
    };
  }

  return {
    verified: true,
    recipient: expectedRecipient,
    amount: transferredUSD,
    tokenContract: expectedContract,
  };
}

router.post("/purchase/crypto", authenticate, async (req: any, res) => {
  try {
    const { txId, txHash, network, walletAddress } = req.body;
    if (!txId || !txHash || !network) {
      return res.status(400).json({ message: "MISSING_TX_DATA" });
    }

    const tx: any = await Transaction.findById(txId);
    if (!tx) return res.status(404).json({ message: "TX_NOT_FOUND" });
    if (tx.status === "success") {
      return res.json({ status: "already_confirmed" });
    }

    // Prevent duplicate txHash abuse
    const existingTx = await Transaction.findOne({
      bankTransactionId: txHash,
      status: "success",
    });
    if (existingTx) {
      return res.status(400).json({ message: "TX_HASH_ALREADY_USED" });
    }

    const user = await User.findById(tx.userId);
    if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });

    const pkg: any = await CreditPackage.findOne({ code: tx.planCode, active: true });
    const creditAmount = pkg ? (pkg.totalCredits || pkg.credits) : 0;
    if (creditAmount <= 0) {
      return res.status(400).json({ message: "INVALID_PACKAGE" });
    }

    // 🔐 Get crypto config for recipient address
    const SystemSetting = (await import("mongoose")).default.model("SystemSetting");
    const cryptoSetting: any = await SystemSetting.findOne({ key: "crypto" }).lean();
    const cryptoConfig = cryptoSetting?.value;
    const recipientAddress = cryptoConfig?.walletAddress;

    if (!recipientAddress) {
      return res.status(500).json({ message: "CRYPTO_CONFIG_MISSING" });
    }

    // 🔐 ON-CHAIN VERIFICATION
    console.log(`🔍 [CRYPTO] Verifying tx ${txHash.slice(0, 16)}... on ${network}`);

    const verification = await verifyOnChain(txHash, network, recipientAddress, pkg.price);

    if (!verification.verified) {
      if (verification.reason === "tx_not_found_or_pending") {
        // Tx not mined yet — save txHash and let FE poll again
        tx.bankTransactionId = txHash;
        tx.meta = { ...tx.meta, network, walletAddress, verifyStatus: "pending" };
        await tx.save();

        console.log(`⏳ [CRYPTO] Tx ${txHash.slice(0, 16)}... pending on ${network}`);
        return res.json({
          status: "pending_verification",
          message: "Giao dịch đang được xác nhận trên blockchain. Vui lòng đợi.",
        });
      }

      // Verification failed
      console.warn(`❌ [CRYPTO] Verification failed: ${verification.reason}`, verification);
      return res.status(400).json({
        status: "verification_failed",
        message: `Xác thực giao dịch thất bại: ${verification.reason}`,
        details: verification,
      });
    }

    // ✅ VERIFIED — Credit the user
    user.creditBalance += creditAmount;

    // ✅ Ghi nhận plan từ gói đã mua (để CMS hiển thị đúng)
    if (pkg.code) {
      user.plan = pkg.code;
    }

    await user.save();

    await CreditTransaction.create({
      userId: user._id,
      type: "TOP_UP",
      amount: creditAmount,
      balanceAfter: user.creditBalance,
      source: "crypto",
      note: `Crypto Payment: ${network.toUpperCase()} USDT - ${txHash.slice(0, 10)}...`,
      meta: {
        packageCode: tx.planCode,
        totalCredits: creditAmount,
        txHash,
        network,
        walletAddress,
        verifiedOnChain: true,
        verifiedAmount: verification.amount,
      },
    });

    tx.status = "success";
    tx.verifiedAt = new Date();
    tx.bankTransactionId = txHash;
    await tx.save();

    console.log(`✅ [CRYPTO] ${user.email} +${creditAmount} credits via ${network} tx ${txHash.slice(0, 16)}... (verified: $${verification.amount} USDT)`);

    res.json({
      status: "success",
      creditsAdded: creditAmount,
      creditBalance: user.creditBalance,
    });
  } catch (err: any) {
    console.error("❌ [CRYPTO CONFIRM]", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
