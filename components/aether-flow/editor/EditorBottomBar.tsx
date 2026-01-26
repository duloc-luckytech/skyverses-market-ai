
import React from 'react';
import { Database, Cpu, Play } from 'lucide-react';

interface EditorBottomBarProps {
  onClose: () => void;
}

export const EditorBottomBar: React.FC<EditorBottomBarProps> = ({ onClose }) => (
  <div className="h-16 md:h-20 border-t border-white/5 bg-black/40 backdrop-blur-xl shrink-0 flex items-center justify-between px-10 z-50">
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-3 opacity-40">
         <Database size={16} className="text-indigo-400" />
         <span className="text-[9px] font-bold uppercase tracking-widest text-white italic">Sync: 100%</span>
      </div>
      <div className="flex items-center gap-3 opacity-40">
         <Cpu size={16} className="text-brand-blue" />
         <span className="text-[9px] font-bold uppercase tracking-widest text-white italic">Compute: FP16</span>
      </div>
    </div>

    <div className="flex gap-4">
      <button 
        onClick={onClose}
        className="px-8 py-3 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
      >
         Đóng trình biên tập
      </button>
      <button 
        className="px-10 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-blue/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
         <Play size={14} fill="currentColor" /> Triển khai ngay
      </button>
    </div>
  </div>
);
