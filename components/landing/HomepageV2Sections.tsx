import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Apple,
  ArrowRight,
  BadgePercent,
  Boxes,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  CreditCard,
  FileText,
  Globe,
  Image as ImageIcon,
  Laptop,
  Layers3,
  Megaphone,
  Monitor,
  Play,
  Rocket,
  Server,
  Smartphone,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { HomeBlock, Language, Solution } from '../../types';
import { CardSkeleton } from '../market/MarketSkeleton';
import { SolutionCard } from '../market/SolutionCard';
import LazySection from './LazySection';
import LazyImage from './LazyImage';
import type { ShowcaseImage, ShowcaseVideo } from '../../src/constants/showcase-cdn';

type HomepageV2SectionsProps = {
  solutions: Solution[];
  homeBlocks: HomeBlock[];
  loading: boolean;
  favorites: string[];
  likedItems: string[];
  showcaseImages: ShowcaseImage[];
  showcaseVideos: ShowcaseVideo[];
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onNavigateProduct: (slug: string) => void;
  onHoverProduct: (slug: string) => void;
  onQuickView: (e: React.MouseEvent, sol: Solution) => void;
  getStats: (id: string) => { users: string; likes: string };
};

type MotionName =
  | 'fade-up'
  | 'stagger-children'
  | 'hover-lift'
  | 'image-zoom'
  | 'draw-line'
  | 'count-up'
  | 'cost-drop'
  | 'os-fanout'
  | 'shimmer';

const EASE = [0.22, 1, 0.36, 1] as const;

const motionText: Record<MotionName, string> = {
  'fade-up': 'fade-up',
  'stagger-children': 'stagger-children',
  'hover-lift': 'hover-lift',
  'image-zoom': 'image-zoom',
  'draw-line': 'draw-line',
  'count-up': 'count-up',
  'cost-drop': 'cost-drop',
  'os-fanout': 'OS-fanout',
  shimmer: 'shimmer',
};

const MotionChip: React.FC<{ name: MotionName }> = ({ name }) => (
  <span className="inline-flex items-center rounded-full border border-brand-blue/20 bg-brand-blue/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-blue">
    {motionText[name]}
  </span>
);

const SectionHeader: React.FC<{
  label?: string;
  title: string;
  desc?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}> = ({ label, title, desc, align = 'left', dark = false }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE }}
      className={`mb-10 flex max-w-3xl flex-col gap-4 ${align === 'center' ? 'mx-auto items-center text-center' : 'items-start'}`}
    >
      {label && (
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-blue">
          {label}
        </span>
      )}
      <h2 className={`text-3xl font-bold leading-tight tracking-tight md:text-4xl ${dark ? 'text-white' : 'text-[#1a2330]'}`}>
        {title}
      </h2>
      {desc && (
        <p className={`text-sm leading-relaxed md:text-base ${dark ? 'text-white/55' : 'text-[#1a2330]/60'}`}>
          {desc}
        </p>
      )}
    </motion.div>
  );
};

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const GoldButton: React.FC<{ children: React.ReactNode; onClick: () => void; className?: string }> = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-blue px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-blue/25 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-blueHover hover:shadow-xl hover:shadow-brand-blue/30 ${className}`}
  >
    <span className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent motion-safe:animate-[sv-shimmer_2.8s_linear_infinite]" />
    <span className="relative inline-flex items-center gap-2">
      {children}
    </span>
  </button>
);

const OutlineButton: React.FC<{ children: React.ReactNode; onClick: () => void; dark?: boolean }> = ({ children, onClick, dark = false }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition duration-200 hover:-translate-y-0.5 ${
      dark
        ? 'border-white/20 text-white hover:border-white/40 hover:bg-white/[0.06]'
        : 'border-[#1a2330]/20 text-[#1a2330] hover:border-[#1a2330]/50 hover:bg-[#1a2330]/[0.04]'
    }`}
  >
    {children}
  </button>
);

