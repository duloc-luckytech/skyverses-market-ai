
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { Slide, SlideLayout } from '../../hooks/useSlideStudio';
import SlideTextStyleBar from './SlideTextStyleBar';

interface Props {
  slide: Slide | null;
  onUpdateTitle: (id: string, plain: string, html: string) => void;
  onUpdateBody: (id: string, plain: string, html: string) => void;
  onUpdateSlide: (id: string, patch: Partial<Slide>) => void;
  bottomBar?: React.ReactNode;
}

// Layout-aware text positioning (removed explicit sizes — let rich HTML carry them)
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

// ── Google Fonts injection ────────────────────────────────────────────────────
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

// ── Rich contentEditable text block ──────────────────────────────────────────

interface RichEditableProps {
  /** Plain text fallback (for initial render & reset) */
  plainValue: string;
  /** Rich HTML (if available) */
  htmlValue?: string;
  onChange: (plain: string, html: string) => void;
  className?: string;
  placeholder?: string;
  defaultFontSize?: number;
  onFocus?: () => void;
}

const RichEditable: React.FC<RichEditableProps> = ({
  plainValue, htmlValue, onChange, className = '', placeholder = '', defaultFontSize = 28, onFocus,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const slideId = useRef<string>('');

  // Initialize HTML on mount or when slide changes (not on every keystroke)
  useEffect(() => {
    if (!ref.current) return;
    const html = htmlValue || `<span style="font-size:${defaultFontSize}px">${plainValue}</span>`;
    if (ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plainValue.slice(0, 8)]); // Only re-init when first chars change (slide switch)

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={onFocus}
      onInput={() => {
        if (!ref.current) return;
        onChange(ref.current.innerText, ref.current.innerHTML);
      }}
      onKeyDown={(e) => {
        // Allow Enter for new lines (default behavior in contentEditable)
        // Shift+Enter always = line break
        if (e.key === 'Enter' && !e.shiftKey) {
          // Default in block contentEditable = new <div>, which is fine
        }
      }}
      data-placeholder={placeholder}
      className={`outline-none cursor-text min-h-[1em] w-full
        empty:before:content-[attr(data-placeholder)] empty:before:opacity-30
        focus:ring-1 focus:ring-brand-blue/30 focus:ring-inset rounded
        ${className}`}
    />
  );
};

// ── Main Canvas ───────────────────────────────────────────────────────────────

const SlideCanvas: React.FC<Props> = ({ slide, onUpdateTitle, onUpdateBody, onUpdateSlide, bottomBar }) => {
  injectGoogleFonts();

  const [isEditing, setIsEditing] = useState(false);
  const [styleBarVisible, setStyleBarVisible] = useState(false);

  // Listen for selection changes to show/hide style bar
  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      const hasFocus = !!(document.activeElement?.closest('[contenteditable]'));
      // Always show bar when editing, even without selection (cursor in field)
      const hasContent = hasFocus;
      setStyleBarVisible(hasContent);
    };
    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('focusin', handleSelection);
    document.addEventListener('focusout', () => {
      // Small delay to allow clicking style bar buttons
      setTimeout(() => {
        const hasFocus = !!(document.activeElement?.closest('[contenteditable]'));
        if (!hasFocus) setStyleBarVisible(false);
      }, 200);
    });
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
  }, []);

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

  const renderEditables = () => {
    const titleEl = (
      <RichEditable
        plainValue={slide.title}
        htmlValue={slide.titleHtml}
        defaultFontSize={slide.layout === 'full-bg' ? 48 : 36}
        onChange={(plain, html) => onUpdateTitle(slide.id, plain, html)}
        className={`${lc.title} ${textClass} drop-shadow-md text-2xl`}
        placeholder="Tiêu đề slide..."
        onFocus={() => setIsEditing(true)}
      />
    );
    const bodyEl = (
      <RichEditable
        plainValue={slide.body}
        htmlValue={slide.bodyHtml}
        defaultFontSize={18}
        onChange={(plain, html) => onUpdateBody(slide.id, plain, html)}
        className={`${lc.body} ${textClass} drop-shadow text-base`}
        placeholder="Nội dung slide... (Enter để xuống dòng)"
        onFocus={() => setIsEditing(true)}
      />
    );

    if (layout === 'two-col') {
      return <><div>{titleEl}</div><div>{bodyEl}</div></>;
    }
    if (layout === 'title-image') {
      return (
        <>
          <div className="flex flex-col justify-center">{titleEl}{bodyEl}</div>
          <div className="h-full flex items-center justify-center">
            <div className="w-full aspect-video rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur flex items-center justify-center">
              <p className="text-white/40 text-xs">Vùng ảnh</p>
            </div>
          </div>
        </>
      );
    }
    return <>{titleEl}{bodyEl}</>;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-[#0d0d0f] overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col items-center p-4 pb-3 gap-0 w-full">

          {/* ── Floating Rich Text Style Bar (Canva-style) ── */}
          <AnimatePresence>
            {styleBarVisible && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="mb-2 shrink-0 w-full max-w-4xl"
              >
                <SlideTextStyleBar visible={styleBarVisible} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Canvas frame ── */}
          <div
            className="w-full max-w-4xl aspect-video relative rounded-2xl overflow-hidden shadow-2xl border border-black/[0.08] dark:border-white/[0.04] shrink-0"
            onClick={() => setIsEditing(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsEditing(false);
              }
            }}
          >
            {/* Background */}
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

            {/* Overlay for readability */}
            <div className={`absolute inset-0 ${slide.textColor === 'light' ? 'bg-black/40' : 'bg-white/50'}`} />

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

            {/* Slide number */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/40 text-white text-[9px] font-bold backdrop-blur pointer-events-none">
              {slide.index + 1}
            </div>

            {/* Editing focus ring */}
            {isEditing && (
              <div className="absolute inset-0 ring-2 ring-brand-blue/40 rounded-2xl pointer-events-none" />
            )}

            {/* ── Content layer ── */}
            <div className={`absolute inset-0 ${lc.wrapper} ${textClass}`}>
              {renderEditables()}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="w-full max-w-4xl">
            {bottomBar}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideCanvas;
