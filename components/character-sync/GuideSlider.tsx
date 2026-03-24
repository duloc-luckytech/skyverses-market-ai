
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ArrowRight, Fingerprint } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    title: 'Lock Identity DNA',
    desc: 'Tải ảnh nhân vật và đặt tên (CHỮ HOA) để AI neo giữ định danh xuyên suốt các cảnh quay.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Script Logic Binding',
    desc: 'Viết kịch bản có chứa tên nhân vật. AI sẽ tự động ánh xạ vào đúng gương mặt đã nạp.',
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop',
  },
];

interface GuideSliderProps {
  onOpenTemplates: () => void;
}

export const GuideSlider: React.FC<GuideSliderProps> = ({ onOpenTemplates }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-10">
      {/* Slide */}
      <div className="relative w-full max-w-lg aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.06] shadow-lg group">
        <AnimatePresence mode="wait">
          <motion.img key={current}
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6 }}
            src={slide.image}
            className="w-full h-full object-cover grayscale opacity-30 dark:opacity-15" />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a0a0c] via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <motion.div key={current + 'text'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">{slide.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">{slide.desc}</p>
          </motion.div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <div key={i} className={`h-1 transition-all duration-500 rounded-full ${i === current ? 'w-8 bg-purple-500' : 'w-2 bg-slate-300 dark:bg-white/10'}`} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Hoặc bắt đầu nhanh với</p>
        <button onClick={onOpenTemplates}
          className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3">
          <Wand2 size={16} />
          Sử dụng Template
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400 dark:text-slate-500">
          <Fingerprint size={11} className="text-purple-400" />
          Identity Locking Engine
        </div>
      </div>
    </div>
  );
};
