import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  PenTool,
  Megaphone,
  Palette,
  Briefcase,
  GraduationCap,
  Sparkles,
  ShoppingBag,
  FileText,
  User,
  TrendingUp,
  Star,
  Heart,
  Eye,
  BadgeCheck,
  Cpu,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { promptMarketApi } from '../../apis/prompt-market';
import type { PromptSet } from '../../types';

const CATEGORY_ICONS: Record<PromptSet['category'], React.ReactNode> = {
  coding: <Code2 className="w-5 h-5" />,
  writing: <PenTool className="w-5 h-5" />,
  marketing: <Megaphone className="w-5 h-5" />,
  design: <Palette className="w-5 h-5" />,
  business: <Briefcase className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  other: <Sparkles className="w-5 h-5" />,
};

const CATEGORY_GRADIENTS: Record<PromptSet['category'], string> = {
  coding: 'from-brand-blue/30 via-brand-blue/10 to-neutral-900',
  writing: 'from-violet-500/30 via-violet-500/10 to-neutral-900',
  marketing: 'from-pink-500/30 via-pink-500/10 to-neutral-900',
  design: 'from-amber-500/30 via-amber-500/10 to-neutral-900',
  business: 'from-emerald-500/30 via-emerald-500/10 to-neutral-900',
  education: 'from-blue-500/30 via-blue-500/10 to-neutral-900',
  other: 'from-brand-blue/25 via-brand-blue/10 to-neutral-900',
};

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

interface Props {
  promptSet: PromptSet;
  index?: number;
  variant?: 'default' | 'featured';
  initialWishlisted?: boolean;
}

export default function PromptSetCard({ promptSet, index = 0, variant = 'default', initialWishlisted = false }: Props) {
  const { t, lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [wishLoading, setWishLoading] = useState(false);

  const {
    _id,
    slug,
    title,
    description,
    category,
    tags,
    coverImage,
    priceSKT,
    isFree,
    prompts,
    purchaseCount,
    sellerId,
    featured,
    averageRating,
    reviewCount,
    viewCount,
    models,
  } = promptSet;

  const localizedTitle =
    (typeof title === 'object' ? title[lang] || title.en : title) || '';
  const localizedDesc =
    (typeof description === 'object'
      ? description[lang] || description.en
      : description) || '';

  const sellerName =
    typeof sellerId === 'object' && sellerId !== null ? sellerId.name : null;
  const sellerAvatar =
    typeof sellerId === 'object' && sellerId !== null ? sellerId.avatar : undefined;

  const safeTags = tags ?? [];
  const promptCount = promptSet.promptCount ?? (prompts ? prompts.length : 0);
  const visibleTags = safeTags.slice(0, 2);
  const visibleModels = (models ?? []).slice(0, 2);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || wishLoading) return;
    setWishLoading(true);
    const res = await promptMarketApi.toggleWishlist(_id);
    if (res.success) setWishlisted(res.wishlisted);
    setWishLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
      className="group h-full"
    >
      <Link
        to={`/prompt-market/${slug}`}
        className="flex flex-col h-full bg-[var(--atlas-bg-panel)] border border-white/[0.08] overflow-hidden transition-all duration-300 hover:border-brand-blue/30 hover:shadow-[0_8px_32px_rgba(201,168,76,0.1)]"
      >
        {/* Cover */}
        <div className="relative aspect-[3/2] overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={localizedTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${CATEGORY_GRADIENTS[category]} flex items-center justify-center`}
            >
              <div className="text-white/50 group-hover:text-brand-blue/60 transition-colors duration-300">
                {CATEGORY_ICONS[category]}
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Featured badge */}
          {(featured || variant === 'featured') && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-gradient-to-r from-brand-blue to-violet-500 text-white text-[9px] font-bold tracking-wide flex items-center gap-1 shadow-lg">
              <TrendingUp className="w-2.5 h-2.5" />
              Featured
            </span>
          )}

          {/* Category badge */}
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-white/[0.08] text-[10px] font-medium text-white/70 capitalize">
            {category}
          </span>

          {/* Wishlist heart */}
          {isAuthenticated && (
            <button
              onClick={handleWishlistToggle}
              disabled={wishLoading}
              className={`absolute top-2.5 left-2.5 z-10 w-8 h-8 backdrop-blur-sm border flex items-center justify-center transition-all duration-200 ${
                wishlisted
                  ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : 'bg-black/50 border-white/[0.08] text-white/40 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:border-red-500/30'
              } ${wishlisted ? 'opacity-100' : ''}`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-red-400' : ''}`} />
            </button>
          )}

          {/* Price pill */}
          <div className="absolute bottom-2.5 right-2.5">
            <span
              className={`px-2.5 py-1 text-xs font-bold backdrop-blur-sm shadow-lg ${
                isFree
                  ? 'bg-emerald-500 text-white'
                  : 'bg-black/70 border border-white/[0.08] text-white'
              }`}
            >
              {isFree ? t('free') || 'Free' : `${priceSKT} SKT`}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2.5">
          {/* Title */}
          <h3 className="text-[13px] font-bold text-white/80 leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors duration-200">
            {localizedTitle}
          </h3>

          {/* Description */}
          {localizedDesc && (
            <p className="text-[12px] text-white/50 line-clamp-2 leading-relaxed">
              {localizedDesc}
            </p>
          )}

          {/* Tags */}
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] text-[10px] text-white/60 font-medium"
                >
                  {tag}
                </span>
              ))}
              {safeTags.length > 2 && (
                <span className="px-1.5 py-0.5 text-[10px] text-white/40">
                  +{safeTags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* AI Model compatibility */}
          {visibleModels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visibleModels.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.08] text-[10px] text-white/60 font-medium"
                >
                  <Cpu className="w-2.5 h-2.5" />
                  {MODEL_LABELS[m] ?? m}
                </span>
              ))}
              {(models ?? []).length > 2 && (
                <span className="px-1 py-0.5 text-[10px] text-white/40">
                  +{(models ?? []).length - 2}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-white/[0.08] flex items-center justify-between">
            {/* Seller */}
            <div className="flex items-center gap-2 min-w-0">
              {sellerAvatar ? (
                <img
                  src={sellerAvatar}
                  alt={sellerName ?? ''}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-white/[0.08]"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center ring-1 ring-white/[0.08]">
                  <User className="w-2.5 h-2.5 text-white/50" />
                </div>
              )}
              {sellerName && (
                <span className="text-[11px] text-white/50 truncate max-w-[80px] flex items-center gap-1">
                  {sellerName}
                  <BadgeCheck className="w-3 h-3 text-brand-blue/60 flex-shrink-0" />
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2.5 text-[11px] text-white/50">
              {reviewCount > 0 && (
                <span className="flex items-center gap-1 text-amber-500/80" title="Rating">
                  <Star className="w-3 h-3 fill-amber-500/70" />
                  {averageRating.toFixed(1)}
                </span>
              )}
              {viewCount != null && viewCount > 0 && (
                <span className="flex items-center gap-1" title="Views">
                  <Eye className="w-3 h-3" />
                  {viewCount > 999 ? `${(viewCount / 1000).toFixed(1)}k` : viewCount}
                </span>
              )}
              <span className="flex items-center gap-1" title="Prompts">
                <FileText className="w-3 h-3" />
                {promptCount}
              </span>
              <span className="flex items-center gap-1" title="Purchases">
                <ShoppingBag className="w-3 h-3" />
                {purchaseCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
