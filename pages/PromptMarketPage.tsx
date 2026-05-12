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
  TrendingUp,
  Flame,
  X,
  Star,
  ShoppingBag,
  FileText,
  User,
  Crown,
  ArrowUpRight,
  ArrowRight,
  LayoutGrid,
  List,
  Filter,
  ChevronUp,
  Users,
  Coins,
  Cpu,
  Eye,
  ImageIcon,
  PlayCircle,
  Video,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { promptMarketApi } from '../apis/prompt-market';
import PromptSetCard from '../components/prompt-market/PromptSetCard';
import type { PromptSet, LocalizedString } from '../types';

// ─── Constants ──────────────────────────────────────────────────────────────

type SortOption = 'newest' | 'popular' | 'price_low' | 'price_high';
type MediaFilter = 'all' | 'image' | 'video' | 'image_video';

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  all: { en: 'All categories', vi: 'Tất cả danh mục', ko: '전체', ja: 'すべて' },
  design: { en: 'Design showcase', vi: 'Showcase thiết kế', ko: '디자인', ja: 'デザイン' },
  marketing: { en: 'Marketing campaign', vi: 'Campaign marketing', ko: '마케팅', ja: 'マーケティング' },
  education: { en: 'Education / guide', vi: 'Giáo dục / hướng dẫn', ko: '교육', ja: '教育' },
  business: { en: 'Business kit', vi: 'Bộ business', ko: '비즈니스', ja: 'ビジネス' },
  writing: { en: 'Writing system', vi: 'Hệ viết nội dung', ko: '글쓰기', ja: '文章' },
  coding: { en: 'Coding', vi: 'Lập trình', ko: '코딩', ja: 'コーディング' },
  other: { en: 'Other', vi: 'Khác', ko: '기타', ja: 'その他' },
};

const MEDIA_LABELS: Record<MediaFilter, Record<string, string>> = {
  all: { en: 'All media', vi: 'Tất cả media', ko: '전체 미디어', ja: 'すべてのメディア' },
  image: { en: 'Has images', vi: 'Có hình ảnh', ko: '이미지 포함', ja: '画像あり' },
  video: { en: 'Has video', vi: 'Có video', ko: '비디오 포함', ja: '動画あり' },
  image_video: { en: 'Images + video', vi: 'Hình ảnh + video', ko: '이미지 + 비디오', ja: '画像 + 動画' },
};

const SORT_LABELS: Record<SortOption, Record<string, string>> = {
  newest: { en: 'Newest', vi: 'Mới nhất', ko: '최신', ja: '最新' },
  popular: { en: 'Popular', vi: 'Phổ biến', ko: '인기', ja: '人気' },
  price_low: { en: 'Price: Low → High', vi: 'Giá: Thấp → Cao', ko: '가격: 낮은 순', ja: '価格: 安い順' },
  price_high: { en: 'Price: High → Low', vi: 'Giá: Cao → Thấp', ko: '가격: 높은 순', ja: '価格: 高い順' },
};

const PAGE_LIMIT = 12;
const FILTER_CATALOG_LIMIT = 160;
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Stagger animation variants ─────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.08 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18, ease: EASE_OUT_EXPO },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.46, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.985,
    transition: { duration: 0.18, ease: EASE_OUT_EXPO },
  },
};

const sectionRevealVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: EASE_OUT_EXPO },
  },
};

const filterPanelVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: EASE_OUT_EXPO,
      staggerChildren: 0.035,
      delayChildren: 0.08,
    },
  },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: EASE_OUT_EXPO },
  },
};

// ─── Helper: localize PromptSet fields ─────────────────────────────────────

function localize(val: string | LocalizedString | Record<string, string> | undefined, lang: string): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return (val as Record<string, string>)[lang] || val.en || '';
}

function shufflePromptSets(items: PromptSet[]): PromptSet[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function compactNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return String(value);
}

