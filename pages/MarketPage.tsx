
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
  MonitorPlay, Palette, UserCircle, Landmark, TrendingDown
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
    description: 'Skyverses Marketplace — 30+ ứng dụng AI, 50+ model (VEO3, Kling, Sora, Midjourney, Flux). Tiết kiệm ~70% chi phí. Tạo video, ảnh, nhạc, giọng nói & tự động hoá trong một nơi.',
    keywords: 'AI marketplace, hệ sinh thái AI, ứng dụng AI, VEO3, Kling, Sora, Midjourney, Flux, tạo video AI, tạo ảnh AI, AI giá rẻ, 50+ model AI, Skyverses',
    canonical: '/'
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
          <section className="pt-24 md:pt-32 pb-0 max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 relative">
            {/* Lightweight floating particles — reduced from 12 to 4, no box-shadow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`absolute rounded-full ${i % 2 === 0 ? 'w-1.5 h-1.5 bg-brand-blue/30' : 'w-1 h-1 bg-purple-400/25'}`} style={{
                  left: `${15 + i * 20}%`, top: `${20 + ((i * 17) % 50)}%`,
                  animation: `float ${3 + i * 0.8}s ease-in-out infinite ${i * 0.5}s`
                }} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center min-h-[60vh] lg:min-h-[70vh]">
              {/* Left: Content — stagger children */}
              <div className="space-y-8 lg:pr-16">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, delay: 0.1 }}
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
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-base md:text-lg text-slate-500 dark:text-gray-400 leading-relaxed max-w-xl"
                  >
                    Hệ sinh thái hơn 30 sản phẩm AI — từ Video, Hình ảnh, Giọng nói, Nhạc đến Workflow tự động hoá.
                    Được phát triển bởi đội ngũ Skyverses.
                  </motion.p>
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-wrap gap-3 pt-2"
                >
                  <button
                    onClick={() => navigate('/markets')}
                    className="group relative inline-flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-7 py-4 rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl hover:shadow-brand-blue/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-brand-blue to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 flex items-center gap-3 group-hover:text-white">
                      Khám phá sản phẩm
                      <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/markets')}
                    className="inline-flex items-center gap-3 bg-white dark:bg-white/5 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 px-7 py-4 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/10 hover:border-brand-blue/30 transition-all duration-300"
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
                  className="flex items-center gap-8 pt-4"
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

              {/* Right: Vertical Scrolling Gallery */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative h-[420px] md:h-[520px] lg:h-[580px] overflow-hidden rounded-3xl"
              >

                {/* Fade masks top & bottom */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#fcfcfd] dark:from-[#030304] to-transparent z-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#fcfcfd] dark:from-[#030304] to-transparent z-20 pointer-events-none" />

                {/* Two-column vertical marquee */}
                <div className="relative z-10 grid grid-cols-2 gap-3 h-full">
                  {/* Column 1 — scrolls UP */}
                  <div className="overflow-hidden relative">
                    <div className="animate-[marqueeUp_25s_linear_infinite] flex flex-col gap-3">
                      {(() => {
                        const col1Images = [
                          'https://d8j0ntlcm91z4.cloudfront.net/user_2wktMsxjtKgSKtgICToGYmGGjfw/955c04bf-959f-4832-843a-dfbaad2d82a3_min.webp',
                          'https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/596c139a-7cd8-4c10-9305-bad2f9b6ab1f_min.webp',
                          'https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/640d8657-22e1-4ec7-adcf-d2b99f4e25e0_min.webp',
                        ];
                        return [...col1Images, ...col1Images].map((url, i) => (
                          <div key={`up-${i}`} className="rounded-2xl overflow-hidden group cursor-pointer relative flex-shrink-0">
                            <img src={url} alt="" loading={i < 3 ? 'eager' : 'lazy'} fetchPriority={i < 2 ? 'high' : 'auto'} className="w-full h-[180px] md:h-[220px] object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Column 2 — scrolls DOWN */}
                  <div className="overflow-hidden relative">
                    <div className="animate-[marqueeDown_30s_linear_infinite] flex flex-col gap-3">
                      {(() => {
                        const col2Images = [
                          'https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/6571fcff-b67e-4537-98fe-0301d9051c57_min.webp',
                          'https://d8j0ntlcm91z4.cloudfront.net/user_2wktMsxjtKgSKtgICToGYmGGjfw/1354a1b1-5ef3-46d7-8cb2-17268db2d7f7_min.webp',
                          'https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/82e86e0d-db5a-4bcf-8f7b-142ff21f8442_min.webp',
                        ];
                        return [...col2Images, ...col2Images].map((url, i) => (
                          <div key={`down-${i}`} className="rounded-2xl overflow-hidden group cursor-pointer relative flex-shrink-0">
                            <img src={url} alt="" loading={i < 3 ? 'eager' : 'lazy'} fetchPriority={i < 2 ? 'high' : 'auto'} className="w-full h-[200px] md:h-[240px] object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full shadow-xl">
                    <Sparkles size={12} className="text-brand-blue" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-white/80">Powered by 50+ AI Models</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════════════════ AI MODELS MARQUEE ═══════════════════ */}
        <div className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 mt-4">
          <AIModelsMarquee />
        </div>

        {/* ═══════════════════ TRUST PILLARS ═══════════════════ */}
        {!query && (
          <section className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 py-8 md:py-12">
            <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-[#0a0c12] dark:via-[#0c0e16] dark:to-[#0a0c12] border border-black/[0.04] dark:border-white/[0.04] p-8 md:p-12 lg:p-14">

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
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} ring-1 ${item.ring} flex items-center justify-center mx-auto md:mx-0 mb-5 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3 transition-all duration-500`}>
                      {item.icon}
                    </div>

                    {/* Stat */}
                    <div className="mb-3">
                      <span className={`text-3xl md:text-4xl font-black tracking-tight ${item.color}`}>{item.stat}</span>
                      <span className="block text-[8px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-[0.3em] mt-1">{item.statLabel}</span>
                    </div>

                    {/* Content */}
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}



        {/* ═══════════════════ PAYMENT METHODS ═══════════════════ */}
        {!query && (
          <section className="max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20 py-6 md:py-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[2rem] border border-black/[0.05] dark:border-white/[0.05] bg-gradient-to-br from-slate-50 to-white dark:from-[#0a0c12] dark:to-[#0c0f18] p-7 md:p-10"
            >

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
                {/* Label */}
                <div className="shrink-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/8 dark:bg-emerald-500/15 border border-emerald-500/15 dark:border-emerald-500/25 rounded-full mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Thanh toán</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Nạp credits<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-emerald-500">linh hoạt & an toàn</span>
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-gray-500 mt-2 max-w-[200px] leading-relaxed">
                    Hỗ trợ chuyển khoản ngân hàng và thanh toán crypto USDT.
                  </p>
                </div>

                {/* Payment cards */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* Bank Transfer */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => navigate(isAuthenticated ? '/credits' : '/login')}
                    className="group relative cursor-pointer p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-brand-blue/30 hover:shadow-lg hover:shadow-brand-blue/5 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-blue/10 to-cyan-500/10 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform duration-300 shrink-0">
                        <Landmark size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Chuyển khoản ngân hàng</p>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 leading-relaxed">VietQR — Tự động xác nhận qua webhook</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {['Vietcombank', 'Techcombank', 'MB Bank', 'BIDV'].map(b => (
                            <span key={b} className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-black/[0.05] dark:border-white/[0.06] text-[8px] font-bold text-slate-400 dark:text-gray-500 rounded-md">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Tự động · 1-3 phút</span>
                      </div>
                      <ArrowRight size={14} className="text-slate-300 dark:text-gray-600 group-hover:text-brand-blue group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </motion.div>

                  {/* Crypto USDT */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => navigate(isAuthenticated ? '/credits' : '/login')}
                    className="group relative cursor-pointer p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300 shrink-0">
                        {/* USDT coin icon */}
                        <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                          <circle cx="16" cy="16" r="16" fill="#26A17B" fillOpacity="0.12"/>
                          <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003C9.85 17.17 7 16.42 7 15.5c0-.92 2.85-1.672 6.009-1.883v2.387c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.386C19.908 13.83 22.75 14.58 22.75 15.5c0 .92-2.842 1.67-6.828 1.883zM13.009 13.375v-2.127h-3.36V9h12.702v2.248h-3.36v2.124c3.514.26 6.009 1.17 6.009 2.251 0 1.08-2.495 1.99-6.009 2.25v4.03H13.01v-4.031c-3.514-.26-6.009-1.17-6.009-2.25 0-1.08 2.495-1.99 6.009-2.25z" fill="#26A17B"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Crypto USDT</p>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 leading-relaxed">BSC / ETH — MetaMask, Trust Wallet, Coinbase</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {['BEP-20', 'ERC-20', 'MetaMask', 'WalletConnect'].map(b => (
                            <span key={b} className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-black/[0.05] dark:border-white/[0.06] text-[8px] font-bold text-slate-400 dark:text-gray-500 rounded-md">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">On-chain · 5-10 phút</span>
                      </div>
                      <ArrowRight size={14} className="text-slate-300 dark:text-gray-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </motion.div>
                </div>

                {/* CTA button */}
                <div className="shrink-0 self-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(isAuthenticated ? '/credits' : '/login')}
                    className="group relative inline-flex flex-col items-center gap-1.5 px-6 py-4 rounded-2xl bg-gradient-to-br from-brand-blue to-purple-600 text-white shadow-xl shadow-brand-blue/20 hover:shadow-2xl hover:shadow-brand-blue/30 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Sparkles size={20} className="relative z-10" fill="currentColor" />
                    <span className="relative z-10 text-xs font-black whitespace-nowrap">Nạp Credits</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
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

          {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
          {!query && (
            <section className="py-20 md:py-28">
              <div className="text-center mb-14 md:mb-20">
                <motion.div initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/8 dark:bg-brand-blue/15 border border-brand-blue/15 dark:border-brand-blue/25 rounded-full mb-5">
                    <Sparkles size={12} className="text-brand-blue" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue">How It Works</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-4">
                    Bắt đầu trong <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-500">3 bước đơn giản</span>
                  </h2>
                  <p className="text-sm md:text-base text-slate-400 dark:text-gray-500 max-w-lg mx-auto">Không cần cài đặt, không cần kỹ năng. Chỉ cần đăng nhập và bắt đầu sáng tạo.</p>
                </motion.div>
              </div>

              <div className="relative">


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {[
                    { step: '01', title: 'Chọn công cụ AI', desc: 'Duyệt qua 30+ sản phẩm AI — Video, Image, Voice, Music, Workflow — tìm đúng công cụ bạn cần.', icon: <MousePointerClick size={28} />, iconBg: 'bg-brand-blue/10 text-brand-blue', gradient: 'from-brand-blue/10 to-purple-500/10', border: 'hover:border-brand-blue/30', pulse: 'brand-blue' },
                    { step: '02', title: 'Nhập nội dung của bạn', desc: 'Upload ảnh, nhập prompt, hoặc chọn template có sẵn. AI sẽ xử lý phần còn lại.', icon: <Wand2 size={28} />, iconBg: 'bg-purple-500/10 text-purple-500', gradient: 'from-purple-500/10 to-pink-500/10', border: 'hover:border-purple-500/30', pulse: 'purple-500' },
                    { step: '03', title: 'Nhận kết quả chuyên nghiệp', desc: 'Tải về ảnh, video, audio chất lượng cao trong vài giây. Chỉnh sửa và xuất bản ngay.', icon: <Rocket size={28} />, iconBg: 'bg-pink-500/10 text-pink-500', gradient: 'from-pink-500/10 to-amber-500/10', border: 'hover:border-pink-500/30', pulse: 'pink-500' },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 40, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ delay: idx * 0.2, duration: 0.7, type: 'spring', stiffness: 100 }}
                      whileHover={{ y: -8, rotateY: 3, transition: { duration: 0.4 } }}
                      className={`relative p-8 md:p-10 rounded-3xl bg-gradient-to-br ${item.gradient} dark:from-white/[0.02] dark:to-white/[0.01] border border-black/[0.05] dark:border-white/[0.05] ${item.border} transition-all duration-500 group`}
                      style={{ perspective: '800px' }}
                    >
                      {/* Step number watermark */}
                      <div className="absolute top-6 right-6 text-[60px] md:text-[80px] font-black text-black/[0.03] dark:text-white/[0.03] leading-none select-none">{item.step}</div>
                      {/* Pulsing step indicator */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex">
                        <div className={`w-10 h-10 rounded-full bg-white dark:bg-[#0a0a0c] border-2 border-${item.pulse}/30 flex items-center justify-center shadow-lg z-10`}>
                          <span className={`text-[11px] font-black text-${item.pulse}`}>{item.step}</span>
                        </div>
                        <div className={`absolute inset-0 rounded-full bg-${item.pulse}/20 animate-ping`} />
                      </div>
                      <div className="relative z-10 space-y-5">
                        <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl transition-all duration-500`}>{item.icon}</div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-brand-blue uppercase tracking-[0.3em]">Step {item.step}</span>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{item.title}</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
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

          {/* ═══════════════════ SHOWCASE GALLERY ═══════════════════ */}
          {!query && (
            <section className="py-16 md:py-24">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-500/8 dark:bg-pink-500/15 border border-pink-500/15 dark:border-pink-500/25 rounded-full mb-5">
                  <ImageIcon size={12} className="text-pink-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-pink-500">AI Gallery</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-4">
                  Được tạo bởi <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Skyverses AI</span>
                </h2>
                <p className="text-sm text-slate-400 dark:text-gray-500 max-w-md mx-auto">Khám phá những tác phẩm ấn tượng từ cộng đồng người dùng.</p>
              </motion.div>

              <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
                {[
                  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_2wktMsxjtKgSKtgICToGYmGGjfw/955c04bf-959f-4832-843a-dfbaad2d82a3_min.webp', h: 'h-[220px] md:h-[280px]' },
                  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/6571fcff-b67e-4537-98fe-0301d9051c57_min.webp', h: 'h-[280px] md:h-[360px]' },
                  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/596c139a-7cd8-4c10-9305-bad2f9b6ab1f_min.webp', h: 'h-[200px] md:h-[240px]' },
                  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/640d8657-22e1-4ec7-adcf-d2b99f4e25e0_min.webp', h: 'h-[260px] md:h-[320px]' },
                  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_2wktMsxjtKgSKtgICToGYmGGjfw/1354a1b1-5ef3-46d7-8cb2-17268db2d7f7_min.webp', h: 'h-[240px] md:h-[300px]' },
                  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/82e86e0d-db5a-4bcf-8f7b-142ff21f8442_min.webp', h: 'h-[200px] md:h-[260px]' },
                  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_2wKQUGex0SWTDax9bngGeSqhuK7/bd7a9af7-87da-430f-ae2e-efb223e28cf3_min.webp', h: 'h-[280px] md:h-[340px]' },
                  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_32VMvlSstxcIMk6hBmtAY4gHyan/3ca5245a-2aac-4903-a528-6bfb222533ac_min.webp', h: 'h-[220px] md:h-[270px]' },
                ].map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.85, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ delay: idx * 0.08, duration: 0.6, type: 'spring', stiffness: 100 }}
                    whileHover={{ scale: 1.03, y: -5, transition: { duration: 0.3 } }}
                    className={`mb-3 md:mb-4 break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer relative ${img.h}`}
                  >
                    <img src={img.url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-3 group-hover:translate-y-0">
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest rounded-md border border-white/10 shadow-lg">AI Generated</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
                <button onClick={() => navigate('/explorer')} className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] rounded-2xl text-sm font-bold text-slate-700 dark:text-white hover:border-brand-blue/30 hover:shadow-lg transition-all">
                  Xem thêm tại Explorer <ArrowRight size={14} className="text-brand-blue" />
                </button>
              </motion.div>
            </section>
          )}

          {/* ═══════════════════ USE CASES BY INDUSTRY ═══════════════════ */}
          {!query && (
            <section className="py-16 md:py-24">
              <motion.div initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/8 dark:bg-emerald-500/15 border border-emerald-500/15 dark:border-emerald-500/25 rounded-full mb-5">
                  <Globe2 size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">Use Cases</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-4">
                  Giải pháp cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-brand-blue">mọi ngành nghề</span>
                </h2>
                <p className="text-sm text-slate-400 dark:text-gray-500 max-w-lg mx-auto">Từ Marketing đến E-commerce, Giáo dục đến Giải trí — AI đang thay đổi cách mọi người làm việc.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {[
                  { icon: <Megaphone size={24} />, iconBg: 'bg-blue-500/10 text-blue-500', industry: 'Marketing & Agency', desc: 'Tạo hàng trăm content visual mỗi tuần — video quảng cáo, banner, thumbnail — nhanh hơn 10x.', tools: ['Video AI', 'Image AI', 'Poster AI'], color: 'from-blue-500/10 to-cyan-500/10', borderColor: 'hover:border-blue-500/30' },
                  { icon: <ShoppingBag size={24} />, iconBg: 'bg-amber-500/10 text-amber-500', industry: 'E-commerce', desc: 'Tạo ảnh sản phẩm chuyên nghiệp, video demo, xoá nền hàng loạt cho catalog sản phẩm.', tools: ['Product Image', 'Background Removal', 'Upscale AI'], color: 'from-amber-500/10 to-orange-500/10', borderColor: 'hover:border-amber-500/30' },
                  { icon: <Clapperboard size={24} />, iconBg: 'bg-purple-500/10 text-purple-500', industry: 'Content Creator', desc: 'Sản xuất video script-to-screen, nhạc nền, voiceover chuyên nghiệp cho YouTube, TikTok.', tools: ['Video AI', 'Music AI', 'Voice Studio'], color: 'from-purple-500/10 to-pink-500/10', borderColor: 'hover:border-purple-500/30' },
                  { icon: <Building2 size={24} />, iconBg: 'bg-emerald-500/10 text-emerald-500', industry: 'Bất động sản', desc: 'Render nội thất AI, staging ảo, video tour bất động sản chỉ từ bản vẽ hoặc ảnh thực tế.', tools: ['Real Estate AI', 'Image AI', 'Video AI'], color: 'from-emerald-500/10 to-teal-500/10', borderColor: 'hover:border-emerald-500/30' },
                  { icon: <Shirt size={24} />, iconBg: 'bg-pink-500/10 text-pink-500', industry: 'Thời trang', desc: 'Thử trang phục ảo, tạo lookbook, chụp model AI cho bộ sưu tập mới.', tools: ['Fashion AI', 'Stylist AI', 'Character Sync'], color: 'from-pink-500/10 to-rose-500/10', borderColor: 'hover:border-pink-500/30' },
                  { icon: <GraduationCap size={24} />, iconBg: 'bg-indigo-500/10 text-indigo-500', industry: 'Giáo dục', desc: 'Tạo bài giảng video, podcast giáo dục, hình minh hoạ chuyên nghiệp cho khoá học online.', tools: ['Voice AI', 'Video AI', 'Storyboard'], color: 'from-indigo-500/10 to-violet-500/10', borderColor: 'hover:border-indigo-500/30' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.industry}
                    initial={{ opacity: 0, y: 30, scale: 0.92 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: idx * 0.1, duration: 0.6, type: 'spring', stiffness: 120 }}
                    whileHover={{ y: -6, scale: 1.02, rotateY: 2, transition: { duration: 0.35 } }}
                    className={`p-6 md:p-8 rounded-2xl bg-gradient-to-br ${item.color} dark:from-white/[0.02] dark:to-white/[0.01] border border-black/[0.05] dark:border-white/[0.05] ${item.borderColor} transition-all duration-500 group`}
                    style={{ perspective: '600px' }}
                  >
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl transition-all duration-500`}>{item.icon}</div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{item.industry}</h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {item.tools.map(tool => (
                          <span key={tool} className="px-2.5 py-1 bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] text-[9px] font-bold text-slate-500 dark:text-gray-400 rounded-lg uppercase tracking-wider group-hover:border-brand-blue/20 group-hover:text-brand-blue transition-colors duration-300">{tool}</span>
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
            <section className="py-16 md:py-24">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/8 dark:bg-amber-500/15 border border-amber-500/15 dark:border-amber-500/25 rounded-full mb-5">
                  <Sparkles size={12} className="text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">Testimonials</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-4">
                  Được tin dùng bởi <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">hàng nghìn người dùng</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
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
                    className="p-7 md:p-8 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-500 group"
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

          {/* ═══════════════════ CUSTOM SOLUTIONS ═══════════════════ */}
          {!query && (
            <section className="py-16 md:py-24">
              <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-[#0a0e1a] via-[#0c1225] to-[#0a0e1a] dark:from-[#060810] dark:via-[#080c18] dark:to-[#060810] p-8 md:p-14 lg:p-16">

                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-12 md:mb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
                        <Cpu size={14} className="text-brand-blue" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">Custom AI Solutions</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1] mb-5">
                        Bạn cần giải pháp AI{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-purple-400 to-pink-400">
                          riêng cho doanh nghiệp?
                        </span>
                      </h2>
                      <p className="text-sm md:text-base text-white/40 max-w-2xl mx-auto leading-relaxed">
                        Skyverses chuyên tư vấn, thiết kế và xây dựng các công cụ AI theo yêu cầu.
                        Từ chatbot, xử lý ảnh/video, workflow tự động đến hệ thống AI hoàn chỉnh cho doanh nghiệp.
                      </p>
                    </motion.div>
                  </div>

                  {/* Service Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-12">
                    {[
                      { icon: <Brain size={22} />, iconBg: 'bg-brand-blue/10 text-brand-blue', title: 'Tư vấn AI Strategy', desc: 'Phân tích nhu cầu, đề xuất giải pháp AI phù hợp cho quy trình kinh doanh của bạn.' },
                      { icon: <Wrench size={22} />, iconBg: 'bg-purple-500/10 text-purple-500', title: 'Build Custom Tools', desc: 'Phát triển công cụ AI theo spec riêng — image gen, video pipeline, chatbot, voice clone...' },
                      { icon: <Plug size={22} />, iconBg: 'bg-emerald-500/10 text-emerald-500', title: 'API & Integration', desc: 'Tích hợp AI vào hệ thống hiện có qua API. Hỗ trợ webhook, SDK và tài liệu đầy đủ.' },
                      { icon: <Rocket size={22} />, iconBg: 'bg-amber-500/10 text-amber-500', title: 'Deploy & Scale', desc: 'Triển khai lên cloud, tối ưu hiệu năng, hỗ trợ scale tự động theo nhu cầu sử dụng.' },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-500 group"
                      >
                        <div className="space-y-4">
                          <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>{item.icon}</div>
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                          <p className="text-xs text-white/35 leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => navigate('/booking')}
                      className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl text-sm font-bold hover:shadow-2xl hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Liên hệ tư vấn miễn phí
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a
                      href="mailto:support@skyverses.com"
                      className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">hoặc email:</span>
                      <span className="font-bold text-brand-blue">support@skyverses.com</span>
                    </a>
                  </motion.div>

                  <p className="text-center text-[10px] font-medium text-white/20 mt-6">✦ Tư vấn miễn phí • Phản hồi trong 24 giờ • Hỗ trợ dài hạn</p>
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════════ CREDITS SYSTEM ═══════════════════ */}
          {!query && (
            <section className="py-12 md:py-20">
              <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-[#0a0e1a] to-slate-900 dark:from-[#060810] dark:via-[#080c18] dark:to-[#060810] p-8 md:p-14 lg:p-16">

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
                      { step: '01', title: 'Mua Credits', desc: 'Chọn gói phù hợp hoặc nạp tuỳ ý. Nhận bonus khi mua gói lớn.', icon: <CreditCard size={20} />, iconBg: 'bg-amber-500/15 text-amber-400' },
                      { step: '02', title: 'Sử dụng mọi nơi', desc: 'Dùng Credits cho bất kỳ sản phẩm nào — Video, Image, Voice, Music, Workflow...', icon: <Zap size={20} />, iconBg: 'bg-amber-500/15 text-amber-400' },
                      { step: '03', title: 'Nạp thêm khi cần', desc: 'Credits không hết hạn. Nạp thêm bất cứ lúc nào, chỉ trả cho những gì bạn dùng.', icon: <RefreshCw size={20} />, iconBg: 'bg-amber-500/15 text-amber-400' },
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
                          <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center`}>{item.icon}</div>
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
