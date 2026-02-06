
import React from 'react';
import { 
  Loader2, Check, Maximize2, Trash2, Edit3, 
  Download, Zap, Box, Monitor, AlertCircle, 
  Clock, RefreshCw, Terminal, Copy
} from 'lucide-react';
import { ImageResult } from '../../hooks/useImageGenerator';
import { useToast } from '../../context/ToastContext';

interface ImageResultCardProps {
  res: ImageResult;
  isSelected: boolean;
  onToggleSelect: () => void;
  onFullscreen: (url: string) => void;
  onEdit: (url: string) => void;
  onDelete: (id: string) => void;
  onDownload: (url: string, filename: string) => void;
  onRetry: () => void;
  onViewLogs?: (res: ImageResult) => void;
}

export const ImageResultCard: React.FC<ImageResultCardProps> = ({ 
  res, isSelected, onToggleSelect, onFullscreen, onEdit, onDelete, onDownload, onRetry, onViewLogs 
}) => {
  const isProcessing = res.status === 'processing';
  const isError = res.status === 'error';
  const { showToast } = useToast();

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(res.id);
    showToast(`Đã sao chép Job ID: ${res.id}`, 'success');
  };

  return (
    <div 
      className={`group relative p-3 rounded-[2rem] border-2 transition-all flex flex-col gap-3 cursor-pointer h-full ${
        isSelected 
          ? 'border-brand-blue bg-brand-blue/5 shadow-[0_0_40px_rgba(0,144,255,0.1)]' 
          : isError
            ? 'border-red-500/20 bg-red-50/30 dark:bg-red-900/5 hover:border-red-500/40'
            : 'border-black/5 dark:border-white/5 bg-white dark:bg-[#111114] hover:border-black/10 dark:hover:border-white/10 shadow-sm'
      }`}
      onClick={() => res.url ? onFullscreen(res.url) : null}
    >
      {/* Visual Area */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-black border border-black/5 dark:border-white/5 flex items-center justify-center shadow-inner">
        
        {res.url && !isProcessing && !isError && (
          <div className="absolute inset-0 z-0">
             <img src={res.url} className="w-full h-full object-cover blur-2xl opacity-30 scale-110" alt="" />
          </div>
        )}

        {isProcessing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-50/40 dark:bg-black/40 backdrop-blur-sm z-10">
            <div className="relative">
              <Loader2 size={40} className="text-brand-blue animate-spin" />
              <Sparkles size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue/30 animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue animate-pulse">Rendering...</p>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-red-50 dark:bg-black/60 backdrop-blur-sm z-10 p-6 text-center">
             <AlertCircle size={36} className="text-red-500/50" />
             <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-red-500">LỖI TỔNG HỢP</p>
                <p className="text-[9px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-tighter">Vui lòng kiểm tra lại kịch bản</p>
             </div>
          </div>
        ) : res.url ? (
          <img 
            src={res.url} 
            className="relative z-10 max-w-full max-h-full object-contain transition-transform duration-1000 group-hover:scale-[1.02]" 
            alt="Generated result" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-500/5 text-red-500/40 gap-2">
             <AlertCircle size={24} />
             <span className="text-[8px] font-black uppercase">Lỗi hệ thống</span>
          </div>
        )}

        {!isError && !isProcessing && res.references.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5 z-20 pointer-events-none group-hover:opacity-0 transition-opacity">
            {res.references.slice(0, 2).map((ref, i) => (
              <div key={i} className="w-8 h-8 rounded-lg border border-white/40 shadow-2xl overflow-hidden bg-black/40 backdrop-blur-md">
                <img src={ref.url} className="w-full h-full object-cover" alt="Ref" />
              </div>
            ))}
            {res.references.length > 2 && (
              <div className="w-8 h-8 rounded-lg border border-white/40 shadow-2xl bg-black/60 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-white">
                +{res.references.length - 2}
              </div>
            )}
          </div>
        )}

        {!isProcessing && !isError && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white/80 border border-white/10 uppercase tracking-widest">
              {res.aspectRatio}
            </span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 z-40">
           {!isError && !isProcessing && res.url && (
             <>
                <button 
                  onClick={(e) => { e.stopPropagation(); onFullscreen(res.url!); }} 
                  className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-2xl hover:bg-brand-blue hover:text-white"
                  title="Xem toàn màn hình"
                >
                  <Maximize2 size={18}/>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(res.url!); }} 
                  className="p-3 bg-white text-brand-blue rounded-full hover:scale-110 transition-transform shadow-2xl hover:bg-brand-blue hover:text-white"
                  title="Chỉnh sửa"
                >
                  <Edit3 size={18}/>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDownload(res.url!, `image_${res.id}.png`); }} 
                  className="p-3 bg-white text-emerald-600 rounded-full hover:scale-110 transition-transform shadow-2xl hover:bg-emerald-600 hover:text-white"
                  title="Tải xuống"
                >
                  <Download size={18}/>
                </button>
             </>
           )}
           
           {(isError || isProcessing || res.url) && (
              <button 
                onClick={(e) => { e.stopPropagation(); onViewLogs?.(res); }}
                className="p-3 bg-white text-indigo-600 rounded-full hover:scale-110 transition-transform shadow-2xl hover:bg-indigo-600 hover:text-white"
                title="Xem nhật ký tiến trình"
              >
                <Terminal size={18} />
              </button>
           )}
        </div>

        {isError && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-40 p-4">
             <button 
               onClick={(e) => { e.stopPropagation(); onRetry(); }} 
               className="w-full py-3 bg-brand-blue text-white rounded-xl shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
             >
                <RefreshCw size={14} />
                <span className="text-[10px] font-black uppercase">Tạo lại</span>
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onDelete(res.id); }} 
               className="w-full py-3 bg-red-600 text-white rounded-xl shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
             >
                <Trash2 size={14} />
                <span className="text-[10px] font-black uppercase">Xóa bản ghi</span>
             </button>
          </div>
        )}
        
        {!isError && (
          <div 
            onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
            className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-50 ${isSelected ? 'bg-brand-blue border-brand-blue shadow-lg' : 'bg-black/40 border-white/20 hover:bg-black/60'}`}
          >
            {isSelected && <Check size={14} strokeWidth={4} className="text-white" />}
          </div>
        )}
      </div>

      <div className={`px-1 space-y-3 mt-auto ${isProcessing ? 'opacity-60' : ''}`}>
        <div className="space-y-1.5">
          <h4 className="text-[12px] font-black uppercase italic tracking-tighter text-slate-800 dark:text-white/90 truncate leading-tight">
            {res.prompt}
          </h4>
          <div className="flex justify-between items-center text-[8px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
             <span className="flex items-center gap-1.5"><Clock size={10} /> {res.fullTimestamp}</span>
             <div className="flex items-center gap-2">
                <span className="bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded font-mono">
                  ID: {res.id.length > 10 ? `${res.id.slice(0, 6)}...` : res.id.toUpperCase()}
                </span>
                <button onClick={handleCopyId} className="hover:text-brand-blue transition-colors">
                   <Copy size={10} />
                </button>
             </div>
          </div>
        </div>

        <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
           <div className="flex flex-wrap gap-1.5">
              <div className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[7px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest border border-black/5 dark:border-white/10">
                 {res.resolution.toUpperCase()}
              </div>
              <div className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[7px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest border border-black/5 dark:border-white/10">
                 {res.aspectRatio}
              </div>
           </div>
           
           <div className={`flex items-center gap-1 text-[10px] font-black italic ${res.isRefunded ? 'text-emerald-500' : isError ? 'text-red-500' : 'text-orange-500'}`}>
              <Zap size={10} fill="currentColor" />
              {res.isRefunded ? 'REFUNDED' : isError ? 'FAILED' : `-${res.cost}`}
           </div>
        </div>
      </div>
    </div>
  );
};

const Sparkles = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);
