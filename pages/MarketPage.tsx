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
import type { ShowcaseImage, ShowcaseVideo, ShowcaseAlbum } from '../src/constants/showcase-cdn';
import type { Showcase3DModel } from '../src/constants/showcase-3d';
import ExplorerDetailModal, { ExplorerItem } from '../components/ExplorerDetailModal';
import LazySection from '../components/landing/LazySection';
import LazyImage from '../components/landing/LazyImage';
import LatestModelsSection from '../components/landing/LatestModelsSection';
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
 * MarketPage — Clone 1:1 from atlascloud.ai
 * ═══════════════════════════════════════════════════════════════════ */

const MarketPage = () => {
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  usePageMeta({
    title: HOME_SEO.title,
    description: HOME_SEO.description,
    canonical: '/',
    jsonLd: {
      '@type': 'ItemList',
      name: 'Top AI Tools — Skyverses Marketplace',
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
  const [activeModelTab, setActiveModelTab] = useState(0);
  const [activeBuildTab, setActiveBuildTab] = useState<'apis' | 'serverless' | 'compute'>('apis');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [selectedShowcaseItem, setSelectedShowcaseItem] = useState<ExplorerItem | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = useCallback((key: string) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] })), []);

  /* ─────────── Hero Video Slideshow ─────────── */
  const heroVideos = useMemo(() => [
    { src: 'https://cdn.higgsfield.ai/superhero-gen-preset/b799a9e9-cbe8-4425-b3dd-5115d89cec71.mp4', label: 'VEO 3.1', icon: '/assets/model-icons/google.svg' },
    { src: 'https://cdn.higgsfield.ai/superhero-gen-preset/d69e53e6-0caa-4516-a715-1add43e1167b.mp4', label: 'Kling 3.0', icon: '/assets/model-icons/kling.svg' },
    { src: 'https://cdn.higgsfield.ai/superhero-gen-preset/da5ed91e-0138-405f-a06f-8ed0491e0dd0.mp4', label: 'Nano Banana Pro', icon: '/assets/model-icons/google.svg' },
    { src: 'https://cdn.higgsfield.ai/superhero-gen-preset/a57ad0e2-02f9-4e7e-ac38-cea5b489653b.mp4', label: 'Seedance 2.0', icon: '/assets/model-icons/bytedance.svg' },
    { src: 'https://cdn.higgsfield.ai/superhero-gen-preset/0c6cd833-d2e3-41a1-bf88-a6d1b4a82060.mp4', label: 'WAN 2.5', icon: '/assets/model-icons/qwen.svg' },
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
    SHOWCASE_FASHION_IMAGES: ShowcaseImage[];
    SHOWCASE_FASHION_VIDEOS: ShowcaseVideo[];
    SHOWCASE_FASHION_ALBUMS: ShowcaseAlbum[];
    SHOWCASE_3D_MODELS: Showcase3DModel[];
  } | null>(null);

  useEffect(() => {
    // Delay import until after initial paint (requestIdleCallback or 1s timeout)
    const id = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback(() => loadShowcase())
      : setTimeout(() => loadShowcase(), 1000) as unknown as number;
    async function loadShowcase() {
      const [cdn, d3] = await Promise.all([
        import('../src/constants/showcase-cdn'),
        import('../src/constants/showcase-3d'),
      ]);
      setShowcaseData({
        SHOWCASE_IMAGES: cdn.SHOWCASE_IMAGES,
        SHOWCASE_VIDEOS: cdn.SHOWCASE_VIDEOS,
        SHOWCASE_FASHION_IMAGES: cdn.SHOWCASE_FASHION_IMAGES,
        SHOWCASE_FASHION_VIDEOS: cdn.SHOWCASE_FASHION_VIDEOS,
        SHOWCASE_FASHION_ALBUMS: cdn.SHOWCASE_FASHION_ALBUMS,
        SHOWCASE_3D_MODELS: d3.SHOWCASE_3D_MODELS,
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
  const SHOWCASE_FASHION_IMAGES = showcaseData?.SHOWCASE_FASHION_IMAGES ?? [];
  const SHOWCASE_FASHION_VIDEOS = showcaseData?.SHOWCASE_FASHION_VIDEOS ?? [];
  const SHOWCASE_FASHION_ALBUMS = showcaseData?.SHOWCASE_FASHION_ALBUMS ?? [];
  const SHOWCASE_3D_MODELS = showcaseData?.SHOWCASE_3D_MODELS ?? [];

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

  /* Model categories for tab nav */
  const modelCategories = useMemo(() => {
    const cats: string[] = [];
    featuredSolutions.forEach(s => {
      const cat = s.category?.[currentLang] || s.category?.en || '';
      if (cat && !cats.includes(cat)) cats.push(cat);
    });
    return cats.slice(0, 8);
  }, [featuredSolutions, currentLang]);

  /* Models for active tab */
  const latestModels = useMemo(() => {
    if (modelCategories.length === 0) return featuredSolutions.slice(0, 12);
    const activeCat = modelCategories[activeModelTab] || modelCategories[0];
    const filtered = featuredSolutions.filter(s => {
      const cat = s.category?.[currentLang] || s.category?.en || '';
      return cat === activeCat;
    });
    return filtered.length > 0 ? filtered.slice(0, 12) : featuredSolutions.slice(0, 12);
  }, [featuredSolutions, modelCategories, activeModelTab, currentLang]);

  /* Featured model series for deep-dive sections */
  const modelSeries = useMemo(() => {
    return featuredSolutions.filter(s => s.imageUrl).slice(0, 8);
  }, [featuredSolutions]);

  /* Sub-models helper */
  const getSubModels = useCallback((sol: Solution) => {
    if (sol.neuralStack && sol.neuralStack.length > 0) {
      return sol.neuralStack.slice(0, 4).map((ns, i) => ({
        name: `${ns.name} ${ns.version || ''}`.trim(),
        capability: ns.capability?.[currentLang] || ns.capability?.en || '',
        price: sol.priceCredits ? `$${(sol.priceCredits * 0.01 * (0.8 + i * 0.05)).toFixed(2)}` : 'Free',
        originalPrice: sol.priceCredits ? `$${(sol.priceCredits * 0.01 * (1.2 + i * 0.05)).toFixed(2)}` : '',
        image: sol.gallery?.[i] || sol.imageUrl,
      }));
    }
    const modes = sol.tags?.slice(0, 4) || ['Text-to-Video', 'Image-to-Video', 'Video-to-Video', 'Upscale'];
    return modes.map((tag, i) => ({
      name: tag,
      capability: '',
      price: sol.isFree ? 'Free' : `$${((sol.priceCredits || 10) * 0.01).toFixed(2)}`,
      originalPrice: sol.isFree ? '' : `$${((sol.priceCredits || 10) * 0.015).toFixed(2)}`,
      image: sol.gallery?.[i] || sol.imageUrl,
    }));
  }, [currentLang]);

  /* BUILD tabs data */
  const buildTabs = useMemo(() => ({
    apis: {
      title: t('landing.build.image_title'),
      desc: t('landing.build.image_desc'),
      features: [
        t('landing.build.image_f1'),
        t('landing.build.image_f2'),
        t('landing.build.image_f3'),
        t('landing.build.image_f4'),
        t('landing.build.image_f5'),
      ],
      cta: t('landing.build.image_cta'),
      image: '/assets/homepage/gold-build-image-gen.webp',
    },
    serverless: {
      title: t('landing.build.video_title'),
      desc: t('landing.build.video_desc'),
      features: [
        t('landing.build.video_f1'),
        t('landing.build.video_f2'),
        t('landing.build.video_f3'),
        t('landing.build.video_f4'),
        t('landing.build.video_f5'),
      ],
      cta: t('landing.build.video_cta'),
      image: '/assets/homepage/gold-build-video-gen.webp',
    },
    compute: {
      title: t('landing.build.audio_title'),
      desc: t('landing.build.audio_desc'),
      features: [
        t('landing.build.audio_f1'),
        t('landing.build.audio_f2'),
        t('landing.build.audio_f3'),
        t('landing.build.audio_f4'),
        t('landing.build.audio_f5'),
      ],
      cta: t('landing.build.audio_cta'),
      image: '/assets/homepage/gold-build-audio-creative.webp',
    },
  }), [t]);

  const activeBuildContent = buildTabs[activeBuildTab];

  /* Enterprise offerings data */
  const enterpriseOfferings = useMemo(() => [
    {
      title: t('landing.ent.card1_title'),
      image: '/assets/homepage/gold-ent-build-app.webp',
      bullets: [
        t('landing.ent.card1_b1'),
        t('landing.ent.card1_b2'),
        t('landing.ent.card1_b3'),
      ],
    },
    {
      title: t('landing.ent.card2_title'),
      image: '/assets/homepage/gold-ent-deploy.webp',
      bullets: [
        t('landing.ent.card2_b1'),
        t('landing.ent.card2_b2'),
        t('landing.ent.card2_b3'),
      ],
    },
    {
      title: t('landing.ent.card3_title'),
      image: '/assets/homepage/gold-ent-maintain.webp',
      bullets: [
        t('landing.ent.card3_b1'),
        t('landing.ent.card3_b2'),
        t('landing.ent.card3_b3'),
      ],
    },
    {
      title: t('landing.ent.card4_title'),
      image: '/assets/homepage/gold-ent-consult.webp',
      bullets: [
        t('landing.ent.card4_b1'),
        t('landing.ent.card4_b2'),
        t('landing.ent.card4_b3'),
      ],
    },
  ], [t]);

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
                  <span className="text-[#ebf4fb]/50 text-xs font-medium">
                    {t('landing.badge_sub')}
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
                    <span className="inline-flex items-baseline overflow-hidden" style={{ height: '1.3em', verticalAlign: 'baseline' }}>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={heroRotatingWords[heroWordIdx]}
                          initial={{ y: '100%', opacity: 0 }}
                          animate={{ y: '0%', opacity: 1 }}
                          exit={{ y: '-100%', opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="inline-block bg-gradient-to-r from-[#E5C767] via-[#C9A84C] to-[#E5C767] bg-clip-text text-transparent"
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
                      className="inline-flex items-center gap-2.5 bg-[#C9A84C] text-white px-8 py-3.5 rounded-lg text-sm font-semibold hover:bg-[#B8963F] shadow-lg shadow-[#C9A84C]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#C9A84C]/30 hover:-translate-y-0.5"
                    >
                      {t('landing.hero.cta1')} <ArrowRight size={15} />
                    </button>
                    <button
                      onClick={() => navigate('/markets')}
                      className="inline-flex items-center gap-2.5 bg-transparent text-[#ebf4fb] px-8 py-3.5 rounded-lg text-sm font-semibold border border-[#ebf4fb]/20 hover:border-[#ebf4fb]/40 hover:bg-white/[0.06] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {t('landing.hero.cta2')}
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

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 2: TOOLS OVERVIEW — 2×3 Grid cards
             * Tạo kịch bản, Tạo hình, Tạo video, Marketing, Công cụ khác, Explore All
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', background: '#fff', padding: '80px 0 0', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
              <div style={{ padding: '0 64px', boxSizing: 'border-box' }}>
                {/* Section header */}
                <AnimatedSectionHeader
                  label={t('landing.tools.label')}
                  title={t('landing.tools.title')}
                  desc={t('landing.tools.desc')}
                  style={{ marginBottom: 40 }}
                />

                {/* Layout: Col1 (featured) + Col2 (2 rows × 3 cards) */}
                <div style={{ display: 'flex', gap: 24, position: 'relative' }}>
                  {/* Col 1 — Featured hero card, height determined by Col 2 */}
                  <FadeInUp style={{ flex: '0 0 380px', display: 'flex', position: 'absolute', top: 0, bottom: 0, left: 0, width: 380 }}>
                  <div
                    className="hov-card group"
                    onClick={() => navigate('/solutions')}
                    style={{
                      width: '100%', borderRadius: 16, overflow: 'hidden',
                      boxSizing: 'border-box', cursor: 'pointer',
                      border: '1px solid rgba(0,0,0,0.06)', background: '#0a0f1a',
                      display: 'flex', flexDirection: 'column', position: 'relative',
                    }}
                  >
                    <div className="hov-img-wrap" style={{ width: '100%', flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}>
                      <img src="/assets/homepage/gold-tools-hero.webp" alt="All-in-One AI Platform" className="hov-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                    </div>
                    <div style={{ padding: '24px 28px 28px', background: '#0a0f1a' }}>
                      <span style={{ fontFamily: 'var(--font-mono, Fragment Mono, monospace)', fontWeight: 500, fontSize: 11, letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 10, display: 'block' }}>
                        {t('landing.tools.featured_badge')}
                      </span>
                      <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 22, lineHeight: 1.3, color: '#fff', margin: '0 0 10px' }}>
                        {t('landing.tools.featured_title')}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.55)', margin: '0 0 16px' }}>
                        {t('landing.tools.featured_desc')}
                      </p>
                      <span className="hov-btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 500 }}>
                        {t('landing.tools.featured_cta')}
                      </span>
                    </div>
                  </div>
                  </FadeInUp>

                  {/* Col 2 — 2 rows × 3 small cards (determines container height) */}
                  <div style={{ flex: '1 1 auto', minWidth: 0, marginLeft: 404, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto', gap: 24 }}>
                    {[
                      {
                        title: t('landing.tools.card1_title'),
                        desc: t('landing.tools.card1_desc'),
                        img: '/assets/homepage/gold-tools-script.webp',
                        link: '/solutions',
                      },
                      {
                        title: t('landing.tools.card2_title'),
                        desc: t('landing.tools.card2_desc'),
                        img: '/assets/homepage/gold-tools-image.webp',
                        link: '/solutions',
                      },
                      {
                        title: t('landing.tools.card3_title'),
                        desc: t('landing.tools.card3_desc'),
                        img: '/assets/homepage/gold-tools-video.webp',
                        link: '/solutions',
                      },
                      {
                        title: t('landing.tools.card4_title'),
                        desc: t('landing.tools.card4_desc'),
                        img: '/assets/homepage/gold-tools-marketing.webp',
                        link: '/solutions',
                      },
                      {
                        title: t('landing.tools.card5_title'),
                        desc: t('landing.tools.card5_desc'),
                        img: '/assets/homepage/gold-tools-upscale.webp',
                        link: '/solutions',
                      },
                      {
                        title: t('landing.tools.card6_title'),
                        desc: t('landing.tools.card6_desc'),
                        img: '/assets/homepage/gold-tools-3d.webp',
                        link: '/solutions',
                      },
                    ].map((tool, idx) => (
                      <FadeInUp key={tool.title} delay={idx * 0.06}>
                      <div
                        className="hov-card group"
                        onClick={() => navigate(tool.link)}
                        style={{
                          background: '#fff', borderRadius: 16, overflow: 'hidden',
                          boxSizing: 'border-box', cursor: 'pointer',
                          border: '1px solid rgba(0,0,0,0.06)',
                          display: 'flex', flexDirection: 'column', height: '100%',
                        }}
                      >
                        <div className="hov-img-wrap" style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', background: '#1a2330', flexShrink: 0 }}>
                          <img src={tool.img} alt={tool.title} className="hov-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                        </div>
                        <div style={{ padding: '14px 16px 16px', flex: '1 1 auto' }}>
                          <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 15, lineHeight: 1.3, color: '#1a2330', margin: '0 0 4px' }}>
                            {tool.title}
                          </h3>
                          <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: '#9ca3af', margin: 0 }}>
                            {tool.desc}
                          </p>
                        </div>
                      </div>
                      </FadeInUp>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 2.5: LATEST MODELS — Full-width slider, seeded data
             * ═══════════════════════════════════════════════════════════ */}
            <LazySection rootMargin="300px" minHeight={600} className="bg-[#0c1117]">
            <LatestModelsSection activeTab={activeModelTab} setActiveTab={setActiveModelTab} navigate={navigate} />
            </LazySection>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 2B: MODEL SHOWCASE — Nano Banana Pro (35) & Veo3 (23)
             * Character filter tabs + responsive grids
             * ═══════════════════════════════════════════════════════════ */}
            <LazySection skeleton={<><ShowcaseGallerySkeleton /><ShowcaseGallerySkeleton /><ShowcaseGallerySkeleton /><ShowcaseGallerySkeleton /></>} rootMargin="300px" minHeight={700} className="bg-[#0d0b08]">
            <section style={{ padding: '0 0 60px', overflow: 'hidden' }}>
              <div style={{ width: '100%', maxWidth: 1440, margin: '0 auto', boxSizing: 'border-box', padding: '0 64px' }}>
                {/* ── Nano Banana Pro (Image Generation) ── */}
                <div className={`relative bg-[#0d0b08] overflow-hidden transition-all duration-500 ${expandedGroups['banana'] ? '' : 'max-h-[700px]'}`} style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', padding: '40px max(24px, calc((100vw - 1312px) / 2))' }}>
                  {/* Full background video */}
                  <div className="absolute inset-0 pointer-events-none">
                    <video src={SHOWCASE_VIDEOS[1]?.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#0d0b08]/80" />
                  </div>
                  {/* Warm amber glow accents */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent_70%)] pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/10 to-transparent" />
                  {!expandedGroups['banana'] && <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0d0b08] via-[#0d0b08]/80 to-transparent z-20 pointer-events-none" />}
                <FadeInUp delay={0.1}>
                  <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Left column — Group info */}
                    <div className="md:w-1/4 shrink-0 flex flex-col gap-4 md:py-8">
                      <h3 className="showcase-gold-title" style={{
                        fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 800,
                        fontSize: 28, margin: 0, letterSpacing: '0.02em', lineHeight: 1.2,
                      }}>
                        Nano Banana Pro
                      </h3>
                      <p className="text-[13px] text-white/50 leading-relaxed" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                        {t('landing.showcase.banana_desc')}
                      </p>
                      <button
                        onClick={() => navigate('/solutions')}
                        className="hov-btn-gold w-fit"
                        style={{
                          background: '#C9A84C', color: '#1a2330', border: 'none', borderRadius: 8,
                          padding: '10px 20px', fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
                          fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        }}
                      >
                        {t('landing.showcase.banana_cta')}
                      </button>

                      {/* Divider */}
                      <div className="hidden md:block w-full h-px bg-white/[0.06] my-1" />

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-4 text-[12px] text-white/40" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                        <span><span className="text-white/70 font-semibold">{SHOWCASE_IMAGES.length}</span> {t('landing.showcase.images')}</span>
                        <span>{t('landing.showcase.up_to')} <span className="text-white/70 font-semibold">4K</span></span>
                      </div>

                      {/* Feature tags */}
                      <div className="hidden md:flex flex-wrap gap-1.5">
                        {[t('landing.showcase.tag_photo'), t('landing.showcase.tag_text'), t('landing.showcase.tag_multi'), t('landing.showcase.tag_style')].map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.04] text-white/40 border border-white/[0.06]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Mini preview grid */}
                      <div className="hidden md:grid grid-cols-3 gap-1.5 mt-1">
                        {SHOWCASE_IMAGES.slice(0, 6).map(item => (
                          <div key={item.id} className="aspect-square rounded-lg overflow-hidden border border-white/[0.06]">
                            <img src={item.img} alt="" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-300" loading="lazy" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right column — Cards grid */}
                    <div className="flex-1 min-w-0">
                    <div className="showcase-masonry">
                      {SHOWCASE_IMAGES.map((item, idx) => {
                        const heightClass = SHOWCASE_HEIGHT[idx % SHOWCASE_HEIGHT.length];
                        return (
                          <div
                            key={item.id}
                            className={`showcase-masonry-item relative overflow-hidden group cursor-pointer rounded-xl transition-all duration-300 bg-[#15120a] border border-amber-800/10 hover:border-amber-700/25 hover:shadow-lg hover:shadow-amber-900/10 ${heightClass}`}
                            onClick={() => setSelectedShowcaseItem({
                              id: item.id, title: item.product, description: item.name, type: 'image',
                              thumbnailUrl: item.img, mediaUrl: item.img,
                              model: 'google_image_gen_4_5', modelKey: 'Nano Banana Pro',
                              engine: 'Google Imagen 4.5',
                              resolution: item.ratio === '16:9' ? '1920 × 1080' : '1024 × 1024',
                              tags: ['showcase', 'banana-pro', item.tag, item.character],
                              categories: ['showcase', 'banana-pro'],
                              createdAt: '2026-05-06',
                              prompt: item.prompt,
                            })}
                          >
                            {/* Image */}
                            <div className="absolute inset-0 overflow-hidden">
                              <img
                                src={item.img}
                                alt={item.name}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {/* Hover gradient */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                              {/* Hover info */}
                              <div className="absolute bottom-0 left-0 right-0 p-3 z-20 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <p className="text-[11px] text-white/70 font-medium truncate mb-1">{item.product}</p>
                              </div>
                            </div>

                            {/* Footer bar */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent px-3 py-2.5 flex items-center justify-between z-20">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                                <span className="text-[11px] font-medium text-white/70 truncate">{item.name}</span>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); setSelectedShowcaseItem({
                                id: item.id, title: item.product, description: item.name, type: 'image',
                                thumbnailUrl: item.img, mediaUrl: item.img,
                                model: 'google_image_gen_4_5', modelKey: 'Nano Banana Pro',
                                engine: 'Google Imagen 4.5',
                                resolution: item.ratio === '16:9' ? '1920 × 1080' : '1024 × 1024',
                                tags: ['showcase', 'banana-pro', item.tag, item.character],
                                categories: ['showcase', 'banana-pro'],
                                createdAt: '2026-05-06',
                                prompt: item.prompt,
                              }); }} className="p-1 text-white/50 hover:text-white transition-colors">
                                <Maximize2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    </div>{/* end right column */}
                  </div>
                </FadeInUp>
                  <button onClick={() => toggleGroup('banana')} className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105" style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', backdropFilter: 'blur(8px)' }}>
                    {expandedGroups['banana'] ? <><ChevronUp size={14} /> {t('landing.showcase.collapse')}</> : <><ChevronDown size={14} /> {t('landing.showcase.load_more')}</>}
                  </button>
                </div>{/* end Nano Banana Pro frame */}

                {/* ── Veo 3 (Video Generation) ── */}
                <div className={`relative bg-[#080a14] overflow-hidden transition-all duration-500 ${expandedGroups['veo3'] ? '' : 'max-h-[700px]'}`} style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', padding: '40px max(24px, calc((100vw - 1312px) / 2))' }}>
                  {/* Full background video */}
                  <div className="absolute inset-0 pointer-events-none">
                    <video src={SHOWCASE_VIDEOS[0]?.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#080a14]/80" />
                  </div>
                  {/* Blue glow accents */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(56,100,220,0.08)_0%,transparent_70%)] pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                  {!expandedGroups['veo3'] && <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#080a14] via-[#080a14]/80 to-transparent z-20 pointer-events-none" />}
                <FadeInUp delay={0.2}>
                  <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Left column — Group info */}
                    <div className="md:w-1/4 shrink-0 flex flex-col gap-4 md:py-8">
                      <h3 className="showcase-gold-title" style={{
                        fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 800,
                        fontSize: 28, margin: 0, letterSpacing: '0.02em', lineHeight: 1.2,
                      }}>
                        Veo 3
                      </h3>
                      <p className="text-[13px] text-white/50 leading-relaxed" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                        {t('landing.showcase.veo3_desc')}
                      </p>
                      <button
                        onClick={() => navigate('/solutions')}
                        className="w-fit hover:opacity-90 transition-opacity"
                        style={{
                          background: 'linear-gradient(135deg, #3864dc, #5040c8)', color: '#fff', border: 'none', borderRadius: 8,
                          padding: '10px 20px', fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
                          fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        }}
                      >
                        {t('landing.showcase.veo3_cta')}
                      </button>

                      {/* Divider */}
                      <div className="hidden md:block w-full h-px bg-white/[0.06] my-1" />

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-4 text-[12px] text-white/40" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                        <span><span className="text-white/70 font-semibold">{SHOWCASE_VIDEOS.length}</span> {t('landing.showcase.videos')}</span>
                        <span><span className="text-white/70 font-semibold">1080p</span> HD</span>
                      </div>

                      {/* Feature tags */}
                      <div className="hidden md:flex flex-wrap gap-1.5">
                        {[t('landing.showcase.tag_t2v'), t('landing.showcase.tag_i2v'), t('landing.showcase.tag_cine'), t('landing.showcase.tag_audio')].map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-500/[0.06] text-blue-300/50 border border-blue-500/10">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Mini preview grid — video thumbnails */}
                      <div className="hidden md:grid grid-cols-3 gap-1.5 mt-1">
                        {SHOWCASE_VIDEOS.slice(0, 6).map(item => (
                          <div key={item.id} className="aspect-video rounded-lg overflow-hidden border border-blue-800/15">
                            <video src={item.videoUrl} poster={item.thumb} preload="metadata" muted playsInline className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right column — Cards grid */}
                    <div className="flex-1 min-w-0">
                    <div className="showcase-masonry">
                      {SHOWCASE_VIDEOS.map((item, idx) => {
                        const heightClass = SHOWCASE_HEIGHT[idx % SHOWCASE_HEIGHT.length];
                        return (
                          <div
                            key={item.id}
                            className={`showcase-masonry-item relative overflow-hidden group cursor-pointer rounded-xl transition-all duration-300 bg-[#0a0e1a] border border-blue-800/10 hover:border-blue-600/25 hover:shadow-lg hover:shadow-blue-900/10 ${heightClass}`}
                            onClick={() => setSelectedShowcaseItem({
                              id: item.id, title: item.product, description: `${item.name} — ${item.mode}`, type: 'video',
                              thumbnailUrl: item.videoUrl, mediaUrl: item.videoUrl,
                              model: 'veo_3_generate', modelKey: 'Veo 3',
                              engine: 'Google Veo 3',
                              resolution: '1080p',
                              tags: ['showcase', 'veo3', item.mode, item.character],
                              categories: ['showcase', 'veo3'],
                              createdAt: '2026-05-06',
                              prompt: item.prompt,
                              ...(item.mode === 'image-to-video' ? { meta: { referenceImage: item.thumb } } : {}),
                            })}
                          >
                            {/* Video thumbnail — use <video> with preload to show first frame */}
                            <div className="absolute inset-0 overflow-hidden">
                              <video
                                src={item.videoUrl}
                                poster={item.thumb}
                                preload="metadata"
                                muted
                                playsInline
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                                onMouseLeave={(e) => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                              />
                              {/* Play icon overlay */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-10 h-10 rounded-full bg-blue-500/80 flex items-center justify-center opacity-80 group-hover:opacity-0 transition-opacity duration-300">
                                  <Play size={18} fill="#fff" color="#fff" />
                                </div>
                              </div>
                              {/* Hover gradient */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                              {/* Hover info */}
                              <div className="absolute bottom-0 left-0 right-0 p-3 z-20 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <p className="text-[11px] text-white/70 font-medium truncate mb-1">{item.product}</p>
                              </div>
                            </div>

                            {/* Footer bar */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent px-3 py-2.5 flex items-center justify-between z-20">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                <span className="text-[11px] font-medium text-white/70 truncate">{item.name}</span>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); setSelectedShowcaseItem({
                                id: item.id, title: item.product, description: `${item.name} — ${item.mode}`, type: 'video',
                                thumbnailUrl: item.videoUrl, mediaUrl: item.videoUrl,
                                model: 'veo_3_generate', modelKey: 'Veo 3',
                                engine: 'Google Veo 3',
                                resolution: '1080p',
                                tags: ['showcase', 'veo3', item.mode, item.character],
                                categories: ['showcase', 'veo3'],
                                createdAt: '2026-05-06',
                                prompt: item.prompt,
                                ...(item.mode === 'image-to-video' ? { meta: { referenceImage: item.thumb } } : {}),
                              }); }} className="p-1 text-white/50 hover:text-white transition-colors">
                                <Maximize2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    </div>{/* end right column */}
                  </div>
                </FadeInUp>
                  <button onClick={() => toggleGroup('veo3')} className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105" style={{ background: 'rgba(56,100,220,0.15)', border: '1px solid rgba(56,100,220,0.3)', color: '#6090e8', backdropFilter: 'blur(8px)' }}>
                    {expandedGroups['veo3'] ? <><ChevronUp size={14} /> {t('landing.showcase.collapse')}</> : <><ChevronDown size={14} /> {t('landing.showcase.load_more')}</>}
                  </button>
                </div>{/* end Veo 3 frame */}

                {/* ── Fashion Showcase (Mixed Image + Video) ── */}
                <div className={`relative bg-[#0c0810] overflow-hidden transition-all duration-500 ${expandedGroups['fashion'] ? '' : 'max-h-[700px]'}`} style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', padding: '40px max(24px, calc((100vw - 1312px) / 2))' }}>
                  {/* Full background video */}
                  <div className="absolute inset-0 pointer-events-none">
                    <video src={SHOWCASE_FASHION_VIDEOS.filter(v => v.videoUrl)[0]?.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#0c0810]/80" />
                  </div>
                  {/* Rose glow accents */}
                  <div className="absolute top-0 left-0 w-[500px] h-[450px] bg-[radial-gradient(circle,rgba(180,80,120,0.07)_0%,transparent_70%)] pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/10 to-transparent" />
                  {!expandedGroups['fashion'] && <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0c0810] via-[#0c0810]/80 to-transparent z-20 pointer-events-none" />}
                <FadeInUp delay={0.2}>
                  <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Left column — Group info */}
                    <div className="md:w-1/4 shrink-0 flex flex-col gap-4 md:py-8">
                      <h3 className="showcase-gold-title" style={{
                        fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 800,
                        fontSize: 28, margin: 0, letterSpacing: '0.02em', lineHeight: 1.2,
                      }}>
                        Fashion AI
                      </h3>
                      <p className="text-[13px] text-white/50 leading-relaxed" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                        {t('landing.showcase.fashion_desc')}
                      </p>
                      <button
                        onClick={() => navigate('/solutions')}
                        className="w-fit hover:opacity-90 transition-opacity"
                        style={{
                          background: 'linear-gradient(135deg, #b4507a, #8a4a6e)', color: '#fff', border: 'none', borderRadius: 8,
                          padding: '10px 20px', fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
                          fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        }}
                      >
                        {t('landing.showcase.fashion_cta')}
                      </button>

                      {/* Divider */}
                      <div className="hidden md:block w-full h-px bg-white/[0.06] my-1" />

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-4 text-[12px] text-white/40" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                        <span><span className="text-white/70 font-semibold">{SHOWCASE_FASHION_ALBUMS.length}</span> {t('landing.showcase.albums')}</span>
                        <span><span className="text-white/70 font-semibold">{SHOWCASE_FASHION_IMAGES.length}</span> {t('landing.showcase.photos')}</span>
                        <span><span className="text-white/70 font-semibold">{SHOWCASE_FASHION_VIDEOS.filter(v => v.videoUrl).length}</span> {t('landing.showcase.videos')}</span>
                      </div>

                      {/* Feature tags */}
                      <div className="hidden md:flex flex-wrap gap-1.5">
                        {SHOWCASE_FASHION_ALBUMS.map(a => (
                          <span key={a.id} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.04] text-white/40 border border-white/[0.06]">
                            {a.subtitle.split(' — ')[1] || a.subtitle}
                          </span>
                        ))}
                      </div>

                    </div>

                    {/* Right column — Album cards grid */}
                    <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(() => {
                        // Interleave albums & videos: insert a video card after every 2 album cards
                        const items: { type: 'album' | 'video'; data: any }[] = [];
                        const vids = SHOWCASE_FASHION_VIDEOS.filter(v => v.videoUrl);
                        let vi = 0;
                        SHOWCASE_FASHION_ALBUMS.forEach((album, ai) => {
                          items.push({ type: 'album', data: album });
                          if ((ai + 1) % 2 === 0 && vi < vids.length) {
                            items.push({ type: 'video', data: vids[vi++] });
                          }
                        });
                        // Append remaining videos
                        while (vi < vids.length) items.push({ type: 'video', data: vids[vi++] });

                        return items.map(item => {
                          if (item.type === 'album') {
                            const album = item.data;
                            return (
                              <div
                                key={album.id}
                                className="relative overflow-hidden group/album cursor-pointer rounded-xl transition-all duration-300 bg-[#0f1720] border hover:shadow-lg h-[200px] md:h-[240px]"
                                style={{ borderColor: `${album.color}30`, boxShadow: `0 0 0 0 ${album.color}00` }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = `${album.color}80`; e.currentTarget.style.boxShadow = `0 4px 20px ${album.color}20`; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = `${album.color}30`; e.currentTarget.style.boxShadow = `0 0 0 0 ${album.color}00`; }}
                                onClick={() => setSelectedShowcaseItem({
                                  id: `fashion-album-${album.id}`,
                                  title: album.name,
                                  description: `${album.subtitle} · ${album.images.length} photos`,
                                  type: 'image',
                                  thumbnailUrl: album.cover,
                                  mediaUrl: album.cover,
                                  model: 'google_image_gen_4_5',
                                  modelKey: 'Imagen 4.5',
                                  engine: 'Google Imagen 4.5',
                                  resolution: 'Mixed',
                                  tags: ['showcase', 'fashion', album.id],
                                  categories: ['showcase', 'fashion'],
                                  createdAt: '2026-05-08',
                                  prompt: album.images[0]?.prompt || '',
                                })}
                              >
                                {/* 2×2 mosaic background */}
                                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
                                  {album.images.slice(0, 4).map((img: any) => (
                                    <div key={img.id} className="overflow-hidden">
                                      <img src={img.img} alt="" className="w-full h-full object-cover opacity-60 group-hover/album:opacity-80 group-hover/album:scale-105 transition-all duration-500" loading="lazy" />
                                    </div>
                                  ))}
                                </div>
                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />
                                {/* Album badge — top right */}
                                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ background: `${album.color}30`, border: `1px solid ${album.color}50`, color: album.color, backdropFilter: 'blur(8px)' }}>
                                  {album.images.length} photos
                                </div>
                                {/* Bottom info */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                                  <p className="text-[13px] font-bold text-white/90 truncate" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', color: album.color }}>{album.name}</p>
                                  <p className="text-[10px] text-white/50 mt-0.5 truncate">{album.subtitle}</p>
                                </div>
                              </div>
                            );
                          } else {
                            const vid = item.data;
                            return (
                              <div
                                key={vid.id}
                                className="relative overflow-hidden group/vid cursor-pointer rounded-xl transition-all duration-300 bg-[#0f1720] border border-amber-500/20 hover:border-amber-500/60 hover:shadow-lg h-[200px] md:h-[240px]"
                                onClick={() => setSelectedShowcaseItem({
                                  id: `fashion-video-${vid.id}`,
                                  title: vid.name,
                                  description: vid.product,
                                  type: 'video',
                                  thumbnailUrl: vid.videoUrl,
                                  mediaUrl: vid.videoUrl,
                                  model: 'veo_3_generate',
                                  modelKey: 'Veo 3',
                                  engine: 'Google Veo 3',
                                  resolution: '720p',
                                  tags: ['showcase', 'fashion', 'video', vid.character],
                                  categories: ['showcase', 'fashion'],
                                  createdAt: '2026-05-08',
                                  prompt: vid.prompt,
                                })}
                              >
                                {/* Video preview */}
                                <video
                                  src={vid.videoUrl}
                                  muted
                                  loop
                                  playsInline
                                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/vid:opacity-90 transition-opacity duration-500"
                                  onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                                  onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                                />
                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 pointer-events-none" />
                                {/* Video badge — top right */}
                                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-400" style={{ backdropFilter: 'blur(8px)' }}>
                                  <Play size={8} fill="currentColor" /> Video
                                </div>
                                {/* Bottom info */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                                  <p className="text-[13px] font-bold text-amber-400 truncate" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>{vid.name}</p>
                                  <p className="text-[10px] text-white/50 mt-0.5 truncate">{vid.product}</p>
                                </div>
                              </div>
                            );
                          }
                        });
                      })()}
                    </div>
                    </div>{/* end right column */}
                  </div>
                </FadeInUp>
                  <button onClick={() => toggleGroup('fashion')} className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105" style={{ background: 'rgba(180,80,122,0.15)', border: '1px solid rgba(180,80,122,0.3)', color: '#d48aab', backdropFilter: 'blur(8px)' }}>
                    {expandedGroups['fashion'] ? <><ChevronUp size={14} /> {t('landing.showcase.collapse')}</> : <><ChevronDown size={14} /> {t('landing.showcase.load_more')}</>}
                  </button>
                </div>{/* end Fashion Showcase frame */}

                {/* ── 3D Model Showcase ── */}
                <div className={`relative bg-[#0a0c0e] overflow-hidden transition-all duration-500 ${expandedGroups['3d'] ? '' : 'max-h-[700px]'}`} style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', padding: '40px max(24px, calc((100vw - 1312px) / 2))' }}>
                  {/* Background video — random 3D model turntable */}
                  <div className="absolute inset-0 pointer-events-none">
                    <video src={(() => { const vids = SHOWCASE_3D_MODELS.filter(m => m.videoUrl); return vids[Math.floor(Math.random() * vids.length)]?.videoUrl || ''; })()} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#0a0c0e]/85" />
                  </div>
                  {/* Subtle teal glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(0,200,180,0.06)_0%,transparent_70%)] pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(0,140,200,0.04)_0%,transparent_70%)] pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/10 to-transparent" />
                  {!expandedGroups['3d'] && <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0a0c0e] via-[#0a0c0e]/80 to-transparent z-10 pointer-events-none" />}
                <FadeInUp delay={0.2}>
                  <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Left column — Section info */}
                    <div className="md:w-1/4 shrink-0 flex flex-col gap-4 md:py-8">
                      <h3 className="showcase-gold-title" style={{
                        fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 800,
                        fontSize: 28, margin: 0, letterSpacing: '0.02em', lineHeight: 1.2,
                      }}>
                        3D Models
                      </h3>
                      <p className="text-[13px] text-white/50 leading-relaxed" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                        {t('landing.showcase.3d_desc')}
                      </p>
                      <button
                        onClick={() => navigate('/solutions')}
                        className="w-fit hover:opacity-90 transition-opacity"
                        style={{
                          background: 'linear-gradient(135deg, #00c8b4, #0088cc)', color: '#fff', border: 'none', borderRadius: 8,
                          padding: '10px 20px', fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
                          fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        }}
                      >
                        {t('landing.showcase.3d_cta')}
                      </button>

                      <div className="hidden md:block w-full h-px bg-white/[0.06] my-1" />

                      <div className="hidden md:flex items-center gap-4 text-[12px] text-white/40" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                        <span><span className="text-white/70 font-semibold">{SHOWCASE_3D_MODELS.length}</span> {t('landing.showcase.models')}</span>
                        <span><span className="text-white/70 font-semibold">PBR</span> ready</span>
                      </div>

                      <div className="hidden md:flex flex-wrap gap-1.5">
                        {[t('landing.showcase.3d_tag1'), t('landing.showcase.3d_tag2'), t('landing.showcase.3d_tag3'), t('landing.showcase.3d_tag4'), t('landing.showcase.3d_tag5')].map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-teal-500/[0.06] text-teal-300/50 border border-teal-500/10">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Mini preview grid */}
                      <div className="hidden md:grid grid-cols-3 gap-1.5 mt-1">
                        {SHOWCASE_3D_MODELS.slice(0, 6).map(item => (
                          <div key={item.id} className="aspect-square rounded-lg overflow-hidden border border-teal-800/15 bg-[#1a1c1e]">
                            <img src={item.thumb} alt={item.name} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-300" loading="lazy" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right column — 3D Model Cards grid */}
                    <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                      {SHOWCASE_3D_MODELS.map((item) => (
                        <div
                          key={item.id}
                          className="relative group/card cursor-pointer rounded-xl overflow-hidden bg-[#1a1c1e] border border-white/[0.04] hover:border-teal-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/10"
                          onMouseEnter={(e) => {
                            const v = e.currentTarget.querySelector('video') as HTMLVideoElement | null;
                            if (!v) return;
                            if (!v.src && v.dataset.src) {
                              v.src = v.dataset.src;
                              v.load();
                              v.onloadeddata = () => { v.currentTime = 0; v.play().catch(() => {}); };
                            } else {
                              v.currentTime = 0;
                              v.play().catch(() => {});
                            }
                          }}
                          onMouseLeave={(e) => {
                            const v = e.currentTarget.querySelector('video') as HTMLVideoElement | null;
                            if (!v) return;
                            v.pause();
                            v.currentTime = 0;
                            v.onloadeddata = null;
                          }}
                          onClick={() => setSelectedShowcaseItem({
                            id: item.id, title: item.name, description: `${item.creator} — ${item.category}`, type: 'video',
                            thumbnailUrl: item.thumb, mediaUrl: item.videoUrl,
                            model: '3d_model', modelKey: '3D Model',
                            engine: item.software || 'ZBrush',
                            resolution: item.polyCount || 'N/A',
                            tags: ['showcase', '3d', ...item.tags],
                            categories: ['showcase', '3d'],
                            createdAt: '2026-05-08',
                            prompt: `${item.name} by ${item.creator}. ${item.polyCount} polys. Made with ${item.software}.`,
                          })}
                        >
                          {/* Thumbnail / Video container */}
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#141618]">
                            {/* Static thumbnail */}
                            <img
                              src={item.thumb}
                              alt={item.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover/card:opacity-0 transition-opacity duration-300"
                              loading="lazy"
                            />
                            {/* Video on hover */}
                            {item.videoUrl && (
                            <video
                              data-src={item.videoUrl}
                              poster={item.thumb}
                              preload="none"
                              muted
                              loop
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"
                            />
                            )}

                            {/* Pause/Play icon — top left */}
                            <div className="absolute top-2 left-2 z-10">
                              <div className="w-6 h-6 rounded bg-black/50 flex items-center justify-center backdrop-blur-sm opacity-60 group-hover/card:opacity-90 transition-opacity">
                                <Play size={10} fill="#fff" color="#fff" className="group-hover/card:hidden" />
                                <div className="hidden group-hover/card:flex items-center gap-0.5">
                                  <div className="w-[3px] h-[10px] bg-white rounded-sm" />
                                  <div className="w-[3px] h-[10px] bg-white rounded-sm" />
                                </div>
                              </div>
                            </div>

                            {/* Featured star — top right */}
                            {item.featured && (
                              <div className="absolute top-2 right-2 z-10">
                                <Sparkles size={14} className="text-amber-400 drop-shadow-lg" />
                              </div>
                            )}

                            {/* Hover gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c1e] via-transparent to-transparent opacity-60 pointer-events-none" />
                          </div>

                          {/* Footer — Creator info + likes */}
                          <div className="px-2.5 py-2 flex items-center gap-2 bg-[#1a1c1e]">
                            <img
                              src={item.creatorAvatar}
                              alt={item.creator}
                              className="w-5 h-5 rounded-full shrink-0 border border-white/10"
                              loading="lazy"
                            />
                            <span className="text-[11px] text-white/70 font-medium truncate flex-1" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                              {item.creator}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <Heart size={10} className="text-red-400/70" />
                              <span className="text-[10px] text-white/50 font-medium">{item.likes}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    </div>{/* end right column */}
                  </div>
                </FadeInUp>
                  <button onClick={() => toggleGroup('3d')} className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105" style={{ background: 'rgba(0,200,180,0.15)', border: '1px solid rgba(0,200,180,0.3)', color: '#5ce0d0', backdropFilter: 'blur(8px)' }}>
                    {expandedGroups['3d'] ? <><ChevronUp size={14} /> {t('landing.showcase.collapse')}</> : <><ChevronDown size={14} /> {t('landing.showcase.load_more')}</>}
                  </button>
                </div>{/* end 3D Model Showcase frame */}

              </div>

              {/* Showcase modal */}
              <ExplorerDetailModal
                item={selectedShowcaseItem}
                onClose={() => setSelectedShowcaseItem(null)}
                albumItems={(() => {
                  const albumMatch = selectedShowcaseItem?.id?.match(/^fashion-album-(.+)$/);
                  if (!albumMatch) return undefined;
                  const album = SHOWCASE_FASHION_ALBUMS.find(a => a.id === albumMatch[1]);
                  if (!album) return undefined;
                  return album.images.map(img => ({
                    id: img.id,
                    title: img.product,
                    description: `${album.name} — ${img.name}`,
                    type: 'image' as const,
                    thumbnailUrl: img.img,
                    mediaUrl: img.img,
                    model: 'google_image_gen_4_5',
                    modelKey: 'Imagen 4.5',
                    engine: 'Google Imagen 4.5',
                    resolution: img.ratio === '16:9' ? '1920 × 1080' : img.ratio === '9:16' ? '1080 × 1920' : '1024 × 1024',
                    tags: ['showcase', 'fashion', img.tag, img.character],
                    categories: ['showcase', 'fashion'],
                    createdAt: '2026-05-08',
                    prompt: img.prompt,
                  }));
                })()}
              />

              {/* Showcase masonry CSS — columns layout for zigzag/dense packing */}
              <style>{`
                .showcase-masonry {
                  columns: 2;
                  column-gap: 6px;
                }
                .showcase-masonry-item {
                  break-inside: avoid;
                  margin-bottom: 6px;
                }
                @media (min-width: 640px) { .showcase-masonry { columns: 3; } }
                @media (min-width: 768px) { .showcase-masonry { columns: 3; } }
                @media (min-width: 1024px) { .showcase-masonry { columns: 4; } }

                /* Gold shimmer title */
                .showcase-gold-title {
                  background: linear-gradient(
                    90deg,
                    #C9A84C 0%,
                    #F5E6A3 25%,
                    #C9A84C 50%,
                    #A8862A 75%,
                    #C9A84C 100%
                  );
                  background-size: 200% 100%;
                  -webkit-background-clip: text;
                  background-clip: text;
                  -webkit-text-fill-color: transparent;
                  animation: showcase-gold-shimmer 3s ease-in-out infinite;
                }
                @keyframes showcase-gold-shimmer {
                  0% { background-position: 100% 50%; }
                  50% { background-position: 0% 50%; }
                  100% { background-position: 100% 50%; }
                }
              `}</style>
            </section>
            </LazySection>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 2C: BUILD APPS — Pillar 3 (faster & cheaper app dev)
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', background: '#fff', padding: '88px 0', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
              <div style={{ padding: '0 64px', boxSizing: 'border-box', maxWidth: 1200, margin: '0 auto' }}>
                <AnimatedSectionHeader
                  label={t('landing.buildapps.label')}
                  title={t('landing.buildapps.title')}
                  desc={t('landing.buildapps.desc')}
                  style={{ marginBottom: 48 }}
                />

                <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
                  {[
                    { t: 'landing.buildapps.f1_title', d: 'landing.buildapps.f1_desc' },
                    { t: 'landing.buildapps.f2_title', d: 'landing.buildapps.f2_desc' },
                    { t: 'landing.buildapps.f3_title', d: 'landing.buildapps.f3_desc' },
                  ].map((card) => (
                    <StaggerItem key={card.t}>
                      <div style={{ height: '100%', boxSizing: 'border-box', padding: '28px 28px 30px', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', background: '#fafbfc' }}>
                        <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 20, lineHeight: 1.3, color: '#0a0f1a', margin: '0 0 12px' }}>
                          {t(card.t)}
                        </h3>
                        <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: 'rgba(10,15,26,0.62)', margin: 0 }}>
                          {t(card.d)}
                        </p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                <FadeInUp style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => navigate('/booking')}
                    style={{
                      fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 600, fontSize: 15,
                      color: '#0a0f1a', background: '#C9A84C', border: 'none', borderRadius: 999,
                      padding: '14px 32px', cursor: 'pointer',
                    }}
                  >
                    {t('landing.buildapps.cta')}
                  </button>
                </FadeInUp>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * SECTIONS 3-7: TEMPORARILY HIDDEN (sẽ bổ sung sau)
             * ═══════════════════════════════════════════════════════════ */}
            {false && (<>
            {/* ═══════════════════════════════════════════════════════════
             * SECTION 3: FEATURED MODEL DEEP DIVES
             * Repeating: 2-col (text + image), alternating sides
             * Sub-model grid below with pricing (strikethrough + sale)
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ padding: '40px 0 80px' }}>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', boxSizing: 'border-box' }}>
                {/* Atlas section header */}
                <AnimatedSectionHeader
                  label={t('landing.featured.label')}
                  title={t('landing.featured.title')}
                  desc={t('landing.featured.desc')}
                />

                {/* Cards — Atlas CreatorPaths 2-col grid */}
                <StaggerContainer stagger={0.15} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, width: '100%' }}>
                  {modelSeries.map((sol) => {
                    const subModels = getSubModels(sol);
                    return (
                      <StaggerItem key={sol._id || sol.id}>
                      <div
                        className="hov-card"
                        style={{ background: '#fff', borderRadius: 4, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box', overflow: 'hidden', height: '100%' }}
                      >
                        {/* Card title */}
                        <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 36, lineHeight: 1.366, letterSpacing: '-0.02em', color: '#1a2330', margin: 0 }}>
                          {sol.name?.[currentLang]}
                        </h3>

                        {/* Card image */}
                        <div className="hov-img-wrap" style={{ position: 'relative', width: '100%', aspectRatio: '605/338', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                          <img
                            src={sol.imageUrl}
                            alt={sol.name?.[currentLang] || ''}
                            className="hov-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                          />
                        </div>

                        {/* Description */}
                        <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0, flex: '1 1' }}>
                          {sol.description?.[currentLang]}
                        </p>

                        {/* Sub-models as bullet list */}
                        {subModels.length > 0 && (
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, listStyle: 'none', padding: 0, margin: 0 }}>
                            {subModels.map((sub, si) => (
                              <li key={si} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a2330', flexShrink: 0 }} />
                                <span style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 16, lineHeight: 1.366, color: '#1a2330' }}>
                                  {sub.name}
                                </span>
                                {sub.originalPrice && (
                                  <span style={{ fontSize: 12, color: 'rgba(26,35,48,0.5)', textDecoration: 'line-through', marginLeft: 'auto' }}>{sub.originalPrice}</span>
                                )}
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginLeft: sub.originalPrice ? 4 : 'auto' }}>{sub.price}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* CTA button — Atlas outlined */}
                        <button
                          onClick={() => handleNavigate(sol.slug)}
                          style={{
                            alignSelf: 'flex-start', height: 36, padding: '8px 20px', borderRadius: 4,
                            border: '1px solid #1a2330', background: 'transparent',
                            fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.366,
                            color: '#1a2330', cursor: 'pointer', marginTop: 4,
                            display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
                          }}
                          className="hov-btn-outline"
                        >
                          Explore
                        </button>
                      </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 4: BUILD — "From idea to scale, in one touch"
             * Light bg, tab nav (APIs / Serverless / Compute)
             * 2-col: checklist left, image right
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ padding: '40px 0 80px', position: 'relative', zIndex: 2 }}>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', boxSizing: 'border-box' }}>
                {/* Atlas section header */}
                <AnimatedSectionHeader
                  label={t('landing.tools.label')}
                  title={t('landing.tools.title')}
                  desc={t('landing.tools.desc')}
                />

                {/* Atlas underline tab bar */}
                <FadeInUp delay={0.2}>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: 48, borderBottom: '1px solid rgba(26,35,48,0.5)', marginBottom: 20 }}>
                  {(['apis', 'serverless', 'compute'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveBuildTab(tab)}
                      style={{
                        fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 600, fontSize: 16, lineHeight: '1.366em',
                        color: '#1a2330', background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '0 0 12px', position: 'relative', whiteSpace: 'nowrap',
                        opacity: activeBuildTab === tab ? 1 : 0.5,
                        borderBottom: activeBuildTab === tab ? '2px solid #1a2330' : '2px solid transparent',
                        marginBottom: -1,
                      }}
                      className="hov-tab"
                    >
                      {tab === 'apis' ? t('landing.build.tab_image') : tab === 'serverless' ? t('landing.build.tab_video') : t('landing.build.tab_audio')}
                    </button>
                  ))}
                </div>

                {/* Atlas BuildStack card — 3-col grid */}
                <div style={{
                  background: '#fff', borderRadius: 4, padding: '26px 34px',
                  display: 'grid', gridTemplateColumns: '325px 1fr 450px', alignItems: 'stretch', gap: 24,
                  boxSizing: 'border-box', position: 'relative', height: 331,
                }}>
                  {/* Left col */}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 600, fontSize: 16, lineHeight: 1.375, color: '#1a2330', margin: 0 }}>
                      {activeBuildContent.title}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 600, fontSize: 14, lineHeight: 1.5, color: 'rgba(26,35,48,0.5)', margin: '12px 0 0' }}>
                      {activeBuildContent.desc}
                    </p>
                    <a
                      onClick={() => navigate('/booking')}
                      style={{
                        marginTop: 'auto', paddingTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8,
                        fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.366,
                        color: '#C9A84C', textDecoration: 'none', cursor: 'pointer', alignSelf: 'flex-start',
                      }}
                      className="hover:text-[#B8963F] transition-colors"
                    >
                      {activeBuildContent.cta} →
                    </a>
                  </div>

                  {/* Mid col — bullet list */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 12, minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 600, fontSize: 14, lineHeight: 1.5, color: 'rgba(26,35,48,0.5)', margin: '4px 0 0' }}>
                      Features
                    </span>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {activeBuildContent.features.map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#1a2330', opacity: 0.5, flexShrink: 0, transform: 'translateY(-3px)' }} />
                          <span style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 600, fontSize: 14, lineHeight: 1.5, color: '#1a2330', opacity: 0.5 }}>
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right col — image */}
                  <div className="hov-img-wrap" style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 4, overflow: 'hidden', background: '#d9d9d9' }}>
                    <img
                      src={activeBuildContent.image}
                      alt={activeBuildContent.title}
                      className="hov-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                </div>
                </FadeInUp>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 5: CREATE — 2-col cards (Develop | Create)
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ padding: '40px 0 80px', position: 'relative', zIndex: 2 }}>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', boxSizing: 'border-box' }}>
                <AnimatedSectionHeader
                  label={t('landing.create.label')}
                  title={t('landing.create.title')}
                  desc={t('landing.create.desc')}
                />

                {/* Atlas 2-col card grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, width: '100%' }}>
                  {/* Develop Card */}
                  <SlideIn from="left">
                  <div className="hov-card" style={{ background: '#fff', borderRadius: 4, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box', overflow: 'hidden', height: '100%' }}>
                    <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 36, lineHeight: '1.366em', letterSpacing: '-0.02em', color: '#1a2330', margin: 0 }}>
                      {t('landing.create.pro_title')}
                    </h3>
                    <div className="hov-img-wrap" style={{ position: 'relative', width: '100%', aspectRatio: '605/338', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                      <img src="/assets/homepage/gold-create-professionals.webp" alt={t('landing.create.pro_title')} className="hov-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0, flex: '1 1' }}>
                      {t('landing.create.pro_desc')}
                    </p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, listStyle: 'none', padding: 0, margin: 0 }}>
                      {[t('landing.create.pro_b1'), t('landing.create.pro_b2'), t('landing.create.pro_b3')].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a2330', flexShrink: 0 }} />
                          <span style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 16, lineHeight: '1.366em', color: '#1a2330' }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => navigate('/booking')}
                      style={{
                        alignSelf: 'flex-start', height: 36, padding: '8px 20px', borderRadius: 4,
                        border: '1px solid #1a2330', background: 'transparent',
                        fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.366,
                        color: '#1a2330', cursor: 'pointer', marginTop: 4,
                        display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
                      }}
                      className="hov-btn-outline"
                    >
                      {t('landing.create.pro_cta')}
                    </button>
                  </div>
                  </SlideIn>

                  {/* Create Card */}
                  <SlideIn from="right">
                  <div className="hov-card" style={{ background: '#fff', borderRadius: 4, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box', overflow: 'hidden', height: '100%' }}>
                    <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 36, lineHeight: '1.366em', letterSpacing: '-0.02em', color: '#1a2330', margin: 0 }}>
                      {t('landing.create.creator_title')}
                    </h3>
                    <div className="hov-img-wrap" style={{ position: 'relative', width: '100%', aspectRatio: '605/338', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                      <img src="/assets/homepage/gold-create-creators.webp" alt={t('landing.create.creator_title')} className="hov-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0, flex: '1 1' }}>
                      {t('landing.create.creator_desc')}
                    </p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, listStyle: 'none', padding: 0, margin: 0 }}>
                      {[t('landing.create.creator_b1'), t('landing.create.creator_b2'), t('landing.create.creator_b3')].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a2330', flexShrink: 0 }} />
                          <span style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 16, lineHeight: '1.366em', color: '#1a2330' }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => navigate('/markets')}
                      style={{
                        alignSelf: 'flex-start', height: 36, padding: '8px 20px', borderRadius: 4,
                        border: '1px solid #1a2330', background: 'transparent',
                        fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.366,
                        color: '#1a2330', cursor: 'pointer', marginTop: 4,
                        display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
                      }}
                      className="hov-btn-outline"
                    >
                      {t('landing.why.explore_all')}
                    </button>
                  </div>
                  </SlideIn>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 6: WHY SKYVERSES — 4-col feature grid
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ width: '100%', background: '#fff', padding: '88px 0 72px', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', boxSizing: 'border-box' }}>
                <AnimatedSectionHeader
                  label={t('landing.why.label')}
                  title={t('landing.why.title')}
                  desc={t('landing.why.desc')}
                />

                {/* Content: hero image + feature list */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: 48, alignItems: 'stretch', width: '100%' }}>
                  {/* Hero image */}
                  <SlideIn from="left">
                  <div className="hov-img-wrap" style={{ flex: '1 1', minWidth: 0, borderRadius: 4, overflow: 'hidden', position: 'relative', aspectRatio: '920/514', background: '#fff' }}>
                    <img
                      src="/assets/homepage/gold-why-skyverses-hero.webp"
                      alt="Why Skyverses"
                      className="hov-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                  </SlideIn>

                  {/* Feature list */}
                  <SlideIn from="right">
                  <ul style={{ flex: '0 0 322px', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {[
                      { title: t('landing.why.f1_title'), desc: t('landing.why.f1_desc'), icon: '/assets/homepage/gold-feature-all-in-one.webp' },
                      { title: t('landing.why.f2_title'), desc: t('landing.why.f2_desc'), icon: '/assets/homepage/gold-feature-pay-per-use.webp' },
                      { title: t('landing.why.f3_title'), desc: t('landing.why.f3_desc'), icon: '/assets/homepage/gold-feature-latest-models.webp' },
                      { title: t('landing.why.f4_title'), desc: t('landing.why.f4_desc'), icon: '/assets/homepage/gold-feature-lightning-fast.webp' },
                    ].map((it) => (
                      <li key={it.title} className="hov-feature" style={{ display: 'flex', flexDirection: 'column', cursor: 'default' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 27 }}>
                          <img src={it.icon} alt={it.title} style={{ flex: '0 0 auto', width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} loading="lazy" />
                          <span style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 20, lineHeight: 1.366, color: '#1a2330', margin: 0 }}>
                            {it.title}
                          </span>
                        </div>
                        <hr style={{ display: 'block', width: '100%', height: 0, border: 0, borderTop: '1px solid #1a2330', margin: '12px 0', flexShrink: 0 }} />
                        <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 14, lineHeight: 1.366, color: 'rgba(26,35,48,0.6)', margin: 0 }}>
                          {it.desc}
                        </p>
                      </li>
                    ))}
                  </ul>
                  </SlideIn>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 7: ENTERPRISE SCALE — 3-col cards
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ width: '100%', background: '#fff', padding: '72px 0 96px', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', boxSizing: 'border-box' }}>
                <AnimatedSectionHeader
                  label={t('landing.teams.label')}
                  title={t('landing.teams.title')}
                  desc={t('landing.teams.desc')}
                />
                {/* Action buttons */}
                <FadeInUp delay={0.2}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24, marginBottom: 56, width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 20, marginTop: 10 }}>
                      <button
                        onClick={() => navigate('/booking')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 147, height: 36, padding: '8px 20px', borderRadius: 4,
                          background: '#C9A84C', color: '#ebf4fb', border: '1px solid transparent',
                          fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 500, fontSize: 16, lineHeight: 1.366,
                          textDecoration: 'none', boxSizing: 'border-box', cursor: 'pointer',
                        }}
                        className="hov-btn-gold"
                      >
                        {t('landing.teams.contact')}
                      </button>
                      <button
                        onClick={() => navigate('/about')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 147, height: 36, padding: '8px 20px', borderRadius: 4,
                          background: 'transparent', color: '#1a2330', border: '1px solid #1a2330',
                          fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 500, fontSize: 16, lineHeight: 1.366,
                          textDecoration: 'none', boxSizing: 'border-box', cursor: 'pointer',
                        }}
                        className="hov-btn-outline"
                      >
                        {t('landing.teams.learn')}
                      </button>
                    </div>
                </div>
                </FadeInUp>

                {/* Top 2-col cards */}
                <StaggerContainer stagger={0.15} className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  {[
                    {
                      title: t('landing.teams.fresh_title'),
                      img: '/assets/homepage/gold-ent-always-fresh.webp',
                      bullets: [t('landing.teams.fresh_b1'), t('landing.teams.fresh_b2'), t('landing.teams.fresh_b3')],
                    },
                    {
                      title: t('landing.teams.ready_title'),
                      img: '/assets/homepage/gold-ent-team-ready.webp',
                      bullets: [t('landing.teams.ready_b1'), t('landing.teams.ready_b2'), t('landing.teams.ready_b3')],
                    },
                  ].map((card) => (
                    <StaggerItem key={card.title}>
                    <div className="hov-card" style={{ background: '#fff', borderRadius: 4, padding: '40px 30px 56px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 32, height: '100%' }}>
                      <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 40, lineHeight: 1.366, color: '#1a2330', margin: 0 }}>
                        {card.title}
                      </h3>
                      <div className="hov-img-wrap" style={{ width: '100%', aspectRatio: '591/330', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                        <img src={card.img} alt={card.title} className="hov-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {card.bullets.map(b => (
                          <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                            <span style={{ flex: '0 0 auto', width: 8, height: 8, background: '#1a2330', marginTop: 8 }} />
                            <span style={{ flex: '1 1 auto', fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 20, lineHeight: 1.366, color: '#1a2330' }}>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                {/* Wide card — row layout */}
                <FadeInUp delay={0.2}>
                <div className="hov-card" style={{ background: '#fff', borderRadius: 4, padding: '64px 30px 56px', boxSizing: 'border-box', display: 'flex', flexDirection: 'row', gap: 48, alignItems: 'flex-start' }}>
                  <SlideIn from="left">
                  <div style={{ flex: '0 0 auto', width: 438, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 50 }}>
                    <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 40, lineHeight: 1.366, color: '#1a2330', margin: 0 }}>
                      {t('landing.teams.vol_title')}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0 }}>
                      {t('landing.teams.vol_desc')}
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[t('landing.teams.vol_b1'), t('landing.teams.vol_b2'), t('landing.teams.vol_b3')].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                          <span style={{ flex: '0 0 auto', width: 8, height: 8, background: '#1a2330', marginTop: 8 }} />
                          <span style={{ flex: '1 1 auto', fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 20, lineHeight: 1.366, color: '#1a2330' }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  </SlideIn>
                  <SlideIn from="right">
                  <div className="hov-img-wrap" style={{ flex: '1 1 auto', minWidth: 0, aspectRatio: '789/440', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                    <img src="/assets/homepage/gold-ent-volume-pricing.webp" alt="Ultra-high Throughput" className="hov-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                  </div>
                  </SlideIn>
                </div>
                </FadeInUp>
              </div>
            </section>
            </>)}

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 8: ENTERPRISE — Giải pháp AI cho doanh nghiệp
             * ═══════════════════════════════════════════════════════════ */}
            <LazySection skeleton={<EnterpriseSectionSkeleton />} rootMargin="300px" minHeight={600}>
            <section style={{ width: '100%', background: '#fff', padding: '72px 0 96px', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', boxSizing: 'border-box' }}>
                <AnimatedSectionHeader
                  label={t('landing.ent.label')}
                  title={t('landing.ent.title')}
                  desc={t('landing.ent.desc')}
                />
                {/* Action buttons */}
                <FadeInUp delay={0.2}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24, marginBottom: 56, width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 20, marginTop: 10 }}>
                      <button
                        onClick={() => navigate('/booking')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 147, height: 36, padding: '8px 20px', borderRadius: 4,
                          background: '#C9A84C', color: '#ebf4fb', border: '1px solid transparent',
                          fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 500, fontSize: 16, lineHeight: 1.366,
                          textDecoration: 'none', boxSizing: 'border-box', cursor: 'pointer',
                        }}
                        className="hov-btn-gold"
                      >
                        {t('landing.ent.cta1')}
                      </button>
                      <button
                        onClick={() => navigate('/about')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 147, height: 36, padding: '8px 20px', borderRadius: 4,
                          background: 'transparent', color: '#1a2330', border: '1px solid #1a2330',
                          fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 500, fontSize: 16, lineHeight: 1.366,
                          textDecoration: 'none', boxSizing: 'border-box', cursor: 'pointer',
                        }}
                        className="hov-btn-outline"
                      >
                        {t('landing.ent.cta2')}
                      </button>
                    </div>
                </div>
                </FadeInUp>

                {/* Top 2-col cards */}
                <StaggerContainer stagger={0.15} className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  {enterpriseOfferings.slice(0, 2).map((card) => (
                    <StaggerItem key={card.title}>
                    <div className="hov-card" style={{ background: '#fff', borderRadius: 4, padding: '40px 30px 56px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 32, height: '100%' }}>
                      <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 40, lineHeight: 1.366, color: '#1a2330', margin: 0 }}>
                        {card.title}
                      </h3>
                      <LazyImage src={card.image} alt={card.title} className="hov-img-wrap" style={{ width: '100%', aspectRatio: '591/330', borderRadius: 4, overflow: 'hidden', background: '#fff' }} />
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {card.bullets.map(b => (
                          <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                            <span style={{ flex: '0 0 auto', width: 8, height: 8, background: '#1a2330', marginTop: 8 }} />
                            <span style={{ flex: '1 1 auto', fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 20, lineHeight: 1.366, color: '#1a2330' }}>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                {/* Bottom 2-col cards */}
                <StaggerContainer stagger={0.15} className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {enterpriseOfferings.slice(2, 4).map((card) => (
                    <StaggerItem key={card.title}>
                    <div className="hov-card" style={{ background: '#fff', borderRadius: 4, padding: '40px 30px 56px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 32, height: '100%' }}>
                      <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 40, lineHeight: 1.366, color: '#1a2330', margin: 0 }}>
                        {card.title}
                      </h3>
                      <LazyImage src={card.image} alt={card.title} className="hov-img-wrap" style={{ width: '100%', aspectRatio: '591/330', borderRadius: 4, overflow: 'hidden', background: '#fff' }} />
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {card.bullets.map(b => (
                          <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                            <span style={{ flex: '0 0 auto', width: 8, height: 8, background: '#1a2330', marginTop: 8 }} />
                            <span style={{ flex: '1 1 auto', fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 20, lineHeight: 1.366, color: '#1a2330' }}>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </section>
            </LazySection>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 8.6: HOMEBLOCKS (CMS-driven)
             * ═══════════════════════════════════════════════════════════ */}
            <LazySection skeleton={<HomeBlockSkeleton />} rootMargin="300px" minHeight={400}>
            {homeBlocks.map((block, blockIdx) => {
              const blockSols = solutions.filter(s => s.homeBlocks?.includes(block.key));
              if (blockSols.length === 0 && !loading) return null;
              return (
                <FadeInUp key={block.key} delay={blockIdx * 0.1}>
                <section className="py-14 md:py-20 bg-white">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                          {block.title?.[currentLang] || block.title?.en}
                        </h3>
                        {block.subtitle && (
                          <p className="mt-2 text-sm md:text-base text-white/50">
                            {block.subtitle[currentLang] || block.subtitle.en}
                          </p>
                        )}
                      </div>
                      <button onClick={() => navigate('/markets')} className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-[#C9A84C] hover:gap-2.5 transition-all">
                        View All <ArrowRight size={14} />
                      </button>
                    </div>
                    <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                      {loading
                        ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                        : blockSols.slice(0, block.limit || 8).map((sol, idx) => (
                          <SolutionCard
                            key={sol._id || sol.id}
                            sol={sol} idx={idx} lang={lang}
                            isLiked={likedItems.includes(sol._id || sol.id)}
                            isFavorited={favorites.includes(sol._id || sol.id)}
                            onToggleFavorite={toggleFavorite} onToggleLike={toggleLike}
                            onClick={handleNavigate} onHover={handlePrefetchOnHover}
                            onQuickView={handleQuickView} stats={getFakeStats(sol._id || sol.id)}
                          />
                        ))}
                    </div>
                  </div>
                </section>
                </FadeInUp>
              );
            })}
            </LazySection>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 9: TO THE DEVELOPERS
             * Philosophy section — centered long-form text
             * ═══════════════════════════════════════════════════════════ */}
            <LazySection skeleton={<DevelopersSkeleton />} rootMargin="300px" minHeight={500}>
            <section style={{ width: '100%', background: '#fff', padding: '88px 0 72px', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', boxSizing: 'border-box' }}>
                <AnimatedSectionHeader
                  label={t('landing.creators.label')}
                  title={t('landing.creators.title')}
                />

                {/* Content: 2-col — text + image */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: 48, alignItems: 'stretch', width: '100%' }}>
                  {/* Text column */}
                  <SlideIn from="left">
                  <div style={{ flex: '0 0 auto', width: 438, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0 }}>
                      {t('landing.creators.p1')}
                    </p>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0 }}>
                      {t('landing.creators.p2')}
                    </p>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0 }}>
                      {t('landing.creators.p3')}
                    </p>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 600, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0 }}>
                      {t('landing.creators.p4')}
                    </p>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 16, lineHeight: 1.5, color: '#C9A84C', margin: 0 }}>
                      {t('landing.creators.p5')}
                    </p>
                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 20, marginTop: 10 }}>
                      <button
                        onClick={() => navigate('/markets')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 147, height: 36, padding: '8px 20px', borderRadius: 4,
                          background: '#C9A84C', color: '#ebf4fb', border: '1px solid transparent',
                          fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 500, fontSize: 16, lineHeight: 1.366,
                          cursor: 'pointer',
                        }}
                        className="hov-btn-gold"
                      >
                        {t('landing.creators.cta1')}
                      </button>
                      <button
                        onClick={() => navigate(isAuthenticated ? '/apps' : '/login')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 147, height: 36, padding: '8px 20px', borderRadius: 4,
                          background: 'transparent', color: '#1a2330', border: '1px solid #1a2330',
                          fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 500, fontSize: 16, lineHeight: 1.366,
                          cursor: 'pointer',
                        }}
                        className="hov-btn-outline"
                      >
                        {isAuthenticated ? t('landing.creators.cta2_auth') : t('landing.creators.cta2_noauth')}
                      </button>
                    </div>
                  </div>
                  </SlideIn>
                  {/* Image column */}
                  <SlideIn from="right">
                  <LazyImage
                    src="/assets/homepage/gold-creators-hero.webp"
                    alt="To the developers"
                    className="hov-img-wrap"
                    style={{ flex: '1 1 auto', minWidth: 0, aspectRatio: '789/440', borderRadius: 4, overflow: 'hidden', background: '#fff' }}
                  />
                  </SlideIn>
                </div>
              </div>
            </section>
            </LazySection>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 10: ENTERPRISE CTA — light gradient
             * ═══════════════════════════════════════════════════════════ */}
            <LazySection skeleton={<CTASkeleton />} rootMargin="200px" minHeight={200}>
            <section style={{ width: '100%', background: '#1a2330', padding: '78px 0', position: 'relative', zIndex: 2, boxSizing: 'border-box', borderBottom: '1px solid rgba(235,244,251,0.2)', overflow: 'hidden' }}>
              {/* Background image */}
              <img
                src="/assets/homepage/gold-enterprise-cta-bg.webp"
                alt=""
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25, pointerEvents: 'none' }}
              />
              <FadeInUp>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', padding: '0 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 32, position: 'relative' }}>
                <BlurTextReveal
                  text={t('landing.cta.heading')}
                  as="h2"
                  delay={0.1}
                  charDelay={0.02}
                  style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 36, lineHeight: 1.366, letterSpacing: '-0.72px', color: '#ebf4fb', justifyContent: 'center' }}
                />
                <button
                  onClick={() => navigate('/booking')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: 36, minWidth: 140, padding: '8px 20px', borderRadius: 4,
                    background: '#ebf4fb', color: '#1a2330', border: 'none',
                    fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.366,
                    textDecoration: 'none', boxSizing: 'border-box', cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                  className="hov-btn-light"
                >
                  {t('landing.cta.button')}
                </button>
              </div>
              </FadeInUp>
            </section>
            </LazySection>
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

export default MarketPage;
