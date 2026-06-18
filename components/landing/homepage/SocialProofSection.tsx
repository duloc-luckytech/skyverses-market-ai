import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, ShieldCheck, Infinity as InfinityIcon, CreditCard } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { EASE, SectionHeader } from './shared';

// Real third-party models Skyverses integrates — truthful borrowed credibility,
// all already referenced in landing copy. Brand names stay in Latin across langs.
const PROVIDERS = [
  'Google Veo',
  'Imagen',
  'FLUX',
  'Stable Diffusion',
  'Sora',
  'Kling',
  'Luma',
  'Minimax',
  'Seedance',
  'Suno',
  'ElevenLabs',
];

const SocialProofSection: React.FC = () => {
  const { t } = useLanguage();

  const trust = [
    { icon: CreditCard, text: t('landing.proof.trust1') },
    { icon: BadgeCheck, text: t('landing.proof.trust2') },
    { icon: ShieldCheck, text: t('landing.proof.trust3') },
    { icon: InfinityIcon, text: t('landing.proof.trust4') },
  ];

  return (
    <section className="relative overflow-hidden bg-[#fafbfc] px-5 py-16 md:px-8 lg:px-16">
      <div className="relative mx-auto max-w-[1300px]">
        <SectionHeader
          label={t('landing.proof.label')}
          title={t('landing.proof.title')}
          desc={t('landing.proof.desc')}
          align="center"
        />

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
          className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2.5"
        >
          {PROVIDERS.map((p) => (
            <motion.li
              key={p}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
              }}
              className="rounded-full border border-black/[0.07] bg-white px-4 py-2 font-mono text-sm font-semibold text-[#1a2330]/65 transition-colors hover:border-brand-blue/40 hover:text-[#1a2330]"
            >
              {p}
            </motion.li>
          ))}
        </motion.ul>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {trust.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a2330]/55"
            >
              <Icon size={16} className="text-brand-blue" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
