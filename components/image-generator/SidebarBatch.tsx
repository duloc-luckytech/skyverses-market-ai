import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ListPlus, X, Zap, Braces } from 'lucide-react';

interface SidebarBatchProps {
  batchPrompts: string[];
  setBatchPrompts: (prompts: string[]) => void;
  isBulk: boolean;
  setIsBulk: (v: boolean) => void;
  bulkText: string;
  setBulkText: (v: string) => void;
  onBulkImport: () => void;
}

export const SidebarBatch: React.FC<SidebarBatchProps> = ({ 
  batchPrompts, setBatchPrompts, isBulk, setIsBulk, bulkText, setBulkText, onBulkImport 
}) => {
  const addPrompt = () => {
    if (batchPrompts.length >= 10) return;
    setBatchPrompts([...batchPrompts, '']);
  };

  const removePrompt = (idx: number) => {
    if (batchPrompts.length <= 1) return;
    setBatchPrompts(batchPrompts.filter((_, i) => i !== idx));
  };

  const updatePrompt = (idx: number, val: string) => {
    const next = [...batchPrompts];
    next[idx] = val;
    setBatchPrompts(next);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="space-y-6"
    >
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.3em] flex items-center gap-2">
          <Braces size={14} className="text-purple-500" /> Luồng kịch bản
        </label>
        <button 
          onClick={() => setIsBulk(!isBulk)} 
          className={`text-[9px] font-black uppercase flex items-center gap-1.5 transition-all px-3 py-1 rounded-full border ${isBulk ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue hover:bg-brand-blue hover:text-white'}`}
        >
          {isBulk ? <X size={10} /> : <ListPlus size={10} />}
          {isBulk ? 'Hủy' : 'Nhập hàng loạt'}
        </button>
      </div>

      <AnimatePresence>
        {isBulk && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl space-y-4 shadow-inner mb-4">
              <textarea 
                value={bulkText} 
                onChange={e => setBulkText(e.target.value)}
                className="w-full h-32 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-[11px] font-medium outline-none focus:border-brand-blue/30 transition-all resize-none text-slate-800 dark:text-white"
                placeholder="Dán danh sách kịch bản... Mỗi dòng sẽ là một hình ảnh mới."
              />
              <button 
                onClick={onBulkImport}
                className="w-full py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Phân tách kịch bản
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
        {batchPrompts.map((p, idx) => (
          <div key={idx} className="relative group animate-in slide-in-from-right-2 duration-300">
            <div className="absolute -left-1 top-4 w-1 h-8 bg-brand-blue/30 rounded-full group-hover:bg-brand-blue transition-colors"></div>
            <textarea 
              value={p} 
              onChange={e => updatePrompt(idx, e.target.value)}
              className="w-full h-20 bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/5 rounded-xl p-4 pr-10 text-[10px] font-bold text-slate-800 dark:text-gray-200 focus:border-brand-blue/40 outline-none transition-all resize-none shadow-sm"
              placeholder={`Phân đoạn 0${idx + 1}...`}
            />
            <button 
              onClick={() => removePrompt(idx)} 
              className="absolute top-3 right-3 p-1.5 text-slate-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        
        {batchPrompts.length < 10 && (
          <button 
            onClick={addPrompt}
            className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all group"
          >
            <Plus size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Thêm phân đoạn</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};