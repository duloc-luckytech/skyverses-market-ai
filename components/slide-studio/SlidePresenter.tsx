
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, X, Maximize2, Minimize2,
  Play, Pause, LayoutGrid,
} from 'lucide-react';
import { Slide } from '../../hooks/useSlideStudio';
import { LAYOUT_CLASSES_PRESENTER } from './SlidePresenterLayouts';

interface Props {
  slides: Slide[];
  initialIndex?: number;
  onClose: () => void;
}

// ── Auto-advance interval options ─────────────────────────────────────────────
const AUTO_INTERVALS = [
  { label: 'Off', value: 0 },
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
];

// ── Slide renderer (presenter-quality) ───────────────────────────────────────

const PresenterSlide: React.FC<{ slide: Slide; idx: number; total: number }> = ({ slide, idx, total }) => {
  const lc = LAYOUT_CLASSES_PRESENTER[slide.layout] ?? LAYOUT_CLASSES_PRESENTER['title-center'];
  const textClass = slide.textColor === 'light' ? 'text-white' : 'text-slate-900';

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background */}
      {slide.bgImageUrl ? (
        <img
          src={slide.bgImageUrl}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
      )}

      {/* Overlay */}
      <div className={`absolute inset-0 ${slide.textColor === 'light' ? 'bg-black/40' : 'bg-white/50'}`} />

      {/* Content */}
      <div className={`absolute inset-0 ${lc.wrapper} ${textClass} select-none`}>
        {slide.layout === 'two-col' ? (
          <>
            <div className="flex flex-col justify-center">
              <div className={`${lc.title} ${textClass} drop-shadow-lg`}
                dangerouslySetInnerHTML={{ __html: slide.titleHtml || slide.title }} />
            </div>
            <div className="flex flex-col justify-center">
              <div className={`${lc.body} ${textClass} drop-shadow whitespace-pre-line`}
                dangerouslySetInnerHTML={{ __html: slide.bodyHtml || slide.body }} />
            </div>
          </>
        ) : slide.layout === 'title-image' ? (
          <>
            <div className="flex flex-col justify-center">
              <div className={`${lc.title} ${textClass} drop-shadow-lg`}
                dangerouslySetInnerHTML={{ __html: slide.titleHtml || slide.title }} />
              <div className={`${lc.body} ${textClass} drop-shadow mt-3 whitespace-pre-line`}
                dangerouslySetInnerHTML={{ __html: slide.bodyHtml || slide.body }} />
            </div>
            <div className="h-full flex items-center justify-center">
              <div className="w-full aspect-video rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur" />
            </div>
          </>
        ) : (
          <>
            <div className={`${lc.title} ${textClass} drop-shadow-lg`}
              dangerouslySetInnerHTML={{ __html: slide.titleHtml || slide.title }} />
            <div className={`${lc.body} ${textClass} drop-shadow mt-3 whitespace-pre-line`}
              dangerouslySetInnerHTML={{ __html: slide.bodyHtml || slide.body }} />
          </>
        )}
      </div>

      {/* Slide counter — bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === idx
                ? 'w-5 h-1.5 bg-white'
                : 'w-1.5 h-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ── Main presenter ────────────────────────────────────────────────────────────

const SlidePresenter: React.FC<Props> = ({ slides, initialIndex = 0, onClose }) => {
  const [idx, setIdx] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoInterval, setAutoInterval] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showOverview, setShowOverview] = useState(false);
  let controlsTimer: ReturnType<typeof setTimeout>;

  const goNext = useCallback(() => setIdx(i => Math.min(i + 1, slides.length - 1)), [slides.length]);
  const goPrev = useCallback(() => setIdx(i => Math.max(i - 1, 0)), []);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showOverview) {
        if (e.key === 'Escape') setShowOverview(false);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault(); goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); goPrev();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'g' || e.key === 'G') {
        setShowOverview(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose, showOverview]);

  // ── Auto-advance ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || autoInterval === 0) return;
    const t = setTimeout(() => {
      if (idx < slides.length - 1) {
        goNext();
      } else {
        setIsPlaying(false);
      }
    }, autoInterval);
    return () => clearTimeout(t);
  }, [isPlaying, autoInterval, idx, slides.length, goNext]);

  // ── Fullscreen ───────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Show/hide controls on mouse move ────────────────────────────────────
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer);
    controlsTimer = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const slide = slides[idx];
  if (!slide) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black flex flex-col"
      onMouseMove={handleMouseMove}
    >
      {/* Slides area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <PresenterSlide slide={slide} idx={idx} total={slides.length} />
          </motion.div>
        </AnimatePresence>

        {/* ── Overview grid ── */}
        <AnimatePresence>
          {showOverview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md z-10 p-8 overflow-y-auto"
            >
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest text-center mb-6">
                Tổng quan — {slides.length} slides
              </p>
              <div className="grid grid-cols-4 gap-4 max-w-5xl mx-auto">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => { setIdx(i); setShowOverview(false); }}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      i === idx ? 'border-brand-blue shadow-lg shadow-brand-blue/30' : 'border-white/10'
                    }`}
                  >
                    {s.bgImageUrl ? (
                      <img src={s.bgImageUrl} alt={s.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-2">
                      <p className="text-white text-[9px] font-semibold text-center line-clamp-2 drop-shadow">
                        {s.title}
                      </p>
                    </div>
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-black/50 text-white text-[8px] font-bold">
                      {i + 1}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Controls bar ── */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 flex items-center justify-between px-6 py-3 bg-black/70 backdrop-blur-md border-t border-white/[0.06]"
          >
            {/* Left: slide info */}
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-[11px] font-mono">
                {idx + 1} / {slides.length}
              </span>
              <span className="text-white/60 text-[12px] font-medium max-w-[200px] truncate">
                {slide.title}
              </span>
            </div>

            {/* Center: navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={goPrev}
                disabled={idx === 0}
                className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/[0.15] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Auto-play toggle */}
              <select
                value={autoInterval}
                onChange={e => { setAutoInterval(Number(e.target.value)); setIsPlaying(Number(e.target.value) > 0); }}
                className="bg-white/[0.08] text-white text-[11px] font-medium rounded-lg px-2 py-1 outline-none border border-white/10"
              >
                {AUTO_INTERVALS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                ))}
              </select>

              <button
                onClick={() => setIsPlaying(v => !v)}
                disabled={autoInterval === 0}
                title={isPlaying ? 'Tạm dừng' : 'Tự động chuyển'}
                className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/[0.15] transition-colors"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>

              <button
                onClick={goNext}
                disabled={idx === slides.length - 1}
                className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/[0.15] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Right: fullscreen + overview + close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOverview(v => !v)}
                title="Tổng quan slides (G)"
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors ${
                  showOverview ? 'bg-brand-blue/60' : 'bg-white/[0.08] hover:bg-white/[0.15]'
                }`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={toggleFullscreen}
                title="Fullscreen (F)"
                className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-white hover:bg-white/[0.15] transition-colors"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                onClick={onClose}
                title="Đóng (Esc)"
                className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-white hover:bg-red-500/60 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard hint */}
      <AnimatePresence>
        {showControls && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/20 text-[10px] font-medium pointer-events-none"
          >
            ← → Space để chuyển · F fullscreen · G tổng quan · Esc thoát
          </motion.p>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
};

export default SlidePresenter;
