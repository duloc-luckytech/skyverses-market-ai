import axios from "axios";
import mongoose from "mongoose";
import ExplorerMedia from "../models/ExplorerMedia.model";
import User from "../models/UserModel";

const GOMMO_IMAGE_API = "https://api.gommo.net/api/apps/go-mmo/ai/images";

const SYSTEM_AUTHOR_EMAIL = "system@gommo.ai";

/* =========================
   CONNECT DB
========================= */
async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI!);
}

/* =========================
   SYSTEM USER
========================= */
async function getSystemUser() {
  let user = await User.findOne({ email: SYSTEM_AUTHOR_EMAIL });
  if (!user) {
    user = await User.create({
      email: SYSTEM_AUTHOR_EMAIL,
      name: "Gommo Public",
      role: "system",
    });
  }
  return user;
}

/* =========================
   NORMALIZE PROMPT (DEDUPE)
========================= */
function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}

/* =========================
   NORMALIZE IMAGE ITEM
========================= */
function normalizeImage(item: any, authorId: any) {
  const normalizedPrompt = normalizePrompt(item.prompt || "");

  return {
    title: item.prompt ? `AI Image – ${item.prompt.slice(0, 60)}` : "AI Image",

    description: item.prompt,

    type: "image",

    thumbnailUrl: item.url_preview || item.url,
    mediaUrl: item.url,

    prompt: item.prompt,

    engine: item.server_ai || "gommo",
    modelKey: item.server_ai || "google_veo",

    author: authorId,
    authorName: item.author?.name || "Unknown",

    status: "approved",

    tags: ["AI Image", "Gommo"],
    categories: ["AI Tools", "AI Image"],

    meta: {
      source: "gommo",
      externalId: item.id_base,
      normalizedPrompt,
      privacy: item.privacy,
      createdAt: item.created_at,
      raw: item,
    },
  };
}

/* =========================
   MAIN JOB (INSERT ONLY)
========================= */
export async function syncGommoPublicImages() {
  await connectDB();
  const systemUser = await getSystemUser();

  const res = await axios.post(
    GOMMO_IMAGE_API,
    new URLSearchParams({
      search: "",
      category: "",
      after_id: "",
      feed_type: "suggested",
      domain: "aivideoauto.com",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://aivideoauto.com",
        Referer: "https://aivideoauto.com/",
      },
      timeout: 15000,
    }
  );

  const items = res.data?.data || [];
  let inserted = 0;
  let skipped = 0;

  for (const item of items) {
    if (!item.prompt || !item.url) {
      skipped++;
      continue;
    }

    const normalized = normalizePrompt(item.prompt);

    // 🚫 DEDUPE BY PROMPT
    const existed = await ExplorerMedia.exists({
      type: "image",
      "meta.normalizedPrompt": normalized,
    });

    if (existed) {
      skipped++;
      continue;
    }

    const payload = normalizeImage(item, systemUser._id);
    await ExplorerMedia.create(payload);
    inserted++;
  }

  console.log(`🖼 Gommo IMAGE sync | inserted=${inserted}, skipped=${skipped}`);
}

/* 🕒 Tự chạy định kỳ mỗi 1 phút */
setInterval(async () => {
  try {
    await syncGommoPublicImages();
  } catch (err) {
    console.error("⚠️ syncActiveCodeTransactions error:", err);
  }
}, 30 * 60_000);
