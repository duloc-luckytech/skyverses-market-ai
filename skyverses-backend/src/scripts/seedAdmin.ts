/**
 * seedAdmin.ts
 * Xoá toàn bộ admin cũ → tạo admin mới với password scrypt
 * Import vào index.ts sau khi connect MongoDB:
 *
 *   import { seedAdmin } from './scripts/seedAdmin';
 *   await seedAdmin();
 */

import crypto from "crypto";
import UserModel from "../models/UserModel";

// ─── CẤU HÌNH ──────────────────────────────────
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin@2025";   // ← đổi password ở đây
const ADMIN_EMAIL    = `${ADMIN_USERNAME}@skyverses.com`;
// ───────────────────────────────────────────────

function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plain, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function genInviteCode(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function seedAdmin(): Promise<void> {
  // 1. Xoá admin cũ
  const { deletedCount } = await UserModel.deleteMany({ role: "admin" });
  console.log(
    deletedCount > 0
      ? `🗑️  Đã xoá ${deletedCount} admin cũ`
      : "ℹ️  Không có admin cũ để xoá"
  );

  // 2. Gen invite code duy nhất
  let inviteCode = genInviteCode();
  while (await UserModel.findOne({ inviteCode })) {
    inviteCode = genInviteCode();
  }

  // 3. Tạo admin mới
  const admin = await UserModel.create({
    email:         ADMIN_EMAIL,
    password:      hashPassword(ADMIN_PASSWORD),
    name:          "Admin",
    role:          "admin",
    inviteCode,
    creditBalance: 999999,
    plan:          null,
  });

  console.log("✅ Admin mới đã tạo thành công:");
  console.log(`   📧 Email    : ${admin.email}`);
  console.log(`   👤 Username : ${ADMIN_USERNAME}`);
  console.log(`   🔑 Password : ${ADMIN_PASSWORD}`);
}
