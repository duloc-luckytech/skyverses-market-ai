import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, Download, Maximize2, Trash2, RefreshCw, Loader2, AlertCircle, Zap, Clock, Check, VolumeX 
} from 'lucide-react';

export interface VideoResult {
  id: string;
  url: string | null;
  prompt: string;
  fullTimestamp: string;
  dateKey: string;
  displayDate: string;
  model: string;
  mode: string;
  duration: string;
  status: 'processing' | 'done' | 'error';
  hasSound: boolean;
  aspectRatio: '16:9' | '9:16';
  cost: number;
  isRefunded?: boolean;
  startImg?: string | null;
  endImg?: string | null;
}

interface VideoCardProps {
  res: VideoResult;
  isSelected: boolean;
  onToggleSelect: () => void;
  onFullscreen: (url: string, hasSound: boolean, id: string) => void;
  onDelete: (id: string) => void;
  onRetry: (res: VideoResult) => void;
  onDownload: (url: string, filename: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  res, isSelected, onToggleSelect, onFullscreen, onDelete, onRetry, onDownload 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play when transition from processing to done
  useEffect(() => {
    if (res.status === 'done' && res.url && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [res.status, res.url]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current as HTMLVideoElement;
    if (!video || res.status !== 'done' || !res.url) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const cardClass = `group relative p-4 rounded-[2rem] border-2 transition-all flex flex-col gap-4 ${
    isSelected 
      ? 'border-purple-600 bg-purple-600/5 shadow-[0_0_60px_rgba(147,51,234,0.15)]' 
      : 'border-black/5 dark:border-white/5 bg-white dark:bg-[#141416] hover:border-black/10 dark:hover:border-white/10 shadow-xl'
  }`;

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className={cardClass}
      onClick={() => onToggleSelect()}
    >
      {/* Visual Area */}
      <div className={`relative aspect-video rounded-2xl overflow-hidden bg-slate-200 dark:bg-black border border-black/5 dark:border-white/5 flex items-center justify-center`}>
        {res.status === 'processing' ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-slate-200 dark:bg-black/60">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <div className="absolute top-0 left-0 w-full h-[1px] bg-[#0090ff] animate-[scan_2s_infinite_linear]"></div>
            </div>
            <Loader2 size={32} className="text-[#0090ff] animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0090ff] animate-pulse">Rendering...</p>
          </div>
        ) : (res.status === 'error' || (!res.url && res.status === 'done')) ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 gap-3 bg-red-50 dark:bg-black/40">
            <AlertCircle size={32} className="text-red-500/50" />
            <p className="text-red-500/80 tracking-widest leading-relaxed font-black uppercase text-[11px]">lỗi video, vui lòng thử lại sau</p>
          </div>
        ) : (
          <video 
            ref={videoRef}
            src={res.url ?? undefined} 
            preload="metadata"
            loop 
            muted 
            className={`w-full h-full ${res.aspectRatio === '9:16' ? 'object-contain bg-black/20' : 'object-cover'}`} 
          />
        )}
        
        {/* Done Overlays */}
        {res.status === 'done' && res.url && (
           <div 
             onClick={togglePlay}
             className={`absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-black/40 transition-opacity ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
           >
             {isPlaying ? (
               <Pause size={48} className="text-white dark:text-white drop-shadow-2xl" fill="currentColor" />
             ) : (
               <Play size={48} className="text-white dark:text-white drop-shadow-2xl ml-2" fill="currentColor" />
             )}
           </div>
        )}

        {/* Reference images indicators (Always show if present) */}
        <div className="absolute bottom-2 left-2 flex gap-1.5 z-10 pointer-events-none group-hover:opacity-0 transition-opacity">
          {res.startImg && (
            <div className="w-8 h-8 rounded-md border border-white/20 overflow-hidden bg-black/40 shadow-lg">
              <img src={res.startImg} className="w-full h-full object-cover" alt="" />
            </div>
          )}
          {res.endImg && (
            <div className="w-8 h-8 rounded-md border border-white/20 overflow-hidden bg-black/40 shadow-lg">
              <img src={res.endImg} className="w-full h-full object-cover" alt="" />
            </div>
          )}
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
          {res.status === 'done' && res.url && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onDownload(res.url!, `video_${res.id}.mp4`); }}
                className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-purple-600 shadow-xl"
                title="Tải xuống"
              >
                <Download size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onFullscreen(res.url!, res.hasSound, res.id); }}
                className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-purple-600 shadow-xl"
                title="Phóng to"
              >
                <Maximize2 size={16} />
              </button>
            </>
          )}
          {res.status === 'error' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRetry(res); }}
              className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-red-500 shadow-xl"
              title="Thử lại"
            >
              <RefreshCw size={16} />
            </button>
          )}
          {res.status !== 'processing' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(res.id); }}
              className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-red-500 shadow-xl"
              title="Xóa"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Select indicator */}
        <div 
          className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-500 shadow-xl scale-110' : 'border-white/20 bg-black/40 hover:bg-black/60'}`}
        >
          {isSelected && <Check size={14} strokeWidth={4} className="text-white" />}
        </div>

        {res.status === 'done' && !res.hasSound && (
          <div className="absolute bottom-3 right-3 p-1.5 bg-black/60 backdrop-blur-md rounded-md text-white/40">
            <VolumeX size={12} />
          </div>
        )}
      </div>

      {/* Info Area - UNIFIED FOR ALL STATES (Processing & Done) */}
      <div className={`px-2 pb-2 space-y-3 ${res.status === 'processing' ? 'opacity-60' : ''}`}>
        <div className="space-y-1">
          <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white/90 truncate leading-none">
            {res.prompt}
          </h4>
          <p className="text-[9px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Clock size={10} className="text-slate-400 dark:text-gray-700" /> {res.fullTimestamp}
          </p>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black uppercase text-[#0090ff] tracking-widest">{res.duration} • {res.aspectRatio} • {res.mode}</span>
            <div className={`flex items-center gap-1 text-[9px] font-black italic ${res.isRefunded ? 'text-emerald-500' : 'text-orange-500'}`}>
               <Zap size={10} fill="currentColor" /> 
               {res.isRefunded ? 'REFUNDED' : `-${res.cost}`}
            </div>
          </div>
          <span className="text-[8px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest italic">{res.model}</span>
        </div>
      </div>
    </motion.div>
  );
};