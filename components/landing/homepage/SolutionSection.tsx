import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import LazySection from '../LazySection';
import LazyImage from '../LazyImage';
import { GoldButton, HoverCard, OutlineButton, Reveal, SectionHeader } from './shared';

/**
 * Pillar ① — AI solutions for business (service). Merges the old Business +
 * Enterprise sections. Two directions: integrate AI into existing systems, or
 * build a brand-new AI product A–Z. No on-prem / private-infrastructure claims.
 */
const SolutionSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const cards = useMemo(() => [
    { title: t('landing.solution.card1_title'), image: '/assets/homepage/gold-ent-build-app.webp', bullets: [t('landing.solution.card1_b1'), t('landing.solution.card1_b2'), t('landing.solution.card1_b3')] },
    { title: t('landing.solution.card2_title'), image: '/assets/homepage/gold-ent-deploy.webp', bullets: [t('landing.solution.card2_b1'), t('landing.solution.card2_b2'), t('landing.solution.card2_b3')] },
    { title: t('landing.solution.card3_title'), image: '/assets/homepage/gold-ent-maintain.webp', bullets: [t('landing.solution.card3_b1'), t('landing.solution.card3_b2'), t('landing.solution.card3_b3')] },
    { title: t('landing.solution.card4_title'), image: '/assets/homepage/gold-ent-consult.webp', bullets: [t('landing.solution.card4_b1'), t('landing.solution.card4_b2'), t('landing.solution.card4_b3')] },
  ], [t]);

  return (
    <LazySection rootMargin="300px" minHeight={700}>
      <section className="bg-white px-5 py-20 md:px-8 lg:px-16">
        <div className="mx-auto max-w-[1300px]">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader label={t('landing.solution.label')} title={t('landing.solution.title')} desc={t('landing.solution.desc')} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <GoldButton onClick={() => navigate('/booking')}>{t('landing.solution.cta1')}</GoldButton>
              <OutlineButton onClick={() => navigate('/about')}>{t('landing.solution.cta2')}</OutlineButton>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card, index) => (
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

export default SolutionSection;
