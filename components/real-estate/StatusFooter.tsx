
import React from 'react';
import { ShieldCheck, Maximize2 } from 'lucide-react';

export const StatusFooter: React.FC = () => {
  return (
    <div className="h-12 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-black px-8 flex items-center justify-between shrink-0 transition-colors z-30 shadow-2xl">
      <div className="flex items-center gap-8 text-[9px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest italic">
        <div className="flex items-center gap-2 text-purple-500"><ShieldCheck size={14}/> Node Secure</div>
        <div className="flex items-center gap-2"><Maximize2 size={14}/> Full Perspective 8K</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black text-slate-300 dark:text-gray-700">CLUSTER: H100_ALPHA_V7_STABLE</span>
      </div>
    </div>
  );
};
