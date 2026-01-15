
import React from 'react';
import { ShieldCheck, Download, Edit3, Maximize2, Share2, Target } from 'lucide-react';
import { RESTORATION_PRESETS, RestoreJob } from '../../hooks/useRestoration';

interface Props {
  selectedPresetId: string;
  onPresetChange: (id: string) => void;
  activeJob: RestoreJob | undefined;
  onDownload: (url: string) => void;
  onEdit: (url: string) => void;
}

export const RestorationControls: React.FC<Props> = ({ 
  selectedPresetId, onPresetChange, activeJob, onDownload, onEdit 
}) => {
  return (
    <aside className="w-20 md:w-[340px] border-l border-slate-200 dark:border-white/5 flex flex-col shrink-0 bg-white dark:bg-[#0d0e12] transition-colors duration-500 p-4 md:p-8 space-y-8 overflow-y-auto no-scrollbar">
      <div className="space-y-6">
        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic flex items-center gap-2">
          <Target size={14} className="text-brand-blue" />
          <span className="hidden md:inline">Kịch bản phục chế</span>
        </label>
        <div className="space-y-3">
          {RESTORATION_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => onPresetChange(preset.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-1 ${
                selectedPresetId === preset.id 
                ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 shadow-lg' 
                : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-gray-400 hover:border-slate-200 dark:hover:border-white/10'
              }`}
            >
              <p className="text-[11px] font-black uppercase tracking-tight leading-none">
                {window.innerWidth < 768 ? preset.label.charAt(0) : preset.label}
              </p>
              {window.innerWidth >= 768 && preset.id === selectedPresetId && (
                <p className="text-[8px] font-bold uppercase opacity-60 line-clamp-1 italic">{preset.prompt}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block p-6 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl space-y-3 mt-auto">
        <div className="flex items-center gap-2 text-brand-blue">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-black uppercase italic tracking-widest">Neural_Audit</span>
        </div>
        <p className="text-[9px] text-gray-500 dark:text-gray-500 font-bold uppercase leading-relaxed italic">
          Hệ thống sẽ giữ lại cấu trúc nguyên bản và chỉ tái tạo các pixel bị tổn thương.
        </p>
      </div>
    </aside>
  );
};
