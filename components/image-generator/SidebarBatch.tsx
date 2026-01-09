
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ListPlus, X } from 'lucide-react';

interface SidebarBatchProps {
  batchPrompts: string[];
  setBatchPrompts: React.Dispatch<React.SetStateAction<string[]>>;
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
    setBatchPrompts(prev => prev.filter((_, i) => i !== idx));
  };

  const updatePrompt = (idx: number, val: string) => {
    setBatchPrompts(prev => prev.map((p, i) => i === idx ? val : p));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Danh sách kịch bản</h3>
        <button onClick={() => setIsBulk(!isBulk)} className="text-brand-blue text-[9px] font-black uppercase flex items-center gap-1 hover:underline">
          <ListPlus size={10} /> {isBulk ? 'Hủy' : 'Nhập nhanh'}
        </button>
      </div>

      <AnimatePresence>
        {isBulk && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
            <textarea 
              value={bulkText} onChange={e => setBulkText(e.target.value)}
              className="w-full h-32 bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-4 text-xs font-medium outline-none transition-all resize-none"
              placeholder="Nhập mỗi prompt một dòng..."
            />
            <button onClick={onBulkImport} className="w-full py-2.5 bg-brand-blue text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">Phân tách</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {batchPrompts.map((p, idx) => (
          <div key={idx} className="relative group">
            <textarea 
              value={p} onChange={e => updatePrompt(idx, e.target.value)}
              className="w-full h-16 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 pr-10 text-[10px] font-medium focus:border-brand-blue outline-none transition-all resize-none"
              placeholder={`Kịch bản 0${idx+1}...`}
            />
            <button onClick={() => removePrompt(idx)} className="absolute top-2 right-2 p-1.5 text-slate-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {batchPrompts.length < 10 && (
          <button onClick={addPrompt} className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-brand-blue hover:border-brand-blue/40 transition-all">
            <Plus size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Thêm phân đoạn</span>
          </button>
        )}
      </div>
    </div>
  );
};
