import React, { useState } from 'react';
import { Settings, ChevronDown, Loader2, Zap, Sliders, Dices, AlertCircle, ClipboardList, Coins, Box, ExternalLink, FileText } from 'lucide-react';
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

// Trình render Markdown đơn giản cho giao diện Skyverses
const MarkdownRenderer = ({ content }: { content: string }) => {
  // Xử lý các khối mã (Code Blocks) - Vẽ viền đứt đoạn như hình mẫu
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 font-sans text-[13px] leading-relaxed text-slate-300">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/```/g, '').trim();
          return (
            <div key={i} className="my-4 p-4 bg-black/40 border border-dashed border-white/20 rounded-lg font-mono text-[11px] text-zinc-400 overflow-x-auto leading-normal">
              <pre>{code}</pre>
            </div>
          );
        }

        // Xử lý các thành phần inline (Links, Bold, Lists)
        const lines = part.split('\n');
        return (
          <div key={i} className="space-y-2">
            {lines.map((line, li) => {
              // Heading 2
              if (line.startsWith('## ')) {
                return <h3 key={li} className="text-base font-black text-white uppercase tracking-tight mt-6 mb-2">{line.replace('## ', '')}</h3>;
              }
              // List item
              if (line.trim().startsWith('- ')) {
                const item = line.trim().replace('- ', '');
                return (
                  <div key={li} className="flex gap-2 pl-2">
                    <span className="text-brand-blue">•</span>
                    <div dangerouslySetInnerHTML={{ 
                      __html: formatInlineMarkdown(item) 
                    }} />
                  </div>
                );
              }
              // Normal line
              return (
                <p key={li} className="min-h-[1.2em]" dangerouslySetInnerHTML={{ 
                  __html: formatInlineMarkdown(line) 
                }} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Helper format chữ đậm và liên kết
const formatInlineMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-brand-blue hover:underline inline-flex items-center gap-1">$1</a>');
};

const WidgetField = ({ value, index, nodeId, onChange }: any) => {
  const isNumber = typeof value === 'number';
  const isBoolean = typeof value === 'boolean';
  
  // Kiểm tra xem chuỗi có phải là một bản ghi chú Markdown không
  const isMarkdownNote = typeof value === 'string' && (
    value.includes('##') || 
    value.includes('**') || 
    value.includes('```') ||
    value.includes('📂')
  );

  const fieldLabel = `THÔNG SỐ 0${index + 1}`;

  if (isBoolean) {
    return (
      <div className="flex items-center justify-between py-3 group border-b border-black/5 dark:border-white/[0.03] last:border-0">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{fieldLabel}</span>
        </div>
        <button 
          onClick={() => onChange(nodeId, index, !value)}
          className={`w-10 h-5 rounded-none relative transition-colors ${value ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-zinc-800'}`}
        >
          <motion.div 
            animate={{ x: value ? 22 : 2 }} 
            className="absolute top-1 left-0 w-3 h-3 bg-white rounded-none shadow-sm" 
          />
        </button>
      </div>
    );
  }

  if (isMarkdownNote) {
    return (
      <div className="space-y-4 py-6 border-b border-black/5 dark:border-white/[0.03] last:border-0">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <FileText size={14} className="text-brand-blue" />
             <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">BẢN GHI CHÚ QUY TRÌNH</span>
           </div>
           <button 
             onClick={() => {
               const newVal = window.prompt("Cập nhật ghi chú kịch bản:", value);
               if (newVal !== null) onChange(nodeId, index, newVal);
             }}
             className="p-1.5 bg-black/20 hover:bg-brand-blue/10 rounded text-gray-500 hover:text-brand-blue transition-all"
           >
             <Settings size={12} />
           </button>
        </div>
        
        <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 lg:p-8 shadow-inner overflow-hidden relative group">
           {/* Decor icon mờ ở nền */}
           <div className="absolute top-4 right-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <FileText size={120} />
           </div>
           <MarkdownRenderer content={value} />
        </div>
      </div>
    );
  }

  const isLongText = typeof value === 'string' && (value.length > 50 || value.includes('\n'));

  return (
    <div className="space-y-2 py-4 border-b border-black/5 dark:border-white/[0.03] last:border-0">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{fieldLabel}</span>
        {isNumber && fieldLabel.includes('SEED') && (
           <button 
             onClick={() => onChange(nodeId, index, Math.floor(Math.random() * 1000000000000000))}
             className="text-indigo-500 hover:text-indigo-600 dark:hover:text-white transition-colors"
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
            className="w-full bg-slate-100 dark:bg-black border-none rounded-none p-4 text-[12px] font-medium text-slate-800 dark:text-zinc-300 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none min-h-[100px] font-mono leading-relaxed shadow-inner"
          />
        ) : (
          <input 
            type={isNumber ? "number" : "text"}
            value={String(value)}
            onChange={(e) => onChange(nodeId, index, isNumber ? parseFloat(e.target.value) || 0 : e.target.value)}
            className="w-full bg-slate-100 dark:bg-black border-none rounded-none p-3 text-[12px] font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
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
    <div className="flex-1 bg-white dark:bg-[#111114] rounded-none p-0 flex flex-col relative h-full overflow-hidden transition-all duration-300 shadow-sm dark:shadow-none">
      
      <div className="p-8 bg-slate-50 dark:bg-[#18181c] shrink-0 border-b border-black/5 dark:border-none">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600"></div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white leading-none">CẤU HÌNH QUY TRÌNH</h3>
           </div>
           <button 
             onClick={() => setShowSettings(!showSettings)}
             className={`p-2 transition-all ${showSettings ? 'text-indigo-600' : 'text-slate-400 dark:text-zinc-600 hover:text-slate-900 dark:hover:text-white'}`}
           >
             <Settings size={18} />
           </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-none ${isGenerating || isUploadingJson ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <p className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-black tracking-widest leading-none">
              {statusText.replace('Hệ thống sẵn sàng', 'Hệ thống trực tuyến').replace('_', ' ')}
            </p>
          </div>
          
          <div className="relative">
             <input 
               type="text" 
               value={workflowId}
               onChange={(e) => setWorkflowId(e.target.value)}
               className="w-full bg-slate-100 dark:bg-black border-none rounded-none px-4 py-4 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all tracking-tighter"
               placeholder="MÃ KỊCH BẢN..."
             />
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar p-0 bg-white dark:bg-[#111114]">
        {workflowConfig.length > 0 ? (
          <div className="divide-y divide-black/5 dark:divide-white/[0.03]">
             {workflowConfig.map((node) => {
                const isOpen = expandedNodes.includes(node.id);
                return (
                  <div key={node.id} className="transition-all">
                    <button 
                      onClick={() => toggleNode(node.id)}
                      className={`w-full px-8 py-5 flex items-center justify-between transition-all ${isOpen ? 'bg-slate-50 dark:bg-white/[0.02]' : 'hover:bg-slate-50 dark:hover:bg-white/[0.01]'}`}
                    >
                      <div className="flex items-center gap-4">
                         <span className={`text-[10px] font-black uppercase italic tracking-widest ${isOpen ? 'text-indigo-600 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`}>
                           {node.title.replace('_', ' ')} (ID: {node.id})
                         </span>
                      </div>
                      <ChevronDown size={14} className={`text-slate-400 dark:text-zinc-600 transition-transform ${isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-500' : ''}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-8 pb-6 pt-2"
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
          <div className="py-32 flex flex-col items-center justify-center gap-6 opacity-20 italic">
             <Sliders size={48} strokeWidth={1} className="text-slate-900 dark:text-white" />
             <p className="text-[10px] font-black uppercase tracking-[0.6em] text-center px-10 text-slate-900 dark:text-white">Đang đợi nạp quy trình...</p>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM BUTTON */}
      <div className="mt-auto bg-slate-50 dark:bg-[#18181c] p-0 z-30 border-t border-black/5 dark:border-white/5 sticky bottom-0">
        <button 
          onClick={onGenerate}
          disabled={isGenerating || isUploadingJson || isMissingRequirements}
          className={`w-full py-8 rounded-none flex items-center justify-center gap-6 text-sm font-black uppercase tracking-[0.5em] transition-all active:scale-[0.99] group overflow-hidden relative ${isGenerating || isUploadingJson || isMissingRequirements ? 'bg-slate-200 dark:bg-zinc-900 text-slate-400 dark:text-zinc-700 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'}`}
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Zap size={18} fill="currentColor" />
              <span>BẮT ĐẦU KHỞI TẠO</span>
              <div className="flex items-center gap-2 bg-black/20 dark:bg-black/40 px-4 py-1.5 rounded-none border border-white/10">
                 <Coins size={14} className="text-yellow-400" fill="currentColor" />
                 <span className="text-[10px] font-black tracking-normal">500</span>
              </div>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
