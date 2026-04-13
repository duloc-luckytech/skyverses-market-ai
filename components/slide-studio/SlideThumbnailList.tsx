
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Trash2, AlertCircle, X } from 'lucide-react';
import { Slide } from '../../hooks/useSlideStudio';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (id: string) => void;
  onAddSlide: () => void;
  onRemoveSlide: (id: string) => void;
  onMoveSlide: (from: number, to: number) => void;
  onGenSlideBg: (id: string) => void;
  onAISuggest: (id: string) => void;
  onUpdateSlide: (id: string, patch: Partial<Slide>) => void;
}

// ── Status dot ────────────────────────────────────────────────────────────────

const StatusDot: React.FC<{ status: Slide['bgStatus'] }> = ({ status }) => {
  if (status === 'idle') return null;
  const colors: Record<string, string> = {
    generating: 'bg-amber-400 animate-pulse',
    done: 'bg-emerald-400',
    error: 'bg-red-400',
  };
  return (
    <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${colors[status] ?? ''}`} />
  );
};

// ── Per-slide ref image row ───────────────────────────────────────────────────

const SlideRefImageRow: React.FC<{
  images: string[];
  onChange: (imgs: string[]) => void;
}> = ({ images, onChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      onChange([...images.slice(0, 1), url]); // max 2
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex gap-1 items-center flex-wrap">
      {images.map((img, i) => (
        <button
          key={i}
          onClick={() => onChange(images.filter((_, j) => j !== i))}
          className="relative w-8 h-8 rounded overflow-hidden border border-black/10 dark:border-white/10 shrink-0 group"
          title="Xoá ảnh"
          type="button"
        >
          <img src={img} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <X size={8} className="text-white" />
          </div>
        </button>
      ))}
      {images.length < 2 && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-8 h-8 rounded border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center text-slate-400 dark:text-white/30 hover:text-brand-blue hover:border-brand-blue/50 transition-colors shrink-0"
          title="Thêm ảnh tham chiếu"
        >
          <Plus size={10} />
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAdd} className="hidden" />
        </button>
      )}
      {images.length === 0 && (
        <span className="text-[8px] text-slate-400 dark:text-white/20">Ref ảnh</span>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const SlideThumbnailList: React.FC<Props> = ({
  slides,
  activeSlideId,
  onSelectSlide,
  onAddSlide,
  onRemoveSlide,
  onGenSlideBg,
  onAISuggest,
  onUpdateSlide,
}) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-black/[0.02] dark:bg-white/[0.02] border-r border-black/[0.06] dark:border-white/[0.05] w-[132px] shrink-0">
      {/* Header */}
      <div className="sticky top-0 z-10 px-2 py-2.5 bg-white/80 dark:bg-[#0f0f11]/80 backdrop-blur border-b border-black/[0.05] dark:border-white/[0.05]">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 text-center">
          Slides ({slides.length})
        </p>
      </div>

      {/* Slide list */}
      <div className="flex flex-col gap-2 p-2 flex-1">
        <AnimatePresence initial={false}>
          {slides.map((slide, idx) => {
            const isActive = slide.id === activeSlideId;
            return (
              <motion.div
                key={slide.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                className="relative group cursor-pointer"
                onClick={() => onSelectSlide(slide.id)}
              >
                {/* Thumbnail frame */}
                <div
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-150
                    ${isActive
                      ? 'border-brand-blue shadow-md shadow-brand-blue/20'
                      : 'border-black/[0.08] dark:border-white/[0.06] hover:border-brand-blue/40'
                    }`}
                >
                  {/* BG image or placeholder */}
                  {slide.bgImageUrl ? (
                    <img
                      src={slide.bgImageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/[0.03] dark:to-white/[0.06] flex items-center justify-center">
                      {slide.bgStatus === 'generating' ? (
                        <Loader2 size={12} className="animate-spin text-brand-blue" />
                      ) : slide.bgStatus === 'error' ? (
                        <AlertCircle size={12} className="text-red-400" />
                      ) : (
                        <div className="w-6 h-0.5 bg-slate-300 dark:bg-white/10 rounded" />
                      )}
                    </div>
                  )}

                  {/* Title overlay */}
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-1">
                    <p className="text-white text-[7px] font-semibold leading-tight text-center line-clamp-2 drop-shadow">
                      {slide.title}
                    </p>
                  </div>

                  {/* Status dot */}
                  <StatusDot status={slide.bgStatus} />

                  {/* Delete btn */}
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveSlide(slide.id); }}
                      className="absolute top-0.5 left-0.5 w-4 h-4 rounded bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                    >
                      <Trash2 size={9} />
                    </button>
                  )}
                </div>

                {/* Slide number */}
                <p className={`text-center text-[9px] mt-1 font-medium ${isActive ? 'text-brand-blue' : 'text-slate-400 dark:text-white/30'}`}>
                  {idx + 1}
                </p>

                {/* ── Per-slide action panel (active only) ── */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key="slide-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="mt-1.5 flex flex-col gap-1.5 pb-1">
                        {/* Prompt textarea */}
                        <textarea
                          rows={2}
                          value={slide.bgPrompt ?? ''}
                          onChange={(e) => onUpdateSlide(slide.id, { bgPrompt: e.target.value })}
                          placeholder="Prompt hình nền..."
                          className="w-full text-[9px] rounded-lg bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.07] px-2 py-1.5 text-slate-700 dark:text-white/70 placeholder-slate-400 dark:placeholder-white/20 resize-none outline-none focus:border-brand-blue/50 leading-relaxed"
                        />

                        {/* Ref images */}
                        <SlideRefImageRow
                          images={slide.slideRefImages ?? []}
                          onChange={(imgs) => onUpdateSlide(slide.id, { slideRefImages: imgs })}
                        />

                        {/* Action buttons */}
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => onAISuggest(slide.id)}
                            disabled={slide.isSuggestLoading}
                            className="flex-1 flex items-center justify-center gap-0.5 py-1.5 rounded-lg bg-violet-500/10 text-violet-500 text-[9px] font-semibold hover:bg-violet-500/20 transition-colors disabled:opacity-40"
                          >
                            {slide.isSuggestLoading
                              ? <Loader2 size={8} className="animate-spin" />
                              : <span>💡</span>
                            }
                            <span>Gợi ý</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onGenSlideBg(slide.id)}
                            disabled={slide.bgStatus === 'generating'}
                            className="flex-1 flex items-center justify-center gap-0.5 py-1.5 rounded-lg bg-brand-blue/10 text-brand-blue text-[9px] font-semibold hover:bg-brand-blue/20 transition-colors disabled:opacity-40"
                          >
                            {slide.bgStatus === 'generating' ? (
                              <><Loader2 size={8} className="animate-spin" /><span>Gen...</span></>
                            ) : (
                              <span>🖼 Gen</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add slide */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAddSlide}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center hover:border-brand-blue/50 hover:bg-brand-blue/[0.03] transition-all group"
        >
          <Plus size={14} className="text-slate-400 dark:text-white/30 group-hover:text-brand-blue transition-colors" />
        </motion.button>
      </div>
    </div>
  );
};

export default SlideThumbnailList;
