import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate, motion, useInView, useMotionValue, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  ClipboardList,
  Database,
  FileSpreadsheet,
  Headphones,
  LockKeyhole,
  MessageCircle,
  PlugZap,
  Puzzle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Workflow,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import LazySection from '../LazySection';
import { EASE } from './shared';

type IconType = React.ComponentType<{ size?: number; className?: string }>;

type ProcessCard = {
  title: string;
  desc: string;
  icon: IconType;
  tools: { label: string; icon: IconType; tone: string }[];
};

type ResultCard = {
  title: string;
  desc: string;
  value: string;
  suffix: string;
  icon: IconType;
  tone: string;
};

type BenefitItem = {
  title: string;
  desc: string;
  icon: IconType;
};

const processCards: ProcessCard[] = [
  {
    title: 'landing.solution.proc1_t',
    desc: 'landing.solution.proc1_d',
    icon: ShoppingCart,
    tools: [
      { label: 'CRM', icon: BriefcaseBusiness, tone: 'bg-sky-500/15 text-sky-300' },
      { label: 'Hub', icon: Workflow, tone: 'bg-orange-500/15 text-orange-300' },
      { label: 'Sheet', icon: FileSpreadsheet, tone: 'bg-emerald-500/15 text-emerald-300' },
    ],
  },
  {
    title: 'landing.solution.proc2_t',
    desc: 'landing.solution.proc2_d',
    icon: Headphones,
    tools: [
      { label: 'Chat', icon: MessageCircle, tone: 'bg-blue-500/15 text-blue-300' },
      { label: 'Call', icon: Headphones, tone: 'bg-green-500/15 text-green-300' },
      { label: 'Bot', icon: Bot, tone: 'bg-indigo-500/15 text-indigo-300' },
    ],
  },
  {
    title: 'landing.solution.proc3_t',
    desc: 'landing.solution.proc3_d',
    icon: ClipboardList,
    tools: [
      { label: 'SAP', icon: Database, tone: 'bg-sky-500/15 text-sky-300' },
      { label: 'MISA', icon: FileSpreadsheet, tone: 'bg-rose-500/15 text-rose-300' },
      { label: 'XLS', icon: FileSpreadsheet, tone: 'bg-emerald-500/15 text-emerald-300' },
    ],
  },
  {
    title: 'landing.solution.proc4_t',
    desc: 'landing.solution.proc4_d',
    icon: Workflow,
    tools: [
      { label: 'Task', icon: Users, tone: 'bg-red-500/15 text-red-300' },
      { label: 'Jira', icon: Puzzle, tone: 'bg-blue-500/15 text-blue-300' },
      { label: 'Chat', icon: MessageCircle, tone: 'bg-pink-500/15 text-pink-300' },
    ],
  },
  {
    title: 'landing.solution.proc5_t',
    desc: 'landing.solution.proc5_d',
    icon: BarChart3,
    tools: [
      { label: 'BI', icon: BarChart3, tone: 'bg-amber-500/15 text-amber-300' },
      { label: 'Data', icon: TrendingUp, tone: 'bg-cyan-500/15 text-cyan-300' },
      { label: 'Sheet', icon: FileSpreadsheet, tone: 'bg-emerald-500/15 text-emerald-300' },
    ],
  },
];

const inputItems: { label: string; icon: IconType }[] = [
  { label: 'landing.solution.in1', icon: Database },
  { label: 'landing.solution.in2', icon: ShieldCheck },
  { label: 'landing.solution.in3', icon: Users },
];

const resultCards: ResultCard[] = [
  {
    title: 'landing.solution.res1_t',
    desc: 'landing.solution.res1_d',
    value: '-42',
    suffix: 'landing.solution.res1_s',
    icon: MessageCircle,
    tone: 'from-blue-500/25 to-blue-500/5 text-blue-300',
  },
  {
    title: 'landing.solution.res2_t',
    desc: 'landing.solution.res2_d',
    value: '+28',
    suffix: 'landing.solution.res2_s',
    icon: ClipboardList,
    tone: 'from-emerald-500/25 to-emerald-500/5 text-emerald-300',
  },
  {
    title: 'landing.solution.res3_t',
    desc: 'landing.solution.res3_d',
    value: '24/7',
    suffix: 'landing.solution.res3_s',
    icon: TrendingUp,
    tone: 'from-violet-500/25 to-violet-500/5 text-violet-300',
  },
];

