import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Added Zap and Loader2 to the imports
import { Settings2, ChevronDown, Settings, Zap, Loader2 } from 'lucide-react';
import { UniversalModelSelector } from '../common/UniversalModelSelector';
import { DurationSelector } from './DurationSelector';
import { PricingModel } from '../../apis/pricing';

interface ConfigurationPanelProps {
  availableModels: PricingModel[];
  selectedModelObj: PricingModel | null;
  setSelectedModelObj: (model: PricingModel | null) => void;
  selectedEngine: string;
  setSelectedEngine: (val: string) => void;
  ratio: '16:9' | '9:16';
  cycleRatio: () => void;
  duration: string;
  cycleDuration: () => void;
  soundEnabled: boolean;
  cycleSound: () => void;
  resolution: string;
  cycleResolution: () => void;
  usagePreference: 'credits' | 'key' | null;
  credits: number;
  setShowResourceModal: (val: boolean) => void;
  currentTotalCost: number;
  handleGenerate: () => void;
  isGenerating: boolean;
  isGenerateDisabled: boolean;
  generateTooltip: string | null;
  activeMode: 'SINGLE' | 'MULTI' | 'AUTO';
  autoTasksCount: number;
  multiFramesCount: number;
  isMobileExpanded: boolean;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = (props) => {
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(true);

  return (
    <div className={`shrink-0 bg-slate-50 dark:bg-black/40 border-t border-slate-200 dark:border-white/5 backdrop-blur-md ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
      <button 
        onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
        className="lg:hidden w-full flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5"
      >
        <div className="flex items-center gap-3">
          <Settings2 size={16} className="text-brand-blue" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400">Tùy chọn cấu hình</span>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${!isConfigCollapsed ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {(!isConfigCollapsed || window.innerWidth >= 1024) && (
          <motion.div 
            initial={window.innerWidth < 1024 ? { height: 0, opacity: 0 } : undefined}
            animate={window.innerWidth < 1024 ? { height: 'auto', opacity: 1 } : undefined}
            exit={window.innerWidth < 1024 ? { height: 0, opacity: 0 } : undefined}
            className="overflow-hidden p-6 space-y-6"
          >
            <UniversalModelSelector 
              availableModels={props.availableModels}
              selectedModelId={props.selectedModelObj?._id || ''}
              onModelChange={(id) => props.setSelectedModelObj(props.availableModels.find(m => m._id === id) || null)}
              selectedEngine={props.selectedEngine}
              onEngineChange={props.setSelectedEngine}
              disabled={props.isGenerating}
            />

            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1.5 text-center">
                <p className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600">Tỉ lệ</p>
                <button onClick={props.cycleRatio} className="w-full py-2 border rounded-sm text-[8px] font-black uppercase transition-all bg-white dark:bg-[#1c1c1e] border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-brand-blue">{props.ratio}</button>
              </div>

              <DurationSelector value={props.duration} onClick={props.cycleDuration} />

              <div className="space-y-1.5 text-center">
                <p className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600">Âm thanh</p>
                <button onClick={props.cycleSound} className={`w-full py-2 border rounded-sm text-[8px] font-black uppercase transition-all ${props.soundEnabled ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20' : 'bg-white dark:bg-[#1c1c1e] border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-brand-blue'}`}>{props.soundEnabled ? 'Bật' : 'Tắt'}</button>
              </div>

              <div className="space-y-1.5 text-center">
                <p className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600">P.Giải</p>
                <button onClick={props.cycleResolution} className="w-full py-2 border rounded-sm text-[8px] font-black uppercase transition-all bg-white dark:bg-[#1c1c1e] border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-brand-blue">{props.resolution}</button>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 border-t border-black/5 dark:border-white/5 pt-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Nguồn</span>
                    <span className={`text-[10px] font-black uppercase tracking-tight leading-none ${props.usagePreference === 'key' ? 'text-purple-500' : 'text-brand-blue'}`}>
                        {props.usagePreference === 'credits' ? `Credits (${props.credits.toLocaleString()} CR)` : props.usagePreference === 'key' ? 'API Key' : 'N/A'}
                    </span>
                  </div>
                  <button onClick={() => props.setShowResourceModal(true)} className="p-1 text-slate-400 hover:text-brand-blue transition-all">
                    <Settings size={14} />
                  </button>
                </div>

                <div className="text-right flex flex-col items-end">
                   <span className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-1">Chi phí</span>
                   <div className="flex items-center gap-1.5 text-orange-500 leading-none">
                      <Zap size={10} fill="currentColor" />
                      <span className="text-[11px] font-black italic">{props.usagePreference === 'key' ? '0' : props.currentTotalCost} credits</span>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-6 pt-2">
        <div className="relative group/genbtn">
           <button 
             onClick={props.handleGenerate} 
             disabled={props.isGenerateDisabled} 
             className={`w-full py-5 rounded-xl text-white font-black uppercase text-xs tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-4 ${props.isGenerateDisabled ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:brightness-110 active:scale-[0.97]'}`}
           >
              {props.isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
              {props.activeMode === 'AUTO' ? `KHỞI CHẠY ${props.autoTasksCount} TÁC VỤ` : props.activeMode === 'MULTI' ? `TẠO ${props.multiFramesCount} VIDEO` : 'TẠO VIDEO'}
           </button>

           {props.generateTooltip && (
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover/genbtn:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover/genbtn:translate-y-0 z-[100]">
                <div className="bg-slate-800 dark:bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded shadow-2xl whitespace-nowrap border border-white/10 relative">
                   {props.generateTooltip}
                   <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-900 rotate-45 -mb-1 border-r border-b border-white/10"></div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
