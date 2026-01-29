import React from 'react';
import { Loader2, Check, Maximize2, Trash2, Edit3, Download, Zap, Box, Monitor, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { ImageResult } from '../../hooks/useImageGenerator';

interface ImageResultCardProps {
  res: ImageResult;
  isSelected: boolean;
  onToggleSelect: () => void;
  onFullscreen: (url: string) => void;
  onEdit: (url: string) => void;
  onDelete: (id: string) => void;
  onDownload: (url: string, filename: string) => void;
}

export const ImageResultCard: React.FC<ImageResultCardProps> = ({ 
  res, isSelected, onToggleSelect, onFullscreen, onEdit, onDelete, onDownload 
}) => {
  const aspectClass = res.aspectRatio === '9:16' ? 'aspect-[9/16]' : res.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square';

  const isProcessing = res.status === 'processing';
  const isError = res.status === 'error';

  return (
    <div 
      className={`group relative p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 cursor-pointer ${
        isSelected 
          ? 'border-brand-blue bg-brand-blue/5' 
          : isError
            ? 'border-red-500/20 bg-red-50/30 dark:bg-red-900/5 hover:border-red-500/40'
            : 'border-black/5 dark:border-white/5 bg-white dark:bg-[#141416] hover:border-black/10 dark:hover:border-white/10 shadow-sm'
      }`}
      onClick={() => res.url ? onFullscreen(res.url) : null}
    >
      {/* Visual Area */}
      <div className={`relative ${aspectClass} rounded-xl overflow-hidden bg-black border border-black/5 dark:border-white/5`}>
        {isProcessing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-black/40 backdrop-blur-sm z-10">
            <div className="relative">
              <Loader2 size={32} className="text-brand-blue animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue/30 animate-pulse" size={14} />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-blue animate-pulse">Rendering...</p>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-red-50 dark:bg-black/60 backdrop-blur-sm z-10 p-6 text-center">
             <AlertCircle size={32} className="text-red-500/50" />
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500">LỖI TỔNG HỢP</p>
                <p className="text-[8px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-tighter">Vui lòng kiểm tra lại kịch bản và thử tạo lại</p>
             </div>
          </div>
        ) : res.url ? (
          <img src={res.url} className="w-full h-full object-cover" alt="Gen" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-500/5 text-red-500/40 gap-2">
             <AlertCircle size={24} />
             <span className="text-[8px] font-black uppercase">Lỗi hệ thống</span>
          </div>
        )}

        {/* Reference Thumbnails Overlay (Bottom Left) */}
        {!isError && res.references.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1.5 z-10 pointer-events-none group-hover:opacity-0 transition-opacity">
            {res.references.slice(0, 3).map((ref, i) => (
              <div key={i} className="w-10 h-10 rounded-md border border-white/40 shadow-2xl overflow-hidden bg-black/40 backdrop-blur-sm">
                <img src={ref} className="w-full h-full object-cover" alt="Ref" />
              </div>
            ))}
            {res.references.length > 3 && (
              <div className="w-10 h-10 rounded-md border border-white/40 shadow-2xl bg-black/60 backdrop-blur-sm flex items-center justify-center text-[8px] font-black text-white">
                +{res.references.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Hover Actions */}
        {!isProcessing && !isError && res.url && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
             <button onClick={(e) => { e.stopPropagation(); onFullscreen(res.url!); }} className="p-2.5 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl"><Maximize2 size={16}/></button>
             <button onClick={(e) => { e.stopPropagation(); onEdit(res.url!); }} className="p-2.5 bg-brand-blue text-white rounded-full hover:scale-110 transition-transform shadow-xl"><Edit3 size={16}/></button>
             <button onClick={(e) => { e.stopPropagation(); onDownload(res.url!, `image_${res.id}.png`); }} className="p-2.5 bg-emerald-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"><Download size={16}/></button>
             <button onClick={(e) => { e.stopPropagation(); onDelete(res.id); }} className="p-2.5 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"><Trash2 size={16}/></button>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button onClick={(e) => { e.stopPropagation(); onDelete(res.id); }} className="p-3 bg-red-600 text-white rounded-full shadow-2xl flex items-center gap-2">
                <Trash2 size={16} />
                <span className="text-[9px] font-black uppercase pr-1">Xóa bản ghi</span>
             </button>
          </div>
        )}
        
        {/* Selection Checkbox Overlay */}
        {!isError && (
          <div 
            onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
            className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-blue border-brand-blue shadow-lg' : 'border-white/20 bg-black/40 hover:bg-black/60'}`}
          >
            {isSelected && <Check size={12} strokeWidth={4} className="text-white" />}
          </div>
        )}
      </div>

      {/* Info Area - Visible for all states */}
      <div className="px-1 space-y-2.5">
        <div className="space-y-1">
          <h4 className="text-[11px] font-black uppercase italic tracking-tighter text-slate-800 dark:text-white/90 truncate leading-none">
            {res.prompt}
          </h4>
          <div className="flex justify-between items-center text-[7px] font-bold text-gray-500 uppercase tracking-widest">
             <span className="flex items-center gap-1"><Clock size={10} /> {res.fullTimestamp}</span>
             <span className={isError ? 'text-red-500' : 'text-brand-blue'}>{res.model}</span>
          </div>
        </div>

        {/* Technical Specs Hub */}
        <div className="flex flex-wrap gap-1.5 border-t border-black/5 dark:border-white/5 pt-2.5">
           <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[7px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest">
              <Box size={8} /> {res.aspectRatio}
           </div>
           <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[7px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest">
              <Monitor size={8} /> {res.resolution.toUpperCase()}
           </div>
        </div>

        {/* Economic / Status Hub */}
        <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2">
           <div className={`flex items-center gap-1.5 text-[9px] font-black italic ${res.isRefunded ? 'text-emerald-500' : isError ? 'text-red-500' : 'text-orange-500'}`}>
              <Zap size={10} fill="currentColor" />
              {res.isRefunded ? 'REFUNDED' : isError ? 'FAILED' : `-${res.cost}`}
           </div>
           {isError && (
             <span className="text-[7px] font-black uppercase text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
               <AlertCircle size={8} /> Thử tạo lại
             </span>
           )}
           {isProcessing && (
             <span className="text-[7px] font-black uppercase text-brand-blue animate-pulse">Syncing...</span>
           )}
        </div>
      </div>
    </div>
  );
};

const Sparkles = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);
