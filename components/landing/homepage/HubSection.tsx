import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Boxes, Rocket, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { EASE, DrawIcon, SectionHeader } from './shared';

const HubSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const pillars = useMemo(() => [
    {
      icon: Boxes,
      label: t('landing.hub.biz_label'),
      title: t('landing.hub.biz_title'),
      desc: t('landing.hub.biz_desc'),
      chips: [
        { label: t('landing.hub.biz_link1'), to: '/product/poster-marketing-ai' },
        { label: t('landing.hub.biz_link2'), to: '/product/paperclip-ai-agents' },
        { label: t('landing.hub.biz_link3'), to: '/solutions' },
      ],
      cta: t('landing.hub.biz_cta'),
      ctaTo: '/booking',
      featured: true,
    },
    {
      icon: Sparkles,
      label: t('landing.hub.creators_label'),
      title: t('landing.hub.creators_title'),
      desc: t('landing.hub.creators_desc'),
      chips: [
        { label: t('landing.hub.creators_link1'), to: '/product/ai-image-generator' },
        { label: t('landing.hub.creators_link2'), to: '/product/ai-video-generator' },
        { label: t('landing.hub.creators_link3'), to: '/product/ai-music-generator' },
        { label: t('landing.hub.creators_link4'), to: '/product/text-to-speech' },
      ],
      cta: t('landing.hub.creators_cta'),
      ctaTo: '/explorer',
      featured: false,
    },
    {
      icon: Rocket,
      label: t('landing.hub.apps_label'),
      title: t('landing.hub.apps_title'),
      desc: t('landing.hub.apps_desc'),
      chips: [
        { label: t('landing.hub.apps_link1'), to: '/booking' },
        { label: t('landing.hub.apps_link2'), to: '/product/nocode-export' },
        { label: t('landing.hub.apps_link3'), to: '/solutions' },
      ],
      cta: t('landing.hub.apps_cta'),
      ctaTo: '/booking',
      featured: false,
    },
  ], [t]);

  return (
    <section className="bg-white px-5 py-20 md:px-8 lg:px-16">
      <div className="mx-auto max-w-[1300px]">
        <SectionHeader label={t('landing.hub.label')} title={t('landing.hub.title')} desc={t('landing.hub.desc')} align="center" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {pillars.map((pillar) => {
            const PillarIcon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
                className={`flex h-full flex-col rounded-[28px] border p-7 transition hover:-translate-y-1 ${
                  pillar.featured
                    ? 'border-brand-blue/40 bg-white shadow-[0_20px_60px_rgba(201,168,76,0.14)] ring-1 ring-brand-blue/20'
                    : 'border-black/[0.06] bg-white shadow-[0_10px_40px_rgba(26,35,48,0.05)] hover:border-brand-blue/30 hover:shadow-[0_16px_50px_rgba(201,168,76,0.12)]'
                }`}
              >
                <DrawIcon icon={PillarIcon} />
                <span className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-blue">{pillar.label}</span>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-[#1a2330]">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#1a2330]/60">{pillar.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {pillar.chips.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => navigate(chip.to)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-[#fafbfc] px-3 py-1.5 text-xs font-semibold text-[#1a2330]/75 transition hover:border-brand-blue/40 hover:bg-brand-blue/[0.06] hover:text-brand-blue"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1" />
                <button
                  onClick={() => navigate(pillar.ctaTo)}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-blue transition-all hover:gap-3"
                >
                  {pillar.cta} <ArrowRight size={15} />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HubSection;
