
import React from 'react';
import { Loader2, Check, Maximize2, Trash2, Edit3, Download, Zap, Box, Monitor } from 'lucide-react';
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

  if (res.status === 'processing') {
    return (
      <div className="p-4 rounded-2xl border-2 border-black/5 dark:border-white/5 bg-slate-50 dark:bg-[#141416] flex flex-col gap-3">
        <div className={`relative ${aspectClass} rounded-xl overflow-hidden bg-black/5 dark:bg-black/40 flex flex-col items-center justify-center`}>
          <Loader2 size={24} className="text-brand-blue animate-spin mb-2" />
          <p className="text-[8px] font-black uppercase tracking-widest text-brand-blue animate-pulse">Synthesizing</p>
          
          {res.references.length > 0 && (
            <div className="absolute bottom-2 left-2 flex gap-1 z-10 opacity-40">
               {res.references.slice(0, 3).map((ref, i) => (
                 <div key={i} className="w-8 h-8 rounded-sm border border-white/20 overflow-hidden">
                    <img src={ref} className="w-full h-full object-cover" alt="" />
                 </div>
               ))}
            </div>
          )}
        </div>
        <div className="px-1 space-y-1">
          <p className="text-[10px] font-bold text-gray-500 truncate italic">"{res.prompt}"</p>
          <div className="flex items-center gap-1 text-[8px] font-black text-orange-500 uppercase italic">
             <Zap size={8} fill="currentColor" /> -{res.cost}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 cursor-pointer ${isSelected ? 'border-brand-blue bg-brand-blue/5' : 'border-black/5 dark:border-white/5 bg-white dark:bg-[#141416] hover:border-black/10 dark:hover:border-white/10 shadow-sm'}`}
      onClick={() => res.url && onFullscreen(res.url)}
    >
      <div className={`relative ${aspectClass} rounded-xl overflow-hidden bg-black border border-black/5 dark:border-white/5`}>
        {res.url ? (
          <img src={res.url} className="w-full h-full object-cover" alt="Gen" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-red-500/5 text-red-500/40">
             <AlertCircle size={24} />
          </div>
        )}

        {/* Reference Thumbnails Overlay (Bottom Left) - TO HƠN (40px) */}
        {res.references.length > 0 && (
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

        {res.url && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
             <button onClick={(e) => { e.stopPropagation(); onFullscreen(res.url!); }} className="p-2.5 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl"><Maximize2 size={16}/></button>
             <button onClick={(e) => { e.stopPropagation(); onEdit(res.url!); }} className="p-2.5 bg-brand-blue text-white rounded-full hover:scale-110 transition-transform shadow-xl"><Edit3 size={16}/></button>
             <button onClick={(e) => { e.stopPropagation(); onDownload(res.url!, `image_${res.id}.png`); }} className="p-2.5 bg-emerald-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"><Download size={16}/></button>
             <button onClick={(e) => { e.stopPropagation(); onDelete(res.id); }} className="p-2.5 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"><Trash2 size={16}/></button>
          </div>
        )}
        
        {/* Selection Checkbox Overlay */}
        <div 
          onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-blue border-brand-blue shadow-lg' : 'border-white/20 bg-black/40 hover:bg-black/60'}`}
        >
          {isSelected && <Check size={12} strokeWidth={4} className="text-white" />}
        </div>
      </div>

      <div className="px-1 space-y-2.5">
        <div className="space-y-1">
          <h4 className="text-[11px] font-black uppercase italic tracking-tighter text-slate-800 dark:text-white/90 truncate leading-none">{res.prompt}</h4>
          <div className="flex justify-between items-center text-[7px] font-bold text-gray-500 uppercase tracking-widest">
             <span>{res.fullTimestamp}</span>
             <span>{res.model}</span>
          </div>
        </div>

        {/* THÔNG TIN TỶ LỆ & ĐỘ PHÂN GIẢI */}
        <div className="flex flex-wrap gap-1.5 border-t border-black/5 dark:border-white/5 pt-2.5">
           <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[7px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest">
              <Box size={8} /> {res.aspectRatio}
           </div>
           <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[7px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest">
              <Monitor size={8} /> {res.resolution.toUpperCase()}
           </div>
        </div>

        {/* Credit Cost / Refund Status */}
        <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2">
           <div className={`flex items-center gap-1.5 text-[9px] font-black italic ${res.isRefunded ? 'text-emerald-500' : 'text-orange-500'}`}>
              <Zap size={10} fill="currentColor" />
              {res.isRefunded ? 'REFUNDED' : `-${res.cost}`}
           </div>
           {res.status === 'error' && (
             <span className="text-[7px] font-black uppercase text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">Failed</span>
           )}
        </div>
      </div>
    </div>
  );
};

const AlertCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);
