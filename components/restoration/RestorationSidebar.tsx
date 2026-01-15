
import React, { useRef } from 'react';
import { Plus, ImageIcon, RefreshCw, Trash2, X } from 'lucide-react';
import { RestoreJob } from '../../hooks/useRestoration';

interface Props {
  jobs: RestoreJob[];
  activeJobId: string | null;
  onSelect: (id: string) => void;
  onUpload: (file: File) => void;
}

export const RestorationSidebar: React.FC<Props> = ({ jobs, activeJobId, onSelect, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="w-20 md:w-72 border-r border-slate-100 dark:border-white/5 flex flex-col shrink-0 bg-slate-50 dark:bg-[#0c0c0e] transition-colors overflow-y-auto no-scrollbar">
      <div className="p-6 border-b border-black/5 dark:border-white/5">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white hover:border-emerald-500 transition-all shadow-sm"
        >
          <Plus size={14} /> <span className="hidden md:inline">Tải ảnh mới</span>
        </button>
        <input 
          type="file" ref={fileInputRef} className="hidden" 
          accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} 
        />
      </div>
      <div className="p-4 space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="relative group/item">
            <button 
              onClick={() => onSelect(job.id)}
              className={`w-full aspect-square md:aspect-auto md:p-3 rounded-xl border-2 transition-all flex items-center gap-4 overflow-hidden ${activeJobId === job.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-transparent hover:bg-black/5'}`}
            >
              <div className="w-full md:w-16 h-16 rounded bg-black overflow-hidden shrink-0">
                <img src={job.original || ''} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="hidden md:block flex-grow text-left">
                <p className="text-[10px] font-black uppercase truncate text-slate-800 dark:text-white">#{job.id.slice(-4)}</p>
                <span className={`text-[7px] font-black uppercase ${job.status === 'DONE' ? 'text-emerald-500' : job.status === 'Khởi tạo' ? 'text-blue-500' : 'text-orange-500'}`}>{job.status}</span>
              </div>
            </button>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="py-20 text-center opacity-10">
            <ImageIcon className="mx-auto mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">Trống</p>
          </div>
        )}
      </div>
    </aside>
  );
};
