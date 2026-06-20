import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronsRight, Clapperboard, Play, Sparkles, Users } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import LazySection from '../LazySection';
import type { ShowcaseImage, ShowcaseVideo } from '../../../src/constants/showcase-cdn';
import { EASE } from './shared';

type ProcKind = 'image' | 'sync' | 'video';

type WorkflowStep = {
  index: string;
  title: string;
  body: string;
  image: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  route: string;
  proc: ProcKind;
  procLabel: string;
};

// 0,1,2 = workflow cards · 3 = finished-video preview. The "baton" loops through
// all four to simulate a closed production pipeline (image → character → video → loop).
const STAGE_COUNT = 4;
const STAGE_MS = 2200;

const fallbackImages = {
  generate: '/assets/homepage/gold-build-image-gen.webp',
  refine: '/assets/homepage/gold-create-creators.webp',
  animate: '/assets/homepage/gold-build-video-gen.webp',
};

const getShowcaseImage = (items: ShowcaseImage[], id: string, fallback: string) => (
  items.find((item) => item.id === id)?.img ?? items[0]?.img ?? fallback
);

const getShowcaseVideoThumb = (items: ShowcaseVideo[], id: string, fallback: string) => (
  items.find((item) => item.id === id)?.thumb ?? items[0]?.thumb ?? fallback
);

