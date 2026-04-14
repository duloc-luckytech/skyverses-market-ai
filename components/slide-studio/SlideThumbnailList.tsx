
import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Trash2, AlertCircle, Copy, GripVertical, CheckCircle2 } from 'lucide-react';
import { Slide } from '../../hooks/useSlideStudio';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (id: string) => void;
  onAddSlide: () => void;
  onRemoveSlide: (id: string) => void;
  onDuplicateSlide: (id: string) => void;
  onMoveSlide: (from: number, to: number) => void;
}

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: Slide['bgStatus']; hasBg: boolean }> = ({ status, hasBg }) => {
  if (status === 'idle' && !hasBg) return null;
  if (status === 'done' || (status === 'idle' && hasBg)) {
    return (
      <span className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur-sm">
        <CheckCircle2 size={7} className="text-white" />
        <span className="text-[6px] font-bold text-white leading-none">BG</span>
      </span>
    );
  }
  if (status === 'generating') {
    return (
      <span className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-amber-500/80 backdrop-blur-sm animate-pulse">
        <Loader2 size={7} className="text-white animate-spin" />
        <span className="text-[6px] font-bold text-white leading-none">Gen</span>
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-red-500/80 backdrop-blur-sm">
        <AlertCircle size={7} className="text-white" />
        <span className="text-[6px] font-bold text-white leading-none">Err</span>
      </span>
    );
  }
  return null;
};

// ── Main component ────────────────────────────────────────────────────────────

const SlideThumbnailList: React.FC<Props> = ({
  slides,
  activeSlideId,
  onSelectSlide,
  onAddSlide,
  onRemoveSlide,
  onDuplicateSlide,
  onMoveSlide,
}) => {
  // ── Drag-to-reorder state ────────────────────────────────────────────────
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragStartIdxRef = useRef<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    dragStartIdxRef.current = idx;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    // Make the ghost image semi-transparent
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIdx(idx);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = dragStartIdxRef.current;
    if (fromIdx !== null && fromIdx !== toIdx) {
      onMoveSlide(fromIdx, toIdx);
    }
    setDragIdx(null);
    setOverIdx(null);
    dragStartIdxRef.current = null;
  }, [onMoveSlide]);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
    dragStartIdxRef.current = null;
  }, []);

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-black/[0.02] dark:bg-white/[0.02] border-r border-black/[0.06] dark:border-white/[0.05] w-[120px] shrink-0">
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
            const isDragging = dragIdx === idx;
            const isOver = overIdx === idx && dragIdx !== null && dragIdx !== idx;

            return (
              <motion.div
                key={slide.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isDragging ? 0.4 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                draggable
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, idx)}
                onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, idx)}
                onDrop={(e) => handleDrop(e as unknown as React.DragEvent, idx)}
                onDragEnd={handleDragEnd}
                className={`relative group cursor-pointer select-none transition-all ${
                  isOver ? 'ring-2 ring-brand-blue/60 ring-offset-1 ring-offset-transparent rounded-lg' : ''
                }`}
                onClick={() => onSelectSlide(slide.id)}
              >
                {/* Drop indicator line above */}
                {isOver && overIdx! < (dragIdx ?? 999) && (
                  <div className="absolute -top-1 left-0 right-0 h-0.5 bg-brand-blue rounded-full z-20" />
                )}

                {/* Thumbnail frame */}
                <div
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-150
                    ${isActive
                      ? 'border-brand-blue shadow-md shadow-brand-blue/20'
                      : 'border-black/[0.08] dark:border-white/[0.06] hover:border-brand-blue/40'
                    }`}
                >
                  {/* Drag handle — shows on hover at top-left */}
                  <div className="absolute top-0.5 left-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <div className="w-4 h-4 rounded bg-black/40 flex items-center justify-center">
                      <GripVertical size={8} className="text-white/80" />
                    </div>
                  </div>

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

                  {/* Status badge — top right */}
                  <StatusBadge status={slide.bgStatus} hasBg={!!slide.bgImageUrl} />

                  {/* Action buttons row — appear on hover at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-0.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    {/* Duplicate */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicateSlide(slide.id); }}
                      title="Nhân bản slide"
                      className="w-5 h-5 rounded bg-black/50 text-white flex items-center justify-center hover:bg-sky-500/80 transition-colors"
                    >
                      <Copy size={8} />
                    </button>

                    {/* Delete */}
                    {slides.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemoveSlide(slide.id); }}
                        title="Xoá slide"
                        className="w-5 h-5 rounded bg-black/50 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors"
                      >
                        <Trash2 size={8} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Drop indicator line below */}
                {isOver && overIdx! > (dragIdx ?? -1) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-blue rounded-full z-20" />
                )}

                {/* Slide number */}
                <p className={`text-center text-[9px] mt-1 font-medium ${isActive ? 'text-brand-blue' : 'text-slate-400 dark:text-white/30'}`}>
                  {idx + 1}
                </p>
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
