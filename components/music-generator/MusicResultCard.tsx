
import React from 'react';
import { motion } from 'framer-motion';
import { Music, Disc, Play, Pause, Download, Share2 } from 'lucide-react';

interface MusicResultCardProps {
  id: string;
  name: string;
  desc: string;
  timestamp: string;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
}

export const MusicResultCard: React.FC<MusicResultCardProps> = ({ id, name, desc, timestamp, isActive, isPlaying, onPlay }) => {
  return (
    <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 space-y-6 hover:border-brand-blue/40 transition-all group shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Music size={140} strokeWidth={1} />
      </div>
      
      <div className="aspect-square bg-black/40 rounded-2xl flex items-center justify-center text-brand-blue/20 group-hover:text-brand-blue transition-colors shadow-inner overflow-hidden relative">
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
      </div>
      
      <div className="space-y-2 relative z-10">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-black uppercase italic tracking-tighter text-white group-hover:text-brand-blue transition-colors">{name}</h4>
          <p className="text-[8px] font-black text-gray-600 uppercase mt-1">{timestamp}</p>
        </div>
        <p className="text-[10px] text-gray-500 font-bold uppercase truncate leading-relaxed">"{desc}"</p>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10">
        <button 
          onClick={onPlay}
          className="w-12 h-12 rounded-full bg-brand-blue hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-white shadow-lg shadow-brand-blue/20"
        >
          {isActive && isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        <div className="flex gap-2">
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm"><Download size={18}/></button>
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm"><Share2 size={18}/></button>
        </div>
      </div>
    </div>
  );
};
