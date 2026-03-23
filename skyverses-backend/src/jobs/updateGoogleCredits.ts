import axios from "axios";
import cron from "node-cron";
import GoogleTokenModel from "../models/GoogleTokenModel";

const API_KEY = "AIzaSyBtrm0o5ab1c-Ec8ZuLcGt3oJAA5VWt3pY";
const CREDITS_URL = `https://aisandbox-pa.googleapis.com/v1/credits?key=${API_KEY}`;

/* ----------------------------------------------------
   Hàm gọi API để lấy credits
----------------------------------------------------- */
async function fetchCredits(accessToken: string) {
  try {
    const res = await axios.get(CREDITS_URL, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${accessToken}`,
        "cache-control": "no-cache",
        origin: "https://labs.google",
        pragma: "no-cache",
        referer: "https://labs.google/",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        "x-browser-channel": "stable",
        "x-browser-copyright":
          "Copyright 2025 Google LLC. All rights reserved.",
        "x-browser-year": "2025",
      },
      timeout: 15000,
    });

    if (res.data?.credits !== undefined) {
      return {
        credits: res.data.credits,
        userPaygateTier: res.data.userPaygateTier || null,
      };
    }

    return null;
  } catch (err: any) {
    if (err?.response?.status === 401) {
    } else {
      console.error("❌ fetchCredits error:", err.message);
    }
    return null;
  }
}

/* ----------------------------------------------------
   Job cập nhật credits
----------------------------------------------------- */
export async function updateGoogleCreditsJob() {
  const tokens = await GoogleTokenModel.find({ isActive: true });

  if (!tokens.length) {
    console.log("⚠️ Không có GoogleToken active để cập nhật.");
    return;
  }

  console.log(`🔄 Đang cập nhật credits cho ${tokens.length} token...`);

  for (const token of tokens) {
    if (!token.accessToken) continue;

    const result = await fetchCredits(token.accessToken);
    if (!result) continue;

    const credits = result.credits ?? 0;
    const isActive = credits >= 110;

    await GoogleTokenModel.updateOne(
      { _id: token._id },
      {
        $set: {
          credits,
          isActive,
          updatedAt: new Date(),
        },
      }
    );
  }

  console.log("🎯 Hoàn tất cập nhật credits.");
}

/* ----------------------------------------------------
   Cronjob chạy mỗi 5 phút
----------------------------------------------------- */
cron.schedule("*/5 * * * *", async () => {
  console.log("⏳ Cron: updateGoogleCreditsJob running...");
  await updateGoogleCreditsJob();
});
