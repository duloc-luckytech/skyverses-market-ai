import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Loader2,
  Package,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Code2,
  PenTool,
  Megaphone,
  Palette,
  Briefcase,
  GraduationCap,
  Layers,
  TrendingUp,
  Flame,
  X,
  Star,
  ShoppingBag,
  FileText,
  User,
  Crown,
  ArrowUpRight,
  LayoutGrid,
  List,
  Filter,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { promptMarketApi } from '../apis/prompt-market';
import PromptSetCard from '../components/prompt-market/PromptSetCard';
import type { PromptSet, LocalizedString } from '../types';

// ─── Constants ──────────────────────────────────────────────────────────────

type SortOption = 'newest' | 'popular' | 'price_low' | 'price_high';

const CATEGORIES = [
  { key: 'all', label: { en: 'All', vi: 'Tất cả', ko: '전체', ja: '全て' }, icon: Layers },
  { key: 'coding', label: { en: 'Coding', vi: 'Lập trình', ko: '코딩', ja: 'コーディング' }, icon: Code2 },
  { key: 'writing', label: { en: 'Writing', vi: 'Viết', ko: '글쓰기', ja: 'ライティング' }, icon: PenTool },
  { key: 'marketing', label: { en: 'Marketing', vi: 'Marketing', ko: '마케팅', ja: 'マーケティング' }, icon: Megaphone },
  { key: 'design', label: { en: 'Design', vi: 'Thiết kế', ko: '디자인', ja: 'デザイン' }, icon: Palette },
  { key: 'business', label: { en: 'Business', vi: 'Kinh doanh', ko: '비즈니스', ja: 'ビジネス' }, icon: Briefcase },
  { key: 'education', label: { en: 'Education', vi: 'Giáo dục', ko: '교육', ja: '教育' }, icon: GraduationCap },
  { key: 'other', label: { en: 'Other', vi: 'Khác', ko: '기타', ja: 'その他' }, icon: Sparkles },
] as const;

const SORT_LABELS: Record<SortOption, Record<string, string>> = {
  newest: { en: 'Newest', vi: 'Mới nhất', ko: '최신', ja: '最新' },
  popular: { en: 'Popular', vi: 'Phổ biến', ko: '인기', ja: '人気' },
  price_low: { en: 'Price: Low → High', vi: 'Giá: Thấp → Cao', ko: '가격: 낮은 순', ja: '価格: 安い順' },
  price_high: { en: 'Price: High → Low', vi: 'Giá: Cao → Thấp', ko: '가격: 높은 순', ja: '価格: 高い順' },
};

const PAGE_LIMIT = 12;

// ─── Helper: localize PromptSet fields ─────────────────────────────────────

function localize(val: string | LocalizedString | Record<string, string> | undefined, lang: string): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return (val as Record<string, string>)[lang] || val.en || '';
}

// ─── Collapsible Filter Section ───────────────────────────────────────────

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/[0.04] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-[13px] font-semibold text-white/60 hover:text-white/80 transition-colors"
      >
        {title}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/25" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/25" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Featured Banner Component ─────────────────────────────────────────────

