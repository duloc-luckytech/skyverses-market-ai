
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import AUPX1Studio from '../components/AUPX1Studio';
import { 
  ChevronLeft, Star, Zap, Cpu, ShieldCheck, 
  Layers, Sparkles, CheckCircle2,
  X, Play, Share2, Heart, Bot, Target, 
  Film, Clapperboard, MonitorPlay, Video, Info,
  Globe, Workflow, Database, LayoutGrid,
  ArrowRight, Activity, Command, Braces,
  Fingerprint, ClipboardCheck
} from 'lucide-react';

const ProductUniversalProducer = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'universal-producer-infrastructure');
  const { lang } = useLanguage();
  
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (!solution) return null;

  return (
    <div className="pt-24 bg-white dark:bg-[#050507] min-h-screen text-black dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden transition-colors duration-500">
      
      {/* 1. STUDIO MODAL (OVERLAY) */}
      {isStudioOpen && (
        <div className="fixed inset-0 z-[250] bg-white dark:bg-black flex flex-col animate-in fade-in duration-500">
          <div className="h-16 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/70 italic">AUP-X1_Infrastructure // Virtual_Production_Node_042</span>
             </div>
             <button onClick={() => setIsStudioOpen(false)} className="w-10 h-10 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-gray-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                <X size={18} />
             </button>
          </div>
          <div className="flex-grow overflow-hidden">
             <AUPX1Studio />
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
          <div className="space-y-6">
            <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 hover:text-brand-blue transition-colors tracking-[0.4em]">
              <ChevronLeft size={14} /> BACK_TO_REPOSITORY
            </Link>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-4">
                <h1 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic leading-[0.8]">{solution.name[lang]}</h1>
                <div className="px-4 py-1.5 bg-brand-blue/10 border border-brand-blue/30 rounded-sm w-fit shrink-0">
                   <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Ultra_Infrastructure</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-2xl font-medium max-w-3xl leading-relaxed italic">"The ultimate cross-domain creator. One DNA, infinite deployment paths."</p>
            </div>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex text-yellow-500">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= 5 ? "currentColor" : "none"} />)}
                </div>
                <span className="text-[11px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">5.0 (CLASS_S_VERIFIED)</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[11px] font-bold text-gray-400 dark:text-gray-700 uppercase tracking-widest">Studio Nodes Online: 824</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsLiked(!isLiked)} className={`p-6 border transition-all rounded-full ${isLiked ? 'bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-black/10 dark:border-white/10 text-gray-400 hover:text-black dark:hover:text-white'}`}>
              <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button className="p-6 border border-black/10 dark:border-white/10 text-gray-400 hover:text-black dark:hover:text-white transition-all rounded-full"><Share2 size={24} /></button>
          </div>
        </div>

        {/* HERO WORKFLOW PREVIEW */}
        <section className="mb-32 relative group">
           <div className="aspect-[21/9] w-full bg-gray-100 dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 overflow-hidden relative shadow-2xl rounded-sm">
              <img src={solution.imageUrl} className="w-full h-full object-cover grayscale opacity-30 group-hover:opacity-50 transition-all duration-1000 group-hover:scale-105" alt="AUP-X1 Mainframe" />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent opacity-90"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                 <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="flex justify-center gap-6">
                       <Workflow className="w-16 h-16 text-brand-blue" />
                       <Database className="w-16 h-16 text-black/10 dark:text-white/10" />
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] italic text-black dark:text-white">Unify the <br /> <span className="text-brand-blue">Production Graph.</span></h2>
                       <p className="text-gray-600 dark:text-gray-500 text-sm md:text-base uppercase font-black tracking-[0.4em]">Cross-Domain Neural Production Infrastructure</p>
                    </div>
                    <button 
                      onClick={() => setIsStudioOpen(true)}
                      className="bg-brand-blue text-white px-16 py-8 text-sm font-black uppercase tracking-[0.5em] hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-[0_0_80px_rgba(0,144,255,0.3)] active:scale-[0.98] flex items-center gap-6 mx-auto group/btn rounded-sm"
                    >
                      ENTER_VIRTUAL_STUDIO <Play size={20} className="fill-current group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>
           </div>
        </section>

        {/* SYSTEM ARCHITECTURE GRID */}
        <section className="mb-40 grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          <div className="lg:col-span-8 space-y-16">
            <div className="space-y-8">
              <h2 className="text-5xl font-black uppercase tracking-tighter italic flex items-center gap-6">
                <div className="w-16 h-[2px] bg-brand-blue"></div> Cross-Domain_Logic
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-2xl leading-relaxed font-medium">
                The Aether Universal Producer (AUP-X1) is our most advanced infrastructure offering. It unifies character creation, asset management, and narrative logic into a domain-agnostic pipeline. By using specialized adapter nodes, the same high-level intent can be rendered as a vertical social ad, a 3D game cutscene, or a high-fidelity cinematic shot.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="p-10 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] space-y-6 rounded-sm">
                 <Target size={32} className="text-brand-blue" />
                 <h3 className="text-2xl font-black uppercase tracking-tighter">Core_Capabilities</h3>
                 <ul className="space-y-4">
                   {[
                     "Universal Character DNA Management.", 
                     "Cross-platform Asset Normalization.", 
                     "Domain-Specific Rendering Adapters.", 
                     "Multi-Agent Orchestration & Governance."
                   ].map(item => (
                     <li key={item} className="flex gap-4 items-start text-base text-gray-500 dark:text-gray-400">
                        <CheckCircle2 size={20} className="text-brand-blue shrink-0 mt-1" />
                        <span className="font-bold uppercase tracking-tight">{item}</span>
                     </li>
                   ))}
                 </ul>
              </div>
              <div className="p-10 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] space-y-6 flex flex-col justify-center rounded-sm">
                 <MonitorPlay size={32} className="text-brand-blue" />
                 <h3 className="text-2xl font-black uppercase tracking-tighter">Studio_Scale</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-600 leading-relaxed font-medium uppercase tracking-[0.3em]">
                   AAA Pipeline Ready · Multi-H100 Node Support · SDK/API Unified Entry · Zero-Drift Technology
                 </p>
                 <div className="pt-6 flex gap-4">
                    <Braces className="text-gray-400 dark:text-gray-800" />
                    <Command className="text-gray-400 dark:text-gray-800" />
                 </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <h3 className="text-[12px] font-black uppercase text-brand-blue tracking-[0.5em] border-b border-brand-blue/20 pb-4">Studio_Manifest_v4.2</h3>
            <div className="space-y-6">
              {[
                { title: "Universal Asset Graph", desc: "Proprietary database linking identity to performance." },
                { title: "Orchestration Layers", desc: "Director-Agent logic ensures cross-domain consistency." },
                { title: "Temporal Adapters", desc: "Adapts motion speed and logic for different targets." },
                { title: "Security Kernel", desc: "VPC isolation for proprietary art-style guides." }
              ].map(f => (
                <div key={f.title} className="p-6 border border-black/10 dark:border-white/10 hover:border-brand-blue/30 transition-all group rounded-sm bg-black/[0.02] dark:bg-white/5">
                   <h4 className="text-[14px] font-black uppercase text-black dark:text-white mb-2 group-hover:text-brand-blue transition-colors">{f.title}</h4>
                   <p className="text-[11px] text-gray-500 dark:text-gray-600 font-medium leading-relaxed italic">"{f.desc}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AGENT ORCHESTRATION BREAKDOWN */}
        <section className="mb-40 py-24 border-y border-black/10 dark:border-white/5 relative">
          <div className="absolute inset-0 bg-brand-blue/[0.02] pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-16 relative z-10">
            <div className="max-w-2xl space-y-8 text-center lg:text-left">
              <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic">Collaborative <br /> <span className="text-brand-blue">Intelligence.</span></h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed uppercase tracking-widest">AUP-X1 uses specialized agent nodes that collaborate to maintain creative intent across every production stage.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-grow w-full lg:w-auto">
               {[
                 { name: "Creative Director", icon: <Bot /> },
                 { name: "Consistency Lead", icon: <Fingerprint /> },
                 { name: "Scene Planner", icon: <LayoutGrid /> },
                 { name: "Quality Auditor", icon: <ClipboardCheck /> }
               ].map(agent => (
                 <div key={agent.name} className="p-8 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex flex-col items-center text-center gap-4 group hover:bg-brand-blue/[0.03] transition-all">
                    <div className="text-gray-400 group-hover:text-brand-blue transition-colors">{agent.icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{agent.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* NEURAL STACK SUMMARY */}
        <section className="mb-40">
           <div className="flex items-center gap-8 mb-16">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Engine_Orchestration</h2>
              <div className="flex-grow h-px bg-black/5 dark:bg-white/5"></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {solution.neuralStack?.map(m => (
                 <div key={m.name} className="p-10 bg-gray-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex flex-col justify-between group hover:border-brand-blue/30 transition-all rounded-sm">
                    <div className="space-y-6">
                       <Layers size={24} className="text-gray-400 group-hover:text-brand-blue" />
                       <h4 className="text-2xl font-black uppercase text-black dark:text-white">{m.name}</h4>
                       <p className="text-[10px] text-gray-500 dark:text-gray-600 uppercase font-black tracking-widest leading-relaxed">Capability: {m.capability[lang]}</p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Build_v{m.version}</span>
                       <Zap className="w-4 h-4 text-brand-blue" />
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* ENTERPRISE CONVERSION */}
        <section className="pb-60">
           <div className="bg-gradient-to-br from-brand-blue/20 to-transparent border border-brand-blue/30 p-16 lg:p-32 relative overflow-hidden group rounded-sm shadow-2xl">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none group-hover:bg-brand-blue/20 transition-all duration-1000"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-24">
                 <div className="space-y-10 max-w-3xl text-center lg:text-left">
                    <h2 className="text-6xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.8] text-black dark:text-white italic">Unify Your <br /> <span className="text-brand-blue">Global Hub.</span></h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xl font-medium leading-relaxed uppercase tracking-widest">
                       Deploy a dedicated AUP-X1 cluster for your organization. Universal character DNA management with 100% IP security and industrial-grade throughput across all digital frontiers.
                    </p>
                 </div>
                 <div className="flex flex-col gap-6 w-full lg:w-auto">
                    <Link to="/booking" className="btn-sky-primary px-20 py-8 text-sm font-black uppercase tracking-[0.5em] text-center shadow-2xl transition-all hover:scale-105 active:scale-95">REQUEST_AUDIT</Link>
                    <Link to="/booking" className="py-8 px-20 border border-black/10 dark:border-white/20 hover:border-brand-blue/50 text-black dark:text-white text-sm font-black uppercase tracking-[0.5em] text-center transition-all bg-black/5 dark:bg-white/5">TALK_TO_ARCHITECT</Link>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

export default ProductUniversalProducer;
