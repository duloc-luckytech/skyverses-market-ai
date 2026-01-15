
import React from 'react';
import { motion } from 'framer-motion';
import { Music, Disc, Play, Pause, Download, Share2, Loader2, AlertCircle } from 'lucide-react';

interface MusicResultCardProps {
  id: string;
  name: string;
  desc: string;
  timestamp: string;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  status?: 'processing' | 'done' | 'error';
}

export const MusicResultCard: React.FC<MusicResultCardProps> = ({ 
  id, name, desc, timestamp, isActive, isPlaying, onPlay, status = 'done' 
}) => {
  return (
    <div className={`bg-[#161b22] border border-white/5 rounded-3xl p-6 space-y-6 hover:border-brand-blue/40 transition-all group shadow-2xl relative overflow-hidden ${status === 'error' ? 'opacity-60' : ''}`}>
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Music size={140} strokeWidth={1} />
      </div>
      
      <div className="aspect-square bg-black/40 rounded-2xl flex items-center justify-center text-brand-blue/20 group-hover:text-brand-blue transition-colors shadow-inner overflow-hidden relative">
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
          </>
        )}
      </div>
      
      <div className="space-y-2 relative z-10">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-black uppercase italic tracking-tighter text-white group-hover:text-brand-blue transition-colors truncate pr-4">{name}</h4>
          <p className="text-[8px] font-black text-gray-600 uppercase mt-1 shrink-0">{timestamp}</p>
        </div>
        <p className="text-[10px] text-gray-500 font-bold uppercase truncate leading-relaxed">"{desc}"</p>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10">
        <button 
          onClick={onPlay}
          disabled={status !== 'done'}
          className={`w-12 h-12 rounded-full bg-brand-blue hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-white shadow-lg shadow-brand-blue/20 disabled:opacity-20 disabled:grayscale`}
        >
          {isActive && isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        <div className="flex gap-2">
          <button disabled={status !== 'done'} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm disabled:opacity-20"><Download size={18}/></button>
          <button disabled={status !== 'done'} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm disabled:opacity-20"><Share2 size={18}/></button>
        </div>
      </div>
    </div>
  );
};
