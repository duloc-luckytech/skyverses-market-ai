
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, Loader2, SearchX, RefreshCw, 
  ArrowRightLeft, Check, 
  Video, ImageIcon, X,
  Eye, Heart
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

// --- Skeleton ---
const CardSkeleton: React.FC<{ index: number }> = ({ index }) => {
  const heights = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[1/1]', 'aspect-[3/5]'];
  return (
    <div className={`break-inside-avoid mb-3 bg-slate-100 dark:bg-white/[0.03] rounded-xl overflow-hidden animate-pulse ${heights[index % heights.length]}`}>
      <div className="w-full h-full relative">
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-2/3" />
          <div className="h-3 bg-black/5 dark:bg-white/5 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
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
          className={`w-full h-full object-cover transition-opacity duration-500 group-hover:scale-[1.03] group-hover:transition-transform group-hover:duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {!loaded && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-white/[0.04] animate-pulse" />
      )}
    </div>
  );
};

// --- Main Explorer Page ---
const ExplorerPage = () => {
  const { t } = useLanguage();

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
      const params: { type?: string, page: number, limit: number } = { page: pageToFetch, limit: 20 };
      if (activeFilter !== 'all') params.type = activeFilter;
      const res = await explorerApi.getItems(params);
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
  }, [activeFilter]);

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
    <div className="pt-20 md:pt-28 pb-32 bg-white dark:bg-[#0a0a0c] min-h-screen text-black dark:text-white transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
        
        {/* ═══════ HERO HEADER ═══════ */}
        <header className="mb-8 md:mb-12">
          {isLoading && page === 1 ? (
            <div className="animate-pulse rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-5">
                  <div className="h-10 bg-slate-100 dark:bg-white/[0.04] rounded-xl w-3/5" />
                  <div className="h-5 bg-slate-100 dark:bg-white/[0.04] rounded-lg w-4/5" />
                  <div className="flex gap-2 pt-2">{[1,2,3,4].map(i => <div key={i} className="h-9 w-20 bg-slate-100 dark:bg-white/[0.04] rounded-lg" />)}</div>
                </div>
                <div className="lg:col-span-2 hidden lg:flex gap-2">
                  {[1,2,3].map(i => <div key={i} className="flex-1 aspect-[3/4] bg-slate-100 dark:bg-white/[0.04] rounded-xl" />)}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-black/[0.04] dark:border-white/[0.04]">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50/50 dark:from-[#0e0e12] dark:via-[#0c0c0f] dark:to-[#0a1020]" />
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/[0.05] dark:bg-brand-blue/[0.08] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-violet-500/[0.03] dark:bg-violet-500/[0.05] rounded-full blur-[80px] translate-y-1/3 pointer-events-none" />
              
              <div className="relative z-10 p-6 md:p-10 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-center">
                  {/* Left — Text + Filters */}
                  <div className="lg:col-span-3 space-y-5">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/[0.06] dark:bg-brand-blue/[0.1] border border-brand-blue/10 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-semibold text-brand-blue">Live Gallery</span>
                        {items.length > 0 && (
                          <span className="text-[11px] text-brand-blue/60 font-medium">· {items.length}+ tác phẩm</span>
                        )}
                      </div>
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
                        Khám phá{' '}<span className="bg-gradient-to-r from-brand-blue to-blue-400 bg-clip-text text-transparent">thế giới AI</span>
                      </h1>
                      <p className="text-sm md:text-[15px] text-slate-400 dark:text-gray-500 leading-relaxed max-w-md">
                        {t('explorer.subtitle')}
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <FilterHub activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                  </div>

                  {/* Right — Image Preview Collage */}
                  <div className="lg:col-span-2 hidden lg:block">
                    <div className="relative h-[220px]">
                      {items.slice(0, 3).map((item, i) => {
                        const transforms = [
                          'rotate-[-3deg] translate-x-0 translate-y-0 z-10 hover:rotate-0 hover:scale-105',
                          'rotate-[2deg] translate-x-6 translate-y-3 z-20 hover:rotate-0 hover:scale-105',
                          'rotate-[-1deg] translate-x-12 translate-y-[-4px] z-30 hover:rotate-0 hover:scale-105',
                        ];
                        return (
                          <div
                            key={item._id || item.id || i}
                            className={`absolute top-0 w-[45%] h-full rounded-xl overflow-hidden shadow-xl border-2 border-white dark:border-[#1a1a1f] transition-all duration-500 cursor-pointer ${transforms[i]}`}
                            style={{ left: `${i * 25}%` }}
                            onClick={() => setSelectedItem(item)}
                          >
                            <img
                              src={item.thumbnailUrl || item.url || item.mediaUrl}
                              className="w-full h-full object-cover"
                              alt={item.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-[9px] font-medium text-white rounded-md">
                                {(item.modelKey || item.model || 'AI').replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
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
            </div>
          )}
        </header>

        {/* ═══════ CONTENT ═══════ */}
        <div className="min-h-[400px]">
          {isLoading && page === 1 ? (
            <div className="explorer-grid">
              {[...Array(15)].map((_, i) => (
                <div key={i} className={`rounded-xl bg-slate-100 dark:bg-white/[0.03] animate-pulse ${ASPECT_CLASSES[i % ASPECT_CLASSES.length]}`} />
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
                      <div
                        key={item._id || item.id}
                        ref={isLast ? lastItemRef : null}
                        className={`relative overflow-hidden group cursor-pointer rounded-2xl transition-all duration-300 bg-white dark:bg-[#111114] border ${aspectClass} ${isSelected ? 'border-brand-blue shadow-lg shadow-brand-blue/10 scale-[0.98]' : 'border-black/[0.04] dark:border-white/[0.04] hover:border-black/[0.08] dark:hover:border-white/[0.08] hover:shadow-lg'}`}
                        onClick={() => setSelectedItem(item)}
                      >
                        {/* Select checkbox */}
                        <div onClick={(e) => toggleSelection(e, item._id || item.id)} className={`absolute top-3 left-3 z-30 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-blue border-brand-blue' : 'bg-black/30 border-white/20 opacity-0 group-hover:opacity-100'}`}>
                          {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                        </div>

                        {/* Type badge — always visible */}
                        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-[10px] font-medium text-white rounded-md">{modelKey}</span>
                        </div>

                        {/* Image container — fixed aspect, no reflow */}
                        <div className="absolute inset-0 overflow-hidden bg-slate-100 dark:bg-white/[0.03]">
                          <LazyImage src={item.thumbnailUrl || item.url || item.mediaUrl} alt={item.title} />
                          
                          {/* Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                          {/* Hover overlay info */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 z-20 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            {item.prompt && (
                              <p className="text-[10px] text-white/60 line-clamp-2 italic mb-1.5">"{item.prompt}"</p>
                            )}
                            <div className="flex items-center gap-3 text-[11px] text-white/50">
                              <span className="flex items-center gap-1"><Eye size={11} /> {stats.views}</span>
                              <span className="flex items-center gap-1"><Heart size={11} /> {stats.likes}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card footer overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent px-3 py-2.5 flex items-center justify-between z-20">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
                            <span className="text-[11px] font-medium text-white/70 truncate">{item.type?.replace(/_/g, ' ')}</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }} className="p-1 text-white/50 hover:text-white transition-colors">
                            <Maximize2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {/* Load more indicator */}
              {isFetchingMore && (
                <div className="flex justify-center py-10">
                  <div className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin text-brand-blue" />
                    <p className="text-[13px] text-slate-400">Đang tải thêm...</p>
                  </div>
                </div>
              )}

              {!hasMore && items.length > 0 && (
                <div className="flex justify-center py-16">
                  <p className="text-[13px] text-slate-300 dark:text-gray-600">Đã hiển thị tất cả</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <SearchX size={40} strokeWidth={1.5} className="text-slate-200 dark:text-gray-700" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-400">{t('explorer.empty')}</p>
                <button onClick={() => fetchItems(1, true)} className="text-[13px] text-brand-blue hover:underline flex items-center gap-1.5 mx-auto">
                  <RefreshCw size={13} /> {t('explorer.retry')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ SELECTION ACTION BAR ═══════ */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] w-full max-w-xl px-4">
            <div className="bg-white/95 dark:bg-[#151518]/95 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.06] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-blue">{selectedIds.length}</span>
                </div>
                <span className="text-[13px] font-medium text-slate-500">đã chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <button disabled={!canGenerate} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${canGenerate ? 'bg-brand-blue text-white hover:brightness-110' : 'bg-slate-100 dark:bg-white/5 text-slate-300 cursor-not-allowed'}`}>
                  <ImageIcon size={14} /> Tạo ảnh
                </button>
                <button disabled={!canGenerate} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${canGenerate ? 'bg-purple-600 text-white hover:brightness-110' : 'bg-slate-100 dark:bg-white/5 text-slate-300 cursor-not-allowed'}`}>
                  <Video size={14} /> Tạo video
                </button>
                <button onClick={() => setSelectedIds([])} className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-1">
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
          gap: 10px;
        }
        @media (min-width: 768px) { .explorer-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .explorer-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1280px) { .explorer-grid { grid-template-columns: repeat(5, 1fr); } }
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
