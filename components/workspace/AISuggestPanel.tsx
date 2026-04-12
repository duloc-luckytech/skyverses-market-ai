/**
 * AISuggestPanel.tsx — AI-powered suggestion panel for workspace modals
 *
 * Features:
 *   Tab 1: Prompt Ideas   — Gemini suggests 6 contextual prompts
 *   Tab 2: Style Presets  — Curated style options per product
 *   Tab 3: Templates      — User history + featured templates
 *   Tab 4: Smart Fill     — Auto-fill all workspace fields via Gemini
 *
 * Usage in workspace:
 *   <AISuggestPanel
 *     productSlug="poster-marketing-ai"
 *     productName="Poster Marketing AI"
 *     styles={['Hiện đại', 'Luxury', 'Tối giản']}
 *     onPromptSelect={(p) => setPrompt(p)}
 *     onApply={(cfg) => { setPrompt(cfg.prompt); setStyle(cfg.style); setFormat(cfg.format); }}
 *     historyKey="skyverses_poster_vault"
 *   />
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Palette, LayoutTemplate, Wand2,
  ChevronDown, ChevronUp, Loader2, Check,
  RefreshCw, ChevronRight, Clock,
} from 'lucide-react';
import { aiTextViaProxy } from '../../apis/aiCommon';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SuggestConfig {
  prompt: string;
  style?: string;
  format?: string;
  category?: string;
  size?: string;
  mode?: string;
}

export interface StylePreset {
  id: string;
  label: string;
  description: string;
  emoji: string;
  promptPrefix?: string;
}

interface HistoryItem {
  id: string;
  url?: string;
  prompt: string;
  config?: Record<string, unknown>;
  timestamp?: string;
}

interface AISuggestPanelProps {
  productSlug: string;
  productName: string;
  /** Style presets for this product */
  styles?: StylePreset[];
  /** Callback when user selects a prompt */
  onPromptSelect: (prompt: string) => void;
  /** Callback when Smart Fill completes */
  onApply: (config: SuggestConfig) => void;
  /** localStorage key for history vault */
  historyKey?: string;
  /** Additional context for Gemini suggestions */
  productContext?: string;
  /** Featured template prompts (hardcoded per product) */
  featuredTemplates?: { label: string; prompt: string; style?: string }[];
}

// ─── Default styles (can be overridden per product) ───────────────────────────
export const DEFAULT_STYLES: StylePreset[] = [
  { id: 'modern',    label: 'Hiện đại',    emoji: '⚡', description: 'Clean lines, bold typography, minimal clutter',      promptPrefix: 'modern minimal design, clean typography, ' },
  { id: 'luxury',    label: 'Luxury',      emoji: '💎', description: 'Premium feel, gold accents, sophisticated layout',    promptPrefix: 'luxury premium aesthetic, elegant, refined, ' },
  { id: 'bold',      label: 'Bold & Pop',  emoji: '🎯', description: 'High contrast, vivid colors, attention-grabbing',     promptPrefix: 'bold colorful design, high contrast, vibrant, ' },
  { id: 'minimal',   label: 'Tối giản',    emoji: '🤍', description: 'Whitespace-first, simple palette, understated',       promptPrefix: 'minimalist design, lots of whitespace, subtle, ' },
  { id: 'cinematic', label: 'Cinematic',   emoji: '🎬', description: 'Film-grade colors, dramatic lighting, widescreen feel', promptPrefix: 'cinematic style, dramatic lighting, film grain, ' },
  { id: 'vibrant',   label: 'Vibrant',     emoji: '🌈', description: 'Gradient-rich, energetic, youthful vibe',             promptPrefix: 'vibrant gradient design, energetic, colorful mesh, ' },
];

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'prompts',   label: 'Prompt Ideas',    icon: Sparkles       },
  { id: 'styles',    label: 'Style Presets',   icon: Palette        },
  { id: 'templates', label: 'Templates',       icon: LayoutTemplate },
  { id: 'smartfill', label: 'Smart Fill',      icon: Wand2          },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const PANEL_OPEN_KEY = (slug: string) => `skyverses_${slug}_suggest_panel_open`;

