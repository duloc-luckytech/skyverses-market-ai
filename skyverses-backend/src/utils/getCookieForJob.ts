import ProviderToken from "../models/ProviderToken.model";
function extractSessionHead(token?: string | null) {
  if (!token) return null;

  const segments = token.split(".");

  // JWE chuẩn phải có ít nhất 5 segment
  if (segments.length < 3) return null;

  return `${segments[0]}..${segments[2]}`;
}

export async function getCookieForJob(provider: string = "labs") {
  const match: any = {
    provider,
    isActive: true,
  };

  const [token] = await ProviderToken.aggregate([
    { $match: match },
    { $sample: { size: 1 } },
  ]);

  if (!token?.cookieToken) {
    if (provider === "labs") {
      console.warn(
        `⚠️ CẢNH BÁO: Hệ thống không tìm thấy bất kỳ token FXLAB nào đang hoạt động! (Provider: ${provider})`
      );
    }

    throw new Error("FXLAB_NO_ACTIVE_TOKEN");
  }

  const sessionHead = extractSessionHead(token.cookieToken);

  if (!sessionHead) {
    throw new Error("INVALID_SESSION_TOKEN_FORMAT");
  }

  return sessionHead;
}