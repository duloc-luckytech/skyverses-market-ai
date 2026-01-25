
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ShieldCheck } from 'lucide-react';
import { RenderConfig } from './RenderConfig';

interface RenderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  setSettings: (updates: any) => void;
}

export const RenderConfigModal: React.FC<RenderConfigModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  setSettings 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-[#0c0c0e] rounded-[2rem] overflow-hidden shadow-3xl flex flex-col max-h-[90vh] border border-black/5 dark:border-white/10"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Render Configuration</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Cấu hình tham số phần cứng & mô hình</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content - Reusing existing RenderConfig component logic */}
            <div className="flex-grow overflow-y-auto p-6 md:p-10 no-scrollbar">
              <RenderConfig 
                settings={settings}
                setSettings={setSettings}
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 text-emerald-500">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Stability Validated</span>
              </div>
              <button 
                onClick={onClose}
                className="px-10 py-3 bg-brand-blue text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all"
              >
                Xác nhận thiết lập
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
