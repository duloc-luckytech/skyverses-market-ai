/**
 * ProHeroVisuals.tsx — Reusable PRO visual templates for HeroSection right columns
 *
 * Usage:
 *   import { ImageMasonryGrid, BeforeAfterSlider, VideoReelGrid, FloatingBadge } from '../_shared/ProHeroVisuals';
 *
 * Template guide:
 *   image-generator, poster, upscale     → <ImageMasonryGrid />
 *   background-removal, restoration       → <BeforeAfterSlider />
 *   video-generator, video-animate        → <VideoReelGrid />
 *   social-banner                         → <PlatformMockupGrid /> (already exists, also exported here)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Sparkles, Download, Wand2 } from 'lucide-react';
import { getExplorerUrl } from '../../../apis/config';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExplorerItem {
  _id: string;
  thumbnailUrl?: string;
  mediaUrl: string;
  title?: string;
}

// ─── FloatingBadge ────────────────────────────────────────────────────────────
/**
 * Animated stats/label badge that floats on top of hero visuals.
 * Position with absolute Tailwind classes via `className`.
 */
interface FloatingBadgeProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

export const FloatingBadge: React.FC<FloatingBadgeProps> = ({
  label,
  value,
  icon,
  className,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7, y: 8 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 280, damping: 22 }}
    className={`bg-white dark:bg-[#111] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3 py-2 shadow-lg flex items-center gap-2.5 backdrop-blur-sm ${className ?? ''}`}
  >
    {icon && (
      <div className="shrink-0 w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
        {icon}
      </div>
    )}
    <div>
      <p className="text-[9px] font-bold text-slate-800 dark:text-white leading-tight">{value}</p>
      <p className="text-[7px] text-slate-400 dark:text-[#555]">{label}</p>
    </div>
  </motion.div>
);

