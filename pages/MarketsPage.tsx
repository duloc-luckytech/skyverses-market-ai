
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, ArrowRight, ChevronLeft, ChevronRight,
  Video, ImageIcon, Mic, Music, LayoutGrid, Zap, Star,
  Users, TrendingUp, Heart, BookmarkPlus, Bookmark,
  X, Layers, Box, Cpu, SlidersHorizontal,
  Check, Grid3X3, List, ArrowUp, Clock, Tag, ChevronUp, ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { marketApi } from '../apis/market';
import { Solution, Language } from '../types';

// ═══════ CONSTANTS ═══════
const CATEGORIES = [
  { key: 'ALL', label: 'Tất cả', icon: LayoutGrid },
  { key: 'Video', label: 'Video AI', icon: Video },
  { key: 'Image', label: 'Hình ảnh AI', icon: ImageIcon },
  { key: 'Audio', label: 'Giọng nói', icon: Mic },
  { key: 'Music', label: 'Nhạc AI', icon: Music },
  { key: 'Automation', label: 'Tự động hóa', icon: Zap },
  { key: '3D', label: '3D & Game', icon: Box },
];
const COMPLEXITY_LEVELS = ['Standard', 'Advanced', 'Enterprise'];
const SORT_OPTIONS = [
  { key: 'popular', label: 'Phổ biến nhất' },
  { key: 'newest', label: 'Mới nhất' },
  { key: 'name', label: 'Tên A-Z' },
];
const ITEMS_PER_PAGE = 12;
const RECENTLY_VIEWED_KEY = 'skyverses_recently_viewed';
const MAX_RECENT = 5;

// ═══════ HELPERS ═══════
const getStats = (id: string) => {
  const h = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return { users: (h % 900 + 100), likes: (h % 400 + 30), rating: (3.5 + (h % 15) / 10).toFixed(1) };
};

const saveRecentlyViewed = (sol: Solution) => {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    const filtered = stored.filter((s: any) => s.id !== sol.id);
    filtered.unshift({ id: sol.id, slug: sol.slug, name: sol.name, imageUrl: sol.imageUrl, category: sol.category });
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
  } catch {}
};

const getRecentlyViewed = (): any[] => {
  try { return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]'); } catch { return []; }
};

