// routes/ai.ts
import express from "express";
import OpenAI from "openai";
import { authenticate } from "./auth";
import MetaPromptConfig from "../models/MetaPromptTemplate";
import { listKeyGommoGenmini } from "../config/keyGenminiGommo";
const router = express.Router();

/* ============================================================
   SUPPORT CHAT — Proxy to ezaiapi.com (avoids CORS from browser)
   POST /ai/chat
   Body: { messages: [...], stream?: boolean }
   Rate limit: 10 requests per 60 seconds per user
=============================================================== */
const chatRateMap = new Map<string, number[]>();
const CHAT_RATE_LIMIT = 10;
const CHAT_RATE_WINDOW = 60 * 1000; // 60s in ms

router.post("/chat", authenticate, async (req: any, res: any) => {
  // Server-side rate limiting
  const userId = req.user?._id?.toString() || req.ip || "unknown";
  const now = Date.now();
  const timestamps = (chatRateMap.get(userId) || []).filter(t => now - t < CHAT_RATE_WINDOW);

  if (timestamps.length >= CHAT_RATE_LIMIT) {
    const waitSec = Math.ceil((timestamps[0] + CHAT_RATE_WINDOW - now) / 1000);
    return res.status(429).json({
      error: `Bạn đang gửi quá nhanh. Vui lòng chờ ${waitSec}s.`,
      retryAfter: waitSec
    });
  }
  timestamps.push(now);
  chatRateMap.set(userId, timestamps);
  try {
    const {
      messages,
      stream = true,
      model = "claude-sonnet-4-6",
      max_tokens = 4096,
    } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }

    // Pick random active key
    const activeKeys = listKeyGommoGenmini.filter((k: any) => k.isActive && k.key);
    if (activeKeys.length === 0) {
      return res.status(500).json({ error: "No active API keys" });
    }
    const selectedKey = activeKeys[Math.floor(Math.random() * activeKeys.length)].key;

    const apiResponse = await fetch("https://ezaiapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${selectedKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        stream,
      }),
    });

    if (!apiResponse.ok) {
      const errBody = await apiResponse.text().catch(() => "");
      console.error("[AI Chat] API error:", apiResponse.status, errBody);
      return res.status(apiResponse.status).json({ error: "AI API error", detail: errBody });
    }

    if (stream && apiResponse.body) {
      // SSE streaming: pipe chunks to client
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
      res.flushHeaders();

      const reader = (apiResponse.body as any).getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(decoder.decode(value, { stream: true }));
        }
      } catch (streamErr) {
        console.error("[AI Chat] Stream error:", streamErr);
      } finally {
        res.end();
      }
    } else {
      // Non-streaming: return JSON
      const data = await apiResponse.json();
      return res.json(data);
    }
  } catch (err) {
    console.error("[AI Chat] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/* ============================================================
   CHAT ANALYTICS — In-memory tracker + stats endpoint
   GET /ai/chat/stats (admin only)
=============================================================== */
interface ChatLog { userId: string; question: string; timestamp: number; }
const chatLogs: ChatLog[] = [];
const MAX_LOGS = 1000;

// Track each chat (called internally from /chat handler doesn't need separate call)
// We augment the /chat route with a post-hook via middleware-less approach:
router.use("/chat", (req: any, _res: any, next: any) => {
  if (req.method === 'POST' && req.body?.messages) {
    const userMsg = req.body.messages.filter((m: any) => m.role === 'user').pop();
    const question = typeof userMsg?.content === 'string' 
      ? userMsg.content.slice(0, 100) 
      : (userMsg?.content?.[0]?.text || '').slice(0, 100);
    if (question) {
      chatLogs.push({ 
        userId: req.user?._id?.toString() || 'anon', 
        question, 
        timestamp: Date.now() 
      });
      if (chatLogs.length > MAX_LOGS) chatLogs.splice(0, chatLogs.length - MAX_LOGS);
    }
  }
  next();
});

router.get("/chat/stats", authenticate, async (req: any, res: any) => {
  try {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const today = chatLogs.filter(l => now - l.timestamp < day);
    const week = chatLogs.filter(l => now - l.timestamp < 7 * day);
    
    // Top questions (frequency count)
    const freq: Record<string, number> = {};
    for (const log of chatLogs) {
      const key = log.question.slice(0, 50).toLowerCase();
      freq[key] = (freq[key] || 0) + 1;
    }
    const topQuestions = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([q, count]) => ({ question: q, count }));

    // Unique users
    const uniqueUsers = new Set(chatLogs.map(l => l.userId)).size;

    return res.json({
      success: true,
      data: {
        totalChats: chatLogs.length,
        todayChats: today.length,
        weekChats: week.length,
        uniqueUsers,
        topQuestions,
        recentChats: chatLogs.slice(-20).reverse().map(l => ({
          question: l.question,
          timestamp: new Date(l.timestamp).toISOString(),
        })),
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to get stats" });
  }
});

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
