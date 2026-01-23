
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Download, Wand2, 
  Edit3, ChevronLeft, 
  Sparkles, X, LayoutGrid, ArrowLeft, Image as ImageIcon,
  Loader2, Zap, AlertCircle, Eye, Heart, Maximize2, Tag
} from 'lucide-react';
import { ImageResult } from '../../hooks/useImageGenerator';
import { ImageResultCard } from './ImageResultCard';
import ExplorerDetailModal, { ExplorerItem } from '../ExplorerDetailModal';

interface GeneratorViewportProps {
  onClose?: () => void;
  activePreviewUrl: string | null;
  setActivePreviewUrl: (url: string | null) => void;
  zoomLevel: number;
  setZoomLevel: (val: number) => void;
  onApplyExample: (ex: any) => void;
  onEdit: (url: string) => void;
  onDownload: (url: string, filename: string) => void;
  results: ImageResult[];
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  deleteResult: (id: string) => void;
}

const CATEGORY_TAGS = [
  'All', 'Featured', 'Poster & Ad', 'Product', 'Social Media', 
  'Card', 'Character', 'Comic', 'Logo', 
  'Sticker', 'Wallpaper', 'Home'
];

// Helper tương đồng với trang Explorer để tạo chỉ số giả lập đồng nhất
const getFakeStats = (seedId: string) => {
  const hash = seedId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const views = (hash * 13) % 950 + 50;
  const likes = (hash * 7) % Math.floor(views * 0.8) + 12;
  const formatNum = (num: number) => num > 999 ? (num / 1000).toFixed(1) + 'k' : num.toString();
  return {
    views: formatNum(views),
    likes: formatNum(likes)
  };
};

