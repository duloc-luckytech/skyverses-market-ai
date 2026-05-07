import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion';
import { usePageMeta } from '../hooks/usePageMeta';
import { marketApi } from '../apis/market';
import { systemConfigApi } from '../apis/config';
import { Solution, HomeBlock, Language } from '../types';
import {
  X, SearchX, Search, ArrowRight, ChevronRight, Check,
  Cpu, Boxes, Zap, ExternalLink, Shield, Sparkles, Quote,
  ChevronLeft, Play, Globe, Server, Code2,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

import { CardSkeleton } from '../components/market/MarketSkeleton';
import { SolutionCard } from '../components/market/SolutionCard';
import ProductToolModal from '../components/market/ProductToolModal';
import GlobalToolsBar from '../components/GlobalToolsBar';
import AIModelsMarquee from '../components/AIModelsMarquee';

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

/** Section header animation — label + title + desc cascade */
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
        <span style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 24, lineHeight: 1.366, color: '#f38236', margin: 0, textTransform: 'uppercase' as const }}>
          {label}
        </span>
      </FadeInUp>
    )}
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FadeInUp delay={0.1} y={30}>
        <h2 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 36, lineHeight: 1.366, letterSpacing: '-0.72px', color: '#1a2330', margin: 0 }}>
          {title}
        </h2>
      </FadeInUp>
      {desc && (
        <FadeInUp delay={0.2} y={20}>
          <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.366, color: '#1a2330', margin: 0, maxWidth: 552 }}>
            {desc}
          </p>
        </FadeInUp>
      )}
      {children && <FadeInUp delay={0.3}>{children}</FadeInUp>}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
 * MarketPage — Clone 1:1 from atlascloud.ai
 * ═══════════════════════════════════════════════════════════════════ */