// ═══════ TRENDING SLIDER ═══════
const TrendingSlider: React.FC<{ items: Solution[]; lang: Language; onNavigate: (slug: string) => void }> = ({ items, lang, onNavigate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-brand-blue" />
          <h3 className="text-[14px] font-bold text-slate-700 dark:text-white">Trending</h3>
        </div>
        <div className="flex gap-1">
          <button onClick={() => scroll('left')} className="p-1 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-400 hover:text-brand-blue transition-colors"><ChevronLeft size={14} /></button>
          <button onClick={() => scroll('right')} className="p-1 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-400 hover:text-brand-blue transition-colors"><ChevronRight size={14} /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x pb-1">
        {items.map((sol, i) => (
          <div key={sol.id} onClick={() => onNavigate(sol.slug)}
            className="snap-start shrink-0 w-[200px] bg-white dark:bg-[#111114] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden cursor-pointer hover:border-brand-blue/20 hover:shadow-sm transition-all group">
            <div className="relative h-[100px] overflow-hidden">
              <img src={sol.imageUrl} alt={sol.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[8px] font-semibold rounded">#{i+1}</span>
            </div>
            <div className="p-2.5">
              <h4 className="text-[12px] font-bold text-slate-700 dark:text-white truncate group-hover:text-brand-blue transition-colors">{sol.name[lang]}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{sol.category[lang]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════ RECENTLY VIEWED ═══════
const RecentlyViewed: React.FC<{ lang: Language; onNavigate: (slug: string) => void }> = ({ lang, onNavigate }) => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { setItems(getRecentlyViewed()); }, []);
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-slate-400" />
        <h3 className="text-[13px] font-bold text-slate-600 dark:text-gray-300">Xem gần đây</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {items.map((item: any) => (
          <div key={item.id} onClick={() => onNavigate(item.slug)}
            className="shrink-0 flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl cursor-pointer hover:border-brand-blue/20 transition-all group">
            <img src={item.imageUrl} className="w-8 h-8 rounded-lg object-cover" alt="" />
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-slate-700 dark:text-white truncate max-w-[120px] group-hover:text-brand-blue transition-colors">{item.name?.[lang] || item.name?.en}</p>
              <p className="text-[10px] text-slate-400">{item.category?.[lang] || item.category?.en}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════ CTA BANNER ═══════
const CTABanner: React.FC<{ onNavigate: (slug: string) => void }> = ({ onNavigate }) => (
  <div className="col-span-full my-2">
    <div className="relative bg-gradient-to-r from-brand-blue/[0.06] to-purple-500/[0.06] border border-brand-blue/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-blue/[0.08] rounded-full blur-2xl" />
      <div className="relative z-10">
        <h4 className="text-[15px] font-bold text-slate-700 dark:text-white">Chưa biết chọn tool nào?</h4>
        <p className="text-[12px] text-slate-400 dark:text-gray-500 mt-0.5">Thử AI Video Generator — công cụ phổ biến nhất của Skyverses</p>
      </div>
      <button onClick={() => onNavigate('ai-video-generator')}
        className="relative z-10 shrink-0 flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-[13px] font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
        Thử ngay <ArrowRight size={14} />
      </button>
    </div>
  </div>
);

// ═══════ PRODUCT CARD (GRID) ═══════
const ProductCardGrid: React.FC<{
  sol: Solution; lang: Language; onNavigate: (slug: string) => void;
  isFav: boolean; onToggleFav: (e: React.MouseEvent) => void;
}> = ({ sol, lang, onNavigate, isFav, onToggleFav }) => {
  const stats = getStats(sol.id);
  return (
    <motion.div whileHover={{ y: -2 }}
      className="bg-white dark:bg-[#111114] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden cursor-pointer hover:border-black/[0.08] dark:hover:border-white/[0.08] hover:shadow-lg transition-all group flex flex-col"
      onClick={() => { saveRecentlyViewed(sol); onNavigate(sol.slug); }}>
      <div className="relative h-[160px] overflow-hidden">
        <img src={sol.imageUrl} alt={sol.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 left-2 flex gap-1">
          {sol.isFree && <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-md">FREE</span>}
          {sol.featured && <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold rounded-md flex items-center gap-0.5"><Sparkles size={8} fill="currentColor" /> Hot</span>}
        </div>
        <button onClick={onToggleFav}
          className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md border transition-all ${isFav ? 'bg-brand-blue/20 border-brand-blue/30 text-brand-blue' : 'bg-black/30 border-white/10 text-white/70 opacity-0 group-hover:opacity-100'}`}>
          {isFav ? <Bookmark size={12} fill="currentColor" /> : <BookmarkPlus size={12} />}
        </button>
      </div>
      <div className="p-3.5 space-y-2 flex-1 flex flex-col">
        <div>
          <h3 className="text-[14px] font-bold text-slate-800 dark:text-white group-hover:text-brand-blue transition-colors truncate">{sol.name[lang]}</h3>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 line-clamp-2 mt-0.5">{sol.description[lang]}</p>
        </div>
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          <span className="px-1.5 py-0.5 bg-brand-blue/[0.06] text-brand-blue rounded text-[9px] font-medium border border-brand-blue/10">{sol.category[lang]}</span>
          {sol.complexity && <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-white/[0.03] text-slate-400 dark:text-gray-500 rounded text-[9px] font-medium border border-black/[0.04] dark:border-white/[0.04]">{sol.complexity}</span>}
        </div>
        <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[10px] text-slate-400">
            <span className="flex items-center gap-0.5"><Users size={10} /> {stats.users}</span>
            <span className="flex items-center gap-0.5"><Star size={10} fill="currentColor" className="text-amber-400" /> {stats.rating}</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-medium text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">Mở <ArrowRight size={11} /></span>
        </div>
      </div>
    </motion.div>
  );
};

// ═══════ PRODUCT CARD (LIST) ═══════
const ProductCardList: React.FC<{
  sol: Solution; lang: Language; onNavigate: (slug: string) => void;
  isFav: boolean; onToggleFav: (e: React.MouseEvent) => void;
}> = ({ sol, lang, onNavigate, isFav, onToggleFav }) => {
  const stats = getStats(sol.id);
  return (
    <div className="bg-white dark:bg-[#111114] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden cursor-pointer hover:border-black/[0.08] dark:hover:border-white/[0.08] hover:shadow-md transition-all group flex"
      onClick={() => { saveRecentlyViewed(sol); onNavigate(sol.slug); }}>
      <div className="relative w-[180px] shrink-0 overflow-hidden">
        <img src={sol.imageUrl} alt={sol.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {sol.isFree && <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-md w-fit">FREE</span>}
          {sol.featured && <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold rounded-md flex items-center gap-0.5 w-fit"><Sparkles size={8} fill="currentColor" /> Hot</span>}
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-white group-hover:text-brand-blue transition-colors truncate">{sol.name[lang]}</h3>
            <button onClick={onToggleFav} className={`shrink-0 p-1 rounded-md transition-all ${isFav ? 'text-brand-blue' : 'text-slate-300 dark:text-gray-600 hover:text-brand-blue'}`}>
              {isFav ? <Bookmark size={14} fill="currentColor" /> : <BookmarkPlus size={14} />}
            </button>
          </div>
          <p className="text-[12px] text-slate-400 dark:text-gray-500 line-clamp-2 mt-1">{sol.description[lang]}</p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-brand-blue/[0.06] text-brand-blue rounded text-[9px] font-medium border border-brand-blue/10">{sol.category[lang]}</span>
            {sol.complexity && <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-white/[0.03] text-slate-400 rounded text-[9px] font-medium border border-black/[0.04] dark:border-white/[0.04]">{sol.complexity}</span>}
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400"><Users size={10} /> {stats.users}</span>
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400"><Star size={10} fill="currentColor" className="text-amber-400" /> {stats.rating}</span>
          </div>
          <span className="flex items-center gap-1 text-[12px] font-medium text-brand-blue">Thử ngay <ArrowRight size={12} /></span>
        </div>
      </div>
    </div>
  );
};

// ═══════ MAIN PAGE ═══════
const MarketsPage: React.FC = () => {
  const { lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const currentLang = lang as Language;

  usePageMeta({
    title: 'Marketplace | Skyverses - Kho công cụ AI sáng tạo',
    description: 'Khám phá hơn 30+ công cụ AI cho sản xuất hình ảnh, video, nhạc, giọng nói và tự động hóa.',
    keywords: 'AI tools, AI marketplace, công cụ AI, Skyverses market',
    canonical: '/markets'
  });

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [featuredSolutions, setFeaturedSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [activeComplexity, setActiveComplexity] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showBackTop, setShowBackTop] = useState(false);

  // Back to top
  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [solRes, featRes] = await Promise.all([
          marketApi.getSolutions({ lang: currentLang }),
          marketApi.getRandomFeatured()
        ]);
        if (solRes?.data) setSolutions(solRes.data.filter(s => s.isActive !== false));
        if (featRes?.data) setFeaturedSolutions(featRes.data);
      } catch (err) { console.error('Markets fetch:', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [currentLang]);

  useEffect(() => {
    const saved = localStorage.getItem('skyverses_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Reset pagination when filters change
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [search, activeCategory, sortBy, showFreeOnly, showFeaturedOnly, activeComplexity, activeTags]);

  const toggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setFavorites(prev => {
      const n = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('skyverses_favorites', JSON.stringify(n));
      return n;
    });
  }, []);

  const handleNavigate = useCallback((slug: string) => {
    if (!isAuthenticated) navigate('/login');
    else navigate(`/product/${slug}`);
  }, [isAuthenticated, navigate]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    solutions.forEach(s => s.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [solutions]);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }, []);

  const filteredSolutions = useMemo(() => {
    let filtered = solutions.filter(sol => {
      const matchSearch = !search ||
        sol.name[currentLang]?.toLowerCase().includes(search.toLowerCase()) ||
        sol.description[currentLang]?.toLowerCase().includes(search.toLowerCase()) ||
        sol.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchCat = activeCategory === 'ALL' ||
        sol.category[currentLang]?.toLowerCase().includes(activeCategory.toLowerCase()) ||
        sol.tags?.some(t => t.toLowerCase().includes(activeCategory.toLowerCase())) ||
        sol.demoType?.toLowerCase() === activeCategory.toLowerCase();
      const matchFree = !showFreeOnly || sol.isFree;
      const matchFeatured = !showFeaturedOnly || sol.featured;
      const matchComplexity = !activeComplexity || sol.complexity === activeComplexity;
      const matchTags = activeTags.length === 0 || activeTags.every(at => sol.tags?.some(st => st.toLowerCase() === at.toLowerCase()));
      return matchSearch && matchCat && matchFree && matchFeatured && matchComplexity && matchTags;
    });
    if (sortBy === 'name') filtered.sort((a, b) => (a.name[currentLang] || '').localeCompare(b.name[currentLang] || ''));
    else if (sortBy === 'newest') filtered.reverse();
    return filtered;
  }, [solutions, search, activeCategory, sortBy, showFreeOnly, showFeaturedOnly, activeComplexity, activeTags, currentLang]);

  const paginatedSolutions = useMemo(() => filteredSolutions.slice(0, visibleCount), [filteredSolutions, visibleCount]);
  const hasMore = visibleCount < filteredSolutions.length;

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: solutions.length };
    CATEGORIES.forEach(c => {
      if (c.key !== 'ALL') {
        counts[c.key] = solutions.filter(s =>
          s.category[currentLang]?.toLowerCase().includes(c.key.toLowerCase()) ||
          s.tags?.some(t => t.toLowerCase().includes(c.key.toLowerCase())) ||
          s.demoType?.toLowerCase() === c.key.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [solutions, currentLang]);

  const activeFilterCount = [showFreeOnly, showFeaturedOnly, !!activeComplexity, activeCategory !== 'ALL', activeTags.length > 0].filter(Boolean).length;

  const resetFilters = () => {
    setActiveCategory('ALL'); setShowFreeOnly(false); setShowFeaturedOnly(false);
    setActiveComplexity(null); setActiveTags([]); setSearch('');
  };

  // ═══════ SIDEBAR ═══════
  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 block mb-2">Tìm kiếm</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={15} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên, mô tả, tag..."
            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] pl-9 pr-8 py-2.5 rounded-xl text-[13px] focus:border-brand-blue outline-none transition-colors" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={13} /></button>}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 block mb-2">Danh mục</label>
        <div className="space-y-0.5">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${isActive ? 'bg-brand-blue/[0.08] text-brand-blue' : 'text-slate-500 dark:text-gray-400 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}>
                <Icon size={15} />
                <span className="flex-1 text-left">{cat.label}</span>
                <span className={`text-[10px] ${isActive ? 'text-brand-blue/60' : 'text-slate-300 dark:text-gray-600'}`}>{catCounts[cat.key] || 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div>
          <label className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 block mb-2">
            <Tag size={11} className="inline mr-1" />Tags
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
            {allTags.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${activeTags.includes(tag) ? 'bg-brand-blue text-white' : 'bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-gray-400 border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/30'}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Complexity */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 block mb-2">Độ phức tạp</label>
        <div className="space-y-0.5">
          {COMPLEXITY_LEVELS.map(level => (
            <button key={level} onClick={() => setActiveComplexity(activeComplexity === level ? null : level)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${activeComplexity === level ? 'bg-brand-blue/[0.08] text-brand-blue' : 'text-slate-500 dark:text-gray-400 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}>
              {activeComplexity === level && <Check size={13} />}
              <span className={activeComplexity === level ? '' : 'ml-[21px]'}>{level}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 block mb-2">Bộ lọc khác</label>
        <div className="space-y-1">
          <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
            <input type="checkbox" checked={showFreeOnly} onChange={e => setShowFreeOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-[#0090ff]" />
            <span className="text-[13px] font-medium text-slate-600 dark:text-gray-300">Chỉ miễn phí</span>
          </label>
          <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
            <input type="checkbox" checked={showFeaturedOnly} onChange={e => setShowFeaturedOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-[#0090ff]" />
            <span className="text-[13px] font-medium text-slate-600 dark:text-gray-300">Nổi bật</span>
          </label>
        </div>
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <button onClick={resetFilters} className="w-full py-2 text-[12px] font-medium text-brand-blue hover:bg-brand-blue/[0.04] rounded-lg transition-colors">
          Đặt lại bộ lọc ({activeFilterCount})
        </button>
      )}

      {/* Stats */}
      <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl space-y-3">
        <h4 className="text-[11px] font-semibold text-slate-400 dark:text-gray-500">Thống kê</h4>
        {[
          { label: 'Tổng công cụ', value: solutions.length, color: 'text-brand-blue' },
          { label: 'Danh mục', value: CATEGORIES.length - 1, color: 'text-purple-500' },
          { label: 'Miễn phí', value: solutions.filter(s => s.isFree).length || '5+', color: 'text-emerald-500' },
          { label: 'Nổi bật', value: solutions.filter(s => s.featured).length || '3+', color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between">
            <span className="text-[12px] text-slate-500 dark:text-gray-400">{s.label}</span>
            <span className={`text-[14px] font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pt-24 md:pt-28 pb-32 min-h-screen bg-white dark:bg-[#0a0a0c] text-black dark:text-white transition-colors duration-300">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ═══════ HEADER ═══════ */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/[0.06] border border-brand-blue/10 rounded-full mb-2">
              <Layers size={12} className="text-brand-blue" />
              <span className="text-[10px] font-semibold text-brand-blue">AI Marketplace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Kho công cụ{' '}<span className="bg-gradient-to-r from-brand-blue to-blue-400 bg-clip-text text-transparent">AI sáng tạo</span>
            </h1>
          </div>
          <button onClick={() => setMobileSidebar(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-[13px] font-medium text-slate-600 dark:text-gray-300 w-fit">
            <SlidersHorizontal size={15} /> Bộ lọc
            {activeFilterCount > 0 && <span className="w-5 h-5 bg-brand-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>

        {/* ═══════ 2-COLUMN LAYOUT ═══════ */}
        <div className="flex gap-6 lg:gap-8">

          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-28"><SidebarContent /></div>
          </aside>

          {/* RIGHT CONTENT */}
          <div className="flex-1 min-w-0">

            {/* Recently Viewed */}
            <RecentlyViewed lang={currentLang} onNavigate={handleNavigate} />

            {/* Trending */}
            {!search && featuredSolutions.length > 0 && (
              <TrendingSlider items={featuredSolutions} lang={currentLang} onNavigate={handleNavigate} />
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-slate-400 dark:text-gray-500">
                {loading ? 'Đang tải...' : <><strong className="text-slate-600 dark:text-gray-300">{filteredSolutions.length}</strong> kết quả</>}
                {search && <span className="text-brand-blue ml-1">"{search}"</span>}
                {hasMore && <span className="text-slate-300 ml-1">· hiện {visibleCount}</span>}
              </p>
              <div className="flex items-center gap-2">
                {/* View mode toggle */}
                <div className="flex bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-lg p-0.5">
                  <button onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/[0.06] text-brand-blue shadow-sm' : 'text-slate-400'}`}>
                    <Grid3X3 size={14} />
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/[0.06] text-brand-blue shadow-sm' : 'text-slate-400'}`}>
                    <List size={14} />
                  </button>
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="text-[12px] px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-lg text-slate-600 dark:text-gray-300 outline-none cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Active tag pills */}
            {activeTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-[11px] text-slate-400 mr-1 py-1">Active:</span>
                {activeTags.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 px-2 py-1 bg-brand-blue/[0.08] text-brand-blue text-[11px] font-medium rounded-lg">
                    {tag} <X size={10} />
                  </button>
                ))}
              </div>
            )}

            {/* GRID / LIST */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
                {[1,2,3,4,5,6].map(i => (
                  viewMode === 'grid' ? (
                    <div key={i} className="animate-pulse rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] overflow-hidden">
                      <div className="h-[160px] bg-slate-100 dark:bg-white/[0.03]" />
                      <div className="p-3.5 space-y-2.5">
                        <div className="h-4 bg-slate-100 dark:bg-white/[0.03] rounded w-3/4" />
                        <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded w-full" />
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="animate-pulse rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] h-[100px] flex">
                      <div className="w-[180px] bg-slate-100 dark:bg-white/[0.03]" />
                      <div className="flex-1 p-4 space-y-2">
                        <div className="h-4 bg-slate-100 dark:bg-white/[0.03] rounded w-1/2" />
                        <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded w-3/4" />
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : paginatedSolutions.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
                  {paginatedSolutions.map((sol, idx) => (
                    <React.Fragment key={sol.id}>
                      {/* CTA Banner after 6th item */}
                      {idx === 6 && viewMode === 'grid' && <CTABanner onNavigate={handleNavigate} />}
                      {idx === 6 && viewMode === 'list' && (
                        <CTABanner onNavigate={handleNavigate} />
                      )}
                      {viewMode === 'grid' ? (
                        <ProductCardGrid sol={sol} lang={currentLang} onNavigate={handleNavigate}
                          isFav={favorites.includes(sol.id)} onToggleFav={(e) => toggleFavorite(e, sol.id)} />
                      ) : (
                        <ProductCardList sol={sol} lang={currentLang} onNavigate={handleNavigate}
                          isFav={favorites.includes(sol.id)} onToggleFav={(e) => toggleFavorite(e, sol.id)} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                      className="flex items-center gap-2 px-8 py-3 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-[13px] font-semibold text-slate-600 dark:text-gray-300 hover:border-brand-blue/30 hover:text-brand-blue transition-all">
                      Xem thêm ({filteredSolutions.length - visibleCount} còn lại)
                      <ChevronDown size={14} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <Search size={40} strokeWidth={1.5} className="text-slate-200 dark:text-gray-700" />
                <div>
                  <p className="text-lg font-semibold text-slate-400">Không tìm thấy công cụ</p>
                  <button onClick={resetFilters} className="text-[13px] text-brand-blue hover:underline mt-1">Đặt lại bộ lọc</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ MOBILE SIDEBAR ═══════ */}
      <AnimatePresence>
        {mobileSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 dark:bg-black/60 z-[500]" onClick={() => setMobileSidebar(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 w-[300px] h-full bg-white dark:bg-[#0e0e12] z-[501] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.04]">
                <h3 className="text-[15px] font-bold">Bộ lọc</h3>
                <button onClick={() => setMobileSidebar(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div className="p-5"><SidebarContent /></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════ BACK TO TOP ═══════ */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-[400] w-10 h-10 bg-brand-blue text-white rounded-full shadow-lg shadow-brand-blue/20 flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
          >
            <ChevronUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default MarketsPage;
