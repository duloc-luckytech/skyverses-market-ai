import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgePercent, Sparkles, Users } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { AnimatedStat, DrawIcon, GoldButton, HoverCard, OutlineButton, Reveal, SectionHeader } from './shared';

const BusinessSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const businessTiles = useMemo(() => [
    { icon: Sparkles, title: t('landing.teams.fresh_title'), desc: t('landing.teams.fresh_b1'), stat: '50+' },
    { icon: Users, title: t('landing.teams.ready_title'), desc: t('landing.teams.ready_b1'), stat: 'Roles' },
    { icon: BadgePercent, title: t('landing.teams.vol_title'), desc: t('landing.teams.vol_desc'), stat: '~70%' },
  ], [t]);

  return (
    <section className="bg-[#fafbfc] px-5 py-20 md:px-8 lg:px-16">
      <div className="mx-auto grid max-w-[1300px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionHeader label={t('landing.teams.label')} title={t('landing.teams.title')} desc={t('landing.teams.desc')} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <GoldButton onClick={() => navigate('/booking')}>{t('landing.teams.contact')}</GoldButton>
            <OutlineButton onClick={() => navigate('/about')}>{t('landing.teams.learn')}</OutlineButton>
          </div>
        </div>
        <div className="grid gap-4">
          {businessTiles.map((tile, index) => (
            <Reveal key={tile.title} delay={index * 0.08}>
              <HoverCard className="flex gap-5 p-5">
                <DrawIcon icon={tile.icon} />
                <div>
                  <AnimatedStat value={tile.stat} className="text-2xl font-black text-brand-blue" />
                  <h3 className="mt-1 text-lg font-bold text-[#1a2330]">{tile.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#1a2330]/60">{tile.desc}</p>
                </div>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessSection;
