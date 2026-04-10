import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Zap, Sparkles } from 'lucide-react';

const WIZARD_KEY = 'skyverses_storyboard_wizard_done';

interface VideoType {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  placeholder: string;
}

const VIDEO_TYPES: VideoType[] = [
  { id: 'ads', emoji: '📢', label: 'Quảng cáo sản phẩm', hint: 'Clip ngắn giới thiệu & bán hàng', placeholder: 'VD: Giới thiệu túi xách da handmade cao cấp, nhấn mạnh chất liệu thật 100%, màu nâu bò sang trọng, phù hợp công sở...' },
  { id: 'realestate', emoji: '🏠', label: 'Bất động sản', hint: 'Giới thiệu căn hộ, nhà, đất', placeholder: 'VD: Căn hộ 2PN view sông Sài Gòn, tầng 18, nội thất cao cấp, gần trường học, tiện ích đầy đủ...' },
  { id: 'tiktok', emoji: '🎯', label: 'TikTok / Reels', hint: 'Video viral ngắn 15–60 giây', placeholder: 'VD: Mẹo tiết kiệm tiền mỗi tháng mà ai cũng có thể làm, dễ thực hiện, kết quả ngay sau 30 ngày...' },
  { id: 'story', emoji: '🎬', label: 'Phim / Câu chuyện', hint: 'Phim ngắn, brand story', placeholder: 'VD: Câu chuyện cô gái trẻ từ quê lên thành phố lập nghiệp, vượt qua khó khăn và tìm được thành công...' },
  { id: 'edu', emoji: '📚', label: 'Giáo dục / Hướng dẫn', hint: 'Tutorial, explainer video', placeholder: 'VD: Cách pha cà phê V60 chuẩn barista tại nhà, 5 bước đơn giản, dụng cụ dễ mua...' },
  { id: 'event', emoji: '🎉', label: 'Sự kiện / Lễ', hint: 'Recap sự kiện, lễ cưới, khai trương', placeholder: 'VD: Highlight lễ khai trương nhà hàng Phở Hà Nội, không khí vui tươi, ẩm thực phong phú, khách mời đông đủ...' },
];

interface OnboardingWizardProps {
  onComplete: (script: string) => void;
  onSkip: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<VideoType | null>(null);
  const [idea, setIdea] = useState('');

  const handleSelectType = (type: VideoType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleStart = () => {
    localStorage.setItem(WIZARD_KEY, '1');
    onComplete(idea.trim() || selectedType?.placeholder || '');
  };

  const handleSkip = () => {
    localStorage.setItem(WIZARD_KEY, '1');
    onSkip();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[900] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.96 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full sm:max-w-lg bg-white dark:bg-[#0e0e12] rounded-t-3xl sm:rounded-2xl border border-black/[0.06] dark:border-white/[0.06] shadow-2xl flex flex-col overflow-hidden max-h-[92dvh]"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {/* Step indicator */}
                <div className="flex gap-1">
                  {[1, 2].map(s => (
                    <div
                      key={s}
                      className={`h-1 rounded-full transition-all duration-300 ${s === step ? 'w-6 bg-brand-blue' : s < step ? 'w-3 bg-brand-blue/40' : 'w-3 bg-black/[0.08] dark:bg-white/[0.08]'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Bước {step}/2</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {step === 1 ? '👋 Bạn muốn tạo video gì?' : `🎬 Mô tả ý tưởng của bạn`}
              </h2>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                {step === 1
                  ? 'Chọn loại video để bắt đầu nhanh hơn'
                  : `Chủ đề: ${selectedType?.emoji} ${selectedType?.label}`}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto no-scrollbar px-6 pb-4">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-2"
              >
                {VIDEO_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleSelectType(type)}
                    className="flex flex-col items-start gap-1.5 p-3.5 rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.01] dark:bg-white/[0.02] hover:border-brand-blue/40 hover:bg-brand-blue/[0.04] dark:hover:bg-brand-blue/[0.08] transition-all text-left group"
                  >
                    <span className="text-xl">{type.emoji}</span>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-900 dark:text-white leading-tight">{type.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{type.hint}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <textarea
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                  placeholder={selectedType?.placeholder}
                  rows={5}
                  autoFocus
                  className="w-full px-4 py-3 text-sm bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] rounded-xl outline-none focus:border-brand-blue/50 transition-colors text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-brand-blue" />
                  Viết càng chi tiết, AI tạo storyboard càng chuẩn. Hoặc để trống để dùng ví dụ mẫu.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 shrink-0 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-3">
          <button
            onClick={step === 2 ? () => setStep(1) : handleSkip}
            className="text-[12px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            {step === 2 ? '← Quay lại' : 'Bỏ qua'}
          </button>

          {step === 2 && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-[12px] font-semibold shadow-lg shadow-brand-blue/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Zap size={13} fill="currentColor" />
              Bắt đầu tạo storyboard
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const shouldShowWizard = (): boolean => {
  return !localStorage.getItem(WIZARD_KEY);
};
