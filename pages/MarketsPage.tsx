
import React, { useState, useEffect, useMemo, useRef, useCallback, useDeferredValue } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, ArrowRight, ChevronLeft, ChevronRight,
  Video, ImageIcon, Mic, Music, LayoutGrid, Zap,
  TrendingUp, Heart, BookmarkPlus, Bookmark,
  X, Layers, Box, Cpu, SlidersHorizontal,
  Check, ArrowUp, Clock, Tag, ChevronUp, ChevronDown,
  Eye, GitCompare, Command,
  Globe, Smartphone, Tablet, Film, Lightbulb
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { marketApi } from '../apis/market';
import { promoBannersPublicApi, PromoBanner as PromoBannerType } from '../apis/promo-banners';
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
  { key: 'ALL', label: 'Tất cả', icon: LayoutGrid },
  { key: 'Video', label: 'Video AI', icon: Video },
  { key: 'Image', label: 'Hình ảnh AI', icon: ImageIcon },
  { key: 'Script', label: 'Kịch bản & Studio', icon: Film },
  { key: 'Audio', label: 'Giọng nói', icon: Mic },
  { key: 'Music', label: 'Nhạc AI', icon: Music },
  { key: 'Automation', label: 'Tự động hóa', icon: Zap },
  { key: '3D', label: '3D & Game', icon: Box },
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

// ═══════ PROMO BANNERS — random mỗi lần load ═══════
// heroTitle + heroHighlight = dòng h1, heroDesc = subtitle, title/desc = promo strip dưới
const PROMO_BANNERS = [
  {
    tag: 'HOT DEAL',
    heroTitle: 'Nâng cấp ',
    heroHighlight: 'gói Pro giảm 30%',
    heroDesc: 'Truy cập toàn bộ 50+ model AI hàng đầu với mức giá ưu đãi nhất. Một tài khoản, một số dư credits cho tất cả.',
    title: 'Giảm 30% gói Pro',
    desc: 'Nâng cấp hôm nay — truy cập toàn bộ 50+ model AI với giá ưu đãi nhất.',
    cta: 'Nâng cấp ngay',
    link: '/pricing',
  },
  {
    tag: 'MỚI',
    heroTitle: 'Veo 3 — Video AI ',
    heroHighlight: 'chất lượng điện ảnh',
    heroDesc: 'Model video mới nhất từ Google đã có mặt. Tạo video 8s cinematic chỉ với vài dòng prompt.',
    title: 'Veo 3 đã có mặt',
    desc: 'Model video mới nhất từ Google — tạo video 8s chất lượng điện ảnh.',
    cta: 'Thử ngay',
    link: '/app/veo-3',
  },
  {
    tag: 'FLASH SALE',
    heroTitle: 'Mua 500 credits ',
    heroHighlight: 'tặng thêm 100',
    heroDesc: 'Chương trình giới hạn — nạp credits hôm nay nhận thêm 20% bonus. Áp dụng cho mọi công cụ AI.',
    title: 'Mua 500 credits tặng 100',
    desc: 'Chương trình giới hạn — nạp credits hôm nay nhận thêm 20% bonus.',
    cta: 'Nạp credits',
    link: '/credits',
  },
  {
    tag: 'ƯU ĐÃI',
    heroTitle: 'Đăng ký nhận ',
    heroHighlight: '50 credits miễn phí',
    heroDesc: 'Tài khoản mới nhận ngay 50 credits trải nghiệm mọi công cụ AI — video, ảnh, nhạc, giọng nói.',
    title: 'Miễn phí 50 credits',
    desc: 'Đăng ký tài khoản mới và nhận ngay 50 credits trải nghiệm mọi công cụ AI.',
    cta: 'Đăng ký miễn phí',
    link: '/login',
  },
  {
    tag: 'BUNDLE',
    heroTitle: 'Combo ',
    heroHighlight: 'Video + Nhạc AI',
    heroDesc: 'Tạo video TikTok kèm nhạc nền AI chỉ trong vài phút — tiết kiệm 40% so với mua lẻ từng tool.',
    title: 'Combo Video + Nhạc AI',
    desc: 'Tạo video TikTok kèm nhạc nền AI — tiết kiệm 40% so với mua lẻ.',
    cta: 'Xem combo',
    link: '/pricing',
  },
];
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

