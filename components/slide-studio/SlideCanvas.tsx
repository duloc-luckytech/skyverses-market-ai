
import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { Slide, SlideLayout } from '../../hooks/useSlideStudio';
import SlideTextBlock, { SlideTextBlockHandle } from './SlideTextBlock';
import SlideFormatBar from './SlideFormatBar';

interface Props {
  slide: Slide | null;
  onUpdateTitle: (id: string, plain: string, html: string) => void;
  onUpdateBody: (id: string, plain: string, html: string) => void;
  onUpdateSlide: (id: string, patch: Partial<Slide>) => void;
  bottomBar?: React.ReactNode;
}

// ── Layout definitions ────────────────────────────────────────────────────────

interface LayoutDef {
  canvasClass: string;
  title: { class: string; size: number };
  body:  { class: string; size: number };
}

const LAYOUTS: Record<SlideLayout, LayoutDef> = {
  'title-center': {
    canvasClass: 'flex flex-col items-center justify-center text-center px-12',
    title: { class: 'w-full mb-5', size: 40 },
    body:  { class: 'w-full max-w-2xl', size: 20 },
  },
  'title-left': {
    canvasClass: 'flex flex-col justify-center px-14',
    title: { class: 'w-full max-w-3xl mb-5', size: 40 },
    body:  { class: 'w-full max-w-2xl', size: 20 },
  },
  'full-bg': {
    canvasClass: 'flex flex-col items-center justify-end text-center pb-14 px-12',
    title: { class: 'w-full mb-3', size: 52 },
    body:  { class: 'w-full max-w-2xl', size: 18 },
  },
  'two-col': {
    canvasClass: 'grid grid-cols-2 gap-8 px-12 items-center h-full',
    title: { class: 'w-full', size: 36 },
    body:  { class: 'w-full', size: 18 },
  },
  'title-image': {
    canvasClass: 'grid grid-cols-2 gap-8 px-12 items-center h-full',
    title: { class: 'w-full mb-4', size: 36 },
    body:  { class: 'w-full', size: 18 },
  },
};

// ── Google Fonts ──────────────────────────────────────────────────────────────

let fontsInjected = false;
function injectFonts() {
  if (fontsInjected || typeof document === 'undefined') return;
  fontsInjected = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;900&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,400;0,700;0,900;1,400&family=Oswald:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap';
  document.head.appendChild(link);
}

// ── Main Canvas ───────────────────────────────────────────────────────────────

