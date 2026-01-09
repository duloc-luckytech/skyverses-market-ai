
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Zap, Sparkles, Settings2, Activity, 
  Layers, Maximize2, Download, 
  Wand2, Palette, Box, Scan, 
  CheckCircle2, Eraser, Frame, Scissors,
  Share2, ArrowRight, Terminal, Upload,
  ChevronLeft, Move, Check
} from 'lucide-react';
import ProductImageWorkspace from '../../components/ProductImageWorkspace';

const ProductImage = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'product-image');
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (!solution) return null;

  return (
    <div className="bg-white dark:bg-[#050505] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-cyan-500/30 transition-colors duration-500">
      
      <ProductImageWorkspace isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full z-10 space-y-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} /> The New Era of Design
                </div>
              </div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-6xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] text-slate-900 dark:text-white"
            >
              AI Image Creation, <br /> <span className="text-cyan-500">Reimagined.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-500 dark:text-gray-400 font-medium leading-relaxed"
            >
              Generate and edit professional images using AI-powered tools — all in one creative studio.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 pt-4"
            >
              <button onClick={() => setIsStudioOpen(true)} className="bg-cyan-500 text-white dark:text-black px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs shadow-[0_20px_50px_rgba(6,182,212,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3">
                Start Creating Images <ArrowRight size={18} />
              </button>
              <button className="px-10 py-5 border border-slate-200 dark:border-white/10 rounded-full font-black uppercase tracking-widest text-xs text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all backdrop-blur-md">
                View Demo
              </button>
            </motion.div>
          </div>

          {/* MOCK EDITOR UI */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1 }}
            className="relative max-w-6xl mx-auto border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-2xl rounded-xl shadow-[0_40px_120px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Toolbar Top */}
            <div className="h-12 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between px-6">
              <div className="flex items-center gap-4 text-slate-400 dark:text-gray-400">
                <Box size={14} /> <Move size={14} /> <Scissors size={14} /> <Frame size={14} /> <Palette size={14} />
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-500">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div> Node_042_Active
              </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-grow">
              <div className="flex-grow aspect-video lg:aspect-auto bg-slate-100 dark:bg-[#0a0a0c] relative group overflow-hidden flex items-center justify-center p-12 transition-colors">
                 <div className="relative max-w-2xl w-full shadow-2xl rounded-sm overflow-hidden border border-slate-200 dark:border-white/5">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale opacity-80" alt="Studio Preview" />
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="w-16 h-16 rounded-full bg-cyan-500/80 backdrop-blur-md flex items-center justify-center shadow-2xl text-white">
                          <Maximize2 />
                       </div>
                    </div>
                 </div>
                 <div className="absolute top-10 right-10 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 p-3 rounded-lg flex items-center gap-3 animate-bounce">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-500"><Scan size={16}/></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Enhanced_Resolution: 4K</span>
                 </div>
              </div>
            </div>

            {/* Prompt Bar Bottom */}
            <div className="h-24 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-6 flex items-center gap-6">
              <div className="flex-grow relative">
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 dark:text-cyan-500" size={16} />
                <input 
                  disabled
                  placeholder="A cinematic portrait of a cybernetic knight in a rainy forest..."
                  className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-full py-4 pl-12 pr-6 text-sm font-bold text-slate-400 italic"
                />
              </div>
              <button onClick={() => setIsStudioOpen(true)} className="bg-slate-900 dark:bg-white text-white dark:text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-all"><Zap size={20} fill="currentColor"/></button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CORE FEATURES */}
      <section className="py-40 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="text-center space-y-4 mb-24">
              <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Powered for Production</h2>
              <p className="text-slate-400 dark:text-gray-500 uppercase text-[11px] font-black tracking-[0.5em]">Enterprise-Grade Visual Engine</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-2xl">
              {[
                { title: 'AI Generation', icon: <Wand2 />, desc: 'Convert advanced semantic directives into 8K high-fidelity assets.' },
                { title: 'Image Enhancement', icon: <Sparkles />, desc: 'Fix, sharpen, and upscale legacy images with zero artifacting.' },
                { title: 'Background Magic', icon: <Eraser />, desc: 'Precise foreground extraction and neural background synthesis.' },
                { title: 'Style Transfer', icon: <Palette />, desc: 'Inject complex art styles and lighting DNA into any source visual.' },
                { title: 'Neural Retouch', icon: <Scan />, desc: 'Automated high-end skin and texture correction for commercial use.' },
                { title: 'Batch Creation', icon: <Layers />, desc: 'Process multiple visual concept branches in a single orchestrator run.' }
              ].map((f, i) => (
                <div key={i} className="p-16 bg-white dark:bg-black space-y-8 group hover:bg-cyan-500/[0.02] transition-all duration-500">
                   <div className="w-14 h-14 border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-transparent flex items-center justify-center text-slate-400 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-500 group-hover:border-cyan-500 transition-all rounded-sm shadow-sm">
                      {React.cloneElement(f.icon as React.ReactElement<any>, { size: 24 })}
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">{f.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-gray-500 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.desc}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 3. FINAL CTA */}
      <section className="py-60 text-center relative overflow-hidden bg-white dark:bg-black border-t border-slate-200 dark:border-white/5 transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-cyan-500/5 dark:bg-cyan-500/[0.04] rounded-full blur-[250px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white">Turn Ideas <br /> Into <span className="text-cyan-500">Stunning Images.</span></h2>
           <button onClick={() => setIsStudioOpen(true)} className="bg-slate-900 dark:bg-white text-white dark:text-black px-24 py-8 rounded-full text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95 transition-all rounded-full flex items-center gap-6 mx-auto group">
              Launch AI Image Studio <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
           </button>
        </div>
      </section>
    </div>
  );
};

export default ProductImage;
