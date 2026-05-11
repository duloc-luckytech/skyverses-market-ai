import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2, ChevronRight, ShoppingCart, Lock, LogIn,
  User, Tag, CalendarDays, Hash, Download, Sparkles,
  FileText, EyeOff, ArrowLeft, Check, Share2,
  Copy, ExternalLink, Flag, Star, Heart, Eye, Cpu,
  BadgeCheck, TrendingUp, ImageIcon, Video, PlayCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { promptMarketApi } from '../apis/prompt-market';
import { skytokenApi } from '../apis/skytoken';
import type { PromptSet } from '../types';
import PromptPurchaseModal from '../components/prompt-market/PromptPurchaseModal';
import PromptSetCard from '../components/prompt-market/PromptSetCard';
import PromptReviewSection from '../components/prompt-market/PromptReviewSection';

const MODEL_LABELS: Partial<Record<string, string>> = {
  'gpt-4': 'GPT-4',
  'gpt-4o': 'GPT-4o',
  'gpt-5': 'GPT-5',
  'claude-3': 'Claude 3',
  'claude-4': 'Claude 4',
  'gemini': 'Gemini',
  'gemini-2': 'Gemini 2',
  'midjourney': 'MJ',
  'dall-e-3': 'DALL·E',
  'stable-diffusion': 'SD',
  'flux': 'Flux',
  'llama': 'Llama',
  'mistral': 'Mistral',
};

/* ─── helpers ─── */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const getSellerName = (s: PromptSet['sellerId']): string =>
  typeof s === 'string' ? s : (s?.name ?? 'Unknown');

const getSellerAvatar = (s: PromptSet['sellerId']): string | undefined =>
  typeof s === 'string' ? undefined : s?.avatar;

type ShowcaseMediaItem = {
  key: string;
  type: 'image' | 'video';
  url: string;
  poster?: string;
  title: string;
  input: string;
  style?: string;
  output: string;
};