function getPromptSetThumb(promptSet: PromptSet): { url?: string; hasVideo: boolean } {
  const videoExample = (promptSet.examples ?? []).find(ex => ex.video);
  const imageExample = (promptSet.examples ?? []).find(ex => ex.image);
  return {
    url: videoExample?.image || imageExample?.image || promptSet.coverImage,
    hasVideo: Boolean(videoExample?.video),
  };
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
    <motion.div variants={itemVariants} className="border-b border-[rgba(201,168,76,0.16)] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-[13px] font-semibold text-white/60 hover:text-white/80 transition-colors"
      >
        {title}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/40" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/40" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FilterOptionButton({
  active,
  label,
  count,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.985 }}
      className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[12px] font-medium transition-all duration-150 ${
        active
          ? 'bg-brand-blue/[0.12] text-brand-blue border-brand-blue/45 shadow-[0_0_18px_rgba(201,168,76,0.08)]'
          : 'text-white/50 hover:text-white/74 hover:bg-white/[0.035] border-[rgba(201,168,76,0.14)]'
      }`}
    >
      <span className="min-w-0 flex items-center gap-2 text-left">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      {typeof count === 'number' && (
          <span className="text-[10px] text-white/35 tabular-nums">{count}</span>
      )}
    </motion.button>
  );
}

// ─── Model label map ─────────────────────────────────────────────────────────

const MODEL_LABELS: Partial<Record<string, string>> = {
  'gpt-4': 'GPT-4', 'gpt-4o': 'GPT-4o', 'gpt-5': 'GPT-5',
  'claude-3': 'Claude 3', 'claude-4': 'Claude 4',
  'gemini': 'Gemini', 'gemini-2': 'Gemini 2',
  'midjourney': 'Midjourney', 'dall-e-3': 'DALL·E 3',
  'stable-diffusion': 'Stable Diffusion', 'flux': 'Flux',
  'llama': 'Llama', 'mistral': 'Mistral',
};

type FeaturedMediaItem = {
  key: string;
  type: 'image' | 'video';
  url: string;
  poster?: string;
  label: string;
  caption: string;
};

// ─── Featured Banner Component ─────────────────────────────────────────────

function FeaturedBanner({
  sets,
  loading,
  stats,
  statsLoading,
}: {
  sets: PromptSet[];
  loading: boolean;
  stats: { totalPrompts: number; totalSellers: number; totalPurchases: number; totalSKTVolume: number; totalReviews: number };
  statsLoading: boolean;
}) {
  const { t, lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sets.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % sets.length);
    }, 6000);
  }, [sets.length]);

  useEffect(() => {
    resetInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [resetInterval]);

  const goNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % sets.length);
    resetInterval();
  }, [sets.length, resetInterval]);

  const goPrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + sets.length) % sets.length);
    resetInterval();
  }, [sets.length, resetInterval]);

  if (loading) {
    return (
      <motion.div
        className="min-h-[420px] md:min-h-[480px] bg-[var(--atlas-bg-panel)]/50 flex flex-col items-center justify-center gap-4 overflow-hidden border-b border-brand-blue/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
      >
        <motion.div
          className="grid h-14 w-14 place-items-center rounded-xl border border-brand-blue/20 bg-brand-blue/[0.08]"
          animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0 rgba(201,168,76,0)', '0 0 32px rgba(201,168,76,0.16)', '0 0 0 rgba(201,168,76,0)'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
        </motion.div>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full w-1/2 rounded-full bg-brand-blue/70"
            animate={{ x: ['-100%', '220%'] }}
            transition={{ duration: 1.25, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    );
  }

  if (sets.length === 0) return null;

  const current = sets[activeIndex];
  const title = localize(current.title, lang);
  const desc = localize(current.description, lang);
  const sellerName =
    typeof current.sellerId === 'object' && current.sellerId !== null
      ? current.sellerId.name
      : t('prompt_market.anonymous');
  const promptCount = current.promptCount ?? current.prompts?.length ?? 0;
  const visibleModels = (current.models ?? []).slice(0, 6);
  const seenMedia = new Set<string>();
  const rawMediaItems: Array<FeaturedMediaItem | null> = [
    current.coverImage
      ? {
          key: `${current._id}-cover`,
          type: 'image' as const,
          url: current.coverImage,
          label: 'Cover',
          caption: title,
        }
      : null,
    ...(current.examples ?? []).flatMap((ex, index) => {
      const label = ex.promptTitle || `Prompt ${index + 1}`;
      return [
        ex.image
          ? {
              key: `${current._id}-image-${index}`,
              type: 'image' as const,
              url: ex.image,
              label,
              caption: ex.input || ex.output || label,
            }
          : null,
        ex.video
          ? {
              key: `${current._id}-video-${index}`,
              type: 'video' as const,
              url: ex.video,
              poster: ex.image || current.coverImage,
              label: 'Video demo',
              caption: ex.output || ex.input || label,
            }
          : null,
      ];
    }),
  ];
  const mediaItems = rawMediaItems.filter((item): item is FeaturedMediaItem => {
    if (!item) return false;
    const mediaKey = `${item.type}:${item.url}`;
    if (seenMedia.has(mediaKey)) return false;
    seenMedia.add(mediaKey);
    return true;
  });
  const heroMedia = mediaItems.find(item => item.type === 'video') ?? mediaItems[0];
  const samePackPreviewMedia = mediaItems.filter(item => item.type === 'image' || item.poster);
  const leftPeekMedia = samePackPreviewMedia[1] ?? samePackPreviewMedia[0];
  const rightPeekMedia = samePackPreviewMedia[2] ?? samePackPreviewMedia[samePackPreviewMedia.length - 1] ?? samePackPreviewMedia[0];
  const imageCount = mediaItems.filter(item => item.type === 'image').length;
  const videoCount = mediaItems.filter(item => item.type === 'video').length;
  const getPeekMediaUrl = (item?: FeaturedMediaItem) => item?.poster || item?.url;

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: 480 }}>
      {/* ── Nav arrows ── */}
      {sets.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 md:left-6 lg:left-10 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center transition-all hover:scale-110 bg-brand-blue/15 border border-brand-blue/30 text-brand-blue backdrop-blur-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 md:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center transition-all hover:scale-110 bg-brand-blue/15 border border-brand-blue/30 text-brand-blue backdrop-blur-sm"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* ── 3-column layout ── */}
      <div className="flex w-full items-stretch overflow-hidden border-b border-brand-blue/10" style={{ minHeight: 480 }}>

        {/* LEFT PEEK — same prompt pack media (hidden on mobile) */}
        {sets.length > 1 && (
          <div
            className="hidden lg:block flex-shrink-0 cursor-pointer relative overflow-hidden"
            style={{ width: '10%', opacity: 0.5 }}
            onClick={goPrev}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${current._id}-left-peek-${leftPeekMedia?.key ?? 'fallback'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                {getPeekMediaUrl(leftPeekMedia) ? (
                  <img src={getPeekMediaUrl(leftPeekMedia)} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-blue/20 to-black" />
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(20,20,24,0.9), transparent)' }} />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* CENTER — Hero with cover image + overlay text */}
        <div className="flex-1 relative overflow-hidden" style={{ minHeight: 480 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current._id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {/* Main showcase media */}
              {heroMedia?.type === 'video' ? (
                <video
                  src={heroMedia.url}
                  poster={heroMedia.poster || current.coverImage}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : heroMedia?.url || current.coverImage ? (
                <img
                  src={heroMedia?.url || current.coverImage}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-blue/15 via-[var(--atlas-bg-panel)] to-black" />
              )}

              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(20,20,24,0.95) 0%, rgba(20,20,24,0.6) 40%, rgba(20,20,24,0.15) 100%)',
                }}
              />

              {/* Text overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
                {/* Category badge */}
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-3 bg-brand-blue/15 border border-brand-blue/30 text-brand-blue"
                >
                  {current.category}
                </motion.span>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-white leading-tight max-w-xl"
                >
                  {title}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm md:text-base max-w-lg mb-4 leading-relaxed text-white/70 line-clamp-2"
                >
                  {desc}
                </motion.p>

                {/* Inline stats */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex items-center gap-3 flex-wrap mb-5 text-[12px] text-white/60"
                >
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />{sellerName}
                  </span>
                  <span className="text-white/30">·</span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />{promptCount} prompts
                  </span>
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" />{current.purchaseCount}
                  </span>
                  {current.reviewCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-500/80">
                      <Star className="w-3 h-3 fill-amber-500/70" />{current.averageRating.toFixed(1)}
                    </span>
                  )}
                  {current.viewCount != null && current.viewCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />{current.viewCount > 999 ? `${(current.viewCount / 1000).toFixed(1)}k` : current.viewCount}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-[11px] font-bold ${
                    current.isFree
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                  }`}>
                    {current.isFree ? t('prompt_market.free_label') : `${current.priceSKT} SKT`}
                  </span>
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    to={`/prompt-market/${current.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white text-[13px] font-bold transition-all duration-200 shadow-[0_4px_20px_rgba(201,168,76,0.25)] hover:shadow-[0_6px_28px_rgba(201,168,76,0.4)] hover:scale-105 active:scale-[0.97] group/cta"
                  >
                    {t('prompt_market.view_details')}
                    <ArrowRight size={14} className="group-hover/cta:translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT PANEL — examples, models, info (hidden on mobile) */}
        <div
          className="hidden md:flex flex-col flex-shrink-0 p-5 lg:p-6"
          style={{ width: 340, background: 'rgba(20,20,24,0.95)', borderLeft: '1px solid rgba(201,168,76,0.12)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col h-full"
            >
              {/* Media set */}
              {mediaItems.length > 0 && (
                <>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-blue">
                      Media Set
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-white/45">
                      <span className="inline-flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {imageCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        {videoCount}
                      </span>
                    </div>
                  </div>

                  {heroMedia && (
                    <motion.div
                      key={`${heroMedia.key}-hero`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 }}
                      className="group/hero mb-3 overflow-hidden border border-brand-blue/20 bg-white/[0.03]"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        {heroMedia.type === 'video' ? (
                          <video
                            src={heroMedia.url}
                            poster={heroMedia.poster}
                            className="h-full w-full object-cover"
                            controls
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={heroMedia.url}
                            alt={heroMedia.caption}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/hero:scale-105"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute left-2 top-2 inline-flex items-center gap-1.5 bg-black/65 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm">
                          {heroMedia.type === 'video' ? <PlayCircle className="h-3 w-3 text-brand-blue" /> : <ImageIcon className="h-3 w-3 text-brand-blue" />}
                          {heroMedia.label}
                        </div>
                      </div>
                      <div className="p-2.5">
                        <p className="line-clamp-2 text-[11px] leading-relaxed text-white/65">{heroMedia.caption}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {mediaItems.slice(0, 6).map((item, i) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="group/ex overflow-hidden border border-brand-blue/10 bg-white/[0.02] transition-colors hover:border-brand-blue/30"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          {item.type === 'video' ? (
                            <>
                              <video
                                src={item.url}
                                poster={item.poster}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <PlayCircle className="h-5 w-5 text-white drop-shadow" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.caption}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover/ex:scale-110"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div className="p-1.5">
                          <p className="truncate text-[9px] font-semibold text-white/60">{item.label}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* Compatible AI Models */}
              {visibleModels.length > 0 && (
                <>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3 text-brand-blue">
                    {t('prompt_market.compatible_models') || 'Compatible Models'}
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {visibleModels.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-[rgba(201,168,76,0.16)] text-[11px] text-white/70 font-medium hover:border-brand-blue/30 transition-colors"
                      >
                        <Cpu className="w-3 h-3 text-brand-blue/60" />
                        {MODEL_LABELS[m] ?? m}
                      </span>
                    ))}
                    {(current.models ?? []).length > 6 && (
                      <span className="px-2 py-1 text-[11px] text-white/40">
                        +{(current.models ?? []).length - 6}
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Tags */}
              {current.tags && current.tags.length > 0 && (
                <>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3 text-brand-blue">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {current.tags.slice(0, 8).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-white/[0.04] border border-[rgba(201,168,76,0.12)] text-[10px] text-white/60 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {/* Marketplace stats at bottom */}
              {!statsLoading && (stats.totalPrompts > 0 || stats.totalSellers > 0) && (
                <div className="mt-auto pt-4 border-t border-brand-blue/10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-[16px] font-bold text-brand-blue">{stats.totalPrompts.toLocaleString()}+</p>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider">{t('prompt_market.stats_prompts')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[16px] font-bold text-violet-400">{stats.totalSellers.toLocaleString()}</p>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider">{t('prompt_market.stats_sellers')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[16px] font-bold text-emerald-400">{stats.totalPurchases.toLocaleString()}</p>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider">{t('prompt_market.stats_purchases')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[16px] font-bold text-amber-400">{stats.totalSKTVolume.toLocaleString()}</p>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider">SKT Volume</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback: if no examples and no models, show prompt preview cards */}
              {mediaItems.length === 0 && visibleModels.length === 0 && (
                <>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3 text-brand-blue">
                    Featured Prompts
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 flex-1">
                    {sets.slice(0, 4).map((ps, i) => {
                      const cardTitle = localize(ps.title, lang);
                      return (
                        <motion.div
                          key={ps._id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          className="group/card cursor-pointer overflow-hidden border border-brand-blue/10 hover:border-brand-blue/30 transition-colors"
                          onClick={() => setActiveIndex(i)}
                        >
                          <div className="aspect-[4/3] overflow-hidden">
                            {ps.coverImage ? (
                              <img src={ps.coverImage} alt={cardTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" loading="lazy" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-brand-blue/10 to-[var(--atlas-bg-panel)] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-brand-blue/30" />
                              </div>
                            )}
                          </div>
                          <div className="p-2" style={{ background: 'rgba(20,20,24,0.9)' }}>
                            <p className="text-[11px] font-semibold text-white/80 truncate">{cardTitle}</p>
                            <p className="text-[10px] font-bold mt-0.5 text-brand-blue">
                              {ps.isFree ? t('prompt_market.free_label') : `${ps.priceSKT} SKT`}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT PEEK — same prompt pack media (hidden on smaller screens) */}
        {sets.length > 1 && (
          <div
            className="hidden lg:block flex-shrink-0 cursor-pointer relative overflow-hidden"
            style={{ width: '10%', opacity: 0.5 }}
            onClick={goNext}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${current._id}-right-peek-${rightPeekMedia?.key ?? 'fallback'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                {getPeekMediaUrl(rightPeekMedia) ? (
                  <img src={getPeekMediaUrl(rightPeekMedia)} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-blue/20 to-black" />
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, rgba(20,20,24,0.9), transparent)' }} />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Dot indicators ── */}
      {sets.length > 1 && (
        <div className="flex justify-center gap-2 py-4">
          {sets.slice(0, Math.min(sets.length, 8)).map((_, i) => (
            <button
              key={i}
              onClick={() => { setActiveIndex(i); resetInterval(); }}
              className="transition-all"
              style={
                i === activeIndex
                  ? { width: 24, height: 5, background: '#C9A84C' }
                  : { width: 5, height: 5, background: 'rgba(201,168,76,0.3)', borderRadius: '50%' }
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Animated Counter ────────────────────────────────────────────────────

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current || value === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1800;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const formatted = display >= 1000 ? `${(display / 1000).toFixed(display >= 10000 ? 0 : 1)}k` : display.toString();

  return (
    <span ref={ref} className="tabular-nums">
      {formatted}{suffix}
    </span>
  );
}

// ─── Trending Token Card (horizontal scroll) ──────────────────────────────

function TrendingPromptPill({ promptSet, index }: { promptSet: PromptSet; index: number }) {
  const { lang } = useLanguage();
  const title = localize(promptSet.title, lang);
  const thumb = getPromptSetThumb(promptSet);
  const statsValue = promptSet.purchaseCount || promptSet.viewCount || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.045, ease: EASE_OUT_EXPO }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
    >
      <Link
        to={`/prompt-market/${promptSet.slug}`}
        className="group flex h-[62px] min-w-[260px] flex-shrink-0 items-center gap-3 rounded-xl border border-[rgba(201,168,76,0.16)] bg-[#0f1317]/90 p-1.5 transition-all duration-200 hover:border-brand-blue/35 hover:bg-[#151a20] hover:shadow-[0_4px_20px_rgba(201,168,76,0.08)]"
      >
        <div className="grid h-11 w-5 place-items-center rounded-md bg-brand-blue text-[11px] font-bold text-black">
          {index + 1}
        </div>

        <div className="relative h-11 w-[90px] flex-shrink-0 overflow-hidden rounded-lg border border-[rgba(201,168,76,0.16)] bg-white/[0.04]">
          {thumb.url ? (
            <img src={thumb.url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-blue/10">
              <Sparkles className="w-4 h-4 text-brand-blue/40" />
            </div>
          )}
          {thumb.hasVideo && (
            <div className="absolute inset-0 grid place-items-center bg-black/18">
              <PlayCircle className="h-4 w-4 text-white drop-shadow" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-[12px] font-semibold text-white/82 transition-colors group-hover:text-brand-blue">
            {title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-white/46">
            <span>{CATEGORY_LABELS[promptSet.category]?.[lang] ?? promptSet.category}</span>
            <span className="inline-flex items-center gap-1 text-brand-blue">
              <Star className="h-3 w-3 fill-current" />
              {promptSet.averageRating?.toFixed(1) || '4.8'}
            </span>
            <span>{compactNumber(statsValue)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────

const PromptMarketPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive state from URL params
  const urlQ = searchParams.get('q') ?? '';
  const urlSort = (searchParams.get('sort') ?? 'newest') as SortOption;
  const urlPage = parseInt(searchParams.get('page') ?? '1', 10);
  const urlCategory = searchParams.get('category') ?? 'all';
  const urlPriceFilter = searchParams.get('price') ?? 'all';
  const urlRatingFilter = searchParams.get('rating') ?? 'any';
  const urlMediaFilter = (searchParams.get('media') ?? 'all') as MediaFilter;
  const urlFeaturedFilter = searchParams.get('featured') === 'true';
  const urlTags = searchParams.get('tags') ?? '';
  const urlModels = searchParams.get('models') ?? '';
  const activeTags = urlTags.split(',').map(v => v.trim()).filter(Boolean);
  const activeModels = urlModels.split(',').map(v => v.trim()).filter(Boolean);

  // Local search input (debounced before syncing to URL)
  const [searchInput, setSearchInput] = useState(urlQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Data state
  const [promptSets, setPromptSets] = useState<PromptSet[]>([]);
  const [featuredSets, setFeaturedSets] = useState<PromptSet[]>([]);
  const [filterCatalog, setFilterCatalog] = useState<PromptSet[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marketStats, setMarketStats] = useState({ totalPrompts: 0, totalSellers: 0, totalPurchases: 0, totalSKTVolume: 0, totalReviews: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const sortRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);

  // ── Fetch featured + stats ─────────────────────────────────────────────────

  useEffect(() => {
    const loadFeatured = async () => {
      setFeaturedLoading(true);
      const res = await promptMarketApi.getFeatured(8);
      setFeaturedSets(shufflePromptSets(res.data ?? []));
      setFeaturedLoading(false);
    };
    const loadStats = async () => {
      setStatsLoading(true);
      const res = await promptMarketApi.getStats();
      setMarketStats(res);
      setStatsLoading(false);
    };
    loadFeatured();
    loadStats();
  }, []);

  // ── Fetch main list ───────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await promptMarketApi.list({
      q: urlQ || undefined,
      category: urlCategory !== 'all' ? urlCategory : undefined,
      tags: activeTags.length ? activeTags.join(',') : undefined,
      models: activeModels.length ? activeModels.join(',') : undefined,
      media: urlMediaFilter !== 'all' ? urlMediaFilter : undefined,
      price: urlPriceFilter !== 'all' ? urlPriceFilter as 'free' | 'paid' : undefined,
      rating: urlRatingFilter !== 'any' ? urlRatingFilter : undefined,
      featured: urlFeaturedFilter || undefined,
      sort: urlSort,
      page: urlPage,
      limit: PAGE_LIMIT,
    });
    setPromptSets(res.data ?? []);
    setPagination(res.pagination ?? { page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 0 });
    setLoading(false);
  }, [urlQ, urlCategory, urlTags, urlModels, urlMediaFilter, urlPriceFilter, urlRatingFilter, urlFeaturedFilter, urlSort, urlPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadFilterCatalog = async () => {
      const res = await promptMarketApi.list({
        sort: 'popular',
        page: 1,
        limit: FILTER_CATALOG_LIMIT,
      });
      setFilterCatalog(res.data ?? []);
    };
    loadFilterCatalog();
  }, []);

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

  const handleCategoryFilter = (category: string) => {
    updateParams({ category: category === 'all' ? null : category });
  };

  const handleMediaFilter = (media: MediaFilter) => {
    updateParams({ media: media === 'all' ? null : media });
  };

  const handleFeaturedFilter = () => {
    updateParams({ featured: urlFeaturedFilter ? null : 'true' });
  };

  const toggleMultiFilter = (key: 'tags' | 'models', value: string) => {
    const current = key === 'tags' ? activeTags : activeModels;
    const next = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateParams({ [key]: next.length ? next.join(',') : null });
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

  const currentSortLabel =
    SORT_LABELS[urlSort]?.[lang] ?? SORT_LABELS[urlSort]?.en ?? 'Newest';

  const hasActiveFilters =
    !!urlQ ||
    urlCategory !== 'all' ||
    urlPriceFilter !== 'all' ||
    urlRatingFilter !== 'any' ||
    urlMediaFilter !== 'all' ||
    urlFeaturedFilter ||
    activeTags.length > 0 ||
    activeModels.length > 0;
  const showFeatured = !hasActiveFilters && urlPage === 1;

  const bannerSets = featuredSets.slice(0, 5);

  const catalogSource = filterCatalog.length ? filterCatalog : [...promptSets, ...featuredSets];
  const categoryCounts = catalogSource.reduce<Record<string, number>>((acc, ps) => {
    acc[ps.category] = (acc[ps.category] || 0) + 1;
    return acc;
  }, {});
  const tagCounts = catalogSource.reduce<Record<string, number>>((acc, ps) => {
    (ps.tags ?? []).forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});
  const modelCounts = catalogSource.reduce<Record<string, number>>((acc, ps) => {
    (ps.models ?? []).forEach(model => {
      acc[model] = (acc[model] || 0) + 1;
    });
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 18);
  const topModels = Object.entries(modelCounts).sort((a, b) => b[1] - a[1]).slice(0, 14);
  const totalImageSets = catalogSource.filter(ps => (ps.examples ?? []).some(ex => ex.image)).length;
  const totalVideoSets = catalogSource.filter(ps => (ps.examples ?? []).some(ex => ex.video)).length;

  const filteredSets = promptSets;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#080a0d] text-white font-[Manrope,sans-serif] pt-24 md:pt-28">

      {/* ═══════════════════════════════════════════
       * FEATURED BANNER (full width, above sidebar layout)
       * ═══════════════════════════════════════════ */}
      {showFeatured && (
        <motion.section
          variants={sectionRevealVariants}
          initial="hidden"
          animate="visible"
          className="pb-2"
        >
          <FeaturedBanner sets={bannerSets} loading={featuredLoading} stats={marketStats} statsLoading={statsLoading} />
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════
       * TRENDING PROMPTS — horizontal scroll row
       * ═══════════════════════════════════════════ */}
      {showFeatured && featuredSets.length > 0 && (
        <motion.section
          variants={sectionRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-[1500px] mx-auto px-4 sm:px-6 py-5"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-brand-blue/[0.12] border border-brand-blue/[0.18] flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white/80">
                    {t('prompt_market.trending_tokens') || 'Bộ prompt đang thịnh hành'}
                  </h2>
                  <p className="text-[11px] text-white/50">
                    {t('prompt_market.trending_tokens_desc')}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => scrollTrending('left')}
                  className="w-7 h-7 rounded-md border border-[rgba(201,168,76,0.16)] bg-[var(--atlas-bg-panel)] flex items-center justify-center text-white/50 hover:border-brand-blue/30 hover:text-brand-blue transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollTrending('right')}
                  className="w-7 h-7 rounded-md border border-[rgba(201,168,76,0.16)] bg-[var(--atlas-bg-panel)] flex items-center justify-center text-white/50 hover:border-brand-blue/30 hover:text-brand-blue transition"
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
              {featuredSets.map((ps, i) => (
                <TrendingPromptPill key={ps._id} promptSet={ps} index={i} />
              ))}
            </div>
          </motion.div>
        </motion.section>
      )}

      {/* Divider */}
      <motion.div
        variants={sectionRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-[1500px] mx-auto px-4 sm:px-6"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </motion.div>

      {/* ═══════════════════════════════════════════
       * MAIN LAYOUT: Left Sidebar + Content
       * ═══════════════════════════════════════════ */}
      <motion.div
        variants={sectionRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="max-w-[1500px] mx-auto px-4 sm:px-6 py-5 pb-16 lg:pb-5"
      >
        <div className="flex gap-6 lg:items-start">
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
              fixed lg:sticky inset-y-0 lg:inset-y-auto left-0 z-50 lg:z-30 lg:top-[88px] lg:self-start
              w-[280px] lg:w-[250px] xl:w-[270px] flex-shrink-0
              lg:h-[calc(100vh-104px)]
              bg-[#080a0d]/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none
              border-r border-[rgba(201,168,76,0.16)] lg:border-r-0
              transform transition-transform duration-300 lg:transform-none
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              overflow-y-auto lg:overflow-visible
            `}
          >
            <motion.div
              variants={filterPanelVariants}
              initial="hidden"
              animate="visible"
              className="p-4 lg:p-0 lg:pr-2 lg:flex lg:h-full lg:flex-col"
            >
              {/* Mobile close */}
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-brand-blue" />
                  {t('prompt_market.filters')}
                </h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 bg-white/[0.04] flex items-center justify-center text-white/60 hover:text-white transition"
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
                    className="text-[11px] text-brand-blue/60 hover:text-brand-blue transition-colors"
                  >
                    {t('prompt_market.reset_filters')}
                  </button>
                )}
              </div>

              {/* Filter container */}
              <motion.div
                variants={filterPanelVariants}
                className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:rounded-xl lg:bg-[#0d1014]/92 lg:border lg:border-[rgba(201,168,76,0.16)] lg:p-4 lg:shadow-[0_24px_80px_rgba(0,0,0,0.22)] scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none]"
              >
                {/* ─ Category filter ─ */}
                <FilterSection title={lang === 'vi' ? 'Danh mục showcase' : 'Showcase category'} defaultOpen={true}>
                  <div className="space-y-0.5">
                    {Object.keys(CATEGORY_LABELS).map(category => (
                      <FilterOptionButton
                        key={category}
                        active={urlCategory === category}
                        label={CATEGORY_LABELS[category][lang] ?? CATEGORY_LABELS[category].en}
                        count={category === 'all' ? catalogSource.length : categoryCounts[category]}
                        onClick={() => handleCategoryFilter(category)}
                      />
                    ))}
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
                      <FilterOptionButton
                        key={opt.key}
                        active={urlPriceFilter === opt.key}
                        label={opt.label}
                        count={opt.key === 'all' ? catalogSource.length : opt.key === 'free' ? catalogSource.filter(ps => ps.isFree).length : catalogSource.filter(ps => !ps.isFree).length}
                        onClick={() => handlePriceFilter(opt.key)}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* ─ Media filter ─ */}
                <FilterSection title={lang === 'vi' ? 'Media trong bộ prompt' : 'Prompt media'} defaultOpen={true}>
                  <div className="space-y-0.5">
                    {([
                      { key: 'all' as MediaFilter, icon: <Package className="w-3.5 h-3.5" />, count: catalogSource.length },
                      { key: 'image' as MediaFilter, icon: <ImageIcon className="w-3.5 h-3.5" />, count: totalImageSets },
                      { key: 'video' as MediaFilter, icon: <Video className="w-3.5 h-3.5" />, count: totalVideoSets },
                      { key: 'image_video' as MediaFilter, icon: <PlayCircle className="w-3.5 h-3.5" />, count: Math.min(totalImageSets, totalVideoSets) },
                    ]).map(opt => (
                      <FilterOptionButton
                        key={opt.key}
                        active={urlMediaFilter === opt.key}
                        label={MEDIA_LABELS[opt.key][lang] ?? MEDIA_LABELS[opt.key].en}
                        icon={opt.icon}
                        count={opt.count}
                        onClick={() => handleMediaFilter(opt.key)}
                      />
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
                      <FilterOptionButton
                        key={opt.key}
                        active={urlRatingFilter === opt.key}
                        label={opt.label}
                        icon={opt.key !== 'any' ? <Star className="w-3.5 h-3.5" /> : undefined}
                        onClick={() => handleRatingFilter(opt.key)}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* ─ Model filter ─ */}
                <FilterSection title={lang === 'vi' ? 'Mô hình tương thích' : 'Compatible models'} defaultOpen={false}>
                  <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
                    {topModels.map(([model, count]) => (
                      <FilterOptionButton
                        key={model}
                        active={activeModels.includes(model)}
                        label={model}
                        icon={<Cpu className="w-3.5 h-3.5" />}
                        count={count}
                        onClick={() => toggleMultiFilter('models', model)}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* ─ Tags filter ─ */}
                <FilterSection title={lang === 'vi' ? 'Tags nội dung' : 'Content tags'} defaultOpen={false}>
                  <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1">
                    {topTags.map(([tag, count]) => {
                      const active = activeTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleMultiFilter('tags', tag)}
                    className={`inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-[11px] transition ${
                            active
                              ? 'bg-brand-blue/[0.12] text-brand-blue border border-brand-blue/[0.18]'
                              : 'bg-white/[0.04] text-white/45 border border-[rgba(201,168,76,0.12)] hover:text-white/70 hover:border-[rgba(201,168,76,0.28)]'
                          }`}
                        >
                          <span className="truncate">#{tag}</span>
                          <span className="text-white/30">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </FilterSection>

                {/* ─ Featured filter ─ */}
                <FilterSection title={lang === 'vi' ? 'Tín hiệu showcase' : 'Showcase signals'} defaultOpen={false}>
                  <FilterOptionButton
                    active={urlFeaturedFilter}
                    label={lang === 'vi' ? 'Chỉ bộ nổi bật' : 'Featured only'}
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    count={catalogSource.filter(ps => ps.featured).length}
                    onClick={handleFeaturedFilter}
                  />
                </FilterSection>

                {/* ─ Sort (sidebar) ─ */}
                <FilterSection title={t('prompt_market.sort_by')} defaultOpen={false}>
                  <div className="space-y-0.5">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                      <FilterOptionButton
                        key={opt}
                        active={urlSort === opt}
                        label={SORT_LABELS[opt][lang] ?? SORT_LABELS[opt].en}
                        onClick={() => handleSortChange(opt)}
                      />
                    ))}
                  </div>
                </FilterSection>
              </motion.div>

              {/* Reset all (mobile) */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    resetAllFilters();
                    setSidebarOpen(false);
                  }}
                  className="w-full mt-4 rounded-lg px-4 py-2.5 border border-brand-blue/[0.15] text-brand-blue text-xs font-medium hover:bg-brand-blue/[0.06] transition lg:hidden"
                >
                  {t('prompt_market.reset_filters')}
                </button>
              )}
            </motion.div>
          </aside>

          {/* ── RIGHT — Main Content ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 min-w-0 lg:h-[calc(100vh-104px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none]"
          >
            {/* ── Search bar + Sell CTA ── */}
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              className="flex items-center gap-3 mb-5"
            >
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden w-10 h-10 rounded-lg bg-[var(--atlas-bg-panel)] border border-[rgba(201,168,76,0.16)] flex items-center justify-center text-white/50 hover:text-brand-blue hover:border-brand-blue/30 transition-all flex-shrink-0"
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* Search */}
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-blue transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder={t('prompt_market.search_placeholder')}
                  className="w-full rounded-lg bg-[var(--atlas-bg-panel)] border border-[rgba(201,168,76,0.16)] pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-blue/40 focus:ring-1 focus:ring-brand-blue/15 transition-all duration-200"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-white/[0.04] hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3 text-white/50" />
                  </button>
                )}
              </div>

              {/* Sell CTA */}
              <Link
                to="/prompt-market/sell"
                className="hidden md:flex items-center gap-2 rounded-lg px-5 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white text-sm font-bold transition-all duration-200 shadow-[0_2px_16px_rgba(201,168,76,0.2)] hover:shadow-[0_4px_24px_rgba(201,168,76,0.35)] active:scale-[0.97] flex-shrink-0"
              >
                <Crown className="w-4 h-4" />
                {t('prompt_market.cta_button')}
              </Link>
            </motion.div>

            {/* ── Toolbar: results + active filters + sort + view toggle ── */}
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5"
            >
              {/* Left — results + active filter chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {!loading && (
                  <span className="text-xs text-white/50 font-medium">
                    {pagination.total > 0
                      ? `${pagination.total} ${t('prompt_market.results')}`
                      : ''}
                  </span>
                )}
                {urlQ && (
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 bg-brand-blue/[0.06] border border-brand-blue/[0.15] text-xs text-brand-blue/80">
                    <Search className="w-3 h-3" />
                    &quot;{urlQ}&quot;
                    <button onClick={clearSearch} className="hover:text-white transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {urlPriceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 bg-white/[0.04] border border-[rgba(201,168,76,0.16)] text-xs text-white/60">
                    {urlPriceFilter === 'free' ? t('prompt_market.free_only') : t('prompt_market.paid_only')}
                    <button
                      onClick={() => handlePriceFilter('all')}
                      className="hover:text-white transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {urlCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 bg-white/[0.04] border border-[rgba(201,168,76,0.16)] text-xs text-white/60">
                    {CATEGORY_LABELS[urlCategory]?.[lang] ?? urlCategory}
                    <button onClick={() => handleCategoryFilter('all')} className="hover:text-white transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {urlMediaFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 bg-white/[0.04] border border-[rgba(201,168,76,0.16)] text-xs text-white/60">
                    {MEDIA_LABELS[urlMediaFilter]?.[lang] ?? MEDIA_LABELS[urlMediaFilter].en}
                    <button onClick={() => handleMediaFilter('all')} className="hover:text-white transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {urlRatingFilter !== 'any' && (
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 bg-white/[0.04] border border-[rgba(201,168,76,0.16)] text-xs text-white/60">
                    {urlRatingFilter}+ ★
                    <button onClick={() => handleRatingFilter('any')} className="hover:text-white transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {urlFeaturedFilter && (
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 bg-white/[0.04] border border-[rgba(201,168,76,0.16)] text-xs text-white/60">
                    {lang === 'vi' ? 'Nổi bật' : 'Featured'}
                    <button onClick={handleFeaturedFilter} className="hover:text-white transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {activeModels.map(model => (
                  <span key={model} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 bg-white/[0.04] border border-[rgba(201,168,76,0.16)] text-xs text-white/60">
                    {model}
                    <button onClick={() => toggleMultiFilter('models', model)} className="hover:text-white transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {activeTags.slice(0, 4).map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 bg-white/[0.04] border border-[rgba(201,168,76,0.16)] text-xs text-white/60">
                    #{tag}
                    <button onClick={() => toggleMultiFilter('tags', tag)} className="hover:text-white transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {activeTags.length > 4 && (
                  <span className="rounded-md px-2.5 py-1 bg-white/[0.04] border border-[rgba(201,168,76,0.16)] text-xs text-white/40">
                    +{activeTags.length - 4} tags
                  </span>
                )}
              </div>

              {/* Right — sort dropdown + view toggle */}
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex items-center rounded-lg border border-[rgba(201,168,76,0.16)] overflow-hidden bg-[var(--atlas-bg-panel)]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-brand-blue/[0.15] text-brand-blue'
                        : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-brand-blue/[0.15] text-brand-blue'
                        : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sort dropdown (desktop) */}
                <div className="relative flex-shrink-0 hidden lg:block" ref={sortRef}>
                  <button
                    onClick={() => setSortOpen(v => !v)}
                    className="flex items-center gap-2 rounded-lg bg-[var(--atlas-bg-panel)] border border-[rgba(201,168,76,0.16)] px-4 py-2 text-sm text-white/60 hover:border-brand-blue/20 hover:text-white/80 transition whitespace-nowrap"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-white/40" />
                    {currentSortLabel}
                    <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                        className="absolute right-0 top-full mt-1 z-50 rounded-lg bg-[var(--atlas-bg-panel)] border border-[rgba(201,168,76,0.16)] overflow-hidden shadow-atlas-lg w-52"
                      >
                        {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleSortChange(opt)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-white/[0.04] ${
                              urlSort === opt ? 'text-brand-blue font-medium bg-brand-blue/[0.06]' : 'text-white/60'
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                  className="flex flex-col items-center justify-center py-28 gap-5"
                >
                  <motion.div
                    className="grid h-16 w-16 place-items-center rounded-xl border border-brand-blue/20 bg-brand-blue/[0.08]"
                    animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0 rgba(201,168,76,0)', '0 0 36px rgba(201,168,76,0.16)', '0 0 0 rgba(201,168,76,0)'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Loader2 className="w-7 h-7 text-brand-blue/70 animate-spin" />
                  </motion.div>
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-white/50 text-sm">{t('prompt_market.loading')}</p>
                    <div className="h-1 w-44 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="h-full w-1/2 rounded-full bg-brand-blue/70"
                        animate={{ x: ['-100%', '220%'] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : filteredSets.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.985 }}
                  transition={{ duration: 0.36, ease: EASE_OUT_EXPO }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(201,168,76,0.12)] bg-[#C9A84C]/[0.025] py-24 gap-4"
                >
                  <motion.div
                    className="w-16 h-16 bg-[var(--atlas-bg-panel)] border border-[rgba(201,168,76,0.16)] flex items-center justify-center"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Package className="w-8 h-8 text-white/30" />
                  </motion.div>
                  <p className="text-white/70 text-base font-medium">
                    {t('prompt_market.empty_title')}
                  </p>
                  <p className="text-white/50 text-sm text-center max-w-xs">
                    {t('prompt_market.empty_desc')}
                  </p>
                  {hasActiveFilters && (
                    <motion.button
                      onClick={resetAllFilters}
                      className="mt-2 rounded-lg px-4 py-2 border border-brand-blue/[0.15] text-brand-blue/70 text-sm font-medium hover:bg-brand-blue/[0.06] transition"
                      whileHover={{ scale: 1.025, borderColor: 'rgba(201,168,76,0.32)' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {t('prompt_market.clear_filters')}
                    </motion.button>
                  )}
                </motion.div>
              ) : viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
                >
                  {filteredSets.map((ps, i) => (
                    <motion.div key={ps._id ?? i} variants={itemVariants} layout>
                      <PromptSetCard promptSet={ps} index={i} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                /* List view */
                <motion.div
                  key="list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
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
                        variants={itemVariants}
                        layout
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.995 }}
                      >
                        <Link
                          to={`/prompt-market/${ps.slug}`}
                          className="flex items-center gap-4 rounded-xl bg-[var(--atlas-bg-panel)] border border-[rgba(201,168,76,0.16)] hover:border-brand-blue/30 p-3 sm:p-4 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(201,168,76,0.06)] group"
                        >
                          {/* Cover */}
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border border-[rgba(201,168,76,0.16)]">
                            {ps.coverImage ? (
                              <img src={ps.coverImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-brand-blue/10 to-[var(--atlas-bg-panel)] flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white/30" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white/80 truncate group-hover:text-brand-blue transition-colors">
                              {pTitle}
                            </h3>
                            {desc && (
                              <p className="text-xs text-white/50 truncate mt-0.5">{desc}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-white/50">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {promptCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                {ps.purchaseCount}
                              </span>
                              {ps.reviewCount > 0 && (
                                <span className="flex items-center gap-1 text-amber-500/70">
                                  <Star className="w-3 h-3 fill-amber-500/50" />
                                  {ps.averageRating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Seller */}
                          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                            {sAvatar ? (
                              <img src={sAvatar} alt="" className="w-6 h-6 rounded-full ring-1 ring-[rgba(201,168,76,0.16)]" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-white/[0.04] flex items-center justify-center">
                                <User className="w-3 h-3 text-white/50" />
                              </div>
                            )}
                            <span className="text-xs text-white/50 max-w-[80px] truncate">{sName}</span>
                          </div>

                          {/* Price */}
                          <div className="flex-shrink-0 text-right">
                            <span className={`text-sm font-bold ${ps.isFree ? 'text-emerald-500' : 'text-white'}`}>
                              {ps.isFree ? t('prompt_market.free_label') : `${ps.priceSKT} SKT`}
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
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mt-10"
              >
                <button
                  disabled={urlPage <= 1}
                  onClick={() => handlePageChange(urlPage - 1)}
                  className="rounded-lg px-3 py-2 border border-[rgba(201,168,76,0.16)] text-sm text-white/50 hover:border-brand-blue/25 hover:text-brand-blue disabled:opacity-20 disabled:cursor-not-allowed transition"
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
                        <span key={`ellipsis-${idx}`} className="px-2 text-white/40 text-sm select-none">
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => handlePageChange(item as number)}
                          className={`w-9 h-9 text-sm font-medium transition-all duration-200 ${
                            urlPage === item
                              ? 'bg-brand-blue text-white shadow-[0_0_12px_rgba(201,168,76,0.25)]'
                              : 'rounded-lg border border-[rgba(201,168,76,0.16)] text-white/50 hover:border-brand-blue/20 hover:text-brand-blue'
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
                  className="rounded-lg px-3 py-2 border border-[rgba(201,168,76,0.16)] text-sm text-white/50 hover:border-brand-blue/25 hover:text-brand-blue disabled:opacity-20 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Seller CTA Banner ── */}
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
              className="mt-14 relative overflow-hidden rounded-xl border border-brand-blue/[0.15]"
            >
              {/* BG glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/[0.06] via-violet-500/[0.03] to-brand-blue/[0.06]" />
              <div className="absolute top-0 left-1/3 w-64 h-32 bg-brand-blue/[0.08] rounded-full blur-[80px]" />

              <div className="relative px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-brand-blue/[0.12] border border-brand-blue/[0.15] flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">
                      {t('prompt_market.cta_title')}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      {t('prompt_market.cta_desc')}
                    </p>
                  </div>
                </div>
                <Link
                  to="/prompt-market/sell"
                  className="shrink-0 rounded-lg px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white text-sm font-bold transition-all duration-200 shadow-[0_2px_20px_rgba(201,168,76,0.2)] hover:shadow-[0_4px_28px_rgba(201,168,76,0.35)] active:scale-[0.97]"
                >
                  {t('prompt_market.cta_button')}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PromptMarketPage;
