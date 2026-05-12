
import React, { useState, useEffect, useMemo, useRef, useCallback, useDeferredValue } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, ArrowRight, ChevronLeft, ChevronRight,
  Video, ImageIcon, Mic, Music, LayoutGrid, LayoutList, Zap,
  TrendingUp, BookmarkPlus, Bookmark,
  X, Box, Cpu, SlidersHorizontal,
  Check, Clock, ChevronUp, ChevronDown,
  Eye, GitCompare,
  Globe, Smartphone, Tablet, Film, Lightbulb,
  Activity, CircuitBoard, Flame,
  Code2, Gamepad2,
  Grid3X3, Rocket, Settings, Star, Workflow
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { marketApi } from '../apis/market';
import { Solution, Language } from '../types';

// ═══════ TYPES ═══════
interface RecentlyViewedItem {
  id: string;
  slug: string;
  name: { en: string; vi: string; ko: string; ja: string };
  imageUrl: string;
  category: { en: string; vi: string; ko: string; ja: string };
}

// ═══════ CONSTANTS ═══════
// Sky Partners đã được rút khỏi danh mục chính (khái niệm mơ hồ với user mới).
// User vẫn có thể filter qua tag "Sky Partners" trong "Bộ lọc nâng cao → Tags" nếu muốn.
const STATIC_CATEGORIES = [
  { key: 'ALL', label: 'All', icon: LayoutGrid },
  { key: 'Image', label: 'Image', icon: ImageIcon },
  { key: 'Video', label: 'Video', icon: Video },
  { key: 'Audio', label: 'Audio', icon: Mic },
  { key: 'Automation', label: 'Automation', icon: Zap },
  { key: '3D', label: '3D', icon: Box },
  { key: 'Script', label: 'Kịch bản & Studio', icon: Film },
  { key: 'Music', label: 'Music', icon: Music },
];
// Việt hoá label nhưng giữ key tiếng Anh để khớp Solution.complexity từ backend
const COMPLEXITY_LEVELS: { key: string; label: string }[] = [
  { key: 'Standard', label: 'Phổ thông' },
  { key: 'Advanced', label: 'Nâng cao' },
  { key: 'Enterprise', label: 'Doanh nghiệp' },
];
const PLATFORMS = [
  { key: 'ALL', label: 'Tất cả', icon: LayoutGrid },
  { key: 'web', label: 'Web App', icon: Globe },
  { key: 'ios', label: 'Mobile iOS', icon: Smartphone },
  { key: 'android', label: 'Mobile Android', icon: Tablet },
  { key: 'extension', label: 'Extension', icon: Cpu },
];
// Sort options gọn — chỉ 2 lựa chọn user thực sự cần.
// Khi user đang search, hệ thống tự sort theo relevance (không cần option riêng).
const SORT_OPTIONS = [
  { key: 'popular', label: 'Phổ biến' },
  { key: 'newest', label: 'Mới nhất' },
];
// Quick path use-case driven cho user mới — click → set category + scroll xuống grid
const QUICK_PATHS: { key: string; category: string; label: string; desc: string; icon: typeof Video; iconColor: string; gradient: string }[] = [
  { key: 'video',      category: 'Video',      label: 'Tạo video TikTok',     desc: 'Veo 3, Kling, Sora',     icon: Video,     iconColor: 'text-pink-500',    gradient: 'from-pink-500/[0.07] to-rose-500/[0.05]' },
  { key: 'image',      category: 'Image',      label: 'Vẽ ảnh AI',            desc: 'Midjourney, Flux, Imagen', icon: ImageIcon, iconColor: 'text-violet-500',  gradient: 'from-violet-500/[0.07] to-purple-500/[0.05]' },
  { key: 'music',      category: 'Music',      label: 'Tạo nhạc AI',          desc: 'Suno, Udio, MusicGen',   icon: Music,     iconColor: 'text-amber-500',   gradient: 'from-amber-500/[0.07] to-orange-500/[0.05]' },
  { key: 'audio',      category: 'Audio',      label: 'Lồng tiếng & TTS',     desc: 'ElevenLabs, voice AI',   icon: Mic,       iconColor: 'text-emerald-500', gradient: 'from-emerald-500/[0.07] to-teal-500/[0.05]' },
  { key: 'script',     category: 'Script',     label: 'Viết blog & nội dung', desc: 'Kịch bản, bài viết AI',  icon: Film,      iconColor: 'text-blue-500',    gradient: 'from-blue-500/[0.07] to-cyan-500/[0.05]' },
  { key: 'automation', category: 'Automation', label: 'Tự động hoá quy trình', desc: 'Workflow, n8n, agents',  icon: Zap,       iconColor: 'text-yellow-500',  gradient: 'from-yellow-500/[0.07] to-amber-500/[0.05]' },
];

const HERO_SPARKS = [
  'left-[38%] top-[10%]', 'left-[46%] top-[18%]', 'left-[58%] top-[9%]', 'left-[68%] top-[17%]',
  'left-[78%] top-[11%]', 'left-[88%] top-[25%]', 'left-[53%] top-[42%]', 'left-[72%] top-[48%]',
  'left-[92%] top-[58%]', 'left-[43%] top-[72%]', 'left-[64%] top-[78%]', 'left-[84%] top-[73%]',
];

const HERO_WAVES = [
  'right-[-8%] top-[4%] h-[150px] w-[62%] rotate-[-8deg] opacity-80',
  'right-[2%] top-[24%] h-[120px] w-[48%] rotate-[7deg] opacity-55',
  'right-[18%] top-[52%] h-[86px] w-[40%] rotate-[-4deg] opacity-45',
];

const MARKET_RAIL = [
  { label: 'Apps', icon: Grid3X3, active: true },
  { label: 'Favorites', icon: Star },
  { label: 'Launch', icon: Rocket },
  { label: 'Signal', icon: Activity },
  { label: '3D', icon: Box },
  { label: 'Voice', icon: Mic },
  { label: 'Workflow', icon: Workflow },
  { label: 'Settings', icon: Settings },
  { label: 'Games', icon: Gamepad2 },
  { label: 'Code', icon: Code2 },
];

const FILTER_MENU: { key: string; label: string; icon: typeof ImageIcon; color: string }[] = [
  { key: 'Image', label: 'Image', icon: ImageIcon, color: 'text-lime-400' },
  { key: 'Video', label: 'Video', icon: Video, color: 'text-violet-400' },
  { key: 'Audio', label: 'Audio', icon: Mic, color: 'text-orange-400' },
  { key: 'Automation', label: 'Automation', icon: Workflow, color: 'text-yellow-400' },
  { key: '3D', label: '3D', icon: Box, color: 'text-cyan-400' },
  { key: 'Productivity', label: 'Productivity', icon: CircuitBoard, color: 'text-sky-400' },
  { key: 'Script', label: 'Code', icon: Code2, color: 'text-pink-400' },
  { key: 'Other', label: 'Other', icon: Cpu, color: 'text-white/60' },
];

// Phân nhóm Categories theo persona user mới VN:
// "Tạo nội dung" = các category sáng tạo (expand mặc định), "Khác" = automation + extras (collapse mặc định).
const CONTENT_CATEGORY_KEYS = new Set(['Video', 'Image', 'Music', 'Audio', 'Script', '3D']);
const ITEMS_PER_PAGE = 12;
const RECENTLY_VIEWED_KEY = 'skyverses_recently_viewed';
const QUICKPATH_DISMISSED_KEY = 'skyverses_quickpath_dismissed';
const ADVANCED_FILTERS_OPEN_KEY = 'skyverses_advanced_filters_open';
const CAT_CONTENT_OPEN_KEY = 'skyverses_cat_content_open';
const CAT_OTHER_OPEN_KEY = 'skyverses_cat_other_open';
const GRID_ANCHOR_ID = 'markets-grid-anchor';
const MAX_RECENT = 8;

const TRENDING_LIMIT = 12;
const SCROLL_POS_KEY = 'skyverses_markets_scroll';

// ═══════ HELPERS ═══════

// Debounce helper for localStorage writes
let favDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const saveFavoritesDebounced = (ids: string[]) => {
  if (favDebounceTimer) clearTimeout(favDebounceTimer);
  favDebounceTimer = setTimeout(() => {
    localStorage.setItem('skyverses_favorites', JSON.stringify(ids));
  }, 300);
};

const saveRecentlyViewed = (sol: Solution) => {
  try {
    const stored: RecentlyViewedItem[] = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    const filtered = stored.filter((s) => s.id !== sol.id);
    filtered.unshift({ id: sol.id, slug: sol.slug, name: sol.name as RecentlyViewedItem['name'], imageUrl: sol.imageUrl, category: sol.category as RecentlyViewedItem['category'] });
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
  } catch {}
};

const getRecentlyViewed = (): RecentlyViewedItem[] => {
  try { return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]'); } catch { return []; }
};

// Relevance score for search query
const getRelevanceScore = (sol: Solution, query: string, lang: Language): number => {
  if (!query) return 0;
  const q = query.toLowerCase();
  let score = 0;
  const name = sol.name[lang]?.toLowerCase() || '';
  const desc = sol.description[lang]?.toLowerCase() || '';
  const tags = sol.tags?.map(t => t.toLowerCase()) || [];
  if (name.startsWith(q)) score += 10;
  else if (name.includes(q)) score += 6;
  if (desc.includes(q)) score += 3;
  if (tags.some(t => t.includes(q))) score += 4;
  if (sol.featured) score += 1;
  return score;
};

