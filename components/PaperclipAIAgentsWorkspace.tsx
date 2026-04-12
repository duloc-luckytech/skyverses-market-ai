import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, ChevronDown, ChevronRight, Coins,
  Network, Building2, Code2, Megaphone, Users, BarChart3,
  Cpu, CheckCircle2, Clock, AlertCircle, Play, Loader2,
  History, Trash2, Bot, Activity, RefreshCw, ExternalLink,
  ShieldCheck, DollarSign, Zap,
} from 'lucide-react';
import { generateDemoText } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import AISuggestPanel, { StylePreset } from './workspace/AISuggestPanel';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_vault';

const DEPARTMENTS = [
  { id: 'marketing', label: 'Marketing AI', icon: Megaphone, color: '#8b5cf6', agent: 'Marketing Agent', tasks: ['Viết content SEO', 'Social media posts', 'Email campaign', 'Competitor analysis'] },
  { id: 'devops',    label: 'DevOps AI',    icon: Code2,     color: '#10b981', agent: 'DevOps Agent',   tasks: ['CI/CD pipeline', 'Code review', 'Deploy automation', 'Performance audit'] },
  { id: 'sales',     label: 'Sales AI',     icon: BarChart3, color: '#f59e0b', agent: 'Sales Agent',    tasks: ['Lead outreach', 'CRM follow-up', 'Proposal drafting', 'Deal analysis'] },
  { id: 'hr',        label: 'HR AI',        icon: Users,     color: '#06b6d4', agent: 'HR Agent',       tasks: ['Job description', 'Screening filter', 'Onboarding docs', 'Policy drafts'] },
  { id: 'ceo',       label: 'CEO Agent',    icon: Building2, color: '#0090ff', agent: 'CEO Agent',      tasks: ['Task delegation', 'Strategic brief', 'Org report', 'Budget review'] },
];

const LLM_MODELS = [
  { id: 'claude-sonnet', label: 'Claude Sonnet', provider: 'Anthropic', badge: 'Best for content' },
  { id: 'gpt-4o',        label: 'GPT-4o',        provider: 'OpenAI',    badge: 'Best for analysis' },
  { id: 'cursor',        label: 'Cursor',         provider: 'Anysphere', badge: 'Best for code' },
  { id: 'claude-haiku',  label: 'Claude Haiku',   provider: 'Anthropic', badge: 'Fast & cheap' },
  { id: 'gpt-3.5',       label: 'GPT-3.5 Turbo',  provider: 'OpenAI',    badge: 'Budget option' },
];

const TASK_TEMPLATES: StylePreset[] = [
  { id: 'blog-seo',     label: 'Blog SEO',       emoji: '✍️', description: 'Viết 3 blog posts SEO',     promptPrefix: 'Viết 3 blog posts SEO tối ưu về chủ đề: ' },
  { id: 'social-batch', label: 'Social Batch',   emoji: '📱', description: '30 posts LinkedIn + X',      promptPrefix: 'Tạo 30 social media posts cho LinkedIn và X về: ' },
  { id: 'ci-refactor',  label: 'CI/CD',           emoji: '⚙️', description: 'Refactor pipeline',         promptPrefix: 'Phân tích và refactor CI/CD pipeline: ' },
  { id: 'lead-outreach',label: 'Lead Outreach',  emoji: '📧', description: 'Email sequence 5 bước',      promptPrefix: 'Tạo email outreach sequence 5 bước cho: ' },
  { id: 'competitor',   label: 'Competitor',     emoji: '🔍', description: 'Phân tích 10 đối thủ',       promptPrefix: 'Research và phân tích 10 competitor trong lĩnh vực: ' },
  { id: 'api-docs',     label: 'API Docs',       emoji: '📚', description: 'Generate API documentation', promptPrefix: 'Generate OpenAPI documentation cho: ' },
];

