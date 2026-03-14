import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, Download, Maximize2, Trash2, RefreshCw,
  Loader2, AlertCircle, Zap, Clock, Check, VolumeX,
  Copy, AlertTriangle, Fingerprint, Terminal
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

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
  logs?: string[];
  errorMessage?: string;
}

interface VideoCardProps {
  res: VideoResult;
  isSelected: boolean;
  onToggleSelect: () => void;
  onFullscreen: (url: string, hasSound: boolean, id: string) => void;
  onDelete: (id: string) => void;
  onRetry: (res: VideoResult) => void;
  onDownload: (url: string, filename: string) => void;
  onViewLogs?: (res: VideoResult) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  res, isSelected, onToggleSelect, onFullscreen, onDelete, onRetry, onDownload, onViewLogs
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(res.id);
    showToast(`Đã sao chép Job ID: ${res.id}`, 'success');
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast(`Đã gửi báo cáo lỗi cho Job ID: ${res.id}`, 'info');
  };

  const cardClass = `group relative p-3 rounded-2xl border transition-all flex flex-col gap-3 ${isSelected
    ? 'border-indigo-500/40 bg-indigo-500/5'
    : 'border-black/[0.06] dark:border-white/[0.04] bg-white dark:bg-[#111114] hover:border-black/[0.1] dark:hover:border-white/[0.08] shadow-sm dark:shadow-none'
    }`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cardClass}
      onClick={() => onToggleSelect()}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-black border border-black/[0.06] dark:border-white/[0.04] flex items-center justify-center">
        {res.status === 'processing' ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-slate-200 dark:bg-black/60">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#0090ff] animate-[scan_2s_infinite_linear]"></div>
            </div>
            <Loader2 size={32} className="text-[#0090ff] animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0090ff] animate-pulse">Rendering...</p>
          </div>
        ) : (res.status === 'error' || (!res.url && res.status === 'done')) ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 gap-2 bg-red-50 dark:bg-red-950/20">
            <AlertCircle size={24} className="text-red-500/60 shrink-0" />
            <p className="text-red-500/80 font-bold uppercase text-[9px] tracking-wider">Lỗi tạo video</p>
            {res.errorMessage && (
              <p className="text-red-400/70 text-[8px] font-medium leading-relaxed max-w-full break-words line-clamp-3">{res.errorMessage}</p>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onRetry(res); }}
              className="mt-1 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[8px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
            >
              <RefreshCw size={10} /> Thử lại
            </button>
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

        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onViewLogs?.(res); }}
            className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-brand-blue shadow-xl transition-all"
            title="Xem nhật ký tiến trình"
          >
            <Terminal size={16} />
          </button>

          <button
            onClick={handleReport}
            className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-orange-500 shadow-xl transition-all"
            title="Báo lỗi"
          >
            <AlertTriangle size={16} />
          </button>

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

      <div className={`px-1 pb-1 space-y-2 ${res.status === 'processing' ? 'opacity-50' : ''}`}>
        <div className="space-y-1">
          <h4 className="text-[11px] font-semibold text-slate-700 dark:text-white/80 truncate leading-tight">{res.prompt}</h4>
          <div className="flex justify-between items-center">
            <p className="text-[8px] font-medium text-slate-400 dark:text-[#444] flex items-center gap-1.5">
              <Clock size={9} className="text-[#333]" /> {res.fullTimestamp}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[7px] font-mono text-slate-400 dark:text-[#444] bg-black/[0.03] dark:bg-white/[0.03] px-1.5 py-0.5 rounded">
                {res.id.length > 12 ? res.id.slice(0, 6) + '…' + res.id.slice(-3) : res.id}
              </span>
              <button onClick={handleCopyId} className="p-0.5 text-[#444] hover:text-indigo-400 transition-colors"><Copy size={9} /></button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-1.5 border-t border-black/[0.06] dark:border-white/[0.04]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-medium text-indigo-400/80">{res.duration} · {res.aspectRatio} · {res.mode}</span>
            <div className={`flex items-center gap-1 text-[8px] font-semibold ${res.isRefunded ? 'text-emerald-400' : res.status === 'error' ? 'text-red-400' : 'text-amber-500/70'}`}>
              <Zap size={8} fill="currentColor" />
              {res.isRefunded ? 'Refunded' : res.status === 'error' ? 'Failed' : `-${res.cost}`}
            </div>
          </div>
          <span className="text-[7px] font-medium text-slate-400 dark:text-[#333]">{res.model}</span>
        </div>
      </div>
    </motion.div>
  );
};