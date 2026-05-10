
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2, Loader2, SearchX, RefreshCw,
  ArrowRightLeft, Check,
  Video, ImageIcon, X,
  Eye, Heart, Sparkles, TrendingUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { explorerApi } from '../apis/explorer';
import ExplorerDetailModal, { ExplorerItem } from '../components/ExplorerDetailModal';
import { FilterHub } from '../components/explorer/FilterHub';

// --- Fake Stats Helper ---
const getFakeStats = (seedId: string) => {
  const hash = seedId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const views = (hash * 13) % 950 + 50;
  const likes = (hash * 7) % Math.floor(views * 0.8) + 12;
  const fmt = (n: number) => n > 999 ? (n / 1000).toFixed(1) + 'k' : n.toString();
  return { views: fmt(views), likes: fmt(likes) };
};

// Repeating aspect-ratio pattern for visual variety (no reflow)
const ASPECT_CLASSES = [
  'aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-[4/5]',
  'aspect-[4/5]', 'aspect-[3/4]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/5]',
];

// Stagger animation for cards
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: Math.min(i * 0.04, 0.6), duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

// --- 3D Asset Card with Slider ---
const ThreeDAssetCard: React.FC<{ 
  item: ExplorerItem, isSelected: boolean,
  onToggleSelect: (e: React.MouseEvent) => void, onClick: () => void 
}> = ({ item, isSelected, onToggleSelect, onClick }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const modelKey = (item.modelKey || item.model || 'Native').replace(/_/g, ' ');
  const stats = useMemo(() => getFakeStats(item._id || item.id || item.title), [item]);

  return (
    <motion.div 
      layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className={`break-inside-avoid relative overflow-hidden bg-slate-900 group cursor-pointer rounded-xl mb-3 border-2 transition-all ${isSelected ? 'border-brand-blue shadow-lg shadow-brand-blue/10' : 'border-transparent'}`}
    >
      {/* Select checkbox */}
      <div onClick={onToggleSelect} className={`absolute top-3 left-3 z-50 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-blue border-brand-blue' : 'bg-black/30 border-white/20 opacity-0 group-hover:opacity-100'}`}>
        {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
      </div>

      {/* Image comparison slider */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-zinc-900">
        <div className="absolute inset-0">
          <img src={item.thumbnailUrl || item.url || item.mediaUrl} className="w-full h-full object-cover filter grayscale brightness-[1.5] contrast-[0.9]" alt={item.title} />
        </div>
        <div className="absolute inset-0 z-10 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
          <img src={item.thumbnailUrl || item.url || item.mediaUrl} className="w-full h-full object-cover" alt={item.title} />
        </div>
        <div className="absolute inset-y-0 z-20 w-0.5 bg-white/80 flex items-center justify-center pointer-events-none" style={{ left: `${sliderPos}%` }}>
          <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-lg"><ArrowRightLeft size={10} strokeWidth={2.5} /></div>
        </div>
        <input type="range" min="0" max="100" value={sliderPos} onChange={(e) => setSliderPos(Number(e.target.value))} className="absolute inset-0 z-30 opacity-0 cursor-ew-resize w-full h-full" onClick={(e) => e.stopPropagation()} />
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />

      {/* Info overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none space-y-1">
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          {item.prompt && <p className="text-[10px] text-white/40 line-clamp-2 italic">"{item.prompt}"</p>}
          <div className="flex items-center gap-2.5 text-[10px] text-white/30">
            <span className="flex items-center gap-1"><Eye size={10} /> {stats.views}</span>
            <span className="flex items-center gap-1"><Heart size={10} /> {stats.likes}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-brand-blue">{modelKey}</span>
          <span className="text-white/20">·</span>
          <span className="text-[10px] text-white/30">{item.type}</span>
        </div>
      </div>

      {/* Expand button */}
      <div className="absolute bottom-3 right-3 z-40 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={onClick} className="p-2 bg-white text-black rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all"><Maximize2 size={12} /></button>
      </div>
    </motion.div>
  );
};

// --- LazyImage with fixed container (no layout shift) ---
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { rootMargin: '400px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="absolute inset-0">
      {inView && (
        <img
          src={src} alt={alt}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:duration-[1.2s] ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'}`}
        />
      )}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-white/[0.04] dark:to-white/[0.02] animate-pulse" />
      )}
    </div>
  );
};

