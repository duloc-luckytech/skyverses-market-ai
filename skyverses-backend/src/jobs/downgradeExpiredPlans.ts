// cron/downgradeExpiredPlans.ts
import User from "../models/UserModel";
import { nowVN } from "../utils/time";
import cron from "node-cron";

export async function downgradeExpiredPlans() {
  const now = nowVN();

  const users = await User.find({
    plan: { $ne: null },
    $or: [
      { planExpiresAt: { $lte: now } },
      {
        $expr: {
          $and: [
            { $gt: ["$maxVideo", 0] }, // ⭐ QUAN TRỌNG
            { $gte: ["$videoUsed", "$maxVideo"] },
          ],
        },
      },
    ],
  }).select("_id");

  if (!users.length) return;

  const ids = users.map((u) => u._id);

  console.log(`⚠️ Downgrade ${ids.length} users`);

  await User.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        plan: null,
        planExpiresAt: null,
      },
    }
  );
}

// chạy mỗi 30 phút (KHÔNG gấp)
cron.schedule("*/30 * * * *", downgradeExpiredPlans);