
import React from 'react';
import { Users, HelpCircle, Plus, X, User, RefreshCw, Loader2 } from 'lucide-react';
import { CharacterSlot } from '../../hooks/useCharacterSync';

interface RegistrySectionProps {
  slots: CharacterSlot[];
  updateSlot: (idx: number, updates: Partial<CharacterSlot>) => void;
  onOpenLibrary: (idx: number) => void;
  onTriggerUpload: (idx: number) => void;
  uploadingIdx: number | null;
  onOpenTutorial: () => void;
}

export const RegistrySection: React.FC<RegistrySectionProps> = ({
  slots, updateSlot, onOpenLibrary, onTriggerUpload, uploadingIdx, onOpenTutorial
}) => {
  return (
    <div className="px-4 py-4 border-b border-slate-100 dark:border-white/[0.04] space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
          <Users size={11} className="text-purple-400" /> Nhân vật
        </p>
        <button onClick={onOpenTutorial}
          className="flex items-center gap-1 px-2 py-1 text-[9px] font-semibold text-purple-500 hover:bg-purple-500/10 rounded-md transition-all">
          <HelpCircle size={10} /> Hướng dẫn
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 snap-x">
        {slots.map((slot, idx) => {
          const isUploading = uploadingIdx === idx;
          return (
            <div key={slot.id} className="flex flex-col gap-1.5 shrink-0 w-[68px] relative group/slot snap-start">
              <div onClick={() => !isUploading && onOpenLibrary(idx)}
                className={`aspect-[3/4] rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center relative overflow-hidden
                  ${slot.url
                    ? 'border-purple-500/40 shadow-sm'
                    : 'border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] hover:border-purple-500/30'}`}>
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1">
                    <Loader2 size={16} className="text-purple-400 animate-spin" />
                    <span className="text-[6px] font-bold text-purple-400">Syncing</span>
                  </div>
                ) : slot.url ? (
                  <>
                    <img src={slot.url} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center">
                      <RefreshCw size={16} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-40 group-hover/slot:opacity-80 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center">
                      <User size={14} className="text-slate-400 dark:text-purple-400" />
                    </div>
                    <span className="text-[7px] font-semibold text-slate-400">{idx + 1}</span>
                  </div>
                )}

                {slot.url && !isUploading && (
                  <button onClick={e => { e.stopPropagation(); updateSlot(idx, { url: null }); }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md shadow-lg z-10 lg:opacity-0 lg:group-hover/slot:opacity-100 transition-all active:scale-90">
                    <X size={8} strokeWidth={3} />
                  </button>
                )}
                {!slot.url && !isUploading && (
                  <button onClick={e => { e.stopPropagation(); onTriggerUpload(idx); }}
                    className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover/slot:opacity-100 transition-all flex items-center justify-center z-10">
                    <Plus size={20} className="text-purple-500" />
                  </button>
                )}
              </div>
              <input value={slot.name}
                onChange={e => updateSlot(idx, { name: e.target.value.toUpperCase() })}
                disabled={isUploading}
                className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.04] rounded-md py-1 px-1.5 text-[9px] font-bold text-center uppercase text-slate-700 dark:text-white/80 focus:border-purple-500/30 outline-none w-full truncate transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 disabled:opacity-30"
                placeholder="TÊN..." />
            </div>
          );
        })}
      </div>

      <p className="text-[8px] text-slate-400 dark:text-slate-500 leading-relaxed px-0.5">
        Tên riêng biệt giúp AI giữ định danh nhân vật xuyên suốt kịch bản.
      </p>
    </div>
  );
};
