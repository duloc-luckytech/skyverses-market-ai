import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, ChevronDown, ChevronRight, Coins,
  Network, Building2, Code2, Megaphone, Users, BarChart3,
  Cpu, CheckCircle2, Clock, AlertCircle, Play, Loader2,
  History, Trash2, Bot, Activity, RefreshCw, ExternalLink,
  ShieldCheck, DollarSign, Zap, Copy, Download, GitBranch,
  Eye, Terminal, TrendingUp, Settings, ChevronUp, Plus,
  ArrowRight, Layers, Workflow, Star,
} from 'lucide-react';
import { generateDemoText } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import AISuggestPanel, { StylePreset } from './workspace/AISuggestPanel';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_vault';

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
  { id: 'claude-sonnet', label: 'Claude Sonnet', provider: 'Anthropic', badge: 'Best for content', color: '#f97316' },
  { id: 'gpt-4o',        label: 'GPT-4o',        provider: 'OpenAI',    badge: 'Best for analysis', color: '#10b981' },
  { id: 'cursor',        label: 'Cursor',         provider: 'Anysphere', badge: 'Best for code',     color: '#0090ff' },
  { id: 'claude-haiku',  label: 'Claude Haiku',   provider: 'Anthropic', badge: 'Fast & cheap',      color: '#8b5cf6' },
  { id: 'gpt-3.5',       label: 'GPT-3.5 Turbo',  provider: 'OpenAI',    badge: 'Budget option',     color: '#6b7280' },
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
}

// ─── Markdown Renderer (lightweight) ─────────────────────────────────────────