const getSolutionAccent = (sol: Solution) => {
  const key = `${sol.demoType}-${sol.category?.en || ''}`.toLowerCase();
  if (key.includes('video')) return 'from-rose-500/30 via-brand-blue/15 to-black/0';
  if (key.includes('image')) return 'from-brand-blue/30 via-[#E5C767]/10 to-black/0';
  if (key.includes('audio') || key.includes('music')) return 'from-emerald-500/20 via-brand-blue/15 to-black/0';
  if (key.includes('automation')) return 'from-sky-500/20 via-brand-blue/15 to-black/0';
  return 'from-brand-blue/25 via-white/[0.04] to-black/0';
};

const getStageIcon = (sol?: Solution) => {
  const key = `${sol?.demoType || ''}-${sol?.category?.en || ''}`.toLowerCase();
  if (key.includes('video')) return Video;
  if (key.includes('audio') || key.includes('music')) return Mic;
  if (key.includes('automation')) return Workflow;
  if (key.includes('3d')) return Box;
  if (key.includes('code') || key.includes('script')) return Code2;
  return ImageIcon;
};

const matchesMenuCategory = (sol: Solution, key: string, lang: Language): boolean => {
  const needle = key.toLowerCase();
  const category = `${sol.category?.[lang] || ''} ${sol.category?.en || ''}`.toLowerCase();
  const demoType = (sol.demoType || '').toLowerCase();
  const tags = (sol.tags || []).join(' ').toLowerCase();

  if (key === 'Other') {
    return !FILTER_MENU.filter(item => item.key !== 'Other').some(item => matchesMenuCategory(sol, item.key, lang));
  }
  if (key === 'Productivity') {
    return tags.includes('productivity') || tags.includes('business') || tags.includes('workflow');
  }
  if (key === 'Script') {
    return category.includes('script') || category.includes('code') || tags.includes('script') || tags.includes('code');
  }
  if (key === '3D') {
    return category.includes('3d') || demoType.includes('3d') || tags.includes('3d');
  }
  return category.includes(needle) || demoType.includes(needle) || tags.includes(needle);
};

const pickRandomSolutions = (items: Solution[], count = 5): Solution[] => {
  const pool = items.filter(sol => sol.isActive !== false && sol.id && sol.slug && sol.imageUrl);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
};

