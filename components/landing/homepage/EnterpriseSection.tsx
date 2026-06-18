import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import LazySection from '../LazySection';
import LazyImage from '../LazyImage';
import { GoldButton, HoverCard, OutlineButton, Reveal, SectionHeader } from './shared';

const EnterpriseSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const enterpriseCards = useMemo(() => [
    { title: t('landing.ent.card1_title'), image: '/assets/homepage/gold-ent-build-app.webp', bullets: [t('landing.ent.card1_b1'), t('landing.ent.card1_b2'), t('landing.ent.card1_b3')] },
    { title: t('landing.ent.card2_title'), image: '/assets/homepage/gold-ent-deploy.webp', bullets: [t('landing.ent.card2_b1'), t('landing.ent.card2_b2'), t('landing.ent.card2_b3')] },
    { title: t('landing.ent.card3_title'), image: '/assets/homepage/gold-ent-maintain.webp', bullets: [t('landing.ent.card3_b1'), t('landing.ent.card3_b2'), t('landing.ent.card3_b3')] },
    { title: t('landing.ent.card4_title'), image: '/assets/homepage/gold-ent-consult.webp', bullets: [t('landing.ent.card4_b1'), t('landing.ent.card4_b2'), t('landing.ent.card4_b3')] },
  ], [t]);

  return (
    <LazySection rootMargin="300px" minHeight={700}>
      <section className="bg-white px-5 py-20 md:px-8 lg:px-16">
        <div className="mx-auto max-w-[1300px]">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader label={t('landing.ent.label')} title={t('landing.ent.title')} desc={t('landing.ent.desc')} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <GoldButton onClick={() => navigate('/booking')}>{t('landing.ent.cta1')}</GoldButton>
              <OutlineButton onClick={() => navigate('/about')}>{t('landing.ent.cta2')}</OutlineButton>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {enterpriseCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 0.06}>
                <HoverCard className="h-full overflow-hidden p-5">
                  <LazyImage src={card.image} alt={card.title} className="aspect-[16/9] rounded-xl bg-[#fafbfc]" />
                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#1a2330]">{card.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {card.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm font-semibold leading-relaxed text-[#1a2330]/70">
                        <Check size={16} className="mt-0.5 shrink-0 text-brand-blue" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </HoverCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </LazySection>
  );
};

export default EnterpriseSection;
