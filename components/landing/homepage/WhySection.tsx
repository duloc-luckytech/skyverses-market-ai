import React, { useMemo } from 'react';
import { CreditCard, Server, Sparkles, WalletCards } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { AnimatedStat, DrawIcon, HoverCard, Reveal, SectionHeader } from './shared';

const WhySection: React.FC = () => {
  const { t } = useLanguage();

  const whyTiles = useMemo(() => [
    { icon: Sparkles, title: t('landing.why.f1_title'), desc: t('landing.why.f1_desc'), stat: '50+' },
    { icon: CreditCard, title: t('landing.why.f2_title'), desc: t('landing.why.f2_desc'), stat: 'PAYG' },
    { icon: Server, title: t('landing.why.f3_title'), desc: t('landing.why.f3_desc'), stat: 'Infra' },
    { icon: WalletCards, title: t('landing.why.f4_title'), desc: t('landing.why.f4_desc'), stat: 'Local' },
  ], [t]);

  return (
    <section className="bg-[#fafbfc] px-5 py-20 md:px-8 lg:px-16">
      <div className="mx-auto max-w-[1300px]">
        <SectionHeader title={t('landing.why.title')} desc={t('landing.why.desc')} align="center" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyTiles.map((tile, index) => (
            <Reveal key={tile.title} delay={index * 0.06}>
              <HoverCard className="h-full p-5 text-center">
                <DrawIcon icon={tile.icon} className="mx-auto" />
                <AnimatedStat value={tile.stat} className="mt-5 block text-2xl font-black text-brand-blue" />
                <h3 className="mt-2 text-base font-bold text-[#1a2330]">{tile.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#1a2330]/60">{tile.desc}</p>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySection;
