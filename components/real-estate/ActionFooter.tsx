
import React from 'react';
import { Coins, Zap, Loader2, AlertTriangle } from 'lucide-react';

interface ActionFooterProps {
  credits: number;
  cost: number;
  isGenerating: boolean;
  hasSource: boolean;
  hasEnoughCredits: boolean;
  onGenerate: () => void;
}

export const ActionFooter: React.FC<ActionFooterProps> = ({ 
  credits, cost, isGenerating, hasSource, hasEnoughCredits, onGenerate 
}) => {
  return (
    <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-white/80 dark:bg-[#0d0e12]/80 backdrop-blur-md space-y-4 shrink-0 transition-colors">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest mb-1 italic">Số dư Credits</span>
          <div className="flex items-center gap-1.5 text-brand-blue leading-none">
            <Coins size={14} className="text-yellow-500" fill="currentColor" />
            <span className="text-[12px] font-black italic">{credits.toLocaleString()} CR</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest mb-1 italic">Chi phí</span>
          <div className="flex items-center gap-1 text-orange-500 leading-none">
            <Zap size={12} fill="currentColor" />
            <span className="text-[11px] font-black italic">{cost} CR</span>
          </div>
        </div>
      </div>

      <button 
        onClick={onGenerate}
        disabled={isGenerating || !hasSource || !hasEnoughCredits}
        className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.4em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 group relative overflow-hidden ${hasSource && hasEnoughCredits ? 'bg-purple-600 text-white hover:brightness-110 shadow-purple-600/20' : 'bg-slate-200 dark:bg-gray-800 text-slate-400 dark:text-gray-600 cursor-not-allowed grayscale'}`}
      >
        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Zap size={18} fill="currentColor" />}
        KHỞI CHẠY TỔNG HỢP
      </button>

      {!hasEnoughCredits && hasSource && (
        <div className="flex items-center justify-center gap-2 text-amber-500 animate-pulse">
          <AlertTriangle size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">Không đủ Credits để thực thi</span>
        </div>
      )}
    </div>
  );
};
