// routes/ai.ts
import express from "express";
import OpenAI from "openai";
import { authenticate } from "./auth";
import MetaPromptConfig from "../models/MetaPromptTemplate";
import SystemSetting from "../models/SystemSetting.model";
import { listKeyGommoGenmini } from "../config/keyGenminiGommo";
const router = express.Router();

/* ============================================================
   OLLAMA CLOUD CONFIG — read from SystemSetting DB
   Keys: 'ollama_api_key', 'ollama_base_url', 'ollama_models'
   Fallback: legacy listKeyGommoGenmini + ezaiapi.com (backward compat)
============================================================ */
interface OllamaSettings {
  apiKey?: string;
  baseUrl?: string;
  models?: { id: string; label?: string; isActive?: boolean }[];
}

async function getOllamaSettings(): Promise<OllamaSettings> {
  try {
    const docs = await SystemSetting.find({
      key: { $in: ["ollama_api_key", "ollama_base_url", "ollama_models"] },
    }).lean();
    const map: Record<string, any> = {};
    for (const d of docs) map[d.key] = d.value;
    return {
      apiKey:  typeof map.ollama_api_key === "string" ? map.ollama_api_key : undefined,
      baseUrl: typeof map.ollama_base_url === "string" ? map.ollama_base_url : undefined,
      models:  Array.isArray(map.ollama_models) ? map.ollama_models : undefined,
    };
  } catch (err) {
    console.error("[Ollama] Failed to load settings:", err);
    return {};
  }
}

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
      model: requestedModel,
      max_tokens = 4096,
    } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }

    // ── 1. Load Ollama config từ DB SystemSetting ──
    const ollama = await getOllamaSettings();

    // ── 2. Resolve API key + baseUrl + model ──
    // Ưu tiên Ollama Cloud config từ DB. Fallback EzAI legacy nếu chưa setup (backward compat).
    let apiKey: string | undefined = ollama.apiKey;
    let baseUrl = ollama.baseUrl || "https://ollama.com/v1";
    let model = requestedModel;

    if (!apiKey) {
      // Legacy fallback: random từ listKeyGommoGenmini → ezaiapi.com
      const activeKeys = listKeyGommoGenmini.filter((k: any) => k.isActive && k.key);
      if (activeKeys.length === 0) {
        return res.status(500).json({
          error: "Ollama API key chưa được cấu hình. Vào CMS Admin → AI Provider Settings để thêm key.",
        });
      }
      apiKey = activeKeys[Math.floor(Math.random() * activeKeys.length)].key;
      baseUrl = "https://ezaiapi.com/v1";
      model = model || "claude-sonnet-4-6";
    } else {
      // Ollama Cloud: nếu requested model không có trong whitelist → fallback model đầu tiên active
      if (ollama.models && ollama.models.length > 0) {
        const activeModels = ollama.models.filter(m => m.isActive !== false);
        if (activeModels.length > 0) {
          const found = activeModels.find(m => m.id === requestedModel);
          model = found ? requestedModel : activeModels[0].id;
        }
      }
      // Nếu vẫn không có model → default Ollama Cloud
      if (!model) model = "qwen3.5";
    }

    const apiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
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
   AI Client — Ollama Cloud (lazy, resolved per-request from DB)

   Mirrors the /chat resolution: prefer Ollama Cloud config from
   SystemSetting, fall back to legacy ezaiapi keys for backward
   compat. Built lazily so a missing key never crashes at import.
