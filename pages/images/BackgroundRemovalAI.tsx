
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, ShieldCheck, 
  Sparkles, ArrowRight, Upload, 
  Maximize2, Activity, ImageIcon,
  Eraser, Scissors, Layers, Clock, CheckCircle2
} from 'lucide-react';
import BackgroundRemovalWorkspace from '../../components/BackgroundRemovalWorkspace';
import { useLanguage } from '../../context/LanguageContext';

const BackgroundRemovalAI = () => {
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <BackgroundRemovalWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#020203] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
           <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-blue/10 rounded-full blur-[200px]"></div>
           <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-rose-600/10 rounded-full blur-[200px]"></div>
        </div>

        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-5 space-y-10 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Sparkles size={14} /> AI-Powered Edge Intelligence
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[100px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Magic <br /> <span className="text-brand-blue">Erase.</span> <br /> Seamless PNG.
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-brand-blue pl-8">
                Tách nền chuẩn xác đến từng sợi tóc. Hệ thống AI tự động xử lý mọi chi tiết phức tạp nhất để tạo ra tài sản hình ảnh sạch cho mọi dự án thiết kế.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-brand-blue text-white px-12 py-6 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Mở Studio Xóa Nền <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all bg-white/5 dark:bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                Xem Tài liệu <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 relative order-1 lg:order-2">
             <div className="aspect-[16/10] bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-sm p-4 shadow-3xl overflow-hidden group transition-colors">
                <div className="relative w-full h-full bg-white dark:bg-black rounded-sm border border-brand-blue/10 overflow-hidden flex items-center justify-center transition-colors">
                   <div className="absolute inset-0 grid grid-cols-2">
                      <img 
                        src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1600" 
                        className="w-full h-full object-cover" 
                        alt="Original" 
                      />
                      <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] flex items-center justify-center">
                         <img 
                          src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1600" 
                          className="w-full h-full object-cover mix-blend-screen" 
                          alt="Isolated" 
                         />
                      </div>
                   </div>
                   <div className="absolute inset-y-0 left-1/2 w-1 bg-brand-blue shadow-[0_0_20px_rgba(0,144,255,0.8)] z-20"></div>
                   <div className="absolute bottom-8 left-8 space-y-2 z-30">
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-lg">Precision Cut</h3>
                      <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.4em] italic">Segment_Core_v4.2_Active</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. SPEC SECTION */}
      <section className="py-40 bg-slate-50 dark:bg-[#070708] border-y border-slate-200 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-3xl">
             {[
               { t: 'Neural Segmentation', i: <Scissors />, d: 'Phân tách chủ thể và nền bằng mô hình học sâu hiện đại nhất.' },
               { t: 'High-Res Export', i: <Maximize2 />, d: 'Hỗ trợ xuất ảnh PNG không nền chất lượng 4K-8K siêu sắc nét.' },
               { t: 'Industrial Speed', i: <Zap />, d: 'Xử lý hình ảnh trong chưa đầy 2 giây nhờ hạ tầng H100.' },
               { t: 'Batch Processing', i: <Layers />, d: 'Tách nền hàng loạt hàng trăm ảnh phục vụ TMĐT và thiết kế.' }
             ].map((f, i) => (
               <div key={i} className="p-16 bg-white dark:bg-black space-y-8 group hover:bg-brand-blue/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                  <div className="w-14 h-14 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors rounded-sm shadow-sm">
                     {React.cloneElement(f.i as React.ReactElement<any>, { size: 24 })}
                  </div>
                  <div className="space-y-3">
                     <h4 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">{f.t}</h4>
                     <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.d}"</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BackgroundRemovalAI;
