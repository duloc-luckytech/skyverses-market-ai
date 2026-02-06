import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Download, LayoutGrid, Film, Bot, Activity, 
  Sparkles, Loader2, AlertCircle, ImageIcon, Eye, Heart, Maximize2, Zap, Play, History as HistoryIcon, Search, Filter, RefreshCw
} from 'lucide-react';
import { VideoCard, VideoResult } from './VideoCard';
import ExplorerDetailModal, { ExplorerItem } from '../ExplorerDetailModal';
import { videosApi } from '../../apis/videos';

interface ResultsMainProps {
  activeTab: 'SESSION' | 'HISTORY';
  setActiveTab: (tab: 'SESSION' | 'HISTORY') => void;
  autoDownload: boolean;
  setAutoDownload: (val: boolean) => void;
  zoomLevel: number;
  setZoomLevel: (val: number) => void;
  results: VideoResult[];
  isGenerating: boolean;
  selectedVideoIds: string[];
  toggleSelect: (id: string) => void;
  setFullscreenVideo: (video: {url: string, hasSound: boolean, id: string} | null) => void;
  deleteResult: (id: string) => void;
  handleRetry: (res: VideoResult) => void;
  triggerDownload: (url: string, filename: string) => void;
  handleDownloadAllDone: () => void;
  todayKey: string;
  onApplyExample: (item: ExplorerItem) => void;
  onViewLogs: (res: VideoResult) => void;
}

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

