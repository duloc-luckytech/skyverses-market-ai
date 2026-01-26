
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileJson, Upload, Search, CheckCircle, AlertCircle, Loader2, ChevronDown, Cpu, Terminal, Maximize2 } from 'lucide-react';

interface ImportWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (input: File | string) => Promise<any>;
}

interface AnalyzedNode {
  id: string;
  title: string;
  classType: string;
  inputs: Record<string, any>;
}

export const ImportWorkflowModal: React.FC<ImportWorkflowModalProps> = ({ isOpen, onClose, onImport }) => {
  const [jsonText, setJsonText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedNodes, setDetectedNodes] = useState<AnalyzedNode[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextImport = async () => {
    if (!jsonText.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      await onImport(jsonText);
      onClose();
    } catch (err: any) {
      setError(err.message || "Lỗi khi đồng bộ kịch bản.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = () => {
    if (!jsonText.trim()) return;
    setIsAnalyzing(true);
    setDetectedNodes([]);
    setError(null);

    setTimeout(() => {
      try {
        const data = JSON.parse(jsonText);
        const nodes: AnalyzedNode[] = [];

        Object.keys(data).forEach(key => {
          const nodeData = data[key];
          nodes.push({
            id: key,
            title: nodeData._meta?.title || nodeData.class_type || `Node ${key}`,
            classType: nodeData.class_type,
            inputs: nodeData.inputs || {}
          });
        });

        setDetectedNodes(nodes);
      } catch (e) {
        setError("Định dạng JSON không hợp lệ để phân tích.");
      } finally {
        setIsAnalyzing(false);
      }
    }, 800);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setError(null);
      try {
        const text = await file.text();
        setJsonText(text);
        setIsProcessing(false);
        // Tự động phân tích sau khi upload file
        handleAnalyze();
      } catch (err: any) {
        setError(err.message || "Lỗi khi đọc file.");
        setIsProcessing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0d0d0f] border border-black/10 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-3xl flex flex-col transition-colors duration-500 max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/20">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileJson size={20} />
             </div>
             <div className="space-y-0.5">
                <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">Import Workflow JSON</h3>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Configuration Uplink</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1">Paste Workflow JSON (API Format)</label>
              <div className="relative group">
                <textarea 
                  value={jsonText}
                  onChange={(e) => { setJsonText(e.target.value); setError(null); }}
                  placeholder='{"1": {"inputs": {...}, "class_type": "...", ...}'
                  className="w-full h-48 bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl p-5 text-xs font-mono text-indigo-600 dark:text-indigo-300 outline-none focus:border-indigo-500/50 transition-all resize-none shadow-inner scrollbar-hide"
                />
              </div>
           </div>

           {error && (
             <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase leading-relaxed tracking-tight">{error}</p>
             </div>
           )}

           {/* DETECTED NODES SECTION */}
           <AnimatePresence>
             {(detectedNodes.length > 0 || isAnalyzing) && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-6"
               >
                  <div className="flex items-center gap-2 px-1">
                     <Search size={14} className="text-indigo-500" />
                     <h4 className="text-[11px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Detected Nodes:</h4>
                  </div>

                  {isAnalyzing ? (
                    <div className="py-10 flex flex-col items-center justify-center gap-4 opacity-50">
                       <Loader2 className="animate-spin text-brand-blue" />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em]">Analyzing Structure...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       {detectedNodes.map((node) => (
                         <div key={node.id} className="bg-slate-50 dark:bg-[#16161d] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-5 py-3 bg-black/5 dark:bg-black/20 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <span className="text-[11px] font-black text-indigo-500 dark:text-indigo-400 italic">Node {node.id}: {node.title}</span>
                               </div>
                               <ChevronDown size={14} className="text-gray-500" />
                            </div>
                            <div className="p-5 space-y-3">
                               {Object.entries(node.inputs).map(([key, val]) => {
                                 // Không hiển thị các kết nối node dạng mảng [id, index]
                                 if (Array.isArray(val) && val.length === 2 && typeof val[0] === 'string') return null;
                                 
                                 return (
                                   <div key={key} className="flex items-start gap-4">
                                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 w-24 shrink-0 mt-1 uppercase tracking-tight">
                                        {key.replace(/_/g, ' ')}
                                      </span>
                                      <div className="flex-grow bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-lg p-3 text-[11px] font-mono font-bold text-slate-800 dark:text-gray-300 break-all shadow-inner">
                                        {String(val)}
                                      </div>
                                   </div>
                                 );
                               })}
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </motion.div>
             )}
           </AnimatePresence>

           <div className="flex items-center gap-4">
              <div className="h-px flex-grow bg-black/5 dark:bg-white/5"></div>
              <span className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest italic">Hoặc sử dụng tệp tin</span>
              <div className="h-px flex-grow bg-black/5 dark:bg-white/5"></div>
           </div>

           <button 
             onClick={() => fileInputRef.current?.click()}
             className="w-full py-4 border border-dashed border-black/10 dark:border-white/10 hover:border-indigo-500/40 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all rounded-xl flex flex-col items-center justify-center gap-2 group shadow-sm"
           >
              <Upload size={20} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-700 dark:group-hover:text-gray-300">Tải tệp .json từ máy tính</span>
           </button>
           <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/40 grid grid-cols-2 gap-4 shrink-0">
           <button 
             onClick={handleAnalyze}
             disabled={isAnalyzing || !jsonText.trim()}
             className="flex items-center justify-center gap-3 py-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-300 transition-all disabled:opacity-30 shadow-sm"
           >
              {isAnalyzing ? <Loader2 className="animate-spin" size={16}/> : <Search size={16} />} 
              Analyze Workflow
           </button>
           <button 
             onClick={handleTextImport}
             disabled={isProcessing || !jsonText.trim()}
             className="flex items-center justify-center gap-3 py-4 bg-[#10b981] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 relative overflow-hidden"
           >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
              Apply to Settings
           </button>
        </div>
      </motion.div>
    </div>
  );
};
