import React from 'react';
import { motion } from 'framer-motion';
import { Apple, Globe, Laptop, Monitor, Smartphone } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { EASE } from './shared';

const OS_LIST = [
  { label: 'iOS', icon: Apple },
  { label: 'Android', icon: Smartphone },
  { label: 'Windows', icon: Monitor },
  { label: 'macOS', icon: Laptop },
  { label: 'Web', icon: Globe },
];

/** "Ship everywhere" OS chips with a draw-line connector and staggered fan-out. */
const OsStripSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="overflow-hidden bg-white px-5 py-14 md:px-8 lg:px-16">
      <div className="mx-auto max-w-[1100px] text-center">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-blue">{t('landing.os.label')}</span>

        <div className="relative mt-8">
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: EASE }}
            style={{ transformOrigin: 'left' }}
            className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-brand-blue/40 to-transparent md:block"
          />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } } }}
            className="relative flex flex-wrap items-center justify-center gap-3 md:gap-4"
          >
            {OS_LIST.map((os) => {
              const OsIcon = os.icon;
              return (
                <motion.div
                  key={os.label}
                  variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }}
                  className="group inline-flex items-center gap-2.5 rounded-full border border-brand-blue/15 bg-[#fafbfc] px-5 py-3 shadow-[0_8px_28px_rgba(26,35,48,0.05)] transition hover:-translate-y-0.5 hover:border-brand-blue/40"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue transition group-hover:scale-110">
                    <OsIcon size={18} />
                  </span>
                  <span className="text-sm font-bold tracking-tight text-[#1a2330]">{os.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OsStripSection;
