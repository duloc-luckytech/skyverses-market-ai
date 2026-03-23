import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// ✅ Dùng process.cwd() để luôn trỏ đúng thư mục gốc runtime
const PREVIEW_DIR = path.resolve(process.cwd(), "uploads/previews");

async function ensurePreviewDir() {
  try {
    await fs.access(PREVIEW_DIR);
  } catch {
    await fs.mkdir(PREVIEW_DIR, { recursive: true });
    console.log(`📁 Created missing directory: ${PREVIEW_DIR}`);
  }
}

async function runCleanupPreviews() {
  try {
    await ensurePreviewDir();

    console.log(
      `\n[${new Date().toLocaleTimeString()}] 🧹 Starting cleanup at: ${PREVIEW_DIR}`
    );

    const files = await fs.readdir(PREVIEW_DIR);

    const now = Date.now();
    let deleted = 0;
    let skipped = 0;

    for (const file of files) {
      if (!file.endsWith(".jpg")) {
        skipped++;
        continue;
      }

      const filePath = path.join(PREVIEW_DIR, file);
      const stats = await fs.stat(filePath);
      const ageMinutes = (now - stats.mtimeMs) / 60000;

      if (ageMinutes < 10) {
        skipped++;
        continue;
      }

      await fs.unlink(filePath);
      deleted++;
    }

    console.log(
      `[${new Date().toLocaleTimeString()}] ✅ Cleanup done: deleted ${deleted}, skipped ${skipped}`
    );
  } catch (err) {
    console.error("❌ Error during cleanup:", err);
  }
}

let isRunning = false;

setInterval(async () => {
  if (isRunning) return;
  isRunning = true;
  try {
    await runCleanupPreviews();
  } finally {
    isRunning = false;
  }
}, 5 * 60_000); // 5 phút

runCleanupPreviews();

export default runCleanupPreviews;