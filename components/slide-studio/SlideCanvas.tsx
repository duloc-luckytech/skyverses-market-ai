
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { Slide, SlideLayout, TextStyle } from '../../hooks/useSlideStudio';
import SlideTextStyleBar from './SlideTextStyleBar';

interface Props {
  slide: Slide | null;
  onUpdateTitle: (id: string, value: string) => void;
  onUpdateBody: (id: string, value: string) => void;
  onUpdateSlide: (id: string, patch: Partial<Slide>) => void;
  bottomBar?: React.ReactNode;
}

// Layout-aware text positioning
const LAYOUT_CLASSES: Record<SlideLayout, { wrapper: string; title: string; body: string }> = {
  'title-center': {
    wrapper: 'flex flex-col items-center justify-center text-center px-10',
    title: 'font-bold mb-4 w-full',
    body: 'leading-relaxed w-full max-w-xl',
  },
  'title-left': {
    wrapper: 'flex flex-col justify-center px-12',
    title: 'font-bold mb-4 max-w-2xl',
    body: 'leading-relaxed max-w-xl',
  },
  'full-bg': {
    wrapper: 'flex flex-col items-center justify-end text-center pb-12 px-10',
    title: 'font-black mb-2 w-full',
    body: 'leading-relaxed w-full max-w-lg opacity-90',
  },
  'two-col': {
    wrapper: 'grid grid-cols-2 gap-6 px-10 items-center',
    title: 'font-bold',
    body: 'leading-relaxed',
  },
  'title-image': {
    wrapper: 'grid grid-cols-2 gap-6 px-10 items-center',
    title: 'font-bold mb-3',
    body: 'leading-relaxed',
  },
};

// ── Helper: build inline style from TextStyle ──────────────────────────────────
function toInlineStyle(ts?: TextStyle, defaults?: React.CSSProperties): React.CSSProperties {
  if (!ts) return defaults ?? {};
  return {
    fontFamily: ts.fontFamily,
    fontSize: ts.fontSize ? `${ts.fontSize}px` : undefined,
    fontWeight: ts.fontWeight,
    fontStyle: ts.fontStyle,
    textAlign: ts.textAlign,
    letterSpacing: ts.letterSpacing ? `${ts.letterSpacing}em` : undefined,
    ...defaults,
  };
}

// ── Editable text block ────────────────────────────────────────────────────────

const EditableText: React.FC<{
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
  onFocus?: () => void;
  onBlur?: () => void;
}> = ({ value, onChange, className = '', placeholder = '', multiline = false, style, onFocus, onBlur }) => {
  const ref = useRef<HTMLDivElement>(null);

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
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={4}
        style={style}
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
      onFocus={onFocus}
      onBlur={onBlur}
      data-placeholder={placeholder}
      style={style}
      className={`outline-none cursor-text min-h-[1em] w-full
        empty:before:content-[attr(data-placeholder)] empty:before:opacity-30
        ${className}`}
    />
  );
};

// ── Google Fonts link (injected once) ─────────────────────────────────────────
let fontsInjected = false;
function injectGoogleFonts() {
  if (fontsInjected || typeof document === 'undefined') return;
  fontsInjected = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;900&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,400;0,700;0,900;1,400&family=Oswald:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap';
  document.head.appendChild(link);
}

// ── Main Canvas ───────────────────────────────────────────────────────────────

const SlideCanvas: React.FC<Props> = ({ slide, onUpdateTitle, onUpdateBody, onUpdateSlide, bottomBar }) => {
  injectGoogleFonts();

  const [focusedBlock, setFocusedBlock] = useState<'title' | 'body' | null>(null);

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

  const titleInline = toInlineStyle(slide.titleStyle, { fontSize: '1.875rem' }); // default 30px
  const bodyInline  = toInlineStyle(slide.bodyStyle,  { fontSize: '1rem' });

  const sharedEditProps = (target: 'title' | 'body') => ({
    onFocus: () => setFocusedBlock(target),
    onBlur:  () => setTimeout(() => setFocusedBlock(prev => prev === target ? null : prev), 150),
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-[#0d0d0f] overflow-hidden min-h-0">
      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col items-center p-4 pb-3 gap-0 w-full">

          {/* ── Text Style Bar (Canva-style, floats above canvas) ── */}
          <AnimatePresence>
            {focusedBlock && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-4xl mb-2 shrink-0"
              >
                <SlideTextStyleBar
                  target={focusedBlock}
                  style={focusedBlock === 'title' ? (slide.titleStyle ?? {}) : (slide.bodyStyle ?? {})}
                  onChange={(patch) => {
                    if (focusedBlock === 'title') {
                      onUpdateSlide(slide.id, { titleStyle: { ...slide.titleStyle, ...patch } });
                    } else {
                      onUpdateSlide(slide.id, { bodyStyle: { ...slide.bodyStyle, ...patch } });
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

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
              slide.textColor === 'light' ? 'bg-black/40' : 'bg-white/50'
            }`} />

            {/* Status overlays */}
            <AnimatePresence>
              {slide.bgStatus === 'generating' && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-medium"
                >
                  <Loader2 size={10} className="animate-spin text-brand-blue" />
                  Đang gen ảnh...
                </motion.div>
              )}
              {slide.bgStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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

            {/* Focus ring indicator */}
            {focusedBlock && (
              <div className="absolute inset-0 ring-2 ring-brand-blue/50 rounded-2xl pointer-events-none" />
            )}

            {/* Content layer */}
            <div className={`absolute inset-0 ${lc.wrapper} ${textClass}`}>
              {layout === 'two-col' ? (
                <>
                  <div>
                    <EditableText
                      value={slide.title}
                      onChange={v => onUpdateTitle(slide.id, v)}
                      className={`${lc.title} ${textClass} drop-shadow-md`}
                      placeholder="Tiêu đề slide..."
                      style={titleInline}
                      {...sharedEditProps('title')}
                    />
                  </div>
                  <div>
                    <EditableText
                      value={slide.body}
                      onChange={v => onUpdateBody(slide.id, v)}
                      className={`${lc.body} ${textClass} ${placeholderClass} drop-shadow`}
                      placeholder="Nội dung slide..."
                      multiline
                      style={bodyInline}
                      {...sharedEditProps('body')}
                    />
                  </div>
                </>
              ) : layout === 'title-image' ? (
                <>
                  <div className="flex flex-col justify-center">
                    <EditableText
                      value={slide.title}
                      onChange={v => onUpdateTitle(slide.id, v)}
                      className={`${lc.title} ${textClass} drop-shadow-md`}
                      placeholder="Tiêu đề..."
                      style={titleInline}
                      {...sharedEditProps('title')}
                    />
                    <EditableText
                      value={slide.body}
                      onChange={v => onUpdateBody(slide.id, v)}
                      className={`${lc.body} ${textClass} ${placeholderClass} drop-shadow`}
                      placeholder="Nội dung..."
                      multiline
                      style={bodyInline}
                      {...sharedEditProps('body')}
                    />
                  </div>
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
                    style={titleInline}
                    {...sharedEditProps('title')}
                  />
                  <EditableText
                    value={slide.body}
                    onChange={v => onUpdateBody(slide.id, v)}
                    className={`${lc.body} ${textClass} ${placeholderClass} drop-shadow`}
                    placeholder="Nội dung slide..."
                    multiline
                    style={bodyInline}
                    {...sharedEditProps('body')}
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
