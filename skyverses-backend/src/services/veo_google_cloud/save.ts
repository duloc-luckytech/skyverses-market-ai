import fs from "fs";
import path from "path";

export function saveBase64Video(videoInfo: any) {
  const base64Data =
    videoInfo.bytesBase64Encoded ||
    videoInfo.video ||
    videoInfo.data ||
    null;

  if (!base64Data) throw new Error("❌ No Base64 video data found!");
  const mimeType = videoInfo.mimeType || "video/mp4";
  const outputDir = path.resolve("./output");
  fs.mkdirSync(outputDir, { recursive: true });

  const fileExt = mimeType.includes("mp4") ? "mp4" : "bin";
  const localFile = path.join(outputDir, `veo_${Date.now()}.${fileExt}`);

  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(localFile, buffer);

  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 phút sau

  console.log(`🎉 Video saved: ${localFile}`);
  console.log(`📦 Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

  return {
    localPath: localFile,
    mimeType,
    sizeMB: (buffer.length / 1024 / 1024).toFixed(2),
    expiresAt,
  };
}