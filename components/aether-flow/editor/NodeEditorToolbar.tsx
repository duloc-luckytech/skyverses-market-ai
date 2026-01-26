
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

interface NodeEditorToolbarProps {
  onClose?: () => void;
}

export const NodeEditorToolbar: React.FC<NodeEditorToolbarProps> = ({ onClose }) => {
  return (
    <div className="flex items-center gap-1.5 bg-[#1a1b1e]/95 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1.5 shadow-2xl pointer-events-auto">
      {/* Mini Viewport / Status */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/10 mr-1 group/viewport">
        <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center overflow-hidden relative shadow-inner">
           <div className="absolute inset-0 bg-brand-blue/5 animate-pulse"></div>
           <Eye size={12} className="text-brand-blue/60 group-hover/viewport:text-brand-blue transition-colors" />
        </div>
        <div className="flex flex-col">
           <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Viewport</span>
           <span className="text-[8px] font-black text-emerald-500 uppercase leading-none">Live_Sync</span>
        </div>
      </div>

      <button className="p-2 text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-lg" title="Run Node">
        <Play size={16} fill="currentColor" />
      </button>

      <div className="flex items-center gap-1 cursor-pointer group p-1 hover:bg-white/5 rounded-lg transition-all">
        <div className="w-3.5 h-3.5 rounded-full bg-emerald-800/40 border border-emerald-500/30 flex items-center justify-center">
           <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
        </div>
        <ChevronDown size={12} className="text-gray-500 group-hover:text-white" />
      </div>

      <button className="p-2 text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-lg" title="Performance">
        <TrendingUp size={16} />
      </button>

      <button className="p-2 text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-lg" title="Pin Node">
        <Pin size={16} />
      </button>

      <button className="p-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all" title="Delete">
        <Trash2 size={16} />
      </button>

      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Info">
        <Info size={16} />
      </button>

      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Grid Layout">
        <LayoutGrid size={16} />
      </button>

      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Help">
        <HelpCircle size={16} />
      </button>
    </div>
  );
};
