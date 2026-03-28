
import React from 'react';
import { Settings, ChevronDown, Cpu, Maximize2, Zap, Layers, Sparkles } from 'lucide-react';
import { COMMON_STUDIO_CONSTANTS } from '../../constants/event-configs';

interface EventConfigurationProps {
  availableModels: any[];
  selectedModel: any;
  setSelectedModel: (m: any) => void;
  selectedRatio: string;
  setSelectedRatio: (r: string) => void;
  selectedRes: string;
  setSelectedRes: (r: string) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  usagePreference: string | null;
  credits: number;
  onShowResource: () => void;
  currentUnitCost: number;
}

export const EventConfiguration: React.FC<EventConfigurationProps> = ({
  availableModels, selectedModel, setSelectedModel, selectedRatio, setSelectedRatio,
  selectedRes, setSelectedRes, quantity, setQuantity, usagePreference, credits, onShowResource, currentUnitCost
}) => {
  const selectStyle = "w-full bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-3 text-[10px] font-bold outline-none appearance-none cursor-pointer transition-all focus:border-brand-blue/40 focus:ring-1 focus:ring-brand-blue/10 text-slate-700 dark:text-white/80";
  const labelStyle = "text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-0.5 flex items-center gap-1.5";

  return (
    <div className="space-y-5 pt-5 border-t border-black/[0.04] dark:border-white/[0.04]">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <Settings size={13} className="text-brand-blue" />
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cấu hình</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className={labelStyle}><Cpu size={10} className="text-brand-blue"/> Engine</label>
          <div className="relative">
            <select 
              value={selectedModel?.id || ''} 
              onChange={e => {
                const found = availableModels.find(m => m.id === e.target.value);
                if (found) setSelectedModel(found);
              }}
              className={selectStyle}
            >
              {availableModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelStyle}><Maximize2 size={10} className="text-brand-blue"/> Tỉ lệ</label>
          <div className="relative">
            <select value={selectedRatio} onChange={e => setSelectedRatio(e.target.value)} className={selectStyle}>
              {COMMON_STUDIO_CONSTANTS.RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className={labelStyle}><Zap size={10} className="text-brand-blue"/> Chi phí/ảnh</label>
          <div className="p-3 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-[10px] font-bold text-brand-blue">
            {currentUnitCost} CR / ảnh
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelStyle}><Layers size={10} className="text-brand-blue"/> Số ảnh</label>
          <input 
            type="number" 
            min="1" 
            max="4" 
            value={quantity} 
            onChange={e => setQuantity(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
            className="w-full bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-3 text-[10px] font-bold outline-none focus:border-brand-blue/40 focus:ring-1 focus:ring-brand-blue/10 text-slate-700 dark:text-white/80"
          />
        </div>
      </div>

      {/* Resource Info */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] p-3.5 rounded-xl transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${usagePreference === 'key' ? 'bg-purple-500/10 text-purple-500' : 'bg-brand-blue/10 text-brand-blue'}`}>
            <Sparkles size={14} />
          </div>
          <div>
            <span className="text-[8px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Tài nguyên</span>
            <span className={`text-[10px] font-bold leading-none ${usagePreference === 'key' ? 'text-purple-500' : 'text-brand-blue'}`}>
              {usagePreference === 'credits' ? `${(credits || 0).toLocaleString()} CR` : 'API Key'}
            </span>
          </div>
        </div>
        <button onClick={onShowResource} className="p-2 bg-white dark:bg-white/[0.03] rounded-lg border border-black/[0.06] dark:border-white/[0.06] text-slate-400 hover:text-brand-blue transition-all active:scale-95 shadow-sm">
          <Settings size={13} />
        </button>
      </div>
    </div>
  );
};
