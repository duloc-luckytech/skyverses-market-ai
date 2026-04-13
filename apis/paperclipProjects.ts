/**
 * paperclipProjects.ts — Frontend API layer for Paperclip AI Agent Projects
 * All calls go through the backend proxy (API_BASE_URL + Authorization header).
 */

import { API_BASE_URL, getHeaders } from './config';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ITaskResult {
  id: string;
  dept: string;
  prompt: string;
  output: string;
  status: 'done' | 'error';
  timestamp: string;
}

export interface AgentConfig {
  deptId: string;
  brief: string;
  enabledSkills: string[];
}

export interface Thread {
  deptId: string;
  messages: { role: string; content: string }[];
}

export interface PaperclipProjectSummary {
  _id: string;
  name: string;
  budgetLimit: number;
  activeModel: string;
  activeDept: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaperclipProject extends PaperclipProjectSummary {
  agentConfigs: AgentConfig[];
  conversationThreads: Thread[];
  taskHistory: ITaskResult[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

const BASE = `${API_BASE_URL}/paperclip-projects`;

async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...getHeaders(), ...(init.headers as Record<string, string> ?? {}) },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || `API error ${res.status}`);
  }
  return json.data as T;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * List all projects for the authenticated user (lightweight — no threads/history).
 */
export const listProjects = (): Promise<PaperclipProjectSummary[]> =>
  apiFetch<PaperclipProjectSummary[]>(BASE);

/**
 * Fetch a single project with full data (agentConfigs, threads, taskHistory).
 */
export const getProject = (id: string): Promise<PaperclipProject> =>
  apiFetch<PaperclipProject>(`${BASE}/${id}`);

/**
 * Create a new project with the given name.
 */
export const createProject = (name: string): Promise<PaperclipProject> =>
  apiFetch<PaperclipProject>(BASE, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

/**
 * Update project meta fields (name, budgetLimit, activeModel, activeDept, isDefault).
 */
export const updateProject = (
  id: string,
  updates: Partial<PaperclipProjectSummary>,
): Promise<PaperclipProjectSummary> =>
  apiFetch<PaperclipProjectSummary>(`${BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

/**
 * Hard-delete a project.
 */
export const deleteProject = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || `Delete failed ${res.status}`);
  }
};

/**
 * Replace agentConfigs[] for a project (PUT — full replace).
 */
export const saveAgentConfigs = async (
  id: string,
  configs: AgentConfig[],
): Promise<void> => {
  const res = await fetch(`${BASE}/${id}/agents`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ configs }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || `saveAgentConfigs failed ${res.status}`);
  }
};

/**
 * Replace conversationThreads[] for a project (PUT — full replace).
 */
export const saveThreads = async (
  id: string,
  threads: Thread[],
): Promise<void> => {
  const res = await fetch(`${BASE}/${id}/threads`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ threads }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || `saveThreads failed ${res.status}`);
  }
};

/**
 * Append a single task result to the project's history (newest-first, capped at 50).
 */
export const appendTaskResult = async (
  id: string,
  result: ITaskResult,
): Promise<void> => {
  const res = await fetch(`${BASE}/${id}/history`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ result }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || `appendTaskResult failed ${res.status}`);
  }
};
