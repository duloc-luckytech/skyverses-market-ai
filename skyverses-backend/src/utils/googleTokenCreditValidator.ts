// services/googleTokenCreditValidator.ts
import axios from "axios";

const API_KEY = "AIzaSyBtrm0o5ab1c-Ec8ZuLcGt3oJAA5VWt3pY";
const CREDITS_URL = `https://aisandbox-pa.googleapis.com/v1/credits?key=${API_KEY}`;

export async function fetchCredits(accessToken: string) {
  try {
    const res = await axios.get(CREDITS_URL, {
      headers: {
        accept: "*/*",
        authorization: `Bearer ${accessToken}`,
        referer: "https://labs.google/",
      },
      timeout: 15000,
    });

    return {
      credits: res.data?.credits ?? 0,
      userPaygateTier: res.data?.userPaygateTier ?? null,
    };
  } catch (err: any) {
    console.error("❌ fetchCredits error:", err.message);
    return null;
  }
}

export async function validateTokenCreditsBeforeUpdate(accessToken: string) {
  const result = await fetchCredits(accessToken);
  if (!result) return { credits: 0, isActive: false };

  const credits = result.credits;
  const isActive = credits >= 110;

  return { credits, isActive };
}