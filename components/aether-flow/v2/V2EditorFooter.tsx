
import React from 'react';
import { Database, Zap, Save, Play } from 'lucide-react';

interface V2EditorFooterProps {
  onClose: () => void;
}

export const V2EditorFooter: React.FC<V2EditorFooterProps> = ({ onClose }) => (
  <div className="h-16 md:h-20 border-t border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#0c0c0e] shrink-0 flex items-center justify-between px-10 z-50 transition-colors">
    <div className="flex items-center gap-10">
      <div className="flex items-center gap-3 opacity-60">
         <Database size={16} className="text-indigo-600" />
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-400 italic">Sync: 100%</span>
      </div>
      <div className="hidden sm:flex items-center gap-3 opacity-60">
         <Zap size={16} className="text-yellow-500" />
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-400 italic">Protocol: WebSocket_Secure</span>
      </div>
    </div>

    <div className="flex gap-4">
      <button 
        onClick={onClose}
        className="px-8 py-3 bg-white dark:bg-[#1a1b23] border border-black/10 dark:border-white/10 text-slate-700 dark:text-zinc-300 rounded-none text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-100 dark:hover:bg-white dark:hover:text-black transition-all shadow-sm"
      >
         HỦY BỎ
      </button>
      <button 
        className="px-10 py-3 bg-indigo-600 text-white rounded-none text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95 group"
      >
         <Save size={14} fill="currentColor" className="group-hover:scale-110 transition-transform" /> LƯU & TRIỂN KHAI
      </button>
    </div>
  </div>
);
