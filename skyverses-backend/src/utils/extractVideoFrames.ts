import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import axios from "axios";

/**
 * 📸 Tải video và trích xuất một số frame ra Base64 (ví dụ: 3 frame đều nhau)
 */
export async function extractVideoFrames(
  fileUrl: string,
  frameCount = 3
): Promise<string[]> {
  const tempDir = path.join("/tmp", `frames_${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const tempVideo = path.join(tempDir, "temp.mp4");

  // 🧩 Tải video xuống tạm
  const res = await axios.get(fileUrl, { responseType: "arraybuffer" });
  fs.writeFileSync(tempVideo, res.data);

  // Lấy metadata để biết duration
  const duration = await new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(tempVideo, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration || 0);
    });
  });

  const frames: string[] = [];
  const step = duration / (frameCount + 1);

  for (let i = 1; i <= frameCount; i++) {
    const framePath = path.join(tempDir, `frame_${i}.jpg`);
    const time = i * step;

    await new Promise<void>((resolve:any, reject) => {
      ffmpeg(tempVideo)
        .screenshots({
          timestamps: [time],
          filename: `frame_${i}.jpg`,
          folder: tempDir,
          size: "640x?",
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const buffer = fs.readFileSync(framePath);
    const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
    frames.push(base64);
  }

  // 🧹 cleanup
  fs.rmSync(tempDir, { recursive: true, force: true });

  return frames;
}