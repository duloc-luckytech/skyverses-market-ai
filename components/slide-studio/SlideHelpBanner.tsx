import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, LayoutTemplate, Download } from 'lucide-react';

export const SLIDE_TIPS_KEY = 'skyverses_slide_tips_done';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

const TIPS = [
  {
    icon: <Pencil size={14} className="text-brand-blue shrink-0" />,
    text: 'Nhấp vào slide để chỉnh tiêu đề & nội dung trực tiếp',
  },
  {
    icon: <LayoutTemplate size={14} className="text-violet-500 shrink-0" />,
    text: 'Dùng toolbar để đổi layout, regenerate ảnh nền AI',
  },
  {
    icon: <Download size={14} className="text-emerald-500 shrink-0" />,
    text: 'Xuất PPTX / PDF / PNG từ nút "Xuất" ở header phải',
  },
];

const SlideHelpBanner: React.FC<Props> = ({ visible, onDismiss }) => {
  const handleDismiss = () => {
    localStorage.setItem(SLIDE_TIPS_KEY, '1');
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden shrink-0"
        >
          <div className="mx-4 mt-2 mb-1 px-4 py-3 rounded-xl bg-brand-blue/[0.05] border border-brand-blue/20 flex items-start gap-3">
            {/* Icon */}
            <span className="text-base shrink-0 mt-0.5">💡</span>

            {/* Tips */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider mb-2">
                Gợi ý sử dụng
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-1.5 gap-x-4">
                {TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    {tip.icon}
                    <span className="text-[11px] text-slate-600 dark:text-white/60 leading-snug">
                      {tip.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all shrink-0"
              title="Đóng gợi ý"
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SlideHelpBanner;
