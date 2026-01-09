
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Loader2, Lightbulb, ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles, Edit3 } from 'lucide-react';

interface StoryboardProgressModalProps {
  logs: string[];
  onClose: () => void;
}

const TIPS = [
  {
    id: 1,
    category: 'MÔ HÌNH AI',
    title: 'Model ảnh là gì?',
    desc: 'Model ảnh (Image Model) là mô hình AI chuyên tạo hình ảnh từ mô tả văn bản. Các model phổ biến: Flux, Midjourney, DALL-E... Mỗi model có phong cách riêng - Flux cho ảnh chân thực, Midjourney cho ảnh nghệ thuật.',
    icon: <ImageIcon size={32} />
  },
  {
    id: 2,
    category: 'KHÁI NIỆM',
    title: 'System Prompt là gì?',
    desc: 'System Prompt là lời nhắc nền hướng dẫn AI cách tạo kịch bản. Nó định nghĩa format đầu ra, phong cách viết, cấu trúc phân cảnh. Bạn có thể tùy chỉnh trong phần Thiết lập nâng cao.',
    icon: <Edit3 size={32} />
  },
  {
    id: 3,
    category: 'KHÁI NIỆM',
    title: 'Loại nhân vật tham chiếu',
    desc: '• Character: Nhân vật, người\n• Location: Địa điểm, bối cảnh\n• Object: Vật thể, đạo cụ\nMỗi loại sẽ được AI xử lý khác nhau để đảm bảo đồng nhất.',
    icon: <Sparkles size={32} />
  },
  {
    id: 4,
    category: 'KỸ THUẬT',
    title: 'Cách viết kịch bản tốt',
    desc: 'Hãy cung cấp đủ 3 yếu tố: Chủ thể, Hành động và Bối cảnh. AI sẽ hoạt động tốt nhất khi bạn mô tả chi tiết các góc máy và ánh sáng mong muốn.',
    icon: <Lightbulb size={32} />
  }
];

export const StoryboardProgressModal: React.FC<StoryboardProgressModalProps> = ({ logs, onClose }) => {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => setCurrentTip(prev => (prev + 1) % TIPS.length);
  const handlePrev = () => setCurrentTip(prev => (prev - 1 + TIPS.length) % TIPS.length);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-6xl aspect-[16/8] md:aspect-[16/7] overflow-hidden flex flex-col md:flex-row gap-6 pointer-events-none"
      >
        {/* LEFT: TERMINAL STREAM */}
        <div className="flex-grow flex flex-col bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto">
           <div className="h-14 bg-[#0d0d0f] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                 <Terminal size={18} className="text-brand-blue" />
                 <h3 className="text-[12px] font-black uppercase tracking-widest text-white/90 italic">Luồng thời gian thực</h3>
              </div>
              <div className="flex items-center gap-3">
                 <Loader2 size={16} className="text-brand-blue animate-spin" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue/60">Đang xử lý...</span>
              </div>
           </div>
           
           <div className="flex-grow p-8 font-mono text-[14px] leading-relaxed overflow-y-auto no-scrollbar bg-black/40">
              <div className="space-y-4">
                 {logs.map((log, i) => (
                   <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                      <p className="text-green-500 font-bold tracking-tight">
                        {log}
                        {i === logs.length - 1 && <span className="inline-block w-2 h-4 bg-green-500/50 ml-2 animate-pulse align-middle">_</span>}
                      </p>
                   </div>
                 ))}
                 {logs.length === 0 && (
                   <div className="flex gap-4">
                      <p className="text-green-500 font-bold tracking-tight">Đang kết nối...<span className="inline-block w-2 h-4 bg-green-500/50 ml-2 animate-pulse align-middle">_</span></p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* RIGHT: TIPS SLIDER */}
        <div className="w-full md:w-[420px] flex flex-col bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto">
           <div className="h-16 bg-[#111115] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue shadow-inner">
                    <Lightbulb size={20} />
                 </div>
                 <div className="space-y-0.5">
                   <h3 className="text-[12px] font-black uppercase tracking-widest text-white/90 italic leading-none">Mẹo sử dụng</h3>
                   <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Tìm hiểu trong khi chờ đợi</p>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
           </div>

           <div className="flex-grow p-8 flex flex-col justify-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                 <motion.div 
                   key={currentTip}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.4 }}
                   className="bg-white/[0.03] border border-white/5 p-8 rounded-[2rem] space-y-6 relative group"
                 >
                    <div className="flex justify-between items-start">
                       <span className="px-3 py-1 bg-white/10 border border-white/10 rounded text-[9px] font-black uppercase text-gray-400 tracking-widest">
                          {TIPS[currentTip].category}
                       </span>
                       <div className="text-brand-blue opacity-40 group-hover:opacity-100 transition-opacity">
                          {TIPS[currentTip].icon}
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <h4 className="text-xl font-black text-white italic tracking-tight">{TIPS[currentTip].title}</h4>
                       <p className="text-[13px] leading-relaxed text-gray-400 font-medium whitespace-pre-line">
                          {TIPS[currentTip].desc}
                       </p>
                    </div>
                 </motion.div>
              </AnimatePresence>
           </div>

           <div className="h-28 border-t border-white/5 px-8 flex flex-col items-center justify-center gap-4 shrink-0 bg-[#0a0a0d]">
              <div className="flex items-center justify-between w-full">
                 <button 
                   onClick={handlePrev} 
                   className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all flex items-center gap-2"
                 >
                    <ChevronLeft size={16} /> Trước
                 </button>
                 
                 <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                       {TIPS.map((_, i) => (
                         <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentTip ? 'bg-brand-blue' : 'bg-gray-700'}`}></div>
                       ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 ml-1">+10</span>
                 </div>

                 <button 
                   onClick={handleNext} 
                   className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all flex items-center gap-2"
                 >
                    Tiếp <ChevronRight size={16} />
                 </button>
              </div>
              <p className="text-[10px] font-black uppercase text-gray-700 tracking-widest">{currentTip + 1} / 15 mẹo</p>
           </div>
        </div>
      </motion.div>
    </div>
  );
};
