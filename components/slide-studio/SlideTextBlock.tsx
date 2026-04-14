
import React, {
  useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SlideTextBlockHandle {
  getEditRef: () => HTMLDivElement | null;
}

export interface Props {
  fieldLabel: string;
  placeholder: string;
  htmlValue?: string;
  plainValue: string;
  defaultFontSize?: number;
  textColor: 'light' | 'dark';
  className?: string;
  onChange: (plain: string, html: string) => void;
  onActivate?: (ref: HTMLDivElement) => void;
  onDeactivate?: () => void;
  forceBlur?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────

const SlideTextBlock = forwardRef<SlideTextBlockHandle, Props>(({
  fieldLabel, placeholder, htmlValue, plainValue,
  defaultFontSize = 28, textColor, className = '',
  onChange, onActivate, onDeactivate, forceBlur,
}, ref) => {
  const [isActive, setIsActive] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initKey = plainValue.slice(0, 12) + String(defaultFontSize);

  // Expose editRef to parent via imperative handle
  useImperativeHandle(ref, () => ({
    getEditRef: () => editRef.current,
  }));

  // Initialize HTML on slide change (sentinel = first 12 chars)
  useEffect(() => {
    if (!editRef.current) return;
    const html = htmlValue ?? `<span style="font-size:${defaultFontSize}px">${plainValue}</span>`;
    editRef.current.innerHTML = html;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initKey]);

  // Force deactivation when another block activates
  useEffect(() => {
    if (forceBlur && isActive) {
      setIsActive(false);
      editRef.current?.blur();
    }
  }, [forceBlur]); // eslint-disable-line

  // Click outside → deactivate
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow clicks inside this block OR the shared format bar (by class)
      if (containerRef.current?.contains(target)) return;
      if (target.closest('[data-slide-formatbar]')) return;
      setIsActive(false);
      onDeactivate?.();
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [isActive, onDeactivate]);

  // Escape → deactivate
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      // Don't intercept keys while typing in contentEditable — only Escape
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsActive(false);
        editRef.current?.blur();
        onDeactivate?.();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [isActive, onDeactivate]);

  const tc = textColor === 'light' ? 'text-white' : 'text-slate-900';

  return (
    <div
      ref={containerRef}
      className={`relative group/block ${isActive ? 'z-20' : 'z-0'}`}
      style={{ padding: '2px 0' }}
    >
      {/* Selection border */}
      <div className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-150 ${
        isActive
          ? 'ring-2 ring-brand-blue shadow-[0_0_0_4px_rgba(0,144,255,0.12)]'
          : 'ring-1 ring-transparent group-hover/block:ring-white/20 group-hover/block:ring-dashed'
      }`} />

      {/* Field label */}
      <div className={`absolute -top-5 left-0 flex items-center gap-1 transition-opacity select-none pointer-events-none ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-50'
      }`}>
        <Type size={8} className="text-brand-blue" />
        <span className="text-[8px] font-bold text-brand-blue uppercase tracking-wider">{fieldLabel}</span>
      </div>

      {/* ─── The contentEditable ─────────────────────────────────────────────── */}
      <div
        ref={editRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onFocus={() => {
          if (!isActive) {
            setIsActive(true);
            if (editRef.current) onActivate?.(editRef.current);
          }
        }}
        onBlur={(e) => {
          // If focus moved to the shared format bar → don't deactivate
          const related = e.relatedTarget as HTMLElement | null;
          if (related?.closest('[data-slide-formatbar]')) return;
          // Delay to catch portal-rendered button clicks
          setTimeout(() => {
            const active = document.activeElement as HTMLElement | null;
            if (active?.closest('[data-slide-formatbar]')) return;
            if (editRef.current?.contains(active)) return;
            setIsActive(false);
            onDeactivate?.();
          }, 200);
        }}
        onInput={() => {
          if (!editRef.current) return;
          onChange(editRef.current.innerText, editRef.current.innerHTML);
        }}
        data-placeholder={placeholder}
        className={`
          outline-none w-full min-h-[1.2em] cursor-text leading-snug
          ${tc}
          ${!htmlValue && !plainValue
            ? 'empty:before:content-[attr(data-placeholder)] empty:before:opacity-30 empty:before:pointer-events-none'
            : ''}
          ${className}
        `}
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  );
});

SlideTextBlock.displayName = 'SlideTextBlock';
export default SlideTextBlock;
