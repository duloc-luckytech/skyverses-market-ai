
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { Slide, SlideLayout } from '../../hooks/useSlideStudio';

interface Props {
  slide: Slide | null;
  onUpdateTitle: (id: string, value: string) => void;
  onUpdateBody: (id: string, value: string) => void;
  bottomBar?: React.ReactNode;
}

// Layout-aware text positioning
const LAYOUT_CLASSES: Record<SlideLayout, { wrapper: string; title: string; body: string }> = {
  'title-center': {
    wrapper: 'flex flex-col items-center justify-center text-center px-10',
    title: 'text-3xl font-bold mb-4 w-full',
    body: 'text-base leading-relaxed w-full max-w-xl',
  },
  'title-left': {
    wrapper: 'flex flex-col justify-center px-12',
    title: 'text-3xl font-bold mb-4 max-w-2xl',
    body: 'text-base leading-relaxed max-w-xl',
  },
  'full-bg': {
    wrapper: 'flex flex-col items-center justify-end text-center pb-12 px-10',
    title: 'text-4xl font-black mb-2 w-full',
    body: 'text-sm leading-relaxed w-full max-w-lg opacity-90',
  },
  'two-col': {
    wrapper: 'grid grid-cols-2 gap-6 px-10 items-center',
    title: 'text-2xl font-bold',
    body: 'text-sm leading-relaxed',
  },
  'title-image': {
    wrapper: 'grid grid-cols-2 gap-6 px-10 items-center',
    title: 'text-2xl font-bold mb-3',
    body: 'text-sm leading-relaxed',
  },
};

const EditableText: React.FC<{
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}> = ({ value, onChange, className = '', placeholder = '', multiline = false }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Sync external value changes without disrupting cursor
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`bg-transparent border-none outline-none resize-none w-full placeholder-white/30 ${className}`}
      />
    );
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={e => onChange((e.target as HTMLDivElement).innerText)}
      data-placeholder={placeholder}
      className={`outline-none cursor-text min-h-[1em] w-full
        empty:before:content-[attr(data-placeholder)] empty:before:opacity-30
        ${className}`}
    />
  );
};

const SlideCanvas: React.FC<Props> = ({ slide, onUpdateTitle, onUpdateBody, bottomBar }) => {
  if (!slide) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#0d0d0f]">
        <p className="text-sm text-slate-400 dark:text-white/30">Chưa có slide nào</p>
      </div>
    );
  }

  const layout = slide.layout;
  const lc = LAYOUT_CLASSES[layout];
  const textClass = slide.textColor === 'light' ? 'text-white' : 'text-slate-900';
  const placeholderClass = slide.textColor === 'light' ? 'placeholder-white/30' : 'placeholder-slate-400';

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-[#0d0d0f] overflow-hidden min-h-0">
      {/* Scrollable area: canvas frame + bottom bar stacked from top */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col items-center p-4 pb-3 gap-0 w-full">
        {/* Canvas frame */}
        <div className="w-full max-w-4xl aspect-video relative rounded-2xl overflow-hidden shadow-2xl border border-black/[0.08] dark:border-white/[0.04] shrink-0">

          {/* Background image */}
          <AnimatePresence mode="wait">
            {slide.bgImageUrl ? (
              <motion.img
                key={slide.bgImageUrl}
                src={slide.bgImageUrl}
                alt="Slide background"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <motion.div
                key="placeholder"
                className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-[#111] dark:to-[#1a1a22]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </AnimatePresence>

          {/* Overlay gradient for readability */}
          <div className={`absolute inset-0 ${
            slide.textColor === 'light'
              ? 'bg-black/40'
              : 'bg-white/50'
          }`} />

          {/* Generating overlay */}
          <AnimatePresence>
            {slide.bgStatus === 'generating' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-medium"
              >
                <Loader2 size={10} className="animate-spin text-brand-blue" />
                Đang gen ảnh...
              </motion.div>
            )}
            {slide.bgStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-500/80 text-white text-[10px] font-medium"
              >
                <AlertCircle size={10} />
                Lỗi gen ảnh
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slide number badge */}
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/40 text-white text-[9px] font-bold backdrop-blur">
            {slide.index + 1}
          </div>

          {/* Content layer */}
          <div className={`absolute inset-0 ${lc.wrapper} ${textClass}`}>
            {layout === 'two-col' ? (
              <>
                {/* Left col: title */}
                <div>
                  <EditableText
                    value={slide.title}
                    onChange={v => onUpdateTitle(slide.id, v)}
                    className={`${lc.title} ${textClass} drop-shadow-md`}
                    placeholder="Tiêu đề slide..."
                  />
                </div>
                {/* Right col: body */}
                <div>
                  <EditableText
                    value={slide.body}
                    onChange={v => onUpdateBody(slide.id, v)}
                    className={`${lc.body} ${textClass} ${placeholderClass} drop-shadow`}
                    placeholder="Nội dung slide..."
                    multiline
                  />
                </div>
              </>
            ) : layout === 'title-image' ? (
              <>
                {/* Left: text */}
                <div className="flex flex-col justify-center">
                  <EditableText
                    value={slide.title}
                    onChange={v => onUpdateTitle(slide.id, v)}
                    className={`${lc.title} ${textClass} drop-shadow-md`}
                    placeholder="Tiêu đề..."
                  />
                  <EditableText
                    value={slide.body}
                    onChange={v => onUpdateBody(slide.id, v)}
                    className={`${lc.body} ${textClass} ${placeholderClass} drop-shadow`}
                    placeholder="Nội dung..."
                    multiline
                  />
                </div>
                {/* Right: decorative frame */}
                <div className="h-full flex items-center justify-center">
                  <div className="w-full aspect-video rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur flex items-center justify-center">
                    <p className="text-white/40 text-xs">Vùng ảnh</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <EditableText
                  value={slide.title}
                  onChange={v => onUpdateTitle(slide.id, v)}
                  className={`${lc.title} ${textClass} drop-shadow-md`}
                  placeholder="Tiêu đề slide..."
                />
                <EditableText
                  value={slide.body}
                  onChange={v => onUpdateBody(slide.id, v)}
                  className={`${lc.body} ${textClass} ${placeholderClass} drop-shadow`}
                  placeholder="Nội dung slide..."
                  multiline
                />
              </>
            )}
          </div>
        </div>

        {/* Bottom bar — full width aligned with canvas card */}
        <div className="w-full max-w-4xl">
          {bottomBar}
        </div>
        </div>
      </div>
    </div>
  );
};

export default SlideCanvas;
