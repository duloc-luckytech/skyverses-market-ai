
import React, {
  useRef, useEffect, useState, useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Minus, Plus, Palette, Type, ChevronDown,
} from 'lucide-react';

// ── Fonts & Constants ─────────────────────────────────────────────────────────

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

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];

const PALETTE_COLORS = [
  '#ffffff', '#f1f5f9', '#94a3b8', '#475569', '#1e293b', '#000000',
  '#0090ff', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4',
];

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Props {
  fieldLabel: string;
  placeholder: string;
  htmlValue?: string;
  plainValue: string;
  defaultFontSize?: number;
  textColor: 'light' | 'dark';
  className?: string;
  onChange: (plain: string, html: string) => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  forceBlur?: boolean;       // when another block is active
}

// ── Floating Format Bar (Portal) ──────────────────────────────────────────────

interface FormatBarProps {
  editRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLElement>;
  savedRange: React.MutableRefObject<Range | null>;
}

const FormatBar: React.FC<FormatBarProps> = ({ editRef, containerRef, savedRange }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [fmt, setFmt] = useState({ bold: false, italic: false, underline: false, left: true, center: false, right: false });
  const [showColors, setShowColors] = useState(false);
  const [fontSize, setFontSize] = useState(28);

  // Position above block
  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPos({ top: r.top + window.scrollY - 50, left: r.left + window.scrollX });
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [containerRef]);

  // Sync format state when selection changes
  useEffect(() => {
    const sync = () => {
      // Only update if selection is inside our editRef
      const sel = window.getSelection();
      if (!sel || !editRef.current?.contains(sel.anchorNode)) return;
      setFmt({
        bold:      document.queryCommandState('bold'),
        italic:    document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        left:      document.queryCommandState('justifyLeft'),
        center:    document.queryCommandState('justifyCenter'),
        right:     document.queryCommandState('justifyRight'),
      });
      // Read font size
      if (sel.focusNode) {
        const node = sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode as HTMLElement;
        if (node) {
          const sz = parseInt(getComputedStyle(node as Element).fontSize);
          if (!isNaN(sz) && sz > 0) setFontSize(sz);
        }
      }
    };
    document.addEventListener('selectionchange', sync);
    return () => document.removeEventListener('selectionchange', sync);
  }, [editRef]);

  // ── Core: restore selection then exec command ─────────────────────────────
  const run = useCallback((fn: () => void) => {
    // 1. Refocus the contentEditable
    editRef.current?.focus({ preventScroll: true });
    // 2. Restore saved selection range
    if (savedRange.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
      }
    }
    // 3. Enable CSS-based styling
    document.execCommand('styleWithCSS', false, 'true');
    // 4. Run the command
    fn();
    // 5. Re-save the (now modified) range
    const sel2 = window.getSelection();
    if (sel2 && sel2.rangeCount > 0) {
      savedRange.current = sel2.getRangeAt(0).cloneRange();
    }
    setFmt({
      bold:      document.queryCommandState('bold'),
      italic:    document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      left:      document.queryCommandState('justifyLeft'),
      center:    document.queryCommandState('justifyCenter'),
      right:     document.queryCommandState('justifyRight'),
    });
  }, [editRef, savedRange]);

  const applySize = (px: number) => {
    run(() => {
      document.execCommand('fontSize', false, '7');
      const root = editRef.current;
      if (root) {
        root.querySelectorAll('font[size="7"]').forEach(el => {
          const span = document.createElement('span');
          span.style.fontSize = `${px}px`;
          span.innerHTML = (el as HTMLElement).innerHTML;
          el.replaceWith(span);
        });
      }
    });
    setFontSize(px);
  };

  const sizeIdx = FONT_SIZES.reduce((bestIdx, val, idx) =>
    Math.abs(val - fontSize) < Math.abs(FONT_SIZES[bestIdx] - fontSize) ? idx : bestIdx, 0);

  // Never steal focus from the contentEditable
  const np = (e: React.MouseEvent) => e.preventDefault();

  const btnCls = (active: boolean) =>
    `w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
      active
        ? 'bg-brand-blue/25 text-brand-blue'
        : 'text-white/50 hover:text-white hover:bg-white/[0.1]'
    }`;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 99999 }}
      onMouseDown={np}
      className="flex items-center gap-0.5 px-2 py-1.5 rounded-2xl bg-[#16171c]/98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      {/* Font family */}
      <div className="relative flex items-center">
        <select
          onChange={e => run(() => document.execCommand('fontName', false, e.target.value))}
          onMouseDown={np}
          className="appearance-none text-[10px] font-medium bg-transparent text-white/70 outline-none border-none cursor-pointer pr-4 pl-1 h-7 max-w-[80px]"
          defaultValue="Inter"
        >
          {SLIDE_FONTS.map(f => (
            <option key={f.value} value={f.value} className="bg-[#16171c]">{f.label}</option>
          ))}
        </select>
        <ChevronDown size={8} className="absolute right-0 text-white/30 pointer-events-none" />
      </div>

      <div className="w-px h-5 bg-white/[0.08] mx-1 shrink-0" />

      {/* Font size stepper */}
      <button onMouseDown={np} onClick={() => applySize(FONT_SIZES[Math.max(0, sizeIdx - 1)])}
        className={btnCls(false)}><Minus size={9} /></button>
      <select
        value={FONT_SIZES[sizeIdx]}
        onChange={e => applySize(Number(e.target.value))}
        onMouseDown={np}
        className="text-[10px] font-bold text-white/80 bg-transparent outline-none border-none text-center w-9 cursor-pointer tabular-nums"
      >
        {FONT_SIZES.map(s => <option key={s} value={s} className="bg-[#16171c]">{s}</option>)}
      </select>
      <button onMouseDown={np} onClick={() => applySize(FONT_SIZES[Math.min(FONT_SIZES.length - 1, sizeIdx + 1)])}
        className={btnCls(false)}><Plus size={9} /></button>

      <div className="w-px h-5 bg-white/[0.08] mx-1 shrink-0" />

      {/* Bold / Italic / Underline */}
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('bold'))} className={btnCls(fmt.bold)} title="Bold (Ctrl+B)"><Bold size={11} /></button>
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('italic'))} className={btnCls(fmt.italic)} title="Italic (Ctrl+I)"><Italic size={11} /></button>
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('underline'))} className={btnCls(fmt.underline)} title="Underline (Ctrl+U)"><Underline size={11} /></button>

      <div className="w-px h-5 bg-white/[0.08] mx-1 shrink-0" />

      {/* Alignment */}
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('justifyLeft'))} className={btnCls(fmt.left)} title="Align Left"><AlignLeft size={11} /></button>
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('justifyCenter'))} className={btnCls(fmt.center)} title="Align Center"><AlignCenter size={11} /></button>
      <button onMouseDown={np} onClick={() => run(() => document.execCommand('justifyRight'))} className={btnCls(fmt.right)} title="Align Right"><AlignRight size={11} /></button>

      <div className="w-px h-5 bg-white/[0.08] mx-1 shrink-0" />

      {/* Text color */}
      <div className="relative">
        <button onMouseDown={np} onClick={() => setShowColors(v => !v)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.1] transition-colors"
          title="Màu chữ">
          <Palette size={11} />
        </button>
        {showColors && (
          <div
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-[#16171c]/98 backdrop-blur-xl border border-white/[0.08] shadow-2xl grid grid-cols-8 gap-1"
            onMouseDown={np}
          >
            {PALETTE_COLORS.map(c => (
              <button key={c} style={{ backgroundColor: c }}
                onMouseDown={np}
                onClick={() => { run(() => document.execCommand('foreColor', false, c)); setShowColors(false); }}
                className="w-5 h-5 rounded-md border border-white/10 hover:scale-125 transition-transform" />
            ))}
          </div>
        )}
      </div>
    </motion.div>,
    document.body,
  );
};

