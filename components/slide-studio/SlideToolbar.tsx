
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, RefreshCw, Loader2, LayoutGrid, ChevronDown,
  Sun, Moon, Bot, CheckCircle2,
} from 'lucide-react';
import { Slide, SlideLayout, LAYOUT_OPTIONS, AISuggestion } from '../../hooks/useSlideStudio';

interface Props {
  slide: Slide | null;
  onRegenBg: (id: string) => void;
  onChangeLayout: (id: string, layout: SlideLayout) => void;
  onChangeTextColor: (id: string, color: 'light' | 'dark') => void;
  onAISuggest: (id: string) => void;
  onApplySuggestion: (id: string, suggestion: AISuggestion) => void;
}

const SlideToolbar: React.FC<Props> = ({
  slide, onRegenBg, onChangeLayout, onChangeTextColor, onAISuggest, onApplySuggestion,
}) => {
  const [layoutOpen, setLayoutOpen] = React.useState(false);

  if (!slide) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1 — Layout + Text color + Regen BG */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Layout picker */}
        <div className="relative">
          <button
            onClick={() => setLayoutOpen(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 transition-all"
          >
            <LayoutGrid size={12} />
            {LAYOUT_OPTIONS.find(l => l.id === slide.layout)?.label ?? 'Layout'}
            <ChevronDown size={10} className={`transition-transform ${layoutOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {layoutOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                className="absolute top-full mt-1.5 left-0 z-50 bg-white dark:bg-[#1a1a1e] border border-black/[0.06] dark:border-white/[0.06] rounded-xl shadow-xl overflow-hidden min-w-[120px]"
              >
                {LAYOUT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { onChangeLayout(slide.id, opt.id); setLayoutOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium transition-colors hover:bg-brand-blue/[0.06]
                      ${slide.layout === opt.id
                        ? 'text-brand-blue bg-brand-blue/[0.05]'
                        : 'text-slate-600 dark:text-white/60'
                      }`}
                  >
                    {opt.label}
                    {slide.layout === opt.id && <CheckCircle2 size={10} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text color toggle */}
        <button
          onClick={() => onChangeTextColor(slide.id, slide.textColor === 'light' ? 'dark' : 'light')}
          title={`Chữ màu ${slide.textColor === 'light' ? 'sáng' : 'tối'} — click để đổi`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 transition-all"
        >
          {slide.textColor === 'light' ? <Sun size={12} /> : <Moon size={12} />}
          {slide.textColor === 'light' ? 'Chữ sáng' : 'Chữ tối'}
        </button>

        {/* Regen BG */}
        <button
          onClick={() => onRegenBg(slide.id)}
          disabled={slide.bgStatus === 'generating'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {slide.bgStatus === 'generating'
            ? <Loader2 size={12} className="animate-spin text-brand-blue" />
            : <RefreshCw size={12} />
          }
          {slide.bgStatus === 'generating' ? 'Đang gen...' : 'Tạo lại BG'}
        </button>

        {/* AI Suggest */}
        <button
          onClick={() => onAISuggest(slide.id)}
          disabled={slide.isSuggestLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/[0.06] border border-brand-blue/20 text-[11px] font-medium text-brand-blue hover:bg-brand-blue/[0.12] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {slide.isSuggestLoading
            ? <Loader2 size={12} className="animate-spin" />
            : <Bot size={12} />
          }
          {slide.isSuggestLoading ? 'Đang gợi ý...' : 'AI Gợi ý'}
        </button>
      </div>

      {/* AI Suggestions panel */}
      <AnimatePresence>
        {slide.aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={11} className="text-brand-blue" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/70">Gợi ý AI</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {slide.aiSuggestions.map((sug, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onApplySuggestion(slide.id, sug)}
                  className="text-left p-3 rounded-xl border border-brand-blue/20 bg-brand-blue/[0.03] hover:bg-brand-blue/[0.08] hover:border-brand-blue/40 transition-all group"
                >
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-white/80 mb-1 group-hover:text-brand-blue transition-colors line-clamp-1">
                    {sug.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-white/40 leading-relaxed line-clamp-2">
                    {sug.body}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlideToolbar;
