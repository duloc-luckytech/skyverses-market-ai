import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, ArrowRight,
  Network, ShieldCheck, DollarSign, Globe,
} from 'lucide-react';
import { GradientMesh, FadeInUp, HoverCard } from '../_shared/SectionAnimations';
import { FloatingBadge } from '../_shared/ProHeroVisuals';
import { PAPERCLIP_CDN } from '../../../src/constants/paperclip-cdn';

interface HeroSectionProps { onStartStudio: () => void; }

const SPECS = [
  {
    icon: <Network size={12} />,
    label: 'Multi-Agent Orchestration',
    sub: 'Claude, GPT-4o, Cursor, Codex & more',
  },
  {
    icon: <DollarSign size={12} />,
    label: 'Budget Guard',
    sub: 'Hard spend limits per agent / department',
  },
  {
    icon: <ShieldCheck size={12} />,
    label: 'Governance Layer',
    sub: 'Human-in-the-loop approvals & audit logs',
  },
  {
    icon: <Globe size={12} />,
    label: 'Open Source',
    sub: 'Self-hosted, fully transparent stack',
  },
];

const DashboardMockup: React.FC = () => (
  <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.06] overflow-hidden shadow-xl shadow-black/5 relative">
    <img
      src={PAPERCLIP_CDN.heroDashboard}
      alt="Paperclip AI Org Dashboard"
      className="w-full h-auto block"
      loading="eager"
    />
    {/* Budget guard overlay badge */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm border border-emerald-400/40 rounded-lg px-2.5 py-1.5 shadow-lg"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      <span className="text-[8px] font-bold text-white">Budget Guard: Active</span>
    </motion.div>
    {/* Tasks running badge */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.0, duration: 0.5 }}
      className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-brand-blue/90 backdrop-blur-sm border border-brand-blue/40 rounded-lg px-2.5 py-1.5 shadow-lg"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-2 h-2 rounded-full border border-white border-t-transparent"
      />
      <span className="text-[8px] font-bold text-white">5 agents running</span>
    </motion.div>
  </div>
);

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-16 relative overflow-hidden">
      <GradientMesh intensity="soft" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        {/* ── LEFT COLUMN ─────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-7">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors tracking-wider"
          >
            <ChevronLeft size={14} /> Trở lại
          </Link>

          <FadeInUp>
            <div className="space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/[0.08] border border-brand-blue/15 rounded-full text-brand-blue text-[10px] font-semibold uppercase tracking-wider">
                <Sparkles size={12} /> AI Org Orchestrator · Open Source
              </div>

              {/* Heading */}
              <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
                Run Your<br />
                <span className="text-brand-blue relative">
                  Company
                  <motion.span
                    className="absolute bottom-0 left-0 h-[3px] bg-brand-blue rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
                  />
                </span>
                <br />
                With AI
              </h1>

              {/* Tagline */}
              <p className="text-sm text-slate-500 dark:text-[#666] font-medium leading-relaxed max-w-md">
                Platform open-source để điều phối <strong className="text-slate-700 dark:text-white/80">AI agents</strong> toàn tổ chức — từ Marketing đến DevOps, với budget guard và governance layer tích hợp sẵn.
              </p>
            </div>
          </FadeInUp>

          {/* Spec cards */}
          <FadeInUp delay={0.2}>
            <div className="grid grid-cols-2 gap-2">
              {SPECS.map(s => (
                <HoverCard key={s.label} className="p-3 flex items-start gap-2.5">
                  <div className="shrink-0 w-6 h-6 rounded-md bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-700 dark:text-white/80">{s.label}</p>
                    <p className="text-[8px] font-medium text-slate-400 dark:text-[#444]">{s.sub}</p>
                  </div>
                </HoverCard>
              ))}
            </div>
          </FadeInUp>

          {/* CTA */}
          <FadeInUp delay={0.3}>
            <div className="space-y-3">
              <motion.button
                onClick={onStartStudio}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-brand-blue to-blue-500 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 transition-all flex items-center gap-3 group"
              >
                Thử Ngay <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
              <p className="text-[11px] text-slate-400 dark:text-[#555] flex items-center gap-2.5 flex-wrap">
                <span>🔓 Hoàn toàn miễn phí</span>
                <span className="opacity-30">·</span>
                <span>✓ Open source · MIT License</span>
                <span className="opacity-30">·</span>
                <span>⚡ Self-hosted trong 5 phút</span>
              </p>
            </div>
          </FadeInUp>
        </div>

        {/* ── RIGHT COLUMN — Dashboard Screenshot ───────── */}
        <div className="lg:col-span-7 relative">
          <FadeInUp delay={0.15}>
            <DashboardMockup />
          </FadeInUp>

          {/* Floating badge */}
          <FloatingBadge
            label="Autonomous agents"
            value="Free / Open Source"
            className="absolute -bottom-3 -left-3"
            delay={0.8}
          />
        </div>
      </div>
    </section>
  );
};
