import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, Activity, Loader2, SearchX, RefreshCw, 
  Sparkles, Leaf, ArrowRightLeft, Boxes, Check, 
  Video, ImageIcon, Zap, X, Info, Settings2,
  // Added missing icons to fix errors on lines 405 and 411
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { explorerApi } from '../apis/explorer';
import ExplorerDetailModal, { ExplorerItem } from '../components/ExplorerDetailModal';
import { FilterHub } from '../components/explorer/FilterHub';

// --- SKELETON COMPONENTS ---

const ExplorerHeaderSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-12 items-center animate-pulse">
    <div className="xl:col-span-7 space-y-8">
      <div className="h-16 md:h-24 lg:h-32 bg-slate-200 dark:bg-white/5 rounded-2xl w-3/4"></div>
      <div className="border-l-4 border-slate-200 dark:border-white/5 pl-4 md:pl-8 py-2">
        <div className="h-6 bg-slate-100 dark:bg-white/5 rounded-lg w-1/2"></div>
      </div>
    </div>
    <div className="xl:col-span-5 h-48 bg-slate-200 dark:bg-white/5 rounded-3xl opacity-50"></div>
  </div>
);

const ExplorerCardSkeleton: React.FC<{ index: number }> = ({ index }) => {
  const heights = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[1/1]', 'aspect-[3/5]'];
  const hClass = heights[index % heights.length];
  
  return (
    <div className={`break-inside-avoid mb-4 bg-slate-100 dark:bg-white/5 rounded-none overflow-hidden animate-pulse ${hClass}`}>
      <div className="w-full h-full bg-slate-200 dark:bg-white/5 relative">
        <div className="absolute top-4 right-4 w-16 h-4 bg-black/10 dark:bg-white/10 rounded-full"></div>
        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <div className="h-6 bg-black/10 dark:bg-white/10 rounded-md w-3/4"></div>
          <div className="flex gap-2">
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-12"></div>
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- REAL COMPONENTS ---

const ThreeDAssetCard: React.FC<{ 
  item: ExplorerItem, 
  isNew: boolean, 
  isTopChoice: boolean,
  isSelected: boolean,
  onToggleSelect: (e: React.MouseEvent) => void,
  onClick: () => void 
}> = ({ item, isNew, isTopChoice, isSelected, onToggleSelect, onClick }) => {
  const { t } = useLanguage();
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className={`break-inside-avoid relative overflow-hidden bg-slate-900 group cursor-pointer border-2 transition-all duration-300 rounded-xl mb-3 md:mb-4 ${isSelected ? 'border-brand-blue shadow-[0_0_20px_rgba(0,144,255,0.3)] scale-[0.98]' : 'border-transparent shadow-none'}`}
    >
        {/* Selection Indicator */}
        <div 
          onClick={onToggleSelect}
          className={`absolute top-4 left-4 z-50 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-blue border-brand-blue shadow-lg' : 'bg-black/40 border-white/20 hover:bg-black/60 opacity-0 group-hover:opacity-100'}`}
        >
          {isSelected && <Check size={14} strokeWidth={4} className="text-white" />}
        </div>

        {/* VIEWPORT AREA */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-zinc-900">
            <div className="absolute inset-0">
               <img 
                 src={item.thumbnailUrl || item.url || item.mediaUrl} 
                 className="w-full h-full object-cover filter grayscale brightness-[1.5] contrast-[0.9]" 
                 alt={item.title} 
               />
            </div>

            <div 
              className="absolute inset-0 z-10 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
               <img 
                 src={item.thumbnailUrl || item.url || item.mediaUrl} 
                 className="w-full h-full object-cover" 
                 alt={item.title} 
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
               />
            </div>

            <div 
              className="absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-ew-resize pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
               <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-2xl border border-black/5">
                  <ArrowRightLeft size={12} strokeWidth={3} />
               </div>
            </div>

            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 z-30 opacity-0 cursor-ew-resize w-full h-full"
              onClick={(e) => e.stopPropagation()} 
            />

            <div className="absolute top-2 left-12 z-40">
               <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-blue text-white rounded-sm text-[8px] font-black uppercase tracking-widest shadow-xl">
                  <Boxes size={10} /> {t('explorer.modal.3d_preview')}
               </div>
            </div>
        </div>
        
        {/* Badges Top Right */}
        <div className="absolute top-2 right-2 md:top-6 md:right-6 flex flex-col gap-2 z-30 pointer-events-none">
          {isNew && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-none text-white">
              <Sparkles size={10} fill="currentColor" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">New</span>
            </div>
          )}
          {isTopChoice && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-none text-white">
              <Leaf size={10} fill="currentColor" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Top Choice</span>
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10 opacity-100 pointer-events-none" />

        <div className="absolute bottom-3 left-3 md:bottom-8 md:left-8 z-20 pr-4 space-y-2 pointer-events-none">
            <h3 className="text-xs md:text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-white leading-none drop-shadow-lg">
              {item.title}
            </h3>
            <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
               <span className="text-[8px] font-black text-brand-blue uppercase tracking-widest">{item.model || 'Native_Render'}</span>
               <div className="w-1.5 h-1.5 rounded-none bg-white/20"></div>
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{t(`explorer.type.${item.type}`)}</span>
            </div>
        </div>

        <div className="absolute bottom-3 right-3 z-40 opacity-0 group-hover:opacity-100 transition-all">
           <button 
             onClick={onClick}
             className="p-3 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
           >
              <Maximize2 size={16} />
           </button>
        </div>

        <div className="absolute inset-0 bg-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity z-40 pointer-events-none" />
    </motion.div>
  );
};

const ExplorerPage = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [items, setItems] = useState<ExplorerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | ExplorerItem['type']>('all');
  const [selectedItem, setSelectedItem] = useState<ExplorerItem | null>(null);
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const params: { type?: string } = {};
      if (activeFilter !== 'all') {
        params.type = activeFilter;
      }

      const res = await explorerApi.getItems(params);
      if (res.success && Array.isArray(res.data)) {
        // Giả lập trạng thái để demo logic
        const dataWithStatus = res.data.map((item, idx) => ({
          ...item,
          status: idx % 4 === 0 ? 'processing' : idx % 5 === 0 ? 'done' : 'idle'
        }));
        setItems(dataWithStatus);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch explorer items:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    setSelectedIds([]); // Clear selection when filter changes
  }, [activeFilter]);

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const selectedItems = useMemo(() => 
    items.filter(i => selectedIds.includes(i._id || i.id)), 
  [items, selectedIds]);

  const canGenerate = useMemo(() => {
    if (selectedItems.length === 0) return false;
    return selectedItems.every(i => i.status !== 'processing' && i.status !== 'done');
  }, [selectedItems]);

  return (
    <div className="pt-24 md:pt-32 pb-40 bg-white dark:bg-black min-h-screen text-black dark:text-white transition-colors duration-500 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#0090ff08_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #8882 1px, transparent 1px), linear-gradient(to bottom, #8882 1px, transparent 1px)', backgroundSize: '80px 80px', opacity: 0.1 }}></div>
      </div>

      <div className="max-w-[1900px] mx-auto px-4 md:px-12 relative z-10">
        
        {/* Header Section */}
        <header className="mb-8 md:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           {isLoading ? (
             <ExplorerHeaderSkeleton />
           ) : (
             <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-12 items-center">
                <div className="xl:col-span-7 space-y-4 md:space-y-10 text-left">
                  <div className="space-y-2 md:space-y-4">
                    <h1 className="text-4xl md:text-6xl lg:text-[110px] font-black uppercase tracking-tighter leading-none italic">
                      {t('explorer.title')}
                    </h1>
                  </div>
                  <div className="space-y-2 md:space-y-4 border-l-4 border-brand-blue pl-4 md:pl-8">
                    <p className="text-lg md:text-xl lg:text-3xl text-slate-900 dark:text-white font-black uppercase italic tracking-tight leading-tight">
                      {t('explorer.subtitle')}
                    </p>
                  </div>
                </div>

                <div className="xl:col-span-5 relative w-full">
                  <FilterHub activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                </div>
             </div>
           )}
        </header>

        {/* EXPLORER MASONRY GRID */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 md:gap-4 space-y-3 md:space-y-4">
               {[...Array(10)].map((_, i) => (
                 <ExplorerCardSkeleton key={i} index={i} />
               ))}
            </div>
          ) : items.length > 0 ? (
            <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 md:gap-4 space-y-3 md:space-y-4">
              <AnimatePresence mode="popLayout">
                  {items.map((item, idx) => {
                    const isNew = idx % 5 === 1;
                    const isTopChoice = idx % 7 === 2;
                    const isSelected = selectedIds.includes(item._id || item.id);

                    if (item.type === 'game_asset_3d') {
                      return (
                        <ThreeDAssetCard 
                          key={item._id || item.id}
                          item={item}
                          isNew={isNew}
                          isTopChoice={isTopChoice}
                          isSelected={isSelected}
                          onToggleSelect={(e) => toggleSelection(e, item._id || item.id)}
                          onClick={() => setSelectedItem(item)}
                        />
                      );
                    }

                    return (
                      <motion.div 
                        key={item._id || item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, delay: idx * 0.02 }}
                        className={`break-inside-avoid relative overflow-hidden bg-slate-100 dark:bg-[#0d0d0f] group cursor-pointer border-2 transition-all duration-300 rounded-xl mb-3 md:mb-4 ${isSelected ? 'border-brand-blue shadow-[0_0_20px_rgba(0,144,255,0.3)] scale-[0.98]' : 'border-transparent shadow-none'}`}
                        onClick={() => setSelectedItem(item)}
                      >
                          {/* Selection Indicator */}
                          <div 
                            onClick={(e) => toggleSelection(e, item._id || item.id)}
                            className={`absolute top-4 left-4 z-30 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-blue border-brand-blue shadow-lg' : 'bg-black/40 border-white/20 hover:bg-black/60 opacity-0 group-hover:opacity-100'}`}
                          >
                            {isSelected && <Check size={14} strokeWidth={4} className="text-white" />}
                          </div>

                          <img 
                            src={item.thumbnailUrl || item.url || item.mediaUrl} 
                            className="w-full h-auto object-cover group-hover:scale-[1.05] transition-all duration-1000" 
                            alt={item.title} 
                          />
                          
                          <div className="absolute top-2 left-12 right-2 md:top-6 md:left-14 md:right-6 flex justify-between items-start z-30 pointer-events-none">
                            {isTopChoice ? (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-none text-white">
                                <Leaf size={10} fill="currentColor" />
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white">Top Choice</span>
                              </div>
                            ) : <div />}

                            {isNew && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-none text-white">
                                <Sparkles size={10} fill="currentColor" />
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white">New</span>
                              </div>
                            )}
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10 opacity-100" />

                          <div className="absolute bottom-3 left-3 md:bottom-8 md:left-8 z-20 pr-4 space-y-2 pointer-events-none">
                              <h3 className="text-xs md:text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-white leading-none drop-shadow-lg">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-3">
                                 <span className="text-[8px] font-black text-brand-blue uppercase tracking-widest">{item.model || 'Native_Render'}</span>
                                 {item.status !== 'idle' && (
                                   <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${item.status === 'processing' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                      {item.status === 'processing' ? <Loader2 size={8} className="animate-spin" /> : <Check size={8} />}
                                      {item.status}
                                   </div>
                                 )}
                              </div>
                          </div>

                          <div className="absolute inset-0 bg-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity z-40 pointer-events-none" />
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 md:py-40 gap-8 opacity-20 text-center">
              <SearchX size={60} strokeWidth={1} />
              <div className="space-y-2">
                <p className="text-xl font-black uppercase tracking-[0.4em]">{t('explorer.empty')}</p>
                <button 
                  onClick={fetchItems}
                  className="text-xs font-black uppercase tracking-widest text-brand-blue hover:underline flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={14} /> {t('explorer.retry')}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* FLOATING CONFIGURATION BAR */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] w-full max-w-4xl px-4"
          >
             <div className="bg-[#121214]/90 backdrop-blur-2xl border border-white/10 p-4 md:p-6 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6 transition-all duration-500">
                <div className="flex items-center gap-6 pl-4">
                   <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black italic tracking-tighter text-white">{selectedIds.length}</span>
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Items Selected</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Settings2 size={10} className="text-brand-blue" />
                        <span className="text-[8px] font-black uppercase text-brand-blue/60 tracking-widest">Configuration Active</span>
                      </div>
                   </div>

                   <div className="h-10 w-px bg-white/10 hidden sm:block"></div>

                   <div className="hidden sm:flex items-center gap-4">
                      {!canGenerate && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-500">
                           <AlertCircle size={14} />
                           <span className="text-[9px] font-black uppercase">Vui lòng chọn bối cảnh đang chờ</span>
                        </div>
                      )}
                      {canGenerate && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500">
                           <CheckCircle2 size={14} />
                           <span className="text-[9px] font-black uppercase">Ready for Synthesis</span>
                        </div>
                      )}
                   </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 pr-2">
                   <button 
                     disabled={!canGenerate}
                     className={`flex items-center gap-2 px-6 md:px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${canGenerate ? 'bg-brand-blue text-white hover:scale-105 active:scale-95' : 'bg-white/5 text-gray-600 cursor-not-allowed grayscale'}`}
                   >
                      <ImageIcon size={14} /> Tạo Hình
                   </button>
                   <button 
                     disabled={!canGenerate}
                     className={`flex items-center gap-2 px-6 md:px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${canGenerate ? 'bg-purple-600 text-white hover:scale-105 active:scale-95' : 'bg-white/5 text-gray-600 cursor-not-allowed grayscale'}`}
                   >
                      <Video size={14} /> Tạo Video
                   </button>
                   <div className="h-8 w-px bg-white/10 mx-1 hidden xs:block"></div>
                   <button 
                     onClick={() => setSelectedIds([])}
                     className="p-3 text-gray-500 hover:text-red-500 transition-colors"
                   >
                      <X size={20} />
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX MODAL */}
      <ExplorerDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .columns-2 { column-count: 2; }
        @media (min-width: 768px) { .md\\:columns-3 { column-count: 3; } }
        @media (min-width: 1024px) { .lg\\:columns-4 { column-count: 4; } }
        @media (min-width: 1280px) { .xl\\:columns-5 { column-count: 5; } }
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