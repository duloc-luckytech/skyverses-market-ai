
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Download, Wand2,
  Edit3, ChevronLeft,
  Sparkles, X, LayoutGrid, ArrowLeft, Image as ImageIcon,
  Loader2, Zap, AlertCircle, Eye, Heart, Maximize2, Tag,
  History as HistoryIcon, Database, CheckCircle2, Clock
} from 'lucide-react';
import { ImageResult } from '../../hooks/useImageGenerator';
import { ImageResultCard } from './ImageResultCard';
import ExplorerDetailModal, { ExplorerItem } from '../ExplorerDetailModal';
import { getExplorerUrl } from '../../apis/config';

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
  serverResults: ImageResult[];
  isFetchingServer: boolean;
  hasMoreServer: boolean;
  onLoadMoreServer: () => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  deleteResult: (id: string) => void;
  onRetry: (res: ImageResult) => void;
  onViewLogs?: (res: ImageResult) => void;
}

const CATEGORY_TAGS = [
  'ALL', 'FEATURED', 'POSTER & AD', 'PRODUCT', 'SOCIAL MEDIA',
  'CARD', 'CHARACTER'
];

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
  results, serverResults, isFetchingServer, hasMoreServer, onLoadMoreServer, selectedIds, toggleSelect, deleteResult, onRetry, onViewLogs
}) => {
  const [activeTab, setActiveTab] = useState<'RESULTS' | 'HISTORY'>('RESULTS');

  const PROMPT_SUGGESTIONS = [
    { emoji: '🏙️', label: 'Cityscape', prompt: 'A futuristic neon-lit cyberpunk city at night, rain-soaked streets reflecting holographic billboards, ultra detailed, cinematic lighting' },
    { emoji: '🎨', label: 'Portrait', prompt: 'Professional fashion portrait of a woman with flowing hair, golden hour sunlight, bokeh background, studio quality, 8K' },
    { emoji: '🌌', label: 'Fantasy', prompt: 'A majestic dragon flying over snow-capped mountains at sunset, epic fantasy landscape, volumetric lighting, hyperrealistic' },
    { emoji: '🍃', label: 'Nature', prompt: 'Beautiful serene Japanese garden with koi pond, cherry blossoms falling, morning mist, zen atmosphere, photorealistic' },
    { emoji: '🪐', label: 'Sci-Fi', prompt: 'Space station interior with panoramic view of Earth, astronaut floating weightlessly, lens flare, NASA-quality detail' },
    { emoji: '🏠', label: 'Interior', prompt: 'Luxurious modern minimalist living room, floor-to-ceiling windows, ocean view, marble and wood accents, architectural digest' },
    { emoji: '🎮', label: 'Game Art', prompt: 'Epic RPG warrior character, intricate armor design with glowing runes, dark atmospheric background, concept art style' },
    { emoji: '📦', label: 'Product', prompt: 'Premium skincare bottle on marble surface with water droplets, soft studio lighting, white background, commercial photography' },
  ];
  const [explorerItems, setExplorerItems] = useState<ExplorerItem[]>([]);
  const [loadingExplorer, setLoadingExplorer] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoDownload, setAutoDownload] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ExplorerItem | null>(null);
  const [activeTag, setActiveTag] = useState('ALL');

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchExplorer = async (pageNum: number, isInitial: boolean = false) => {
    if (pageNum === 1) setLoadingExplorer(true);
    else setIsFetchingMore(true);

    setError(null);
    try {
      const res = await fetch(getExplorerUrl('image', pageNum, 20));
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
      setError("Lỗi kịch bản kết nối.");
    } finally {
      setLoadingExplorer(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (results.length === 0 && explorerItems.length === 0 && activeTab === 'RESULTS') {
      fetchExplorer(1, true);
    }
    if (activeTab === 'HISTORY' && serverResults.length === 0) {
      onLoadMoreServer();
    }
  }, [results.length, activeTab]);

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
    if (isFetchingServer) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreServer) {
        onLoadMoreServer();
      }
    });
    if (node) observer.current.observe(node);
  }, [isFetchingServer, hasMoreServer, onLoadMoreServer]);

  const handleManualDownload = () => {
    const list = activeTab === 'RESULTS' ? results : serverResults;
    if (selectedIds.length > 0) {
      list.filter(r => selectedIds.includes(r.id)).forEach(res => {
        if (res.url) onDownload(res.url, `gen_${res.id}.png`);
      });
    } else {
      const lastResult = list[0];
      if (lastResult?.url) onDownload(lastResult.url, `gen_${lastResult.id}.png`);
    }
  };

  /* ─── STATUS BAR DATA ─── */
  const processingCount = useMemo(() => results.filter(r => r.status === 'processing').length, [results]);
  const doneCount = useMemo(() => results.filter(r => r.status === 'done').length, [results]);
  const errorCount = useMemo(() => results.filter(r => r.status === 'error').length, [results]);

  return (
    <main className="flex-grow min-w-0 flex flex-col relative bg-slate-50 dark:bg-[#0a0a0c] overflow-hidden">
      {/* ─── TOOLBAR ─── */}
      <div className="h-12 border-b border-black/[0.06] dark:border-white/[0.04] bg-white/95 dark:bg-[#111114]/95 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-40">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <div className="flex items-center gap-1">
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
              <ChevronLeft size={20} />
              <span className="text-[10px] font-semibold uppercase tracking-widest hidden xs:block">Back</span>
              </button>
            )}

            <div className="flex bg-black/[0.03] dark:bg-white/[0.03] rounded-lg border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
              <button
                onClick={() => setActiveTab('RESULTS')}
                className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${activeTab === 'RESULTS' ? 'bg-black/[0.05] dark:bg-white/[0.06] text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <LayoutGrid size={14} className="md:hidden" />
                <span className="hidden md:flex items-center gap-1.5"><ImageIcon size={12} /> Kết quả</span>
              </button>
              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${activeTab === 'HISTORY' ? 'bg-black/[0.05] dark:bg-white/[0.06] text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <HistoryIcon size={14} className="md:hidden" />
                <span className="hidden md:flex items-center gap-1.5"><Database size={12} /> Lịch sử</span>
              </button>
            </div>
          </div>

          {/* Status chips */}
          {activeTab === 'RESULTS' && results.length > 0 && (
            <div className="hidden md:flex items-center gap-2 ml-1">
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

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {activePreviewUrl ? (
            <button
              onClick={() => setActivePreviewUrl(null)}
              className="flex items-center gap-2 px-4 py-1.5 bg-black/5 dark:bg-white/5 border border-black/[0.06] dark:border-white/10 rounded-full text-[10px] font-semibold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Trở lại lưới</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1.5 bg-black/[0.03] dark:bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-black/[0.06] dark:border-white/[0.04]">
                <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 hidden xs:inline">Auto DL</span>
                <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 xs:hidden">Auto</span>
                <button
                  onClick={() => setAutoDownload(!autoDownload)}
                  className={`w-7 h-3.5 rounded-full relative transition-colors ${autoDownload ? 'bg-rose-500' : 'bg-slate-300 dark:bg-white/[0.1]'}`}
                >
                  <motion.div
                    animate={{ left: autoDownload ? 14 : 2 }}
                    className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              <button
                onClick={handleManualDownload}
                title="Tải xuống"
                className="p-2 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
              >
                <Download size={14} />
              </button>

              <div className="hidden md:flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-white/10">
                <ImageIcon size={14} className="text-slate-400 dark:text-slate-500" />
                <input
                  type="range" min="1" max="10"
                  value={zoomLevel} onChange={e => setZoomLevel(parseInt(e.target.value))}
                  className="w-16 md:w-28 h-1 bg-slate-200 dark:bg-white/10 appearance-none rounded-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── CATEGORY TAGS ─── */}
      {!activePreviewUrl && (
        <div className="bg-white/80 dark:bg-[#111114]/50 backdrop-blur-sm border-b border-black/[0.06] dark:border-white/[0.04] px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <Tag size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <div className="flex gap-2">
            {CATEGORY_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all border ${activeTag === tag
                  ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/25'
                  : 'bg-transparent border-black/[0.06] dark:border-white/[0.04] text-slate-600 dark:text-[#888] hover:text-slate-800 dark:hover:text-white/70 hover:border-black/10 dark:hover:border-white/10'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── CONTENT ─── */}
      <div className="flex-grow p-4 md:p-8 lg:p-12 relative overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {/* ═══ PREVIEW MODE ═══ */}
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
                    className="p-4 bg-rose-500 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
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

          ) : activeTab === 'RESULTS' && results.length > 0 ? (
            /* ═══ RESULTS GRID ═══ */
            <motion.div
              key="grid-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full pb-32 lg:pb-10"
            >
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
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
                    onRetry={() => onRetry(res)}
                    onViewLogs={onViewLogs}
                  />
                ))}
              </div>
            </motion.div>

          ) : activeTab === 'HISTORY' ? (
            /* ═══ HISTORY ═══ */
            <motion.div
              key="history-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full pb-32 lg:pb-10"
            >
              <div className="flex items-center gap-3 mb-8">
                <Database size={18} className="text-purple-500" />
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-white/80">Lịch sử từ Cloud</h4>
              </div>
              {serverResults.length === 0 && !isFetchingServer ? (
                <div className="py-20 text-center flex flex-col items-center gap-6 select-none">
                  <HistoryIcon size={60} strokeWidth={1} className="text-slate-300 dark:text-slate-600" />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Chưa có lịch sử</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Tạo hình ảnh đầu tiên để bắt đầu xây dựng lịch sử.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {serverResults.map((res, idx) => (
                    <div key={res.id} ref={idx === serverResults.length - 1 ? lastHistoryRef : null}>
                      <ImageResultCard
                        res={res}
                        isSelected={selectedIds.includes(res.id)}
                        onToggleSelect={() => toggleSelect(res.id)}
                        onFullscreen={setActivePreviewUrl}
                        onEdit={onEdit}
                        onDelete={deleteResult}
                        onDownload={onDownload}
                        onRetry={() => onRetry(res)}
                        onViewLogs={onViewLogs}
                      />
                    </div>
                  ))}
                </div>
              )}
              {isFetchingServer && (
                <div className="py-10 flex justify-center">
                  <Loader2 className="animate-spin text-rose-400" size={32} />
                </div>
              )}
            </motion.div>

          ) : activeTab === 'RESULTS' && (
            /* ═══ EMPTY STATE — Welcome Hub ═══ */
            <motion.div
              key="standby-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col"
            >
              <div className="space-y-10">
                {/* HERO + TIPS */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-rose-400"><Sparkles size={20} /></div>
                    <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                      Bắt đầu <br /><span className="text-rose-400">sáng tạo</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">Chọn gợi ý prompt bên dưới hoặc nhập kịch bản riêng ở cột trái để bắt đầu tạo ảnh AI.</p>
                  </div>
                  {loadingExplorer && (
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-rose-500/10 rounded-full border border-rose-500/20">
                      <Loader2 className="animate-spin text-rose-400" size={14} />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-400 animate-pulse">Loading...</span>
                    </div>
                  )}
                </div>

                {/* QUICK TIPS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: '✍️', title: 'Nhập prompt', desc: 'Mô tả chi tiết hình ảnh, bao gồm chủ thể, phong cách, ánh sáng và góc chụp.' },
                    { icon: '🖼️', title: 'Tải ảnh tham chiếu', desc: 'Upload ảnh mẫu để AI tham chiếu phong cách, bố cục hoặc chủ thể của bạn.' },
                    { icon: '⚙️', title: 'Chọn cấu hình', desc: 'Chọn model, tỷ lệ, độ phân giải, chế độ phù hợp với nhu cầu tạo ảnh.' },
                  ].map((tip, i) => (
                    <div key={i} className="p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-white dark:bg-white/[0.015]">
                      <span className="text-lg">{tip.icon}</span>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-white/80 mt-2">{tip.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{tip.desc}</p>
                    </div>
                  ))}
                </div>

                {/* PROMPT SUGGESTION TILES */}
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-3 px-1">💡 Gợi ý prompt</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PROMPT_SUGGESTIONS.map(s => (
                      <button
                        key={s.label}
                        onClick={() => onApplyExample({ prompt: s.prompt })}
                        className="p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-white dark:bg-white/[0.015] hover:border-rose-500/20 hover:bg-rose-500/[0.03] transition-all text-left group shadow-sm dark:shadow-none"
                      >
                        <span className="text-lg">{s.emoji}</span>
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-white/70 mt-2">{s.label}</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-white/50 transition-colors">{s.prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* EXPLORER GALLERY */}
                {explorerItems.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-4 px-1">🎨 Showcase Gallery</p>
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
                            className="break-inside-avoid relative overflow-hidden bg-white dark:bg-[#111114] group cursor-pointer border border-black/[0.06] dark:border-white/[0.04] transition-all duration-500 rounded-2xl hover:border-rose-500/20 shadow-sm dark:shadow-none"
                          >
                            <img
                              src={item.thumbnailUrl}
                              className="w-full h-auto object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                              alt={item.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent z-10 opacity-80" />
                            <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8 z-20">
                              <div className="space-y-3 translate-y-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <p className="text-[10px] md:text-[11px] text-white/60 font-medium italic line-clamp-2 pr-6 leading-relaxed uppercase">
                                  "{item.prompt}"
                                </p>
                                <div className="flex items-center gap-4 text-[9px] font-semibold text-white/30 uppercase tracking-widest">
                                  <span className="flex items-center gap-1.5"><Eye size={12} className="text-rose-400" /> {stats.views}</span>
                                  <span className="flex items-center gap-1.5"><Heart size={12} className="text-rose-400" /> {stats.likes}</span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onApplyExample(item); }}
                                    className="flex-grow bg-rose-500 text-white px-4 py-2.5 rounded-full text-[10px] font-semibold uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 scale-95 hover:scale-100 transition-transform"
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
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest italic">{item.title}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!loadingExplorer && explorerItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-8">
                    {error ? (
                      <>
                        <AlertCircle size={60} className="text-red-400" />
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{error}</p>
                          <button onClick={() => fetchExplorer(1, true)} className="text-[10px] font-semibold text-rose-400 uppercase underline">Thử lại</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={80} strokeWidth={1} className="text-slate-300 dark:text-slate-600" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Gallery đang offline</p>
                      </>
                    )}
                  </div>
                )}

                {isFetchingMore && (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-rose-400" size={32} />
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
