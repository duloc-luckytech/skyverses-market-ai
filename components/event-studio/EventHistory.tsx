
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Download, Trash2, Maximize2 } from 'lucide-react';
import { RenderResult } from '../../hooks/useEventStudio';

interface EventHistoryProps {
  results: RenderResult[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export const EventHistory: React.FC<EventHistoryProps> = ({ results, activeId, onSelect }) => {
  return (
    <aside className="hidden lg:flex w-24 md:w-32 xl:w-40 border-l border-slate-200 dark:border-white/5 bg-white/40 dark:bg-[#0d0e12]/40 backdrop-blur-xl flex flex-col items-center py-8 gap-6 overflow-y-auto no-scrollbar z-50 transition-colors">
      <div className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest flex flex-col items-center gap-2 mb-4 text-center shrink-0 italic">
        <HistoryIcon size={16} /> Tệp tin
      </div>
      
      <div className="space-y-4 w-full px-4">
        <AnimatePresence initial={false}>
          {results.map((res, idx) => (
            <motion.button 
              key={res.id} 
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onSelect(res.id)}
              className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all shrink-0 group ${activeId === res.id ? 'border-brand-blue shadow-xl' : 'border-black/5 dark:border-white/10 opacity-60 hover:opacity-100 hover:border-slate-300 dark:hover:border-white/30'}`}
            >
              {res.status === 'processing' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-black/40">
                  <div className="w-4 h-4 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
                </div>
              ) : res.url ? (
                <img src={res.url} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <XIcon size={16} />
                </div>
              )}
              
              <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[6px] font-black text-white uppercase text-center block tracking-tighter">0{results.length - idx}</span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {results.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-grow opacity-10 gap-2">
           <div className="w-10 h-10 border-2 border-dashed border-slate-400 rounded-lg"></div>
        </div>
      )}
    </aside>
  );
};

const XIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
