
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketApi } from '../apis/market';
import { Solution } from '../types';
import { 
  X, SearchX, Flame, Video, ImageIcon, LayoutGrid, Gift, Workflow, Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import MarketSearchTerminal from '../components/MarketSearchTerminal';
import AIModelsMarquee from '../components/AIModelsMarquee';
import ExploreMoreAI from '../components/ExploreMoreAI';
import { motion, AnimatePresence } from 'framer-motion';
import { handleAdminQuickLogin } from '../utils/adminAuth';

// Import các sub-components
import { FeaturedSkeleton, CardSkeleton } from '../components/market/MarketSkeleton';
import { MarketSectionHeader } from '../components/market/MarketSectionHeader';
import { SolutionCard } from '../components/market/SolutionCard';
import { FeaturedSection } from '../components/market/FeaturedSection';

const MarketPage = () => {
  const { lang, t } = useLanguage();
  const { isAuthenticated, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [featuredSolutions, setFeaturedSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [primary, setPrimary] = useState("ALL");
  const [secondary, setSecondary] = useState("ALL");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Refs for horizontal scrolling
  const topHotRef = useRef<HTMLDivElement>(null);
  const agentWorkflowRef = useRef<HTMLDivElement>(null);
  const festivalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const othersRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      handleAdminQuickLogin(loginWithEmail, navigate);
    }
  }, [isAuthenticated, loginWithEmail, navigate]);

  useEffect(() => {
    const handleResetSearch = () => {
      setQuery("");
      setPrimary("ALL");
      setSecondary("ALL");
    };
    window.addEventListener('resetMarketSearch', handleResetSearch);
    return () => window.removeEventListener('resetMarketSearch', handleResetSearch);
  }, []);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const featuredRes = await marketApi.getRandomFeatured();
        if (featuredRes && featuredRes.data) {
          setFeaturedSolutions(featuredRes.data);
        }
      } catch (error) {
        console.error("Market Featured Error:", error);
      }
    };
    loadFeatured();
  }, []);

  useEffect(() => {
    const fetchMarketItems = async () => {
      if (query) setIsSearching(true);
      else setLoading(true);

      try {
        const cleanQuery = query.replace(/\+/g, ' ').trim();
        const res = await marketApi.getSolutions({
          q: cleanQuery || undefined,
          category: primary !== 'ALL' ? primary : undefined,
          lang: lang
        });
        
        if (res && res.data) {
          const activeOnly = res.data.filter(s => s.isActive !== false);
          setSolutions(activeOnly);
        }
      } catch (error) {
        console.error("Market Data Sync Error:", error);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchMarketItems, query ? 500 : 0);
    return () => clearTimeout(timer);
  }, [query, primary, lang]);

  useEffect(() => {
    const saved = localStorage.getItem('skyverses_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    const newFavs = favorites.includes(id) ? favorites.filter(favId => favId !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('skyverses_favorites', JSON.stringify(newFavs));
  };

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setLikedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getFakeStats = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      users: ((hash % 850 + 120) > 999 ? ((hash % 850 + 120) / 1000).toFixed(1) + 'k' : (hash % 850 + 120).toString()),
      likes: ((hash % 400 + 45) > 999 ? ((hash % 400 + 45) / 1000).toFixed(1) + 'k' : (hash % 400 + 45).toString())
    };
  };

  const handleNavigate = (slug: string) => {
    if (!isAuthenticated) navigate('/login');
    else navigate(`/product/${slug}`);
  };

  const filteredSolutions = useMemo(() => {
    return solutions.filter(sol => {
      if (secondary === 'ALL') return true;
      return sol.tags?.some(t => t.toLowerCase() === secondary.toLowerCase()) || 
             sol.id?.toLowerCase().includes(secondary.toLowerCase());
    });
  }, [solutions, secondary]);

  const sectionedSolutions = useMemo(() => {
    return {
      topChoice: filteredSolutions.filter(s => s.featured),
      agentWorkflow: filteredSolutions.filter(s => s.demoType === 'automation' || s.category.en === 'Automation'),
      festivals: filteredSolutions.filter(s => s.category.en === 'Festivals' || s.tags?.includes('Noel')),
      video: filteredSolutions.filter(s => s.demoType === 'video'),
      image: filteredSolutions.filter(s => s.demoType === 'image'),
      others: filteredSolutions.filter(s => s.demoType !== 'video' && s.demoType !== 'image' && s.demoType !== 'automation' && !s.featured && s.category.en !== 'Festivals')
    };
  }, [filteredSolutions]);

  const logoUrl = "https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268";

  return (
    <div className="relative min-h-screen bg-[#fcfcfd] dark:bg-[#030304] font-sans transition-colors duration-500">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[250px] animate-pulse"></div>
      </div>

      <div className="relative z-10 pt-28 md:pt-44 max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20">
        
        {loading && featuredSolutions.length === 0 ? <FeaturedSkeleton /> : featuredSolutions.length > 0 && !query && (
          <FeaturedSection 
            solutions={featuredSolutions} 
            lang={lang} 
            onNavigate={handleNavigate} 
            onOpenDemo={() => setIsDemoOpen(true)} 
          />
        )}

        <AIModelsMarquee />

        <div className="sticky top-16 md:relative md:top-0 z-[140] transform-gpu bg-white/95 dark:bg-[#030304]/95 backdrop-blur-xl -mx-4 px-4 py-3 md:mx-0 md:px-0 md:py-0 md:bg-transparent md:backdrop-blur-none border-b border-black/5 dark:border-white/5 md:border-none transition-all duration-500">
          <MarketSearchTerminal 
            query={query} setQuery={setQuery}
            primary={primary} setPrimary={setPrimary}
            secondary={secondary} setSecondary={setSecondary}
          />
        </div>

        <div className="space-y-24 relative z-10 md:border-t border-black/5 dark:border-white/5 pt-8">
          {(loading || isSearching) ? (
            <div className="flex gap-4 md:gap-8 overflow-x-hidden">
              {[1,2,3,4,5].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : filteredSolutions.length > 0 ? (
            <>
              {/* TOP CHOICE BLOCK */}
              {sectionedSolutions.topChoice.length > 0 && (
                <section>
                  <MarketSectionHeader 
                    icon={Flame} 
                    title="Top Choice" 
                    subtitle="Lựa chọn hàng đầu cho hiệu suất sáng tạo vượt trội" 
                    count={sectionedSolutions.topChoice.length} 
                    colorClass="text-orange-500" 
                    onScrollLeft={() => scroll(topHotRef, 'left')} 
                    onScrollRight={() => scroll(topHotRef, 'right')}
                    onSeeAll={() => navigate('/category/topChoice')}
                  />
                  <div ref={topHotRef} className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                    {sectionedSolutions.topChoice.map((sol, idx) => (
                      <SolutionCard 
                        key={sol.id} sol={sol} idx={idx} lang={lang} 
                        isLiked={likedItems.includes(sol._id || sol.id)}
                        isFavorited={favorites.includes(sol.id)}
                        onToggleFavorite={toggleFavorite}
                        onToggleLike={toggleLike}
                        onClick={handleNavigate}
                        stats={getFakeStats(sol._id || sol.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* IMAGE STUDIO BLOCK */}
              {sectionedSolutions.image.length > 0 && (
                <section className="relative">
                  {/* Background Aura for Image Studio */}
                  <div className="absolute -inset-10 bg-brand-blue/5 blur-[120px] pointer-events-none rounded-full"></div>
                  
                  <MarketSectionHeader 
                    icon={ImageIcon} 
                    title="Image Studio" 
                    subtitle="Tổng hợp thị giác độ trung thực cao cho hệ thống thiết kế"
                    count={sectionedSolutions.image.length} 
                    colorClass="text-brand-blue" 
                    onScrollLeft={() => scroll(imageRef, 'left')} 
                    onScrollRight={() => scroll(imageRef, 'right')}
                    onSeeAll={() => navigate('/category/image')}
                  />
                  <div ref={imageRef} className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 relative z-10">
                    {sectionedSolutions.image.map((sol, idx) => (
                      <SolutionCard 
                        key={sol.id} sol={sol} idx={idx} lang={lang} 
                        isLiked={likedItems.includes(sol._id || sol.id)}
                        isFavorited={favorites.includes(sol.id)}
                        onToggleFavorite={toggleFavorite}
                        onToggleLike={toggleLike}
                        onClick={handleNavigate}
                        stats={getFakeStats(sol._id || sol.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* VIDEO STUDIO BLOCK */}
              {sectionedSolutions.video.length > 0 && (
                <section>
                  <MarketSectionHeader 
                    icon={Video} 
                    title="Video Studio" 
                    subtitle="Công cụ kiến tạo chuyển động AI cho sản xuất điện ảnh"
                    count={sectionedSolutions.video.length} 
                    colorClass="text-purple-500" 
                    onScrollLeft={() => scroll(videoRef, 'left')} 
                    onScrollRight={() => scroll(videoRef, 'right')}
                    onSeeAll={() => navigate('/category/video')}
                  />
                  <div ref={videoRef} className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                    {sectionedSolutions.video.map((sol, idx) => (
                      <SolutionCard 
                        key={sol.id} sol={sol} idx={idx} lang={lang} 
                        isLiked={likedItems.includes(sol._id || sol.id)}
                        isFavorited={favorites.includes(sol.id)}
                        onToggleFavorite={toggleFavorite}
                        onToggleLike={toggleLike}
                        onClick={handleNavigate}
                        stats={getFakeStats(sol._id || sol.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* AI AGENT WORKFLOW BLOCK */}
              {sectionedSolutions.agentWorkflow.length > 0 && (
                <section>
                  <MarketSectionHeader 
                    icon={Workflow} 
                    title="AI Agent Workflow" 
                    subtitle="Tự động hóa quy trình sáng tạo đa kênh với hệ thống AI Agent thông minh" 
                    count={sectionedSolutions.agentWorkflow.length} 
                    colorClass="text-indigo-600" 
                    onScrollLeft={() => scroll(agentWorkflowRef, 'left')} 
                    onScrollRight={() => scroll(agentWorkflowRef, 'right')}
                    onSeeAll={() => navigate('/category/others')}
                  />
                  <div ref={agentWorkflowRef} className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                    {sectionedSolutions.agentWorkflow.map((sol, idx) => (
                      <SolutionCard 
                        key={sol.id} sol={sol} idx={idx} lang={lang} 
                        isLiked={likedItems.includes(sol._id || sol.id)}
                        isFavorited={favorites.includes(sol.id)}
                        onToggleFavorite={toggleFavorite}
                        onToggleLike={toggleLike}
                        onClick={handleNavigate}
                        stats={getFakeStats(sol._id || sol.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* UTILITY LAB BLOCK */}
              {sectionedSolutions.others.length > 0 && (
                <section>
                  <MarketSectionHeader 
                    icon={LayoutGrid} 
                    title="App khác" 
                    subtitle="Khám phá các ứng dụng hỗ trợ và tiện ích AI đa dạng"
                    count={sectionedSolutions.others.length} 
                    colorClass="text-emerald-500" 
                    onScrollLeft={() => scroll(othersRef, 'left')} 
                    onScrollRight={() => scroll(othersRef, 'right')}
                    onSeeAll={() => navigate('/category/others')}
                  />
                  <div ref={othersRef} className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                    {sectionedSolutions.others.map((sol, idx) => (
                      <SolutionCard 
                        key={sol.id} sol={sol} idx={idx} lang={lang} 
                        isLiked={likedItems.includes(sol._id || sol.id)}
                        isFavorited={favorites.includes(sol.id)}
                        onToggleFavorite={toggleFavorite}
                        onToggleLike={toggleLike}
                        onClick={handleNavigate}
                        stats={getFakeStats(sol._id || sol.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* FESTIVAL BLOCK */}
              {sectionedSolutions.festivals.length > 0 && (
                <section>
                  <MarketSectionHeader 
                    icon={Gift} 
                    title="Lễ hội & Sự kiện" 
                    subtitle="Tài nguyên AI cho những khoảnh khắc lễ hội kỳ ảo" 
                    count={sectionedSolutions.festivals.length} 
                    colorClass="text-rose-500" 
                    onScrollLeft={() => scroll(festivalRef, 'left')} 
                    onScrollRight={() => scroll(festivalRef, 'right')}
                    onSeeAll={() => navigate('/category/festivals')}
                  />
                  <div ref={festivalRef} className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                    {sectionedSolutions.festivals.map((sol, idx) => (
                      <SolutionCard 
                        key={sol.id} sol={sol} idx={idx} lang={lang} 
                        isLiked={likedItems.includes(sol._id || sol.id)}
                        isFavorited={favorites.includes(sol.id)}
                        onToggleFavorite={toggleFavorite}
                        onToggleLike={toggleLike}
                        onClick={handleNavigate}
                        stats={getFakeStats(sol._id || sol.id)}
                      />
                    ))}
                  </div>
                </section>
              )}
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
    </div>
  );
};

export default MarketPage;
