import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Download, Film,
  Sparkles, Loader2, Eye, Heart, Maximize2, Zap, Play, History as HistoryIcon, Search, ChevronLeft
} from 'lucide-react';
import { VideoCard, VideoResult } from './VideoCard';
import ExplorerDetailModal, { ExplorerItem } from '../ExplorerDetailModal';
import { videosApi } from '../../apis/videos';
import { getExplorerUrl } from '../../apis/config';

interface ResultsMainProps {
  onClose?: () => void;
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
  setFullscreenVideo: (video: { url: string, hasSound: boolean, id: string } | null) => void;
  deleteResult: (id: string) => void;
  handleRetry: (res: VideoResult) => void;
  triggerDownload: (url: string, filename: string) => void;
  handleDownloadAllDone: () => void;
  todayKey: string;
  onApplyExample: (item: ExplorerItem) => void;
  onViewLogs: (res: VideoResult) => void;
}

const getFakeStats = (id: string) => {
  const h = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const v = (h * 13) % 950 + 50;
  const l = (h * 7) % Math.floor(v * 0.8) + 12;
  const fmt = (n: number) => n > 999 ? (n / 1000).toFixed(1) + 'k' : n.toString();
  return { views: fmt(v), likes: fmt(l) };
};

export const ResultsMain: React.FC<ResultsMainProps> = ({
  onClose, activeTab, setActiveTab, autoDownload, setAutoDownload, zoomLevel, setZoomLevel,
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

  const fetchExplorer = async (pageNum: number, isInitial = false) => {
    if (pageNum === 1) setLoadingExplorer(true); else setIsFetchingMore(true);
    setError(null);
    try {
      const res = await fetch(getExplorerUrl('video', pageNum, 12));
      const json = await res.json();
      const items = json.data || (Array.isArray(json) ? json : []);
      if (Array.isArray(items)) {
        if (isInitial) setExplorerItems(items); else setExplorerItems(prev => [...prev, ...items]);
        setHasMore(items.length >= 10);
      } else setHasMore(false);
    } catch { setError("Lỗi kết nối."); } finally { setLoadingExplorer(false); setIsFetchingMore(false); }
  };

  const fetchHistory = async (pageNum: number, isInitial = false) => {
    if (pageNum === 1) setLoadingHistory(true);
    try {
      const res = await videosApi.getJobs({ page: pageNum, limit: 15, status: 'done', q: historySearch || undefined });
      if (res.success && res.data) {
        const mapped: VideoResult[] = res.data.map(item => {
          const d = new Date(item.createdAt);
          return { id: item.jobId, url: item.videoUrl || null, prompt: item.prompt || 'Untitled', fullTimestamp: d.toLocaleString('vi-VN'), dateKey: d.toISOString().split('T')[0], displayDate: d.toLocaleDateString('vi-VN'), model: item.model || 'Unknown', mode: 'standard', duration: '8s', status: item.status === 'done' ? 'done' : 'error', hasSound: false, aspectRatio: '16:9', cost: 0 } as VideoResult;
        });
        if (isInitial) setHistoryItems(mapped); else setHistoryItems(prev => [...prev, ...mapped]);
        setHasMoreHistory(res.meta.page < res.meta.totalPages);
      }
    } catch (err) { console.error(err); } finally { setLoadingHistory(false); }
  };

  useEffect(() => {
    if (results.length === 0 && explorerItems.length === 0 && activeTab === 'SESSION') fetchExplorer(1, true);
    if (activeTab === 'HISTORY') fetchHistory(1, true);
  }, [results.length, activeTab, historySearch]);

  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingExplorer || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prev => { const n = prev + 1; fetchExplorer(n); return n; });
    });
    if (node) observer.current.observe(node);
  }, [loadingExplorer, isFetchingMore, hasMore]);

  const lastHistoryRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingHistory) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreHistory) setHistoryPage(prev => { const n = prev + 1; fetchHistory(n); return n; });
    });
    if (node) observer.current.observe(node);
  }, [loadingHistory, hasMoreHistory]);

  const grouped = useMemo(() => results.reduce((a, r) => { const k = r.dateKey || todayKey; if (!a[k]) a[k] = []; a[k].push(r); return a; }, {} as Record<string, VideoResult[]>), [results, todayKey]);
  const groupedH = useMemo(() => historyItems.reduce((a, r) => { const k = r.dateKey; if (!a[k]) a[k] = []; a[k].push(r); return a; }, {} as Record<string, VideoResult[]>), [historyItems]);
  const sortedKeys = useMemo(() => Object.keys(grouped).sort((a, b) => b.localeCompare(a)), [grouped]);
  const sortedHKeys = useMemo(() => Object.keys(groupedH).sort((a, b) => b.localeCompare(a)), [groupedH]);

  return (
    <main className="flex-grow flex flex-col bg-white dark:bg-[#0a0a0c] relative overflow-hidden">
      {/* ─── TOOLBAR ─── */}
      <div className="h-11 border-b border-black/[0.06] dark:border-white/[0.04] bg-white/90 dark:bg-[#111114]/90 backdrop-blur-md flex items-center justify-between px-3 shrink-0 z-40">
        <div className="flex items-center gap-2">
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1.5 -ml-1 text-slate-400 dark:text-[#555] hover:text-slate-900 dark:hover:text-white transition-colors"><ChevronLeft size={16} /></button>
          )}
          <div className="flex bg-black/[0.02] dark:bg-white/[0.03] rounded-md border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
            <button onClick={() => setActiveTab('SESSION')} className={`px-3 py-1 text-[8px] font-semibold uppercase tracking-wider transition-all ${activeTab === 'SESSION' ? 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-900 dark:text-white' : 'text-slate-400 dark:text-[#555]'}`}>Lab</button>
            <button onClick={() => setActiveTab('HISTORY')} className={`px-3 py-1 text-[8px] font-semibold uppercase tracking-wider transition-all ${activeTab === 'HISTORY' ? 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-900 dark:text-white' : 'text-slate-400 dark:text-[#555]'}`}>History</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/[0.02] dark:bg-white/[0.03] px-2 py-1 rounded-md border border-black/[0.06] dark:border-white/[0.04]">
            <span className="text-[7px] font-medium uppercase text-slate-400 dark:text-[#555]">Auto DL</span>
            <button onClick={() => setAutoDownload(!autoDownload)} className={`w-6 h-3 rounded-full relative transition-colors ${autoDownload ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/[0.1]'}`}>
              <motion.div animate={{ left: autoDownload ? 14 : 2 }} className="absolute top-0.5 w-2 h-2 bg-white rounded-full shadow-sm" />
            </button>
          </div>
          <button onClick={handleDownloadAllDone} className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-md hover:bg-indigo-500 hover:text-white transition-all"><Download size={12} /></button>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="flex-grow overflow-y-auto no-scrollbar p-4 md:p-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* EXPLORER (no results yet) */}
          {activeTab === 'SESSION' && results.length === 0 ? (
            <motion.div key="explorer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="space-y-2 px-1">
                <div className="flex items-center gap-2 text-indigo-400"><Sparkles size={16} /></div>
                <h2 className="text-2xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white/90 leading-tight">Kịch bản <span className="text-indigo-500 dark:text-indigo-400">gợi ý</span></h2>
                <p className="text-[10px] text-slate-500 dark:text-[#555] font-medium max-w-xl leading-relaxed">Lựa chọn các tác phẩm để sử dụng kịch bản có sẵn.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20">
                {explorerItems.map((item, idx) => {
                  const isLast = idx === explorerItems.length - 1;
                  const stats = getFakeStats(item._id || item.id || idx.toString());
                  return (
                    <motion.div layout key={item._id || item.id} ref={isLast ? lastItemRef : null}
                      className="relative overflow-hidden bg-white dark:bg-[#111114] group border border-black/[0.06] dark:border-white/[0.04] rounded-2xl transition-all hover:border-indigo-500/20 shadow-sm dark:shadow-none">
                      <div className="aspect-video relative overflow-hidden bg-black cursor-pointer" onClick={() => setSelectedDetailItem(item)}>
                        <img src={item.thumbnailUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20">
                          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white"><Play size={20} fill="white" className="ml-0.5" /></div>
                        </div>
                        <div className="absolute top-2 left-2 z-30"><span className="px-2 py-0.5 bg-indigo-500/80 text-white text-[7px] font-semibold uppercase tracking-wider rounded-full">{item.modelKey?.toUpperCase().replace(/_/g, ' ') || 'AI VIDEO'}</span></div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-white/90 truncate">{item.title}</h4>
                          <p className="text-[9px] text-slate-500 dark:text-[#555] font-medium line-clamp-2 leading-relaxed">{item.prompt}</p>
                          <div className="flex items-center gap-3 text-[7px] font-medium text-slate-400 dark:text-[#444]">
                            <span className="flex items-center gap-1"><Eye size={9} className="text-indigo-400" /> {stats.views}</span>
                            <span className="flex items-center gap-1"><Heart size={9} className="text-indigo-400" /> {stats.likes}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 pt-2 border-t border-black/[0.06] dark:border-white/[0.04]">
                          <button onClick={e => { e.stopPropagation(); onApplyExample(item); }} className="flex-grow bg-indigo-600 text-white px-3 py-2 rounded-lg text-[8px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 transition-all">
                            <Zap size={10} fill="currentColor" /> Sử dụng
                          </button>
                          <button onClick={e => { e.stopPropagation(); setSelectedDetailItem(item); }} className="p-2 bg-black/[0.03] dark:bg-white/[0.04] text-slate-500 dark:text-white/50 rounded-lg border border-black/[0.06] dark:border-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all"><Maximize2 size={12} /></button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

          ) : activeTab === 'HISTORY' ? (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
                <div className="space-y-1">
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white/90">Lịch sử <span className="text-indigo-500 dark:text-indigo-400">lưu trữ</span></h2>
                </div>
                <div className="relative group w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-indigo-400 transition-colors" size={12} />
                  <input type="text" value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Tìm..." className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.04] rounded-lg pl-8 pr-3 py-1.5 text-[10px] font-medium outline-none focus:border-indigo-500/30 text-slate-700 dark:text-white/70" />
                </div>
              </div>
              {loadingHistory && historyItems.length === 0 ? (
                <div className="py-32 flex flex-col items-center gap-3 opacity-30"><Loader2 className="animate-spin text-indigo-400" size={32} /><p className="text-[9px] font-medium uppercase tracking-wider">Đang đồng bộ...</p></div>
              ) : historyItems.length > 0 ? (
                <div className="space-y-8">
                  {sortedHKeys.map(date => (
                    <div key={date} className="space-y-4">
                      <div className="flex items-center gap-3 px-1">
                        <Calendar size={12} className="text-indigo-400" />
                        <h3 className="text-sm font-semibold text-slate-600 dark:text-white/70">{date === todayKey ? 'Hôm nay' : groupedH[date][0].displayDate}</h3>
                        <div className="h-px flex-grow bg-black/[0.06] dark:bg-white/[0.04]" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {groupedH[date].map((res, idx) => (
                          <div key={res.id} ref={historyItems.length === idx + 1 ? lastHistoryRef : null}>
                            <VideoCard res={res} isSelected={selectedVideoIds.includes(res.id)} onToggleSelect={() => toggleSelect(res.id)} onFullscreen={(url, hs, id) => setFullscreenVideo({ url, hasSound: hs, id })} onDelete={deleteResult} onRetry={handleRetry} onDownload={triggerDownload} onViewLogs={onViewLogs} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center opacity-15 flex flex-col items-center gap-4"><HistoryIcon size={60} strokeWidth={1} /><p className="text-[10px] font-medium uppercase tracking-widest">No History</p></div>
              )}
            </motion.div>

          ) : (
            /* SESSION with results */
            <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
              {sortedKeys.map(date => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <Calendar size={12} className="text-indigo-400" />
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-white/70">{date === todayKey ? 'Hôm nay' : grouped[date][0].displayDate}</h3>
                    <div className="h-px flex-grow bg-black/[0.06] dark:bg-white/[0.04]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {grouped[date].map(res => (
                      <VideoCard key={res.id} res={res} isSelected={selectedVideoIds.includes(res.id)} onToggleSelect={() => toggleSelect(res.id)} onFullscreen={(url, hs, id) => setFullscreenVideo({ url, hasSound: hs, id })} onDelete={deleteResult} onRetry={handleRetry} onDownload={triggerDownload} onViewLogs={onViewLogs} />
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