const DrawIcon: React.FC<{ icon: React.ComponentType<{ size?: number; className?: string }>; className?: string }> = ({ icon: Icon, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, ease: EASE }}
    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ${className}`}
  >
    <Icon size={23} className="motion-safe:animate-[sv-icon-pulse_3s_ease-in-out_infinite]" />
  </motion.div>
);

const HoverCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2, ease: EASE }}
    className={`rounded-2xl border border-black/[0.06] bg-white shadow-[0_10px_40px_rgba(26,35,48,0.05)] transition-colors hover:border-brand-blue/35 hover:shadow-[0_16px_50px_rgba(201,168,76,0.14)] ${className}`}
  >
    {children}
  </motion.div>
);

const HomepageV2Sections: React.FC<HomepageV2SectionsProps> = ({
  solutions,
  homeBlocks,
  loading,
  favorites,
  likedItems,
  showcaseImages,
  showcaseVideos,
  onToggleFavorite,
  onToggleLike,
  onNavigateProduct,
  onHoverProduct,
  onQuickView,
  getStats,
}) => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const currentLang = lang as Language;

  const tools = useMemo(() => [
    { title: t('landing.tools.card1_title'), desc: t('landing.tools.card1_desc'), img: '/assets/homepage/gold-tools-script.webp', icon: FileText, to: '/solutions' },
    { title: t('landing.tools.card2_title'), desc: t('landing.tools.card2_desc'), img: '/assets/homepage/gold-tools-image.webp', icon: ImageIcon, to: '/solutions' },
    { title: t('landing.tools.card3_title'), desc: t('landing.tools.card3_desc'), img: '/assets/homepage/gold-tools-video.webp', icon: Play, to: '/solutions' },
    { title: t('landing.tools.card4_title'), desc: t('landing.tools.card4_desc'), img: '/assets/homepage/gold-tools-marketing.webp', icon: Megaphone, to: '/solutions' },
    { title: t('landing.tools.card5_title'), desc: t('landing.tools.card5_desc'), img: null, icon: Boxes, to: '/booking' },
    { title: t('landing.tools.card6_title'), desc: t('landing.tools.card6_desc'), img: null, icon: Code2, to: '/booking' },
  ], [t]);

  const buildCards = useMemo(() => [
    { icon: Rocket, title: t('landing.buildapps.f1_title'), desc: t('landing.buildapps.f1_desc'), stat: t('landing.buildapps.f1_stat') },
    { icon: BadgePercent, title: t('landing.buildapps.f2_title'), desc: t('landing.buildapps.f2_desc'), stat: t('landing.buildapps.f2_stat') },
    { icon: Layers3, title: t('landing.buildapps.f3_title'), desc: t('landing.buildapps.f3_desc'), stat: t('landing.buildapps.f3_stat') },
  ], [t]);

  const businessTiles = useMemo(() => [
    { icon: Sparkles, title: t('landing.teams.fresh_title'), desc: t('landing.teams.fresh_b1'), stat: '50+' },
    { icon: Users, title: t('landing.teams.ready_title'), desc: t('landing.teams.ready_b1'), stat: 'Roles' },
    { icon: BadgePercent, title: t('landing.teams.vol_title'), desc: t('landing.teams.vol_desc'), stat: '~70%' },
  ], [t]);

  const enterpriseCards = useMemo(() => [
    { title: t('landing.ent.card1_title'), image: '/assets/homepage/gold-ent-build-app.webp', bullets: [t('landing.ent.card1_b1'), t('landing.ent.card1_b2'), t('landing.ent.card1_b3')] },
    { title: t('landing.ent.card2_title'), image: '/assets/homepage/gold-ent-deploy.webp', bullets: [t('landing.ent.card2_b1'), t('landing.ent.card2_b2'), t('landing.ent.card2_b3')] },
    { title: t('landing.ent.card3_title'), image: '/assets/homepage/gold-ent-maintain.webp', bullets: [t('landing.ent.card3_b1'), t('landing.ent.card3_b2'), t('landing.ent.card3_b3')] },
    { title: t('landing.ent.card4_title'), image: '/assets/homepage/gold-ent-consult.webp', bullets: [t('landing.ent.card4_b1'), t('landing.ent.card4_b2'), t('landing.ent.card4_b3')] },
  ], [t]);

  const whyTiles = useMemo(() => [
    { icon: Sparkles, title: t('landing.why.f1_title'), desc: t('landing.why.f1_desc'), stat: '50+' },
    { icon: CreditCard, title: t('landing.why.f2_title'), desc: t('landing.why.f2_desc'), stat: 'PAYG' },
    { icon: Server, title: t('landing.why.f3_title'), desc: t('landing.why.f3_desc'), stat: 'Infra' },
    { icon: WalletCards, title: t('landing.why.f4_title'), desc: t('landing.why.f4_desc'), stat: 'Local' },
  ], [t]);

  return (
    <>
      <style>{`
        @keyframes sv-shimmer { 0% { transform: translateX(-120%) skewX(-12deg); } 100% { transform: translateX(360%) skewX(-12deg); } }
        @keyframes sv-icon-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: .78; } }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-\\[sv-shimmer_2\\.8s_linear_infinite\\],
          .motion-safe\\:animate-\\[sv-icon-pulse_3s_ease-in-out_infinite\\] { animation: none !important; }
        }
      `}</style>

      <section className="bg-white px-5 py-20 md:px-8 lg:px-16">
        <div className="mx-auto max-w-[1300px]">
          <SectionHeader label={t('landing.tools.label')} title={t('landing.tools.title')} desc={t('landing.tools.desc')} />
          <div className="mb-5 flex flex-wrap gap-2">
            <MotionChip name="fade-up" />
            <MotionChip name="stagger-children" />
            <MotionChip name="hover-lift" />
            <MotionChip name="image-zoom" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
            <Reveal>
              <motion.button
                onClick={() => navigate('/solutions')}
                whileHover={{ y: -4 }}
                className="group flex h-full min-h-[520px] w-full flex-col overflow-hidden rounded-2xl bg-[#0a0f1a] text-left shadow-[0_24px_80px_rgba(10,15,26,0.18)]"
              >
                <div className="relative flex-1 overflow-hidden">
                  <img src="/assets/homepage/gold-tools-hero.webp" alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent" />
                </div>
                <div className="p-7">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-blue">{t('landing.tools.featured_badge')}</span>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">{t('landing.tools.featured_title')}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{t('landing.tools.featured_desc')}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-blue">
                    {t('landing.tools.featured_cta')} <ArrowRight size={15} />
                  </span>
                </div>
              </motion.button>
            </Reveal>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {tools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <motion.button
                    key={tool.title}
                    variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
                    onClick={() => navigate(tool.to)}
                    className="group overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-left shadow-[0_10px_36px_rgba(26,35,48,0.05)] transition hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_16px_50px_rgba(201,168,76,0.12)]"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-[#1a2330]">
                      {tool.img ? (
                        <img src={tool.img} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a2330] via-[#222c3c] to-[#0a0f1a]">
                          <ToolIcon size={42} className="text-brand-blue/80 transition duration-500 group-hover:scale-110" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <DrawIcon icon={tool.icon} className="mb-4 h-10 w-10 rounded-xl" />
                      <h3 className="text-base font-bold tracking-tight text-[#1a2330]">{tool.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#1a2330]/55">{tool.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <LazySection rootMargin="300px" minHeight={640} className="bg-[#0d0b08]">
        <section className="px-5 py-20 md:px-8 lg:px-16">
          <div className="mx-auto max-w-[1300px]">
            <SectionHeader label={t('landing.showcase.label')} title={t('landing.showcase.title')} desc={t('landing.showcase.desc')} dark />
            <div className="mb-5 flex flex-wrap gap-2">
              <MotionChip name="stagger-children" />
              <MotionChip name="hover-lift" />
              <MotionChip name="image-zoom" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <CreatorShowcasePanel
                title={t('landing.showcase.image_title')}
                cta={t('landing.showcase.image_cta')}
                items={showcaseImages.slice(0, 8)}
                type="image"
                onCta={() => navigate('/product/ai-image-generator')}
              />
              <CreatorShowcasePanel
                title={t('landing.showcase.video_title')}
                cta={t('landing.showcase.video_cta')}
                items={showcaseVideos.slice(0, 8)}
                type="video"
                onCta={() => navigate('/product/ai-video-generator')}
              />
            </div>
            <button onClick={() => navigate('/explorer')} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:gap-3">
              {t('landing.showcase.full_gallery')} <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </LazySection>

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
          <Reveal className="mt-10 text-center">
            <GoldButton onClick={() => navigate('/booking')}>{t('landing.buildapps.cta')} <ArrowRight size={15} /></GoldButton>
          </Reveal>
        </div>
      </section>

      <section className="overflow-hidden bg-white px-5 py-14 md:px-8 lg:px-16">
        <div className="mx-auto max-w-[1100px] text-center">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-blue">{t('landing.os.label')}</span>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4"
          >
            {[
              { label: 'iOS', icon: Apple },
              { label: 'Android', icon: Smartphone },
              { label: 'Windows', icon: Monitor },
              { label: 'macOS', icon: Laptop },
              { label: 'Web', icon: Globe },
            ].map((os) => {
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
      </section>

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
                    <div className="text-2xl font-black text-brand-blue">{tile.stat}</div>
                    <h3 className="mt-1 text-lg font-bold text-[#1a2330]">{tile.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#1a2330]/60">{tile.desc}</p>
                  </div>
                </HoverCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

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

      <section className="bg-[#fafbfc] px-5 py-20 md:px-8 lg:px-16">
        <div className="mx-auto max-w-[1300px]">
          <SectionHeader title={t('landing.why.title')} desc={t('landing.why.desc')} align="center" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyTiles.map((tile, index) => (
              <Reveal key={tile.title} delay={index * 0.06}>
                <HoverCard className="h-full p-5 text-center">
                  <DrawIcon icon={tile.icon} className="mx-auto" />
                  <div className="mt-5 text-2xl font-black text-brand-blue">{tile.stat}</div>
                  <h3 className="mt-2 text-base font-bold text-[#1a2330]">{tile.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#1a2330]/60">{tile.desc}</p>
                </HoverCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <LazySection rootMargin="300px" minHeight={420}>
        <section className="bg-white px-5 py-16 md:px-8 lg:px-16">
          <div className="mx-auto max-w-[1300px]">
            <div className="mb-5 flex flex-wrap gap-2">
              <MotionChip name="hover-lift" />
              <MotionChip name="stagger-children" />
            </div>
            {homeBlocks.map((block, blockIdx) => {
              const blockSols = solutions.filter((solution) => solution.homeBlocks?.includes(block.key));
              if (blockSols.length === 0 && !loading) return null;
              return (
                <div key={block.key} className={blockIdx > 0 ? 'mt-14' : ''}>
                  <div className="mb-7 flex items-end justify-between gap-5">
                    <div>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-blue">CMS HomeBlock</span>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#1a2330] md:text-3xl">
                        {block.title?.[currentLang] || block.title?.en}
                      </h3>
                      {block.subtitle && (
                        <p className="mt-2 text-sm text-[#1a2330]/55 md:text-base">{block.subtitle[currentLang] || block.subtitle.en}</p>
                      )}
                    </div>
                    <div className="hidden items-center gap-2 md:flex">
                      <button className="rounded-full border border-black/10 p-2 text-[#1a2330]/60"><ChevronLeft size={16} /></button>
                      <button className="rounded-full border border-black/10 p-2 text-[#1a2330]/60"><ChevronRight size={16} /></button>
                      <button onClick={() => navigate('/markets')} className="ml-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:gap-2.5">
                        View All <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
                    {loading
                      ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                      : blockSols.slice(0, block.limit || 8).map((sol, idx) => (
                        <SolutionCard
                          key={sol._id || sol.id}
                          sol={sol}
                          idx={idx}
                          lang={lang}
                          isLiked={likedItems.includes(sol._id || sol.id)}
                          isFavorited={favorites.includes(sol._id || sol.id)}
                          onToggleFavorite={onToggleFavorite}
                          onToggleLike={onToggleLike}
                          onClick={onNavigateProduct}
                          onHover={onHoverProduct}
                          onQuickView={onQuickView}
                          stats={getStats(sol._id || sol.id)}
                        />
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </LazySection>

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
    </>
  );
};

const CreatorShowcasePanel: React.FC<{
  title: string;
  cta: string;
  items: Array<ShowcaseImage | ShowcaseVideo>;
  type: 'image' | 'video';
  onCta: () => void;
}> = ({ title, cta, items, type, onCta }) => (
  <Reveal>
    <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.24)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
            {type === 'image' ? '4K · Nano Banana · Prompt to image' : 'Veo 3 · Cinematic · Motion'}
          </p>
        </div>
        <button onClick={onCta} className="shrink-0 rounded-full border border-brand-blue/30 px-4 py-2 text-xs font-bold text-brand-blue hover:bg-brand-blue hover:text-white">
          {cta}
        </button>
      </div>
      <div className="grid max-h-[460px] grid-cols-2 gap-3 overflow-hidden sm:grid-cols-3">
        {items.map((item, index) => {
          const source = type === 'image'
            ? (item as ShowcaseImage).img
            : ((item as ShowcaseVideo).thumb || (item as ShowcaseVideo).videoUrl);
          return (
            <motion.div
              key={`${type}-${index}-${source}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.04, ease: EASE }}
              className={`group relative overflow-hidden rounded-2xl bg-white/[0.05] ${index % 3 === 0 ? 'row-span-2 min-h-[210px]' : 'min-h-[130px]'}`}
            >
              {type === 'video' && (item as ShowcaseVideo).videoUrl ? (
                <video src={(item as ShowcaseVideo).videoUrl} muted playsInline preload="metadata" className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
              ) : (
                <img src={source} alt="" loading="lazy" className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 transition group-hover:ring-brand-blue/60" />
              {type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md">
                    <Play size={16} fill="currentColor" />
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  </Reveal>
);

export default HomepageV2Sections;
