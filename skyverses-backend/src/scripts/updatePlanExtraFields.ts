import Plan from "../models/PlanModel";

export async function migratePlanExtraFields() {
  try {
    console.log("🚀 Migration start...");

    const plans = (await Plan.find().lean()) as any[];
    if (!plans.length) return console.log("⚠️ No plans found.");

    const bulkOps: any[] = [];

    for (const plan of plans) {
      const update: any = {};

      /* ---------------------------------------------------
       * 🔷 STARTER CONFIG
       * --------------------------------------------------- */
      if (plan.key === "starter" || plan.key === "plan1") {
        update.storageHoursVideo = 3;
        update.storageHoursImage = 3;
        update.maxVideo = 4000;
        update.videoPerMinute = 4;

        update.textToVideo = {
          maxPrompt: 200,
          maxVideosPerRequest: 5,
        };

        update.imageToVideo = {
          maxPrompt: 30,
          maxVideosPerRequest: 2,
        };

        update.startEndFrame = {
          maxPrompt: 10,
          maxVideosPerRequest: 2,
        };

        update.characterSync = {
          maxPrompt: 40,
          maxVideosPerRequest: 3,
        };
      }

      /* ---------------------------------------------------
       * 🔶 PRO CONFIG
       * --------------------------------------------------- */
      if (plan.key === "pro" || plan.key === "plan2") {
        update.storageHoursVideo = 8;
        update.storageHoursImage = 8;
        update.maxVideo = 8500;

        // videoPerMinute: được custom theo thiết lập hiện tại
        update.videoPerMinute = plan.videoPerMinute ?? 9;

        update.textToVideo = {
          maxPrompt: 600,
          maxVideosPerRequest: 9,
        };

        update.imageToVideo = {
          maxPrompt: 60,
          maxVideosPerRequest: 4,
        };

        update.startEndFrame = {
          maxPrompt: 20,
          maxVideosPerRequest: 4,
        };

        update.characterSync = {
          maxPrompt: 80,
          maxVideosPerRequest: 3,
        };
      }

      /* ---------------------------------------------------
       * 🔥 FREE = clone hoàn toàn từ Starter
       * --------------------------------------------------- */
      if (plan.key === "free") {
        update.storageHoursVideo = 3;
        update.storageHoursImage = 3;
        update.maxVideo = 4000;
        update.videoPerMinute = 4;

        update.textToVideo = {
          maxPrompt: 200,
          maxVideosPerRequest: 5,
        };

        update.imageToVideo = {
          maxPrompt: 30,
          maxVideosPerRequest: 2,
        };

        update.startEndFrame = {
          maxPrompt: 10,
          maxVideosPerRequest: 2,
        };

        update.characterSync = {
          maxPrompt: 40,
          maxVideosPerRequest: 3,
        };
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: plan._id },
          update: { $set: update },
        },
      });
    }

    /* ---------------------------------------------------
     * 🚀 APPLY
     * --------------------------------------------------- */
    if (bulkOps.length) {
      await Plan.bulkWrite(bulkOps);
      console.log(`✅ Updated ${bulkOps.length} plans successfully!`);
    }
  } catch (err) {
    console.error("❌ Migration error:", err);
  }
}