export const ResultsMain: React.FC<ResultsMainProps> = ({
  activeTab, setActiveTab, autoDownload, setAutoDownload, zoomLevel, setZoomLevel,
  results, isGenerating, selectedVideoIds, toggleSelect, setFullscreenVideo,
  deleteResult, handleRetry, triggerDownload, handleDownloadAllDone, todayKey, onApplyExample, onViewLogs
}) => {
  const [explorerItems, setExplorerItems] = useState<ExplorerItem[]>([]);
  const [loadingExplorer, setLoadingExplorer] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ExplorerItem | null>(null);

  const [historyItems, setHistoryItems] = useState<VideoResult[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchExplorer = async (pageNum: number, isInitial: boolean = false) => {
    if (pageNum === 1) setLoadingExplorer(true);
    else setIsFetchingMore(true);
    
    setError(null);
    try {
      const res = await fetch(`https://api.skyverses.com/explorer?page=${pageNum}&limit=12&type=video`);
      const json = await res.json();
      const items = json.data || (Array.isArray(json) ? json : []);
      
      if (Array.isArray(items)) {
        if (isInitial) setExplorerItems(items);
        else setExplorerItems(prev => [...prev, ...items]);
        setHasMore(items.length >= 10);
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

  const fetchHistory = async (pageNum: number, isInitial: boolean = false) => {
    if (pageNum === 1) setLoadingHistory(true);
    
    try {
      const res = await videosApi.getJobs({
        page: pageNum,
        limit: 15,
        status: 'done',
        q: historySearch || undefined
      });

      if (res.success && res.data) {
        const mapped: VideoResult[] = res.data.map(item => {
          const date = new Date(item.createdAt);
          return {
            id: item.jobId,
            url: item.videoUrl || null,
            prompt: item.prompt || 'Untitled',
            fullTimestamp: date.toLocaleString('vi-VN'),
            dateKey: date.toISOString().split('T')[0],
            displayDate: date.toLocaleDateString('vi-VN'),
            model: item.model || 'Unknown',
            mode: 'standard',
            duration: '8s',
            status: item.status === 'done' ? 'done' : 'error',
            hasSound: false,
            aspectRatio: '16:9',
            cost: 0 
          };
        });

        if (isInitial) setHistoryItems(mapped);
        else setHistoryItems(prev => [...prev, ...mapped]);

        setHasMoreHistory(res.meta.page < res.meta.totalPages);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (results.length === 0 && explorerItems.length === 0 && activeTab === 'SESSION') {
      fetchExplorer(1, true);
    }
    if (activeTab === 'HISTORY') {
      fetchHistory(1, true);
    }
  }, [results.length, activeTab, historySearch]);

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

  const lastHistoryRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingHistory) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreHistory) {
        setHistoryPage(prev => {
          const next = prev + 1;
          fetchHistory(next);
          return next;
        });
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingHistory, hasMoreHistory]);

  const groupedResults = useMemo(() => {
    return results.reduce((acc, res) => {
      const key = res.dateKey || todayKey;
      if (!acc[key]) acc[key] = [];
      acc[key].push(res);
      return acc;
    }, {} as Record<string, VideoResult[]>);
  }, [results, todayKey]);

  const groupedHistory = useMemo(() => {
    return historyItems.reduce((acc, res) => {
      const key = res.dateKey;
      if (!acc[key]) acc[key] = [];
      acc[key].push(res);
      return acc;
    }, {} as Record<string, VideoResult[]>);
  }, [historyItems]);

  const sortedDateKeys = useMemo(() => Object.keys(groupedResults).sort((a, b) => b.localeCompare(a)), [groupedResults]);
  const sortedHistoryKeys = useMemo(() => Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a)), [groupedHistory]);

  return (
    <main className="flex-grow flex flex-col bg-slate-100 dark:bg-[#050505] relative overflow-hidden transition-all duration-500">
      <div className="h-14 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-40">
         <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/10">
               <button 
                 onClick={() => setActiveTab('SESSION')}
                 className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SESSION' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-slate-400'}`}
               >
                 Phiên hiện tại
               </button>
               <button 
                 onClick={() => setActiveTab('HISTORY')}
                 className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'HISTORY' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-slate-400'}`}
               >
                 Lịch sử
               </button>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full border border-black/5 dark:border-white/10">
               <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">Tự động tải</span>
               <button onClick={() => setAutoDownload(!autoDownload)} className={`w-8 h-4 rounded-full relative transition-colors ${autoDownload ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-700'}`}>
                  <motion.div animate={{ left: autoDownload ? 18 : 2 }} className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
               </button>
            </div>
            <button onClick={handleDownloadAllDone} className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-brand-blue text-white rounded-full text-[9px] font-black uppercase hover:brightness-110 shadow-lg">
               <Download size={14} /> <span className="hidden xs:inline">Tải tất cả</span>
            </button>
         </div>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar p-6 md:p-12 relative z-10">
         <AnimatePresence mode="wait">
            {activeTab === 'SESSION' && results.length === 0 ? (
              <motion.div key="explorer-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-brand-blue"><Sparkles size={20} /></div>
                     <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Kịch bản <br /> <span className="text-brand-blue">gợi ý.</span></h2>
                     <p className="text-sm text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest italic leading-relaxed max-w-2xl">Lựa chọn các tác phẩm tiêu biểu để kế thừa cấu trúc kịch bản và bắt đầu tiến trình tổng hợp cá nhân.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32">
                   {explorerItems.map((item, idx) => {
                      const isLast = idx === explorerItems.length - 1;
                      const stats = getFakeStats(item._id || item.id || idx.toString());
                      return (
                         <motion.div 
                            layout key={item._id || item.id} ref={isLast ? lastItemRef : null}
                            className="relative overflow-hidden bg-white dark:bg-[#0d0d0f] group border border-black/5 dark:border-white/5 transition-all duration-500 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:border-brand-blue/30"
                         >
                            <div className="aspect-video relative overflow-hidden bg-black cursor-pointer" onClick={() => setSelectedDetailItem(item)}>
                               <img src={item.thumbnailUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" alt={item.title} />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent z-10 opacity-80" />
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-3xl hover:scale-110 transition-transform"><Play size={32} fill="white" className="ml-1" /></div>
                               </div>
                               <div className="absolute top-4 left-4 z-30"><span className="px-3 py-1 bg-brand-blue text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">{item.modelKey?.toUpperCase().replace(/_/g, ' ') || 'AI VIDEO'}</span></div>
                            </div>
                            <div className="p-8 space-y-6">
                               <div className="space-y-3">
                                  <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white truncate">"{item.title}"</h4>
                                  <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-gray-400 font-medium italic line-clamp-2 leading-relaxed">"{item.prompt}"</p>
                                  <div className="flex items-center gap-4 text-[8px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest"><span className="flex items-center gap-1.5"><Eye size={12} className="text-brand-blue" /> {stats.views}</span><span className="flex items-center gap-1.5"><Heart size={12} className="text-brand-blue" /> {stats.likes}</span></div>
                               </div>
                               <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                                 <button onClick={(e) => { e.stopPropagation(); onApplyExample(item); }} className="flex-grow bg-brand-blue text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 hover:brightness-110 transition-all"><Zap size={12} fill="currentColor" /> Sử dụng kịch bản</button>
                                 <button onClick={(e) => { e.stopPropagation(); setSelectedDetailItem(item); }} className="p-3 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white rounded-xl border border-black/10 dark:border-white/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"><Maximize2 size={16} /></button>
                               </div>
                            </div>
                         </motion.div>
                      );
                   })}
                </div>
              </motion.div>
            ) : activeTab === 'HISTORY' ? (
              <motion.div key="history-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12 pb-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-brand-blue"><HistoryIcon size={20} /></div>
                     <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Lịch sử <br /> <span className="text-brand-blue">lưu trữ.</span></h2>
                  </div>
                  <div className="relative group w-full md:w-80">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={16} />
                     <input type="text" value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Tìm kịch bản..." className="w-full bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-full pl-11 pr-4 py-3 text-xs font-bold outline-none focus:border-brand-blue shadow-inner" />
                  </div>
                </div>

                {loadingHistory && historyItems.length === 0 ? (
                   <div className="py-40 flex flex-col items-center justify-center gap-4 opacity-40">
                      <Loader2 className="animate-spin text-brand-blue" size={48} /><p className="text-[10px] font-black uppercase tracking-[0.4em]">Đang đồng bộ kịch bản cũ...</p>
                   </div>
                ) : historyItems.length > 0 ? (
                  <div className="space-y-16">
                    {sortedHistoryKeys.map(date => (
                      <div key={date} className="space-y-8">
                        <div className="flex items-center gap-6 px-1">
                          <div className="p-2.5 bg-brand-blue/10 rounded-xl text-brand-blue"><Calendar size={18} /></div>
                          <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">{date === todayKey ? 'Hôm nay' : groupedHistory[date][0].displayDate}</h3>
                          <div className="h-px flex-grow bg-black/5 dark:border-white/5"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                          {groupedHistory[date].map((res, idx) => {
                            const isLast = historyItems.length === idx + 1;
                            return (
                              <div key={res.id} ref={isLast ? lastHistoryRef : null}>
                                <VideoCard 
                                  res={res} isSelected={selectedVideoIds.includes(res.id)} 
                                  onToggleSelect={() => toggleSelect(res.id)} 
                                  onFullscreen={(url, hasSound, id) => setFullscreenVideo({ url, hasSound, id })} 
                                  onDelete={deleteResult} onRetry={handleRetry} onDownload={triggerDownload} 
                                  onViewLogs={onViewLogs}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-40 text-center opacity-20 flex flex-col items-center gap-6"><HistoryIcon size={100} strokeWidth={1} /><p className="text-sm font-black uppercase tracking-[0.5em]">No History Detected</p></div>
                )}
              </motion.div>
            ) : (
              <motion.div key="grid-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 pb-32">
                {sortedDateKeys.map(date => (
                  <div key={date} className="space-y-8">
                    <div className="flex items-center gap-6 px-1">
                      <div className="p-2.5 bg-brand-blue/10 rounded-xl text-brand-blue"><Calendar size={18} /></div>
                      <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">{date === todayKey ? 'Hôm nay' : groupedResults[date][0].displayDate}</h3>
                      <div className="h-px flex-grow bg-black/5 dark:border-white/5"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {groupedResults[date].map(res => (
                        <VideoCard 
                          key={res.id} res={res} 
                          isSelected={selectedVideoIds.includes(res.id)} 
                          onToggleSelect={() => toggleSelect(res.id)} 
                          onFullscreen={(url, hasSound, id) => setFullscreenVideo({ url, hasSound, id })} 
                          onDelete={deleteResult} onRetry={handleRetry} onDownload={triggerDownload} 
                          onViewLogs={onViewLogs}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      <ExplorerDetailModal item={selectedDetailItem} onClose={() => setSelectedDetailItem(null)} />
    </main>
  );
};