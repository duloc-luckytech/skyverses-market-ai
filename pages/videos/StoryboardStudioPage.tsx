
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, ShieldCheck, 
  Sparkles, ArrowRight, Clapperboard, 
  Film, LayoutGrid, Terminal, Cpu, Activity,
  Camera
} from 'lucide-react';
import StoryboardStudioWorkspace from '../../components/StoryboardStudioWorkspace';
import { useLanguage } from '../../context/LanguageContext';

const StoryboardStudioPage = () => {
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-black animate-in fade-in duration-500">
        <StoryboardStudioWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-[#050506] min-h-screen text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-brand-blue/5 rounded-full blur-[250px] pointer-events-none"></div>
        
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-6 space-y-10 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Sparkles size={14} /> Industrial AI Script-to-Screen Engine
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[100px] font-black leading-[0.85] tracking-tighter italic uppercase">
                Direct Your <br /> <span className="text-brand-blue">World.</span>
              </h1>
              <p className="text-xl lg:text-3xl text-gray-400 font-medium leading-tight border-l-2 border-brand-blue pl-8">
                Biến kịch bản thành phân cảnh điện ảnh chỉ trong tích tắc. Tự động bóc tách, dàn dựng và sản xuất video nhất quán đa phân cảnh.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-brand-blue text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Launch Studio Pro <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-white hover:text-black transition-all bg-white/5 dark:bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                Watch Demo <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative order-1 lg:order-2">
             <div className="aspect-[16/10] bg-[#0a0a0c] border border-white/5 rounded-[2rem] p-12 shadow-3xl relative overflow-hidden transition-colors flex flex-col justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/10 to-transparent"></div>
                <Clapperboard size={120} strokeWidth={1} className="text-brand-blue opacity-20 animate-pulse" />
                <div className="absolute bottom-10 left-10 space-y-2">
                   <p className="text-[10px] font-black uppercase text-brand-blue tracking-[0.5em]">System_Design_v5.2</p>
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Storyboard_Core</h3>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SPECS GRID */}
      <section className="py-40 border-t border-white/5 bg-[#08080a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 shadow-3xl">
            {[
              { t: 'Script Analysis', i: <Terminal size={24}/>, d: 'AI phân tích ngữ nghĩa kịch bản để tự động bóc tách các nhịp phim quan trọng.' },
              { t: 'Visual Anchoring', i: <LayoutGrid size={24}/>, d: 'Đảm bảo nhân vật và bối cảnh đồng nhất 100% qua mọi phân cảnh kết xuất.' },
              { t: 'Dynamic Staging', i: <Camera size={24}/>, d: 'Tùy chỉnh góc máy, ánh sáng và nhịp độ điện ảnh cho từng frame hình.' },
              { t: 'Industrial Output', i: <Cpu size={24}/>, d: 'Hạ tầng H100 GPU mạnh mẽ cho phép kết xuất 4K mượt mà ở quy mô lớn.' }
            ].map((f, i) => (
              <div key={i} className="p-16 bg-black space-y-8 group hover:bg-brand-blue/[0.02] transition-all duration-500 border-r border-white/5 last:border-r-0">
                 <div className="w-14 h-14 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-brand-blue transition-colors rounded-sm shadow-sm">
                    {f.i}
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-2xl font-black uppercase tracking-tighter italic">{f.t}</h4>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.d}"</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StoryboardStudioPage;
