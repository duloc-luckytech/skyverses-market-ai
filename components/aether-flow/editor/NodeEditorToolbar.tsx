
import React from 'react';
import { 
  Play, 
  ChevronDown, 
  TrendingUp, 
  Pin, 
  Trash2, 
  Info, 
  LayoutGrid, 
  LogOut, 
  HelpCircle,
  Eye
} from 'lucide-react';

export const NodeEditorToolbar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <div className="flex items-center gap-1.5 bg-white/95 dark:bg-[#1a1b1e]/95 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-none px-2.5 py-1.5 shadow-2xl pointer-events-auto">
      <div className="flex items-center gap-2 pr-3 border-r border-black/5 dark:border-white/10 mr-1 group/viewport">
        <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-black border border-black/5 dark:border-white/10 flex items-center justify-center overflow-hidden relative shadow-inner">
           <Eye size={12} className="text-indigo-600 opacity-60 group-hover/viewport:opacity-100 transition-opacity" />
        </div>
        <div className="flex flex-col">
           <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Cửa sổ</span>
           <span className="text-[8px] font-black text-emerald-600 uppercase leading-none">Trực tiếp</span>
        </div>
      </div>

      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all" title="Chạy khối này">
        <Play size={16} fill="currentColor" />
      </button>

      <div className="flex items-center gap-1 cursor-pointer group p-1 transition-all">
        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
           <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
        <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
      </div>

      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all" title="Hiệu suất">
        <TrendingUp size={16} />
      </button>

      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all" title="Ghim khối">
        <Pin size={16} />
      </button>

      <button className="p-2 text-rose-500 hover:text-rose-600 transition-all" title="Xóa">
        <Trash2 size={16} />
      </button>

      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all" title="Thông tin">
        <Info size={16} />
      </button>

      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all" title="Bố cục lưới">
        <LayoutGrid size={16} />
      </button>

      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all" title="Trợ giúp">
        <HelpCircle size={16} />
      </button>
    </div>
  );
};
