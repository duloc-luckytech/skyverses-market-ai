import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, useSpring, AnimatePresence } from 'framer-motion';
import { usePageMeta } from '../hooks/usePageMeta';
import { HOME_SEO } from '../constants/seo';
import { marketApi } from '../apis/market';
import { systemConfigApi } from '../apis/config';
import { Solution, HomeBlock, Language } from '../types';
import {
  X, SearchX, Search, ArrowRight, ChevronRight, ChevronDown, ChevronUp, Check,
  Zap, Sparkles,
  Play,
  Maximize2, Heart,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

import { CardSkeleton } from '../components/market/MarketSkeleton';
import { SolutionCard } from '../components/market/SolutionCard';
import ProductToolModal from '../components/market/ProductToolModal';
import GlobalToolsBar from '../components/GlobalToolsBar';
import AIModelsMarquee from '../components/AIModelsMarquee';
import type { ShowcaseImage, ShowcaseVideo } from '../src/constants/showcase-cdn';
import LazySection from '../components/landing/LazySection';
import LazyImage from '../components/landing/LazyImage';
import LatestModelsSection from '../components/landing/LatestModelsSection';
import HomepageV2Sections from '../components/landing/HomepageV2Sections';
import { ShowcaseGallerySkeleton, EnterpriseSectionSkeleton, HomeBlockSkeleton, CTASkeleton, DevelopersSkeleton } from '../components/landing/LandingSectionSkeletons';

// Masonry height classes for visual variety in columns layout
const SHOWCASE_HEIGHT = [
  'h-[220px]', 'h-[260px]', 'h-[200px]', 'h-[280px]', 'h-[240px]',
  'h-[260px]', 'h-[220px]', 'h-[280px]', 'h-[200px]', 'h-[240px]',
];

/* ═══════════════════════════════════════════════════════════════════
 * ANIMATION PRIMITIVES
 * ═══════════════════════════════════════════════════════════════════ */

/** Fade-in-up on scroll into view */
const FadeInUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, duration = 0.7, y = 60, className, style }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);

/** Scale-in reveal (for images/cards) */
const ScaleIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, className, style }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);

/** Stagger container — children animate in sequence */
const StaggerContainer: React.FC<{
  children: React.ReactNode;
  stagger?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, stagger = 0.1, className, style }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: stagger } },
    }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);

/** Individual stagger child */
const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 40, scale: 0.95 },
      visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
      },
    }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);

/** Slide-in from left or right */
const SlideIn: React.FC<{
  children: React.ReactNode;
  from?: 'left' | 'right';
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, from = 'left', delay = 0, className, style }) => (
  <motion.div
    initial={{ opacity: 0, x: from === 'left' ? -80 : 80 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);

/** Parallax wrapper — moves slower/faster relative to scroll */
const ParallaxBox: React.FC<{
  children: React.ReactNode;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, speed = 0.3, className, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });
  return (
    <motion.div ref={ref} style={{ y: smoothY, ...style }} className={className}>
      {children}
    </motion.div>
  );
};

/** Blur text reveal — each word animates from blurred to sharp (word-level for perf) */
const BlurTextReveal: React.FC<{
  text: string;
  as?: 'h2' | 'p' | 'span';
  delay?: number;
  charDelay?: number;
  style?: React.CSSProperties;
}> = ({ text, as: Tag = 'span', delay = 0, charDelay = 0.03, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const words = text.split(' ');
  const wordDelay = charDelay * 4;

  return (
    <div ref={ref}>
      <Tag style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.3em', margin: 0, ...style }}>
        {words.map((word, wi) => (
          <motion.span
            key={wi}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
            transition={{
              duration: 0.5,
              delay: delay + wi * wordDelay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {word}
          </motion.span>
        ))}
      </Tag>
    </div>
  );
};

/** Section header animation — label + title blur-reveal + desc blur-reveal */
const AnimatedSectionHeader: React.FC<{
  label?: string;
  title: string;
  desc?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ label, title, desc, children, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24, marginBottom: 56, width: '100%', ...style }}>
    {label && (
      <FadeInUp delay={0} y={20}>
        <span style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 24, lineHeight: 1.366, color: '#C9A84C', margin: 0, textTransform: 'uppercase' as const }}>
          {label}
        </span>
      </FadeInUp>
    )}
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <BlurTextReveal
        text={title}
        as="h2"
        delay={0.15}
        charDelay={0.03}
        style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 36, lineHeight: 1.366, letterSpacing: '-0.72px', color: '#1a2330' }}
      />
      {desc && (
        <BlurTextReveal
          text={desc}
          as="p"
          delay={0.4}
          charDelay={0.008}
          style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.366, color: '#1a2330', maxWidth: 552 }}
        />
      )}
      {children && <FadeInUp delay={0.3}>{children}</FadeInUp>}
    </div>
  </div>
);

