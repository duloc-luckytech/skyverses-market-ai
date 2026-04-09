/**
 * SectionAnimations.tsx — Shared animation primitives for PRO landing pages
 *
 * Usage:
 *   import { FadeInUp, StaggerChildren, GradientMesh, CountUp } from '../_shared/SectionAnimations';
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform, Variants } from 'framer-motion';

// ─── Ease presets ─────────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

// ─── FadeInUp ─────────────────────────────────────────────────────────────────
/** Scroll-triggered fade + slide up. Animates once when entering viewport. */
interface FadeInUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
}

export const FadeInUp: React.FC<FadeInUpProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  y = 40,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
};

// ─── FadeInScale ──────────────────────────────────────────────────────────────
interface FadeInScaleProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeInScale: React.FC<FadeInScaleProps> = ({ children, delay = 0, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
};

// ─── StaggerChildren ──────────────────────────────────────────────────────────
/** Wraps children and staggers their entrance animation when scrolled into view. */
interface StaggerChildrenProps {
  children: React.ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  className?: string;
  y?: number;
}

const staggerVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
};

export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  staggerDelay = 0.08,
  initialDelay = 0,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      custom={staggerDelay}
      transition={{ delayChildren: initialDelay }}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

// ─── ParallaxSection ──────────────────────────────────────────────────────────
/** Subtle parallax: background moves slower than scroll (depth effect). */
interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number; // 0–1, lower = more parallax
  className?: string;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.3,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -60}px`, `${speed * 60}px`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ''}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
};

// ─── CountUp ──────────────────────────────────────────────────────────────────
/** Animated counter — counts up from 0 to `value` when scrolled into view. */
interface CountUpProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number; // seconds
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  suffix = '',
  prefix = '',
  duration = 1.6,
  className,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
};

// ─── GradientMesh ─────────────────────────────────────────────────────────────
/**
 * Animated gradient mesh background — brand-blue + indigo/purple blobs.
 * Renders as absolute positioned overlay. Place inside a `relative` container.
 */
interface GradientMeshProps {
  /** Additional Tailwind classes for the container */
  className?: string;
  /** Accent color blob (Tailwind color token, e.g. 'purple-600', 'cyan-400') */
  accent?: string;
  intensity?: 'soft' | 'medium' | 'strong';
}

export const GradientMesh: React.FC<GradientMeshProps> = ({
  className,
  accent = 'purple-600',
  intensity = 'soft',
}) => {
  const opacityMap = { soft: '0.04', medium: '0.06', strong: '0.09' };
  const op = opacityMap[intensity];

  return (
    <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${className ?? ''}`}>
      {/* Primary brand-blue top-right blob */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[300px] -right-[300px] w-[900px] h-[900px] rounded-full blur-[200px]"
        style={{ backgroundColor: `rgba(0,144,255,${op})` }}
      />
      {/* Accent blob bottom-left */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], x: [0, -15, 0], y: [0, 25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className={`absolute -bottom-[200px] -left-[200px] w-[700px] h-[700px] bg-${accent}/[${op}] rounded-full blur-[180px]`}
      />
      {/* Center floating orb */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 18, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-1/2 right-[20%] w-64 h-64 rounded-full blur-[120px]"
        style={{ backgroundColor: `rgba(0,144,255,${parseFloat(op) * 0.6})` }}
      />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,144,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,144,255,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
};

// ─── SectionLabel ─────────────────────────────────────────────────────────────
/** Consistent uppercase section label pill — e.g. "CÁCH HOẠT ĐỘNG" */
interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ children, className }) => (
  <p className={`text-[10px] font-semibold uppercase tracking-widest text-brand-blue/60 mb-2 ${className ?? ''}`}>
    {children}
  </p>
);

// ─── HoverCard ────────────────────────────────────────────────────────────────
/** Card with subtle hover lift + blue border glow. */
interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
}

export const HoverCard: React.FC<HoverCardProps> = ({ children, className, glowOnHover = true }) => (
  <motion.div
    whileHover={
      glowOnHover
        ? { y: -4, borderColor: 'rgba(0,144,255,0.25)', boxShadow: '0 8px 32px rgba(0,144,255,0.12)' }
        : { y: -3 }
    }
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className={`border border-black/[0.06] dark:border-white/[0.04] rounded-xl transition-colors ${className ?? ''}`}
  >
    {children}
  </motion.div>
);

// ─── TimelineConnector ────────────────────────────────────────────────────────
/**
 * Animated SVG line that "draws" itself when scrolled into view.
 * Use between workflow steps for a connected timeline look.
 */
interface TimelineConnectorProps {
  vertical?: boolean;
  className?: string;
}

export const TimelineConnector: React.FC<TimelineConnectorProps> = ({
  vertical = false,
  className,
}) => {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  if (vertical) {
    return (
      <svg ref={ref} className={`w-px h-full ${className ?? ''}`} viewBox="0 0 1 100" preserveAspectRatio="none">
        <motion.line
          x1="0.5" y1="0" x2="0.5" y2="100"
          stroke="rgba(0,144,255,0.2)"
          strokeWidth="1"
          strokeDasharray="100"
          initial={{ strokeDashoffset: 100 }}
          animate={isInView ? { strokeDashoffset: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
    );
  }

  return (
    <svg ref={ref} className={`w-full h-px ${className ?? ''}`} viewBox="0 0 100 1" preserveAspectRatio="none">
      <motion.line
        x1="0" y1="0.5" x2="100" y2="0.5"
        stroke="rgba(0,144,255,0.2)"
        strokeWidth="1"
        strokeDasharray="100"
        initial={{ strokeDashoffset: 100 }}
        animate={isInView ? { strokeDashoffset: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  );
};
