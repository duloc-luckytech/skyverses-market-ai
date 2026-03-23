import mongoose from "mongoose";
import ModelPricingMatrix from "../models/ModelPricingMatrix.model";
import { buildPricingMatrix } from "../utils/buildPricingMatrix";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);

  const { basePricing, pricing } = buildPricingMatrix({
    baseCredits: 20,
    defaultDuration: 5,
    perSecond: 2,
    resolutions: {
      "720p": 1,
      "1080p": 1.5,
    },
    durations: [5, 8, 10],
  });

  await ModelPricingMatrix.create({
    tool: "video",
    name: "VEO 3.1 - HOT",
    engine: "gommo",
    modelKey: "veo_3_1",
    mode: "relaxed",
    version: "3.1",
    status: "active",
    basePricing,
    pricing,
    description: "chậm",
  });

  console.log("✅ Pricing matrix seeded");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
