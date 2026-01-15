
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
      className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#111318] border border-white/10 w-full max-w-4xl rounded-2xl flex flex-col shadow-3xl"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-brand-blue">
            <SlidersHorizontal size={18} />
            <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 flex-grow">
          <textarea 
            value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full h-[400px] bg-transparent border-none text-gray-200 text-lg outline-none resize-none scrollbar-hide"
            autoFocus
          />
        </div>
        <div className="p-6 border-t border-white/5 flex justify-between items-center">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Press Esc to close</p>
          <button onClick={onClose} className="bg-brand-blue text-white px-10 py-3 rounded-xl font-black uppercase text-xs shadow-xl">Done</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
