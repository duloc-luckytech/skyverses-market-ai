/**
 * 🔄 One-time: Update all pricing = basePricing × 2
 * 
 * Reads basePricing from each ModelPricingMatrix record,
 * recalculates pricing = basePricing × 2, saves back.
 * 
 * import vào index.ts sau connect:
 *   import './scripts/updatePricingX2';
 */

import ModelPricingMatrix from "../models/ModelPricingMatrix.model";

const NEW_MULTIPLIER = 2;

function multiplyPricing(
  base: Record<string, Record<string, number>>,
  multiplier: number
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  for (const [resolution, durations] of Object.entries(base)) {
    result[resolution] = {};
    for (const [key, credits] of Object.entries(durations)) {
      result[resolution][key] = Math.ceil(
        (typeof credits === "number" ? credits : 0) * multiplier
      );
    }
  }
  return result;
}

(async () => {
  try {
    const allPricing = await ModelPricingMatrix.find({});
    console.log(`📦 [PRICING x2] Found ${allPricing.length} pricing records`);

    let updated = 0;

    for (const doc of allPricing) {
      const base = doc.basePricing;
      if (!base || typeof base !== "object" || Object.keys(base).length === 0) {
        continue;
      }

      const newPricing = multiplyPricing(
        base as Record<string, Record<string, number>>,
        NEW_MULTIPLIER
      );

      doc.pricing = newPricing;
      doc.priceMultiplier = NEW_MULTIPLIER;
      doc.markModified("pricing");
      await doc.save();

      updated++;

      // Log sample
      const firstRes = Object.keys(base as any)[0];
      const firstKey = firstRes ? Object.keys((base as any)[firstRes])[0] : null;
      const sampleBase = firstRes && firstKey ? (base as any)[firstRes][firstKey] : "?";
      const sampleSell = firstRes && firstKey ? (newPricing as any)[firstRes][firstKey] : "?";

      console.log(
        `  ✅ ${doc.engine}/${doc.modelKey} — base: ${sampleBase} → sell: ${sampleSell} (×${NEW_MULTIPLIER})`
      );
    }

    console.log(`\n🎉 [PRICING x2] Done! Updated ${updated}/${allPricing.length} records`);
  } catch (err) {
    console.error("❌ [PRICING x2] Error:", err);
  }
})();
