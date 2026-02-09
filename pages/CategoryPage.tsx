import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { marketApi } from '../apis/market';
import { systemConfigApi } from '../apis/config';
import { Solution, HomeBlock, Language } from '../types';
import { 
  X, SearchX, Flame, Video, ImageIcon, LayoutGrid, Gift, Workflow, Sparkles, LucideIcon,
  // Add missing icons
  ShieldCheck, Zap, ChevronLeft, Search, Activity
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
import { SolutionList } from '../components/market/SolutionList';

const CATEGORY_UI_MAP: Record<string, { icon: any, color: string, glow: string }> = {
  top_trending: { 
    icon: Flame, 
    color: 'text-orange-500',
    glow: 'bg-orange-500/10'
  },
  video_studio: { 
    icon: Video, 
    color: 'text-purple-500',
    glow: 'bg-purple-500/10'
  },
  image_studio: { 
    icon: ImageIcon, 
    color: 'text-brand-blue',
    glow: 'bg-brand-blue/10'
  },
  ai_agents: {
    icon: Workflow,
    color: 'text-emerald-500',
    glow: 'bg-emerald-500/10'
  },
  festivals: {
    icon: Gift,
    color: 'text-rose-500',
    glow: 'bg-rose-500/10'
  },
  others: { 
    icon: LayoutGrid, 
    color: 'text-slate-500',
    glow: 'bg-slate-500/10'
  }
};

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [currentBlock, setCurrentBlock] = useState<HomeBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);

  const uiInfo = id ? CATEGORY_UI_MAP[id] || CATEGORY_UI_MAP['others'] : CATEGORY_UI_MAP['others'];

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const [configRes, marketRes] = await Promise.all([
          systemConfigApi.getSystemConfig(),
          marketApi.getSolutions({ lang: lang as Language })
        ]);

        if (configRes?.success && configRes.data.marketHomeBlock) {
          const block = configRes.data.marketHomeBlock.find(b => b.key === id);
          if (block) setCurrentBlock(block);
        }

        if (marketRes && marketRes.data) {
          const activeOnly = marketRes.data.filter(s => s.isActive !== false);
          
          // Lọc các sản phẩm thuộc block này
          const filtered = activeOnly.filter(s => s.homeBlocks?.includes(id || ''));
          setSolutions(filtered);
        }
      } catch (error) {
        console.error("Category Fetch Error:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchCategoryData();
  }, [id, lang]);

  useEffect(() => {
    const saved = localStorage.getItem('skyverses_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const filteredSolutions = useMemo(() => {
    return solutions.filter(sol => {
      const name = sol.name[lang as Language] || sol.name.en;
      return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             sol.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
             sol.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [solutions, searchQuery, lang]);

  const toggleFavorite = (e: React.MouseEvent, solId: string) => {
    e.preventDefault(); e.stopPropagation();
    const newFavs = favorites.includes(solId) ? favorites.filter(id => id !== solId) : [...favorites, solId];
    setFavorites(newFavs);
    localStorage.setItem('skyverses_favorites', JSON.stringify(newFavs));
  };

  const toggleLike = (e: React.MouseEvent, solId: string) => {
    e.preventDefault(); e.stopPropagation();
    setLikedItems(prev => prev.includes(solId) ? prev.filter(i => i !== solId) : [...prev, id || '']);
  };

  const getFakeStats = (solId: string) => {
    const hash = solId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      users: ((hash % 850 + 120) > 999 ? ((hash % 850 + 120) / 1000).toFixed(1) + 'k' : (hash % 850 + 120).toString()),
      likes: ((hash % 400 + 45) > 999 ? ((hash % 400 + 45) / 1000).toFixed(1) + 'k' : (hash % 400 + 45).toString())
    };
  };

  const handleNavigate = (slug: string) => {
    if (!isAuthenticated) navigate('/login');
    else navigate(`/product/${slug}`);
  };

  const Icon = uiInfo.icon;
  const currentLang = lang as Language;

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#030304] font-sans transition-colors duration-500 pt-28 md:pt-40 pb-40 relative">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-5%] right-[-5%] w-[1000px] h-[1000px] rounded-full blur-[250px] opacity-10 dark:opacity-20 animate-pulse ${uiInfo.glow}`}></div>
      </div>

      <div className="max-w-[1900px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        
        {/* BREADCRUMB & SEARCH HUD */}
        <header className="mb-16 space-y-10">
           <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 hover:text-brand-blue transition-colors tracking-[0.2em] group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t('nav.browse')}
           </Link>
           
           <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
              <div className="flex items-center gap-6 md:gap-8">
                 <div className={`p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-2xl transition-all hover:scale-105 ${uiInfo.color}`}>
                    <Icon size={48} strokeWidth={2.5} />
                 </div>
                 <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                       <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">
                         {currentBlock ? currentBlock.title[currentLang] : 'Loading...'}
                       </h1>
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest italic opacity-80">
                      {currentBlock ? currentBlock.subtitle[currentLang] : 'Synchronizing registry nodes...'}
                    </p>
                 </div>
              </div>

              <div className="hidden md:block relative w-full md:w-[450px] group">
                 <div className="absolute inset-[-2px] bg-gradient-to-r from-brand-blue/20 to-transparent blur-md rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={20} />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Lọc kết quả trong danh mục này..."
                   className="w-full bg-white dark:bg-[#0a0a0c] border border-black/5 dark:border-white/10 rounded-full pl-16 pr-8 py-5 text-sm md:text-base font-bold focus:border-brand-blue outline-none transition-all shadow-xl dark:shadow-none"
                 />
              </div>
           </div>
        </header>

        {/* CONTENT AREA */}
        <div className="min-h-[60vh]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : filteredSolutions.length > 0 ? (
            <div className="space-y-12">
               <div className="flex items-center gap-4 px-1">
                  <Activity size={14} className="text-brand-blue animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest italic">Phát hiện {filteredSolutions.length} nút mạng nơ-ron phù hợp</span>
                  <div className="h-px flex-grow bg-black/5 dark:border-white/5 opacity-40"></div>
               </div>
               
               <SolutionList 
                solutions={filteredSolutions}
                lang={lang}
                likedItems={likedItems}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onToggleLike={toggleLike}
                onNavigate={handleNavigate}
                getFakeStats={getFakeStats}
              />
            </div>
          ) : (
            <div className="py-48 text-center flex flex-col items-center gap-8">
               <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center opacity-20">
                  <Search size={64} strokeWidth={1} className="text-slate-900 dark:text-white" />
               </div>
               <div className="space-y-3">
                  <p className="text-xl md:text-2xl font-black uppercase tracking-[0.5em] italic text-slate-400 dark:text-gray-600">No nodes found</p>
                  <button onClick={() => setSearchQuery('')} className="text-[10px] font-black text-brand-blue uppercase tracking-widest border-b border-brand-blue/30 pb-1 hover:border-brand-blue transition-all">Thiết lập lại bộ lọc</button>
               </div>
            </div>
          )}
        </div>
        
        {/* FOOTER STATS */}
        <div className="mt-40 pt-10 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
           <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-widest italic">
              {/* Fixed: Added missing icons to imports */}
              <span className="flex items-center gap-2"><ShieldCheck size={14}/> Security: Encrypted</span>
              <span className="flex items-center gap-2"><Zap size={14}/> Latency: 24ms</span>
           </div>
           <p className="text-[9px] font-black uppercase tracking-widest">© 2025 Skyverses Cloud Ledger</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;