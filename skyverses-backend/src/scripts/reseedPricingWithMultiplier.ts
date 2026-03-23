/**
 * 🔄 Reseed Pricing Data
 * 
 * 1. Đọc toàn bộ pricing hiện tại
 * 2. Lưu pricing hiện tại → basePricing (giá gốc)
 * 3. Tính pricing = basePricing × 5 (giá bán cho users)
 * 4. Update tất cả records
 * 
 * Usage: npx ts-node src/scripts/reseedPricingWithMultiplier.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import ModelPricingMatrix from "../models/ModelPricingMatrix.model";

const MULTIPLIER = 5;

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

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ MONGO_URI not set");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  const allPricing = await ModelPricingMatrix.find({});
  console.log(`📦 Found ${allPricing.length} pricing configs`);

  if (allPricing.length === 0) {
    console.log("⚠️ No pricing data found. Nothing to update.");
    process.exit(0);
  }

  let updated = 0;
  let skipped = 0;

  for (const doc of allPricing) {
    const currentPricing = doc.pricing;

    if (!currentPricing || typeof currentPricing !== "object") {
      console.log(`⚠️ Skipping ${doc.modelKey} — no pricing data`);
      skipped++;
      continue;
    }

    // Nếu đã có basePricing, dùng basePricing làm gốc
    const baseSource =
      doc.basePricing && Object.keys(doc.basePricing).length > 0
        ? doc.basePricing
        : currentPricing;

    // Lưu giá gốc
    doc.basePricing = baseSource;
    doc.priceMultiplier = MULTIPLIER;

    // Tính giá bán = gốc × 5
    doc.pricing = multiplyPricing(
      baseSource as Record<string, Record<string, number>>,
      MULTIPLIER
    );

    doc.markModified("basePricing");
    doc.markModified("pricing");
    await doc.save();

    updated++;

    // Log sample
    const firstRes = Object.keys(baseSource as any)[0];
    const firstDur = firstRes
      ? Object.keys((baseSource as any)[firstRes])[0]
      : null;
    const sampleBase = firstRes && firstDur ? (baseSource as any)[firstRes][firstDur] : "?";
    const sampleSell = firstRes && firstDur ? (doc.pricing as any)[firstRes][firstDur] : "?";

    console.log(
      `✅ ${doc.engine}/${doc.modelKey} v${doc.version} — ` +
        `base: ${sampleBase} → sell: ${sampleSell} credits (×${MULTIPLIER})`
    );
  }

  console.log(`\n🎉 Done! Updated: ${updated}, Skipped: ${skipped}`);
  console.log(`   Multiplier: ×${MULTIPLIER} (basePricing → pricing)`);
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
