
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, SlidersHorizontal, Sparkles, Loader2, 
  ChevronUp, ChevronDown, Zap, ImageIcon, FolderOpen
} from 'lucide-react';

interface MobileGeneratorBarProps {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  prompt: string;
  setPrompt: (val: string) => void;
  credits: number;
  totalCost: number;
  isGenerating: boolean;
  isGenerateDisabled: boolean;
  onGenerate: (e: React.MouseEvent) => void;
  onOpenLibrary: () => void;
}

export const MobileGeneratorBar: React.FC<MobileGeneratorBarProps> = ({
  isExpanded,
  setIsExpanded,
  prompt,
  setPrompt,
  credits,
  totalCost,
  isGenerating,
  isGenerateDisabled,
  onGenerate,
  onOpenLibrary
}) => {
  return (
    <div 
      className={`lg:hidden flex flex-col items-center shrink-0 cursor-pointer relative transition-all duration-500 ease-in-out ${
        isExpanded 
          ? 'h-14 border-b border-black/5 dark:border-white/5 justify-center' 
          : 'h-[130px] justify-start bg-white/60 dark:bg-black/60 backdrop-blur-xl'
      }`}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      {/* Drag Handle Indicator */}
      <div className="w-10 h-1 bg-slate-300 dark:bg-white/10 rounded-full mb-3 mt-2 opacity-50"></div>
      
      {!isExpanded ? (
        <div className="w-full px-5 space-y-3">
          {/* LINE 1: PREMIUM INPUT PILL */}
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenLibrary(); }}
              className="w-11 h-11 flex items-center justify-center bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-slate-400 hover:text-brand-blue shadow-sm active:scale-90 transition-all"
            >
              <FolderOpen size={18} />
            </button>
            
            <div className="flex-grow relative h-11 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl flex items-center px-4 shadow-inner">
               <input 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 onClick={(e) => e.stopPropagation()}
                 className="w-full bg-transparent border-none outline-none text-[13px] font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                 placeholder="Mô tả hình ảnh..."
               />
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
              className="w-11 h-11 flex items-center justify-center bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-slate-400 hover:text-brand-blue shadow-sm active:scale-90 transition-all"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* LINE 2: COMPACT STATUS & GENERATE ACTION */}
          <div className="flex items-center justify-between gap-3">
             {/* Resource Telemetry - Slimmed Down */}
             <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-3 h-10 rounded-xl border border-black/5 dark:border-white/10 shadow-inner">
                <div className="flex flex-col items-start leading-none gap-0.5">
                   <span className="text-[6px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Ví</span>
                   <div className="flex items-center gap-1">
                      <Sparkles size={8} className="text-brand-blue" />
                      <span className="text-[10px] font-black text-slate-700 dark:text-zinc-300 italic">{(credits || 0).toLocaleString()}</span>
                   </div>
                </div>
                <div className="w-px h-5 bg-black/10 dark:bg-white/10"></div>
                <div className="flex flex-col items-end leading-none gap-0.5">
                   <span className="text-[6px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Phí</span>
                   <div className="flex items-center gap-0.5 text-orange-500 font-black italic">
                      <Zap size={8} fill="currentColor" />
                      <span className="text-[10px]">-{totalCost}</span>
                   </div>
                </div>
             </div>

             {/* Main Action Button - Compact Style with Magic Icon */}
             <button 
               onClick={onGenerate}
               disabled={isGenerateDisabled}
               className={`flex-grow h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                 isGenerateDisabled 
                  ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 grayscale cursor-not-allowed' 
                  : 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:brightness-110 active:scale-95'
               }`}
             >
               {!isGenerateDisabled && (
                 <div className="absolute inset-0 bg-white/20 -translate-x-full animate-[progress_3s_infinite_linear]"></div>
               )}
               {isGenerating ? (
                 <Loader2 size={14} className="animate-spin" />
               ) : (
                 <Sparkles size={14} fill="currentColor" className="opacity-80" />
               )}
               <span>{isGenerating ? 'ĐANG TẠO...' : 'TẠO HÌNH ẢNH'}</span>
             </button>
          </div>
        </div>
      ) : (
        /* Expanded View Header */
        <div className="flex items-center justify-between w-full px-8">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <SlidersHorizontal size={14} />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white italic">Cấu hình thuật toán</h2>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
