import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { GoldButton, OutlineButton, Reveal, SectionHeader } from './shared';

type Flow = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag: string;
  steps: { title: string; desc: string }[];
  cta: string;
  onCta: () => void;
  primary?: boolean;
};

const HowItWorksSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const flows = useMemo<Flow[]>(() => [
    {
      icon: Sparkles,
      tag: t('landing.how.creator_tag'),
      steps: [
        { title: t('landing.how.c1_title'), desc: t('landing.how.c1_desc') },
        { title: t('landing.how.c2_title'), desc: t('landing.how.c2_desc') },
        { title: t('landing.how.c3_title'), desc: t('landing.how.c3_desc') },
      ],
      cta: t('landing.how.creator_cta'),
      onCta: () => navigate('/explorer'),
    },
    {
      icon: Building2,
      tag: t('landing.how.biz_tag'),
      steps: [
        { title: t('landing.how.b1_title'), desc: t('landing.how.b1_desc') },
        { title: t('landing.how.b2_title'), desc: t('landing.how.b2_desc') },
        { title: t('landing.how.b3_title'), desc: t('landing.how.b3_desc') },
      ],
      cta: t('landing.how.biz_cta'),
      onCta: () => navigate('/booking'),
      primary: true,
    },
  ], [t, navigate]);

  return (
    <section className="bg-[#fafbfc] px-5 py-20 md:px-8 lg:px-16">
      <div className="mx-auto max-w-[1300px]">
        <SectionHeader
          label={t('landing.how.label')}
          title={t('landing.how.title')}
          desc={t('landing.how.desc')}
          align="center"
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {flows.map((flow, fi) => (
            <Reveal key={flow.tag} delay={fi * 0.1}>
              <div
                className={`flex h-full flex-col rounded-[24px] border bg-white p-7 ${
                  flow.primary
                    ? 'border-brand-blue/30 shadow-[0_16px_50px_rgba(201,168,76,0.12)]'
                    : 'border-black/[0.06] shadow-[0_10px_40px_rgba(26,35,48,0.05)]'
                }`}
              >
                <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-brand-blue/[0.08] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-blue">
                  <flow.icon size={14} />
                  {flow.tag}
                </div>
                <ol className="flex flex-1 flex-col gap-5">
                  {flow.steps.map((step, si) => (
                    <li key={step.title} className="flex gap-4">
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-blue/10 font-mono text-sm font-bold text-brand-blue">
                        {String(si + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h3 className="text-base font-bold tracking-tight text-[#1a2330]">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-[#1a2330]/60">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-7">
                  {flow.primary ? (
                    <GoldButton onClick={flow.onCta}>{flow.cta} <ArrowRight size={15} /></GoldButton>
                  ) : (
                    <OutlineButton onClick={flow.onCta}>{flow.cta}</OutlineButton>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
