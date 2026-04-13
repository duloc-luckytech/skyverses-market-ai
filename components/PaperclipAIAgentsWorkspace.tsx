import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, ChevronDown, ChevronRight, Coins,
  Network, Building2, Code2, Megaphone, Users, BarChart3,
  Cpu, CheckCircle2, Clock, AlertCircle, Play, Loader2,
  History, Trash2, Bot, Activity, RefreshCw, ExternalLink,
  ShieldCheck, DollarSign, Zap, Copy, Download, GitBranch,
  Eye, Terminal, TrendingUp, Settings, ChevronUp, Plus,
  ArrowRight, Layers, Workflow, Star, HelpCircle, Share2, Pencil,
  MessageCircle, Send, User,
} from 'lucide-react';
import { aiChatStreamViaProxy, AI_MODELS, buildSystemMessage } from '../apis/aiCommon';
import type { ChatMessage } from '../apis/aiCommon';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import AISuggestPanel, { StylePreset } from './workspace/AISuggestPanel';
import OnboardingWizard from './PaperclipAIAgentsWizard';
import type { WizardResult } from './PaperclipAIAgentsWizard';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_vault';
const THREAD_KEY = (deptId: string) => `${STORAGE_KEY}_thread_${deptId}`;
const MAX_THREAD_TURNS = 10; // giữ tối đa 10 turns (20 messages: 10 user + 10 assistant)
const BRIEF_KEY  = (deptId: string) => `${STORAGE_KEY}_brief_${deptId}`;
const SKILLS_KEY = (deptId: string) => `${STORAGE_KEY}_skills_${deptId}`;
const WIZARD_KEY   = 'skyverses_PAPERCLIP-AI-AGENTS_wizard_done';
const ADVANCED_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_advanced';

// Skill presets per department
const DEPT_SKILLS: Record<string, Array<{ id: string; label: string; rule: string }>> = {
  ceo: [
    { id: 'strategist',  label: '🎯 Strategist',    rule: 'Think like a board-level strategist. Prioritise long-term value over short-term gain.' },
    { id: 'delegator',   label: '🤝 Delegator',      rule: 'Break every goal into clear, delegatable sub-tasks with owners and deadlines.' },
    { id: 'data-driven', label: '📊 Data-Driven',    rule: 'Back every recommendation with metrics, KPIs, or industry benchmarks.' },
  ],
  marketing: [
    { id: 'seo',        label: '🔍 SEO Expert',     rule: 'Optimize all content for SEO: target keywords, meta description, internal links, readability score.' },
    { id: 'copywriter', label: '✍️ Copywriter',      rule: 'Apply AIDA framework (Attention, Interest, Desire, Action) in all copy.' },
    { id: 'social',     label: '📱 Social Media',    rule: 'Tailor tone for each platform: LinkedIn (professional), X (concise), Facebook (friendly).' },
    { id: 'analytics',  label: '📈 Analytics',       rule: 'Include measurable KPIs and A/B test hypotheses in every campaign plan.' },
  ],
  devops: [
    { id: 'security', label: '🔒 Security',    rule: 'Apply OWASP top-10 security checks to every code review and pipeline step.' },
    { id: 'perf',     label: '⚡ Performance', rule: 'Benchmark before and after every change. Target p95 latency improvements.' },
    { id: 'iac',      label: '🏗️ IaC',          rule: 'Prefer Infrastructure-as-Code (Terraform / Helm) over manual steps.' },
    { id: 'docs',     label: '📚 Docs',         rule: 'Every code change must include updated documentation and changelog.' },
  ],
  sales: [
    { id: 'closer',  label: '💰 Closer',          rule: 'Use SPIN selling technique. Focus on Pain → Impact → Need-Payoff.' },
    { id: 'crm',     label: '🗂️ CRM Expert',       rule: 'Structure all outputs as CRM-importable fields (Name, Company, Stage, Next Action).' },
    { id: 'persona', label: '🎭 Persona Builder',  rule: 'Define ICP (Ideal Customer Profile) for each campaign segment.' },
  ],
  hr: [
    { id: 'dei',        label: '🌍 DEI',         rule: 'Ensure all job descriptions and policies are inclusive and DEI-compliant.' },
    { id: 'legal',      label: '⚖️ Legal Safe',  rule: 'Flag any language that could create legal liability. Suggest legally safe alternatives.' },
    { id: 'engagement', label: '💬 Engagement',  rule: 'Apply employee-first tone. Prioritize psychological safety and clarity.' },
  ],
};

const THINKING_STEPS = [
  '🧠 Phân tích yêu cầu...',
  '📋 Xây dựng kế hoạch...',
  '🔍 Research context...',
  '⚡ Tạo nội dung...',
  '✅ Kiểm tra chất lượng...',
  '📦 Format kết quả...',
];

const DEPARTMENTS = [
  {
    id: 'ceo',
    label: 'CEO Agent',
    icon: Building2,
    color: '#0090ff',
    agent: 'CEO Agent',
    tier: 'orchestrator',
    tasks: ['Delegate tasks to team', 'Strategic brief', 'Org-wide report', 'Budget review'],
    subordinates: ['marketing', 'devops', 'sales', 'hr'],
  },
  {
    id: 'marketing',
    label: 'Marketing AI',
    icon: Megaphone,
    color: '#8b5cf6',
    agent: 'Marketing Agent',
    tier: 'department',
    tasks: ['Viết content SEO', 'Social media posts', 'Email campaign', 'Competitor analysis'],
    subordinates: [],
  },
  {
    id: 'devops',
    label: 'DevOps AI',
    icon: Code2,
    color: '#10b981',
    agent: 'DevOps Agent',
    tier: 'department',
    tasks: ['CI/CD pipeline', 'Code review', 'Deploy automation', 'Performance audit'],
    subordinates: [],
  },
  {
    id: 'sales',
    label: 'Sales AI',
    icon: BarChart3,
    color: '#f59e0b',
    agent: 'Sales Agent',
    tier: 'department',
    tasks: ['Lead outreach', 'CRM follow-up', 'Proposal drafting', 'Deal analysis'],
    subordinates: [],
  },
  {
    id: 'hr',
    label: 'HR AI',
    icon: Users,
    color: '#06b6d4',
    agent: 'HR Agent',
    tier: 'department',
    tasks: ['Job description', 'Screening filter', 'Onboarding docs', 'Policy drafts'],
    subordinates: [],
  },
];

const LLM_MODELS = [
  { id: 'claude-sonnet', label: 'Claude Sonnet 4', provider: 'Anthropic', badge: 'Fast & Balanced', color: '#f97316', apiModel: AI_MODELS.SONNET },
  { id: 'claude-opus',   label: 'Claude Opus 4',   provider: 'Anthropic', badge: 'Most Powerful',   color: '#8b5cf6', apiModel: AI_MODELS.OPUS   },
];

const TASK_TEMPLATES: StylePreset[] = [
  { id: 'blog-seo',     label: 'Blog SEO',      emoji: '✍️', description: 'Viết 3 blog posts SEO',     promptPrefix: 'Viết 3 blog posts SEO tối ưu về chủ đề: ' },
  { id: 'social-batch', label: 'Social Batch',  emoji: '📱', description: '30 posts LinkedIn + X',      promptPrefix: 'Tạo 30 social media posts cho LinkedIn và X về: ' },
  { id: 'ci-refactor',  label: 'CI/CD',          emoji: '⚙️', description: 'Refactor pipeline',         promptPrefix: 'Phân tích và refactor CI/CD pipeline: ' },
  { id: 'lead-outreach', label: 'Lead Outreach', emoji: '📧', description: 'Email sequence 5 bước',     promptPrefix: 'Tạo email outreach sequence 5 bước cho: ' },
  { id: 'competitor',   label: 'Competitor',    emoji: '🔍', description: 'Phân tích 10 đối thủ',       promptPrefix: 'Research và phân tích 10 competitor trong lĩnh vực: ' },
  { id: 'api-docs',     label: 'API Docs',      emoji: '📚', description: 'Generate API documentation', promptPrefix: 'Generate OpenAPI documentation cho: ' },
];

const FEATURED_TEMPLATES = [
  { label: 'Launch Blog Campaign',    prompt: 'Viết 5 blog posts SEO về AI automation cho doanh nghiệp vừa và nhỏ, mỗi bài 1200 từ, có meta description và internal linking strategy', style: 'Blog SEO' },
  { label: 'Full Social Media Month', prompt: 'Tạo 30 posts social media cho tháng tới: 10 LinkedIn, 10 X, 10 Facebook về chủ đề AI productivity, consistent brand voice, hashtags optimized', style: 'Social Batch' },
  { label: 'DevOps Pipeline Audit',   prompt: 'Audit toàn bộ GitHub Actions workflow, identify bottlenecks, đề xuất cải thiện để giảm build time, tạo báo cáo chi tiết', style: 'CI/CD' },
  { label: 'Sales Outreach Q2',       prompt: 'Tạo personalized email sequence 5 bước cho 50 leads trong CRM, track open rate metrics, auto-follow-up trigger conditions', style: 'Lead Outreach' },
];

// Live activity log entries
interface ActivityLog {
  id: string;
  time: string;
  agent: string;
  action: string;
  status: 'info' | 'success' | 'warning' | 'running';
  color: string;
}

type TaskStatus = 'idle' | 'running' | 'done' | 'error';

interface TaskResult {
  id: string;
  dept: string;
  model: string;
  taskDesc: string;
  output: string;
  status: TaskStatus;
  timestamp: string;
  cost: string;
  duration?: string;
  tokens?: number;
  systemPrompt?: string;
  confidence?: number;
  starred?: boolean;
}

interface CanvasNodeState {
  id: string;
  x: number;
  y: number;
  status: 'idle' | 'running' | 'done' | 'error';
  output: string;
  streaming: boolean;
}

// ─── Streaming Markdown Renderer ─────────────────────────────────────────────

const StreamingMarkdownOutput: React.FC<{ content: string; streaming?: boolean }> = ({ content, streaming = false }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!streaming || !content) {
      setDisplayed(content);
      setDone(true);
      return;
    }
    // Reset
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    const CHARS_PER_FRAME = 6; // speed: ~360 chars/s at 60fps
    const step = () => {
      indexRef.current = Math.min(indexRef.current + CHARS_PER_FRAME, content.length);
      setDisplayed(content.slice(0, indexRef.current));
      if (indexRef.current < content.length) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDone(true);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [content, streaming]);

  return (
    <div className="relative">
      <MarkdownOutput content={displayed} />
      {streaming && !done && (
        <span className="inline-block w-0.5 h-3.5 bg-brand-blue ml-0.5 animate-pulse align-middle" />
      )}
    </div>
  );
};

// ─── Markdown Renderer (with syntax-highlighted code blocks) ─────────────────

