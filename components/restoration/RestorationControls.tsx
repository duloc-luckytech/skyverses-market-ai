
import React from 'react';
import { ShieldCheck, Download, Edit3, Maximize2, Share2, Target, CheckCircle2, Sparkles, Info } from 'lucide-react';
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
    <aside className="w-20 md:w-[320px] border-l border-slate-100 dark:border-white/[0.04] flex flex-col shrink-0 bg-white dark:bg-[#0a0b0f] transition-colors duration-500 overflow-y-auto no-scrollbar relative z-10">
      
      {/* Section Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 dark:border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/[0.06] dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Target size={15} />
          </div>
          <div className="hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-800 dark:text-white/80">Kịch bản phục chế</p>
            <p className="text-[8px] font-bold text-slate-300 dark:text-gray-600 uppercase tracking-wider mt-0.5">Restoration Strategy</p>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="p-3 md:p-4 space-y-2 flex-grow">
        {RESTORATION_PRESETS.map((preset, index) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onPresetChange(preset.id)}
              className={`w-full rounded-xl border transition-all duration-200 text-left overflow-hidden group ${
                isSelected 
                  ? 'border-emerald-500/30 bg-emerald-500/[0.04] shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/15' 
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:border-slate-100 dark:hover:border-white/[0.06]'
              } ${window.innerWidth < 768 ? 'p-2 flex items-center justify-center' : 'p-3.5'}`}
            >
              {window.innerWidth < 768 ? (
                /* Mobile — show just index */
                <span className={`text-[10px] font-black ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              ) : (
                /* Desktop — full layout */
                <div className="flex items-start gap-3">
                  {/* Number indicator */}
                  <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[9px] font-black transition-colors ${
                    isSelected 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                      : 'bg-slate-50 dark:bg-white/[0.04] text-slate-300 dark:text-gray-600 border border-slate-100 dark:border-white/[0.06]'
                  }`}>
                    {isSelected ? <CheckCircle2 size={12} /> : String(index + 1).padStart(2, '0')}
                  </div>
                  
                  <div className="flex-grow min-w-0 space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-tight leading-snug ${
                      isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-gray-300'
                    }`}>
                      {preset.label}
                    </p>
                    {isSelected && (
                      <p className="text-[8px] font-bold text-slate-400 dark:text-gray-500 leading-relaxed line-clamp-2">
                        {preset.prompt.slice(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ Bottom Info Card ═══ */}
      <div className="hidden md:block p-4 border-t border-slate-100 dark:border-white/[0.04]">
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/[0.04] dark:to-teal-500/[0.04] border border-emerald-100 dark:border-emerald-500/10 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={14} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400">Neural Audit</span>
          </div>
          <p className="text-[9px] text-slate-500 dark:text-gray-500 font-medium leading-relaxed">
            Hệ thống giữ lại cấu trúc nguyên bản và chỉ tái tạo các pixel bị tổn thương. Dữ liệu được bảo mật trong VPC riêng.
          </p>
          <div className="flex gap-3 pt-1">
            {['E2E Encrypted', 'Auto-Delete'].map(tag => (
              <span key={tag} className="text-[7px] font-black uppercase tracking-wider text-emerald-600/60 dark:text-emerald-400/50 bg-emerald-500/[0.06] px-2 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
