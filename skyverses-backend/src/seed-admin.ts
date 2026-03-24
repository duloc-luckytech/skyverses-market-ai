/**
 * 🔐 Seed Admin — Clear all users & create fresh admin
 * 
 * Run on server:
 *   cd /root/skyverses-market-ai/skyverses-backend
 *   npx tsx src/seed-admin.ts
 * 
 * Run on Mac:
 *   cd skyverses-backend
 *   npx tsx src/seed-admin.ts
 */
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/skyverses-dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@skyverses.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin2026";

async function seedAdmin() {
  console.log("");
  console.log("════════════════════════════════════════════════════");
  console.log("  🔐 Seed Admin — Clear & Create");
  console.log("════════════════════════════════════════════════════");
  console.log(`  DB:    ${MONGO_URI.replace(/\/\/.*:.*@/, "//***:***@")}`);
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Pass:  ${ADMIN_PASSWORD}`);
  console.log("");

  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected!");

  const UserModel = (await import("./models/UserModel")).default;

  // 1. Count existing users
  const totalUsers = await UserModel.countDocuments();
  console.log(`\n📋 Current users: ${totalUsers}`);

  // 2. Clear ALL users
  const deleteResult = await UserModel.deleteMany({});
  console.log(`🗑️  Deleted ${deleteResult.deletedCount} users`);

  // 3. Hash password with crypto.scrypt (no bcryptjs needed)
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(ADMIN_PASSWORD, salt, 64).toString("hex");
  const hashedPassword = `scrypt:${salt}:${hash}`;

  // 4. Create admin
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let inviteCode = "";
  for (let i = 0; i < 8; i++) {
    inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const admin = await UserModel.create({
    email: ADMIN_EMAIL,
    password: hashedPassword,
    name: "Admin",
    role: "admin",
    inviteCode,
    plan: "enterprise",
    credit: 999999,
    creditBalance: 999999,
    claimWelcomeCredit: true,
  });

  // 5. Verify password works
  const [, testSalt, testHash] = hashedPassword.split(":");
  const verify = crypto.scryptSync(ADMIN_PASSWORD, testSalt, 64).toString("hex");
  const passOk = verify === testHash;

  console.log(`\n✅ Admin created:`);
  console.log(`   ID:       ${admin._id}`);
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Role:     ${(admin as any).role}`);
  console.log(`   Plan:     ${(admin as any).plan}`);
  console.log(`   Credits:  ${(admin as any).creditBalance}`);
  console.log(`   Pass OK:  ${passOk}`);

  console.log("\n════════════════════════════════════════════════════");
  console.log("  ✅ DONE — CMS Login:");
  console.log(`     Email:    ${ADMIN_EMAIL}`);
  console.log(`     Password: ${ADMIN_PASSWORD}`);
  console.log("════════════════════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
