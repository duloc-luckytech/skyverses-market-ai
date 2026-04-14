
/**
 * SlideFormatBar — shared format toolbar for slide text editing.
 *
 * Key design: rendered as a SIBLING of the canvas (not a portal), so
 * onMouseDown=preventDefault on each button reliably prevents the
 * active contentEditable from losing focus/selection.
 *
 * The attribute [data-slide-formatbar] is used by SlideTextBlock to
 * detect clicks on this bar so it doesn't deactivate on blur.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Minus, Plus, Palette, ChevronDown,
} from 'lucide-react';

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

const SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];

const COLORS = [
  '#ffffff', '#f1f5f9', '#94a3b8', '#475569', '#1e293b', '#000000',
  '#0090ff', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

type FmtState = {
  bold: boolean; italic: boolean; underline: boolean;
  left: boolean; center: boolean; right: boolean;
};

const EMPTY_FMT: FmtState = {
  bold: false, italic: false, underline: false,
  left: true, center: false, right: false,
};

function readFmt(): FmtState {
  try {
    return {
      bold:      document.queryCommandState('bold'),
      italic:    document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      left:      document.queryCommandState('justifyLeft'),
      center:    document.queryCommandState('justifyCenter'),
      right:     document.queryCommandState('justifyRight'),
    };
  } catch { return EMPTY_FMT; }
}

function readSize(editRef: React.RefObject<HTMLDivElement>): number {
  const sel = window.getSelection();
  if (!sel?.focusNode) return 24;
  const node = sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode as HTMLElement;
  if (node && editRef.current?.contains(node)) {
    const sz = parseInt(getComputedStyle(node as Element).fontSize);
    if (!isNaN(sz) && sz > 0) return sz;
  }
  return 24;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  /** Ref to the currently active contentEditable div */
  activeRef: React.RefObject<HTMLDivElement> | null;
  visible: boolean;
}

