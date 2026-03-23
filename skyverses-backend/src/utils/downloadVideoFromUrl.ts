import axios from "axios";
import type { Response } from "express";

/**
 * Download video từ fileUrl và stream về client
 * (không set filename)
 */
export async function downloadVideoFromUrl(
  res: Response,
  fileUrl: string
) {
  const response = await axios.get(fileUrl, {
    responseType: "arraybuffer",
  });

  res.set({
    "Content-Type": "video/mp4",
    "Content-Length": response.data.length,
  });

  res.send(Buffer.from(response.data));
}