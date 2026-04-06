
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { marketApi } from '../apis/market';
import { systemConfigApi } from '../apis/config';
import { Solution, HomeBlock, Language } from '../types';
import {
  X, SearchX, Search, Flame, Video, ImageIcon, LayoutGrid, Gift, Workflow,
  Sparkles, LucideIcon, ArrowRight, ChevronRight, Play, Zap, Shield, Globe2, Cpu,
  MousePointerClick, Wand2, Rocket, Megaphone, ShoppingBag, Clapperboard,
  Building2, Shirt, GraduationCap, Brain, Wrench, Plug, CreditCard, RefreshCw,
  MonitorPlay, Palette, UserCircle, Landmark, TrendingDown, Share2, UserPlus, Check, Users, Bookmark
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import AIModelsMarquee from '../components/AIModelsMarquee';
import GlobalToolsBar from '../components/GlobalToolsBar';
import { motion, AnimatePresence } from 'framer-motion';

import { CardSkeleton } from '../components/market/MarketSkeleton';
import { MarketSectionHeader } from '../components/market/MarketSectionHeader';
import { SolutionCard } from '../components/market/SolutionCard';

const BLOCK_ICONS: Record<string, LucideIcon> = {
  top_trending: Flame,
  video_studio: Video,
  image_studio: ImageIcon,
  ai_agents: Workflow,
  festivals: Gift,
  others: LayoutGrid
};

/* ─── Animated Counter ─── */
const AnimatedNumber = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = Math.max(1, Math.floor(value / 40));
        const timer = setInterval(() => {
          start += step;
          if (start >= value) { setCount(value); clearInterval(timer); }
          else setCount(start);
        }, 30);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const MarketPage = () => {
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  usePageMeta({
    title: 'Skyverses | Marketplace AI — Mọi công cụ AI trong một nền tảng',
    description: 'Skyverses Marketplace — 30+ ứng dụng AI, 50+ model (Veo3, Seedance, Grok, Kling, Sora, Gemini, GPT-4o, Midjourney, Flux). Tiết kiệm ~70% chi phí. Tạo video, ảnh, nhạc, giọng nói & tự động hoá. Giải pháp AI cho doanh nghiệp.',
    keywords: 'AI marketplace, Skyverses, Veo3, Seedance, Grok, Kling, Sora, Gemini, GPT-4o, Midjourney, Flux, Qwen, tạo video AI, tạo ảnh AI, AI giá rẻ, giải pháp AI doanh nghiệp, xây dựng ứng dụng AI, enterprise AI, 50+ model AI',
    canonical: '/',
    jsonLd: {
      '@type': 'ItemList',
      name: 'Top AI Products — Skyverses Marketplace',
      description: 'Bộ sưu tập 30+ công cụ AI hàng đầu: Video, Image, Voice, Music, Chat & Automation',
      numberOfItems: 10,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'AI Video Generator', url: 'https://ai.skyverses.com/product/ai-video-generator' },
        { '@type': 'ListItem', position: 2, name: 'AI Image Generator', url: 'https://ai.skyverses.com/product/ai-image-generator' },
        { '@type': 'ListItem', position: 3, name: 'AI Music Generator', url: 'https://ai.skyverses.com/product/ai-music-generator' },
        { '@type': 'ListItem', position: 4, name: 'Text to Speech AI', url: 'https://ai.skyverses.com/product/text-to-speech' },
        { '@type': 'ListItem', position: 5, name: 'Qwen Chat AI', url: 'https://ai.skyverses.com/product/qwen-chat-ai' },
        { '@type': 'ListItem', position: 6, name: 'Background Removal AI', url: 'https://ai.skyverses.com/product/background-removal-ai' },
        { '@type': 'ListItem', position: 7, name: 'Studio Architect', url: 'https://ai.skyverses.com/product/studio-architect' },
        { '@type': 'ListItem', position: 8, name: 'AI Agent Workflow', url: 'https://ai.skyverses.com/product/ai-agent-workflow' },
        { '@type': 'ListItem', position: 9, name: 'Voice Design AI', url: 'https://ai.skyverses.com/product/voice-design-ai' },
        { '@type': 'ListItem', position: 10, name: 'Poster Marketing AI', url: 'https://ai.skyverses.com/product/poster-marketing-ai' },
      ]
    }
  });

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [featuredSolutions, setFeaturedSolutions] = useState<Solution[]>([]);
  const [homeBlocks, setHomeBlocks] = useState<HomeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { query, setQuery, primary, setPrimary, secondary, setSecondary, reset: resetSearch, open: openSearch } = useSearch();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [featuredIdx, setFeaturedIdx] = useState(0);

  const scrollRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

  const scroll = useCallback((key: string, direction: 'left' | 'right') => {
    const el = scrollRefs.current[key]?.current;
    if (el) {
      const scrollAmount = el.offsetWidth * 0.85;
      el.scrollTo({ left: el.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount), behavior: 'smooth' });
    }
  }, []);


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
          marketApi.getRandomFeatured()
        ]);
        if (configRes?.success && configRes.data.marketHomeBlock) {
          const sortedBlocks = configRes.data.marketHomeBlock.sort((a, b) => a.order - b.order);
          setHomeBlocks(sortedBlocks);
          sortedBlocks.forEach(block => {
            if (!scrollRefs.current[block.key]) scrollRefs.current[block.key] = React.createRef<HTMLDivElement>();
          });
        }
        if (featuredRes?.data) setFeaturedSolutions(featuredRes.data);
      } catch (error) { console.error("Market Init Error:", error); }
    };
    initData();
  }, []);

  useEffect(() => {
    const fetchMarketItems = async () => {
      if (query) setIsSearching(true); else setLoading(true);
      try {
        const res = await marketApi.getSolutions({ q: query.replace(/\+/g, ' ').trim() || undefined, category: primary !== 'ALL' ? primary : undefined, lang: lang as Language });
        if (res?.data) setSolutions(res.data.filter(s => s.isActive !== false));
      } catch (error) { console.error("Market Data Sync Error:", error); }
      finally { setLoading(false); setIsSearching(false); }
    };
    const timer = setTimeout(fetchMarketItems, query ? 500 : 0);
    return () => clearTimeout(timer);
  }, [query, primary, lang]);

  useEffect(() => {
    const saved = localStorage.getItem('skyverses_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Featured auto-rotate
  useEffect(() => {
    if (featuredSolutions.length <= 1) return;
    const interval = setInterval(() => setFeaturedIdx(p => (p + 1) % featuredSolutions.length), 5000);
    return () => clearInterval(interval);
  }, [featuredSolutions]);

  const toggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setFavorites(prev => {
      const newFavs = prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id];
      localStorage.setItem('skyverses_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  }, []);

  const toggleLike = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setLikedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const getFakeStats = useCallback((id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      users: ((hash % 850 + 120) > 999 ? ((hash % 850 + 120) / 1000).toFixed(1) + 'k' : (hash % 850 + 120).toString()),
      likes: ((hash % 400 + 45) > 999 ? ((hash % 400 + 45) / 1000).toFixed(1) + 'k' : (hash % 400 + 45).toString())
    };
  }, []);

  const handleNavigate = useCallback((slug: string) => {
    if (!isAuthenticated) navigate('/login');
    else navigate(`/product/${slug}`);
  }, [isAuthenticated, navigate]);

  // Prefetch product page chunk on hover for instant navigation
  const prefetchedSlugs = useRef(new Set<string>());
  const handlePrefetchOnHover = useCallback((slug: string) => {
    if (prefetchedSlugs.current.has(slug)) return;
    prefetchedSlugs.current.add(slug);
    import('../pages/SolutionDetail').catch(() => {});
  }, []);

  const filteredSolutions = useMemo(() => {
    return solutions.filter(sol => {
      if (secondary === 'ALL') return true;
      return sol.tags?.some(t => t.toLowerCase() === secondary.toLowerCase()) ||
        sol.id?.toLowerCase().includes(secondary.toLowerCase());
    });
  }, [solutions, secondary]);

  const logoUrl = "/assets/skyverses-logo.png";
  const currentLang = lang as Language;
  const activeFeatured = featuredSolutions[featuredIdx];

  return (
    <div className="relative min-h-screen bg-[#fcfcfd] dark:bg-[#030304] font-sans transition-colors duration-500">
      {/* ═══ LIGHTWEIGHT BACKGROUND ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Static gradient blobs — no animations, minimal blur */}
        <div className="absolute top-[-10%] left-[40%] w-[600px] h-[400px] bg-brand-blue/[0.04] dark:bg-brand-blue/[0.06] rounded-full blur-[80px]" />
        <div className="absolute top-[65%] left-[-5%] w-[350px] h-[350px] bg-purple-500/[0.03] dark:bg-purple-500/[0.04] rounded-full blur-[60px]" />
        {/* Single subtle aurora — static */}
        <div className="absolute top-[15%] left-0 right-0 h-[150px] bg-gradient-to-r from-transparent via-brand-blue/[0.04] to-transparent blur-[40px] rotate-[-4deg] opacity-40 dark:opacity-50" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,144,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,144,255,0.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </div>

      <div className="relative z-10">
        {/* ═══════════════════ HERO ═══════════════════ */}
        {!query && (
          <section className="pt-16 md:pt-32 pb-0 max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 relative">
            {/* Lightweight floating particles — desktop only */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`absolute rounded-full ${i % 2 === 0 ? 'w-1.5 h-1.5 bg-brand-blue/30' : 'w-1 h-1 bg-purple-400/25'}`} style={{
                  left: `${15 + i * 20}%`, top: `${20 + ((i * 17) % 50)}%`,
                  animation: `float ${3 + i * 0.8}s ease-in-out infinite ${i * 0.5}s`
                }} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-0 items-center min-h-0 md:min-h-[60vh] lg:min-h-[70vh]">
              {/* Left: Content — stagger children */}
              <div className="space-y-4 md:space-y-8 lg:pr-16">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="hidden md:block"
                >
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-blue/8 dark:bg-brand-blue/15 border border-brand-blue/15 dark:border-brand-blue/25">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue">Skyverses AI Ecosystem</span>
                  </div>
                </motion.div>

                {/* Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3"
                >
                  <h1 className="text-[1.6rem] md:text-[3.5rem] lg:text-[4.2rem] font-black tracking-[-0.04em] leading-[1.1] md:leading-[1.05] text-slate-900 dark:text-white">
                    Nền tảng{' '}
                    <span className="relative inline-block">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-purple-500 to-pink-500 bg-[length:200%_auto] animate-[gradient_4s_ease_infinite]">
                        sản phẩm AI
                      </span>
                    </span>
                    <br className="hidden md:block" />
                    <span className="md:hidden"> </span>
                    cho mọi nhu cầu sáng tạo
                  </h1>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-[13px] md:text-lg text-slate-500 dark:text-gray-400 leading-relaxed max-w-xl"
                  >
                    30+ sản phẩm AI — Video, Ảnh, Giọng nói, Nhạc & Workflow tự động.
                    <span className="hidden md:inline"> Được phát triển bởi đội ngũ Skyverses.</span>
                  </motion.p>
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-wrap gap-2 md:gap-3 pt-1 md:pt-2"
                >
                  <button
                    onClick={() => navigate('/markets')}
                    className="group relative inline-flex items-center gap-2 md:gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-5 py-3 md:px-7 md:py-4 rounded-xl md:rounded-2xl text-[13px] md:text-sm font-bold shadow-xl hover:shadow-2xl hover:shadow-brand-blue/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 overflow-hidden"
                    aria-label="Khám phá sản phẩm AI"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-brand-blue to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 flex items-center gap-3 group-hover:text-white">
                      Khám phá sản phẩm
                      <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/markets')}
                    className="inline-flex items-center gap-2 md:gap-3 bg-white dark:bg-white/5 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 px-5 py-3 md:px-7 md:py-4 rounded-xl md:rounded-2xl text-[13px] md:text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/10 hover:border-brand-blue/30 transition-all duration-300"
                    aria-label="Xem demo sản phẩm"
                  >
                    <Play size={14} className="text-brand-blue" fill="currentColor" />
                    Xem demo
                  </button>
                </motion.div>

                {/* Stats — stagger in */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex items-center gap-6 md:gap-8 pt-2 md:pt-4"
                >
                  {[
                    { value: 30, suffix: '+', label: 'AI Products' },
                    { value: 50, suffix: '+', label: 'AI Models' },
                    { value: 1000, suffix: '+', label: 'Users' },
                  ].map((stat, si) => (
                    <motion.div key={stat.label} className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + si * 0.15, type: 'spring', stiffness: 200 }}
                    >
                      <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Right: Vertical Scrolling Gallery — Desktop marquee / Mobile compact horizontal */}
              {/* ═══ MOBILE: Trending Products Slide ═══ */}
              <div className="md:hidden mt-3 -mx-4 px-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Zap size={10} className="text-orange-500" fill="currentColor" />
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-orange-500">Trending</span>
                </div>
                {featuredSolutions.length === 0 ? (
                  <div className="flex gap-3 overflow-hidden">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex-shrink-0 w-[280px] h-[200px] rounded-2xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />
                    ))}
                  </div>
                ) : (
                <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
                  {featuredSolutions.slice(0, 8).map((sol, idx) => (
                    <SolutionCard
                      key={sol._id || sol.id}
                      sol={sol}
                      idx={idx}
                      lang={lang}
                      isLiked={likedItems.includes(sol._id || sol.id)}
                      isFavorited={favorites.includes(sol.id)}
                      onToggleFavorite={toggleFavorite}
                      onToggleLike={toggleLike}
                      onClick={handleNavigate}
                      onHover={handlePrefetchOnHover}
                      stats={getFakeStats(sol._id || sol.id)}
                    />
                  ))}
                  <div onClick={() => navigate('/markets')} className="flex-shrink-0 snap-start w-[140px] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#08080a] border border-black/[0.08] dark:border-white/[0.08] rounded-xl cursor-pointer hover:border-brand-blue/40 transition-all p-4 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                      <ArrowRight size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Xem tất cả</p>
                    </div>
                  </div>
                </div>
                )}
              </div>

              {/* ═══ DESKTOP: Hero Spotlight Showcase ═══ */}
              <div className="relative hidden md:block">
                <h2 className="sr-only">Sản phẩm AI nổi bật</h2>
                {/* Background ambient glow */}
                <div className="absolute -inset-12 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-brand-blue/[0.06] rounded-full blur-[100px]" />
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-purple-500/[0.04] rounded-full blur-[80px]" />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="relative"
                >
                  {/* Section label */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 15 }}
                      className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20"
                    >
                      <Zap size={12} className="text-white" fill="currentColor" />
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      className="text-[9px] font-black uppercase tracking-[0.25em] text-orange-500/80"
                    >Trending</motion.span>
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.7, duration: 0.6 }} className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-1 origin-left" />
                  </div>

                  {featuredSolutions.length === 0 ? (
                    /* Skeleton */
                    <div className="flex gap-3 h-[380px]">
                      <div className="flex-[3] rounded-2xl bg-white/[0.03] animate-pulse" />
                      <div className="flex-[2] flex flex-col gap-3">
                        {[1,2,3].map(i => <div key={i} className="flex-1 rounded-xl bg-white/[0.03] animate-pulse" />)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 h-[380px] lg:h-[420px]">
                      {/* ── SPOTLIGHT: Featured Card ── */}
                      <motion.div
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
                        onClick={() => handleNavigate(featuredSolutions[0]?.slug)}
                        className="flex-[3] relative rounded-2xl overflow-hidden cursor-pointer group"
                      >
                        {/* Full image */}
                        <img
                          src={featuredSolutions[0]?.imageUrl}
                          alt={featuredSolutions[0]?.name[lang as Language]}
                          fetchPriority="high"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

                        {/* Category badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="px-2.5 py-1 bg-brand-blue/90 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-md">
                            {featuredSolutions[0]?.category[lang as Language]}
                          </span>
                        </div>

                        {/* Bookmark */}
                        <button
                          onClick={(e) => toggleFavorite(e, featuredSolutions[0]?.id)}
                          className={`absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-md rounded-full border transition-all z-10 ${favorites.includes(featuredSolutions[0]?.id) ? 'text-brand-blue border-brand-blue/50' : 'text-white/40 border-white/10 hover:text-brand-blue'}`}
                        >
                          <Bookmark fill="currentColor" size={16} />
                        </button>

                        {/* Bottom content overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6 z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400/90">Featured</span>
                          </div>
                          <h3 className="text-lg lg:text-2xl font-black text-white tracking-tight leading-tight mb-2">
                            {featuredSolutions[0]?.name[lang as Language]}
                          </h3>
                          <p className="text-[11px] lg:text-xs text-white/60 leading-relaxed line-clamp-2 max-w-xs mb-3">
                            {featuredSolutions[0]?.description[lang as Language]}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-white/40">
                              <Users size={11} />
                              <span className="text-[9px] font-bold">{getFakeStats(featuredSolutions[0]?._id || featuredSolutions[0]?.id).users}</span>
                            </div>
                            {featuredSolutions[0]?.isFree ? (
                              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-sm">Free</span>
                            ) : (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                                <Zap size={9} className="text-brand-blue" fill="currentColor" />
                                <span className="text-[9px] font-black text-white">{featuredSolutions[0]?.priceCredits}</span>
                              </div>
                            )}
                          </div>

                          {/* CTA shimmer on hover */}
                          <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg flex items-center gap-2">
                              <Sparkles size={11} className="text-brand-blue" fill="currentColor" />
                              <span className="text-[9px] font-black text-white uppercase tracking-wider">Khám phá ngay</span>
                              <ArrowRight size={11} className="text-white/60" />
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* ── SIDE: 3 Compact Cards ── */}
                      <div className="flex-[2] flex flex-col gap-3">
                        {featuredSolutions.slice(1, 4).map((sol, idx) => (
                          <motion.div
                            key={sol._id || sol.id}
                            initial={{ opacity: 0, x: 20, filter: 'blur(6px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            transition={{
                              duration: 0.6,
                              delay: 0.6 + idx * 0.15,
                              ease: [0.22, 1, 0.36, 1]
                            }}
                            whileHover={{ x: -4, transition: { duration: 0.2 } }}
                            onClick={() => handleNavigate(sol.slug)}
                            className="flex-1 relative rounded-xl overflow-hidden cursor-pointer group bg-white dark:bg-[#0a0a0c] border border-black/[0.06] dark:border-white/[0.06] hover:border-brand-blue/30 transition-all duration-300 flex"
                          >
                            {/* Mini thumbnail */}
                            <div className="w-[38%] relative overflow-hidden">
                              <img
                                src={sol.imageUrl}
                                alt={sol.name[lang as Language]}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 dark:to-[#0a0a0c]/20" />
                            </div>
                            {/* Content */}
                            <div className="flex-1 p-3 lg:p-4 flex flex-col justify-center gap-1.5">
                              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-brand-blue/60">{sol.category[lang as Language]}</span>
                              <h3 className="text-[11px] lg:text-[13px] font-black text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-1">
                                {sol.name[lang as Language]}
                              </h3>
                              <div className="flex items-center gap-3 mt-auto">
                                <div className="flex items-center gap-1 text-slate-400 dark:text-gray-600">
                                  <Users size={9} />
                                  <span className="text-[8px] font-bold">{getFakeStats(sol._id || sol.id).users}</span>
                                </div>
                                {sol.isFree ? (
                                  <span className="text-[7px] font-black text-emerald-500 uppercase">Free</span>
                                ) : (
                                  <div className="flex items-center gap-0.5">
                                    <Zap size={8} className="text-brand-blue" fill="currentColor" />
                                    <span className="text-[9px] font-bold text-slate-600 dark:text-gray-300">{sol.priceCredits}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Hover arrow */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                              <ArrowRight size={14} className="text-brand-blue" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View all */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="flex justify-end mt-3"
                  >
                    <button
                      onClick={() => navigate('/markets')}
                      className="group inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-slate-400 dark:text-gray-500 hover:text-brand-blue transition-all duration-300"
                    >
                      Xem tất cả 30+ sản phẩm
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════ AI MODELS MARQUEE ═══════════════════ */}
        <div className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 mt-4">
          <AIModelsMarquee />
        </div>

        {/* ═══════════════════ TRUST PILLARS ═══════════════════ */}
        {!query && (
          <section className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 py-4 md:py-12">
            {/* ═══ MOBILE: Horizontal scroll compact chips ═══ */}
            <div className="md:hidden flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
              {[
                { icon: <Zap size={14} />, stat: '0.5s', title: 'Siêu nhanh', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/15' },
                { icon: <TrendingDown size={14} />, stat: '~70%', title: 'Tiết kiệm', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/15' },
                { icon: <Shield size={14} />, stat: '100%', title: 'Bảo mật', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
                { icon: <Globe2 size={14} />, stat: '4+', title: 'Ngôn ngữ', color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/15' },
                { icon: <Cpu size={14} />, stat: '50+', title: 'AI Models', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/15' },
              ].map((item) => (
                <div key={item.title} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl ${item.bg} border ${item.border} backdrop-blur-sm`}>
                  <div className={`${item.color}`}>{item.icon}</div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-black ${item.color}`}>{item.stat}</span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ═══ DESKTOP: Original full trust pillars ═══ */}
            <div className="hidden md:block relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-[#0a0c12] dark:via-[#0c0e16] dark:to-[#0a0c12] border border-black/[0.04] dark:border-white/[0.04] p-8 md:p-12 lg:p-14">
              <h2 className="sr-only">Tại sao chọn Skyverses</h2>
              <div className="relative z-10 grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-0">
                {[
                  { icon: <Zap size={24} />, stat: '0.5s', statLabel: 'Avg Response', title: 'Xử lý siêu nhanh', desc: 'GPU A100/H100 cloud — render video, image, voice trong tích tắc.', color: 'text-amber-500', bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/15 dark:to-orange-500/15', ring: 'ring-amber-500/20' },
                  { icon: <TrendingDown size={24} />, stat: '~70%', statLabel: 'Save', title: 'Tiết kiệm chi phí', desc: 'Chi phí hợp lý hơn nhiều so với Runway, Midjourney, ElevenLabs — chất lượng tương đương.', color: 'text-rose-500', bg: 'bg-gradient-to-br from-rose-500/10 to-red-500/10 dark:from-rose-500/15 dark:to-red-500/15', ring: 'ring-rose-500/20' },
                  { icon: <Shield size={24} />, stat: '100%', statLabel: 'Encrypted', title: 'Bảo mật tuyệt đối', desc: 'Mã hoá end-to-end. Dữ liệu được xoá sau 24h nếu người dùng yêu cầu.', color: 'text-emerald-500', bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/15', ring: 'ring-emerald-500/20' },
                  { icon: <Globe2 size={24} />, stat: '4+', statLabel: 'Languages', title: 'Đa ngôn ngữ', desc: 'Hỗ trợ Tiếng Việt, English, 한국어, 日本語 — UX bản địa hoá hoàn toàn.', color: 'text-brand-blue', bg: 'bg-gradient-to-br from-brand-blue/10 to-cyan-500/10 dark:from-brand-blue/15 dark:to-cyan-500/15', ring: 'ring-brand-blue/20' },
                  { icon: <Cpu size={24} />, stat: '50+', statLabel: 'AI Models', title: 'Multi-engine AI', desc: 'Kết hợp GPT, Flux, Wan, Kling, ElevenLabs, Suno và 50+ model khác.', color: 'text-purple-500', bg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/15 dark:to-pink-500/15', ring: 'ring-purple-500/20' },
                ].map((item, idx, arr) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: idx * 0.12, duration: 0.6, type: 'spring', stiffness: 120 }}
                    whileHover={{ y: -5, transition: { duration: 0.3 } }}
                    className={`relative group text-center md:text-left px-4 md:px-6 ${idx < arr.length - 1 ? 'lg:border-r lg:border-black/[0.04] lg:dark:border-white/[0.04]' : ''}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} ring-1 ${item.ring} flex items-center justify-center mx-auto md:mx-0 mb-5 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3 transition-all duration-500`}>
                      {item.icon}
                    </div>
                    <div className="mb-3">
                      <span className={`text-3xl md:text-4xl font-black tracking-tight ${item.color}`}>{item.stat}</span>
                      <span className="block text-[8px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-[0.3em] mt-1">{item.statLabel}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════ ACTIVE FILTER BAR ═══════════════════ */}

        <div className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20">

          {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
          {!query && (
            <section className="py-10 md:py-28">
              <div className="text-center mb-6 md:mb-20">
                <motion.div initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/8 dark:bg-brand-blue/15 border border-brand-blue/15 dark:border-brand-blue/25 rounded-full mb-3 md:mb-5">
                    <Sparkles size={12} className="text-brand-blue" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue">How It Works</span>
                  </div>
                  <h2 className="text-xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-2 md:mb-4">
                    Bắt đầu trong <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-500">3 bước</span>
                  </h2>
                  <p className="text-xs md:text-base text-slate-400 dark:text-gray-500 max-w-lg mx-auto hidden md:block">Không cần cài đặt, không cần kỹ năng. Chỉ cần đăng nhập và bắt đầu sáng tạo.</p>
                </motion.div>
              </div>

              <div className="relative">
                <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-8 overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
                  {[
                    { step: '01', title: 'Chọn công cụ AI', desc: 'Duyệt qua 30+ sản phẩm AI — Video, Image, Voice, Music, Workflow — tìm đúng công cụ bạn cần.', image: '/assets/homepage/hiw-01-choose.webp', gradient: 'from-brand-blue/10 to-purple-500/10', border: 'hover:border-brand-blue/30' },
                    { step: '02', title: 'Nhập nội dung của bạn', desc: 'Upload ảnh, nhập prompt, hoặc chọn template có sẵn. AI sẽ xử lý phần còn lại.', image: '/assets/homepage/hiw-02-input.webp', gradient: 'from-purple-500/10 to-pink-500/10', border: 'hover:border-purple-500/30' },
                    { step: '03', title: 'Nhận kết quả chuyên nghiệp', desc: 'Tải về ảnh, video, audio chất lượng cao trong vài giây. Chỉnh sửa và xuất bản ngay.', image: '/assets/homepage/hiw-03-result.webp', gradient: 'from-pink-500/10 to-amber-500/10', border: 'hover:border-pink-500/30' },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 40, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ delay: idx * 0.2, duration: 0.7, type: 'spring', stiffness: 100 }}
                      whileHover={{ y: -8, transition: { duration: 0.4 } }}
                      className={`relative flex-shrink-0 w-[260px] md:w-auto snap-start rounded-2xl md:rounded-3xl bg-gradient-to-br ${item.gradient} dark:from-white/[0.02] dark:to-white/[0.01] border border-black/[0.05] dark:border-white/[0.05] ${item.border} transition-all duration-500 group overflow-hidden`}
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-2 left-2 md:top-3 md:left-3">
                          <span className="px-2 py-0.5 bg-brand-blue/20 backdrop-blur-sm border border-brand-blue/30 text-[8px] font-black text-brand-blue uppercase tracking-widest rounded-md">Step {item.step}</span>
                        </div>
                      </div>
                      {/* Text */}
                      <div className="p-4 md:p-6 space-y-1.5 md:space-y-3">
                        <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white tracking-tight">{item.title}</h3>
                        <p className="text-[10px] md:text-sm text-slate-500 dark:text-gray-400 leading-relaxed line-clamp-3 md:line-clamp-none">{item.desc}</p>
                      </div>
                      {idx < 2 && (
                        <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#0a0a0c] border border-black/[0.06] dark:border-white/[0.06] items-center justify-center shadow-lg">
                          <ChevronRight size={14} className="text-brand-blue animate-[pulse_2s_ease-in-out_infinite]" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {(query || primary !== 'ALL') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 py-4 mb-2"
            >
              <Search size={14} className="text-brand-blue shrink-0" />
              <span className="text-xs font-medium text-slate-500 dark:text-gray-400">
                {query && <>Kết quả cho "<span className="font-bold text-slate-900 dark:text-white">{query}</span>"</>}
                {query && primary !== 'ALL' && ' trong '}
                {primary !== 'ALL' && <span className="font-bold text-brand-blue">{primary}</span>}
              </span>
              <button
                onClick={resetSearch}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={10} /> Xoá bộ lọc
              </button>
            </motion.div>
          )}

          {/* ═══════════════════ PRODUCT GRID ═══════════════════ */}
          <div className="space-y-16 md:space-y-24 relative z-10 pt-8">
            {(loading || isSearching) ? (
              <div className="flex gap-4 md:gap-8 overflow-x-hidden">
                {[1, 2, 3, 4, 5].map(i => <CardSkeleton key={i} />)}
              </div>
            ) : filteredSolutions.length > 0 ? (
              <>
                {homeBlocks.filter(b => query ? true : b.key === 'top_trending').map((block) => {
                  const blockSolutions = filteredSolutions.filter(s => s.homeBlocks?.includes(block.key));
                  if (blockSolutions.length === 0) return null;

                  const Icon = BLOCK_ICONS[block.key] || LayoutGrid;
                  const currentLang = lang as Language;

                  return (
                    <section key={block.key} className="relative">
                      <MarketSectionHeader
                        icon={Icon}
                        title={block.title[currentLang] || block.title.en}
                        subtitle={block.subtitle[currentLang] || block.subtitle.en}
                        count={blockSolutions.length}
                        colorClass={block.key === 'top_trending' ? 'text-orange-500' : 'text-brand-blue'}
                        onScrollLeft={() => scroll(block.key, 'left')}
                        onScrollRight={() => scroll(block.key, 'right')}
                        onSeeAll={() => navigate('/markets')}
                      />
                      <div ref={scrollRefs.current[block.key]} className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 relative z-10">
                        {blockSolutions.slice(0, block.limit || 8).map((sol, idx) => (
                          <SolutionCard
                            key={sol._id || sol.id} sol={sol} idx={idx} lang={lang}
                            isLiked={likedItems.includes(sol._id || sol.id)}
                            isFavorited={favorites.includes(sol.id)}
                            onToggleFavorite={toggleFavorite}
                            onToggleLike={toggleLike}
                            onClick={handleNavigate}
                            onHover={handlePrefetchOnHover}
                            stats={getFakeStats(sol._id || sol.id)}
                          />
                        ))}

                        <div
                          onClick={() => navigate('/markets')}
                          className="flex-shrink-0 snap-start w-[180px] md:hidden flex flex-col items-center justify-center bg-slate-50 dark:bg-[#08080a] border border-black/[0.08] dark:border-white/[0.08] rounded-xl group cursor-pointer hover:border-brand-blue/40 transition-all p-6 text-center space-y-4"
                        >
                          <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                            <ArrowRight size={24} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Xem tất cả</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{blockSolutions.length} giải pháp</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </>
            ) : (
              <div className="py-40 text-center space-y-6 opacity-30">
                <SearchX size={48} className="mx-auto mb-4" />
                <p className="text-sm font-black uppercase tracking-widest">{t('market.search.no_matches')}</p>
                <button onClick={() => { setQuery(''); setPrimary('ALL'); setSecondary('ALL'); }} className="text-[10px] font-black uppercase tracking-widest text-brand-blue hover:underline">{t('market.search.reset')}</button>
              </div>
            )}
          </div>

          {/* ═══════════════════ USE CASES BY INDUSTRY ═══════════════════ */}
          {!query && (
            <section className="py-8 md:py-24">
              <motion.div initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-6 md:mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/8 dark:bg-emerald-500/15 border border-emerald-500/15 dark:border-emerald-500/25 rounded-full mb-3 md:mb-5">
                  <Globe2 size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">Use Cases</span>
                </div>
                <h2 className="text-xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-2 md:mb-4">
                  Giải pháp cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-brand-blue">mọi ngành nghề</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-400 dark:text-gray-500 max-w-lg mx-auto hidden md:block">Từ Marketing đến E-commerce, Giáo dục đến Giải trí — AI đang thay đổi cách mọi người làm việc.</p>
              </motion.div>

              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 snap-x snap-mandatory">
                {[
                  { image: '/assets/homepage/uc-marketing.webp', industry: 'Marketing & Agency', desc: 'Tạo hàng trăm content visual mỗi tuần — video, banner, thumbnail.', tools: ['Video AI', 'Image AI', 'Poster AI'], borderColor: 'hover:border-blue-500/30' },
                  { image: '/assets/homepage/uc-ecommerce.webp', industry: 'E-commerce', desc: 'Ảnh sản phẩm chuyên nghiệp, xoá nền hàng loạt cho catalog.', tools: ['Product Image', 'BG Removal', 'Upscale'], borderColor: 'hover:border-amber-500/30' },
                  { image: '/assets/homepage/uc-creator.webp', industry: 'Content Creator', desc: 'Video script-to-screen, nhạc nền, voiceover cho YouTube, TikTok.', tools: ['Video AI', 'Music AI', 'Voice'], borderColor: 'hover:border-purple-500/30' },
                  { image: '/assets/homepage/uc-realestate.webp', industry: 'Bất động sản', desc: 'Render nội thất AI, staging ảo, video tour bất động sản.', tools: ['Real Estate AI', 'Image AI'], borderColor: 'hover:border-emerald-500/30' },
                  { image: '/assets/homepage/uc-fashion.webp', industry: 'Thời trang', desc: 'Thử trang phục ảo, tạo lookbook, chụp model AI.', tools: ['Fashion AI', 'Stylist AI'], borderColor: 'hover:border-pink-500/30' },
                  { image: '/assets/homepage/uc-education.webp', industry: 'Giáo dục', desc: 'Bài giảng video, podcast, hình minh hoạ cho khoá học online.', tools: ['Voice AI', 'Video AI'], borderColor: 'hover:border-indigo-500/30' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.industry}
                    initial={{ opacity: 0, y: 30, scale: 0.92 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: idx * 0.1, duration: 0.6, type: 'spring', stiffness: 120 }}
                    whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.35 } }}
                    className={`flex-shrink-0 w-[220px] md:w-auto snap-start rounded-xl md:rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] ${item.borderColor} transition-all duration-500 group overflow-hidden`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img src={item.image} alt={item.industry} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    {/* Text */}
                    <div className="p-3 md:p-5 space-y-2 md:space-y-3">
                      <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white tracking-tight">{item.industry}</h3>
                      <p className="text-[10px] md:text-xs text-slate-500 dark:text-gray-400 leading-relaxed line-clamp-2 md:line-clamp-none">{item.desc}</p>
                      <div className="flex flex-wrap gap-1 md:gap-1.5 pt-1">
                        {item.tools.map(tool => (
                          <span key={tool} className="px-2 py-0.5 md:px-2.5 md:py-1 bg-slate-100 dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] text-[7px] md:text-[9px] font-bold text-slate-500 dark:text-gray-400 rounded-md md:rounded-lg uppercase tracking-wider">{tool}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
          {!query && (
            <section className="py-8 md:py-24">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/8 dark:bg-amber-500/15 border border-amber-500/15 dark:border-amber-500/25 rounded-full mb-3 md:mb-5">
                  <Sparkles size={12} className="text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">Testimonials</span>
                </div>
                <h2 className="text-xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-2 md:mb-4">
                  Tin dùng bởi <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">hàng nghìn người</span>
                </h2>
              </motion.div>

              <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-6 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 snap-x snap-mandatory">
                {[
                  { name: 'Minh Tuấn', role: 'Content Creator', initials: 'MT', avatarBg: 'bg-brand-blue/10 text-brand-blue', quote: 'Skyverses giúp tôi sản xuất 5 video/ngày thay vì 1. Chất lượng AI tạo ra không thua gì studio chuyên nghiệp.', rating: 5 },
                  { name: 'Thu Hà', role: 'Marketing Manager', initials: 'TH', avatarBg: 'bg-purple-500/10 text-purple-500', quote: 'Trước đây thuê photographer mỗi tháng tốn $2000. Giờ chỉ cần vài trăm Credits là có đủ ảnh cho cả tháng.', rating: 5 },
                  { name: 'David Nguyễn', role: 'E-commerce Owner', initials: 'DN', avatarBg: 'bg-emerald-500/10 text-emerald-500', quote: 'Background Removal AI xử lý 500 ảnh sản phẩm trong 30 phút. Image Upscale nâng chất lượng ảnh lên 4K cực nhanh.', rating: 5 },
                ].map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: idx * 0.15, type: 'spring', stiffness: 120 }}
                    whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
                    className="flex-shrink-0 w-[280px] md:w-auto snap-start p-5 md:p-8 rounded-xl md:rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-500 group"
                  >
                    <div className="space-y-5">
                      <div className="flex items-center gap-1">
                        {[...Array(item.rating)].map((_, i) => (
                          <motion.span key={i} className="text-amber-400 text-sm"
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + idx * 0.15 + i * 0.05, type: 'spring', stiffness: 300 }}
                          >★</motion.span>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed italic">"{item.quote}"</p>
                      <div className="flex items-center gap-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                        <div className={`relative w-10 h-10 rounded-full ${item.avatarBg} flex items-center justify-center text-sm font-black`}>
                          {item.initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wider">{item.role}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* ═══════════════════ CREDITS & PAYMENT ═══════════════════ */}
          {!query && (
            <section className="py-6 md:py-20">
              <div className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-[#0a0e1a] to-slate-900 dark:from-[#060810] dark:via-[#080c18] dark:to-[#060810] p-5 md:p-14 lg:p-16">

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-6 md:mb-12">
                    <div className="space-y-2 md:space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                        <Zap size={12} className="text-amber-400" fill="currentColor" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">Universal Credits</span>
                      </div>
                      <h2 className="text-xl md:text-4xl font-black tracking-tight text-white leading-[1.1]">
                        1 Credit,{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                          dùng cho tất cả
                        </span>
                      </h2>
                      <p className="text-xs md:text-sm text-white/40 max-w-lg leading-relaxed hidden md:block">
                        Không cần đăng ký riêng cho từng sản phẩm. Mua Credits một lần — sử dụng cho Video AI, Image AI, Voice, Music, Workflow và hơn 30 sản phẩm khác.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(isAuthenticated ? '/credits' : '/pricing')}
                      className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-7 py-3.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Zap size={14} fill="currentColor" />
                      {isAuthenticated ? 'Nạp Credits' : 'Xem bảng giá'}
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Credit Flow Steps — Image Cards */}
                  <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-12 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-2 md:pb-0 snap-x snap-mandatory">
                    {[
                      { step: '01', title: 'Mua Credits', desc: 'Chọn gói phù hợp hoặc nạp tuỳ ý. Nhận bonus khi mua gói lớn.', image: '/assets/credits/step-01-buy.webp' },
                      { step: '02', title: 'Sử dụng mọi nơi', desc: 'Dùng Credits cho bất kỳ sản phẩm nào — Video, Image, Voice, Music, Workflow...', image: '/assets/credits/step-02-use.webp' },
                      { step: '03', title: 'Nạp thêm khi cần', desc: 'Credits không hết hạn. Nạp thêm bất cứ lúc nào, chỉ trả cho những gì bạn dùng.', image: '/assets/credits/step-03-topup.webp' },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.15 }}
                        className="relative flex-shrink-0 w-[260px] md:w-auto snap-start rounded-xl md:rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/20 transition-all group overflow-hidden"
                      >
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-2 left-2 md:top-3 md:left-3">
                            <span className="px-2 py-0.5 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-[8px] font-black text-amber-400 uppercase tracking-widest rounded-md">Step {item.step}</span>
                          </div>
                        </div>
                        <div className="p-3 md:p-5 space-y-1.5 md:space-y-2">
                          <h3 className="text-sm md:text-base font-bold text-white">{item.title}</h3>
                          <p className="text-[10px] md:text-xs text-white/35 leading-relaxed">{item.desc}</p>
                        </div>
                        {idx < 2 && (
                          <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                            <ChevronRight size={16} className="text-white/10" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* ─── Payment Methods (merged) ─── */}
                  <div className="border-t border-white/[0.06] pt-6 md:pt-10">
                    {/* Mobile: compact payment row */}
                    <div
                      className="md:hidden flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer active:scale-[0.98] transition-all"
                      onClick={() => navigate(isAuthenticated ? '/credits' : '/login')}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                          <Landmark size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">Thanh toán linh hoạt & an toàn</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-1">
                              <Landmark size={10} className="text-brand-blue" />
                              <span className="text-[8px] font-bold text-white/40">Bank</span>
                            </div>
                            <div className="w-px h-2.5 bg-white/10" />
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] font-bold text-emerald-400">USDT</span>
                            </div>
                            <div className="w-px h-2.5 bg-white/10" />
                            <div className="flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[7px] font-bold text-emerald-400 uppercase">Auto</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-brand-blue shrink-0" />
                    </div>

                    {/* Desktop: payment cards */}
                    <div className="hidden md:flex items-center gap-8">
                      <div className="shrink-0 space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Thanh toán</span>
                        </div>
                        <p className="text-sm font-bold text-white/60 max-w-[160px] leading-relaxed">
                          Hỗ trợ chuyển khoản ngân hàng và crypto USDT
                        </p>
                      </div>

                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <motion.div
                          whileHover={{ y: -3, scale: 1.01 }}
                          transition={{ duration: 0.25 }}
                          onClick={() => navigate(isAuthenticated ? '/credits' : '/login')}
                          className="group cursor-pointer p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-brand-blue/30 transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-blue/15 to-cyan-500/15 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform duration-300 shrink-0">
                              <Landmark size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-white mb-1">Chuyển khoản ngân hàng</p>
                              <p className="text-[10px] text-white/35 leading-relaxed">VietQR — Tự động xác nhận qua webhook</p>
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {['Vietcombank', 'Techcombank', 'MB Bank', 'BIDV'].map(b => (
                                  <span key={b} className="px-2 py-0.5 bg-white/5 border border-white/[0.06] text-[8px] font-bold text-white/40 rounded-md">{b}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/[0.04]">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Tự động · 1-3 phút</span>
                            </div>
                            <ArrowRight size={14} className="text-white/20 group-hover:text-brand-blue group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </motion.div>

                        <motion.div
                          whileHover={{ y: -3, scale: 1.01 }}
                          transition={{ duration: 0.25 }}
                          onClick={() => navigate(isAuthenticated ? '/credits' : '/login')}
                          className="group cursor-pointer p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300 shrink-0">
                              <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                                <circle cx="16" cy="16" r="16" fill="#26A17B" fillOpacity="0.12"/>
                                <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003C9.85 17.17 7 16.42 7 15.5c0-.92 2.85-1.672 6.009-1.883v2.387c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.386C19.908 13.83 22.75 14.58 22.75 15.5c0 .92-2.842 1.67-6.828 1.883zM13.009 13.375v-2.127h-3.36V9h12.702v2.248h-3.36v2.124c3.514.26 6.009 1.17 6.009 2.251 0 1.08-2.495 1.99-6.009 2.25v4.03H13.01v-4.031c-3.514-.26-6.009-1.17-6.009-2.25 0-1.08 2.495-1.99 6.009-2.25z" fill="#26A17B"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-white mb-1">Crypto USDT</p>
                              <p className="text-[10px] text-white/35 leading-relaxed">BSC / ETH — MetaMask, Trust Wallet, Coinbase</p>
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {['BEP-20', 'ERC-20', 'MetaMask', 'WalletConnect'].map(b => (
                                  <span key={b} className="px-2 py-0.5 bg-white/5 border border-white/[0.06] text-[8px] font-bold text-white/40 rounded-md">{b}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/[0.04]">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">On-chain · 5-10 phút</span>
                            </div>
                            <ArrowRight size={14} className="text-white/20 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </motion.div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(isAuthenticated ? '/credits' : '/login')}
                        className="group shrink-0 relative inline-flex flex-col items-center gap-1.5 px-6 py-4 rounded-2xl bg-gradient-to-br from-brand-blue to-purple-600 text-white shadow-xl shadow-brand-blue/20 hover:shadow-2xl hover:shadow-brand-blue/30 transition-all duration-300 overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Sparkles size={20} className="relative z-10" fill="currentColor" />
                        <span className="relative z-10 text-xs font-black whitespace-nowrap">Nạp Credits</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════════ CUSTOM SOLUTIONS — Enterprise ═══════════════════ */}
          {!query && (
            <section className="py-6 md:py-24">
              {/* ─── Section Header ─── */}
              <motion.div initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-6 md:mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/8 dark:bg-amber-500/15 border border-amber-500/15 dark:border-amber-500/25 rounded-full mb-3 md:mb-5">
                  <Cpu size={12} className="text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">Enterprise Solutions</span>
                </div>
                <h2 className="text-xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-2 md:mb-4">
                  Giải pháp AI{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
                    riêng cho doanh nghiệp
                  </span>
                </h2>
                <p className="text-xs md:text-sm text-slate-400 dark:text-gray-500 max-w-2xl mx-auto hidden md:block">
                  Skyverses chuyên tư vấn, thiết kế và xây dựng các công cụ AI theo yêu cầu.
                  Từ chatbot, xử lý ảnh/video, workflow tự động đến hệ thống AI hoàn chỉnh cho doanh nghiệp.
                </p>
              </motion.div>

              {/* ─── Image Service Cards — Horizontal scroll ─── */}
              <div className="flex gap-3 md:gap-5 overflow-x-auto no-scrollbar -mx-4 px-4 md:-mx-0 md:px-0 pb-2 md:pb-0 snap-x snap-mandatory mb-6 md:mb-10">
                {[
                  { image: '/assets/homepage/ent-ai-strategy.webp', icon: <Brain size={18} />, accentColor: 'from-blue-500 to-cyan-500', borderHover: 'hover:border-blue-500/30', tagBg: 'bg-blue-500/20 border-blue-500/30 text-blue-400', title: 'Tư vấn AI Strategy', desc: 'Phân tích nhu cầu, đề xuất giải pháp AI phù hợp cho quy trình kinh doanh của bạn.', tag: 'Strategy' },
                  { image: '/assets/homepage/ent-custom-tools.webp', icon: <Wrench size={18} />, accentColor: 'from-purple-500 to-pink-500', borderHover: 'hover:border-purple-500/30', tagBg: 'bg-purple-500/20 border-purple-500/30 text-purple-400', title: 'Build Custom Tools', desc: 'Phát triển công cụ AI theo spec riêng — image gen, video pipeline, chatbot, voice clone.', tag: 'Development' },
                  { image: '/assets/homepage/ent-api-integration.webp', icon: <Plug size={18} />, accentColor: 'from-emerald-500 to-teal-500', borderHover: 'hover:border-emerald-500/30', tagBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400', title: 'API & Integration', desc: 'Tích hợp AI vào hệ thống hiện có qua API. Hỗ trợ webhook, SDK và tài liệu đầy đủ.', tag: 'Integration' },
                  { image: '/assets/homepage/ent-deploy-scale.webp', icon: <Rocket size={18} />, accentColor: 'from-amber-500 to-orange-500', borderHover: 'hover:border-amber-500/30', tagBg: 'bg-amber-500/20 border-amber-500/30 text-amber-400', title: 'Deploy & Scale', desc: 'Triển khai lên cloud, tối ưu hiệu năng, hỗ trợ scale tự động theo nhu cầu sử dụng.', tag: 'Infrastructure' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 30, scale: 0.92 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: idx * 0.12, duration: 0.6, type: 'spring', stiffness: 120 }}
                    whileHover={{ y: -6, transition: { duration: 0.35 } }}
                    className={`flex-shrink-0 w-[280px] md:w-[320px] snap-start rounded-xl md:rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] ${item.borderHover} transition-all duration-500 group overflow-hidden`}
                  >
                    {/* Image with overlay */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      {/* Tag badge */}
                      <div className="absolute top-2 left-2 md:top-3 md:left-3">
                        <span className={`px-2 py-0.5 backdrop-blur-sm border text-[8px] font-black uppercase tracking-widest rounded-md ${item.tagBg}`}>{item.tag}</span>
                      </div>
                      {/* Icon in bottom-right of overlay */}
                      <div className="absolute bottom-2.5 right-2.5 md:bottom-4 md:right-4">
                        <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br ${item.accentColor} flex items-center justify-center text-white shadow-lg shadow-black/30 group-hover:scale-110 transition-transform duration-300`}>
                          {item.icon}
                        </div>
                      </div>
                    </div>
                    {/* Text content */}
                    <div className="p-3 md:p-5 space-y-1.5 md:space-y-2">
                      <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white tracking-tight">{item.title}</h3>
                      <p className="text-[10px] md:text-xs text-slate-500 dark:text-gray-400 leading-relaxed line-clamp-2 md:line-clamp-none">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ─── CTA — amber/warm tone ─── */}
              <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                <button
                  onClick={() => navigate('/booking')}
                  className="group inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto justify-center"
                >
                  <Building2 size={16} />
                  Liên hệ tư vấn miễn phí
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="mailto:support@skyverses.com"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">hoặc email:</span>
                  <span className="font-bold text-amber-500">support@skyverses.com</span>
                </a>
              </motion.div>

              <p className="text-center text-[10px] font-medium text-slate-300 dark:text-white/20 mt-4 md:mt-6">✦ Tư vấn miễn phí • Phản hồi trong 24 giờ • Hỗ trợ dài hạn</p>
            </section>
          )}

          {/* ═══════════════════ INVITE FRIENDS & EARN ═══════════════════ */}
          {!query && (
            <section className="py-8 md:py-24 space-y-4 md:space-y-6">

              {/* ═══ MOBILE: Compact referral card ═══ */}
              <div className="md:hidden space-y-3">
                {/* Main compact card */}
                <div
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue/10 via-purple-500/10 to-pink-500/10 dark:from-brand-blue/5 dark:via-purple-500/5 dark:to-pink-500/5 border border-brand-blue/10 dark:border-white/[0.06] p-5 cursor-pointer active:scale-[0.98] transition-all"
                  onClick={() => navigate(isAuthenticated ? '/referral' : '/pricing')}
                >
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-blue/10 dark:bg-brand-blue/15 border border-brand-blue/20 rounded-full">
                        <Users size={10} className="text-brand-blue" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-blue">Invite & Earn</span>
                      </div>
                      <ArrowRight size={16} className="text-brand-blue" />
                    </div>

                    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                      Mời bạn bè, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-purple-500 to-pink-500">nhận Credits</span>
                    </h2>

                    {/* Reward pills inline */}
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#0d0d0f] rounded-xl border border-black/[0.06] dark:border-white/[0.06] shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center text-white shrink-0">
                          <Zap size={16} fill="currentColor" />
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-400 font-medium">Bạn nhận</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">+50 CR</p>
                        </div>
                      </div>
                      <div className="flex-1 flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#0d0d0f] rounded-xl border border-black/[0.06] dark:border-white/[0.06] shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                          <Gift size={16} />
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-400 font-medium">Bạn bè nhận</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">+50 CR</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(isAuthenticated ? '/referral' : '/pricing'); }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-blue to-purple-500 text-white py-3 rounded-xl text-[11px] font-bold shadow-lg shadow-brand-blue/15 active:scale-[0.97] transition-all"
                    >
                      <Gift size={13} />
                      {isAuthenticated ? 'Lấy link giới thiệu' : 'Đăng ký & nhận Credits'}
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Horizontal scroll benefit chips */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
                  {[
                    { icon: <Zap size={12} fill="currentColor" />, text: '+50 CR mỗi lượt mời', color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/15' },
                    { icon: <CreditCard size={12} />, text: '5% hoa hồng (Coming)', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/15' },
                    { icon: <Sparkles size={12} />, text: 'Badge Referrer', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/15' },
                    { icon: <Users size={12} />, text: 'Không giới hạn', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
                    { icon: <RefreshCw size={12} />, text: 'Thu nhập vĩnh viễn', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/15' },
                  ].map((item) => (
                    <div key={item.text} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl ${item.bg} border ${item.border}`}>
                      <span className={item.color}>{item.icon}</span>
                      <span className="text-[9px] font-bold text-slate-600 dark:text-gray-400 whitespace-nowrap">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Mini stats bar */}
                <div className="flex items-center justify-center gap-5 py-2.5 px-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <Users size={11} className="text-brand-blue" />
                    <span className="text-xs font-black text-slate-900 dark:text-white">2,847</span>
                    <span className="text-[7px] font-bold text-slate-400 uppercase">tham gia</span>
                  </div>
                  <div className="w-px h-4 bg-black/[0.06] dark:bg-white/[0.06]" />
                  <div className="flex items-center gap-1.5">
                    <Zap size={11} className="text-amber-500" fill="currentColor" />
                    <span className="text-xs font-black text-brand-blue">142K</span>
                    <span className="text-[7px] font-bold text-slate-400 uppercase">CR tặng</span>
                  </div>
                </div>
              </div>

              {/* ═══ DESKTOP: Full referral section ═══ */}
              {/* ─── MAIN REFERRAL BLOCK ─── */}
              <div className="hidden md:block relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue/10 via-purple-500/10 to-pink-500/10 dark:from-brand-blue/5 dark:via-purple-500/5 dark:to-pink-500/5 border border-brand-blue/10 dark:border-white/[0.06]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 p-16 flex flex-row items-center gap-16">
                  <div className="flex-1 text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 dark:bg-brand-blue/15 border border-brand-blue/20 rounded-full">
                      <Users size={12} className="text-brand-blue" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue">Invite & Earn</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                      Mời bạn bè,{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-purple-500 to-pink-500">nhận Credits miễn phí</span>
                    </h2>
                    <p className="text-base text-slate-500 dark:text-gray-400 max-w-lg leading-relaxed">
                      Chia sẻ link giới thiệu của bạn. Khi bạn bè đăng ký và sử dụng, cả hai đều nhận được Credits miễn phí để sáng tạo với AI.
                    </p>
                    <div className="flex flex-row gap-6 pt-2">
                      {[
                        { num: '1', text: 'Chia sẻ link', icon: <Share2 size={16} /> },
                        { num: '2', text: 'Bạn bè đăng ký', icon: <UserPlus size={16} /> },
                        { num: '3', text: 'Nhận Credits', icon: <Gift size={16} /> },
                      ].map((s) => (
                        <div key={s.num} className="flex items-center gap-2.5 px-3 py-2 bg-white/50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
                          <div className="w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">{s.icon}</div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300">{s.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-row gap-3 pt-2">
                      <button
                        onClick={() => navigate(isAuthenticated ? '/referral' : '/pricing')}
                        className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-blue to-purple-500 text-white px-7 py-3.5 rounded-xl text-xs font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Gift size={14} />
                        {isAuthenticated ? 'Lấy link giới thiệu' : 'Đăng ký & nhận Credits'}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-[340px] lg:w-[400px]">
                    <div className="space-y-3">
                      {[
                        { label: 'Bạn nhận được', amount: '+50 Credits', color: 'from-brand-blue to-blue-600', icon: <Zap size={18} fill="currentColor" /> },
                        { label: 'Bạn bè nhận được', amount: '+50 Credits', color: 'from-purple-500 to-pink-500', icon: <Gift size={18} /> },
                      ].map((reward, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + idx * 0.15, type: 'spring', stiffness: 120 }}
                          className="flex items-center gap-4 p-5 bg-white dark:bg-[#0d0d0f] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] shadow-xl"
                        >
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${reward.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                            {reward.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-400 dark:text-gray-500 font-medium">{reward.label}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{reward.amount}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Check size={16} className="text-emerald-500" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-6 py-3 px-4 bg-white/50 dark:bg-white/[0.02] rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                      <div className="text-center">
                        <p className="text-xl font-black text-slate-900 dark:text-white">2,847</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Người tham gia</p>
                      </div>
                      <div className="w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />
                      <div className="text-center">
                        <p className="text-xl font-black text-brand-blue">142K</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Credits đã tặng</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── 5% COMMISSION TEASER ─── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="hidden md:block relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0e18] via-[#0e1225] to-[#120c20] border border-white/[0.06] p-10"
              >
                {/* Glow effects */}
                <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-amber-500/8 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[180px] h-[180px] bg-purple-500/8 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/25 rounded-full">
                        <Rocket size={11} className="text-amber-400" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">Coming Q2 2026</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <CreditCard size={10} className="text-white/40" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Passive Income</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-white leading-tight">
                      Nhận <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">5% hoa hồng vĩnh viễn</span> khi bạn bè nạp Credits
                    </h3>
                    <p className="text-sm text-white/40 max-w-lg leading-relaxed">
                      Mỗi khi bạn bè bạn giới thiệu nạp Credits, bạn tự động nhận <strong className="text-white/60">5% giá trị</strong> — không giới hạn số lần, không giới hạn số người. Thu nhập thụ động thực sự.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { icon: <CreditCard size={11} />, text: '5% mỗi giao dịch' },
                        { icon: <RefreshCw size={11} />, text: 'Thu nhập vĩnh viễn' },
                        { icon: <Users size={11} />, text: 'Không giới hạn' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/[0.06] rounded-lg">
                          <span className="text-amber-400">{item.icon}</span>
                          <span className="text-[9px] font-bold text-white/50">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Earn Example Card */}
                  <div className="shrink-0 w-full lg:w-auto">
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-3">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Ví dụ thu nhập</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                          <Users size={13} className="text-brand-blue shrink-0" />
                          <span className="text-[11px] font-medium text-white/60">10 bạn bè giới thiệu</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <ChevronRight size={12} className="text-white/15 rotate-90" />
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                          <CreditCard size={13} className="text-purple-400 shrink-0" />
                          <span className="text-[11px] font-medium text-white/60">Mỗi người nạp 100K CR/tháng</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <ChevronRight size={12} className="text-white/15 rotate-90" />
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                          <Zap size={14} className="text-amber-400 shrink-0" fill="currentColor" />
                          <span className="text-[12px] font-black text-amber-400">Bạn nhận 50,000 CR/tháng</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>


            </section>
          )}
        </div>
      </div>

      <GlobalToolsBar />

      {/* ═══ Demo Modal ═══ */}
      <AnimatePresence>
        {isDemoOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setIsDemoOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-5xl bg-[#0a0a0c] border border-white/10 rounded-[2rem] overflow-hidden shadow-3xl aspect-video flex flex-col">
              <div className="absolute top-6 right-6 z-50"><button onClick={() => setIsDemoOpen(false)} className="p-2 bg-black/40 hover:bg-red-500 rounded-full text-white transition-colors"><X size={24} /></button></div>
              <div className="flex-grow relative flex items-center justify-center overflow-hidden bg-black">
                <div className="text-center space-y-8 z-10 p-12">
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="relative"><div className="absolute inset-0 bg-brand-blue blur-[80px] opacity-20 rounded-full animate-pulse"></div><img src={logoUrl} className="w-32 h-32 md:w-48 md:h-48 object-contain mx-auto relative drop-shadow-[0_0_30px_rgba(0,144,255,0.2)]" alt="Skyverses Logo" /></motion.div>
                  <div className="space-y-2"><h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">Coming <span className="text-brand-blue">Soon.</span></h3></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.3; }
          50% { transform: translateY(-15px); opacity: 0.7; }
        }
        @keyframes marqueeUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes marqueeDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MarketPage;
