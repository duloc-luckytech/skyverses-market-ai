
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, Terminal, 
  ShieldCheck, Cpu, Braces, Database, 
  Settings2, FileCode, Box, Activity, 
  X, Layers, Layout, Save, Copy, 
  Download, Share2, Plus, Sliders,
  Camera, Sun, Move, Maximize2,
  User, Palette, Workflow, Target,
  FileJson, CornerDownRight, CheckCircle2,
  ArrowRight, LayoutGrid, Sparkles,
  BarChart3, FlaskConical, Gauge, AlertTriangle, Flame,
  History as HistoryIcon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import PromptIntelInterface from '../components/PromptIntelInterface';

const ProductPrompt2 = () => {
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#050505] animate-in fade-in duration-500">
        <div className="h-full flex flex-col">
           <div className="h-16 border-b border-black/10 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-600 dark:text-white/70">Audit_Terminal // Sintax_Architect_v4.2</span>
             </div>
             <button onClick={() => setIsStudioOpen(false)} className="w-10 h-10 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-all">
                <X size={18} />
             </button>
          </div>
          <div className="flex-grow overflow-hidden">
             <PromptIntelInterface />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden transition-colors duration-500 pb-32">
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#0090ff08_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <section className="min-h-[85vh] flex flex-col justify-center py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-10">
                <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-brand-blue transition-all group rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md shadow-sm">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Infrastructure Hub</span>
                </Link>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-brand-blue">
                      <FlaskConical size={32} />
                      <span className="text-[14px] font-black uppercase tracking-[0.8em] opacity-60 italic">DIAGNOSTIC CORE v4.2</span>
                   </div>
                   <h1 className="text-6xl lg:text-[120px] font-black uppercase tracking-tighter leading-[0.75] italic">
                     Sintax <br /> <span className="text-brand-blue">Architect.</span>
                   </h1>
                </div>
                
                <p className="text-xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-brand-blue pl-10 max-w-2xl italic">
                  “Enterprise-grade diagnostic framework for prompt logic verification and architectural risk management.”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-brand-blue text-white px-16 py-8 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm">
                    Launch Diagnostic Node <Zap size={20} fill="currentColor" />
                 </button>
                 <div className="flex flex-col justify-center px-4 border-l border-black/10 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-brand-blue/60 tracking-widest italic">RISK MITIGATION</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Professional Audit Terminal</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-gray-100 dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl rounded-sm p-12 flex flex-col justify-between group">
                  <div className="space-y-6">
                    <div className="h-1 w-24 bg-brand-blue/40"></div>
                    <div className="space-y-8">
                       <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Logic_Stability</span>
                          <span className="text-2xl font-black text-brand-blue italic">94.2%</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Risk_Coefficient</span>
                          <span className="text-2xl font-black text-red-500 italic">LOW</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Compliance</span>
                          <span className="text-2xl font-black text-green-500 italic">VERIFIED</span>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-brand-blue tracking-[0.5em]">SYSTEM AUDIT</p>
                     <h3 className="text-3xl font-black italic text-black dark:text-white leading-tight uppercase tracking-tighter">Stress_Test v4</h3>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- INDUSTRIAL LIFECYCLE --- */}
        <section className="py-40 border-t border-black/5 dark:border-white/5 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
             <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-brand-blue">
                      <Activity size={24} />
                      <span className="text-[10px] font-black uppercase tracking-[0.6em]">Audit_Cycle</span>
                   </div>
                   <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none">Diagnostic <br /> <span className="text-brand-blue">Lifecycle.</span></h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed font-medium uppercase tracking-widest">
                  Ensure deterministic AI performance. Sintax Architect provides a rigorous auditing path to validate prompt logic before deployment.
                </p>
                <div className="pt-8">
                   <button onClick={() => setIsStudioOpen(true)} className="group flex items-center gap-4 text-brand-blue text-xs font-black uppercase tracking-widest hover:gap-6 transition-all">
                      Access Audit Terminal <ArrowRight size={16} />
                   </button>
                </div>
             </div>

             <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
                {[
                  {
                    step: '01',
                    label: 'Logic Ingestion',
                    icon: <Terminal size={20} />,
                    desc: 'Input raw semantic directives for deep-structure parsing and ambiguity identification.'
                  },
                  {
                    step: '02',
                    label: 'Stress Analysis',
                    icon: <BarChart3 size={20} />,
                    desc: 'Execute 100+ variations across diverse models to calculate variance and reliability coefficients.'
                  },
                  {
                    step: '03',
                    label: 'Risk Profiling',
                    icon: <AlertTriangle size={20} />,
                    desc: 'Identify hallucination risks, token inefficiencies, and security leakage points in real-time.'
                  },
                  {
                    step: '04',
                    label: 'Optimization',
                    icon: <Zap size={20} />,
                    desc: 'Publish production-ready, verified logic manifests with direct industrial pipeline integration.'
                  }
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

        {/* CORE FEATURES */}
        <section className="py-40 border-t border-black/5 dark:border-white/5">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
              {[
                { title: 'Stress Testing', icon: <Flame />, desc: 'Simulate high-load reasoning scenarios to identify logic breaking points before full-scale production.' },
                { title: 'Neural Diagnostics', icon: <Sparkles />, desc: 'Leverage high-reasoning nodes to refine instruction clarity and optimize token efficiency in real-time.' },
                { title: 'IP Protection', icon: <ShieldCheck />, desc: 'Every diagnostic session is VPC-encrypted, ensuring your proprietary operational logic remains secure.' },
                { title: 'Model Benchmarking', icon: <Cpu />, desc: 'Compare performance delta across Gemini, GPT, and Claude architectures for optimized routing.' },
                { title: 'Variance Analysis', icon: <Activity />, desc: 'Quantify output consistency and minimize randomness in stochastic AI response cycles.' },
                { title: 'Regression Audit', icon: <HistoryIcon />, desc: 'Maintain full versioning for audit trails, ensuring historical logic consistency for enterprise compliance.' }
              ].map((f, i) => (
                <div key={i} className="p-16 bg-white dark:bg-[#08080a] space-y-8 group hover:bg-brand-blue/[0.01] transition-all duration-700 border-r border-black/5 dark:border-white/5 last:border-r-0">
                   <div className="w-14 h-14 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all rounded-sm shadow-xl">
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

        {/* CONVERSION */}
        <section className="py-60 text-center relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-blue/[0.03] rounded-full blur-[200px] pointer-events-none"></div>
           <div className="max-w-4xl mx-auto space-y-12 relative z-10">
              <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-black dark:text-white">
                De-risk the <br /> <span className="text-brand-blue">Intelligence.</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-brand-blue text-white px-24 py-8 text-sm font-black uppercase tracking-[0.6em] shadow-[0_20px_60px_rgba(0,144,255,0.2)] hover:scale-105 active:scale-95 transition-all rounded-sm italic">
                    Launch Auditor Node
                 </button>
                 <Link to="/booking" className="px-24 py-8 border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white text-sm font-black uppercase tracking-[0.6em] transition-all rounded-sm italic">
                    Talk to Consultant
                 </Link>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default ProductPrompt2;
