import fs from "fs";
import path from "path";

const TEMP_DIR = path.join(process.cwd(), "tmp-videos");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

export function saveTempVideo(jobId: string, base64: string): string {
  const filePath = path.join(TEMP_DIR, `${jobId}.mp4`);
  fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
  return filePath;
}

export function getTempVideoPath(jobId: string): string | null {
  const filePath = path.join(TEMP_DIR, `${jobId}.mp4`);
  return fs.existsSync(filePath) ? filePath : null;
}

// Dọn rác định kỳ (file cũ > 10 phút)
setInterval(() => {
  const now = Date.now();
  fs.readdirSync(TEMP_DIR).forEach((file) => {
    const filePath = path.join(TEMP_DIR, file);
    const stat = fs.statSync(filePath);
    if (now - stat.mtimeMs > 10 * 60 * 1000) fs.unlinkSync(filePath);
  });
}, 60_000);