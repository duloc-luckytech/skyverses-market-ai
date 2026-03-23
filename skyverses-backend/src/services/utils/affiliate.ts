// utils/affiliate.ts
import User from "../../models/UserModel";
import PlanPurchase from "../../models/PlanPurchase";
import AffiliateTransaction from "../../models/AffiliateTransaction";

export async function handleAffiliateCommission(
  userId: string,
  plan: string,
  amount: number
) {
  const user = await User.findById(userId);
  if (!user || !user.inviteFrom) return null;

  const parent = await User.findById(user.inviteFrom);
  if (!parent) return null;

  if (parent.role === "master") return null;

  // Lịch sử mua
  const history = await PlanPurchase.find({ userId });

  const isFirstMonth = history.length === 0;
  const monthIndex = history.length + 1;

  const rate = isFirstMonth ? 0.2 : 0.1;
  const commission = Math.round(amount * rate);

  // Lưu purchase
  await PlanPurchase.create({
    userId,
    plan,
    amount,
    isFirstMonth,
    monthIndex,
    affiliateRate: rate,
    affiliateAmount: commission,
    paidTo: parent._id,
  });

  // Lưu transaction
  await AffiliateTransaction.create({
    affiliateId: parent._id,
    fromUserId: user._id,
    amount: commission,
    rate,
    type: isFirstMonth ? "first_month" : "renew",
    plan,
  });

  // Cập nhật tổng
  parent.affiliateTotal += commission;
  parent.affiliatePending += commission;
  await parent.save();

  return commission;
}