
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, UserPlus, Type, Cpu,
  Sparkles, CheckCircle2, BookOpen, Fingerprint
} from 'lucide-react';

interface Step {
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent: string;
  tips: string[];
}

const STEPS: Step[] = [
  {
    title: "Khai báo Nhân vật",
    desc: "Tải lên hình ảnh mỏ neo (Anchor) cho từng nhân vật. AI sẽ dựa vào ảnh này để khóa vóc dáng và khuôn mặt xuyên suốt video.",
    icon: <UserPlus size={16} />,
    accent: "purple",
    tips: [
      "Nhấn nút + để thêm nhân vật từ Thư viện",
      "Đặt tên cho nhân vật (VD: LUNA, KAI)",
      "Tối đa 10 nhân vật cho mỗi dự án",
      "Ảnh rõ mặt sẽ cho kết quả tốt nhất"
    ]
  },
  {
    title: "Soạn thảo Kịch bản",
    desc: "Viết diễn biến câu chuyện. Dùng tên nhân vật viết HOA trong prompt để AI tự nhận diện.",
    icon: <Type size={16} />,
    accent: "blue",
    tips: [
      "Viết tên nhân vật bằng CHỮ HOA (VD: LUNA đang mỉm cười)",
      "Tên khớp sẽ được highlight tím trong prompt",
      "Paste nhiều đoạn cách dòng trống → auto tách thành nhiều cảnh",
      "Mỗi cảnh là một prompt riêng biệt"
    ]
  },
  {
    title: "Chọn Model & Cấu hình",
    desc: "Lựa chọn Model AI và tùy chỉnh thông số kỹ thuật phù hợp với nhu cầu.",
    icon: <Cpu size={16} />,
    accent: "emerald",
    tips: [
      "Chọn Family model (VEO, Kling...)",
      "Chọn phiên bản và chế độ phù hợp",
      "720p nhanh hơn, 1080p+ cần nạp gói",
      "Thời lượng 5s–10s tuỳ model hỗ trợ"
    ]
  },
  {
    title: "Kết xuất & Thành phẩm",
    desc: "Nhấn 'Tạo' để bắt đầu tổng hợp. Video hoàn thiện hiển thị bên phải để tải xuống.",
    icon: <Sparkles size={16} />,
    accent: "amber",
    tips: [
      "Có thể tạo nhiều phân cảnh cùng lúc",
      "Bật Auto-tải để tự download khi xong",
      "Tải tất cả video hoàn tất trong 1 click",
      "Video lỗi sẽ hoàn credits tự động"
    ]
  }
];

const ACCENT_MAP: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', ring: 'ring-purple-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', ring: 'ring-blue-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', ring: 'ring-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', ring: 'ring-amber-500/20' },
};

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const colors = ACCENT_MAP[step.accent] || ACCENT_MAP.purple;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-md bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white">
              <Fingerprint size={14} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white">Hướng dẫn Character Sync</h3>
              <p className="text-[9px] text-slate-400">Bước {currentStep + 1} / {STEPS.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-[2px] rounded-full flex-grow transition-all duration-500 ${i <= currentStep ? 'bg-purple-500' : 'bg-slate-200 dark:bg-white/[0.06]'}`} />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-5 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* Step icon + title */}
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}>
                  {step.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{step.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>

              {/* Tips list */}
              <div className={`rounded-xl border ${colors.border} bg-slate-50 dark:bg-white/[0.02] p-3 space-y-2`}>
                {step.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`w-4 h-4 rounded-md ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className="text-[8px] font-black">{i + 1}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="px-5 pb-5 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={14} /> Trước
          </button>

          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setCurrentStep(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentStep ? 'bg-purple-500 w-4' : 'bg-slate-300 dark:bg-slate-600 hover:bg-purple-400'}`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (currentStep === STEPS.length - 1) onClose();
              else setCurrentStep(currentStep + 1);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${
              currentStep === STEPS.length - 1
                ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg hover:brightness-110'
                : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
            }`}
          >
            {currentStep === STEPS.length - 1 ? (
              <><CheckCircle2 size={14} /> Hoàn tất</>
            ) : (
              <>Tiếp <ChevronRight size={14} /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
