import fs from "fs";
import path from "path";

const TEMP_DIR = path.join(process.cwd(), "tmp-videos");
const EXPIRE_TIME_MS = 15 * 60 * 1000; // 15 phút

export async function cleanupTempVideos() {
  const now = Date.now();
  let removed = 0;

  try {
    if (!fs.existsSync(TEMP_DIR)) {
      console.warn("⚠️ TMP folder not found:", TEMP_DIR);
      return;
    }

    const files = fs.readdirSync(TEMP_DIR);
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);

      try {
        const stat = fs.statSync(filePath);
        const age = now - stat.mtimeMs;

        if (age > EXPIRE_TIME_MS) {
          fs.unlinkSync(filePath);
          removed++;
        }
      } catch (err) {
        // Nếu file đang bị lock hoặc bị xoá giữa chừng
        console.warn(`⚠️ Skip file ${file}: `);
      }
    }

    if (removed > 0) {
      console.log(`🧹 Cleaned ${removed} old temp video(s) from tmp-videos`);
    }
  } catch (err: any) {
    console.error("❌ [cleanupTempVideos] Error:", err.message);
  }
}

// 🕒 Dọn mỗi 1 phút
setInterval(cleanupTempVideos, 60_000);

// 🔥 Chạy ngay khi khởi động (không chờ 1 phút đầu tiên)
cleanupTempVideos();