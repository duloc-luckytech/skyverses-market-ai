import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Cpu,
  Eye,
  FileText,
  Heart,
  ImageIcon,
  Package,
  PlayCircle,
  ShoppingBag,
  Sparkles,
  Star,
  User,
  Video,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { promptMarketApi } from '../../apis/prompt-market';
import type { AIModel, LocalizedString, PromptSet } from '../../types';

type CardMedia = {
  key: string;
  type: 'image' | 'video';
  url: string;
  poster?: string;
};

interface Props {
  promptSet: PromptSet;
  index?: number;
  variant?: 'default' | 'featured';
  initialWishlisted?: boolean;
}

const MODEL_LABELS: Partial<Record<AIModel, string>> = {
  'Nano Banana Pro': 'Banana Pro',
  'Nano Banana 2': 'Banana 2',
  'GPT Image': 'GPT Image',
  'Imagen 4': 'Imagen 4',
  'Midjourney V7': 'Midjourney V7',
  'Niji V7': 'Niji V7',
  'FLUX.1 Kontext': 'Flux Kontext',
  'Seedream 4.0': 'Seedream 4',
  'Stable Diffusion 3.5': 'SD 3.5',
  'Ideogram 3.0': 'Ideogram 3',
  'Runway Gen-4.5': 'Runway 4.5',
  'Runway Gen-4': 'Runway 4',
  'Veo 3.1': 'Veo 3.1',
  'Kling 3.0': 'Kling 3',
  'Kling 3.0 Omni': 'Kling Omni',
  'Seedance 2.0': 'Seedance 2',
  'Wan 2.2': 'Wan 2.2',
  midjourney: 'Midjourney',
  flux: 'Flux',
  gemini: 'Gemini',
  'gemini-2': 'Gemini 2',
  'gpt-4o': 'GPT-4o',
  'gpt-5': 'GPT-5',
};

function localize(value: string | LocalizedString | Record<string, string> | undefined, lang: string): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const localized = value as Record<string, string | undefined>;
  return localized[lang] || localized.en || '';
}

function compact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return String(value);
}

