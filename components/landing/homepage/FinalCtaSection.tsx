import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { GoldButton, OutlineButton, Reveal } from './shared';

const FinalCtaSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#1a2330] px-5 py-20 text-center md:px-8 lg:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(201,168,76,0.16),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(201,168,76,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-blue/10 to-transparent motion-safe:animate-[sv-shimmer_5s_linear_infinite]" />
      <Reveal className="relative mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{t('landing.cta.heading')}</h2>
        <p className="mt-4 text-sm text-white/55 md:text-base">{t('landing.cta.sub')}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <GoldButton onClick={() => navigate('/markets')}>{t('landing.cta.button')} <ArrowRight size={15} /></GoldButton>
          <OutlineButton dark onClick={() => navigate('/booking')}>{t('landing.cta.secondary')}</OutlineButton>
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
          Pay-as-you-go · No international card · Deploy on your own infrastructure
        </p>
      </Reveal>
    </section>
  );
};

export default FinalCtaSection;