// ═══════ TRENDING SLIDER ═══════
const TrendingSlider: React.FC<{ items: Solution[]; lang: Language; onNavigate: (slug: string) => void }> = React.memo(({ items, lang, onNavigate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  };
  const limitedItems = useMemo(() => items.slice(0, 6), [items]);
  if (limitedItems.length === 0) return null;
  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-black/28 px-5 py-4 xl:px-6">
      <motion.div
        className="pointer-events-none absolute inset-y-0 left-[-30%] w-[38%] bg-gradient-to-r from-transparent via-[#E5C767]/10 to-transparent"
        animate={{ x: ['0%', '360%'] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={17} className="text-[#E5C767]" />
          <h3 className="text-[18px] font-medium text-white">Trending</h3>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden items-center gap-1 rounded-md text-[12px] font-medium text-[#E5C767] hover:text-white md:flex">
            View all <ChevronRight size={13} />
          </button>
          <button onClick={() => scroll('right')} className="grid h-11 w-11 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/70 transition-colors hover:border-[#E5C767]/45 hover:text-[#E5C767]">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="relative z-10 flex gap-4 overflow-x-auto no-scrollbar snap-x">
        {limitedItems.map((sol, i) => (
          <motion.button
            key={sol.id}
            onClick={() => onNavigate(sol.slug)}
            className="group flex h-[56px] w-[190px] shrink-0 snap-start items-center gap-3 rounded-lg border border-white/[0.09] bg-[#101112]/90 px-3 text-left transition-all hover:border-[#E5C767]/45 hover:bg-[#151515]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, scale: 1.025 }}
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md border border-white/[0.08] bg-white/[0.05]">
              <img src={sol.imageUrl} alt="" className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="truncate text-[12px] font-medium text-white group-hover:text-[#E5C767]">{sol.name[lang]}</h4>
                {i < 2 && <Flame size={11} className="shrink-0 text-[#E5C767]" fill="currentColor" />}
              </div>
              <p className="mt-0.5 truncate text-[10px] text-white/42">{sol.category[lang]}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
});

// ═══════ RECENTLY VIEWED ═══════
const RecentlyViewed: React.FC<{ lang: Language; onNavigate: (slug: string) => void }> = React.memo(({ lang, onNavigate }) => {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  useEffect(() => { setItems(getRecentlyViewed()); }, []);
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-neutral-500" />
        <h3 className="text-[13px] font-bold text-neutral-300">Xem gần đây</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {items.map((item) => (
          <div key={item.id} onClick={() => onNavigate(item.slug)}
            className="shrink-0 flex items-center gap-2.5 px-3 py-2 bg-neutral-900 border border-neutral-700/40 cursor-pointer hover:border-brand-blue/20 transition-all group">
            <img src={item.imageUrl} className="w-8 h-8 rounded-lg object-cover" alt="" />
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-neutral-200 truncate max-w-[120px] group-hover:text-brand-blue transition-colors">{item.name?.[lang] || item.name?.en}</p>
              <p className="text-[10px] text-neutral-500">{item.category?.[lang] || item.category?.en}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ═══════ QUICK PATH HERO — "Bạn muốn làm gì?" ═══════
// Hiển thị cho user mới chưa filter gì. Click 1 quick path → set category + scroll xuống grid.
const QuickPathHero: React.FC<{ onPick: (cat: string) => void; onDismiss: () => void }> = React.memo(({ onPick, onDismiss }) => (
  <div className="mb-8 border border-white/[0.06] bg-[#0A0A0A]/70 p-4 md:p-5">
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-blue/[0.08] border border-brand-blue/15 mb-1.5">
          <Sparkles size={10} className="text-brand-blue" />
          <span className="text-[9px] font-bold text-brand-blue uppercase tracking-wider">Bắt đầu nhanh</span>
        </div>
        <h2 className="text-[17px] md:text-[19px] font-bold text-white">Bạn muốn làm gì hôm nay?</h2>
        <p className="text-[12px] text-white/45 mt-0.5">Chọn một mục để xem ngay công cụ phù hợp</p>
      </div>
      <button onClick={onDismiss}
        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-white/38 hover:text-white/70 hover:bg-white/[0.05] transition-colors">
        Ẩn <X size={10} />
      </button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
      {QUICK_PATHS.map(p => {
        const Icon = p.icon;
        return (
          <button key={p.key} onClick={() => onPick(p.category)}
            className="group relative overflow-hidden bg-[#111111] border border-white/[0.06] p-3.5 md:p-4 text-left hover:border-brand-blue/30 hover:-translate-y-0.5 transition-all">
            <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className={`relative w-9 h-9 md:w-10 md:h-10 bg-white/[0.045] border border-white/[0.06] flex items-center justify-center mb-2.5 ${p.iconColor}`}>
              <Icon size={17} />
            </div>
            <p className="relative text-[12.5px] md:text-[13.5px] font-bold text-white group-hover:text-brand-blue transition-colors">{p.label}</p>
            <p className="relative text-[10px] md:text-[11px] text-white/42 mt-0.5 truncate">{p.desc}</p>
            <ArrowRight size={11} className="absolute top-3.5 right-3.5 text-white/30 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
          </button>
        );
      })}
    </div>
  </div>
));

// ═══════ SUGGESTED FOR YOU ═══════
const SuggestedSection: React.FC<{ solutions: Solution[]; lang: Language; onNavigate: (slug: string) => void; onPreview: (e: React.MouseEvent, sol: Solution) => void; favorites: string[]; onToggleFav: (e: React.MouseEvent, id: string) => void }> = React.memo(({ solutions, lang, onNavigate, onPreview, favorites, onToggleFav }) => {
  const suggested = useMemo(() => {
    const recent = getRecentlyViewed();
    if (recent.length === 0) return [];
    // Count categories from recently viewed
    const catCount: Record<string, number> = {};
    recent.forEach(r => {
      const cat = r.category?.[lang] || r.category?.en || '';
      if (cat) catCount[cat] = (catCount[cat] || 0) + 1;
    });
    const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!topCat) return [];
    const recentIds = new Set(recent.map(r => r.id));
    return solutions
      .filter(s => !recentIds.has(s.id) && (s.category[lang]?.includes(topCat) || s.category.en?.includes(topCat)))
      .slice(0, 4);
  }, [solutions, lang]);

  if (suggested.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={14} className="text-brand-blue" />
        <h3 className="text-[13px] font-bold text-neutral-300">Gợi ý cho bạn</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {suggested.map(sol => (
          <div key={sol.id} onClick={() => { saveRecentlyViewed(sol); onNavigate(sol.slug); }}
            className="bg-neutral-900 border border-neutral-700/40 overflow-hidden cursor-pointer hover:border-brand-blue/30 transition-all group">
            <div className="relative h-[100px] overflow-hidden">
              <img src={sol.imageUrl} alt={sol.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              {sol.isFree && <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-md">FREE</span>}
              <button onClick={(e) => { e.stopPropagation(); onToggleFav(e, sol.id); }}
                className="absolute top-2 right-2 p-1 rounded-lg bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {favorites.includes(sol.id) ? <Bookmark size={10} className="text-brand-blue" fill="currentColor" /> : <BookmarkPlus size={10} className="text-white/70" />}
              </button>
            </div>
            <div className="p-2.5">
              <p className="text-[12px] font-bold text-neutral-200 truncate group-hover:text-brand-blue transition-colors">{sol.name[lang]}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{sol.category[lang]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const MarketIconRail: React.FC = React.memo(() => (
  <nav className="fixed bottom-0 left-0 top-[48px] z-30 hidden w-[92px] shrink-0 border-r border-white/[0.08] bg-black/72 lg:block">
    <div className="flex h-full flex-col items-center gap-4 overflow-y-auto py-6 no-scrollbar">
      {MARKET_RAIL.map((item) => {
        const Icon = item.icon;
        return (
          <motion.button
            key={item.label}
            className={`grid h-[54px] w-[54px] place-items-center rounded-xl border transition-all ${
              item.active
                ? 'border-[#E5C767] bg-[#E5C767]/10 text-[#E5C767] shadow-[0_0_24px_rgba(229,199,103,0.18)]'
                : 'border-transparent text-white/58 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-[#E5C767]'
            }`}
            animate={item.active ? { boxShadow: ['0 0 12px rgba(229,199,103,0.15)', '0 0 30px rgba(229,199,103,0.34)', '0 0 12px rgba(229,199,103,0.15)'] } : {}}
            transition={item.active ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
            whileHover={{ y: -2, scale: 1.04 }}
            title={item.label}
          >
            <Icon size={22} />
          </motion.button>
        );
      })}
    </div>
  </nav>
));

// ═══════ FEATURED STUDIO STAGE ═══════
const FeaturedStudioStage: React.FC<{
  items: Solution[];
  lang: Language;
  activeIndex: number;
  onNavigate: (target: string) => void;
  onOpenFilters: (e: React.MouseEvent) => void;
  onSelectBanner: (e: React.MouseEvent, index: number) => void;
  activeFilterCount: number;
}> = React.memo(({ items, lang, activeIndex, onNavigate, onOpenFilters, onSelectBanner, activeFilterCount }) => {
  const stageItems = items.slice(0, 5);
  const stageIndex = stageItems.length > 0 ? activeIndex % stageItems.length : 0;
  const spotlight = stageItems.length > 0 ? stageItems[stageIndex] : undefined;
  const sideItems = spotlight ? [...stageItems.slice(stageIndex + 1), ...stageItems.slice(0, stageIndex)].slice(0, 4) : [];
  const heroImage = spotlight?.imageUrl;
  const spotlightName = spotlight?.name[lang] || spotlight?.name.en || 'Đang tải studio';
  const spotlightDesc = spotlight?.description[lang] || spotlight?.description.en || 'Marketplace sẽ tự lấy danh sách app thật từ hệ thống và chọn ngẫu nhiên mỗi lần tải trang.';
  const spotlightCategory = spotlight?.category[lang] || spotlight?.category.en || 'Apps';
  const spotlightPrice = spotlight ? (spotlight.priceCredits ? `${spotlight.priceCredits} CR` : spotlight.isFree ? 'Free' : spotlight.priceReference || 'Freemium') : 'Loading';
  const spotlightMeta = spotlight?.models?.slice(0, 2).join(' / ') || spotlight?.tags?.slice(0, 2).join(' / ') || 'Studio';
  const spotlightInitial = spotlightName.trim().charAt(0).toUpperCase() || 'S';
  const heroDotCount = stageItems.length;
  const changeStage = (e: React.MouseEvent, offset: number) => {
    e.stopPropagation();
    if (heroDotCount <= 1) return;
    onSelectBanner(e, (stageIndex + offset + heroDotCount) % heroDotCount);
  };

  return (
    <motion.section
      key={activeIndex}
      className="relative overflow-hidden border-b border-white/[0.06] bg-[#050505]"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_4%,rgba(229,199,103,0.24),transparent_31%),radial-gradient(circle_at_57%_73%,rgba(229,199,103,0.13),transparent_38%),linear-gradient(90deg,#050505_0%,#080807_36%,#11100b_100%)]" />
      <div className="absolute inset-0 opacity-[0.16] bg-[radial-gradient(circle_at_center,rgba(229,199,103,0.34)_1px,transparent_1.5px)] bg-[size:18px_18px]" />
      <div className="absolute right-0 top-0 h-[78%] w-[68%] bg-[radial-gradient(ellipse_at_center,rgba(229,199,103,0.18),transparent_68%)]" />
      {HERO_WAVES.map((wave, index) => (
        <motion.div
          key={wave}
          className={`absolute rounded-[50%] bg-[radial-gradient(circle,rgba(229,199,103,0.55)_1px,transparent_1.9px)] bg-[size:9px_9px] [mask-image:radial-gradient(ellipse_at_center,black_0%,black_42%,transparent_72%)] ${wave}`}
          animate={{ x: [0, index % 2 === 0 ? -18 : 14, 0], y: [0, index % 2 === 0 ? 8 : -7, 0] }}
          transition={{ duration: 10 + index * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <motion.div
        className="absolute right-[-6%] top-[18%] h-px w-[70%] bg-gradient-to-r from-transparent via-[#E5C767]/70 to-transparent"
        animate={{ opacity: [0.18, 0.72, 0.18], x: [-30, 20, -30] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {HERO_SPARKS.map((spark, index) => (
        <motion.span
          key={spark}
          className={`absolute h-1 w-1 rounded-full bg-[#E5C767] shadow-[0_0_12px_rgba(229,199,103,0.9)] ${spark}`}
          animate={{ opacity: [0.18, 0.95, 0.18], scale: [0.75, 1.45, 0.75], y: [0, index % 2 === 0 ? -8 : 8, 0] }}
          transition={{ duration: 2.8 + index * 0.23, repeat: Infinity, ease: 'easeInOut', delay: index * 0.11 }}
        />
      ))}

      <div className="relative z-10 grid min-h-[374px] grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[0.74fr_1.26fr] md:px-8 xl:px-11">
        <div className="flex flex-col justify-center">
          <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.26em] text-[#E5C767]">Featured Studio</div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[42px] font-semibold leading-none text-white md:text-[50px]">{spotlightName}</h1>
            <span className="rounded-md border border-[#E5C767]/65 bg-black/45 px-2.5 py-1 text-[10px] font-bold text-[#E5C767]">
              {spotlight?.isFree ? 'FREE' : 'PRO'}
            </span>
          </div>
          <p className="mt-5 max-w-[360px] text-[15px] leading-6 text-white/70">
            {spotlightDesc}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-[13px] text-white/55">
            <span className="flex items-center gap-1.5 font-semibold text-[#E5C767]"><Zap size={15} fill="currentColor" /> {spotlightPrice}</span>
            <span>{spotlightMeta}</span>
            <span className="h-1 w-1 rounded-full bg-white/35" />
            <span>{spotlightCategory}</span>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => spotlight && onNavigate(spotlight.slug)}
              disabled={!spotlight}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#E5C767] bg-[#E5C767]/10 px-5 text-[13px] font-medium text-[#E5C767] shadow-[0_0_24px_rgba(229,199,103,0.12)] transition-all hover:bg-[#E5C767] hover:text-black disabled:pointer-events-none disabled:opacity-50"
            >
              <Eye size={16} /> Preview Studio
            </button>
            <button
              onClick={onOpenFilters}
              className="lg:hidden inline-flex h-11 items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 text-[12px] font-semibold text-white/78 transition-all hover:border-[#E5C767]/45 hover:text-[#E5C767]"
            >
              <SlidersHorizontal size={15} /> Filters
              {activeFilterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#E5C767] px-1 text-[10px] text-black">{activeFilterCount}</span>}
            </button>
            <button className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.18] bg-black/20 text-white/78 transition-colors hover:border-[#E5C767]/55 hover:text-[#E5C767]">
              <BookmarkPlus size={18} />
            </button>
          </div>
        </div>

        <div className="relative min-h-[318px] overflow-hidden">
          <button
            onClick={(e) => changeStage(e, -1)}
            disabled={heroDotCount <= 1}
            className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white/80 backdrop-blur-xl transition-colors hover:border-[#E5C767]/55 hover:text-[#E5C767] disabled:pointer-events-none disabled:opacity-30 md:grid"
          >
            <ChevronLeft size={21} />
          </button>
          <button
            onClick={(e) => changeStage(e, 1)}
            disabled={heroDotCount <= 1}
            className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white/80 backdrop-blur-xl transition-colors hover:border-[#E5C767]/55 hover:text-[#E5C767] disabled:pointer-events-none disabled:opacity-30 md:grid"
          >
            <ChevronRight size={21} />
          </button>

          <motion.div
            className="absolute bottom-[-8px] left-[6%] right-[6%] h-[112px] rounded-[50%] border border-[#E5C767]/55 bg-[radial-gradient(ellipse_at_center,rgba(229,199,103,0.28),rgba(0,0,0,0.18)_42%,transparent_74%)] shadow-[0_0_42px_rgba(229,199,103,0.30)]"
            animate={{ opacity: [0.72, 1, 0.72], scaleX: [0.98, 1.03, 0.98] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[24px] left-[13%] right-[13%] h-[54px] rounded-[50%] border-t border-[#E5C767]/90 shadow-[0_-12px_24px_rgba(229,199,103,0.42)]"
            animate={{ opacity: [0.55, 1, 0.55], y: [0, -2, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute bottom-[58px] left-[19%] right-[19%] h-px bg-gradient-to-r from-transparent via-[#E5C767] to-transparent shadow-[0_0_18px_rgba(229,199,103,0.85)]" />
          <div className="absolute bottom-[12px] left-[19%] right-[19%] h-[16px] rounded-[50%] border-b border-white/10 bg-black/70 shadow-[0_18px_42px_rgba(0,0,0,0.65)]" />

          {sideItems.map((item, index) => {
            const Icon = getStageIcon(item);
            const itemName = item.name[lang] || item.name.en;
            const itemCategory = item.category[lang] || item.category.en;
            const positions = [
              'left-[10%] top-[24%] rotate-[-6deg] opacity-70',
              'left-[27%] top-[21%] rotate-[-3deg] opacity-85',
              'right-[20%] top-[21%] rotate-[4deg] opacity-85',
              'right-[5%] top-[26%] rotate-[7deg] opacity-70',
            ];
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.slug)}
                className={`absolute hidden h-[188px] w-[116px] overflow-hidden rounded-lg border border-white/18 bg-[#111]/80 p-3 text-center shadow-[0_24px_54px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all hover:border-[#E5C767]/55 sm:block ${positions[index]}`}
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{ opacity: [0.68, 0.94, 0.68], y: [0, -8, 0], scale: 1 }}
                transition={{ opacity: { duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }, y: { duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }, scale: { delay: index * 0.12, duration: 0.45 } }}
              >
                <img src={item.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-white/10" />
                <div className="relative z-10 mt-1 line-clamp-2 text-[12px] font-medium leading-4 text-white">{itemName}</div>
                <div className="relative z-10 mt-10 inline-grid h-9 w-9 place-items-center rounded-full border border-[#E5C767]/30 bg-[#E5C767]/10 text-[#E5C767]">
                  <Icon size={17} />
                </div>
                <div className="relative z-10 mt-6 text-[9px] text-white/55">{itemCategory}</div>
              </motion.button>
            );
          })}

          <motion.button
            onClick={() => spotlight && onNavigate(spotlight.slug)}
            disabled={!spotlight}
            className="absolute left-[50%] top-[8%] z-10 ml-[-107px] h-[288px] w-[214px] overflow-hidden rounded-xl border border-[#E5C767] bg-[#1a1712] shadow-[0_0_34px_rgba(229,199,103,0.34),0_34px_80px_rgba(0,0,0,0.55)]"
            animate={{ y: [0, -8, 0], boxShadow: ['0 0 24px rgba(229,199,103,0.25),0 34px 80px rgba(0,0,0,0.55)', '0 0 46px rgba(229,199,103,0.48),0 34px 80px rgba(0,0,0,0.55)', '0 0 24px rgba(229,199,103,0.25),0 34px 80px rgba(0,0,0,0.55)'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {heroImage && <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" loading="eager" />}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_30%,rgba(229,199,103,0.36),transparent_32%),linear-gradient(to_top,rgba(0,0,0,0.68),rgba(0,0,0,0.08))]" />
            <motion.div
              className="absolute inset-x-[-35%] top-[34%] h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
              animate={{ x: ['-35%', '35%', '-35%'], opacity: [0.15, 0.55, 0.15] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-x-0 top-5 px-4 text-center text-[20px] font-light text-white">{spotlightName}</div>
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-[118px] font-semibold leading-none text-[#E5C767]/70 drop-shadow-[0_8px_24px_rgba(229,199,103,0.38)]">{spotlightInitial}</span>
            </div>
          </motion.button>

          {heroDotCount > 1 && (
            <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-3">
              {Array.from({ length: heroDotCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => onSelectBanner(e, i)}
                  className={`h-2 w-2 rounded-full transition-all ${i === stageIndex ? 'bg-[#E5C767] shadow-[0_0_12px_rgba(229,199,103,0.8)]' : 'bg-white/25 hover:bg-white/55'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
});

// ═══════ PRODUCT CARD (GRID) ═══════
const ProductCardGrid: React.FC<{
  sol: Solution; lang: Language; onNavigate: (slug: string) => void;
  isFav: boolean; onToggleFav: (e: React.MouseEvent, id: string) => void;
  onPreview?: (e: React.MouseEvent, sol: Solution) => void;
  isCompare?: boolean; onToggleCompare?: (e: React.MouseEvent, id: string) => void;
  isSpotlight?: boolean;
}> = React.memo(({ sol, lang, onNavigate, isFav, onToggleFav, onPreview, isCompare, onToggleCompare, isSpotlight }) => {
  const category = sol.category[lang] || sol.category.en;
  const rating = sol.featured || isSpotlight ? '4.9' : sol.isFree ? '4.8' : '4.7';
  return (
    <div
      className={`relative flex h-[292px] cursor-pointer flex-col overflow-hidden rounded-[8px] border bg-[#0F1010] transition-all group shadow-[0_18px_44px_rgba(0,0,0,0.34)] ${
        isCompare
          ? 'border-[#E5C767] ring-2 ring-[#E5C767]/10'
          : isSpotlight
            ? 'border-[#E5C767]/90 shadow-[0_0_28px_rgba(229,199,103,0.15)]'
            : 'border-[#2B2F2F] hover:-translate-y-1 hover:border-[#E5C767]/45'
      }`}
      onClick={() => { saveRecentlyViewed(sol); onNavigate(sol.slug); }}>
      <div className="pointer-events-none absolute inset-0 rounded-[8px] bg-gradient-to-br from-white/[0.025] via-transparent to-[#E5C767]/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative h-[148px] shrink-0 overflow-hidden">
        <img src={sol.imageUrl} alt={sol.name[lang]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className={`absolute inset-0 bg-gradient-to-t ${getSolutionAccent(sol)}`} />
        <div className="absolute inset-x-0 bottom-0 h-[74px] bg-gradient-to-t from-[#0F1010] via-[#0F1010]/68 to-transparent" />
        {isSpotlight && (
          <span className="absolute left-[9px] top-[9px] rounded-md border border-[#E5C767]/60 bg-[#8A6A18]/85 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
            Top Rated
          </span>
        )}
        <div className="absolute right-[8px] top-[8px] flex gap-[5px]">
          {onPreview && <button onClick={(e) => onPreview(e, sol)} className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/58 text-white/85 backdrop-blur-md transition-colors hover:border-[#E5C767]/55 hover:text-[#E5C767]" title="Xem nhanh"><Eye size={12} /></button>}
          {onToggleCompare && <button onClick={(e) => onToggleCompare(e, sol.id)} className={`grid h-7 w-7 place-items-center rounded-[7px] border backdrop-blur-md transition-colors ${isCompare ? 'border-[#E5C767] bg-[#E5C767] text-black' : 'border-white/15 bg-black/58 text-white/75 hover:border-[#E5C767]/55 hover:text-[#E5C767]'}`} title="So sánh"><GitCompare size={12} /></button>}
          <button onClick={(e) => onToggleFav(e, sol.id)} className={`grid h-7 w-7 place-items-center rounded-[7px] border backdrop-blur-md transition-all ${isFav ? 'border-[#E5C767]/50 bg-[#E5C767]/20 text-[#E5C767]' : 'border-white/15 bg-black/58 text-white/70 hover:text-[#E5C767]'}`}>
            {isFav ? <Bookmark size={12} fill="currentColor" /> : <BookmarkPlus size={12} />}
          </button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col px-[12px] pb-[10px] pt-[12px]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[13px] font-medium leading-[16px] text-white transition-colors group-hover:text-[#E5C767]">{sol.name[lang]}</h3>
            <p className="mt-[2px] truncate text-[10px] leading-[13px] text-white/62">{category}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 pt-px text-[11px] font-medium text-[#E5C767]">
            <Star size={12} fill="currentColor" /> {rating}
          </span>
        </div>
        <p className="mt-[8px] line-clamp-2 min-h-[32px] text-[10px] leading-[16px] text-white/56">{sol.description[lang]}</p>
        <div className="mt-auto flex h-7 items-center justify-between gap-2 pt-0">
          <div className="min-w-0 text-[10px] text-white/55">
            {sol.priceCredits ? (
              <span className="flex items-center gap-1 truncate text-[#E5C767]"><Zap size={10} fill="currentColor" /> {sol.priceCredits} CR</span>
            ) : sol.isFree ? (
              <span className="truncate">Free</span>
            ) : (
              <span className="truncate">Freemium</span>
            )}
          </div>
          <button onClick={(e) => onPreview?.(e, sol)} className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-[#E5C767]/45 bg-[#E5C767]/10 px-2.5 text-[10px] font-medium text-[#E5C767] transition-colors hover:bg-[#E5C767] hover:text-black">
            <Eye size={11} /> Preview
          </button>
          <button onClick={(e) => onToggleCompare?.(e, sol.id)} className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border ${isCompare ? 'border-[#E5C767] bg-[#E5C767] text-black' : 'border-white/15 text-white/35 hover:border-[#E5C767]/45 hover:text-[#E5C767]'}`}>
            <Check size={12} />
          </button>
        </div>
      </div>
    </div>
  );
});

const ProductCardSkeleton: React.FC = React.memo(() => (
  <div className="h-[292px] overflow-hidden rounded-[8px] border border-[#2B2F2F] bg-[#0F1010]">
    <div className="h-[148px] animate-pulse bg-white/[0.06]" />
    <div className="space-y-2 px-3 pb-3 pt-3">
      <div className="h-4 w-2/3 rounded bg-white/[0.08]" />
      <div className="h-3 w-1/3 rounded bg-white/[0.06]" />
      <div className="pt-2 space-y-1.5">
        <div className="h-3 w-full rounded bg-white/[0.06]" />
        <div className="h-3 w-4/5 rounded bg-white/[0.06]" />
      </div>
      <div className="flex items-center justify-between pt-6">
        <div className="h-3 w-12 rounded bg-[#E5C767]/18" />
        <div className="h-7 w-20 rounded-md bg-[#E5C767]/12" />
        <div className="h-7 w-7 rounded-md bg-white/[0.06]" />
      </div>
    </div>
  </div>
));

// ═══════ PRODUCT CARD (LIST) ═══════
const ProductCardList: React.FC<{
  sol: Solution; lang: Language; onNavigate: (slug: string) => void;
  isFav: boolean; onToggleFav: (e: React.MouseEvent, id: string) => void;
  onPreview?: (e: React.MouseEvent, sol: Solution) => void;
  isCompare?: boolean; onToggleCompare?: (e: React.MouseEvent, id: string) => void;
}> = React.memo(({ sol, lang, onNavigate, isFav, onToggleFav, onPreview, isCompare, onToggleCompare }) => {
  const models = sol.models?.slice(0, 2) || [];
  return (
    <div className={`flex cursor-pointer overflow-hidden rounded-lg border bg-[#111111] transition-all group shadow-[0_16px_42px_rgba(0,0,0,0.18)] ${isCompare ? 'border-brand-blue/45 ring-2 ring-brand-blue/10' : 'border-white/[0.06] hover:border-brand-blue/28'}`}
      onClick={() => { saveRecentlyViewed(sol); onNavigate(sol.slug); }}>
      <div className="relative w-[180px] shrink-0 overflow-hidden">
        <img src={sol.imageUrl} alt={sol.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className={`absolute inset-0 bg-gradient-to-r ${getSolutionAccent(sol)}`} />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {sol.isFree && <span className="w-fit rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[9px] font-bold text-black">FREE</span>}
          {sol.featured && <span className="flex w-fit items-center gap-0.5 rounded-md bg-brand-blue px-1.5 py-0.5 text-[9px] font-bold text-black"><Sparkles size={8} fill="currentColor" /> Hot</span>}
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-bold text-white group-hover:text-brand-blue transition-colors truncate">{sol.name[lang]}</h3>
            <div className="flex items-center gap-1 shrink-0">
                {onPreview && <button onClick={(e) => onPreview(e, sol)} className="rounded-md p-1 text-white/35 transition-colors hover:bg-white/[0.04] hover:text-brand-blue" title="Xem nhanh"><Eye size={14} /></button>}
                {onToggleCompare && <button onClick={(e) => onToggleCompare(e, sol.id)} className={`rounded-md p-1 transition-colors hover:bg-white/[0.04] ${isCompare ? 'text-brand-blue' : 'text-white/35 hover:text-brand-blue'}`} title="So sánh"><GitCompare size={14} /></button>}
              <button onClick={(e) => onToggleFav(e, sol.id)} className={`rounded-md p-1 transition-all hover:bg-white/[0.04] ${isFav ? 'text-brand-blue' : 'text-white/35 hover:text-brand-blue'}`}>
                {isFav ? <Bookmark size={14} fill="currentColor" /> : <BookmarkPlus size={14} />}
              </button>
            </div>
          </div>
          <p className="text-[12px] text-white/45 line-clamp-2 mt-1 leading-relaxed">{sol.description[lang]}</p>
          {/* Models badges */}
          {models.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {models.map(m => (
                <span key={m} className="rounded-md border border-white/[0.05] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[8px] text-white/42">{m}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-brand-blue/20 bg-brand-blue/[0.1] px-1.5 py-0.5 text-[9px] font-medium text-brand-blue">{sol.category[lang]}</span>
            {sol.complexity && <span className="rounded-md border border-white/[0.05] bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-white/40">{sol.complexity}</span>}
            {sol.priceCredits ? (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-brand-blue"><Zap size={10} fill="currentColor" /> {sol.priceCredits} CR</span>
            ) : sol.isFree ? (
              <span className="text-[10px] font-semibold text-emerald-500">Miễn phí</span>
            ) : null}
          </div>
          <span className="flex items-center gap-1 text-[12px] font-medium text-brand-blue">Thử ngay <ArrowRight size={12} /></span>
        </div>
      </div>
    </div>
  );
});

// ═══════ QUICK PREVIEW MODAL ═══════
const QuickPreviewModal: React.FC<{ sol: Solution; lang: Language; onClose: () => void; onNavigate: (slug: string) => void }> = ({ sol, lang, onClose, onNavigate }) => {
  // ESC key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[600]" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[601] w-[90vw] max-w-[560px] bg-neutral-900 rounded-2xl border border-neutral-700/40 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
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
            <h2 className="text-lg font-bold text-neutral-100">{sol.name[lang]}</h2>
            <p className="text-[12px] text-neutral-400 mt-1">{sol.description[lang]}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-neutral-400">
            <span className="px-2 py-0.5 bg-brand-blue/[0.06] text-brand-blue rounded text-[10px] font-medium border border-brand-blue/10">{sol.category[lang]}</span>
            {sol.priceCredits ? (
              <span className="px-2 py-0.5 bg-orange-500/[0.08] text-orange-600 rounded text-[10px] font-semibold border border-orange-500/20 flex items-center gap-1"><Zap size={10} fill="currentColor" /> {sol.priceCredits} CR</span>
            ) : sol.isFree ? (
              <span className="px-2 py-0.5 bg-emerald-500/[0.08] text-emerald-600 rounded text-[10px] font-semibold border border-emerald-500/20">Miễn phí</span>
            ) : null}
          </div>
          {/* Models */}
          {sol.models && sol.models.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">AI Models</h4>
              <div className="flex flex-wrap gap-1.5">
                {sol.models.map(m => (
                  <span key={m} className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded-lg text-[10px] font-mono border border-neutral-700/40">{m}</span>
                ))}
              </div>
            </div>
          )}
          {/* Neural Stack */}
          {sol.neuralStack && sol.neuralStack.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Neural Stack</h4>
              <div className="space-y-1.5">
                {sol.neuralStack.map((ns, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="px-1.5 py-0.5 bg-brand-blue/[0.08] text-brand-blue rounded font-mono text-[9px] border border-brand-blue/10">{ns.name}</span>
                    <span className="text-neutral-400">{ns.version}</span>
                    <span className="text-neutral-500">· {ns.capability[lang] || ns.capability.en}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sol.features && sol.features.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Tính năng</h4>
              <div className="space-y-1.5">
                {sol.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-neutral-300">
                    <Check size={12} className="text-emerald-500 shrink-0" />
                    {typeof f === 'string' ? f : (f as { [key in Language]: string })[lang] || (f as { en: string }).en}
                  </div>
                ))}
              </div>
            </div>
          )}
          {sol.tags && sol.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sol.tags.map(t => <span key={t} className="px-2 py-1 bg-neutral-800 text-neutral-400 rounded-lg text-[10px] font-medium border border-neutral-700/40">{t}</span>)}
            </div>
          )}
          {sol.priceCredits && <p className="text-[12px] text-neutral-500"><Zap size={12} className="inline text-orange-500 mr-1" />{sol.priceCredits} Credits / lượt</p>}
        </div>
        <div className="p-4 border-t border-neutral-700/40 shrink-0">
          <button onClick={() => { onClose(); onNavigate(sol.slug); }}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-blue text-white text-[13px] font-semibold hover:brightness-110 active:scale-[0.98] transition-all">
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
      className="fixed bottom-0 left-0 right-0 z-[500] bg-neutral-900 border-t border-neutral-700/40 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      <div className="max-w-[1500px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
	            <GitCompare size={14} className="text-brand-blue" />
	            <span className="text-[12px] font-bold text-neutral-200">So sánh ({items.length}/4)</span>
          </div>
          <button onClick={onClear} className="text-[11px] font-medium text-neutral-400 hover:text-rose-500 transition-colors">Xoá tất cả</button>
        </div>
	        <div className="grid grid-cols-4 gap-4">
	          {[0, 1, 2, 3].map(i => {
            const sol = items[i];
            if (!sol) return <div key={i} className="h-[80px] border-2 border-dashed border-neutral-700/40 flex items-center justify-center text-[11px] text-neutral-500">Chọn để so sánh</div>;
            return (
              <div key={sol.id} className="relative p-3 bg-neutral-800 border border-neutral-700/40 flex gap-3">
                <button onClick={() => onRemove(sol.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm"><X size={10} /></button>
                <img src={sol.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-neutral-200 truncate">{sol.name[lang]}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{sol.category[lang]}{sol.complexity ? ` · ${sol.complexity}` : ''}</p>
                  <div className="flex gap-2 mt-1 text-[10px]">
                    {sol.priceCredits ? (
                      <span className="text-orange-500 font-semibold"><Zap size={9} className="inline" fill="currentColor" /> {sol.priceCredits} CR</span>
                    ) : sol.isFree ? (
                      <span className="text-emerald-500 font-semibold">Miễn phí</span>
                    ) : null}
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

  const [promoIndex, setPromoIndex] = useState(0);
  const didMountRef = useRef(false);

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    document.documentElement.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, []);

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [featuredSolutions, setFeaturedSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridSettling, setGridSettling] = useState(false);
  const heroStageItems = useMemo(() => (featuredSolutions.length > 0 ? featuredSolutions : solutions).slice(0, 5), [featuredSolutions, solutions]);
  const heroCycleCount = heroStageItems.length;

  // Auto-slide every 6s
  useEffect(() => {
    if (heroCycleCount <= 1) return;
    const timer = setInterval(() => setPromoIndex(i => i + 1), 6000);
    return () => clearInterval(timer);
  }, [heroCycleCount]);

  // URL-BASED FILTERS — init from URL params
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>((searchParams.get('view') as 'grid' | 'list') || 'grid');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showBackTop, setShowBackTop] = useState(false);
  const marketScrollRef = useRef<HTMLDivElement>(null);

  // PREVIEW & COMPARE states
  const [previewSol, setPreviewSol] = useState<Solution | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  // Categories chia 2 group: "Tạo nội dung" expand mặc định, "Khác" collapse mặc định.
  // Persist state vào localStorage để user mở app lần sau giữ thói quen.
  const [contentGroupOpen, setContentGroupOpen] = useState<boolean>(() => {
    try { const v = localStorage.getItem(CAT_CONTENT_OPEN_KEY); return v === null ? true : v === '1'; } catch { return true; }
  });
  const [otherGroupOpen, setOtherGroupOpen] = useState<boolean>(() => {
    try { return localStorage.getItem(CAT_OTHER_OPEN_KEY) === '1'; } catch { return false; }
  });
  useEffect(() => { try { localStorage.setItem(CAT_CONTENT_OPEN_KEY, contentGroupOpen ? '1' : '0'); } catch {} }, [contentGroupOpen]);
  useEffect(() => { try { localStorage.setItem(CAT_OTHER_OPEN_KEY, otherGroupOpen ? '1' : '0'); } catch {} }, [otherGroupOpen]);
  // Auto-open nhóm chứa active category (cho UX khi user vào deep-link URL hoặc click extra cat)
  useEffect(() => {
    if (activeCategory === 'ALL') return;
    if (CONTENT_CATEGORY_KEYS.has(activeCategory)) setContentGroupOpen(true);
    else setOtherGroupOpen(true);
  }, [activeCategory]);

  // Quick path hero — show for new users who haven't searched/filtered
  const [quickPathDismissed, setQuickPathDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem(QUICKPATH_DISMISSED_KEY) === '1'; } catch { return false; }
  });
  const dismissQuickPath = useCallback(() => {
    setQuickPathDismissed(true);
    try { localStorage.setItem(QUICKPATH_DISMISSED_KEY, '1'); } catch {}
  }, []);

  // Advanced filters collapse — auto-open if user has any advanced filter active (e.g. arrived via URL)
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(() => {
    // Auto-open if URL has advanced filter
    if (searchParams.get('complexity') || searchParams.get('tags') || (searchParams.get('platform') && searchParams.get('platform') !== 'ALL')) return true;
    try { return localStorage.getItem(ADVANCED_FILTERS_OPEN_KEY) === '1'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(ADVANCED_FILTERS_OPEN_KEY, advancedOpen ? '1' : '0'); } catch {}
  }, [advancedOpen]);

  // SYNC filters → URL (non-search filters sync immediately)
  useEffect(() => {
    setSearchParams(prev => {
      const params = new URLSearchParams();
      // q is synced separately with debounce — preserve the current value here
      const currentQ = prev.get('q');
      if (currentQ) params.set('q', currentQ);
      if (activeCategory !== 'ALL') params.set('category', activeCategory);
      if (sortBy !== 'newest') params.set('sort', sortBy);
      if (showFreeOnly) params.set('free', 'true');
      if (showFeaturedOnly) params.set('featured', 'true');
      if (activeComplexity) params.set('complexity', activeComplexity);
      if (activeTags.length > 0) params.set('tags', activeTags.join(','));
      if (activePlatform !== 'ALL') params.set('platform', activePlatform);
      if (viewMode !== 'grid') params.set('view', viewMode);
      return params;
    }, { replace: true });
  }, [activeCategory, sortBy, showFreeOnly, showFeaturedOnly, activeComplexity, activeTags, activePlatform, viewMode]);

  // SYNC search query → URL with 400ms debounce to avoid jitter on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (inputValue) next.set('q', inputValue);
        else next.delete('q');
        return next;
      }, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Ctrl+K or Cmd+K → focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Don't trigger shortcuts when typing in input / contenteditable
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable) return;
      // G → toggle grid/list
      if (e.key === 'g' || e.key === 'G') setViewMode(v => v === 'grid' ? 'list' : 'grid');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Back to top — throttle bằng rAF + so sánh trước setState để bỏ qua tick không đổi
  // (trước đây setShowBackTop chạy mọi tick scroll → trigger re-render thừa → cards giật lúc scroll)
  useEffect(() => {
    const scrollEl = marketScrollRef.current;
    if (!scrollEl) return;
    let ticking = false;
    let last = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = scrollEl.scrollTop > 600;
        if (next !== last) {
          last = next;
          setShowBackTop(next);
        }
        ticking = false;
      });
    };
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, []);

  // SCROLL RESTORATION
  useEffect(() => {
    const scrollEl = marketScrollRef.current;
    const saved = sessionStorage.getItem(SCROLL_POS_KEY);
    if (saved && scrollEl) {
      const pos = parseInt(saved, 10);
      if (!isNaN(pos)) {
        requestAnimationFrame(() => scrollEl.scrollTo({ top: pos, behavior: 'instant' as ScrollBehavior }));
      }
      sessionStorage.removeItem(SCROLL_POS_KEY);
    }
    return () => {
      sessionStorage.setItem(SCROLL_POS_KEY, String(marketScrollRef.current?.scrollTop ?? 0));
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [solRes, featRes] = await Promise.all([
          marketApi.getSolutions({ lang: currentLang }),
          marketApi.getRandomFeatured()
        ]);
        const nextSolutions = solRes?.data?.filter((s: Solution) => s.isActive !== false && s.id && s.slug) || [];
        const nextFeatured = featRes?.data?.filter((s: Solution) => s.isActive !== false && s.id && s.slug) || [];
        const nextCatalog = nextSolutions.length > 0 ? [...nextSolutions].reverse() : nextFeatured;
        const showcaseSource = nextSolutions.length > 0 ? nextSolutions : nextFeatured;
        setSolutions(nextCatalog);
        setFeaturedSolutions(pickRandomSolutions(showcaseSource, 5));
        setPromoIndex(0);
      } catch (err) {
        console.error('Markets fetch:', err);
        setSolutions([]);
        setFeaturedSolutions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentLang]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setGridSettling(true);
    const timer = setTimeout(() => setGridSettling(false), 140);
    return () => clearTimeout(timer);
  }, [deferredSearch, activeCategory, sortBy, showFreeOnly, showFeaturedOnly, activeComplexity, activeTags, activePlatform]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('skyverses_favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch {
      localStorage.removeItem('skyverses_favorites');
    }
  }, []);

  // Reset pagination when filters change
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [deferredSearch, activeCategory, sortBy, showFreeOnly, showFeaturedOnly, activeComplexity, activeTags, activePlatform]);

  const toggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setFavorites(prev => {
      const n = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      saveFavoritesDebounced(n);
      return n;
    });
  }, []);

  const handleNavigate = useCallback((slug: string) => {
    navigate(`/product/${slug}`);
  }, [navigate]);

  // Quick path: set category + smooth scroll to grid (delay để đợi render xong)
  const handleQuickPath = useCallback((cat: string) => {
    setActiveCategory(cat);
    setInputValue('');
    requestAnimationFrame(() => {
      const el = document.getElementById(GRID_ANCHOR_ID);
      const scrollEl = marketScrollRef.current;
      if (el && scrollEl) {
        const offset = 100; // chừa header sticky
        const top = el.offsetTop - offset;
        scrollEl.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }, []);

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
      const q = deferredSearch.trim().toLowerCase();
      const matchSearch = !q ||
        sol.name[currentLang]?.toLowerCase().includes(q) ||
        sol.description[currentLang]?.toLowerCase().includes(q) ||
        sol.tags?.some(t => t.toLowerCase().includes(q));
      const catKey = activeCategory.trim().toLowerCase();
      const matchCat = activeCategory === 'ALL' ||
        (activeCategory === 'Sky Partners'
          ? sol.tags?.some(t => t === 'Sky Partners')
          : (
              sol.category[currentLang]?.trim().toLowerCase().includes(catKey) ||
              sol.category.en?.trim().toLowerCase().includes(catKey) ||
              sol.tags?.some(t => t.trim().toLowerCase().includes(catKey)) ||
              sol.demoType?.trim().toLowerCase() === catKey
            )
        );
      const matchFree = !showFreeOnly || sol.isFree;
      const matchFeatured = !showFeaturedOnly || sol.featured;
      const matchComplexity = !activeComplexity || sol.complexity === activeComplexity;
      const matchTags = activeTags.length === 0 || activeTags.every(at => sol.tags?.some(st => st.toLowerCase() === at.toLowerCase()));
      const matchPlatform = activePlatform === 'ALL' || !sol.platforms || sol.platforms.length === 0 || sol.platforms.includes(activePlatform);
      return matchSearch && matchCat && matchFree && matchFeatured && matchComplexity && matchTags && matchPlatform;
    });
    // Khi user đang search → auto sort theo relevance, bỏ qua sortBy
    if (deferredSearch.trim()) {
      filtered = filtered
        .map(sol => ({ sol, score: getRelevanceScore(sol, deferredSearch.trim(), currentLang) }))
        .sort((a, b) => b.score - a.score)
        .map(({ sol }) => sol);
    } else if (sortBy === 'popular') {
      // featured products lên trước, còn lại giữ nguyên thứ tự newest-first
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    // sortBy === 'newest' → solutions đã reverse khi fetch nên giữ nguyên thứ tự
    return filtered;
  }, [solutions, deferredSearch, activeCategory, sortBy, showFreeOnly, showFeaturedOnly, activeComplexity, activeTags, currentLang, activePlatform]);

  const paginatedSolutions = useMemo(() => filteredSolutions.slice(0, visibleCount), [filteredSolutions, visibleCount]);
  const hasMore = visibleCount < filteredSolutions.length;

  // Auto-load infinite scroll — IntersectionObserver pre-load 300px trước khi sentinel vào viewport
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore) return;
    const el = loadMoreRef.current;
    const root = marketScrollRef.current;
    if (!el || !root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredSolutions.length));
        }
      },
      { root, rootMargin: '120px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, filteredSolutions.length]);

  const activeFilterCount = [showFreeOnly, showFeaturedOnly, !!activeComplexity, activeCategory !== 'ALL', activeTags.length > 0, activePlatform !== 'ALL', !!inputValue].filter(Boolean).length;

  const resetFilters = useCallback(() => {
    setActiveCategory('ALL');
    setShowFreeOnly(false);
    setShowFeaturedOnly(false);
    setActiveComplexity(null);
    setActiveTags([]);
    setActivePlatform('ALL');
    setInputValue('');
    setSortBy('popular');
  }, []);

  // PREVIEW handler
  const handlePreview = useCallback((e: React.MouseEvent, sol: Solution) => {
    e.preventDefault(); e.stopPropagation();
    setPreviewSol(sol);
  }, []);

  // COMPARE handler
  const toggleCompare = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
	      if (prev.length >= 4) return prev; // max 4
      return [...prev, id];
    });
  }, []);
  const favoriteIdSet = useMemo(() => new Set(favorites), [favorites]);
  const compareIdSet = useMemo(() => new Set(compareIds), [compareIds]);
  const solutionById = useMemo(() => new Map(solutions.map(sol => [sol.id, sol])), [solutions]);
  const compareSolutions = useMemo(() => compareIds.map(id => solutionById.get(id)).filter(Boolean) as Solution[], [compareIds, solutionById]);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    FILTER_MENU.forEach(item => {
      counts.set(item.key, solutions.filter(sol => matchesMenuCategory(sol, item.key, currentLang)).length);
    });
    return counts;
  }, [solutions, currentLang]);

  // ═══════ SIDEBAR ═══════
  // ⚡ JSX biến (KHÔNG phải component) — tránh tạo new component identity mỗi render
  // (vd khi gõ search → MarketsPage re-render → trước đây <SidebarContent /> bị unmount/remount,
  // input mất focus + value reset → cảm giác giật lag).
  const sidebarContent = (
    <div className="space-y-6 px-4 py-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-medium text-white">Filters</h2>
        <button onClick={resetFilters} className="text-[10px] font-medium text-white/45 transition-colors hover:text-[#E5C767]">
          Clear all
        </button>
      </div>

      <section>
        <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-white/46">Category</p>
        <div className="space-y-2">
          {FILTER_MENU.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.key;
            const count = categoryCounts.get(item.key) ?? 0;
            return (
              <button
                key={item.key}
                onClick={() => setActiveCategory(item.key)}
                className={`flex h-[32px] w-full items-center gap-2.5 rounded-md border px-3 text-left text-[12px] transition-all ${
                  isActive
                    ? 'border-[#E5C767]/65 bg-[#E5C767]/10 text-[#E5C767]'
                    : 'border-white/[0.07] bg-white/[0.035] text-white/72 hover:border-[#E5C767]/35 hover:text-white'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-[#E5C767]' : item.color} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <span className="text-[10px] text-white/38">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-white/46">Pricing <span className="text-white/25">ⓘ</span></p>
        {[
          { label: 'Free', active: showFreeOnly, onClick: () => setShowFreeOnly(v => !v) },
          { label: 'Freemium', active: showFeaturedOnly, onClick: () => setShowFeaturedOnly(v => !v) },
          { label: 'Paid', active: !showFreeOnly, onClick: () => setShowFreeOnly(false) },
        ].map((item) => (
          <button key={item.label} onClick={item.onClick} className="flex w-full items-center justify-between text-[13px] text-white/82">
            <span>{item.label}</span>
            <span className={`relative h-[18px] w-8 rounded-full transition-colors ${item.active ? 'bg-[#E5C767]' : 'bg-white/[0.13]'}`}>
              <span className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-all ${item.active ? 'left-[16px]' : 'left-[2px]'}`} />
            </span>
          </button>
        ))}
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-white/46">Rating <span className="text-white/25">ⓘ</span></p>
        <button className="flex w-full items-center justify-between text-[13px] text-white/82">
          <span>4.5 & up</span>
          <span className="relative h-[18px] w-8 rounded-full bg-[#E5C767]">
            <span className="absolute left-[16px] top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm" />
          </span>
        </button>
        <div className="flex items-center gap-1 text-[#E5C767]">
          {[0, 1, 2, 3, 4].map((star) => <Star key={star} size={14} fill="currentColor" />)}
          <Star size={14} className="text-[#E5C767]/45" />
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-white/46">Compatibility <span className="text-white/25">ⓘ</span></p>
        {[
          { label: 'Web', key: 'web' },
          { label: 'Desktop', key: 'extension' },
          { label: 'Mobile', key: 'ios' },
        ].map((item) => {
          const checked = activePlatform === item.key || (item.key === 'web' && activePlatform === 'ALL');
          return (
            <button key={item.key} onClick={() => setActivePlatform(activePlatform === item.key ? 'ALL' : item.key)} className="flex w-full items-center gap-2.5 text-[13px] text-white/76">
              <span className={`grid h-[15px] w-[15px] place-items-center rounded-[3px] border ${checked ? 'border-[#E5C767] bg-[#E5C767]' : 'border-white/25 bg-transparent'}`}>
                {checked && <Check size={11} className="text-black" />}
              </span>
              {item.label}
            </button>
          );
        })}
      </section>

      <section>
        <button onClick={() => setAdvancedOpen(v => !v)} className="flex w-full items-center justify-between py-1 text-[10px] font-medium uppercase tracking-wide text-white/46 transition-colors hover:text-[#E5C767]">
          More filters
          {advancedOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <AnimatePresence initial={false}>
          {advancedOpen && (
            <motion.div
              key="advanced-market-filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-3">
                <div className="grid grid-cols-3 gap-1.5">
                  {COMPLEXITY_LEVELS.map(level => {
                    const isActive = activeComplexity === level.key;
                    return (
                      <button key={level.key} onClick={() => setActiveComplexity(isActive ? null : level.key)}
                        className={`rounded-md py-2 text-[10px] font-semibold transition-all ${isActive ? 'bg-[#E5C767] text-black' : 'border border-white/[0.07] bg-white/[0.035] text-white/48 hover:text-white'}`}>
                        {level.label}
                      </button>
                    );
                  })}
                </div>
                {allTags.length > 0 && (
                  <div className="flex max-h-[120px] flex-wrap gap-1.5 overflow-y-auto no-scrollbar">
                    {allTags.slice(0, 18).map(tag => {
                      const isActive = activeTags.includes(tag);
                      return (
                        <button key={tag} onClick={() => toggleTag(tag)}
                          className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all ${isActive ? 'bg-[#E5C767] text-black' : 'border border-white/[0.07] bg-white/[0.035] text-white/45 hover:text-white'}`}>
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="rounded-lg border border-[#E5C767]/18 bg-[#E5C767]/[0.035] p-3.5">
        <p className="text-[12px] font-medium text-white/82">Compare up to 4 apps</p>
        <p className="mt-0.5 text-[10px] text-white/42">Select apps to compare features</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((slot) => {
            const item = compareSolutions[slot];
            return (
              <button
                key={slot}
                onClick={() => item && setCompareIds(prev => prev.filter(id => id !== item.id))}
                className="grid h-10 place-items-center rounded-md border border-dashed border-[#E5C767]/55 bg-black/30 text-[#E5C767]"
              >
                {item ? <span className="text-[12px] font-bold">{item.name[lang]?.charAt(0)}</span> : <span className="text-xl leading-none">+</span>}
              </button>
            );
          })}
        </div>
      </section>

      {activeFilterCount > 0 && (
        <button onClick={resetFilters} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5C767]/22 bg-[#E5C767]/10 py-2.5 text-[12px] font-semibold text-[#E5C767] transition-colors hover:bg-[#E5C767]/16">
          <X size={12} /> Reset filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="relative h-screen overflow-hidden bg-[#050505] pt-[48px] text-neutral-100 transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 opacity-[0.045] bg-[linear-gradient(rgba(201,168,76,0.26)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.26)_1px,transparent_1px)] bg-[size:80px_80px]" />
      <motion.div
        className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_72%_18%,rgba(201,168,76,0.13),transparent_34%)]"
        animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.03, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none fixed left-[28%] top-[62px] h-px w-[54vw] bg-gradient-to-r from-transparent via-[#E5C767]/45 to-transparent"
        animate={{ x: ['-18%', '20%', '-18%'], opacity: [0.18, 0.58, 0.18] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 h-[calc(100vh-48px)] w-full overflow-hidden">
        {/* ═══════ 2-COLUMN LAYOUT ═══════ */}
        <div className="h-full border-t border-white/[0.06]">
          <MarketIconRail />

          {/* LEFT SIDEBAR */}
          <aside className="fixed bottom-0 left-[92px] top-[48px] z-30 hidden w-[224px] shrink-0 overflow-y-auto overscroll-contain border-r border-white/[0.08] bg-black/46 no-scrollbar lg:block">
            {sidebarContent}
          </aside>

          {/* RIGHT CONTENT */}
          <div ref={marketScrollRef} className="h-full min-w-0 overflow-y-auto overscroll-contain pb-10 lg:ml-[316px]">
            <FeaturedStudioStage
              items={heroStageItems}
              lang={currentLang}
              activeIndex={promoIndex}
              onNavigate={(target) => navigate(target.startsWith('/') ? target : `/product/${target}`)}
              onOpenFilters={(e) => { e.stopPropagation(); setMobileSidebar(true); }}
              onSelectBanner={(e, index) => { e.stopPropagation(); setPromoIndex(index); }}
              activeFilterCount={activeFilterCount}
            />

            {/* Quick Path Hero — chỉ hiển thị cho user mới (chưa search/filter) và chưa dismiss */}
            {!quickPathDismissed && !inputValue && activeCategory === 'ALL' && !loading && false && (
              <QuickPathHero onPick={handleQuickPath} onDismiss={dismissQuickPath} />
            )}

            {!inputValue && featuredSolutions.length > 0 && (
              <TrendingSlider items={featuredSolutions} lang={currentLang} onNavigate={handleNavigate} />
            )}

            {/* Toolbar */}
            <div id={GRID_ANCHOR_ID} className="flex items-center justify-between px-5 py-4 scroll-mt-20 xl:px-6">
              <p className="text-[13px] text-white/62">
                {loading ? 'Loading...' : <><strong className="font-medium text-white">{filteredSolutions.length}</strong> results</>}
                {deferredSearch && <span className="ml-1 text-[#E5C767]">"{deferredSearch}"</span>}
                {hasMore && <span className="ml-1 text-white/45">· showing {visibleCount}</span>}
              </p>
              <div className="flex items-center gap-2">
                {/* View mode toggle */}
                <div className="flex h-9 items-center rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#E5C767]/14 text-[#E5C767]' : 'text-white/45 hover:text-white'}`}
                    title="Xem dạng lưới (G)"
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#E5C767]/14 text-[#E5C767]' : 'text-white/45 hover:text-white'}`}
                    title="Xem dạng danh sách (G)"
                  >
                    <LayoutList size={14} />
                  </button>
                </div>
                {/* Compare button */}
                {/* Sort */}
                {deferredSearch ? (
                  <span className="flex h-9 items-center gap-1 rounded-lg border border-[#E5C767]/22 bg-[#E5C767]/10 px-3 text-[11px] font-medium text-[#E5C767]">
                    <Sparkles size={11} /> Theo độ liên quan
                  </span>
                ) : (
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="h-9 cursor-pointer rounded-lg border border-white/[0.08] bg-black/40 px-3 text-[12px] text-white/72 outline-none">
                    {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                )}
                <button
                  onClick={() => setCompareIds([])}
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-black/40 px-3 text-[12px] font-medium text-white/70 transition-colors hover:border-[#E5C767]/35 hover:text-[#E5C767]"
                >
                  <GitCompare size={14} /> Compare ({compareIds.length}/4)
                </button>
              </div>
            </div>

            {/* Active tag pills */}
            {activeTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-[11px] text-neutral-400 mr-1 py-1">Active:</span>
                {activeTags.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 rounded-md bg-brand-blue/[0.08] px-2 py-1 text-[11px] font-medium text-brand-blue">
                    {tag} <X size={10} />
                  </button>
                ))}
              </div>
            )}

            {/* GRID / LIST */}
            {loading || gridSettling ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3 px-5 lg:grid-cols-3 xl:grid-cols-5 xl:px-6' : 'space-y-3 px-5 xl:px-6'}>
                {[1,2,3,4,5,6,7,8,9,10].map(i => (
                  viewMode === 'grid' ? (
                    <ProductCardSkeleton key={i} />
                  ) : (
                    <div key={i} className="flex h-[100px] animate-pulse overflow-hidden rounded-lg border border-neutral-700/40 bg-neutral-900">
                      <div className="w-[180px] bg-neutral-800" />
                      <div className="flex-1 p-4 space-y-2">
                        <div className="h-4 bg-neutral-800 rounded w-1/2" />
                        <div className="h-3 bg-neutral-800 rounded w-3/4" />
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : paginatedSolutions.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3 px-5 lg:grid-cols-3 xl:grid-cols-5 xl:px-6' : 'space-y-3 px-5 xl:px-6'}>
                  {paginatedSolutions.map((sol, index) => (
                    <React.Fragment key={sol.id}>
                      {viewMode === 'grid' ? (
                        <ProductCardGrid sol={sol} lang={currentLang} onNavigate={handleNavigate}
                          isFav={favoriteIdSet.has(sol.id)} onToggleFav={toggleFavorite}
                          onPreview={handlePreview}
                          isCompare={compareIdSet.has(sol.id)}
                          onToggleCompare={toggleCompare}
                          isSpotlight={index === 0} />
                      ) : (
                        <ProductCardList sol={sol} lang={currentLang} onNavigate={handleNavigate}
                          isFav={favoriteIdSet.has(sol.id)} onToggleFav={toggleFavorite}
                          onPreview={handlePreview}
                          isCompare={compareIdSet.has(sol.id)}
                          onToggleCompare={toggleCompare} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Auto-load sentinel — IntersectionObserver tự load thêm khi scroll gần tới */}
                {hasMore && (
                  <div ref={loadMoreRef} className="mt-8 py-6 flex justify-center items-center gap-2.5 text-[12px] text-neutral-400">
                    <div className="w-4 h-4 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
                    <span>Đang tải thêm <span className="text-neutral-500 font-medium">({filteredSolutions.length - visibleCount} còn lại)</span>…</span>
                  </div>
                )}
                {!hasMore && filteredSolutions.length > ITEMS_PER_PAGE && (
                  <div className="mt-8 py-4 flex justify-center text-[11px] text-neutral-300">
                    — Đã hiển thị toàn bộ {filteredSolutions.length} kết quả —
                  </div>
                )}
              </>
            ) : (
              /* ═══ CONTEXT-AWARE EMPTY STATE ═══ */
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-800 border border-neutral-700/40 flex items-center justify-center">
                  <Search size={28} strokeWidth={1.5} className="text-neutral-500" />
                </div>
                <div>
                  <p className="text-[16px] font-bold text-neutral-300">
                    {deferredSearch ? `Không tìm thấy "${deferredSearch}"` : 'Không có kết quả'}
                  </p>
                  <p className="text-[12px] text-neutral-400 mt-1">
                    {deferredSearch
                      ? 'Thử từ khoá khác hoặc bỏ bộ lọc'
                      : activeCategory !== 'ALL'
                        ? `Chưa có công cụ trong danh mục "${activeCategory}"`
                        : 'Hãy thử bỏ bớt bộ lọc đang áp dụng'}
                  </p>
                </div>
                {/* Suggestion tags */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Video', 'Image', 'Audio', 'Automation'].map(s => (
                    <button key={s} onClick={() => { setActiveCategory(s); setInputValue(''); }}
                      className="px-3 py-1.5 bg-brand-blue/[0.06] text-brand-blue text-[11px] font-semibold border border-brand-blue/10 hover:bg-brand-blue/[0.12] transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={resetFilters} className="text-[13px] text-brand-blue hover:underline mt-1">Đặt lại tất cả bộ lọc</button>
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
              className="fixed inset-0 bg-black/30 z-[500]" onClick={() => setMobileSidebar(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 w-[300px] h-full bg-[#141418] z-[501] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-700/40">
                <h3 className="text-[15px] font-bold text-neutral-100">Bộ lọc</h3>
                <button onClick={() => setMobileSidebar(false)} className="p-1 text-neutral-500 hover:text-neutral-300"><X size={18} /></button>
              </div>
              <div className="p-5">{sidebarContent}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════ BACK TO TOP ═══════ */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => marketScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
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
