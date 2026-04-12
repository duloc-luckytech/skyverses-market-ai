/**
 * AIScriptAssistant.tsx — Phase 3: AI Script Assistant Panel
 *
 * Collapsible panel with 4 tabs:
 *  1. Chat      — stream conversation with AI về kịch bản
 *  2. Suggest   — suggest next 3 scenes based on context
 *  3. Rewrite   — rewrite script in style of famous directors
 *  4. Stats     — AI script breakdown (characters, locations, mood…)
 */

import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronDown, ChevronUp, MessageSquare,
  Film, Pencil, BarChart3, Send, Loader2, RefreshCw,
  Check, X, Plus, Bot, User as UserIcon,
} from 'lucide-react';
import { aiChatStreamViaProxy, aiChatOnceViaProxy, type ChatMessage } from '../../apis/aiChat';
import type { Scene } from '../../hooks/useStoryboardStudio';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AIScriptAssistantProps {
  script: string;
  scenes: Scene[];
  settings: any;
  onScriptUpdate: (newScript: string) => void;
  isProcessing: boolean;
}

type TabId = 'chat' | 'suggest' | 'rewrite' | 'stats';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

interface SceneSuggestion {
  order: number;
  visualPrompt: string;
  mood: string;
}

interface ScriptStats {
  characters: string[];
  locations: string[];
  estimatedDuration: number;
  scenes: number;
  wordCount: number;
  mood: string;
  genre: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PANEL_KEY = 'skyverses_storyboard_ai_panel';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'chat',    label: 'Chat',    icon: <MessageSquare size={12} /> },
  { id: 'suggest', label: 'Suggest', icon: <Film size={12} /> },
  { id: 'rewrite', label: 'Rewrite', icon: <Pencil size={12} /> },
  { id: 'stats',   label: 'Stats',   icon: <BarChart3 size={12} /> },
];

const DIRECTORS = [
  { id: 'hitchcock',    label: 'Hitchcock',          desc: 'Suspense, shadow, psychological tension' },
  { id: 'wes_anderson', label: 'Wes Anderson',        desc: 'Symmetry, pastel palette, quirky deadpan' },
  { id: 'kubrick',      label: 'Kubrick',             desc: 'One-point perspective, slow zoom, existential' },
  { id: 'spielberg',    label: 'Spielberg',           desc: 'Wonder, practical effects, emotional close-ups' },
  { id: 'nolan',        label: 'Christopher Nolan',   desc: 'Non-linear, IMAX scale, cerebral mystery' },
  { id: 'miyazaki',     label: 'Miyazaki',            desc: 'Nature spirits, flight, hand-drawn warmth' },
  { id: 'fincher',      label: 'David Fincher',       desc: 'Darkness, obsession, meticulous control' },
] as const;

// ─── TabPane wrapper ──────────────────────────────────────────────────────────

