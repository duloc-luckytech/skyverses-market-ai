
import React from 'react';
import { motion } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';

interface ExpandModalProps {
  isOpen: boolean;
  title: string;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}

export const ExpandModal: React.FC<ExpandModalProps> = ({ isOpen, title, value, onChange, onClose }) => {
  if (!isOpen) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-[#111318] border border-black/5 dark:border-white/10 w-full max-w-4xl rounded-2xl flex flex-col shadow-3xl overflow-hidden"
      >
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-transparent">
          <div className="flex items-center gap-3 text-brand-blue">
            <SlidersHorizontal size={18} />
            <h3 className="text-lg font-black uppercase tracking-tight italic">Edit {title}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 flex-grow">
          <textarea 
            value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full h-[400px] bg-transparent border-none text-slate-900 dark:text-gray-200 text-lg outline-none resize-none no-scrollbar font-medium leading-relaxed italic"
            autoFocus
          />
        </div>
        <div className="p-6 border-t border-black/5 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-transparent">
          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest italic">Cửa sổ soạn thảo văn bản quy mô lớn</p>
          <button onClick={onClose} className="bg-brand-blue text-white px-10 py-3 rounded-xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Hoàn tất</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
