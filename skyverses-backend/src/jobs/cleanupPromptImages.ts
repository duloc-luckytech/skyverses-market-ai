import fs from "fs";
import path from "path";
import cron from "node-cron";

// ⏱ Giữ file tối đa bao lâu (ms)
const MAX_AGE = 5 * 60 * 1000; // 5 phút

// 📂 Thư mục chứa ảnh
const BASE_DIR = path.join(process.cwd(), "uploads", "prompts");

export async function cleanupPromptImages() {
  try {
    if (!fs.existsSync(BASE_DIR)) return;

    const files = fs.readdirSync(BASE_DIR);
    const now = Date.now();

    let deleted = 0;

    for (const file of files) {
      const filePath = path.join(BASE_DIR, file);

      // Bỏ qua thư mục con
      if (!fs.statSync(filePath).isFile()) continue;

      /**
       * File có dạng:
       *   prompt_1700000000000_abc123.jpg
       * -> timestamp nằm ở giữa
       */
      const match = file.match(/^prompt_(\d+)_/);
      if (!match) continue;

      const timestamp = Number(match[1]);
      const age = now - timestamp;

      if (age > MAX_AGE) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    }

    if (deleted > 0) {
      console.log(`🧹 cleanupPromptImages: Deleted ${deleted} old files`);
    }
  } catch (err) {
    console.error("❌ cleanupPromptImages error:", err);
  }
}

// Chạy mỗi 3 phút
cron.schedule("*/3 * * * *", async () => {
  await cleanupPromptImages();
});
