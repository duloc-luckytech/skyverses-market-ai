import GoogleToken from "../models/GoogleTokenModel";
import User from "../models/UserModel";
import mongoose from "mongoose";
import cron from "node-cron";

/* ============================================================
   ⭐ DEACTIVATE TOKENS WITH LOW CREDITS
=============================================================== */
async function deactivateLowCreditTokens(threshold = 110) {
  const lowCreditTokens = await GoogleToken.find({
    isActive: true,
    credits: { $lte: threshold },
  });

  if (!lowCreditTokens.length) return 0;

  console.log(
    `⚠️ ${lowCreditTokens.length} tokens hết credit (<= ${threshold}) → deactivate`
  );

  for (const tk of lowCreditTokens) {
    const affectedUsers = tk.userIds || [];

    // 1. deactivate token
    tk.isActive = false;
    tk.userIds = [];
    tk.assigned = 0;
    await tk.save();

    // 2. remove googleId from users
    if (affectedUsers.length > 0) {
      await User.updateMany(
        { _id: { $in: affectedUsers } },
        { $unset: { googleId: "" } }
      );
    }
  }

  return lowCreditTokens.length;
}
/* ============================================================
   ⭐ CRON — every 3 minutes
=============================================================== */
cron.schedule("*/10 * * * *", async () => {
  console.log("⏳ [CRON] deactivateLowCreditTokens...");
  try {
    await deactivateLowCreditTokens();
  } catch (e) {
    console.error("❌ Job error:", e);
  }
});
