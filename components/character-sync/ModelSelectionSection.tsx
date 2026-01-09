
import React from 'react';
import { ChevronDown, Cpu, Globe } from 'lucide-react';
import { PricingModel } from '../../apis/pricing';

interface ModelSelectionSectionProps {
  availableModels: PricingModel[];
  selectedModel: PricingModel | null;
  setSelectedModel: (model: PricingModel) => void;
  selectedEngine: string;
  setSelectedEngine: (engine: string) => void;
  unitCost: number;
}

export const ModelSelectionSection: React.FC<ModelSelectionSectionProps> = ({
  availableModels,
  selectedModel,
  setSelectedModel,
  selectedEngine,
  setSelectedEngine
}) => {
  return (
    <div className="px-4 py-3 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] space-y-2">
      <div className="grid grid-cols-2 gap-3">
        {/* SOURCE SELECTION */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest flex items-center gap-1.5 italic ml-1">
            <Globe size={12} className="text-brand-blue" /> Source
          </label>
          <div className="relative group">
            <select 
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="w-full bg-white dark:bg-[#111114] border border-black/5 dark:border-white/10 p-3 rounded-lg text-xs font-bold uppercase tracking-tight outline-none appearance-none focus:border-brand-blue transition-all cursor-pointer text-slate-800 dark:text-gray-200"
            >
              <option value="gommo">Gommo</option>
              <option value="fxlab">FxLab</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>

        {/* MODEL SELECTION */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest flex items-center gap-1.5 italic ml-1">
            <Cpu size={12} className="text-brand-blue" /> Model
          </label>
          <div className="relative group">
            <select 
              value={selectedModel?._id || ''}
              onChange={(e) => {
                const model = availableModels.find(m => m._id === e.target.value);
                if (model) setSelectedModel(model);
              }}
              className="w-full bg-white dark:bg-[#111114] border border-black/5 dark:border-white/10 p-3 rounded-lg text-xs font-bold uppercase tracking-tight outline-none appearance-none focus:border-brand-blue transition-all cursor-pointer text-slate-800 dark:text-gray-200"
            >
              {availableModels.length > 0 ? (
                availableModels.map(m => (
                  <option key={m._id} value={m._id} className="bg-white dark:bg-[#111114]">
                    {m.name}
                  </option>
                ))
              ) : (
                <option disabled>Đang tải...</option>
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
