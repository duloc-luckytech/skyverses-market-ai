import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus, Coins, Zap, Settings2, X, Loader2,
  Sparkles, Pencil, Image as ImageIcon, ChevronDown, ChevronUp,
  Send, Wand2,
} from 'lucide-react';
import { ModelEngineSettings } from '../image-generator/ModelEngineSettings';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PromptBarProps {
  // Mode
  isDrawMode: boolean;

  // Prompt
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onPromptSubmit: () => void;

  // State
  isGenerating: boolean;
  isGenerateDisabled: boolean;
  onGenerate: () => void;
  generateTooltip?: string | null;

  // Credits
  credits: number;
  usagePreference: string | null;
  actionCost: number;

  // References
  references: string[];
  onAddReference: () => void;

  // AI Settings
  availableModels: any[];
  selectedModel: any;
  setSelectedModel: (val: any) => void;
  selectedRatio: string;
  setSelectedRatio: (val: string) => void;
  selectedRes: string;
  setSelectedRes: (val: string) => void;
  selectedEngine: string;
  onSelectEngine: (val: string) => void;
  selectedMode: string;
  setSelectedMode: (val: string) => void;
  familyList?: string[];
  selectedFamily?: string;
  setSelectedFamily?: (val: string) => void;
  familyModels?: any[];
  familyModes?: string[];
  familyRatios?: string[];
  familyResolutions?: string[];
}

// ─── Quick Prompts ────────────────────────────────────────────────────────────

const GENERATE_QUICK_PROMPTS = [
  'A breathtaking product photo on white background',
  'Luxury fashion editorial, minimalist studio',
  'Futuristic cityscape at blue hour, neon reflections',
  'Ethereal fantasy landscape, bioluminescent forest',
];

const DRAW_QUICK_PROMPTS = [
  'Remove the background completely',
  'Make the lighting more dramatic',
  'Add a soft bokeh effect',
  'Enhance colors, make it vibrant',
];

// ─── Component ────────────────────────────────────────────────────────────────

