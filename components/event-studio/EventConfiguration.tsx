
import React from 'react';
import { Settings, ChevronDown, Cpu, Maximize2, Zap } from 'lucide-react';
import { COMMON_STUDIO_CONSTANTS } from '../../constants/event-configs';

interface EventConfigurationProps {
  selectedModel: any;
  setSelectedModel: (m: any) => void;
  selectedRatio: string;
  setSelectedRatio: (r: string) => void;
  selectedRes: string;
  setSelectedRes: (r: string) => void;
  usagePreference: string | null;
  credits: number;
  onShowResource: () => void;
}

export const EventConfiguration: React.FC<EventConfigurationProps> = ({
  selectedModel, setSelectedModel, selectedRatio, setSelectedRatio,
  selectedRes, setSelectedRes, usagePreference, credits, onShowResource
}) => {
  const selectStyle = "w-full bg-slate-50 dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-[10px] font-black uppercase outline-none appearance-none cursor-pointer transition-colors focus:border-brand-blue";
  const labelStyle = "text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1 italic flex items-center gap-2";

  return (
    <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelStyle}><Cpu size={12} className="text-brand-blue"/> Model Engine</label>
          <div className="relative">
            <select 
              value={selectedModel.id} 
              onChange={e => setSelectedModel(COMMON_STUDIO_CONSTANTS.AI_MODELS.find(m => m.id === e.target.value)!)}
              className={selectStyle}
            >
              {COMMON_STUDIO_CONSTANTS.AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className={labelStyle}><Maximize2 size={12} className="text-brand-blue"/> Tỉ lệ khung hình</label>
          <div className="relative">
            <select value={selectedRatio} onChange={e => setSelectedRatio(e.target.value)} className={selectStyle}>
              {COMMON_STUDIO_CONSTANTS.RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label className={labelStyle}><Zap size={12} className="text-brand-blue"/> Chất lượng kết xuất</label>
          <div className="relative">
            <select value={selectedRes} onChange={e => setSelectedRes(e.target.value)} className={selectStyle}>
              {COMMON_STUDIO_CONSTANTS.QUALITY_MODES.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 p-4 rounded-2xl transition-colors">
         <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest leading-none mb-1">Nguồn tài nguyên</span>
            <span className={`text-[10px] font-black uppercase tracking-tight leading-none ${usagePreference === 'key' ? 'text-purple-500' : 'text-brand-blue'}`}>
                {usagePreference === 'credits' ? `Credits Ledger` : 'Personal API Key'}
            </span>
         </div>
         <button onClick={onShowResource} className="p-2 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-brand-blue transition-all active:scale-95 shadow-sm">
            <Settings size={14} />
         </button>
      </div>
    </div>
  );
};
