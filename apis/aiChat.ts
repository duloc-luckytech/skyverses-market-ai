/**
 * aiChat.ts — Skyverses AI Chat API client
 * Supports two modes:
 *  - Direct: calls ezaiapi.com directly (used by AISupportChat global widget)
 *  - Proxy:  calls /ai/chat on our own backend (no CORS, API key hidden)
 *            Used by Storyboard Studio and other workspace features.
 */

import { API_BASE_URL, getHeaders } from './config';

// ── Config from env ────────────────────────────────────────────────────────

const EZAI_BASE_URL = import.meta.env.VITE_EZAI_BASE_URL || 'https://ezaiapi.com/v1';
const EZAI_API_KEY  = import.meta.env.VITE_EZAI_API_KEY  || '';
const AI_MODEL      = import.meta.env.VITE_AI_MODEL      || 'claude-sonnet-4-6';

// ── Message content types ──────────────────────────────────────────────────

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageUrlContent {
  type: 'image_url';
  image_url: { url: string };
}

export type MessageContent = string | (TextContent | ImageUrlContent)[];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: MessageContent;
}

export interface AIChatOptions {
  messages: ChatMessage[];
  stream?: boolean;
  onToken?: (token: string) => void; // called per SSE chunk in stream mode
  signal?: AbortSignal;
}

export interface AIChatResult {
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

// ── Internal fetch helper ──────────────────────────────────────────────────

const _chatFetch = async (
  messages: ChatMessage[],
  stream: boolean,
  signal?: AbortSignal,
  maxTokens = 4096,
): Promise<Response> => {
  const response = await fetch(`${EZAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${EZAI_API_KEY}`,
    },
    body: JSON.stringify({ model: AI_MODEL, messages, stream, max_tokens: maxTokens }),
    signal,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || err?.error || `AI Chat HTTP ${response.status}`);
  }
  return response;
};

// ── Robust JSON extractor ──────────────────────────────────────────────────
// Strips markdown fences, then falls back to regex {…} / […] extraction.
const _extractJSON = (raw: string): string => {
  // 1. Strip ```json ... ``` or ``` ... ```
  let s = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  // 2. If still not starting with { or [, find the first occurrence
  if (s[0] !== '{' && s[0] !== '[') {
    const obj = s.match(/\{[\s\S]+\}/);
    const arr = s.match(/\[[\s\S]+\]/);
    if (obj && arr) s = obj.index! <= arr.index! ? obj[0] : arr[0];
    else s = (obj ?? arr)?.[0] ?? s;
  }
  return s;
};

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Single-shot call. Returns response text.
 * Used by: Storyboard Studio (JSON parse), AI planning flows, AISupportChat
 */
export const aiChatOnce = async (
  messages: ChatMessage[],
  signal?: AbortSignal,
  maxTokens = 4096,
): Promise<string> => {
  const response = await _chatFetch(messages, false, signal, maxTokens);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
};

/**
 * Single-shot call supporting multipart content (text + image_url).
 * Used by: AISupportChat global widget (image upload support)
 */
export const aiChatOnceMultipart = aiChatOnce;

/**
 * Streaming call — calls onToken per SSE delta, resolves with full accumulated text.
 * Used by: Storyboard Studio script analysis (live terminal feedback)
 */
export const aiChatStream = async (
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
  maxTokens = 4096,
): Promise<string> => {
  const response = await _chatFetch(messages, true, signal, maxTokens);
  if (!response.body) throw new Error('No response body for streaming');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

      for (const line of lines) {
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') break;
        try {
          const parsed = JSON.parse(payload);
          const token = parsed?.choices?.[0]?.delta?.content ?? '';
          if (token) {
            fullText += token;
            onToken(token);
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
};

/**
 * Helper: call AI once, parse JSON from response.
 * Strips markdown fences + regex fallback — robust against chatty models.
 * Used by: any flow expecting structured JSON output
 */
export const aiChatJSON = async <T = unknown>(
  messages: ChatMessage[],
  signal?: AbortSignal,
  maxTokens = 4096,
): Promise<T> => {
  const raw = await aiChatOnce(messages, signal, maxTokens);
  return JSON.parse(_extractJSON(raw)) as T;
};

// ── Proxy helpers — route through our own backend to avoid CORS + hide API key ──

/**
 * Single-shot call via backend proxy (/ai/chat).
 * Used by: Storyboard Studio (all non-streaming calls)
 */
export const aiChatOnceViaProxy = async (
  messages: ChatMessage[],
  signal?: AbortSignal,
  maxTokens = 4096,
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ messages, stream: false, max_tokens: maxTokens }),
    signal,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || `AI Proxy HTTP ${response.status}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
};

/**
 * Streaming call via backend proxy (/ai/chat stream: true).
 * Pipes SSE chunks to onToken callback, resolves with full accumulated text.
 * Used by: Storyboard Studio (Chat tab, Rewrite tab)
 */
export const aiChatStreamViaProxy = async (
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
  maxTokens = 4096,
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ messages, stream: true, max_tokens: maxTokens }),
    signal,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || `AI Proxy HTTP ${response.status}`);
  }
  if (!response.body) throw new Error('No response body for streaming');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') break;
        try {
          const parsed = JSON.parse(payload);
          const token = parsed?.choices?.[0]?.delta?.content ?? '';
          if (token) {
            fullText += token;
            onToken(token);
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
};
