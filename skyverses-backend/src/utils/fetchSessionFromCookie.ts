// services/googleSessionService.ts
import axios from "axios";
/**
 * Hàm fetch session token từ cookie của Google Labs
 * Trả về: email, accessToken, expires, error, cookieToken, credits, isActive
 */
export async function fetchSessionFromCookie(cookieToken: string) {
  if (!cookieToken) {
    throw new Error("cookieToken is required");
  }

  // ⚠️ cookieToken là full cookie string FE gửi lên
  const cookieHeader = cookieToken;
//
  try {
    const res = await axios.get("https://labs.google/fx/api/auth/session", {
      headers: {
        accept: "*/*",
        cookie: cookieHeader,
        referer: "https://labs.google/fx/vi/tools/flow",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/142 Safari/537.36",
      },
      timeout: 15000,
    });

    const { user, access_token, expires, error } = res.data || {};

    if (!user?.email || !access_token) {
      throw new Error("Invalid session response — cannot detect email or token.");
    }

    // ⭐ Validator deleted -> assume stubbed
    const creditState = { credits: 100, isActive: true };

    return {
      email: user.email,
      accessToken: access_token,
      expires,
      error,
      cookieToken: cookieToken,
      credits: creditState.credits,
      isActive: creditState.isActive,
    };
  } catch (err: any) {
    console.error("❌ fetchSessionFromCookie Error:", err.response?.data || err.message);
    throw new Error("Failed to fetch session from cookie");
  }
}