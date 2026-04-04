import ProviderToken from "../models/ProviderToken.model";
export async function getAccessTokenForJob(provider: string = "labs") {
  const match: any = {
    provider,
    isActive: true,
  };

  const [token] = await ProviderToken.aggregate([
    { $match: match },
    { $sample: { size: 1 } }, // ⭐ RANDOM
  ]);

  if (!token?.accessToken) {
    if (provider === "labs") {
      console.warn(
        `⚠️ CẢNH BÁO: Hệ thống không tìm thấy bất kỳ token FXLAB nào đang hoạt động! (Provider: ${provider})`
      );
    }
    throw new Error("FXLAB_NO_ACTIVE_TOKEN");
  }

  return token?.accessToken;
}
