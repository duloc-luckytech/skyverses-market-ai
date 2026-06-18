import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgePercent, Check, Layers3, Rocket } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { CostDrop, DrawIcon, GoldButton, HoverCard, MotionChip, Reveal, SectionHeader } from './shared';

const BuildAppsSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const buildCards = useMemo(() => [
    { icon: Rocket, title: t('landing.buildapps.f1_title'), desc: t('landing.buildapps.f1_desc'), stat: t('landing.buildapps.f1_stat') },
    { icon: BadgePercent, title: t('landing.buildapps.f2_title'), desc: t('landing.buildapps.f2_desc'), stat: t('landing.buildapps.f2_stat') },
    { icon: Layers3, title: t('landing.buildapps.f3_title'), desc: t('landing.buildapps.f3_desc'), stat: t('landing.buildapps.f3_stat') },
  ], [t]);

  const publishItems = useMemo(() => [
    t('landing.buildapps.publish1'),
    t('landing.buildapps.publish2'),
    t('landing.buildapps.publish3'),
    t('landing.buildapps.publish4'),
  ], [t]);

  return (
    <section className="bg-[#fafbfc] px-5 py-20 md:px-8 lg:px-16">
      <div className="mx-auto max-w-[1300px]">
        <SectionHeader label={t('landing.buildapps.label')} title={t('landing.buildapps.title')} desc={t('landing.buildapps.desc')} />
        <div className="mb-5 flex flex-wrap gap-2">
          <MotionChip name="draw-line" />
          <MotionChip name="count-up" />
          <MotionChip name="cost-drop" />
          <MotionChip name="os-fanout" />
          <MotionChip name="shimmer" />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {buildCards.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.08}>
              <HoverCard className="h-full p-6">
                <DrawIcon icon={card.icon} />
                <h3 className="mt-5 text-xl font-bold tracking-tight text-[#1a2330]">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#1a2330]/60">{card.desc}</p>
                <div className="mt-5 inline-flex rounded-full bg-brand-blue/[0.08] px-4 py-2 text-sm font-bold text-brand-blue">{card.stat}</div>
              </HoverCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-6">
          <div className="flex flex-col gap-6 rounded-[24px] border border-brand-blue/20 bg-white p-7 shadow-[0_16px_50px_rgba(201,168,76,0.1)] md:flex-row md:items-center md:justify-between">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-blue">{t('landing.buildapps.cost_label')}</span>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#1a2330]/60">{t('landing.buildapps.cost_desc')}</p>
            </div>
            <CostDrop
              oldValue={t('landing.buildapps.cost_old')}
              newValue={t('landing.buildapps.cost_new')}
              saveLabel={t('landing.buildapps.cost_save')}
            />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-6">
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-7 shadow-[0_10px_40px_rgba(26,35,48,0.05)]">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-blue">{t('landing.buildapps.publish_label')}</span>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-[#1a2330]">{t('landing.buildapps.publish_title')}</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {publishItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed text-[#1a2330]/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal className="mt-10 text-center">
          <GoldButton onClick={() => navigate('/booking')}>{t('landing.buildapps.cta')} <ArrowRight size={15} /></GoldButton>
        </Reveal>
      </div>
    </section>
  );
};

export default BuildAppsSection;
