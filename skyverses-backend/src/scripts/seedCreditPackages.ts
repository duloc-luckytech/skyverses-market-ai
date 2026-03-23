/**
 * Seed 4 Credit Packages: Starter, Creator, Pro, Ultimate
 * 
 * Giá bán đã ×5 so với giá gốc. Tính toán dựa trên data pricing thực tế:
 * 
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  IMAGE SELL PRICES: 500 – 17,500 credits/ảnh                    │
 * │  VIDEO SELL PRICES: 100 – 160,000 credits/video                 │
 * │  Cheap image: ~500-1,000 cr  │  Mid: ~1,500-2,000  │  Hi: 5K+  │
 * │  Cheap video: ~100-500 cr    │  Mid: ~2,000-3,000  │  Hi: 15K+ │
 * └──────────────────────────────────────────────────────────────────┘
 * 
 * Usage: npx ts-node src/scripts/seedCreditPackages.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import CreditPackage from "../models/CreditPackage.model";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/skyverses";

const PACKAGES = [
  /* ═══════════════════════════════════════════
     1. STARTER — $4.99 / 5,000 credits
     Cho người mới, thử nghiệm cơ bản
     → ~5-50 ảnh cheap | ~10-50 video rẻ | 1-2 video premium
  ═══════════════════════════════════════════ */
  {
    code: "starter",
    name: "Starter",
    description: "Khám phá sức mạnh AI. Thử nghiệm tạo ảnh, video với các model cơ bản.",
    credits: 5000,
    bonusPercent: 0,
    bonusCredits: 0,
    price: 4.99,
    originalPrice: 9.99,
    currency: "USD",
    billingCycle: "monthly" as const,
    billedMonths: 1,
    discountPercent: 50,
    popular: false,
    highlight: false,
    badge: "",
    ribbon: {},
    ctaText: "Bắt đầu ngay",
    features: [
      { key: "credits", label: "5,000 credits", enabled: true, highlight: false },
      { key: "tools", label: "Truy cập 30+ AI tools", enabled: true, highlight: false },
      { key: "image", label: "Image AI: ~5-50 ảnh", enabled: true, highlight: false },
      { key: "video", label: "Video AI: ~1-50 video rẻ", enabled: true, highlight: false },
      { key: "support", label: "Community support", enabled: true, highlight: false },
      { key: "priority", label: "Priority rendering", enabled: false, highlight: false },
      { key: "unlimited", label: "Unlimited models", enabled: false, highlight: false },
    ],
    unlimitedModels: [],
    theme: {
      gradientFrom: "#f8fafc",
      gradientTo: "#f1f5f9",
      accentColor: "#64748b",
      buttonStyle: "solid",
    },
    active: true,
    sortOrder: 1,
  },

  /* ═══════════════════════════════════════════
     2. CREATOR — $14.99 / 25,000 credits (+10% bonus = 27,500)
     Cho creator cá nhân, sử dụng thường xuyên
     → ~14-55 ảnh mid | ~9-275 video | ~1-2 video Sora
  ═══════════════════════════════════════════ */
  {
    code: "creator",
    name: "Creator",
    description: "Dành cho người sáng tạo cá nhân, sử dụng hàng ngày.",
    credits: 25000,
    bonusPercent: 10,
    bonusCredits: 0,
    price: 14.99,
    originalPrice: 29.99,
    currency: "USD",
    billingCycle: "monthly" as const,
    billedMonths: 1,
    discountPercent: 50,
    popular: false,
    highlight: false,
    badge: "+10% BONUS",
    ribbon: {},
    ctaText: "Chọn gói Creator",
    features: [
      { key: "credits", label: "27,500 credits (25K + 10% bonus)", enabled: true, highlight: true },
      { key: "tools", label: "Truy cập 30+ AI tools", enabled: true, highlight: false },
      { key: "image", label: "Image AI: ~14-55 ảnh Midjourney/Banana", enabled: true, highlight: false },
      { key: "video", label: "Video AI: ~9-275 video", enabled: true, highlight: false },
      { key: "support", label: "Email support", enabled: true, highlight: false },
      { key: "priority", label: "Priority rendering (basic)", enabled: true, highlight: false },
      { key: "unlimited", label: "Unlimited models", enabled: false, highlight: false },
    ],
    unlimitedModels: [],
    theme: {
      gradientFrom: "#0c4a6e",
      gradientTo: "#082f49",
      accentColor: "#0ea5e9",
      buttonStyle: "solid",
    },
    active: true,
    sortOrder: 2,
  },

  /* ═══════════════════════════════════════════
     3. PRO — $29.99 / 60,000 credits (+20% bonus = 72,000)
     Pro creator, agency nhỏ
     → ~36-144 ảnh mid | ~24-720 video | ~2-5 video Kling 3.0
  ═══════════════════════════════════════════ */
  {
    code: "pro",
    name: "Pro",
    description: "Cho creator chuyên nghiệp và agency nhỏ, làm việc hàng ngày.",
    credits: 60000,
    bonusPercent: 20,
    bonusCredits: 0,
    price: 29.99,
    originalPrice: 59.99,
    currency: "USD",
    billingCycle: "monthly" as const,
    billedMonths: 1,
    discountPercent: 50,
    popular: true,
    highlight: true,
    badge: "+20% BONUS",
    ribbon: { text: "Phổ biến nhất", color: "#3b82f6", icon: "🔥" },
    ctaText: "Chọn gói Pro",
    features: [
      { key: "credits", label: "72,000 credits (60K + 20% bonus)", enabled: true, highlight: true },
      { key: "tools", label: "Truy cập 30+ AI tools", enabled: true, highlight: false },
      { key: "image", label: "Image AI: ~36-144 ảnh HD", enabled: true, highlight: false },
      { key: "video", label: "Video AI: ~24-720 video", enabled: true, highlight: false },
      { key: "support", label: "Priority support 24/7", enabled: true, highlight: false },
      { key: "priority", label: "Priority rendering (tất cả)", enabled: true, highlight: true },
      { key: "unlimited", label: "1 Unlimited model", enabled: true, highlight: false },
    ],
    unlimitedModels: [
      { modelKey: "wan_2_2", label: "WAN 2.2 (Video)", badge: "UNLIMITED", enabled: true, highlight: true },
      { modelKey: "GEM_PIX_2", label: "GEM PIX 2 (Image)", badge: "UNLIMITED", enabled: false, highlight: false },
    ],
    theme: {
      gradientFrom: "#0f172a",
      gradientTo: "#020617",
      accentColor: "#3b82f6",
      buttonStyle: "solid",
    },
    active: true,
    sortOrder: 3,
  },

  /* ═══════════════════════════════════════════
     4. ULTIMATE — $69.99 / 180,000 credits (+30% + 10K bonus = 244,000)
     Studio, agency, doanh nghiệp
     → ~120-488 ảnh | ~81-2,440 video | ~8-18 video Kling 3.0 | ~1+ Sora
  ═══════════════════════════════════════════ */
  {
    code: "ultimate",
    name: "Ultimate",
    description: "Gói cao cấp nhất cho studio và doanh nghiệp, không giới hạn sáng tạo.",
    credits: 180000,
    bonusPercent: 30,
    bonusCredits: 10000,
    price: 69.99,
    originalPrice: 149.99,
    currency: "USD",
    billingCycle: "monthly" as const,
    billedMonths: 1,
    discountPercent: 53,
    popular: false,
    highlight: true,
    badge: "+30% BONUS",
    ribbon: { text: "Best Value", color: "#8b5cf6", icon: "👑" },
    ctaText: "Nâng cấp Ultimate",
    features: [
      { key: "credits", label: "244,000 credits (180K + 30% + 10K bonus)", enabled: true, highlight: true },
      { key: "tools", label: "Truy cập 30+ AI tools", enabled: true, highlight: false },
      { key: "image", label: "Image AI: ~120-488 ảnh HD", enabled: true, highlight: false },
      { key: "video", label: "Video AI: ~81-2,440 video", enabled: true, highlight: false },
      { key: "support", label: "Dedicated support + NDA", enabled: true, highlight: true },
      { key: "priority", label: "Priority rendering (tất cả)", enabled: true, highlight: true },
      { key: "unlimited", label: "3 Unlimited models", enabled: true, highlight: true },
    ],
    unlimitedModels: [
      { modelKey: "wan_2_2", label: "WAN 2.2 (Video)", badge: "UNLIMITED", enabled: true, highlight: true },
      { modelKey: "GEM_PIX_2", label: "GEM PIX 2 (Image)", badge: "UNLIMITED", enabled: true, highlight: true },
      { modelKey: "veo_3_1", label: "VEO 3.1 (Relaxed)", badge: "UNLIMITED", enabled: true, highlight: true },
    ],
    theme: {
      gradientFrom: "#1e1b4b",
      gradientTo: "#0f0a24",
      accentColor: "#8b5cf6",
      buttonStyle: "solid",
    },
    active: true,
    sortOrder: 4,
  },
];

