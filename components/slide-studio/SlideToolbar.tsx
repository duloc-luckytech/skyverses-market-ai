
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, RefreshCw, Loader2, LayoutGrid, ChevronDown,
  Sun, Moon, Bot, CheckCircle2, Trash2, Copy, ImageOff, Layers, Upload,
} from 'lucide-react';
import { Slide, SlideLayout, LAYOUT_OPTIONS, AISuggestion } from '../../hooks/useSlideStudio';

interface Props {
  slide: Slide | null;
  slides: Slide[];
  onRegenBg: (id: string) => void;
  onGenAllBg: () => void;
  onClearBg: (id: string) => void;
  onUploadBg: (id: string, dataUrl: string) => void;
  onDuplicateSlide: (id: string) => void;
  onChangeLayout: (id: string, layout: SlideLayout) => void;
  onChangeTextColor: (id: string, color: 'light' | 'dark') => void;
  onAISuggest: (id: string) => void;
  onApplySuggestion: (id: string, suggestion: AISuggestion) => void;
  isGenAlling?: boolean;
  genAllProgress?: { done: number; total: number };
}

const SlideToolbar: React.FC<Props> = ({
  slide, slides,
  onRegenBg, onGenAllBg, onClearBg, onUploadBg, onDuplicateSlide,
  onChangeLayout, onChangeTextColor,
  onAISuggest, onApplySuggestion,
  isGenAlling, genAllProgress,
}) => {
  const uploadBgRef = useRef<HTMLInputElement>(null);

  const handleUploadBg = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !slide) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) onUploadBg(slide.id, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [slide, onUploadBg]);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [layoutPos, setLayoutPos] = useState({ top: 0, left: 0 });
  const layoutTriggerRef = useRef<HTMLButtonElement>(null);
  const layoutDropRef = useRef<HTMLDivElement>(null);

  const computeLayoutPos = useCallback(() => {
    if (!layoutTriggerRef.current) return;
    const r = layoutTriggerRef.current.getBoundingClientRect();
    setLayoutPos({ top: r.bottom + 4, left: r.left });
  }, []);

  const toggleLayout = useCallback(() => {
    computeLayoutPos();
    setLayoutOpen(v => !v);
  }, [computeLayoutPos]);

  // Close layout dropdown on outside click
  useEffect(() => {
    if (!layoutOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (layoutTriggerRef.current?.contains(t) || layoutDropRef.current?.contains(t)) return;
      setLayoutOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [layoutOpen]);

  if (!slide) return null;

  const anyGenerating = slides.some(s => s.bgStatus === 'generating');

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1 — controls */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Layout picker — Portal */}
        <button
          ref={layoutTriggerRef}
          onClick={toggleLayout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 transition-all"
        >
          <LayoutGrid size={12} />
          {LAYOUT_OPTIONS.find(l => l.id === slide.layout)?.label ?? 'Layout'}
          <ChevronDown size={10} className={`transition-transform ${layoutOpen ? 'rotate-180' : ''}`} />
        </button>

        {createPortal(
          <AnimatePresence>
            {layoutOpen && (
              <motion.div
                ref={layoutDropRef}
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                style={{ position: 'fixed', top: layoutPos.top, left: layoutPos.left, zIndex: 99999 }}
                className="bg-white dark:bg-[#1a1a1e] border border-black/[0.06] dark:border-white/[0.06] rounded-xl shadow-xl overflow-hidden min-w-[120px]"
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
          </AnimatePresence>,
          document.body,
        )}

        {/* Text color toggle */}
        <button
          onClick={() => onChangeTextColor(slide.id, slide.textColor === 'light' ? 'dark' : 'light')}
          title={`Chữ màu ${slide.textColor === 'light' ? 'sáng' : 'tối'} — click để đổi`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 transition-all"
        >
          {slide.textColor === 'light' ? <Sun size={12} /> : <Moon size={12} />}
          {slide.textColor === 'light' ? 'Chữ sáng' : 'Chữ tối'}
        </button>

        {/* Regen BG (current slide) */}
        <button
          onClick={() => onRegenBg(slide.id)}
          disabled={slide.bgStatus === 'generating' || isGenAlling}
          title="Tạo lại hình nền cho slide này"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {slide.bgStatus === 'generating'
            ? <Loader2 size={12} className="animate-spin text-brand-blue" />
            : <RefreshCw size={12} />
          }
          {slide.bgStatus === 'generating' ? 'Đang gen...' : 'Tạo lại BG'}
        </button>

        {/* Upload BG */}
        <label
          title="Upload hình nền từ máy tính"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 hover:text-brand-blue transition-all cursor-pointer"
        >
          <Upload size={12} />
          Upload BG
          <input
            ref={uploadBgRef}
            type="file"
            accept="image/*"
            onChange={handleUploadBg}
            className="hidden"
          />
        </label>

        {/* Clear BG */}
        {slide.bgImageUrl && (
          <button
            onClick={() => onClearBg(slide.id)}
            title="Xoá hình nền slide này"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-500 dark:text-white/50 hover:text-red-400 hover:border-red-400/40 transition-all"
          >
            <ImageOff size={12} />
            Xoá BG
          </button>
        )}

        {/* Duplicate slide */}
        <button
          onClick={() => onDuplicateSlide(slide.id)}
          title="Nhân bản slide này"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 transition-all"
        >
          <Copy size={12} />
          Nhân bản
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

        {/* Gen ALL BG */}
        <button
          onClick={onGenAllBg}
          disabled={anyGenerating || isGenAlling}
          title="Tạo hình nền AI cho TẤT CẢ slides theo thứ tự"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
        >
          {isGenAlling
            ? <Loader2 size={12} className="animate-spin" />
            : <Layers size={12} />
          }
          {isGenAlling && genAllProgress
            ? `Gen All ${genAllProgress.done}/${genAllProgress.total}`
            : 'Gen All BG'
          }
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
