
import React from 'react';
import { Settings, X } from 'lucide-react';

interface ViewportHeaderProps {
  onClose: () => void;
}

export const ViewportHeader: React.FC<ViewportHeaderProps> = ({ onClose }) => {
  return (
    <header className="h-14 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-black/40 flex items-center justify-between px-8 backdrop-blur-xl z-30 shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#a855f7]"></div>
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-gray-400 italic">KẾT QUẢ TỔNG HỢP</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Cài đặt hệ thống"><Settings size={18}/></button>
        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2"></div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-black/5 dark:bg-white/5 rounded-full"><X size={18} /></button>
      </div>
    </header>
  );
};