const MarketPage = () => {
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  usePageMeta({
    title: 'Skyverses — Full-Modal AI Inference Platform for Developers',
    description: 'Unified API access to 50+ leading AI models. Generate videos, images, music, voice & text with one integration. Up to 70% cheaper than AWS.',
    canonical: '/',
    jsonLd: {
      '@type': 'ItemList',
      name: 'Top AI Products — Skyverses Marketplace',
      url: 'https://ai.skyverses.com',
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
  const [activeModelTab, setActiveModelTab] = useState(0);
  const [activeBuildTab, setActiveBuildTab] = useState<'apis' | 'serverless' | 'compute'>('apis');

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
      title: 'Unified API Access',
      desc: 'One API for the entire AI lifecycle—ship production-grade AI in seconds, not months.',
      features: [
        '300+ curated models across text, image, video, and audio',
        'OpenAI-compatible endpoints as a drop-in replacement',
        'Streaming, batching, and structured outputs out of the box',
        'Native MCP servers and skills for agentic workflows',
        'Transparent pay-as-you-go pricing with no minimums',
      ],
      cta: 'Get API Key',
      image: '/assets/homepage/ent-api-integration.webp',
    },
    serverless: {
      title: 'Serverless Inference, Zero Ops',
      desc: 'Deploy AI at any scale without managing infrastructure. Auto-scaling, global edge, zero cold starts.',
      features: [
        'Auto-scaling to millions of requests',
        'Global edge deployment across 30+ regions',
        'Zero cold start for popular models',
        'Batch processing and async pipelines built-in',
        'WebSocket & webhook callbacks',
      ],
      cta: 'Deploy Now',
      image: '/assets/homepage/ent-deploy-scale.webp',
    },
    compute: {
      title: 'Bare-Metal Compute, Reserved',
      desc: 'Dedicated GPU clusters for enterprise. Fine-tune, train, and serve models with 99.9% SLA.',
      features: [
        'NVIDIA H100 / A100 GPU clusters',
        'Private model hosting & custom fine-tuning',
        'On-premise deployment option',
        'Up to 70% cheaper than AWS',
        'SOC II & HIPAA compliant infrastructure',
      ],
      cta: 'Contact Sales',
      image: '/assets/homepage/ent-ai-strategy.webp',
    },
  }), []);

  const activeBuildContent = buildTabs[activeBuildTab];

  /* Testimonials data */
  const testimonials = useMemo(() => [
    {
      quote: "Skyverses's Day-0 rollout of any SOTA model helps us drive new Ecomm user acquisition and boost existing subscriber retention.",
      company: 'StreamLake',
      role: 'VP of Engineering',
    },
    {
      quote: "Skyverses's stability and high-quality support allow our Ecomm teams to focus more on product innovation and less on operational overhead.",
      company: 'Higgsfield',
      role: 'CTO',
    },
    {
      quote: "Unified access to Skyverses models through OpenRouter lets our users ship faster with production-grade latency and uptime.",
      company: 'OpenRouter',
      role: 'Head of Partnerships',
    },
    {
      quote: "Skyverses's optimized inference lets creators run the latest SOTA models inside ComfyUI with zero infra lift.",
      company: 'ComfyUI',
      role: 'Founder',
    },
  ], []);

  /* ═══════════════════════════════════════════════════════════════════
   * RENDER
   * ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans antialiased">
      <div className="relative">
        {query ? (
          /* ════════ SEARCH MODE ════════ */
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-20">
            <div className="flex items-center gap-3 mb-8">
              <Search size={18} className="text-[#7036F0]" />
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Results for <span className="text-[#7036F0]">"{query}"</span>
              </h2>
              <button onClick={resetSearch} className="ml-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                <X size={14} /> Clear
              </button>
            </div>
            {isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filteredSolutions.length === 0 ? (
              <div className="text-center py-24">
                <SearchX size={56} className="mx-auto text-gray-300 mb-4" />
                <p className="text-base text-gray-500">No results found</p>
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
              {/* Background video (decorative) */}
              <video
                autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                src="https://static.atlascloud.ai/uploads/models/b449b2da-199c-4193-8884-b37483d24880.mp4"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a2330]/80 via-[#1a2330]/60 to-[#1a2330] pointer-events-none" />

              <div className="relative max-w-[1300px] mx-auto px-5 md:px-8 py-32 md:py-40">
                {/* Sale badge — cinematic drop-in */}
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex items-center justify-center gap-3 mb-8"
                >
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#FE6C11] to-[#F38236] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
                    <Zap size={11} /> Model Mega Sale
                  </span>
                  <span className="text-[#ebf4fb]/50 text-xs font-medium">
                    Limited Time · Star Products — Direct Price Drops!
                  </span>
                </motion.div>

                {/* Hero Text — Cinematic entrance */}
                <div className="text-center max-w-4xl mx-auto mb-14">
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-[-0.03em] leading-[1.08] text-[#ebf4fb]"
                  >
                    Model Mega Sale:<br className="hidden sm:block" />
                    Star Products—Direct Price Drops!
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mt-6 text-base md:text-lg text-[#ebf4fb]/50 max-w-2xl mx-auto leading-relaxed"
                  >
                    One API for 300+ models across text, image, video, and audio.
                    Ship production-grade AI in seconds, not months.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mt-8 flex flex-wrap items-center justify-center gap-4"
                  >
                    <button
                      onClick={() => navigate(isAuthenticated ? '/apps' : '/login')}
                      className="inline-flex items-center gap-2.5 bg-[#7036F0] text-white px-8 py-3.5 rounded-lg text-sm font-semibold hover:bg-[#5326B5] shadow-lg shadow-[#7036F0]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#7036F0]/30 hover:-translate-y-0.5"
                    >
                      Go to Console <ArrowRight size={15} />
                    </button>
                    <button
                      onClick={() => navigate('/markets')}
                      className="inline-flex items-center gap-2.5 bg-transparent text-[#ebf4fb] px-8 py-3.5 rounded-lg text-sm font-semibold border border-[#ebf4fb]/20 hover:border-[#ebf4fb]/40 hover:bg-white/5 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      Shop the Sale
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
                    {/* Scrollable model cards */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
                      {usableFeatured.map((sol, i) => (
                        <motion.button
                          key={sol._id || sol.id}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 1.3 + i * 0.1 }}
                          onClick={() => handleNavigate(sol.slug)}
                          className={`relative shrink-0 w-[180px] md:w-[220px] rounded-xl overflow-hidden transition-all duration-300 snap-start group ${
                            i === heroIdx ? 'ring-2 ring-[#7036F0] scale-[1.02]' : 'ring-1 ring-[#ebf4fb]/10 hover:ring-[#ebf4fb]/30'
                          }`}
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
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#FE6C11] text-white text-[10px] font-bold rounded-md shadow-lg">
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
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
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
             * SECTION 2: GET THE LATEST MODEL (NewModels)
             * Atlas: padding 80px 0, max-width 1440px, px-16
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ padding: '80px 0' }}>
              <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 64px' }}>
                {/* Header — left-aligned Atlas style */}
                <FadeInUp>
                <div className="flex flex-col items-start gap-3 mb-8">
                  <h2 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 36, lineHeight: 1.25, letterSpacing: '-0.02em', color: '#1a2330', margin: 0 }}>
                    Get the Latest Model
                  </h2>
                  <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.4, color: '#1a2330', margin: 0, maxWidth: 552 }}>
                    Access the latest industry-leading models as soon as they launch.
                  </p>
                  <button
                    onClick={() => navigate('/models')}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 36, padding: '8px 20px', marginTop: 4, fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1, color: '#1a2330', background: 'transparent', border: '1px solid #1a2330', borderRadius: 4, textDecoration: 'none', cursor: 'pointer' }}
                    className="transition-opacity hover:opacity-85"
                  >
                    View All Models
                  </button>
                </div>
                </FadeInUp>

                {/* Category tabs — Atlas tab style */}
                {modelCategories.length > 0 && (
                  <FadeInUp delay={0.15}>
                  <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                    {modelCategories.map((cat, i) => (
                      <button
                        key={cat}
                        onClick={() => setActiveModelTab(i)}
                        style={{
                          flexShrink: 0, height: 32, minWidth: 120, padding: '6px 16px',
                          fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: i === activeModelTab ? 600 : 400,
                          fontSize: 14, lineHeight: 1.3, borderRadius: 4, border: 'none', cursor: 'pointer',
                          whiteSpace: 'nowrap', textAlign: 'center',
                          background: '#fdfdfd', color: i === activeModelTab ? '#1a2330' : 'rgba(26,35,48,0.5)',
                        }}
                        className="transition-colors hover:text-[rgba(26,35,48,0.8)]"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  </FadeInUp>
                )}

                {/* Model cards — Atlas card grid */}
                <StaggerContainer stagger={0.08} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {latestModels.length > 0 ? latestModels.map((sol) => (
                    <StaggerItem key={sol._id || sol.id}>
                    <button
                      onClick={() => handleNavigate(sol.slug)}
                      onMouseEnter={() => handlePrefetchOnHover(sol.slug)}
                      className="group text-left overflow-hidden transition-all duration-400 w-full"
                      style={{ borderRadius: 4, background: '#1a2330', position: 'relative', cursor: 'pointer', border: 'none' }}
                    >
                      <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '100%', overflow: 'hidden' }}>
                        <img
                          src={sol.imageUrl}
                          alt={sol.name?.[currentLang] || ''}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
                        <div className="absolute bottom-0 inset-x-0 p-4" style={{ zIndex: 4 }}>
                          <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 12, lineHeight: 1.3, letterSpacing: '0.02em', color: '#ebf4fb', marginBottom: 4 }}>
                            {sol.category?.[currentLang] || sol.category?.en || ''}
                          </p>
                          <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 18, lineHeight: 1.3, color: '#ebf4fb' }}>
                            {sol.name?.[currentLang]}
                          </p>
                        </div>
                      </div>
                    </button>
                    </StaggerItem>
                  )) : (
                    Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
                  )}
                </StaggerContainer>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 3: FEATURED MODEL DEEP DIVES
             * Repeating: 2-col (text + image), alternating sides
             * Sub-model grid below with pricing (strikethrough + sale)
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ padding: '40px 0 80px' }}>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', boxSizing: 'border-box' }}>
                {/* Atlas section header */}
                <AnimatedSectionHeader
                  label="FEATURED"
                  title="Featured Model Deep Dives"
                  desc="Explore detailed capabilities and pricing for our most popular model series."
                />

                {/* Cards — Atlas CreatorPaths 2-col grid */}
                <StaggerContainer stagger={0.15} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, width: '100%' }}>
                  {modelSeries.map((sol) => {
                    const subModels = getSubModels(sol);
                    return (
                      <StaggerItem key={sol._id || sol.id}>
                      <div
                        style={{ background: '#fff', borderRadius: 4, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box', overflow: 'hidden', height: '100%' }}
                      >
                        {/* Card title */}
                        <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 36, lineHeight: 1.366, letterSpacing: '-0.02em', color: '#1a2330', margin: 0 }}>
                          {sol.name?.[currentLang]}
                        </h3>

                        {/* Card image */}
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '605/338', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                          <img
                            src={sol.imageUrl}
                            alt={sol.name?.[currentLang] || ''}
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
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#7036F0', marginLeft: sub.originalPrice ? 4 : 'auto' }}>{sub.price}</span>
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
                          className="transition-all hover:bg-[#1a2330] hover:text-white"
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
                  label="BUILD"
                  title="From idea to scale, in one touch."
                  desc="One API for the entire AI lifecycle—ship production-grade AI in seconds, not months."
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
                      className="transition-opacity hover:opacity-80"
                    >
                      {tab === 'apis' ? 'APIs' : tab === 'serverless' ? 'Serverless' : 'Compute'}
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
                        color: '#7036F0', textDecoration: 'none', cursor: 'pointer', alignSelf: 'flex-start',
                      }}
                      className="hover:text-[#5326B5] transition-colors"
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
                  <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 4, overflow: 'hidden', background: '#d9d9d9' }}>
                    <img
                      src={activeBuildContent.image}
                      alt={activeBuildContent.title}
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
                  label="CREATE"
                  title="A One-Stop Platform to Meet the Needs of All Types of Creators."
                  desc="Build and create with the world's most powerful AI models, unified under one platform."
                />

                {/* Atlas 2-col card grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, width: '100%' }}>
                  {/* Develop Card */}
                  <SlideIn from="left">
                  <div style={{ background: '#fff', borderRadius: 4, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box', overflow: 'hidden', height: '100%' }}>
                    <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 36, lineHeight: '1.366em', letterSpacing: '-0.02em', color: '#1a2330', margin: 0 }}>
                      Develop
                    </h3>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '605/338', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                      <img src="/assets/homepage/ent-api-integration.webp" alt="Develop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0, flex: '1 1' }}>
                      Skyverses is the AI powerhouse designed for visual developers. We eliminate infrastructure complexity and compute bottlenecks, providing a unified gateway to the world's most advanced visual models.
                    </p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, listStyle: 'none', padding: 0, margin: 0 }}>
                      {['One API, One High-Velocity Pipeline', 'One Scalable Solution', 'OpenAI-compatible, drop-in replacement'].map(b => (
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
                      className="transition-all hover:bg-[#1a2330] hover:text-white"
                    >
                      Get API Key
                    </button>
                  </div>
                  </SlideIn>

                  {/* Create Card */}
                  <SlideIn from="right">
                  <div style={{ background: '#fff', borderRadius: 4, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box', overflow: 'hidden', height: '100%' }}>
                    <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 36, lineHeight: '1.366em', letterSpacing: '-0.02em', color: '#1a2330', margin: 0 }}>
                      Create
                    </h3>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '605/338', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                      <img src="/assets/homepage/ent-custom-tools.webp" alt="Create" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0, flex: '1 1' }}>
                      Skyverses is the ultimate AI canvas for creators. Through our advanced multi-modal inference aggregation, we transform complex algorithms into a seamless engine for your inspiration.
                    </p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, listStyle: 'none', padding: 0, margin: 0 }}>
                      {['Cross-Modal Creative Freedom', 'A Global Boutique of Top-Tier Models', 'Instant Inspiration Delivery'].map(b => (
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
                      className="transition-all hover:bg-[#1a2330] hover:text-white"
                    >
                      Explore All Models
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
                  label="WHY SKYVERSES"
                  title="Why Skyverses?"
                  desc="The most advanced AI inference platform, built for creators and enterprises who demand the best."
                />

                {/* Content: hero image + feature list */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: 48, alignItems: 'stretch', width: '100%' }}>
                  {/* Hero image */}
                  <SlideIn from="left">
                  <div style={{ flex: '1 1', minWidth: 0, borderRadius: 4, overflow: 'hidden', position: 'relative', aspectRatio: '920/514', background: '#fff' }}>
                    <img
                      src="https://static.atlascloud.ai/images/home/why-atlas/hero.webp"
                      alt="Why Skyverses"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                  </SlideIn>

                  {/* Feature list */}
                  <SlideIn from="right">
                  <ul style={{ flex: '0 0 322px', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {[
                      { title: 'Easy Integration', desc: 'Complete integration and launch your features in minutes through our simple API and native MCP + Skills.' },
                      { title: 'Expert Led', desc: 'Our team of expert AI engineers bring you exclusive optimizations and tech.' },
                      { title: 'Enterprise Grade Security', desc: 'Your data is safe and private with our SOC I & II certifications, and HIPAA compliance.' },
                      { title: 'Photon Inference Engine', desc: 'High-throughput, low-latency LLM inference at scale through advanced FP4 quantization and hardware-optimized orchestration.' },
                    ].map((it) => (
                      <li key={it.title} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 27 }}>
                          <span style={{ flex: '0 0 auto', width: 8, height: 8, background: '#1a2330', display: 'inline-block' }} />
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
                  label="ENTERPRISE"
                  title="Built for Enterprise Scale"
                  desc="Production-grade infrastructure that scales with your ambition."
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
                          background: '#7036F0', color: '#ebf4fb', border: '1px solid transparent',
                          fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 500, fontSize: 16, lineHeight: 1.366,
                          textDecoration: 'none', boxSizing: 'border-box', cursor: 'pointer',
                        }}
                        className="transition-all hover:opacity-85"
                      >
                        Contact Sales
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
                        className="transition-all hover:bg-[#1a2330] hover:text-white"
                      >
                        Learn More
                      </button>
                    </div>
                </div>
                </FadeInUp>

                {/* Top 2-col cards */}
                <StaggerContainer stagger={0.15} className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  {[
                    {
                      title: 'Stable and Agile',
                      img: '/assets/homepage/ent-ai-strategy.webp',
                      bullets: ['Day 0 SOTA access to new models', 'Large GPU clusters with optimized inference', 'Auto-scaling infrastructure'],
                    },
                    {
                      title: 'Exclusive',
                      img: '/assets/homepage/ent-custom-tools.webp',
                      bullets: ['Closed-source model access', 'Isolated compliant workloads', 'Full control over your data'],
                    },
                  ].map((card) => (
                    <StaggerItem key={card.title}>
                    <div style={{ background: '#fff', borderRadius: 4, padding: '40px 30px 56px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 32, height: '100%' }}>
                      <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 40, lineHeight: 1.366, color: '#1a2330', margin: 0 }}>
                        {card.title}
                      </h3>
                      <div style={{ width: '100%', aspectRatio: '591/330', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                        <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
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
                <div style={{ background: '#fff', borderRadius: 4, padding: '64px 30px 56px', boxSizing: 'border-box', display: 'flex', flexDirection: 'row', gap: 48, alignItems: 'flex-start' }}>
                  <SlideIn from="left">
                  <div style={{ flex: '0 0 auto', width: 438, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 50 }}>
                    <h3 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 40, lineHeight: 1.366, color: '#1a2330', margin: 0 }}>
                      Ultra-high Throughput
                    </h3>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0 }}>
                      Engineered for mission-critical workloads, our production-grade platform sustains exceptional throughput without compromising reliability or low tail latency.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {['99.9% uptime SLA', 'Sub-second inference latency', 'Horizontal auto-scaling'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                          <span style={{ flex: '0 0 auto', width: 8, height: 8, background: '#1a2330', marginTop: 8 }} />
                          <span style={{ flex: '1 1 auto', fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 20, lineHeight: 1.366, color: '#1a2330' }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  </SlideIn>
                  <SlideIn from="right">
                  <div style={{ flex: '1 1 auto', minWidth: 0, aspectRatio: '789/440', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                    <img src="/assets/homepage/ent-deploy-scale.webp" alt="Ultra-high Throughput" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                  </div>
                  </SlideIn>
                </div>
                </FadeInUp>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 8: TESTIMONIALS — 4 cards in row
             * "Engineered by Skyverses. Embraced by The World."
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ width: '100%', background: '#fff', padding: '72px 0 96px', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', boxSizing: 'border-box' }}>
                <AnimatedSectionHeader
                  label="TESTIMONIALS"
                  title="Engineered by Skyverses. Embraced by The World."
                  desc="See what our customers have to say about building with Skyverses."
                />

                {/* 2x2 card grid */}
                <StaggerContainer stagger={0.12} className="grid" style={{ listStyle: 'none', padding: 0, margin: 0, gridTemplateColumns: '1fr 1fr', gridAutoRows: 'minmax(323px, auto)', gap: 10 }}>
                  {testimonials.map((item, i) => (
                    <StaggerItem key={i}>
                    <div
                      key={i}
                      style={{
                        background: '#fff', borderRadius: 4, padding: '41px 30px 36px',
                        boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between', gap: 24,
                      }}
                    >
                      <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 24, lineHeight: 1.366, color: '#1a2330', margin: 0, maxWidth: 552 }}>
                        "{item.quote}"
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', height: 48 }}>
                        <span style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 16, color: '#1a2330' }}>
                          {item.company} — <span style={{ fontWeight: 400, color: 'rgba(26,35,48,0.6)' }}>{item.role}</span>
                        </span>
                      </div>
                    </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 8.5: AI MODELS MARQUEE
             * ═══════════════════════════════════════════════════════════ */}
            <section className="relative py-6 border-y border-gray-100 overflow-hidden bg-gray-50/50">
              <AIModelsMarquee />
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 8.6: HOMEBLOCKS (CMS-driven)
             * ═══════════════════════════════════════════════════════════ */}
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
                          <p className="mt-2 text-sm md:text-base text-gray-500">
                            {block.subtitle[currentLang] || block.subtitle.en}
                          </p>
                        )}
                      </div>
                      <button onClick={() => navigate('/markets')} className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-[#7036F0] hover:gap-2.5 transition-all">
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

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 9: TO THE DEVELOPERS
             * Philosophy section — centered long-form text
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ width: '100%', background: '#fff', padding: '88px 0 72px', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', boxSizing: 'border-box' }}>
                <AnimatedSectionHeader
                  label="TO THE DEVELOPERS"
                  title="Great products aren't built under perfect conditions—they're built by people who refuse to compromise."
                />

                {/* Content: 2-col — text + image */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: 48, alignItems: 'stretch', width: '100%' }}>
                  {/* Text column */}
                  <SlideIn from="left">
                  <div style={{ flex: '0 0 auto', width: 438, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0 }}>
                      But too often, that means dealing with fragmented APIs, unstable pipelines, and scaling challenges
                      that pull you away from what matters: creating.
                    </p>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0 }}>
                      Skyverses changes that. With One API for All Media AI, you get a single, production-ready endpoint
                      for video, image, and language models—no fragmented integrations, just reliable access to the world's
                      leading generative capabilities.
                    </p>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0 }}>
                      We handle the complexity of media processing, rendering, and scale, so you can stay focused on your ideas.
                      No friction. No hidden constraints. Just infrastructure that works with you.
                    </p>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 600, fontSize: 16, lineHeight: 1.5, color: '#1a2330', margin: 0 }}>
                      We'll handle the heavy lifting. You bring the vision.
                    </p>
                    <p style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 16, lineHeight: 1.5, color: '#7036F0', margin: 0 }}>
                      Skyverses — built for developers who create without limits.
                    </p>
                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 20, marginTop: 10 }}>
                      <button
                        onClick={() => navigate('/markets')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 147, height: 36, padding: '8px 20px', borderRadius: 4,
                          background: '#7036F0', color: '#ebf4fb', border: '1px solid transparent',
                          fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 500, fontSize: 16, lineHeight: 1.366,
                          cursor: 'pointer',
                        }}
                        className="transition-all hover:opacity-85"
                      >
                        Explore all models
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
                        className="transition-all hover:bg-[#1a2330] hover:text-white"
                      >
                        {isAuthenticated ? 'Go to Console' : 'Sign Up for Free'}
                      </button>
                    </div>
                  </div>
                  </SlideIn>
                  {/* Image column */}
                  <SlideIn from="right">
                  <div style={{ flex: '1 1 auto', minWidth: 0, aspectRatio: '789/440', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                    <img
                      src="https://static.atlascloud.ai/images/home/why-atlas/hero.webp"
                      alt="To the developers"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                  </SlideIn>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
             * SECTION 10: ENTERPRISE CTA — light gradient
             * ═══════════════════════════════════════════════════════════ */}
            <section style={{ width: '100%', background: '#1a2330', padding: '78px 0', position: 'relative', zIndex: 2, boxSizing: 'border-box', borderBottom: '1px solid rgba(235,244,251,0.2)' }}>
              <FadeInUp>
              <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto', padding: '0 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 700, fontSize: 36, lineHeight: 1.366, letterSpacing: '-0.72px', color: '#ebf4fb', margin: 0 }}>
                  Render your enterprise vision into reality with Skyverses AI.
                </h2>
                <button
                  onClick={() => navigate('/booking')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: 36, minWidth: 140, padding: '8px 20px', borderRadius: 4,
                    background: '#ebf4fb', color: '#1a2330', border: 'none',
                    fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 400, fontSize: 16, lineHeight: 1.366,
                    textDecoration: 'none', boxSizing: 'border-box', cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                  className="transition-all hover:opacity-85"
                >
                  Contact Sales
                </button>
              </div>
              </FadeInUp>
            </section>
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
