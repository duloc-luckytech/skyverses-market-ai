
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { marketApi } from '../apis/market';
import { Solution, Language } from '../types';
import { 
  ChevronLeft, Flame, Video, ImageIcon, LayoutGrid, Search
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/market/MarketSkeleton';
import { SolutionList } from '../components/market/SolutionList';

const CATEGORY_MAP: Record<string, { title: string, subtitle: string, icon: any, color: string }> = {
  topChoice: { 
    title: 'Top Choice', 
    subtitle: 'Creator-recommended tools tailored for elite workflows',
    icon: Flame, 
    color: 'text-orange-500' 
  },
  video: { 
    title: 'Video Studio', 
    subtitle: 'AI motion engines for high-end cinematic production',
    icon: Video, 
    color: 'text-purple-500' 
  },
  image: { 
    title: 'Creative Studio', 
    subtitle: 'High-fidelity visual synthesis for design systems',
    icon: ImageIcon, 
    color: 'text-brand-blue' 
  },
  others: { 
    title: 'Utility Lab', 
    subtitle: 'Neural agents for automated operational tasks',
    icon: LayoutGrid, 
    color: 'text-emerald-500' 
  }
};

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);

  const categoryInfo = id ? CATEGORY_MAP[id] : null;

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await marketApi.getSolutions({ lang: lang as Language });
        if (res && res.data) {
          const activeOnly = res.data.filter(s => s.isActive !== false);
          let filtered = activeOnly;

          if (id === 'topChoice') {
            filtered = activeOnly.filter(s => s.featured);
          } else if (id === 'video') {
            filtered = activeOnly.filter(s => s.demoType === 'video');
          } else if (id === 'image') {
            filtered = activeOnly.filter(s => s.demoType === 'image');
          } else if (id === 'others') {
            filtered = activeOnly.filter(s => s.demoType !== 'video' && s.demoType !== 'image' && !s.featured);
          }
          
          setSolutions(filtered);
        }
      } catch (error) {
        console.error("Category Fetch Error:", error);
      } finally {
        // Tạo hiệu ứng load nhân tạo nhẹ để người dùng thấy được skeleton chuyên nghiệp
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchItems();
  }, [id, lang]);

  useEffect(() => {
    const saved = localStorage.getItem('skyverses_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const filteredSolutions = useMemo(() => {
    return solutions.filter(sol => 
      sol.name[lang as Language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [solutions, searchQuery, lang]);

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

  if (!categoryInfo) return <Navigate to="/" />;

  const Icon = categoryInfo.icon;

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#030304] font-sans transition-colors duration-500 pt-28 md:pt-40 pb-40">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] rounded-full blur-[250px] opacity-10 dark:opacity-20 animate-pulse ${categoryInfo.color.replace('text-', 'bg-')}`}></div>
      </div>

      <div className="max-w-[1900px] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        {/* HEADER */}
        <header className="mb-16 space-y-8">
           <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-brand-blue transition-colors tracking-widest">
              <ChevronLeft size={14} /> Back to Market
           </Link>
           
           <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="flex items-center gap-6">
                 <div className={`p-5 rounded-3xl bg-opacity-10 shadow-xl ${categoryInfo.color.replace('text-', 'bg-')}`}>
                    <Icon size={40} className={categoryInfo.color} />
                 </div>
                 <div className="space-y-1">
                    <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none">{categoryInfo.title}</h1>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.3em]">{categoryInfo.subtitle}</p>
                 </div>
              </div>

              <div className="relative w-full md:w-96 group">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue" size={18} />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Tìm kiếm trong danh mục..."
                   className="w-full bg-white dark:bg-[#0a0a0c] border border-black/5 dark:border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:border-brand-blue outline-none transition-all shadow-sm"
                 />
              </div>
           </div>
        </header>

        {/* CONTENT LIST OR SKELETON */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : filteredSolutions.length > 0 ? (
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
        ) : (
          <div className="py-40 text-center opacity-20 flex flex-col items-center gap-6">
             <Search size={64} strokeWidth={1} />
             <p className="text-xl font-black uppercase tracking-widest italic">No matching nodes found in this sector</p>
             <button onClick={() => setSearchQuery('')} className="text-xs font-black text-brand-blue underline uppercase tracking-widest">Clear Search</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
