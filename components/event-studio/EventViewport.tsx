
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, MonitorPlay, Download, Edit3, Share2, ShieldCheck, AlertTriangle, RefreshCw, Heart, SplitSquareHorizontal, Copy, Check, Maximize2, ArrowUpCircle, QrCode } from 'lucide-react';
import { RenderResult, SourceImage } from '../../hooks/useEventStudio';
import { EventConfig } from '../../constants/event-configs';

interface EventViewportProps {
  config: EventConfig;
  activeResult: RenderResult | null;
  isGenerating: boolean;
  onClose: () => void;
  accentColor: string;
  onEdit: (url: string) => void;
  onDownload: (url: string) => void;
  onRegenerate: (result: RenderResult) => void;
  onShare: (result: RenderResult) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  compareMode: boolean;
  setCompareMode: (val: boolean) => void;
  sourceImages: SourceImage[];
  onFullscreen?: (result: RenderResult) => void;
  onUpscale?: (result: RenderResult) => void;
  onQrShare?: (result: RenderResult) => void;
}

/* ── Before/After Slider Component ── */
const BeforeAfterSlider: React.FC<{ before: string; after: string }> = ({ before, after }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) handleMove(e.clientX); };
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-col-resize select-none rounded-2xl"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* After (full) */}
      <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="After" />
      
      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img src={before} className="absolute inset-0 w-full h-full object-cover" style={{ minWidth: `${100 / (position / 100)}%` }} alt="Before" />
      </div>

      {/* Divider */}
      <div className="absolute inset-y-0" style={{ left: `${position}%` }}>
        <div className="absolute inset-y-0 -translate-x-1/2 w-0.5 bg-white shadow-lg"></div>
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
          <SplitSquareHorizontal size={16} className="text-slate-700" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[8px] font-bold rounded-md uppercase">Gốc</div>
      <div className="absolute top-4 right-4 px-2 py-1 bg-brand-blue/80 backdrop-blur-sm text-white text-[8px] font-bold rounded-md uppercase">AI</div>
    </div>
  );
};