function FeaturedBanner({
  sets,
  loading,
}: {
  sets: PromptSet[];
  loading: boolean;
}) {
  const { lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (sets.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % sets.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sets.length]);

  if (loading) {
    return (
      <div className="aspect-[16/9] md:aspect-[21/9] rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#C9A84C] animate-spin" />
      </div>
    );
  }

  if (sets.length === 0) return null;

  const current = sets[activeIndex];
  const title = localize(current.title, lang);
  const sellerName =
    typeof current.sellerId === 'object' && current.sellerId !== null
      ? current.sellerId.name
      : 'Anonymous';
  const sellerAvatar =
    typeof current.sellerId === 'object' && current.sellerId !== null
      ? current.sellerId.avatar
      : undefined;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] group">
      <div className="aspect-[16/9] md:aspect-[21/9] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {current.coverImage ? (
              <img
                src={current.coverImage}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#C9A84C]/15 via-[#1a1a1a] to-black" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-7">
          {/* Thumbnail strip */}
          <div className="flex gap-2 mb-4">
            {sets.slice(0, 5).map((s, i) => (
              <button
                key={s._id}
                onClick={() => setActiveIndex(i)}
                className={`w-11 h-11 md:w-13 md:h-13 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                  i === activeIndex
                    ? 'border-[#C9A84C] shadow-[0_0_12px_rgba(201,168,76,0.3)]'
                    : 'border-white/10 opacity-50 hover:opacity-80'
                }`}
              >
                {s.coverImage ? (
                  <img src={s.coverImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#C9A84C]/15 to-black" />
                )}
              </button>
            ))}
          </div>

          {/* Title + seller */}
          <Link to={`/prompt-market/${current.slug}`} className="group/link">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight mb-2 group-hover/link:text-[#E5C767] transition-colors">
              {title}
            </h2>
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/40 text-xs">By</span>
            <div className="flex items-center gap-1.5">
              {sellerAvatar ? (
                <img src={sellerAvatar} alt="" className="w-5 h-5 rounded-full ring-1 ring-[#C9A84C]/30" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#C9A84C]/15 flex items-center justify-center">
                  <User className="w-2.5 h-2.5 text-[#C9A84C]" />
                </div>
              )}
              <span className="text-white/60 text-xs font-medium">{sellerName}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-white/[0.06] backdrop-blur-md border border-white/[0.08]">
              <span className="text-white/40">Price </span>
              <span className="text-white font-bold">
                {current.isFree ? 'Free' : `${current.priceSKT} SKT`}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/[0.06] backdrop-blur-md border border-white/[0.08]">
              <span className="text-white/40">Prompts </span>
              <span className="text-white font-bold">
                {current.promptCount ?? current.prompts?.length ?? 0}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/[0.06] backdrop-blur-md border border-white/[0.08]">
              <span className="text-white/40">Sales </span>
              <span className="text-white font-bold">{current.purchaseCount}</span>
            </div>
            {current.reviewCount > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.06] backdrop-blur-md border border-white/[0.08]">
                <Star className="w-3 h-3 fill-[#E5C767] text-[#E5C767] inline mr-1" />
                <span className="text-[#E5C767] font-bold">{current.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide indicator */}
      {sets.length > 1 && (
        <div className="absolute bottom-3 right-5 flex gap-1.5">
          {sets.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-5 bg-[#C9A84C]' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Trending Token Card (horizontal scroll) ──────────────────────────────

function TrendingPromptPill({ promptSet }: { promptSet: PromptSet }) {
  const { lang } = useLanguage();
  const title = localize(promptSet.title, lang);
  const sellerName =
    typeof promptSet.sellerId === 'object' && promptSet.sellerId !== null
      ? promptSet.sellerId.name
      : '';

  return (
    <Link
      to={`/prompt-market/${promptSet.slug}`}
      className="flex items-center gap-3 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:border-[#C9A84C]/20 rounded-2xl px-4 py-3 min-w-[240px] sm:min-w-[280px] flex-shrink-0 transition-all duration-200 group hover:bg-white/[0.04] hover:shadow-[0_4px_20px_rgba(201,168,76,0.06)]"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/[0.08]">
        {promptSet.coverImage ? (
          <img src={promptSet.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#C9A84C]/15 to-black/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#C9A84C]/40" />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate group-hover:text-[#E5C767] transition-colors">
          {title}
        </p>
        <p className="text-xs text-white/25 truncate">{sellerName}</p>
      </div>

      {/* Price badge */}
      <div className="flex-shrink-0">
        <span className={`text-xs font-bold ${promptSet.isFree ? 'text-[#C9A84C]' : 'text-white'}`}>
          {promptSet.isFree ? 'Free' : `${promptSet.priceSKT} SKT`}
        </span>
      </div>
    </Link>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────

const PromptMarketPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive state from URL params
  const urlQ = searchParams.get('q') ?? '';
  const urlCategory = searchParams.get('category') ?? 'all';
  const urlSort = (searchParams.get('sort') ?? 'newest') as SortOption;
  const urlPage = parseInt(searchParams.get('page') ?? '1', 10);
  const urlPriceFilter = searchParams.get('price') ?? 'all';
  const urlRatingFilter = searchParams.get('rating') ?? 'any';

  // Local search input (debounced before syncing to URL)
  const [searchInput, setSearchInput] = useState(urlQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Data state
  const [promptSets, setPromptSets] = useState<PromptSet[]>([]);
  const [featuredSets, setFeaturedSets] = useState<PromptSet[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);

  // ── Fetch featured ────────────────────────────────────────────────────────

  useEffect(() => {
    const loadFeatured = async () => {
      setFeaturedLoading(true);
      const res = await promptMarketApi.getFeatured(8);
      setFeaturedSets(res.data ?? []);
      setFeaturedLoading(false);
    };
    loadFeatured();
  }, []);

  // ── Fetch main list ───────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await promptMarketApi.list({
      q: urlQ || undefined,
      category: urlCategory !== 'all' ? urlCategory : undefined,
      sort: urlSort,
      page: urlPage,
      limit: PAGE_LIMIT,
    });
    setPromptSets(res.data ?? []);
    setPagination(res.pagination ?? { page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 0 });
    setLoading(false);
  }, [urlQ, urlCategory, urlSort, urlPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync searchInput when URL changes externally
  useEffect(() => {
    setSearchInput(urlQ);
  }, [urlQ]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Param helpers ────────────────────────────────────────────────────────

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === '') {
          next.delete(key);
        } else {
          next.set(key, val);
        }
      }
      if (!('page' in updates)) next.set('page', '1');
      return next;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ q: value || null });
    }, 300);
  };

  const handleCategoryChange = (key: string) => {
    updateParams({ category: key === 'all' ? null : key });
  };

  const handleSortChange = (sort: SortOption) => {
    updateParams({ sort });
    setSortOpen(false);
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePriceFilter = (price: string) => {
    updateParams({ price: price === 'all' ? null : price });
  };

  const handleRatingFilter = (rating: string) => {
    updateParams({ rating: rating === 'any' ? null : rating });
  };

  const clearSearch = () => {
    setSearchInput('');
    updateParams({ q: null });
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  // ── Trending scroll helpers ─────────────────────────────────────────────

  const scrollTrending = (dir: 'left' | 'right') => {
    if (!trendingScrollRef.current) return;
    const scrollAmount = trendingScrollRef.current.offsetWidth * 0.6;
    trendingScrollRef.current.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // ── Derived ──────────────────────────────────────────────────────────────

  const getCategoryLabel = (cat: (typeof CATEGORIES)[number]) =>
    cat.label[lang] ?? cat.label.en;

  const currentSortLabel =
    SORT_LABELS[urlSort]?.[lang] ?? SORT_LABELS[urlSort]?.en ?? 'Newest';

  const hasActiveFilters = urlQ || urlCategory !== 'all' || urlPriceFilter !== 'all' || urlRatingFilter !== 'any';
  const showFeatured = !hasActiveFilters && urlPage === 1;

  const bannerSets = featuredSets.slice(0, 5);

  // Client-side filter (price / rating)
  const filteredSets = promptSets.filter(ps => {
    if (urlPriceFilter === 'free' && !ps.isFree) return false;
    if (urlPriceFilter === 'paid' && ps.isFree) return false;
    if (urlRatingFilter !== 'any') {
      const minRating = parseFloat(urlRatingFilter);
      if (ps.averageRating < minRating) return false;
    }
    return true;
  });

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#060608] text-white">
      {/* ═══════════════════════════════════════════
       * TOP BAR — search + sell CTA
       * ═══════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-[#060608]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 sm:px-5 lg:px-6">
          <div className="flex items-center gap-3 py-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-[#C9A84C] hover:border-[#C9A84C]/20 transition-all"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Search */}
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#C9A84C]/70 transition-colors pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder={t('prompt_market.search_placeholder')}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/30 focus:bg-white/[0.04] focus:ring-1 focus:ring-[#C9A84C]/10 transition-all duration-200"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-white/50" />
                </button>
              )}
            </div>

            {/* Sell CTA */}
            <Link
              to="/prompt-market/sell"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#B8963F] hover:from-[#D4B85A] hover:to-[#C9A84C] text-black text-sm font-bold transition-all duration-200 shadow-[0_2px_16px_rgba(201,168,76,0.2)] hover:shadow-[0_4px_24px_rgba(201,168,76,0.35)] active:scale-[0.97] flex-shrink-0"
            >
              <Crown className="w-4 h-4" />
              {t('prompt_market.cta_button')}
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
       * FEATURED BANNER (full width, above sidebar layout)
       * ═══════════════════════════════════════════ */}
      {showFeatured && (
        <section className="px-4 sm:px-5 lg:px-6 pt-5 pb-2">
          <FeaturedBanner sets={bannerSets} loading={featuredLoading} />
        </section>
      )}

      {/* ═══════════════════════════════════════════
       * TRENDING PROMPTS — horizontal scroll row
       * ═══════════════════════════════════════════ */}
      {showFeatured && featuredSets.length > 0 && (
        <section className="px-4 sm:px-5 lg:px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#C9A84C]/[0.08] border border-[#C9A84C]/[0.12] flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-[#C9A84C]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  {t('prompt_market.trending_tokens')}
                </h2>
                <p className="text-[11px] text-white/20">
                  {t('prompt_market.trending_tokens_desc')}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollTrending('left')}
                className="w-7 h-7 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/25 hover:border-[#C9A84C]/20 hover:text-[#C9A84C] transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => scrollTrending('right')}
                className="w-7 h-7 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/25 hover:border-[#C9A84C]/20 hover:text-[#C9A84C] transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div
            ref={trendingScrollRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredSets.map(ps => (
              <TrendingPromptPill key={ps._id} promptSet={ps} />
            ))}
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="px-4 sm:px-5 lg:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ═══════════════════════════════════════════
       * MAIN LAYOUT: Left Sidebar + Content
       * ═══════════════════════════════════════════ */}
      <div className="px-4 sm:px-5 lg:px-6 py-5 pb-16">
        <div className="flex gap-6">
          {/* ── LEFT SIDEBAR — Filters ── */}
          {/* Mobile overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
              w-[280px] lg:w-[240px] xl:w-[260px] flex-shrink-0
              bg-[#0a0a0c]/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none
              border-r border-white/[0.04] lg:border-r-0
              transform transition-transform duration-300 lg:transform-none
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              overflow-y-auto
            `}
          >
            <div className="p-4 lg:p-0 lg:pr-2 lg:sticky lg:top-[72px]">
              {/* Mobile close */}
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#C9A84C]" />
                  {t('prompt_market.filters')}
                </h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Desktop header */}
              <div className="hidden lg:flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {t('prompt_market.filters')}
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="text-[11px] text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors"
                  >
                    {t('prompt_market.reset_filters')}
                  </button>
                )}
              </div>

              {/* Glass container for filters */}
              <div className="lg:bg-white/[0.02] lg:backdrop-blur-sm lg:border lg:border-white/[0.05] lg:rounded-2xl lg:p-4">
                {/* ─ Search (sidebar) ─ */}
                <FilterSection title={t('prompt_market.categories')} defaultOpen={true}>
                  <div className="space-y-0.5">
                    {CATEGORIES.map(cat => {
                      const active = urlCategory === cat.key || (cat.key === 'all' && !searchParams.get('category'));
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => {
                            handleCategoryChange(cat.key);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                            active
                              ? 'bg-[#C9A84C]/[0.1] text-[#E5C767] border border-[#C9A84C]/[0.15]'
                              : 'text-white/35 hover:text-white/60 hover:bg-white/[0.03] border border-transparent'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          {getCategoryLabel(cat)}
                        </button>
                      );
                    })}
                  </div>
                </FilterSection>

                {/* ─ Price filter ─ */}
                <FilterSection title={t('prompt_market.price_range')} defaultOpen={true}>
                  <div className="space-y-0.5">
                    {[
                      { key: 'all', label: t('prompt_market.all_prices') },
                      { key: 'free', label: t('prompt_market.free_only') },
                      { key: 'paid', label: t('prompt_market.paid_only') },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => handlePriceFilter(opt.key)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                          urlPriceFilter === opt.key
                            ? 'bg-[#C9A84C]/[0.1] text-[#E5C767] border border-[#C9A84C]/[0.15]'
                            : 'text-white/35 hover:text-white/60 hover:bg-white/[0.03] border border-transparent'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* ─ Rating filter ─ */}
                <FilterSection title={t('prompt_market.rating')} defaultOpen={false}>
                  <div className="space-y-0.5">
                    {[
                      { key: 'any', label: t('prompt_market.any_rating') },
                      { key: '4', label: '4+ ★' },
                      { key: '3', label: '3+ ★' },
                      { key: '2', label: '2+ ★' },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => handleRatingFilter(opt.key)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                          urlRatingFilter === opt.key
                            ? 'bg-[#C9A84C]/[0.1] text-[#E5C767] border border-[#C9A84C]/[0.15]'
                            : 'text-white/35 hover:text-white/60 hover:bg-white/[0.03] border border-transparent'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* ─ Sort (sidebar) ─ */}
                <FilterSection title={t('prompt_market.sort_by')} defaultOpen={false}>
                  <div className="space-y-0.5">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleSortChange(opt)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                          urlSort === opt
                            ? 'bg-[#C9A84C]/[0.1] text-[#E5C767] border border-[#C9A84C]/[0.15]'
                            : 'text-white/35 hover:text-white/60 hover:bg-white/[0.03] border border-transparent'
                        }`}
                      >
                        {SORT_LABELS[opt][lang] ?? SORT_LABELS[opt].en}
                      </button>
                    ))}
                  </div>
                </FilterSection>
              </div>

              {/* Reset all (mobile) */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    resetAllFilters();
                    setSidebarOpen(false);
                  }}
                  className="w-full mt-4 px-4 py-2.5 rounded-xl border border-[#C9A84C]/15 text-[#C9A84C] text-xs font-medium hover:bg-[#C9A84C]/[0.06] transition lg:hidden"
                >
                  {t('prompt_market.reset_filters')}
                </button>
              )}
            </div>
          </aside>

          {/* ── RIGHT — Main Content ── */}
          <div className="flex-1 min-w-0">
            {/* ── Toolbar: results + active filters + sort + view toggle ── */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5"
            >
              {/* Left — results + active filter chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {!loading && (
                  <span className="text-xs text-white/20 font-medium">
                    {pagination.total > 0
                      ? `${pagination.total} ${t('prompt_market.results')}`
                      : ''}
                  </span>
                )}
                {urlQ && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C9A84C]/[0.06] border border-[#C9A84C]/[0.1] text-xs text-[#C9A84C]/80">
                    <Search className="w-3 h-3" />
                    &quot;{urlQ}&quot;
                    <button onClick={clearSearch} className="hover:text-white transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {urlCategory !== 'all' && searchParams.get('category') && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/35">
                    {urlCategory}
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className="hover:text-white transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {urlPriceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/35">
                    {urlPriceFilter === 'free' ? t('prompt_market.free_only') : t('prompt_market.paid_only')}
                    <button
                      onClick={() => handlePriceFilter('all')}
                      className="hover:text-white transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              {/* Right — sort dropdown + view toggle */}
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex items-center border border-white/[0.05] rounded-lg overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#C9A84C]/[0.1] text-[#C9A84C]'
                        : 'text-white/20 hover:text-white/40'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[#C9A84C]/[0.1] text-[#C9A84C]'
                        : 'text-white/20 hover:text-white/40'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sort dropdown (desktop) */}
                <div className="relative flex-shrink-0 hidden lg:block" ref={sortRef}>
                  <button
                    onClick={() => setSortOpen(v => !v)}
                    className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2 text-sm text-white/40 hover:border-[#C9A84C]/15 hover:text-white/60 transition whitespace-nowrap"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-white/20" />
                    {currentSortLabel}
                    <ChevronDown className={`w-3.5 h-3.5 text-white/20 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1 z-50 bg-[#0c0c0e]/95 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl w-52"
                      >
                        {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleSortChange(opt)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-white/[0.03] ${
                              urlSort === opt ? 'text-[#C9A84C] font-medium bg-[#C9A84C]/[0.04]' : 'text-white/40'
                            }`}
                          >
                            {SORT_LABELS[opt][lang] ?? SORT_LABELS[opt].en}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* ── Grid / List / Loading / Empty ── */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32 gap-4"
                >
                  <Loader2 className="w-7 h-7 text-[#C9A84C]/60 animate-spin" />
                  <p className="text-white/15 text-sm">{t('common.loading') || 'Loading...'}</p>
                </motion.div>
              ) : filteredSets.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32 gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                    <Package className="w-8 h-8 text-white/[0.08]" />
                  </div>
                  <p className="text-white/30 text-base font-medium">
                    {t('prompt_market.empty_title')}
                  </p>
                  <p className="text-white/12 text-sm text-center max-w-xs">
                    {t('prompt_market.empty_desc')}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={resetAllFilters}
                      className="mt-2 px-4 py-2 rounded-xl border border-[#C9A84C]/15 text-[#C9A84C]/70 text-sm font-medium hover:bg-[#C9A84C]/[0.06] transition"
                    >
                      {t('prompt_market.clear_filters')}
                    </button>
                  )}
                </motion.div>
              ) : viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
                >
                  {filteredSets.map((ps, i) => (
                    <PromptSetCard key={ps._id ?? i} promptSet={ps} index={i} />
                  ))}
                </motion.div>
              ) : (
                /* List view */
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  {filteredSets.map((ps, i) => {
                    const pTitle = localize(ps.title, lang);
                    const desc = localize(ps.description, lang);
                    const sName =
                      typeof ps.sellerId === 'object' && ps.sellerId !== null
                        ? ps.sellerId.name
                        : '';
                    const sAvatar =
                      typeof ps.sellerId === 'object' && ps.sellerId !== null
                        ? ps.sellerId.avatar
                        : undefined;
                    const promptCount = ps.promptCount ?? ps.prompts?.length ?? 0;

                    return (
                      <motion.div
                        key={ps._id ?? i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.02 }}
                      >
                        <Link
                          to={`/prompt-market/${ps.slug}`}
                          className="flex items-center gap-4 bg-white/[0.015] border border-white/[0.05] hover:border-[#C9A84C]/15 rounded-xl p-3 sm:p-4 transition-all duration-200 hover:bg-white/[0.025] hover:shadow-[0_4px_20px_rgba(201,168,76,0.04)] group"
                        >
                          {/* Cover */}
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.06]">
                            {ps.coverImage ? (
                              <img src={ps.coverImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#C9A84C]/10 to-black/40 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[#C9A84C]/20" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#E5C767] transition-colors">
                              {pTitle}
                            </h3>
                            {desc && (
                              <p className="text-xs text-white/20 truncate mt-0.5">{desc}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-white/20">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {promptCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                {ps.purchaseCount}
                              </span>
                              {ps.reviewCount > 0 && (
                                <span className="flex items-center gap-1 text-[#E5C767]/50">
                                  <Star className="w-3 h-3 fill-[#E5C767]/40" />
                                  {ps.averageRating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Seller */}
                          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                            {sAvatar ? (
                              <img src={sAvatar} alt="" className="w-6 h-6 rounded-full ring-1 ring-white/[0.08]" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#C9A84C]/[0.08] flex items-center justify-center">
                                <User className="w-3 h-3 text-[#C9A84C]/30" />
                              </div>
                            )}
                            <span className="text-xs text-white/20 max-w-[80px] truncate">{sName}</span>
                          </div>

                          {/* Price */}
                          <div className="flex-shrink-0 text-right">
                            <span className={`text-sm font-bold ${ps.isFree ? 'text-[#C9A84C]' : 'text-white'}`}>
                              {ps.isFree ? 'Free' : `${ps.priceSKT} SKT`}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Pagination ── */}
            {!loading && pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center gap-2 mt-10"
              >
                <button
                  disabled={urlPage <= 1}
                  onClick={() => handlePageChange(urlPage - 1)}
                  className="px-3 py-2 rounded-xl border border-white/[0.05] text-sm text-white/30 hover:border-[#C9A84C]/20 hover:text-[#C9A84C] disabled:opacity-15 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - urlPage) <= 1)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-white/10 text-sm select-none">
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => handlePageChange(item as number)}
                          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                            urlPage === item
                              ? 'bg-[#C9A84C] text-black shadow-[0_0_12px_rgba(201,168,76,0.2)]'
                              : 'border border-white/[0.05] text-white/25 hover:border-[#C9A84C]/15 hover:text-[#C9A84C]'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  disabled={urlPage >= pagination.totalPages}
                  onClick={() => handlePageChange(urlPage + 1)}
                  className="px-3 py-2 rounded-xl border border-white/[0.05] text-sm text-white/30 hover:border-[#C9A84C]/20 hover:text-[#C9A84C] disabled:opacity-15 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Seller CTA Banner ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-14 relative overflow-hidden rounded-2xl border border-white/[0.06]"
            >
              {/* BG glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/[0.04] via-[#8B7635]/[0.02] to-[#C9A84C]/[0.04]" />
              <div className="absolute top-0 left-1/3 w-64 h-32 bg-[#C9A84C]/[0.06] rounded-full blur-[80px]" />

              <div className="relative px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#C9A84C]/[0.08] border border-[#C9A84C]/[0.1] flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">
                      {t('prompt_market.cta_title')}
                    </p>
                    <p className="text-white/25 text-xs mt-0.5">
                      {t('prompt_market.cta_desc')}
                    </p>
                  </div>
                </div>
                <Link
                  to="/prompt-market/sell"
                  className="shrink-0 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#B8963F] hover:from-[#D4B85A] hover:to-[#C9A84C] text-black text-sm font-bold transition-all duration-200 shadow-[0_2px_20px_rgba(201,168,76,0.2)] hover:shadow-[0_4px_28px_rgba(201,168,76,0.35)] active:scale-[0.97]"
                >
                  {t('prompt_market.cta_button')}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptMarketPage;
