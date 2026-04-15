
/**
 * SlideFormatBar — floating format toolbar for slide text editing.
 *
 * Row 1 (text commands): Font | Size | B/I/U/S | Align | TextColor | Highlight
 * Row 2 (block styles):  Fill | Opacity | Radius | Padding | LetterSpacing | LineHeight
 *
 * Key design:
 *  - `data-slide-formatbar="true"` on every interactive container prevents
 *    the active contentEditable from losing focus when buttons are clicked.
 *  - `textEditing` controls whether text commands are live; Row 2 is always active.
 *  - The component is rendered via portal in SlideTextObject so it is never
 *    clipped by the canvas overflow:hidden constraint.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  Minus, Plus, Palette, ChevronDown, Highlighter,
} from 'lucide-react';
import { FreeTextBlock } from '../../hooks/useSlideStudio';

// ── Constants ─────────────────────────────────────────────────────────────────

const FONTS = [
  { label: 'Inter',        value: 'Inter' },
  { label: 'Montserrat',   value: 'Montserrat' },
  { label: 'Poppins',      value: 'Poppins' },
  { label: 'Roboto',       value: 'Roboto' },
  { label: 'Playfair',     value: 'Playfair Display' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Georgia',      value: 'Georgia' },
  { label: 'Bebas Neue',   value: 'Bebas Neue' },
  { label: 'Oswald',       value: 'Oswald' },
];

const SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];

const TEXT_COLORS = [
  '#ffffff', '#f1f5f9', '#94a3b8', '#475569', '#1e293b', '#000000',
  '#0090ff', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4',
];

const HIGHLIGHT_COLORS = [
  'none',
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca',
  '#ddd6fe', '#fed7aa', '#f9a8d4', '#a5f3fc',
  'rgba(255,255,255,0.25)', 'rgba(0,0,0,0.35)',
];

const BG_FILL_COLORS = [
  'transparent',
  'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.50)', 'rgba(0,0,0,0.75)', '#000000',
  'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.40)', 'rgba(255,255,255,0.80)', '#ffffff',
  '#0090ff', '#6366f1', '#8b5cf6', '#ec4899', '#22c55e', '#f97316', '#1e293b',
];

const LINE_HEIGHTS = [0.8, 1, 1.15, 1.4, 1.6, 2, 2.5];

// ── Format state helpers ───────────────────────────────────────────────────────

type FmtState = {
  bold: boolean; italic: boolean; underline: boolean; strikethrough: boolean;
  left: boolean; center: boolean; right: boolean;
};
const EMPTY_FMT: FmtState = {
  bold: false, italic: false, underline: false, strikethrough: false,
  left: true, center: false, right: false,
};

function readFmt(): FmtState {
  try {
    return {
      bold:          document.queryCommandState('bold'),
      italic:        document.queryCommandState('italic'),
      underline:     document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikeThrough'),
      left:          document.queryCommandState('justifyLeft'),
      center:        document.queryCommandState('justifyCenter'),
      right:         document.queryCommandState('justifyRight'),
    };
  } catch { return EMPTY_FMT; }
}

function readSize(ref: React.RefObject<HTMLDivElement>): number {
  const sel = window.getSelection();
  if (!sel?.focusNode) return 24;
  const node = sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode as HTMLElement;
  if (node && ref.current?.contains(node)) {
    const sz = parseInt(getComputedStyle(node as Element).fontSize);
    if (!isNaN(sz) && sz > 0) return sz;
  }
  return 24;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  /** Ref to the currently active contentEditable div */
  activeRef: React.RefObject<HTMLDivElement> | null;
  /** Whether the contentEditable is in editing mode (enables text commands) */
  textEditing: boolean;
  /** Block being edited — drives Row 2 block-style controls */
  block?: FreeTextBlock;
  /** Update block-level style props */
  onBlockUpdate?: (patch: Partial<FreeTextBlock>) => void;
}

