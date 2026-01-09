
import React from 'react';
import { ChevronDown, Hash } from 'lucide-react';
import { RATIOS, RESOLUTIONS } from '../../hooks/useImageGenerator';

interface ModelEngineSettingsProps {
  availableModels: any[];
  selectedModel: any;
  setSelectedModel: (val: any) => void;
  selectedRatio: string;
  setSelectedRatio: (val: string) => void;
  selectedRes: string;
  setSelectedRes: (val: string) => void;
  quantity: number;
  setQuantity: (val: number) => void;
}

export const ModelEngineSettings: React.FC<ModelEngineSettingsProps> = ({
  availableModels,
  selectedModel,
  setSelectedModel,
  selectedRatio,
  setSelectedRatio,
  selectedRes,
  setSelectedRes,
  quantity,
  setQuantity
}) => {
  return (
    <div className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
      <div className="space-y-2">
        <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1">
          Model Engine
        </label>
        <div className="relative">
          <select 
            value={selectedModel?.id || ''} 
            onChange={e => setSelectedModel(availableModels.find(m => m.id === e.target.value)!)} 
            className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2.5 rounded-lg text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white appearance-none cursor-pointer"
          >
            {availableModels.length > 0 ? (
              availableModels.map(m => <option key={m.id} value={m.id} className="bg-white dark:bg-[#111]">{m.name}</option>)
            ) : (
              <option disabled>Loading models...</option>
            )}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <label className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1">
            Tỷ lệ
          </label>
          <div className="relative">
            <select 
              value={selectedRatio} 
              onChange={e => setSelectedRatio(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2 rounded-lg text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white appearance-none cursor-pointer"
            >
              {RATIOS.map(r => <option key={r} value={r} className="bg-white dark:bg-[#111]">{r}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1">
            Độ phân giải
          </label>
          <div className="relative">
            <select 
              value={selectedRes} 
              onChange={e => setSelectedRes(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2 rounded-lg text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white appearance-none cursor-pointer"
            >
              {RESOLUTIONS.map(r => <option key={r} value={r} className="bg-white dark:bg-[#111]">{r.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1">
            Số lượng
          </label>
          <div className="relative">
            <input 
              type="number" min="1" max="4"
              value={quantity} 
              onChange={e => setQuantity(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2 rounded-lg text-[10px] font-black text-center outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white"
            />
            <Hash size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
