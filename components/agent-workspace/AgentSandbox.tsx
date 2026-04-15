import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, Trash2, Copy, Download, RefreshCw,
  Plus, ChevronDown, Check, Edit2, X, MessageSquare,
  FileText, Zap, Clock,
} from 'lucide-react';
import type { CustomAgent } from '../../hooks/useAgentRegistry';
import { SKILL_LIBRARY } from '../../hooks/useAgentRegistry';
import { aiChatStreamViaProxy, AI_MODELS } from '../../apis/aiCommon';
import type { ChatMessage } from '../../apis/aiCommon';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SandboxMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SandboxThread {
  id: string;
  title: string;
  messages: SandboxMessage[];
  createdAt: number;
  updatedAt: number;
}

// ─── Storage ───────────────────────────────────────────────────────────────────

const THREADS_KEY = (agentId: string) => `skyverses_agent_threads_${agentId}`;
const MAX_THREADS = 20;

function loadThreads(agentId: string): SandboxThread[] {
  try {
    const raw = localStorage.getItem(THREADS_KEY(agentId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveThreads(agentId: string, threads: SandboxThread[]) {
  try {
    localStorage.setItem(THREADS_KEY(agentId), JSON.stringify(threads.slice(-MAX_THREADS)));
  } catch { /* ignore */ }
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getThreadTitle(messages: SandboxMessage[]): string {
  const first = messages.find(m => m.role === 'user');
  if (!first) return 'New conversation';
  return first.content.slice(0, 40) + (first.content.length > 40 ? '…' : '');
}

// ─── Task Templates (per-tier) ─────────────────────────────────────────────────

const TASK_TEMPLATES: Record<string, { label: string; prompt: string }[]> = {
  orchestrator: [
    { label: '📋 Weekly Brief',       prompt: 'Create a comprehensive weekly operations brief covering key initiatives, blockers, and strategic priorities for the next 7 days.' },
    { label: '🎯 Mission Plan',        prompt: 'Design a 90-day strategic plan with clear milestones, KPIs, and resource allocation for scaling the business.' },
    { label: '📊 Board Report',        prompt: 'Write an executive board report summarizing company performance, growth metrics, risks, and upcoming key decisions.' },
    { label: '🚀 Launch Strategy',     prompt: 'Develop a go-to-market launch strategy for a new product, including positioning, target segments, and success criteria.' },
  ],
  department: [
    { label: '📝 Action Plan',         prompt: 'Create a detailed action plan for the next sprint with specific tasks, owners, deadlines, and success metrics.' },
    { label: '📈 Performance Review',  prompt: 'Write a department performance review covering achievements, challenges, team highlights, and goals for next quarter.' },
    { label: '💡 Improvement Proposal',prompt: 'Propose 5 high-impact improvements for our department processes, each with effort/impact analysis and implementation steps.' },
    { label: '📣 Team Update',         prompt: 'Draft a professional internal team update email covering recent wins, in-progress work, and upcoming priorities.' },
  ],
  specialist: [
    { label: '🔬 Deep Analysis',       prompt: 'Provide a comprehensive analysis of the topic with evidence, multiple perspectives, risks, and strategic recommendations.' },
    { label: '✍️ Draft Content',        prompt: 'Create high-quality professional content on a topic of my choice. Ask me what topic first, then produce the content.' },
    { label: '❓ Expert Q&A',           prompt: 'Enter expert consultation mode. Ask me what challenge I am facing, then provide expert-level guidance with specific, actionable advice.' },
    { label: '📋 Checklist Generator', prompt: 'Create a comprehensive professional checklist for a process I describe. Ask for the process first.' },
  ],
};

const getTemplates = (tier: string) =>
  TASK_TEMPLATES[tier] ?? TASK_TEMPLATES['specialist'];

// ─── Markdown renderer (lightweight, no external deps) ─────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let key = 0;

  const inlineFormat = (s: string): React.ReactNode => {
    // Bold, italic, code inline, links
    const parts = s.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') || part.startsWith('__')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return <code key={i} className="px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-brand-blue font-mono text-[10px]">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('*') || part.startsWith('_')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      // link pattern detected via split group
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline hover:opacity-80">{linkMatch[1]}</a>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block fence
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeBuffer = [];
      } else {
        inCode = false;
        nodes.push(
          <div key={key++} className="my-2 rounded-xl overflow-hidden border border-white/10">
            {codeLang && (
              <div className="flex items-center justify-between px-3 py-1 bg-slate-800 border-b border-white/10">
                <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">{codeLang}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(codeBuffer.join('\n'))}
                  className="text-[8px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Copy size={8} /> Copy
                </button>
              </div>
            )}
            <pre className="bg-slate-900 px-3 py-2.5 text-[10px] text-emerald-300 font-mono overflow-x-auto leading-relaxed whitespace-pre">
              {codeBuffer.join('\n')}
            </pre>
          </div>
        );
        codeBuffer = [];
        codeLang = '';
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Heading
    if (line.startsWith('### ')) {
      nodes.push(<h3 key={key++} className="text-[12px] font-bold text-slate-800 dark:text-white mt-3 mb-1">{inlineFormat(line.slice(4))}</h3>);
    } else if (line.startsWith('## ')) {
      nodes.push(<h2 key={key++} className="text-[13px] font-black text-slate-800 dark:text-white mt-3 mb-1.5">{inlineFormat(line.slice(3))}</h2>);
    } else if (line.startsWith('# ')) {
      nodes.push(<h1 key={key++} className="text-[14px] font-black text-slate-800 dark:text-white mt-3 mb-2">{inlineFormat(line.slice(2))}</h1>);
    }
    // Bullet
    else if (line.match(/^[-*+] /)) {
      nodes.push(
        <div key={key++} className="flex items-start gap-2 my-0.5">
          <span className="text-brand-blue mt-1 shrink-0 text-[8px]">●</span>
          <span className="text-[11px] leading-relaxed">{inlineFormat(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered list
    else if (line.match(/^\d+\. /)) {
      const match = line.match(/^(\d+)\. (.+)/);
      if (match) {
        nodes.push(
          <div key={key++} className="flex items-start gap-2 my-0.5">
            <span className="text-brand-blue font-bold shrink-0 text-[10px] w-4">{match[1]}.</span>
            <span className="text-[11px] leading-relaxed">{inlineFormat(match[2])}</span>
          </div>
        );
      }
    }
    // Horizontal rule
    else if (line.match(/^---+$/)) {
      nodes.push(<hr key={key++} className="my-3 border-black/10 dark:border-white/10" />);
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      nodes.push(
        <div key={key++} className="border-l-2 border-brand-blue/50 pl-3 my-1 text-slate-500 dark:text-white/50 italic text-[11px]">
          {inlineFormat(line.slice(2))}
        </div>
      );
    }
    // Empty line
    else if (line.trim() === '') {
      nodes.push(<div key={key++} className="h-1.5" />);
    }
    // Normal paragraph
    else {
      nodes.push(<p key={key++} className="text-[11px] leading-relaxed">{inlineFormat(line)}</p>);
    }
  }

  return nodes;
}

// ─── Build system prompt ────────────────────────────────────────────────────────

function buildAgentSystemPrompt(agent: CustomAgent): string {
  const parts: string[] = [agent.systemPrompt.trim()];
  const agentSkills = SKILL_LIBRARY.filter(s => agent.skills.includes(s.id));
  if (agentSkills.length > 0) {
    parts.push(`RULES:\n${agentSkills.map(s => `- ${s.rule}`).join('\n')}`);
  }
  if (agent.brief) parts.push(`CONTEXT:\n${agent.brief.trim()}`);
  if (agent.language) {
    const langMap: Record<string, string> = { vi: 'Vietnamese', en: 'English', ko: 'Korean', ja: 'Japanese' };
    parts.push(`LANGUAGE: Respond in ${langMap[agent.language]}`);
  }
  return parts.join('\n\n');
}

// ─── Component ─────────────────────────────────────────────────────────────────

const AgentSandbox: React.FC<{ agent: CustomAgent }> = ({ agent }) => {
  // Thread state
  const [threads, setThreads]             = useState<SandboxThread[]>(() => loadThreads(agent.id));
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showThreadList, setShowThreadList] = useState(false);

  // Chat state
  const [input, setInput]         = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText]   = useState('');
  const [copiedId, setCopiedId]   = useState<string | null>(null);

  const abortRef  = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Active thread
  const activeThread = threads.find(t => t.id === activeThreadId) ?? null;
  const messages     = activeThread?.messages ?? [];

  // Persist whenever threads change
  useEffect(() => {
    saveThreads(agent.id, threads);
  }, [threads, agent.id]);

  // Reset on agent switch
  useEffect(() => {
    const loaded = loadThreads(agent.id);
    setThreads(loaded);
    setActiveThreadId(loaded.length > 0 ? loaded[loaded.length - 1].id : null);
    setInput('');
    if (abortRef.current) abortRef.current.abort();
  }, [agent.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Thread management ───────────────────────────────────────────────────

  const newThread = useCallback((): SandboxThread => {
    const t: SandboxThread = {
      id: generateId(),
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setThreads(prev => [...prev, t]);
    setActiveThreadId(t.id);
    setShowThreadList(false);
    return t;
  }, []);

  const deleteThread = useCallback((threadId: string) => {
    setThreads(prev => {
      const next = prev.filter(t => t.id !== threadId);
      if (activeThreadId === threadId) {
        setActiveThreadId(next.length > 0 ? next[next.length - 1].id : null);
      }
      return next;
    });
  }, [activeThreadId]);

  const updateThread = useCallback((threadId: string, updater: (t: SandboxThread) => SandboxThread) => {
    setThreads(prev => prev.map(t => t.id === threadId ? updater(t) : t));
  }, []);

  // ── Send message ────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string, threadId?: string) => {
    text = text.trim();
    if (!text || isStreaming) return;
    setInput('');

    // Ensure we have an active thread
    let tid = threadId ?? activeThreadId;
    if (!tid) {
      const t = newThread();
      tid = t.id;
      // Small delay so state settles
      await new Promise(r => setTimeout(r, 10));
    }

    const userMsg: SandboxMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantMsg: SandboxMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    // Add both messages
    updateThread(tid, t => ({
      ...t,
      messages: [...t.messages, userMsg, assistantMsg],
      title: t.messages.length === 0 ? getThreadTitle([userMsg]) : t.title,
      updatedAt: Date.now(),
    }));

    setIsStreaming(true);
    abortRef.current = new AbortController();

    // Build history (up to last 20 messages for context)
    const currentMsgs = threads.find(t => t.id === tid)?.messages ?? [];
    const historyForApi: ChatMessage[] = [...currentMsgs, userMsg]
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }));

    const systemContent = buildAgentSystemPrompt(agent);
    const systemMsg: ChatMessage = { role: 'system', content: systemContent };

    let assistantOutput = '';

    try {
      await aiChatStreamViaProxy(
        [systemMsg, ...historyForApi],
        (token) => {
          assistantOutput += token;
          updateThread(tid!, t => ({
            ...t,
            messages: t.messages.map(m =>
              m.id === assistantMsg.id ? { ...m, content: assistantOutput } : m
            ),
          }));
        },
        abortRef.current.signal,
        agent.maxTokens ?? 2048,
        agent.model === 'claude-opus' ? AI_MODELS.OPUS : AI_MODELS.SONNET,
      );
    } catch { /* abort */ }

    setIsStreaming(false);
  }, [isStreaming, activeThreadId, newThread, updateThread, threads, agent]);

  // ── Edit user message ───────────────────────────────────────────────────

  const startEdit = (msg: SandboxMessage) => {
    setEditingMsgId(msg.id);
    setEditText(msg.content);
  };

  const commitEdit = async () => {
    if (!editingMsgId || !activeThreadId) return;
    const msgIdx = messages.findIndex(m => m.id === editingMsgId);
    if (msgIdx < 0) return;

    // Truncate from edited message onward, then resend
    const trimmed = messages.slice(0, msgIdx);
    updateThread(activeThreadId, t => ({ ...t, messages: trimmed }));
    setEditingMsgId(null);
    await sendMessage(editText, activeThreadId);
  };

  // ── Retry last assistant message ────────────────────────────────────────

  const retryAssistant = useCallback(async (assistantMsgId: string) => {
    if (!activeThreadId) return;
    const idx = messages.findIndex(m => m.id === assistantMsgId);
    if (idx < 1) return;

    // Find the preceding user message
    const userMsg = messages[idx - 1];
    if (!userMsg || userMsg.role !== 'user') return;

    // Remove assistant message, resend user's prompt
    const trimmed = messages.slice(0, idx);
    updateThread(activeThreadId, t => ({ ...t, messages: trimmed }));
    await sendMessage(userMsg.content, activeThreadId);
  }, [activeThreadId, messages, sendMessage, updateThread]);

  // ── Copy helpers ────────────────────────────────────────────────────────

  const copyMessage = (msg: SandboxMessage) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // ── Export conversation ──────────────────────────────────────────────────

  const exportThread = () => {
    if (!activeThread) return;
    const lines: string[] = [
      `# Conversation with ${agent.name}`,
      `> ${agent.role} | ${new Date(activeThread.createdAt).toLocaleString('vi-VN')}`,
      '',
    ];
    for (const msg of activeThread.messages) {
      lines.push(`## ${msg.role === 'user' ? '👤 You' : `${agent.emoji} ${agent.name}`}`);
      lines.push(msg.content);
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${agent.name.replace(/\s+/g, '_')}_${activeThread.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const templates = getTemplates(agent.tier);

  // ──────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Thread bar ── */}
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-2 border-b border-black/[0.05] dark:border-white/[0.04] shrink-0">
        {/* Thread picker */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowThreadList(v => !v)}
            className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.07] transition-colors text-left"
          >
            <MessageSquare size={10} className="text-slate-400 shrink-0" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 truncate flex-1">
              {activeThread ? activeThread.title : 'No conversation'}
            </span>
            <ChevronDown size={10} className={`text-slate-400 shrink-0 transition-transform ${showThreadList ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {showThreadList && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-[#1a1a1e] rounded-xl shadow-xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden max-h-[200px] overflow-y-auto"
              >
                {threads.length === 0 ? (
                  <p className="text-[10px] text-slate-400 p-3 text-center">No conversations yet</p>
                ) : (
                  [...threads].reverse().map(t => (
                    <div
                      key={t.id}
                      className={`flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer group ${
                        t.id === activeThreadId ? 'bg-brand-blue/5' : ''
                      }`}
                      onClick={() => { setActiveThreadId(t.id); setShowThreadList(false); }}
                    >
                      <Clock size={9} className="text-slate-300 dark:text-white/20 shrink-0" />
                      <span className={`text-[10px] flex-1 truncate ${t.id === activeThreadId ? 'text-brand-blue font-semibold' : 'text-slate-600 dark:text-white/60'}`}>
                        {t.title}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); deleteThread(t.id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-slate-300 transition-all"
                      >
                        <Trash2 size={9} />
                      </button>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* New thread */}
        <button
          onClick={() => newThread()}
          title="New conversation"
          className="w-7 h-7 shrink-0 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-all"
        >
          <Plus size={12} />
        </button>

        {/* Export */}
        {activeThread && activeThread.messages.length > 0 && (
          <button
            onClick={exportThread}
            title="Export as Markdown"
            className="w-7 h-7 shrink-0 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
          >
            <Download size={12} />
          </button>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-3">

        {messages.length === 0 ? (
          // Empty state with templates
          <div className="flex flex-col items-center justify-center h-full py-4 gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border"
              style={{ backgroundColor: `${agent.color}15`, borderColor: `${agent.color}30` }}
            >
              {agent.emoji}
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-slate-700 dark:text-white/60">{agent.name}</p>
              <p className="text-[9px] text-slate-400 dark:text-white/25 mt-0.5">Quick-start with a template or type below</p>
            </div>

            {/* Task templates */}
            <div className="w-full space-y-1.5 mt-1">
              {templates.map(t => (
                <button
                  key={t.label}
                  onClick={() => sendMessage(t.prompt)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-black/[0.06] dark:border-white/[0.06] hover:border-brand-blue/40 hover:bg-brand-blue/[0.04] text-left transition-all group"
                >
                  <Zap size={9} className="text-brand-blue shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 group-hover:text-brand-blue transition-colors">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                {/* Assistant avatar */}
                {msg.role === 'assistant' && (
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-sm shrink-0 mr-2 mt-0.5"
                    style={{ backgroundColor: `${agent.color}15` }}
                  >
                    {agent.emoji}
                  </div>
                )}

                <div className={`max-w-[90%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Edit mode for user messages */}
                  {editingMsgId === msg.id ? (
                    <div className="w-full">
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        autoFocus
                        rows={3}
                        className="w-full px-3 py-2 rounded-2xl bg-brand-blue/10 border border-brand-blue/30 text-[11px] text-slate-900 dark:text-white focus:outline-none resize-none"
                      />
                      <div className="flex gap-1.5 mt-1 justify-end">
                        <button
                          onClick={() => setEditingMsgId(null)}
                          className="px-2 py-1 rounded-lg text-[9px] text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={commitEdit}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-blue text-white text-[9px] font-bold hover:brightness-110 transition-all"
                        >
                          <Check size={8} /> Send
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`px-3 py-2.5 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-brand-blue text-white rounded-tr-sm'
                            : 'bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-white/85 rounded-tl-sm'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="prose-sm">
                            {renderMarkdown(msg.content)}
                            {/* Streaming cursor */}
                            {isStreaming && i === messages.length - 1 && msg.content && (
                              <span className="inline-block w-1 h-3.5 bg-current ml-0.5 animate-pulse align-middle opacity-70" />
                            )}
                            {/* Typing indicator */}
                            {isStreaming && i === messages.length - 1 && !msg.content && (
                              <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                                <Loader2 size={10} className="animate-spin" /> thinking…
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>

                      {/* Message actions */}
                      <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <button
                          onClick={() => copyMessage(msg)}
                          className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors"
                          title="Copy"
                        >
                          {copiedId === msg.id ? <Check size={8} className="text-emerald-500" /> : <Copy size={8} />}
                        </button>
                        {msg.role === 'user' && !isStreaming && (
                          <button
                            onClick={() => startEdit(msg)}
                            className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={8} />
                          </button>
                        )}
                        {msg.role === 'assistant' && !isStreaming && msg.content && (
                          <button
                            onClick={() => retryAssistant(msg.id)}
                            className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors"
                            title="Retry"
                          >
                            <RefreshCw size={8} />
                          </button>
                        )}
                        <span className="text-[8px] text-slate-300 dark:text-white/20 mx-1">
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* ── Input ── */}
      <div className="px-3 pb-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.04] shrink-0">
        {/* Quick template chips (when conversation started) */}
        {messages.length > 0 && (
          <div className="flex gap-1.5 mb-2 overflow-x-auto pb-0.5 scrollbar-none">
            {templates.slice(0, 3).map(t => (
              <button
                key={t.label}
                onClick={() => sendMessage(t.prompt)}
                disabled={isStreaming}
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border border-black/[0.07] dark:border-white/[0.07] text-[9px] font-semibold text-slate-500 dark:text-white/35 hover:border-brand-blue/40 hover:text-brand-blue transition-all disabled:opacity-40"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={isStreaming}
            placeholder="Message… (Enter ↵ to send, Shift+Enter for new line)"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-[11px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40 resize-none disabled:opacity-50"
          />
          <div className="flex flex-col gap-1 shrink-0">
            {isStreaming ? (
              <button
                onClick={() => { abortRef.current?.abort(); setIsStreaming(false); }}
                className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                title="Stop"
              >
                <div className="w-2.5 h-2.5 bg-red-400 rounded-sm" />
              </button>
            ) : (
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center text-white hover:brightness-110 transition-all disabled:opacity-40 shadow-md shadow-brand-blue/20"
              >
                <Send size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSandbox;
