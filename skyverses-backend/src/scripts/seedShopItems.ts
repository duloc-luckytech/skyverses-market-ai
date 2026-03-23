import mongoose from "mongoose";
import ShopItem from "../models/ShopItem.model";

async function seedShopItems() {
  const items = [
    /* =========================
       1. STARTER CREATOR PACK
    ========================= */
    {
      code: "starter-tools",
      name: "Starter Creator Pack",

      priceVND: 199_000,
      billing: "lifetime",

      shortDesc: "Bộ công cụ cơ bản cho người mới bắt đầu.",
      fullDesc:
        "Starter Creator Pack giúp bạn làm quen nhanh với hệ sinh thái tạo hình ảnh & video AI. Phù hợp cho người mới, freelancer hoặc test ý tưởng trước khi nâng cấp lên workflow nâng cao.",

      target: "Người mới / Freelancer",
      level: "Beginner",

      highlightPoints: [
        "Tạo hình ảnh AI trong vài phút",
        "Prompt Builder cơ bản",
        "Image Library cloud",
      ],

      features: [
        "Text → Image AI",
        "Image Library",
        "Prompt Builder (Basic)",
        "Batch upload ảnh",
      ],

      steps: [
        "Nhập prompt mô tả hình ảnh",
        "Generate ảnh bằng AI",
        "Lưu vào Image Library",
        "Tái sử dụng cho workflow khác",
      ],

      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",

      badge: "START HERE",
      highlight: true,
      active: true,
    },

    /* =========================
       2. PRO WORKFLOW PACK
    ========================= */
    {
      code: "pro-workflow",
      name: "Pro Workflow Pack",

      priceVND: 499_000,
      billing: "lifetime",

      shortDesc: "Workflow AI nâng cao cho creator chuyên nghiệp.",
      fullDesc:
        "Pro Workflow Pack mở khóa các pipeline nâng cao: batch prompt, image → video, scene chaining và quản lý asset chuyên sâu.",

      target: "Content Creator / Marketer",
      level: "Pro",

      highlightPoints: [
        "Batch prompt & batch render",
        "Image → Video pipeline",
        "Quản lý scene & asset",
      ],

      features: [
        "Advanced Prompt Builder",
        "Batch Image Generator",
        "Image → Video Scene",
        "Workflow Pipeline",
      ],

      steps: [
        "Chuẩn bị prompt hàng loạt",
        "Generate ảnh batch",
        "Chuyển ảnh → video scene",
        "Quản lý output theo project",
      ],

      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",

      badge: "MOST POPULAR",
      highlight: false,
      active: true,
    },

    /* =========================
       3. STUDIO SUITE
    ========================= */
    {
      code: "studio-suite",
      name: "Studio AI Suite",

      priceVND: 999_000,
      billing: "lifetime",

      shortDesc: "Bộ công cụ AI full-stack cho studio & team.",
      fullDesc:
        "Studio AI Suite dành cho team, studio hoặc agency. Bao gồm full workflow: image, video, automation, quản lý project & export chuyên nghiệp.",

      target: "Studio / Agency / Team",
      level: "Studio",

      highlightPoints: [
        "Full AI pipeline",
        "Multi-project management",
        "Xuất file & license",
      ],

      features: [
        "Full Prompt Builder Pro",
        "Image → Video → Voice",
        "Project Manager",
        "Export & License system",
      ],

      steps: [
        "Tạo project studio",
        "Xây dựng pipeline AI",
        "Render & kiểm duyệt",
        "Xuất file + bàn giao",
      ],

      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",

      badge: "ALL-IN-ONE",
      highlight: false,
      active: true,
    },
  ];

  for (const item of items) {
    await ShopItem.updateOne(
      { code: item.code },
      { $set: item },
      { upsert: true }
    );
    console.log(`✔ Seeded: ${item.code}`);
  }

  console.log("🎉 Seed shop items DONE");
  process.exit(0);
}

seedShopItems();
