import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { 
  ChevronLeft, Play, Zap, MonitorPlay, 
  Film, Sparkles, Gamepad, BrainCircuit,
  Terminal, Activity, Workflow, LayoutGrid, 
  Plus, Maximize2, ShieldCheck, Box, X
} from 'lucide-react';
import GameArchitectInterface from '../components/GameArchitectInterface';

const ProductGame1 = () => {
  const solution = SOLUTIONS.find(s => s.id === 'NEURAL-GAME-ARCH');
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <div className="h-16 border-b border-black/10 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-600 dark:text-white/70">Architect_Terminal // Neural_Logic_v1.0.4</span>
             </div>
             <button onClick={() => setIsStudioOpen(false)} className="w-10 h-10 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-all">
                <X size={18} />
             </button>
        </div>
        <div className="flex-grow h-[calc(100vh-64px)]">
           <GameArchitectInterface />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden selection:bg-emerald-500/30 transition-colors duration-500 pb-32">
      
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#10b98108_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,_#10b98115_0%,_transparent_50%)]"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <section className="min-h-[85vh] flex flex-col justify-center py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-10">
                <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-emerald-500 transition-all group rounded-full">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back to Marketplace</span>
                </Link>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-emerald-500">
                      <BrainCircuit size={32} />
                      <span className="text-[14px] font-black uppercase tracking-[0.8em] opacity-60 italic">NEURAL_GAME_ARCH_V1</span>
                   </div>
                   <h1 className="text-7xl lg:text-[120px] font-black uppercase tracking-tighter leading-[0.75] italic">
                     Game <br /> <span className="text-emerald-500">Architect.</span>
                   </h1>
                </div>
                
                <p className="text-2xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-emerald-500 pl-10 max-w-2xl italic">
                  "{solution.description[lang]}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-emerald-500 text-white px-16 py-8 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    Mở Logic Terminal <Play size={20} fill="currentColor" />
                 </button>
                 <div className="flex flex-col justify-center px-4 border-l border-black/10 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-emerald-500/60 tracking-widest italic">NEURAL WORLD BUILDING</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Procedural Logic Synthesis</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-gray-100 dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl rounded-sm group">
                  <img src={solution.imageUrl} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105" alt="Game Architect Hub" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10 space-y-2">
                     <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.5em]">World_Engine_v1.0</p>
                     <h3 className="text-3xl font-black italic text-black dark:text-white leading-tight uppercase tracking-tighter">Procedural Logic.</h3>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductGame1;
