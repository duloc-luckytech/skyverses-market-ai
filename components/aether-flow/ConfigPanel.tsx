
import React, { useState, useMemo } from 'react';
import { Settings, Save, ChevronDown, FileJson, Loader2, AlertCircle, Dices, Sliders, X, Trash2, Minimize2, Maximize2, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkflowNode } from '../../hooks/useAetherFlow';

interface ConfigPanelProps {
  workflowId: string;
  setWorkflowId: (id: string) => void;
  workflowConfig?: WorkflowNode[];
  updateConfigValue?: (nodeId: string, inputKey: string, value: any) => void;
  apiKey: string;
  statusText: string;
  isGenerating: boolean;
  isUploadingJson: boolean;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  onGenerate: () => void;
}

const DynamicControl = ({ label, value, onChange, nodeId, inputKey }: any) => {
  const isNumber = typeof value === 'number';
  const isBoolean = typeof value === 'boolean';
  const isLongText = typeof value === 'string' && value.length > 50;
  
  if (isBoolean) {
    return (
      <div className="flex items-center justify-between py-1.5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-tight">{label}</span>
        <button 
          onClick={() => onChange(nodeId, inputKey, !value)}
          className={`w-9 h-5 rounded-full relative transition-colors ${value ? 'bg-indigo-600' : 'bg-slate-700'}`}
        >
          <motion.div animate={{ x: value ? 18 : 2 }} className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm" />
        </button>
      </div>
    );
  }

  if (isNumber) {
    const isBig = value > 1000000;
    return (
      <div className="space-y-2 py-2 border-b border-black/5 dark:border-white/5 last:border-0">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-tight">{label}</span>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={value}
              onChange={(e) => onChange(nodeId, inputKey, parseFloat(e.target.value) || 0)}
              className="bg-slate-100 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded px-2 py-1 text-[10px] font-mono text-indigo-500 dark:text-indigo-400 w-24 text-right outline-none focus:border-indigo-500"
            />
            {label.toLowerCase().includes('seed') && (
              <button 
                onClick={() => onChange(nodeId, inputKey, Math.floor(Math.random() * 1000000000000000))}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-slate-400"
              >
                <Dices size={12} />
              </button>
            )}
          </div>
        </div>
        {!isBig && (
          <input 
            type="range" 
            min={0} 
            max={label.toLowerCase().includes('cfg') ? 20 : 100}
            step={label.toLowerCase().includes('cfg') ? 0.5 : 1}
            value={value}
            onChange={(e) => onChange(nodeId, inputKey, parseFloat(e.target.value))}
            className="w-full h-1 bg-black/5 dark:bg-white/10 appearance-none rounded-full accent-indigo-500 cursor-pointer"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 py-2 border-b border-black/5 dark:border-white/5 last:border-0">
      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-tight">{label}</span>
      {isLongText ? (
        <textarea
          value={value}
          onChange={(e) => onChange(nodeId, inputKey, e.target.value)}
          className="w-full bg-slate-100 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg px-3 py-2 text-[11px] font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 min-h-[80px] resize-none"
        />
      ) : (
        <input 
          type="text" 
          value={String(value)}
          onChange={(e) => onChange(nodeId, inputKey, e.target.value)}
          className="w-full bg-slate-100 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg px-3 py-2 text-[11px] font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
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

  const isMissingRequirements = !apiKey.trim() || !workflowId.trim();

  // Xác định danh sách các node có thể chỉnh sửa
  const editableNodeIds = useMemo(() => {
    return workflowConfig
      .filter(node => Object.values(node.inputs).some(val => !Array.isArray(val)))
      .map(n => n.id);
  }, [workflowConfig]);

  // Kiểm tra xem tất cả các node có đang được thu gọn hay không
  const isAllCollapsed = editableNodeIds.length > 0 && editableNodeIds.every(id => collapsedNodes.includes(id));

  const toggleNode = (id: string) => {
    setCollapsedNodes(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (isAllCollapsed) {
      // Nếu tất cả đang thu gọn -> Mở rộng tất cả bằng cách xóa khỏi list collapsed
      setCollapsedNodes(prev => prev.filter(id => !editableNodeIds.includes(id)));
    } else {
      // Nếu có bất kỳ node nào đang mở -> Thu gọn toàn bộ list editable
      setCollapsedNodes(prev => Array.from(new Set([...prev, ...editableNodeIds])));
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#121218] border border-black/5 dark:border-white/5 rounded-2xl p-8 flex flex-col gap-8 shadow-2xl relative max-h-[85vh] overflow-y-auto no-scrollbar transition-colors">
      <div className="flex justify-between items-center px-1 shrink-0">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 italic">Cấu hình key api</h3>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isGenerating || isUploadingJson ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-bold italic tracking-wider">{statusText}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-xl transition-all ${showSettings ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:text-indigo-500'}`}
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest ml-1">Workflow Registry (RunningHub ID)</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              className="flex-grow bg-slate-50 dark:bg-[#1c1c24] border border-black/5 dark:border-white/10 rounded-xl px-5 py-4 text-slate-800 dark:text-gray-200 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              placeholder="Nhập Workflow ID..."
            />
            <button className="p-4 bg-slate-50 dark:bg-[#1c1c24] border border-black/5 dark:border-white/10 rounded-xl text-slate-400 dark:text-gray-500 hover:text-indigo-500 transition-all shadow-sm">
              <Save size={20} />
            </button>
          </div>
        </div>

        {/* KHU VỰC HIỂN THỊ DANH SÁCH NODE VÀ FIELD (DASHED BOX KHI CÓ DATA) */}
        {workflowConfig.length > 0 && (
          <div className="space-y-4 pt-4">
             <div className="flex items-center justify-between px-1">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-2">
                  <Sliders size={14} /> Kịch bản tham chiếu
                </h4>
                
                {editableNodeIds.length > 0 && (
                  <button 
                    onClick={toggleAll}
                    className="text-[9px] font-black uppercase text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100/50 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm"
                  >
                    {isAllCollapsed ? <Maximize2 size={10} /> : <Minimize2 size={10} />}
                    {isAllCollapsed ? 'Mở rộng tất cả' : 'Thu gọn tất cả'}
                  </button>
                )}
             </div>

             <div className="space-y-3 p-4 border-2 border-dashed border-indigo-500/20 dark:border-indigo-400/20 rounded-2xl bg-indigo-500/[0.02]">
                {workflowConfig.map((node) => {
                  const isCollapsed = collapsedNodes.includes(node.id);
                  // Kiểm tra xem node có field nào không phải mảng không
                  const hasEditableFields = Object.values(node.inputs).some(val => !Array.isArray(val));
                  
                  if (!hasEditableFields) return null;

                  return (
                    <div key={node.id} className="bg-white dark:bg-[#16161d] border border-black/5 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
                      <button 
                        onClick={() => toggleNode(node.id)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors"
                      >
                        <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase italic">#{node.id} {node.title}</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                      </button>
                      
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-4 bg-white dark:bg-black/20"
                          >
                             {Object.entries(node.inputs).map(([key, val]) => {
                               if (Array.isArray(val)) return null; 
                               
                               return (
                                 <DynamicControl 
                                   key={key}
                                   label={key.replace(/_/g, ' ')}
                                   value={val}
                                   nodeId={node.id}
                                   inputKey={key}
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
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS - STICKY AT BOTTOM OF PANEL */}
      <div className="mt-auto sticky bottom-0 bg-white dark:bg-[#121218] pt-6 pb-2 z-30 border-t border-black/5 dark:border-white/5 group/gen shadow-[0_-10px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        <button 
          onClick={onGenerate}
          disabled={isGenerating || isUploadingJson || isMissingRequirements}
          className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 text-base font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] group overflow-hidden ${isGenerating || isUploadingJson || isMissingRequirements ? 'bg-slate-200 dark:bg-gray-800 text-slate-400 dark:text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.01] text-white shadow-indigo-500/20'}`}
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <span>🚀 Generate</span>
              <div className="h-6 w-px bg-white/20 mx-2 hidden xs:block"></div>
              <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-white/10">
                 <Coins size={12} className="text-yellow-400" fill="currentColor" />
                 <span className="text-[10px] font-black italic tracking-normal">500</span>
              </div>
            </>
          )}
        </button>

        {isMissingRequirements && !isGenerating && !isUploadingJson && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover/gen:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover/gen:translate-y-0 z-50">
             <div className="bg-slate-800 text-white text-[10px] font-bold px-4 py-2 rounded-xl shadow-2xl border border-white/10 flex items-center gap-2 whitespace-nowrap">
                <AlertCircle size={14} className="text-orange-400" />
                <span>Thiếu API Key hoặc Workflow ID</span>
             </div>
             <div className="w-3 h-3 bg-slate-800 border-r border-b border-white/10 rotate-45 mx-auto -mt-1.5"></div>
          </div>
        )}
      </div>
    </div>
  );
};
