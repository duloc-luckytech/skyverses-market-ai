/**
 * aiChat.ts — Skyverses AI Chat API client
 * Wraps POST /ai/chat (proxy → ezaiapi.com/v1/chat/completions / claude-sonnet-4-5)
 * Supports: single-shot JSON mode, streaming SSE mode
 * Used by: Storyboard Studio script analysis, AI planning flows, etc.
 */

import { API_BASE_URL, getHeaders } from './config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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

/**
 * Single-shot JSON call. Returns parsed response text.
 */
export const aiChatOnce = async (
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> => {
  const headers = getHeaders() as Record<string, string>;
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: false }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || `AI Chat HTTP ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
};

/**
 * Streaming call — calls onToken per SSE delta, resolves with full accumulated text.
 */
export const aiChatStream = async (
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<string> => {
  const headers = getHeaders() as Record<string, string>;
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: true }),
    signal,
  });

  if (!response.ok || !response.body) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || `AI Chat HTTP ${response.status}`);
  }

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
 * Helper: call AI, parse JSON from response (strips markdown fences).
 */
export const aiChatJSON = async <T = any>(
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<T> => {
  const raw = await aiChatOnce(messages, signal);
  // Strip ```json ... ``` markdown fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  return JSON.parse(cleaned) as T;
};
