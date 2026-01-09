
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, Zap, MonitorPlay, 
  Film, Sparkles, Layers, ArrowRight,
  ShieldCheck, Terminal, Activity,
  Crown, FastForward, Repeat, Palette,
  // Added Workflow to fix icon error on line 100
  Workflow
} from 'lucide-react';
import MotionGenWorkspace from '../../components/MotionGenWorkspace';

const MotionGenProduct = () => {
  const solution = SOLUTIONS.find(s => s.id === 'MOTION-1-PRO');
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <MotionGenWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden selection:bg-blue-500/30 transition-colors duration-500 pb-32">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#3b82f608_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,_#3b82f612_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* HERO SECTION */}
        <section className="min-h-[85vh] flex flex-col justify-center py-10 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-10">
                <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-blue-500 transition-all group rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md shadow-sm">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back to Marketplace</span>
                </Link>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-blue-500">
                      <Sparkles size={32} />
                      <span className="text-[14px] font-black uppercase tracking-[0.8em] opacity-60 italic">MOTION_GEN_v1.0</span>
                   </div>
                   <h1 className="text-6xl lg:text-[120px] font-black uppercase tracking-tighter leading-[0.75] italic">
                     Motion <br /> <span className="text-blue-500">1.0.</span>
                   </h1>
                </div>
                
                <p className="text-xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-blue-500 pl-10 max-w-2xl italic">
                  “{solution.description[lang]}”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-blue-600 text-white px-16 py-8 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    Open Motion Studio <Play size={20} fill="currentColor" />
                 </button>
                 <div className="flex flex-col justify-center px-4 border-l border-black/10 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-blue-600/60 tracking-widest italic">INTERPOLATION ENGINE</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Frame-to-Frame Sync</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-gray-100 dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl rounded-sm group">
                  <img src={solution.imageUrl} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105" alt="Motion Hub" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10 space-y-2">
                     <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.5em]">Sequence_Gen_v1.0</p>
                     <h3 className="text-3xl font-black italic text-black dark:text-white leading-tight uppercase tracking-tighter">Dynamic Flow.</h3>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- INDUSTRIAL FEATURES --- */}
        <section className="py-32 border-t border-black/5 dark:border-white/5">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
              {[
                { title: 'Start & End Lock', icon: <Repeat />, desc: 'Define exactly how your video begins and ends for perfect looping and narrative control.' },
                { title: 'Temporal Extension', icon: <FastForward />, desc: 'Extend high-quality videos by an additional 7 seconds with zero-drift identity consistency.' },
                { title: 'Semantic Motion', icon: <Zap />, desc: 'Describe complex physical interactions using natural language directives.' },
                { title: 'VPC Security', icon: <ShieldCheck />, desc: 'All rendering nodes are sandbox-isolated for complete IP protection and data sovereignty.' },
                { title: 'H100 Parallelism', icon: <Layers />, desc: 'Parallel neural synthesis allows for high-throughput batch production of motion assets.' },
                { title: 'SDK Integrated', icon: <Workflow />, desc: 'Direct API endpoints for automated industrial pipelines and creative toolchains.' }
              ].map((f, i) => (
                <div key={i} className="p-16 bg-white dark:bg-[#08080a] space-y-8 group hover:bg-blue-500/[0.01] transition-all duration-500 border-r border-black/5 dark:border-white/5 last:border-r-0">
                   <div className="w-14 h-14 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:border-blue-500 transition-all rounded-sm shadow-xl">
                      {React.cloneElement(f.icon as React.ReactElement<any>, { size: 24 })}
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-2xl font-black uppercase tracking-tighter italic">{f.title}</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.desc}"</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* --- CONVERSION --- */}
        <section className="py-60 text-center relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/[0.03] rounded-full blur-[200px] pointer-events-none"></div>
           <div className="max-w-4xl mx-auto space-y-12 relative z-10">
              <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-black dark:text-white">
                Initiate <br /> <span className="text-blue-500">Motion.</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-blue-600 text-white px-24 py-8 text-sm font-black uppercase tracking-[0.6em] shadow-[0_20px_60px_rgba(59,130,246,0.2)] hover:scale-105 active:scale-95 transition-all rounded-sm italic">
                    Launch Motion Studio
                 </button>
                 <Link to="/booking" className="px-24 py-8 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-sm font-black uppercase tracking-[0.6em] transition-all rounded-sm italic">
                    Talk to Architect
                 </Link>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

export default MotionGenProduct;
