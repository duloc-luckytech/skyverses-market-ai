
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SOLUTIONS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { 
  ChevronLeft, Zap, ShieldCheck, Cpu, 
  Database, ArrowRight, Box, Activity, 
  FileJson, Sliders, Code2, Binary, 
  Lock as LockIcon, Workflow, RefreshCw,
  Download, Share2, Maximize2
} from 'lucide-react';
import SintaxWorkspace from '../components/SintaxWorkspace';

const ProductSintax = () => {
  const solution = SOLUTIONS.find(s => s.id === 'SINTAX-BUILDER-V1');
  const { lang, t } = useLanguage();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderImages = [
    "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1600"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  if (!solution) return null;

  if (isWorkspaceOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#050505] animate-in fade-in duration-500">
        <SintaxWorkspace onClose={() => setIsWorkspaceOpen(false)} />
      </div>
    );
  }

  return (
    <div className="pt-24 bg-[#fdfdfe] dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden selection:bg-brand-blue/30 transition-colors duration-500 pb-32 relative">
      
      {/* --- BACKGROUND GRID SYSTEM --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]" 
             style={{ 
               backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', 
               backgroundSize: '120px 120px' 
             }}>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-16 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="min-h-[85vh] flex flex-col justify-center py-10 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            
            {/* LEFT COLUMN: BRANDING & INTENT */}
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              
              <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-400 hover:text-brand-blue transition-all group rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md w-fit">
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Infrastructure Hub</span>
              </Link>

              <div className="space-y-6">
                {/* VERSION TAG */}
                <div className="flex items-center gap-4 text-brand-blue font-mono font-black italic">
                  <div className="flex flex-col text-[10px] leading-none">
                    <span>01</span>
                    <span>10</span>
                  </div>
                  <span className="text-[16px] uppercase tracking-[0.6em]">SINTAX CORE V1.4</span>
                </div>

                {/* MAIN TITLE - ITALIC BLACK MASSIVE */}
                <h1 className="text-7xl lg:text-[150px] font-black uppercase tracking-tighter leading-[0.75] italic block drop-shadow-sm">
                  SINTAX <br /> <span className="text-brand-blue">BUILDER.</span>
                </h1>

                {/* SLOGAN & DESCRIPTION */}
                <div className="space-y-10 max-w-2xl pt-4">
                  <p className="text-3xl lg:text-6xl text-gray-400 dark:text-gray-500 font-medium leading-[1.05] italic border-l-4 border-brand-blue pl-8">
                    “The Industrial Standard for Prompt Architecture.”
                  </p>
                  
                  <p className="text-sm lg:text-base text-gray-400 dark:text-gray-600 font-black uppercase tracking-[0.2em] leading-relaxed max-w-xl">
                    Architect deterministic AI agents with structured logic nodes instead of raw text. 
                    Design, validate, and scale your semantic blueprints.
                  </p>
                </div>
              </div>

              {/* CTA AREA */}
              <div className="flex flex-col sm:flex-row gap-10 pt-8 items-center">
                 <button 
                   onClick={() => setIsWorkspaceOpen(true)} 
                   className="bg-brand-blue text-white px-20 py-10 text-[13px] font-black uppercase tracking-[0.3em] shadow-[0_30px_90px_rgba(0,144,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-16 rounded-sm group relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    LAUNCH SINTAX WORKSTATION 
                    <Zap size={22} fill="currentColor" className="animate-pulse" />
                 </button>
                 
                 <div className="flex flex-col justify-center px-8 border-l border-black/10 dark:border-white/10 h-20">
                    <p className="text-[10px] font-black uppercase text-brand-blue/60 tracking-widest italic">MODULAR LOGIC</p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.1em] font-black">BLUEPRINT-FIRST ARCHITECTURE</p>
                 </div>
              </div>
            </div>

            {/* RIGHT COLUMN: THE IMAGE SLIDER */}
            <div className="lg:col-span-5 w-full animate-in fade-in slide-in-from-right-12 duration-1000">
               <div className="aspect-[4/5] bg-white dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.08)] dark:shadow-[0_50px_120px_rgba(0,0,0,0.8)] rounded-sm group ring-1 ring-black/5 dark:ring-white/5">
                  
                  {/* Image Slides */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      <img src={sliderImages[currentSlide]} className="w-full h-full object-cover grayscale-[0.3] opacity-20 dark:opacity-40" alt="System Preview" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdfe] dark:from-[#020203] via-transparent to-transparent opacity-90"></div>
                    </motion.div>
                  </AnimatePresence>

                  {/* HUD Elements Overlay */}
                  <div className="absolute inset-0 p-12 flex flex-col justify-between pointer-events-none z-20">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                           <div className="w-4 h-4 bg-brand-blue rounded-full animate-pulse shadow-[0_0_15px_rgba(0,144,255,0.6)]"></div>
                           <span className="text-[12px] font-black uppercase tracking-[0.5em] text-black/30 dark:text-white/30 italic">SYSTEM_VIEW_ACTIVE</span>
                        </div>
                     </div>
                     
                     <div className="space-y-12">
                        <div className="h-1.5 w-24 bg-brand-blue/40"></div>
                        <div className="space-y-8">
                           {[
                             { label: 'LOGIC STABILITY', val: '99.9%' },
                             { label: 'DEVELOPMENT SPEED', val: '4.5x' },
                             { label: 'TOKEN EFFICIENCY', val: '32%' }
                           ].map((stat, i) => (
                             <div key={i} className="space-y-2 border-b border-black/5 dark:border-white/5 pb-6">
                               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                               <p className="text-6xl font-black italic tracking-tighter text-black dark:text-white">{stat.val}</p>
                             </div>
                           ))}
                           <div className="pt-6">
                             <p className="text-[11px] font-black text-brand-blue uppercase tracking-[0.4em] mb-3">SYSTEM SPEC</p>
                             <p className="text-4xl font-black italic text-black dark:text-white tracking-tighter">PLAIN / JSON / SPEC</p>
                           </div>
                        </div>
                     </div>

                     {/* Pagination indicators */}
                     <div className="flex justify-center gap-3">
                        {sliderImages.map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1 transition-all duration-700 rounded-full ${i === currentSlide ? 'w-16 bg-brand-blue' : 'w-3 bg-black/10 dark:bg-white/10'}`} 
                          />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- WORKFLOW NODES --- */}
        <section className="py-40 border-t border-black/5 dark:border-white/5 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
             <div className="lg:col-span-4 space-y-10">
                <div className="space-y-6">
                   <div className="flex items-center gap-3 text-brand-blue">
                      <Workflow size={28} />
                      <span className="text-[11px] font-black uppercase tracking-[0.6em]">Workflow_Node</span>
                   </div>
                   <h2 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic leading-none">Industrial <br /> <span className="text-brand-blue">Lifecycle.</span></h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xl leading-relaxed font-medium uppercase tracking-[0.1em]">
                  Standardize your creative output. SINTAX transforms prompting into a deterministic engineering lifecycle.
                </p>
                <div className="pt-10">
                   <button onClick={() => setIsWorkspaceOpen(true)} className="group flex items-center gap-6 text-brand-blue text-[13px] font-black uppercase tracking-widest hover:gap-10 transition-all underline underline-offset-[12px] decoration-brand-blue/30 italic">
                      Open Station Alpha <ArrowRight size={20} />
                   </button>
                </div>
             </div>
             <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
                {[
                  { step: '01', label: 'Atomic Node Design', icon: <Box size={24} />, desc: 'Define independent logic nodes (Persona, Constraints, Context) to minimize interference.' },
                  { step: '02', label: 'Variable Injection', icon: <Sliders size={24} />, desc: 'Dynamically link project DNA {{brand_identity}} across multiple pipeline stages.' },
                  { step: '03', label: 'Neural Stress-Test', icon: <Activity size={24} />, desc: 'Audit prompt architecture for semantic ambiguity and token efficiency.' },
                  { step: '04', label: 'Universal Export', icon: <FileJson size={24} />, desc: 'Publish production-ready RAW specifications or JSON manifests into enterprise pipelines.' }
                ].map((item) => (
                  <div key={item.step} className="p-16 lg:p-20 bg-white dark:bg-[#08080a] space-y-12 group hover:bg-brand-blue/[0.01] transition-all duration-700">
                    <div className="flex justify-between items-start">
                       <span className="text-5xl font-black text-brand-blue italic opacity-40 group-hover:opacity-100 transition-opacity">{item.step}</span>
                       <div className="p-5 border border-black/10 dark:border-white/10 text-gray-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all">
                          {item.icon}
                       </div>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-3xl font-black uppercase tracking-tighter italic">{item.label}</h4>
                       <p className="text-[15px] text-gray-500 font-medium leading-relaxed opacity-80 uppercase tracking-widest leading-loose">"{item.desc}"</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* --- SYSTEM SPECIFICATIONS --- */}
        <section className="py-40 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center border-t border-black/5 dark:border-white/5">
           <div className="space-y-16">
              <div className="space-y-6">
                 <h2 className="text-6xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">Industrial Node <br /> Specifications.</h2>
              </div>
              <div className="space-y-6">
                 {[
                   { l: 'Reasoning Core', v: 'Gemini 3 Pro + Flash v1.4', icon: <Cpu size={16}/> },
                   { l: 'Analysis Engine', v: 'H100 Parallel Manifesting', icon: <Database size={16}/> },
                   { l: 'Vault Protocol', v: 'AES-256 VPC Isolation', icon: <LockIcon size={16}/> },
                   { l: 'Export Modality', v: 'JSON, RAW, SDK-Ready', icon: <Code2 size={16}/> }
                 ].map(stat => (
                    <div key={stat.l} className="flex justify-between items-center border-b border-black/5 dark:border-white/10 pb-6 group hover:border-brand-blue transition-colors">
                       <div className="flex items-center gap-4">
                          <span className="text-brand-blue group-hover:scale-125 transition-transform">{stat.icon}</span>
                          <span className="text-[13px] font-black uppercase text-gray-500 group-hover:text-brand-blue transition-colors tracking-widest">{stat.l}</span>
                       </div>
                       <span className="text-[16px] font-black uppercase italic text-black dark:text-white">{stat.v}</span>
                    </div>
                 ))}
              </div>
           </div>
           <div className="p-20 border border-black/10 dark:border-white/10 bg-black shadow-2xl relative overflow-hidden group rounded-sm">
              <div className="absolute inset-0 bg-brand-blue/5 animate-pulse"></div>
              <ShieldCheck className="w-20 h-20 text-brand-blue mb-12 relative z-10" />
              <div className="space-y-6 relative z-10">
                 <h3 className="text-5xl font-black uppercase italic tracking-tighter text-white">Enterprise Privacy.</h3>
                 <p className="text-gray-500 text-base font-medium leading-relaxed uppercase tracking-widest leading-loose">
                    SINTAX is optimized for high-security environments. Your proprietary prompts and business logic never leave your designated node. 
                    Zero trace policy for every architectural build.
                 </p>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default ProductSintax;