const SlideCanvas: React.FC<Props> = ({
  slide, onUpdateTitle, onUpdateBody, onUpdateSlide, bottomBar,
}) => {
  injectFonts();

  // Track which block is active (for exclusive activation)
  const [activeBlock, setActiveBlock] = useState<'title' | 'body' | null>(null);
  // activeEditRef: points to the currently focused contentEditable
  const activeEditRef = useRef<HTMLDivElement | null>(null);
  // Forwarded refs to SlideTextBlock
  const titleBlockRef = useRef<SlideTextBlockHandle>(null);
  const bodyBlockRef  = useRef<SlideTextBlockHandle>(null);

  const handleTitleActivate = useCallback((el: HTMLDivElement) => {
    setActiveBlock('title');
    activeEditRef.current = el;
  }, []);
  const handleTitleDeactivate = useCallback(() => {
    setActiveBlock(prev => prev === 'title' ? null : prev);
    if (activeEditRef.current === titleBlockRef.current?.getEditRef()) {
      activeEditRef.current = null;
    }
  }, []);

  const handleBodyActivate = useCallback((el: HTMLDivElement) => {
    setActiveBlock('body');
    activeEditRef.current = el;
  }, []);
  const handleBodyDeactivate = useCallback(() => {
    setActiveBlock(prev => prev === 'body' ? null : prev);
    if (activeEditRef.current === bodyBlockRef.current?.getEditRef()) {
      activeEditRef.current = null;
    }
  }, []);

  // Click on background → deselect
  const handleBgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setActiveBlock(null);
      activeEditRef.current = null;
    }
  };

  if (!slide) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#0d0d0f]">
        <p className="text-sm text-slate-400 dark:text-white/30">Chưa có slide nào</p>
      </div>
    );
  }

  const ld = LAYOUTS[slide.layout];
  const tc = slide.textColor;

  const titleBlock = (
    <SlideTextBlock
      ref={titleBlockRef}
      key={`title-${slide.id}`}
      fieldLabel="Tiêu đề"
      placeholder="Tiêu đề slide..."
      htmlValue={slide.titleHtml}
      plainValue={slide.title}
      defaultFontSize={ld.title.size}
      textColor={tc}
      className={ld.title.class}
      onChange={(plain, html) => onUpdateTitle(slide.id, plain, html)}
      onActivate={handleTitleActivate}
      onDeactivate={handleTitleDeactivate}
      forceBlur={activeBlock === 'body'}
    />
  );

  const bodyBlock = (
    <SlideTextBlock
      ref={bodyBlockRef}
      key={`body-${slide.id}`}
      fieldLabel="Nội dung"
      placeholder="Nội dung slide... (Enter để xuống dòng)"
      htmlValue={slide.bodyHtml}
      plainValue={slide.body}
      defaultFontSize={ld.body.size}
      textColor={tc}
      className={ld.body.class}
      onChange={(plain, html) => onUpdateBody(slide.id, plain, html)}
      onActivate={handleBodyActivate}
      onDeactivate={handleBodyDeactivate}
      forceBlur={activeBlock === 'title'}
    />
  );

  const renderContent = () => {
    if (slide.layout === 'two-col') {
      return (
        <>
          <div className="flex flex-col justify-center">{titleBlock}</div>
          <div className="flex flex-col justify-center">{bodyBlock}</div>
        </>
      );
    }
    if (slide.layout === 'title-image') {
      return (
        <>
          <div className="flex flex-col justify-center">{titleBlock}{bodyBlock}</div>
          <div className="h-full flex items-center justify-center">
            <div className="w-full aspect-video rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur flex items-center justify-center">
              <p className="text-white/40 text-xs">Vùng ảnh</p>
            </div>
          </div>
        </>
      );
    }
    return <>{titleBlock}{bodyBlock}</>;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-[#0d0d0f] overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col items-center p-4 pb-3 gap-2 w-full">

          {/* ── Shared Format Bar (sibling of canvas, no portal) ── */}
          <AnimatePresence>
            {activeBlock && (
              <motion.div
                key="formatbar"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-4xl shrink-0"
              >
                <SlideFormatBar
                  activeRef={activeEditRef as React.RefObject<HTMLDivElement>}
                  visible={true}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Canvas frame ── */}
          <div
            className="w-full max-w-4xl aspect-video relative rounded-2xl overflow-hidden shadow-2xl border border-black/[0.08] dark:border-white/[0.04] shrink-0"
            onClick={handleBgClick}
          >
            {/* Background image / gradient */}
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
                  draggable={false}
                />
              ) : (
                <motion.div
                  key="gradient"
                  className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-[#111] dark:to-[#1a1a22]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </AnimatePresence>

            {/* Readability overlay */}
            <div className={`absolute inset-0 ${tc === 'light' ? 'bg-black/40' : 'bg-white/50'}`} />

            {/* Status badges */}
            <AnimatePresence>
              {slide.bgStatus === 'generating' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-medium z-20">
                  <Loader2 size={10} className="animate-spin text-brand-blue" />
                  Đang gen ảnh...
                </motion.div>
              )}
              {slide.bgStatus === 'error' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-500/80 text-white text-[10px] font-medium z-20">
                  <AlertCircle size={10} /> Lỗi gen ảnh
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slide number */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/40 text-white text-[9px] font-bold backdrop-blur z-10 pointer-events-none">
              {slide.index + 1}
            </div>

            {/* Active ring */}
            {activeBlock && (
              <div className="absolute inset-0 ring-2 ring-brand-blue/30 rounded-2xl pointer-events-none z-10" />
            )}

            {/* ── Text content layer ── */}
            <div
              className={`absolute inset-0 ${ld.canvasClass}`}
              style={{ paddingTop: '7%', paddingBottom: '7%' }}
            >
              {renderContent()}
            </div>

            {/* Idle hint */}
            {!activeBlock && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                <span className="text-[9px] text-white/25 font-medium">Click vào text để chỉnh sửa</span>
              </div>
            )}
          </div>

          {/* Bottom bar (prompt/gen controls) */}
          <div className="w-full max-w-4xl">{bottomBar}</div>
        </div>
      </div>
    </div>
  );
};

export default SlideCanvas;
