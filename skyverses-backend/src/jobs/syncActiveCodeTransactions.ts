import { BankTransaction, Transaction } from "../models/BankTransactionModel";
import User from "../models/UserModel";
import Plan from "../models/PlanModel";
import { handleAffiliateCommission } from "../services/utils/affiliate";

/**
 * 🔁 Quét các BankTransaction có type = "active_code"
 * và tạo Transaction tương ứng nếu chưa có.
 */
export async function syncActiveCodeTransactions() {
  console.log("🧩 Bắt đầu quét BankTransaction loại active_code...");

  const transactions = await BankTransaction.find({
    type: { $in: ["active_code"] },
    userId: { $exists: true, $ne: null },
  })
    .sort({ date: -1 })
    .limit(500)
    .lean();
  if (!transactions.length) {
    console.log("⏸ Không có BankTransaction phù hợp.");
    return;
  }

  for (const tx of transactions) {
    try {
      const { transactionId, userId, description, raw } = tx;

      // 🔍 Kiểm tra đã tồn tại Transaction cùng note chưa
      const existing = await Transaction.findOne({ note: transactionId });
      if (existing) continue;

      const user: any = await User.findById(userId);
      if (!user) {
        console.warn(`⚠️ Không tìm thấy user ${userId}`);
        continue;
      }

      // 🔍 Xác định plan
      const planCode = raw?.plan?.toLowerCase?.() || "";
      const plan = await Plan.findOne({
        key: new RegExp(`^${planCode}$`, "i"),
      });
      if (!plan) {
        console.warn(`⚠️ Không tìm thấy plan ${planCode}`);
        continue;
      }

      // 💰 Ưu tiên discountPrice, fallback về price
      const amount =
        parseInt(plan.discountPrice?.replace(/\D/g, "")) ||
        parseInt(plan.price?.replace(/\D/g, "")) ||
        0;

      // ✅ Tạo Transaction
      const newTx = await Transaction.create({
        note: transactionId,
        status: "success",
        userId: user._id,
        bankTransactionId: tx._id,
        planCode: plan.code,
        amount,
        description,
        createdFrom: "auto_active_code",
        verifiedAt: new Date(),
      });

      console.log(
        `🎉 Đồng bộ thành công Transaction ${newTx.note} (${amount}₫) → ${user.email}`
      );
    } catch (err: any) {
      console.error("❌ Lỗi khi xử lý active_code:", err.message);
    }
  }

  console.log("✅ Quét active_code hoàn tất.");
}

/* 🕒 Tự chạy định kỳ mỗi 1 phút */
setInterval(async () => {
  try {
    await syncActiveCodeTransactions();
  } catch (err) {
    console.error("⚠️ syncActiveCodeTransactions error:", err);
  }
}, 1 * 60_000);
