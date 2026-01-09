
import React from 'react';
import { ChevronDown, Cpu } from 'lucide-react';

interface ModelAISelectorProps {
  selectedModel: { id: string; name: string };
  models: { id: string; name: string; cost: number }[];
  onSelect: (model: any) => void;
  variant?: 'full' | 'compact';
}

export const ModelAISelector: React.FC<ModelAISelectorProps> = ({ 
  selectedModel, 
  models, 
  onSelect,
  variant = 'full'
}) => {
  if (variant === 'compact') {
    return (
      <div className="relative group">
        <select 
          value={selectedModel.id} 
          onChange={e => onSelect(models.find(m => m.id === e.target.value)!)} 
          className="appearance-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight outline-none focus:border-brand-blue transition-all cursor-pointer text-slate-700 dark:text-white"
        >
          {models.map(m => (
            <option key={m.id} value={m.id} className="dark:bg-[#0d151c]">{m.name}</option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1 flex items-center gap-2">
        <Cpu size={12} /> Model AI Engine
      </label>
      <div className="relative">
        <select 
          value={selectedModel.id} 
          onChange={e => onSelect(models.find(m => m.id === e.target.value)!)} 
          className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 p-2.5 rounded-lg text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors appearance-none cursor-pointer"
        >
          {models.map(m => (
            <option key={m.id} value={m.id} className="dark:bg-[#0d151c]">{m.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
      </div>
    </div>
  );
};
