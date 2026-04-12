
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KBD: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[1.6rem] h-6 px-1.5 rounded-md bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.12] text-[10px] font-black text-slate-600 dark:text-white shadow-sm font-mono">
    {children}
  </kbd>
);

const Row: React.FC<{ keys: React.ReactNode[]; label: string; category?: boolean }> = ({ keys, label, category }) => (
  <div className={`flex items-center justify-between gap-4 py-2 ${category ? 'opacity-60 pointer-events-none' : ''}`}>
    <span className="text-[11px] text-slate-600 dark:text-white/70 font-medium">{label}</span>
    <div className="flex items-center gap-1 shrink-0">
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-[9px] text-slate-300 dark:text-white/20 font-bold">+</span>}
          <KBD>{k}</KBD>
        </React.Fragment>
      ))}
    </div>
  </div>
);

const Divider: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 py-1.5 mt-1">
    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/30">{label}</span>
    <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.05]" />
  </div>
);

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#131318] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                  <Keyboard size={14} className="text-brand-blue" />
                </div>
                <div>
                  <p className="text-[12px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Phím tắt</p>
                  <p className="text-[9px] text-slate-400 dark:text-white/30 font-medium">Storyboard Studio</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {/* Scene selection */}
              <div className="pb-2">
                <Divider label="Phân cảnh (chọn 1 cảnh)" />
                <Row keys={['Del']} label="Xóa cảnh đang chọn" />
                <Row keys={['D']} label="Nhân đôi cảnh" />
                <Row keys={['E']} label="AI cải thiện prompt" />
                <Row keys={['↑']} label="Di chuyển cảnh lên" />
                <Row keys={['↓']} label="Di chuyển cảnh xuống" />
              </div>

              {/* Global */}
              <div className="py-2">
                <Divider label="Toàn cục" />
                <Row keys={['⌘', 'Z']} label="Hoàn tác (Undo)" />
                <Row keys={['⌘', '⇧', 'Z']} label="Làm lại (Redo)" />
                <Row keys={['?']} label="Mở bảng phím tắt này" />
              </div>

              {/* Tip */}
              <div className="pt-3">
                <p className="text-[9px] text-slate-400 dark:text-white/25 leading-relaxed">
                  💡 Phím tắt không hoạt động khi đang focus vào ô nhập liệu.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
