import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ListPlus, X } from 'lucide-react';

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
  const addPrompt = () => { if (batchPrompts.length >= 10) return; setBatchPrompts([...batchPrompts, '']); };
  const removePrompt = (idx: number) => { if (batchPrompts.length <= 1) return; setBatchPrompts(batchPrompts.filter((_, i) => i !== idx)); };
  const updatePrompt = (idx: number, val: string) => { const n = [...batchPrompts]; n[idx] = val; setBatchPrompts(n); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-semibold uppercase text-slate-400 dark:text-[#555] tracking-wider">Batch Prompts</p>
        <button
          onClick={() => setIsBulk(!isBulk)}
          className="text-rose-500 dark:text-rose-400 text-[10px] font-semibold flex items-center gap-1 hover:brightness-125"
        >
          {isBulk ? <><X size={12} /> Hủy</> : <><ListPlus size={12} /> Nhập</>}
        </button>
      </div>

      <AnimatePresence>
        {isBulk && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg space-y-2">
              <textarea
                value={bulkText} onChange={e => setBulkText(e.target.value)}
                className="w-full h-20 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded p-2.5 text-[10px] font-medium text-slate-700 dark:text-white/70 focus:border-rose-500/30 outline-none resize-none"
                placeholder="Mỗi dòng = 1 prompt..."
              />
              <button onClick={onBulkImport} className="w-full py-2 bg-rose-600 text-white rounded text-[10px] font-semibold uppercase tracking-wider">Phân tách</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
        {batchPrompts.map((p, idx) => (
          <div key={idx} className="relative group">
            <div className="p-2.5 bg-slate-50/50 dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-lg group hover:border-rose-500/20 transition-all">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-semibold text-rose-500 dark:text-rose-400">#{idx + 1}</span>
                <button onClick={() => removePrompt(idx)} className="text-slate-300 dark:text-[#333] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={11} /></button>
              </div>
              <textarea
                value={p} onChange={e => updatePrompt(idx, e.target.value)}
                className="w-full h-12 bg-transparent border-b border-black/[0.06] dark:border-white/[0.04] text-[10px] font-medium outline-none focus:border-rose-500/20 resize-none text-slate-700 dark:text-white/70"
                placeholder={`Prompt ${idx + 1}...`}
              />
            </div>
          </div>
        ))}
        {batchPrompts.length < 10 && (
          <button onClick={addPrompt} className="w-full py-2.5 border border-dashed border-black/[0.08] dark:border-white/[0.06] rounded-lg flex items-center justify-center gap-1.5 text-slate-400 dark:text-[#555] hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-500/20 transition-all">
            <Plus size={12} /> <span className="text-[10px] font-semibold">Thêm</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};