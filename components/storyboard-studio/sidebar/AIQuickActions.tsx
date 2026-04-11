import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Image, Video, Coins } from 'lucide-react';

interface AIQuickActionsProps {
  isProcessing: boolean;
  imageCredits: number;
  videoCredits: number;
  totalCreditEstimate: number;
  onEnhanceAllPrompts: () => void;
  onGenerateBatchImages: () => void;
  onGenerateBatchVideos: () => void;
}

export const AIQuickActions: React.FC<AIQuickActionsProps> = ({
  isProcessing,
  imageCredits,
  videoCredits,
  totalCreditEstimate,
  onEnhanceAllPrompts,
  onGenerateBatchImages,
  onGenerateBatchVideos,
}) => {
  const actions = [
    {
      label:    'Cải thiện tất cả prompt',
      sublabel: 'AI viết lại',
      icon:     <Sparkles size={13} />,
      onClick:  onEnhanceAllPrompts,
      className:'border-brand-blue/40 text-brand-blue hover:bg-brand-blue/10',
      cost:     null,
      ariaLabel: 'Cải thiện tất cả prompt bằng AI',
    },
    {
      label:    'Tạo tất cả hình ảnh',
      sublabel: null,
      icon:     <Image size={13} />,
      onClick:  onGenerateBatchImages,
      className:'border-amber-500/40 text-amber-400 hover:bg-amber-500/10',
      cost:     imageCredits,
      ariaLabel: `Tạo hình ảnh cho tất cả cảnh — tốn ${imageCredits} credits`,
    },
    {
      label:    'Tạo tất cả video',
      sublabel: null,
      icon:     <Video size={13} />,
      onClick:  onGenerateBatchVideos,
      className:'border-purple-500/40 text-purple-400 hover:bg-purple-500/10',
      cost:     videoCredits,
      ariaLabel: `Tạo video cho tất cả cảnh — tốn ${videoCredits} credits`,
    },
  ];

  return (
    <div className="px-5 py-4 space-y-2.5">
      {/* Header */}
      <p className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
        <Sparkles size={12} />
        Thao tác nhanh
      </p>

      {/* Action buttons */}
      <div className="space-y-1.5">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            whileTap={{ scale: 0.97 }}
            onClick={action.onClick}
            disabled={isProcessing}
            aria-label={action.ariaLabel}
            className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 border text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${action.className}`}
          >
            <span className="shrink-0">{action.icon}</span>
            <span className="flex-1 text-left">{action.label}</span>
            {action.cost !== null && action.cost > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-black font-mono opacity-70 shrink-0">
                <Coins size={9} />
                {action.cost.toLocaleString()}
              </span>
            )}
            {action.sublabel && (
              <span className="text-[9px] opacity-60 shrink-0">{action.sublabel}</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Total estimate footer */}
      {totalCreditEstimate > 0 && (
        <div className="pt-1.5 flex items-center justify-between text-[10px] border-t border-white/8">
          <span className="text-white/25 font-bold uppercase tracking-widest">Tổng dự tính</span>
          <span className="font-black font-mono text-amber-400/80">
            ~{totalCreditEstimate.toLocaleString()} CR
          </span>
        </div>
      )}
    </div>
  );
};
