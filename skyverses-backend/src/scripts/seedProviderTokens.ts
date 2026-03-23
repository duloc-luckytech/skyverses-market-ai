import mongoose from "mongoose";
import ProviderTokenModel from "../models/ProviderToken.model";

async function seed() {
  console.log("✅ Mongo connected");

  const wanToken = await ProviderTokenModel.create({
    provider: "wan",
    isActive: true,

    // wan only
    apiKey: "sk-7009fdab5f804c95a4b6a491618912c4",

    note: "Primary WAN DashScope key",
    plan: "vip",
  });

  console.log("✅ Inserted tokens:");
  console.log("WAN:", wanToken._id.toString());

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