function mediaFor(promptSet: PromptSet): CardMedia[] {
  const seen = new Set<string>();
  const items: Array<CardMedia | null> = [
    promptSet.coverImage ? { key: `${promptSet._id}-cover`, type: 'image', url: promptSet.coverImage } : null,
    ...(promptSet.examples ?? []).flatMap((example, index) => [
      example.image ? { key: `${promptSet._id}-image-${index}`, type: 'image' as const, url: example.image } : null,
      example.video ? { key: `${promptSet._id}-video-${index}`, type: 'video' as const, url: example.video, poster: example.image || promptSet.coverImage } : null,
    ]),
  ];

  return items.filter((item): item is CardMedia => {
    if (!item) return false;
    const key = `${item.type}:${item.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function modelLabel(model: AIModel): string {
  return MODEL_LABELS[model] ?? model;
}

export default function PromptSetCard({ promptSet, index = 0, variant = 'default', initialWishlisted = false }: Props) {
  const { lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [wishLoading, setWishLoading] = useState(false);

  const title = localize(promptSet.title, lang);
  const description = localize(promptSet.description, lang);
  const sellerName = typeof promptSet.sellerId === 'object' && promptSet.sellerId !== null ? promptSet.sellerId.name : 'Sky Creator';
  const sellerAvatar = typeof promptSet.sellerId === 'object' && promptSet.sellerId !== null ? promptSet.sellerId.avatar : undefined;
  const promptCount = promptSet.promptCount ?? promptSet.prompts?.length ?? 0;
  const media = mediaFor(promptSet);
  const mainMedia = media.find(item => item.type === 'video') ?? media[0];
  const thumbnails = media.filter(item => item.type === 'image' || item.poster).slice(0, 4);
  const extraCount = Math.max(media.length - thumbnails.length, 0);
  const imageCount = media.filter(item => item.type === 'image').length;
  const videoCount = media.filter(item => item.type === 'video').length;
  const hasVideo = videoCount > 0;
  const visibleTags = (promptSet.tags ?? []).slice(0, 2);
  const visibleModels = (promptSet.models ?? []).slice(0, 3);

  const handleWishlistToggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated || wishLoading) return;
    setWishLoading(true);
    const res = await promptMarketApi.toggleWishlist(promptSet._id);
    if (res.success) setWishlisted(res.wishlisted);
    setWishLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.42, delay: Math.min(index * 0.035, 0.2), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <Link
        to={`/prompt-market/${promptSet.slug}`}
        className={`flex h-full flex-col overflow-hidden border bg-[#101316] shadow-[0_18px_48px_rgba(0,0,0,0.24)] transition-all duration-300 ${
          variant === 'featured' || promptSet.featured
            ? 'border-brand-blue/35 hover:border-brand-blue/70'
            : 'border-white/[0.08] hover:border-brand-blue/35'
        }`}
      >
        <div className="relative h-[205px] overflow-hidden bg-black">
          {mainMedia?.type === 'video' ? (
            <video
              src={mainMedia.url}
              poster={mainMedia.poster || promptSet.coverImage}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              muted
              playsInline
              preload="metadata"
            />
          ) : mainMedia ? (
            <img
              src={mainMedia.url}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-blue/12 to-black">
              <Package className="h-8 w-8 text-brand-blue/38" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-transparent to-black/20" />

          {hasVideo && (
            <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center border border-white/20 bg-black/55 text-white backdrop-blur">
              <Video className="h-4 w-4" />
            </span>
          )}

          {(promptSet.featured || variant === 'featured') && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 border border-brand-blue/40 bg-brand-blue/18 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-blue backdrop-blur">
              <Sparkles className="h-3 w-3" /> Hot
            </span>
          )}

          {isAuthenticated && (
            <button
              onClick={handleWishlistToggle}
              disabled={wishLoading}
              className={`absolute bottom-[54px] right-3 z-10 grid h-8 w-8 place-items-center border backdrop-blur transition ${
                wishlisted
                  ? 'border-red-400/45 bg-red-500/18 text-red-300'
                  : 'border-white/15 bg-black/55 text-white/62 opacity-0 hover:border-red-400/35 hover:text-red-300 group-hover:opacity-100'
              }`}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          )}

          {thumbnails.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 bg-black/42 p-2 backdrop-blur-sm">
              {thumbnails.map(item => (
                <div key={item.key} className="relative h-10 flex-1 overflow-hidden border border-white/[0.12] bg-white/[0.05]">
                  <img src={item.poster || item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  {item.type === 'video' && <PlayCircle className="absolute left-1.5 top-1.5 h-3.5 w-3.5 text-white drop-shadow" />}
                </div>
              ))}
              {extraCount > 0 && (
                <div className="grid h-10 w-12 place-items-center border border-white/[0.12] bg-black/55 text-xs font-semibold text-white/85">
                  +{extraCount}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="border border-brand-blue/20 bg-brand-blue/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-brand-blue">
              {promptSet.category}
            </span>
            <span className={`text-[13px] font-bold ${promptSet.isFree ? 'text-emerald-400' : 'text-brand-blue'}`}>
              {promptSet.isFree ? 'Free' : `${promptSet.priceSKT} SKT`}
            </span>
          </div>

          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-white/90 transition-colors group-hover:text-brand-blue">
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-[38px] text-[12px] leading-[19px] text-white/50">
            {description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleModels.map(model => (
              <span key={model} className="inline-flex items-center gap-1 border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] text-white/60">
                <Cpu className="h-3 w-3 text-brand-blue" />
                {modelLabel(model)}
              </span>
            ))}
            {visibleTags.map(tag => (
              <span key={tag} className="border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-[10px] text-white/48">
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-auto border-t border-white/[0.08] pt-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {sellerAvatar ? (
                  <img src={sellerAvatar} alt="" className="h-7 w-7 rounded-full border border-white/[0.12] object-cover" loading="lazy" />
                ) : (
                  <div className="grid h-7 w-7 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                    <User className="h-3.5 w-3.5 text-white/52" />
                  </div>
                )}
                <span className="flex min-w-0 items-center gap-1 text-[12px] text-white/58">
                  <span className="truncate">{sellerName}</span>
                  <BadgeCheck className="h-3 w-3 shrink-0 text-brand-blue" />
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-[11px] text-white/50">
                <span className="inline-flex items-center gap-1 text-brand-blue">
                  <Star className="h-3 w-3 fill-current" />
                  {promptSet.averageRating?.toFixed(1) || '4.8'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {compact(promptSet.viewCount || 0)}
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-white/45">
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {promptCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                {compact(promptSet.purchaseCount || 0)}
              </span>
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
        </div>
      </Link>
    </motion.div>
  );
}
