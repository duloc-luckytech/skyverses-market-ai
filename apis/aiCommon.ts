/**
 * aiCommon.ts — Skyverses AI Common Helpers
 *
 * ONE-STOP reference cho tất cả AI calls trong workspaces.
 * Import từ đây thay vì import trực tiếp từ aiChat.ts hay services/gemini.ts.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Khi nào dùng function nào?                                             │
 * │                                                                         │
 * │  aiTextViaProxy(prompt, systemRole)      → text output đơn giản        │
 * │  aiChatStreamViaProxy(messages, onToken) → stream live (UX tốt hơn)   │
 * │  aiChatJSONViaProxy<T>(messages)         → structured JSON + typed     │
 * │  buildSystemMessage({ role, rules })     → tái sử dụng system prompt   │
 * │  parseAIJSON<T>(rawString)               → parse khi raw text có sẵn   │
 * │                                                                         │
 * │  generateDemoText (services/gemini.ts) → CHỈ dùng landing/mock data.  │
 * │  Workspace production luôn đi qua proxy để ẩn API key.                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

// ── Re-exports từ aiChat.ts ────────────────────────────────────────────────
// Workspace chỉ cần import 1 file này, không cần biết aiChat.ts tồn tại.

export {
  aiChatOnceViaProxy,
  aiChatStreamViaProxy,
  aiChatOnce,
  aiChatStream,
} from './aiChat';

export type {
  ChatMessage,
  AIChatOptions,
  AIChatResult,
  TextContent,
  ImageUrlContent,
  MessageContent,
} from './aiChat';

// ── Imports để dùng nội bộ ─────────────────────────────────────────────────
import { aiChatOnceViaProxy } from './aiChat';
import type { ChatMessage } from './aiChat';

// ── Language map ───────────────────────────────────────────────────────────
const LANG_MAP: Record<string, string> = {
  vi: 'Vietnamese',
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
};

// ── 1. parseAIJSON ─────────────────────────────────────────────────────────

/**
 * Robust JSON parser cho AI responses.
 *
 * Handles:
 * - Markdown fences: ```json ... ``` hoặc ``` ... ```
 * - Control characters (\u0000–\u001F) gây JSON.parse fail
 * - Regex fallback tìm {…} hoặc […] trong garbage text
 *
 * @throws {Error} nếu không parse được, kèm raw string trong message
 *
 * @example
 * const result = parseAIJSON<{ title: string }>('```json\n{"title":"hello"}\n```');
 */
export const parseAIJSON = <T = unknown>(raw: string): T => {
  // 1. Strip markdown fences
  let s = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  // 2. Strip non-printable control chars (preserve \n \r \t)
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  // 3. If still not starting with { or [, find first occurrence via regex
  if (s[0] !== '{' && s[0] !== '[') {
    const obj = s.match(/\{[\s\S]+\}/);
    const arr = s.match(/\[[\s\S]+\]/);
    if (obj && arr) {
      s = obj.index! <= arr.index! ? obj[0] : arr[0];
    } else {
      s = (obj ?? arr)?.[0] ?? s;
    }
  }

  try {
    return JSON.parse(s) as T;
  } catch {
    throw new Error(
      `[aiCommon] parseAIJSON failed. Raw response (first 300 chars):\n${raw.slice(0, 300)}`
    );
  }
};

// ── 2. aiChatJSONViaProxy ──────────────────────────────────────────────────

/**
 * Gọi AI qua backend proxy, auto-parse response thành typed JSON.
 * Dùng khi workspace cần structured output và API key phải ẩn (production).
 *
 * @example
 * interface BriefResult { headline: string; body: string; hashtags: string[] }
 *
 * const result = await aiChatJSONViaProxy<BriefResult>([
 *   buildSystemMessage({ role: 'You are a copywriter.', outputFormat: 'Return JSON: {headline, body, hashtags}' }),
 *   { role: 'user', content: 'Write a brief for product X' },
 * ]);
 * console.log(result.headline); // typed ✓
 */
export const aiChatJSONViaProxy = async <T = unknown>(
  messages: ChatMessage[],
  signal?: AbortSignal,
  maxTokens = 4096,
): Promise<T> => {
  const raw = await aiChatOnceViaProxy(messages, signal, maxTokens);
  return parseAIJSON<T>(raw);
};

// ── 3. buildSystemMessage ──────────────────────────────────────────────────

export interface SystemPromptOpts {
  /** Core role instruction, e.g. "You are a Marketing AI agent for Skyverses." */
  role: string;
  /** Constraint rules, e.g. ["Respond in Vietnamese", "Max 200 words"] */
  rules?: string[];
  /** Output format spec, e.g. 'Return JSON: { title: string, body: string }' */
  outputFormat?: string;
  /** Force response language */
  language?: 'vi' | 'en' | 'ko' | 'ja';
}

/**
 * Builds a well-structured system ChatMessage from structured options.
 * Tái sử dụng across workspaces — không hardcode system prompts inline nữa.
 *
 * @example
 * const sys = buildSystemMessage({
 *   role: 'You are a DevOps AI agent.',
 *   rules: ['Be concise', 'Use bullet points'],
 *   outputFormat: 'Return plain text steps, numbered.',
 *   language: 'vi',
 * });
 * // sys.content = "You are a DevOps AI agent.\n\nRULES:\n- Be concise\n- Use bullet points\n\nOUTPUT FORMAT:\nReturn plain text steps...\n\nLANGUAGE: Respond in Vietnamese"
 */
export const buildSystemMessage = (opts: SystemPromptOpts): ChatMessage => {
  const parts: string[] = [opts.role.trim()];

  if (opts.rules && opts.rules.length > 0) {
    parts.push(`RULES:\n${opts.rules.map(r => `- ${r}`).join('\n')}`);
  }

  if (opts.outputFormat) {
    parts.push(`OUTPUT FORMAT:\n${opts.outputFormat.trim()}`);
  }

  if (opts.language && LANG_MAP[opts.language]) {
    parts.push(`LANGUAGE: Respond in ${LANG_MAP[opts.language]}`);
  }

  return {
    role: 'system',
    content: parts.join('\n\n'),
  };
};

// ── 4. aiTextViaProxy ──────────────────────────────────────────────────────

/**
 * Shorthand: text generation qua proxy — không cần build messages array.
 * Dùng cho các trường hợp đơn giản: 1 system role + 1 user prompt → plain text.
 *
 * @example
 * const output = await aiTextViaProxy(
 *   'Viết 3 bullet points giới thiệu sản phẩm X',
 *   'You are a Marketing AI. Respond in Vietnamese.',
 * );
 */
export const aiTextViaProxy = async (
  prompt: string,
  systemRole = 'You are a helpful AI assistant.',
  signal?: AbortSignal,
  maxTokens = 4096,
): Promise<string> => {
  return aiChatOnceViaProxy(
    [
      { role: 'system', content: systemRole },
      { role: 'user', content: prompt },
    ],
    signal,
    maxTokens,
  );
};

// ── 5. aiStreamTextViaProxy ────────────────────────────────────────────────

/**
 * Shorthand: streaming text via proxy — shortcut của aiChatStreamViaProxy.
 * Dùng khi muốn live token streaming với UX tốt hơn, không cần build messages.
 *
 * @example
 * const full = await aiStreamTextViaProxy(
 *   'Phân tích chiến lược marketing quý 4',
 *   'You are a Marketing AI.',
 *   (token) => setOutput(prev => prev + token),
 * );
 */
export { aiChatStreamViaProxy as aiStreamTextViaProxy } from './aiChat';
