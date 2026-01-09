
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketApi } from '../apis/market';
import { Solution } from '../types';
import { 
  Bookmark, Loader2, Zap, 
  Sparkles, X, MonitorPlay, 
  Wand2, SearchX, Users, Heart
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import MarketSearchTerminal from '../components/MarketSearchTerminal';
import AIModelsMarquee from '../components/AIModelsMarquee';
import { motion, AnimatePresence } from 'framer-motion';
import { handleAdminQuickLogin } from '../utils/adminAuth';

// --- SKELETON COMPONENTS ---

const FeaturedSkeleton = () => (
  <div className="mb-8 md:mb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center border-b border-black/5 dark:border-white/5 pb-16 md:pb-24 animate-pulse">
    <div className="lg:col-span-5 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-2 bg-slate-200 dark:bg-white/5 rounded-full"></div>
      </div>
      <div className="space-y-4">
        <div className="h-16 md:h-24 bg-slate-200 dark:bg-white/5 rounded-2xl w-full"></div>
        <div className="h-16 md:h-24 bg-slate-200 dark:bg-white/5 rounded-2xl w-3/4"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-lg w-full"></div>
        <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-lg w-5/6"></div>
      </div>
      <div className="flex gap-4 pt-4">
        <div className="w-40 h-14 bg-slate-200 dark:bg-white/5 rounded-full"></div>
        <div className="w-40 h-14 bg-slate-200 dark:bg-white/5 rounded-full"></div>
      </div>
    </div>
    <div className="lg:col-span-7 flex justify-center lg:justify-end relative min-h-[300px] md:min-h-[400px]">
      <div className="relative w-full max-w-[450px] aspect-[4/3] bg-slate-200 dark:bg-white/5 rounded-[2rem] opacity-50 shadow-2xl"></div>
    </div>
  </div>
);

const CardSkeleton = () => (
  <div className="flex flex-col bg-white dark:bg-[#08080a] border border-black/[0.08] dark:border-white/[0.08] rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-slate-200 dark:bg-white/5 relative">
       <div className="absolute top-4 left-4 w-16 h-4 bg-black/10 dark:bg-white/5 rounded"></div>
    </div>
    <div className="p-4 md:p-6 space-y-4">
      <div className="h-6 bg-slate-200 dark:bg-white/5 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-full"></div>
        <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2">
        <div className="w-12 h-3 bg-slate-100 dark:bg-white/5 rounded"></div>
        <div className="w-12 h-3 bg-slate-100 dark:bg-white/5 rounded"></div>
      </div>
      <div className="pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
        <div className="flex gap-3">
           <div className="w-8 h-3 bg-slate-100 dark:bg-white/5 rounded-full"></div>
           <div className="w-8 h-3 bg-slate-100 dark:bg-white/5 rounded-full"></div>
        </div>
        <div className="w-16 h-6 bg-slate-200 dark:bg-white/5 rounded-full"></div>
      </div>
    </div>
  </div>
);

const MarketPage = () => {
  const { lang, t } = useLanguage();
  const { isAuthenticated, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [featuredSolutions, setFeaturedSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [primary, setPrimary] = useState("ALL");
  const [secondary, setSecondary] = useState("ALL");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  
  // Featured State
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // --- DEV ONLY: AUTO ADMIN LOGIN ---
  useEffect(() => {
    if (!isAuthenticated) {
      handleAdminQuickLogin(loginWithEmail, navigate);
    }
  }, [isAuthenticated, loginWithEmail, navigate]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [solutionsRes, featuredRes] = await Promise.all([
          marketApi.getSolutions(),
          marketApi.getRandomFeatured()
        ]);
        
        if (solutionsRes) {
          const sData = solutionsRes.data || (Array.isArray(solutionsRes) ? solutionsRes : []);
          setSolutions(sData);
        }
        
        if (featuredRes) {
          const fData = featuredRes.data || (Array.isArray(featuredRes) ? featuredRes : []);
          if (fData.length > 0) {
            setFeaturedSolutions(fData);
          }
        }
      } catch (error) {
        console.error("Market Load Error:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Auto transition featured
  useEffect(() => {
    if (featuredSolutions.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredSolutions.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredSolutions]);

  useEffect(() => {
    const saved = localStorage.getItem('skyverses_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = favorites.includes(id) 
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    setFavorites(newFavs);
    localStorage.setItem('skyverses_favorites', JSON.stringify(newFavs));
  };

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getFakeStats = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const userCount = (hash % 850 + 120);
    const likeCount = (hash % 400 + 45);
    return {
      users: userCount > 999 ? (userCount / 1000).toFixed(1) + 'k' : userCount.toString(),
      likes: likeCount > 999 ? (likeCount / 1000).toFixed(1) + 'k' : likeCount.toString()
    };
  };

  const handleNavigate = (slug: string) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/product/${slug}`);
    }
  };

  const filteredSolutions = useMemo(() => {
    return solutions.filter(sol => {
      if (sol.isActive === false) return false;

      const searchLower = query.toLowerCase();
      const nameMatch = sol.name[lang]?.toLowerCase().includes(searchLower);
      const tagMatch = sol.tags?.some(t => t.toLowerCase().includes(searchLower));
      const translatorMatch = sol.description[lang]?.toLowerCase().includes(searchLower);
      const matchesSearch = !query || nameMatch || tagMatch || translatorMatch;
      
      let matchesPrimary = true;
      if (primary !== 'ALL') {
         const catEn = sol.category.en.toUpperCase();
         if (primary === 'GAMES') matchesPrimary = catEn.includes('VIDEO') || catEn.includes('GAME') || sol.tags?.some(t => t.toUpperCase().includes('GAME'));
         if (primary === 'ART & DESIGN') matchesPrimary = catEn.includes('IMAGE') || catEn.includes('ART');
         if (primary === 'AI TOOLS') matchesPrimary = catEn.includes('INFRASTRUCTURE') || catEn.includes('AUDIO') || catEn.includes('AI');
         if (primary === 'CASE STUDIES') matchesPrimary = sol.complexity === 'Enterprise';
      }

      let matchesSecondary = true;
      if (secondary !== 'ALL') {
        const secLower = secondary.toLowerCase();
        matchesSecondary = sol.tags?.some(t => t.toLowerCase().includes(secLower)) || 
                           sol.category.en.toLowerCase().includes(secLower) ||
                           sol.name.en.toLowerCase().includes(secLower);
      }
      
      return matchesSearch && matchesPrimary && matchesSecondary;
    });
  }, [solutions, query, primary, secondary, lang]);

  const logoUrl = "https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268";

  return (
    <div className="relative min-h-screen bg-[#fcfcfd] dark:bg-[#030304] font-sans transition-colors duration-500">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[250px] animate-pulse"></div>
      </div>

      <div className="relative z-10 pt-28 md:pt-44 pb-32 max-w-[1800px] mx-auto px-4 md:px-12 lg:px-20">
        
        {/* --- TOP FEATURED SECTION --- */}
        {loading ? (
          <FeaturedSkeleton />
        ) : featuredSolutions.length > 0 && (
          <section className="mb-8 md:mb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center border-b border-black/5 dark:border-white/5 pb-16 md:pb-24">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6 md:space-y-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={featuredSolutions[featuredIndex].id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6 md:space-y-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-ping"></div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue italic">Featured // {featuredSolutions[featuredIndex].category[lang]}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-[0.9] text-black dark:text-white">
                      {featuredSolutions[featuredIndex].name[lang]}
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-lg">
                      {featuredSolutions[featuredIndex].description[lang]}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {featuredSolutions[featuredIndex].tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 md:px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {featuredSolutions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFeaturedIndex(i)}
                        className={`h-1 rounded-full transition-all duration-500 ${i === featuredIndex ? 'w-8 bg-brand-blue' : 'w-2 bg-gray-200 dark:bg-white/10'}`}
                      />
                    ))}
                  </div>

                  {/* Desktop Only Buttons - Hidden on Mobile */}
                  <div className="hidden lg:flex pt-4 md:pt-6 flex-wrap gap-3 md:gap-4">
                    <button 
                      onClick={() => handleNavigate(featuredSolutions[featuredIndex].slug)}
                      className="inline-flex items-center gap-4 md:gap-6 bg-brand-blue text-white px-8 md:px-10 py-4 md:py-5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-blue/30 hover:scale-105 active:scale-95 transition-all group"
                    >
                      Explore <Wand2 size={16} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button 
                      onClick={() => setIsDemoOpen(true)}
                      className="inline-flex items-center gap-3 md:gap-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 px-8 md:px-10 py-4 md:py-5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                    >
                      Watch Demo <MonitorPlay size={16} />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Stacked Cards */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end pr-0 md:pr-20 relative min-h-[300px] md:min-h-[400px]">
               <div className="relative w-full max-w-[450px] aspect-[4/3]">
                  <AnimatePresence>
                    {featuredSolutions.map((sol, idx) => {
                      const offset = (idx - featuredIndex + featuredSolutions.length) % featuredSolutions.length;
                      if (offset > 4) return null;

                      return (
                        <motion.div
                          key={sol.id}
                          initial={false}
                          animate={{
                            x: offset * (window.innerWidth < 768 ? 12 : 25),
                            y: offset * (window.innerWidth < 768 ? -10 : -20),
                            scale: 1 - offset * 0.06,
                            rotate: offset * 2,
                            opacity: 1 - offset * 0.2,
                            zIndex: featuredSolutions.length - offset,
                          }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className={`absolute inset-0 rounded-2xl md:rounded-[2rem] overflow-hidden border-2 md:border-4 bg-black shadow-3xl cursor-pointer ${offset === 0 ? 'border-brand-blue' : 'border-white/10'}`}
                          onClick={() => handleNavigate(sol.slug)}
                        >
                          <img src={sol.imageUrl} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                          
                          {offset === 0 && (
                            <>
                              <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="absolute top-4 right-4 md:top-6 md:right-6"
                              >
                                 <div className="p-2 md:p-3 bg-brand-blue text-white rounded-full shadow-2xl">
                                    <Sparkles size={16} />
                                 </div>
                              </motion.div>

                              {/* Mobile Only Buttons Overlay - Visible only on active card at mobile breakpoint */}
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex lg:hidden items-center justify-center gap-3 z-50 w-fit">
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); handleNavigate(sol.slug); }}
                                    className="bg-brand-blue text-white py-3 px-6 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                                 >
                                    Explore <Wand2 size={14} fill="currentColor" />
                                 </button>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); setIsDemoOpen(true); }}
                                    className="bg-white/20 backdrop-blur-md text-white border border-white/20 p-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center"
                                 >
                                    <MonitorPlay size={16} />
                                 </button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
               </div>
            </div>
          </section>
        )}

        {/* --- AI MODELS MARQUEE --- */}
        <AIModelsMarquee />

        {/* --- SEARCH TERMINAL (Sticky Fix) --- */}
        <div className="sticky top-16 md:relative md:top-0 z-[140] transform-gpu bg-white/95 dark:bg-[#030304]/95 backdrop-blur-xl -mx-4 px-4 py-3 md:mx-0 md:px-0 md:py-0 md:bg-transparent md:backdrop-blur-none border-b border-black/5 dark:border-white/5 md:border-none transition-all duration-500">
          <MarketSearchTerminal 
            query={query} setQuery={setQuery}
            primary={primary} setPrimary={setPrimary}
            secondary={secondary} setSecondary={setSecondary}
          />
        </div>

        {/* --- APPS LEGEND & HEADER --- */}
        <div className="hidden lg:block mt-8 md:mt-16 mb-4 px-1 animate-in fade-in slide-in-from-left-4 duration-1000">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-brand-blue mb-1">
            Apps
          </h2>
          <p className="text-[7.5px] md:text-[8.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis">
            One-click AI effects that transform any content into professional ads, viral trends, or artistic masterpieces
          </p>
        </div>

        {/* --- GRID OF CARDS --- */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 relative z-10 md:border-t border-black/5 dark:border-white/5 pt-8">
          {loading ? (
             <>
               {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <CardSkeleton key={i} />)}
             </>
          ) : filteredSolutions.length > 0 ? (
            filteredSolutions.map((sol, idx) => {
              const targetId = sol._id || sol.id;
              const stats = getFakeStats(targetId);
              const isLiked = likedItems.includes(targetId);

              const modelsToDisplay = sol.models && sol.models.length > 0 
                ? sol.models.join(', ')
                : sol.neuralStack && sol.neuralStack.length > 0
                  ? sol.neuralStack.map(m => m.name).join(', ')
                  : sol.tags && sol.tags.length > 0
                    ? sol.tags[0]
                    : 'Standard';

              return (
              <div 
                key={targetId} 
                onClick={() => handleNavigate(sol.slug)}
                className={`group relative flex flex-col bg-white dark:bg-[#08080a] border border-black/[0.08] dark:border-white/[0.08] hover:border-brand-blue/40 transition-all duration-500 shadow-sm hover:shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 cursor-pointer first:col-span-2 lg:first:col-span-1`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Thumbnail Layer */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  <img 
                    src={sol.imageUrl} 
                    alt={sol.name[lang]} 
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-30 transition-all duration-1000" 
                  />
                  
                  {/* Generate Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-40">
                     <div className="px-5 py-2.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2.5 shadow-2xl scale-90 group-hover:scale-100 transition-all duration-500">
                        <Sparkles size={14} className="text-brand-blue" fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Generate</span>
                     </div>
                  </div>

                  {/* Favorite Button (Bookmark) */}
                  <button 
                    onClick={(e) => toggleFavorite(e, sol.id)}
                    className={`absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2.5 bg-black/60 backdrop-blur-md rounded-full border transition-all z-30 shadow-xl ${favorites.includes(sol.id) ? 'text-brand-blue border-brand-blue/50' : 'text-white/40 border-white/10 hover:text-brand-blue hover:border-brand-blue/30'}`}
                  >
                    <Bookmark fill="currentColor" className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                  </button>

                  {/* Top Left Badge: Category */}
                  <div className="absolute top-2 left-2 md:top-4 md:left-4">
                     <span className="bg-black/90 backdrop-blur-md text-white border border-white/20 px-1.5 md:px-3 py-0.5 md:py-1 text-[7px] md:text-[9px] font-black uppercase tracking-widest rounded-sm">
                       {sol.category[lang]}
                     </span>
                  </div>

                  {/* Models Badge */}
                  <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 max-w-[85%] hidden sm:block">
                     <div className="flex items-center gap-2 px-2.5 py-1.5 bg-black/70 backdrop-blur-md rounded-sm border border-white/10 overflow-hidden">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse shrink-0"></div>
                        <span className="text-[8px] font-black text-white uppercase tracking-widest truncate italic">
                          {modelsToDisplay}
                        </span>
                     </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-3 md:p-6 flex-grow flex flex-col gap-3 md:gap-6 bg-white dark:bg-[#0d0d0f] transition-colors duration-500">
                  <div className="space-y-2 md:space-y-4">
                    <div className="flex justify-between items-start">
                       <h3 className="text-sm md:text-2xl font-black uppercase tracking-tighter text-brand-blue italic transition-colors flex-grow pr-2 truncate">
                         {sol.name[lang]}
                       </h3>
                    </div>

                    {/* Description */}
                    <p className="text-black/60 dark:text-white/50 text-[9px] md:text-[13px] leading-relaxed font-medium italic tracking-tight line-clamp-2 md:line-clamp-3">
                      {sol.description[lang]}
                    </p>

                    {/* Tags Section */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sol.tags?.slice(0, 4).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded text-[7px] font-black uppercase tracking-widest text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Link & Stats Footer */}
                  <div className="mt-auto pt-4 flex justify-between items-center border-t border-black/5 dark:border-white/5">
                     <div className="flex items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-1 md:gap-1.5 opacity-40 group-hover:opacity-80 transition-opacity">
                           <Users size={12} className="md:w-3.5 md:h-3.5" />
                           <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500">{stats.users}</span>
                        </div>
                        <button 
                          onClick={(e) => toggleLike(e, targetId)}
                          className={`flex items-center gap-1 md:gap-1.5 transition-all active:scale-110 ${isLiked ? 'text-red-500 opacity-100' : 'opacity-40 group-hover:opacity-80 text-gray-500'}`}
                        >
                           <Heart size={12} fill={isLiked ? "currentColor" : "none"} className="md:w-3.5 md:h-3.5" />
                           <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{isLiked ? (parseInt(stats.likes) + 1).toString() : stats.likes}</span>
                        </button>
                     </div>
                     <div className="group-hover:text-brand-blue transition-all">
                        {sol.isFree ? (
                           <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[6px] md:text-[9px] font-black uppercase tracking-widest rounded-sm">FREE</span>
                        ) : (
                           <div className="flex items-center gap-1 pl-1 pr-2 py-0.5 md:py-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full shrink-0">
                              <div className="w-3.5 h-3.5 md:w-5 md:h-5 rounded-full bg-brand-blue flex items-center justify-center text-white shadow-sm">
                                 <Zap fill="currentColor" className="w-2 h-2 md:w-2.5 md:h-2.5" />
                              </div>
                              <span className="text-[8px] md:text-[11px] font-black italic text-black dark:text-white leading-none">{sol.priceCredits}</span>
                           </div>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            )})
          ) : (
            <div className="col-span-full py-40 text-center space-y-6 opacity-30">
               <SearchX size={48} className="mx-auto mb-4" />
               <p className="text-sm font-black uppercase tracking-widest">{t('market.search.no_matches')}</p>
               <button onClick={() => { setQuery(''); setPrimary('ALL'); setSecondary('ALL'); }} className="text-[10px] font-black uppercase tracking-widest text-brand-blue hover:underline">{t('market.search.reset')}</button>
            </div>
          )}
        </div>
      </div>

      {/* --- DEMO VIDEO MODAL --- */}
      <AnimatePresence>
        {isDemoOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
              onClick={() => setIsDemoOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-[#0a0a0c] border border-white/10 rounded-[2rem] overflow-hidden shadow-3xl aspect-video flex flex-col"
            >
              <div className="absolute top-6 right-6 z-50">
                 <button onClick={() => setIsDemoOpen(false)} className="p-2 bg-black/40 hover:bg-red-500 rounded-full text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-grow relative flex items-center justify-center overflow-hidden bg-black">
                 <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#0090ff33_0%,_transparent_70%)]"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                 </div>

                 <div className="text-center space-y-8 z-10 p-12">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      className="relative"
                    >
                       <div className="absolute inset-0 bg-brand-blue blur-[80px] opacity-20 rounded-full animate-pulse"></div>
                       <img src={logoUrl} className="w-32 h-32 md:w-48 md:h-48 object-contain mx-auto relative drop-shadow-[0_0_30px_rgba(0,144,255,0.2)]" alt="Skyverses Logo" />
                    </motion.div>
                    <div className="space-y-2">
                       <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">Coming <span className="text-brand-blue">Soon.</span></h3>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default MarketPage;
