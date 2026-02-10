
import React from 'react';
import { Bookmark, Sparkles, Users, Heart, Zap } from 'lucide-react';
import { Solution, Language } from '../../types';

interface SolutionCardProps {
  sol: Solution;
  idx: number;
  lang: string;
  isLiked: boolean;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onClick: (slug: string) => void;
  stats: { users: string; likes: string };
  isGrid?: boolean;
}

const SolutionCardComponent: React.FC<SolutionCardProps> = ({ 
  sol, idx, lang, isLiked, isFavorited, onToggleFavorite, onToggleLike, onClick, stats, isGrid = false 
}) => {
  const targetId = sol._id || sol.id;
  const currentLang = lang as Language;

  return (
    <div 
      onClick={() => onClick(sol.slug)}
      className={`flex-shrink-0 snap-start group relative flex flex-col bg-white dark:bg-[#08080a] border border-black/[0.08] dark:border-white/[0.08] hover:border-brand-blue/40 transition-all duration-500 shadow-sm hover:shadow-2xl rounded-xl overflow-hidden cursor-pointer ${
        isGrid ? 'w-full' : 'w-[280px] md:w-[320px]'
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <img 
          src={sol.imageUrl} 
          alt={sol.name[currentLang]} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-30 transition-all duration-1000" 
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-40">
           <div className="px-5 py-2.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2.5 shadow-2xl scale-90 group-hover:scale-100 transition-all duration-500">
              <Sparkles size={14} className="text-brand-blue" fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Initialize</span>
           </div>
        </div>
        <button 
          onClick={(e) => onToggleFavorite(e, sol.id)} 
          className={`absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2.5 bg-black/60 backdrop-blur-md rounded-full border transition-all z-30 shadow-xl ${isFavorited ? 'text-brand-blue border-brand-blue/50' : 'text-white/40 border-white/10 hover:text-brand-blue'}`}
        >
          <Bookmark fill="currentColor" className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
        </button>
        <div className="absolute top-2 left-2 md:top-4 md:left-4">
          <span className="bg-black/90 backdrop-blur-md text-white border border-white/20 px-1.5 md:px-3 py-0.5 md:py-1 text-[7px] md:text-[9px] font-black uppercase tracking-widest rounded-sm">{sol.category[currentLang]}</span>
        </div>
      </div>
      <div className="p-3 md:p-6 flex-grow flex flex-col gap-3 md:gap-6 bg-white dark:bg-[#0d0d0f]">
        <div className="space-y-2 md:space-y-4">
          <h3 className="text-sm md:text-xl font-black uppercase tracking-tighter text-brand-blue italic transition-colors flex-grow pr-2 truncate">{sol.name[currentLang]}</h3>
          <p className="text-black/60 dark:text-white/50 text-[9px] md:text-[12px] leading-relaxed font-medium italic tracking-tight line-clamp-2 md:line-clamp-3">"{sol.description[currentLang]}"</p>
        </div>
        <div className="mt-auto pt-4 flex justify-between items-center border-t border-black/5 dark:border-white/5">
           <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-1 md:gap-1.5 opacity-40 group-hover:opacity-80 transition-opacity"><Users size={12} /><span className="text-[8px] font-black text-gray-500">{stats.users}</span></div>
              <button onClick={(e) => onToggleLike(e, targetId)} className={`flex items-center gap-1 md:gap-1.5 transition-all ${isLiked ? 'text-red-500 opacity-100' : 'opacity-40 group-hover:opacity-80 text-gray-500'}`}><Heart size={12} fill="currentColor" /><span className="text-[8px] font-black">{stats.likes}</span></button>
           </div>
           <div>{sol.isFree ? <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[6px] md:text-[9px] font-black uppercase tracking-widest rounded-sm">FREE</span> : <div className="flex items-center gap-1 pl-1 pr-2 py-0.5 md:py-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full"><div className="w-3.5 h-3.5 md:w-5 md:h-5 rounded-full bg-brand-blue flex items-center justify-center text-white"><Zap fill="currentColor" className="w-2 h-2 md:w-2.5 md:h-2.5" /></div><span className="text-[8px] md:text-[11px] font-black italic text-black dark:text-white leading-none">{sol.priceCredits}</span></div>}</div>
        </div>
      </div>
    </div>
  );
};

export const SolutionCard = React.memo(SolutionCardComponent);
