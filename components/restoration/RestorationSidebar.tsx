
import React, { useRef } from 'react';
import { Plus, ImageIcon, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { RestoreJob } from '../../hooks/useRestoration';

interface Props {
  jobs: RestoreJob[];
  activeJobId: string | null;
  onSelect: (id: string) => void;
  onUpload: (file: File) => void;
}

const statusConfig = {
  'DONE': { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Hoàn tất' },
  'Khởi tạo': { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Sẵn sàng' },
  'PROCESSING': { icon: Loader2, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Đang xử lý' },
  'ERROR': { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Lỗi' }
};

export const RestorationSidebar: React.FC<Props> = ({ jobs, activeJobId, onSelect, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="w-20 md:w-72 border-r border-slate-100 dark:border-white/[0.04] flex flex-col shrink-0 bg-white dark:bg-[#0a0b0f] transition-colors duration-500 overflow-y-auto no-scrollbar relative z-10">
      
      {/* Upload Section */}
      <div className="p-4 md:p-5 border-b border-slate-100 dark:border-white/[0.04]">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/[0.06] dark:to-teal-500/[0.06] border border-emerald-200/60 dark:border-emerald-500/15 rounded-xl flex items-center justify-center gap-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400 hover:border-emerald-400 dark:hover:border-emerald-500/30 transition-all group shadow-sm hover:shadow-md hover:shadow-emerald-500/5"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={14} strokeWidth={3} />
          </div>
          <span className="hidden md:inline">Tải ảnh mới</span>
        </button>
        <input 
          type="file" ref={fileInputRef} className="hidden" 
          accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} 
        />
      </div>

      {/* Job Queue Label */}
      {jobs.length > 0 && (
        <div className="hidden md:flex items-center gap-2 px-5 py-3 border-b border-slate-50 dark:border-white/[0.03]">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-gray-600">Hàng đợi</span>
          <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">{jobs.length}</span>
        </div>
      )}

      {/* Jobs List */}
      <div className="p-3 md:p-4 space-y-2 flex-grow">
        {jobs.map((job) => {
          const isActive = activeJobId === job.id;
          const status = statusConfig[job.status] || statusConfig['Khởi tạo'];
          const StatusIcon = status.icon;
          
          return (
            <button 
              key={job.id}
              onClick={() => onSelect(job.id)}
              className={`w-full rounded-xl border transition-all duration-200 flex items-center gap-3 overflow-hidden group ${
                isActive 
                  ? 'border-emerald-500/40 bg-emerald-500/[0.04] shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20' 
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:border-slate-100 dark:hover:border-white/[0.06]'
              } ${window.innerWidth < 768 ? 'p-1.5 aspect-square flex-col justify-center' : 'p-2.5'}`}
            >
              {/* Thumbnail */}
              <div className={`${window.innerWidth < 768 ? 'w-full h-full' : 'w-14 h-14'} rounded-lg bg-slate-100 dark:bg-black/40 overflow-hidden shrink-0 border border-slate-100 dark:border-white/[0.06] ${isActive ? 'ring-1 ring-emerald-500/30' : ''}`}>
                <img src={job.original || ''} className="w-full h-full object-cover" alt="" />
              </div>
              
              {/* Info */}
              <div className="hidden md:flex flex-col flex-grow text-left overflow-hidden gap-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-slate-700 dark:text-white/80 tracking-tight truncate">
                    Task #{job.id.slice(-4)}
                  </p>
                  <span className="text-[7px] text-slate-300 dark:text-gray-600 font-bold">{job.timestamp}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIcon size={10} className={`${status.color} ${job.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                  <span className={`text-[8px] font-black uppercase tracking-wider ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}

        {/* Empty State */}
        {jobs.length === 0 && (
          <div className="py-16 md:py-24 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] flex items-center justify-center">
              <ImageIcon size={24} strokeWidth={1.5} className="text-slate-200 dark:text-white/10" />
            </div>
            <div className="hidden md:block space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-gray-600">Chưa có ảnh nào</p>
              <p className="text-[8px] font-bold text-slate-200 dark:text-gray-700 uppercase tracking-wider">Tải ảnh lên để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
