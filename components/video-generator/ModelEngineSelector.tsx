import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { PricingModel } from '../../apis/pricing';

interface ModelEngineSelectorProps {
  availableModels: PricingModel[];
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  // New props for infrastructure source
  selectedEngine: string;
  setSelectedEngine: (val: string) => void;
  ratio: string;
  cycleRatio: () => void;
  durationComponent: React.ReactNode; 
  soundEnabled: boolean;
  cycleSound: () => void;
  resolution: string;
  cycleResolution: () => void;
}

export const ModelEngineSelector: React.FC<ModelEngineSelectorProps> = ({
  availableModels,
  selectedModelId,
  setSelectedModelId,
  selectedEngine,
  setSelectedEngine,
  ratio,
  cycleRatio,
  durationComponent,
  soundEnabled,
  cycleSound,
  resolution,
  cycleResolution
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Infrastructure Source */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1">
            Source
          </label>
          <div className="relative">
            <select 
              value={selectedEngine} 
              onChange={e => setSelectedEngine(e.target.value)} 
              className="w-full bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/10 p-3 rounded-lg text-[11px] font-black uppercase outline-none appearance-none focus:border-purple-500 text-slate-800 dark:text-white transition-colors cursor-pointer"
            >
               <option value="gommo">Gommo</option>
               <option value="fxlab">FxLab</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1">
            Model Engine
          </label>
          <div className="relative">
            <select 
              value={selectedModelId} 
              onChange={e => setSelectedModelId(e.target.value)} 
              className="w-full bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/10 p-3 rounded-lg text-[11px] font-black uppercase outline-none appearance-none focus:border-purple-500 text-slate-800 dark:text-white transition-colors cursor-pointer"
            >
              {availableModels.length > 0 ? (
                availableModels.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))
              ) : (
                <option disabled>No models available</option>
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {/* Tỉ lệ */}
        <div className="space-y-1.5 text-center">
          <p className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600">Tỉ lệ</p>
          <button onClick={cycleRatio} className="w-full py-2 border rounded-sm text-[8px] font-black uppercase transition-all bg-white dark:bg-[#1c1c1e] border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-brand-blue">{ratio}</button>
        </div>

        {/* Component Lượng động */}
        {durationComponent}

        {/* Âm thanh */}
        <div className="space-y-1.5 text-center">
          <p className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600">Âm thanh</p>
          <button onClick={cycleSound} className={`w-full py-2 border rounded-sm text-[8px] font-black uppercase transition-all ${soundEnabled ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20' : 'bg-white dark:bg-[#1c1c1e] border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-brand-blue'}`}>{soundEnabled ? 'Bật' : 'Tắt'}</button>
        </div>

        {/* Độ phân giải */}
        <div className="space-y-1.5 text-center">
          <p className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600">P.Giải</p>
          <button onClick={cycleResolution} className="w-full py-2 border rounded-sm text-[8px] font-black uppercase transition-all bg-white dark:bg-[#1c1c1e] border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-brand-blue">{resolution}</button>
        </div>
      </div>
    </div>
  );
};