// ─── AIBadge ──────────────────────────────────────────────────────────────────
/** "AI Generated" sparkle badge — top-right corner of any visual container */
export const AIBadge: React.FC<{ delay?: number }> = ({ delay = 0.65 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 300 }}
    className="absolute -top-3 -right-3 bg-brand-blue text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-brand-blue/30 flex items-center gap-1.5 z-10"
  >
    <motion.span animate={{ rotate: [0, 20, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
      <Sparkles size={9} />
    </motion.span>
    AI Generated
  </motion.div>
);

// ─── ImageMasonryGrid ─────────────────────────────────────────────────────────
/**
 * Masonry-style image grid fetching from Explorer API.
 * Best for: image-generator, poster-marketing, upscale tools.
 */
interface ImageMasonryGridProps {
  type?: 'image' | 'video';
  limit?: number;
  columns?: 2 | 3;
  className?: string;
}

export const ImageMasonryGrid: React.FC<ImageMasonryGridProps> = ({
  type = 'image',
  limit = 18,
  columns = 3,
  className,
}) => {
  const [items, setItems] = useState<ExplorerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(getExplorerUrl(type, 1, limit));
        const j = await r.json();
        if (j.data && Array.isArray(j.data)) setItems(j.data.slice(0, limit));
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [type, limit]);

  // Split items into columns for masonry
  const cols: ExplorerItem[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => cols[i % columns].push(item));

  const shimmerCols = Array.from({ length: columns }, (_, ci) =>
    Array.from({ length: ci % 2 === 0 ? 4 : 3 }, (__, i) => i)
  );

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* AI Badge */}
      <AIBadge delay={0.6} />

      {/* Masonry grid */}
      <div className={`grid gap-2.5 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {loading
          ? shimmerCols.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-2.5">
                {col.map((_, i) => {
                  const heights = ['h-28', 'h-20', 'h-32', 'h-24', 'h-20'];
                  return (
                    <div
                      key={i}
                      className={`${heights[(ci * 3 + i) % heights.length]} rounded-xl bg-black/[0.06] dark:bg-white/[0.04] animate-pulse`}
                    />
                  );
                })}
              </div>
            ))
          : cols.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-2.5">
                {col.map((item, i) => (
                  <MasonryCard key={item._id} item={item} delay={ci * 0.05 + i * 0.06} />
                ))}
              </div>
            ))}
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#0a0a0c] to-transparent pointer-events-none" />
    </div>
  );
};

const MasonryCard: React.FC<{ item: ExplorerItem; delay: number }> = ({ item, delay }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-xl overflow-hidden group cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src={item.thumbnailUrl || item.mediaUrl}
        alt={item.title || ''}
        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Download size={12} className="text-white" />
            </div>
            <div className="w-7 h-7 rounded-full bg-brand-blue/80 backdrop-blur-sm flex items-center justify-center">
              <Wand2 size={12} className="text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── BeforeAfterSlider ────────────────────────────────────────────────────────
/**
 * Interactive drag-to-reveal before/after comparison slider.
 * Best for: background-removal, image-restoration, upscale, real-estate.
 */
interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  aspectRatio?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Trước',
  afterLabel = 'Sau (AI)',
  className,
  aspectRatio = 'aspect-[4/3]',
}) => {
  const [position, setPosition] = useState(50); // 0–100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  };

  const onMouseMove = (e: React.MouseEvent) => { if (isDragging) updatePosition(e.clientX); };
  const onTouchMove = (e: React.TouchEvent) => { if (isDragging) updatePosition(e.touches[0].clientX); };

  return (
    <div
      ref={containerRef}
      className={`relative ${aspectRatio} w-full rounded-2xl overflow-hidden cursor-ew-resize select-none ${className ?? ''}`}
      onMouseMove={onMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchMove={onTouchMove}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* BEFORE image (full) */}
      <img src={beforeSrc} alt={beforeLabel} className="absolute inset-0 w-full h-full object-cover" />

      {/* AFTER image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img src={afterSrc} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.6)] z-10"
        style={{ left: `${position}%` }}
      />

      {/* Handle */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 z-10 cursor-ew-resize"
        style={{ left: `calc(${position}% - 16px)` }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        whileHover={{ scale: 1.1 }}
      >
        <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center gap-0.5">
          <ChevronLeft size={10} className="text-slate-600" />
          <ChevronRight size={10} className="text-slate-600" />
        </div>
      </motion.div>

      {/* Labels */}
      <div className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider text-white/70 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
        {beforeLabel}
      </div>
      <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-white bg-brand-blue/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
        <Sparkles size={9} /> {afterLabel}
      </div>

      {/* AI Badge */}
      <AIBadge delay={0.5} />
    </div>
  );
};

// ─── VideoReelGrid ────────────────────────────────────────────────────────────
/**
 * Grid of video thumbnails with play button overlays + hover preview.
 * Best for: video-generator, video-animate, text-to-video, cast-and-direct.
 */
interface VideoItem {
  _id: string;
  thumbnailUrl?: string;
  mediaUrl: string;
  title?: string;
  duration?: string;
}

interface VideoReelGridProps {
  items?: VideoItem[];
  fetchFromExplorer?: boolean;
  limit?: number;
  className?: string;
}

export const VideoReelGrid: React.FC<VideoReelGridProps> = ({
  items: propItems,
  fetchFromExplorer = true,
  limit = 6,
  className,
}) => {
  const [items, setItems] = useState<VideoItem[]>(propItems || []);
  const [loading, setLoading] = useState(!propItems);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (propItems || !fetchFromExplorer) return;
    (async () => {
      try {
        const r = await fetch(getExplorerUrl('video', 1, limit));
        const j = await r.json();
        if (j.data && Array.isArray(j.data)) setItems(j.data.slice(0, limit));
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [fetchFromExplorer, limit, propItems]);

  // Layout: 3 cols × 2 rows
  const layout = [
    { span: 'col-span-2 row-span-1', aspect: 'aspect-video' },
    { span: 'col-span-1 row-span-1', aspect: 'aspect-square' },
    { span: 'col-span-1 row-span-1', aspect: 'aspect-square' },
    { span: 'col-span-2 row-span-1', aspect: 'aspect-video' },
    { span: 'col-span-1 row-span-1', aspect: 'aspect-square' },
    { span: 'col-span-1 row-span-1', aspect: 'aspect-square' },
  ];

  return (
    <div className={`relative ${className ?? ''}`}>
      <AIBadge delay={0.6} />

      <div className="grid grid-cols-3 gap-2.5 auto-rows-fr">
        {loading
          ? layout.map((l, i) => (
              <div key={i} className={`${l.span} ${l.aspect} rounded-xl bg-black/[0.06] dark:bg-white/[0.04] animate-pulse`} />
            ))
          : items.slice(0, 6).map((item, i) => {
              const l = layout[i] || layout[5];
              return (
                <VideoReelCard
                  key={item._id}
                  item={item}
                  spanClass={l.span}
                  aspectClass={l.aspect}
                  delay={i * 0.07}
                  isPlaying={playingId === item._id}
                  onPlay={() => setPlayingId(playingId === item._id ? null : item._id)}
                />
              );
            })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#0a0a0c] to-transparent pointer-events-none" />
    </div>
  );
};

const VideoReelCard: React.FC<{
  item: VideoItem;
  spanClass: string;
  aspectClass: string;
  delay: number;
  isPlaying: boolean;
  onPlay: () => void;
}> = ({ item, spanClass, aspectClass, delay, isPlaying, onPlay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.94 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    className={`${spanClass} ${aspectClass} relative rounded-xl overflow-hidden group cursor-pointer bg-black/[0.06] dark:bg-white/[0.03]`}
    onClick={onPlay}
  >
    {item.thumbnailUrl ? (
      <img src={item.thumbnailUrl} alt={item.title || ''} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
    ) : (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
    )}

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

    {/* Play button */}
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
          isPlaying ? 'bg-brand-blue' : 'bg-white/25 backdrop-blur-sm group-hover:bg-brand-blue/80'
        }`}
      >
        <Play size={14} className="text-white ml-0.5" fill="white" />
      </motion.div>
    </div>

    {/* Duration badge */}
    {item.duration && (
      <div className="absolute bottom-2 right-2 text-[7px] font-mono text-white/70 bg-black/40 px-1.5 py-0.5 rounded">
        {item.duration}
      </div>
    )}
  </motion.div>
);

