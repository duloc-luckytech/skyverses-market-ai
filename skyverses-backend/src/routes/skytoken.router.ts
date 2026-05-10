import express from "express";
import SkyTokenPackage from "../models/SkyTokenPackage.model";
import SkyTokenTransaction from "../models/SkyTokenTransaction.model";
import User from "../models/UserModel";
import { authenticate } from "./auth";

const router = express.Router();

/* =====================================================
   GET LIST SKYTOKEN PACKAGES (PUBLIC)
===================================================== */
router.get("/packages", async (_req, res) => {
  const packages = await SkyTokenPackage.find({ active: true })
    .sort({ sortOrder: 1 })
    .lean();

  res.json({
    data: packages.map((pkg: any) => ({
      ...pkg,
      totalTokens: pkg.tokens + (pkg.bonusTokens || 0),
    })),
  });
});

/* =====================================================
   GET CURRENT SKYTOKEN BALANCE
===================================================== */
router.get("/balance", authenticate, async (req: any, res) => {
  const user = await User.findById(req.user.userId).select("skyTokenBalance");
  res.json({ skyTokenBalance: user?.skyTokenBalance || 0 });
});

/* =====================================================
   SKYTOKEN TRANSACTION HISTORY
===================================================== */
router.get("/history", authenticate, async (req: any, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);

  const query = { userId: req.user.userId };

  const [data, total] = await Promise.all([
    SkyTokenTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    SkyTokenTransaction.countDocuments(query),
  ]);

  res.json({
    data,
    pagination: { page, limit, total },
  });
});

/* =====================================================
   CLAIM WELCOME SKYTOKEN (ONE-TIME)
===================================================== */
router.post("/claim-welcome", authenticate, async (req: any, res) => {
  const WELCOME_SKT = 50;

  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });

  if (user.claimWelcomeSkyToken) {
    return res.status(400).json({ message: "WELCOME_SKT_ALREADY_CLAIMED" });
  }

  user.skyTokenBalance += WELCOME_SKT;
  user.claimWelcomeSkyToken = true;
  await user.save();

  const tx = await SkyTokenTransaction.create({
    userId: user._id,
    type: "WELCOME",
    amount: WELCOME_SKT,
    balanceAfter: user.skyTokenBalance,
    source: "system",
    note: "Welcome SkyToken bonus",
  });

  res.json({
    success: true,
    tokensAdded: WELCOME_SKT,
    skyTokenBalance: user.skyTokenBalance,
    transaction: tx,
  });
});

/* =====================================================
   SKYTOKEN PURCHASE FLOW — QR BANK TRANSFER
   1) POST /skytoken/purchase/create  → tạo pending tx + memo
   2) GET  /skytoken/purchase/check/:txId → FE poll check status
   3) POST /skytoken/purchase/cancel/:txId → huỷ
===================================================== */

import { Transaction, BankTransaction } from "../models/BankTransactionModel";

