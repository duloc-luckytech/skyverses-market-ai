import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { AnimatedStat, EASE, MotionChip } from './shared';

/** Animated headline metrics band on a dark surface. */
const StatsBandSection: React.FC = () => {
  const { t } = useLanguage();

  const stats = useMemo(() => [
    { value: t('landing.stats.s1_value'), label: t('landing.stats.s1_label') },
    { value: t('landing.stats.s2_value'), label: t('landing.stats.s2_label') },
    { value: t('landing.stats.s3_value'), label: t('landing.stats.s3_label') },
    { value: t('landing.stats.s4_value'), label: t('landing.stats.s4_label') },
  ], [t]);

  return (
    <section className="relative overflow-hidden bg-[#1a2330] px-5 py-16 md:px-8 lg:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(201,168,76,0.12),transparent_55%),radial-gradient(circle_at_85%_70%,rgba(201,168,76,0.1),transparent_50%)]" />
      <div className="relative mx-auto max-w-[1300px]">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-blue">{t('landing.stats.label')}</span>
          <h2 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl">{t('landing.stats.title')}</h2>
          <MotionChip name="count-up" />
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center transition hover:border-brand-blue/40 hover:bg-white/[0.05]"
            >
              <AnimatedStat value={stat.value} className="text-4xl font-black tracking-tight text-brand-blue md:text-5xl" />
              <p className="mt-3 text-sm font-semibold leading-relaxed text-white/60">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsBandSection;