// ─── Component ────────────────────────────────────────────────────────────────
const AISuggestPanel: React.FC<AISuggestPanelProps> = ({
  productSlug,
  productName,
  styles = DEFAULT_STYLES,
  onPromptSelect,
  onApply,
  historyKey,
  productContext,
  featuredTemplates,
}) => {
  const [isOpen, setIsOpen] = useState(() => {
    try { return localStorage.getItem(PANEL_OPEN_KEY(productSlug)) !== 'false'; }
    catch { return true; }
  });
  const [activeTab, setActiveTab] = useState<TabId>('prompts');

  // Prompt Ideas state
  const [promptIdeas, setPromptIdeas] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [promptsLoaded, setPromptsLoaded] = useState(false);

  // Smart Fill state
  const [filling, setFilling] = useState(false);
  const [fillPreview, setFillPreview] = useState<SuggestConfig | null>(null);

  // History from localStorage
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Persist open state
  useEffect(() => {
    try { localStorage.setItem(PANEL_OPEN_KEY(productSlug), String(isOpen)); }
    catch { /* ignore */ }
  }, [isOpen, productSlug]);

  // Load history
  useEffect(() => {
    if (!historyKey) return;
    try {
      const raw = localStorage.getItem(historyKey);
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryItem[];
        setHistory(Array.isArray(parsed) ? parsed.slice(0, 9) : []);
      }
    } catch { /* ignore */ }
  }, [historyKey]);

  // Auto-load prompt ideas when tab opens
  useEffect(() => {
    if (activeTab === 'prompts' && isOpen && !promptsLoaded) {
      loadPromptIdeas();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isOpen]);

  const loadPromptIdeas = useCallback(async () => {
    setLoadingPrompts(true);
    try {
      const context = productContext || `${productName} AI tool`;
      const raw = await aiTextViaProxy(
        `Suggest exactly 6 creative, diverse prompt ideas for the "${productName}" AI tool.
Context: ${context}
Requirements:
- Each prompt is 8–20 words
- Vietnamese language preferred, mix with English keywords for quality
- Varied styles: professional, creative, trendy, seasonal, luxury, minimal
- Each prompt on a new line, no numbering, no bullets, no quotes
- Start directly with the creative prompt text`,
        'You are a creative director specializing in AI-generated visual content. Return exactly 6 prompt lines, one per line, nothing else.'
      );

      if (raw && raw !== 'NO_DATA_RETURNED' && raw !== 'CONNECTION_TERMINATED') {
        const lines = raw
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 5 && l.length < 150);
        setPromptIdeas(lines.slice(0, 6));
        setPromptsLoaded(true);
      }
    } catch { /* silent */ }
    finally { setLoadingPrompts(false); }
  }, [productName, productContext]);

  const handleSmartFill = async () => {
    setFilling(true);
    setFillPreview(null);
    try {
      const raw = await aiTextViaProxy(
        `Generate a complete workspace configuration for "${productName}" AI tool.
Return ONLY a JSON object with these exact keys (no markdown, no backticks):
{
  "prompt": "a creative 15-25 word generation prompt in Vietnamese with English AI keywords",
  "style": "one of: ${styles.map((s) => s.label).join(', ')}",
  "format": "best output format for this product",
  "category": "most relevant category"
}`,
        'You are an AI workspace configuration assistant. Return ONLY valid JSON, nothing else.'
      );

      if (raw && raw !== 'NO_DATA_RETURNED' && raw !== 'CONNECTION_TERMINATED') {
        // Extract JSON from response
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const cfg = JSON.parse(jsonMatch[0]) as SuggestConfig;
          setFillPreview(cfg);
        }
      }
    } catch { /* silent */ }
    finally { setFilling(false); }
  };

  return (
    <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden bg-black/[0.01] dark:bg-white/[0.015] mb-3">
      {/* Header toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-brand-blue/10 flex items-center justify-center">
            <Sparkles size={11} className="text-brand-blue" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-white/80">
            AI Suggest
          </span>
          <span className="text-[9px] text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded-full font-medium">
            Powered by Gemini
          </span>
        </div>
        <div className="text-slate-400 dark:text-[#555]">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Panel content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Tab bar */}
            <div className="flex border-t border-black/[0.04] dark:border-white/[0.04] overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                      isActive
                        ? 'border-brand-blue text-brand-blue'
                        : 'border-transparent text-slate-400 dark:text-[#555] hover:text-slate-600 dark:hover:text-[#888]'
                    }`}
                  >
                    <Icon size={11} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="p-3">
              <AnimatePresence mode="wait">
                {activeTab === 'prompts' && (
                  <TabPane key="prompts">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[10px] text-slate-400 dark:text-[#555]">
                        Click để chèn vào prompt
                      </p>
                      <button
                        onClick={() => { setPromptsLoaded(false); loadPromptIdeas(); }}
                        className="flex items-center gap-1 text-[9px] text-brand-blue hover:opacity-70 transition-opacity"
                        disabled={loadingPrompts}
                      >
                        <RefreshCw size={10} className={loadingPrompts ? 'animate-spin' : ''} />
                        Làm mới
                      </button>
                    </div>

                    {loadingPrompts ? (
                      <div className="flex items-center gap-2 py-4 justify-center text-[11px] text-slate-400">
                        <Loader2 size={14} className="animate-spin text-brand-blue" />
                        Đang tạo gợi ý...
                      </div>
                    ) : promptIdeas.length > 0 ? (
                      <div className="space-y-1.5">
                        {promptIdeas.map((idea, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => onPromptSelect(idea)}
                            className="w-full text-left flex items-start gap-2 p-2.5 rounded-lg hover:bg-brand-blue/[0.06] border border-transparent hover:border-brand-blue/20 transition-all group"
                          >
                            <span className="shrink-0 w-4 h-4 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[8px] font-bold mt-0.5 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                              {i + 1}
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-[#aaa] leading-relaxed group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                              {idea}
                            </span>
                            <ChevronRight size={11} className="shrink-0 mt-0.5 text-slate-300 dark:text-[#444] group-hover:text-brand-blue transition-colors ml-auto" />
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={loadPromptIdeas}
                        className="w-full py-3 flex items-center justify-center gap-2 text-[11px] text-brand-blue hover:opacity-80 transition-opacity"
                      >
                        <Sparkles size={13} /> Tạo gợi ý
                      </button>
                    )}
                  </TabPane>
                )}

                {activeTab === 'styles' && (
                  <TabPane key="styles">
                    <p className="text-[10px] text-slate-400 dark:text-[#555] mb-2.5">
                      Chọn phong cách — sẽ thêm prefix vào prompt
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {styles.map((s, i) => (
                        <motion.button
                          key={s.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => {
                            if (s.promptPrefix) onPromptSelect(s.promptPrefix);
                          }}
                          className="text-left p-2.5 rounded-lg border border-black/[0.06] dark:border-white/[0.04] hover:border-brand-blue/30 hover:bg-brand-blue/[0.04] transition-all group"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm">{s.emoji}</span>
                            <span className="text-[10px] font-semibold text-slate-700 dark:text-white/80 group-hover:text-brand-blue transition-colors">
                              {s.label}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 dark:text-[#555] leading-relaxed">
                            {s.description}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </TabPane>
                )}

                {activeTab === 'templates' && (
                  <TabPane key="templates">
                    {/* Featured templates */}
                    {featuredTemplates && featuredTemplates.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-blue/60 mb-2">
                          ⭐ Featured
                        </p>
                        <div className="space-y-1.5">
                          {featuredTemplates.map((t, i) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              onClick={() => onApply({ prompt: t.prompt, style: t.style })}
                              className="w-full text-left flex items-start justify-between gap-2 p-2.5 rounded-lg border border-brand-blue/20 bg-brand-blue/[0.03] hover:bg-brand-blue/[0.07] transition-all group"
                            >
                              <div>
                                <p className="text-[10px] font-medium text-brand-blue mb-0.5">{t.label}</p>
                                <p className="text-[9px] text-slate-400 dark:text-[#555] line-clamp-2">{t.prompt}</p>
                              </div>
                              <ChevronRight size={11} className="shrink-0 mt-0.5 text-brand-blue/40 group-hover:text-brand-blue" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* User history */}
                    {history.length > 0 ? (
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#555] mb-2 flex items-center gap-1">
                          <Clock size={9} /> Lịch sử của bạn
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {history.slice(0, 9).map((item, i) => (
                            <motion.button
                              key={item.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.03 }}
                              onClick={() => onApply({ prompt: item.prompt, ...(item.config || {}) } as SuggestConfig)}
                              className="relative aspect-square rounded-lg overflow-hidden bg-black/[0.04] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.04] hover:border-brand-blue/30 transition-all group"
                            >
                              {item.url ? (
                                <img src={item.url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <LayoutTemplate size={14} className="text-slate-300 dark:text-[#444]" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-[8px] font-semibold">Dùng lại</span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ) : !featuredTemplates?.length ? (
                      <p className="text-[11px] text-slate-400 dark:text-[#555] text-center py-4">
                        Chưa có template nào.<br />
                        <span className="text-brand-blue">Tạo ảnh đầu tiên</span> để lưu template.
                      </p>
                    ) : null}
                  </TabPane>
                )}

                {activeTab === 'smartfill' && (
                  <TabPane key="smartfill">
                    <p className="text-[10px] text-slate-400 dark:text-[#555] mb-3 leading-relaxed">
                      AI sẽ tự điền prompt, style và format phù hợp nhất cho <strong className="text-slate-600 dark:text-white/70">{productName}</strong>.
                    </p>

                    {fillPreview ? (
                      <div className="space-y-2 mb-3">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-blue/60">
                          Preview kết quả
                        </p>
                        {Object.entries(fillPreview).map(([key, val]) => val && (
                          <div key={key} className="flex items-start gap-2 p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.03]">
                            <span className="text-[9px] font-semibold uppercase text-brand-blue/60 w-14 shrink-0">{key}</span>
                            <span className="text-[10px] text-slate-600 dark:text-[#aaa]">{String(val)}</span>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { onApply(fillPreview); setFillPreview(null); }}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-brand-blue text-white text-[10px] font-semibold py-2 rounded-lg"
                          >
                            <Check size={12} /> Áp dụng
                          </motion.button>
                          <button
                            onClick={() => setFillPreview(null)}
                            className="px-3 py-2 text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            Bỏ qua
                          </button>
                        </div>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,144,255,0.2)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSmartFill}
                        disabled={filling}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-blue to-indigo-600 text-white text-[11px] font-semibold py-3 rounded-xl shadow-md shadow-brand-blue/20 disabled:opacity-60"
                      >
                        {filling ? (
                          <><Loader2 size={13} className="animate-spin" /> Đang phân tích...</>
                        ) : (
                          <><Wand2 size={13} /> ✨ Điền thông minh</>
                        )}
                      </motion.button>
                    )}

                    <p className="text-[9px] text-slate-300 dark:text-[#444] text-center mt-2">
                      Sử dụng Gemini AI để phân tích context
                    </p>
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

// ─── Tab pane wrapper ─────────────────────────────────────────────────────────
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

export default AISuggestPanel;