const benefitItems: BenefitItem[] = [
  {
    title: 'landing.solution.bnf1_t',
    desc: 'landing.solution.bnf1_d',
    icon: PlugZap,
  },
  {
    title: 'landing.solution.bnf2_t',
    desc: 'landing.solution.bnf2_d',
    icon: Puzzle,
  },
  {
    title: 'landing.solution.bnf3_t',
    desc: 'landing.solution.bnf3_d',
    icon: ShieldCheck,
  },
  {
    title: 'landing.solution.bnf4_t',
    desc: 'landing.solution.bnf4_d',
    icon: LayersIcon,
  },
];

function LayersIcon({ size = 24, className }: { size?: number; className?: string }) {
  return <BarChart3 size={size} className={className} />;
}

const CountText: React.FC<{
  value: string;
  reduceMotion: boolean | null;
}> = ({ value, reduceMotion }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(value === '24/7' ? '24/7' : '0');
  const numeric = value === '24/7' ? 24 : Number(value.replace(/[^\d.-]/g, ''));
  const prefix = value.startsWith('-') ? '-' : value.startsWith('+') ? '+' : '';
  const suffix = value === '24/7' ? '/7' : '';

  useEffect(() => motionValue.on('change', (latest) => {
    if (value === '24/7') {
      setDisplay(`${Math.round(latest)}/7`);
      return;
    }
    setDisplay(`${prefix}${Math.round(Math.abs(latest))}`);
  }), [motionValue, prefix, value]);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const controls = animate(motionValue, Math.abs(numeric), { duration: 1.2, ease: EASE });
    return () => controls.stop();
  }, [inView, motionValue, numeric, reduceMotion, value]);

  return (
    <span ref={ref}>
      {display}
      {value !== '24/7' && suffix}
    </span>
  );
};

const SolutionSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [activeProcess, setActiveProcess] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => {
      setActiveProcess((current) => (current + 1) % processCards.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <LazySection rootMargin="300px" minHeight={820} className="bg-[#080706]">
      <section className="relative overflow-hidden px-5 py-16 text-white md:px-8 lg:px-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(201,168,76,0.14),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(201,168,76,0.10),transparent_26%),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(201,168,76,0.05)_100%)]" />

        <div className="relative mx-auto max-w-[1540px]">
          <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: EASE }}
              className="max-w-3xl"
            >
              <div className="mb-5 flex items-center gap-4">
                <span className="relative h-2 w-2 rounded-full bg-brand-blue shadow-[0_0_0_5px_rgba(201,168,76,0.12)]" />
                <span className="h-px w-10 bg-brand-blue/70" />
                <span className="font-mono text-[12px] font-bold uppercase tracking-[0.32em] text-brand-blue">
                  {t('landing.solution.label')}
                </span>
              </div>
              <h2 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
                {t('landing.solution.head')} <span className="bg-gradient-to-r from-[#F8E08A] via-[#E5C767] to-[#B8862F] bg-clip-text text-transparent">{t('landing.solution.head_accent')}</span>
              </h2>
              <p className="mt-5 max-w-2xl text-pretty text-base font-medium leading-relaxed text-white/70 md:text-lg">
                {t('landing.solution.sub')}
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.14, ease: EASE }}
              className="flex flex-col gap-3 sm:flex-row lg:pt-6"
            >
              <button
                type="button"
                onClick={() => navigate('/booking')}
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#E5C767] to-[#C9A84C] px-7 py-4 text-sm font-bold text-[#1a1404] shadow-[0_16px_34px_rgba(201,168,76,0.28)] transition duration-300 hover:-translate-y-0.5 hover:from-[#F0D173] hover:to-[#D4B355] hover:shadow-[0_18px_42px_rgba(201,168,76,0.34)]"
              >
                <ClipboardList size={18} />
                {t('landing.solution.cta1')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="group inline-flex items-center justify-center gap-6 rounded-xl border border-brand-blue/45 bg-white/[0.04] px-7 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-0.5 hover:border-brand-blue/70 hover:bg-brand-blue/10"
              >
                {t('landing.solution.cta2')}
                <ArrowRight size={18} className="transition duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          <div className="relative grid gap-8 xl:grid-cols-[1.55fr_0.72fr] xl:items-start">
            <motion.svg
              viewBox="0 0 1540 540"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 top-[232px] z-0 hidden h-[330px] w-full xl:block"
            >
              <motion.path
                d="M 505 270 C 760 270, 1020 270, 1220 270"
                fill="none"
                stroke="#75A9FF"
                strokeWidth="1.8"
                strokeDasharray="7 8"
                initial={reduceMotion ? { pathLength: 1, opacity: 0.45 } : { pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.72 }}
                viewport={{ once: true }}
                transition={{ duration: reduceMotion ? 0 : 1, delay: 0.7, ease: EASE }}
              />
              <motion.path
                d="M 1208 260 L 1224 270 L 1208 280"
                fill="none"
                stroke="#75A9FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? { opacity: 0.72 } : { opacity: 0 }}
                whileInView={{ opacity: 0.72 }}
                viewport={{ once: true }}
                transition={{ duration: reduceMotion ? 0 : 0.3, delay: 1.35, ease: EASE }}
              />
              {!reduceMotion && (
                <motion.circle
                  r="4"
                  fill="#75A9FF"
                  animate={{ cx: [505, 1220], cy: [270, 270], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', delay: 1 }}
                />
              )}
            </motion.svg>

            <div className="relative min-h-[510px]">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: EASE }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
              >
                {processCards.map((card, index) => {
                  const Icon = card.icon;
                  const isActive = !reduceMotion && activeProcess === index;
                  return (
                    <motion.article
                      key={card.title}
                      whileHover={reduceMotion ? undefined : { y: -8 }}
                      animate={reduceMotion ? undefined : {
                        boxShadow: isActive
                          ? '0 24px 54px rgba(201,168,76,0.24)'
                          : '0 18px 44px rgba(0,0,0,0.36)',
                        borderColor: isActive ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.1)',
                      }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="relative z-20 rounded-xl border border-white/10 bg-[#11100d]/80 p-5 shadow-[0_18px_44px_rgba(0,0,0,0.36)] backdrop-blur-xl"
                    >
                      <div className="mb-4 flex items-center gap-4">
                        <motion.span
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-blue/[0.12] text-brand-blue"
                          animate={reduceMotion ? undefined : {
                            scale: isActive ? 1.06 : 1,
                            boxShadow: isActive ? '0 0 28px rgba(201,168,76,0.26)' : '0 0 0 rgba(201,168,76,0)',
                          }}
                          transition={{ duration: 0.5, ease: EASE }}
                        >
                          <Icon size={23} />
                        </motion.span>
                        <h3 className="text-lg font-bold tracking-tight text-white">{t(card.title)}</h3>
                      </div>
                      <p className="min-h-[54px] text-sm font-medium leading-relaxed text-white/80">{t(card.desc)}</p>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {card.tools.map((tool) => {
                          const ToolIcon = tool.icon;
                          return (
                            <span
                              key={tool.label}
                              className="flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]"
                              aria-label={tool.label}
                            >
                              <span className={`flex h-7 w-7 items-center justify-center rounded-md ${tool.tone}`}>
                                <ToolIcon size={16} />
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>

              <div className="relative mt-7 hidden h-[288px] lg:block">
                <motion.svg
                  viewBox="0 0 960 280"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                >
                  <defs>
                    <filter id="solutionGoldGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient id="solutionGoldLine" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#E7C45B" stopOpacity="0.35" />
                      <stop offset="45%" stopColor="#C9A84C" />
                      <stop offset="100%" stopColor="#E7C45B" stopOpacity="0.35" />
                    </linearGradient>
                  </defs>
                  {[
                    'M 96 0 C 96 82, 423 58, 423 84',
                    'M 288 0 C 288 74, 439 56, 439 80',
                    'M 480 0 C 480 56, 451 56, 451 76',
                    'M 672 0 C 672 74, 463 56, 463 80',
                    'M 864 0 C 864 82, 479 58, 479 84',
                  ].map((path, index) => (
                    <motion.path
                      key={`process-line-${index}`}
                      d={path}
                      fill="none"
                      stroke="url(#solutionGoldLine)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      filter="url(#solutionGoldGlow)"
                      initial={reduceMotion ? { pathLength: 1, opacity: 0.6 } : { pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: reduceMotion ? 0 : 0.8, delay: 0.2 + index * 0.08, ease: EASE }}
                    />
                  ))}
                  {[96, 288, 480, 672, 864].map((x, index) => (
                    <motion.circle
                      key={`node-${x}`}
                      cx={x}
                      cy="0"
                      r="4"
                      fill="#11100d"
                      stroke="#C9A84C"
                      strokeWidth="2"
                      animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45], r: [3.5, 5.5, 3.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.22, ease: EASE }}
                    />
                  ))}
                  {[
                    'M 200 86 L 332 86 C 372 86, 376 114, 400 114',
                    'M 200 144 L 388 144',
                    'M 200 202 L 332 202 C 372 202, 376 174, 400 174',
                  ].map((path, index) => (
                    <motion.path
                      key={`input-line-${index}`}
                      d={path}
                      fill="none"
                      stroke="#75A9FF"
                      strokeWidth="1.7"
                      strokeDasharray="6 8"
                      strokeLinecap="round"
                      initial={reduceMotion ? { pathLength: 1, opacity: 0.48 } : { pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.7 }}
                      viewport={{ once: true }}
                      transition={{ duration: reduceMotion ? 0 : 0.85, delay: 0.48 + index * 0.08, ease: EASE }}
                    />
                  ))}
                  {!reduceMotion && [86, 144, 202].map((y, index) => (
                    <motion.circle
                      key={`input-flow-${y}`}
                      r="3"
                      cy={y}
                      fill="#75A9FF"
                      animate={{ cx: [240, 360], opacity: [0, 1, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', delay: 0.8 + index * 0.25 }}
                    />
                  ))}
                </motion.svg>

                <div className="absolute left-0 top-16 z-10 space-y-3">
                  {inputItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        initial={reduceMotion ? false : { opacity: 0, x: -18 }}
                        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: 0.24 + index * 0.08, ease: EASE }}
                        className="flex h-12 w-[250px] items-center gap-3 rounded-xl border border-white/10 bg-[#11100d]/80 px-5 text-sm font-semibold text-white/70 shadow-[0_12px_28px_rgba(0,0,0,0.3)] backdrop-blur-xl"
                      >
                        <Icon size={19} className="text-brand-blue" />
                        {t(item.label)}
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.84 }}
                  whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  animate={reduceMotion ? undefined : {
                    boxShadow: [
                      '0 0 0 14px rgba(201,168,76,0.08), 0 0 42px rgba(201,168,76,0.20)',
                      '0 0 0 30px rgba(201,168,76,0.04), 0 0 60px rgba(201,168,76,0.32)',
                      '0 0 0 14px rgba(201,168,76,0.08), 0 0 42px rgba(201,168,76,0.20)',
                    ],
                  }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: EASE }}
                  className="absolute left-[47%] top-[92px] z-20 flex h-28 w-28 -translate-x-1/2 flex-col items-center justify-center rounded-full border-2 border-brand-blue/45 bg-[#11100d] text-center shadow-[0_18px_54px_rgba(201,168,76,0.22)]"
                >
                  <span className="pointer-events-none absolute inset-[-54px] -z-10 rounded-full border border-brand-blue/10" />
                  <span className="pointer-events-none absolute inset-[-38px] -z-10 rounded-full border border-dashed border-brand-blue/18" />
                  <span className="pointer-events-none absolute inset-[-23px] -z-10 rounded-full border-2 border-brand-blue/22" />
                  <span className="pointer-events-none absolute inset-[-10px] -z-10 rounded-full bg-brand-blue/[0.06]" />
                  <motion.span
                    className="pointer-events-none absolute -top-8 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-brand-blue bg-[#11100d] shadow-[0_0_16px_rgba(201,168,76,0.6)]"
                    animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45], scale: [0.9, 1.22, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, ease: EASE }}
                  />
                  <motion.span
                    className="pointer-events-none absolute left-[-30px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-brand-blue bg-[#11100d] shadow-[0_0_16px_rgba(201,168,76,0.6)]"
                    animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45], scale: [0.9, 1.22, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.25, ease: EASE }}
                  />
                  <motion.span
                    className="pointer-events-none absolute right-[-30px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-brand-blue bg-[#11100d] shadow-[0_0_16px_rgba(201,168,76,0.6)]"
                    animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45], scale: [0.9, 1.22, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: EASE }}
                  />
                  <motion.span
                    className="pointer-events-none absolute -bottom-8 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-brand-blue bg-[#11100d] shadow-[0_0_16px_rgba(201,168,76,0.6)]"
                    animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45], scale: [0.9, 1.22, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.75, ease: EASE }}
                  />
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#E6C663] to-[#C7982F] text-3xl font-bold text-[#0a0a0a] shadow-[0_12px_28px_rgba(201,168,76,0.34)]">
                    AI
                  </span>
                  <span className="mt-2 text-sm font-bold text-white">{t('landing.solution.ai_layer')}</span>
                </motion.div>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.6, ease: EASE }}
                  className="absolute left-[47%] top-[214px] z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-1.5 text-xs font-bold text-blue-300 shadow-[0_10px_24px_rgba(59,130,246,0.12)]"
                >
                  <LockKeyhole size={14} />
                  {t('landing.solution.compliance')}
                </motion.div>
              </div>

              <div className="mt-6 grid gap-4 lg:hidden">
                <div className="rounded-xl border border-brand-blue/20 bg-[#11100d]/80 p-5 text-center shadow-[0_18px_44px_rgba(0,0,0,0.36)] backdrop-blur-xl">
                  <div className="mx-auto flex h-20 w-20 flex-col items-center justify-center rounded-full border border-brand-blue/30 bg-brand-blue/[0.12] text-brand-blue">
                    <Sparkles size={24} />
                    <span className="mt-1 text-sm font-bold">{t('landing.solution.ai_layer_m')}</span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-white/70">{t('landing.solution.ai_layer_desc')}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {inputItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#11100d]/80 p-4 text-sm font-semibold text-white/70">
                        <Icon size={18} className="text-brand-blue" />
                        {t(item.label)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <motion.aside
              initial={reduceMotion ? false : { opacity: 0, x: 34, scale: 0.98 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
              className="relative z-10 rounded-2xl border border-white/10 bg-[#11100d]/80 p-6 shadow-[0_26px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl"
            >
              <h3 className="mb-5 text-2xl font-bold tracking-tight text-white">{t('landing.solution.results_head')}</h3>
              <div className="space-y-3">
                {resultCards.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: 0.25 + index * 0.08, ease: EASE }}
                      whileHover={reduceMotion ? undefined : { y: -4 }}
                      className="grid grid-cols-[56px_1fr_auto] items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.3)]"
                    >
                      <span className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${item.tone}`}>
                        <Icon size={26} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-white">{t(item.title)}</p>
                        <p className="mt-1 text-sm font-medium leading-snug text-white/68">{t(item.desc)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-bold tabular-nums ${item.tone.includes('emerald') ? 'text-emerald-300' : item.tone.includes('violet') ? 'text-violet-300' : 'text-blue-300'}`}>
                          <CountText value={item.value} reduceMotion={reduceMotion} />
                        </p>
                        <p className="mt-1 max-w-[96px] text-sm font-semibold leading-tight text-white/68">{t(item.suffix)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.aside>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
            className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.36)] backdrop-blur-xl md:grid-cols-2 xl:grid-cols-4"
          >
            {benefitItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.28 + index * 0.07, ease: EASE }}
                  className="flex items-start gap-4 xl:border-r xl:border-white/10 xl:px-5 xl:first:pl-0 xl:last:border-r-0"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/[0.12] text-brand-blue">
                    <Icon size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold leading-snug text-white">{t(item.title)}</p>
                    <p className="mt-1 text-pretty text-sm leading-snug text-white/68">{t(item.desc)}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </LazySection>
  );
};

export default SolutionSection;
