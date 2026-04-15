
import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Plus, Copy } from 'lucide-react';
import { Slide, FreeTextBlock, SlideLayout } from '../../hooks/useSlideStudio';
import SlideTextObject from './SlideTextObject';

interface Props {
  slide: Slide | null;
  /** Called when user edits via free-canvas blocks */
  onUpdateTextBlock: (slideId: string, blockId: string, patch: Partial<FreeTextBlock>) => void;
  onAddTextBlock: (slideId: string) => void;
  onRemoveTextBlock: (slideId: string, blockId: string) => void;
  onBringTextBlockForward: (slideId: string, blockId: string) => void;
  onUpdateSlide: (id: string, patch: Partial<Slide>) => void;
  /** Paste a copied block into the active slide */
  onPasteTextBlock?: (slideId: string, block: FreeTextBlock) => void;
  bottomBar?: React.ReactNode;
}

// ── Default text block positions per layout ───────────────────────────────────

type Pos = { x: number; y: number; w: number };
const LAYOUT_POS: Record<SlideLayout, { title: Pos; body: Pos }> = {
  'title-center': { title: { x: 10, y: 22, w: 80 }, body: { x: 15, y: 57, w: 70 } },
  'title-left':   { title: { x: 7,  y: 22, w: 58 }, body: { x: 7,  y: 57, w: 58 } },
  'full-bg':      { title: { x: 10, y: 58, w: 80 }, body: { x: 15, y: 76, w: 70 } },
  'two-col':      { title: { x: 5,  y: 22, w: 42 }, body: { x: 53, y: 22, w: 42 } },
  'title-image':  { title: { x: 5,  y: 18, w: 45 }, body: { x: 5,  y: 52, w: 45 } },
};

const DEFAULT_TITLE_SIZE: Record<SlideLayout, number> = {
  'title-center': 40, 'title-left': 40, 'full-bg': 52, 'two-col': 32, 'title-image': 32,
};

// ── Google Fonts injection ────────────────────────────────────────────────────

let fontsInjected = false;
function injectFonts() {
  if (fontsInjected || typeof document === 'undefined') return;
  fontsInjected = true;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;900&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,400;0,700;0,900;1,400&family=Oswald:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap';
  document.head.appendChild(l);
}

// ── Migration: old title/body → FreeTextBlock[] ───────────────────────────────

let _gid = 0;
const mkid = () => `m${Date.now()}_${_gid++}`;

function migrateSlide(slide: Slide): FreeTextBlock[] {
  const pos = LAYOUT_POS[slide.layout];
  const titleSz = DEFAULT_TITLE_SIZE[slide.layout];
  const blocks: FreeTextBlock[] = [];

  if (slide.title) {
    blocks.push({
      id: mkid(),
      html: slide.titleHtml ?? `<span style="font-size:${titleSz}px;font-family:Inter;color:#ffffff">${slide.title}</span>`,
      ...pos.title,
      zIndex: 1,
      role: 'title',
    });
  }
  if (slide.body) {
    blocks.push({
      id: mkid(),
      html: slide.bodyHtml ?? `<span style="font-size:20px;font-family:Inter;color:#ffffff">${slide.body}</span>`,
      ...pos.body,
      zIndex: 2,
      role: 'body',
    });
  }
  if (blocks.length === 0) {
    blocks.push({
      id: mkid(),
      html: `<span style="font-size:${titleSz}px;font-family:Inter;color:#ffffff">Tiêu đề</span>`,
      ...pos.title,
      zIndex: 1,
      role: 'title',
    });
  }
  return blocks;
}

// ── Main Canvas ───────────────────────────────────────────────────────────────

