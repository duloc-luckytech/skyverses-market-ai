
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, UserPlus, Type, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

interface Step {
  title: string;
  desc: string;
  icon: React.ReactNode;
  image: string;
}

const STEPS: Step[] = [
  {
    title: "Bước 1: Khai báo Nhân vật",
    desc: "Tải lên các hình ảnh mỏ neo (Anchor) cho từng nhân vật. Bạn có thể đặt tên riêng cho họ (Ví dụ: LUNA, KAI). AI sẽ dựa vào những ảnh này để khóa vóc dáng và khuôn mặt.",
    icon: <UserPlus className="text-purple-500" />,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Bước 2: Soạn thảo Kịch bản",
    desc: "Viết diễn biến trong ô Prompt. QUAN TRỌNG: Hãy viết tên nhân vật bằng CHỮ HOA (Ví dụ: LUNA đang mỉm cười). AI sẽ tự động nhận diện và áp dụng định danh tương ứng.",
    icon: <Type className="text-blue-500" />,
    image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Bước 3: Chọn Model & Cấu hình",
    desc: "Lựa chọn Model xử lý phù hợp (VEO 3.1 cho chất lượng flagship). Tùy chỉnh độ phân giải, tỉ lệ khung hình và thời lượng video mong muốn.",
    icon: <Cpu className="text-emerald-500" />,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Bước 4: Kết xuất & Thành phẩm",
    desc: "Nhấn 'Tạo' để bắt đầu quá trình tổng hợp. Bạn có thể tạo nhiều phân cảnh cùng lúc. Video hoàn thiện sẽ hiển thị ở cột bên phải để tải xuống hoặc chỉnh sửa thêm.",
    icon: <Sparkles className="text-orange-500" />,
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop"
  }
];

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-5xl bg-white dark:bg-[#0c0c0e] rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col md:flex-row h-auto max-h-[90vh]"
      >
        <div className="w-full md:w-1/2 relative bg-slate-100 dark:bg-black overflow-hidden aspect-video md:aspect-auto">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentStep}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              src={step.image}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex gap-2 mb-4">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-12 bg-purple-500' : 'w-2 bg-white/30'}`} />
              ))}
            </div>
            <p className="text-white text-[10px] font-black uppercase tracking-[0.4em] italic opacity-60">System Guide // {currentStep + 1}</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between space-y-12">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl">
                {step.icon}
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-purple-500 italic">Character Sync Protocol</h3>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">{step.title}</h2>
              <p className="text-sm md:text-base text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight italic">
                "{step.desc}"
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-6 pt-10 border-t border-black/5 dark:border-white/5">
            <div className="flex gap-4">
              <button 
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="p-4 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 hover:text-purple-500 transition-colors disabled:opacity-20"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => {
                  if (currentStep === STEPS.length - 1) onClose();
                  else setCurrentStep(currentStep + 1);
                }}
                className="p-4 bg-purple-600 text-white rounded-full hover:scale-105 transition-all shadow-xl"
              >
                {currentStep === STEPS.length - 1 ? <CheckCircle2 size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>

            <button 
              onClick={onClose}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Bỏ qua giới thiệu
            </button>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors z-50">
          <X size={24} />
        </button>
      </motion.div>
    </div>
  );
};
