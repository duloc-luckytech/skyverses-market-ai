
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X, Info, ImagePlay } from 'lucide-react';
import { SLIDE_STYLES, SLIDE_COUNT_OPTIONS } from '../../hooks/useSlideStudio';
import { Language } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deckTopic: string;
  deckStyle: string;
  deckLanguage: Language;
  slideCount: number;
  isGenerating: boolean;
  imageDeckMode?: boolean;
}

const AIGenerateModal: React.FC<Props> = ({
  isOpen, onClose, onConfirm,
  deckTopic, deckStyle, deckLanguage, slideCount, isGenerating, imageDeckMode,
}) => {
  const styleLabel = SLIDE_STYLES.find(s => s.id === deckStyle)?.label ?? deckStyle;
  const langLabel = { vi: 'Tiếng Việt', en: 'English', ko: '한국어', ja: '日本語' }[deckLanguage] ?? deckLanguage;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                  <Sparkles size={15} className="text-brand-blue" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tạo toàn bộ Deck</h3>
                  <p className="text-[10px] text-slate-400 dark:text-white/30">
                    {imageDeckMode
                      ? 'Chỉ tạo ảnh AI fullscreen · Không có text'
                      : 'AI sẽ tạo nội dung + ảnh nền cho mỗi slide'
                    }
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors">
                <X size={15} className="text-slate-400" />
              </button>
            </div>

            {/* Summary */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Chủ đề', value: deckTopic.length > 40 ? deckTopic.slice(0, 40) + '...' : deckTopic },
                  { label: 'Số slides', value: `${slideCount} slides` },
                  { label: 'Phong cách', value: styleLabel },
                  { label: 'Ngôn ngữ', value: langLabel },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/30 mb-1">{item.label}</p>
                    <p className="text-[12px] font-semibold text-slate-700 dark:text-white/80">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Image Deck Mode badge */}
              {imageDeckMode && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-500/[0.08] border border-violet-500/30 mb-3">
                  <ImagePlay size={13} className="text-violet-500 shrink-0" />
                  <p className="text-[11px] text-violet-700 dark:text-violet-300 font-semibold">
                    🎨 Image Deck Mode — AI sẽ tự động tạo <strong>{slideCount} ảnh fullscreen</strong> ngay sau khi sinh outline xong.
                  </p>
                </div>
              )}

              {/* Info note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-brand-blue/[0.05] border border-brand-blue/20">
                <Info size={13} className="text-brand-blue mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-600 dark:text-white/60 leading-relaxed">
                  {imageDeckMode
                    ? <>AI sinh outline → tự động gen <strong>{slideCount} ảnh AI</strong> cho mỗi slide. Không có text block — thuần visual.</>  
                    : <>AI sẽ sinh <strong>{slideCount} slides</strong> kèm nội dung và ảnh nền riêng cho từng slide. Slide hiện ra ngay khi xong — <strong>hoàn toàn miễn phí</strong>.</>
                  }
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[12px] font-medium text-slate-600 dark:text-white/60 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
              >
                Huỷ
              </button>
              <motion.button
                onClick={onConfirm}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[12px] font-bold shadow-lg transition-all disabled:opacity-50 ${
                  imageDeckMode
                    ? 'bg-violet-600 shadow-violet-500/20 hover:bg-violet-600/90'
                    : 'bg-brand-blue shadow-brand-blue/20 hover:bg-brand-blue/90'
                }`}
              >
                {isGenerating
                  ? <><Loader2 size={13} className="animate-spin" /> Đang tạo...</>
                  : imageDeckMode
                    ? <><ImagePlay size={13} /> Tạo Image Deck</>
                    : <><Sparkles size={13} /> Bắt đầu tạo</>
                }
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIGenerateModal;