async function seed() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected!\n");

  // 1. Xoá tất cả packages cũ
  const deleted = await CreditPackage.deleteMany({});
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing packages.\n`);

  // 2. Tạo 4 packages mới
  for (const pkg of PACKAGES) {
    const created = await CreditPackage.create(pkg);
    const total = (created as any).totalCredits;
    console.log(`✅ Created: ${pkg.name} — ${pkg.credits.toLocaleString()} base + bonus = ${total.toLocaleString()} total — $${pkg.price}`);
  }

  console.log("\n🎉 Seed completed! 4 packages created.");
  
  // 3. Verify
  const all = await CreditPackage.find({}).sort({ sortOrder: 1 }).lean();
  console.log("\n📦 Current packages in DB:");
  console.table(all.map((p: any) => ({
    code: p.code,
    name: p.name,
    credits: p.credits.toLocaleString(),
    bonus: `${p.bonusPercent}% + ${p.bonusCredits}`,
    total: (p.credits + Math.floor(p.credits * (p.bonusPercent || 0) / 100) + (p.bonusCredits || 0)).toLocaleString(),
    price: `$${p.price}`,
    popular: p.popular ? '⭐' : '',
  })));

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected.");
}

seed().catch((err) => {
  console.error("❌ Seed Error:", err);
  process.exit(1);
});