const TabPane: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AIScriptAssistant: React.FC<AIScriptAssistantProps> = ({
  script,
  scenes,
  settings,
  onScriptUpdate,
  isProcessing,
}) => {
  // ── Panel open/close ──────────────────────────────────────────
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try { return localStorage.getItem(PANEL_KEY) !== 'false'; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(PANEL_KEY, String(isOpen)); }
    catch { /* ignore */ }
  }, [isOpen]);

  const [activeTab, setActiveTab] = useState<TabId>('chat');

  // ── Chat tab state ────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput]       = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming]   = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingText]);

  const buildChatSystemPrompt = useCallback((): string => {
    const sceneCount  = scenes.length;
    const hasScenes   = sceneCount > 0;
    return `You are an expert Storyboard Studio AI assistant.
You help the user refine their script and storyboard for AI video production.

Current project context:
- Format: ${settings.format || 'Auto'}
- Style: ${settings.style || 'Auto'}
- Culture/World: ${settings.culture || 'Auto'}
- Total scenes: ${hasScenes ? sceneCount : 'none yet'}
- Script length: ${script.length} characters

Current script:
"""
${script || '(empty — no script yet)'}
"""
${hasScenes ? `\nFirst few scenes: ${scenes.slice(0, 3).map(s => s.prompt.slice(0, 80)).join(' | ')}` : ''}

Always respond in the same language the user writes in. Be concise (2–4 sentences unless asked for more).`;
  }, [script, scenes, settings]);

  const handleSendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMsg = { role: 'user', content: text };
    const history = [...chatMessages, userMsg];
    setChatMessages(history);
    setChatInput('');
    setIsStreaming(true);
    setStreamingText('');

    abortRef.current = new AbortController();

    const messages: ChatMessage[] = [
      { role: 'system', content: buildChatSystemPrompt() },
      ...history.map(m => ({ role: m.role, content: m.content })),
    ];

    let accumulated = '';
    try {
      await aiChatStreamViaProxy(
        messages,
        (token) => {
          accumulated += token;
          setStreamingText(accumulated);
        },
        abortRef.current.signal,
      );
      setChatMessages(prev => [...prev, { role: 'assistant', content: accumulated }]);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setChatMessages(prev => [...prev, { role: 'assistant', content: '[Lỗi kết nối AI. Thử lại nhé.]' }]);
      }
    } finally {
      setStreamingText('');
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [chatInput, chatMessages, isStreaming, buildChatSystemPrompt]);

  const handleStopStream = () => {
    abortRef.current?.abort();
  };

  // ── Suggest tab state ─────────────────────────────────────────
  const [suggestions, setSuggestions]   = useState<SceneSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSuggestNext = useCallback(async () => {
    if (isSuggesting || !script.trim()) return;
    setIsSuggesting(true);
    setSuggestions([]);
    try {
      const lastScenes = scenes.slice(-3).map((s, i) => `Scene ${s.order}: ${s.prompt.slice(0, 120)}`).join('\n');
      const raw = await aiChatOnceViaProxy([
        {
          role: 'system',
          content: `You are a creative storyboard director. Suggest the next 3 scenes for an AI video storyboard.
Format: ${settings.format || 'auto'}, Style: ${settings.style || 'cinematic'}.
Return ONLY valid JSON array, no markdown, no extra text:
[{ "order": number, "visualPrompt": "40-60 word cinematic scene description", "mood": "one word" }]`,
        },
        {
          role: 'user',
          content: `Script concept: "${script.slice(0, 400)}"

${lastScenes ? `Last scenes:\n${lastScenes}` : 'No scenes yet — suggest an opening sequence.'}

Suggest 3 logical next scenes that continue this story naturally.`,
        },
      ]);

      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      const data = JSON.parse(cleaned) as SceneSuggestion[];
      setSuggestions(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSuggesting(false);
    }
  }, [script, scenes, settings, isSuggesting]);

  const handleAddSuggestionToScript = (suggestion: SceneSuggestion) => {
    const separator = script.trim() ? '\n\n' : '';
    onScriptUpdate(script + separator + suggestion.visualPrompt);
  };

  // ── Rewrite tab state ─────────────────────────────────────────
  const [selectedDirector, setSelectedDirector] = useState<string>(DIRECTORS[0].id);
  const [rewritePreview, setRewritePreview]     = useState('');
  const [isRewriting, setIsRewriting]           = useState(false);

  const handleRewrite = useCallback(async () => {
    if (isRewriting || !script.trim()) return;
    setIsRewriting(true);
    setRewritePreview('');

    const director = DIRECTORS.find(d => d.id === selectedDirector) ?? DIRECTORS[0];
    let accumulated = '';
    try {
      await aiChatStreamViaProxy(
        [
          {
            role: 'system',
            content: `You are a creative director rewriting scripts in the distinctive style of ${director.label}.
Style essence: ${director.desc}.
Rewrite the given script while preserving the core story and character names.
Keep the rewrite to the same approximate length. Return ONLY the rewritten script text.`,
          },
          {
            role: 'user',
            content: `Rewrite this script in the style of ${director.label}:\n\n"${script}"`,
          },
        ],
        (token) => {
          accumulated += token;
          setRewritePreview(accumulated);
        },
      );
    } catch {
      setRewritePreview('[Lỗi kết nối AI. Thử lại nhé.]');
    } finally {
      setIsRewriting(false);
    }
  }, [script, selectedDirector, isRewriting]);

  // ── Stats tab state ───────────────────────────────────────────
  const [stats, setStats]           = useState<ScriptStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeStats = useCallback(async () => {
    if (isAnalyzing || !script.trim()) return;
    setIsAnalyzing(true);
    setStats(null);
    try {
      const raw = await aiChatOnceViaProxy([
        {
          role: 'system',
          content: `You are a script analyst. Analyze the given script and return ONLY a valid JSON object (no markdown, no extra text):
{
  "characters": ["list of character names"],
  "locations": ["list of location/setting names"],
  "estimatedDuration": <number in seconds>,
  "scenes": <estimated scene count as number>,
  "wordCount": <word count as number>,
  "mood": "<overall mood, e.g. Epic / Melancholic / Tense>",
  "genre": "<video genre, e.g. TVC / Short Film / MV>"
}`,
        },
        { role: 'user', content: `Script:\n"${script.slice(0, 2000)}"` },
      ]);

      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      const data = JSON.parse(cleaned) as ScriptStats;
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [script, isAnalyzing]);

  // ─── Render ───────────────────────────────────────────────────
  const canInteract = !!script.trim() && !isProcessing;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a0a0e] overflow-hidden shadow-sm">

      {/* ── Header toggle ──────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
            <Bot size={13} className="text-brand-blue" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white">
            AI Script Assistant
          </span>
          <span className="text-[9px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-bold tracking-wide">
            Phase 3
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 dark:text-white/30">
          {!script.trim() && (
            <span className="text-[9px] text-slate-300 dark:text-white/20 italic hidden sm:inline">
              Nhập kịch bản để bắt đầu
            </span>
          )}
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} />
          </motion.div>
        </div>
      </button>

      {/* ── Collapsible body ───────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* Tab bar */}
            <div className="flex border-t border-slate-100 dark:border-white/5 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap shrink-0 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/60'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-4 min-h-[220px]">
              <AnimatePresence mode="wait">

                {/* ══ TAB 1: CHAT ══════════════════════════════════════ */}
                {activeTab === 'chat' && (
                  <TabPane key="chat">
                    {/* Message list */}
                    <div className="h-52 overflow-y-auto no-scrollbar flex flex-col gap-3 pb-2 pr-1 mb-3">
                      {chatMessages.length === 0 && !isStreaming && (
                        <div className="h-full flex flex-col items-center justify-center gap-2 text-center py-6">
                          <MessageSquare size={24} className="text-slate-200 dark:text-white/10" />
                          <p className="text-[10px] text-slate-300 dark:text-white/20 font-medium">
                            Hỏi AI về kịch bản của bạn
                          </p>
                          <div className="flex flex-wrap justify-center gap-1.5 mt-1 max-w-xs">
                            {[
                              'Nhân vật chính nên làm gì tiếp theo?',
                              'Cải thiện cấu trúc kịch bản',
                              'Thêm chi tiết cảm xúc',
                            ].map(q => (
                              <button
                                key={q}
                                onClick={() => setChatInput(q)}
                                className="text-[9px] px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 hover:border-brand-blue/40 hover:text-brand-blue transition-all"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {chatMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {/* Avatar */}
                          <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                            msg.role === 'user'
                              ? 'bg-brand-blue/15 text-brand-blue'
                              : 'bg-purple-500/15 text-purple-400'
                          }`}>
                            {msg.role === 'user'
                              ? <UserIcon size={11} />
                              : <Bot size={11} />
                            }
                          </div>
                          {/* Bubble */}
                          <div className={`max-w-[82%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-brand-blue text-white rounded-tr-sm'
                              : 'bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 text-slate-700 dark:text-white/80 rounded-tl-sm'
                          }`}>
                            {msg.content}
                          </div>
                        </motion.div>
                      ))}

                      {/* Streaming bubble */}
                      {isStreaming && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2"
                        >
                          <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5 bg-purple-500/15 text-purple-400">
                            <Bot size={11} />
                          </div>
                          <div className="max-w-[82%] px-3 py-2 rounded-xl rounded-tl-sm text-[11px] leading-relaxed bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 text-slate-700 dark:text-white/80">
                            {streamingText || (
                              <span className="flex gap-0.5 items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/20 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/20 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/20 animate-bounce" style={{ animationDelay: '300ms' }} />
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}

                      <div ref={chatEndRef} />
                    </div>

                    {/* Input row */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                        disabled={isStreaming}
                        placeholder="Hỏi AI về kịch bản..."
                        className="flex-1 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-[12px] text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/10 transition-all"
                      />
                      {isStreaming ? (
                        <button
                          onClick={handleStopStream}
                          className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
                          title="Dừng"
                        >
                          <X size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={handleSendChat}
                          disabled={!chatInput.trim()}
                          className="px-3.5 py-2.5 rounded-xl bg-brand-blue text-white hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-brand-blue/20"
                          title="Gửi (Enter)"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      {chatMessages.length > 0 && !isStreaming && (
                        <button
                          onClick={() => setChatMessages([])}
                          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/8 text-slate-400 dark:text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all"
                          title="Xóa lịch sử chat"
                        >
                          <RefreshCw size={12} />
                        </button>
                      )}
                    </div>
                  </TabPane>
                )}

                {/* ══ TAB 2: SUGGEST NEXT SCENE ════════════════════════ */}
                {activeTab === 'suggest' && (
                  <TabPane key="suggest">
                    <div className="space-y-4">
                      {/* Action button */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSuggestNext}
                        disabled={isSuggesting || !canInteract}
                        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isSuggesting
                          ? <><Loader2 size={14} className="animate-spin" /> Đang phân tích...</>
                          : <><Film size={14} /> Suggest Next 3 Scenes</>
                        }
                      </motion.button>

                      {!script.trim() && (
                        <p className="text-[10px] text-slate-300 dark:text-white/20 text-center italic">
                          Nhập kịch bản trước để AI có context
                        </p>
                      )}

                      {/* Results */}
                      <AnimatePresence>
                        {suggestions.length > 0 && (
                          <div className="space-y-2.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 flex items-center gap-1.5">
                              <Sparkles size={10} className="text-brand-blue" />
                              3 gợi ý tiếp theo
                            </p>
                            {suggestions.map((s, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-brand-blue/20 transition-all group"
                              >
                                {/* Scene number */}
                                <div className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                                  {scenes.length + i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] text-slate-700 dark:text-white/80 leading-relaxed mb-1.5">
                                    {s.visualPrompt}
                                  </p>
                                  <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold border border-purple-500/20">
                                    {s.mood}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleAddSuggestionToScript(s)}
                                  className="shrink-0 w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                  title="Thêm vào kịch bản"
                                >
                                  <Plus size={13} />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </TabPane>
                )}

                {/* ══ TAB 3: REWRITE IN STYLE ══════════════════════════ */}
                {activeTab === 'rewrite' && (
                  <TabPane key="rewrite">
                    <div className="space-y-3.5">
                      {/* Director selector */}
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
                          Chọn phong cách đạo diễn
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {DIRECTORS.map(d => (
                            <button
                              key={d.id}
                              onClick={() => setSelectedDirector(d.id)}
                              className={`text-left p-2.5 rounded-xl border transition-all ${
                                selectedDirector === d.id
                                  ? 'bg-brand-blue/10 border-brand-blue/40 text-brand-blue'
                                  : 'border-slate-100 dark:border-white/5 text-slate-500 dark:text-white/40 hover:border-brand-blue/20 hover:text-slate-700 dark:hover:text-white/60'
                              }`}
                            >
                              <p className="text-[10px] font-black leading-none mb-0.5">{d.label}</p>
                              <p className="text-[8px] opacity-60 leading-tight">{d.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Rewrite button */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleRewrite}
                        disabled={isRewriting || !canInteract}
                        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-brand-blue text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-purple-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isRewriting
                          ? <><Loader2 size={14} className="animate-spin" /> Đang viết lại...</>
                          : <><Pencil size={14} /> Rewrite in Style of {DIRECTORS.find(d => d.id === selectedDirector)?.label}</>
                        }
                      </motion.button>

                      {/* Preview */}
                      <AnimatePresence>
                        {rewritePreview && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                          >
                            <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                              <Sparkles size={9} /> Preview — {DIRECTORS.find(d => d.id === selectedDirector)?.label} Style
                            </p>
                            <textarea
                              readOnly
                              value={rewritePreview}
                              rows={5}
                              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 rounded-xl px-4 py-3 text-[11px] leading-relaxed text-slate-700 dark:text-white/70 italic resize-none outline-none no-scrollbar"
                            />
                            {!isRewriting && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { onScriptUpdate(rewritePreview); setRewritePreview(''); }}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md shadow-brand-blue/20"
                                >
                                  <Check size={12} /> Apply to Script
                                </button>
                                <button
                                  onClick={() => setRewritePreview('')}
                                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/8 text-slate-400 dark:text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all text-[10px]"
                                >
                                  Bỏ qua
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </TabPane>
                )}

                {/* ══ TAB 4: STATS ════════════════════════════════════ */}
                {activeTab === 'stats' && (
                  <TabPane key="stats">
                    <div className="space-y-4">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleAnalyzeStats}
                        disabled={isAnalyzing || !canInteract}
                        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-blue text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isAnalyzing
                          ? <><Loader2 size={14} className="animate-spin" /> Đang phân tích...</>
                          : <><BarChart3 size={14} /> Analyze Script</>
                        }
                      </motion.button>

                      <AnimatePresence>
                        {stats && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                          >
                            {/* Quick stat grid */}
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: 'Scenes',   value: stats.scenes,                          accent: 'text-white' },
                                { label: 'Duration', value: `~${stats.estimatedDuration}s`,         accent: 'text-purple-400' },
                                { label: 'Words',    value: stats.wordCount,                        accent: 'text-brand-blue' },
                                { label: 'Mood',     value: stats.mood,                             accent: 'text-amber-400' },
                              ].map((stat, i) => (
                                <motion.div
                                  key={stat.label}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.06 }}
                                  className="rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 px-3 py-2.5"
                                >
                                  <p className={`text-sm font-black tabular-nums leading-none ${stat.accent}`}>{stat.value}</p>
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mt-1">{stat.label}</p>
                                </motion.div>
                              ))}
                            </div>

                            {/* Genre & Characters */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Genre:</span>
                                <span className="text-[10px] font-bold bg-brand-blue/10 text-brand-blue px-2.5 py-0.5 rounded-full border border-brand-blue/20">{stats.genre}</span>
                              </div>

                              {stats.characters.length > 0 && (
                                <div className="flex items-start gap-2 flex-wrap">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mt-0.5 shrink-0">Characters:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {stats.characters.map(c => (
                                      <span key={c} className="text-[9px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">{c}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {stats.locations.length > 0 && (
                                <div className="flex items-start gap-2 flex-wrap">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mt-0.5 shrink-0">Locations:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {stats.locations.map(l => (
                                      <span key={l} className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">{l}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </TabPane>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIScriptAssistant;
