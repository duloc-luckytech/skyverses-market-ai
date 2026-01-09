
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import CinematicPipelineInterface from '../components/CinematicPipelineInterface';
import { 
  ChevronLeft, Star, Zap, Cpu, ShieldCheck, 
  Layers, Sparkles, CheckCircle2,
  X, Play, Share2, Heart, Bot, Target, 
  Film, Clapperboard, MonitorPlay, Video, Info
} from 'lucide-react';

const ProductCinematicAgent = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'cinematic-pipeline-architect');
  const { lang } = useLanguage();
  
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (!solution) return null;

  return (
    <div className="pt-24 bg-white dark:bg-black min-h-screen text-black dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden transition-colors duration-500">
      
      {/* 1. AGENT MODAL */}
      {isDemoOpen && (
        <div className="fixed inset-0 z-[250] bg-white/98 dark:bg-black/98 flex flex-col animate-in fade-in duration-300">
          <div className="h-16 border-b border-black/10 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-600 dark:text-white/70">ACA-V2_Director // Studio_Pipeline_Terminal</span>
             </div>
             <button onClick={() => setIsDemoOpen(false)} className="w-10 h-10 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-all">
                <X size={18} />
             </button>
          </div>
          <div className="flex-grow overflow-hidden">
             <CinematicPipelineInterface />
          </div>
        </div>
      )}

      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-16">
          <div className="space-y-4">
            <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 hover:text-brand-blue transition-colors tracking-[0.2em]">
              <ChevronLeft size={14} /> Back to Repository
            </Link>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none">{solution.name[lang]}</h1>
                <div className="px-3 py-1 bg-brand-blue/10 border border-brand-blue/30 rounded-sm w-fit">
                   <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">Industrial_Film_Ops</span>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xl font-medium max-w-2xl leading-relaxed italic">"Transform character designs into full cinematic cutscenes without leaving the pipeline."</p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= 4 ? "currentColor" : "none"} />)}
                </div>
                <span className="text-[11px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">5.0 (CLASS_S_INFRASTRUCTURE)</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-gray-400 dark:text-gray-700 uppercase tracking-widest">Director Core Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsLiked(!isLiked)} className={`p-4 border transition-all rounded-full ${isLiked ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'border-black/10 dark:border-white/10 text-gray-400 hover:text-black dark:hover:text-white'}`}>
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button className="p-4 border border-black/10 dark:border-white/10 text-gray-400 hover:text-black dark:hover:text-white transition-all rounded-full"><Share2 size={20} /></button>
          </div>
        </div>

        {/* HERO WORKFLOW */}
        <section className="mb-24 relative group">
           <div className="aspect-[21/9] w-full bg-gray-100 dark:bg-[#080808] border border-black/5 dark:border-white/5 overflow-hidden relative shadow-2xl rounded-sm">
              <img src={solution.imageUrl} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105" alt="ACA Hub" />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                 <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex justify-center gap-4">
                       <Film className="w-12 h-12 text-brand-blue" />
                       <Clapperboard className="w-12 h-12 text-black/10 dark:text-white/10" />
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none italic text-black dark:text-white">Design. Animate. <br /> <span className="text-brand-blue">Direct.</span></h2>
                       <p className="text-gray-600 dark:text-gray-500 text-sm uppercase font-black tracking-widest">Autonomous Multi-Stage Cinematic Pipeline</p>
                    </div>
                    <button 
                      onClick={() => setIsDemoOpen(true)}
                      className="bg-brand-blue text-white px-12 py-6 text-xs font-black uppercase tracking-[0.4em] hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-[0_0_50px_rgba(0,144,255,0.2)] active:scale-[0.98] flex items-center gap-4 mx-auto group/btn"
                    >
                      Activate_Studio_Pipeline <Play size={16} className="fill-current group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>
           </div>
        </section>

        {/* SYSTEM ARCHITECTURE */}
        <section className="mb-32 grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                <div className="w-12 h-[2px] bg-brand-blue"></div> Full-Stack_Cinematics
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-medium">
                The Aether Cinematic Architect (ACA-V2) is the industry's first multi-stage pipeline designed for character-driven storytelling. It automates the complex journey from character profile to animated motion assets, and finally to orchestrated cinematic scenes. By maintaining a strict "Identity Anchor" across all 6 stages, it ensures that your protagonist looks and behaves consistently from the first close-up to the final action sequence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="p-8 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] space-y-4 rounded-sm">
                 <Target size={24} className="text-brand-blue" />
                 <h3 className="text-xl font-black uppercase tracking-tighter">Pipeline_Focus</h3>
                 <ul className="space-y-3">
                   {["Character foundation & identity locking.", "Autonomous animation blueprinting.", "Multi-shot cutscene script synthesis.", "Temporal scene-by-scene generation."].map(item => (
                     <li key={item} className="flex gap-4 items-start text-sm text-gray-500 dark:text-gray-600">
                        <CheckCircle2 size={16} className="text-brand-blue shrink-0 mt-0.5" />
                        <span>{item}</span>
                     </li>
                   ))}
                 </ul>
              </div>
              <div className="p-8 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] space-y-4 flex flex-col justify-center rounded-sm">
                 <MonitorPlay size={24} className="text-brand-blue" />
                 <h3 className="text-xl font-black uppercase tracking-tighter">Studio_Scale</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-600 leading-relaxed font-medium uppercase tracking-widest">
                   Unreal 5 · Unity · Maya · Blender · Post-Pro Ready
                 </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] mb-6">Pipeline_Manifest</h3>
            <div className="space-y-4">
              {[
                { title: "Identity Persistence", desc: "Locked DNA from stage 1 through final cut." },
                { title: "Script Orchestration", desc: "AI-generated shot lists with camera intent." },
                { title: "Character Animation", desc: "Image-to-motion assets with zero drift." },
                { title: "Environment Sync", desc: "Consistently lit multi-shot synthesis." }
              ].map(f => (
                <div key={f.title} className="p-5 border border-black/10 dark:border-white/10 hover:border-brand-blue/30 transition-all group rounded-sm">
                   <h4 className="text-[12px] font-black uppercase text-black dark:text-white mb-1 group-hover:text-brand-blue">{f.title}</h4>
                   <p className="text-[11px] text-gray-500 dark:text-gray-600 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEURAL STACK */}
        <section className="mb-32 py-20 border-y border-black/10 dark:border-white/5">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="max-w-xl space-y-6 text-center lg:text-left">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Cognitive_Stack</h2>
              <p className="text-gray-500 dark:text-gray-600 text-sm font-medium leading-relaxed uppercase tracking-widest">Multi-modal orchestration for flagship cinematic pipelines.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
               {solution.neuralStack?.map(m => (
                 <div key={m.name} className="p-8 bg-gray-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-center group hover:bg-brand-blue/[0.02] transition-all rounded-sm">
                    <Layers size={20} className="mx-auto mb-4 text-gray-400 dark:text-gray-700 group-hover:text-brand-blue" />
                    <h4 className="text-[12px] font-black uppercase text-black dark:text-white mb-2">{m.name}</h4>
                    <p className="text-[9px] text-gray-400 dark:text-gray-600 uppercase font-bold tracking-widest">{m.capability[lang]}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* CONVERSION */}
        <section className="pb-40">
           <div className="bg-gradient-to-br from-brand-blue/10 to-transparent border border-brand-blue/20 p-12 lg:p-24 relative overflow-hidden group rounded-sm shadow-xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-brand-blue/10 transition-all duration-1000"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                 <div className="space-y-8 max-w-2xl text-center lg:text-left">
                    <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.8] text-black dark:text-white">Direct Your <br /> <span className="text-brand-blue italic">First Masterpiece.</span></h2>
                    <p className="text-gray-600 dark:text-gray-500 text-lg leading-relaxed font-medium">
                       Deploy a dedicated ACA-V2 production node on your infrastructure. Specialized character identity locking with full studio ART-DNA isolation.
                    </p>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
                    <Link to="/booking" className="btn-sky-primary px-16 py-8 text-[11px] uppercase tracking-[0.4em] text-center shadow-2xl transition-all">Request_Pipeline_Audit</Link>
                    <Link to="/booking" className="btn-sky-secondary px-16 py-8 text-[11px] uppercase tracking-[0.4em] text-center border border-black/10 dark:border-white/20 hover:border-brand-blue/50 text-black dark:text-white">Speak_To_Director</Link>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

export default ProductCinematicAgent;
