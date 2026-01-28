import React from 'react';
import { ChevronDown, Cpu, Loader2, Globe } from 'lucide-react';

interface ModelAISelectorProps {
  selectedModel: { id: string; name: string } | null;
  models: { id: string; name: string; cost: number }[];
  onSelect: (model: any) => void;
  selectedEngine?: string;
  onSelectEngine?: (engine: string) => void;
  variant?: 'full' | 'compact';
}

export const ModelAISelector: React.FC<ModelAISelectorProps> = ({ 
  selectedModel, 
  models, 
  onSelect,
  selectedEngine = 'gommo',
  onSelectEngine,
  variant = 'full'
}) => {
  if (!selectedModel) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg opacity-50">
        <Loader2 size={12} className="animate-spin" />
        <span className="text-[10px] font-black uppercase">Loading Models...</span>
      </div>
    );
  }

  const selectClass = "w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 p-2.5 rounded-lg text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-all appearance-none cursor-pointer text-slate-800 dark:text-white shadow-inner";
  const labelClass = "text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1 flex items-center gap-1.5 italic";

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <select 
            value={selectedEngine}
            onChange={(e) => onSelectEngine?.(e.target.value)}
            className="appearance-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-2.5 pr-7 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight outline-none focus:border-brand-blue transition-all cursor-pointer text-slate-700 dark:text-white"
          >
            <option value="gommo">Gommo</option>
            <option value="fxlab">FxLab</option>
          </select>
          <Globe size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select 
            value={selectedModel.id} 
            onChange={e => onSelect(models.find(m => m.id === e.target.value)!)} 
            className="appearance-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-2.5 pr-7 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight outline-none focus:border-brand-blue transition-all cursor-pointer text-slate-700 dark:text-white"
          >
            {models.map(m => (
              <option key={m.id} value={m.id} className="dark:bg-[#0d151c]">{m.name}</option>
            ))}
          </select>
          <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* SOURCE ENGINE SELECTOR */}
      <div className="space-y-1.5">
        <label className={labelClass}>
          <Globe size={10} /> Infrastructure Source
        </label>
        <div className="relative">
          <select 
            value={selectedEngine}
            onChange={(e) => onSelectEngine?.(e.target.value)}
            className={selectClass}
          >
            <option value="gommo" className="dark:bg-[#0d151c]">Gommo Cluster</option>
            <option value="fxlab" className="dark:bg-[#0d151c]">FxLab Node</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* MODEL SELECTOR */}
      <div className="space-y-1.5">
        <label className={labelClass}>
          <Cpu size={10} /> Model AI Engine
        </label>
        <div className="relative">
          <select 
            value={selectedModel.id} 
            onChange={e => onSelect(models.find(m => m.id === e.target.value)!)} 
            className={selectClass}
          >
            {models.map(m => (
              <option key={m.id} value={m.id} className="dark:bg-[#0d151c]">{m.name}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};