// ─── ShowcaseImageStrip ───────────────────────────────────────────────────────
/**
 * Horizontal auto-scrolling image strip for ShowcaseSection.
 * Two rows scrolling in opposite directions.
 */
interface ShowcaseImageStripProps {
  type?: 'image' | 'video';
  limit?: number;
  className?: string;
}

export const ShowcaseImageStrip: React.FC<ShowcaseImageStripProps> = ({
  type = 'image',
  limit = 24,
  className,
}) => {
  const [items, setItems] = useState<ExplorerItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(getExplorerUrl(type, 1, limit));
        const j = await r.json();
        if (j.data && Array.isArray(j.data)) setItems(j.data.slice(0, limit));
      } catch { /* silent */ }
    })();
  }, [type, limit]);

  if (items.length === 0) return null;

  const row1 = items.slice(0, Math.ceil(items.length / 2));
  const row2 = items.slice(Math.ceil(items.length / 2));

  return (
    <div className={`overflow-hidden ${className ?? ''}`}>
      {/* Row 1 — left scroll */}
      <MarqueeRow items={[...row1, ...row1]} direction="left" speed={40} />
      {/* Row 2 — right scroll */}
      <div className="mt-3">
        <MarqueeRow items={[...row2, ...row2]} direction="right" speed={35} />
      </div>
    </div>
  );
};

const MarqueeRow: React.FC<{ items: ExplorerItem[]; direction: 'left' | 'right'; speed: number }> = ({
  items,
  direction,
  speed,
}) => {
  const duration = items.length * (100 / speed);
  return (
    <div className="flex gap-3 overflow-hidden">
      <motion.div
        className="flex gap-3 shrink-0"
        animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((item, i) => (
          <div
            key={`${item._id}-${i}`}
            className="shrink-0 w-40 h-28 rounded-xl overflow-hidden bg-black/[0.05] dark:bg-white/[0.03]"
          >
            <img
              src={item.thumbnailUrl || item.mediaUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