/* ── Static hover CSS — extracted outside component to avoid re-injection per render ── */
const HOVER_STYLES = `
.hov-card{transition:transform .35s cubic-bezier(.25,.46,.45,.94),box-shadow .35s ease,border-color .35s ease;border:1px solid transparent}
.hov-card:hover{transform:translateY(-6px);box-shadow:0 16px 48px rgba(0,0,0,.08),0 4px 14px rgba(201,168,76,.12);border-color:rgba(201,168,76,.3)}
.hov-img-wrap{overflow:hidden}
.hov-img{transition:transform .6s cubic-bezier(.25,.46,.45,.94),filter .4s ease}
.hov-img-wrap:hover .hov-img,.hov-img:hover{transform:scale(1.06);filter:brightness(1.06)}
.hov-tab{transition:background .25s ease,color .25s ease,opacity .25s ease}
.hov-tab:hover{background:rgba(26,35,48,.06)!important;opacity:.85!important}
.hov-feature{transition:transform .3s ease,background .3s ease,box-shadow .3s ease;padding:14px 16px;margin:-14px -16px;border-radius:10px}
.hov-feature:hover{background:rgba(201,168,76,.06);transform:translateX(6px);box-shadow:-4px 0 0 0 #C9A84C}
.hov-testimonial{transition:transform .35s cubic-bezier(.25,.46,.45,.94),box-shadow .35s ease,border-color .35s ease;border:1px solid transparent}
.hov-testimonial:hover{transform:translateY(-5px);box-shadow:0 12px 36px rgba(0,0,0,.06),0 2px 8px rgba(201,168,76,.1);border-color:rgba(201,168,76,.25)}
.hov-btn-gold{transition:transform .25s ease,box-shadow .25s ease,filter .25s ease!important}
.hov-btn-gold:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(201,168,76,.35)!important;filter:brightness(1.08)}
.hov-btn-outline{transition:all .25s ease!important}
.hov-btn-outline:hover{background:#1a2330!important;color:#fff!important;transform:translateY(-2px);box-shadow:0 6px 20px rgba(26,35,48,.2)}
.hov-btn-light{transition:all .25s ease!important}
.hov-btn-light:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(235,244,251,.3);background:#fff!important}
.hov-bullet{transition:transform .25s ease,color .25s ease}
.hov-bullet:hover{transform:translateX(4px);color:#C9A84C!important}
.hov-logo{transition:opacity .3s ease,transform .3s ease,filter .3s ease}
.hov-logo:hover{opacity:1!important;transform:scale(1.15)}
.hov-showcase-thumb{transition:transform .4s cubic-bezier(.25,.46,.45,.94),filter .3s ease,box-shadow .3s ease;border-radius:10px;overflow:hidden;cursor:pointer}
.hov-showcase-thumb:hover{transform:scale(1.05);filter:brightness(1.1);box-shadow:0 8px 28px rgba(0,0,0,.35)}
.hov-showcase-thumb:hover .showcase-play-icon{opacity:1;transform:translate(-50%,-50%) scale(1)}
.showcase-play-icon{opacity:0;transform:translate(-50%,-50%) scale(.7);transition:opacity .3s ease,transform .3s ease}
`;

