import mongoose from "mongoose";
import AIModel from "../models/AIModel.model";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);

  await AIModel.deleteMany();

  await AIModel.insertMany([
    {
      key: "claude-3-5-sonnet",
      name: "Claude 3.5 Sonnet",
      logoUrl: "/logos/claude.svg",
      route: "/models/claude-3-5-sonnet",
      provider: "Anthropic",
      category: "text",
      order: 1,
    },
    {
      key: "midjourney-v6",
      name: "Midjourney v6.1",
      logoUrl: "/logos/midjourney.svg",
      route: "/models/midjourney-v6",
      provider: "Midjourney",
      category: "image",
      order: 2,
    },
    {
      key: "runway-gen-3",
      name: "Runway Gen-3",
      logoUrl: "/logos/runway.svg",
      route: "/models/runway-gen-3",
      provider: "Runway",
      category: "video",
      order: 6,
    },
  ]);

  console.log("✅ AI Models seeded");
  process.exit();
}

seed();