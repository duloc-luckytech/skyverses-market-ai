import mongoose from "mongoose";
import Category from "../models/Category.model";

/* =========================
   MONGO CONNECT
========================= */

async function seedCategories() {
  console.log("✅ MongoDB connected");

  /* =========================
     CLEAR OLD DATA
  ========================= */
  await Category.deleteMany({});
  console.log("🧹 Old categories cleared");

  /* =========================
     INSERT DATA
  ========================= */
  await Category.insertMany([
    {
      code: "ALL",
      name: "All Categories",
      order: 0,
      status: "active",
      subCategories: [
        {
          code: "ALL_SERVICES",
          name: "All",
          services: [
            "Game Development",
            "Art Production",
            "UI / UX Design",
            "AI Video",
            "AI Image",
            "Automation",
            "Case Studies",
          ],
        },
      ],
    },
    {
      code: "GAMES",
      name: "Games",
      order: 1,
      status: "active",
      subCategories: [
        {
          code: "GAME_SERVICES",
          name: "Games",
          services: [
            "Game Prototyping",
            "Full Game Production",
            "Game Art",
            "UI / UX for Games",
            "Live Ops Support",
          ],
        },
      ],
    },
    {
      code: "ART_DESIGN",
      name: "Art & Design",
      order: 2,
      status: "active",
      subCategories: [
        {
          code: "ART_SERVICES",
          name: "Art & Design",
          services: [
            "Concept Art",
            "Illustration",
            "UI / UX Design",
            "Branding & Visual Identity",
            "Cinematic Assets",
          ],
        },
      ],
    },
    {
      code: "AI_TOOLS",
      name: "AI Tools",
      order: 3,
      status: "active",
      subCategories: [
        {
          code: "AI_SERVICES",
          name: "AI Tools",
          services: [
            "AI Video",
            "AI Image",
            "AI Audio",
            "AI Automation",
            "Custom AI Tools",
          ],
        },
      ],
    },
    {
      code: "CASE_STUDIES",
      name: "Case Studies",
      order: 4,
      status: "active",
      subCategories: [
        {
          code: "CASE_SERVICES",
          name: "Case Studies",
          services: [
            "Games",
            "Art & Design",
            "AI Tools",
            "Enterprise Projects",
          ],
        },
      ],
    },
  ]);

  console.log("🚀 Categories seeded successfully");
  process.exit(0);
}

seedCategories().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});