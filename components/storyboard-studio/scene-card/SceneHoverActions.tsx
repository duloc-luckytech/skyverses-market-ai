import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, Video, Sparkles, Trash2, Loader2, MoreHorizontal,
  Copy, AlertTriangle, X,
} from 'lucide-react';

interface SceneHoverActionsProps {
  isProcessing: boolean;
  isEnhancingPrompt?: boolean;
  onRegenerateImage:  () => void;
  onRegenerateVideo:  () => void;
  onEnhancePrompt:    () => void;
  onDelete:           () => void;
  onDuplicate?:       () => void;
  /** Khi true: nút to hơn, label luôn hiện (list view ngang) */
  isListView?: boolean;
}

/* ── Inline delete confirm mini-modal ─────────────── */
const DeleteConfirm: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 4 }}
    transition={{ duration: 0.12 }}
    className="absolute bottom-full right-0 mb-1.5 w-52 bg-white dark:bg-[#111116] border border-rose-200 dark:border-rose-500/20 rounded-2xl shadow-2xl z-50 p-3 space-y-2.5"
    onClick={e => e.stopPropagation()}
  >
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <AlertTriangle size={13} className="text-rose-500" />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-800 dark:text-white leading-tight">Xóa cảnh này?</p>
        <p className="text-[9px] text-slate-400 dark:text-white/30 mt-0.5 leading-snug">Thao tác không thể hoàn tác.</p>
      </div>
    </div>
    <div className="flex gap-1.5">
      <button
        onClick={onCancel}
        className="flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
      >
        Hủy
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white hover:bg-rose-600 transition-all flex items-center justify-center gap-1"
      >
        <Trash2 size={9} /> Xóa
      </button>
    </div>
  </motion.div>
);

export const SceneHoverActions: React.FC<SceneHoverActionsProps> = ({
  isProcessing,
  isEnhancingPrompt,
  onRegenerateImage,
  onRegenerateVideo,
  onEnhancePrompt,
  onDelete,
  onDuplicate,
  isListView = false,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
        setShowDeleteConfirm(false);
      }
    };
    if (moreOpen) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [moreOpen]);

  const primaryActions = [
    {
      icon:     <RefreshCw size={11} />,
      label:    'Tạo ảnh',
      onClick:  onRegenerateImage,
      color:    'hover:bg-amber-500/15 hover:text-amber-400',
      disabled: isProcessing,
      title:    'Tạo lại ảnh (~10 CR)',
      ariaLabel: 'Tạo lại hình ảnh cho cảnh này',
    },
    {
      icon:     <Video size={11} />,
      label:    'Render',
      onClick:  onRegenerateVideo,
      color:    'hover:bg-purple-500/15 hover:text-purple-400',
      disabled: isProcessing,
      title:    'Render video (~50 CR)',
      ariaLabel: 'Render video cho cảnh này',
    },
    {
      icon:     isEnhancingPrompt ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />,
      label:    isEnhancingPrompt ? '...' : 'Enhance',
      onClick:  onEnhancePrompt,
      color:    'hover:bg-brand-blue/15 hover:text-brand-blue',
      disabled: isProcessing || isEnhancingPrompt,
      title:    'AI cải thiện prompt (~2 CR)',
      ariaLabel: 'Cải thiện prompt của cảnh này bằng AI',
    },
  ];

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setMoreOpen(false);
    onDelete();
  };

  return (
    <div
      className={`flex items-center border-t border-slate-100 dark:border-white/8 bg-white dark:bg-[#0d0d10] gap-1 ${isListView ? 'px-3 py-2' : 'px-2 py-1.5 gap-0.5'}`}
      onClick={e => e.stopPropagation()}
    >
      {/* Primary action buttons */}
      {primaryActions.map(action => (
        <motion.button
          key={action.label}
          whileTap={{ scale: 0.88 }}
          onClick={e => { e.stopPropagation(); action.onClick(); }}
          disabled={action.disabled}
          title={action.title}
          aria-label={action.ariaLabel}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg text-slate-400 dark:text-white/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${action.color} ${isListView ? 'py-2 px-2' : 'py-1.5 px-1'}`}
        >
          {action.icon}
          <span className={`text-[8px] font-black uppercase tracking-wider leading-none ${isListView ? '' : 'hidden md:inline'}`}>
            {action.label}
          </span>
        </motion.button>
      ))}

      {/* Divider */}
      <div className="w-px h-4 bg-slate-200 dark:bg-white/8 mx-0.5 shrink-0" />

      {/* More (⋮) dropdown */}
      <div ref={moreRef} className="relative">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={e => {
            e.stopPropagation();
            setMoreOpen(v => !v);
            setShowDeleteConfirm(false);
          }}
          disabled={isProcessing}
          title="Thêm"
          aria-label="Mở menu thêm hành động"
          aria-expanded={moreOpen}
          className={`flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 dark:text-white/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-700 dark:hover:text-white ${moreOpen ? 'bg-slate-100 dark:bg-white/8 text-slate-700 dark:text-white' : ''}`}
        >
          <MoreHorizontal size={13} />
        </motion.button>

        <AnimatePresence>
          {moreOpen && !showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 4 }}
              transition={{ duration: 0.13 }}
              className="absolute bottom-full right-0 mb-1.5 w-40 bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
            >
              {/* Duplicate */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  setMoreOpen(false);
                  onDuplicate?.();
                }}
                aria-label="Nhân đôi cảnh này"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-bold text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Copy size={11} /> Nhân đôi cảnh
              </button>
              <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-0.5" />
              {/* Delete — opens inline confirm */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                aria-label="Xóa cảnh này"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 size={11} /> Xóa cảnh
              </button>
            </motion.div>
          )}

          {/* Inline delete confirm */}
          {moreOpen && showDeleteConfirm && (
            <DeleteConfirm
              onConfirm={handleDeleteConfirm}
              onCancel={() => { setShowDeleteConfirm(false); setMoreOpen(false); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
