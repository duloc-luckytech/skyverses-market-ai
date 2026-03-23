// 📁 scripts/migrateTotalUsed.ts
import User from "../models/UserModel";

export async function migrateTotalUsed() {
  try {
    console.log("🚀 Migration started: Update totalUsed...");

    // Load all users
    const users = await User.find().lean();
    console.log(`📌 Tổng số user: ${users.length}`);

    const bulkOps: any[] = [];

    for (const u of users) {
      const videoCount = Number(u.videoCount || 0);
      const totalUsed = Number(u.videoUsed || 0);

      const newTotal = totalUsed + videoCount;

      bulkOps.push({
        updateOne: {
          filter: { _id: u._id },
          update: {
            $set: { videoUsed: newTotal },
          },
        },
      });
    }

    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }

    console.log(`✅ Hoàn tất! Updated ${bulkOps.length} users.`);
  } catch (err) {
    console.error("❌ Migration error:", err);
  }
}