
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, User, Shirt, MapPin, Zap, CheckCircle2 } from 'lucide-react';

interface Step {
  title: string;
  desc: string;
  icon: React.ReactNode;
  image: string;
}

const STEPS: Step[] = [
  {
    title: "Bước 1: Chân dung gốc",
    desc: "Tải lên ảnh một người (toàn thân hoặc bán thân). Khuôn mặt và vóc dáng sẽ được AI 'khóa DNA' để đảm bảo sự nhất quán 100% trong mọi bộ đồ.",
    icon: <User className="text-blue-500" />,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Bước 2: Phối đồ linh hoạt",
    desc: "Chọn các bộ trang phục có sẵn (Outfit) hoặc tự thiết kế bằng cách chọn lẻ: Áo khoác, Áo trong, Quần, Giày... Bạn thậm chí có thể tự tải lên ảnh món đồ của riêng mình!",
    icon: <Shirt className="text-pink-500" />,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Bước 3: Bối cảnh & Tư thế",
    desc: "Đưa nhân vật của bạn đến Paris, đường phố Cyberpunk hoặc studio tối giản. Chọn tư thế model chuyên nghiệp để tạo ra những khung hình thời thượng.",
    icon: <MapPin className="text-emerald-500" />,
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd458ad20?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Bước 4: Kiến tạo & Hậu kỳ",
    desc: "Nhấn 'Generate' để AI bắt đầu quá trình tổng hợp. Sau đó, bạn có thể tải xuống 4K hoặc sử dụng 'Product Editor' để chỉnh sửa chi tiết từng pixel.",
    icon: <Zap className="text-orange-500" />,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop"
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
        {/* Visual Panel */}
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
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-12 bg-[#dfff1a]' : 'w-2 bg-white/30'}`} />
              ))}
            </div>
            <p className="text-white text-[10px] font-black uppercase tracking-[0.4em] italic opacity-60">Visual Guide // {currentStep + 1}</p>
          </div>
        </div>

        {/* Content Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between space-y-12">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl">
                {step.icon}
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-blue italic">Step 0{currentStep + 1}</h3>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic leading-none">{step.title}</h2>
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
                className="p-4 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 hover:text-brand-blue transition-colors disabled:opacity-20"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => {
                  if (currentStep === STEPS.length - 1) onClose();
                  else setCurrentStep(currentStep + 1);
                }}
                className="p-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full hover:scale-105 transition-all shadow-xl"
              >
                {currentStep === STEPS.length - 1 ? <CheckCircle2 size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>

            <button 
              onClick={onClose}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Skip Introduction
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
