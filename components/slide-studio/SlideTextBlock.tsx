
import React, {
  useRef, useEffect, useState, useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Minus, Plus, Palette, GripHorizontal, Type,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type BlockState = 'idle' | 'selected' | 'editing';

export interface TextBlockConfig {
  x: number;   // left offset in % of canvas width
  y: number;   // top offset in % of canvas height
  w: number;   // width in % of canvas width
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const SLIDE_FONTS = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Bebas Neue', value: 'Bebas Neue' },
  { label: 'Oswald', value: 'Oswald' },
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];

const PALETTE_COLORS = [
  '#ffffff', '#f8fafc', '#e2e8f0', '#94a3b8', '#475569', '#1e293b', '#000000',
  '#0090ff', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
];

// ── execCommand helpers (preserve text selection) ────────────────────────────

function execCmd(cmd: string, val?: string) {
  document.execCommand('styleWithCSS', false, 'true');
  document.execCommand(cmd, false, val ?? '');
}

function setFontSizePx(px: number) {
  execCmd('fontSize', '7');
  const sel = window.getSelection();
  if (!sel) return;
  const root = sel.focusNode?.parentElement?.closest('[contenteditable]');
  if (!root) return;
  root.querySelectorAll('font[size="7"]').forEach(el => {
    const span = document.createElement('span');
    span.style.fontSize = `${px}px`;
    span.innerHTML = (el as HTMLElement).innerHTML;
    el.replaceWith(span);
  });
}

function getFmtState() {
  return {
    bold:      document.queryCommandState('bold'),
    italic:    document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    left:      document.queryCommandState('justifyLeft'),
    center:    document.queryCommandState('justifyCenter'),
    right:     document.queryCommandState('justifyRight'),
  };
}

// ── Floating Format Toolbar (renders via Portal) ──────────────────────────────

interface FormatBarProps {
  anchorRef: React.RefObject<HTMLElement>;
  onMouseDown: (e: React.MouseEvent) => void;
}

const FormatBar: React.FC<FormatBarProps> = ({ anchorRef, onMouseDown }) => {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [fmt, setFmt] = useState(getFmtState());
  const [showColors, setShowColors] = useState(false);
  const [currentSize, setCurrentSize] = useState(24);

  // Position above the anchor element
  useEffect(() => {
    const compute = () => {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      setPos({
        top: r.top + window.scrollY - 46,
        left: r.left + window.scrollX,
        width: r.width,
      });
    };
    compute();
    const io = new ResizeObserver(compute);
    if (anchorRef.current) io.observe(anchorRef.current);
    window.addEventListener('scroll', compute, true);
    return () => { io.disconnect(); window.removeEventListener('scroll', compute, true); };
  }, [anchorRef]);

  // Track selection → refresh bold/italic state
  useEffect(() => {
    const update = () => {
      setFmt(getFmtState());
      const sel = window.getSelection();
      if (sel?.focusNode) {
        const el = (sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode) as HTMLElement;
        if (el) {
          const sz = parseInt(window.getComputedStyle(el).fontSize);
          if (!isNaN(sz)) setCurrentSize(sz);
        }
      }
    };
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, []);

  const noSteal = (e: React.MouseEvent) => e.preventDefault();
  const btn = (active: boolean) =>
    `w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-100 ${
      active
        ? 'bg-brand-blue/20 text-brand-blue shadow-sm shadow-brand-blue/20'
        : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
    }`;

  const sizeIdx = FONT_SIZES.indexOf(FONT_SIZES.reduce((a, b) =>
    Math.abs(b - currentSize) < Math.abs(a - currentSize) ? b : a));

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 99998 }}
      className="flex items-center gap-0.5 px-2 py-1 rounded-2xl shadow-2xl shadow-black/40 border border-white/[0.08] bg-[#1a1b1f]/95 backdrop-blur-xl"
      onMouseDown={noSteal}
    >
      {/* Font family */}
      <select
        onChange={e => execCmd('fontName', e.target.value)}
        onMouseDown={noSteal}
        className="text-[10px] font-medium bg-transparent text-white/70 outline-none border-none cursor-pointer max-w-[80px] truncate h-7"
        defaultValue="Inter"
      >
        {SLIDE_FONTS.map(f => (
          <option key={f.value} value={f.value} className="bg-[#1a1b1f]">{f.label}</option>
        ))}
      </select>

      <div className="w-px h-4 bg-white/[0.08] mx-0.5 shrink-0" />

      {/* Font size */}
      <button onMouseDown={noSteal} onClick={() => {
        const next = FONT_SIZES[Math.max(0, sizeIdx - 1)];
        setFontSizePx(next); setCurrentSize(next);
      }} className={btn(false)}><Minus size={10} /></button>
      
      <select
        value={FONT_SIZES[sizeIdx]}
        onChange={e => { const v = Number(e.target.value); setFontSizePx(v); setCurrentSize(v); }}
        onMouseDown={noSteal}
        className="text-[10px] font-bold text-white/80 bg-transparent outline-none border-none tabular-nums text-center w-9 cursor-pointer"
      >
        {FONT_SIZES.map(s => <option key={s} value={s} className="bg-[#1a1b1f]">{s}</option>)}
      </select>

      <button onMouseDown={noSteal} onClick={() => {
        const next = FONT_SIZES[Math.min(FONT_SIZES.length - 1, sizeIdx + 1)];
        setFontSizePx(next); setCurrentSize(next);
      }} className={btn(false)}><Plus size={10} /></button>

      <div className="w-px h-4 bg-white/[0.08] mx-0.5 shrink-0" />

      {/* Bold / Italic / Underline */}
      <button onMouseDown={noSteal} onClick={() => { execCmd('bold'); setFmt(getFmtState()); }}
        className={btn(fmt.bold)}><Bold size={11} /></button>
      <button onMouseDown={noSteal} onClick={() => { execCmd('italic'); setFmt(getFmtState()); }}
        className={btn(fmt.italic)}><Italic size={11} /></button>
      <button onMouseDown={noSteal} onClick={() => { execCmd('underline'); setFmt(getFmtState()); }}
        className={btn(fmt.underline)}><Underline size={11} /></button>

      <div className="w-px h-4 bg-white/[0.08] mx-0.5 shrink-0" />

      {/* Alignment */}
      <button onMouseDown={noSteal} onClick={() => { execCmd('justifyLeft'); setFmt(getFmtState()); }}
        className={btn(fmt.left)}><AlignLeft size={11} /></button>
      <button onMouseDown={noSteal} onClick={() => { execCmd('justifyCenter'); setFmt(getFmtState()); }}
        className={btn(fmt.center)}><AlignCenter size={11} /></button>
      <button onMouseDown={noSteal} onClick={() => { execCmd('justifyRight'); setFmt(getFmtState()); }}
        className={btn(fmt.right)}><AlignRight size={11} /></button>

      <div className="w-px h-4 bg-white/[0.08] mx-0.5 shrink-0" />

      {/* Color picker */}
      <div className="relative">
        <button onMouseDown={noSteal} onClick={() => setShowColors(v => !v)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors">
          <Palette size={11} />
        </button>
        {showColors && (
          <div
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-[#1a1b1f]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl grid grid-cols-8 gap-1"
            onMouseDown={noSteal}
          >
            {PALETTE_COLORS.map(c => (
              <button key={c}
                style={{ backgroundColor: c }}
                onMouseDown={noSteal}
                onClick={() => { execCmd('foreColor', c); setShowColors(false); }}
                className="w-5 h-5 rounded-md border border-white/10 hover:scale-125 transition-transform shadow-sm"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>,
    document.body,
  );
};

// ── Main TextBlock Component ──────────────────────────────────────────────────

interface Props {
  fieldLabel: string;          // 'Title' or 'Body'
  placeholder: string;
  htmlValue?: string;
  plainValue: string;
  defaultFontSize?: number;
  textColor: 'light' | 'dark';
  className?: string;
  /** Callback with both plain text and html */
  onChange: (plain: string, html: string) => void;
  /** Notifies parent which block is active so others can deselect */
  onStateChange?: (state: BlockState) => void;
  /** If another block is active, we deselect */
  forceIdle?: boolean;
}

const SlideTextBlock: React.FC<Props> = ({
  fieldLabel, placeholder, htmlValue, plainValue,
  defaultFontSize = 28, textColor, className = '',
  onChange, onStateChange, forceIdle,
}) => {
  const [state, setState] = useState<BlockState>('idle');
  const editRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const setBlockState = useCallback((s: BlockState) => {
    setState(s);
    onStateChange?.(s);
  }, [onStateChange]);

  // Force idle from parent (another block selected)
  useEffect(() => {
    if (forceIdle && state !== 'idle') {
      setBlockState('idle');
      editRef.current?.blur();
    }
  }, [forceIdle]);

  // Initialize HTML into contentEditable
  useEffect(() => {
    if (!editRef.current) return;
    const html = htmlValue || `<span style="font-size:${defaultFontSize}px">${plainValue || ''}</span>`;
    if (editRef.current.innerHTML !== html) {
      editRef.current.innerHTML = html;
    }
  // Re-initialize only on slide switch (use first 10 chars as sentinel)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plainValue.slice(0, 10), defaultFontSize]);

  // Click outside → go to idle
  useEffect(() => {
    if (state === 'idle') return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setBlockState('idle');
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [state, setBlockState]);

  // Keyboard: Escape → selected; Delete on selected → clear (optional)
  useEffect(() => {
    if (state !== 'editing' && state !== 'selected') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state === 'editing') { setBlockState('selected'); editRef.current?.blur(); }
        else setBlockState('idle');
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, setBlockState]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (state === 'idle') setBlockState('selected');
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBlockState('editing');
    // Move cursor to end
    setTimeout(() => {
      editRef.current?.focus();
      const range = document.createRange();
      range.selectNodeContents(editRef.current!);
      range.collapse(false);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }, 10);
  };

  const handleInput = () => {
    if (!editRef.current) return;
    onChange(editRef.current.innerText, editRef.current.innerHTML);
  };

  const tc = textColor === 'light' ? 'text-white' : 'text-slate-900';
  const isActive = state !== 'idle';
  const isEditing = state === 'editing';

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`relative group ${isActive ? 'z-10' : ''}`}
    >
      {/* ── Selection / hover border ── */}
      <div className={`absolute inset-[-4px] rounded-lg pointer-events-none transition-all duration-150 ${
        isEditing
          ? 'ring-2 ring-brand-blue shadow-[0_0_0_4px_rgba(0,144,255,0.12)]'
          : isActive
            ? 'ring-2 ring-brand-blue/70 ring-dashed'
            : 'ring-1 ring-transparent group-hover:ring-white/20 group-hover:ring-dashed'
      }`} />

      {/* ── Floating format bar ── */}
      <AnimatePresence>
        {isActive && (
          <FormatBar
            anchorRef={containerRef as React.RefObject<HTMLElement>}
            onMouseDown={(e) => e.preventDefault()}
          />
        )}
      </AnimatePresence>

      {/* ── Block label (shows on hover/select) ── */}
      <div className={`absolute -top-5 left-0 flex items-center gap-1 transition-opacity duration-100 ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
      }`}>
        <Type size={8} className="text-brand-blue/80" />
        <span className="text-[8px] font-bold text-brand-blue/80 uppercase tracking-wider select-none">
          {fieldLabel}
        </span>
      </div>

      {/* ── The actual contentEditable ── */}
      <div
        ref={editRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && isEditing) {
            // Allow multiline (do not prevent default — block naturally wraps)
          }
        }}
        data-placeholder={placeholder}
        className={`
          min-h-[1em] w-full outline-none transition-all duration-100
          ${isEditing ? 'cursor-text' : isActive ? 'cursor-move' : 'cursor-default'}
          ${tc} drop-shadow-md
          ${!htmlValue && !plainValue
              ? 'empty:before:content-[attr(data-placeholder)] empty:before:opacity-30'
              : ''}
          ${className}
        `}
      />

      {/* ── Hint text: double-click to edit (shows on selected, not editing) ── */}
      {state === 'selected' && (
        <div className="absolute -bottom-5 left-0 right-0 text-center pointer-events-none">
          <span className="text-[8px] text-white/40 font-medium">double-click to edit · Esc to exit</span>
        </div>
      )}
    </div>
  );
};

export default SlideTextBlock;
