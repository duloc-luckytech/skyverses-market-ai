/**
 * 🔄 Clear & Reseed ALL Pricing
 * 
 * 1. Xóa toàn bộ ModelPricingMatrix
 * 2. Fetch models mới từ Gommo API (image + video)
 * 3. Tính basePricing (giá gốc) → pricing = basePricing × MULTIPLIER (giá bán)
 * 4. Hiển thị bảng kết quả
 * 
 * Usage: npx ts-node src/scripts/clearAndReseedPricing.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

import ModelPricingMatrix from "../models/ModelPricingMatrix.model";

const MULTIPLIER = 5;

/* =====================================================
   HELPERS
===================================================== */
function buildPricing(prices: any[]): Record<string, Record<string, number>> {
  const pricing: Record<string, Record<string, number>> = {};
  if (!Array.isArray(prices) || prices.length === 0) {
    return { default: { default: 0 } };
  }
  for (const p of prices) {
    const resolution = p.resolution || "default";
    const key = p.duration || p.mode || "default";
    const price = p.price || 0;
    if (!pricing[resolution]) pricing[resolution] = {};
    pricing[resolution][key] = price;
  }
  return pricing;
}

function multiplyPricing(
  pricing: Record<string, Record<string, number>>,
  multiplier: number
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  for (const [resolution, durations] of Object.entries(pricing)) {
    result[resolution] = {};
    for (const [key, credits] of Object.entries(durations)) {
      result[resolution][key] = Math.ceil(
        (typeof credits === "number" ? credits : 0) * multiplier
      );
    }
  }
  return result;
}

function normalizeRatios(ratios: any[]): string[] {
  if (!Array.isArray(ratios)) return [];
  return ratios.map((r: any) => {
    const type = typeof r === "string" ? r : r?.type || "";
    return type.replace(/_/g, ":");
  });
}

function extractModes(model: any): string[] {
  if (Array.isArray(model.mode) && model.mode.length > 0) {
    return model.mode
      .map((m: any) => (typeof m === "string" ? m : m?.type || ""))
      .filter(Boolean);
  }
  if (Array.isArray(model.modes) && model.modes.length > 0) {
    return model.modes
      .map((m: any) => (typeof m === "string" ? m : m?.type || ""))
      .filter(Boolean);
  }
  if (Array.isArray(model.prices)) {
    const modes = new Set<string>();
    for (const p of model.prices) {
      if (p.mode) modes.add(p.mode);
    }
    if (modes.size > 0) return Array.from(modes);
  }
  return [];
}

function extractVersion(modelKey: string): string {
  const match = modelKey.match(/(\d+)_(\d+)$/);
  if (match) return `${match[1]}.${match[2]}`;
  const match2 = modelKey.match(/(\d+)$/);
  if (match2) return match2[1];
  return "1.0";
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/* =====================================================
   FETCH GOMMO MODELS
===================================================== */
async function fetchGommoModels(type: "image" | "video") {
  const accessToken = process.env.GOMMO_API_KEY;
  if (!accessToken) {
    console.error("❌ GOMMO_API_KEY not found in .env");
    return [];
  }

  const body = new URLSearchParams({
    access_token: accessToken,
    domain: "aivideoauto.com",
    type,
  });

  const res = await axios.post(
    "https://api.gommo.net/ai/models",
    body.toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30_000,
    }
  );

  return res.data?.data || [];
}

/* =====================================================
   MAIN
===================================================== */
async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ MONGO_URI not set");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✅ Connected!\n");

  // ── Step 1: Clear ALL existing pricing ──
  const deleted = await ModelPricingMatrix.deleteMany({});
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing pricing records.\n`);

  // ── Step 2: Fetch models from Gommo ──
  let totalCreated = 0;
  const summary: any[] = [];

  for (const type of ["video", "image"] as const) {
    console.log(`📡 Fetching ${type} models from Gommo API...`);

    const models = await fetchGommoModels(type);
    if (!models.length) {
      console.log(`   ⚠️ No ${type} models found\n`);
      continue;
    }

    console.log(`   Found ${models.length} ${type} models\n`);

    for (const m of models) {
      if (!m.model) continue;

      const modelKey = m.model;
      const basePricing = buildPricing(m.prices);
      const pricing = multiplyPricing(basePricing, MULTIPLIER);
      const aspectRatios = normalizeRatios(m.ratios);
      const modes = extractModes(m);
      const version = extractVersion(modelKey);

      await ModelPricingMatrix.create({
        tool: type,
        name: m.name || modelKey,
        engine: "gommo",
        modelKey,
        version,
        description: m.description || "",
        mode: modes[0] || "default",
        modes,
        status: "active",
        basePricing,
        priceMultiplier: MULTIPLIER,
        pricing,
        aspectRatios,
      });

      // Sample pricing for display
      const firstRes = Object.keys(basePricing)[0] || "?";
      const firstKey = firstRes !== "?" ? Object.keys(basePricing[firstRes])[0] : "?";
      const sampleBase =
        firstRes !== "?" && firstKey ? basePricing[firstRes][firstKey] : 0;
      const sampleSell =
        firstRes !== "?" && firstKey ? pricing[firstRes][firstKey] : 0;

      summary.push({
        type,
        engine: "gommo",
        model: modelKey,
        name: (m.name || modelKey).substring(0, 25),
        modes: modes.join(",") || "-",
        "base→sell": `${fmt(sampleBase)} → ${fmt(sampleSell)}`,
        "×": MULTIPLIER,
      });

      totalCreated++;
    }
  }

  // ── Step 3: Display results ──
  console.log("\n" + "═".repeat(70));
  console.log(
    `✅ RESEED COMPLETE — ${totalCreated} models created (×${MULTIPLIER} multiplier)`
  );
  console.log("═".repeat(70) + "\n");

  console.table(summary);

  // Verify
  const [videoCount, imageCount] = await Promise.all([
    ModelPricingMatrix.countDocuments({ tool: "video" }),
    ModelPricingMatrix.countDocuments({ tool: "image" }),
  ]);

  console.log(`\n📦 In DB: ${videoCount} video models + ${imageCount} image models`);
  console.log(`   Total: ${videoCount + imageCount} pricing records\n`);

  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
