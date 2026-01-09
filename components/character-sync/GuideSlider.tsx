
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Wand2, Sparkles } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  desc: string;
  image: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: "Lock Identity DNA",
    desc: "Tải ảnh nhân vật và đặt tên (CHỮ HOA) để AI neo giữ định danh xuyên suốt các cảnh quay.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Script Logic Binding",
    desc: "Viết kịch bản có chứa tên nhân vật. AI sẽ tự động ánh xạ kịch bản vào đúng gương mặt đã nạp.",
    image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop"
  }
];

interface GuideSliderProps {
  onOpenTemplates: () => void;
}

export const GuideSlider: React.FC<GuideSliderProps> = ({ onOpenTemplates }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in duration-1000">
      <div className="relative w-full max-w-lg aspect-video rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/5 shadow-3xl group">
        <AnimatePresence mode="wait">
          <motion.img 
            key={current}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            src={slide.image}
            className="w-full h-full object-cover grayscale opacity-40 dark:opacity-20"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
           <motion.div 
             key={current + "text"}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-2"
           >
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">{slide.title}</h3>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed px-4">{slide.desc}</p>
           </motion.div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
           {SLIDES.map((_, i) => (
             <div key={i} className={`h-1 transition-all duration-500 rounded-full ${i === current ? 'w-8 bg-brand-blue' : 'w-2 bg-black/10 dark:bg-white/10'}`} />
           ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="space-y-2 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Hoặc bắt đầu nhanh với</p>
           <button 
             onClick={onOpenTemplates}
             className="px-12 py-5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full text-xs font-black uppercase tracking-[0.4em] text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-xl flex items-center gap-4 group"
           >
             <Wand2 size={18} className="group-hover:rotate-12 transition-transform" /> 
             SỬ DỤNG TEMPLATE
           </button>
        </div>
        
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400 tracking-widest">
           <Sparkles size={12} className="text-brand-blue animate-pulse" />
           Khám phá sức mạnh của Identity Locking
        </div>
      </div>
    </div>
  );
};
