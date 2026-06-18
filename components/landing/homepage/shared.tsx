import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowDownRight } from 'lucide-react';

export const EASE = [0.22, 1, 0.36, 1] as const;

export type MotionName =
  | 'fade-up'
  | 'stagger-children'
  | 'hover-lift'
  | 'image-zoom'
  | 'draw-line'
  | 'count-up'
  | 'cost-drop'
  | 'os-fanout'
  | 'shimmer'
  | 'typewriter';

const motionText: Record<MotionName, string> = {
  'fade-up': 'fade-up',
  'stagger-children': 'stagger-children',
  'hover-lift': 'hover-lift',
  'image-zoom': 'image-zoom',
  'draw-line': 'draw-line',
  'count-up': 'count-up',
  'cost-drop': 'cost-drop',
  'os-fanout': 'OS-fanout',
  shimmer: 'shimmer',
  typewriter: 'typewriter',
};

export const MotionChip: React.FC<{ name: MotionName }> = ({ name }) => (
  <span className="inline-flex items-center rounded-full border border-brand-blue/20 bg-brand-blue/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-blue">
    {motionText[name]}
  </span>
);

export const SectionHeader: React.FC<{
  label?: string;
  title: string;
  desc?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}> = ({ label, title, desc, align = 'left', dark = false }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE }}
      className={`mb-10 flex max-w-3xl flex-col gap-4 ${align === 'center' ? 'mx-auto items-center text-center' : 'items-start'}`}
    >
      {label && (
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-blue">
          {label}
        </span>
      )}
      <h2 className={`text-3xl font-bold leading-tight tracking-tight md:text-4xl ${dark ? 'text-white' : 'text-[#1a2330]'}`}>
        {title}
      </h2>
      {desc && (
        <p className={`text-sm leading-relaxed md:text-base ${dark ? 'text-white/55' : 'text-[#1a2330]/60'}`}>
          {desc}
        </p>
      )}
    </motion.div>
  );
};

export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const GoldButton: React.FC<{ children: React.ReactNode; onClick: () => void; className?: string }> = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-blue px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-blue/25 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-blueHover hover:shadow-xl hover:shadow-brand-blue/30 ${className}`}
  >
    <span className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent motion-safe:animate-[sv-shimmer_2.8s_linear_infinite]" />
    <span className="relative inline-flex items-center gap-2">
      {children}
    </span>
  </button>
);

export const OutlineButton: React.FC<{ children: React.ReactNode; onClick: () => void; dark?: boolean }> = ({ children, onClick, dark = false }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition duration-200 hover:-translate-y-0.5 ${
      dark
        ? 'border-white/20 text-white hover:border-white/40 hover:bg-white/[0.06]'
        : 'border-[#1a2330]/20 text-[#1a2330] hover:border-[#1a2330]/50 hover:bg-[#1a2330]/[0.04]'
    }`}
  >
    {children}
  </button>
);

export const DrawIcon: React.FC<{ icon: React.ComponentType<{ size?: number; className?: string }>; className?: string }> = ({ icon: Icon, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, ease: EASE }}
    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ${className}`}
  >
    <Icon size={23} className="motion-safe:animate-[sv-icon-pulse_3s_ease-in-out_infinite]" />
  </motion.div>
);

export const HoverCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2, ease: EASE }}
    className={`rounded-2xl border border-black/[0.06] bg-white shadow-[0_10px_40px_rgba(26,35,48,0.05)] transition-colors hover:border-brand-blue/35 hover:shadow-[0_16px_50px_rgba(201,168,76,0.14)] ${className}`}
  >
    {children}
  </motion.div>
);

/**
 * Count-up number when scrolled into view. Parses an optional non-digit prefix,
 * a number, and a trailing suffix (e.g. "~70%", "50+", "4K"). Non-numeric values
 * (e.g. "Roles", "PAYG") render statically.
 */
export const AnimatedStat: React.FC<{ value: string; className?: string; durationMs?: number }> = ({ value, className = '', durationMs = 1100 }) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const match = value.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);
  const hasNumber = !!match;
  const prefix = match?.[1] ?? '';
  const numText = match?.[2] ?? '0';
  const target = match ? parseFloat(numText) : 0;
  const decimals = numText.includes('.') ? numText.split('.')[1].length : 0;
  const suffix = match?.[3] ?? '';
  const [display, setDisplay] = useState(!hasNumber || reduceMotion ? target : 0);

  useEffect(() => {
    if (!hasNumber || reduceMotion || !inView) return;
    let raf = 0;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else setDisplay(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [hasNumber, reduceMotion, inView, target, durationMs]);

  if (!hasNumber) {
    return <span ref={ref} className={className}>{value}</span>;
  }
  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
};

/**
 * Struck-through "before" price → animated "after" price dropping in, with a savings badge.
 */
export const CostDrop: React.FC<{ oldValue: string; newValue: string; saveLabel: string; className?: string }> = ({ oldValue, newValue, saveLabel, className = '' }) => {
  const reduceMotion = useReducedMotion();
  return (
    <div className={`flex flex-wrap items-end gap-x-4 gap-y-2 ${className}`}>
      <span className="text-lg font-bold text-[#1a2330]/35 line-through decoration-2">{oldValue}</span>
      <ArrowDownRight size={20} className="mb-1 text-brand-blue" />
      <motion.span
        initial={reduceMotion ? false : { opacity: 0, y: -16 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.15 }}
        className="text-3xl font-black leading-none text-brand-blue"
      >
        {newValue}
      </motion.span>
      <span className="mb-0.5 inline-flex items-center rounded-full bg-brand-blue/[0.1] px-3 py-1 text-xs font-bold text-brand-blue">{saveLabel}</span>
    </div>
  );
};

/** Shared keyframes for the homepage. Render once near the top of the page. */
export const HomepageKeyframes: React.FC = () => (
  <style>{`
    @keyframes sv-shimmer { 0% { transform: translateX(-120%) skewX(-12deg); } 100% { transform: translateX(360%) skewX(-12deg); } }
    @keyframes sv-icon-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: .78; } }
    @keyframes sv-caret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    @keyframes sv-scan { 0% { transform: translateY(-120%); } 100% { transform: translateY(520%); } }
    @media (prefers-reduced-motion: reduce) {
      .motion-safe\\:animate-\\[sv-shimmer_2\\.8s_linear_infinite\\],
      .motion-safe\\:animate-\\[sv-shimmer_5s_linear_infinite\\],
      .motion-safe\\:animate-\\[sv-icon-pulse_3s_ease-in-out_infinite\\],
      .motion-safe\\:animate-\\[sv-caret_1s_step-end_infinite\\],
      .motion-safe\\:animate-\\[sv-scan_1\\.6s_linear_infinite\\] { animation: none !important; }
    }
  `}</style>
);