=============================================================== */
async function getAiClient(): Promise<{ client: OpenAI; model: string }> {
  const ollama = await getOllamaSettings();

  let apiKey: string | undefined = ollama.apiKey;
  let baseUrl = ollama.baseUrl || "https://ollama.com/v1";
  let model: string | undefined;

  if (!apiKey) {
    // Legacy fallback: random key → ezaiapi.com
    const activeKeys = listKeyGommoGenmini.filter((k: any) => k.isActive && k.key);
    if (activeKeys.length === 0) {
      throw new Error(
        "Ollama API key chưa được cấu hình. Vào CMS Admin → AI Provider Settings để thêm key."
      );
    }
    apiKey = activeKeys[Math.floor(Math.random() * activeKeys.length)].key;
    baseUrl = "https://ezaiapi.com/v1";
    model = "claude-sonnet-4-6";
  } else {
    // Ollama Cloud: dùng model active đầu tiên trong whitelist
    if (ollama.models && ollama.models.length > 0) {
      const activeModels = ollama.models.filter(m => m.isActive !== false);
      if (activeModels.length > 0) model = activeModels[0].id;
    }
    if (!model) model = "qwen3.5";
  }

  return { client: new OpenAI({ apiKey, baseURL: baseUrl }), model };
}

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

      const { client, model } = await getAiClient();
      const completion = await client.chat.completions.create({
        model,
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

      const { client, model } = await getAiClient();
      const completion = await client.chat.completions.create({
        model,
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

      const { client, model } = await getAiClient();
      const completion = await client.chat.completions.create({
        model,
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

      const { client: ai, model } = await getAiClient();

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
        model,
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

/* ============================================================
   ADMIN ROUTES — Ollama Cloud Settings (CMS Admin)
   GET  /ai/admin/ollama/settings  — read current config
   PUT  /ai/admin/ollama/settings  — save apiKey + baseUrl + models[]
   POST /ai/admin/ollama/test       — test connection với 1 model
   Auth: admin only
============================================================ */

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};

router.get("/admin/ollama/settings", authenticate, requireAdmin, async (_req, res) => {
  try {
    const settings = await getOllamaSettings();
    return res.json({
      success: true,
      data: {
        apiKey:  settings.apiKey ? maskKey(settings.apiKey) : "",
        hasKey:  !!settings.apiKey,
        baseUrl: settings.baseUrl || "https://ollama.com/v1",
        models:  settings.models || [],
      },
    });
  } catch (err) {
    console.error("[Ollama Admin] GET settings error:", err);
    return res.status(500).json({ error: "Failed to load settings" });
  }
});

router.put("/admin/ollama/settings", authenticate, requireAdmin, async (req, res) => {
  try {
    const { apiKey, baseUrl, models } = req.body;

    const updates: { key: string; value: any }[] = [];
    // Chỉ update apiKey nếu user nhập mới (avoid overwrite bằng masked value)
    if (typeof apiKey === "string" && apiKey.trim() && !apiKey.includes("...")) {
      updates.push({ key: "ollama_api_key", value: apiKey.trim() });
    }
    if (typeof baseUrl === "string") {
      updates.push({ key: "ollama_base_url", value: baseUrl.trim() || "https://ollama.com/v1" });
    }
    if (Array.isArray(models)) {
      // Validate shape: [{id, label?, isActive?}]
      const cleaned = models
        .filter((m: any) => m && typeof m.id === "string" && m.id.trim())
        .map((m: any) => ({
          id:       m.id.trim(),
          label:    typeof m.label === "string" ? m.label.trim() : m.id.trim(),
          isActive: m.isActive !== false,
        }));
      updates.push({ key: "ollama_models", value: cleaned });
    }

    // Upsert tất cả updates vào SystemSetting
    await Promise.all(
      updates.map(u =>
        SystemSetting.updateOne(
          { key: u.key },
          { $set: { value: u.value } },
          { upsert: true }
        )
      )
    );

    return res.json({ success: true, message: "Đã lưu cấu hình Ollama" });
  } catch (err) {
    console.error("[Ollama Admin] PUT settings error:", err);
    return res.status(500).json({ error: "Failed to save settings" });
  }
});

router.post("/admin/ollama/test", authenticate, requireAdmin, async (req, res) => {
  try {
    const { apiKey: testKey, baseUrl: testUrl, model: testModel } = req.body;

    // Nếu không submit key mới → load từ DB
    let apiKey = testKey;
    let baseUrl = testUrl || "https://ollama.com/v1";
    if (!apiKey || apiKey.includes("...")) {
      const cur = await getOllamaSettings();
      apiKey = cur.apiKey;
      baseUrl = testUrl || cur.baseUrl || baseUrl;
    }

    if (!apiKey) return res.status(400).json({ error: "Chưa có API key để test" });
    const model = testModel || "qwen3.5";

    const startedAt = Date.now();
    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 16,
        stream: false,
      }),
    });
    const elapsed = Date.now() - startedAt;

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return res.status(200).json({
        success: false,
        ok: false,
        status: r.status,
        elapsedMs: elapsed,
        error: text.slice(0, 300) || `HTTP ${r.status}`,
      });
    }
    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || "";
    return res.json({
      success: true,
      ok: true,
      status: r.status,
      elapsedMs: elapsed,
      model,
      reply: reply.slice(0, 200),
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      ok: false,
      error: err?.message || "Test failed",
    });
  }
});

// Mask helper — hiển thị partial cho admin biết có key (vd skv_abc...xyz)
function maskKey(key: string): string {
  if (key.length <= 12) return "****";
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

export default router;
