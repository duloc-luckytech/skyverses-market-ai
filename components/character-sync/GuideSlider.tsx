
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ArrowRight, Fingerprint, UserPlus, PenLine, Zap } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    title: 'Thêm nhân vật',
    desc: 'Tải ảnh nhân vật từ thư viện, đặt tên viết HOA để AI neo giữ định danh.',
    icon: <UserPlus size={20} className="text-purple-500" />,
  },
  {
    id: 2,
    title: 'Viết kịch bản',
    desc: 'Soạn nội dung từng cảnh. AI sẽ tạo video với nhân vật đã chọn.',
    icon: <PenLine size={20} className="text-blue-500" />,
  },
  {
    id: 3,
    title: 'Tạo video',
    desc: 'Nhấn Tạo để bắt đầu. Hình ảnh nhân vật được gửi làm tham chiếu cho AI.',
    icon: <Zap size={20} className="text-amber-500" />,
  },
];

interface GuideSliderProps {
  onOpenTemplates: () => void;
}

export const GuideSlider: React.FC<GuideSliderProps> = ({ onOpenTemplates }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % SLIDES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-8">
      {/* Slide */}
      <div className="relative w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-center">
              {slide.icon}
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">{slide.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">{slide.desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-1 transition-all duration-500 rounded-full ${i === current ? 'w-6 bg-purple-500' : 'w-1.5 bg-slate-300 dark:bg-white/10'}`}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hoặc bắt đầu nhanh</p>
        <button onClick={onOpenTemplates}
          className="group px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl text-[11px] font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2.5">
          <Wand2 size={14} />
          Sử dụng Template
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center gap-1.5 text-[8px] font-semibold text-slate-400 dark:text-slate-500">
          <Fingerprint size={10} className="text-purple-400" />
          Character Sync Engine
        </div>
      </div>
    </div>
  );
};