// --- Main Explorer Page ---
const ExplorerPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  usePageMeta({
    title: 'Explorer | Skyverses - Bộ sưu tập AI Gallery',
    description: 'Khám phá bộ sưu tập tác phẩm AI - hình ảnh, video, 3D assets được tạo từ các model AI hàng đầu như Midjourney, Kling, Sora, Veo3.',
    keywords: 'AI gallery, AI art, AI images, AI videos, Skyverses explorer',
    canonical: '/explorer'
  });
  const [items, setItems] = useState<ExplorerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | ExplorerItem['type']>('all');
  const [selectedItem, setSelectedItem] = useState<ExplorerItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchItems = async (pageToFetch: number, reset: boolean = false) => {
    if (pageToFetch > 1) setIsFetchingMore(true);
    else setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page: pageToFetch, limit: 20 };
      if (activeFilter !== 'all') params.type = activeFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await explorerApi.getItems(params as any);
      if (res.success && Array.isArray(res.data)) {
        if (reset) setItems(res.data); else setItems(prev => [...prev, ...res.data]);
        setHasMore(res.data.length >= 20);
      } else {
        if (reset) setItems([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch explorer items:", error);
      if (reset) setItems([]);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchItems(1, true);
    setSelectedIds([]);
  }, [activeFilter, searchQuery]);

  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => { const next = prev + 1; fetchItems(next); return next; });
      }
    }, { threshold: 0.1, rootMargin: '200px' });
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, hasMore]);

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const selectedItems = useMemo(() => items.filter(i => selectedIds.includes(i._id || i.id)), [items, selectedIds]);
  const canGenerate = useMemo(() => selectedItems.length > 0 && selectedItems.every(i => i.status !== 'processing' && i.status !== 'done'), [selectedItems]);

  return (
    <div className="pt-20 md:pt-28 pb-32 bg-[var(--atlas-bg-page)] min-h-screen text-[var(--atlas-text-primary)] transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">

        {/* ═══════ LUXURY HERO HEADER ═══════ */}
        <header className="mb-10 md:mb-14">
          {isLoading && page === 1 ? (
            <div className="animate-pulse rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] p-8 md:p-14">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-5">
                  <div className="h-4 bg-slate-100 dark:bg-white/[0.04] rounded-full w-24" />
                  <div className="h-12 bg-slate-100 dark:bg-white/[0.04] rounded-lg w-3/5" />
                  <div className="h-5 bg-slate-100 dark:bg-white/[0.04] rounded-lg w-4/5" />
                  <div className="flex gap-2 pt-2">{[1,2,3,4].map(i => <div key={i} className="h-10 w-24 bg-slate-100 dark:bg-white/[0.04] rounded-xl" />)}</div>
                </div>
                <div className="lg:col-span-2 hidden lg:flex gap-3">
                  {[1,2,3].map(i => <div key={i} className="flex-1 aspect-[3/4] bg-slate-100 dark:bg-white/[0.04] rounded-lg" />)}
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06]"
            >
              {/* Luxury gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-[#12141a] dark:via-[#0c0c0f] dark:to-[#141008]" />

              {/* Ambient glow orbs */}
              <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-atlas-purple/[0.06] dark:bg-atlas-purple/[0.10] rounded-full blur-[150px] pointer-events-none" />
              <div className="absolute bottom-[-30%] left-[10%] w-[400px] h-[400px] bg-brand-blue/[0.04] dark:bg-brand-blue/[0.06] rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute top-[20%] left-[-5%] w-[250px] h-[250px] bg-amber-300/[0.04] dark:bg-amber-400/[0.03] rounded-full blur-[80px] pointer-events-none" />

              {/* Subtle grid pattern overlay */}
              <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />

              <div className="relative z-10 p-7 md:p-12 lg:p-14">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
                  {/* Left — Text + Filters */}
                  <div className="lg:col-span-3 space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="space-y-4"
                    >
                      {/* Premium badge */}
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-atlas-purple/[0.10] to-amber-500/[0.06] border border-atlas-purple/15 rounded-full">
                        <Sparkles size={12} className="text-atlas-purple" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-atlas-purple">Explorer</span>
                      </div>

                      <h1 className="text-[2.25rem] md:text-[3rem] lg:text-[3.5rem] font-bold tracking-[-0.03em] leading-[1.05]">
                        Khám phá{' '}
                        <span className="bg-gradient-to-r from-atlas-purple via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                          thế giới AI
                        </span>
                      </h1>
                      <p className="text-[15px] md:text-base text-[var(--atlas-text-secondary)] leading-relaxed max-w-lg">
                        {t('explorer.subtitle')}
                      </p>

                      {/* Live stats bar */}
                      <div className="flex items-center gap-4 pt-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-full">
                          <div className="relative w-2 h-2">
                            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
                            <div className="relative w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Live Gallery</span>
                        </div>
                        {items.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[12px] text-[var(--atlas-text-secondary)]">
                            <TrendingUp size={12} className="text-atlas-purple" />
                            <span className="font-semibold text-[var(--atlas-text-primary)]">{items.length}+</span>
                            <span>tác phẩm</span>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Filter Pills */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
                      <FilterHub activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                    </motion.div>

                    {/* Active search query banner */}
                    {searchQuery && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-atlas-purple/[0.08] to-amber-500/[0.04] border border-atlas-purple/15 backdrop-blur-sm">
                          <Sparkles size={13} className="text-atlas-purple/60" />
                          <span className="text-[12px] text-[var(--atlas-text-secondary)]">Collection:</span>
                          <span className="text-[13px] font-bold text-atlas-purple">{searchQuery}</span>
                          <button onClick={() => setSearchParams({})} className="ml-1 p-1 rounded-lg hover:bg-atlas-purple/10 transition-all text-atlas-purple/40 hover:text-atlas-purple">
                            <X size={12} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Right — Luxury Image Collage */}
                  <div className="lg:col-span-2 hidden lg:block">
                    <div className="relative h-[240px]">
                      {items.slice(0, 3).map((item, i) => {
                        const configs = [
                          { rotate: -4, x: 0, y: 0, z: 10, delay: 0.3 },
                          { rotate: 2, x: 24, y: 12, z: 20, delay: 0.45 },
                          { rotate: -1, x: 48, y: -6, z: 30, delay: 0.6 },
                        ];
                        const cfg = configs[i];
                        return (
                          <motion.div
                            key={item._id || item.id || i}
                            initial={{ opacity: 0, y: 30, rotate: 0 }}
                            animate={{ opacity: 1, y: cfg.y, rotate: cfg.rotate }}
                            transition={{ delay: cfg.delay, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                            whileHover={{ rotate: 0, scale: 1.06, y: cfg.y - 8 }}
                            className="absolute top-0 w-[45%] h-full rounded-lg overflow-hidden shadow-2xl border-2 border-white/80 dark:border-white/[0.08] cursor-pointer"
                            style={{ left: `${i * 25}%`, zIndex: cfg.z, transform: `translateX(${cfg.x}px)` }}
                            onClick={() => setSelectedItem(item)}
                          >
                            <img
                              src={item.thumbnailUrl || item.url || item.mediaUrl}
                              className="w-full h-full object-cover"
                              alt={item.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
                              <div className="px-2 py-1 bg-black/40 backdrop-blur-md text-[9px] font-semibold text-white rounded-lg border border-white/[0.08]">
                                {(item.modelKey || item.model || 'AI').replace(/_/g, ' ')}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      {items.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-gray-700">
                          <ImageIcon size={48} strokeWidth={1} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </header>

        {/* ═══════ LUXURY CONTENT GRID ═══════ */}
        <div className="min-h-[400px]">
          {isLoading && page === 1 ? (
            <div className="explorer-grid">
              {[...Array(15)].map((_, i) => (
                <div key={i} className={`rounded-lg bg-slate-100 dark:bg-white/[0.03] animate-pulse ${ASPECT_CLASSES[i % ASPECT_CLASSES.length]}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-200/50 dark:from-white/[0.02] to-transparent" />
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="explorer-grid">
                  {items.map((item, idx) => {
                    const isSelected = selectedIds.includes(item._id || item.id);
                    const modelKey = (item.modelKey || item.model || 'Native').replace(/_/g, ' ');
                    const isLast = items.length === idx + 1;
                    const stats = getFakeStats(item._id || item.id || item.title);
                    const aspectClass = ASPECT_CLASSES[idx % ASPECT_CLASSES.length];

                    if (item.type === 'game_asset_3d') {
                      return (
                        <div key={item._id || item.id} ref={isLast ? lastItemRef : null} className="aspect-[3/4]">
                          <ThreeDAssetCard item={item} isSelected={isSelected}
                            onToggleSelect={(e) => toggleSelection(e, item._id || item.id)}
                            onClick={() => setSelectedItem(item)}
                          />
                        </div>
                      );
                    }

                    return (
                      <motion.div
                        key={item._id || item.id}
                        ref={isLast ? lastItemRef : null}
                        custom={idx}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ y: -4, transition: { duration: 0.3, ease: 'easeOut' } }}
                        className={`relative overflow-hidden group cursor-pointer rounded-lg transition-shadow duration-500 bg-white dark:bg-[var(--atlas-bg-panel)] ${aspectClass} ${isSelected ? 'ring-2 ring-atlas-purple shadow-lg shadow-atlas-purple/15 scale-[0.98]' : 'ring-1 ring-black/[0.06] dark:ring-white/[0.06] hover:ring-atlas-purple/30 hover:shadow-xl hover:shadow-black/[0.08] dark:hover:shadow-atlas-purple/[0.06]'}`}
                        onClick={() => setSelectedItem(item)}
                      >
                        {/* Select checkbox */}
                        <div onClick={(e) => toggleSelection(e, item._id || item.id)} className={`absolute top-3 left-3 z-30 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-atlas-purple border-atlas-purple shadow-sm shadow-atlas-purple/30' : 'bg-black/20 backdrop-blur-sm border-white/20 opacity-0 group-hover:opacity-100'}`}>
                          {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                        </div>

                        {/* Model badge — premium glass style */}
                        <div className="absolute top-3 right-3 z-30">
                          <span className="px-2.5 py-1 bg-black/30 backdrop-blur-xl text-[10px] font-semibold text-white rounded-lg border border-white/[0.08] shadow-sm">{modelKey}</span>
                        </div>

                        {/* Image container */}
                        <div className="absolute inset-0 overflow-hidden bg-slate-100 dark:bg-white/[0.03]">
                          <LazyImage src={item.thumbnailUrl || item.url || item.mediaUrl} alt={item.title} />

                          {/* Premium gradient hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                          {/* Subtle shimmer on hover */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transition: 'transform 0.8s ease-out, opacity 0.3s ease' }} />

                          {/* Hover overlay info — luxury layout */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400">
                            {item.prompt && (
                              <p className="text-[10px] text-white/50 line-clamp-2 italic mb-2 font-light">"{item.prompt}"</p>
                            )}
                            <div className="flex items-center gap-3 text-[11px]">
                              <span className="flex items-center gap-1 text-white/40"><Eye size={11} /> {stats.views}</span>
                              <span className="flex items-center gap-1 text-white/40"><Heart size={11} /> {stats.likes}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card footer — refined */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-3.5 py-3 flex items-center justify-between z-20">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-atlas-purple shrink-0 shadow-sm shadow-atlas-purple/30" />
                            <span className="text-[11px] font-medium text-white/60 truncate tracking-wide">{item.type?.replace(/_/g, ' ')}</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }} className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                            <Maximize2 size={12} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Luxury load more indicator */}
              {isFetchingMore && (
                <div className="flex justify-center py-12">
                  <div className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl rounded-lg border border-black/[0.06] dark:border-white/[0.06] shadow-lg">
                    <Loader2 size={16} className="animate-spin text-atlas-purple" />
                    <p className="text-[13px] font-medium text-[var(--atlas-text-secondary)]">Đang tải thêm...</p>
                  </div>
                </div>
              )}

              {!hasMore && items.length > 0 && (
                <div className="flex justify-center py-16">
                  <div className="flex items-center gap-2 text-[13px] text-slate-300 dark:text-gray-600">
                    <div className="w-8 h-px bg-slate-200 dark:bg-gray-700" />
                    <span>Đã hiển thị tất cả</span>
                    <div className="w-8 h-px bg-slate-200 dark:bg-gray-700" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-28 gap-5 text-center"
            >
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                <SearchX size={44} strokeWidth={1.2} className="text-slate-300 dark:text-gray-600" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-500">{t('explorer.empty')}</p>
                <button onClick={() => fetchItems(1, true)} className="text-[13px] text-atlas-purple hover:text-atlas-purple/80 font-medium flex items-center gap-1.5 mx-auto transition-colors">
                  <RefreshCw size={13} /> {t('explorer.retry')}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══════ LUXURY SELECTION ACTION BAR ═══════ */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] w-full max-w-xl px-4"
          >
            <div className="bg-white/90 dark:bg-[#1a1a22]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08] px-5 py-3.5 rounded-lg shadow-2xl shadow-black/[0.12] dark:shadow-atlas-purple/[0.08] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-atlas-purple/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-atlas-purple">{selectedIds.length}</span>
                </div>
                <span className="text-[13px] font-medium text-[var(--atlas-text-secondary)]">đã chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <button disabled={!canGenerate} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${canGenerate ? 'bg-atlas-purple text-white hover:brightness-110 shadow-sm shadow-atlas-purple/20' : 'bg-slate-100 dark:bg-white/5 text-slate-300 cursor-not-allowed'}`}>
                  <ImageIcon size={14} /> Tạo ảnh
                </button>
                <button disabled={!canGenerate} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${canGenerate ? 'bg-gradient-to-r from-brand-blue to-amber-600 text-white hover:brightness-110 shadow-sm shadow-brand-blue/20' : 'bg-slate-100 dark:bg-white/5 text-slate-300 cursor-not-allowed'}`}>
                  <Video size={14} /> Tạo video
                </button>
                <button onClick={() => setSelectedIds([])} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all ml-1">
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ExplorerDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <style>{`
        .explorer-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 768px) { .explorer-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
        @media (min-width: 1024px) { .explorer-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
        @media (min-width: 1280px) { .explorer-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; } }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 100%;
          width: 2px;
          cursor: ew-resize;
        }
      `}</style>
    </div>
  );
};

export default ExplorerPage;