/* ─── sub-components ─── */
const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({
  icon, label, value,
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
    <span className="flex items-center gap-2 text-sm text-white/40">
      <span className="text-[#C9A84C]">{icon}</span>
      {label}
    </span>
    <span className="text-sm text-white font-medium">{value}</span>
  </div>
);

const PromptShowcaseStage: React.FC<{
  promptSet: PromptSet;
  title: string;
  description: string;
  activeIndex: number;
  onSelect: (index: number) => void;
}> = ({ promptSet, title, description, activeIndex, onSelect }) => {
  const examples = promptSet.examples ?? [];
  const seenMedia = new Set<string>();
  const rawMediaItems: Array<ShowcaseMediaItem | null> = [
    promptSet.coverImage
      ? {
          key: `${promptSet._id}-cover`,
          type: 'image' as const,
          url: promptSet.coverImage,
          title: 'Cover board',
          input: title,
          output: description,
        }
      : null,
    ...examples.flatMap((ex, index) => {
      const itemTitle = ex.promptTitle || `Output ${index + 1}`;
      return [
        ex.image
          ? {
              key: `${promptSet._id}-image-${index}`,
              type: 'image' as const,
              url: ex.image,
              title: itemTitle,
              input: ex.input,
              style: ex.style,
              output: ex.output,
            }
          : null,
        ex.video
          ? {
              key: `${promptSet._id}-video-${index}`,
              type: 'video' as const,
              url: ex.video,
              poster: ex.image || promptSet.coverImage,
              title: `${itemTitle} · Video`,
              input: ex.input,
              style: ex.style,
              output: ex.output,
            }
          : null,
      ];
    }),
  ];
  const mediaItems = rawMediaItems.filter((item): item is ShowcaseMediaItem => {
    if (!item) return false;
    const mediaKey = `${item.type}:${item.url}`;
    if (seenMedia.has(mediaKey)) return false;
    seenMedia.add(mediaKey);
    return true;
  });
  const fallbackMedia: ShowcaseMediaItem = {
    key: `${promptSet._id}-fallback`,
    type: 'image',
    url: promptSet.coverImage || '',
    title,
    input: title,
    output: description,
  };
  const stageMedia = mediaItems.length ? mediaItems : [fallbackMedia];
  const activeMedia = stageMedia[activeIndex] ?? stageMedia[0];
  const activePromptIndex = Math.min(activeIndex, Math.max(promptSet.prompts.length - 1, 0));
  const featuredPrompt = promptSet.prompts[activePromptIndex] ?? promptSet.prompts[0];
  const variables = featuredPrompt?.variables ?? [];
  const fallbackStyleChips = [
    ...(promptSet.models ?? []).slice(0, 4).map((m) => MODEL_LABELS[m] ?? m),
    ...promptSet.tags.slice(0, 4),
  ];
  const styleChips = (activeMedia.style ? activeMedia.style.split(' · ') : fallbackStyleChips)
    .map((chip) => chip.trim())
    .filter(Boolean)
    .slice(0, 8);
  const imageCount = stageMedia.filter(item => item.type === 'image' && item.url).length;
  const videoCount = stageMedia.filter(item => item.type === 'video').length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[28px] border border-[#d8c9a4] bg-[#f3ead8] text-[#2a241d] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
    >
      <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)_340px]">
        <aside className="order-2 xl:order-1 border-t xl:border-t-0 xl:border-r border-[#d8c9a4] bg-[#f7f0e1] p-4">
          <div className="mb-4 hidden xl:flex items-center justify-between border-b border-dashed border-[#d8c9a4] pb-3">
            <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">Outputs</p>
            <div className="flex items-center gap-2 text-[11px] text-[#806b4a]">
              <span className="inline-flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" />{imageCount}</span>
              <span className="inline-flex items-center gap-1"><Video className="w-3.5 h-3.5" />{videoCount}</span>
            </div>
          </div>
          <div className="flex xl:block gap-3 overflow-x-auto xl:overflow-visible pb-1 xl:pb-0 space-y-0 xl:space-y-3">
            {stageMedia.map((item, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelect(index)}
                  className={`min-w-[150px] xl:min-w-0 w-full text-left overflow-hidden rounded-[18px] border transition shadow-sm ${
                    active
                      ? 'border-[#88b6cf] bg-[#dcecf1]'
                      : 'border-[#e0d3b7] bg-[#fff9ec] hover:border-[#c8b68f]'
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-[#eadfc9] overflow-hidden">
                    {item.type === 'video' ? (
                      <>
                        <video src={item.url} poster={item.poster} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <PlayCircle className="w-6 h-6 text-white drop-shadow" />
                        </div>
                      </>
                    ) : item.url ? (
                      <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-[#806b4a]/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#6b8fa4]">
                      {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                      {item.type} {index + 1}
                    </div>
                    <p className="mt-1.5 font-serif text-sm leading-snug text-[#2a241d] line-clamp-2">
                      {item.title || title}
                    </p>
                    <p className="mt-1 text-[11px] text-[#7a6a55] line-clamp-1">{item.input}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="order-1 xl:order-2 min-h-[420px] xl:min-h-[620px] bg-[#f4ead4] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_20%,rgba(255,255,255,0.75),transparent_32%),linear-gradient(135deg,rgba(244,234,212,0.92),rgba(224,211,181,0.86))]" />
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-start justify-between gap-4 p-6 lg:p-8">
              <div>
                <p className="font-serif italic text-sm uppercase tracking-[0.24em] text-[#806b4a]">Prompt Showcase</p>
                <h2 className="mt-2 text-3xl lg:text-5xl font-serif text-black leading-none max-w-3xl">
                  {title}
                </h2>
                {description && (
                  <p className="mt-3 max-w-xl text-sm lg:text-base text-black/60 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
              {promptSet.featured && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.06] border border-black/[0.08] text-[11px] font-bold uppercase tracking-wider text-black/60">
                  <TrendingUp className="w-3.5 h-3.5 text-[#9a7424]" />
                  Featured
                </span>
              )}
            </div>

            <div className="flex-1 px-5 lg:px-8 pb-6 lg:pb-8 flex items-center justify-center">
              <div className="relative w-full max-w-4xl">
                <div className="rounded-[22px] border border-[#d1bea0] bg-[#fff7e8] shadow-[0_28px_70px_rgba(70,48,20,0.20)] overflow-hidden">
                  {activeMedia.type === 'video' ? (
                    <video
                      src={activeMedia.url}
                      poster={activeMedia.poster}
                      controls
                      preload="metadata"
                      className="w-full aspect-video object-cover bg-black"
                    />
                  ) : activeMedia.url ? (
                    <img
                      src={activeMedia.url}
                      alt={activeMedia.input || title}
                      className="w-full aspect-video object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full aspect-video flex items-center justify-center bg-black/[0.08]">
                      <Sparkles className="w-16 h-16 text-black/20" />
                    </div>
                  )}
                </div>
                <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-[#fff9ec]/90 backdrop-blur-md border border-[#d1bea0] px-3 py-2 text-xs text-[#5b4a35] shadow-sm">
                  {activeMedia.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  Main {activeMedia.type} output
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="order-3 border-t xl:border-t-0 xl:border-l border-[#d8c9a4] bg-[#f7f0e1] p-5 lg:p-6 space-y-5">
          <div className="rounded-[20px] border border-[#d8c9a4] bg-[#fff9ec] p-5 shadow-sm">
            <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">Input Brief</p>
            <p className="mt-3 text-sm text-[#4b4035] leading-relaxed">
              {activeMedia.input || promptSet.previewText || title}
            </p>
          </div>

          {styleChips.length > 0 && (
            <div className="rounded-[20px] border border-[#d8c9a4] bg-[#fff9ec] p-5 shadow-sm">
              <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">Style & Models</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {styleChips.map((chip) => (
                  <span key={chip} className="px-2.5 py-1 rounded-full border border-[#d1bea0] bg-[#f2e5c9] text-xs text-[#5b4a35]">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          )}

          {variables.length > 0 && (
            <div className="rounded-[20px] border border-[#d8c9a4] bg-[#fff9ec] p-5 shadow-sm">
              <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">Prompt Inputs</p>
              <div className="mt-3 space-y-2.5">
                {variables.slice(0, 6).map((v) => (
                  <div key={v.name} className="rounded-xl border border-dashed border-[#d8c9a4] bg-[#fbf1dc] p-3">
                    <div className="font-mono text-[11px] text-[#8b6f2c]">{`{{${v.name}}}`}</div>
                    <div className="mt-1 text-xs text-[#7a6a55] line-clamp-2">{v.defaultValue || v.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-[20px] border border-[#d8c9a4] bg-[#fff9ec] p-5 shadow-sm">
            <p className="font-serif italic text-sm uppercase tracking-[0.22em] text-[#806b4a]">Output Result</p>
            <p className="mt-3 text-sm text-[#4b4035] leading-relaxed">
              {activeMedia.output || featuredPrompt?.description || description}
            </p>
          </div>
        </aside>
      </div>
    </motion.section>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * PromptDetailPage
 * Route: /prompt-market/:slug
 * ═══════════════════════════════════════════════════════════════════ */
const PromptDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { isAuthenticated, login } = useAuth();

  const [promptSet, setPromptSet] = useState<PromptSet | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [relatedPrompts, setRelatedPrompts] = useState<PromptSet[]>([]);
  const [copied, setCopied] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);

  /* ── fetch ── */
  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      const [detailRes, balRes] = await Promise.all([
        promptMarketApi.getBySlug(slug),
        isAuthenticated ? skytokenApi.getBalance() : Promise.resolve({ skyTokenBalance: 0 }),
      ]);
      setPromptSet(detailRes.data);
      setActiveExampleIndex(0);
      setBalance(balRes.skyTokenBalance ?? 0);

      if (detailRes.data?._id) {
        // Track view
        promptMarketApi.trackView(detailRes.data._id);

        if (isAuthenticated) {
          // Check purchased + wishlisted in parallel
          const [purchaseCheck, wishCheck] = await Promise.all([
            promptMarketApi.checkPurchased(detailRes.data._id),
            promptMarketApi.checkWishlisted([detailRes.data._id]),
          ]);
          setAlreadyPurchased(purchaseCheck.purchased);
          setWishlisted(wishCheck.data[detailRes.data._id] ?? false);
        }
      }

      // Fetch related
      const relatedRes = await promptMarketApi.getRelated(slug, 4);
      setRelatedPrompts(relatedRes.data ?? []);

      setLoading(false);
    };
    load();
  }, [slug, isAuthenticated]);

  /* ── wishlist toggle ── */
  const handleWishlistToggle = async () => {
    if (!promptSet || !isAuthenticated || wishLoading) return;
    setWishLoading(true);
    const res = await promptMarketApi.toggleWishlist(promptSet._id);
    if (res.success) setWishlisted(res.wishlisted);
    setWishLoading(false);
  };

  /* ── localized helper ── */
  const loc = (obj: { en: string; vi: string; ko: string; ja: string } | undefined) =>
    obj ? (obj[lang as keyof typeof obj] || obj.en) : '';

  /* ── share ── */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: promptSet ? loc(promptSet.title) : 'Prompt',
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--atlas-bg-page)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-white/25 animate-pulse">
          Loading prompt set...
        </span>
      </div>
    );
  }

  /* ── not found ── */
  if (!promptSet) {
    return (
      <div className="min-h-screen bg-[var(--atlas-bg-page)] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <FileText className="w-16 h-16 text-white/10" />
        <h2 className="text-2xl font-bold text-white">Prompt Set Not Found</h2>
        <p className="text-white/35 max-w-sm">
          This prompt set may have been removed or the link is incorrect.
        </p>
        <Link
          to="/prompt-market"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A84C] text-black font-medium hover:bg-[#B8963F] transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Prompt Market
        </Link>
      </div>
    );
  }

  const title = loc(promptSet.title);
  const description = loc(promptSet.description);
  const avatar = getSellerAvatar(promptSet.sellerId);
  const seller = getSellerName(promptSet.sellerId);
  const canViewFullPrompt = promptSet.isFree || alreadyPurchased;

  return (
    <div className="min-h-screen bg-[var(--atlas-bg-page)] text-white">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-white/[0.04] bg-[var(--atlas-bg-page)]/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-white/35">
          <Link to="/prompt-market" className="hover:text-white transition-colors">
            Prompt Market
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/15" />
          <span className="text-white/30 capitalize">{promptSet.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/15" />
          <span className="text-white/60 truncate max-w-[200px] sm:max-w-none">{title}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* ════════════════════════
           * LEFT — main content
           * ════════════════════════ */}
          <div className="flex-1 min-w-0 space-y-8">
            <div className="relative">
              <PromptShowcaseStage
                promptSet={promptSet}
                title={title}
                description={description}
                activeIndex={activeExampleIndex}
                onSelect={setActiveExampleIndex}
              />
              {isAuthenticated && (
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishLoading}
                  className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all duration-200 ${
                    wishlisted
                      ? 'bg-red-500/20 border-red-500/30 text-red-400'
                      : 'bg-black/50 border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/30'
                  }`}
                  title={wishlisted ? t('prompt_market.remove_wishlist') : t('prompt_market.add_to_wishlist')}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-400' : ''}`} />
                </button>
              )}
            </div>

            {/* Title + Share */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="flex items-start justify-between gap-4"
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {title}
              </h1>
              {/* Share buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                <button
                  onClick={handleCopyLink}
                  className="w-9 h-9 rounded-xl border border-white/[0.06] bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white hover:border-[#C9A84C]/30 transition"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-xl border border-white/[0.06] bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white hover:border-[#C9A84C]/30 transition"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Description */}
            {description && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.14 }}
                className="text-white/50 leading-relaxed text-base"
              >
                {description}
              </motion.p>
            )}

            {/* Preview text */}
            {promptSet.previewText && !canViewFullPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">
                  Preview
                </h3>
                <div className="relative rounded-xl bg-[#0a0a14] border border-white/[0.06] overflow-hidden">
                  <div className="p-5 font-mono text-sm text-white/50 leading-relaxed whitespace-pre-wrap max-h-40 overflow-hidden">
                    {promptSet.previewText}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a14] to-transparent" />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <span className="text-xs text-white/25 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04]">
                      <EyeOff className="w-3 h-3" /> Purchase to see full content
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Prompt list */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
                Prompt Blueprint ({promptSet.prompts.length})
              </h3>
              <div className="space-y-3">
                {promptSet.prompts.map((prompt, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-start gap-4 hover:border-white/[0.1] transition-colors overflow-hidden"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#C9A84C]/15 border border-[#C9A84C]/25 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#C9A84C]">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-white truncate text-sm">
                          {typeof prompt.title === 'object'
                            ? loc(prompt.title as Parameters<typeof loc>[0])
                            : prompt.title}
                        </p>
                        {canViewFullPrompt && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(prompt.content);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2 py-1 text-[11px] text-white/45 hover:border-[#C9A84C]/30 hover:text-[#C9A84C] transition"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        )}
                      </div>
                      {prompt.description && (
                        <p className="text-xs text-white/35 mt-1 line-clamp-2">
                          {typeof prompt.description === 'object'
                            ? loc(prompt.description as Parameters<typeof loc>[0])
                            : prompt.description}
                        </p>
                      )}
                      {prompt.variables && prompt.variables.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {prompt.variables.map((v) => (
                            <span
                              key={v.name}
                              className="px-2 py-0.5 rounded-md bg-[#C9A84C]/[0.08] border border-[#C9A84C]/15 text-[10px] text-[#C9A84C]/70 font-mono"
                            >
                              {`{{${v.name}}}`}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 rounded-lg border border-white/[0.05] bg-black/20 p-3">
                        <pre className={`whitespace-pre-wrap break-words font-mono text-xs leading-relaxed ${
                          canViewFullPrompt
                            ? 'text-white/65'
                            : 'max-h-20 select-none overflow-hidden blur-[3px] text-white/35'
                        }`}>
                          {prompt.content}
                        </pre>
                        {!canViewFullPrompt && (
                          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-[#101015] via-[#101015]/90 to-transparent pb-4 pt-16">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/25 bg-black/65 px-3 py-1.5 text-[11px] font-semibold text-[#C9A84C] backdrop-blur">
                              <Lock className="w-3 h-3" />
                              Paid prompt is hidden until purchase
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tags */}
            {promptSet.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="flex flex-wrap gap-2"
              >
                {promptSet.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/prompt-market?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/40 flex items-center gap-1.5 hover:border-[#C9A84C]/30 hover:text-white/60 transition-colors"
                  >
                    <Tag className="w-3 h-3 text-[#C9A84C]/60" />
                    {tag}
                  </Link>
                ))}
              </motion.div>
            )}

            {/* ── Reviews ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              className="pt-8 border-t border-white/[0.04]"
            >
              <PromptReviewSection
                promptSetId={promptSet._id}
                hasPurchased={alreadyPurchased}
              />
            </motion.div>

            {/* ── Related Prompts ── */}
            {relatedPrompts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-8 border-t border-white/[0.04]"
              >
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-5">
                  Related Prompts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPrompts.map((rp, i) => (
                    <PromptSetCard key={rp._id} promptSet={rp} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ════════════════════════
           * RIGHT — sticky sidebar
           * ════════════════════════ */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Price card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-lg border border-white/[0.06] bg-[#0a0a14]/80 backdrop-blur-sm overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 border-b border-white/[0.04]">
                  <div className="flex items-end gap-2">
                    {promptSet.isFree ? (
                      <span className="text-3xl font-bold text-emerald-400">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-white">
                          {promptSet.priceSKT.toLocaleString()}
                        </span>
                        <span className="text-base text-[#C9A84C] font-bold mb-0.5">SKT</span>
                      </>
                    )}
                  </div>
                  {isAuthenticated && !promptSet.isFree && (
                    <p className="text-xs text-white/25 mt-1.5">
                      Your balance: <span className="text-white/60 font-medium">{balance.toLocaleString()} SKT</span>
                      {balance < promptSet.priceSKT && (
                        <Link to="/skytoken" className="ml-2 text-[#C9A84C] hover:underline">
                          Top up
                        </Link>
                      )}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="p-5 space-y-3">
                  {alreadyPurchased ? (
                    <>
                      <div className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-sm">
                        <Check className="w-4 h-4" />
                        Already Purchased
                      </div>
                      <Link
                        to="/prompt-market/my-purchases"
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C9A84C] hover:bg-[#B8963F] text-black font-semibold transition-all duration-200 active:scale-95 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Full Content
                      </Link>
                    </>
                  ) : isAuthenticated ? (
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C9A84C] hover:bg-[#B8963F] text-black font-semibold transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(201,168,76,0.25)]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {promptSet.isFree ? 'Get for Free' : 'Purchase Now'}
                    </button>
                  ) : (
                    <button
                      onClick={() => login()}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#C9A84C]/40 text-[#C9A84C] font-semibold hover:bg-[#C9A84C]/10 transition-all duration-200"
                    >
                      <LogIn className="w-4 h-4" />
                      Login to Purchase
                    </button>
                  )}

                  {!alreadyPurchased && (
                    <Link
                      to="/prompt-market/my-purchases"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] text-white/35 text-sm hover:border-white/10 hover:text-white/60 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      My Purchases
                    </Link>
                  )}
                </div>
              </motion.div>

              {/* Seller info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="rounded-lg border border-white/[0.06] bg-[#0a0a14]/80 backdrop-blur-sm p-5 space-y-4"
              >
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                  Creator
                </h4>
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={seller}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#C9A84C]/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#C9A84C]/15 flex items-center justify-center ring-2 ring-[#C9A84C]/20">
                      <User className="w-5 h-5 text-[#C9A84C]/70" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm flex items-center gap-1.5">
                      {seller}
                      <BadgeCheck className="w-3.5 h-3.5 text-[#C9A84C]/60 flex-shrink-0" />
                    </p>
                    <p className="text-[11px] text-white/25">Prompt Creator</p>
                  </div>
                </div>
                {typeof promptSet.sellerId === 'object' && promptSet.sellerId?._id && (
                  <Link
                    to={`/prompt-market/seller/${promptSet.sellerId._id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#C9A84C]/15 text-[#C9A84C]/70 text-xs font-medium hover:border-[#C9A84C]/30 hover:text-[#C9A84C] transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    {t('prompt_market.view_profile') || 'View Profile'}
                  </Link>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.26 }}
                className="rounded-lg border border-white/[0.06] bg-[#0a0a14]/80 backdrop-blur-sm p-5"
              >
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25 mb-2">
                  Details
                </h4>
                {promptSet.reviewCount > 0 && (
                  <Stat
                    icon={<Star className="w-4 h-4" />}
                    label="Rating"
                    value={`${promptSet.averageRating.toFixed(1)} (${promptSet.reviewCount})`}
                  />
                )}
                {promptSet.viewCount != null && promptSet.viewCount > 0 && (
                  <Stat
                    icon={<Eye className="w-4 h-4" />}
                    label={t('prompt_market.views') || 'Views'}
                    value={promptSet.viewCount > 999 ? `${(promptSet.viewCount / 1000).toFixed(1)}k` : promptSet.viewCount}
                  />
                )}
                <Stat
                  icon={<Download className="w-4 h-4" />}
                  label="Purchases"
                  value={promptSet.purchaseCount.toLocaleString()}
                />
                <Stat
                  icon={<Hash className="w-4 h-4" />}
                  label="Prompts"
                  value={promptSet.prompts.length}
                />
                <Stat
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Published"
                  value={fmtDate(promptSet.createdAt)}
                />
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/15 text-xs font-medium text-[#C9A84C]/80 capitalize">
                    {promptSet.category}
                  </span>
                </div>
              </motion.div>

              {/* Compatible Models */}
              {promptSet.models && promptSet.models.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.32 }}
                  className="rounded-lg border border-white/[0.06] bg-[#0a0a14]/80 backdrop-blur-sm p-5"
                >
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25 mb-3">
                    {t('prompt_market.compatible_models') || 'Compatible Models'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {promptSet.models.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/50 font-medium"
                      >
                        <Cpu className="w-3 h-3 text-[#C9A84C]/50" />
                        {MODEL_LABELS[m] ?? m}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Report button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.04] text-white/20 text-xs hover:border-red-500/20 hover:text-red-400/60 transition-colors"
              >
                <Flag className="w-3 h-3" />
                Report this prompt set
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Purchase Modal ── */}
      {showPurchaseModal && (
        <PromptPurchaseModal
          promptSet={promptSet}
          userBalance={balance}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={(newBalance: number) => {
            setBalance(newBalance);
            setAlreadyPurchased(true);
            setShowPurchaseModal(false);
            navigate('/prompt-market/my-purchases');
          }}
        />
      )}
    </div>
  );
};

export default PromptDetailPage;
