import {
  BankTransactionTemp,
  Transaction,
  BankTransaction,
} from "../models/BankTransactionModel";
import User from "../models/UserModel";
import Plan from "../models/PlanModel";
import GoogleTokenModel from "../models/GoogleTokenModel";
import { MAX_VIDEO_PLAN } from "../constanst/plans"; // đường dẫn tùy bạn
import { handleAffiliateCommission } from "../services/utils/affiliate";

/**
 * 🧠 Helper: trích xuất mã giao dịch (FIBPRO + userId + checksum)
 * VD: "FIBPRO6912a748a0952cef1b061de611111023"
 * → planCode = "PRO"
 * → userId = "6912a748a0952cef1b061de6"
 */
async function extractNoteAndPlan(description: string) {
  const domain = process.env.DOMAIN_PREFIX || "FIB";
  const allPlans: any = await Plan.find({}, "code").lean();
  const planCodes = allPlans
    .filter((p: any) => p.code)
    .map((p: any) => p.code.toUpperCase())
    .join("|");

  // Regex nhận dạng: domain + planCode + 24 hex + 6~8 số checksum
  const noteRegex = new RegExp(
    `${domain}(${planCodes})([a-f0-9]{24})(\\d{5,})`,
    "i"
  );

  const match = description.match(noteRegex);
  if (!match) return null;

  const planCode = match[1].toUpperCase();
  const userId = match[2];
  const noteCode = match[0].toUpperCase();

  return { noteCode, planCode, userId };
}

/**
 * 🚀 Quét BankTransaction chưa gán userId
 */
export async function scanUnlinkedBankTransactions() {
  // console.log("🕵️‍♂️ Bắt đầu quét BankTransaction chưa gán userId...");

  const transactions = await BankTransaction.find({
    $or: [{ userId: { $exists: false } }, { userId: null }],
    description: { $exists: true, $ne: "" },
  })
    .sort({ date: -1 })
    .limit(300)
    .lean();

  if (!transactions.length) {
    //   console.log("⏸ Không có giao dịch chưa gán user.");
    return;
  }

  for (const tx of transactions) {
    try {
      const { transactionId, description, amount }: any = tx;

      const parsedAmount = parseFloat(amount || "0");
      const result = await extractNoteAndPlan(description);
      if (!result) continue;

      const { noteCode, planCode, userId } = result;
      const user: any = await User.findById(userId);
      if (!user) {
        continue;
      }

      // 🔍 Tìm hoặc tạo Transaction
      let matchedTx: any = await Transaction.findOne({ note: noteCode });

      if (!matchedTx) {
        matchedTx = await Transaction.create({
          note: noteCode,
          status: "pending",
          type: "bank_auto",
          bankTransactionId: transactionId,
          amount: parsedAmount,
          userId,
          createdFrom: "auto_userId",
          planCode,
        });
        console.log(`🆕 Tạo Transaction ${matchedTx._id} cho ${user.email}`);
      }

      // 🔍 Tìm plan
      const plan = await Plan.findOne({
        code: new RegExp(`^${planCode}$`, "i"),
      });
      if (!plan) {
        console.warn(`⚠️ Không tìm thấy plan code = ${planCode}`);
        continue;
      }

      // 💰 So khớp số tiền
      const planPrice =
        parseInt(plan.discountPrice?.replace(/\D/g, "")) ||
        parseInt(plan.price?.replace(/\D/g, "")) ||
        0;
      const transferred = Math.round(parsedAmount);
      const expected = Math.round(planPrice);

      if (transferred !== expected) {
        matchedTx.status = "failed";
        matchedTx.errorMessage = `Sai số tiền ${transferred} ≠ ${expected}`;
        await matchedTx.save();
        console.warn(`❌ Sai số tiền cho ${noteCode}`);
        continue;
      }

      // ✅ Cập nhật Transaction & User
      matchedTx.status = "success";
      matchedTx.verifiedAt = new Date();
      matchedTx.bankTransactionId = transactionId;
      await matchedTx.save();

      const expiresAt = new Date(
        Date.now() + plan.expire * 24 * 60 * 60 * 1000
      );

      user.plan = plan.key;
      user.planExpiresAt = expiresAt;
      user.videoUsed = 0;

      const planLimit = MAX_VIDEO_PLAN[plan.key];
      if (planLimit) {
        user.maxVideo = planLimit.maxVideo;
      }

      await user.save();

      // ✅ Tự động gán GoogleToken VIP
      if (plan.key !== "free") {
        const token = await GoogleTokenModel.findOneAndUpdate(
          {
            type: "vip",
            isActive: true,
            $expr: { $lt: ["$assigned", "$slot"] },
          },
          {
            $inc: { assigned: 1 },
            $push: { userIds: user._id },
            $set: { lastUsedAt: new Date() },
          },
          { sort: { assigned: 1, lastUsedAt: 1 }, new: true }
        );

        if (token) {
          user.googleId = token._id;
          await user.save();
          console.log(`🔗 Gán token ${token.email} cho ${user.email}`);
        } else {
          console.warn("⚠️ Hết GoogleToken VIP trống.");
        }

        // Gắn lại userId vào BankTransaction
        await BankTransaction.updateOne(
          { _id: tx._id },
          { $set: { userId: user._id } }
        );
        console.log(
          `🧾 Liên kết BankTransaction ${transactionId} → ${user.email}`
        );

        // ⭐ Gọi Affiliate Commission (nếu có người giới thiệu)
        try {
          const commission = await handleAffiliateCommission(
            user._id.toString(),
            plan.key,
            expected // số tiền đúng theo plan
          );

          if (commission) {
            console.log(
              `💸 Đã ghi nhận hoa hồng ${commission}đ cho người giới thiệu của ${user.email}`
            );
          }
        } catch (err) {
          console.error("❌ Lỗi xử lý affiliate:", err);
        }
      }
    } catch (err: any) {
      console.error("❌ Lỗi khi xử lý BankTransaction:", err.message);
    }
  }

  console.log("✅ Quét BankTransaction hoàn tất.");
}

// 🕒 Tự chạy định kỳ mỗi 1 phút
setInterval(async () => {
  try {
    await scanUnlinkedBankTransactions();
  } catch (err) {
    console.error("⚠️ scan job error:", err);
  }
}, 60_000);
