
import React, { useState, useEffect, useMemo, useRef, useCallback, useDeferredValue } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, ArrowRight, ChevronLeft, ChevronRight,
  Video, ImageIcon, Mic, Music, LayoutGrid, Zap, Star,
  Users, TrendingUp, Heart, BookmarkPlus, Bookmark,
  X, Layers, Box, Cpu, SlidersHorizontal,
  Check, Grid3X3, List, ArrowUp, Clock, Tag, ChevronUp, ChevronDown,
  Eye, GitCompare, Command,
  Globe, Smartphone, Tablet, BadgeCheck, Film
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { marketApi } from '../apis/market';
import { Solution, Language } from '../types';

// ═══════ ANIMATED COUNTER HOOK ═══════
const useAnimatedCounter = (end: number, duration = 800) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) { setCount(0); return; }
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

// ═══════ CONSTANTS ═══════
const STATIC_CATEGORIES = [
  { key: 'ALL', label: 'Tất cả', icon: LayoutGrid },
  { key: 'Video', label: 'Video AI', icon: Video },
  { key: 'Image', label: 'Hình ảnh AI', icon: ImageIcon },
  { key: 'Script', label: 'Kịch bản & Studio', icon: Film },
  { key: 'Audio', label: 'Giọng nói', icon: Mic },
  { key: 'Music', label: 'Nhạc AI', icon: Music },
  { key: 'Automation', label: 'Tự động hóa', icon: Zap },
  { key: '3D', label: '3D & Game', icon: Box },
  { key: 'Sky Partners', label: 'Sky Partners', icon: BadgeCheck, isPartner: true },
];
const COMPLEXITY_LEVELS = ['Standard', 'Advanced', 'Enterprise'];
const PLATFORMS = [
  { key: 'ALL', label: 'Tất cả', icon: LayoutGrid },
  { key: 'web', label: 'Web App', icon: Globe },
  { key: 'ios', label: 'Mobile iOS', icon: Smartphone },
  { key: 'android', label: 'Mobile Android', icon: Tablet },
  { key: 'extension', label: 'Extension', icon: Cpu },
];
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
  onPreview?: (e: React.MouseEvent) => void;
  isCompare?: boolean; onToggleCompare?: (e: React.MouseEvent) => void;
}> = ({ sol, lang, onNavigate, isFav, onToggleFav, onPreview, isCompare, onToggleCompare }) => {
  const stats = getStats(sol.id);
  return (
    <motion.div whileHover={{ y: -2 }}
      className={`bg-white dark:bg-[#111114] border rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all group flex flex-col ${isCompare ? 'border-brand-blue/30 ring-2 ring-brand-blue/10' : 'border-black/[0.04] dark:border-white/[0.04] hover:border-black/[0.08] dark:hover:border-white/[0.08]'}`}
      onClick={() => { saveRecentlyViewed(sol); onNavigate(sol.slug); }}>
      <div className="relative h-[160px] overflow-hidden">
        <img src={sol.imageUrl} alt={sol.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 left-2 flex gap-1">
          {sol.isFree && <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-md">FREE</span>}
          {sol.featured && <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold rounded-md flex items-center gap-0.5"><Sparkles size={8} fill="currentColor" /> Hot</span>}
        </div>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onPreview && <button onClick={onPreview} className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-colors" title="Xem nhanh"><Eye size={12} /></button>}
          {onToggleCompare && <button onClick={onToggleCompare} className={`p-1.5 rounded-lg backdrop-blur-md border transition-colors ${isCompare ? 'bg-brand-blue/80 border-brand-blue text-white' : 'bg-black/40 border-white/10 text-white/80 hover:text-white'}`} title="So sánh"><GitCompare size={12} /></button>}
          <button onClick={onToggleFav} className={`p-1.5 rounded-lg backdrop-blur-md border transition-all ${isFav ? 'bg-brand-blue/20 border-brand-blue/30 text-brand-blue' : 'bg-black/30 border-white/10 text-white/70'}`}>
            {isFav ? <Bookmark size={12} fill="currentColor" /> : <BookmarkPlus size={12} />}
          </button>
        </div>
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
  onPreview?: (e: React.MouseEvent) => void;
  isCompare?: boolean; onToggleCompare?: (e: React.MouseEvent) => void;
}> = ({ sol, lang, onNavigate, isFav, onToggleFav, onPreview, isCompare, onToggleCompare }) => {
  const stats = getStats(sol.id);
  return (
    <div className={`bg-white dark:bg-[#111114] border rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all group flex ${isCompare ? 'border-brand-blue/30 ring-2 ring-brand-blue/10' : 'border-black/[0.04] dark:border-white/[0.04] hover:border-black/[0.08] dark:hover:border-white/[0.08]'}`}
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
            <div className="flex items-center gap-1 shrink-0">
              {onPreview && <button onClick={onPreview} className="p-1 rounded-md text-slate-300 hover:text-brand-blue transition-colors" title="Xem nhanh"><Eye size={14} /></button>}
              {onToggleCompare && <button onClick={onToggleCompare} className={`p-1 rounded-md transition-colors ${isCompare ? 'text-brand-blue' : 'text-slate-300 hover:text-brand-blue'}`} title="So sánh"><GitCompare size={14} /></button>}
              <button onClick={onToggleFav} className={`p-1 rounded-md transition-all ${isFav ? 'text-brand-blue' : 'text-slate-300 dark:text-gray-600 hover:text-brand-blue'}`}>
                {isFav ? <Bookmark size={14} fill="currentColor" /> : <BookmarkPlus size={14} />}
              </button>
            </div>
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

// ═══════ QUICK PREVIEW MODAL ═══════
const QuickPreviewModal: React.FC<{ sol: Solution; lang: Language; onClose: () => void; onNavigate: (slug: string) => void }> = ({ sol, lang, onClose, onNavigate }) => {
  const stats = getStats(sol.id);
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[600]" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[601] w-[90vw] max-w-[560px] bg-white dark:bg-[#111114] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="relative h-[200px] overflow-hidden shrink-0">
          <img src={sol.imageUrl} alt={sol.name[lang]} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 backdrop-blur-md text-white/80 hover:text-white border border-white/10"><X size={16} /></button>
          <div className="absolute bottom-3 left-4 flex gap-1.5">
            {sol.isFree && <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg">FREE</span>}
            {sol.featured && <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1"><Sparkles size={10} fill="currentColor" /> Nổi bật</span>}
            {sol.complexity && <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/10">{sol.complexity}</span>}
          </div>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{sol.name[lang]}</h2>
            <p className="text-[12px] text-slate-400 mt-1">{sol.description[lang]}</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Users size={12} /> {stats.users} users</span>
            <span className="flex items-center gap-1"><Star size={12} fill="currentColor" className="text-amber-400" /> {stats.rating}</span>
            <span className="px-2 py-0.5 bg-brand-blue/[0.06] text-brand-blue rounded text-[10px] font-medium border border-brand-blue/10">{sol.category[lang]}</span>
          </div>
          {sol.features && sol.features.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tính năng</h4>
              <div className="space-y-1.5">
                {sol.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-gray-300">
                    <Check size={12} className="text-emerald-500 shrink-0" />
                    {typeof f === 'string' ? f : (f as any)[lang] || (f as any).en}
                  </div>
                ))}
              </div>
            </div>
          )}
          {sol.tags && sol.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sol.tags.map(t => <span key={t} className="px-2 py-1 bg-slate-50 dark:bg-white/[0.03] text-slate-500 rounded-lg text-[10px] font-medium border border-black/[0.04] dark:border-white/[0.04]">{t}</span>)}
            </div>
          )}
          {sol.priceCredits && <p className="text-[12px] text-slate-500"><Zap size={12} className="inline text-orange-500 mr-1" />{sol.priceCredits} Credits / lượt</p>}
        </div>
        <div className="p-4 border-t border-black/[0.04] dark:border-white/[0.04] shrink-0">
          <button onClick={() => { onClose(); onNavigate(sol.slug); }}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-blue text-white text-[13px] font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
            Mở công cụ <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </>
  );
};

// ═══════ COMPARE PANEL ═══════
const ComparePanel: React.FC<{ items: Solution[]; lang: Language; onRemove: (id: string) => void; onClear: () => void; onNavigate: (slug: string) => void }> = ({ items, lang, onRemove, onClear, onNavigate }) => {
  if (items.length === 0) return null;
  return (
    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-[500] bg-white dark:bg-[#111114] border-t border-black/[0.06] dark:border-white/[0.06] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
      <div className="max-w-[1500px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitCompare size={14} className="text-brand-blue" />
            <span className="text-[12px] font-bold text-slate-700 dark:text-white">So sánh ({items.length}/3)</span>
          </div>
          <button onClick={onClear} className="text-[11px] font-medium text-slate-400 hover:text-rose-500 transition-colors">Xoá tất cả</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(i => {
            const sol = items[i];
            if (!sol) return <div key={i} className="h-[80px] border-2 border-dashed border-black/[0.06] dark:border-white/[0.06] rounded-xl flex items-center justify-center text-[11px] text-slate-300 dark:text-gray-600">Chọn để so sánh</div>;
            const stats = getStats(sol.id);
            return (
              <div key={sol.id} className="relative p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04] flex gap-3">
                <button onClick={() => onRemove(sol.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm"><X size={10} /></button>
                <img src={sol.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-slate-700 dark:text-white truncate">{sol.name[lang]}</p>
                  <p className="text-[10px] text-slate-400 truncate">{sol.category[lang]} · {sol.complexity}</p>
                  <div className="flex gap-2 mt-1 text-[10px] text-slate-400">
                    <span><Users size={9} className="inline" /> {stats.users}</span>
                    <span><Star size={9} className="inline text-amber-400" fill="currentColor" /> {stats.rating}</span>
                    {sol.priceCredits && <span><Zap size={9} className="inline text-orange-500" /> {sol.priceCredits} CR</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// ═══════ MAIN PAGE ═══════
const MarketsPage: React.FC = () => {
  const { lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentLang = lang as Language;
  const searchInputRef = useRef<HTMLInputElement>(null);

  usePageMeta({
    title: 'Marketplace AI | Skyverses — 30+ ứng dụng, 50+ model, tiết kiệm ~70%',
    description: 'Khám phá Marketplace với 30+ ứng dụng AI & 50+ model: VEO3, Kling, Sora, Midjourney, Flux. Chi phí rẻ hơn ~70% so với nền tảng khác. Video, Image, Voice, Music & Automation.',
    keywords: 'AI marketplace, kho ứng dụng AI, 50+ model AI, AI giá rẻ, Skyverses, VEO3, Kling, Midjourney, Flux, video AI, image AI, AI automation, tiết kiệm chi phí AI',
    canonical: '/markets'
  });

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [featuredSolutions, setFeaturedSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  // #1: URL-BASED FILTERS — init from URL params
  // inputValue: updates immediately (no debounce — instant UI response)
  // deferredSearch: React defers expensive filter recalc, keeps typing smooth
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const deferredSearch = useDeferredValue(inputValue);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFreeOnly, setShowFreeOnly] = useState(searchParams.get('free') === 'true');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [activeComplexity, setActiveComplexity] = useState<string | null>(searchParams.get('complexity') || null);
  const [activeTags, setActiveTags] = useState<string[]>(searchParams.get('tags')?.split(',').filter(Boolean) || []);
  const [activePlatform, setActivePlatform] = useState(searchParams.get('platform') || 'ALL');
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>((searchParams.get('view') as any) || 'grid');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showBackTop, setShowBackTop] = useState(false);

  // #2: PREVIEW & COMPARE states
  const [previewSol, setPreviewSol] = useState<Solution | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showMoreCats, setShowMoreCats] = useState(false);

  // #1: SYNC filters → URL (use inputValue for URL so it reflects what user typed)
  useEffect(() => {
    const params = new URLSearchParams();
    if (inputValue) params.set('q', inputValue);
    if (activeCategory !== 'ALL') params.set('category', activeCategory);
    if (sortBy !== 'popular') params.set('sort', sortBy);
    if (showFreeOnly) params.set('free', 'true');
    if (showFeaturedOnly) params.set('featured', 'true');
    if (activeComplexity) params.set('complexity', activeComplexity);
    if (activeTags.length > 0) params.set('tags', activeTags.join(','));
    if (activePlatform !== 'ALL') params.set('platform', activePlatform);
    if (viewMode !== 'grid') params.set('view', viewMode);
    setSearchParams(params, { replace: true });
  }, [inputValue, activeCategory, sortBy, showFreeOnly, showFeaturedOnly, activeComplexity, activeTags, activePlatform, viewMode]);

  // #5: KEYBOARD SHORTCUTS
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K → focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Don't trigger shortcuts when typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // G → toggle grid/list
      if (e.key === 'g' || e.key === 'G') setViewMode(v => v === 'grid' ? 'list' : 'grid');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [deferredSearch, activeCategory, sortBy, showFreeOnly, showFeaturedOnly, activeComplexity, activeTags, activePlatform]);

  const toggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setFavorites(prev => {
      const n = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('skyverses_favorites', JSON.stringify(n));
      return n;
    });
  }, []);

  const handleNavigate = useCallback((slug: string) => {
    navigate(`/product/${slug}`);
  }, [navigate]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    solutions.forEach(s => s.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [solutions]);

  // Build dynamic categories: static list + any category from API not already covered
  const CATEGORIES = useMemo(() => {
    const staticKeys = new Set(STATIC_CATEGORIES.map(c => c.key.toLowerCase()));
    const extraCats: { key: string; label: string; icon: typeof LayoutGrid }[] = [];

    solutions.forEach(sol => {
      const catEn = sol.category?.en;
      if (!catEn) return;
      const catKey = catEn.trim();
      if (!catKey) return;
      // Skip if already covered by a static category (case-insensitive partial match)
      const alreadyCovered = Array.from(staticKeys).some(k =>
        k !== 'all' && k !== 'sky partners' && (
          catKey.toLowerCase().includes(k) || k.includes(catKey.toLowerCase())
        )
      );
      if (alreadyCovered) return;
      if (extraCats.some(c => c.key === catKey)) return;
      extraCats.push({ key: catKey, label: catEn, icon: Cpu });
    });

    // Insert extra categories before 'Sky Partners'
    const partnersIdx = STATIC_CATEGORIES.findIndex(c => c.key === 'Sky Partners');
    const base = [...STATIC_CATEGORIES];
    base.splice(partnersIdx, 0, ...extraCats);
    return base;
  }, [solutions]);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }, []);

  const filteredSolutions = useMemo(() => {
    let filtered = solutions.filter(sol => {
      const matchSearch = !deferredSearch ||
        sol.name[currentLang]?.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        sol.description[currentLang]?.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        sol.tags?.some(t => t.toLowerCase().includes(deferredSearch.toLowerCase()));
      const matchCat = activeCategory === 'ALL' ||
        (activeCategory === 'Sky Partners'
          ? sol.tags?.some(t => t === 'Sky Partners')
          : (
              sol.category[currentLang]?.toLowerCase().includes(activeCategory.toLowerCase()) ||
              sol.category.en?.toLowerCase().includes(activeCategory.toLowerCase()) ||
              sol.tags?.some(t => t.toLowerCase().includes(activeCategory.toLowerCase())) ||
              sol.demoType?.toLowerCase() === activeCategory.toLowerCase()
            )
        );
      const matchFree = !showFreeOnly || sol.isFree;
      const matchFeatured = !showFeaturedOnly || sol.featured;
      const matchComplexity = !activeComplexity || sol.complexity === activeComplexity;
      const matchTags = activeTags.length === 0 || activeTags.every(at => sol.tags?.some(st => st.toLowerCase() === at.toLowerCase()));
      const matchPlatform = activePlatform === 'ALL' || !sol.platforms || sol.platforms.length === 0 || sol.platforms.includes(activePlatform);
      return matchSearch && matchCat && matchFree && matchFeatured && matchComplexity && matchTags && matchPlatform;
    });
    if (sortBy === 'name') filtered.sort((a, b) => (a.name[currentLang] || '').localeCompare(b.name[currentLang] || ''));
    else if (sortBy === 'newest') filtered.reverse();
    // Sky Partners always at the end when viewing ALL (not when specifically filtered)
    if (activeCategory === 'ALL') {
      filtered.sort((a, b) => {
        const aIsPartner = a.tags?.includes('Sky Partners') ? 1 : 0;
        const bIsPartner = b.tags?.includes('Sky Partners') ? 1 : 0;
        return aIsPartner - bIsPartner;
      });
    }
    return filtered;
  }, [solutions, deferredSearch, activeCategory, sortBy, showFreeOnly, showFeaturedOnly, activeComplexity, activeTags, currentLang]);

  const paginatedSolutions = useMemo(() => filteredSolutions.slice(0, visibleCount), [filteredSolutions, visibleCount]);
  const hasMore = visibleCount < filteredSolutions.length;

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: solutions.length };
    CATEGORIES.forEach(c => {
      if (c.key === 'ALL') return;
      if (c.key === 'Sky Partners') {
        counts[c.key] = solutions.filter(s => s.tags?.some(t => t === 'Sky Partners')).length;
      } else {
        counts[c.key] = solutions.filter(s =>
          s.category[currentLang]?.toLowerCase().includes(c.key.toLowerCase()) ||
          s.category.en?.toLowerCase().includes(c.key.toLowerCase()) ||
          s.tags?.some(t => t.toLowerCase().includes(c.key.toLowerCase())) ||
          s.demoType?.toLowerCase() === c.key.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [solutions, currentLang, CATEGORIES]);

  const activeFilterCount = [showFreeOnly, showFeaturedOnly, !!activeComplexity, activeCategory !== 'ALL', activeTags.length > 0, activePlatform !== 'ALL'].filter(Boolean).length;

  const resetFilters = () => {
    setActiveCategory('ALL'); setShowFreeOnly(false); setShowFeaturedOnly(false);
    setActiveComplexity(null); setActiveTags([]); setActivePlatform('ALL');
    setInputValue('');
  };

  // #2: PREVIEW handler
  const handlePreview = useCallback((e: React.MouseEvent, sol: Solution) => {
    e.preventDefault(); e.stopPropagation();
    setPreviewSol(sol);
  }, []);

  // #3: COMPARE handler
  const toggleCompare = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  }, []);
  const compareSolutions = useMemo(() => compareIds.map(id => solutions.find(s => s.id === id)).filter(Boolean) as Solution[], [compareIds, solutions]);

  // #4: ANIMATED COUNTERS
  const animatedTotal = useAnimatedCounter(solutions.length);
  const animatedFree = useAnimatedCounter(solutions.filter(s => s.isFree).length);
  const animatedFeatured = useAnimatedCounter(solutions.filter(s => s.featured).length);

  // ═══════ SIDEBAR ═══════
  const SidebarContent = () => (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={15} />
        <input ref={searchInputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Tìm công cụ AI... (⌘K)"
          className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] pl-9 pr-8 py-2.5 rounded-xl text-[13px] focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600" />
        {inputValue && <button onClick={() => setInputValue('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"><X size={13} /></button>}
      </div>

      {/* Categories Card */}
      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center gap-2">
          <LayoutGrid size={13} className="text-brand-blue" />
          <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Danh mục</span>
        </div>
        <div className="p-2 space-y-0.5">
          {(() => {
            const staticKeys = new Set(STATIC_CATEGORIES.map(c => c.key));
            const mainCats = CATEGORIES.filter(c => staticKeys.has(c.key));
            const extraCats = CATEGORIES.filter(c => !staticKeys.has(c.key));
            const renderCatBtn = (cat: typeof CATEGORIES[0]) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;
              const count = catCounts[cat.key] || 0;
              const isExternal = (cat as any).isPartner;
              return (
                <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                    isActive
                      ? isExternal
                        ? 'bg-gradient-to-r from-brand-blue to-purple-500 text-white shadow-sm shadow-brand-blue/20'
                        : 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20'
                      : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                  }`}>
                  <Icon size={14} className={isActive ? 'text-white' : isExternal ? 'text-brand-blue' : ''} />
                  <span className="flex-1 text-left">{cat.label}</span>
                  {isExternal && !isActive && (
                    <span className="text-[8px] font-bold text-brand-blue bg-brand-blue/[0.07] border border-brand-blue/15 px-1.5 py-0.5 rounded-full uppercase tracking-wider mr-1">Partner</span>
                  )}
                  <span className={`text-[10px] font-semibold min-w-[20px] text-center py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500'
                  }`}>{count}</span>
                </button>
              );
            };
            return (
              <>
                {mainCats.map(renderCatBtn)}
                {extraCats.length > 0 && (
                  <>
                    <AnimatePresence initial={false}>
                      {showMoreCats && (
                        <motion.div
                          key="extra-cats"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden space-y-0.5"
                        >
                          {extraCats.map(renderCatBtn)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button
                      onClick={() => setShowMoreCats(v => !v)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mt-0.5 rounded-lg text-[11px] font-semibold text-slate-400 dark:text-gray-500 hover:text-brand-blue hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all border border-dashed border-black/[0.06] dark:border-white/[0.06]"
                    >
                      {showMoreCats ? (
                        <><ChevronUp size={12} /> Thu gọn</>
                      ) : (
                        <><ChevronDown size={12} /> Xem thêm {extraCats.length} danh mục</>
                      )}
                    </button>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Complexity Card */}
      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center gap-2">
          <Layers size={13} className="text-purple-500" />
          <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Cấp độ</span>
        </div>
        <div className="p-2">
          <div className="grid grid-cols-3 gap-1.5">
            {COMPLEXITY_LEVELS.map(level => {
              const isActive = activeComplexity === level;
              return (
                <button key={level} onClick={() => setActiveComplexity(isActive ? null : level)}
                  className={`flex items-center justify-center py-2 rounded-lg text-[11px] font-semibold transition-all ${isActive
                    ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20'
                    : 'bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.04]'
                  }`}>
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform Card */}
      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center gap-2">
          <Globe size={13} className="text-cyan-500" />
          <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Nền tảng</span>
        </div>
        <div className="p-2 space-y-0.5">
          {PLATFORMS.map(plat => {
            const Icon = plat.icon;
            const isActive = activePlatform === plat.key;
            return (
              <button key={plat.key} onClick={() => setActivePlatform(plat.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${isActive
                  ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20'
                  : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                }`}>
                <Icon size={14} className={isActive ? 'text-white' : ''} />
                <span className="flex-1 text-left">{plat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Card */}
      {allTags.length > 0 && (
        <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={13} className="text-orange-500" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Tags</span>
            </div>
            {activeTags.length > 0 && (
              <span className="text-[9px] font-bold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded">{activeTags.length} chọn</span>
            )}
          </div>
          <div className="p-3 flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto no-scrollbar">
            {allTags.map(tag => {
              const isActive = activeTags.includes(tag);
              return (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${isActive
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-gray-400 border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/30 hover:text-brand-blue'
                  }`}>
                  {isActive && <Check size={9} className="inline mr-1 -mt-px" />}{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggles Card */}
      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-emerald-500" />
          <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Bộ lọc</span>
        </div>
        <div className="p-2 space-y-0.5">
          <label className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-2">
              <Zap size={13} className={showFreeOnly ? 'text-emerald-500' : 'text-slate-400'} />
              <span className="text-[12px] font-medium text-slate-600 dark:text-gray-300">Chỉ miễn phí</span>
            </div>
            <div className={`relative w-8 h-[18px] rounded-full transition-colors ${showFreeOnly ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-white/10'}`} onClick={(e) => { e.preventDefault(); setShowFreeOnly(!showFreeOnly); }}>
              <div className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-all ${showFreeOnly ? 'left-[16px]' : 'left-[2px]'}`} />
            </div>
          </label>
          <label className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className={showFeaturedOnly ? 'text-amber-500' : 'text-slate-400'} />
              <span className="text-[12px] font-medium text-slate-600 dark:text-gray-300">Nổi bật</span>
            </div>
            <div className={`relative w-8 h-[18px] rounded-full transition-colors ${showFeaturedOnly ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-white/10'}`} onClick={(e) => { e.preventDefault(); setShowFeaturedOnly(!showFeaturedOnly); }}>
              <div className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-all ${showFeaturedOnly ? 'left-[16px]' : 'left-[2px]'}`} />
            </div>
          </label>
        </div>
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold text-brand-blue bg-brand-blue/[0.06] hover:bg-brand-blue/[0.1] border border-brand-blue/10 rounded-xl transition-colors">
          <X size={12} /> Đặt lại bộ lọc ({activeFilterCount})
        </button>
      )}

      {/* Stats Footer */}
      <div className="p-4 bg-gradient-to-br from-brand-blue/[0.04] to-purple-500/[0.03] border border-brand-blue/10 rounded-xl space-y-3">
        <h4 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Thống kê Marketplace</h4>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-gray-400">Tổng công cụ</span>
          <span className="text-[13px] font-bold text-brand-blue">{animatedTotal}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-gray-400">Danh mục</span>
          <span className="text-[13px] font-bold text-purple-500">{CATEGORIES.length - 1}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-gray-400">Miễn phí</span>
          <span className="text-[13px] font-bold text-emerald-500">{animatedFree || '0'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-gray-400">Nổi bật</span>
          <span className="text-[13px] font-bold text-amber-500">{animatedFeatured || '0'}</span>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="flex flex-wrap gap-2 text-[9px] text-slate-400 dark:text-gray-600">
        <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[8px] font-mono">⌘K</kbd> Tìm</span>
        <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[8px] font-mono">G</kbd> Grid/List</span>
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
            {!inputValue && featuredSolutions.length > 0 && (
              <TrendingSlider items={featuredSolutions} lang={currentLang} onNavigate={handleNavigate} />
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-slate-400 dark:text-gray-500">
                {loading ? 'Đang tải...' : <><strong className="text-slate-600 dark:text-gray-300">{filteredSolutions.length}</strong> kết quả</>}
                {deferredSearch && <span className="text-brand-blue ml-1">"{deferredSearch}"</span>}
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
                          isFav={favorites.includes(sol.id)} onToggleFav={(e) => toggleFavorite(e, sol.id)}
                          onPreview={(e) => handlePreview(e, sol)}
                          isCompare={compareIds.includes(sol.id)}
                          onToggleCompare={(e) => toggleCompare(e, sol.id)} />
                      ) : (
                        <ProductCardList sol={sol} lang={currentLang} onNavigate={handleNavigate}
                          isFav={favorites.includes(sol.id)} onToggleFav={(e) => toggleFavorite(e, sol.id)}
                          onPreview={(e) => handlePreview(e, sol)}
                          isCompare={compareIds.includes(sol.id)}
                          onToggleCompare={(e) => toggleCompare(e, sol.id)} />
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
            className={`fixed ${compareIds.length > 0 ? 'bottom-36' : 'bottom-8'} right-8 z-[400] w-10 h-10 bg-brand-blue text-white rounded-full shadow-lg shadow-brand-blue/20 flex items-center justify-center hover:brightness-110 active:scale-95 transition-all`}
          >
            <ChevronUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══════ QUICK PREVIEW MODAL ═══════ */}
      <AnimatePresence>
        {previewSol && (
          <QuickPreviewModal sol={previewSol} lang={currentLang} onClose={() => setPreviewSol(null)} onNavigate={handleNavigate} />
        )}
      </AnimatePresence>

      {/* ═══════ COMPARE PANEL ═══════ */}
      <AnimatePresence>
        {compareSolutions.length > 0 && (
          <ComparePanel items={compareSolutions} lang={currentLang}
            onRemove={(id) => setCompareIds(prev => prev.filter(x => x !== id))}
            onClear={() => setCompareIds([])} onNavigate={handleNavigate} />
        )}
      </AnimatePresence>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default MarketsPage;