const MarkdownOutput: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-1 text-[12px] leading-relaxed text-slate-700 dark:text-white/80 font-sans">
      {lines.map((line, i) => {
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
        // Inline bold
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

// ─── Main Component ───────────────────────────────────────────────────────────

const PaperclipAIAgentsWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme: _theme } = useTheme();
  const { credits, isAuthenticated, login } = useAuth();
  const { showToast } = useToast();

  // UI state
  const [viewMode, setViewMode]             = useState<'studio' | 'history' | 'analytics'>('studio');
  const [showAISuggest, setShowAISuggest]   = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [showBudgetPanel, setShowBudgetPanel] = useState(true);
  const [showOrgChart, setShowOrgChart]     = useState(true);
  const [showActivity, setShowActivity]     = useState(true);
  const [showPromptHistory, setShowPromptHistory] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'output' | 'log'>('output');

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

  // History
  const [taskHistory, setTaskHistory]      = useState<TaskResult[]>([]);
  const [promptHistory, setPromptHistory]  = useState<string[]>([]);

  const dept  = DEPARTMENTS.find(d => d.id === activeDept)  ?? DEPARTMENTS[1];
  const model = LLM_MODELS.find(m => m.id === activeModel)  ?? LLM_MODELS[0];
  const budgetPct = Math.min((spentBudget / budgetLimit) * 100, 100);

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

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleRun = async () => {
    if (!taskPrompt.trim() || isRunning) return;
    if (!isAuthenticated) { login(); return; }

    setIsRunning(true);
    setActiveRightTab('output');
    const taskId = Date.now().toString();
    const startTime = Date.now();

    const taskCost = parseFloat((Math.random() * 0.35 + 0.05).toFixed(2));
    const taskTokens = Math.floor(Math.random() * 1200 + 300);

    // Simulate multi-step activity
    addLog('CEO Agent', `Nhận task từ user → giao cho ${dept.agent}`, 'running', '#0090ff');
    setTimeout(() => addLog(dept.agent, `Bắt đầu xử lý với ${model.label}`, 'running', dept.color), 600);
    setTimeout(() => addLog('Budget Guard', `Theo dõi cost — limit $${budgetLimit.toFixed(2)}`, 'info', '#10b981'), 1200);

    const pendingResult: TaskResult = {
      id: taskId,
      dept: dept.label,
      model: model.label,
      taskDesc: taskPrompt,
      output: '',
      status: 'running',
      timestamp: new Date().toLocaleString('vi-VN'),
      cost: `$${taskCost.toFixed(2)}`,
      tokens: taskTokens,
    };
    setCurrentResult(pendingResult);

    // Save prompt history
    const newHistory = [taskPrompt, ...promptHistory.filter(p => p !== taskPrompt)].slice(0, 10);
    setPromptHistory(newHistory);
    localStorage.setItem(STORAGE_KEY + '_prompts', JSON.stringify(newHistory));

    try {
      const systemPrompt = `Bạn là ${dept.agent} trong hệ thống Paperclip AI Org Orchestrator. Model: ${model.label} (${model.provider}). Department: ${dept.label}. Thực hiện task được giao, trả về kết quả chi tiết, professional và actionable. Sử dụng markdown formatting với headers (##), bullet points (-) và numbered lists khi phù hợp. Viết bằng tiếng Việt hoặc tiếng Anh tùy context của task. Kết quả phải cụ thể, có thể action được.`;

      const output = await generateDemoText(`${systemPrompt}\n\nTask: ${taskPrompt}`);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

      if (output && !output.includes('CONNECTION_TERMINATED')) {
        const doneResult: TaskResult = { ...pendingResult, output, status: 'done', duration, tokens: taskTokens };
        setCurrentResult(doneResult);

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

        addLog(dept.agent, `✓ Task hoàn thành trong ${duration} — ${taskCost.toFixed(2)} USD`, 'success', dept.color);
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
    } catch {
      const errResult: TaskResult = { ...pendingResult, output: 'Đã xảy ra lỗi khi chạy agent. Vui lòng thử lại.', status: 'error' };
      setCurrentResult(errResult);
      addLog(dept.agent, 'Lỗi không xác định', 'warning', '#ef4444');
      showToast('Lỗi khi chạy agent', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = taskHistory.filter(t => t.id !== id);
    setTaskHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const copyOutput = (text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast('Đã copy output!', 'success'));
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

  // ── Sidebar ────────────────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

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

      {/* ── Department picker ── */}
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

      {/* ── Quick tasks ── */}
      <div>
        <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Task nhanh — {dept.label}</p>
        <div className="flex flex-col gap-1">
          {dept.tasks.map(t => (
            <button
              key={t}
              onClick={() => setTaskPrompt(t)}
              className={`text-left px-3 py-2 rounded-lg border text-[11px] transition-all flex items-center gap-2 group ${
                taskPrompt === t
                  ? 'border-brand-blue/40 bg-brand-blue/[0.05] text-brand-blue'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-600 dark:text-white/60 hover:border-brand-blue/30 hover:text-brand-blue hover:bg-brand-blue/[0.02]'
              }`}
            >
              <Zap size={9} className="opacity-60 shrink-0 group-hover:opacity-100 transition-opacity" />
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── LLM Model picker ── */}
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
        <p className="text-[8px] text-slate-300 dark:text-[#444] mt-1 text-right">{taskPrompt.length} ký tự · ⌘↵ để chạy</p>
      </div>

      {/* ── Budget Guard ── */}
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
              <div className="p-3 rounded-xl border border-black/[0.05] dark:border-white/[0.05] bg-black/[0.01] dark:bg-white/[0.01] max-h-40 overflow-y-auto">
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
              { id: 'studio',    label: 'Studio',    icon: Layers },
              { id: 'history',   label: `Lịch sử (${taskHistory.length})`, icon: History },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
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

          {/* Credits */}
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
          <SidebarContent />

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
              onClick={handleRun}
              disabled={isRunning || !taskPrompt.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {dept.agent} đang chạy...
                </>
              ) : (
                <>
                  <Play size={14} />
                  Chạy Agent
                  <kbd className="ml-1 text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded opacity-70 normal-case tracking-normal">⌘↵</kbd>
                </>
              )}
            </motion.button>
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
                            <span className="text-[10px] font-bold text-brand-blue">Running</span>
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
                      ] as const).map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveRightTab(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold border-b-2 transition-all -mb-px ${
                            activeRightTab === tab.id
                              ? 'border-brand-blue text-brand-blue'
                              : 'border-transparent text-slate-400 dark:text-[#555] hover:text-slate-600 dark:hover:text-white/60'
                          }`}
                        >
                          <tab.icon size={10} />
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
                                    {model.label} · Budget Guard active
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {['Phân tích task', 'Tạo context', 'Xử lý', 'Format output'].map((s, i) => (
                                    <motion.div
                                      key={s}
                                      initial={{ opacity: 0.3 }}
                                      animate={{ opacity: [0.3, 1, 0.3] }}
                                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                                      className="text-[9px] text-slate-400 flex items-center gap-1"
                                    >
                                      <div className="w-1 h-1 rounded-full bg-brand-blue/50" />
                                      {s}
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            ) : currentResult?.status === 'done' ? (
                              <div className="prose prose-sm max-w-none">
                                <MarkdownOutput content={currentResult.output} />
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
                    <p className="text-[11px] font-bold text-slate-700 dark:text-white/80">{taskHistory.length} tasks đã chạy</p>
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
                  {taskHistory.map(item => {
                    const itemDept = DEPARTMENTS.find(d => d.label === item.dept) ?? DEPARTMENTS[1];
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group rounded-xl border border-black/[0.06] dark:border-white/[0.05] bg-white dark:bg-[#0d0d0f] overflow-hidden hover:border-brand-blue/30 transition-colors"
                      >
                        <div className="h-0.5 w-full" style={{ backgroundColor: itemDept.color, opacity: 0.4 }} />
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[10px] font-bold" style={{ color: itemDept.color }}>{item.dept}</span>
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
                  })}
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
                <SidebarContent />
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

    </div>
  );
};

export default PaperclipAIAgentsWorkspace;
