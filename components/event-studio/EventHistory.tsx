
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, X, Heart } from 'lucide-react';
import { RenderResult } from '../../hooks/useEventStudio';

interface EventHistoryProps {
  results: RenderResult[];
  activeId: string | null;
  onSelect: (id: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}

export const EventHistory: React.FC<EventHistoryProps> = ({ results, activeId, onSelect, favorites, onToggleFavorite }) => {
  // Show pinned items first
  const sortedResults = [...results].sort((a, b) => {
    const aP = favorites.has(a.id) ? 0 : 1;
    const bP = favorites.has(b.id) ? 0 : 1;
    return aP - bP;
  });

  return (
    <aside className="hidden lg:flex w-20 xl:w-28 border-l border-black/[0.04] dark:border-white/[0.04] bg-white/60 dark:bg-[#0d0e12]/60 backdrop-blur-xl flex-col items-center py-6 gap-4 overflow-y-auto no-scrollbar z-50 transition-colors">
      <div className="flex flex-col items-center gap-1.5 mb-2 shrink-0">
        <HistoryIcon size={14} className="text-slate-400 dark:text-slate-500" />
        <span className="text-[7px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">Kết quả</span>
        {favorites.size > 0 && (
          <span className="text-[7px] font-bold text-red-400 flex items-center gap-0.5">
            <Heart size={7} fill="currentColor" /> {favorites.size}
          </span>
        )}
      </div>
      
      <div className="space-y-3 w-full px-2.5">
        <AnimatePresence initial={false}>
          {sortedResults.map((res, idx) => {
            const isPinned = favorites.has(res.id);
            return (
              <motion.div
                key={res.id} 
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="relative group"
              >
                <button 
                  onClick={() => onSelect(res.id)}
                  className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeId === res.id 
                      ? 'border-brand-blue shadow-lg shadow-brand-blue/10 scale-[1.02]' 
                      : isPinned
                        ? 'border-red-400/40 opacity-90 hover:opacity-100'
                        : 'border-black/[0.04] dark:border-white/[0.06] opacity-50 hover:opacity-100 hover:border-slate-300 dark:hover:border-white/15'
                  }`}
                >
                  {res.status === 'processing' ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-black/40">
                      <div className="w-5 h-5 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
                    </div>
                  ) : res.url ? (
                    <img src={res.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                  ) : (
                    <div className="w-full h-full bg-red-500/5 flex items-center justify-center text-red-400">
                      <X size={14} strokeWidth={2.5} />
                    </div>
                  )}

                  {/* Pinned indicator */}
                  {isPinned && (
                    <div className="absolute top-1 left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                      <Heart size={8} fill="white" className="text-white" />
                    </div>
                  )}
                </button>

                {/* Quick pin button on hover */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(res.id); }}
                  className={`absolute bottom-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm ${isPinned ? 'bg-red-500 text-white' : 'bg-white/80 dark:bg-black/60 text-slate-500 hover:text-red-500'}`}
                >
                  <Heart size={8} fill={isPinned ? 'currentColor' : 'none'} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {results.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-grow opacity-10 gap-2">
          <div className="w-10 h-10 border-2 border-dashed border-slate-400 dark:border-slate-600 rounded-lg"></div>
        </div>
      )}
    </aside>
  );
};
