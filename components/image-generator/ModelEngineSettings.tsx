import React from 'react';
import { ChevronDown, Globe, Cpu } from 'lucide-react';
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO } from '../../constants/media-presets';
import { getResolutionsFromPricing } from '../../utils/pricing-helpers';
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
  selectedEngine?: string;
  onSelectEngine?: (val: string) => void;
  selectedMode: string;
  setSelectedMode: (val: string) => void;
  activeMode?: 'SINGLE' | 'BATCH'; // Added to handle conditional quantity display
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
  selectedEngine = 'fxlab',
  onSelectEngine = () => {},
  selectedMode,
  setSelectedMode,
  activeMode = 'SINGLE'
}) => {
  const dynamicResolutions = React.useMemo(() => {
    return getResolutionsFromPricing(selectedModel?.raw?.pricing);
  }, [selectedModel]);

  const dynamicRatios = React.useMemo(() => {
    if (selectedModel?.raw?.aspectRatios && selectedModel.raw.aspectRatios.length > 0) {
      return selectedModel.raw.aspectRatios;
    }
    return ASPECT_RATIOS;
  }, [selectedModel]);

  return (
    <div className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
      <UniversalModelSelector 
        availableModels={availableModels.map(m => m.raw)}
        selectedModelId={selectedModel?.id || ''}
        onModelChange={(id) => setSelectedModel(availableModels.find(m => m.id === id))}
        selectedEngine={selectedEngine}
        onEngineChange={onSelectEngine}
        modeSelector={
          <div className="relative">
            <select 
              value={selectedMode} 
              onChange={e => setSelectedMode(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-[#16161a] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none appearance-none focus:border-brand-blue transition-all cursor-pointer text-slate-800 dark:text-white shadow-sm"
            >
              {selectedModel?.raw?.modes && selectedModel.raw.modes.length > 0 ? (
                selectedModel.raw.modes.map((m: string) => (
                  <option key={m} value={m}>{m.toUpperCase()}</option>
                ))
              ) : (
                <option value={selectedMode}>{selectedMode.toUpperCase() || 'RELAXED'}</option>
              )}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
          </div>
        }
      />

      <div className={`grid ${activeMode === 'SINGLE' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
        <div className="space-y-2">
          <label className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1 italic">
            Tỷ lệ
          </label>
          <div className="relative">
            <select 
              value={selectedRatio} 
              onChange={e => setSelectedRatio(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2 rounded-lg text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white appearance-none cursor-pointer shadow-sm"
            >
              {dynamicRatios.map((r: string) => <option key={r} value={r} className="bg-white dark:bg-[#111]">{r}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1 italic">
            Độ phân giải
          </label>
          <div className="relative">
            <select 
              value={selectedRes} 
              onChange={e => setSelectedRes(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2 rounded-lg text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white appearance-none cursor-pointer shadow-sm"
            >
              {dynamicResolutions.length > 0 ? (
                dynamicResolutions.map(r => <option key={r} value={r} className="bg-white dark:bg-[#111]">{r.toUpperCase()}</option>)
              ) : (
                <option value="">N/A</option>
              )}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
          </div>
        </div>

        {activeMode === 'SINGLE' && (
          <div className="space-y-2 animate-in fade-in duration-300">
            <label className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1 italic">
              Số lượng
            </label>
            <div className="relative">
              <input 
                type="number" min="1" max="4"
                value={quantity} 
                onChange={e => setQuantity(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-2 rounded-lg text-[10px] font-black text-center outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};