/* ═══════════════════════════════════════════════════════════════════
 * HomePage — landing page tại route `/` (trước đây tên MarketPage)
 * ═══════════════════════════════════════════════════════════════════ */

const HomePage = () => {
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  usePageMeta({
    title: HOME_SEO.title,
    description: HOME_SEO.description,
    canonical: '/',
    jsonLd: {
      '@type': 'ItemList',
      name: 'Top AI Tools — Skyverses',
      url: 'https://skyverses.com',
      numberOfItems: 12,
    },
  });

  /* ─────────── State ─────────── */
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [featuredSolutions, setFeaturedSolutions] = useState<Solution[]>([]);
  const [homeBlocks, setHomeBlocks] = useState<HomeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { query, primary, secondary, reset: resetSearch, open: openSearch } = useSearch();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [toolModalSlug, setToolModalSlug] = useState<string | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);

  /* ─────────── Hero Video Slideshow ─────────── */
  const heroVideos = useMemo(() => [
    { src: 'https://cdn.higgsfield.ai/superhero-gen-preset/b799a9e9-cbe8-4425-b3dd-5115d89cec71.mp4', label: 'iOS', icon: '/assets/model-icons/apple.svg' },
    { src: 'https://cdn.higgsfield.ai/superhero-gen-preset/d69e53e6-0caa-4516-a715-1add43e1167b.mp4', label: 'Android', icon: '/assets/model-icons/android.svg' },
    { src: 'https://cdn.higgsfield.ai/superhero-gen-preset/da5ed91e-0138-405f-a06f-8ed0491e0dd0.mp4', label: 'macOS', icon: '/assets/model-icons/apple.svg' },
    { src: 'https://cdn.higgsfield.ai/superhero-gen-preset/a57ad0e2-02f9-4e7e-ac38-cea5b489653b.mp4', label: 'Windows', icon: '/assets/model-icons/windows.svg' },
    { src: 'https://cdn.higgsfield.ai/superhero-gen-preset/0c6cd833-d2e3-41a1-bf88-a6d1b4a82060.mp4', label: 'Unity', icon: '/assets/model-icons/unity.svg' },
  ], []);
  const heroSlideInterval = 8000;
  const heroVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  /* ── Hero rotating keywords ── */
  const heroRotatingWords = useMemo(() => [t('landing.hero.rotate1'), t('landing.hero.rotate2'), t('landing.hero.rotate3')], [t]);
  const [heroWordIdx, setHeroWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHeroWordIdx(prev => (prev + 1) % heroRotatingWords.length), 2800);
    return () => clearInterval(t);
  }, [heroRotatingWords.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIdx(prev => (prev + 1) % heroVideos.length);
    }, heroSlideInterval);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroSlideIdx, heroVideos.length]);

  useEffect(() => {
    heroVideoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === heroSlideIdx) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [heroSlideIdx]);

  /* ─────────── Data Fetching ─────────── */
  useEffect(() => {
    const handleResetSearch = () => resetSearch();
    window.addEventListener('resetMarketSearch', handleResetSearch);
    return () => window.removeEventListener('resetMarketSearch', handleResetSearch);
  }, [resetSearch]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [configRes, featuredRes] = await Promise.all([
          systemConfigApi.getSystemConfig(),
          marketApi.getRandomFeatured(),
        ]);
        if (configRes?.success && configRes.data.marketHomeBlock) {
          const sortedBlocks = configRes.data.marketHomeBlock.sort((a, b) => a.order - b.order);
          setHomeBlocks(sortedBlocks);
        }
        if (featuredRes?.data) setFeaturedSolutions(featuredRes.data);
      } catch (error) { console.error('Market Init Error:', error); }
    };
    initData();
  }, []);

  useEffect(() => {
    const fetchMarketItems = async () => {
      if (query) setIsSearching(true); else setLoading(true);
      try {
        const res = await marketApi.getSolutions({
          q: query.replace(/\+/g, ' ').trim() || undefined,
          category: primary !== 'ALL' ? primary : undefined,
          lang: lang as Language,
        });
        if (res?.data) setSolutions(res.data.filter(s => s.isActive !== false));
      } catch (error) { console.error('Market Data Sync Error:', error); }
      finally { setLoading(false); setIsSearching(false); }
    };
    const timer = setTimeout(fetchMarketItems, query ? 500 : 0);
    return () => clearTimeout(timer);
  }, [query, primary, lang]);

  useEffect(() => {
    const saved = localStorage.getItem('skyverses_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  /* Hero carousel auto-rotate */
  useEffect(() => {
    if (featuredSolutions.length <= 1) return;
    const id = setInterval(() => setHeroIdx(p => (p + 1) % Math.min(6, featuredSolutions.length)), 4000);
    return () => clearInterval(id);
  }, [featuredSolutions]);

  /* ─────────── Lazy-load showcase data (1166 lines deferred from initial bundle) ─────────── */
  const [showcaseData, setShowcaseData] = useState<{
    SHOWCASE_IMAGES: ShowcaseImage[];
    SHOWCASE_VIDEOS: ShowcaseVideo[];
  } | null>(null);

  useEffect(() => {
    // Delay import until after initial paint (requestIdleCallback or 1s timeout)
    const id = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback(() => loadShowcase())
      : setTimeout(() => loadShowcase(), 1000) as unknown as number;
    async function loadShowcase() {
      const cdn = await import('../src/constants/showcase-cdn');
      setShowcaseData({
        SHOWCASE_IMAGES: cdn.SHOWCASE_IMAGES,
        SHOWCASE_VIDEOS: cdn.SHOWCASE_VIDEOS,
      });
    }
    return () => {
      if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  // Convenience aliases (empty arrays as fallback while loading)
  const SHOWCASE_IMAGES = showcaseData?.SHOWCASE_IMAGES ?? [];
  const SHOWCASE_VIDEOS = showcaseData?.SHOWCASE_VIDEOS ?? [];

  /* ─────────── Callbacks ─────────── */
  const toggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('skyverses_favorites', JSON.stringify(next));
      return next;
    });
  }, []);
  const toggleLike = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setLikedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);
  const getFakeStats = useCallback((id: string) => {
    const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return {
      users: ((hash % 850 + 120) > 999 ? ((hash % 850 + 120) / 1000).toFixed(1) + 'k' : (hash % 850 + 120).toString()),
      likes: ((hash % 400 + 45) > 999 ? ((hash % 400 + 45) / 1000).toFixed(1) + 'k' : (hash % 400 + 45).toString()),
    };
  }, []);
  const handleNavigate = useCallback((slug: string) => {
    if (!isAuthenticated) navigate('/login'); else navigate(`/product/${slug}`);
  }, [isAuthenticated, navigate]);
  const handleQuickView = useCallback((_e: React.MouseEvent, sol: Solution) => setToolModalSlug(sol.slug), []);
  const prefetchedSlugs = useRef(new Set<string>());
  const handlePrefetchOnHover = useCallback((slug: string) => {
    if (prefetchedSlugs.current.has(slug)) return;
    prefetchedSlugs.current.add(slug);
    import('../pages/SolutionDetail').catch(() => {});
  }, []);

  const filteredSolutions = useMemo(() => {
    return solutions.filter(sol => {
      if (secondary === 'ALL') return true;
      return sol.tags?.some(tg => tg.toLowerCase() === secondary.toLowerCase()) ||
        sol.id?.toLowerCase().includes(secondary.toLowerCase());
    });
  }, [solutions, secondary]);

  const currentLang = lang as Language;

  /* ─────────── Derived Data ─────────── */
  const usableFeatured = useMemo(
    () => featuredSolutions.filter(s => !!s.imageUrl && s.imageUrl.trim().length > 0).slice(0, 6),
    [featuredSolutions]
  );

  /* ═══════════════════════════════════════════════════════════════════
   * RENDER
   * ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans antialiased">
      {/* ── Global hover styles (static, defined outside component) ── */}
      <style>{HOVER_STYLES}</style>
      <div className="relative">
        {query ? (
          /* ════════ SEARCH MODE ════════ */
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-20">
            <div className="flex items-center gap-3 mb-8">
              <Search size={18} className="text-[#C9A84C]" />
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                {t('landing.search.results_for')} <span className="text-[#C9A84C]">"{query}"</span>
              </h2>
              <button onClick={resetSearch} className="ml-auto flex items-center gap-1.5 text-sm text-white/50 hover:text-gray-900 transition-colors">
                <X size={14} /> {t('landing.search.clear')}
              </button>
            </div>
            {isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filteredSolutions.length === 0 ? (
              <div className="text-center py-24">
                <SearchX size={56} className="mx-auto text-white/70 mb-4" />
                <p className="text-base text-white/50">{t('landing.search.no_results')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredSolutions.map((sol, idx) => (
                  <SolutionCard
                    key={sol._id || sol.id}
                    sol={sol} idx={idx} lang={lang}
                    isLiked={likedItems.includes(sol._id || sol.id)}
                    isFavorited={favorites.includes(sol._id || sol.id)}
                    onToggleFavorite={toggleFavorite} onToggleLike={toggleLike}
                    onClick={handleNavigate} onHover={handlePrefetchOnHover}
                    onQuickView={handleQuickView} stats={getFakeStats(sol._id || sol.id)} isGrid
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════
             * SECTION 1: HERO / BANNER
             * Atlas-style: dark bg (#1a2330), centered text, sale banner
             * ═══════════════════════════════════════════════════════════ */}
            <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#1a2330]">
              {/* Background video slideshow — only render active + next for perf */}
              {heroVideos.map((v, i) => {
                const nextIdx = (heroSlideIdx + 1) % heroVideos.length;
                if (i !== heroSlideIdx && i !== nextIdx) return null;
                return (
                  <div
                    key={v.src}
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
                    style={{ opacity: i === heroSlideIdx ? 1 : 0 }}
                  >
                    <video
                      ref={el => { heroVideoRefs.current[i] = el; }}
                      autoPlay={i === heroSlideIdx} muted loop playsInline
                      preload={i === heroSlideIdx ? 'auto' : 'metadata'}
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                      src={v.src}
                    />
                  </div>
                );
              })}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a2330]/50 via-[#1a2330]/30 to-[#1a2330]/80 pointer-events-none" />

              <div className="relative max-w-[1300px] mx-auto px-5 md:px-8 py-32 md:py-40">
                {/* Sale badge — cinematic drop-in */}
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex items-center justify-center gap-3 mb-8"
                >
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#E5C767] to-[#C9A84C] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
                    <Zap size={11} /> {t('landing.badge')}
                  </span>
                </motion.div>

                {/* Hero Text — Cinematic entrance with rotating keyword */}
                <div className="text-center max-w-4xl mx-auto mb-14">
                  <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-[-0.03em] leading-[1.08] text-[#ebf4fb]">
                    <span className="block text-base md:text-xl font-semibold tracking-normal text-[#ebf4fb]/50 mb-4 md:mb-5">
                      <BlurTextReveal text={t('landing.hero.line1')} as="span" delay={0.3} charDelay={0.035} style={{ justifyContent: 'center', fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' }} />
                    </span>
                    <BlurTextReveal text={t('landing.hero.line2')} as="span" delay={0.7} charDelay={0.035} style={{ justifyContent: 'center', display: 'inline-flex', fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' }} />
                    {' '}
                    <span className="relative inline-flex items-baseline" style={{ verticalAlign: 'baseline' }}>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={heroRotatingWords[heroWordIdx]}
                          initial={{ y: 14, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -14, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="inline-block bg-gradient-to-r from-[#F8E08A] via-[#E5C767] to-[#B8862F] bg-clip-text text-transparent leading-[1.3] pb-[0.05em]"
                        >
                          {heroRotatingWords[heroWordIdx]}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </h1>
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mt-6 text-base md:text-lg text-[#ebf4fb]/50 max-w-2xl mx-auto leading-relaxed"
                  >
                    {t('landing.hero.subtitle')}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mt-8 flex flex-wrap items-center justify-center gap-4"
                  >
                    <button
                      onClick={() => navigate(isAuthenticated ? '/apps' : '/login')}
                      className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#E5C767] to-[#C9A84C] text-[#1a1404] px-8 py-3.5 rounded-lg text-sm font-bold hover:from-[#F0D173] hover:to-[#D4B355] shadow-lg shadow-[#C9A84C]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#C9A84C]/30 hover:-translate-y-0.5"
                    >
                      {t('landing.hero.cta1')} <ArrowRight size={15} />
                    </button>
                    <button
                      onClick={() => navigate('/markets')}
                      className="inline-flex items-center gap-2.5 bg-transparent text-[#ebf4fb] px-8 py-3.5 rounded-lg text-sm font-semibold border border-[#ebf4fb]/20 hover:border-[#ebf4fb]/40 hover:bg-white/[0.06] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {t('landing.hero.cta2')}
                    </button>
                    <button
                      onClick={() => navigate('/booking')}
                      className="inline-flex items-center gap-2 bg-transparent text-[#ebf4fb]/60 px-4 py-3.5 text-sm font-semibold hover:text-[#C9A84C] transition-colors duration-200"
                    >
                      {t('landing.hero.cta3')} <ArrowRight size={14} />
                    </button>
                  </motion.div>
                </div>

                {/* Mega Sale Banner — slide up with scale */}
                {usableFeatured.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.9, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative rounded-xl overflow-hidden bg-[#ebf4fb]/[0.04] border border-[#ebf4fb]/[0.08] p-5 md:p-6 backdrop-blur-sm"
                  >
                    {/* Scrollable model cards — CSS animation instead of per-card motion */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
                      {usableFeatured.map((sol, i) => (
                        <button
                          key={sol._id || sol.id}
                          onClick={() => handleNavigate(sol.slug)}
                          className={`relative shrink-0 w-[180px] md:w-[220px] rounded-xl overflow-hidden transition-all duration-300 snap-start group animate-atlas-fade-in-up ${
                            i === heroIdx ? 'ring-2 ring-[#C9A84C] scale-[1.02]' : 'ring-1 ring-[#ebf4fb]/10 hover:ring-[#ebf4fb]/30'
                          }`}
                          style={{ animationDelay: `${1.3 + i * 0.1}s`, animationFillMode: 'backwards' }}
                        >
                          <div className="aspect-[4/3] overflow-hidden">
                            <img
                              src={sol.imageUrl}
                              alt={sol.name?.[currentLang] || ''}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              loading={i < 3 ? 'eager' : 'lazy'}
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          {!sol.isFree && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#E5C767] text-white text-[10px] font-bold rounded-md shadow-lg">
                              {i % 3 === 0 ? '40%' : i % 3 === 1 ? '20%' : '15%'} OFF
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 p-3 text-white text-left">
                            <p className="text-xs font-bold truncate">{sol.name?.[currentLang]}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-white/50 line-through">
                                ${((sol.priceCredits || 10) * 0.015).toFixed(2)}
                              </span>
                              <span className="text-[11px] font-bold text-emerald-400">
                                ${((sol.priceCredits || 10) * 0.01).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Carousel thumbnail tabs — Atlas glass bar */}
                <div className="mt-10 animate-atlas-fade-in-up" style={{ animationDelay: '1.4s', animationFillMode: 'backwards' }}>
                  <div className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.08] overflow-x-auto no-scrollbar">
                    {heroVideos.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setHeroSlideIdx(i)}
                        className={`relative flex items-center gap-2.5 shrink-0 pl-1.5 pr-4 py-1.5 rounded-lg transition-all duration-300 ${
                          i === heroSlideIdx
                            ? 'bg-white/[0.10] ring-1 ring-[#C9A84C]/60'
                            : 'hover:bg-white/[0.06]'
                        }`}
                      >
                        {/* Model icon */}
                        <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-white/10 flex items-center justify-center p-1.5">
                          <img
                            src={v.icon}
                            alt={v.label}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {/* Label */}
                        <span className={`text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                          i === heroSlideIdx ? 'text-white' : 'text-white/50'
                        }`}>
                          {v.label}
                        </span>
                        {/* Progress bar overlay at bottom */}
                        {i === heroSlideIdx && (
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-lg overflow-hidden">
                            <div
                              className="h-full bg-[#C9A84C]"
                              style={{ animation: `heroProgress ${heroSlideInterval}ms linear forwards` }}
                            />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hero progress bar keyframes */}
              <style>{`
                @keyframes heroProgress {
                  from { width: 0%; }
                  to   { width: 100%; }
                }
              `}</style>
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * HERO LOGO MARQUEE — AI provider logos (clone style)
             * ═══════════════════════════════════════════════════════════ */}
            <section className="w-full overflow-hidden border-b border-white/[0.06] bg-[#1a2330]">
              <div className="py-5 md:py-6 relative">
                {/* Fade edges */}
                <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-[#1a2330] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-[#1a2330] to-transparent z-10 pointer-events-none" />

                <div className="flex whitespace-nowrap hero-logo-marquee">
                  {[0, 1].map(setIdx => (
                    <div key={setIdx} className="flex shrink-0">
                      {[
                        { name: 'MINIMAX', file: 'minimax.svg' },
                        { name: 'Moonshot AI', file: 'moonshot.svg' },
                        { name: 'deepseek', file: 'deepseek.svg' },
                        { name: 'Qwen & Wan', file: 'qwen.svg' },
                        { name: 'ByteDance', file: 'bytedance.svg' },
                        { name: 'LUMA AI', file: 'luma.svg' },
                        { name: 'Z.ai', file: 'zai.svg' },
                        { name: 'OpenAI', file: 'openai.svg' },
                        { name: 'Google', file: 'google.svg' },
                        { name: 'KLING', file: 'kling.svg' },
                      ].map(logo => (
                        <div key={`${setIdx}-${logo.name}`} className="flex items-center justify-center px-5 md:px-8">
                          <img
                            src={`/assets/landing-logos/${logo.file}`}
                            alt={logo.name}
                            loading="lazy"
                            className="h-[14px] md:h-[20px] lg:h-[23px] w-auto object-contain opacity-50 hover:opacity-80 transition-opacity duration-300 brightness-0 invert"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <style>{`
                  @keyframes heroLogoScroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .hero-logo-marquee {
                    animation: heroLogoScroll 30s linear infinite;
                  }
                  .hero-logo-marquee:hover {
                    animation-play-state: paused;
                  }
                `}</style>
              </div>
            </section>

            <HomepageV2Sections
              solutions={solutions}
              homeBlocks={homeBlocks}
              loading={loading}
              favorites={favorites}
              likedItems={likedItems}
              showcaseImages={SHOWCASE_IMAGES}
              showcaseVideos={SHOWCASE_VIDEOS}
              onToggleFavorite={toggleFavorite}
              onToggleLike={toggleLike}
              onNavigateProduct={handleNavigate}
              onHoverProduct={handlePrefetchOnHover}
              onQuickView={handleQuickView}
              getStats={getFakeStats}
            />
          </>
        )}
      </div>

      <GlobalToolsBar />
      {toolModalSlug && (
        <ProductToolModal slug={toolModalSlug} onClose={() => setToolModalSlug(null)} />
      )}
    </div>
  );
};

export default HomePage;
