
import React, { useState } from 'react';
import { Settings, ChevronDown, Loader2, Zap, Sliders, Dices, AlertCircle, ClipboardList, Coins, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkflowNode } from '../../hooks/useAetherFlow';

interface ConfigPanelProps {
  workflowId: string;
  setWorkflowId: (id: string) => void;
  workflowConfig?: WorkflowNode[];
  updateConfigValue?: (nodeId: string, widgetIndex: number, value: any) => void;
  apiKey: string;
  statusText: string;
  isGenerating: boolean;
  isUploadingJson: boolean;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  onGenerate: () => void;
}

const WidgetField = ({ value, index, nodeId, onChange }: any) => {
  const isNumber = typeof value === 'number';
  const isBoolean = typeof value === 'boolean';
  const isLongText = typeof value === 'string' && (value.length > 50 || value.includes('\n'));

  // Nhãn hiển thị dựa trên vị trí (vì widgets_values của ComfyUI API là mảng không nhãn)
  const fieldLabel = `FIELD_0${index + 1}`;

  if (isBoolean) {
    return (
      <div className="flex items-center justify-between py-4 group">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">{fieldLabel}</span>
          <span className="text-[10px] font-bold text-slate-400 italic">Toggle State</span>
        </div>
        <button 
          onClick={() => onChange(nodeId, index, !value)}
          className={`w-12 h-6 rounded-full relative transition-all duration-500 ${value ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-[#1a1a1f]'}`}
        >
          <motion.div 
            animate={{ x: value ? 26 : 2 }} 
            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg" 
          />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-4">
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{fieldLabel}</span>
        {isNumber && fieldLabel.includes('SEED') && (
           <button 
             onClick={() => onChange(nodeId, index, Math.floor(Math.random() * 1000000000000000))}
             className="text-indigo-500 hover:text-indigo-400 transition-colors"
           >
              <Dices size={12} />
           </button>
        )}
      </div>
      
      <div className="relative">
        {isLongText ? (
          <textarea
            value={String(value)}
            onChange={(e) => onChange(nodeId, index, e.target.value)}
            className="w-full bg-[#050505] border-none rounded-xl p-5 text-[13px] font-medium text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none min-h-[120px] shadow-inner leading-relaxed font-mono"
          />
        ) : (
          <input 
            type={isNumber ? "number" : "text"}
            value={String(value)}
            onChange={(e) => onChange(nodeId, index, isNumber ? parseFloat(e.target.value) || 0 : e.target.value)}
            className="w-full bg-[#050505] border-none rounded-xl p-4 text-[13px] font-black text-indigo-100 outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all shadow-inner px-6"
          />
        )}
      </div>
    </div>
  );
};

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  workflowId, setWorkflowId, workflowConfig = [], updateConfigValue, apiKey, statusText, isGenerating, isUploadingJson,
  showSettings, setShowSettings, onGenerate
}) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>(workflowConfig.map(n => n.id));

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const isMissingRequirements = !apiKey.trim() || !workflowId.trim();

  return (
    <div className="flex-1 bg-[#0b0b0f] rounded-[2.5rem] p-0 flex flex-col shadow-3xl relative max-h-[88vh] overflow-hidden transition-all duration-700">
      
      {/* HEADER: FLAT & CLEAN */}
      <div className="p-10 border-b border-white/[0.03] bg-[#0d0d12] shrink-0">
        <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-indigo-600 rounded-full shadow-[0_0_15px_#6366f1]"></div>
              <div className="space-y-1">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white italic leading-none">Parameters</h3>
                 <p className="text-[8px] font-black text-indigo-500/60 uppercase tracking-widest leading-none">Aether_Flow_Engine</p>
              </div>
           </div>
           <button 
             onClick={() => setShowSettings(!showSettings)}
             className={`p-3 rounded-xl transition-all ${showSettings ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white/[0.03] text-slate-500 hover:text-white'}`}
           >
             <Settings size={18} />
           </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-1.5 rounded-full ${isGenerating || isUploadingJson ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></div>
            <p className="text-[10px] text-slate-400 uppercase font-black italic tracking-widest leading-none">{statusText}</p>
          </div>
          
          <div className="relative">
             <input 
               type="text" 
               value={workflowId}
               onChange={(e) => setWorkflowId(e.target.value)}
               className="w-full bg-[#050505] border-none rounded-2xl px-6 py-5 text-indigo-400 font-mono text-[11px] font-black focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-inner tracking-tight"
               placeholder="REGISTRY_ID_..."
             />
          </div>
        </div>
      </div>

      {/* BODY: FLAT NODE LIST */}
      <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-2 bg-[#0b0b0f]">
        {workflowConfig.length > 0 ? (
          <div className="space-y-2">
             {workflowConfig.map((node) => {
                const isOpen = expandedNodes.includes(node.id);
                return (
                  <div key={node.id} className="overflow-hidden transition-all">
                    <button 
                      onClick={() => toggleNode(node.id)}
                      className={`w-full px-6 py-5 flex items-center justify-between transition-all rounded-2xl ${isOpen ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}`}
                    >
                      <div className="flex items-center gap-4">
                         <Box size={14} className={isOpen ? 'text-indigo-500' : 'text-slate-600'} />
                         <span className={`text-[11px] font-black uppercase italic tracking-widest ${isOpen ? 'text-white' : 'text-slate-500'}`}>
                           Node {node.id}: {node.title}
                         </span>
                      </div>
                      <ChevronDown size={14} className={`text-slate-600 transition-transform duration-500 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-8 pb-4 pt-2 space-y-1"
                        >
                           {node.widgets_values.map((val, idx) => {
                             if (val === null || Array.isArray(val)) return null;
                             return (
                               <WidgetField 
                                 key={idx}
                                 index={idx}
                                 value={val}
                                 nodeId={node.id}
                                 onChange={updateConfigValue}
                               />
                             );
                           })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
             })}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center gap-8 opacity-10 italic">
             <Sliders size={56} strokeWidth={1} />
             <p className="text-[12px] font-black uppercase tracking-[0.6em] text-center px-10">Awaiting Registry Ingestion</p>
          </div>
        )}
      </div>

      {/* FOOTER: PRO ACTION */}
      <div className="mt-auto p-10 bg-[#0d0d12] z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <button 
          onClick={onGenerate}
          disabled={isGenerating || isUploadingJson || isMissingRequirements}
          className={`w-full py-7 rounded-[2rem] flex items-center justify-center gap-6 text-base font-black uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-[0.98] group overflow-hidden relative ${isGenerating || isUploadingJson || isMissingRequirements ? 'bg-slate-900 text-slate-700 cursor-not-allowed grayscale' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-600/40 hover:brightness-110'}`}
        >
          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          {isGenerating ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Zap size={20} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
              <span>Generate</span>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
                 <Coins size={14} className="text-yellow-400" fill="currentColor" />
                 <span className="text-[11px] font-black italic tracking-normal">500</span>
              </div>
            </>
          )}
        </button>

        {isMissingRequirements && !isGenerating && (
          <div className="mt-6 flex items-center justify-center gap-3 text-orange-500/80 animate-pulse">
             <AlertCircle size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">Authentication Required</span>
          </div>
        )}
      </div>
    </div>
  );
};
