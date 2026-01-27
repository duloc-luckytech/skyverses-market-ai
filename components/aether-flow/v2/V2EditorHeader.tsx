
import React from 'react';
import { Workflow, X, Activity, Cpu } from 'lucide-react';
import { WorkflowTemplate } from '../../../hooks/useAetherFlow';

interface V2EditorHeaderProps {
  template: WorkflowTemplate | null;
  nodeCount: number;
  onClose: () => void;
}

export const V2EditorHeader: React.FC<V2EditorHeaderProps> = ({ template, nodeCount, onClose }) => (
  <div className="h-16 md:h-20 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-8 bg-white dark:bg-[#0d0d10] shrink-0 z-50 transition-colors">
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-4">
         <div className="w-10 h-10 bg-indigo-600 rounded-none flex items-center justify-center text-white shadow-lg">
            <Workflow size={22} />
          </div>
         <div className="space-y-0.5">
            <h2 className="text-sm md:text-base font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">BIÊN TẬP QUY TRÌNH</h2>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">CÔNG CỤ THIẾT KẾ v2.0</p>
         </div>
      </div>
      
      <div className="hidden lg:flex items-center gap-10 border-l border-black/5 dark:border-white/10 pl-10">
         <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Kịch bản đang dùng</span>
            <span className="text-[12px] font-black text-slate-800 dark:text-zinc-200 uppercase italic truncate max-w-[200px]">{template?.name || 'TỰ THIẾT KẾ'}</span>
         </div>
         <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Cấu trúc</span>
            <span className="text-[12px] font-black text-indigo-600 dark:text-indigo-500 uppercase">{nodeCount} Khối xử lý</span>
         </div>
         <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Máy chủ</span>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none animate-pulse"></div>
               <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-500 uppercase italic">Kết nối ổn định</span>
            </div>
         </div>
      </div>
    </div>

    <div className="flex items-center gap-4">
       <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-none">
          <Cpu size={14} className="text-indigo-500" />
          <span className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">ID: {template?.templateId || 'KHÔNG XÁC ĐỊNH'}</span>
       </div>
       <button 
         onClick={onClose} 
         className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-red-600 hover:text-white rounded-none transition-all border border-black/5 dark:border-white/10 group"
       >
          <X size={20} className="group-hover:rotate-90 transition-transform" />
       </button>
    </div>
  </div>
);
