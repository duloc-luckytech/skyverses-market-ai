
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, HelpCircle, Plus, X, MonitorIcon, FolderOpen, User, RefreshCw, Loader2 } from 'lucide-react';
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
    <div className="p-4 md:p-6 border-b border-black/5 dark:border-white/5 bg-slate-100/30 dark:bg-[#08080a] space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <Users size={14} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white/40 italic">Nhân vật</h3>
        </div>
        <button 
          onClick={onOpenTutorial} 
          className="px-3 py-1.5 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[9px] font-black uppercase tracking-tight text-purple-500 hover:brightness-110 shadow-sm transition-all flex items-center gap-1.5"
        >
          <HelpCircle size={12} /> Hướng dẫn
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 px-1 snap-x">
        {slots.map((slot, idx) => {
          const isUploading = uploadingIdx === idx;
          
          return (
            <div key={slot.id} className="flex flex-col gap-2 shrink-0 w-20 md:w-16 relative group/slot snap-start">
              <div 
                onClick={() => !isUploading && onOpenLibrary(idx)}
                className={`aspect-[3/4] rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden shadow-sm ${slot.url ? 'border-brand-blue shadow-lg shadow-brand-blue/10' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#1a1a1e] hover:border-brand-blue/40'}`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1">
                    <Loader2 size={18} className="text-brand-blue animate-spin" />
                    <span className="text-[6px] font-black uppercase text-brand-blue">Syncing</span>
                  </div>
                ) : slot.url ? (
                  <>
                    <img src={slot.url} className="w-full h-full object-cover transition-all duration-500" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center">
                      <RefreshCw size={18} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-40 group-hover/slot:opacity-100 transition-all">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                      <User size={16} className="text-slate-400 dark:text-brand-blue" />
                    </div>
                    <span className="text-[7px] font-black uppercase text-slate-400">Slot {idx + 1}</span>
                  </div>
                )}
                
                {slot.url && !isUploading && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateSlot(idx, { url: null }); }} 
                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg shadow-lg z-10 lg:opacity-0 lg:group-hover/slot:opacity-100 transition-all active:scale-90"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                )}

                {!slot.url && !isUploading && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onTriggerUpload(idx); }}
                    className="absolute inset-0 w-full h-full bg-brand-blue/5 opacity-0 group-hover/slot:opacity-100 transition-all flex items-center justify-center z-10"
                    title="Tải lên từ máy"
                  >
                    <Plus size={24} className="text-brand-blue" />
                  </button>
                )}
              </div>
              
              <div className="relative">
                <input 
                  value={slot.name} 
                  onChange={(e) => updateSlot(idx, { name: e.target.value.toUpperCase() })}
                  disabled={isUploading}
                  className="bg-black/5 dark:bg-white/5 border border-transparent focus:border-brand-blue/20 rounded-md py-1.5 px-1.5 text-[9px] font-black text-center uppercase text-slate-900 dark:text-white focus:text-brand-blue outline-none w-full truncate tracking-tight transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600 disabled:opacity-30" 
                  placeholder="NAME..."
                />
              </div>
            </div>
          );
        })}
        <div className="shrink-0 w-4"></div>
      </div>
      
      <div className="px-1">
        <p className="text-[8px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest italic leading-relaxed">
          Tên riêng biệt giúp AI giữ định danh nhân vật xuyên suốt kịch bản.
        </p>
      </div>
    </div>
  );
};
