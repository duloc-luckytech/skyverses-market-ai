import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Video, Sparkles, Trash2, Loader2 } from 'lucide-react';

interface SceneHoverActionsProps {
  visible: boolean;
  isProcessing: boolean;
  isEnhancingPrompt?: boolean;
  onRegenerateImage:  () => void;
  onRegenerateVideo:  () => void;
  onEnhancePrompt:    () => void;
  onDelete:           () => void;
}

interface Action {
  icon:    React.ReactNode;
  label:   string;
  onClick: () => void;
  color:   string;
  disabled?: boolean;
}

export const SceneHoverActions: React.FC<SceneHoverActionsProps> = ({
  visible,
  isProcessing,
  isEnhancingPrompt,
  onRegenerateImage,
  onRegenerateVideo,
  onEnhancePrompt,
  onDelete,
}) => {
  const actions: Action[] = [
    {
      icon:     <RefreshCw size={11} />,
      label:    'Tạo lại ảnh',
      onClick:  onRegenerateImage,
      color:    'hover:bg-amber-500/25 hover:text-amber-400 hover:border-amber-500/30',
      disabled: isProcessing,
    },
    {
      icon:     <Video size={11} />,
      label:    'Render video',
      onClick:  onRegenerateVideo,
      color:    'hover:bg-purple-500/25 hover:text-purple-400 hover:border-purple-500/30',
      disabled: isProcessing,
    },
    {
      icon:     isEnhancingPrompt ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />,
      label:    'Enhance prompt',
      onClick:  onEnhancePrompt,
      color:    'hover:bg-brand-blue/25 hover:text-brand-blue hover:border-brand-blue/30',
      disabled: isProcessing || isEnhancingPrompt,
    },
    {
      icon:     <Trash2 size={11} />,
      label:    'Xóa cảnh',
      onClick:  onDelete,
      color:    'hover:bg-rose-500/25 hover:text-rose-400 hover:border-rose-500/30',
      disabled: isProcessing,
    },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-2 right-2 flex gap-1 z-20"
          onClick={e => e.stopPropagation()}
        >
          {actions.map(action => (
            <motion.button
              key={action.label}
              whileTap={{ scale: 0.85 }}
              onClick={e => { e.stopPropagation(); action.onClick(); }}
              disabled={action.disabled}
              title={action.label}
              className={`w-6 h-6 rounded flex items-center justify-center bg-black/70 backdrop-blur-sm border border-white/10 text-white/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${action.color}`}
            >
              {action.icon}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
