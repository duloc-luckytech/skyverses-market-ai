import axios from "axios";

/**
 * 📢 Gửi tin nhắn thông báo qua Telegram
 * @param message Nội dung tin nhắn
 */
export async function sendTelegramMessage(message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn("⚠️ TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in .env");
        return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
        });
    } catch (error: any) {
        console.error("❌ Telegram Notify Error:", error?.response?.data || error.message);
    }
}