const SlideCanvas: React.FC<Props> = ({
  slide, onUpdateTextBlock, onAddTextBlock, onRemoveTextBlock,
  onBringTextBlockForward, onUpdateSlide, onPasteTextBlock, bottomBar,
}) => {
  injectFonts();

  const canvasRef     = useRef<HTMLDivElement>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  // Clipboard for copy/paste within this canvas session
  const [copiedBlock, setCopiedBlock]     = useState<FreeTextBlock | null>(null);

  // Get text blocks — migrate old slides on-the-fly
  const textBlocks = useMemo((): FreeTextBlock[] => {
    if (!slide) return [];
    if (slide.textBlocks && slide.textBlocks.length > 0) return slide.textBlocks;
    return migrateSlide(slide);
  }, [slide]);

  // Persist migration result back to slide (runs once when textBlocks are migrated)
  useEffect(() => {
    if (!slide || (slide.textBlocks && slide.textBlocks.length > 0)) return;
    onUpdateSlide(slide.id, { textBlocks: migrateSlide(slide) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide?.id]);

  // ── Ctrl+V paste handler ──────────────────────────────────────────────────
  useEffect(() => {
    if (!slide || !copiedBlock || !onPasteTextBlock) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Don't interfere if user is typing in a contentEditable
        const active = document.activeElement as HTMLElement | null;
        if (active?.contentEditable === 'true') return;
        e.preventDefault();
        onPasteTextBlock(slide.id, copiedBlock);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [slide, copiedBlock, onPasteTextBlock]);

  const handleActivate = useCallback((id: string) => {
    setActiveBlockId(id);
  }, []);

  const handleDeactivate = useCallback(() => {
    setActiveBlockId(null);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setActiveBlockId(null);
    }
  };

  if (!slide) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#0d0d0f]">
        <p className="text-sm text-slate-400 dark:text-white/30">Chưa có slide nào</p>
      </div>
    );
  }

  const tc = slide.textColor;
  const sorted = [...textBlocks].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-[#0d0d0f] overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col items-center p-4 pb-3 gap-2 w-full">

          {/* ── Actions bar: Add Text + Paste ── */}
          <div className="w-full max-w-4xl flex items-center gap-2 shrink-0">
            <button
              onClick={() => onAddTextBlock(slide.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[11px] font-bold hover:bg-brand-blue/20 transition-colors shrink-0 whitespace-nowrap"
              title="Thêm text block mới"
            >
              <Plus size={11} />
              Thêm text
            </button>

            {copiedBlock && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onPasteTextBlock?.(slide.id, copiedBlock)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 hover:text-brand-blue transition-all whitespace-nowrap"
                title="Dán block (Ctrl+V)"
              >
                <Copy size={11} />
                Dán block (Ctrl+V)
              </motion.button>
            )}

            {activeBlockId && (
              <span className="ml-auto text-[9px] text-slate-400 dark:text-white/20 hidden sm:block select-none">
                Double-click chỉnh text · Kéo để di chuyển · 8 handles resize
              </span>
            )}
          </div>

          {/* ── Canvas frame ── */}
          <div
            ref={canvasRef}
            className="w-full max-w-4xl aspect-video relative rounded-2xl overflow-hidden shadow-2xl border border-black/[0.08] dark:border-white/[0.04] shrink-0"
            style={{ isolation: 'isolate' }}
            onClick={handleCanvasClick}
          >
            {/* Background */}
            <AnimatePresence mode="wait">
              {slide.bgImageUrl ? (
                <motion.img
                  key={slide.bgImageUrl}
                  src={slide.bgImageUrl}
                  alt="BG"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              ) : (
                <motion.div key="grad"
                  className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-[#111] dark:to-[#1a1a22]"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                />
              )}
            </AnimatePresence>

            {/* Readability overlay */}
            <div className={`absolute inset-0 pointer-events-none ${tc === 'light' ? 'bg-black/40' : 'bg-white/50'}`} />

            {/* Status badges */}
            <AnimatePresence>
              {slide.bgStatus === 'generating' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-medium z-20 pointer-events-none">
                  <Loader2 size={10} className="animate-spin text-brand-blue" /> Đang gen ảnh...
                </motion.div>
              )}
              {slide.bgStatus === 'error' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-500/80 text-white text-[10px] font-medium z-20 pointer-events-none">
                  <AlertCircle size={10} /> Lỗi gen ảnh
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slide number */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/40 text-white text-[9px] font-bold backdrop-blur z-30 pointer-events-none">
              {slide.index + 1}
            </div>

            {/* ── Free text objects ── */}
            {sorted.map(block => (
              <SlideTextObject
                key={block.id}
                block={block}
                canvasRef={canvasRef}
                isOnlyBlock={textBlocks.length === 1}
                onUpdate={patch => onUpdateTextBlock(slide.id, block.id, patch)}
                onDelete={() => onRemoveTextBlock(slide.id, block.id)}
                onBringForward={() => onBringTextBlockForward(slide.id, block.id)}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onCopy={setCopiedBlock}
                forceIdle={activeBlockId !== null && activeBlockId !== block.id}
              />
            ))}

            {/* Idle hint */}
            {!activeBlockId && (
              <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
                <span className="text-[9px] text-white/20">
                  Click để chọn · Double-click để chỉnh sửa · Kéo để di chuyển
                </span>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="w-full max-w-4xl">{bottomBar}</div>
        </div>
      </div>
    </div>
  );
};

export default SlideCanvas;