const FEATURED_TEMPLATES = [
  { label: 'Launch Blog Campaign',    prompt: 'Viết 5 blog posts SEO về AI automation cho doanh nghiệp vừa và nhỏ, mỗi bài 1200 từ, có meta description và internal linking strategy', style: 'Blog SEO' },
  { label: 'Full Social Media Month', prompt: 'Tạo 30 posts social media cho tháng tới: 10 LinkedIn, 10 X, 10 Facebook về chủ đề AI productivity, consistent brand voice, hashtags optimized', style: 'Social Batch' },
  { label: 'DevOps Pipeline Audit',   prompt: 'Audit toàn bộ GitHub Actions workflow, identify bottlenecks, đề xuất cải thiện để giảm build time, tạo báo cáo chi tiết', style: 'CI/CD' },
  { label: 'Sales Outreach Q2',       prompt: 'Tạo personalized email sequence 5 bước cho 50 leads trong CRM, track open rate metrics, auto-follow-up trigger conditions', style: 'Lead Outreach' },
];

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
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PaperclipAIAgentsWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme: _theme } = useTheme();
  const { credits, isAuthenticated, login } = useAuth();
  const { showToast } = useToast();

  // UI state
  const [viewMode, setViewMode]           = useState<'current' | 'library'>('current');
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [showBudgetInfo, setShowBudgetInfo]   = useState(false);

  // Config state
  const [activeDept, setActiveDept]   = useState(DEPARTMENTS[0].id);
  const [activeModel, setActiveModel] = useState(LLM_MODELS[0].id);
  const [taskPrompt, setTaskPrompt]   = useState('');
  const [budgetLimit, setBudgetLimit] = useState('5.00');

  // Execution state
  const [isRunning, setIsRunning]     = useState(false);
  const [currentResult, setCurrentResult] = useState<TaskResult | null>(null);

  // History
  const [taskHistory, setTaskHistory] = useState<TaskResult[]>([]);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [showPromptHistory, setShowPromptHistory] = useState(false);

  const dept  = DEPARTMENTS.find(d => d.id === activeDept) ?? DEPARTMENTS[0];
  const model = LLM_MODELS.find(m => m.id === activeModel) ?? LLM_MODELS[0];

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { setTaskHistory(JSON.parse(saved)); } catch { /* ignore */ } }
    const savedPrompts = localStorage.getItem(STORAGE_KEY + '_prompts');
    if (savedPrompts) { try { setPromptHistory(JSON.parse(savedPrompts)); } catch { /* ignore */ } }
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleRun = async () => {
    if (!taskPrompt.trim() || isRunning) return;
    if (!isAuthenticated) { login(); return; }

    setIsRunning(true);
    const taskId = Date.now().toString();

    const pendingResult: TaskResult = {
      id: taskId,
      dept: dept.label,
      model: model.label,
      taskDesc: taskPrompt,
      output: '',
      status: 'running',
      timestamp: new Date().toLocaleString('vi-VN'),
      cost: `$${(Math.random() * 0.4 + 0.05).toFixed(2)}`,
    };
    setCurrentResult(pendingResult);

    // Save prompt history
    const newHistory = [taskPrompt, ...promptHistory.filter(p => p !== taskPrompt)].slice(0, 10);
    setPromptHistory(newHistory);
    localStorage.setItem(STORAGE_KEY + '_prompts', JSON.stringify(newHistory));

    try {
      const systemPrompt = `Bạn là ${dept.agent} trong hệ thống Paperclip AI Org Orchestrator. Model: ${model.label} (${model.provider}). Department: ${dept.label}. Thực hiện task được giao, trả về kết quả chi tiết, professional và actionable. Format output rõ ràng với headers và bullet points khi phù hợp. Viết bằng tiếng Việt hoặc tiếng Anh tùy context của task.`;
      const output = await generateDemoText(`${systemPrompt}\n\nTask: ${taskPrompt}`);

      if (output && !output.includes('CONNECTION_TERMINATED')) {
        const doneResult: TaskResult = { ...pendingResult, output, status: 'done' };
        setCurrentResult(doneResult);
        const updated = [doneResult, ...taskHistory];
        setTaskHistory(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        showToast(`${dept.agent} hoàn thành task!`, 'success');
      } else {
        const errResult: TaskResult = { ...pendingResult, output: 'Không thể kết nối tới AI service. Vui lòng thử lại.', status: 'error' };
        setCurrentResult(errResult);
        showToast('Lỗi kết nối AI', 'error');
      }
    } catch {
      const errResult: TaskResult = { ...pendingResult, output: 'Đã xảy ra lỗi khi chạy agent. Vui lòng thử lại.', status: 'error' };
      setCurrentResult(errResult);
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

  // ── Sidebar inner ──────────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0">

      {/* Department picker */}
      <div>
        <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Phòng ban / Agent</p>
        <div className="space-y-1.5">
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
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${d.color}20` }}
                >
                  <Icon size={14} style={{ color: d.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-semibold truncate ${isActive ? 'text-brand-blue' : 'text-slate-700 dark:text-white/80'}`}>
                    {d.label}
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-[#555] truncate">{d.agent}</p>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick tasks for selected dept */}
      <div>
        <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Task nhanh — {dept.label}</p>
        <div className="flex flex-col gap-1">
          {dept.tasks.map(t => (
            <button
              key={t}
              onClick={() => setTaskPrompt(t)}
              className="text-left px-3 py-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] text-[11px] text-slate-600 dark:text-white/60 hover:border-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/[0.03] transition-all"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* LLM Model picker */}
      <div>
        <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">LLM Model</p>
        <div className="space-y-1">
          {LLM_MODELS.map(m => {
            const isActive = activeModel === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModel(m.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-600 dark:text-white/60 hover:border-brand-blue/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cpu size={11} className={isActive ? 'text-white/80' : 'text-slate-400'} />
                  <span className="text-[11px] font-semibold">{m.label}</span>
                </div>
                <span className={`text-[8px] font-medium ${isActive ? 'text-white/70' : 'text-slate-400 dark:text-[#555]'}`}>{m.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Suggest Panel */}
      <div>
        <button
          onClick={() => setShowAISuggest(v => !v)}
          className="flex items-center justify-between w-full text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors tracking-widest mb-1"
        >
          <span>AI Gợi ý & Templates</span>
          {showAISuggest
            ? <ChevronDown size={11} className="text-brand-blue" />
            : <ChevronRight size={11} />
          }
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
                onApply={(cfg) => {
                  if (cfg.prompt) setTaskPrompt(cfg.prompt);
                }}
                historyKey={STORAGE_KEY}
                featuredTemplates={FEATURED_TEMPLATES}
                productContext={`Paperclip AI Org Orchestrator — ${dept.label} running ${model.label} for automation tasks`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task prompt */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] tracking-widest">Mô tả Task</p>
          {promptHistory.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowPromptHistory(v => !v)}
                className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors"
              >
                <History size={10} /> Lịch sử ({promptHistory.length})
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
                    <div className="p-2 border-b border-black/[0.05] dark:border-white/[0.05]">
                      <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest px-1">10 tasks gần nhất</p>
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
          placeholder={`Mô tả task cho ${dept.agent}...`}
          rows={4}
          className="w-full text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2.5 resize-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#444] focus:outline-none focus:border-brand-blue/50 transition-colors"
        />
      </div>

      {/* Budget Guard */}
      <div>
        <button
          onClick={() => setShowBudgetInfo(v => !v)}
          className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors w-full"
        >
          <ShieldCheck size={11} className="text-emerald-500" />
          Budget Guard
          <ChevronDown size={11} className={`ml-auto transition-transform ${showBudgetInfo ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {showBudgetInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-2"
            >
              <div className="p-3 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={12} className="text-emerald-500" />
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Spend limit / session</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">$</span>
                  <input
                    value={budgetLimit}
                    onChange={e => setBudgetLimit(e.target.value)}
                    className="flex-1 text-[11px] bg-white dark:bg-white/[0.04] border border-emerald-500/20 rounded-lg px-2 py-1.5 text-slate-700 dark:text-white focus:outline-none focus:border-emerald-500/50"
                    type="number"
                    min="0.01"
                    step="0.50"
                  />
                </div>
                <p className="text-[9px] text-slate-400 dark:text-[#555] mt-1.5">Agent sẽ pause và chờ approval khi sắp vượt giới hạn này.</p>
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
      <div className="h-14 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-[100] transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <Network size={14} className="text-brand-blue" />
            </div>
            <span className="text-[12px] font-bold text-slate-700 dark:text-white/80 hidden sm:block">Paperclip Studio</span>
          </div>
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10">
            {(['current', 'library'] as const).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-4 py-1.5 text-[11px] font-bold rounded-full transition-all ${viewMode === m ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {m === 'current' ? 'Phiên hiện tại' : `Lịch sử (${taskHistory.length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Current dept badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border"
            style={{ backgroundColor: `${dept.color}15`, borderColor: `${dept.color}35`, color: dept.color }}
          >
            <dept.icon size={11} />
            {dept.label}
          </div>

          {/* Mobile settings */}
          <button
            onClick={() => setShowMobileSheet(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-bold"
          >
            <Sparkles size={12} /> Cài đặt
          </button>

          {/* Credits */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full">
            <Coins size={12} className="text-brand-blue" />
            <span className="text-[10px] font-black text-brand-blue">{credits.toLocaleString()} CR</span>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">

        {/* ── SIDEBAR ── */}
        <div className="hidden md:flex w-[360px] shrink-0 bg-white dark:bg-[#0d0d0f] border-r border-slate-200 dark:border-white/5 flex-col h-full transition-colors">
          <SidebarContent />

          {/* Sticky generate button */}
          <div className="shrink-0 p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#0d0d0f] space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-[#555]">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-brand-blue animate-pulse' : 'bg-emerald-400'}`} />
                {isRunning ? `${dept.agent} đang xử lý...` : 'Sẵn sàng'}
              </div>
              <span className="font-semibold text-emerald-500 flex items-center gap-1">
                <ShieldCheck size={10} /> Budget: ${budgetLimit}
              </span>
            </div>
            <motion.button
              onClick={handleRun}
              disabled={isRunning || !taskPrompt.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isRunning
                ? <><Loader2 size={14} className="animate-spin" /> {dept.agent} đang chạy...</>
                : <><Play size={14} /> Chạy Agent <kbd className="ml-1 text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded opacity-70 normal-case tracking-normal">⌘↵</kbd></>
              }
            </motion.button>
          </div>
        </div>

        {/* ── MAIN VIEWPORT ── */}
        <div className="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-[#060608] overflow-hidden">

          {viewMode === 'current' ? (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              {(isRunning || currentResult) ? (
                <div className="w-full max-w-3xl space-y-4">
                  {/* Task header card */}
                  <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.05] bg-white dark:bg-[#0d0d0f] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${dept.color}20` }}
                          >
                            <dept.icon size={12} style={{ color: dept.color }} />
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: dept.color }}>{dept.label}</span>
                          <span className="text-[10px] text-slate-400">·</span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-[#555]">
                            <Cpu size={10} />
                            {model.label}
                          </div>
                        </div>
                        <p className="text-[13px] font-semibold text-slate-800 dark:text-white/90 line-clamp-2">
                          {currentResult?.taskDesc ?? taskPrompt}
                        </p>
                      </div>

                      {/* Status badge */}
                      {isRunning ? (
                        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 size={11} className="text-brand-blue" />
                          </motion.div>
                          <span className="text-[10px] font-bold text-brand-blue">Running</span>
                        </div>
                      ) : currentResult?.status === 'done' ? (
                        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 size={11} className="text-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-500">Done</span>
                        </div>
                      ) : currentResult?.status === 'error' ? (
                        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                          <AlertCircle size={11} className="text-red-500" />
                          <span className="text-[10px] font-bold text-red-500">Error</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Output card */}
                  <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.05] bg-white dark:bg-[#0d0d0f] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <Activity size={13} className="text-brand-blue" />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-white/80">Output</span>
                      </div>
                      {currentResult?.status === 'done' && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-400 dark:text-[#555] flex items-center gap-1">
                            <Clock size={9} /> {currentResult.timestamp}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {currentResult.cost}
                          </span>
                          <button
                            onClick={() => copyOutput(currentResult.output)}
                            className="text-[9px] font-semibold text-brand-blue hover:underline px-2 py-0.5 rounded-full bg-brand-blue/[0.08] transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 min-h-[200px]">
                      {isRunning ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                          <div className="relative w-12 h-12">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                              className="w-12 h-12 rounded-full border-2 border-brand-blue/30 border-t-brand-blue"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <dept.icon size={18} style={{ color: dept.color }} />
                            </div>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-slate-600 dark:text-white/60">
                              {dept.agent} đang xử lý task...
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-[#555] mt-1">
                              Sử dụng {model.label} · Budget Guard đang theo dõi
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-full">
                            <ShieldCheck size={11} className="text-emerald-500" />
                            <span className="text-[9px] font-bold text-emerald-500">Budget Guard active — limit ${budgetLimit}</span>
                          </div>
                        </div>
                      ) : currentResult?.status === 'done' ? (
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-[12px] text-slate-700 dark:text-white/80 leading-relaxed font-sans">
                            {currentResult.output}
                          </pre>
                        </div>
                      ) : currentResult?.status === 'error' ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                          <AlertCircle size={32} className="text-red-400" />
                          <p className="text-[13px] text-slate-500 dark:text-[#666]">{currentResult.output}</p>
                          <button
                            onClick={handleRun}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue/10 text-brand-blue text-[11px] font-semibold hover:bg-brand-blue/20 transition-all"
                          >
                            <RefreshCw size={12} /> Thử lại
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Action footer */}
                  {currentResult?.status === 'done' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRun}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-slate-600 dark:text-white/60 text-[11px] font-semibold hover:border-brand-blue/40 hover:text-brand-blue transition-all"
                      >
                        <RefreshCw size={12} /> Chạy lại
                      </button>
                      <a
                        href="https://github.com/paperclip-ing/paperclip"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-slate-600 dark:text-white/60 text-[11px] font-semibold hover:border-brand-blue/40 hover:text-brand-blue transition-all"
                      >
                        <ExternalLink size={12} /> Self-host Paperclip
                      </a>
                      <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-[#555]">
                        <Bot size={11} />
                        {model.label} · {currentResult.cost}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center gap-6 text-center w-full max-w-lg my-auto">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${dept.color}15` }}
                  >
                    <dept.icon size={28} style={{ color: dept.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-[#888]">
                      {dept.agent} sẵn sàng
                    </p>
                    <p className="text-[12px] text-slate-400 dark:text-[#555] mt-1 max-w-xs mx-auto">
                      Chọn task nhanh ở sidebar hoặc mô tả task bất kỳ để bắt đầu
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 w-full">
                    {dept.tasks.map(t => (
                      <button
                        key={t}
                        onClick={() => setTaskPrompt(t)}
                        className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] text-left hover:border-brand-blue/40 hover:bg-brand-blue/[0.02] transition-all group"
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center mb-2"
                          style={{ backgroundColor: `${dept.color}15` }}
                        >
                          <Zap size={12} style={{ color: dept.color }} />
                        </div>
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-white/70 group-hover:text-brand-blue transition-colors">{t}</p>
                      </button>
                    ))}
                  </div>
                  {/* Feature badges */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { icon: ShieldCheck, label: 'Budget Guard', color: '#10b981' },
                      { icon: Network,     label: 'Multi-Agent',  color: '#0090ff' },
                      { icon: Cpu,         label: model.label,   color: '#8b5cf6' },
                    ].map(b => (
                      <div
                        key={b.label}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-semibold border"
                        style={{ backgroundColor: `${b.color}10`, borderColor: `${b.color}30`, color: b.color }}
                      >
                        <b.icon size={10} />
                        {b.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Library / History ── */
            <div className="flex-1 overflow-y-auto p-6">
              {taskHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <History size={24} className="text-slate-300 dark:text-[#444]" />
                  </div>
                  <p className="text-sm text-slate-400 dark:text-[#555]">Chưa có task nào — chạy agent đầu tiên!</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-3">
                  {taskHistory.map(item => {
                    const itemDept = DEPARTMENTS.find(d => d.label === item.dept) ?? DEPARTMENTS[0];
                    return (
                      <div
                        key={item.id}
                        className="group rounded-xl border border-black/[0.06] dark:border-white/[0.05] bg-white dark:bg-[#0d0d0f] overflow-hidden hover:border-brand-blue/30 transition-colors"
                      >
                        <div className="h-0.5 w-full" style={{ backgroundColor: itemDept.color, opacity: 0.4 }} />
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold" style={{ color: itemDept.color }}>{item.dept}</span>
                                <span className="text-[9px] text-slate-400">·</span>
                                <span className="text-[10px] text-slate-400 dark:text-[#555] flex items-center gap-1">
                                  <Cpu size={9} /> {item.model}
                                </span>
                                <span className="text-[9px] text-slate-300 dark:text-[#444] ml-auto">{item.timestamp}</span>
                              </div>
                              <p className="text-[12px] font-semibold text-slate-700 dark:text-white/80 line-clamp-1">{item.taskDesc}</p>
                              <p className="text-[11px] text-slate-500 dark:text-[#666] mt-1 line-clamp-2 leading-relaxed">{item.output}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                {item.cost}
                              </span>
                              <button
                                onClick={(e) => deleteHistoryItem(e, item.id)}
                                className="p-1.5 rounded-lg text-slate-300 dark:text-[#444] hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
              <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
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