// ═══════ TRENDING SLIDER ═══════
const TrendingSlider: React.FC<{ items: Solution[]; lang: Language; onNavigate: (slug: string) => void }> = React.memo(({ items, lang, onNavigate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };
  const limitedItems = useMemo(() => items.slice(0, TRENDING_LIMIT), [items]);
  if (limitedItems.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-brand-blue" />
          <h3 className="text-[14px] font-bold text-neutral-800">Trending</h3>
        </div>
        <div className="flex gap-1">
          <button onClick={() => scroll('left')} className="p-1 rounded-md bg-neutral-800 text-neutral-400 hover:text-brand-blue transition-colors"><ChevronLeft size={14} /></button>
          <button onClick={() => scroll('right')} className="p-1 rounded-md bg-neutral-800 text-neutral-400 hover:text-brand-blue transition-colors"><ChevronRight size={14} /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar snap-x pb-1">
        {limitedItems.map((sol, i) => (
          <div key={sol.id} onClick={() => onNavigate(sol.slug)}
            className="snap-start shrink-0 w-[220px] bg-neutral-900 border border-neutral-700/40 overflow-hidden cursor-pointer hover:border-brand-blue/30 transition-all group">
            <div className="relative h-[120px] overflow-hidden">
              <img src={sol.imageUrl} alt={sol.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold">#{i+1}</span>
            </div>
            <div className="p-3">
              <h4 className="text-[13px] font-bold text-neutral-200 truncate group-hover:text-brand-blue transition-colors">{sol.name[lang]}</h4>
              <p className="text-[10px] text-neutral-500 mt-1">{sol.category[lang]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
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
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-blue/[0.08] border border-brand-blue/15 rounded-full mb-1.5">
          <Sparkles size={10} className="text-brand-blue" />
          <span className="text-[9px] font-bold text-brand-blue uppercase tracking-wider">Bắt đầu nhanh</span>
        </div>
        <h2 className="text-[17px] md:text-[19px] font-bold text-white">Bạn muốn làm gì hôm nay?</h2>
        <p className="text-[12px] text-neutral-400 mt-0.5">Chọn một mục để xem ngay công cụ phù hợp</p>
      </div>
      <button onClick={onDismiss}
        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors">
        Ẩn <X size={10} />
      </button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
      {QUICK_PATHS.map(p => {
        const Icon = p.icon;
        return (
          <button key={p.key} onClick={() => onPick(p.category)}
            className="group relative bg-neutral-900 border border-neutral-700/40 p-3.5 md:p-4 text-left hover:border-brand-blue/30 hover:-translate-y-0.5 transition-all">
            <div className={`w-9 h-9 md:w-10 md:h-10 bg-neutral-800 border border-neutral-700/40 flex items-center justify-center mb-2.5 ${p.iconColor}`}>
              <Icon size={17} />
            </div>
            <p className="text-[12.5px] md:text-[13.5px] font-bold text-neutral-200 group-hover:text-brand-blue transition-colors">{p.label}</p>
            <p className="text-[10px] md:text-[11px] text-neutral-400 mt-0.5 truncate">{p.desc}</p>
            <ArrowRight size={11} className="absolute top-3.5 right-3.5 text-neutral-300 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
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

// ═══════ PRODUCT CARD (GRID) ═══════
const ProductCardGrid: React.FC<{
  sol: Solution; lang: Language; onNavigate: (slug: string) => void;
  isFav: boolean; onToggleFav: (e: React.MouseEvent) => void;
  onPreview?: (e: React.MouseEvent) => void;
  isCompare?: boolean; onToggleCompare?: (e: React.MouseEvent) => void;
}> = React.memo(({ sol, lang, onNavigate, isFav, onToggleFav, onPreview, isCompare, onToggleCompare }) => {
  const models = sol.models?.slice(0, 3) || [];
  return (
    <motion.div whileHover={{ y: -1 }}
      className={`bg-neutral-900 border overflow-hidden cursor-pointer transition-all group flex flex-col ${isCompare ? 'border-brand-blue/30 ring-2 ring-brand-blue/10' : 'border-neutral-700/40 hover:border-neutral-600'}`}
      onClick={() => { saveRecentlyViewed(sol); onNavigate(sol.slug); }}>
      <div className="relative h-[180px] overflow-hidden">
        <img src={sol.imageUrl} alt={sol.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex gap-1">
          {sol.isFree && <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-md">FREE</span>}
          {sol.featured && <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold rounded-md flex items-center gap-0.5"><Sparkles size={8} fill="currentColor" /> Hot</span>}
        </div>
        <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onPreview && <button onClick={onPreview} className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-colors" title="Xem nhanh"><Eye size={12} /></button>}
          {onToggleCompare && <button onClick={onToggleCompare} className={`p-1.5 rounded-lg backdrop-blur-md border transition-colors ${isCompare ? 'bg-brand-blue/80 border-brand-blue text-white' : 'bg-black/40 border-white/10 text-white/80 hover:text-white'}`} title="So sánh"><GitCompare size={12} /></button>}
          <button onClick={onToggleFav} className={`p-1.5 rounded-lg backdrop-blur-md border transition-all ${isFav ? 'bg-brand-blue/20 border-brand-blue/30 text-brand-blue' : 'bg-black/30 border-white/10 text-white/70'}`}>
            {isFav ? <Bookmark size={12} fill="currentColor" /> : <BookmarkPlus size={12} />}
          </button>
        </div>
      </div>
      <div className="p-3.5 space-y-2 flex-1 flex flex-col">
        <div>
          <h3 className="text-[14px] font-bold text-neutral-200 group-hover:text-brand-blue transition-colors truncate">{sol.name[lang]}</h3>
          <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{sol.description[lang]}</p>
        </div>
        {/* Models badges */}
        {models.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {models.map(m => (
              <span key={m} className="px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded text-[8px] font-mono border border-neutral-700/40">{m}</span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          <span className="px-1.5 py-0.5 bg-brand-blue/[0.1] text-brand-blue rounded text-[9px] font-medium border border-brand-blue/20">{sol.category[lang]}</span>
          {sol.complexity && <span className="px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded text-[9px] font-medium border border-neutral-700/40">{sol.complexity}</span>}
        </div>
        <div className="pt-2 border-t border-neutral-700/40 flex items-center justify-between">
          <div className="text-[10px] font-semibold">
            {sol.priceCredits ? (
              <span className="text-orange-500 flex items-center gap-0.5"><Zap size={10} fill="currentColor" /> {sol.priceCredits} CR</span>
            ) : sol.isFree ? (
              <span className="text-emerald-500">Miễn phí</span>
            ) : null}
          </div>
          <span className="flex items-center gap-1 text-[11px] font-medium text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">Mở <ArrowRight size={11} /></span>
        </div>
      </div>
    </motion.div>
  );
});

// ═══════ PRODUCT CARD (LIST) ═══════
const ProductCardList: React.FC<{
  sol: Solution; lang: Language; onNavigate: (slug: string) => void;
  isFav: boolean; onToggleFav: (e: React.MouseEvent) => void;
  onPreview?: (e: React.MouseEvent) => void;
  isCompare?: boolean; onToggleCompare?: (e: React.MouseEvent) => void;
}> = React.memo(({ sol, lang, onNavigate, isFav, onToggleFav, onPreview, isCompare, onToggleCompare }) => {
  const models = sol.models?.slice(0, 2) || [];
  return (
    <div className={`bg-neutral-900 border overflow-hidden cursor-pointer transition-all group flex ${isCompare ? 'border-brand-blue/30 ring-2 ring-brand-blue/10' : 'border-neutral-700/40 hover:border-neutral-600'}`}
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
            <h3 className="text-[15px] font-bold text-neutral-200 group-hover:text-brand-blue transition-colors truncate">{sol.name[lang]}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {onPreview && <button onClick={onPreview} className="p-1 rounded-md text-neutral-500 hover:text-brand-blue transition-colors" title="Xem nhanh"><Eye size={14} /></button>}
              {onToggleCompare && <button onClick={onToggleCompare} className={`p-1 rounded-md transition-colors ${isCompare ? 'text-brand-blue' : 'text-neutral-500 hover:text-brand-blue'}`} title="So sánh"><GitCompare size={14} /></button>}
              <button onClick={onToggleFav} className={`p-1 rounded-md transition-all ${isFav ? 'text-brand-blue' : 'text-neutral-500 hover:text-brand-blue'}`}>
                {isFav ? <Bookmark size={14} fill="currentColor" /> : <BookmarkPlus size={14} />}
              </button>
            </div>
          </div>
          <p className="text-[12px] text-neutral-500 line-clamp-2 mt-1">{sol.description[lang]}</p>
          {/* Models badges */}
          {models.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {models.map(m => (
                <span key={m} className="px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded text-[8px] font-mono border border-neutral-700/40">{m}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-brand-blue/[0.1] text-brand-blue rounded text-[9px] font-medium border border-brand-blue/20">{sol.category[lang]}</span>
            {sol.complexity && <span className="px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded text-[9px] font-medium border border-neutral-700/40">{sol.complexity}</span>}
            {sol.priceCredits ? (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-orange-500"><Zap size={10} fill="currentColor" /> {sol.priceCredits} CR</span>
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
            <span className="text-[12px] font-bold text-neutral-200">So sánh ({items.length}/3)</span>
          </div>
          <button onClick={onClear} className="text-[11px] font-medium text-neutral-400 hover:text-rose-500 transition-colors">Xoá tất cả</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(i => {
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

  // Random promo banner — fetch from API, fallback to hardcoded
  const [promoBanners, setPromoBanners] = useState<PromoBannerType[]>([]);
  const promoBanner = useMemo(() => {
    const pool = promoBanners.length > 0 ? promoBanners : PROMO_BANNERS;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [promoBanners]);

  useEffect(() => {
    promoBannersPublicApi.getActive().then(data => {
      if (data.length > 0) setPromoBanners(data);
    });
  }, []);

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [featuredSolutions, setFeaturedSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

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
    let ticking = false;
    let last = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > 600;
        if (next !== last) {
          last = next;
          setShowBackTop(next);
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // SCROLL RESTORATION
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_POS_KEY);
    if (saved) {
      const pos = parseInt(saved, 10);
      if (!isNaN(pos)) {
        requestAnimationFrame(() => window.scrollTo({ top: pos, behavior: 'instant' as ScrollBehavior }));
      }
      sessionStorage.removeItem(SCROLL_POS_KEY);
    }
    return () => {
      sessionStorage.setItem(SCROLL_POS_KEY, String(window.scrollY));
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [solRes, featRes] = await Promise.all([
          marketApi.getSolutions({ lang: currentLang }),
          marketApi.getRandomFeatured()
        ]);
        if (solRes?.data) setSolutions([...solRes.data.filter((s: Solution) => s.isActive !== false && s.id && s.slug)].reverse());
        if (featRes?.data) setFeaturedSolutions(featRes.data.filter((s: Solution) => s.id && s.slug));
      } catch (err) { console.error('Markets fetch:', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [currentLang]);

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
      if (el) {
        const offset = 100; // chừa header sticky
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }, []);

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
        k !== 'all' && (
          catKey.toLowerCase().includes(k) || k.includes(catKey.toLowerCase())
        )
      );
      if (alreadyCovered) return;
      if (extraCats.some(c => c.key === catKey)) return;
      extraCats.push({ key: catKey, label: catEn, icon: Cpu });
    });

    // Append extra categories at the end (Sky Partners đã được rút ra)
    return [...STATIC_CATEGORIES, ...extraCats];
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
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount(prev => prev + ITEMS_PER_PAGE);
        }
      },
      { rootMargin: '300px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: solutions.length };
    CATEGORIES.forEach(c => {
      if (c.key === 'ALL') return;
      const cKeyLower = c.key.trim().toLowerCase();
      counts[c.key] = solutions.filter(s =>
        s.category[currentLang]?.trim().toLowerCase().includes(cKeyLower) ||
        s.category.en?.trim().toLowerCase().includes(cKeyLower) ||
        s.tags?.some(t => t.trim().toLowerCase().includes(cKeyLower)) ||
        s.demoType?.trim().toLowerCase() === cKeyLower
      ).length;
    });
    return counts;
  }, [solutions, currentLang, CATEGORIES]);

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
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  }, []);
  const compareSolutions = useMemo(() => compareIds.map(id => solutions.find(s => s.id === id)).filter(Boolean) as Solution[], [compareIds, solutions]);

  // ═══════ SIDEBAR ═══════
  // ⚡ JSX biến (KHÔNG phải component) — tránh tạo new component identity mỗi render
  // (vd khi gõ search → MarketsPage re-render → trước đây <SidebarContent /> bị unmount/remount,
  // input mất focus + value reset → cảm giác giật lag).
  const sidebarContent = (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
        <input ref={searchInputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Tìm công cụ AI... (⌘K)"
          className="w-full bg-neutral-900 border border-neutral-700/60 pl-9 pr-8 py-2.5 text-[13px] text-neutral-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-neutral-500" />
        {inputValue && <button onClick={() => setInputValue('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"><X size={13} /></button>}
      </div>

      {/* Categories Card — chia 2 group: "Tạo nội dung" (expand default) + "Khác" (collapse default) */}
      <div>
        <div className="px-1 pb-2 flex items-center gap-2">
          <LayoutGrid size={13} className="text-brand-blue" />
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Danh mục</span>
        </div>
        <div className="space-y-0.5">
          {(() => {
            const allCat = CATEGORIES.find(c => c.key === 'ALL');
            const contentCats = CATEGORIES.filter(c => CONTENT_CATEGORY_KEYS.has(c.key));
            const otherCats = CATEGORIES.filter(c => c.key !== 'ALL' && !CONTENT_CATEGORY_KEYS.has(c.key));
            const contentActiveCount = contentCats.filter(c => activeCategory === c.key).length;
            const otherActiveCount = otherCats.filter(c => activeCategory === c.key).length;

            const renderCatBtn = (cat: typeof CATEGORIES[0]) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;
              const count = catCounts[cat.key] || 0;
              return (
                <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}>
                  <Icon size={14} className={isActive ? 'text-white' : ''} />
                  <span className="flex-1 text-left">{cat.label}</span>
                  <span className={`text-[10px] font-semibold min-w-[20px] text-center py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-neutral-800 text-neutral-500'
                  }`}>{count}</span>
                </button>
              );
            };

            const renderGroupHeader = (
              icon: React.ReactNode, label: string, isOpen: boolean, onToggle: () => void, badgeDot: boolean
            ) => (
              <button onClick={onToggle}
                className="w-full flex items-center gap-2 px-3 py-1.5 mt-1 text-[10px] font-bold text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 uppercase tracking-wider transition-colors">
                {icon}
                <span className="flex-1 text-left">{label}</span>
                {badgeDot && <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />}
                {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            );

            return (
              <>
                {/* "Tất cả" — đứng riêng top */}
                {allCat && renderCatBtn(allCat)}

                {/* Group: Tạo nội dung */}
                {contentCats.length > 0 && (
                  <>
                    {renderGroupHeader(
                      <Sparkles size={11} className="text-brand-blue" />,
                      'Tạo nội dung',
                      contentGroupOpen,
                      () => setContentGroupOpen(v => !v),
                      contentActiveCount > 0
                    )}
                    <AnimatePresence initial={false}>
                      {contentGroupOpen && (
                        <motion.div key="content-cats"
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }} className="overflow-hidden space-y-0.5">
                          {contentCats.map(renderCatBtn)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* Group: Khác */}
                {otherCats.length > 0 && (
                  <>
                    {renderGroupHeader(
                      <Layers size={11} className="text-neutral-400" />,
                      `Khác (${otherCats.length})`,
                      otherGroupOpen,
                      () => setOtherGroupOpen(v => !v),
                      otherActiveCount > 0
                    )}
                    <AnimatePresence initial={false}>
                      {otherGroupOpen && (
                        <motion.div key="other-cats"
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }} className="overflow-hidden space-y-0.5">
                          {otherCats.map(renderCatBtn)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Toggles Card — basic, always visible (đưa lên trước advanced) */}
      <div className="border-t border-neutral-700/40 pt-4">
        <div className="px-1 pb-2 flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-emerald-500" />
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Bộ lọc nhanh</span>
        </div>
        <div className="space-y-0.5">
          <label className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-neutral-800 transition-colors">
            <div className="flex items-center gap-2">
              <Zap size={13} className={showFreeOnly ? 'text-emerald-500' : 'text-neutral-500'} />
              <span className="text-[12px] font-medium text-neutral-300">Chỉ miễn phí</span>
            </div>
            <div className={`relative w-8 h-[18px] rounded-full transition-colors ${showFreeOnly ? 'bg-brand-blue' : 'bg-neutral-700'}`} onClick={(e) => { e.preventDefault(); setShowFreeOnly(!showFreeOnly); }}>
              <div className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-all ${showFreeOnly ? 'left-[16px]' : 'left-[2px]'}`} />
            </div>
          </label>
          <label className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-neutral-800 transition-colors">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className={showFeaturedOnly ? 'text-amber-500' : 'text-neutral-500'} />
              <span className="text-[12px] font-medium text-neutral-300">Nổi bật</span>
            </div>
            <div className={`relative w-8 h-[18px] rounded-full transition-colors ${showFeaturedOnly ? 'bg-brand-blue' : 'bg-neutral-700'}`} onClick={(e) => { e.preventDefault(); setShowFeaturedOnly(!showFeaturedOnly); }}>
              <div className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-all ${showFeaturedOnly ? 'left-[16px]' : 'left-[2px]'}`} />
            </div>
          </label>
        </div>
      </div>

      {/* ─── BỘ LỌC NÂNG CAO — collapse mặc định đóng (Complexity + Platform + Tags) ─── */}
      {(() => {
        const advCount = [!!activeComplexity, activeTags.length > 0, activePlatform !== 'ALL'].filter(Boolean).length;
        return (
          <div className="border-t border-neutral-700/40 pt-4">
            <button
              onClick={() => setAdvancedOpen(v => !v)}
              className="w-full px-1 pb-2 flex items-center justify-between hover:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={13} className="text-neutral-500" />
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Bộ lọc nâng cao</span>
                {advCount > 0 && (
                  <span className="text-[9px] font-bold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded-full">{advCount}</span>
                )}
              </div>
              {advancedOpen ? <ChevronUp size={13} className="text-neutral-400" /> : <ChevronDown size={13} className="text-neutral-400" />}
            </button>
            <AnimatePresence initial={false}>
              {advancedOpen && (
                <motion.div
                  key="adv-filters"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 space-y-3">
                    {/* Complexity */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Layers size={12} className="text-purple-500" />
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Cấp độ</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {COMPLEXITY_LEVELS.map(level => {
                          const isActive = activeComplexity === level.key;
                          return (
                            <button key={level.key} onClick={() => setActiveComplexity(isActive ? null : level.key)}
                              className={`flex items-center justify-center py-2 text-[11px] font-semibold transition-all ${isActive
                                ? 'bg-brand-blue text-white'
                                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700/40'
                              }`}>
                              {level.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Platform */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Globe size={12} className="text-cyan-500" />
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Nền tảng</span>
                      </div>
                      <div className="space-y-0.5">
                        {PLATFORMS.map(plat => {
                          const Icon = plat.icon;
                          const isActive = activePlatform === plat.key;
                          return (
                            <button key={plat.key} onClick={() => setActivePlatform(plat.key)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition-all ${isActive
                                ? 'bg-brand-blue text-white'
                                : 'text-neutral-300 hover:bg-neutral-800'
                              }`}>
                              <Icon size={13} className={isActive ? 'text-white' : ''} />
                              <span className="flex-1 text-left">{plat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tags */}
                    {allTags.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Tag size={12} className="text-orange-500" />
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Tags</span>
                          </div>
                          {activeTags.length > 0 && (
                            <span className="text-[9px] font-bold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded">{activeTags.length} chọn</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto no-scrollbar">
                          {allTags.map(tag => {
                            const isActive = activeTags.includes(tag);
                            return (
                              <button key={tag} onClick={() => toggleTag(tag)}
                                className={`px-2.5 py-1.5 text-[10px] font-semibold transition-all ${isActive
                                  ? 'bg-brand-blue text-white'
                                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700/40 hover:border-brand-blue/30 hover:text-brand-blue'
                                }`}>
                                {isActive && <Check size={9} className="inline mr-1 -mt-px" />}{tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })()}

      {/* Reset */}
      {activeFilterCount > 0 && (
        <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold text-brand-blue bg-brand-blue/[0.06] hover:bg-brand-blue/[0.1] border border-brand-blue/10 transition-colors">
          <X size={12} /> Đặt lại bộ lọc ({activeFilterCount})
        </button>
      )}

      {/* Keyboard Shortcut Hint — chỉ giữ ⌘K (View toggle G ẩn ngầm cho power user) */}
      <div className="flex flex-wrap gap-2 text-[9px] text-neutral-400">
        <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-neutral-800 rounded text-[8px] font-mono text-neutral-400">⌘K</kbd> Tìm</span>
      </div>
    </div>
  );

  return (
    <div className="pt-24 md:pt-28 pb-32 min-h-screen bg-[#0A0A0A] text-neutral-100 transition-colors duration-300">

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ═══════ ATLAS HERO STRIP ═══════ */}
        {/* ═══════ HERO BANNER — promo as background ═══════ */}
        <motion.div
          className="relative mb-8 md:mb-10 overflow-hidden bg-neutral-950 px-6 md:px-10 pt-8 md:pt-10 pb-6 md:pb-8 cursor-pointer group"
          onClick={() => navigate(promoBanner.link)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Animated gradient background ── */}
          <div className="absolute inset-0 bg-atlas-hero-dark opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/[0.08] via-transparent to-brand-blue/[0.04] group-hover:from-brand-blue/[0.12] group-hover:to-brand-blue/[0.06] transition-all duration-700" />

          {/* ── Shimmer sweep overlay ── */}
          <div
            className="absolute inset-0 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500"
            style={{
              backgroundImage: 'linear-gradient(105deg, transparent 40%, rgba(201,168,76,0.4) 45%, rgba(201,168,76,0.6) 50%, rgba(201,168,76,0.4) 55%, transparent 60%)',
              backgroundSize: '200% 100%',
              animation: 'atlasShimmer 4s linear infinite',
            }}
          />

          {/* ── Subtle grid pattern ── */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* ── Corner accent lines ── */}
          <motion.div
            className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-brand-blue to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'left' }}
          />
          <motion.div
            className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-brand-blue to-transparent"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
          />

          {/* ── Content (z-10 above overlays) ── */}
          <div className="relative z-10">
            {/* Promo tag — top right */}
            <motion.div
              className="absolute -top-2 right-0 md:-top-4 md:right-0 flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <span className="relative px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-brand-blue text-white shadow-atlas-glow-soft">
                <span className="relative z-10">{promoBanner.tag}</span>
                <span className="absolute inset-0 bg-brand-blue animate-atlas-pulse rounded-[1px]" />
              </span>
            </motion.div>

            {/* Title + subtitle */}
            <motion.p
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-blue mb-3 flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="w-5 h-px bg-brand-blue/50"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ transformOrigin: 'left' }}
              />
              Marketplace
            </motion.p>

            <motion.h1
              className="text-[1.75rem] md:text-[2.5rem] font-bold tracking-[-0.02em] leading-[1.1] text-white"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {promoBanner.heroTitle}
              <span
                className="bg-gradient-to-r from-brand-blue via-[#E5C767] to-brand-blue bg-[length:200%_auto] bg-clip-text text-transparent"
                style={{ animation: 'atlasShimmer 3s linear infinite' }}
              >
                {promoBanner.heroHighlight}
              </span>
            </motion.h1>

            <motion.p
              className="mt-3 text-[13px] md:text-[15px] text-neutral-400 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {promoBanner.heroDesc}
            </motion.p>

            {/* Promo content — bottom */}
            <motion.div
              className="mt-6 md:mt-8 pt-5 border-t border-neutral-800/60 flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="min-w-0">
                <h3 className="text-[15px] md:text-[18px] font-bold text-white leading-snug">
                  {promoBanner.title}
                </h3>
                <p className="text-[12px] md:text-[13px] text-neutral-500 leading-relaxed mt-1">
                  {promoBanner.desc}
                </p>
              </div>
              <motion.div
                className="flex items-center gap-1.5 text-brand-blue text-[13px] md:text-[14px] font-semibold whitespace-nowrap shrink-0 group-hover:gap-2.5 transition-all ml-6"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {promoBanner.cta} <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </motion.div>
            </motion.div>

            {/* Mobile filter button */}
            <button onClick={(e) => { e.stopPropagation(); setMobileSidebar(true); }}
              className="lg:hidden mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-800/80 border border-neutral-700/60 text-[13px] font-semibold text-neutral-200 w-fit hover:bg-neutral-700 hover:border-brand-blue/30 transition-all">
              <SlidersHorizontal size={15} /> Bộ lọc
              {activeFilterCount > 0 && <span className="w-5 h-5 bg-brand-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-atlas-glow-soft">{activeFilterCount}</span>}
            </button>
          </div>

          {/* ── Bottom glow line ── */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/40 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>

        {/* ═══════ 2-COLUMN LAYOUT ═══════ */}
        <div className="flex gap-6 lg:gap-8">

          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar pr-1 space-y-1">
              {sidebarContent}
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <div className="flex-1 min-w-0">

            {/* Quick Path Hero — chỉ hiển thị cho user mới (chưa search/filter) và chưa dismiss */}
            {!quickPathDismissed && !inputValue && activeCategory === 'ALL' && !loading && (
              <QuickPathHero onPick={handleQuickPath} onDismiss={dismissQuickPath} />
            )}

            {/* Recently Viewed */}
            <RecentlyViewed lang={currentLang} onNavigate={handleNavigate} />

            {/* Suggested for you */}
            {!inputValue && solutions.length > 0 && (
              <SuggestedSection
                solutions={solutions}
                lang={currentLang}
                onNavigate={handleNavigate}
                onPreview={handlePreview}
                favorites={favorites}
                onToggleFav={toggleFavorite}
              />
            )}

            {/* Trending — ẩn khi QuickPathHero đang hiển thị (tránh chồng chéo chức năng giới thiệu tools) */}
            {!inputValue && featuredSolutions.length > 0 && (quickPathDismissed || activeCategory !== 'ALL') && (
              <TrendingSlider items={featuredSolutions} lang={currentLang} onNavigate={handleNavigate} />
            )}

            {/* Toolbar */}
            <div id={GRID_ANCHOR_ID} className="flex items-center justify-between mb-4 scroll-mt-28">
              <p className="text-[13px] text-neutral-400">
                {loading ? 'Đang tải...' : <><strong className="text-neutral-200">{filteredSolutions.length}</strong> kết quả</>}
                {deferredSearch && <span className="text-brand-blue ml-1">"{deferredSearch}"</span>}
                {hasMore && <span className="text-neutral-300 ml-1">· hiện {visibleCount}</span>}
              </p>
              <div className="flex items-center gap-2">
                {/* View mode toggle đã được rút khỏi UI để giảm noise — phím G và URL ?view=list vẫn hoạt động */}
                {deferredSearch ? (
                  <span className="text-[11px] px-2.5 py-1.5 bg-brand-blue/[0.06] text-brand-blue border border-brand-blue/15 flex items-center gap-1 font-medium">
                    <Sparkles size={11} /> Theo độ liên quan
                  </span>
                ) : (
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="text-[12px] px-3 py-1.5 bg-neutral-800 border border-neutral-700/40 text-neutral-300 outline-none cursor-pointer">
                    {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Active tag pills */}
            {activeTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-[11px] text-neutral-400 mr-1 py-1">Active:</span>
                {activeTags.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 px-2 py-1 bg-brand-blue/[0.08] text-brand-blue text-[11px] font-medium">
                    {tag} <X size={10} />
                  </button>
                ))}
              </div>
            )}

            {/* GRID / LIST */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
                {[1,2,3,4,5,6].map(i => (
                  viewMode === 'grid' ? (
                    <div key={i} className="animate-pulse bg-neutral-900 border border-neutral-700/40 overflow-hidden">
                      <div className="h-[180px] bg-neutral-800" />
                      <div className="p-3.5 space-y-2.5">
                        <div className="h-4 bg-neutral-800 rounded w-3/4" />
                        <div className="h-3 bg-neutral-800 rounded w-full" />
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="animate-pulse bg-neutral-900 border border-neutral-700/40 h-[100px] flex">
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
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
                  {paginatedSolutions.map((sol) => (
                    <React.Fragment key={sol.id}>
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
              className="fixed top-0 left-0 w-[300px] h-full bg-[#0A0A0A] z-[501] overflow-y-auto">
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
