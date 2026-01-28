
import React from 'react';
import { 
  Workflow, X, Upload, CloudDownload, Languages, Trash2, 
  RefreshCw, LayoutGrid, Edit3, Download as DownloadIcon, ChevronDown
} from 'lucide-react';
import { WorkflowTemplate } from '../../../hooks/useAetherFlow';

interface V2EditorHeaderProps {
  template: WorkflowTemplate | null;
  nodeCount: number;
  onClose: () => void;
}

export const V2EditorHeader: React.FC<V2EditorHeaderProps> = ({ template, onClose }) => {
  const IconButton = ({ icon: Icon, active = false, danger = false }: any) => (
    <button className={`p-2 rounded-lg transition-all flex items-center gap-2 group ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
        : danger 
          ? 'text-slate-400 hover:text-red-500 hover:bg-red-500/5'
          : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
    }`}>
      <Icon size={18} />
    </button>
  );

  return (
    <div className="h-16 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-[#0d0d10] shrink-0 z-50 transition-colors shadow-sm">
      {/* LEFT: Branding & Template Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-indigo-600 rounded-none flex items-center justify-center text-white shadow-lg">
              <Workflow size={20} />
            </div>
           <div className="hidden sm:block space-y-0.5">
              <h2 className="text-[12px] font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none italic">Biên tập quy trình</h2>
              <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none truncate max-w-[150px]">
                {template?.name || 'TỰ THIẾT KẾ'}
              </p>
           </div>
        </div>
      </div>

      {/* CENTER: Main Actions Merged */}
      <div className="flex items-center gap-1 bg-slate-50 dark:bg-black/20 p-1 border border-black/5 dark:border-white/5 rounded-xl">
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-all rounded-lg mr-2 group">
          <DownloadIcon size={16} className="text-slate-500 dark:text-white group-hover:text-indigo-500 transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Download</span>
        </button>

        <IconButton icon={Upload} />
        <IconButton icon={CloudDownload} active={true} />
        
        <div className="h-6 w-px bg-black/5 dark:bg-white/5 mx-1"></div>

        <div className="relative group px-2">
          <button className="flex items-center gap-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
            <Languages size={18} />
            <span className="text-[9px] font-black bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-sm">EN</span>
          </button>
        </div>

        <IconButton icon={Trash2} danger={true} />
        <IconButton icon={RefreshCw} />
        
        <div className="h-6 w-px bg-black/5 dark:bg-white/5 mx-1"></div>

        <IconButton icon={LayoutGrid} />
        <IconButton icon={Edit3} />
      </div>

      {/* RIGHT: Community & Close */}
      <div className="flex items-center gap-4">
        <button className="p-2.5 bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2] hover:text-white transition-all rounded-xl shadow-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </button>
        <button onClick={onClose} className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white transition-all rounded-full border border-black/5 dark:border-white/5">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