/* ── Main Viewport ── */
export const EventViewport: React.FC<EventViewportProps> = ({ 
  config, activeResult, isGenerating, onClose, accentColor, onEdit, onDownload,
  onRegenerate, onShare, onToggleFavorite, isFavorite, compareMode, setCompareMode, sourceImages,
  onFullscreen, onUpscale, onQrShare
}) => {
  const [copied, setCopied] = useState(false);
  const firstAnchor = sourceImages.find(img => img.status === 'done');

  const handleCopyUrl = async () => {
    if (!activeResult?.url) return;
    await navigator.clipboard.writeText(activeResult.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      <div className="flex-grow flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 opacity-[0.015] dark:opacity-[0.04] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, currentColor 0.5px, transparent 0.5px)`, backgroundSize: '32px 32px' }}></div>
        
        <AnimatePresence mode="wait">
          {activeResult ? (
            <motion.div 
              key={activeResult.id} 
              initial={{ opacity: 0, scale: 0.97, y: 8 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative group max-w-3xl w-full aspect-[3/4] bg-white dark:bg-[#0a0a0d] rounded-2xl overflow-hidden shadow-2xl border border-black/[0.06] dark:border-white/[0.06]"
            >
              {activeResult.status === 'processing' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm z-20 gap-6">
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-full border-2 border-${accentColor}-500/20 flex items-center justify-center`}>
                      <Loader2 className={`animate-spin text-${accentColor}-500`} size={40} strokeWidth={1.5} />
                    </div>
                    <Sparkles className={`absolute -top-1 -right-1 text-${accentColor}-400 animate-pulse`} size={16} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className={`text-xs font-bold uppercase tracking-[0.3em] text-${accentColor}-600 animate-pulse`}>
                      {activeResult.progress?.step || 'Đang tổng hợp...'}
                    </p>
                    <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 max-w-[200px]">AI đang xử lý qua Image Task pipeline</p>
                    {/* Progress Bar */}
                    <div className="w-48 h-1.5 bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden mx-auto mt-3">
                      <motion.div
                        className={`h-full bg-${accentColor}-500 rounded-full`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${activeResult.progress?.percent || 10}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-[8px] font-semibold text-slate-400">{activeResult.progress?.percent || 10}%</p>
                  </div>
                </div>
              ) : activeResult.url ? (
                <>
                  {/* ── FEATURE 6: Before/After Slider ── */}
                  {compareMode && firstAnchor ? (
                    <BeforeAfterSlider before={firstAnchor.url} after={activeResult.url} />
                  ) : (
                    <img src={activeResult.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" alt="Result" />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                  
                  {/* ── Action Buttons (right side) ── */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
                    {/* Favorite */}
                    <button 
                      onClick={() => onToggleFavorite(activeResult.id)} 
                      className={`p-3 backdrop-blur-md rounded-xl shadow-lg transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-black/60 text-slate-700 dark:text-white hover:bg-red-500 hover:text-white'}`}
                    >
                      <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>

                    {/* Re-generate */}
                    <button 
                      onClick={() => onRegenerate(activeResult)} 
                      className="p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-slate-700 dark:text-white hover:bg-amber-500 hover:text-white transition-all shadow-lg"
                      title="Tạo lại (khác seed)"
                    >
                      <RefreshCw size={16} />
                    </button>

                    {/* Before/After */}
                    {firstAnchor && (
                      <button 
                        onClick={() => setCompareMode(!compareMode)} 
                        className={`p-3 backdrop-blur-md rounded-xl shadow-lg transition-all ${compareMode ? 'bg-brand-blue text-white' : 'bg-white/90 dark:bg-black/60 text-slate-700 dark:text-white hover:bg-brand-blue hover:text-white'}`}
                        title="So sánh trước/sau"
                      >
                        <SplitSquareHorizontal size={16} />
                      </button>
                    )}

                    {/* Edit */}
                    <button onClick={() => onEdit(activeResult.url!)} className="p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-slate-700 dark:text-white hover:bg-brand-blue hover:text-white transition-all shadow-lg">
                      <Edit3 size={16} />
                    </button>

                    {/* Download */}
                    <button onClick={() => onDownload(activeResult.url!)} className="p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-slate-700 dark:text-white hover:bg-emerald-500 hover:text-white transition-all shadow-lg">
                      <Download size={16} />
                    </button>

                    {/* Share / Copy */}
                    <button 
                      onClick={() => { onShare(activeResult); handleCopyUrl(); }}
                      className="p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-slate-700 dark:text-white hover:bg-purple-500 hover:text-white transition-all shadow-lg"
                      title="Chia sẻ / Copy link"
                    >
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                    </button>

                    {/* Fullscreen */}
                    {onFullscreen && (
                      <button 
                        onClick={() => onFullscreen(activeResult)}
                        className="p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-slate-700 dark:text-white hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                        title="Xem toàn màn hình"
                      >
                        <Maximize2 size={16} />
                      </button>
                    )}

                    {/* Upscale */}
                    {onUpscale && (
                      <button 
                        onClick={() => onUpscale(activeResult)}
                        disabled={!!activeResult.isUpscaled}
                        className={`p-3 backdrop-blur-md rounded-xl shadow-lg transition-all ${activeResult.isUpscaled ? 'bg-emerald-500 text-white' : 'bg-white/90 dark:bg-black/60 text-slate-700 dark:text-white hover:bg-amber-500 hover:text-white'}`}
                        title={activeResult.isUpscaled ? 'Đã nâng cấp 4K' : 'Nâng cấp 4K'}
                      >
                        <ArrowUpCircle size={16} />
                      </button>
                    )}

                    {/* QR Share */}
                    {onQrShare && (
                      <button 
                        onClick={() => onQrShare(activeResult)}
                        className="p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-slate-700 dark:text-white hover:bg-violet-500 hover:text-white transition-all shadow-lg"
                        title="QR Share"
                      >
                        <QrCode size={16} />
                      </button>
                    )}
                  </div>

                  {/* ── Bottom info ── */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 z-20">
                    <div className="flex gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-1 bg-${accentColor}-500 text-white text-[8px] font-bold uppercase tracking-wider rounded-md shadow-lg`}>{config.name}</span>
                      <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-wider rounded-md border border-white/10">8K</span>
                      {isFavorite && (
                        <span className="px-2.5 py-1 bg-red-500/80 text-white text-[8px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                          <Heart size={8} fill="currentColor" /> Pinned
                        </span>
                      )}
                    </div>
                    <span className="text-[8px] font-semibold text-white/60">Seed: {activeResult.seed}</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500/80 bg-red-50/50 dark:bg-red-900/5 gap-3">
                  <AlertTriangle size={36} strokeWidth={1.5} />
                  <p className="text-xs font-bold uppercase tracking-wider">Lỗi xử lý</p>
                  <button 
                    onClick={() => onRegenerate(activeResult)}
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:brightness-110 transition-all"
                  >
                    <RefreshCw size={12} /> Thử lại
                  </button>
                </div>
              )}
            </motion.div>
          ) : isGenerating ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 text-center my-auto" style={{ zIndex: 100 }}>
              <div className="relative">
                <div className={`w-28 h-28 rounded-full border border-${accentColor}-500/20 flex items-center justify-center`}>
                  <Loader2 className={`animate-spin text-${accentColor}-500`} size={48} strokeWidth={1} />
                </div>
                <Sparkles className={`absolute -top-2 -right-2 text-${accentColor}-400 animate-pulse`} size={20} />
              </div>
              <div className="space-y-3">
                <p className={`text-lg font-bold uppercase tracking-[0.3em] animate-pulse text-${accentColor}-600`}>Đang tổng hợp...</p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Image Task Pipeline</p>
              </div>
            </motion.div>
          ) : (
            <div className="text-center space-y-8 opacity-15 flex flex-col items-center select-none transition-opacity">
              <MonitorPlay size={80} strokeWidth={0.8} className="text-slate-900 dark:text-white" />
              <div className="space-y-2">
                <h3 className="text-2xl font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Studio Standby</h3>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Chọn chủ đề & nhấn tổng hợp</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 text-[9px] font-semibold uppercase text-slate-400/60 dark:text-slate-600 tracking-wider z-20">
        <div className="flex items-center gap-1.5"><Sparkles size={11} className={`text-${accentColor}-500/50`} /> 8K Resolution</div>
        <div className="flex items-center gap-1.5"><ShieldCheck size={11} className={`text-${accentColor}-500/50`} /> Image Task API</div>
      </div>
    </div>
  );
};
