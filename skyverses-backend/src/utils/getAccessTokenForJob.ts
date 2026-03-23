import ProviderToken from "../models/ProviderToken.model";
import { sendTelegramMessage } from "./telegram";

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
      // Bắn alert Telegram nếu không có token hoạt động (không dùng await để tránh làm chậm job chính nếu telegram lỗi)
      sendTelegramMessage(
        `⚠️ <b>CẢNH BÁO:</b> Hệ thống không tìm thấy bất kỳ token <b>FXLAB</b> nào đang hoạt động! (Provider: ${provider})`
      ).catch(console.error);
    }
    throw new Error("FXLAB_NO_ACTIVE_TOKEN");
  }

  return token?.accessToken;
}
