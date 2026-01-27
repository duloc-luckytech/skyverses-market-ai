
import React, { useState } from 'react';
import { Settings, ChevronDown, Loader2, Zap, Sliders, Dices, AlertCircle, FileText, Coins } from 'lucide-react';
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

const WidgetControl = ({ label, value, index, nodeId, onChange }: any) => {
  const isNumber = typeof value === 'number';
  const isBoolean = typeof value === 'boolean';
  // Nhận diện prompt text dựa trên chiều dài hoặc keyword
  const isPrompt = typeof value === 'string' && (value.length > 30 || label.toLowerCase().includes('text') || label.toLowerCase().includes('prompt'));

  if (isBoolean) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <button 
          onClick={() => onChange(nodeId, index, !value)}
          className={`w-9 h-5 rounded-full relative transition-colors ${value ? 'bg-indigo-600' : 'bg-slate-700'}`}
        >
          <motion.div animate={{ x: value ? 18 : 2 }} className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-3 border-b border-white/5 last:border-0">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
        {label.toLowerCase().includes('seed') && (
           <button 
             onClick={() => onChange(nodeId, index, Math.floor(Math.random() * 1000000000000000))}
             className="p-1.5 hover:bg-white/5 rounded text-indigo-400 transition-colors"
           >
              <Dices size={12} />
           </button>
        )}
      </div>
      
      {isPrompt ? (
        <textarea
          value={String(value)}
          onChange={(e) => onChange(nodeId, index, e.target.value)}
          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-4 text-[13px] font-medium text-gray-200 outline-none focus:border-indigo-500/50 transition-all resize-none min-h-[100px] shadow-inner leading-relaxed"
        />
      ) : (
        <input 
          type={isNumber ? "number" : "text"}
          value={String(value)}
          onChange={(e) => onChange(nodeId, index, isNumber ? parseFloat(e.target.value) || 0 : e.target.value)}
          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-4 text-[13px] font-black text-gray-100 outline-none focus:border-indigo-500/50 transition-all shadow-inner"
        />
      )}
    </div>
  );
};

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  workflowId, setWorkflowId, workflowConfig = [], updateConfigValue, apiKey, statusText, isGenerating, isUploadingJson,
  showSettings, setShowSettings, onGenerate
}) => {
  const [collapsedNodes, setCollapsedNodes] = useState<string[]>([]);

  const toggleNode = (id: string) => {
    setCollapsedNodes(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const isMissingRequirements = !apiKey.trim() || !workflowId.trim();

  return (
    <div className="flex-1 bg-[#111118] border border-white/5 rounded-[2.5rem] p-0 flex flex-col shadow-3xl relative max-h-[88vh] overflow-hidden transition-all duration-500">
      
      {/* HEADER: Dòng tiêu đề và trạng thái */}
      <div className="p-8 border-b border-white/5 bg-[#14141c] shrink-0">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-3">
              <FileText className="text-indigo-500" size={20} />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-500 italic">Workflow Parameters</h3>
           </div>
           <button 
             onClick={() => setShowSettings(!showSettings)}
             className={`p-2.5 rounded-xl transition-all ${showSettings ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:text-indigo-500'}`}
           >
             <Settings size={18} />
           </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isGenerating || isUploadingJson ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <p className="text-[10px] text-gray-400 uppercase font-black italic tracking-widest leading-none">{statusText}</p>
          </div>
          
          <div className="relative group">
             <input 
               type="text" 
               value={workflowId}
               onChange={(e) => setWorkflowId(e.target.value)}
               className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-5 py-4 text-gray-300 font-mono text-[11px] focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
               placeholder="Enter Workflow Registry ID..."
             />
          </div>
        </div>
      </div>

      {/* BODY: Danh sách các Node và Widget */}
      <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-4 bg-[#111118]">
        {workflowConfig.length > 0 ? (
          <div className="space-y-4">
             {workflowConfig.map((node) => {
                const isCollapsed = collapsedNodes.includes(node.id);
                return (
                  <div key={node.id} className="bg-[#16161d] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleNode(node.id)}
                      className="w-full px-5 py-4 flex items-center justify-between bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors"
                    >
                      <span className="text-[11px] font-black text-indigo-500 dark:text-indigo-400 uppercase italic">
                        Node {node.id}: {node.title}
                      </span>
                      <ChevronDown size={14} className={`text-slate-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 py-4 bg-[#121218]/40"
                        >
                           {node.widgets_values.map((val, idx) => (
                             <WidgetControl 
                               key={idx}
                               index={idx}
                               label={`Field 0${idx + 1}`}
                               value={val}
                               nodeId={node.id}
                               onChange={updateConfigValue}
                             />
                           ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
             })}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center gap-6 opacity-20 italic">
             <Sliders size={48} strokeWidth={1} />
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-center px-10">Awaiting workflow registry manifest</p>
          </div>
        )}
      </div>

      {/* FOOTER: Nút thực thi */}
      <div className="mt-auto p-8 border-t border-white/5 bg-[#14141c] z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <button 
          onClick={onGenerate}
          disabled={isGenerating || isUploadingJson || isMissingRequirements}
          className={`w-full py-6 rounded-2xl flex items-center justify-center gap-4 text-base font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-[0.98] group overflow-hidden relative ${isGenerating || isUploadingJson || isMissingRequirements ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/40 hover:scale-[1.01]'}`}
        >
          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          {isGenerating ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <span>🚀 Generate</span>
              <div className="h-6 w-px bg-white/20"></div>
              <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-white/10">
                 <Coins size={12} className="text-yellow-400" fill="currentColor" />
                 <span className="text-[10px] font-black italic tracking-normal">500</span>
              </div>
            </>
          )}
        </button>

        {isMissingRequirements && !isGenerating && (
          <div className="mt-4 flex items-center justify-center gap-2 text-orange-500 animate-pulse">
             <AlertCircle size={14} />
             <span className="text-[9px] font-black uppercase tracking-widest italic">Thiếu API Key hoặc Workflow ID</span>
          </div>
        )}
      </div>
    </div>
  );
};
