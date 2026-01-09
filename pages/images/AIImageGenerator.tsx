import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Zap, Sparkles, 
  ArrowRight, Maximize2, Share2, 
  Layers, RefreshCw, Activity,
  MonitorPlay, LayoutGrid, Wand2,
  CheckCircle2, Download, Terminal,
  Cpu, Type, Sliders, Image as ImageIcon,
  // Fix: Added missing icons
  Settings2, Eraser, Palette, Scan
} from 'lucide-react';
import AIImageGeneratorWorkspace from '../../components/AIImageGeneratorWorkspace';

const AIImageGenerator = () => {
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <AIImageGeneratorWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#020203] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
           <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-blue/10 rounded-full blur-[200px]"></div>
           <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[200px]"></div>
        </div>

        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-5 space-y-10 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Sparkles size={14} /> Professional AI Studio
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[100px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Generate <br /> <span className="text-brand-blue">Images</span> in <br /> Seconds.
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-brand-blue pl-8">
                Describe your idea, upload references, and let AI create stunning visuals instantly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-brand-blue text-white px-12 py-6 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Create Image Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all bg-white/5 dark:bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                View Examples <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 relative order-1 lg:order-2">
             <div className="aspect-[16/10] bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-sm p-4 shadow-3xl overflow-hidden group transition-colors">
                <div className="flex h-full gap-4">
                   <div className="w-1/4 h-full border-r border-slate-100 dark:border-white/5 pr-4 space-y-4 opacity-40 group-hover:opacity-100 transition-opacity hidden md:block">
                      <div className="h-4 w-full bg-slate-100 dark:bg-white/10 rounded-sm"></div>
                      <div className="aspect-square w-full bg-slate-50 dark:bg-white/5 rounded-sm border border-dashed border-slate-200 dark:border-white/10"></div>
                      <div className="space-y-2 pt-4">
                         <div className="h-2 w-1/2 bg-slate-200 dark:bg-white/10 rounded-sm"></div>
                         <div className="h-8 w-full bg-brand-blue/10 rounded-sm border border-brand-blue/30"></div>
                      </div>
                   </div>
                   <div className="flex-grow bg-white dark:bg-black rounded-sm border border-brand-blue/10 relative overflow-hidden flex items-center justify-center transition-colors">
                      <img 
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600" 
                        className="w-full h-full object-cover grayscale opacity-40 transition-all duration-[3000ms] group-hover:grayscale-0 group-hover:opacity-60 group-hover:scale-105" 
                        alt="Creative Canvas" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-black/80 to-transparent opacity-60"></div>
                      <div className="absolute bottom-8 left-8 space-y-2">
                         <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-slate-900 dark:text-white">Visual Synthesis</h3>
                         <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.4em] italic">H100_Cluster_042_Active</p>
                      </div>
                      <Sparkles className="absolute top-6 right-6 text-brand-blue animate-pulse" size={32} />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-40 bg-slate-50 dark:bg-[#070708] border-y border-slate-100 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">The Production Path</h2>
             <p className="text-slate-400 dark:text-gray-500 uppercase text-[11px] font-black tracking-[0.5em]">01 → 02 → 03 Workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { s: '01', t: 'Describe Your Image', d: 'Write a prompt or enable Auto Mode for AI-powered optimization. Describe subjects, lighting, and mood.', i: <Type /> },
              { s: '02', t: 'Customize Settings', d: 'Choose model, ratio, resolution, and quantity. Inject visual DNA with reference images.', i: <Sliders /> },
              { s: '03', t: 'Generate & Download', d: 'AI creates high-fidelity images ready to use for your projects. Export in 4K resolution instantly.', i: <Download /> }
            ].map((step, i) => (
              <div key={i} className="p-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-sm relative group hover:border-brand-blue/30 transition-all shadow-sm">
                <div className="absolute top-4 right-8 text-5xl font-black italic text-black/[0.03] dark:text-white/5 group-hover:text-brand-blue/10 transition-colors">{step.s}</div>
                <div className="w-16 h-16 bg-brand-blue/5 dark:bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-10 rounded-sm group-hover:scale-110 transition-transform">
                   {React.cloneElement(step.i as React.ReactElement<any>, { size: 28 })}
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4 text-slate-900 dark:text-white">{step.t}</h4>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-bold uppercase text-xs tracking-widest leading-loose">"{step.d}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AUTO VS MANUAL MODE */}
      <section className="py-40 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#070709] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24">
           <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic text-center text-slate-900 dark:text-white">Adaptive Control</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="p-16 border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] rounded-sm space-y-8 group hover:border-brand-blue/30 transition-all shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-blue text-white rounded-full shadow-lg"><Zap size={24} fill="currentColor" /></div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Auto Mode</h3>
                 </div>
                 <ul className="space-y-4">
                    {['AI optimizes prompt structures', 'Automatic setting selection', 'Perfect for rapid exploration', 'Beginner-friendly workflow'].map(item => (
                       <li key={item} className="flex items-center gap-4 text-gray-400 text-sm font-bold uppercase tracking-widest">
                          <CheckCircle2 size={16} className="text-brand-blue" /> {item}
                       </li>
                    ))}
                 </ul>
              </div>
              <div className="p-16 border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] rounded-sm space-y-8 group hover:border-purple-500/30 transition-all shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-purple-600 text-white rounded-full shadow-lg"><Settings2 size={24} /></div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Manual Mode</h3>
                 </div>
                 <ul className="space-y-4">
                    {['Full creative autonomy', 'Precision setting controls', 'Advanced model weightings', 'Industrial studio workflow'].map(item => (
                       <li key={item} className="flex items-center gap-4 text-gray-400 text-sm font-bold uppercase tracking-widest">
                          <CheckCircle2 size={16} className="text-purple-500" /> {item}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="py-60 text-center relative overflow-hidden bg-white dark:bg-black border-t border-slate-100 dark:border-white/5 transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-brand-blue/5 rounded-full blur-[250px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
          <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white">Turn Ideas <br /> Into <span className="text-brand-blue">Images.</span></h2>
          <div className="space-y-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-brand-blue text-white px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(0,144,255,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              Start Generating Images <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Universal Credit Ready • Enterprise Privacy • Instant Export</p>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-20 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#050505] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-widest text-gray-500">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                 <span className="text-slate-900 dark:text-white text-lg tracking-tighter italic font-black uppercase">AI IMAGE GENERATOR</span>
              </div>
              <p className="max-w-xs text-center md:text-left opacity-50 font-bold leading-relaxed">Industrial-grade image synthesis for professionals. Powered by Skyverses neural infrastructure.</p>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-brand-blue transition-colors">Technical Docs</a>
              <a href="#" className="hover:text-brand-blue transition-colors">Privacy Registry</a>
              <a href="#" className="hover:text-brand-blue transition-colors">Support Node</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default AIImageGenerator;