const SlideFormatBar: React.FC<Props> = ({ activeRef, textEditing, block, onBlockUpdate }) => {
  const [fmt, setFmt]               = useState<FmtState>(EMPTY_FMT);
  const [fontSize, setFontSize]     = useState(24);
  const [showTextColors, setShowTC] = useState(false);
  const [showHighlights, setShowHL] = useState(false);
  const [showBgColors, setShowBG]   = useState(false);
  const savedRange = useRef<Range | null>(null);

  // ── Track selection changes → update button states ────────────────────────
  useEffect(() => {
    const handler = () => {
      if (!activeRef?.current || !textEditing) return;
      const sel = window.getSelection();
      if (!sel || !activeRef.current.contains(sel.anchorNode)) return;
      if (sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
      setFmt(readFmt());
      setFontSize(readSize(activeRef));
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, [activeRef, textEditing]);

  // Reset text controls when not in editing mode
  useEffect(() => {
    if (!textEditing) {
      savedRange.current = null;
      setFmt(EMPTY_FMT);
      setShowTC(false);
      setShowHL(false);
    }
  }, [textEditing]);

  // ── Execute text format command (restores selection first) ────────────────
  const run = useCallback((cmd: () => void) => {
    const el = activeRef?.current;
    if (!el || !textEditing) return;
    el.focus({ preventScroll: true });
    if (savedRange.current) {
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
    }
    document.execCommand('styleWithCSS', false, 'true');
    cmd();
    setFmt(readFmt());
    const sel2 = window.getSelection();
    if (sel2?.rangeCount) savedRange.current = sel2.getRangeAt(0).cloneRange();
  }, [activeRef, textEditing]);

  const applySize = useCallback((px: number) => {
    run(() => {
      document.execCommand('fontSize', false, '7');
      activeRef?.current?.querySelectorAll<HTMLElement>('font[size="7"]').forEach(el => {
        const span = document.createElement('span');
        span.style.fontSize = `${px}px`;
        span.innerHTML = el.innerHTML;
        el.replaceWith(span);
      });
    });
    setFontSize(px);
  }, [run, activeRef]);

  // Prevent any mousedown from blurring the contentEditable
  const np = (e: React.MouseEvent) => e.preventDefault();

  const sizeIdx = SIZES.reduce((best, val, idx) =>
    Math.abs(val - fontSize) < Math.abs(SIZES[best] - fontSize) ? idx : best, 0);

  const btnCls = (active: boolean) =>
    `w-7 h-7 flex items-center justify-center rounded-lg transition-all select-none ${
      active
        ? 'bg-brand-blue/20 text-brand-blue shadow-inner'
        : 'text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
    }`;

  // Row 1 is interactive only when editing
  const dimRow1 = !textEditing ? 'opacity-40 pointer-events-none' : '';

  // Block-level current values w/ defaults
  const curOpacity = Math.round((block?.opacity ?? 1) * 100);
  const curRadius  = block?.borderRadius ?? 0;
  const curPadding = block?.padding      ?? 0;
  const curLS      = block?.letterSpacing ?? 0;
  const curLH      = block?.lineHeight    ?? 1.4;

  const sep = (
    <div className="w-px h-4 bg-black/[0.06] dark:bg-white/[0.06] mx-0.5 shrink-0" />
  );

  return (
    <div
      data-slide-formatbar="true"
      onMouseDown={np}
      className="flex flex-col gap-0 px-2 py-1.5 bg-white dark:bg-[#171719] border border-black/[0.07] dark:border-white/[0.07] rounded-xl shadow-2xl w-full"
    >
      {/* ══ ROW 1: Text formatting ══════════════════════════════════════════════ */}
      <div className={`flex items-center gap-0.5 flex-wrap min-h-[30px] ${dimRow1}`}>

        {/* Font family */}
        <div className="relative flex items-center">
          <select
            onMouseDown={np}
            onChange={e => run(() => document.execCommand('fontName', false, e.target.value))}
            defaultValue="Inter"
            className="appearance-none text-[10px] font-medium bg-transparent text-slate-600 dark:text-white/70 outline-none border-none cursor-pointer pr-4 pl-1 h-7 max-w-[82px]"
          >
            {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <ChevronDown size={8} className="absolute right-0 text-slate-400 dark:text-white/30 pointer-events-none" />
        </div>

        {sep}

        {/* Font size */}
        <button onMouseDown={np} onClick={() => applySize(SIZES[Math.max(0, sizeIdx - 1)])}
          className={btnCls(false)}><Minus size={9} /></button>
        <select
          value={SIZES[sizeIdx]}
          onChange={e => applySize(Number(e.target.value))}
          onMouseDown={np}
          className="text-[10px] font-bold text-slate-700 dark:text-white/80 bg-transparent outline-none border-none text-center w-9 cursor-pointer tabular-nums"
        >
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onMouseDown={np} onClick={() => applySize(SIZES[Math.min(SIZES.length - 1, sizeIdx + 1)])}
          className={btnCls(false)}><Plus size={9} /></button>

        {sep}

        {/* B / I / U / S */}
        <button onMouseDown={np} onClick={() => run(() => document.execCommand('bold'))}
          className={btnCls(fmt.bold)} title="Bold (Ctrl+B)"><Bold size={11} /></button>
        <button onMouseDown={np} onClick={() => run(() => document.execCommand('italic'))}
          className={btnCls(fmt.italic)} title="Italic (Ctrl+I)"><Italic size={11} /></button>
        <button onMouseDown={np} onClick={() => run(() => document.execCommand('underline'))}
          className={btnCls(fmt.underline)} title="Underline (Ctrl+U)"><Underline size={11} /></button>
        <button onMouseDown={np} onClick={() => run(() => document.execCommand('strikeThrough'))}
          className={btnCls(fmt.strikethrough)} title="Strikethrough"><Strikethrough size={11} /></button>

        {sep}

        {/* Alignment */}
        <button onMouseDown={np} onClick={() => run(() => document.execCommand('justifyLeft'))}
          className={btnCls(fmt.left)} title="Align Left"><AlignLeft size={11} /></button>
        <button onMouseDown={np} onClick={() => run(() => document.execCommand('justifyCenter'))}
          className={btnCls(fmt.center)} title="Align Center"><AlignCenter size={11} /></button>
        <button onMouseDown={np} onClick={() => run(() => document.execCommand('justifyRight'))}
          className={btnCls(fmt.right)} title="Align Right"><AlignRight size={11} /></button>

        {sep}

        {/* Text color */}
        <div className="relative">
          <button onMouseDown={np}
            onClick={() => { setShowTC(v => !v); setShowHL(false); setShowBG(false); }}
            className={btnCls(false)} title="Màu chữ"
          ><Palette size={11} /></button>
          {showTextColors && (
            <div data-slide-formatbar="true" onMouseDown={np}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-white dark:bg-[#171719] border border-black/[0.07] dark:border-white/[0.07] shadow-xl grid grid-cols-8 gap-1 z-50"
            >
              {TEXT_COLORS.map(c => (
                <button key={c} style={{ backgroundColor: c }}
                  onMouseDown={np}
                  onClick={() => { run(() => document.execCommand('foreColor', false, c)); setShowTC(false); }}
                  className="w-5 h-5 rounded-md border border-black/10 dark:border-white/10 hover:scale-125 transition-transform"
                />
              ))}
            </div>
          )}
        </div>

        {/* Text highlight */}
        <div className="relative">
          <button onMouseDown={np}
            onClick={() => { setShowHL(v => !v); setShowTC(false); setShowBG(false); }}
            className={btnCls(false)} title="Tô sáng text"
          ><Highlighter size={11} /></button>
          {showHighlights && (
            <div data-slide-formatbar="true" onMouseDown={np}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-white dark:bg-[#171719] border border-black/[0.07] dark:border-white/[0.07] shadow-xl grid grid-cols-5 gap-1.5 z-50"
            >
              {HIGHLIGHT_COLORS.map(c => (
                <button key={c}
                  onMouseDown={np}
                  onClick={() => {
                    if (c === 'none') {
                      run(() => document.execCommand('hiliteColor', false, 'transparent'));
                    } else {
                      run(() => document.execCommand('hiliteColor', false, c));
                    }
                    setShowHL(false);
                  }}
                  title={c === 'none' ? 'None' : c}
                  className="w-6 h-6 rounded-md border border-black/10 dark:border-white/10 hover:scale-125 transition-transform relative overflow-hidden"
                  style={{ backgroundColor: c === 'none' ? undefined : c }}
                >
                  {c === 'none' && (
                    <div className="absolute inset-0"
                      style={{ background: 'repeating-conic-gradient(#bbb 0% 25%,#fff 0% 50%) 0 0/6px 6px' }} />
                  )}
                  {c === 'none' && <span className="absolute inset-0 flex items-center justify-center text-[9px] text-slate-500 font-bold" style={{ zIndex: 1 }}>✕</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hint */}
        <span className="ml-auto text-[9px] text-slate-300 dark:text-white/20 hidden sm:block select-none pr-1">
          {textEditing ? 'Bôi chọn text để format' : 'Double-click để chỉnh text'}
        </span>
      </div>

      {/* ══ ROW 2: Block-level styling (always active) ══════════════════════════ */}
      {block && onBlockUpdate && (
        <>
          <div className="w-full h-px bg-black/[0.06] dark:bg-white/[0.06] my-1" />

          <div className="flex items-center gap-1.5 flex-wrap min-h-[26px]">

            {/* BG fill */}
            <div className="relative flex items-center gap-1 shrink-0">
              <span className="text-[9px] text-slate-400 dark:text-white/30 font-bold select-none">Fill</span>
              <button
                onMouseDown={np}
                onClick={() => { setShowBG(v => !v); setShowTC(false); setShowHL(false); }}
                title="Block background fill"
                className="w-5 h-5 rounded-md border border-black/[0.12] dark:border-white/[0.12] hover:scale-110 transition-transform flex items-center justify-center overflow-hidden relative"
              >
                {(!block.bgColor || block.bgColor === 'transparent')
                  ? <div className="absolute inset-0" style={{ background: 'repeating-conic-gradient(#bbb 0% 25%,#fff 0% 50%) 0 0/6px 6px' }} />
                  : <div className="absolute inset-0" style={{ backgroundColor: block.bgColor }} />
                }
              </button>
              {showBgColors && (
                <div data-slide-formatbar="true" onMouseDown={np}
                  className="absolute bottom-full mb-2 left-0 p-2 rounded-xl bg-white dark:bg-[#171719] border border-black/[0.07] dark:border-white/[0.07] shadow-xl grid grid-cols-8 gap-1 z-50"
                  style={{ minWidth: 196 }}
                >
                  {BG_FILL_COLORS.map(c => (
                    <button key={c}
                      onMouseDown={np}
                      onClick={() => {
                        onBlockUpdate({ bgColor: c === 'transparent' ? undefined : c });
                        setShowBG(false);
                      }}
                      title={c === 'transparent' ? 'None' : c}
                      className="w-5 h-5 rounded-md border border-black/10 dark:border-white/10 hover:scale-125 transition-transform relative overflow-hidden"
                    >
                      {c === 'transparent'
                        ? <div className="absolute inset-0" style={{ background: 'repeating-conic-gradient(#bbb 0% 25%,#fff 0% 50%) 0 0/6px 6px' }} />
                        : <div className="absolute inset-0" style={{ backgroundColor: c }} />
                      }
                      {c === 'transparent' && (
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] text-slate-600 font-bold" style={{ zIndex: 1 }}>✕</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-3.5 bg-black/[0.06] dark:bg-white/[0.06] shrink-0" />

            {/* Opacity */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[9px] text-slate-400 dark:text-white/30 font-bold select-none">A</span>
              <input
                type="range" min="0" max="100" step="1"
                value={curOpacity}
                onMouseDown={np}
                onChange={e => onBlockUpdate({ opacity: Number(e.target.value) / 100 })}
                className="w-14 h-[3px] accent-brand-blue cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 dark:text-white/40 w-6 tabular-nums text-right select-none">{curOpacity}%</span>
            </div>

            <div className="w-px h-3.5 bg-black/[0.06] dark:bg-white/[0.06] shrink-0" />

            {/* Border radius */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[9px] text-slate-400 dark:text-white/30 font-bold select-none">R</span>
              <input
                type="range" min="0" max="32" step="1"
                value={curRadius}
                onMouseDown={np}
                onChange={e => onBlockUpdate({ borderRadius: Number(e.target.value) })}
                className="w-12 h-[3px] accent-brand-blue cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 dark:text-white/40 w-4 tabular-nums text-right select-none">{curRadius}</span>
            </div>

            <div className="w-px h-3.5 bg-black/[0.06] dark:bg-white/[0.06] shrink-0" />

            {/* Padding */}
            <div className="flex items-center gap-0.5 shrink-0">
              <span className="text-[9px] text-slate-400 dark:text-white/30 font-bold select-none mr-0.5">P</span>
              <button onMouseDown={np} onClick={() => onBlockUpdate({ padding: Math.max(0, curPadding - 2) })}
                className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors rounded">
                <Minus size={8} />
              </button>
              <span className="text-[9px] text-slate-600 dark:text-white/60 w-4 tabular-nums text-center select-none">{curPadding}</span>
              <button onMouseDown={np} onClick={() => onBlockUpdate({ padding: Math.min(32, curPadding + 2) })}
                className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors rounded">
                <Plus size={8} />
              </button>
            </div>

            <div className="w-px h-3.5 bg-black/[0.06] dark:bg-white/[0.06] shrink-0" />

            {/* Letter spacing */}
            <div className="flex items-center gap-0.5 shrink-0">
              <span className="text-[9px] text-slate-400 dark:text-white/30 font-bold select-none mr-0.5">LS</span>
              <button onMouseDown={np} onClick={() => onBlockUpdate({ letterSpacing: parseFloat((curLS - 0.5).toFixed(1)) })}
                className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors rounded">
                <Minus size={8} />
              </button>
              <span className="text-[9px] text-slate-600 dark:text-white/60 w-6 tabular-nums text-center select-none">{curLS.toFixed(1)}</span>
              <button onMouseDown={np} onClick={() => onBlockUpdate({ letterSpacing: parseFloat((curLS + 0.5).toFixed(1)) })}
                className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors rounded">
                <Plus size={8} />
              </button>
            </div>

            <div className="w-px h-3.5 bg-black/[0.06] dark:bg-white/[0.06] shrink-0" />

            {/* Line height */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[9px] text-slate-400 dark:text-white/30 font-bold select-none">LH</span>
              <div className="relative">
                <select
                  onMouseDown={np}
                  value={curLH}
                  onChange={e => onBlockUpdate({ lineHeight: Number(e.target.value) })}
                  className="appearance-none text-[9px] font-medium bg-transparent text-slate-600 dark:text-white/70 outline-none border-none cursor-pointer pl-0.5 pr-3 h-6 w-12"
                >
                  {LINE_HEIGHTS.map(lh => <option key={lh} value={lh}>{lh}</option>)}
                </select>
                <ChevronDown size={7} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" />
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default SlideFormatBar;
