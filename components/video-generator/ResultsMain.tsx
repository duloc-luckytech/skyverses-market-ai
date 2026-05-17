import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Download, Film,
  Sparkles, Loader2, Eye, Heart, Maximize2, Zap, Play, History as HistoryIcon, Search, ChevronLeft, CheckCircle2, Clock, AlertCircle, X
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

  /* ─── STATUS BAR DATA ─── */
  const processingCount = useMemo(() => results.filter(r => r.status === 'processing').length, [results]);
  const doneCount = useMemo(() => results.filter(r => r.status === 'done').length, [results]);
  const errorCount = useMemo(() => results.filter(r => r.status === 'error').length, [results]);

  return (
    <main className="flex-grow flex flex-col bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* ─── TOOLBAR ─── */}
      <div className="h-12 border-b border-white/[0.08] bg-[#111111]/95 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-40">
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1.5 -ml-1 text-white/55 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
          )}
          <div className="flex bg-white/[0.03] rounded-lg border border-white/[0.08] overflow-hidden">
            <button onClick={() => setActiveTab('SESSION')} className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all ${activeTab === 'SESSION' ? 'bg-white/[0.08] text-white' : 'text-white/55 hover:text-white/75'}`}>
              <span className="flex items-center gap-1.5"><Film size={12} /> Lab</span>
            </button>
            <button onClick={() => setActiveTab('HISTORY')} className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all ${activeTab === 'HISTORY' ? 'bg-white/[0.08] text-white' : 'text-white/55 hover:text-white/75'}`}>
              <span className="flex items-center gap-1.5"><HistoryIcon size={12} /> History</span>
            </button>
          </div>

          {/* Status chips */}
          {activeTab === 'SESSION' && results.length > 0 && (
            <div className="hidden md:flex items-center gap-2 ml-2">
              {processingCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                  <Loader2 size={10} className="animate-spin" /> {processingCount} đang xử lý
                </span>
              )}
              {doneCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={10} /> {doneCount} hoàn thành
                </span>
              )}
              {errorCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-semibold text-red-600 dark:text-red-400">
                  <AlertCircle size={10} /> {errorCount} lỗi
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.08]">
            <span className="text-[10px] font-medium text-white/60">Auto DL</span>
            <button onClick={() => setAutoDownload(!autoDownload)} className={`w-7 h-3.5 rounded-full relative transition-colors ${autoDownload ? 'bg-brand-blue' : 'bg-white/[0.1]'}`}>
              <motion.div animate={{ left: autoDownload ? 14 : 2 }} className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
            </button>
          </div>
          <button onClick={handleDownloadAllDone} title="Tải tất cả" className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue hover:text-black transition-all border border-brand-blue/25"><Download size={14} /></button>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="flex-grow overflow-y-auto no-scrollbar p-4 md:p-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* ═══ EXPLORER — Empty state ═══ */}
          {activeTab === 'SESSION' && results.length === 0 ? (
            <motion.div key="explorer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
              {/* Hero */}
              <div className="space-y-3 px-1">
                <div className="flex items-center gap-2 text-brand-blue"><Sparkles size={18} /></div>
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  Kịch bản <span className="text-brand-blue">gợi ý</span>
                </h2>
                <p className="text-sm text-white/65 font-medium max-w-xl leading-relaxed">
                  Lựa chọn các tác phẩm bên dưới để sử dụng kịch bản có sẵn, hoặc nhập prompt riêng ở cột trái.
                </p>
              </div>

              {/* Quick tips */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { icon: '✍️', title: 'Nhập kịch bản', desc: 'Mô tả chi tiết cảnh quay, bao gồm chủ thể, hành động, ánh sáng và phong cách.' },
                  { icon: '🖼️', title: 'Tải ảnh Start/End', desc: 'Upload ảnh đầu & cuối để AI tạo chuyển động tự nhiên giữa 2 khung hình.' },
                  { icon: '⚙️', title: 'Chọn cấu hình', desc: 'Chọn model, tỷ lệ, độ phân giải, chế độ phù hợp với nhu cầu của bạn.' },
                ].map((tip, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.025]">
                    <span className="text-lg">{tip.icon}</span>
                    <p className="text-sm font-semibold text-white mt-2">{tip.title}</p>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{tip.desc}</p>
                  </div>
                ))}
              </div>

              {/* Explorer gallery */}
              {loadingExplorer && (
                <div className="flex items-center gap-3 px-1">
                  <Loader2 className="animate-spin text-brand-blue" size={14} />
                  <span className="text-[11px] font-semibold text-brand-blue uppercase tracking-wider animate-pulse">Đang tải showcase...</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-20">
                {explorerItems.map((item, idx) => {
                  const isLast = idx === explorerItems.length - 1;
                  const stats = getFakeStats(item._id || item.id || idx.toString());
                  return (
                    <motion.div layout key={item._id || item.id} ref={isLast ? lastItemRef : null}
                      className="relative overflow-hidden bg-white/[0.025] group border border-white/[0.08] rounded-lg transition-all hover:border-brand-blue/25">
                      <div className="aspect-video relative overflow-hidden bg-black cursor-pointer" onClick={() => setSelectedDetailItem(item)}>
                        <img src={item.thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20">
                          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white"><Play size={22} fill="white" className="ml-0.5" /></div>
                        </div>
                        <div className="absolute top-2.5 left-2.5 z-30"><span className="px-2.5 py-1 bg-brand-blue/90 text-black text-[9px] font-semibold uppercase tracking-wider rounded-full">{item.modelKey?.toUpperCase().replace(/_/g, ' ') || 'AI VIDEO'}</span></div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-semibold text-white/90 truncate">{item.title}</h4>
                          <p className="text-xs text-white/55 font-medium line-clamp-2 leading-relaxed">{item.prompt}</p>
                          <div className="flex items-center gap-3 text-[10px] font-medium text-white/45">
                            <span className="flex items-center gap-1"><Eye size={10} className="text-brand-blue" /> {stats.views}</span>
                            <span className="flex items-center gap-1"><Heart size={10} className="text-brand-blue" /> {stats.likes}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-white/[0.08]">
                          <button onClick={e => { e.stopPropagation(); onApplyExample(item); }} className="flex-grow bg-brand-blue text-black px-3 py-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 transition-all">
                            <Zap size={11} fill="currentColor" /> Sử dụng
                          </button>
                          <button onClick={e => { e.stopPropagation(); setSelectedDetailItem(item); }} className="p-2.5 bg-white/[0.04] text-white/55 rounded-lg border border-white/[0.08] hover:bg-white/[0.08] hover:text-white transition-all"><Maximize2 size={14} /></button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {isFetchingMore && (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand-blue" size={28} /></div>
              )}
            </motion.div>

          ) : activeTab === 'HISTORY' ? (
            /* ═══ HISTORY ═══ */
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
                <div className="space-y-1">
                  <h2 className="text-xl lg:text-2xl font-bold text-white">Lịch sử <span className="text-brand-blue">lưu trữ</span></h2>
                  <p className="text-xs text-white/55 font-medium">Tất cả video đã tạo thành công được lưu tại đây.</p>
                </div>
                <div className="relative group w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-brand-blue transition-colors" size={14} />
                  <input type="text" value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Tìm theo prompt..." className="w-full bg-white/[0.035] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-sm font-medium outline-none focus:border-brand-blue/40 text-white/75 placeholder:text-white/35" />
                </div>
              </div>
              {loadingHistory && historyItems.length === 0 ? (
                <div className="py-32 flex flex-col items-center gap-3 opacity-70"><Loader2 className="animate-spin text-brand-blue" size={32} /><p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">Đang đồng bộ...</p></div>
              ) : historyItems.length > 0 ? (
                <div className="space-y-8">
                  {sortedHKeys.map(date => (
                    <div key={date} className="space-y-4">
                      <div className="flex items-center gap-3 px-1">
                        <Calendar size={14} className="text-brand-blue" />
                        <h3 className="text-sm font-semibold text-white/70">{date === todayKey ? 'Hôm nay' : groupedH[date][0].displayDate}</h3>
                        <span className="text-[10px] font-medium text-white/45 bg-white/[0.03] px-2 py-0.5 rounded-full">{groupedH[date].length} video</span>
                        <div className="h-px flex-grow bg-white/[0.08]" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                <div className="py-32 text-center flex flex-col items-center gap-4">
                  <HistoryIcon size={60} strokeWidth={1} className="text-white/25" />
                  <p className="text-sm font-semibold uppercase tracking-widest text-white/60">Chưa có lịch sử</p>
                  <p className="text-xs text-white/45">Tạo video đầu tiên để bắt đầu xây dựng lịch sử.</p>
                </div>
              )}
            </motion.div>

          ) : (
            /* ═══ SESSION with results ═══ */
            <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
              {sortedKeys.map(date => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <Calendar size={14} className="text-brand-blue" />
                    <h3 className="text-sm font-semibold text-white/70">{date === todayKey ? 'Hôm nay' : grouped[date][0].displayDate}</h3>
                    <span className="text-[10px] font-medium text-white/45 bg-white/[0.03] px-2 py-0.5 rounded-full">{grouped[date].length} video</span>
                    <div className="h-px flex-grow bg-white/[0.08]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
