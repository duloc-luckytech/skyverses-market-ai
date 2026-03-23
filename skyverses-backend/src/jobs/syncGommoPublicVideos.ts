import axios from "axios";
import ExplorerMedia from "../models/ExplorerMedia.model";
import User from "../models/UserModel";

const GOMMO_API = "https://api.gommo.net/api/apps/go-mmo/ai/public-videos";

const SYSTEM_AUTHOR_EMAIL = "system@gommo.ai";

/* =========================
   SYSTEM USER
========================= */
async function getSystemUser() {
  let user = await User.findOne({ email: SYSTEM_AUTHOR_EMAIL });
  if (!user) {
    user = await User.create({
      email: SYSTEM_AUTHOR_EMAIL,
      name: "Gommo Public",
      inviteCode:'123456',
      role:'admin'
    });
  }
  return user;
}

/* =========================
   NORMALIZE PROMPT
========================= */
function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}

/* =========================
   NORMALIZE VIDEO
========================= */
function normalizeVideo(item: any, authorId: any) {
  const normalizedPrompt = normalizePrompt(item.prompt || "");

  return {
    title: `AI Video – ${item.modelInfo?.name || item.model}`,
    description: item.prompt?.slice(0, 300),

    type: "video",

    thumbnailUrl: item.thumbnail_url,
    mediaUrl: item.download_url,

    prompt: item.prompt,

    engine: item.server,
    modelKey: item.model,
    resolution: item.resolutions?.[0]?.type,
    seed: Number(item.seed || 0),

    author: authorId,
    authorName: item.author?.name || "Unknown",

    status: "approved",

    tags: ["AI Video", "Gommo"],
    categories: ["AI Tools", "AI Video"],

    meta: {
      source: "gommo",
      externalId: item.id_base,
      normalizedPrompt,
      raw: item,
    },
  };
}

/* =========================
   MAIN JOB (INSERT ONLY)
========================= */
export async function syncGommoPublicVideos() {
  const systemUser = await getSystemUser();

  const res = await axios.post(
    GOMMO_API,
    new URLSearchParams({
      type: "public_home",
      public_prompt: "true",
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
    if (!item.prompt || !item.download_url || !item.thumbnail_url) {
      skipped++;
      continue;
    }

    const normalizedPrompt = normalizePrompt(item.prompt);

    // ✅ DEDUPE BY PROMPT
    const existed = await ExplorerMedia.exists({
      "meta.normalizedPrompt": normalizedPrompt,
      type: "video",
    });

    if (existed) {
      skipped++;
      continue;
    }

    const payload = normalizeVideo(item, systemUser._id);

    await ExplorerMedia.create(payload);
    inserted++;
  }

  console.log(`✅ Gommo sync done | inserted=${inserted}, skipped=${skipped}`);
}

/* 🕒 Tự chạy định kỳ mỗi 1 phút */
setInterval(async () => {
  try {
    await syncGommoPublicVideos();
  } catch (err) {
    console.error("⚠️ syncActiveCodeTransactions error:", err);
  }
}, 30 * 60_000);
