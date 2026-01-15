
import React from 'react';
import { motion } from 'framer-motion';
import { Music, Disc, Play, Pause, Download, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface MusicResultCardProps {
  id: string;
  name: string;
  desc: string;
  timestamp: string;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onRecreate: () => void;
  status?: 'processing' | 'done' | 'error';
}

export const MusicResultCard: React.FC<MusicResultCardProps> = ({ 
  id, name, desc, timestamp, isActive, isPlaying, onPlay, onDelete, onDownload, onRecreate, status = 'done' 
}) => {
  const isDone = status === 'done';

  return (
    <div className={`bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6 hover:border-brand-blue/40 transition-all group shadow-xl relative overflow-hidden ${status === 'error' ? 'opacity-60' : ''}`}>
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-5 pointer-events-none">
        <Music size={140} strokeWidth={1} className="text-slate-900 dark:text-white" />
      </div>
      
      <div className="aspect-square bg-slate-50 dark:bg-black/40 rounded-2xl flex items-center justify-center text-brand-blue/20 group-hover:text-brand-blue transition-colors shadow-inner overflow-hidden relative border border-black/5 dark:border-transparent">
        {status === 'processing' ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue animate-pulse">Rendering...</span>
          </div>
        ) : status === 'error' ? (
          <div className="flex flex-col items-center gap-2 text-red-500/50">
            <AlertCircle size={48} />
            <span className="text-[10px] font-black uppercase tracking-widest">Lỗi tạo nhạc</span>
          </div>
        ) : (
          <>
            <Disc size={120} className={isActive && isPlaying ? 'animate-spin-slow text-brand-blue opacity-40' : 'opacity-20'} />
            {isActive && isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4].map(i => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [10, 40, 10] }} 
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }} 
                    className="w-1 bg-brand-blue rounded-full" 
                  />
                ))}
              </div>
            )}
            
            {/* Play Button Overlay - Highlighted for 'done' status */}
            <button 
               onClick={onPlay}
               className={`absolute inset-0 flex items-center justify-center transition-all duration-300 z-20 ${
                 isDone 
                 ? 'bg-black/10 opacity-100' 
                 : 'bg-black/20 opacity-0 group-hover:opacity-100'
               }`}
            >
               <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                 isDone 
                 ? 'bg-brand-blue text-white scale-100 shadow-[0_0_25px_rgba(0,144,255,0.5)]' 
                 : 'bg-white/20 text-white scale-90 group-hover:scale-100'
               }`}>
                  {isActive && isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
               </div>
               
               {isDone && !isActive && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: [0.4, 0.8, 0.4] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute inset-0 rounded-2xl border-2 border-brand-blue/30 pointer-events-none"
                 />
               )}
            </button>
          </>
        )}
      </div>
      
      <div className="space-y-2 relative z-10">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white group-hover:text-brand-blue transition-colors truncate pr-4">{name}</h4>
          <p className="text-[8px] font-black text-slate-400 dark:text-gray-600 uppercase mt-1 shrink-0">{timestamp}</p>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase truncate leading-relaxed">"{desc}"</p>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-black/5 dark:border-white/5 relative z-10">
        <div className="flex gap-2">
          <button 
            onClick={onDelete}
            className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm"
            title="Xoá bản ghi"
          >
            <Trash2 size={18}/>
          </button>
          <button 
            onClick={onRecreate}
            disabled={status === 'processing'}
            className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue/20 text-slate-400 hover:text-brand-blue rounded-xl transition-all shadow-sm disabled:opacity-20"
            title="Tạo lại (AI)"
          >
            <RefreshCw size={18}/>
          </button>
        </div>
        
        <button 
          onClick={onDownload}
          disabled={!isDone}
          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${
            isDone 
            ? 'bg-brand-blue/10 dark:bg-white/5 hover:bg-brand-blue text-brand-blue dark:text-gray-400 hover:text-white' 
            : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/20 cursor-not-allowed'
          }`}
        >
          <Download size={14}/> Tải xuống
        </button>
      </div>
    </div>
  );
};
