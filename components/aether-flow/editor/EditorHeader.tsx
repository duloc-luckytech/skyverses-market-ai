
import React from 'react';
import { Workflow, X } from 'lucide-react';
import { WorkflowTemplate } from '../../../hooks/useAetherFlow';

interface EditorHeaderProps {
  template: WorkflowTemplate | null;
  nodeCount: number;
  onClose: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ template, nodeCount, onClose }) => (
  <div className="h-16 md:h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl shrink-0 z-50">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
         <div className="p-2 bg-indigo-500 rounded-lg shadow-lg">
            <Workflow size={20} className="text-white" />
         </div>
         <div className="space-y-0.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">TRÌNH BIÊN TẬP QUY TRÌNH</h2>
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest leading-none">V-Engine v1.4</p>
         </div>
      </div>
      <div className="h-8 w-px bg-white/10 hidden md:block"></div>
      <div className="hidden md:flex items-center gap-8">
         <div className="flex flex-col">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Bản mẫu</span>
            <span className="text-[11px] font-bold text-white uppercase tracking-tight">{template?.name}</span>
         </div>
         <div className="flex flex-col">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Cấu trúc</span>
            <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-tight">{nodeCount} Khối xử lý</span>
         </div>
      </div>
    </div>

    <div className="flex items-center gap-4">
       <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Uplink Stable</span>
       </div>
       <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-red-500 hover:text-white rounded-full transition-all border border-white/5">
          <X size={20} />
       </button>
    </div>
  </div>
);
