import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface SavedAudioFile {
  filePath: string;
  publicUrl: string;
  filename: string;
}

export const AUDIO_OUTPUT_DIR = path.join(process.cwd(), "outputs", "audio");

export function ensureAudioOutputDir() {
  if (!fs.existsSync(AUDIO_OUTPUT_DIR)) {
    fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
  }
}

export function audioExtFromMime(mimeType: string): "mp3" | "wav" | "bin" {
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("wav") || mimeType.includes("wave")) return "wav";
  return "bin";
}

export function mimeFromAudioUrl(url: string): string {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".wav")) return "audio/wav";
  if (clean.endsWith(".mp3")) return "audio/mpeg";
  return "application/octet-stream";
}

export function saveAudioBuffer(
  buffer: Buffer,
  mimeType: string,
  prefix = "audio"
): SavedAudioFile {
  ensureAudioOutputDir();
  const filename = `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}.${audioExtFromMime(mimeType)}`;
  const filePath = path.join(AUDIO_OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return {
    filePath,
    filename,
    publicUrl: `/audio/generated/${filename}`,
  };
}

export function saveTextBuffer(text: string, prefix = "transcript"): SavedAudioFile {
  ensureAudioOutputDir();
  const filename = `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}.txt`;
  const filePath = path.join(AUDIO_OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, text, "utf8");
  return {
    filePath,
    filename,
    publicUrl: `/audio/generated/${filename}`,
  };
}

export function readGeneratedAudio(url: string): { buffer: Buffer; mimeType: string } | null {
  if (!url.startsWith("/audio/generated/")) return null;
  const filename = path.basename(url.split("?")[0]);
  const filePath = path.join(AUDIO_OUTPUT_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return {
    buffer: fs.readFileSync(filePath),
    mimeType: mimeFromAudioUrl(filePath),
  };
}
