
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Play, Zap, ShieldCheck, 
  Sparkles, ArrowRight, UserCircle, 
  Shirt, Scan, Maximize2, Layers,
  Activity, Palette, MonitorPlay,
  Share2, Download, CheckCircle2,
  Cpu
} from 'lucide-react';
import AIStylistWorkspace from '../../components/AIStylistWorkspace';
import { useLanguage } from '../../context/LanguageContext';

const AIStylistPage = () => {
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-black animate-in fade-in duration-500">
        <AIStylistWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[250px] pointer-events-none"></div>
        
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-6 space-y-10 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Sparkles size={14} /> Next-Gen AI Fashion Production
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[100px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                The World is <br /> <span className="text-brand-blue">Your Studio.</span>
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-brand-blue pl-8">
                Upload your portrait once. Try on any outfit, change backgrounds, and choose poses instantly with the AI Stylist.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-brand-blue text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Launch Stylist Studio <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all backdrop-blur-md flex items-center justify-center gap-4">
                View Showreel <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative order-1 lg:order-2">
             <div className="aspect-[3/4] bg-slate-100 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-[3rem] p-12 shadow-3xl relative overflow-hidden transition-colors flex flex-col justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/10 to-transparent"></div>
                <div className="relative z-10 w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 rotate-3">
                   <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Stylist Mockup" />
                   <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-1">Active Synthesis</p>
                      <h4 className="text-xl font-black uppercase italic leading-none">VIRTUAL_FIT_042</h4>
                   </div>
                </div>
                <div className="absolute top-10 right-10 flex flex-col gap-3">
                   {[1,2,3].map(i => <div key={i} className="w-12 h-12 rounded-full bg-white dark:bg-white/5 border border-white/10 shadow-xl"></div>)}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. CAPABILITIES GRID */}
      <section className="py-40 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#08080a] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">Bespoke Fashion Logic</h2>
             <p className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Identity Persistence // Multi-Modal Orchestration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-3xl">
            {[
              { t: 'Virtual Try-On', i: <Shirt size={24}/>, d: 'Apply any outfit to your uploaded model with perfect fabric physics.' },
              { t: 'Pose Transfer', i: <UserCircle size={24}/>, d: 'Select from an industrial library of poses or upload your own reference.' },
              { t: 'Environment Sync', i: <Layers size={24}/>, d: 'Instantly swap backgrounds with automated lighting and shadow matching.' },
              { t: 'Identity Lock', i: <Scan size={24}/>, d: 'Maintain consistent facial features and body type across every generation.' },
              { t: 'H100 Parallelism', i: <Cpu size={24}/>, d: 'Generate multiple outfit variations in seconds via high-throughput nodes.' },
              { t: 'Studio Quality', i: <MonitorPlay size={24}/>, d: 'High-fidelity 8K output ready for e-commerce and professional catalogs.' }
            ].map((f, i) => (
              <div key={i} className="p-16 bg-white dark:bg-black space-y-8 group hover:bg-brand-blue/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                 <div className="w-14 h-14 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors rounded-sm shadow-sm">
                    {f.i}
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-2xl font-black uppercase tracking-tighter italic">{f.t}</h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.d}"</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FINAL CALL TO ACTION */}
      <section className="py-60 text-center relative overflow-hidden bg-white dark:bg-black transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-brand-blue/5 rounded-full blur-[250px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white">Design Your <br /> <span className="text-brand-blue">Presence.</span></h2>
           <button onClick={() => setIsStudioOpen(true)} className="bg-slate-900 dark:bg-white text-white dark:text-black px-24 py-8 rounded-full text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(0,144,255,0.1)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group">
              Launch AI Stylist Studio <Zap size={24} fill="currentColor" />
           </button>
        </div>
      </section>

    </div>
  );
};

export default AIStylistPage;
