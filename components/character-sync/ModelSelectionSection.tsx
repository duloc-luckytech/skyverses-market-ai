
import React from 'react';
import { ChevronDown, Brain, Globe } from 'lucide-react';
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
  availableModels, selectedModel, setSelectedModel, selectedEngine, setSelectedEngine
}) => {
  const selectClass = "w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] px-2.5 py-2 rounded-lg text-xs font-medium outline-none appearance-none focus:border-purple-500/40 transition-all cursor-pointer text-slate-700 dark:text-white/80";

  return (
    <div className="px-4 py-3 border-t border-slate-100 dark:border-white/[0.04] space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
            <Globe size={10} className="text-cyan-500" /> Source
          </p>
          <div className="relative">
            <select value={selectedEngine} onChange={e => setSelectedEngine(e.target.value)} className={selectClass}>
              <option value="gommo">Gommo</option>
              <option value="fxlab">FxLab</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#555] pointer-events-none" size={11} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
            <Brain size={10} className="text-cyan-500" /> Model
          </p>
          <div className="relative">
            <select value={selectedModel?._id || ''}
              onChange={e => { const m = availableModels.find(m => m._id === e.target.value); if (m) setSelectedModel(m); }}
              className={selectClass}>
              {availableModels.length > 0
                ? availableModels.map(m => <option key={m._id} value={m._id}>{m.name}</option>)
                : <option disabled>Đang tải...</option>}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#555] pointer-events-none" size={11} />
          </div>
        </div>
      </div>
    </div>
  );
};