// Sleek glass status chip — replaces the old solid-yellow pill. Ping dot + thin label.
const StatusChip: React.FC<{ label: string }> = ({ label }) => (
  <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-[#f5d575]/40 bg-black/55 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#f5d575] backdrop-blur-md">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5d575] opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f5d575]" />
    </span>
    {label}
  </span>
);

// Card 01 — image generation: a light bar paints across + faint pixel-grid bloom.
const ImageRenderFx: React.FC = () => (
  <>
    <motion.span
      className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,240,184,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,240,184,0.35)_1px,transparent_1px)] [background-size:18px_18px]"
      animate={{ opacity: [0.12, 0.4, 0.12] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.span
      className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#fff0b8]/35 to-transparent"
      animate={{ x: ['-130%', '330%'] }}
      transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
    />
  </>
);

// Card 02 — character sync: corner tracking brackets + a center reticle that lock on.
const CharacterSyncFx: React.FC = () => {
  const marks = [
    'left-[16%] top-[24%]',
    'right-[18%] top-[20%]',
    'left-[28%] bottom-[26%]',
    'right-[24%] bottom-[30%]',
  ];
  return (
    <>
      {marks.map((pos, i) => (
        <motion.span
          key={pos}
          className={`pointer-events-none absolute h-3.5 w-3.5 rounded-[3px] border border-[#fff0b8] ${pos}`}
          animate={{ opacity: [0, 1, 0.4], scale: [0.6, 1.1, 1] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.22 }}
        />
      ))}
      <motion.span
        className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#f5d575]/70"
        animate={{ rotate: 360, scale: [0.92, 1.04, 0.92] }}
        transition={{ rotate: { duration: 5, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }}
      />
    </>
  );
};

// Card 03 — video encode: bottom timeline fills + a vertical playhead scrubs across.
const VideoEncodeFx: React.FC = () => (
  <>
    <motion.span
      className="pointer-events-none absolute inset-y-0 w-px bg-[#fff0b8]/80 shadow-[0_0_12px_rgba(255,240,184,0.9)]"
      animate={{ left: ['2%', '98%'] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-black/40">
      <motion.span
        className="block h-full bg-gradient-to-r from-[#f5d575] to-[#fff0b8]"
        animate={{ width: ['0%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </span>
  </>
);

const ProcessFx: React.FC<{ kind: ProcKind }> = ({ kind }) => {
  if (kind === 'image') return <ImageRenderFx />;
  if (kind === 'sync') return <CharacterSyncFx />;
  return <VideoEncodeFx />;
};

const ConnectorArrow: React.FC<{
  delay?: number;
  active?: boolean;
}> = ({ delay = 0, active = false }) => {
  const reduceMotion = useReducedMotion();
  const live = active && !reduceMotion;

  return (
    <motion.div
      aria-hidden="true"
      initial={reduceMotion ? false : { opacity: 0, x: -10 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={`relative hidden h-full items-center justify-center drop-shadow-[0_0_16px_rgba(201,168,76,0.8)] lg:flex ${live ? 'text-[#f5d575]' : 'text-brand-blue'}`}
    >
      {/* Output of the previous stage travelling to the next — only on hand-off */}
      {live && (
        <motion.span
          className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#fff0b8] shadow-[0_0_14px_rgba(255,240,184,1)]"
          initial={{ x: -4, opacity: 0 }}
          animate={{ x: 32, opacity: [0, 1, 0] }}
          transition={{ duration: STAGE_MS / 1000, ease: EASE }}
        />
      )}
      <motion.span
        animate={reduceMotion ? undefined : { x: live ? [0, 7, 0] : [0, 4, 0], opacity: live ? 1 : [0.72, 1, 0.72], scale: live ? 1.15 : 1 }}
        transition={{ duration: live ? 0.9 : 1.8, repeat: Infinity, ease: EASE }}
      >
        <ChevronsRight size={30} strokeWidth={1.75} />
      </motion.span>
    </motion.div>
  );
};

const WorkflowCard: React.FC<{
  step: WorkflowStep;
  position: number;
  active: boolean;
  onOpen: () => void;
}> = ({ step, position, active, onOpen }) => {
  const Icon = step.icon;
  const reduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const live = active && !reduceMotion;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 34, scale: 0.96 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.65, delay: position * 0.1, ease: EASE }}
      animate={live ? { y: -8, borderColor: 'rgba(245,213,117,0.7)', boxShadow: '0 26px 90px rgba(201,168,76,0.22)' } : { y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -8 }}
      onClick={onOpen}
      className="group relative flex min-h-[430px] cursor-pointer flex-col overflow-hidden rounded-[24px] border border-brand-blue/30 bg-[#11100d]/80 p-5 shadow-[0_22px_80px_rgba(0,0,0,0.36)] backdrop-blur-xl transition-colors duration-300 hover:border-brand-blue/60 hover:bg-[#15130f]"
    >
      <div className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,168,76,0.16),transparent_42%)] transition-opacity duration-500 group-hover:opacity-100 ${live ? 'opacity-100' : 'opacity-0'}`} />
      <div className="relative z-10 mb-5 flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[34px] font-black leading-none text-brand-blue md:text-[40px]">{step.index}</span>
          <h3 className="text-lg font-bold tracking-tight text-white md:text-xl">{step.title}</h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-blue/30 bg-brand-blue/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-blue">
          <span className={`h-1.5 w-1.5 rounded-full bg-brand-blue ${live ? 'motion-safe:animate-pulse' : ''}`} />
          {t('landing.showcase.demo')}
        </span>
      </div>

      <motion.div
        className="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
        whileHover={reduceMotion ? undefined : { scale: 1.015 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <img
          src={step.image}
          alt={`${step.title} — Skyverses creator tool preview`}
          loading="lazy"
          className={`h-48 w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-100 md:h-52 ${live ? 'opacity-100' : 'opacity-90'}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/[0.04]" />

        {/* Active stage: a process effect unique to this card's real tool + a sleek glass status chip */}
        {live ? (
          <>
            <ProcessFx kind={step.proc} />
            <StatusChip label={step.procLabel} />
          </>
        ) : (
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue to-transparent"
            animate={reduceMotion ? undefined : { x: ['-100%', '100%'] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'linear', delay: position * 0.35 }}
          />
        )}
      </motion.div>

      <p className="relative z-10 mt-5 min-h-[50px] text-sm leading-relaxed text-white/80">{step.body}</p>

      <div className="relative z-10 mt-auto flex items-center justify-between gap-4 border-t border-white/10 pt-4">
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-brand-blue/[0.08] text-brand-blue transition-colors duration-300 ${live ? 'border-brand-blue/60' : 'border-brand-blue/25'}`}>
          <Icon size={21} />
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue">
          {t('landing.showcase.open_tool')}
          <ArrowRight size={16} className="transition duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </motion.article>
  );
};

const LivePreviewCard: React.FC<{
  image: string;
  active: boolean;
  onOpenVideo: () => void;
}> = ({ image, active, onOpenVideo }) => {
  const reduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const live = active && !reduceMotion;

  return (
    <motion.aside
      initial={reduceMotion ? false : { opacity: 0, x: 30 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.65, delay: 0.38, ease: EASE }}
      animate={live ? { borderColor: 'rgba(245,213,117,0.7)', boxShadow: '0 26px 90px rgba(201,168,76,0.22)' } : {}}
      className="relative flex min-h-[430px] flex-col overflow-hidden rounded-[24px] border border-brand-blue/30 bg-[#11100d]/80 p-5 shadow-[0_22px_80px_rgba(0,0,0,0.36)] backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold tracking-tight text-white">{t('landing.showcase.preview_title')}</h3>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-blue/30 bg-brand-blue/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-blue">
          <span className={`h-1.5 w-1.5 rounded-full bg-brand-blue ${live ? 'motion-safe:animate-pulse' : ''}`} />
          {t('landing.showcase.demo')}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenVideo}
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-left"
      >
        <img
          src={image}
          alt="Skyverses AI video — sample output"
          loading="lazy"
          className={`h-72 w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-100 lg:h-64 ${live ? 'opacity-100' : 'opacity-85'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <motion.span
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-[0_0_42px_rgba(201,168,76,0.26)] backdrop-blur-md transition group-hover:bg-brand-blue group-hover:text-[#0a0a0a]"
          animate={live ? { scale: [1, 1.1, 1], boxShadow: ['0 0 32px rgba(201,168,76,0.3)', '0 0 52px rgba(245,213,117,0.7)', '0 0 32px rgba(201,168,76,0.3)'] } : undefined}
          transition={{ duration: 1.4, repeat: Infinity, ease: EASE }}
          whileHover={reduceMotion ? undefined : { scale: 1.08 }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        >
          <Play size={22} fill="currentColor" />
        </motion.span>
        {/* Pulsing ring when the baton lands on the finished output */}
        {live && (
          <motion.span
            className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f5d575]"
            animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </button>

      <button
        type="button"
        onClick={onOpenVideo}
        className="group mt-auto flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-blue/25 bg-brand-blue/[0.08] text-brand-blue">
            <Clapperboard size={21} />
          </span>
          <span className="text-sm font-bold text-white">{t('landing.showcase.preview_cta')}</span>
        </span>
        <ArrowRight size={18} className="text-brand-blue transition duration-300 group-hover:translate-x-1" />
      </button>
    </motion.aside>
  );
};

const CreatorsShowcaseSection: React.FC<{
  showcaseImages: ShowcaseImage[];
  showcaseVideos: ShowcaseVideo[];
}> = ({ showcaseImages, showcaseVideos }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState(0);

  // Drive the closed-loop "baton" through the pipeline. Frozen under reduced-motion.
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setStage((s) => (s + 1) % STAGE_COUNT), STAGE_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const workflowSteps: WorkflowStep[] = [
    {
      index: '01',
      title: t('landing.showcase.c1_title'),
      body: t('landing.showcase.c1_body'),
      image: getShowcaseImage(showcaseImages, 'bp-malachar-arena', fallbackImages.generate),
      icon: Sparkles,
      route: '/product/ai-image-generator',
      proc: 'image',
      procLabel: t('landing.showcase.proc_image'),
    },
    {
      index: '02',
      title: t('landing.showcase.c2_title'),
      body: t('landing.showcase.c2_body'),
      image: getShowcaseImage(showcaseImages, 'bp-viper-turnaround', fallbackImages.refine),
      icon: Users,
      route: '/product/character-sync-ai',
      proc: 'sync',
      procLabel: t('landing.showcase.proc_sync'),
    },
    {
      index: '03',
      title: t('landing.showcase.c3_title'),
      body: t('landing.showcase.c3_body'),
      image: getShowcaseVideoThumb(showcaseVideos, 'veo3-malachar-fight', getShowcaseImage(showcaseImages, 'bp-malachar-hero', fallbackImages.animate)),
      icon: Clapperboard,
      route: '/product/ai-video-generator',
      proc: 'video',
      procLabel: t('landing.showcase.proc_video'),
    },
  ];

  const previewImage = getShowcaseVideoThumb(
    showcaseVideos,
    'veo3-malachar-fight',
    getShowcaseImage(showcaseImages, 'bp-malachar-hero', fallbackImages.animate),
  );

  return (
    <LazySection rootMargin="300px" minHeight={760} className="bg-[#080706]">
      <section className="relative overflow-hidden px-5 py-20 md:px-8 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(201,168,76,0.13),transparent_34%),radial-gradient(circle_at_18%_88%,rgba(201,168,76,0.07),transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(201,168,76,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.24)_1px,transparent_1px)] [background-size:68px_68px] [mask-image:radial-gradient(circle_at_50%_35%,black,transparent_72%)]" />

        <div className="relative mx-auto max-w-[1480px]">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto max-w-[1120px] text-center"
          >
            <div className="mb-5 flex items-center justify-center gap-4">
              <span className="h-px w-14 bg-gradient-to-r from-transparent to-brand-blue/75" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-brand-blue">
                {t('landing.showcase.label')}
              </span>
              <span className="h-px w-14 bg-gradient-to-l from-transparent to-brand-blue/75" />
            </div>
            <h2 className="text-3xl font-bold leading-[1.12] tracking-tight text-white md:text-[44px] lg:text-[48px] xl:text-[52px]">
              {t('landing.showcase.title')} <span className="bg-gradient-to-r from-[#F8E08A] via-[#E5C767] to-[#B8862F] bg-clip-text text-transparent">{t('landing.showcase.title_accent')}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
              {t('landing.showcase.desc')}
            </p>
          </motion.div>

          <div className="mt-12 hidden lg:grid lg:grid-cols-[minmax(0,1fr)_34px_minmax(0,1fr)_34px_minmax(0,1fr)_0.74fr] lg:gap-x-4">
            <div className="relative col-span-5 grid h-12 grid-cols-[minmax(0,1fr)_34px_minmax(0,1fr)_34px_minmax(0,1fr)] gap-x-4">
              <div className="absolute inset-x-2 top-1/2 h-5 -translate-y-1/2 bg-gradient-to-r from-transparent via-brand-blue/40 to-transparent blur-xl" />
              <div className="absolute inset-x-2 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[#f5d575] to-transparent shadow-[0_0_18px_rgba(245,213,117,0.78)]" />
              <motion.div
                className="absolute left-2 top-1/2 h-[2px] w-1/5 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#fff0b8] to-transparent shadow-[0_0_26px_rgba(255,240,184,0.9)]"
                animate={reduceMotion ? undefined : { x: ['0%', '395%'], opacity: [0, 1, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: EASE }}
              />
              {[0, 1, 2].map((node) => {
                const nodeActive = stage === node && !reduceMotion;
                return (
                  <motion.span
                    key={node}
                    className={`relative z-10 flex h-7 w-7 place-self-center items-center justify-center rounded-full border bg-[#080706] ${node === 0 ? 'col-start-1' : node === 1 ? 'col-start-3' : 'col-start-5'} ${nodeActive ? 'border-[#fff0b8]' : 'border-[#ffe8a3]'}`}
                    animate={reduceMotion ? undefined : (nodeActive
                      ? { scale: 1.28, boxShadow: '0 0 40px rgba(255,240,184,1)' }
                      : { scale: 1, boxShadow: '0 0 18px rgba(245,213,117,0.6)' })}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <span className="absolute h-12 w-12 rounded-full bg-brand-blue/14 blur-md" />
                    <span className={`relative rounded-full bg-[#f5d575] shadow-[0_0_14px_rgba(255,240,184,1)] transition-all duration-300 ${nodeActive ? 'h-3.5 w-3.5' : 'h-3 w-3'}`} />
                  </motion.span>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-y-5 lg:grid-cols-[minmax(0,1fr)_34px_minmax(0,1fr)_34px_minmax(0,1fr)_0.74fr] lg:gap-x-4">
            <WorkflowCard step={workflowSteps[0]} position={0} active={stage === 0} onOpen={() => navigate(workflowSteps[0].route)} />
            <ConnectorArrow delay={0.45} active={stage === 1} />
            <WorkflowCard step={workflowSteps[1]} position={1} active={stage === 1} onOpen={() => navigate(workflowSteps[1].route)} />
            <ConnectorArrow delay={0.57} active={stage === 2} />
            <WorkflowCard step={workflowSteps[2]} position={2} active={stage === 2} onOpen={() => navigate(workflowSteps[2].route)} />
            <LivePreviewCard image={previewImage} active={stage === 3} onOpenVideo={() => navigate('/product/ai-video-generator')} />
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.45, ease: EASE }}
            className="mt-10 flex justify-center"
          >
            <button
              type="button"
              onClick={() => navigate('/explorer')}
              className="group inline-flex items-center justify-center gap-5 rounded-full border border-brand-blue/40 bg-brand-blue/[0.06] px-6 py-3 text-base font-bold text-brand-blue shadow-[0_0_28px_rgba(201,168,76,0.12)] transition duration-300 hover:-translate-y-0.5 hover:border-brand-blue/70 hover:bg-brand-blue/10 hover:shadow-[0_0_38px_rgba(201,168,76,0.2)]"
            >
              {t('landing.showcase.cta')}
              <ArrowRight size={18} className="transition duration-300 group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </section>
    </LazySection>
  );
};

export default CreatorsShowcaseSection;
