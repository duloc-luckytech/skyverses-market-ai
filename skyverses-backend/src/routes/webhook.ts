// routes/webhook.ts
import express from "express";
import {
  BankTransactionTemp,
  Transaction,
  BankTransaction,
} from "../models/BankTransactionModel";
import User from "../models/UserModel";
import Plan from "../models/PlanModel";
import GoogleTokenModel from "../models/GoogleTokenModel";
import { MAX_VIDEO_PLAN } from "../constanst/plans";
import { handleAffiliateCommission } from "../services/utils/affiliate";

const router = express.Router();

/* ============================================================
   CONFIG
=============================================================== */

const DOMAIN_PREFIX = process.env.DOMAIN_NAME || "NEO";

const VIP_MIN_CREDIT = 20000;
const VIP_MAX_SLOT = 5;

/* ============================================================
   HELPER: Pick VIP token + auto-scale slot
=============================================================== */
async function pickVipTokenAutoScale() {
  // 1️⃣ Token VIP còn slot
  const freeToken = await GoogleTokenModel.findOne({
    type: "vip",
    isActive: true,
    credits: { $gt: VIP_MIN_CREDIT },
    $expr: { $lt: ["$assigned", "$slot"] },
  }).sort({ assigned: 1, lastUsedAt: 1 });

  if (freeToken) return freeToken;

  // 2️⃣ Auto-scale slot (ATOMIC)
  const scaledToken = await GoogleTokenModel.findOneAndUpdate(
    {
      type: "vip",
      isActive: true,
      credits: { $gt: VIP_MIN_CREDIT },
      slot: { $lt: VIP_MAX_SLOT },
    },
    { $inc: { slot: 1 } },
    {
      sort: { assigned: 1, lastUsedAt: 1 },
      new: true,
    }
  );

  if (scaledToken) {
    console.warn(
      `⚠️ [WEBHOOK] Auto-scale VIP slot: ${scaledToken.email} → ${scaledToken.slot}`
    );
  }

  return scaledToken;
}

/* ============================================================
   HELPER: Assign user → VIP token (SAFE)
=============================================================== */
async function assignVipTokenToUser(userId: any) {
  const token = await pickVipTokenAutoScale();
  if (!token) return null;

  const res = await GoogleTokenModel.updateOne(
    {
      _id: token._id,
      userIds: { $ne: userId },
      $expr: { $lt: ["$assigned", "$slot"] },
    },
    {
      $push: { userIds: userId },
      $inc: { assigned: 1 },
      $set: { lastUsedAt: new Date() },
    }
  );

  if (res.modifiedCount === 0) return null;

  return token;
}

