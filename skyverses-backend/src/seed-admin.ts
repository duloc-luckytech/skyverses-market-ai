/**
 * Seed Admin Account
 * Run: npx ts-node src/seed-admin.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/skyverses-dev";

async function seedAdmin() {
  console.log("🔗 Connecting to MongoDB:", MONGO_URI);
  await mongoose.connect(MONGO_URI);

  const UserModel = (await import("./models/UserModel")).default;

  const adminEmail = "admin@skyverses.com";
  const existing = await UserModel.findOne({ email: adminEmail });

  if (existing) {
    console.log("⚡ Admin account already exists, updating role...");
    existing.role = "admin";
    existing.creditBalance = 999999;
    existing.credit = 999999;
    await existing.save();
    console.log("✅ Admin account updated:");
    console.log(`   Email: ${existing.email}`);
    console.log(`   Role: ${existing.role}`);
    console.log(`   Credits: ${existing.creditBalance}`);
  } else {
    // Generate unique invite code
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let inviteCode = "";
    for (let i = 0; i < 8; i++) {
      inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const admin = await UserModel.create({
      email: adminEmail,
      firstName: "Admin",
      lastName: "Skyverses",
      role: "admin",
      inviteCode,
      credit: 999999,
      creditBalance: 999999,
      claimWelcomeCredit: true,
      onboarding: {
        role: "ai_architect",
        goals: ["full_pipeline"],
        workStyle: "studio",
        experienceLevel: "expert",
        completedAt: new Date(),
      },
    });

    console.log("✅ Admin account created successfully:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Invite Code: ${admin.inviteCode}`);
    console.log(`   Credits: ${admin.creditBalance}`);
  }

  // Also ensure the dev admin account has admin role
  const devAdmin = await UserModel.findOne({ email: "duloc2708@gmail.com" });
  if (devAdmin) {
    devAdmin.role = "admin";
    await devAdmin.save();
    console.log("✅ Dev admin (duloc2708@gmail.com) role set to admin");
  }

  console.log("\n🎉 Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("CMS Login credentials:");
  console.log("  Email:    admin@skyverses.com");
  console.log("  Password: (any - uses email auth)");
  console.log("  Or use: Admin Quick Login button");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
