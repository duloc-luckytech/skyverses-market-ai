import fs from "fs";
import path from "path";
import cron from "node-cron";

const VIDEO_DIR = path.resolve("./output");
const FILE_TTL_MS = 10 * 60 * 1000; // 10 phút

// 🧹 Cron chạy mỗi 5 phút
cron.schedule("*/5 * * * *", () => {
  console.log("🕒 Running video cleanup job...");

  const files = fs.existsSync(VIDEO_DIR) ? fs.readdirSync(VIDEO_DIR) : [];

  for (const file of files) {
    const filePath = path.join(VIDEO_DIR, file);
    const stat = fs.statSync(filePath);
    const ageMs = Date.now() - stat.ctimeMs;

    if (ageMs > FILE_TTL_MS) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted expired video: ${file}`);
      } catch (err: any) {
        console.error(`⚠️ Failed to delete ${file}:`, err.message);
      }
    }
  }
});