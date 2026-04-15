import { useState, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AgentSkill {
  id: string;
  label: string;
  rule: string;
}

export type AgentTier = 'orchestrator' | 'department' | 'specialist';

export interface CustomAgent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  systemPrompt: string;
  skills: string[];           // skill ids
  model: string;              // 'claude-sonnet' | 'claude-opus'
  brief: string;              // persistent context memo
  tier: AgentTier;
  isDefault: boolean;
  createdAt: string;
  language?: 'vi' | 'en' | 'ko' | 'ja';  // response language override
  temperature?: number;       // 0.0–1.0, creativity level
  maxTokens?: number;         // 512–8192, response length cap
}

// ─── Skill library ──────────────────────────────────────────────────────────────

export const SKILL_LIBRARY: AgentSkill[] = [
  { id: 'strategist',  label: '🎯 Strategist',    rule: 'Think like a board-level strategist. Prioritise long-term value over short-term gain.' },
  { id: 'delegator',   label: '🤝 Delegator',      rule: 'Break every goal into clear, delegatable sub-tasks with owners and deadlines.' },
  { id: 'data-driven', label: '📊 Data-Driven',    rule: 'Back every recommendation with metrics, KPIs, or industry benchmarks.' },
  { id: 'seo',         label: '🔍 SEO Expert',     rule: 'Optimize all content for SEO: target keywords, meta description, internal links, readability score.' },
  { id: 'copywriter',  label: '✍️ Copywriter',      rule: 'Apply AIDA framework (Attention, Interest, Desire, Action) in all copy.' },
  { id: 'social',      label: '📱 Social Media',    rule: 'Tailor tone for each platform: LinkedIn (professional), X (concise), Facebook (friendly).' },
  { id: 'analytics',   label: '📈 Analytics',       rule: 'Include measurable KPIs and A/B test hypotheses in every campaign plan.' },
  { id: 'security',    label: '🔒 Security',        rule: 'Apply OWASP top-10 security checks to every code review and pipeline step.' },
  { id: 'perf',        label: '⚡ Performance',     rule: 'Benchmark before and after every change. Target p95 latency improvements.' },
  { id: 'iac',         label: '🏗️ IaC',             rule: 'Prefer Infrastructure-as-Code (Terraform / Helm) over manual steps.' },
  { id: 'closer',      label: '💰 Closer',          rule: 'Use SPIN selling technique. Focus on Pain → Impact → Need-Payoff.' },
  { id: 'crm',         label: '🗂️ CRM Expert',       rule: 'Structure all outputs as CRM-importable fields (Name, Company, Stage, Next Action).' },
  { id: 'dei',         label: '🌍 DEI',             rule: 'Ensure all job descriptions and policies are inclusive and DEI-compliant.' },
  { id: 'legal',       label: '⚖️ Legal Safe',      rule: 'Flag any language that could create legal liability. Suggest legally safe alternatives.' },
  { id: 'researcher',  label: '🔬 Researcher',      rule: 'Always cite sources and evidence. Prioritise peer-reviewed and primary sources.' },
  { id: 'creative',    label: '🎨 Creative',        rule: 'Apply Design Thinking framework. Start with empathy, end with tested prototypes.' },
  { id: 'lean',        label: '⚙️ Lean/6-Sigma',    rule: 'Apply DMAIC cycle to identify waste and optimize processes.' },
  { id: 'finance',     label: '💹 Finance',         rule: 'Include ROI, NPV, and payback period in every investment recommendation.' },
];

// ─── Default agents (seeded from DEPARTMENTS) ─────────────────────────────────