export const GeneratorViewport: React.FC<GeneratorViewportProps> = ({ 
  onClose, activePreviewUrl, setActivePreviewUrl, zoomLevel, setZoomLevel, onApplyExample, onEdit, onDownload,
  results, selectedIds, toggleSelect, deleteResult
}) => {
  const [explorerItems, setExplorerItems] = useState<ExplorerItem[]>([]);
  const [loadingExplorer, setLoadingExplorer] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoDownload, setAutoDownload] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ExplorerItem | null>(null);
  const [activeTag, setActiveTag] = useState('All');

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchExplorer = async (pageNum: number, isInitial: boolean = false) => {
    if (pageNum === 1) setLoadingExplorer(true);
    else setIsFetchingMore(true);
    
    setError(null);
    try {
      const res = await fetch(`https://api.skyverses.com/explorer?page=${pageNum}&limit=20&type=image`);
      const json = await res.json();
      const items = json.data || (Array.isArray(json) ? json : []);
      
      if (Array.isArray(items)) {
        if (isInitial) {
          setExplorerItems(items);
        } else {
          setExplorerItems(prev => [...prev, ...items]);
        }
        setHasMore(items.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Explorer fetch error:", err);
      setError("Lỗi kết nối máy chủ kịch bản.");
    } finally {
      setLoadingExplorer(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (results.length === 0 && explorerItems.length === 0) {
      fetchExplorer(1, true);
    }
  }, [results.length]);

  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingExplorer || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => {
          const next = prev + 1;
          fetchExplorer(next);
          return next;
        });
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingExplorer, isFetchingMore, hasMore]);

  const handleManualDownload = () => {
    if (selectedIds.length > 0) {
      results.filter(r => selectedIds.includes(r.id)).forEach(res => {
        if (res.url) onDownload(res.url, `gen_${res.id}.png`);
      });
    } else {
      const lastResult = results[0];
      if (lastResult?.url) onDownload(lastResult.url, `gen_${lastResult.id}.png`);
    }
  };

  return (
    <main className="flex-grow min-w-0 flex flex-col relative bg-[#fcfcfd] dark:bg-[#030304] transition-colors duration-500 overflow-hidden">
      {/* Viewport Header */}
      <div className="h-14 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 z-40">
         <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            <div className="flex items-center gap-1">
              <button 
                onClick={onClose}
                className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-3">
                 <h3 className="text-[13px] font-black uppercase tracking-tighter italic text-slate-900 dark:text-white transition-colors">Kết quả</h3>
                 <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
              </div>
            </div>

            <Activity size={16} className="text-brand-blue shrink-0 hidden sm:inline" />
         </div>

         <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {activePreviewUrl ? (
              <button 
                onClick={() => setActivePreviewUrl(null)}
                className="flex items-center gap-2 px-4 py-1.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-sm"
              >
                <ArrowLeft size={14} /> 
                <span className="hidden sm:inline">Trở lại lưới</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                 {/* Auto Download Toggle */}
                 <div className="hidden sm:flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full border border-black/5 dark:border-white/10">
                    <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">Tự động tải</span>
                    <button 
                      onClick={() => setAutoDownload(!autoDownload)}
                      className={`w-8 h-4 rounded-full relative transition-colors ${autoDownload ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <motion.div 
                        animate={{ left: autoDownload ? 18 : 2 }}
                        className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" 
                      />
                    </button>
                 </div>

                 {/* Manual Download Button */}
                 <button 
                   onClick={handleManualDownload}
                   className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-brand-blue text-white rounded-full text-[9px] font-black uppercase hover:brightness-110 shadow-lg"
                 >
                    <Download size={14} /> <span>Tải xuống</span>
                 </button>
              </div>
            )}
            
            <div className="flex items-center gap-3 border-l border-black/5 dark:border-white/5 pl-4">
              <ImageIcon size={14} className="text-slate-400" />
              <input 
                type="range" min="1" max="10" 
                value={zoomLevel} onChange={e => setZoomLevel(parseInt(e.target.value))}
                className="w-16 md:w-28 h-1 bg-slate-200 dark:bg-white/10 appearance-none rounded-full accent-brand-blue cursor-pointer"
              />
            </div>
         </div>
      </div>

      {/* Tags Filter Strip */}
      {!activePreviewUrl && (
        <div className="bg-white/50 dark:bg-[#0c0c0e]/50 backdrop-blur-sm border-b border-black/5 dark:border-white/5 px-4 md:px-8 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0">
          <Tag size={14} className="text-slate-400 shrink-0" />
          <div className="flex gap-2">
            {CATEGORY_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  activeTag === tag 
                  ? 'bg-brand-blue border-brand-blue text-white shadow-lg' 
                  : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/5 text-slate-500 dark:text-gray-400 hover:border-brand-blue'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-grow p-4 md:p-8 lg:p-12 relative overflow-y-auto no-scrollbar">
         <AnimatePresence mode="wait">
            {activePreviewUrl ? (
              <motion.div 
                key="preview-view"
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.02 }}
                className="flex items-center justify-center w-full h-full min-h-[60vh]"
              >
                 <div className="relative group max-w-full max-h-full rounded-sm overflow-hidden flex items-center justify-center" style={{ transform: `scale(${zoomLevel / 5})`, transition: 'transform 0.2s ease-out' }}>
                    <img src={activePreviewUrl} className="max-w-full max-h-full object-contain shadow-3xl" alt="Preview" />
                    <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                       <button 
                         onClick={() => onEdit(activePreviewUrl)}
                         className="p-4 bg-brand-blue text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                       >
                         <Edit3 size={18} />
                       </button>
                       <button 
                         onClick={() => onDownload(activePreviewUrl, `skyverses_${Date.now()}.png`)}
                         className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                       >
                         <Download size={18} />
                    </button>
                    </div>
                 </div>
              </motion.div>
            ) : results.length > 0 ? (
              <motion.div 
                key="grid-view"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full pb-32 lg:pb-10"
              >
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8`}>
                  {results.map((res) => (
                    <ImageResultCard 
                      key={res.id} 
                      res={res} 
                      isSelected={selectedIds.includes(res.id)} 
                      onToggleSelect={() => toggleSelect(res.id)} 
                      onFullscreen={(url) => setActivePreviewUrl(url)}
                      onEdit={onEdit}
                      onDelete={deleteResult}
                      onDownload={onDownload}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="standby-view"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col"
              >
                <div className="space-y-12">
                   <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3 text-brand-blue">
                            <Sparkles size={20} />
                         </div>
                         <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Kịch bản <br /> <span className="text-brand-blue">gợi ý.</span></h2>
                         <p className="text-sm text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest italic leading-relaxed max-w-2xl">Lựa chọn các tác phẩm tiêu biểu để kế thừa cấu trúc kịch bản và bắt đầu tiến trình tổng hợp cá nhân.</p>
                      </div>
                      
                      {loadingExplorer && (
                         <div className="flex items-center gap-3 px-6 py-3 bg-brand-blue/10 rounded-full border border-brand-blue/20">
                            <Loader2 className="animate-spin text-brand-blue" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue animate-pulse">Syncing_Nodes...</span>
                         </div>
                      )}
                   </div>

                   {explorerItems.length > 0 ? (
                      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 md:gap-6 space-y-4 md:space-y-6 pb-40">
                         {explorerItems.map((item, idx) => {
                            const isLast = idx === explorerItems.length - 1;
                            const stats = getFakeStats(item._id || item.id || idx.toString());
                            return (
                               <motion.div 
                                  layout
                                  key={item._id || item.id}
                                  ref={isLast ? lastItemRef : null}
                                  onClick={() => onApplyExample(item)}
                                  className="break-inside-avoid relative overflow-hidden bg-slate-100 dark:bg-[#0d0d0f] group cursor-pointer border border-black/5 dark:border-white/5 transition-all duration-500 rounded-[1.5rem] md:rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-brand-blue/30"
                               >
                                  <img 
                                    src={item.thumbnailUrl} 
                                    className="w-full h-auto object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" 
                                    alt={item.title} 
                                  />
                                  
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent z-10 opacity-80" />

                                  <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8 z-20">
                                     <div className="space-y-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <p className="text-[10px] md:text-[11px] text-white/60 font-medium italic line-clamp-2 pr-6 leading-relaxed">
                                          "{item.prompt}"
                                        </p>
                                        <div className="flex items-center gap-4 text-[8px] font-black text-white/30 uppercase tracking-widest">
                                          <span className="flex items-center gap-1.5"><Eye size={12} className="text-brand-blue" /> {stats.views}</span>
                                          <span className="flex items-center gap-1.5"><Heart size={12} className="text-brand-blue" /> {stats.likes}</span>
                                        </div>
                                        
                                        <div className="flex gap-2 pt-2">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); onApplyExample(item); }}
                                            className="flex-grow bg-brand-blue text-white px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 scale-95 hover:scale-100 transition-transform"
                                          >
                                            <Zap size={12} fill="currentColor" /> Sử dụng kịch bản
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedDetailItem(item); }}
                                            className="p-2.5 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 hover:bg-white hover:text-black transition-all"
                                          >
                                            <Maximize2 size={12} />
                                          </button>
                                        </div>
                                     </div>
                                     <div className="mt-2 flex items-center gap-2 group-hover:opacity-0 transition-opacity">
                                        <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest italic">{item.title}</span>
                                     </div>
                                  </div>
                               </motion.div>
                            );
                         })}
                      </div>
                   ) : !loadingExplorer && (
                      <div className="flex flex-col items-center justify-center py-40 opacity-20 text-center gap-8">
                         {error ? (
                            <>
                              <AlertCircle size={60} className="text-red-500" />
                              <div className="space-y-2">
                                <p className="text-sm font-black uppercase tracking-widest">{error}</p>
                                <button onClick={() => fetchExplorer(1, true)} className="text-[10px] font-black text-brand-blue uppercase underline">Thử lại</button>
                              </div>
                            </>
                         ) : (
                            <>
                              <ImageIcon size={100} strokeWidth={1} />
                              <p className="text-sm font-black uppercase tracking-[0.5em] mt-6">Registry_Offline</p>
                            </>
                         )}
                      </div>
                   )}

                   {isFetchingMore && (
                     <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-brand-blue" size={32} />
                     </div>
                   )}
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      <ExplorerDetailModal 
        item={selectedDetailItem} 
        onClose={() => setSelectedDetailItem(null)} 
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .columns-2 { column-count: 2; }
        @media (min-width: 768px) { .md\\:columns-3 { column-count: 3; } }
        @media (min-width: 1024px) { .lg\\:columns-4 { column-count: 4; } }
        @media (min-width: 1280px) { .xl\\:columns-5 { column-count: 5; } }
      `}</style>
    </main>
  );
};
