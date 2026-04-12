import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, ArrowRight,
  Network, ShieldCheck, DollarSign, Globe,
} from 'lucide-react';
import { GradientMesh, FadeInUp, HoverCard } from '../_shared/SectionAnimations';
import { FloatingBadge } from '../_shared/ProHeroVisuals';

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

// ─── Animated org chart mockup ────────────────────────────────
const AGENT_NODES = [
  { id: 'ceo',       label: 'CEO Agent',       role: 'Orchestrator',   color: '#0090ff', x: '50%',   y: '8%'  },
  { id: 'marketing', label: 'Marketing AI',    role: 'Content / Ads',  color: '#8b5cf6', x: '20%',   y: '42%' },
  { id: 'devops',    label: 'DevOps AI',       role: 'CI/CD Pipeline', color: '#10b981', x: '50%',   y: '42%' },
  { id: 'sales',     label: 'Sales AI',        role: 'CRM / Outreach', color: '#f59e0b', x: '80%',   y: '42%' },
  { id: 'claude',    label: 'claude-sonnet',   role: 'LLM',            color: '#0090ff', x: '12%',   y: '76%' },
  { id: 'gpt4o',     label: 'gpt-4o',          role: 'LLM',            color: '#10b981', x: '37%',   y: '76%' },
  { id: 'cursor',    label: 'cursor',          role: 'Code',           color: '#f59e0b', x: '63%',   y: '76%' },
  { id: 'webhook',   label: 'HTTP Webhook',    role: 'Connector',      color: '#ef4444', x: '88%',   y: '76%' },
];

const EDGES = [
  { from: 'ceo', to: 'marketing' },
  { from: 'ceo', to: 'devops' },
  { from: 'ceo', to: 'sales' },
  { from: 'marketing', to: 'claude' },
  { from: 'devops', to: 'gpt4o' },
  { from: 'devops', to: 'cursor' },
  { from: 'sales', to: 'webhook' },
];

const OrgChartMockup: React.FC = () => {
  const nodeMap = Object.fromEntries(AGENT_NODES.map(n => [n.id, n]));

  return (
    <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden shadow-xl shadow-black/5">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.05] dark:border-white/[0.04] bg-slate-50/60 dark:bg-white/[0.01]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="text-[9px] font-bold text-slate-400 dark:text-[#555] uppercase tracking-wider">
          Paperclip — AI Org Dashboard
        </span>
        <div className="w-12" />
      </div>

      {/* Org chart canvas */}
      <div className="relative w-full" style={{ height: '340px' }}>
        {/* SVG edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {EDGES.map(({ from, to }, i) => {
            const f = nodeMap[from];
            const t = nodeMap[to];
            const x1 = parseFloat(f.x) / 100 * 100;
            const y1 = parseFloat(f.y) / 100 * 100;
            const x2 = parseFloat(t.x) / 100 * 100;
            const y2 = parseFloat(t.y) / 100 * 100;
            return (
              <motion.line
                key={i}
                x1={`${x1}%`} y1={`${y1}%`}
                x2={`${x2}%`} y2={`${y2}%`}
                stroke={f.color}
                strokeWidth="1"
                strokeOpacity="0.25"
                strokeDasharray="4 3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: i * 0.12 + 0.4, duration: 0.6, ease: 'easeOut' }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {AGENT_NODES.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.09, type: 'spring', stiffness: 400, damping: 22 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: node.x, top: node.y }}
          >
            <motion.div
              whileHover={{ scale: 1.08, zIndex: 10 }}
              className="flex flex-col items-center gap-0.5 cursor-default"
            >
              <div
                className="w-16 h-10 rounded-lg flex flex-col items-center justify-center border shadow-sm relative overflow-hidden"
                style={{
                  borderColor: `${node.color}40`,
                  backgroundColor: `${node.color}10`,
                  boxShadow: `0 2px 12px ${node.color}20`,
                }}
              >
                {/* Pulse dot */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-[8px] font-bold leading-tight text-center px-1 truncate w-full text-center" style={{ color: node.color }}>
                  {node.label}
                </span>
                <span className="text-[6px] text-slate-400 dark:text-[#555] mt-0.5 truncate w-full text-center px-1">
                  {node.role}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ))}

        {/* Budget guard overlay badge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">Budget Guard: Active</span>
        </motion.div>

        {/* Tasks running badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-lg px-2.5 py-1.5"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-2 h-2 rounded-full border border-brand-blue border-t-transparent"
          />
          <span className="text-[8px] font-bold text-brand-blue">3 agents running</span>
        </motion.div>
      </div>
    </div>
  );
};

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

        {/* ── RIGHT COLUMN — Org Chart Mockup ───────────── */}
        <div className="lg:col-span-7 relative">
          <FadeInUp delay={0.15}>
            <OrgChartMockup />
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
