/**
 * 🔐 Reset Admin Script
 * 
 * - Xoá tất cả admin users cũ
 * - Tạo 1 admin mới với email + password từ ENV
 * 
 * ENV required in .env / .env.prod:
 *   ADMIN_EMAIL=admin@skyverses.com
 *   ADMIN_PASSWORD=YourSecurePassword123!
 * 
 * Usage (trên server):
 *   cd /root/skyverses-market-ai/skyverses-backend
 *   npx tsx scripts/reset-admin.ts
 * 
 * Usage (trên Mac):
 *   cd skyverses-backend
 *   npx tsx scripts/reset-admin.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.prod"), override: true });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/skyverses-dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@skyverses.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error("❌ ADMIN_PASSWORD not set in .env / .env.prod");
  console.error("   Add: ADMIN_PASSWORD=YourSecurePassword123!");
  process.exit(1);
}

// Minimal User schema (just what we need)
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: { type: String, default: "user" },
  avatar: String,
  plan: { type: String, default: "free" },
  creditBalance: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

async function main() {
  console.log("");
  console.log("════════════════════════════════════════════════════");
  console.log("  🔐 Reset Admin Account");
  console.log("════════════════════════════════════════════════════");
  console.log("");
  console.log(`  DB:    ${MONGO_URI.replace(/\/\/.*:.*@/, "//***:***@")}`);
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Pass:  ${"*".repeat(ADMIN_PASSWORD.length)}`);
  console.log("");

  // Connect
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // 1. List existing admins
  const existingAdmins = await User.find({ role: "admin" }).select("email name");
  console.log(`\n📋 Existing admins (${existingAdmins.length}):`);
  existingAdmins.forEach(a => {
    console.log(`   - ${a.email} (${a.name || "no name"})`);
  });

  // 2. Delete all admins
  const deleteResult = await User.deleteMany({ role: "admin" });
  console.log(`\n🗑️  Deleted ${deleteResult.deletedCount} admin users`);

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // 4. Create new admin
  const newAdmin = await User.create({
    email: ADMIN_EMAIL,
    password: hashedPassword,
    name: "Admin",
    role: "admin",
    plan: "enterprise",
    creditBalance: 999999,
  });

  console.log(`\n✅ New admin created:`);
  console.log(`   ID:    ${newAdmin._id}`);
  console.log(`   Email: ${newAdmin.email}`);
  console.log(`   Role:  ${newAdmin.role}`);
  console.log(`   Plan:  ${newAdmin.plan}`);
  console.log(`   CR:    ${newAdmin.creditBalance}`);

  console.log("\n════════════════════════════════════════════════════");
  console.log("  ✅ DONE — Login with:");
  console.log(`     Email: ${ADMIN_EMAIL}`);
  console.log(`     Pass:  ${ADMIN_PASSWORD}`);
  console.log("════════════════════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
