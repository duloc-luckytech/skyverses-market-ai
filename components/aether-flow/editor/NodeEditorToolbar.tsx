
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
  HelpCircle 
} from 'lucide-react';

interface NodeEditorToolbarProps {
  onClose: () => void;
}

export const NodeEditorToolbar: React.FC<NodeEditorToolbarProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-center pt-4 pb-2 z-[60] shrink-0">
      <div className="bg-[#1a1b1e] border border-white/5 rounded-xl px-4 py-2 flex items-center gap-6 shadow-2xl">
        <button className="text-gray-500 hover:text-white transition-colors">
          <Play size={18} />
        </button>

        <div className="flex items-center gap-1 cursor-pointer group">
          <div className="w-4 h-4 rounded-full bg-emerald-800 border border-emerald-500/30 flex items-center justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
          </div>
          <ChevronDown size={14} className="text-gray-500 group-hover:text-white" />
        </div>

        <button className="text-gray-500 hover:text-white transition-colors">
          <TrendingUp size={16} />
        </button>

        <button className="text-gray-500 hover:text-white transition-colors">
          <Pin size={16} />
        </button>

        <button className="text-rose-500 hover:text-rose-400 transition-colors">
          <Trash2 size={16} />
        </button>

        <button className="text-gray-500 hover:text-white transition-colors">
          <Info size={16} />
        </button>

        <button className="text-gray-500 hover:text-white transition-colors">
          <LayoutGrid size={16} />
        </button>

        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <LogOut size={16} />
        </button>

        <button className="text-gray-500 hover:text-white transition-colors">
          <HelpCircle size={16} />
        </button>
      </div>
    </div>
  );
};