export const PromptBar: React.FC<PromptBarProps> = ({
  isDrawMode,
  prompt, onPromptChange, onPromptSubmit,
  isGenerating, isGenerateDisabled, onGenerate, generateTooltip,
  credits, usagePreference, actionCost,
  references, onAddReference,
  availableModels, selectedModel, setSelectedModel,
  selectedRatio, setSelectedRatio, selectedRes, setSelectedRes,
  selectedEngine, onSelectEngine, selectedMode, setSelectedMode,
  familyList, selectedFamily, setSelectedFamily, familyModels, familyModes, familyRatios, familyResolutions,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const quickPrompts = isDrawMode ? DRAW_QUICK_PROMPTS : GENERATE_QUICK_PROMPTS;

  // Close quick prompts when clicking outside
  useEffect(() => {
    if (!showQuickPrompts) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-promptbar]')) setShowQuickPrompts(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showQuickPrompts]);

  const handleQuickPrompt = (p: string) => {
    onPromptChange(p);
    setShowQuickPrompts(false);
    inputRef.current?.focus();
  };

  const isKeyMode = usagePreference === 'key';

  return (
    // Positioned absolute inside the flex-col container, sits above mobile nav
    <div
      data-promptbar
      className="absolute bottom-16 lg:bottom-4 left-0 right-16 md:right-24 px-3 md:px-5 z-40 pointer-events-none"
    >
      <div className="relative mx-auto max-w-3xl space-y-2 pointer-events-auto">

        {/* ══════════════════════════════════════════════════════════
            QUICK PROMPTS CHIP ROW
        ═══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showQuickPrompts && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-1.5"
            >
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(p)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-[#1a1b21]/90 backdrop-blur border border-slate-200 dark:border-white/[0.07] text-slate-600 dark:text-slate-300 hover:border-brand-blue hover:text-brand-blue transition-all shadow-sm whitespace-nowrap"
                >
                  {p}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            AI SETTINGS PANEL
        ═══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/97 dark:bg-[#14151a]/97 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.04]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Settings2 size={10} className="text-brand-blue" />
                  AI Model Configuration
                </span>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  aria-label="Close settings"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Panel Content */}
              <div className="px-4 py-3 max-h-72 overflow-y-auto no-scrollbar">
                <ModelEngineSettings
                  availableModels={availableModels}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  selectedRatio={selectedRatio}
                  setSelectedRatio={setSelectedRatio}
                  selectedRes={selectedRes}
                  setSelectedRes={setSelectedRes}
                  quantity={1}
                  setQuantity={() => {}}
                  selectedEngine={selectedEngine}
                  onSelectEngine={onSelectEngine}
                  selectedMode={selectedMode}
                  setSelectedMode={setSelectedMode}
                  activeMode="SINGLE"
                  isGenerating={isGenerating}
                  familyList={familyList}
                  selectedFamily={selectedFamily}
                  setSelectedFamily={setSelectedFamily}
                  familyModels={familyModels}
                  familyModes={familyModes}
                  familyRatios={familyRatios}
                  familyResolutions={familyResolutions}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            MAIN BOTTOM BAR CARD
        ═══════════════════════════════════════════════════════════ */}
        <div className="bg-white/95 dark:bg-[#14151a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.07] rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.35)] overflow-hidden">

          {/* ── Top row: mode badge + references + input ── */}
          <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">

            {/* Mode badge */}
            <div
              className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${
                isDrawMode
                  ? 'bg-violet-500/10 border-violet-500/25 text-violet-500'
                  : 'bg-brand-blue/10 border-brand-blue/25 text-brand-blue'
              }`}
            >
              {isDrawMode
                ? <><Wand2 size={9} className="flex-shrink-0" /><span className="hidden sm:inline">Edit</span></>
                : <><Sparkles size={9} className="flex-shrink-0" /><span className="hidden sm:inline">Gen</span></>
              }
            </div>

            {/* Reference thumbnail(s) */}
            {references.length > 0 && references.slice(0, 2).map((ref, idx) => (
              <div
                key={idx}
                className="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-sm shrink-0"
              >
                <img src={ref} className="w-full h-full object-cover" alt={`ref-${idx}`} />
              </div>
            ))}

            {/* Add reference button */}
            <button
              onClick={onAddReference}
              title="Add reference image"
              aria-label="Add reference image"
              className="w-8 h-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center text-slate-300 dark:text-white/20 hover:border-brand-blue hover:text-brand-blue transition-all shrink-0"
            >
              <ImagePlus size={14} />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-100 dark:bg-white/5 shrink-0" />

            {/* Prompt input */}
            <input
              ref={inputRef}
              value={prompt}
              onChange={(ev) => onPromptChange(ev.target.value)}
              onKeyDown={(ev) => ev.key === 'Enter' && !isGenerateDisabled && onPromptSubmit()}
              onFocus={() => setShowQuickPrompts(true)}
              className="flex-grow bg-transparent border-none outline-none text-[11px] md:text-[13px] font-medium text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 min-w-0"
              placeholder={isDrawMode ? 'Describe the edit (e.g. remove background)…' : 'Enter a prompt to generate an image…'}
              aria-label="Prompt input"
            />

            {/* Quick prompt toggle */}
            <button
              onClick={() => setShowQuickPrompts(v => !v)}
              title="Quick prompts"
              aria-label="Quick prompts"
              className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                showQuickPrompts
                  ? 'text-brand-blue bg-brand-blue/10'
                  : 'text-slate-300 dark:text-white/20 hover:text-brand-blue hover:bg-brand-blue/5'
              }`}
            >
              {showQuickPrompts ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>
          </div>

          {/* ── Bottom row: credits + model info + settings + generate ── */}
          <div className="flex items-center gap-2 px-3 pb-2.5 pt-1">

            {/* Credits / cost pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04] shrink-0">
              <Coins size={10} className="text-amber-500 flex-shrink-0" />
              <span className={`text-[10px] font-black leading-none tracking-tight ${isKeyMode ? 'text-purple-500' : 'text-slate-700 dark:text-white'}`}>
                {isKeyMode ? 'API Key' : credits.toLocaleString()}
              </span>
              <span className="w-px h-3 bg-slate-200 dark:bg-white/10 mx-0.5" />
              <Zap size={8} fill="currentColor" className="text-orange-500 flex-shrink-0" />
              <span className="text-[9px] font-bold text-orange-500">−{actionCost}</span>
            </div>

            {/* Model / family pill */}
            {selectedFamily && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04] shrink-0">
                <ImageIcon size={9} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight whitespace-nowrap">
                  {selectedFamily}
                </span>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Settings toggle */}
            <button
              onClick={() => setIsSettingsOpen(v => !v)}
              aria-label="AI model settings"
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-tight transition-all ${
                isSettingsOpen
                  ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                  : 'bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 hover:border-brand-blue/30 hover:text-brand-blue'
              }`}
            >
              <Settings2 size={11} className="flex-shrink-0" />
              <span className="hidden sm:inline">Config</span>
              {isSettingsOpen ? <ChevronDown size={9} /> : <ChevronUp size={9} />}
            </button>

            {/* Generate button */}
            <div className="relative group/genbtn shrink-0">
              <button
                onClick={() => !isGenerateDisabled && onGenerate()}
                disabled={isGenerateDisabled}
                aria-label={isGenerating ? 'Generating…' : isDrawMode ? 'Apply edit' : 'Generate image'}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  isGenerateDisabled
                    ? 'bg-slate-200 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : isDrawMode
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-[0.97]'
                      : 'bg-gradient-to-r from-brand-blue to-violet-500 text-white shadow-lg shadow-brand-blue/20 hover:brightness-110 active:scale-[0.97]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin flex-shrink-0" size={13} />
                    <span className="hidden sm:inline">Processing…</span>
                  </>
                ) : isDrawMode ? (
                  <>
                    <Pencil size={13} className="flex-shrink-0" />
                    <span className="hidden sm:inline">Apply Edit</span>
                    <span className="sm:hidden"><Send size={13} /></span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="flex-shrink-0" />
                    <span className="hidden sm:inline">Generate</span>
                    <span className="sm:hidden"><Send size={13} /></span>
                  </>
                )}
              </button>

              {/* Tooltip */}
              {generateTooltip && !isGenerating && (
                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover/genbtn:opacity-100 pointer-events-none transition-opacity z-50">
                  <div className="bg-slate-900 dark:bg-white text-white dark:text-black px-3 py-2 rounded-lg text-[9px] font-semibold whitespace-nowrap shadow-xl">
                    {generateTooltip}
                  </div>
                  <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-900 dark:border-t-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
