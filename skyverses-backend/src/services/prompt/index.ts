import fs from "fs";
import path from "path";
import axios from "axios";

// 🟩 Luôn trỏ đúng root project (cùng cấp package.json)
const BASE_DIR = path.join(process.cwd(), "uploads", "prompts");

// 🔧 Đảm bảo thư mục tồn tại
if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR, { recursive: true });
}

/**
 * Tải hình từ URL về uploads/prompts
 * Trả về filename để lưu trong DB
 */
export async function saveLocalPromptImage(imageUrl: string): Promise<string> {
  try {
    const filename = `prompt_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}.jpg`;

    const filePath = path.join(BASE_DIR, filename);

    console.log("📥 Save image to:", filePath);

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    fs.writeFileSync(filePath, response.data);

    return filename;
  } catch (err) {
    console.error("❌ saveLocalPromptImage error:", err);
    return "";
  }
}