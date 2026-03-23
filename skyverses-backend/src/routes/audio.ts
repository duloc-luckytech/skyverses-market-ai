import axios from "axios";
import express from "express";
import qs from "qs";
import ProviderToken from "../models/ProviderToken.model";

const router = express.Router();

/* =====================================================
   POST /api/gommo/audio
   Create Voice Design (Text → Voice)
===================================================== */

export async function getRandomGommoToken() {
  const now = new Date();

  const token = await ProviderToken.aggregate([
    {
      $match: {
        provider: "gommo",
        isActive: true,
        accessToken: { $exists: true, $ne: "" },
        $or: [
          { cooldownUntil: { $exists: false } },
          { cooldownUntil: { $lte: now } },
        ],
      },
    },
    { $sample: { size: 1 } }, // 🎯 random 1 token
  ]);

  if (!token.length) {
    throw new Error("NO_ACTIVE_GOMMO_TOKEN");
  }

  return token[0];
}

router.post("/", async (req, res) => {
  try {
    const { prompt, text, seed } = req.body;

    if (!prompt || !text) {
      return res.status(400).json({
        success: false,
        message: "MISSING_PROMPT_OR_TEXT",
      });
    }
    const providerToken = await getRandomGommoToken();

    const payload = {
      access_token: providerToken.accessToken,
      domain: "aivideoauto.com",
      action_type: "createVoiceDesign",
      project_id: "5a1f50fe10ddbb5d",
      prompt,
      text_preview: text,
      seed: seed || Math.floor(Math.random() * 1e9),
    };

    const response = await axios.post(
      "https://api.gommo.net/ai/audio",
      qs.stringify(payload),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );

    const previews = response.data?.previews || [];

    return res.json({
      success: true,
      data: previews, // ✅ CHỈ TRẢ previews
    });
  } catch (err: any) {
    console.error("[GOMMO_AUDIO_ERROR]", err?.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "GOMMO_AUDIO_FAILED",
    });
  }
});
export default router;