const DEFAULT_AGENTS: CustomAgent[] = [
  {
    id: 'default-ceo',
    name: 'CEO Agent',
    role: 'Chief Executive Officer',
    emoji: '🏢',
    color: '#0090ff',
    tier: 'orchestrator',
    isDefault: true,
    model: 'claude-opus',
    brief: '',
    skills: ['strategist', 'delegator', 'data-driven'],
    systemPrompt: `You are the CEO Agent — a strategic orchestrator who delegates tasks across departments.
Your role: analyze business objectives, break them into actionable sub-tasks, assign to the right team, and synthesize outcomes into executive reports.
Always think long-term (3-5 years), back decisions with data, and communicate with clarity and authority.`,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'default-marketing',
    name: 'Marketing AI',
    role: 'Head of Marketing',
    emoji: '📣',
    color: '#8b5cf6',
    tier: 'department',
    isDefault: true,
    model: 'claude-sonnet',
    brief: '',
    skills: ['seo', 'copywriter', 'social', 'analytics'],
    systemPrompt: `You are the Marketing Agent — an expert in content creation, SEO, and digital campaigns.
You create high-converting copy, plan social media calendars, write SEO-optimized blog posts, and analyze campaign performance.
Always apply AIDA framework, include target keywords, and provide measurable KPIs for every campaign.`,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'default-devops',
    name: 'DevOps AI',
    role: 'Head of Engineering',
    emoji: '⚙️',
    color: '#10b981',
    tier: 'department',
    isDefault: true,
    model: 'claude-sonnet',
    brief: '',
    skills: ['security', 'perf', 'iac'],
    systemPrompt: `You are the DevOps Agent — a senior engineer specializing in CI/CD, cloud infrastructure, and code quality.
You review code for security and performance, design automated pipelines, write Infrastructure-as-Code in Terraform/Helm, and produce detailed technical documentation.
Always follow OWASP top-10, provide benchmark numbers, and include rollback strategies.`,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'default-sales',
    name: 'Sales AI',
    role: 'Head of Sales',
    emoji: '💼',
    color: '#f59e0b',
    tier: 'department',
    isDefault: true,
    model: 'claude-sonnet',
    brief: '',
    skills: ['closer', 'crm'],
    systemPrompt: `You are the Sales Agent — a revenue-focused closer specialized in B2B outreach and deal management.
You craft personalized email sequences, build ICP profiles, analyze deal pipelines, and write high-converting proposals.
Use SPIN selling technique. Structure all outputs as CRM-ready fields with clear next actions.`,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'default-hr',
    name: 'HR AI',
    role: 'Head of People',
    emoji: '👥',
    color: '#06b6d4',
    tier: 'department',
    isDefault: true,
    model: 'claude-sonnet',
    brief: '',
    skills: ['dei', 'legal'],
    systemPrompt: `You are the HR Agent — an expert in talent acquisition, employee experience, and people operations.
You write inclusive job descriptions, screen candidates, draft onboarding materials, and create HR policies.
Always ensure DEI compliance, flag legal risks, and apply an employee-first tone.`,
    createdAt: new Date(0).toISOString(),
  },
];

// ─── Storage key ───────────────────────────────────────────────────────────────

const REGISTRY_KEY = 'skyverses_agent_registry_v1';

function loadAgents(): CustomAgent[] {
  try {
    const stored = localStorage.getItem(REGISTRY_KEY);
    if (!stored) return DEFAULT_AGENTS;
    const parsed: CustomAgent[] = JSON.parse(stored);
    // Merge: keep defaults for IDs not stored, merge custom on top
    const storedIds = new Set(parsed.map(a => a.id));
    const defaults = DEFAULT_AGENTS.filter(d => !storedIds.has(d.id));
    return [...defaults, ...parsed];
  } catch {
    return DEFAULT_AGENTS;
  }
}

function saveAgents(agents: CustomAgent[]) {
  try {
    // Only persist non-defaults (or modified defaults) to save space
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(agents));
  } catch { /* ignore */ }
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentRegistry() {
  const [agents, setAgents] = useState<CustomAgent[]>(loadAgents);

  const persist = useCallback((next: CustomAgent[] | ((prev: CustomAgent[]) => CustomAgent[])) => {
    setAgents(prev => {
      const result = typeof next === 'function' ? next(prev) : next;
      saveAgents(result);
      return result;
    });
  }, []);

  const addAgent = useCallback((agent: Omit<CustomAgent, 'id' | 'createdAt' | 'isDefault'>) => {
    const newAgent: CustomAgent = {
      ...agent,
      id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      isDefault: false,
    };
    persist(prev => [...prev, newAgent]);
    return newAgent;
  }, [persist]);

  const updateAgent = useCallback((id: string, patch: Partial<CustomAgent>) => {
    persist(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }, [persist]);

  const deleteAgent = useCallback((id: string) => {
    persist(prev => prev.filter(a => a.id !== id));
  }, [persist]);

  const duplicateAgent = useCallback((id: string) => {
    const original = agents.find(a => a.id === id);
    if (!original) return;
    const clone: CustomAgent = {
      ...original,
      id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${original.name} (copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    persist(prev => [...prev, clone]);
  }, [agents, persist]);

  return {
    agents,
    addAgent,
    updateAgent,
    deleteAgent,
    duplicateAgent,
  };
}
