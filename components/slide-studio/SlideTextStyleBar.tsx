
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Minus, Plus, Palette,
} from 'lucide-react';

// ── Fonts ─────────────────────────────────────────────────────────────────────

export const SLIDE_FONTS = [
  { label: 'Inter',       value: 'Inter' },
  { label: 'Montserrat',  value: 'Montserrat' },
  { label: 'Poppins',     value: 'Poppins' },
  { label: 'Roboto',      value: 'Roboto' },
  { label: 'Playfair',    value: 'Playfair Display' },
  { label: 'Merriweather',value: 'Merriweather' },
  { label: 'Georgia',     value: 'Georgia' },
  { label: 'Bebas Neue',  value: 'Bebas Neue' },
  { label: 'Oswald',      value: 'Oswald' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];
const TEXT_COLORS = [
  '#ffffff', '#f1f5f9', '#e2e8f0', '#94a3b8', '#1e293b', '#000000',
  '#0090ff', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Apply execCommand without stealing focus from the contentEditable */
function exec(command: string, value?: string) {
  // Allow CSS-based styling (modern, outputs <span style="">)
  document.execCommand('styleWithCSS', false, 'true');
  document.execCommand(command, false, value ?? '');
}

/** Apply font size (px) — uses size=7 trick then replaces with px */
function applyFontSize(px: number) {
  exec('fontSize', '7');
  // Find any elements with size=7 that were just inserted and replace with px
  const root = document.getSelection()?.focusNode?.parentElement?.closest('[contenteditable]');
  if (!root) return;
  root.querySelectorAll('font[size="7"]').forEach(el => {
    const span = document.createElement('span');
    span.style.fontSize = `${px}px`;
    span.innerHTML = (el as HTMLElement).innerHTML;
    el.replaceWith(span);
  });
}

/** Apply font family by wrapping selection in a span */
function applyFontFamily(family: string) {
  exec('fontName', family);
}

/** Get current state of formatting at cursor */
function getFormatState() {
  return {
    bold:      document.queryCommandState('bold'),
    italic:    document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    alignLeft:   document.queryCommandState('justifyLeft'),
    alignCenter: document.queryCommandState('justifyCenter'),
    alignRight:  document.queryCommandState('justifyRight'),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  /** Whether there is an active contentEditable focused with (possibly) selection */
  visible: boolean;
}

const SlideTextStyleBar: React.FC<Props> = ({ visible }) => {
  const [fmt, setFmt] = useState(getFormatState());
  const [showColors, setShowColors] = useState(false);
  const [currentSize, setCurrentSize] = useState(24);

  // Refresh format state on each selection change
  useEffect(() => {
    const update = () => {
      setFmt(getFormatState());
      // Try to read current font size
      const val = document.queryCommandValue('fontSize');
      const pxVal = document.queryCommandValue('fontSize');
      // Try reading from the active element's computed style as fallback
      const sel = window.getSelection();
      if (sel && sel.focusNode) {
        const el = sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode as HTMLElement;
        if (el) {
          const cs = window.getComputedStyle(el as Element);
          const parsed = parseInt(cs.fontSize);
          if (!isNaN(parsed)) setCurrentSize(parsed);
        }
      }
    };
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, []);

  // Prevent buttons from stealing focus (this is the key trick)
  const noFocusSteal = (e: React.MouseEvent) => e.preventDefault();

  const decreaseSize = useCallback(() => {
    const idx = FONT_SIZES.indexOf(FONT_SIZES.reduce((a, b) => Math.abs(b - currentSize) < Math.abs(a - currentSize) ? b : a));
    const next = FONT_SIZES[Math.max(0, idx - 1)];
    applyFontSize(next);
    setCurrentSize(next);
  }, [currentSize]);

  const increaseSize = useCallback(() => {
    const idx = FONT_SIZES.indexOf(FONT_SIZES.reduce((a, b) => Math.abs(b - currentSize) < Math.abs(a - currentSize) ? b : a));
    const next = FONT_SIZES[Math.min(FONT_SIZES.length - 1, idx + 1)];
    applyFontSize(next);
    setCurrentSize(next);
  }, [currentSize]);

  if (!visible) return null;

  return (
    <div
      className="flex items-center gap-0.5 bg-white dark:bg-[#1c1c20] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-2 py-1 shadow-lg shadow-black/10 flex-wrap w-full max-w-4xl"
      onMouseDown={noFocusSteal}
    >
      {/* ── Font family ── */}
      <select
        defaultValue="Inter"
        onChange={e => applyFontFamily(e.target.value)}
        onMouseDown={noFocusSteal}
        className="text-[10px] font-medium bg-transparent text-slate-700 dark:text-white/70 outline-none border-none cursor-pointer max-w-[90px] truncate h-7"
      >
        {SLIDE_FONTS.map(f => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
            {f.label}
          </option>
        ))}
      </select>

      <div className="w-px h-4 bg-black/[0.07] dark:bg-white/[0.07] mx-1 shrink-0" />

      {/* ── Font size stepper ── */}
      <button onMouseDown={noFocusSteal} onClick={decreaseSize}
        className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors">
        <Minus size={9} />
      </button>
      <select
        value={FONT_SIZES.reduce((a, b) => Math.abs(b - currentSize) < Math.abs(a - currentSize) ? b : a)}
        onChange={e => { const v = Number(e.target.value); applyFontSize(v); setCurrentSize(v); }}
        onMouseDown={noFocusSteal}
        className="text-[10px] font-bold text-slate-700 dark:text-white/80 bg-transparent outline-none border-none tabular-nums text-center w-9 cursor-pointer"
      >
        {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button onMouseDown={noFocusSteal} onClick={increaseSize}
        className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors">
        <Plus size={9} />
      </button>

      <div className="w-px h-4 bg-black/[0.07] dark:bg-white/[0.07] mx-1 shrink-0" />

      {/* ── Bold / Italic / Underline ── */}
      {([
        { cmd: 'bold',      icon: <Bold size={11} />,      active: fmt.bold },
        { cmd: 'italic',    icon: <Italic size={11} />,    active: fmt.italic },
        { cmd: 'underline', icon: <Underline size={11} />, active: fmt.underline },
      ] as const).map(({ cmd, icon, active }) => (
        <button
          key={cmd}
          onMouseDown={noFocusSteal}
          onClick={() => { exec(cmd); setFmt(getFormatState()); }}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            active ? 'bg-brand-blue/15 text-brand-blue' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
          }`}
        >
          {icon}
        </button>
      ))}

      <div className="w-px h-4 bg-black/[0.07] dark:bg-white/[0.07] mx-1 shrink-0" />

      {/* ── Alignment ── */}
      {([
        { cmd: 'justifyLeft',   icon: <AlignLeft size={11} />,   active: fmt.alignLeft },
        { cmd: 'justifyCenter', icon: <AlignCenter size={11} />, active: fmt.alignCenter },
        { cmd: 'justifyRight',  icon: <AlignRight size={11} />,  active: fmt.alignRight },
      ] as const).map(({ cmd, icon, active }) => (
        <button
          key={cmd}
          onMouseDown={noFocusSteal}
          onClick={() => { exec(cmd); setFmt(getFormatState()); }}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            active ? 'bg-brand-blue/15 text-brand-blue' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
          }`}
        >
          {icon}
        </button>
      ))}

      <div className="w-px h-4 bg-black/[0.07] dark:bg-white/[0.07] mx-1 shrink-0" />

      {/* ── Text color picker ── */}
      <div className="relative">
        <button
          onMouseDown={noFocusSteal}
          onClick={() => setShowColors(v => !v)}
          className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
          title="Màu chữ"
        >
          <Palette size={11} />
        </button>
        {showColors && (
          <div
            className="absolute left-0 top-full mt-1 z-50 p-2 bg-white dark:bg-[#1c1c20] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-xl grid grid-cols-6 gap-1"
            onMouseDown={noFocusSteal}
          >
            {TEXT_COLORS.map(color => (
              <button
                key={color}
                style={{ backgroundColor: color }}
                onMouseDown={noFocusSteal}
                onClick={() => { exec('foreColor', color); setShowColors(false); }}
                className="w-5 h-5 rounded-md border border-black/10 hover:scale-110 transition-transform"
                title={color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideTextStyleBar;
