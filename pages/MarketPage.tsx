
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketApi } from '../apis/market';
import { systemConfigApi } from '../apis/config';
import { Solution, HomeBlock, Language } from '../types';
import {
  X, SearchX, Search, Flame, Video, ImageIcon, LayoutGrid, Gift, Workflow,
  Sparkles, LucideIcon, ArrowRight, ChevronRight, Play, Zap, Shield, Globe2, Cpu
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import AIModelsMarquee from '../components/AIModelsMarquee';
import ExploreMoreAI from '../components/ExploreMoreAI';
import GlobalToolsBar from '../components/GlobalToolsBar';
import { motion, AnimatePresence } from 'framer-motion';
import { handleAdminQuickLogin } from '../utils/adminAuth';

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
  const { isAuthenticated, loginWithEmail } = useAuth();
  const navigate = useNavigate();

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
    if (!isAuthenticated) handleAdminQuickLogin(loginWithEmail, navigate);
  }, [isAuthenticated, loginWithEmail, navigate]);

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

  const filteredSolutions = useMemo(() => {
    return solutions.filter(sol => {
      if (secondary === 'ALL') return true;
      return sol.tags?.some(t => t.toLowerCase() === secondary.toLowerCase()) ||
        sol.id?.toLowerCase().includes(secondary.toLowerCase());
    });
  }, [solutions, secondary]);

  const logoUrl = "https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268";
  const currentLang = lang as Language;
  const activeFeatured = featuredSolutions[featuredIdx];

  return (
    <div className="relative min-h-screen bg-[#fcfcfd] dark:bg-[#030304] font-sans transition-colors duration-500">
      {/* ═══ Background Mesh ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[1200px] h-[800px] bg-brand-blue/[0.04] dark:bg-brand-blue/[0.06] rounded-full blur-[200px]" />
        <div className="absolute top-[60%] left-[-10%] w-[600px] h-[600px] bg-purple-500/[0.03] dark:bg-purple-500/[0.04] rounded-full blur-[180px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-500/[0.02] dark:bg-pink-500/[0.03] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* ═══════════════════ HERO ═══════════════════ */}
        {!query && (
          <section className="pt-24 md:pt-32 pb-0 max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center min-h-[60vh] lg:min-h-[70vh]">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8 lg:pr-16"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-blue/8 dark:bg-brand-blue/15 border border-brand-blue/15 dark:border-brand-blue/25">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue">Skyverses AI Ecosystem</span>
                </div>

                {/* Headline */}
                <div className="space-y-3">
                  <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.2rem] font-black tracking-[-0.04em] leading-[1.05] text-slate-900 dark:text-white">
                    Nền tảng{' '}
                    <span className="relative inline-block">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-purple-500 to-pink-500 bg-[length:200%_auto] animate-[gradient_4s_ease_infinite]">
                        sản phẩm AI
                      </span>
                    </span>
                    <br />
                    cho mọi nhu cầu sáng tạo
                  </h1>
                  <p className="text-base md:text-lg text-slate-500 dark:text-gray-400 leading-relaxed max-w-xl">
                    Hệ sinh thái hơn 30 sản phẩm AI — từ Video, Hình ảnh, Giọng nói, Nhạc đến Workflow tự động hoá.
                    Được phát triển bởi đội ngũ Skyverses.
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => navigate(isAuthenticated ? '/explorer' : '/login')}
                    className="group inline-flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-7 py-4 rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    Khám phá sản phẩm
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="inline-flex items-center gap-3 bg-white dark:bg-white/5 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 px-7 py-4 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300"
                  >
                    <Play size={14} className="text-brand-blue" fill="currentColor" />
                    Xem demo
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 pt-4">
                  {[
                    { value: 30, suffix: '+', label: 'AI Products' },
                    { value: 50, suffix: '+', label: 'AI Models' },
                    { value: 1000, suffix: '+', label: 'Users' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right: Featured Visual */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {featuredSolutions.length > 0 && activeFeatured && (
                  <div className="relative">
                    {/* Glow behind card */}
                    <div className="absolute inset-0 bg-brand-blue/10 dark:bg-brand-blue/20 blur-[80px] rounded-full scale-75" />

                    {/* Main featured card */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeFeatured.id}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.6 }}
                        onClick={() => handleNavigate(activeFeatured.slug)}
                        className="relative rounded-3xl overflow-hidden cursor-pointer group aspect-[4/3] shadow-2xl border border-black/5 dark:border-white/5"
                      >
                        <img src={activeFeatured.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Overlay content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 bg-brand-blue/90 text-white text-[8px] font-black uppercase tracking-widest rounded-md">{activeFeatured.category[currentLang]}</span>
                            <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-wider rounded-md border border-white/10">Featured</span>
                          </div>
                          <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">{activeFeatured.name[currentLang]}</h3>
                          <p className="text-white/60 text-sm line-clamp-2 max-w-md">{activeFeatured.description[currentLang]}</p>

                          <div className="flex items-center gap-4 mt-4">
                            <button className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-white/90 transition-all active:scale-95 shadow-lg">
                              Khám phá <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-6">
                      {featuredSolutions.map((_, i) => (
                        <button key={i} onClick={() => setFeaturedIdx(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === featuredIdx ? 'w-8 bg-brand-blue' : 'w-1.5 bg-slate-300 dark:bg-white/15'}`} />
                      ))}
                    </div>
                  </div>
                )}

                {loading && featuredSolutions.length === 0 && (
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-white/5 rounded-3xl animate-pulse" />
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════════════════ AI MODELS MARQUEE ═══════════════════ */}
        <div className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 mt-8">
          <AIModelsMarquee />
        </div>

        {/* ═══════════════════ TRUST PILLARS ═══════════════════ */}
        {!query && (
          <section className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 py-12 md:py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: <Zap size={20} />, title: 'Xử lý tức thì', desc: 'GPU cloud hiệu năng cao', color: 'text-amber-500', bg: 'bg-amber-500/8 dark:bg-amber-500/10' },
                { icon: <Shield size={20} />, title: 'Bảo mật dữ liệu', desc: 'Mã hoá end-to-end', color: 'text-emerald-500', bg: 'bg-emerald-500/8 dark:bg-emerald-500/10' },
                { icon: <Globe2 size={20} />, title: 'Đa ngôn ngữ', desc: 'Hỗ trợ English, 한국어, 日本語', color: 'text-brand-blue', bg: 'bg-brand-blue/8 dark:bg-brand-blue/10' },
                { icon: <Cpu size={20} />, title: 'Multi-engine', desc: 'Kết hợp nhiều AI model', color: 'text-purple-500', bg: 'bg-purple-500/8 dark:bg-purple-500/10' },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group p-5 md:p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.05] hover:border-black/[0.08] dark:hover:border-white/[0.1] transition-all duration-300 hover:shadow-lg"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 dark:text-gray-500 font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════ CREDITS SYSTEM ═══════════════════ */}
        {!query && (
          <section className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 py-12 md:py-20">
            <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-[#0a0e1a] to-slate-900 dark:from-[#060810] dark:via-[#080c18] dark:to-[#060810] p-8 md:p-14 lg:p-16">
              {/* Background glows */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-blue/8 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                      <Zap size={12} className="text-amber-400" fill="currentColor" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">Universal Credits</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-[1.1]">
                      1 loại Credit,{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                        dùng cho tất cả sản phẩm
                      </span>
                    </h2>
                    <p className="text-sm text-white/40 max-w-lg leading-relaxed">
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

                {/* Credit Flow Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
                  {[
                    { step: '01', title: 'Mua Credits', desc: 'Chọn gói phù hợp hoặc nạp tuỳ ý. Nhận bonus khi mua gói lớn.', icon: '💳' },
                    { step: '02', title: 'Sử dụng mọi nơi', desc: 'Dùng Credits cho bất kỳ sản phẩm nào — Video, Image, Voice, Music, Workflow...', icon: '⚡' },
                    { step: '03', title: 'Nạp thêm khi cần', desc: 'Credits không hết hạn. Nạp thêm bất cứ lúc nào, chỉ trả cho những gì bạn dùng.', icon: '🔄' },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.15 }}
                      className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">{item.icon}</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-amber-400/60 uppercase tracking-widest">Step {item.step}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                          <p className="text-xs text-white/35 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                      {idx < 2 && (
                        <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                          <ChevronRight size={16} className="text-white/10" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════ ACTIVE FILTER BAR ═══════════════════ */}
        <div className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20">
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
                {homeBlocks.map((block) => {
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
                        onSeeAll={() => navigate(`/category/${block.key}`)}
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
                            stats={getFakeStats(sol._id || sol.id)}
                          />
                        ))}

                        <div
                          onClick={() => navigate(`/category/${block.key}`)}
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

          {!loading && filteredSolutions.length > 0 && <ExploreMoreAI />}
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
      `}</style>
    </div>
  );
};

export default MarketPage;
