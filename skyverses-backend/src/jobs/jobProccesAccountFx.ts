// jobs/listDriveFiles.ts
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import GoogleToken from "../models/GoogleTokenModel";
import axios from "axios";

/* ============================================================
    CONFIG
=============================================================== */

const downloadsDir = path.join(__dirname, "..", "downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

const auth = new google.auth.GoogleAuth({
  keyFile: "./service-account.json",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });
const FOLDER_ID = process.env.FOLDER_ID_ACCOUNTS;

const API_KEY = "AIzaSyBtrm0o5ab1c-Ec8ZuLcGt3oJAA5VWt3pY";
const CREDITS_URL = `https://aisandbox-pa.googleapis.com/v1/credits?key=${API_KEY}`;

/* ============================================================
    FETCH CREDITS (Google Labs)
=============================================================== */
async function fetchCredits(accessToken: string) {
  try {
    const res = await axios.get(CREDITS_URL, {
      headers: {
        accept: "*/*",
        authorization: `Bearer ${accessToken}`,
        referer: "https://labs.google/",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/142 Safari/537.36",
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
    console.error("❌ fetchCredits error:", err.message);
    return null;
  }
}

/* ============================================================
    VALIDATE CREDITS BEFORE UPDATE
=============================================================== */
async function validateTokenCreditsBeforeUpdate(accessToken: string) {
  try {
    const result = await fetchCredits(accessToken);
    if (!result) return { credits: 0, isActive: false };

    const credits = result.credits ?? 0;
    const isActive = credits >= 110;

    return { credits, isActive };
  } catch (err) {
    console.error("❌ Failed validateTokenCreditsBeforeUpdate:", err);
    return { credits: 0, isActive: false };
  }
}

/* ============================================================
    UPSERT GOOGLE TOKEN
=============================================================== */
async function upsertGoogleToken({
  email,
  accessToken,
  expires,
  cookieToken,
  credits,
  isActive,
  error,
}: {
  email: string;
  accessToken: string;
  cookieToken: string;
  expires?: string | Date;
  credits: number;
  isActive: boolean;
  error: string;
}) {
  try {
    const updated = await GoogleToken.findOneAndUpdate(
      { email },
      {
        accessToken,
        credits,
        isActive,
        cookieToken,
        note: null,
        codeError: error || "",
        ...(expires && { expires: new Date(expires) }),
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return updated;
  } catch (err: any) {
    console.error(
      `❌ [GoogleToken] Failed to update for ${email}:`,
      err.message || err
    );
    return null;
  }
}

/* ============================================================
    FETCH SESSION + VALIDATE + UPSERT
=============================================================== */
async function fetchSession(sessionToken: string, cookieString: string) {
  const cookie = [
    `_ga=GA1.1.23972004.1761535763`,
    `_ga_5K7X2T4V16=GS2.1.s1761892553$o2$g0$t1761892553$j60$l0$h0`,
    `__Host-next-auth.csrf-token=...`,
    `email=haildh%40rongchaua.dpdns.org`,
    `EMAIL=%22haildh%40rongchaua.dpdns.org%22`,
    `__Secure-next-auth.session-token=${sessionToken}`,
  ].join("; ");

  const res = await fetch("https://labs.google/fx/api/auth/session", {
    method: "GET",
    headers: {
      accept: "*/*",
      cookie,
      referer: "https://labs.google/fx/vi/tools/flow",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/142 Safari/537.36",
    },
  });

  const json = await res.json().catch(() => null);

  const { user, access_token, expires, error } = json || {};

  if (!user?.email || !access_token) {
    console.log("⚠️ Invalid session response:", json);
    return;
  }

  // ⭐ VALIDATE CREDITS BEFORE UPDATE
  const { credits, isActive } = await validateTokenCreditsBeforeUpdate(
    access_token
  );

  await upsertGoogleToken({
    email: user.email,
    accessToken: access_token,
    expires,
    cookieToken: cookieString,
    credits,
    isActive,
    error,
  });
}

/* ============================================================
    COOKIE BUILDER
=============================================================== */
function buildCookieStringFromJson(parsed: any[]): string {
  const labsCookies = parsed.filter((c: any) =>
    c.domain.includes("labs.google")
  );

  return labsCookies.map((c: any) => `${c.name}=${c.value}`).join("; ");
}

/* ============================================================
    MAIN JOB — LIST + READ JSON TOKENS
=============================================================== */
export default async function listJsonFiles() {
  try {
    if (!FOLDER_ID) return;

    let allFiles: any[] = [];
    let pageToken: string | undefined = undefined;

    // ⭐ Load all JSON files with pagination
    do {
      const response: any = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and mimeType='application/json' and trashed=false`,
        fields: "nextPageToken, files(id, name)",
        pageSize: 1000,
        pageToken,
      });

      allFiles = allFiles.concat(response.data.files || []);
      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    console.log(`📂 Tổng số file JSON: ${allFiles.length}`);

    for (const file of allFiles) {
      const filePath = path.join(downloadsDir, file.name);
      const dest = fs.createWriteStream(filePath);

      await drive.files
        .get({ fileId: file.id, alt: "media" }, { responseType: "stream" })
        .then(
          (res) =>
            new Promise<void>((resolve, reject) => {
              res.data.pipe(dest).on("finish", resolve).on("error", reject);
            })
        );

      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);

      const tokenItem = parsed.find(
        (item: any) =>
          item?.domain?.includes("labs.google") &&
          item?.name === "__Secure-next-auth.session-token"
      );

      const cookieString = buildCookieStringFromJson(parsed);

      if (tokenItem?.value) {
        await fetchSession(tokenItem.value, cookieString);
      } else {
        console.log(`⚠️ Không tìm thấy session-token trong ${file.name}`);
      }
    }
  } catch (err) {
    console.error("❌ Lỗi khi quét file JSON:", err);
  }
}
