import User from "../models/UserModel";
import { MAX_VIDEO_PLAN } from "../constanst/plans";

export async function migrate() {
  try {
    console.log("🚀 Migration started...");

    // Lấy toàn bộ user
    const users = await User.find().lean();
    console.log(`📌 Tổng số user: ${users.length}`);

    const bulkOps = [];

    for (const u of users) {
      const planCfg = MAX_VIDEO_PLAN[u.plan] || null;

      const maxVideo = planCfg?.maxVideo ?? 0;
      const videoUsed = 0;

      bulkOps.push({
        updateOne: {
          filter: { _id: u._id },
          update: {
            $set: { maxVideo, videoUsed },
          },
        },
      });
    }

    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }

    console.log(`✅ Hoàn tất! Updated ${bulkOps.length} users (bulkWrite).`);
  } catch (err) {
    console.error("❌ Migration error:", err);
  }
}
