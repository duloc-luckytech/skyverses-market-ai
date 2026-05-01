import { API_BASE_URL, getHeaders } from './config';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OllamaModel {
  id: string;        // model ID gửi lên Ollama (vd: "qwen3.5", "deepseek-v3")
  label?: string;    // Tên hiển thị trong CMS (vd: "Qwen 3.5 — fast")
  isActive?: boolean;
}

export interface OllamaSettings {
  apiKey: string;     // Masked dạng "skv_xxxxxx...abcd" khi GET, plain text khi PUT
  hasKey: boolean;    // true nếu DB đã có key
  baseUrl: string;    // 'https://ollama.com/v1'
  models: OllamaModel[];
}

export interface OllamaTestResult {
  success: boolean;
  ok: boolean;
  status?: number;
  elapsedMs?: number;
  model?: string;
  reply?: string;
  error?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const ollamaSettingsApi = {
  /** Load current settings (apiKey is masked) */
  async get(): Promise<OllamaSettings> {
    const r = await fetch(`${API_BASE_URL}/ai/admin/ollama/settings`, {
      headers: getHeaders(),
    });
    if (!r.ok) throw new Error(`Load settings failed: ${r.status}`);
    const json = await r.json();
    return json.data as OllamaSettings;
  },

  /** Save settings. Truyền apiKey rỗng nếu không muốn đổi key. */
  async update(payload: {
    apiKey?: string;       // bỏ qua hoặc rỗng = giữ nguyên
    baseUrl?: string;
    models?: OllamaModel[];
  }): Promise<{ success: boolean; message?: string }> {
    const r = await fetch(`${API_BASE_URL}/ai/admin/ollama/settings`, {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`Save failed: ${r.status}`);
    return r.json();
  },

  /** Test connection — gọi /chat/completions với prompt "ping" */
  async test(payload: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  }): Promise<OllamaTestResult> {
    const r = await fetch(`${API_BASE_URL}/ai/admin/ollama/test`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return r.json();
  },
};