function generateSktMemo(packageCode: string, userId: string): string {
  const code = packageCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  const uid = userId.slice(-6).toUpperCase();
  const now = new Date();
  const ts = [
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `SKT ${code} ${uid} ${ts}${rnd}`;
}

/**
 * POST /skytoken/purchase/create
 * Body: { packageCode }
 */
router.post("/purchase/create", authenticate, async (req: any, res) => {
  try {
    const { packageCode } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });

    const pkg: any = await SkyTokenPackage.findOne({ code: packageCode, active: true });
    if (!pkg) return res.status(400).json({ message: "INVALID_PACKAGE" });

    // Cancel any existing pending tx for this user+package
    await Transaction.updateMany(
      { userId: user._id, planCode: packageCode, status: "pending" },
      { $set: { status: "failed", errorMessage: "Replaced by new purchase" } }
    );

    const amountVND = pkg.price; // SKT packages giá trực tiếp VND
    const memo = generateSktMemo(packageCode, String(user._id));

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
        tokens: pkg.tokens + (pkg.bonusTokens || 0),
        status: "pending",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  } catch (err: any) {
    console.error("❌ [SKT PURCHASE CREATE]", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Giao dịch trùng lặp, vui lòng thử lại." });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /skytoken/purchase/check/:txId
 */
router.get("/purchase/check/:txId", authenticate, async (req: any, res) => {
  try {
    const tx: any = await Transaction.findById(req.params.txId).lean();
    if (!tx) return res.status(404).json({ message: "TX_NOT_FOUND" });

    // Check if expired (15 min)
    const isExpired = Date.now() - new Date(tx.createdAt).getTime() > 15 * 60 * 1000;
    if (tx.status === "pending" && isExpired) {
      await Transaction.updateOne(
        { _id: tx._id },
        { $set: { status: "failed", errorMessage: "Expired" } }
      );
      return res.json({ status: "expired" });
    }

    // If still pending, try to match with recent bank transactions
    if (tx.status === "pending") {
      const escapedMemo = tx.note.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = await BankTransaction.findOne({
        description: { $regex: escapedMemo, $options: "i" },
        amount: { $gte: tx.amount * 0.99 },
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
      }).lean();

      if (match) {
        const user = await User.findById(tx.userId);
        if (user) {
          const pkg: any = await SkyTokenPackage.findOne({ code: tx.planCode, active: true });
          const tokenAmount = pkg ? pkg.tokens + (pkg.bonusTokens || 0) : 0;

          if (tokenAmount > 0) {
            user.skyTokenBalance += tokenAmount;
            await user.save();

            await SkyTokenTransaction.create({
              userId: user._id,
              type: "TOP_UP",
              amount: tokenAmount,
              balanceAfter: user.skyTokenBalance,
              source: "bank_transfer",
              note: `QR Payment: ${tx.note}`,
              meta: {
                packageCode: tx.planCode,
                totalTokens: tokenAmount,
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
              tokensAdded: tokenAmount,
              skyTokenBalance: user.skyTokenBalance,
            });
          }
        }
      }
    }

    res.json({ status: tx.status });
  } catch (err: any) {
    console.error("❌ [SKT PURCHASE CHECK]", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /skytoken/purchase/cancel/:txId
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

/* =====================================================
   ADMIN: ADJUST SKYTOKEN
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
  if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });

  user.skyTokenBalance += amount;
  await user.save();

  const tx = await SkyTokenTransaction.create({
    userId: user._id,
    type: amount > 0 ? "BONUS" : "REFUND",
    amount,
    balanceAfter: user.skyTokenBalance,
    source: "admin",
    note,
  });

  res.json({
    success: true,
    skyTokenBalance: user.skyTokenBalance,
    transaction: tx,
  });
});

/* =====================================================
   ADMIN: CRUD SKYTOKEN PACKAGES
===================================================== */
router.get("/admin/packages", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }
  const packages = await SkyTokenPackage.find({}).sort({ sortOrder: 1 }).lean();
  res.json({ data: packages });
});

router.post("/admin/package", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }
  try {
    const pkg = await SkyTokenPackage.create(req.body);
    res.json({ success: true, data: pkg });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/admin/package/:id", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }
  try {
    const pkg = await SkyTokenPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: pkg });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.patch("/admin/package/:id/toggle", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }
  const pkg = await SkyTokenPackage.findById(req.params.id);
  if (!pkg) return res.status(404).json({ message: "NOT_FOUND" });
  pkg.active = !pkg.active;
  await pkg.save();
  res.json({ success: true, active: pkg.active });
});

router.delete("/admin/package/:id", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }
  await SkyTokenPackage.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* =====================================================
   SKYTOKEN WITHDRAWAL (SWAP SKT → VND)
===================================================== */

import SkyTokenWithdrawal from "../models/SkyTokenWithdrawal.model";

const SKT_TO_VND_RATE = 1000; // 1 SKT = 1,000 VND
const MIN_WITHDRAW_SKT = 50;

/**
 * POST /skytoken/withdraw/request
 * Body: { amountSKT, bankName, bankAccountNumber, bankAccountName }
 */
router.post("/withdraw/request", authenticate, async (req: any, res) => {
  try {
    const { amountSKT, bankName, bankAccountNumber, bankAccountName } = req.body;

    if (!amountSKT || amountSKT < MIN_WITHDRAW_SKT) {
      return res.status(400).json({ message: `MIN_WITHDRAW_${MIN_WITHDRAW_SKT}_SKT` });
    }
    if (!bankName || !bankAccountNumber || !bankAccountName) {
      return res.status(400).json({ message: "BANK_INFO_REQUIRED" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });

    if (user.skyTokenBalance < amountSKT) {
      return res.status(400).json({ message: "INSUFFICIENT_SKT_BALANCE" });
    }

    // Check for existing pending withdrawal
    const pendingCount = await SkyTokenWithdrawal.countDocuments({
      userId: user._id,
      status: "pending",
    });
    if (pendingCount > 0) {
      return res.status(400).json({ message: "PENDING_WITHDRAWAL_EXISTS" });
    }

    const amountVND = amountSKT * SKT_TO_VND_RATE;

    // Deduct SKT immediately
    user.skyTokenBalance -= amountSKT;
    await user.save();

    // Create withdrawal request
    const withdrawal = await SkyTokenWithdrawal.create({
      userId: user._id,
      amountSKT,
      amountVND,
      bankName,
      bankAccountNumber,
      bankAccountName,
    });

    // Record transaction
    await SkyTokenTransaction.create({
      userId: user._id,
      type: "WITHDRAW",
      amount: -amountSKT,
      balanceAfter: user.skyTokenBalance,
      source: "withdrawal",
      note: `Withdrawal request #${withdrawal._id}`,
      meta: { withdrawalId: withdrawal._id },
    });

    res.json({
      success: true,
      data: withdrawal,
      skyTokenBalance: user.skyTokenBalance,
    });
  } catch (err: any) {
    console.error("❌ [SKT WITHDRAW REQUEST]", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /skytoken/withdraw/my
 */
router.get("/withdraw/my", authenticate, async (req: any, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const query = { userId: req.user.userId };
    const [data, total] = await Promise.all([
      SkyTokenWithdrawal.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SkyTokenWithdrawal.countDocuments(query),
    ]);

    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /skytoken/withdraw/cancel/:id
 */
router.post("/withdraw/cancel/:id", authenticate, async (req: any, res) => {
  try {
    const withdrawal: any = await SkyTokenWithdrawal.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      status: "pending",
    });
    if (!withdrawal) {
      return res.status(404).json({ message: "WITHDRAWAL_NOT_FOUND_OR_NOT_CANCELLABLE" });
    }

    // Refund SKT
    const user = await User.findById(req.user.userId);
    if (user) {
      user.skyTokenBalance += withdrawal.amountSKT;
      await user.save();

      await SkyTokenTransaction.create({
        userId: user._id,
        type: "REFUND",
        amount: withdrawal.amountSKT,
        balanceAfter: user.skyTokenBalance,
        source: "withdrawal_cancel",
        note: `Cancelled withdrawal #${withdrawal._id}`,
        meta: { withdrawalId: withdrawal._id },
      });
    }

    withdrawal.status = "rejected";
    withdrawal.adminNote = "Cancelled by user";
    await withdrawal.save();

    res.json({ success: true, skyTokenBalance: user?.skyTokenBalance ?? 0 });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   ADMIN: WITHDRAWAL MANAGEMENT
===================================================== */

/**
 * GET /skytoken/admin/withdrawals
 */
router.get("/admin/withdrawals", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const status = req.query.status as string | undefined;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const [data, total] = await Promise.all([
      SkyTokenWithdrawal.find(query)
        .populate("userId", "name email avatar")
        .populate("processedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SkyTokenWithdrawal.countDocuments(query),
    ]);

    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PATCH /skytoken/admin/withdrawal/:id/approve
 */
router.patch("/admin/withdrawal/:id/approve", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }
  try {
    const withdrawal = await SkyTokenWithdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: "NOT_FOUND" });
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "NOT_PENDING" });
    }

    withdrawal.status = "approved";
    withdrawal.processedBy = req.user.userId;
    withdrawal.processedAt = new Date();
    withdrawal.adminNote = req.body.adminNote || "";
    await withdrawal.save();

    res.json({ success: true, data: withdrawal });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PATCH /skytoken/admin/withdrawal/:id/reject
 */
router.patch("/admin/withdrawal/:id/reject", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }
  try {
    const withdrawal: any = await SkyTokenWithdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: "NOT_FOUND" });
    if (withdrawal.status !== "pending" && withdrawal.status !== "approved") {
      return res.status(400).json({ message: "CANNOT_REJECT" });
    }

    // Refund SKT to user
    const user = await User.findById(withdrawal.userId);
    if (user) {
      user.skyTokenBalance += withdrawal.amountSKT;
      await user.save();

      await SkyTokenTransaction.create({
        userId: user._id,
        type: "REFUND",
        amount: withdrawal.amountSKT,
        balanceAfter: user.skyTokenBalance,
        source: "admin_reject_withdrawal",
        note: `Admin rejected withdrawal #${withdrawal._id}`,
        meta: { withdrawalId: withdrawal._id },
      });
    }

    withdrawal.status = "rejected";
    withdrawal.processedBy = req.user.userId;
    withdrawal.processedAt = new Date();
    withdrawal.adminNote = req.body.reason || "Rejected by admin";
    await withdrawal.save();

    res.json({ success: true, data: withdrawal });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PATCH /skytoken/admin/withdrawal/:id/complete
 */
router.patch("/admin/withdrawal/:id/complete", authenticate, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "FORBIDDEN" });
  }
  try {
    const withdrawal = await SkyTokenWithdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: "NOT_FOUND" });
    if (withdrawal.status !== "approved") {
      return res.status(400).json({ message: "MUST_BE_APPROVED_FIRST" });
    }

    withdrawal.status = "completed";
    withdrawal.completedAt = new Date();
    withdrawal.processedBy = req.user.userId;
    withdrawal.adminNote = req.body.adminNote || withdrawal.adminNote || "Bank transfer completed";
    await withdrawal.save();

    res.json({ success: true, data: withdrawal });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