const SlideFormatBar: React.FC<Props> = ({ activeRef, visible }) => {
  const [fmt, setFmt] = useState<FmtState>(EMPTY_FMT);
  const [fontSize, setFontSize] = useState(24);
  const [showColors, setShowColors] = useState(false);
  const savedRange = useRef<Range | null>(null);

  // Track selection → update button states & save range
  useEffect(() => {
    const handler = () => {
      if (!activeRef?.current) return;
      const sel = window.getSelection();
      if (!sel || !activeRef.current.contains(sel.anchorNode)) return;
      // Save range for later restore
      if (sel.rangeCount > 0) {
        savedRange.current = sel.getRangeAt(0).cloneRange();
      }
      setFmt(readFmt());
      setFontSize(readSize(activeRef));
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, [activeRef]);

  // Reset on hide
  useEffect(() => {
    if (!visible) {
      savedRange.current = null;
      setFmt(EMPTY_FMT);
      setShowColors(false);
    }
  }, [visible]);

  // ── Core exec — restore selection, run command, re-focus ──────────────────
  const run = useCallback((cmd: () => void) => {
    const el = activeRef?.current;
    if (!el) return;
    // Re-focus the contentEditable first
    el.focus({ preventScroll: true });
    // Restore the saved text selection
    if (savedRange.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
      }
    }
    // Enable CSS-based styling (outputs <span style="">, not deprecated <b>)
    document.execCommand('styleWithCSS', false, 'true');
    // Execute the format command
    cmd();
    // Update format state
    setFmt(readFmt());
    // Re-save updated range
    const sel2 = window.getSelection();
    if (sel2?.rangeCount) {
      savedRange.current = sel2.getRangeAt(0).cloneRange();
    }
  }, [activeRef]);

  const applySize = useCallback((px: number) => {
    run(() => {
      document.execCommand('fontSize', false, '7');
      activeRef?.current?.querySelectorAll('font[size="7"]').forEach(el => {
        const span = document.createElement('span');
        span.style.fontSize = `${px}px`;
        span.innerHTML = (el as HTMLElement).innerHTML;
        el.replaceWith(span);
      });
    });
    setFontSize(px);
  }, [run, activeRef]);

  // Prevent ANY mousedown on the format bar from blurring the contentEditable
  const np = (e: React.MouseEvent) => e.preventDefault();

  const sizeIdx = SIZES.reduce((best, val, idx) =>
    Math.abs(val - fontSize) < Math.abs(SIZES[best] - fontSize) ? idx : best, 0);

  const btnCls = (active: boolean) =>
    `w-7 h-7 flex items-center justify-center rounded-lg transition-all select-none ${
      active
        ? 'bg-brand-blue/20 text-brand-blue shadow-inner'
        : 'text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
    }`;

  if (!visible) return null;

  return (
    <div
      data-slide-formatbar="true"
      onMouseDown={np}  // ← key: prevents ALL clicks on this bar from blurring contentEditable
      className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 bg-white dark:bg-[#171719] border border-black/[0.07] dark:border-white/[0.07] rounded-xl shadow-sm w-full"
    >
      {/* ── Font family ── */}
      <div className="relative flex items-center">
        <select
          onMouseDown={np}
          onChange={e => run(() => document.execCommand('fontName', false, e.target.value))}
          defaultValue="Inter"
          className="appearance-none text-[10px] font-medium bg-transparent text-slate-600 dark:text-white/70 outline-none border-none cursor-pointer pr-4 pl-1 h-7 max-w-[78px]"
        >
          {FONTS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <ChevronDown size={8} className="absolute right-0 text-slate-400 dark:text-white/30 pointer-events-none" />
      </div>

      <div className="w-px h-4 bg-black/[0.06] dark:bg-white/[0.06] mx-1 shrink-0" />

      {/* ── Font size ── */}
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

      <div className="w-px h-4 bg-black/[0.06] dark:bg-white/[0.06] mx-1 shrink-0" />

      {/* ── B / I / U ── */}
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('bold'))}
        className={btnCls(fmt.bold)} title="Bold (Ctrl+B)"><Bold size={11} /></button>
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('italic'))}
        className={btnCls(fmt.italic)} title="Italic (Ctrl+I)"><Italic size={11} /></button>
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('underline'))}
        className={btnCls(fmt.underline)} title="Underline (Ctrl+U)"><Underline size={11} /></button>

      <div className="w-px h-4 bg-black/[0.06] dark:bg-white/[0.06] mx-1 shrink-0" />

      {/* ── Alignment ── */}
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('justifyLeft'))}
        className={btnCls(fmt.left)} title="Align Left"><AlignLeft size={11} /></button>
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('justifyCenter'))}
        className={btnCls(fmt.center)} title="Align Center"><AlignCenter size={11} /></button>
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('justifyRight'))}
        className={btnCls(fmt.right)} title="Align Right"><AlignRight size={11} /></button>

      <div className="w-px h-4 bg-black/[0.06] dark:bg-white/[0.06] mx-1 shrink-0" />

      {/* ── Text color ── */}
      <div className="relative">
        <button onMouseDown={np} onClick={() => setShowColors(v => !v)}
          className={btnCls(false)} title="Màu chữ"><Palette size={11} /></button>
        {showColors && (
          <div
            data-slide-formatbar="true"
            onMouseDown={np}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-white dark:bg-[#171719] border border-black/[0.07] dark:border-white/[0.07] shadow-xl grid grid-cols-8 gap-1 z-50"
          >
            {COLORS.map(c => (
              <button key={c} style={{ backgroundColor: c }}
                onMouseDown={np}
                onClick={() => { run(() => document.execCommand('foreColor', false, c)); setShowColors(false); }}
                className="w-5 h-5 rounded-md border border-black/10 dark:border-white/10 hover:scale-125 transition-transform"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Hint ── */}
      <span className="ml-auto text-[9px] text-slate-300 dark:text-white/20 hidden sm:block select-none pr-1">
        Bôi chọn text để format · Enter xuống dòng
      </span>
    </div>
  );
};

export default SlideFormatBar;
