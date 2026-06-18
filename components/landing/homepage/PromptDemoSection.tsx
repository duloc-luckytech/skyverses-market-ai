import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, Wand2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { ShowcaseImage } from '../../../src/constants/showcase-cdn';
import { EASE, MotionChip, SectionHeader } from './shared';

type Phase = 'typing' | 'generating' | 'done';

const TYPE_MS = 38;
const GENERATING_MS = 1500;
const DONE_MS = 2400;

/**
 * Live "prompt → result" demo: a terminal types a prompt, runs a fake generation
 * (scanline), then reveals a real showcase image, cycling through a few prompts.
 * Honors prefers-reduced-motion by showing the final state with no cycling.
 */
const PromptDemoSection: React.FC<{ showcaseImages: ShowcaseImage[] }> = ({ showcaseImages }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const prompts = useMemo(
    () => [t('landing.demo.prompt1'), t('landing.demo.prompt2'), t('landing.demo.prompt3')],
    [t],
  );
  const images = useMemo(() => showcaseImages.slice(0, 3).map((it) => it.img), [showcaseImages]);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduceMotion ? 'done' : 'typing');
  const [typed, setTyped] = useState(reduceMotion ? prompts[0] : '');

  const prompt = prompts[idx] || '';
  const image = images.length ? images[idx % images.length] : '';

  // Typing animation for the current prompt.
  useEffect(() => {
    if (reduceMotion) return;
    setTyped('');
    setPhase('typing');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(prompt.slice(0, i));
      if (i >= prompt.length) {
        clearInterval(id);
        setPhase('generating');
      }
    }, TYPE_MS);
    return () => clearInterval(id);
  }, [idx, prompt, reduceMotion]);

  // generating → done → advance to next prompt.
  useEffect(() => {
    if (reduceMotion) return;
    if (phase === 'generating') {
      const id = setTimeout(() => setPhase('done'), GENERATING_MS);
      return () => clearTimeout(id);
    }
    if (phase === 'done') {
      const id = setTimeout(() => setIdx((p) => (p + 1) % Math.max(prompts.length, 1)), DONE_MS);
      return () => clearTimeout(id);
    }
  }, [phase, reduceMotion, prompts.length]);

  const statusLabel = phase === 'generating' ? t('landing.demo.generating') : phase === 'done' ? t('landing.demo.done') : t('landing.demo.generate');

  return (
    <section className="bg-white px-5 py-20 md:px-8 lg:px-16">
      <div className="mx-auto max-w-[1300px]">
        <SectionHeader label={t('landing.demo.label')} title={t('landing.demo.title')} desc={t('landing.demo.desc')} align="center" />
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          <MotionChip name="typewriter" />
          <MotionChip name="image-zoom" />
          <MotionChip name="shimmer" />
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {/* Prompt console */}
          <div className="flex flex-col overflow-hidden rounded-[24px] border border-[#1a2330]/[0.08] bg-[#0d0f16] shadow-[0_24px_70px_rgba(13,15,22,0.25)]">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">prompt.console</span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-blue">$ skyverses generate</span>
              <p className="mt-4 min-h-[84px] font-mono text-sm leading-relaxed text-white/85 md:text-base">
                {typed}
                {!reduceMotion && phase === 'typing' && (
                  <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] bg-brand-blue align-middle motion-safe:animate-[sv-caret_1s_step-end_infinite]" />
                )}
              </p>
              <div className="flex-1" />
              <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white">
                {phase === 'generating' ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Wand2 size={15} />
                )}
                {statusLabel}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="relative overflow-hidden rounded-[24px] border border-[#1a2330]/[0.08] bg-[#0d0b08] shadow-[0_24px_70px_rgba(13,11,8,0.3)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${idx}-${image}`}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="absolute inset-0"
              >
                {image && (
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className={`h-full w-full object-cover transition-all duration-700 ${
                      reduceMotion || phase === 'done' ? 'scale-100 blur-0 opacity-100' : 'scale-105 blur-xl opacity-60'
                    }`}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Scanline while generating */}
            {!reduceMotion && phase === 'generating' && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="h-1/4 w-full bg-gradient-to-b from-transparent via-brand-blue/40 to-transparent motion-safe:animate-[sv-scan_1.6s_linear_infinite]" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

            <AnimatePresence>
              {(reduceMotion || phase === 'done') && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-5"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                    <Sparkles size={12} className="text-brand-blue" />
                    {t('landing.demo.result_tag')}
                  </span>
                  <button
                    onClick={() => navigate('/product/ai-image-generator')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-blueHover"
                  >
                    {t('landing.demo.cta')} <ArrowRight size={13} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromptDemoSection;
