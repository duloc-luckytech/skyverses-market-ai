// routes/ai.ts
import express from "express";
import OpenAI from "openai";
import { authenticate } from "./auth";
import { createRateLimit } from "../middlewares/limit";

const router = express.Router();

// Khởi tạo client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ============================================================
   1) API TỐI ƯU PROMPT (refine-prompt)
=============================================================== */
router.post(
  "/refine-prompt",
  authenticate,
  createRateLimit(),
  async (req, res) => {
    try {
      const { goal, content, style, duration, camera, mode } = req.body;

      const isStrict = mode === "strict";

      /* ============================================================
          STRICT MODE — ZERO ADDITIONS (v2 cực chặt)
      ============================================================ */
      const strictSystem = `
  Bạn đang ở STRICT MODE — KHÔNG ĐƯỢC PHÉP THÊM BẤT KỲ THÔNG TIN NÀO NGOÀI INPUT.
  
  QUY TẮC BẮT BUỘC:
  1. KHÔNG được thêm tính từ mô tả ngoại lai 
     (ví dụ: rực rỡ, lung linh, sống động, mượt mà, sắc nét…).
  2. KHÔNG được thêm từ khóa bối cảnh/phong cách không xuất hiện trong mô tả cảnh.
     ❌ Không được đưa từ “cyberpunk”, “cinematic”, “4K”… vào phần mô tả CẢNH.
     Chúng chỉ được nhắc lại nếu nằm trong trường "style".
  3. KHÔNG được thêm thời lượng vào câu trừ khi input yêu cầu mô tả nó.
     (Ví dụ: “trong 8 giây” là sai).
  4. KHÔNG được thêm hành động hoặc vị trí mới 
     (ví dụ: theo sát, quan sát, lướt qua gần, tiến tới…).
  5. KHÔNG được thay đổi camera thành mô tả chi tiết hơn 
     (ví dụ: “mượt”, “ổn định”, “giữ nhịp”…).
  6. KHÔNG được gộp hoặc sinh logic mới không có trong input.
  
  ĐƯỢC PHÉP:
  - Chỉ viết lại bằng văn phong gọn gàng, dễ hiểu.
  - Giữ nguyên 100% dữ kiện input.
  - 1–3 câu.
  - Viết tiếng Việt.
  - KHÔNG giải thích, KHÔNG bình luận.
  
  CHỈ TRẢ VỀ PROMPT.
  `;

      /* ============================================================
          CREATIVE MODE — GIỮ ĐÚNG DỮ KIỆN
      ============================================================ */
      const creativeSystem = `
  Bạn đang ở CREATIVE MODE — VIẾT PROMPT ĐIỆN ẢNH MƯỢT MÀ.
  
  QUY TẮC:
  - Được phép làm văn phong đẹp hơn nhưng KHÔNG được thêm dữ kiện.
  - 4–6 câu, giàu hình ảnh, tiếng Việt.
  - KHÔNG giải thích.
  - KHÔNG bình luận.
  - KHÔNG thêm vật thể/hành động/bối cảnh mới.
  
  Chỉ trả về prompt.
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
        model: "gpt-5.1",
        temperature: isStrict ? 0.0 : 0.5,
        max_completion_tokens: 300,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
      });

      const refined = completion.choices[0].message?.content?.trim() || "";

      return res.json({ success: true, refined });
    } catch (err: any) {
      console.error("Lỗi refine-prompt:", err?.response?.data || err);
      return res.status(500).json({ error: "AI không thể tinh chỉnh prompt" });
    }
  }
);

/* ============================================================
   2) API GỢI Ý CAMERA (suggest-camera)
=============================================================== */
router.post(
  "/suggest-camera",
  authenticate,
  createRateLimit(),
  async (req, res) => {
    try {
      const { scene, style } = req.body;
      if (!scene) {
        return res
          .status(400)
          .json({ error: "Vui lòng nhập mô tả cảnh (scene)" });
      }

      /* ============================================================
         PROMPT SIÊU CHẶT – ĐẢM BẢO KHÔNG BAO GIỜ MÔ TẢ CẢNH
      ============================================================ */
      const systemInstruction = `
  Bạn là chuyên gia quay phim điện ảnh.
  
  YÊU CẦU TUYỆT ĐỐI:
  - Chỉ trả về đúng 1 kiểu chuyển động camera.
  - BẰNG TIẾNG VIỆT.
  - Không mô tả lại cảnh.
  - Không mô tả ánh sáng, màu sắc, mưa, khói, nhân vật, phương tiện.
  - Không giải thích.
  - Không dùng câu dài.
  - Không ví dụ.
  - Không mô tả ống kính (lens), không mô tả góc quay (angle).
  - Không mô tả tốc độ khung hình.
  - Không mô tả độ sâu trường ảnh.
  - Không viết dài hơn 8 từ.
  - Không viết dài hơn 1 câu.
  - Không để dấu chấm "." cuối câu.
  - Không trả về nhiều lựa chọn.
  
  Chỉ trả về **tên chuyển động camera**, ví dụ dạng:
  - "lia máy chậm"
  - "đẩy máy nhẹ về trước"
  - "đi máy theo sau"
  - "pan máy rộng"
  - "dolly-in mượt"
  (Lưu ý: KHÔNG được trả về y chang các ví dụ trên. Chỉ dùng để hiểu định dạng.)
  `;

      const userPrompt = `
  Mô tả cảnh:
  ${scene}
  
  Phong cách: ${style}
  
  Nhiệm vụ:
  Chỉ trả về duy nhất 1 kiểu chuyển động camera phù hợp.
  KHÔNG mô tả lại cảnh.
  KHÔNG giải thích.
  KHÔNG mở rộng câu.
  Bằng tiếng Việt.
  `;

      /* ============================================================
         CALL GPT
      ============================================================ */
      const completion = await client.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
      });

      let camera = completion.choices[0].message?.content?.trim() || "";

      // Xóa dấu chấm nếu GPT lỡ thêm
      camera = camera.replace(/\.$/, "");

      res.json({ success: true, camera });
    } catch (err: any) {
      console.error("Lỗi suggest-camera:", err.response?.data || err);
      res.status(500).json({ error: "AI không thể gợi ý camera" });
    }
  }
);

router.post(
  "/suggest-style",
  authenticate,
  createRateLimit(),
  async (req, res) => {
    try {
      const { goal, scene } = req.body;

      if (!goal && !scene) {
        return res
          .status(400)
          .json({ error: "Cần ít nhất Mục tiêu hoặc Mô tả cảnh" });
      }

      /* ============================================================
          SYSTEM — Dynamic Style Analysis (TIẾNG VIỆT)
      ============================================================ */
      const systemInstruction = `
  Bạn là chuyên gia hình ảnh điện ảnh, nhiệm vụ là xác định TONE PHONG CÁCH phù hợp nhất dựa vào ngữ cảnh.
  
  YÊU CẦU:
  - Phân tích cảm xúc (mood) của cảnh.
  - Phân tích không khí tổng thể (u tối, nhẹ nhàng, khẩn trương, bí ẩn...).
  - Phân tích gam màu/ánh sáng mà cảnh gợi ra.
  - Phân tích nhịp chuyển động của bối cảnh (chậm, nhanh, hỗn loạn, tĩnh lặng...).
  - Dựa vào tất cả các yếu tố trên để tạo ra **1 phong cách hình ảnh** hợp lý.
  
  QUY ĐỊNH:
  - Chỉ trả về 1 phong cách duy nhất.
  - 2–5 từ.
  - Bằng tiếng Việt.
  - KHÔNG mô tả lại cảnh.
  - KHÔNG diễn giải lý do.
  - KHÔNG lặp lại một mẫu cố định.
  - KHÔNG dựa vào từ khoá đơn lẻ (như neon là ra neon). Phải suy luận tone tổng thể.
  - Có thể mix phong cách sáng tạo: "điện ảnh gam lạnh", "đô thị u tối", "mơ hồ ấm nhẹ", "noir hiện đại", "tông tím huyền ảo"...
  
  Chỉ trả về phong cách.
      `;

      const userPrompt = `
  Hãy phân tích tone hình ảnh dựa vào:
  
  Mục tiêu: ${goal}
  Mô tả cảnh: ${scene}
  
  Trả về 1 phong cách hình ảnh (2–5 từ, tiếng Việt).
      `;

      const completion = await client.chat.completions.create({
        model: "gpt-5.1",
        temperature: 0.8,
        max_completion_tokens: 20,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
      });

      let style = completion.choices[0].message?.content?.trim() || "";
      style = style.replace(/\.$/, "");

      return res.json({ success: true, style });
    } catch (err: any) {
      console.error("Lỗi suggest-style:", err.response?.data || err);
      res.status(500).json({ error: "AI không thể gợi ý style" });
    }
  }
);

router.post(
  "/meta/generate",
  authenticate,
  createRateLimit(),
  async (req, res) => {
    try {
      const {
        idea,
        style,
        tone,
        pacing,
        scenes = 5,
        mode = "full-meta",
      } = req.body;

      if (!idea) return res.status(400).json({ error: "Thiếu trường 'idea'" });

      /* ============================================================
            SYSTEM — ÉP GPT TRẢ 1 SCENE = 1 SHOT
        ============================================================ */
      const system = `
Bạn là chuyên gia làm phim Hollywood và chuyên gia AI Video.
Nhiệm vụ: PHÂN RÃ ý tưởng thành cấu trúc JSON để dùng tạo video AI.

LUÔN trả về JSON hợp lệ, không được viết bình luận ngoài JSON.

QUY ĐỊNH:
- Mỗi scene chỉ có 1 shot duy nhất.
- "camera" phải mô tả bằng TIẾNG VIỆT (ngắn gọn).
- "description" bằng TIẾNG VIỆT.
- "prompt" bằng TIẾNG ANH để dùng cho AI video.
- "duration" luôn = 8 (giây).

JSON FORMAT:

{
  "title": "",
  "summary": "",
  "scenes": [
    {
      "sceneIndex": 1,
      "name": "",
      "description": "",
      "shot": {
        "id": "1",
        "camera": "cận cảnh chuyển chậm...", 
        "prompt": "English cinematic prompt...",
        "duration": 8
      }
    }
  ]
}
`;

      /* ============================================================
            USER INPUT
        ============================================================ */
      const user = `
  IDEA: ${idea}
  STYLE: ${style || "default"}
  TONE: ${tone || "default"}
  PACING: ${pacing || "cinematic"}
  SCENES: ${scenes}
  MODE: ${mode}
  `;

      /* ============================================================
            CALL GPT WITH JSON MODE
        ============================================================ */
      const completion = await client.chat.completions.create({
        model: "gpt-5.1",
        temperature: 0.4,
        max_completion_tokens: 3000,
        response_format: { type: "json_object" },

        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });

      let output = completion.choices[0]?.message?.content?.trim();
      if (!output) return res.json({ success: true, meta: {} });

      /* ============================================================
            PARSE JSON AN TOÀN
        ============================================================ */
      let meta;
      try {
        meta = JSON.parse(output);
      } catch {
        const fixed = output.replace(/```json|```/g, "").trim();
        meta = JSON.parse(fixed);
      }

      return res.json({ success: true, meta });
    } catch (err: any) {
      console.error("❌ META ERROR:", err.response?.data || err);
      return res.status(500).json({ error: "Không tạo được meta prompt" });
    }
  }
);
export default router;