// ── SlideTextBlock ─────────────────────────────────────────────────────────────

const SlideTextBlock: React.FC<Props> = ({
  fieldLabel, placeholder, htmlValue, plainValue,
  defaultFontSize = 28, textColor, className = '',
  onChange, onActivate, onDeactivate, forceBlur,
}) => {
  const [isActive, setIsActive] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // ← KEY: persist selection range across mousedown events on the toolbar
  const savedRange = useRef<Range | null>(null);
  const initDone = useRef(false);

  // Initialize HTML once per slide (sentinel = first 12 chars of plainValue)
  const initKey = plainValue.slice(0, 12) + String(defaultFontSize);
  useEffect(() => {
    if (!editRef.current) return;
    const html = htmlValue ?? `<span style="font-size:${defaultFontSize}px">${plainValue}</span>`;
    editRef.current.innerHTML = html;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initKey]);

  // Save selection range on every selection change (only when this block has focus)
  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editRef.current?.contains(sel.anchorNode)) {
        savedRange.current = sel.getRangeAt(0).cloneRange();
      }
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);

  // Force blur when another block is activated
  useEffect(() => {
    if (forceBlur && isActive) {
      setIsActive(false);
      editRef.current?.blur();
      onDeactivate?.();
    }
  }, [forceBlur]);

  // Click outside → deactivate
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: MouseEvent) => {
      const clickedFormatBar = (e.target as HTMLElement)?.closest('[data-formatbar]');
      if (!clickedFormatBar && !containerRef.current?.contains(e.target as Node)) {
        setIsActive(false);
        onDeactivate?.();
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [isActive, onDeactivate]);

  // Keyboard: Escape → deactivate
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsActive(false);
        editRef.current?.blur();
        onDeactivate?.();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isActive, onDeactivate]);

  const activate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActive) {
      setIsActive(true);
      onActivate?.();
      setTimeout(() => editRef.current?.focus(), 10);
    }
  }, [isActive, onActivate]);

  const tc = textColor === 'light' ? 'text-white' : 'text-slate-900';

  return (
    <div
      ref={containerRef}
      onClick={activate}
      className={`relative group/block ${isActive ? 'z-20' : 'z-0'}`}
      style={{ paddingTop: '4px', paddingBottom: '4px' }}
    >
      {/* Selection border */}
      <div className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-150 ${
        isActive
          ? 'ring-2 ring-brand-blue shadow-[0_0_0_3px_rgba(0,144,255,0.15)]'
          : 'ring-1 ring-transparent group-hover/block:ring-white/20'
      }`} />

      {/* Floating format bar */}
      <AnimatePresence>
        {isActive && (
          <div data-formatbar="true">
            <FormatBar
              editRef={editRef}
              containerRef={containerRef as React.RefObject<HTMLElement>}
              savedRange={savedRange}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Field label */}
      <div className={`absolute -top-5 left-0 flex items-center gap-1 transition-opacity select-none pointer-events-none ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-50'
      }`}>
        <Type size={8} className="text-brand-blue" />
        <span className="text-[8px] font-bold text-brand-blue uppercase tracking-wider">{fieldLabel}</span>
      </div>

      {/* The actual rich text editing area */}
      <div
        ref={editRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => { if (!isActive) { setIsActive(true); onActivate?.(); } }}
        onBlur={() => {
          // Delay so format bar clicks don't trigger blur before execCommand
          setTimeout(() => {
            const focused = document.activeElement;
            const inContainer = containerRef.current?.contains(focused);
            const inFormatBar = focused?.closest('[data-formatbar]');
            if (!inContainer && !inFormatBar) {
              setIsActive(false);
              onDeactivate?.();
            }
          }, 150);
        }}
        onInput={() => {
          if (!editRef.current) return;
          onChange(editRef.current.innerText, editRef.current.innerHTML);
        }}
        onKeyDown={(e) => {
          // Ctrl/Cmd + B/I/U — native browser shortcuts work by default
          // Enter → new line (browser default for contentEditable = new <div>)
          // Shift+Enter → <br> (also default)
          // Allow all naturally
          if (e.key === 'Escape') {
            e.preventDefault();
            setIsActive(false);
            editRef.current?.blur();
            onDeactivate?.();
          }
        }}
        data-placeholder={placeholder}
        spellCheck={false}
        className={`
          outline-none w-full min-h-[1.2em] cursor-text
          ${tc}
          ${!htmlValue && !plainValue
            ? 'empty:before:content-[attr(data-placeholder)] empty:before:opacity-30'
            : ''}
          leading-snug
          ${className}
        `}
        style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
      />

      {/* Hint */}
      {isActive && (
        <p className="absolute -bottom-4 left-0 text-[8px] text-white/25 pointer-events-none select-none">
          Ctrl+B Bold · Ctrl+I Italic · Enter xuống dòng · Esc thoát
        </p>
      )}
    </div>
  );
};

export default SlideTextBlock;