const MarkdownOutput: React.FC<{ content: string }> = ({ content }) => {
  const [copiedBlock, setCopiedBlock] = useState<number | null>(null);

  const copyBlock = (code: string, idx: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedBlock(idx);
      setTimeout(() => setCopiedBlock(null), 2000);
    });
  };

  // Parse content into segments: text blocks and code blocks
  type Segment = { type: 'text'; content: string } | { type: 'code'; lang: string; code: string; idx: number };
  const segments: Segment[] = [];
  let codeBlockIdx = 0;
  let lastIndex = 0;
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', lang: match[1] || 'plaintext', code: match[2], idx: codeBlockIdx++ });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) });
  }

  const renderText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-[14px] font-bold mt-4 mb-1 text-slate-800 dark:text-white border-b border-black/[0.06] dark:border-white/[0.06] pb-1">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={i} className="text-[16px] font-bold mt-4 mb-2 text-slate-900 dark:text-white">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="text-[13px] font-semibold mt-3 mb-1 text-slate-800 dark:text-white/90">
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} className="flex items-start gap-2 pl-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-blue/60 mt-1.5 shrink-0" />
            <span>{line.slice(2)}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\./)?.[1];
        return (
          <div key={i} className="flex items-start gap-2 pl-2">
            <span className="text-[10px] font-bold text-brand-blue w-4 text-right mt-0.5 shrink-0">{num}.</span>
            <span>{line.replace(/^\d+\.\s/, '')}</span>
          </div>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold">{line.slice(2, -2)}</p>;
      }
      if (line === '') {
        return <div key={i} className="h-2" />;
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    });
  };

  return (
    <div className="space-y-1 text-[12px] leading-relaxed text-slate-700 dark:text-white/80 font-sans">
      {segments.map((seg, segIdx) => {
        if (seg.type === 'code') {
          return (
            <div key={segIdx} className="rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] my-3">
              {/* Code block header */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 dark:bg-[#1a1a1e]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">{seg.lang}</span>
                </div>
                <button
                  onClick={() => copyBlock(seg.code, seg.idx)}
                  className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-white/10"
                >
                  {copiedBlock === seg.idx ? (
                    <><CheckCircle2 size={9} className="text-emerald-400" /> Copied!</>
                  ) : (
                    <><Copy size={9} /> Copy</>
                  )}
                </button>
              </div>
              {/* Code content */}
              <pre className="p-4 text-[11px] leading-relaxed font-mono text-emerald-300 dark:text-emerald-200 bg-slate-900 dark:bg-[#0d0d0f] overflow-x-auto whitespace-pre">
                {seg.code}
              </pre>
            </div>
          );
        }
        return (
          <div key={segIdx}>
            {renderText(seg.content)}
          </div>
        );
      })}
    </div>
  );
};

// ─── Org Chart mini-view ──────────────────────────────────────────────────────

const OrgChartMini: React.FC<{ activeDeptId: string; runningDepts: string[] }> = ({ activeDeptId, runningDepts }) => {
  const ceo = DEPARTMENTS.find(d => d.id === 'ceo')!;
  const depts = DEPARTMENTS.filter(d => d.id !== 'ceo');

  return (
    <div className="p-3 space-y-2">
      {/* CEO node */}
      <div className="flex justify-center">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
            activeDeptId === 'ceo'
              ? 'bg-brand-blue/15 border-brand-blue/50 text-brand-blue shadow-sm shadow-brand-blue/20'
              : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.07] dark:border-white/[0.07] text-slate-600 dark:text-white/60'
          }`}
        >
          <Building2 size={11} />
          CEO Agent
          {runningDepts.includes('ceo') && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-brand-blue"
            />
          )}
        </div>
      </div>

      {/* Connector */}
      <div className="flex justify-center">
        <div className="w-px h-3 bg-gradient-to-b from-brand-blue/40 to-transparent" />
      </div>

      {/* Horizontal line */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-x-8 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
        <div className="flex items-center gap-2 relative">
          {depts.map((d) => (
            <div key={d.id} className="flex flex-col items-center gap-1">
              <div className="w-px h-3 bg-slate-200 dark:bg-white/10" />
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-semibold transition-all ${
                  activeDeptId === d.id
                    ? 'border-current shadow-sm'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-500 dark:text-[#555]'
                }`}
                style={activeDeptId === d.id ? {
                  backgroundColor: `${d.color}15`,
                  borderColor: `${d.color}50`,
                  color: d.color,
                } : {}}
              >
                <d.icon size={9} />
                {d.label.replace(' AI', '').replace(' Agent', '')}
                {runningDepts.includes(d.id) && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0.3, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1 h-1 rounded-full bg-current"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Budget Meter ─────────────────────────────────────────────────────────────

const BudgetMeter: React.FC<{ limit: number; spent: number }> = ({ limit, spent }) => {
  const pct = Math.min((spent / limit) * 100, 100);
  const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[9px] font-semibold">
        <span className="flex items-center gap-1 text-slate-500 dark:text-[#555]">
          <ShieldCheck size={9} className="text-emerald-500" />
          Budget Guard
        </span>
        <span style={{ color }}>
          ${spent.toFixed(2)} / ${limit.toFixed(2)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.05] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// ─── Live Activity Feed ───────────────────────────────────────────────────────

const ActivityFeed: React.FC<{ logs: ActivityLog[] }> = ({ logs }) => (
  <div className="space-y-1">
    <AnimatePresence initial={false}>
      {logs.slice(0, 8).map(log => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: -8, height: 0 }}
          animate={{ opacity: 1, x: 0, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-2 py-1"
        >
          <div
            className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
            style={{ backgroundColor: log.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[9px] font-bold shrink-0" style={{ color: log.color }}>{log.agent}</span>
              <span className="text-[9px] text-slate-500 dark:text-[#555] truncate">{log.action}</span>
            </div>
          </div>
          <span className="text-[8px] text-slate-300 dark:text-[#444] shrink-0">{log.time}</span>
        </motion.div>
      ))}
    </AnimatePresence>
    {logs.length === 0 && (
      <p className="text-[9px] text-slate-400 dark:text-[#555] py-2 text-center">Chưa có activity</p>
    )}
  </div>
);

// ─── Metric Card ──────────────────────────────────────────────────────────────

const MetricCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  trend?: 'up' | 'down' | 'flat';
}> = ({ icon: Icon, label, value, sub, color = '#0090ff', trend }) => (
  <div className="flex-1 min-w-0 p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
    <div className="flex items-start justify-between gap-1 mb-1.5">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
        <Icon size={12} style={{ color }} />
      </div>
      {trend && (
        <div className={`text-[8px] font-bold flex items-center gap-0.5 ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </div>
      )}
    </div>
    <p className="text-[13px] font-black text-slate-800 dark:text-white truncate">{value}</p>
    <p className="text-[9px] text-slate-400 dark:text-[#555] mt-0.5 truncate">{label}</p>
    {sub && <p className="text-[8px] text-slate-300 dark:text-[#333] truncate">{sub}</p>}
  </div>
);

const FOLLOW_UP_MAP: Record<string, string[]> = {
  marketing: ['Lên lịch publish content', 'A/B test variations', 'Translate to English'],
  devops: ['Run performance test', 'Deploy to staging', 'Update documentation'],
  sales: ['Add leads to CRM', 'Schedule follow-up call', 'Create proposal deck'],
  hr: ['Post to job boards', 'Schedule interviews', 'Send to legal review'],
  ceo: ['Share with leadership', 'Update roadmap', 'Schedule team sync'],
};

// ─── Main Component ───────────────────────────────────────────────────────────

const PaperclipAIAgentsWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme: _theme } = useTheme();
  const { credits, isAuthenticated, login } = useAuth();
  const { showToast } = useToast();

  // UI state
  const [viewMode, setViewMode]             = useState<'studio' | 'history' | 'analytics' | 'canvas'>('studio');
  const [showAISuggest, setShowAISuggest]   = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [showBudgetPanel, setShowBudgetPanel] = useState(true);
  const [showOrgChart, setShowOrgChart]     = useState(true);
  const [showActivity, setShowActivity]     = useState(true);
  const [showPromptHistory, setShowPromptHistory] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'output' | 'log' | 'prompt' | 'setup' | 'chat'>('output');
  const [isStreaming, setIsStreaming]       = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const pendingRunRef = useRef<((override?: string) => Promise<void>) | null>(null);

  // Config state
  const [activeDept, setActiveDept]         = useState(DEPARTMENTS[1].id); // marketing
  const [activeModel, setActiveModel]       = useState(LLM_MODELS[0].id);
  const [taskPrompt, setTaskPrompt]         = useState('');
  const [budgetLimit, setBudgetLimit]       = useState(5.0);

  // Execution state
  const [isRunning, setIsRunning]           = useState(false);
  const [currentResult, setCurrentResult]  = useState<TaskResult | null>(null);
  const [spentBudget, setSpentBudget]       = useState(0);
  const [totalTokens, setTotalTokens]       = useState(0);
  const [runCount, setRunCount]             = useState(0);

  // Activity feed
  const [activityLogs, setActivityLogs]    = useState<ActivityLog[]>([]);
  const activityFeedRef                    = useRef<HTMLDivElement>(null);

  // History
  const [taskHistory, setTaskHistory]      = useState<TaskResult[]>([]);
  const [promptHistory, setPromptHistory]  = useState<string[]>([]);

  // D3: Follow-up suggestions
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);

  // A1: Live task duration timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // A2: Success burst
  const [showSuccessBurst, setShowSuccessBurst] = useState(false);

  // D1: Agent thinking steps
  const [thinkingStep, setThinkingStep] = useState(0);
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // B2: History search + filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

  // B3: Star filter for history
  const [historyStarFilter, setHistoryStarFilter] = useState(false);

  // A3: Keyboard shortcuts panel
  const [showShortcuts, setShowShortcuts] = useState(false);

  // A4: Skeleton loading for history
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // B1: Task queue
  interface QueuedTask { id: string; prompt: string; dept: string; model: string; addedAt: string; }
  const [taskQueue, setTaskQueue] = useState<QueuedTask[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY + '_queue') ?? '[]'); } catch { return []; }
  });
  const [showQueue, setShowQueue] = useState(false);

  // Onboarding wizard
  const [showWizard, setShowWizard] = useState(false);

  // Advanced / Simple mode toggle
  const [advancedMode, setAdvancedMode] = useState<boolean>(() => {
    try { return localStorage.getItem(ADVANCED_KEY) === 'true'; } catch { return false; }
  });

  // Prompt Inspector: edit system prompt + re-run
  const [editedSystemPrompt, setEditedSystemPrompt] = useState<string>('');
  const [isEditingPrompt, setIsEditingPrompt]       = useState(false);

  // Direct chat with agent
  const [chatInput, setChatInput]             = useState('');
  const [isChatStreaming, setIsChatStreaming]  = useState(false);
  const chatAbortRef                          = useRef<AbortController | null>(null);
  const chatEndRef                            = useRef<HTMLDivElement>(null);

  // Conversation memory per agent — persisted to localStorage
  const [conversationThreads, setConversationThreads] = useState<Record<string, ChatMessage[]>>(() => {
    const result: Record<string, ChatMessage[]> = {};
    DEPARTMENTS.forEach(d => {
      try {
        const saved = localStorage.getItem(THREAD_KEY(d.id));
        result[d.id] = saved ? JSON.parse(saved) : [];
      } catch {
        result[d.id] = [];
      }
    });
    return result;
  });

  // Agent briefs — free-text context per dept, persisted
  const [agentBriefs, setAgentBriefs] = useState<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    DEPARTMENTS.forEach(d => {
      try { result[d.id] = localStorage.getItem(BRIEF_KEY(d.id)) ?? ''; } catch { result[d.id] = ''; }
    });
    return result;
  });

  // Enabled skills per dept, persisted
  const [enabledSkills, setEnabledSkills] = useState<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};
    DEPARTMENTS.forEach(d => {
      try { result[d.id] = JSON.parse(localStorage.getItem(SKILLS_KEY(d.id)) ?? '[]'); } catch { result[d.id] = []; }
    });
    return result;
  });

  // Canvas multi-agent flow
  const CANVAS_INITIAL_POSITIONS: Record<string, { x: number; y: number }> = {
    ceo:       { x: 300, y: 30  },
    marketing: { x: 40,  y: 220 },
    devops:    { x: 210, y: 220 },
    sales:     { x: 380, y: 220 },
    hr:        { x: 550, y: 220 },
    report:    { x: 300, y: 420 },
  };
  const [canvasNodes, setCanvasNodes] = useState<CanvasNodeState[]>(() => {
    // P1: Restore persisted canvas nodes (outputs + positions)
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_canvas_nodes');
      if (saved) {
        const parsed: CanvasNodeState[] = JSON.parse(saved);
        // Merge saved positions/outputs into fresh node states (reset streaming/running)
        return DEPARTMENTS.map(d => {
          const s = parsed.find(n => n.id === d.id);
          return {
            id: d.id,
            x: s?.x ?? CANVAS_INITIAL_POSITIONS[d.id]?.x ?? 100,
            y: s?.y ?? CANVAS_INITIAL_POSITIONS[d.id]?.y ?? 100,
            status: (s?.status === 'done' || s?.status === 'error') ? s.status : 'idle',
            output: s?.output ?? '',
            streaming: false,
          };
        });
      }
    } catch { /* ignore */ }
    return DEPARTMENTS.map(d => ({
      id: d.id,
      x: CANVAS_INITIAL_POSITIONS[d.id]?.x ?? 100,
      y: CANVAS_INITIAL_POSITIONS[d.id]?.y ?? 100,
      status: 'idle' as const,
      output: '',
      streaming: false,
    }));
  });
  const [canvasReport, setCanvasReport] = useState<{ status: 'idle' | 'running' | 'done'; output: string }>(() => {
    // P1: Restore last completed canvas report from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_canvas_report');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.output) return { status: 'done', output: parsed.output };
      }
    } catch { /* ignore */ }
    return { status: 'idle', output: '' };
  });
  const [isCanvasRunning, setIsCanvasRunning] = useState(false);
  const [canvasPrompt, setCanvasPrompt] = useState('');
  const [dragNode, setDragNode] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // P0: AbortControllers for cancelling in-flight AI streams
  const abortRef = useRef<AbortController | null>(null);
  const canvasAbortRef = useRef<AbortController | null>(null);

  // P1-7: Mobile detection — canvas uses absolute positions, needs list fallback on mobile
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const dept  = DEPARTMENTS.find(d => d.id === activeDept)  ?? DEPARTMENTS[1];
  const model = LLM_MODELS.find(m => m.id === activeModel)  ?? LLM_MODELS[0];
  const budgetPct = Math.min((spentBudget / budgetLimit) * 100, 100);

  // A3: Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '?') { e.preventDefault(); setShowShortcuts(v => !v); }
      if (e.key === 's' || e.key === 'S') { e.preventDefault(); setViewMode('studio'); }
      if (e.key === 'h' || e.key === 'H') { e.preventDefault(); setViewMode('history'); }
      if ((e.key === 'a' || e.key === 'A') && advancedMode) { e.preventDefault(); setViewMode('analytics'); }
      if ((e.key === 'c' || e.key === 'C') && advancedMode) { e.preventDefault(); setViewMode('canvas'); }
      if (e.key === 'Escape') { setShowShortcuts(false); setShowApprovalDialog(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advancedMode]);

  // Trigger onboarding wizard on first visit
  useEffect(() => {
    if (!localStorage.getItem(WIZARD_KEY)) {
      const t = setTimeout(() => setShowWizard(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  // Persist advancedMode to localStorage
  useEffect(() => {
    try { localStorage.setItem(ADVANCED_KEY, String(advancedMode)); } catch { /* ignore */ }
  }, [advancedMode]);

  // Reset viewMode when advanced mode is turned off
  useEffect(() => {
    if (!advancedMode && (viewMode === 'analytics' || viewMode === 'canvas')) setViewMode('studio');
  }, [advancedMode, viewMode]);

  // Reset activeRightTab when advanced mode is turned off
  useEffect(() => {
    if (!advancedMode && activeRightTab === 'prompt') setActiveRightTab('output');
  }, [advancedMode, activeRightTab]);

  // A4: Reset historyLoaded when switching to history view
  useEffect(() => {
    if (viewMode === 'history') {
      setHistoryLoaded(false);
      const t = setTimeout(() => setHistoryLoaded(true), 300);
      return () => clearTimeout(t);
    }
  }, [viewMode]);

  // B1: addToQueue callback
  const addToQueue = useCallback(() => {
    if (!taskPrompt.trim()) return;
    const entry: QueuedTask = {
      id: Date.now().toString(),
      prompt: taskPrompt,
      dept: activeDept,
      model: activeModel,
      addedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [...taskQueue, entry];
    setTaskQueue(updated);
    localStorage.setItem(STORAGE_KEY + '_queue', JSON.stringify(updated));
    showToast(`Đã thêm vào queue (${updated.length} tasks)`, 'success');
  }, [taskPrompt, activeDept, activeModel, taskQueue, showToast]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { const data = JSON.parse(saved); setTaskHistory(data); setRunCount(data.length); } catch { /* ignore */ } }
    const savedPrompts = localStorage.getItem(STORAGE_KEY + '_prompts');
    if (savedPrompts) { try { setPromptHistory(JSON.parse(savedPrompts)); } catch { /* ignore */ } }
    const savedBudget = localStorage.getItem(STORAGE_KEY + '_budget');
    if (savedBudget) { try { const b = JSON.parse(savedBudget); setSpentBudget(b.spent ?? 0); setTotalTokens(b.tokens ?? 0); } catch { /* ignore */ } }
  }, []);

  // Add activity log entry
  const addLog = useCallback((agent: string, action: string, status: ActivityLog['status'] = 'info', color: string = '#0090ff') => {
    const entry: ActivityLog = {
      id: Date.now().toString() + Math.random(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      agent,
      action,
      status,
      color,
    };
    setActivityLogs(prev => [entry, ...prev].slice(0, 20));
  }, []);

  const saveThread = useCallback((deptId: string, thread: ChatMessage[]) => {
    const trimmed = thread.slice(-MAX_THREAD_TURNS * 2);
    setConversationThreads(prev => ({ ...prev, [deptId]: trimmed }));
    localStorage.setItem(THREAD_KEY(deptId), JSON.stringify(trimmed));
  }, []);

  const clearThread = useCallback((deptId: string) => {
    setConversationThreads(prev => ({ ...prev, [deptId]: [] }));
    localStorage.removeItem(THREAD_KEY(deptId));
  }, []);

  const saveBrief = useCallback((deptId: string, brief: string) => {
    setAgentBriefs(prev => ({ ...prev, [deptId]: brief }));
    localStorage.setItem(BRIEF_KEY(deptId), brief);
  }, []);

  const toggleSkill = useCallback((deptId: string, skillId: string) => {
    setEnabledSkills(prev => {
      const current = prev[deptId] ?? [];
      const updated = current.includes(skillId)
        ? current.filter(s => s !== skillId)
        : [...current, skillId];
      localStorage.setItem(SKILLS_KEY(deptId), JSON.stringify(updated));
      return { ...prev, [deptId]: updated };
    });
  }, []);

  // Auto-scroll activity feed to top (newest) when new log arrives
  useEffect(() => {
    if (activityFeedRef.current) {
      activityFeedRef.current.scrollTop = 0;
    }
  }, [activityLogs]);

  // Auto-scroll chat to bottom when messages update or tab switches to chat
  useEffect(() => {
    if (activeRightTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationThreads, activeDept, activeRightTab]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  // High-stakes keywords that trigger human-in-the-loop approval
  const APPROVAL_KEYWORDS = ['deploy', 'delete', 'remove', 'production', 'publish', 'send', 'email', 'budget', 'payment', 'fire', 'hire', 'promote'];

  const requiresApproval = useCallback((prompt: string) => {
    const lower = prompt.toLowerCase();
    return APPROVAL_KEYWORDS.some(kw => lower.includes(kw));
  }, []);

  const executeRun = useCallback(async (overrideSystemPrompt?: string) => {
    if (!taskPrompt.trim() || isRunning) return;
    if (!isAuthenticated) { login(); return; }

    setIsRunning(true);
    setIsStreaming(false);
    setActiveRightTab('output');
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    setThinkingStep(0);
    thinkingTimerRef.current = setInterval(() => {
      setThinkingStep(s => Math.min(s + 1, THINKING_STEPS.length - 1));
    }, 800);
    const taskId = Date.now().toString();
    const startTime = Date.now();

    // P0: Create fresh AbortController for this run
    abortRef.current = new AbortController();

    // P0: Cost/tokens tracked from real output length (estimated — no mock random)
    // We'll update these after completion based on output chars
    let taskCost = 0;
    let taskTokens = 0;

    // Build system prompt via buildSystemMessage() — or use override from Prompt Inspector
    const brief = agentBriefs[activeDept]?.trim();
    const activeSkillRules = (enabledSkills[activeDept] ?? [])
      .map(sid => DEPT_SKILLS[activeDept]?.find(s => s.id === sid)?.rule)
      .filter(Boolean) as string[];

    const builtSystemPrompt: string = overrideSystemPrompt ?? (buildSystemMessage({
      role: `Bạn là ${dept.agent} trong hệ thống Paperclip AI Org Orchestrator. Department: ${dept.label}. Model: ${model.label} (${model.provider}).${brief ? `\n\nCOMPANY CONTEXT:\n${brief}` : ''}`,
      rules: [
        'Thực hiện task được giao, trả về kết quả chi tiết, professional và actionable.',
        'Dùng markdown formatting: headers (##), bullet points (-), numbered lists khi phù hợp.',
        'Viết bằng tiếng Việt hoặc tiếng Anh tùy context của task.',
        ...activeSkillRules,
      ],
      outputFormat: 'Kết quả phải cụ thể, có thể action được ngay.',
    }).content as string);

    // Simulate multi-step activity
    addLog('CEO Agent', `Nhận task từ user → giao cho ${dept.agent}`, 'running', '#0090ff');
    setTimeout(() => addLog(dept.agent, `Bắt đầu xử lý với ${model.label}`, 'running', dept.color), 600);
    setTimeout(() => addLog('Budget Guard', `Theo dõi cost — limit $${budgetLimit.toFixed(2)}`, 'info', '#10b981'), 1200);
    if (overrideSystemPrompt) {
      setTimeout(() => addLog('Prompt Inspector', 'Dùng system prompt đã chỉnh sửa', 'info', '#8b5cf6'), 900);
    }

    const pendingResult: TaskResult = {
      id: taskId,
      dept: dept.label,
      model: model.label,
      taskDesc: taskPrompt,
      output: '',
      status: 'running',
      timestamp: new Date().toLocaleString('vi-VN'),
      cost: '~est.',
      tokens: undefined,
      systemPrompt: builtSystemPrompt,
    };
    setCurrentResult(pendingResult);

    // Save prompt history
    const newHistory = [taskPrompt, ...promptHistory.filter(p => p !== taskPrompt)].slice(0, 10);
    setPromptHistory(newHistory);
    localStorage.setItem(STORAGE_KEY + '_prompts', JSON.stringify(newHistory));

    try {
      let streamedOutput = '';
      setIsStreaming(true);

      const currentThread = conversationThreads[activeDept] ?? [];

      await aiChatStreamViaProxy(
        [
          { role: 'system', content: builtSystemPrompt },
          ...currentThread,
          { role: 'user', content: taskPrompt },
        ],
        (token) => {
          streamedOutput += token;
          setCurrentResult(prev => prev ? { ...prev, output: streamedOutput } : prev);
        },
        abortRef.current?.signal,
        4096,
        model.apiModel,
      );

      const output = streamedOutput;
      const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

      // Check if aborted mid-stream — save partial output with 'done' status
      const wasAborted = abortRef.current?.signal.aborted ?? false;

      if (output && output.trim().length > 0) {
        // Estimate tokens from output length (~4 chars/token) + system prompt
        taskTokens = Math.ceil((output.length + builtSystemPrompt.length + taskPrompt.length) / 4);
        // Estimate cost: Sonnet ≈ $3/$15 per M tokens input/output, Opus ≈ $15/$75
        const isOpus = model.apiModel === AI_MODELS.OPUS;
        const outTokens = Math.ceil(output.length / 4);
        const inTokens = taskTokens - outTokens;
        const inRate  = isOpus ? 0.000015 : 0.000003;
        const outRate = isOpus ? 0.000075 : 0.000015;
        taskCost = parseFloat((inTokens * inRate + outTokens * outRate).toFixed(4));

        const doneResult: TaskResult = { ...pendingResult, output, status: wasAborted ? 'done' : 'done', duration, tokens: taskTokens, cost: `~$${taskCost.toFixed(3)}` };
        setCurrentResult(doneResult);
        setFollowUpSuggestions(FOLLOW_UP_MAP[activeDept] ?? []);
        setShowSuccessBurst(true);
        setTimeout(() => setShowSuccessBurst(false), 2500);

        // Update budget
        const newSpent = spentBudget + taskCost;
        const newTokens = totalTokens + taskTokens;
        setSpentBudget(newSpent);
        setTotalTokens(newTokens);
        setRunCount(r => r + 1);
        localStorage.setItem(STORAGE_KEY + '_budget', JSON.stringify({ spent: newSpent, tokens: newTokens }));

        const updated = [doneResult, ...taskHistory];
        setTaskHistory(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Append turn vào conversation memory
        const updatedThread: ChatMessage[] = [
          ...currentThread,
          { role: 'user', content: taskPrompt },
          { role: 'assistant', content: output },
        ];
        saveThread(activeDept, updatedThread);

        addLog(dept.agent, `✓ Task hoàn thành trong ${duration} — ~$${taskCost.toFixed(3)} est.`, 'success', dept.color);
        addLog('CEO Agent', `Report nhận được từ ${dept.agent}`, 'success', '#0090ff');
        showToast(`${dept.agent} hoàn thành task!`, 'success');

        // Budget warning
        if (newSpent / budgetLimit > 0.8) {
          addLog('Budget Guard', `⚠️ Đã dùng ${((newSpent / budgetLimit) * 100).toFixed(0)}% budget!`, 'warning', '#f59e0b');
        }
      } else {
        const errResult: TaskResult = { ...pendingResult, output: 'Không thể kết nối tới AI service. Vui lòng thử lại.', status: 'error' };
        setCurrentResult(errResult);
        addLog(dept.agent, 'Lỗi kết nối AI service', 'warning', '#ef4444');
        showToast('Lỗi kết nối AI', 'error');
      }
    } catch (err) {
      // P0: If aborted by user — save partial output as done (not error)
      if (abortRef.current?.signal.aborted) {
        const partialOutput = currentResult?.output ?? '';
        if (partialOutput.trim()) {
          const abortedResult: TaskResult = { ...pendingResult, output: partialOutput, status: 'done', duration: ((Date.now() - startTime) / 1000).toFixed(1) + 's', cost: '~est.' };
          setCurrentResult(abortedResult);
          addLog(dept.agent, '⏹ Task dừng bởi user — kết quả một phần đã lưu', 'warning', '#f59e0b');
          showToast('Đã dừng — kết quả một phần đã lưu', 'success');
        } else {
          setCurrentResult(prev => prev ? { ...prev, status: 'error', output: '⏹ Task bị dừng bởi user.' } : prev);
          addLog(dept.agent, '⏹ Task bị dừng bởi user', 'warning', '#f59e0b');
        }
      } else {
        const errResult: TaskResult = { ...pendingResult, output: 'Đã xảy ra lỗi khi chạy agent. Vui lòng thử lại.', status: 'error' };
        setCurrentResult(errResult);
        addLog(dept.agent, 'Lỗi không xác định', 'warning', '#ef4444');
        showToast('Lỗi khi chạy agent', 'error');
      }
    } finally {
      setIsEditingPrompt(false);
      setIsRunning(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (thinkingTimerRef.current) { clearInterval(thinkingTimerRef.current); thinkingTimerRef.current = null; }
      setThinkingStep(0);
      // B1: Auto-run next queued task
      setTaskQueue(prev => {
        if (prev.length === 0) return prev;
        const [next, ...rest] = prev;
        localStorage.setItem(STORAGE_KEY + '_queue', JSON.stringify(rest));
        setActiveDept(next.dept);
        setActiveModel(next.model);
        setTaskPrompt(next.prompt);
        showToast(`Queue: chạy task tiếp theo (${rest.length} còn lại)`, 'success');
        return rest;
      });
    }
  }, [taskPrompt, isRunning, isAuthenticated, login, dept, model, budgetLimit, spentBudget, totalTokens, promptHistory, taskHistory, addLog, showToast, activeDept, conversationThreads, saveThread, agentBriefs, enabledSkills]);

  const handleRun = useCallback(async () => {
    if (!taskPrompt.trim() || isRunning) return;
    if (!isAuthenticated) { login(); return; }

    // Check if task needs human approval
    if (requiresApproval(taskPrompt)) {
      pendingRunRef.current = executeRun;
      setShowApprovalDialog(true);
      addLog('Human-in-Loop', 'Task cần phê duyệt của bạn', 'warning', '#f59e0b');
      return;
    }

    await executeRun();
  }, [taskPrompt, isRunning, isAuthenticated, login, requiresApproval, executeRun, addLog]);

  const runCanvasFlow = useCallback(async () => {
    if (!canvasPrompt.trim() || isCanvasRunning) return;
    if (!isAuthenticated) { login(); return; }

    // P0: Create fresh AbortController for canvas run
    canvasAbortRef.current = new AbortController();
    const signal = canvasAbortRef.current.signal;

    setIsCanvasRunning(true);
    setCanvasReport({ status: 'idle', output: '' });
    setCanvasNodes(prev => prev.map(n => ({ ...n, status: 'idle' as const, output: '', streaming: false })));

    const deptAgents = DEPARTMENTS.filter(d => d.tier === 'department');
    const allOutputs: string[] = [];

    // Run all dept agents in parallel
    await Promise.all(deptAgents.map(async (d) => {
      const deptDef = DEPARTMENTS.find(dep => dep.id === d.id)!;
      const deptModel = LLM_MODELS[0];

      setCanvasNodes(prev => prev.map(n => n.id === d.id ? { ...n, status: 'running' as const, streaming: true } : n));

      const brief = agentBriefs[d.id]?.trim();
      const activeSkillRules = (enabledSkills[d.id] ?? [])
        .map(sid => DEPT_SKILLS[d.id]?.find(s => s.id === sid)?.rule)
        .filter(Boolean) as string[];

      const sysPrompt = buildSystemMessage({
        role: `Bạn là ${deptDef.agent}. Hãy thực hiện phần công việc liên quan đến ${deptDef.label} cho brief sau đây.${brief ? `\n\nCOMPANY CONTEXT:\n${brief}` : ''}`,
        rules: [
          'Trả lời ngắn gọn, actionable, đúng chuyên môn của department.',
          'Dùng markdown: bullet points và numbered list.',
          ...activeSkillRules,
        ],
        outputFormat: `Kết quả cho phần ${deptDef.label}. Tối đa 300 từ.`,
      }).content as string;

      let out = '';
      try {
        await aiChatStreamViaProxy(
          [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: canvasPrompt },
          ],
          (token) => {
            out += token;
            setCanvasNodes(prev => prev.map(n => n.id === d.id ? { ...n, output: out } : n));
          },
          signal,
          1500,
          deptModel.apiModel,
        );
        allOutputs.push(`## ${deptDef.label}\n${out}`);
        setCanvasNodes(prev => prev.map(n => n.id === d.id ? { ...n, status: 'done' as const, streaming: false } : n));
      } catch {
        const isAbort = signal.aborted;
        setCanvasNodes(prev => prev.map(n => n.id === d.id ? {
          ...n,
          status: isAbort && out.trim() ? 'done' as const : isAbort ? 'idle' as const : 'error' as const,
          streaming: false,
          output: out,
        } : n));
        if (out.trim()) allOutputs.push(`## ${deptDef.label}\n${out}`);
      }
    }));

    // Stop if aborted
    if (signal.aborted) {
      setIsCanvasRunning(false);
      // P1: Persist partial canvas state
      try { localStorage.setItem(STORAGE_KEY + '_canvas_nodes', JSON.stringify(canvasNodes)); } catch { /* ignore */ }
      return;
    }

    // CEO synthesizes final report
    setCanvasReport({ status: 'running', output: '' });
    const ceoBrief = agentBriefs['ceo']?.trim();
    const ceoSys = buildSystemMessage({
      role: `Bạn là CEO Agent. Tổng hợp báo cáo từ tất cả departments thành một executive summary.${ceoBrief ? `\n\nCOMPANY CONTEXT:\n${ceoBrief}` : ''}`,
      rules: ['Tổng hợp ngắn gọn, highlight key actions, assign priorities.', 'Giữ CEO perspective: strategic, decisive.'],
      outputFormat: 'Executive Summary với: 1. Key Highlights, 2. Priority Actions, 3. Next Steps.',
    }).content as string;

    let reportOut = '';
    try {
      await aiChatStreamViaProxy(
        [
          { role: 'system', content: ceoSys },
          { role: 'user', content: `Tổng hợp report từ tất cả departments cho brief: "${canvasPrompt}"\n\n${allOutputs.join('\n\n')}` },
        ],
        (token) => {
          reportOut += token;
          setCanvasReport({ status: 'running', output: reportOut });
        },
        signal,
        2048,
        AI_MODELS.OPUS,
      );
      setCanvasReport({ status: 'done', output: reportOut });
      // P1: Persist completed report to localStorage
      try { localStorage.setItem(STORAGE_KEY + '_canvas_report', JSON.stringify({ prompt: canvasPrompt, output: reportOut, ts: new Date().toISOString() })); } catch { /* ignore */ }
    } catch {
      const finalOut = reportOut.trim() ? reportOut : '⚠️ Lỗi khi tổng hợp report.';
      setCanvasReport({ status: 'done', output: finalOut });
      if (reportOut.trim()) {
        try { localStorage.setItem(STORAGE_KEY + '_canvas_report', JSON.stringify({ prompt: canvasPrompt, output: finalOut, ts: new Date().toISOString() })); } catch { /* ignore */ }
      }
    }

    // P1: Persist canvas node outputs to localStorage
    setCanvasNodes(prev => {
      try { localStorage.setItem(STORAGE_KEY + '_canvas_nodes', JSON.stringify(prev)); } catch { /* ignore */ }
      return prev;
    });

    setIsCanvasRunning(false);
  }, [canvasPrompt, isCanvasRunning, isAuthenticated, login, agentBriefs, enabledSkills, canvasNodes]);

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = taskHistory.filter(t => t.id !== id);
    setTaskHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = taskHistory.map(t => t.id === id ? { ...t, starred: !t.starred } : t);
    setTaskHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const exportHistoryJSON = () => {
    const blob = new Blob([JSON.stringify(taskHistory, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paperclip-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã export lịch sử!', 'success');
  };

  // Estimated token count for current prompt (1 token ≈ 4 chars)
  const estimatedTokens = useMemo(() => Math.ceil(taskPrompt.length / 4), [taskPrompt]);

  // C1: Word count + reading time
  const outputWordCount = useMemo(() => currentResult?.output?.split(/\s+/).filter(Boolean).length ?? 0, [currentResult]);
  const readingTime = useMemo(() => Math.max(1, Math.ceil(outputWordCount / 200)), [outputWordCount]);

  // B2 + B3: Filtered history
  const filteredHistory = useMemo(() => {
    return taskHistory.filter(item => {
      const matchesDept = historyFilter === 'all' || item.dept === DEPARTMENTS.find(d => d.id === historyFilter)?.label;
      const matchesSearch = !historySearch || item.taskDesc.toLowerCase().includes(historySearch.toLowerCase()) || item.output?.toLowerCase().includes(historySearch.toLowerCase());
      const matchesStar = !historyStarFilter || item.starred === true;
      return matchesDept && matchesSearch && matchesStar;
    });
  }, [taskHistory, historySearch, historyFilter, historyStarFilter]);

  const copyOutput = (text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast('Đã copy output!', 'success'));
  };

  const shareOutput = (result: TaskResult) => {
    const shareText = `🤖 Paperclip AI — ${result.dept}\n\n📋 Task: ${result.taskDesc}\n\n${result.output.slice(0, 500)}${result.output.length > 500 ? '…' : ''}\n\n⚡ ${result.model} · ${result.cost} · ${result.tokens?.toLocaleString() ?? '—'} tokens\n🔗 skyverses.io`;
    navigator.clipboard.writeText(shareText).then(() => showToast('Đã copy để chia sẻ!', 'success'));
  };

  const downloadOutput = (text: string, title: string) => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống!', 'success');
  };

  const resetBudget = () => {
    setSpentBudget(0);
    setTotalTokens(0);
    localStorage.removeItem(STORAGE_KEY + '_budget');
    showToast('Đã reset budget', 'success');
    addLog('Budget Guard', 'Budget reset bởi user', 'info', '#10b981');
  };

  const handleWizardComplete = useCallback((result: WizardResult) => {
    setActiveDept(result.dept);
    setBudgetLimit(result.budget);
    setTaskPrompt(result.prompt);
    localStorage.setItem(WIZARD_KEY, 'true');
    setShowWizard(false);
    if (result.runDemo) setTimeout(() => handleRun(), 600);
  }, [handleRun]);

  const handleWizardSkip = useCallback(() => {
    localStorage.setItem(WIZARD_KEY, 'true');
    setShowWizard(false);
  }, []);

  // ── Direct Chat with Agent ─────────────────────────────────────────────────

  const handleChatSend = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || isChatStreaming) return;

    const dept = DEPARTMENTS.find(d => d.id === activeDept)!;
    const model = LLM_MODELS.find(m => m.id === activeModel) ?? LLM_MODELS[0];

    if (spentBudget >= budgetLimit) {
      showToast('Budget limit reached!', 'error');
      return;
    }

    // Append user message optimistically
    const userMsg: ChatMessage = { role: 'user', content: text };
    const currentThread = conversationThreads[activeDept] ?? [];
    const newThread = [...currentThread, userMsg];
    saveThread(activeDept, newThread);
    setChatInput('');
    setIsChatStreaming(true);
    addLog(dept.agent, `Chat: "${text.slice(0, 40)}${text.length > 40 ? '…' : ''}"`, 'info', dept.color);

    // Build system prompt same as executeRun
    const brief = agentBriefs[activeDept]?.trim();
    const systemContent = buildSystemMessage({
      role: `Bạn là ${dept.agent} trong hệ thống Paperclip AI Org Orchestrator. Department: ${dept.label}. Model: ${model.label} (${model.provider}).${brief ? `\n\nCOMPANY CONTEXT:\n${brief}` : ''}`,
      rules: [
        'Trả lời ngắn gọn, súc tích và có cấu trúc rõ ràng',
        'Luôn format output bằng Markdown: bullet points, bold headers, code blocks khi cần',
        'Đây là cuộc hội thoại trực tiếp — trả lời tự nhiên như một AI assistant chuyên nghiệp',
      ],
      language: 'vi',
    });

    const messages: ChatMessage[] = [
      systemContent,
      ...newThread,
    ];

    const abort = new AbortController();
    chatAbortRef.current = abort;
    let assistantReply = '';

    try {
      await aiChatStreamViaProxy(
        messages,
        (chunk) => {
          assistantReply += chunk;
          // Stream assistant reply into thread in real-time
          setConversationThreads(prev => ({
            ...prev,
            [activeDept]: [
              ...newThread,
              { role: 'assistant' as const, content: assistantReply },
            ],
          }));
        },
        abort.signal,
        2048,
        model.apiModel,
      );
      // Persist final thread
      saveThread(activeDept, [...newThread, { role: 'assistant' as const, content: assistantReply }]);
      addLog(dept.agent, 'Chat response complete', 'success', dept.color);
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        showToast('Chat error — please retry', 'error');
        addLog(dept.agent, 'Chat error', 'warning', '#ef4444');
      }
    } finally {
      setIsChatStreaming(false);
      chatAbortRef.current = null;
    }
  }, [chatInput, isChatStreaming, activeDept, activeModel, conversationThreads, spentBudget,
      budgetLimit, agentBriefs, saveThread, addLog, showToast]);

  // ── Sidebar ────────────────────────────────────────────────────────────────

  // D4: Auto-detect best department
  const detectDept = useCallback((prompt: string): string | null => {
    const lower = prompt.toLowerCase();
    if (/deploy|ci\/cd|pipeline|docker|kubernetes|code|git|build|server|infrastructure|devops/.test(lower)) return 'devops';
    if (/email|content|seo|blog|social|marketing|campaign|post|brand|copy/.test(lower)) return 'marketing';
    if (/hire|job|onboard|recruit|interview|hr|employee|candidate|talent/.test(lower)) return 'hr';
    if (/lead|crm|deal|sales|prospect|revenue|quota|client|customer/.test(lower)) return 'sales';
    return null;
  }, []);
  const suggestedDept = useMemo(() => detectDept(taskPrompt), [taskPrompt, detectDept]);

  const SidebarContent = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

      {/* ── Compact Config Card (always visible) ── */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] p-3 space-y-2.5">
        {/* Agent pills */}
        <div>
          <p className="text-[8px] font-bold uppercase text-slate-400 dark:text-[#444] tracking-widest mb-1.5">Agent</p>
          <div className="flex gap-1 flex-wrap">
            {DEPARTMENTS.map(d => {
              const Icon = d.icon;
              const isActive = activeDept === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDept(d.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold transition-all"
                  style={isActive
                    ? { backgroundColor: `${d.color}20`, borderColor: `${d.color}50`, color: d.color }
                    : { backgroundColor: 'transparent', borderColor: 'rgba(0,0,0,0.07)', color: '' }
                  }
                >
                  <Icon size={9} style={isActive ? { color: d.color } : {}} />
                  <span className={isActive ? '' : 'text-slate-500 dark:text-[#555]'}>{d.id === 'ceo' ? 'CEO' : d.label.replace(' AI', '').replace(' Agent', '')}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Model pills */}
        <div>
          <p className="text-[8px] font-bold uppercase text-slate-400 dark:text-[#444] tracking-widest mb-1.5">Model</p>
          <div className="flex gap-1">
            {LLM_MODELS.map(m => {
              const isActive = activeModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModel(m.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold transition-all"
                  style={isActive
                    ? { backgroundColor: `${m.color}20`, borderColor: `${m.color}50`, color: m.color }
                    : { backgroundColor: 'transparent', borderColor: 'rgba(0,0,0,0.07)' }
                  }
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive ? m.color : '#94a3b8' }} />
                  <span className={isActive ? '' : 'text-slate-500 dark:text-[#555]'}>{m.id === 'claude-sonnet' ? 'Sonnet' : 'Opus'}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Budget inline */}
        <div>
          <p className="text-[8px] font-bold uppercase text-slate-400 dark:text-[#444] tracking-widest mb-1.5">Budget</p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-400">Limit $</span>
            <input
              value={budgetLimit}
              onChange={e => setBudgetLimit(parseFloat(e.target.value) || 1)}
              className="w-14 text-[11px] bg-white dark:bg-white/[0.04] border border-emerald-500/20 rounded-lg px-2 py-0.5 text-slate-700 dark:text-white focus:outline-none focus:border-emerald-500/50"
              type="number" min="0.5" step="0.5"
            />
            <div className="flex-1">
              <div className="h-1.5 rounded-full bg-emerald-500/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((spentBudget / budgetLimit) * 100, 100)}%`,
                    backgroundColor: budgetPct > 80 ? '#ef4444' : '#10b981',
                  }}
                />
              </div>
            </div>
            <span className={`text-[9px] font-bold ${budgetPct > 80 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
              ${spentBudget.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Org Chart ── */}
      <div>
        <button
          onClick={() => setShowOrgChart(v => !v)}
          className="flex items-center justify-between w-full text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors tracking-widest mb-2"
        >
          <span className="flex items-center gap-1.5"><Network size={10} /> Org Structure</span>
          {showOrgChart ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
        <AnimatePresence>
          {showOrgChart && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden bg-slate-50/50 dark:bg-white/[0.01]">
                <OrgChartMini
                  activeDeptId={activeDept}
                  runningDepts={isRunning ? [activeDept] : []}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Department picker (Advanced only) ── */}
      {advancedMode && (
        <div>
          <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Phòng ban / Agent</p>
          <div className="space-y-1">
            {DEPARTMENTS.map(d => {
              const Icon = d.icon;
              const isActive = activeDept === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDept(d.id)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all ${
                    isActive
                      ? 'border-brand-blue/40 bg-brand-blue/[0.06]'
                      : 'border-transparent bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${d.color}20` }}>
                    <Icon size={14} style={{ color: d.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-semibold truncate ${isActive ? 'text-brand-blue' : 'text-slate-700 dark:text-white/80'}`}>
                      {d.label}
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-[#555] truncate">
                      {d.tier === 'orchestrator' ? '⭐ Orchestrator' : d.agent}
                    </p>
                  </div>
                  {(conversationThreads[d.id]?.length ?? 0) > 0 && (
                    <span className="text-[8px] bg-brand-blue/20 text-brand-blue px-1.5 py-0.5 rounded-full font-bold shrink-0">
                      {Math.floor((conversationThreads[d.id]?.length ?? 0) / 2)}t
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="active-dept-dot"
                      className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick tasks (horizontal scroll chips) ── */}
      <div>
        <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Task nhanh — {dept.label}</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {dept.tasks.map(t => (
            <button
              key={t}
              onClick={() => setTaskPrompt(t)}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold whitespace-nowrap transition-all ${
                taskPrompt === t
                  ? 'border-brand-blue/40 bg-brand-blue/[0.08] text-brand-blue'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-600 dark:text-white/60 hover:border-brand-blue/30 hover:text-brand-blue hover:bg-brand-blue/[0.02]'
              }`}
            >
              <Zap size={8} className="opacity-60 shrink-0" />
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── LLM Model picker (Advanced only) ── */}
      {advancedMode && (
        <div>
          <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">LLM Model</p>
          <div className="space-y-1">
            {LLM_MODELS.map(m => {
              const isActive = activeModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModel(m.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
                      : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-600 dark:text-white/60 hover:border-brand-blue/30'
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.6)' : m.color }}
                  />
                  <span className="text-[11px] font-semibold flex-1 text-left">{m.label}</span>
                  <span className={`text-[8px] font-medium ${isActive ? 'text-white/70' : 'text-slate-400 dark:text-[#555]'}`}>{m.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── AI Suggest ── */}
      <div>
        <button
          onClick={() => setShowAISuggest(v => !v)}
          className="flex items-center justify-between w-full text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors tracking-widest mb-1"
        >
          <span className="flex items-center gap-1.5"><Sparkles size={10} /> AI Gợi ý & Templates</span>
          {showAISuggest ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
        <AnimatePresence>
          {showAISuggest && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <AISuggestPanel
                productSlug="paperclip-ai-agents"
                productName="Paperclip AI Agents"
                styles={TASK_TEMPLATES}
                onPromptSelect={(p) => setTaskPrompt(prev => p + (prev ? '\n' + prev : ''))}
                onApply={(cfg) => { if (cfg.prompt) setTaskPrompt(cfg.prompt); }}
                historyKey={STORAGE_KEY}
                featuredTemplates={FEATURED_TEMPLATES}
                productContext={`Paperclip AI Org Orchestrator — ${dept.label} running ${model.label} for automation tasks`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Task prompt ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] tracking-widest">Mô tả Task</p>
          {promptHistory.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowPromptHistory(v => !v)}
                className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors"
              >
                <History size={10} /> {promptHistory.length} lịch sử
              </button>
              <AnimatePresence>
                {showPromptHistory && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-5 z-50 w-72 bg-white dark:bg-[#111113] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-2 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
                      <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest px-1">10 tasks gần nhất</p>
                      <button onClick={() => setShowPromptHistory(false)} className="p-0.5 text-slate-300 hover:text-red-400 transition-colors"><X size={10} /></button>
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {promptHistory.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => { setTaskPrompt(p); setShowPromptHistory(false); }}
                          className="w-full text-left px-3 py-2.5 text-[11px] text-slate-700 dark:text-white/70 hover:bg-brand-blue/[0.06] hover:text-brand-blue transition-colors line-clamp-2 border-b border-black/[0.03] dark:border-white/[0.03] last:border-0"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        <textarea
          value={taskPrompt}
          onChange={e => setTaskPrompt(e.target.value)}
          onKeyDown={e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleRun(); }
          }}
          placeholder={`Mô tả task cho ${dept.agent}...\nVD: Viết 3 blog posts SEO về AI automation`}
          rows={4}
          className="w-full text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2.5 resize-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#444] focus:outline-none focus:border-brand-blue/50 transition-colors"
        />
        {suggestedDept && suggestedDept !== activeDept && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setActiveDept(suggestedDept)}
            className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-brand-blue bg-brand-blue/[0.07] border border-brand-blue/20 px-2.5 py-1 rounded-full hover:bg-brand-blue/15 transition-all"
          >
            <Sparkles size={9} />
            Gợi ý: {DEPARTMENTS.find(d => d.id === suggestedDept)?.label} ↗
          </motion.button>
        )}
        <p className="text-[8px] text-slate-300 dark:text-[#444] mt-1 text-right">{taskPrompt.length} ký tự · ~{estimatedTokens} tokens · ⌘↵ để chạy</p>
      </div>

      {/* ── Budget Guard (Advanced only) ── */}
      {advancedMode && (
        <div>
          <button
            onClick={() => setShowBudgetPanel(v => !v)}
            className="flex items-center justify-between w-full text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors tracking-widest mb-2"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={10} className="text-emerald-500" /> Budget Guard
            </span>
            {showBudgetPanel ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
          <AnimatePresence>
            {showBudgetPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-3">
                  <BudgetMeter limit={budgetLimit} spent={spentBudget} />
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-400 shrink-0">Limit $</span>
                    <input
                      value={budgetLimit}
                      onChange={e => setBudgetLimit(parseFloat(e.target.value) || 1)}
                      className="flex-1 text-[11px] bg-white dark:bg-white/[0.04] border border-emerald-500/20 rounded-lg px-2 py-1 text-slate-700 dark:text-white focus:outline-none focus:border-emerald-500/50"
                      type="number"
                      min="0.5"
                      step="0.5"
                    />
                    <button
                      onClick={resetBudget}
                      className="shrink-0 text-[9px] font-semibold text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                    >
                      Reset
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-[#555]">
                    Agent tự động pause khi sắp vượt limit. Mọi action đều có audit log.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Activity Feed ── */}
      <div>
        <button
          onClick={() => setShowActivity(v => !v)}
          className="flex items-center justify-between w-full text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors tracking-widest mb-2"
        >
          <span className="flex items-center gap-1.5">
            <Activity size={10} className="text-brand-blue" /> Activity Log
            {activityLogs.length > 0 && (
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-brand-blue/20 text-brand-blue text-[7px] font-bold">
                {activityLogs.length}
              </span>
            )}
          </span>
          {showActivity ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
        <AnimatePresence>
          {showActivity && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div ref={activityFeedRef} className="p-3 rounded-xl border border-black/[0.05] dark:border-white/[0.05] bg-black/[0.01] dark:bg-white/[0.01] max-h-40 overflow-y-auto">
                <ActivityFeed logs={activityLogs} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="h-full w-full flex flex-col bg-[#f4f7f9] dark:bg-[#050505] text-slate-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-500">

      {/* ── TOP NAV ── */}
      <div className="h-14 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 lg:px-6 shrink-0 z-[100] transition-colors gap-3">

        {/* Left: Logo + view toggle */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <Network size={14} className="text-brand-blue" />
            </div>
            <span className="text-[12px] font-bold text-slate-700 dark:text-white/80 hidden sm:block">Paperclip Studio</span>
          </div>

          {/* View mode tabs */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/5 p-0.5 rounded-full border border-slate-200 dark:border-white/10">
            {([
              { id: 'studio',  label: 'Run',                                 icon: Play      },
              { id: 'history', label: `Lịch sử (${taskHistory.length})`,     icon: History   },
              ...(advancedMode ? [
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'canvas',    label: 'Canvas',    icon: Workflow   },
              ] : []),
            ] as { id: string; label: string; icon: React.ElementType }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as 'studio' | 'history' | 'analytics' | 'canvas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-full transition-all ${
                  viewMode === tab.id
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <tab.icon size={10} />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Dept badge + Budget pill + Credits + Close */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dept pill */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border shrink-0"
            style={{ backgroundColor: `${dept.color}15`, borderColor: `${dept.color}35`, color: dept.color }}
          >
            <dept.icon size={11} />
            <span className="hidden md:inline">{dept.label}</span>
          </div>

          {/* Budget status */}
          {spentBudget > 0 && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${
              budgetPct > 80 ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            }`}>
              <ShieldCheck size={10} />
              ${spentBudget.toFixed(2)} / ${budgetLimit.toFixed(2)}
            </div>
          )}

          {/* Mobile sheet toggle */}
          <button
            onClick={() => setShowMobileSheet(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-bold"
          >
            <Settings size={12} /> Config
          </button>

          {/* Advanced mode toggle */}
          <button
            onClick={() => setAdvancedMode(v => !v)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all ${
              advancedMode
                ? 'bg-amber-400/15 border-amber-400/40 text-amber-600 dark:text-amber-400 shadow-sm shadow-amber-400/10'
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-[#555] hover:border-slate-300 dark:hover:border-white/20'
            }`}
            title={advancedMode ? 'Tắt Advanced Mode' : 'Bật Advanced Mode'}
          >
            <Zap size={11} className={advancedMode ? 'text-amber-500' : ''} />
            Advanced
          </button>

          {/* Keyboard shortcuts help */}
          <button
            onClick={() => setShowShortcuts(v => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-all"
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle size={16} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full">
            <Coins size={11} className="text-brand-blue" />
            <span className="text-[10px] font-black text-brand-blue">{credits.toLocaleString()}</span>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-grow flex overflow-hidden">

        {/* ── SIDEBAR ── */}
        <div className="hidden md:flex w-[320px] lg:w-[360px] shrink-0 bg-white dark:bg-[#0d0d0f] border-r border-slate-200 dark:border-white/5 flex-col h-full transition-colors">
          {SidebarContent()}

          {/* Sticky run button */}
          <div className="shrink-0 p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#0d0d0f] space-y-2.5">
            {/* Status row */}
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-[#555]">
                <motion.div
                  animate={isRunning ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-brand-blue' : 'bg-emerald-400'}`}
                />
                {isRunning ? `${dept.agent} đang xử lý...` : `${dept.agent} · Sẵn sàng`}
              </div>
              <span className="font-semibold text-brand-blue flex items-center gap-1">
                <Cpu size={10} /> {model.label}
              </span>
            </div>

            <motion.button
              onClick={isRunning ? () => { abortRef.current?.abort(); } : handleRun}
              disabled={!isRunning && (!taskPrompt.trim())}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3.5 rounded-xl text-white text-[12px] font-bold uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 relative ${
                isRunning
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 shadow-red-500/20 hover:brightness-110'
                  : 'bg-gradient-to-r from-brand-blue to-blue-500 shadow-brand-blue/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-3 h-3 rounded-sm bg-white/80" />
                  Dừng Agent
                </>
              ) : (
                <>
                  <Play size={14} />
                  Chạy Agent
                  <kbd className="ml-1 text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded opacity-70 normal-case tracking-normal">⌘↵</kbd>
                  {taskQueue.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-[8px] font-black text-slate-900 flex items-center justify-center shadow-sm">
                      +{taskQueue.length}
                    </span>
                  )}
                </>
              )}
            </motion.button>

            {/* B1: Add to Queue + Queue management (Advanced only) */}
            {advancedMode && (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={addToQueue}
                    disabled={!taskPrompt.trim() || isRunning}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-slate-500 dark:text-[#666] text-[10px] font-semibold hover:border-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/[0.03] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus size={11} /> Add to Queue
                  </button>
                  {taskQueue.length > 0 && (
                    <button
                      onClick={() => setShowQueue(v => !v)}
                      className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold hover:bg-amber-400/20 transition-all"
                    >
                      <Layers size={11} /> {taskQueue.length}
                    </button>
                  )}
                </div>

                {/* B1: Queue panel */}
                <AnimatePresence>
                  {showQueue && taskQueue.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-2 space-y-1">
                        <p className="text-[8px] font-bold uppercase text-amber-500/70 tracking-widest px-1 mb-1.5">Task Queue ({taskQueue.length})</p>
                        {taskQueue.map((qt, qi) => (
                          <div key={qt.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04]">
                            <span className="text-[8px] font-black text-amber-500 w-3 shrink-0">{qi + 1}</span>
                            <span className="flex-1 text-[10px] text-slate-600 dark:text-white/60 truncate">{qt.prompt}</span>
                            <button
                              onClick={() => {
                                const updated = taskQueue.filter(q => q.id !== qt.id);
                                setTaskQueue(updated);
                                localStorage.setItem(STORAGE_KEY + "_queue", JSON.stringify(updated));
                              }}
                              className="p-0.5 text-slate-300 hover:text-red-400 transition-colors shrink-0"
                            >
                              <X size={9} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>

        {/* ── MAIN AREA ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── STUDIO VIEW ── */}
          {viewMode === 'studio' && (
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col items-center">
              {(isRunning || currentResult) ? (
                <div className="w-full max-w-3xl space-y-4">

                  {/* Task header card */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-black/[0.06] dark:border-white/[0.05] bg-white dark:bg-[#0d0d0f] overflow-hidden"
                  >
                    <div className="h-0.5 w-full" style={{ backgroundColor: dept.color, opacity: 0.5 }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Agent chain viz */}
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/10 border border-brand-blue/20">
                              <Building2 size={9} className="text-brand-blue" />
                              <span className="text-[9px] font-bold text-brand-blue">CEO Agent</span>
                            </div>
                            <ArrowRight size={9} className="text-slate-300 dark:text-[#444] shrink-0" />
                            <div
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full border"
                              style={{ backgroundColor: `${dept.color}15`, borderColor: `${dept.color}40` }}
                            >
                              <dept.icon size={9} style={{ color: dept.color }} />
                              <span className="text-[9px] font-bold" style={{ color: dept.color }}>{dept.label}</span>
                            </div>
                            <ArrowRight size={9} className="text-slate-300 dark:text-[#444] shrink-0" />
                            <div
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full border"
                              style={{ backgroundColor: `${model.color}10`, borderColor: `${model.color}35` }}
                            >
                              <Cpu size={9} style={{ color: model.color }} />
                              <span className="text-[9px] font-bold" style={{ color: model.color }}>{model.label}</span>
                            </div>
                          </div>
                          <p className="text-[13px] font-semibold text-slate-800 dark:text-white/90 line-clamp-2">
                            {currentResult?.taskDesc ?? taskPrompt}
                          </p>
                        </div>

                        {/* Status badge */}
                        {isRunning ? (
                          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20">
                            <Loader2 size={11} className="text-brand-blue animate-spin" />
                            <span className="text-[10px] font-bold text-brand-blue">Running · {elapsedSeconds}s</span>
                          </div>
                        ) : currentResult?.status === 'done' ? (
                          <div className="shrink-0 space-y-1 text-right">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              <CheckCircle2 size={11} className="text-emerald-500" />
                              <span className="text-[10px] font-bold text-emerald-500">Done</span>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-[#555] justify-end">
                              <Clock size={9} /> {currentResult.duration ?? '—'}
                              <span className="mx-0.5">·</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentResult.cost}</span>
                            </div>
                          </div>
                        ) : currentResult?.status === 'error' ? (
                          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                            <AlertCircle size={11} className="text-red-500" />
                            <span className="text-[10px] font-bold text-red-500">Error</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>

                  {/* Output / Log tabs */}
                  <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.05] bg-white dark:bg-[#0d0d0f] overflow-hidden">
                    {/* Tab bar */}
                    <div className="flex items-center border-b border-black/[0.04] dark:border-white/[0.04] px-4 pt-1">
                      {([
                        { id: 'output', label: 'Output', icon: Eye },
                        { id: 'log',    label: 'Activity Log', icon: Terminal },
                        {
                          id: 'chat',
                          label: (conversationThreads[activeDept]?.length ?? 0) > 0
                            ? `Chat (${Math.ceil((conversationThreads[activeDept]?.length ?? 0) / 2)})`
                            : 'Chat',
                          icon: MessageCircle,
                        },
                        ...(advancedMode ? [{ id: 'prompt', label: 'Prompt Inspector', icon: Code2 }] : []),
                        { id: 'setup',  label: 'Setup', icon: Settings },
                      ] as { id: string; label: string; icon: React.ElementType }[]).map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveRightTab(tab.id as 'output' | 'prompt' | 'log' | 'setup' | 'chat')}
                          className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold border-b-2 transition-all -mb-px ${
                            activeRightTab === tab.id
                              ? 'border-brand-blue text-brand-blue'
                              : 'border-transparent text-slate-400 dark:text-[#555] hover:text-slate-600 dark:hover:text-white/60'
                          }`}
                        >
                          {React.createElement(tab.icon as React.ComponentType<{ size: number }>, { size: 10 })}
                          {tab.label}
                        </button>
                      ))}

                      {/* Output toolbar */}
                      {activeRightTab === 'output' && currentResult?.status === 'done' && (
                        <div className="ml-auto flex items-center gap-1 py-1.5">
                          {currentResult.tokens && (
                            <span className="text-[9px] text-slate-300 dark:text-[#444] mr-1 flex items-center gap-1">
                              <Cpu size={8} /> {currentResult.tokens.toLocaleString()} tokens
                            </span>
                          )}
                          <span className="text-[9px] text-slate-300 dark:text-[#444] flex items-center gap-1">
                            {outputWordCount} từ · ~{readingTime} phút
                          </span>
                          {currentResult.confidence !== undefined && (
                            <span className={`text-[9px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                              currentResult.confidence >= 85
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : currentResult.confidence >= 70
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}>
                              {currentResult.confidence >= 85 ? '✓' : currentResult.confidence >= 70 ? '~' : '!'} {currentResult.confidence}% confident
                            </span>
                          )}
                          <button
                            onClick={() => copyOutput(currentResult.output)}
                            className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 hover:text-brand-blue px-2 py-1 rounded-lg hover:bg-brand-blue/[0.06] transition-all"
                          >
                            <Copy size={10} /> Copy
                          </button>
                          <button
                            onClick={() => downloadOutput(currentResult.output, currentResult.taskDesc)}
                            className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 hover:text-brand-blue px-2 py-1 rounded-lg hover:bg-brand-blue/[0.06] transition-all"
                          >
                            <Download size={10} /> .md
                          </button>
                          <button
                            onClick={() => shareOutput(currentResult)}
                            className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 hover:text-emerald-500 px-2 py-1 rounded-lg hover:bg-emerald-500/[0.06] transition-all"
                          >
                            <Share2 size={10} /> Share
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tab content */}
                    <div className="p-4 min-h-[220px]">
                      <AnimatePresence mode="wait">
                        {activeRightTab === 'output' && (
                          <motion.div
                            key="output"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            {isRunning ? (
                              <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
                                <div className="relative w-14 h-14">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="w-14 h-14 rounded-full border-2 border-brand-blue/20 border-t-brand-blue"
                                  />
                                  <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-2 rounded-full border border-dashed"
                                    style={{ borderColor: `${dept.color}40` }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <dept.icon size={18} style={{ color: dept.color }} />
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[13px] font-semibold text-slate-700 dark:text-white/70">
                                    {dept.agent} đang xử lý...
                                  </p>
                                  <p className="text-[11px] text-slate-400 dark:text-[#555] mt-1">
                                    {model.label} · {elapsedSeconds}s · Budget Guard active
                                  </p>
                                </div>
                                <div className="space-y-1.5 text-left">
                                  <AnimatePresence>
                                    {THINKING_STEPS.slice(0, thinkingStep + 1).map((step, i) => (
                                      <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: i === thinkingStep ? 1 : 0.4, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex items-center gap-2 text-[11px]"
                                      >
                                        {i === thinkingStep ? (
                                          <Loader2 size={10} className="text-brand-blue animate-spin shrink-0" />
                                        ) : (
                                          <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                                        )}
                                        <span className={i === thinkingStep ? 'text-slate-700 dark:text-white/80 font-medium' : 'text-slate-400 dark:text-[#555]'}>
                                          {step}
                                        </span>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>
                              </div>
                            ) : currentResult?.status === 'done' ? (
                              <div className="prose prose-sm max-w-none">
                                <StreamingMarkdownOutput content={currentResult.output} streaming={isStreaming} />
                              </div>
                            ) : currentResult?.status === 'error' ? (
                              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                                <AlertCircle size={28} className="text-red-400" />
                                <p className="text-[12px] text-slate-500 dark:text-[#666]">{currentResult.output}</p>
                                <button
                                  onClick={handleRun}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue/10 text-brand-blue text-[11px] font-semibold hover:bg-brand-blue/20 transition-all"
                                >
                                  <RefreshCw size={12} /> Thử lại
                                </button>
                              </div>
                            ) : null}
                          </motion.div>
                        )}

                        {activeRightTab === 'log' && (
                          <motion.div
                            key="log"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-2"
                          >
                            {activityLogs.length === 0 ? (
                              <p className="text-[11px] text-slate-400 dark:text-[#555] text-center py-8">Chưa có activity — chạy agent để bắt đầu</p>
                            ) : (
                              activityLogs.map(log => (
                                <div key={log.id} className="flex items-start gap-3 py-1.5 border-b border-black/[0.03] dark:border-white/[0.03] last:border-0">
                                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: log.color }} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold" style={{ color: log.color }}>{log.agent}</p>
                                    <p className="text-[11px] text-slate-600 dark:text-white/60">{log.action}</p>
                                  </div>
                                  <span className="text-[9px] text-slate-300 dark:text-[#444] shrink-0 font-mono">{log.time}</span>
                                </div>
                              ))
                            )}
                          </motion.div>
                        )}

                        {activeRightTab === 'chat' && (
                          <motion.div
                            key="chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex flex-col"
                            style={{ minHeight: 320 }}
                          >
                            {/* Message list */}
                            <div
                              className="flex-1 overflow-y-auto space-y-3 pb-3 pr-0.5"
                              style={{ maxHeight: 340 }}
                            >
                              {(conversationThreads[activeDept] ?? []).length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                                  <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center opacity-40"
                                    style={{ backgroundColor: `${dept.color}15` }}
                                  >
                                    <dept.icon size={22} style={{ color: dept.color }} />
                                  </div>
                                  <div>
                                    <p className="text-[12px] font-semibold text-slate-500 dark:text-[#555]">
                                      Chat với {dept.agent}
                                    </p>
                                    <p className="text-[10px] text-slate-300 dark:text-[#333] mt-1">
                                      Gửi câu hỏi để bắt đầu cuộc hội thoại
                                    </p>
                                    <p className="text-[10px] text-slate-300 dark:text-[#333]">
                                      Chat dùng chung memory với task runs
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                (conversationThreads[activeDept] ?? []).map((msg, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                  >
                                    {msg.role === 'assistant' && (
                                      <div
                                        className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mb-0.5"
                                        style={{ backgroundColor: `${dept.color}20` }}
                                      >
                                        <dept.icon size={12} style={{ color: dept.color }} />
                                      </div>
                                    )}
                                    <div
                                      className={`max-w-[82%] px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap break-words ${
                                        msg.role === 'user'
                                          ? 'rounded-2xl rounded-tr-sm bg-brand-blue text-white'
                                          : 'rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-white/80'
                                      }`}
                                    >
                                      {typeof msg.content === 'string' ? msg.content : (msg.content as { type: string; text?: string }[]).map(c => ('text' in c ? c.text : '')).join('')}
                                    </div>
                                    {msg.role === 'user' && (
                                      <div className="w-6 h-6 rounded-full shrink-0 bg-brand-blue/20 flex items-center justify-center mb-0.5">
                                        <User size={10} className="text-brand-blue" />
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}

                              {/* Typing indicator */}
                              {isChatStreaming && (
                                <div className="flex items-end gap-2 justify-start">
                                  <div
                                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mb-0.5"
                                    style={{ backgroundColor: `${dept.color}20` }}
                                  >
                                    <dept.icon size={12} style={{ color: dept.color }} />
                                  </div>
                                  <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-white/[0.06]">
                                    <div className="flex items-center gap-1">
                                      {[0, 1, 2].map(d => (
                                        <motion.div
                                          key={d}
                                          className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/30"
                                          animate={{ opacity: [0.3, 1, 0.3] }}
                                          transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div ref={chatEndRef} />
                            </div>

                            {/* Input bar */}
                            <div className="border-t border-black/[0.05] dark:border-white/[0.05] pt-3 mt-2">
                              <div className="flex items-end gap-2">
                                <textarea
                                  value={chatInput}
                                  onChange={e => setChatInput(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleChatSend();
                                    }
                                  }}
                                  placeholder={`Hỏi ${dept.agent}… (Enter gửi, Shift+Enter xuống dòng)`}
                                  rows={2}
                                  disabled={isChatStreaming}
                                  className="flex-1 text-[11px] bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-700 dark:text-white/80 resize-none focus:outline-none focus:border-brand-blue/40 placeholder:text-slate-300 dark:placeholder:text-[#333] transition-colors disabled:opacity-50"
                                />
                                <div className="flex flex-col gap-1.5 shrink-0">
                                  <button
                                    onClick={handleChatSend}
                                    disabled={!chatInput.trim() || isChatStreaming}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-brand-blue disabled:opacity-30 hover:brightness-110 transition-all shadow-sm shadow-brand-blue/20"
                                    title="Gửi (Enter)"
                                  >
                                    {isChatStreaming
                                      ? <Loader2 size={13} className="text-white animate-spin" />
                                      : <Send size={13} className="text-white" />
                                    }
                                  </button>
                                  {(conversationThreads[activeDept] ?? []).length > 0 && !isChatStreaming && (
                                    <button
                                      onClick={() => clearThread(activeDept)}
                                      title="Xoá lịch sử chat"
                                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 dark:text-[#444] hover:text-red-400 hover:bg-red-500/[0.08] transition-all border border-black/[0.06] dark:border-white/[0.06]"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeRightTab === 'prompt' && (
                          <motion.div
                            key="prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            {currentResult?.systemPrompt ? (
                              <div className="space-y-3">
                                {/* System Prompt block — editable */}
                                <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.04] overflow-hidden">
                                  <div className="flex items-center justify-between px-3 py-2 border-b border-purple-500/10">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                                      <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">System Prompt</span>
                                      {isEditingPrompt && (
                                        <span className="text-[8px] font-semibold text-purple-400/70 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-full">Editing</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {!isEditingPrompt && (
                                        <>
                                          <button
                                            onClick={() => copyOutput(currentResult.systemPrompt ?? '')}
                                            className="text-[9px] text-purple-400/60 hover:text-purple-400 transition-colors flex items-center gap-1"
                                          >
                                            <Copy size={9} /> Copy
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditedSystemPrompt(currentResult.systemPrompt ?? '');
                                              setIsEditingPrompt(true);
                                            }}
                                            className="text-[9px] text-purple-400/70 hover:text-purple-400 transition-colors flex items-center gap-1 ml-1 px-2 py-0.5 rounded-lg border border-purple-500/20 hover:bg-purple-500/10"
                                          >
                                            <Pencil size={9} /> Edit
                                          </button>
                                        </>
                                      )}
                                      {isEditingPrompt && (
                                        <button
                                          onClick={() => setIsEditingPrompt(false)}
                                          className="text-[9px] text-slate-400/70 hover:text-slate-500 transition-colors flex items-center gap-1 px-2 py-0.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                                        >
                                          <X size={9} /> Cancel
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {isEditingPrompt ? (
                                    <div className="p-3 space-y-2">
                                      <textarea
                                        value={editedSystemPrompt}
                                        onChange={e => setEditedSystemPrompt(e.target.value)}
                                        rows={6}
                                        className="w-full p-2.5 text-[10px] leading-relaxed font-mono rounded-lg border border-purple-500/30 bg-purple-500/[0.04] text-purple-800 dark:text-purple-200/80 resize-y focus:outline-none focus:ring-1 focus:ring-purple-500/40 placeholder:text-purple-400/40"
                                        placeholder="Nhập system prompt tùy chỉnh..."
                                      />
                                      <button
                                        onClick={() => executeRun(editedSystemPrompt)}
                                        disabled={!editedSystemPrompt.trim() || isRunning}
                                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-blue text-white text-[10px] font-bold hover:bg-brand-blue/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                      >
                                        {isRunning ? (
                                          <><Loader2 size={10} className="animate-spin" /> Running...</>
                                        ) : (
                                          <><Play size={10} /> Re-run với prompt này</>
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <pre className="p-3 text-[10px] leading-relaxed text-purple-800 dark:text-purple-200/80 font-mono whitespace-pre-wrap break-words">
                                      {currentResult.systemPrompt}
                                    </pre>
                                  )}
                                </div>
                                {/* User prompt block */}
                                <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.04] overflow-hidden">
                                  <div className="flex items-center justify-between px-3 py-2 border-b border-brand-blue/10">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-brand-blue" />
                                      <span className="text-[9px] font-bold text-brand-blue uppercase tracking-widest">User Message</span>
                                    </div>
                                    <button
                                      onClick={() => copyOutput(currentResult.taskDesc)}
                                      className="text-[9px] text-brand-blue/60 hover:text-brand-blue transition-colors flex items-center gap-1"
                                    >
                                      <Copy size={9} /> Copy
                                    </button>
                                  </div>
                                  <pre className="p-3 text-[10px] leading-relaxed text-blue-800 dark:text-blue-200/80 font-mono whitespace-pre-wrap break-words">
                                    Task: {currentResult.taskDesc}
                                  </pre>
                                </div>
                                {/* Meta */}
                                <div className="flex items-center gap-3 text-[9px] text-slate-400 dark:text-[#555] flex-wrap">
                                  <span className="flex items-center gap-1"><Cpu size={9} /> {currentResult.model}</span>
                                  <span className="flex items-center gap-1"><dept.icon size={9} /> {currentResult.dept}</span>
                                  {currentResult.tokens && <span className="flex items-center gap-1"><Zap size={9} /> ~{currentResult.tokens?.toLocaleString()} tokens</span>}
                                  <span className="flex items-center gap-1"><Clock size={9} /> {currentResult.timestamp}</span>
                                </div>
                                {/* Agent Memory */}
                                <div className="rounded-xl border border-black/[0.05] dark:border-white/[0.05] overflow-hidden">
                                  <div className="flex items-center justify-between px-3 py-2 border-b border-black/[0.04] dark:border-white/[0.04] bg-black/[0.02] dark:bg-white/[0.02]">
                                    <span className="text-[9px] font-bold text-slate-500 dark:text-[#888] uppercase tracking-widest flex items-center gap-1.5">
                                      <Activity size={9} /> Agent Memory
                                    </span>
                                    {(conversationThreads[activeDept]?.length ?? 0) > 0 && (
                                      <button
                                        onClick={() => { clearThread(activeDept); showToast('Đã xóa memory của ' + dept.label, 'info'); }}
                                        className="text-[8px] text-red-400 hover:text-red-500 flex items-center gap-0.5 transition-colors"
                                      >
                                        <Trash2 size={8} /> Reset
                                      </button>
                                    )}
                                  </div>
                                  <div className="p-3">
                                    {(conversationThreads[activeDept]?.length ?? 0) === 0 ? (
                                      <p className="text-[9px] text-slate-400 dark:text-[#555] italic">
                                        Chưa có memory — agent sẽ nhớ sau lần run đầu tiên.
                                      </p>
                                    ) : (
                                      <div className="space-y-1.5">
                                        <p className="text-[9px] text-slate-400 dark:text-[#555]">
                                          <span className="font-semibold text-brand-blue">{Math.floor((conversationThreads[activeDept]?.length ?? 0) / 2)}</span> turns · tối đa {MAX_THREAD_TURNS}
                                        </p>
                                        {(conversationThreads[activeDept] ?? []).slice(-4).map((msg, i) => (
                                          <div key={i} className={`text-[8px] font-mono px-2 py-1 rounded-lg truncate ${
                                            msg.role === 'user'
                                              ? 'bg-blue-500/[0.06] text-blue-600 dark:text-blue-400'
                                              : 'bg-purple-500/[0.06] text-purple-600 dark:text-purple-400'
                                          }`}>
                                            <span className="font-bold">{msg.role === 'user' ? 'You' : dept.agent}:</span>{' '}
                                            {typeof msg.content === 'string' ? msg.content.slice(0, 70) : '[content]'}…
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                                <Terminal size={24} className="text-slate-300 dark:text-[#444]" />
                                <p className="text-[11px] text-slate-400 dark:text-[#555]">Chạy agent để xem system prompt được gửi tới LLM</p>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {activeRightTab === 'setup' && (
                          <motion.div
                            key="setup"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div className="space-y-4">
                              {/* Brief textarea */}
                              <div>
                                <label className="block text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] tracking-widest mb-1.5">
                                  Agent Brief — {dept.label}
                                </label>
                                <textarea
                                  value={agentBriefs[activeDept] ?? ''}
                                  onChange={e => saveBrief(activeDept, e.target.value)}
                                  placeholder={`Mô tả context công ty, tone, sản phẩm cho ${dept.agent}...\nVD: Chúng tôi là startup B2B SaaS, target SMB Việt Nam, tone friendly-professional, product: AI workflow automation platform.`}
                                  rows={5}
                                  className="w-full text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2.5 resize-none text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-[#444] focus:outline-none focus:border-brand-blue/50 transition-colors"
                                />
                                <p className="text-[8px] text-slate-300 dark:text-[#444] mt-1">Brief này sẽ được inject vào system prompt của {dept.agent}.</p>
                              </div>

                              {/* Skills toggles — Advanced only */}
                              {advancedMode && (DEPT_SKILLS[activeDept]?.length ?? 0) > 0 && (
                                <div>
                                  <label className="block text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] tracking-widest mb-1.5">
                                    Skills — Bật kỹ năng cho {dept.agent}
                                  </label>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {DEPT_SKILLS[activeDept].map(skill => {
                                      const isOn = (enabledSkills[activeDept] ?? []).includes(skill.id);
                                      return (
                                        <button
                                          key={skill.id}
                                          onClick={() => toggleSkill(activeDept, skill.id)}
                                          className={`text-left px-2.5 py-2 rounded-xl border text-[10px] font-semibold transition-all flex items-center gap-2 ${
                                            isOn
                                              ? 'bg-brand-blue/10 border-brand-blue/40 text-brand-blue'
                                              : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-500 dark:text-[#666] hover:border-brand-blue/30 hover:text-brand-blue'
                                          }`}
                                        >
                                          <div className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center shrink-0 ${isOn ? 'bg-brand-blue border-brand-blue' : 'border-current opacity-40'}`}>
                                            {isOn && <CheckCircle2 size={7} className="text-white" />}
                                          </div>
                                          <span className="truncate">{skill.label}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {(enabledSkills[activeDept]?.length ?? 0) > 0 && (
                                    <p className="text-[8px] text-brand-blue mt-1.5 font-semibold">
                                      {enabledSkills[activeDept].length} skill active → sẽ thêm rules vào system prompt khi run
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Preview of active config */}
                              {(agentBriefs[activeDept]?.trim() || (enabledSkills[activeDept]?.length ?? 0) > 0) && (
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
                                  <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">Setup active</p>
                                  {agentBriefs[activeDept]?.trim() && (
                                    <p className="text-[9px] text-slate-500 dark:text-[#888]">📋 Brief: {agentBriefs[activeDept].slice(0, 80)}{agentBriefs[activeDept].length > 80 ? '…' : ''}</p>
                                  )}
                                  {(enabledSkills[activeDept]?.length ?? 0) > 0 && (
                                    <p className="text-[9px] text-slate-500 dark:text-[#888] mt-0.5">
                                      ⚡ Skills: {(enabledSkills[activeDept] ?? []).map(sid => DEPT_SKILLS[activeDept]?.find(s => s.id === sid)?.label).filter(Boolean).join(', ')}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Action footer */}
                  {currentResult?.status === 'done' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleRun}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-slate-600 dark:text-white/60 text-[11px] font-semibold hover:border-brand-blue/40 hover:text-brand-blue transition-all"
                      >
                        <RefreshCw size={12} /> Chạy lại
                      </button>
                      <button
                        onClick={() => copyOutput(currentResult.output)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-slate-600 dark:text-white/60 text-[11px] font-semibold hover:border-brand-blue/40 hover:text-brand-blue transition-all"
                      >
                        <Copy size={12} /> Copy output
                      </button>
                      <button
                        onClick={() => downloadOutput(currentResult.output, currentResult.taskDesc)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-slate-600 dark:text-white/60 text-[11px] font-semibold hover:border-brand-blue/40 hover:text-brand-blue transition-all"
                      >
                        <Download size={12} /> Download .md
                      </button>
                      <button
                        onClick={() => shareOutput(currentResult)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-slate-600 dark:text-white/60 text-[11px] font-semibold hover:border-emerald-500/40 hover:text-emerald-600 transition-all"
                      >
                        <Share2 size={12} /> Share
                      </button>
                      <a
                        href="https://github.com/paperclip-ing/paperclip"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-slate-600 dark:text-white/60 text-[11px] font-semibold hover:border-brand-blue/40 hover:text-brand-blue transition-all"
                      >
                        <ExternalLink size={12} /> Self-host
                      </a>
                      <div className="ml-auto flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-[#555]">
                        <Bot size={10} />
                        {model.label} · {currentResult.cost} · {currentResult.tokens?.toLocaleString() ?? '—'} tokens
                      </div>
                    </div>
                  )}

                  {/* Follow-up suggestions */}
                  {currentResult?.status === 'done' && followUpSuggestions.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-[#555] uppercase tracking-widest">Tiếp theo:</span>
                      {followUpSuggestions.map(s => (
                        <motion.button
                          key={s}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => setTaskPrompt(s)}
                          className="flex items-center gap-1 text-[10px] font-semibold text-brand-blue bg-brand-blue/[0.07] border border-brand-blue/20 px-2.5 py-1 rounded-full hover:bg-brand-blue/15 transition-all"
                        >
                          <ArrowRight size={9} />
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  )}

                </div>
              ) : (
                /* ── Empty state ── */
                <div className="flex flex-col items-center justify-center gap-6 text-center w-full max-w-lg my-auto">

                  {/* Animated org chart preview */}
                  <div className="w-full rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden">
                    <div className="px-4 pt-4 pb-2">
                      <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] tracking-widest mb-3">
                        AI Org Structure — Sẵn sàng
                      </p>
                      <OrgChartMini activeDeptId={activeDept} runningDepts={[]} />
                    </div>
                    <div className="px-4 pb-4">
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {[
                          { icon: ShieldCheck, label: 'Budget Guard', color: '#10b981' },
                          { icon: Network, label: 'Multi-Agent', color: '#0090ff' },
                          { icon: GitBranch, label: 'Workflow', color: '#8b5cf6' },
                          { icon: Eye, label: 'Audit Log', color: '#f59e0b' },
                        ].map(b => (
                          <div
                            key={b.label}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold border"
                            style={{ backgroundColor: `${b.color}10`, borderColor: `${b.color}30`, color: b.color }}
                          >
                            <b.icon size={8} />
                            <span className="hidden sm:inline">{b.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ backgroundColor: `${dept.color}15` }}
                    >
                      <dept.icon size={24} style={{ color: dept.color }} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-white/80">
                      {dept.agent} sẵn sàng
                    </p>
                    <p className="text-[12px] text-slate-400 dark:text-[#555] mt-1 max-w-xs mx-auto">
                      Chọn task nhanh bên dưới hoặc mô tả task bất kỳ ở sidebar
                    </p>
                  </div>

                  {/* Featured task suggestions */}
                  <div className="grid grid-cols-2 gap-2.5 w-full">
                    {dept.tasks.map((t, i) => (
                      <motion.button
                        key={t}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        onClick={() => setTaskPrompt(t)}
                        className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] text-left hover:border-brand-blue/40 hover:bg-brand-blue/[0.02] transition-all group cursor-pointer"
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center mb-2"
                          style={{ backgroundColor: `${dept.color}15` }}
                        >
                          <Zap size={11} style={{ color: dept.color }} />
                        </div>
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-white/70 group-hover:text-brand-blue transition-colors">{t}</p>
                        <p className="text-[9px] text-slate-400 dark:text-[#555] mt-0.5 flex items-center gap-1">
                          <Cpu size={8} /> {model.label}
                        </p>
                      </motion.button>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 dark:text-[#555]">
                    Hoặc nhập task tùy chỉnh bất kỳ ở sidebar <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 font-mono text-[9px]">⌘↵</kbd>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── HISTORY VIEW ── */}
          {viewMode === 'history' && (
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              {taskHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <History size={24} className="text-slate-300 dark:text-[#444]" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400 dark:text-[#555]">Chưa có task nào</p>
                  <p className="text-[12px] text-slate-400 dark:text-[#555]">Chạy agent đầu tiên trong tab Studio!</p>
                  <button
                    onClick={() => setViewMode('studio')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[11px] font-semibold hover:bg-brand-blue/15 transition-all"
                  >
                    <Play size={12} /> Đến Studio
                  </button>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-white/80">{filteredHistory.length} / {taskHistory.length} tasks</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={exportHistoryJSON}
                        className="text-[10px] font-semibold text-slate-400 hover:text-brand-blue transition-colors flex items-center gap-1"
                      >
                        <Download size={10} /> Export JSON
                      </button>
                      <span className="text-slate-200 dark:text-[#333]">|</span>
                      <button
                        onClick={() => {
                          setTaskHistory([]);
                          localStorage.removeItem(STORAGE_KEY);
                          showToast('Đã xóa lịch sử', 'success');
                        }}
                        className="text-[10px] font-semibold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={10} /> Xóa tất cả
                      </button>
                    </div>
                  </div>

                  {/* Mini stats — shown in Simple mode */}
                  {!advancedMode && taskHistory.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-[10px] font-bold text-brand-blue">
                        <History size={9} /> {taskHistory.length} tasks
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <DollarSign size={9} /> ${spentBudget.toFixed(2)} spent
                      </span>
                      {totalTokens > 0 && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                          <Cpu size={9} /> {(totalTokens / 1000).toFixed(1)}K tokens
                        </span>
                      )}
                    </div>
                  )}

                  {/* Search + filter */}
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <input
                        value={historySearch}
                        onChange={e => setHistorySearch(e.target.value)}
                        placeholder="Tìm kiếm task..."
                        className="w-full text-[11px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-[#444] focus:outline-none focus:border-brand-blue/50 transition-colors"
                      />
                      <History size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      {historySearch && (
                        <button onClick={() => setHistorySearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-400 transition-colors">
                          <X size={11} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[{ id: 'all', label: 'Tất cả' }, ...DEPARTMENTS.filter(d => d.id !== 'ceo').map(d => ({ id: d.id, label: d.label.replace(' AI', '').replace(' Agent', '') }))].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setHistoryFilter(f.id)}
                          className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                            historyFilter === f.id
                              ? 'bg-brand-blue text-white border-brand-blue'
                              : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-[#666] hover:border-brand-blue/40'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                      {/* B3: Star filter tab */}
                      <button
                        onClick={() => setHistoryStarFilter(v => !v)}
                        className={`flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                          historyStarFilter
                            ? 'bg-amber-400 text-slate-900 border-amber-400'
                            : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-[#666] hover:border-amber-400/40 hover:text-amber-500'
                        }`}
                      >
                        <Star size={9} className={historyStarFilter ? 'fill-slate-900' : ''} />
                        Starred {taskHistory.filter(t => t.starred).length > 0 && `(${taskHistory.filter(t => t.starred).length})`}
                      </button>
                      {(historySearch || historyFilter !== 'all' || historyStarFilter) && (
                        <span className="text-[9px] text-slate-400 ml-auto">{filteredHistory.length} kết quả</span>
                      )}
                    </div>
                  </div>

                  {/* A4: Skeleton loading */}
                  {!historyLoaded ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl border border-black/[0.06] dark:border-white/[0.05] bg-white dark:bg-[#0d0d0f] overflow-hidden animate-pulse">
                          <div className="h-0.5 w-full bg-slate-200 dark:bg-white/10" />
                          <div className="p-4 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-20 rounded-full bg-slate-100 dark:bg-white/10" />
                              <div className="h-3 w-14 rounded-full bg-slate-100 dark:bg-white/10" />
                              <div className="h-3 w-10 rounded-full bg-slate-100 dark:bg-white/10 ml-auto" />
                            </div>
                            <div className="h-3.5 w-3/4 rounded-full bg-slate-100 dark:bg-white/10" />
                            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-white/10" />
                            <div className="h-3 w-2/3 rounded-full bg-slate-100 dark:bg-white/10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    filteredHistory.map(item => {
                      const itemDept = DEPARTMENTS.find(d => d.label === item.dept) ?? DEPARTMENTS[1];
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`group rounded-xl border bg-white dark:bg-[#0d0d0f] overflow-hidden hover:border-brand-blue/30 transition-colors ${
                            item.starred ? 'border-amber-400/40 dark:border-amber-400/30' : 'border-black/[0.06] dark:border-white/[0.05]'
                          }`}
                        >
                          <div className="h-0.5 w-full" style={{ backgroundColor: itemDept.color, opacity: 0.4 }} />
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border"
                                    style={{ backgroundColor: `${itemDept.color}15`, borderColor: `${itemDept.color}40`, color: itemDept.color }}
                                  >
                                    <itemDept.icon size={8} />
                                    {item.dept}
                                  </span>
                                  <span className="text-[9px] text-slate-300 dark:text-[#444]">·</span>
                                  <span className="text-[10px] text-slate-400 dark:text-[#555] flex items-center gap-1">
                                    <Cpu size={9} /> {item.model}
                                  </span>
                                  {item.duration && (
                                    <>
                                      <span className="text-[9px] text-slate-300 dark:text-[#444]">·</span>
                                      <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                                        <Clock size={8} /> {item.duration}
                                      </span>
                                    </>
                                  )}
                                  <span className="text-[9px] text-slate-300 dark:text-[#444] ml-auto">{item.timestamp}</span>
                                </div>
                                <p className="text-[12px] font-semibold text-slate-700 dark:text-white/80 line-clamp-1">{item.taskDesc}</p>
                                <p className="text-[11px] text-slate-500 dark:text-[#666] mt-1.5 line-clamp-2 leading-relaxed">{item.output?.slice(0, 180)}...</p>
                              </div>
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                  {item.cost}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  {/* B3: Star button */}
                                  <button
                                    onClick={(e) => toggleStar(e, item.id)}
                                    className={`p-1.5 rounded-lg transition-all ${
                                      item.starred
                                        ? 'text-amber-400 bg-amber-400/10'
                                        : 'text-slate-300 dark:text-[#444] hover:text-amber-400 hover:bg-amber-400/10'
                                    }`}
                                  >
                                    <Star size={11} className={item.starred ? 'fill-amber-400' : ''} />
                                  </button>
                                  <button
                                    onClick={() => { setCurrentResult(item); setViewMode('studio'); }}
                                    className="p-1.5 rounded-lg text-slate-300 dark:text-[#444] hover:text-brand-blue hover:bg-brand-blue/10 transition-all"
                                  >
                                    <Eye size={11} />
                                  </button>
                                  <button
                                    onClick={(e) => deleteHistoryItem(e, item.id)}
                                    className="p-1.5 rounded-lg text-slate-300 dark:text-[#444] hover:text-red-500 hover:bg-red-500/10 transition-all"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── ANALYTICS VIEW ── */}
          {viewMode === 'analytics' && (
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              <div className="max-w-3xl mx-auto space-y-5">

                {/* Header */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-800 dark:text-white/90">Analytics & Overview</h3>
                  <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5">Tổng hợp hoạt động của AI org</p>
                </div>

                {/* Metrics row */}
                <div className="flex gap-3 flex-wrap">
                  <MetricCard
                    icon={Play}
                    label="Tasks đã chạy"
                    value={taskHistory.length}
                    sub={`${runCount} lần trong session`}
                    color="#0090ff"
                    trend="up"
                  />
                  <MetricCard
                    icon={DollarSign}
                    label="Tổng chi phí"
                    value={`$${spentBudget.toFixed(2)}`}
                    sub={`Limit $${budgetLimit.toFixed(2)}`}
                    color="#10b981"
                    trend={budgetPct > 70 ? 'up' : 'flat'}
                  />
                  <MetricCard
                    icon={Cpu}
                    label="Tokens dùng"
                    value={totalTokens > 0 ? `${(totalTokens / 1000).toFixed(1)}K` : '—'}
                    sub="Across all agents"
                    color="#8b5cf6"
                    trend="flat"
                  />
                  <MetricCard
                    icon={Star}
                    label="Dept. yêu thích"
                    value={(() => {
                      if (!taskHistory.length) return '—';
                      const counts: Record<string, number> = {};
                      taskHistory.forEach(t => { counts[t.dept] = (counts[t.dept] ?? 0) + 1; });
                      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(' AI', '') ?? '—';
                    })()}
                    sub="Most used agent"
                    color="#f59e0b"
                  />
                </div>

                {/* Budget progress */}
                <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-white/80 flex items-center gap-2">
                      <ShieldCheck size={13} className="text-emerald-500" /> Budget Guard Status
                    </p>
                    <button onClick={resetBudget} className="text-[9px] font-semibold text-slate-400 hover:text-red-400 transition-colors">
                      Reset
                    </button>
                  </div>
                  <BudgetMeter limit={budgetLimit} spent={spentBudget} />
                  <p className="text-[9px] text-slate-400 dark:text-[#555]">
                    Đã sử dụng {budgetPct.toFixed(1)}% ngân sách. {budgetPct > 80 ? '⚠️ Gần hết — cân nhắc tăng limit.' : '✓ Trong giới hạn an toàn.'}
                  </p>
                </div>

                {/* Department breakdown */}
                <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-4">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-white/80 mb-3">Department Activity</p>
                  {DEPARTMENTS.filter(d => d.id !== 'ceo').map(d => {
                    const count = taskHistory.filter(t => t.dept === d.label).length;
                    const totalCost = taskHistory
                      .filter(t => t.dept === d.label)
                      .reduce((sum, t) => sum + parseFloat(t.cost.replace('$', '') || '0'), 0);
                    const pct = taskHistory.length > 0 ? (count / taskHistory.length) * 100 : 0;

                    return (
                      <div key={d.id} className="mb-3 last:mb-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <d.icon size={11} style={{ color: d.color }} />
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-white/70">{d.label}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400">
                            <span>{count} tasks</span>
                            {totalCost > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">${totalCost.toFixed(2)}</span>}
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: d.color, opacity: 0.7 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {taskHistory.length === 0 && (
                    <p className="text-[11px] text-slate-400 dark:text-[#555] text-center py-4">Chưa có data — chạy agent để xem analytics</p>
                  )}
                </div>

                {/* Model usage */}
                <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-4">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-white/80 mb-3">LLM Model Usage</p>
                  {LLM_MODELS.map(m => {
                    const count = taskHistory.filter(t => t.model === m.label).length;
                    const pct = taskHistory.length > 0 ? (count / taskHistory.length) * 100 : 0;
                    return (
                      <div key={m.id} className="flex items-center gap-3 mb-2 last:mb-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                        <span className="text-[10px] text-slate-600 dark:text-white/60 w-28 shrink-0">{m.label}</span>
                        <div className="flex-1 h-1 rounded-full bg-black/[0.04] dark:bg-white/[0.04] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: m.color, opacity: 0.7 }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                  {taskHistory.length === 0 && (
                    <p className="text-[11px] text-slate-400 dark:text-[#555] text-center py-4">Chưa có data</p>
                  )}
                </div>

                {/* Features highlight */}
                <div className="rounded-xl border border-brand-blue/15 bg-brand-blue/[0.03] p-4">
                  <p className="text-[11px] font-bold text-brand-blue mb-3 flex items-center gap-2">
                    <Workflow size={12} /> Platform capabilities
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Network, label: 'Multi-Agent Orchestration', desc: 'CEO → Departments', color: '#0090ff' },
                      { icon: ShieldCheck, label: 'Budget Guard', desc: 'Hard spend limits', color: '#10b981' },
                      { icon: GitBranch, label: 'Workflow Builder', desc: 'Drag & drop flows', color: '#8b5cf6' },
                      { icon: Eye, label: 'Full Audit Log', desc: 'Every action logged', color: '#f59e0b' },
                      { icon: RefreshCw, label: 'Auto Failover', desc: 'Zero downtime', color: '#06b6d4' },
                      { icon: Terminal, label: 'Prompt Inspector', desc: 'Debug any node', color: '#ec4899' },
                    ].map(f => (
                      <div key={f.label} className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                        <f.icon size={11} style={{ color: f.color }} className="mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-semibold text-slate-700 dark:text-white/80">{f.label}</p>
                          <p className="text-[9px] text-slate-400 dark:text-[#555]">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── CANVAS VIEW ── */}
          {viewMode === 'canvas' && (() => {
            const deptNodes = DEPARTMENTS.filter(d => d.tier === 'department');
            const ceoNode = canvasNodes.find(n => n.id === 'ceo')!;
            const NODE_W = 152;
            const NODE_H = 100;
            const CANVAS_H = 560;

            const getNodeCenter = (id: string) => {
              const n = canvasNodes.find(x => x.id === id);
              if (!n) return { x: 0, y: 0 };
              return { x: n.x + NODE_W / 2, y: n.y + NODE_H / 2 };
            };

            const reportCenter = { x: (CANVAS_INITIAL_POSITIONS.report.x) + NODE_W / 2, y: CANVAS_INITIAL_POSITIONS.report.y + 56 };

            const statusColor = (s: CanvasNodeState['status']) => {
              if (s === 'running') return '#0090ff';
              if (s === 'done')    return '#10b981';
              if (s === 'error')   return '#ef4444';
              return '#334155';
            };

            return (
              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                <div className="max-w-4xl mx-auto space-y-4">

                  {/* Header */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-800 dark:text-white/90 flex items-center gap-2">
                        <Workflow size={15} className="text-brand-blue" /> Multi-Agent Canvas
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5">Run tất cả agents song song — CEO tổng hợp executive summary</p>
                    </div>
                    {isCanvasRunning && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-bold">
                        <Loader2 size={10} className="animate-spin" /> Running…
                      </div>
                    )}
                    {canvasReport.status === 'done' && !isCanvasRunning && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        <CheckCircle2 size={10} /> Flow completed
                      </div>
                    )}
                  </div>

                  {/* Prompt input */}
                  <div className="flex gap-2">
                    <textarea
                      value={canvasPrompt}
                      onChange={e => setCanvasPrompt(e.target.value)}
                      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); runCanvasFlow(); } }}
                      placeholder="Mô tả brief / mục tiêu cho toàn bộ org… VD: Lên kế hoạch ra mắt sản phẩm mới trong Q2, target SMB Việt Nam"
                      rows={2}
                      disabled={isCanvasRunning}
                      className="flex-1 text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2.5 resize-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#444] focus:outline-none focus:border-brand-blue/50 transition-colors disabled:opacity-50"
                    />
                    <motion.button
                      onClick={runCanvasFlow}
                      disabled={isCanvasRunning || !canvasPrompt.trim()}
                      whileTap={{ scale: 0.97 }}
                      className="px-5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[11px] font-bold uppercase tracking-widest shadow-md shadow-brand-blue/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                    >
                      {isCanvasRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                      {isCanvasRunning ? 'Running' : 'Run All'}
                    </motion.button>
                    {isCanvasRunning && (
                      <motion.button
                        onClick={() => canvasAbortRef.current?.abort()}
                        whileTap={{ scale: 0.97 }}
                        className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-bold flex items-center gap-1.5 shrink-0 hover:bg-red-500/20 transition-colors"
                      >
                        <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                        Stop All
                      </motion.button>
                    )}
                  </div>

                  {/* Canvas area — desktop drag canvas OR mobile list fallback */}
                  {isMobile ? (
                    /* ── Mobile list view ── */
                    <div className="space-y-2">
                      <p className="text-[9px] text-slate-400 dark:text-[#555] uppercase tracking-widest font-bold">Agents</p>
                      {/* CEO */}
                      {(() => {
                        const ceoDept = DEPARTMENTS.find(d => d.id === 'ceo')!;
                        const ceoNodeM = canvasNodes.find(n => n.id === 'ceo');
                        const CIcon = ceoDept.icon;
                        return (
                          <div className="rounded-xl border-2 border-brand-blue/30 bg-white dark:bg-[#0d0d0f] shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 bg-brand-blue/[0.06]">
                              <CIcon size={11} className="text-brand-blue shrink-0" />
                              <span className="text-[10px] font-bold text-brand-blue">{ceoDept.label}</span>
                              <span className="ml-auto text-[8px] text-slate-400">Orchestrator</span>
                            </div>
                            {ceoNodeM?.output && (
                              <div className="px-3 py-2 text-[9px] text-slate-500 dark:text-[#888]">
                                {ceoNodeM.output.slice(0, 120)}…
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      {/* Dept nodes */}
                      {deptNodes.map(d => {
                        const n = canvasNodes.find(x => x.id === d.id);
                        const DIcon = d.icon;
                        return (
                          <div
                            key={d.id}
                            className="rounded-xl border bg-white dark:bg-[#0d0d0f] shadow-sm overflow-hidden transition-all"
                            style={{ borderColor: n?.status === 'running' ? d.color : n?.status === 'done' ? '#10b981' : n?.status === 'error' ? '#ef4444' : 'rgba(0,0,0,0.06)' }}
                          >
                            <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: `${d.color}0d` }}>
                              <DIcon size={10} style={{ color: d.color }} className="shrink-0" />
                              <span className="text-[10px] font-bold" style={{ color: d.color }}>{d.label.replace(' Agent', '').replace(' AI', '')}</span>
                              <div className="ml-auto shrink-0">
                                {n?.status === 'running' && <Loader2 size={9} className="animate-spin text-brand-blue" />}
                                {n?.status === 'done'    && <CheckCircle2 size={9} className="text-emerald-500" />}
                                {n?.status === 'error'   && <AlertCircle size={9} className="text-red-400" />}
                                {(!n || n.status === 'idle') && <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#444]" />}
                              </div>
                            </div>
                            {n?.output && (
                              <div className="px-3 py-2 text-[9px] text-slate-500 dark:text-[#888] line-clamp-3">
                                {n.output.slice(0, 120)}{n.output.length > 120 ? '…' : ''}
                              </div>
                            )}
                            {!n?.output && (
                              <div className="px-3 py-1.5 text-[9px] text-slate-300 dark:text-[#555] italic">{d.tasks[0]}</div>
                            )}
                          </div>
                        );
                      })}
                      {/* Report summary */}
                      <div
                        className="rounded-xl border bg-white dark:bg-[#0d0d0f] shadow-sm overflow-hidden transition-all"
                        style={{ borderColor: canvasReport.status === 'running' ? '#8b5cf6' : canvasReport.status === 'done' ? '#10b981' : 'rgba(0,0,0,0.06)' }}
                      >
                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/[0.06]">
                          <Network size={10} className="text-purple-500 shrink-0" />
                          <span className="text-[10px] font-bold text-purple-500">CEO Executive Summary</span>
                          {canvasReport.status === 'running' && <Loader2 size={9} className="animate-spin text-purple-400 ml-auto" />}
                          {canvasReport.status === 'done'    && <CheckCircle2 size={9} className="text-emerald-500 ml-auto" />}
                          {canvasReport.status === 'idle'    && <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#444] ml-auto" />}
                        </div>
                        <div className="px-3 py-2 text-[9px] text-slate-500 dark:text-[#888]">
                          {canvasReport.output ? canvasReport.output.slice(0, 140) + (canvasReport.output.length > 140 ? '…' : '') : <span className="italic text-slate-300 dark:text-[#555]">Chờ tất cả departments…</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                  /* ── Desktop drag canvas ── */
                  <div
                    className="relative rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.015] overflow-hidden select-none"
                    style={{ height: CANVAS_H }}
                    onMouseMove={e => {
                      if (!dragNode) return;
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.current.x, rect.width - NODE_W));
                      const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.current.y, CANVAS_H - NODE_H));
                      setCanvasNodes(prev => prev.map(n => n.id === dragNode ? { ...n, x, y } : n));
                    }}
                    onMouseUp={() => {
                      // P1: Persist node positions on drag end
                      if (dragNode) {
                        setCanvasNodes(prev => {
                          try { localStorage.setItem(STORAGE_KEY + '_canvas_nodes', JSON.stringify(prev)); } catch { /* ignore */ }
                          return prev;
                        });
                      }
                      setDragNode(null);
                    }}
                    onMouseLeave={() => setDragNode(null)}
                  >
                    {/* Grid dots */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="canvas-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                          <circle cx="1" cy="1" r="1" fill="#94a3b8" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#canvas-grid)" />
                    </svg>

                    {/* SVG arrows */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        {(['idle','running','done','error'] as const).map(s => (
                          <marker key={s} id={`arrow-${s}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L8,3 z" fill={statusColor(s)} />
                          </marker>
                        ))}
                      </defs>
                      {/* CEO → dept arrows */}
                      {deptNodes.map(d => {
                        const from = ceoNode ? getNodeCenter('ceo') : { x: 0, y: 0 };
                        const to   = getNodeCenter(d.id);
                        const n    = canvasNodes.find(x => x.id === d.id);
                        const s    = n?.status ?? 'idle';
                        return (
                          <line
                            key={`ceo-${d.id}`}
                            x1={from.x} y1={from.y + NODE_H / 2 - 8}
                            x2={to.x}   y2={to.y - NODE_H / 2 + 8}
                            stroke={statusColor(s)}
                            strokeWidth="1.5"
                            strokeDasharray={s === 'idle' ? '4 4' : 'none'}
                            markerEnd={`url(#arrow-${s})`}
                            opacity={0.7}
                          />
                        );
                      })}
                      {/* dept → report arrows */}
                      {deptNodes.map(d => {
                        const from = getNodeCenter(d.id);
                        const n    = canvasNodes.find(x => x.id === d.id);
                        const s    = n?.status ?? 'idle';
                        return (
                          <line
                            key={`${d.id}-report`}
                            x1={from.x} y1={from.y + NODE_H / 2 - 8}
                            x2={reportCenter.x} y2={reportCenter.y - 20}
                            stroke={statusColor(s)}
                            strokeWidth="1.5"
                            strokeDasharray={s === 'idle' ? '4 4' : 'none'}
                            markerEnd={`url(#arrow-${s})`}
                            opacity={0.5}
                          />
                        );
                      })}
                    </svg>

                    {/* CEO node */}
                    {ceoNode && (() => {
                      const ceoDept = DEPARTMENTS.find(d => d.id === 'ceo')!;
                      return (
                        <div
                          className="absolute cursor-grab active:cursor-grabbing"
                          style={{ left: ceoNode.x, top: ceoNode.y, width: NODE_W, zIndex: dragNode === 'ceo' ? 10 : 1 }}
                          onMouseDown={e => {
                            e.preventDefault();
                            dragOffset.current = { x: e.clientX - (e.currentTarget.getBoundingClientRect().left), y: e.clientY - (e.currentTarget.getBoundingClientRect().top) };
                            setDragNode('ceo');
                          }}
                        >
                          <div className="rounded-2xl border-2 border-brand-blue/40 bg-white dark:bg-[#0d0d0f] shadow-lg shadow-brand-blue/10 overflow-hidden" style={{ height: NODE_H }}>
                            <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5 border-b border-black/[0.05] dark:border-white/[0.05]" style={{ backgroundColor: `${ceoDept.color}15` }}>
                              <ceoDept.icon size={11} style={{ color: ceoDept.color }} className="shrink-0" />
                              <span className="text-[10px] font-bold truncate" style={{ color: ceoDept.color }}>{ceoDept.label}</span>
                              <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor(ceoNode.status) }} />
                            </div>
                            <div className="px-3 py-1.5">
                              <p className="text-[8px] text-slate-400 dark:text-[#555] line-clamp-2 leading-relaxed">
                                {ceoNode.status === 'idle' ? 'Tổng hợp executive summary từ tất cả departments' : ceoNode.output.slice(0, 80) || '…'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Dept nodes */}
                    {deptNodes.map(d => {
                      const n = canvasNodes.find(x => x.id === d.id);
                      if (!n) return null;
                      const DIcon = d.icon;
                      return (
                        <div
                          key={d.id}
                          className="absolute cursor-grab active:cursor-grabbing"
                          style={{ left: n.x, top: n.y, width: NODE_W, zIndex: dragNode === d.id ? 10 : 1 }}
                          onMouseDown={e => {
                            e.preventDefault();
                            dragOffset.current = { x: e.clientX - (e.currentTarget.getBoundingClientRect().left), y: e.clientY - (e.currentTarget.getBoundingClientRect().top) };
                            setDragNode(d.id);
                          }}
                        >
                          <div
                            className="rounded-2xl border bg-white dark:bg-[#0d0d0f] shadow-md overflow-hidden transition-shadow"
                            style={{
                              height: NODE_H,
                              borderColor: n.status === 'running' ? d.color : n.status === 'done' ? '#10b981' : n.status === 'error' ? '#ef4444' : 'rgba(0,0,0,0.06)',
                              boxShadow: n.status === 'running' ? `0 0 0 2px ${d.color}30` : undefined,
                            }}
                          >
                            <div className="flex items-center gap-2 px-2.5 pt-2 pb-1.5 border-b border-black/[0.04] dark:border-white/[0.04]" style={{ backgroundColor: `${d.color}10` }}>
                              <DIcon size={10} style={{ color: d.color }} className="shrink-0" />
                              <span className="text-[9px] font-bold truncate" style={{ color: d.color }}>{d.label.replace(' Agent', '').replace(' AI', '')}</span>
                              <div className="ml-auto shrink-0">
                                {n.status === 'running' && <Loader2 size={9} className="animate-spin text-brand-blue" />}
                                {n.status === 'done'    && <CheckCircle2 size={9} className="text-emerald-500" />}
                                {n.status === 'error'   && <AlertCircle size={9} className="text-red-400" />}
                                {n.status === 'idle'    && <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#444]" />}
                              </div>
                            </div>
                            <div className="px-2.5 py-1.5">
                              <p className="text-[8px] text-slate-400 dark:text-[#666] line-clamp-3 leading-relaxed">
                                {n.status === 'idle' ? d.tasks[0] : (n.output.slice(0, 100) || '…')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Report node — pinned at bottom center */}
                    <div
                      className="absolute"
                      style={{
                        left: CANVAS_INITIAL_POSITIONS.report.x,
                        top: CANVAS_INITIAL_POSITIONS.report.y,
                        width: NODE_W * 2 + 16,
                      }}
                    >
                      <div
                        className="rounded-2xl border bg-white dark:bg-[#0d0d0f] shadow-lg overflow-hidden transition-all"
                        style={{
                          borderColor: canvasReport.status === 'running' ? '#8b5cf6' : canvasReport.status === 'done' ? '#10b981' : 'rgba(0,0,0,0.06)',
                          boxShadow: canvasReport.status === 'running' ? '0 0 0 2px #8b5cf630' : undefined,
                        }}
                      >
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-black/[0.04] dark:border-white/[0.04] bg-purple-500/[0.06]">
                          <Network size={10} className="text-purple-500 shrink-0" />
                          <span className="text-[9px] font-bold text-purple-500">CEO Executive Summary</span>
                          <div className="ml-auto shrink-0">
                            {canvasReport.status === 'running' && <Loader2 size={9} className="animate-spin text-purple-500" />}
                            {canvasReport.status === 'done'    && <CheckCircle2 size={9} className="text-emerald-500" />}
                            {canvasReport.status === 'idle'    && <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#444]" />}
                          </div>
                        </div>
                        <div className="px-3 py-2">
                          {canvasReport.output ? (
                            <p className="text-[8px] text-slate-500 dark:text-[#888] line-clamp-3 leading-relaxed">{canvasReport.output.slice(0, 160)}{canvasReport.output.length > 160 ? '…' : ''}</p>
                          ) : (
                            <p className="text-[8px] text-slate-300 dark:text-[#555] italic">Chờ tất cả departments hoàn thành…</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  )} {/* end isMobile ternary */}

                  {/* Full report output */}
                  {canvasReport.output && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-purple-500/20 bg-white dark:bg-[#0d0d0f] shadow-md overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/10 bg-purple-500/[0.04]">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-400" />
                          <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">CEO Executive Summary</span>
                          {canvasReport.status === 'running' && <Loader2 size={9} className="animate-spin text-purple-400" />}
                          {canvasReport.status === 'done' && <CheckCircle2 size={10} className="text-emerald-500" />}
                        </div>
                        {canvasReport.status === 'done' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { navigator.clipboard.writeText(canvasReport.output); showToast('Copied!', 'success'); }}
                              className="text-[9px] text-purple-400/60 hover:text-purple-400 transition-colors flex items-center gap-1"
                            >
                              <Copy size={9} /> Copy
                            </button>
                            <button
                              onClick={() => downloadOutput(canvasReport.output, `executive-summary-${new Date().toISOString().slice(0,10)}`)}
                              className="text-[9px] text-purple-400/60 hover:text-purple-400 transition-colors flex items-center gap-1"
                            >
                              <Download size={9} /> .md
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <StreamingMarkdownOutput content={canvasReport.output} streaming={canvasReport.status === 'running'} />
                      </div>
                    </motion.div>
                  )}

                  {/* Dept output cards */}
                  {canvasNodes.some(n => n.output) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {deptNodes.map(d => {
                        const n = canvasNodes.find(x => x.id === d.id);
                        if (!n?.output) return null;
                        const DIcon = d.icon;
                        return (
                          <motion.div
                            key={d.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border bg-white dark:bg-[#0d0d0f] overflow-hidden shadow-sm"
                            style={{ borderColor: n.status === 'done' ? '#10b98130' : `${d.color}25` }}
                          >
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-black/[0.04] dark:border-white/[0.04]" style={{ backgroundColor: `${d.color}08` }}>
                              <DIcon size={10} style={{ color: d.color }} />
                              <span className="text-[10px] font-bold" style={{ color: d.color }}>{d.label}</span>
                              {n.status === 'running' && <Loader2 size={9} className="animate-spin ml-auto" style={{ color: d.color }} />}
                              {n.status === 'done'    && <CheckCircle2 size={9} className="text-emerald-500 ml-auto" />}
                              {n.status === 'error'   && <AlertCircle size={9} className="text-red-400 ml-auto" />}
                            </div>
                            <div className="p-3 max-h-48 overflow-y-auto">
                              <StreamingMarkdownOutput content={n.output} streaming={n.streaming} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* ── Mobile Bottom Sheet ── */}
      <AnimatePresence>
        {showMobileSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden absolute inset-0 z-[300] bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileSheet(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d0d0f] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="relative flex items-center justify-between px-5 pt-5 pb-3 shrink-0 border-b border-slate-100 dark:border-white/5">
                <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                <p className="text-[12px] font-bold text-slate-700 dark:text-white/80">Cấu hình Agent</p>
                <button onClick={() => setShowMobileSheet(false)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {SidebarContent()}
              </div>

              <div className="shrink-0 p-4 border-t border-slate-100 dark:border-white/5">
                <motion.button
                  onClick={() => { setShowMobileSheet(false); handleRun(); }}
                  disabled={isRunning || !taskPrompt.trim()}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Play size={14} /> Chạy {dept.agent}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success Burst ── */}
      <AnimatePresence>
        {showSuccessBurst && (
          <div className="absolute inset-0 pointer-events-none z-[500] flex items-center justify-center overflow-hidden">
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * 360;
              const distance = 80 + Math.random() * 60;
              const color = [dept.color, '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'][i % 6];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [1, 1, 0],
                    scale: [0, 1.2, 0.8],
                    x: Math.cos((angle * Math.PI) / 180) * distance,
                    y: Math.sin((angle * Math.PI) / 180) * distance,
                  }}
                  transition={{ duration: 0.9, delay: i * 0.04, ease: 'easeOut' }}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* ── Keyboard Shortcuts Modal (A3) ── */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 12 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xs bg-white dark:bg-[#111113] rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <HelpCircle size={16} className="text-brand-blue" />
                  <p className="text-[13px] font-bold text-slate-800 dark:text-white">Keyboard Shortcuts</p>
                </div>
                <button onClick={() => setShowShortcuts(false)} className="p-1.5 text-slate-300 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
              <div className="px-5 py-4 space-y-2">
                {[
                  { key: '?', desc: 'Toggle shortcuts panel' },
                  { key: 'S', desc: 'Switch to Studio' },
                  { key: 'H', desc: 'Switch to History' },
                  { key: 'A', desc: 'Switch to Analytics' },
                  { key: 'C', desc: 'Switch to Canvas' },
                  { key: '⌘↵', desc: 'Run agent' },
                  { key: 'Esc', desc: 'Close dialogs' },
                ].map(s => (
                  <div key={s.key} className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-[#666]">{s.desc}</span>
                    <kbd className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 text-[10px] font-mono font-bold">{s.key}</kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Human-in-the-Loop Approval Dialog ── */}
      <AnimatePresence>
        {showApprovalDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowApprovalDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 12 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-[#111113] rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 dark:text-white">Human Approval Required</p>
                  <p className="text-[10px] text-slate-400 dark:text-[#555] mt-0.5">Task này yêu cầu phê duyệt của bạn</p>
                </div>
                <button
                  onClick={() => setShowApprovalDialog(false)}
                  className="p-1.5 text-slate-300 dark:text-[#444] hover:text-red-400 transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Task preview */}
              <div className="px-5 py-4 space-y-3">
                <div className="rounded-xl bg-amber-500/[0.05] border border-amber-500/20 p-3">
                  <p className="text-[9px] font-bold uppercase text-amber-500/70 tracking-widest mb-1.5">Task sẽ thực hiện</p>
                  <p className="text-[12px] text-slate-700 dark:text-white/80 leading-relaxed line-clamp-4">{taskPrompt}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-[#555]">
                  <dept.icon size={10} style={{ color: dept.color }} />
                  <span style={{ color: dept.color }} className="font-semibold">{dept.label}</span>
                  <span>·</span>
                  <Cpu size={9} />
                  <span>{model.label}</span>
                  <span>·</span>
                  <ShieldCheck size={9} className="text-emerald-500" />
                  <span>Budget: ${budgetLimit.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-[#555] flex items-start gap-1.5">
                  <AlertCircle size={11} className="text-amber-400 mt-0.5 shrink-0" />
                  Task chứa từ khóa nhạy cảm (deploy / delete / send / email…). Xem xét kỹ trước khi phê duyệt.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 px-5 pb-5">
                <button
                  onClick={() => {
                    setShowApprovalDialog(false);
                    pendingRunRef.current = null;
                    addLog('Human-in-Loop', 'Task bị từ chối bởi user', 'warning', '#ef4444');
                    showToast('Đã hủy task', 'error');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-slate-500 dark:text-[#666] text-[11px] font-semibold hover:border-red-400/40 hover:text-red-400 hover:bg-red-500/[0.05] transition-all"
                >
                  Từ chối
                </button>
                <button
                  onClick={async () => {
                    setShowApprovalDialog(false);
                    addLog('Human-in-Loop', '✓ Task được phê duyệt — tiến hành thực thi', 'success', '#10b981');
                    const fn = pendingRunRef.current;
                    pendingRunRef.current = null;
                    if (fn) await fn();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[11px] font-bold shadow-md shadow-brand-blue/20 hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={13} />
                  Phê duyệt & Chạy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Wizard */}
      <AnimatePresence>
        {showWizard && (
          <OnboardingWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} />
        )}
      </AnimatePresence>

    </div>
  );
};

export default PaperclipAIAgentsWorkspace;
