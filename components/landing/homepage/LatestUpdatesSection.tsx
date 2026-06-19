import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, Clock3, Sparkles } from 'lucide-react';
import LazyImage from '../LazyImage';
import LazySection from '../LazySection';
import { useLanguage } from '../../../context/LanguageContext';
import { EASE } from './shared';

type BlogCard = {
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
};

const blogCards: BlogCard[] = [
  {
    title: 'landing.updates.b1_t',
    category: 'Business',
    date: '18 Jun 2026',
    readTime: 'landing.updates.b1_rt',
    image: '/assets/homepage/ent-api-integration.webp',
  },
  {
    title: 'landing.updates.b2_t',
    category: 'Creator',
    date: '16 Jun 2026',
    readTime: 'landing.updates.b2_rt',
    image: '/assets/homepage/gold-build-video-gen.webp',
  },
  {
    title: 'landing.updates.b3_t',
    category: 'App & Game',
    date: '14 Jun 2026',
    readTime: 'landing.updates.b3_rt',
    image: '/assets/showcase/bp-malachar-arena.webp',
  },
  {
    title: 'landing.updates.b4_t',
    category: 'Guide',
    date: '12 Jun 2026',
    readTime: 'landing.updates.b4_rt',
    image: '/assets/homepage/gold-create-creators.webp',
  },
  {
    title: 'landing.updates.b5_t',
    category: 'Models',
    date: '10 Jun 2026',
    readTime: 'landing.updates.b5_rt',
    image: '/assets/homepage/gold-feature-latest-models.webp',
  },
];

const LatestUpdatesSection: React.FC = () => {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  return (
    <LazySection rootMargin="260px" minHeight={520}>
      <section className="relative overflow-hidden bg-[#05070a] px-5 py-16 text-white md:px-8 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(201,168,76,0.10),transparent_28%),radial-gradient(circle_at_82%_30%,rgba(43,130,255,0.08),transparent_24%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-40 bg-gradient-to-l from-[#05070a] to-transparent lg:block" />

        <div className="relative mx-auto max-w-[1480px]">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: EASE }}
              className="max-w-2xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <Sparkles size={17} className="text-brand-blue" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-brand-blue">
                  Latest updates
                </span>
              </div>
              <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">{t('landing.updates.title')}</h2>
              <p className="mt-3 text-base leading-relaxed text-white/62">
                {t('landing.updates.subtitle')}
              </p>
            </motion.div>

            <motion.a
              href="/blog"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
              className="group inline-flex w-fit items-center gap-3 rounded-xl border border-[#3a2f17] bg-white/[0.035] px-5 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:border-brand-blue/60 hover:bg-brand-blue/[0.08]"
            >
              {t('landing.updates.view_all')}
              <ArrowRight size={17} className="transition duration-300 group-hover:translate-x-1" />
            </motion.a>
          </div>

          <div className="-mx-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:-mx-8 md:px-8 lg:-mx-16 lg:px-16 [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-4">
              {blogCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.98 }}
                  whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: 0.08 + index * 0.07, ease: EASE }}
                  className="group w-[285px] shrink-0 [perspective:1000px] sm:w-[320px]"
                >
                  <div className="h-full overflow-hidden rounded-xl border border-[#302816] bg-[#071018]/82 shadow-[0_20px_60px_rgba(0,0,0,0.26)] transition duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateX(3deg)_rotateY(-4deg)_translateY(-8px)] group-hover:border-brand-blue/55 group-hover:shadow-[0_24px_72px_rgba(201,168,76,0.16)]">
                    <div className="relative overflow-hidden">
                      <LazyImage src={card.image} alt={t(card.title)} className="aspect-[16/10] transition duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-transparent to-black/8" />
                      <span className="absolute left-4 top-4 rounded-full border border-brand-blue/30 bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-blue backdrop-blur-md">
                        {card.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="min-h-[56px] text-xl font-bold leading-tight tracking-tight text-white">{t(card.title)}</h3>
                      <div className="mt-5 flex items-center justify-between gap-3 text-xs font-semibold text-white/48">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-brand-blue" />
                          {card.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} className="text-brand-blue" />
                          {t(card.readTime)}
                        </span>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-[#302816] pt-4">
                        <span className="text-sm font-bold text-white/74">{t('landing.updates.read')}</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/[0.10] text-brand-blue transition duration-300 group-hover:translate-x-1 group-hover:bg-brand-blue group-hover:text-[#05070a]">
                          <ArrowRight size={17} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LazySection>
  );
};

export default LatestUpdatesSection;
