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
  coding: 'from-[#C9A84C]/30 via-[#8B7635]/20 to-black/40',
  writing: 'from-[#D4B85A]/30 via-[#C9A84C]/15 to-black/40',
  marketing: 'from-[#E5C767]/30 via-[#C9A84C]/15 to-black/40',
  design: 'from-[#C9A84C]/35 via-[#B8963F]/20 to-black/40',
  business: 'from-[#B8963F]/30 via-[#8B7635]/20 to-black/40',
  education: 'from-[#D4B85A]/30 via-[#B8963F]/15 to-black/40',
  other: 'from-[#C9A84C]/30 via-[#8B7635]/15 to-black/40',
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group h-full"
    >
      <Link
        to={`/prompt-market/${slug}`}
        className="flex flex-col h-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:border-[#C9A84C]/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_40px_rgba(201,168,76,0.08)]"
      >
        {/* Cover */}
        <div className="relative aspect-[3/2] overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={localizedTitle}
              className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${CATEGORY_GRADIENTS[category]} flex items-center justify-center`}
            >
              <div className="text-[#C9A84C]/40 group-hover:text-[#C9A84C]/60 transition-colors duration-300">
                {CATEGORY_ICONS[category]}
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Featured badge */}
          {(featured || variant === 'featured') && (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E5C767] text-black text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-[0_2px_12px_rgba(201,168,76,0.4)]">
              <TrendingUp className="w-2.5 h-2.5" />
              Featured
            </span>
          )}

          {/* Category badge */}
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-[#C9A84C]/15 text-[10px] font-medium text-[#C9A84C]/80 capitalize">
            {category}
          </span>

          {/* Wishlist heart */}
          {isAuthenticated && (
            <button
              onClick={handleWishlistToggle}
              disabled={wishLoading}
              className={`absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-lg backdrop-blur-md border flex items-center justify-center transition-all duration-200 ${
                wishlisted
                  ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : 'bg-black/50 border-white/10 text-white/40 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:border-red-500/30'
              } ${wishlisted ? 'opacity-100' : ''}`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-red-400' : ''}`} />
            </button>
          )}

          {/* Price pill */}
          <div className="absolute bottom-2.5 right-2.5">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-lg ${
                isFree
                  ? 'bg-[#C9A84C]/90 text-black'
                  : 'bg-black/80 border border-[#C9A84C]/30 text-[#E5C767]'
              }`}
            >
              {isFree ? t('free') || 'Free' : `${priceSKT} SKT`}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2.5">
          {/* Title */}
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#E5C767] transition-colors duration-200">
            {localizedTitle}
          </h3>

          {/* Description */}
          {localizedDesc && (
            <p className="text-[13px] text-white/50 line-clamp-2 leading-relaxed">
              {localizedDesc}
            </p>
          )}

          {/* Tags */}
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-[#C9A84C]/[0.08] border border-[#C9A84C]/15 text-[10px] text-[#C9A84C]/75 font-medium"
                >
                  {tag}
                </span>
              ))}
              {safeTags.length > 2 && (
                <span className="px-1.5 py-0.5 text-[10px] text-white/35">
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
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/50 font-medium"
                >
                  <Cpu className="w-2.5 h-2.5" />
                  {MODEL_LABELS[m] ?? m}
                </span>
              ))}
              {(models ?? []).length > 2 && (
                <span className="px-1 py-0.5 text-[10px] text-white/35">
                  +{(models ?? []).length - 2}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-white/[0.07] flex items-center justify-between">
            {/* Seller */}
            <div className="flex items-center gap-2 min-w-0">
              {sellerAvatar ? (
                <img
                  src={sellerAvatar}
                  alt={sellerName ?? ''}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-[#C9A84C]/20"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#C9A84C]/10 flex items-center justify-center ring-1 ring-[#C9A84C]/15">
                  <User className="w-2.5 h-2.5 text-[#C9A84C]/50" />
                </div>
              )}
              {sellerName && (
                <span className="text-[11px] text-white/45 truncate max-w-[80px] flex items-center gap-1">
                  {sellerName}
                  <BadgeCheck className="w-3 h-3 text-[#C9A84C]/60 flex-shrink-0" />
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2.5 text-[11px] text-white/40">
              {reviewCount > 0 && (
                <span className="flex items-center gap-1 text-[#E5C767]/80" title="Rating">
                  <Star className="w-3 h-3 fill-[#E5C767]/70" />
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
