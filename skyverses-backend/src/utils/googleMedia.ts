import axios from "axios";
import GoogleTokenModel from "../models/GoogleTokenModel";

// Sleep helper
function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function fetchImageMetadata(
  mediaId: string,
  googleEmail: string,
  maxRetries = 5,
  retryDelay = 1000, // 1s,
  accessToken:string
) {


  const token =accessToken;
  if (!token) throw new Error("Token not found for Google Email: " + googleEmail);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await axios.get(
        `https://aisandbox-pa.googleapis.com/v1/media/${mediaId}?clientContext.tool=PINHOLE`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const imageUrl =
        res.data?.userUploadedImage?.fifeUrl || res.data?.fifeUrl || null;

      const aspectRatio =
        res.data?.userUploadedImage?.aspectRatio || null;

      if (imageUrl) {
        if (imageUrl.startsWith("https://storage.googleapis.com/ai-sandbox-videofx/image")) {
          // ✅ Ảnh đã sẵn sàng
          return { imageUrl, aspectRatio };
        }

        if (imageUrl.startsWith("https://lh3.googleusercontent.co")) {
          // ⏳ Ảnh còn trong trạng thái tạm → retry
          console.warn(
            `⏳ [${attempt}/${maxRetries}] Image chưa ready (lh3) → mediaId: ${mediaId}`
          );
        } else {
          // ❓ URL lạ
          console.warn(
            `❓ [${attempt}/${maxRetries}] Image URL không xác định: ${imageUrl}`
          );
        }
      } else {
        console.warn(`⏳ [${attempt}/${maxRetries}] Metadata chưa sẵn sàng cho ${mediaId}`);
      }
    } catch (err: any) {
      // console.warn(`⚠️ [${attempt}/${maxRetries}] Lỗi metadata ${mediaId}:`, err);
    }

    await delay(retryDelay);
  }

  // ❌ Sau khi thử đủ số lần vẫn chưa có image chuẩn
  return { imageUrl: null, aspectRatio: null };
}