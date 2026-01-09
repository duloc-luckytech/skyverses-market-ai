
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, Zap, MonitorPlay, 
  Sparkles, ShieldCheck, Terminal, Activity, 
  LayoutGrid, ArrowRight, Video, Camera,
  Box, Maximize2, Cpu
} from 'lucide-react';
import MediaGeneratorWorkspace from '../../components/MediaGeneratorWorkspace';

const MediaGenerator = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'ai-media-generator');
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#020203] animate-in fade-in duration-500">
        <MediaGeneratorWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden transition-colors duration-500 pb-32">
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#0090ff08_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,_#0090ff12_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="min-h-[85vh] flex flex-col justify-center py-10 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-10">
                <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-brand-blue transition-all group rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md shadow-sm">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Media Infrastructure</span>
                </Link>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-brand-blue">
                      <Cpu size={32} className="animate-pulse" />
                      <span className="text-[14px] font-black uppercase tracking-[0.8em] opacity-60 italic">MEDIA_CORE_v3.2</span>
                   </div>
                   <h1 className="text-7xl lg:text-[130px] font-black uppercase tracking-tighter leading-[0.75] italic text-black dark:text-white">
                     Media <br /> <span className="text-brand-blue">Generator.</span>
                   </h1>
                </div>
                
                <p className="text-2xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-brand-blue pl-10 max-w-2xl italic">
                  “{solution.description[lang]}”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-brand-blue text-white px-16 py-8 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    MỞ WORKSTATION <Play size={20} fill="currentColor" />
                 </button>
                 <div className="flex flex-col justify-center px-4 border-l border-black/10 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-brand-blue/60 tracking-widest italic">SORA 2 & VEO 3</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Multi-Model Orchestration</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-gray-100 dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl rounded-sm group p-12 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="h-1 w-24 bg-brand-blue/40"></div>
                    <div className="space-y-8">
                       <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Model_Stability</span>
                          <span className="text-2xl font-black text-brand-blue italic">99.8%</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Rendering_Tier</span>
                          <span className="text-2xl font-black text-brand-blue italic">ULTRA_HD</span>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-brand-blue tracking-[0.5em]">SYSTEM INTERFACE</p>
                     <h3 className="text-3xl font-black italic text-black dark:text-white leading-tight uppercase tracking-tighter">Unified_Logic.</h3>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- INDUSTRIAL FLOW --- */}
        <section className="py-40 border-t border-black/5 dark:border-white/5 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
             <div className="lg:col-span-4 space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-brand-blue">
                      <Activity size={24} />
                      <span className="text-[10px] font-black uppercase tracking-[0.6em]">Production_Cycle</span>
                   </div>
                   <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">Neural <br /> <span className="text-brand-blue">Synthesis.</span></h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed font-medium uppercase tracking-widest">
                  Maximize your creative throughput with industrial-grade AI. The AI Media Generator provides direct control over the world's most capable foundation models.
                </p>
             </div>

             <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
                {[
                  { step: '01', label: 'Directive Ingestion', icon: <Terminal size={20} />, desc: 'Input complex creative directives for neural analysis and decomposition.' },
                  { step: '02', label: 'Model Selection', icon: <MonitorPlay size={20} />, desc: 'Choose the optimal model (Sora, Veo, or Imagen) for your specific target asset.' },
                  { step: '03', label: 'Kinetic Staging', icon: <Camera size={20} />, desc: 'Define virtual camera paths and temporal dynamics for cinematic results.' },
                  { step: '04', label: 'Master Export', icon: <Sparkles size={20} />, desc: 'Deliver production-grade 4K assets ready for global deployment.' }
                ].map((item) => (
                  <div key={item.step} className="p-12 lg:p-16 bg-white dark:bg-[#08080a] space-y-10 group hover:bg-brand-blue/[0.01] transition-all duration-700">
                    <div className="flex justify-between items-start">
                       <span className="text-4xl font-black text-brand-blue italic opacity-40 group-hover:opacity-100 transition-opacity">{item.step}</span>
                       <div className="p-4 border border-black/10 dark:border-white/10 text-gray-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all">
                          {item.icon}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-2xl font-black uppercase tracking-tighter italic">{item.label}</h4>
                       <p className="text-sm text-gray-500 font-medium leading-relaxed opacity-70 uppercase tracking-widest leading-loose">"{item.desc}"</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MediaGenerator;
