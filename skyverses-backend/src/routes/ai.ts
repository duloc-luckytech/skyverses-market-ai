// routes/ai.ts
import express from "express";
import OpenAI from "openai";
import { authenticate } from "./auth";
import MetaPromptConfig from "../models/MetaPromptTemplate";
const router = express.Router();

/* ============================================================
   DeepSeek Client
=============================================================== */
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

// Model tên DeepSeek
const MODEL = "deepseek-chat";

/* ============================================================
   1) REFINE PROMPT
=============================================================== */
router.post(
  "/refine-prompt",
  authenticate,
  async (req, res) => {
    try {
      const { goal, content, style, duration, camera, mode } = req.body;
      const isStrict = mode === "strict";

      const strictSystem = `
Bạn đang ở STRICT MODE — KHÔNG ĐƯỢC PHÉP THÊM BẤT KỲ THÔNG TIN NÀO NGOÀI INPUT.
Tuân thủ tuyệt đối:
- Không thêm tính từ ngoại lai.
- Không thêm bối cảnh/phong cách không có trong input.
- Không thêm thời lượng trừ khi input có.
- Không tự tạo hành động mới.
- Không đổi camera thành phiên bản chi tiết hơn.
- Không suy luận hoặc mở rộng ý.
- Chỉ viết lại gọn gàng bằng tiếng Việt.
- 1–3 câu.
CHỈ TRẢ VỀ PROMPT.`;

      const creativeSystem = `
Bạn đang ở CREATIVE MODE — viết prompt điện ảnh đẹp nhưng KHÔNG thêm dữ kiện.
- 4–6 câu.
- Chỉ làm văn phong đẹp hơn.
- Không thêm vật thể/bối cảnh/hành động mới.
- Chỉ trả về prompt.
`;

      const systemInstruction = isStrict ? strictSystem : creativeSystem;

      const userPrompt = `
Mục tiêu: ${goal}
Cảnh: ${content}
Phong cách: ${style}
Camera: ${camera || "Không có"}
Thời lượng: ${duration}s
`.trim();

      const completion = await client.chat.completions.create({
        model: MODEL,
        temperature: isStrict ? 0.0 : 0.5,
        max_tokens: 300,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
      });

      const refined = completion.choices[0]?.message?.content?.trim() || "";

      return res.json({ success: true, refined });
    } catch (err) {
      console.error("Refine error:", err);
      return res.status(500).json({ error: "AI error" });
    }
  }
);

/* ============================================================
   2) SUGGEST CAMERA
=============================================================== */
router.post(
  "/suggest-camera",
  authenticate,
  async (req, res) => {
    try {
      const { scene, style } = req.body;

      const systemInstruction = `
Bạn là chuyên gia quay phim.
Nhiệm vụ: TRẢ VỀ DUY NHẤT 1 tên chuyển động camera.
- Tiếng Việt.
- Không mô tả lại cảnh.
- Không ánh sáng, màu sắc, nhân vật.
- Không giải thích.
- Không vượt quá 8 từ.
- Không dấu chấm cuối câu.
- Không được trả về nhiều lựa chọn.
`;

      const userPrompt = `
Cảnh: ${scene}
Style: ${style}
`;

      const completion = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 50,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
      });

      let camera = completion.choices[0]?.message?.content?.trim() || "";
      camera = camera.replace(/\.$/, "");

      return res.json({ success: true, camera });
    } catch (err) {
      console.error("Camera error:", err);
      return res.status(500).json({ error: "AI error" });
    }
  }
);

/* ============================================================
   3) SUGGEST STYLE
=============================================================== */
router.post(
  "/suggest-style",
  authenticate,
  async (req, res) => {
    try {
      const { goal, scene } = req.body;

      const systemInstruction = `
Bạn là chuyên gia tone hình ảnh.
Nhiệm vụ: trả về 1 phong cách (2–5 từ, tiếng Việt).
- Không mô tả lại cảnh.
- Không giải thích.
- Không lặp mẫu cố định.
- Không dựa từ khóa đơn lẻ.
`;

      const userPrompt = `
Mục tiêu: ${goal}
Cảnh: ${scene}
`;

      const completion = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.8,
        max_tokens: 20,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
      });

      let style = completion.choices[0]?.message?.content?.trim() || "";
      style = style.replace(/\.$/, "");

      return res.json({ success: true, style });
    } catch (err) {
      console.error("Style error:", err);
      return res.status(500).json({ error: "AI error" });
    }
  }
);

/* ============================================================
   4) META / GENERATE — phiên bản DeepSeek
=============================================================== */
router.post(
  "/meta/generate",
  authenticate,
  async (req, res) => {
    try {
      const { idea, style, tone, pacing, scenes = 5, mode, camera } = req.body;

      if (!idea) {
        return res.status(400).json({ error: "Thiếu trường 'idea'" });
      }

      const ai = client;

      /* ============================================================
           1) Tải system config từ DB
        ============================================================ */
      const config = await MetaPromptConfig.findOne();

      if (!config) {
        return res.status(500).json({
          error: "MetaPromptConfig chưa được thiết lập trong hệ thống.",
        });
      }

      const { role, rules, outputFormat } = config;

      /* ============================================================
           2) Tạo system prompt từ DB
        ============================================================ */
      const system =
        `ROLE:\n${role.trim()}\n\n` +
        `RULES:\n` +
        rules.map((r, i) => `- ${r}`).join("\n") +
        `\n\nOUTPUT FORMAT:\n${outputFormat.trim()}`;

      /* ============================================================
           3) User input
        ============================================================ */
      const user = `
        IDEA: ${idea}
        STYLE: ${style}
        TONE: ${tone}
        PACING: ${pacing}
        CAMERA: ${camera}
        SCENES: ${scenes}
        MODE: ${mode}
      `.trim();

      /* ============================================================
           4) CALL AI
        ============================================================ */
      const completion = await ai.chat.completions.create({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 4000,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });

      let output = completion.choices?.[0]?.message?.content || "";

      /* ============================================================
           5) Clean code block
        ============================================================ */
      output = output
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      /* ============================================================
           6) Parse JSON an toàn
        ============================================================ */
      let meta;

      try {
        meta = JSON.parse(output);
      } catch (err) {
        console.warn("⚠ JSON parse failed → trying repair…");

        const repaired = output.replace(/[\u0000-\u001F]+/g, "").trim();

        meta = JSON.parse(repaired); // nếu fail thì throw tiếp
      }

      return res.json({ success: true, meta });
    } catch (err) {
      console.error("META ERROR:", err);
      return res.status(500).json({ error: "Không tạo được meta prompt" });
    }
  }
);

export default router;
