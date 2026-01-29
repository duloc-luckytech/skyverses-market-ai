import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe, Cpu, Zap, Activity, Info, Search } from 'lucide-react';
import { PricingModel } from '../../apis/pricing';
import { ModelSelectorModal } from './ModelSelectorModal';

interface UniversalModelSelectorProps {
  availableModels: PricingModel[];
  selectedModelId: string;
  onModelChange: (id: string) => void;
  selectedEngine: string;
  onEngineChange: (val: string) => void;
  variant?: 'full' | 'compact';
  showCost?: boolean;
  currentCost?: number;
  disabled?: boolean;
  modeSelector?: React.ReactNode;
}

export const UniversalModelSelector: React.FC<UniversalModelSelectorProps> = ({
  availableModels,
  selectedModelId,
  onModelChange,
  selectedEngine,
  onEngineChange,
  variant = 'full',
  showCost = false,
  currentCost = 0,
  disabled = false,
  modeSelector
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedModel = availableModels.find(m => m._id === selectedModelId);

  const labelClass = "text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.2em] mb-2 flex items-center gap-2 px-1 italic";
  const triggerClass = "w-full bg-slate-50 dark:bg-[#16161a] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none flex items-center justify-between transition-all cursor-pointer text-slate-800 dark:text-white shadow-sm disabled:opacity-50 hover:border-brand-blue/50";

  return (
    <>
      {variant === 'compact' ? (
        <div className="flex items-center gap-2">
          <div className="relative">
            <select 
              disabled={disabled}
              value={selectedEngine}
              onChange={(e) => onEngineChange(e.target.value)}
              className="appearance-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-2.5 pr-7 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight outline-none focus:border-brand-blue transition-all cursor-pointer text-slate-700 dark:text-white"
            >
              <option value="gommo">Gommo</option>
              <option value="fxlab">FxLab</option>
              <option value="wan">Wan</option>
            </select>
            <Globe size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button 
            disabled={disabled}
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all hover:border-brand-blue text-slate-700 dark:text-white flex items-center gap-2"
          >
            {selectedModel?.name || 'Chọn Model'}
            <ChevronDown size={10} className="text-slate-400" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`grid ${modeSelector ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
            {/* SOURCE SELECTION */}
            <div className="space-y-1">
              <label className={labelClass}>
                <Globe size={12} className="text-brand-blue" /> Source
              </label>
              <div className="relative">
                <select 
                  disabled={disabled}
                  value={selectedEngine} 
                  onChange={e => onEngineChange(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-[#16161a] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none appearance-none focus:border-brand-blue transition-all cursor-pointer text-slate-800 dark:text-white shadow-sm disabled:opacity-50"
                >
                   <option value="gommo">Gommo</option>
                   <option value="fxlab">FxLab</option>
                   <option value="wan">Wan</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>

            {/* MODELS SELECTION TRIGGER */}
            <div className="space-y-1">
              <label className={labelClass}>
                <Cpu size={12} className="text-brand-blue" /> Models
              </label>
              <button 
                disabled={disabled}
                onClick={() => setIsModalOpen(true)}
                className={triggerClass}
              >
                <span className="truncate pr-4">{selectedModel?.name || 'Syncing...'}</span>
                <Search size={14} className="text-gray-400" />
              </button>
            </div>

            {/* OPTIONAL MODE SELECTOR */}
            {modeSelector && (
              <div className="space-y-1">
                <label className={labelClass}>
                  <Activity size={12} className="text-brand-blue" /> Mode
                </label>
                {modeSelector}
              </div>
            )}
          </div>

          {showCost && (
            <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                  <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Node Status: Optimal</span>
               </div>
               <div className="flex items-center gap-2 text-orange-500">
                  <Zap size={12} fill="currentColor" />
                  <span className="text-[11px] font-black italic">{currentCost} CR / Action</span>
               </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER MODAL OUTSIDE TO AVOID POSITIONING ISSUES */}
      <AnimatePresence>
        {isModalOpen && (
          <ModelSelectorModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            models={availableModels}
            selectedModelId={selectedModelId}
            onSelect={onModelChange}
          />
        )}
      </AnimatePresence>
    </>
  );
};
