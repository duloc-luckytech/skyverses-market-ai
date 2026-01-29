
import React from 'react';
import { Hash } from 'lucide-react';
import { RATIOS, RESOLUTIONS } from '../../hooks/useImageGenerator';
import { UniversalModelSelector } from '../common/UniversalModelSelector';

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
  // Hỗ trợ engine nếu cần thiết cho quy trình image
  selectedEngine?: string;
  onSelectEngine?: (val: string) => void;
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
  setQuantity,
  selectedEngine = 'gommo',
  onSelectEngine = () => {}
}) => {
  return (
    <div className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
      <UniversalModelSelector 
        availableModels={availableModels.map(m => m.raw)}
        selectedModelId={selectedModel?.id || ''}
        onModelChange={(id) => setSelectedModel(availableModels.find(m => m.id === id))}
        selectedEngine={selectedEngine}
        onEngineChange={onSelectEngine}
      />

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
          </div>
        </div>
      </div>
    </div>
  );
};
