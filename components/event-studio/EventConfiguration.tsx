
import React, { useState } from 'react';
import { Settings, ChevronDown, Cpu, Maximize2, Zap, Layers, Sparkles } from 'lucide-react';
import { ServerSelector } from '../common/ServerSelector';
import { COMMON_STUDIO_CONSTANTS } from '../../constants/event-configs';

interface EventConfigurationProps {
  availableModels: any[];
  selectedModel: any;
  setSelectedModel: (m: any) => void;
  selectedEngine: string;
  setSelectedEngine: (e: string) => void;
  selectedRatio: string;
  setSelectedRatio: (r: string) => void;
  selectedRes: string;
  setSelectedRes: (r: string) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  usagePreference: string | null;
  credits: number;
  onShowResource: () => void;
  currentUnitCost: number;
  isGenerating?: boolean;
}

export const EventConfiguration: React.FC<EventConfigurationProps> = ({
  availableModels, selectedModel, setSelectedModel, selectedEngine, setSelectedEngine,
  selectedRatio, setSelectedRatio, selectedRes, setSelectedRes, 
  quantity, setQuantity, usagePreference, credits, onShowResource, currentUnitCost, isGenerating = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectStyle = "w-full bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-2.5 text-[10px] font-bold outline-none appearance-none cursor-pointer transition-all focus:border-brand-blue/40 focus:ring-1 focus:ring-brand-blue/10 text-slate-700 dark:text-white/80";
  const labelStyle = "text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-0.5 flex items-center gap-1.5";

  // Summary text when collapsed
  const modelName = selectedModel?.name || 'Loading...';
  const serverLabel = selectedEngine === 'fxflow' ? 'S2' : 'S1';

  return (
    <div className="border-t border-black/[0.04] dark:border-white/[0.04]">
      {/* Collapsible Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <div className="flex items-center gap-2">
          <Settings size={13} className="text-brand-blue" />
          <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Cấu hình AI</span>
          {!isOpen && (
            <span className="text-[8px] font-medium text-brand-blue/70 truncate max-w-[120px]">{serverLabel} · {modelName}</span>
          )}
        </div>
        <ChevronDown size={12} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="pb-4 space-y-4">
          {/* Server Selector — Server 1 / Server 2 */}
          <ServerSelector
            selected={selectedEngine}
            onChange={setSelectedEngine}
            disabled={isGenerating}
            variant="pill"
          />

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className={labelStyle}><Cpu size={10} className="text-brand-blue"/> Engine AI</label>
            <div className="relative">
              <select 
                value={selectedModel?.id || ''} 
                onChange={e => {
                  const found = availableModels.find(m => m.id === e.target.value);
                  if (found) setSelectedModel(found);
                }}
                disabled={isGenerating || availableModels.length === 0}
                className={selectStyle}
              >
                {availableModels.length === 0 && <option value="">Đang tải...</option>}
                {availableModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className={labelStyle}><Maximize2 size={9} className="text-brand-blue"/> Tỉ lệ</label>
              <div className="relative">
                <select value={selectedRatio} onChange={e => setSelectedRatio(e.target.value)} className={selectStyle} disabled={isGenerating}>
                  {COMMON_STUDIO_CONSTANTS.RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelStyle}><Layers size={9} className="text-brand-blue"/> Số ảnh</label>
              <input 
                type="number" 
                min="1" max="4" 
                value={quantity} 
                disabled={isGenerating}
                onChange={e => setQuantity(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
                className="w-full bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-brand-blue/40 text-slate-700 dark:text-white/80"
              />
            </div>
            <div className="space-y-1">
              <label className={labelStyle}><Zap size={9} className="text-brand-blue"/> Chi phí</label>
              <div className="p-2.5 bg-brand-blue/5 border border-brand-blue/10 rounded-xl text-[10px] font-bold text-brand-blue text-center">
                {currentUnitCost} CR
              </div>
            </div>
          </div>

          {/* Resource Info — compact */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] p-3 rounded-xl transition-colors">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${usagePreference === 'key' ? 'bg-purple-500/10 text-purple-500' : 'bg-brand-blue/10 text-brand-blue'}`}>
                <Sparkles size={12} />
              </div>
              <div>
                <span className="text-[8px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Tài nguyên</span>
                <span className={`text-[10px] font-bold leading-none ${usagePreference === 'key' ? 'text-purple-500' : 'text-brand-blue'}`}>
                  {usagePreference === 'credits' ? `${(credits || 0).toLocaleString()} CR` : 'API Key'}
                </span>
              </div>
            </div>
            <button onClick={onShowResource} className="p-1.5 bg-white dark:bg-white/[0.03] rounded-lg border border-black/[0.06] dark:border-white/[0.06] text-slate-400 hover:text-brand-blue transition-all active:scale-95 shadow-sm">
              <Settings size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