/* ============================================================
   WEBHOOK
=============================================================== */
router.post("/bank", async (req, res) => {
  try {
    const body = req.body;

    /* ============================================================
        1) Normalize payload
    ============================================================ */
    let transactions: any[] = [];

    if (Array.isArray(body?.data)) {
      transactions = body.data.map((tx: any) => ({
        transactionId: tx.transactionID,
        transactionNum: tx.transactionNum,
        amount: parseFloat(tx.amount || "0"),
        description: tx.description,
        date: tx.date,
        bank: tx.bank,
        accountNumber: tx.accountNumber,
        checksum: tx.checksum,
        raw: tx,
      }));
    }

    if (Array.isArray(body?.transactions)) {
      transactions = body.transactions.map((tx: any) => ({
        transactionId: String(tx.id),
        transactionNum: tx.transactionNumber,
        amount: Number(tx.transferAmount || 0),
        description: tx.content,
        date: tx.transactionDate,
        bank: tx.gateway,
        accountNumber: tx.accountNumber,
        checksum: tx.checksum,
        raw: tx,
      }));
    }

    if (!transactions.length) {
      return res.status(400).json({ error: "Invalid payload structure" });
    }

    /* ============================================================
        2) Save RAW → BankTransactionTemp
    ============================================================ */
    for (const tx of transactions) {
      try {
        await BankTransactionTemp.updateOne(
          { transactionId: tx.transactionId },
          { $setOnInsert: { payload: tx.raw, receivedAt: new Date() } },
          { upsert: true }
        );
      } catch (err: any) {
        if (err.code === 11000) console.warn("⚠️ Duplicate temp");
      }
    }

    /* ============================================================
        3) Upsert BankTransaction
    ============================================================ */
    const ops = transactions.map((tx) => {
      const safeDate = new Date(tx.date);
      return {
        updateOne: {
          filter: { transactionId: tx.transactionId },
          update: {
            $set: {
              ...tx,
              date: isNaN(safeDate.getTime()) ? new Date() : safeDate,
            },
          },
          upsert: true,
        },
      };
    });

    if (ops.length) {
      await BankTransaction.bulkWrite(ops);
    }

    /* ============================================================
        4) Upgrade plan logic
    ============================================================ */

    const plans: any[] = await Plan.find({}, "code").lean();
    const planCodes = plans.map((p) => p.code.toUpperCase()).join("|");

    const regexDynamic = new RegExp(
      `(?:^|\\b)${DOMAIN_PREFIX}(${planCodes})[A-Za-z0-9]{8,}`,
      "i"
    );

    for (const tx of transactions) {
      const { transactionId, amount, description } = tx;
      if (!description) continue;

      const match = description.match(regexDynamic);
      if (!match) continue;

      const fullCode = match[0];
      const planCode = match[1];

      const matchedTx: any = await Transaction.findOne({
        note: fullCode,
        status: "pending",
      });

      if (!matchedTx) continue;

      const user: any = await User.findById(matchedTx.userId);
      if (!user) continue;

      const plan = await Plan.findOne({
        code: new RegExp(`^${planCode}$`, "i"),
      });

      if (!plan) continue;

      const planPrice =
        parseInt(plan.discountPrice?.replace(/\D/g, "")) ||
        parseInt(plan.price?.replace(/\D/g, "")) ||
        0;

      if (Math.round(amount) !== Math.round(planPrice)) {
        matchedTx.status = "failed";
        matchedTx.errorMessage = `Sai số tiền ${amount} ≠ ${planPrice}`;
        await matchedTx.save();
        continue;
      }

      /* ================= SUCCESS ================= */

      matchedTx.status = "success";
      matchedTx.verifiedAt = new Date();
      matchedTx.bankTransactionId = transactionId;
      await matchedTx.save();

      const expiresAt = new Date(
        Date.now() + plan.expire * 86400 * 1000 + 7 * 60 * 60 * 1000
      );

      user.plan = plan.key;
      user.planExpiresAt = expiresAt;
      user.videoUsed = 0;
      user.maxVideo = MAX_VIDEO_PLAN[plan.key]?.maxVideo ?? user.maxVideo;
      await user.save();

      /* ================= ASSIGN VIP TOKEN ================= */

      if (plan.key !== "free") {
        const vipToken = await assignVipTokenToUser(user._id);

        if (vipToken) {
          user.googleId = vipToken._id;
          await user.save();
        } else {
          console.warn(
            `⚠️ VIP user ${user._id} upgraded but no token available (cron will handle)`
          );
        }
      }

      /* ================= AFFILIATE ================= */

      try {
        await handleAffiliateCommission(
          user._id.toString(),
          plan.key,
          planPrice
        );
      } catch (err) {
        console.error("Affiliate error:", err);
      }

      /* ================= LINK BANK TX ================= */

      await BankTransaction.updateOne(
        { transactionId },
        { $set: { userId: user._id } }
      );
    }

    /* ============================================================
        5) Credit purchase matching (SKY {CODE} {UID} {TS} memo)
    ============================================================ */
    const CreditPackage = (await import("../models/CreditPackage.model")).default;
    const CreditTransaction = (await import("../models/CreditTransaction.model")).default;

    for (const tx of transactions) {
      const { transactionId, amount, description } = tx;
      if (!description) continue;

      // Match new format: SKY {PACKAGE_CODE} {USER_ID_6} {TIMESTAMP_10}{RND_3}
      // Example: "SKY ULTIMATE A2B3C4 0323173505XY2"
      const creditMatch = description.match(/SKY\s+([A-Z0-9]+)\s+([A-F0-9]{6})\s+([A-Z0-9]{10,15})/i);
      if (!creditMatch) continue;

      // Reconstruct the full memo to find in DB (exact match)
      const fullMemo = `SKY ${creditMatch[1].toUpperCase()} ${creditMatch[2].toUpperCase()} ${creditMatch[3].toUpperCase()}`;

      // Find pending credit transaction with this memo
      // Also try prefix match in case bank truncates the description
      const pendingTx: any = await Transaction.findOne({
        $or: [
          { note: fullMemo, status: "pending" },
          { note: { $regex: `^SKY ${creditMatch[1].toUpperCase()} ${creditMatch[2].toUpperCase()}`, $options: 'i' }, status: "pending" }
        ]
      });
      if (!pendingTx) continue;

      // Verify amount (allow 1% tolerance)
      if (Math.round(amount) < Math.round(pendingTx.amount * 0.99)) {
        console.warn(`⚠️ [WEBHOOK CREDIT] Amount mismatch: ${amount} vs ${pendingTx.amount}`);
        continue;
      }

      // Find user and package
      const creditUser = await User.findById(pendingTx.userId);
      if (!creditUser) continue;

      const pkg: any = await CreditPackage.findOne({ code: pendingTx.planCode, active: true });
      const creditAmount = pkg ? (pkg.totalCredits || pkg.credits) : 0;
      if (creditAmount <= 0) continue;

      /* ================= AUTO-CONFIRM CREDIT ================= */
      creditUser.creditBalance += creditAmount;
      await creditUser.save();

      await CreditTransaction.create({
        userId: creditUser._id,
        type: "TOP_UP",
        amount: creditAmount,
        balanceAfter: creditUser.creditBalance,
        source: "bank_transfer",
        note: `QR Payment: ${fullMemo}`,
        meta: {
          packageCode: pendingTx.planCode,
          totalCredits: creditAmount,
          bankTransactionId: transactionId,
        },
      });

      pendingTx.status = "success";
      pendingTx.verifiedAt = new Date();
      pendingTx.bankTransactionId = transactionId;
      await pendingTx.save();

      await BankTransaction.updateOne(
        { transactionId },
        { $set: { userId: creditUser._id } }
      );

      console.log(`✅ [WEBHOOK CREDIT] ${creditUser.email} +${creditAmount} credits via ${fullMemo}`);
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).send("Webhook failed");
  }
});

export default router;