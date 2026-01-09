
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import OmniGridDemoInterface from '../../components/OmniGridDemoInterface';
import { 
  ChevronLeft, LayoutGrid, Zap, Layers, 
  Sparkles, Play, ArrowRight, ShieldCheck, 
  Target, Cpu, X, Star, Heart, Share2, 
  CheckCircle2, Info, Grid, Maximize2,
  Box, Terminal, Activity
} from 'lucide-react';

const Product5OmniGrid = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'omni-grid-synthesis');
  const { lang } = useLanguage();
  
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedShowcaseImg, setSelectedShowcaseImg] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!solution) return null;

  const scrollShowcase = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const showcaseItems = [
    { url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200", label: "BATCH_01: UI_SYSTEM_COMPONENTS" },
    { url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1200", label: "BATCH_02: MARKETING_HERO_VARIATIONS" },
    { url: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200", label: "BATCH_03: GAME_ASSET_SPRITES" },
    { url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1200", label: "BATCH_04: ABSTRACT_BRAND_TEXTURES" }
  ];

  return (
    <div className="pt-24 bg-white dark:bg-black min-h-screen text-black dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden transition-colors duration-500">
      
      {/* 1. DEMO MODAL */}
      {isDemoOpen && (
        <div className="fixed inset-0 z-[250] bg-white/98 dark:bg-black/98 flex flex-col animate-in fade-in duration-300">
          <div className="h-16 border-b border-black/10 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-600 dark:text-white/70">Production_Terminal // Omni_Grid_v4.0</span>
             </div>
             <button onClick={() => setIsDemoOpen(false)} className="w-10 h-10 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-all">
                <X size={18} />
             </button>
          </div>
          <div className="flex-grow overflow-hidden">
             <OmniGridDemoInterface />
          </div>
        </div>
      )}

      {/* 2. LIGHTBOX */}
      {selectedShowcaseImg && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedShowcaseImg(null)}>
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-10"><X size={32} /></button>
          <img src={selectedShowcaseImg} className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500" alt="Showcase" />
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
                   <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">Batch_Engine_S</span>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xl font-medium max-w-2xl leading-relaxed italic">"Generate, refine, and package assets at industrial scale."</p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= 4 ? "currentColor" : "none"} />)}
                </div>
                <span className="text-[11px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">4.9 (2.4M ASSETS_SYNTHESIZED)</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-gray-400 dark:text-gray-700 uppercase tracking-widest">Cluster Online</span>
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
              <img src={solution.imageUrl} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105" alt="OmniGrid Hub" />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                 <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex justify-center gap-4">
                       <LayoutGrid className="w-12 h-12 text-brand-blue" />
                       <Layers className="w-12 h-12 text-black/10 dark:text-white/10" />
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none italic text-black dark:text-white">Industrial <br /> <span className="text-brand-blue">Pixel Production</span></h2>
                       <p className="text-gray-600 dark:text-gray-500 text-sm uppercase font-black tracking-widest">High-frequency batch synthesis for creative professionals</p>
                    </div>
                    <button 
                      onClick={() => setIsDemoOpen(true)}
                      className="bg-brand-blue text-white px-12 py-6 text-xs font-black uppercase tracking-[0.4em] hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-[0_0_50px_rgba(0,144,255,0.2)] active:scale-[0.98] flex items-center gap-4 mx-auto group/btn"
                    >
                      Initialize_Production <Play size={16} className="fill-current group-hover/btn:translate-x-1 transition-transform" />
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
                <div className="w-12 h-[2px] bg-brand-blue"></div> Batch_First_Mindset
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-medium">
                Omni-Grid is not a toy. It is a high-throughput production engine built to solve the iterative bottleneck in digital design. By allowing professionals to generate 4-16 variations simultaneously and refining them in a unified workflow, we reduce the distance between concept and final asset by 85%.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="p-8 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] space-y-4 rounded-sm">
                 <Target size={24} className="text-brand-blue" />
                 <h3 className="text-xl font-black uppercase tracking-tighter">Workflow_Optimizations</h3>
                 <ul className="space-y-3">
                   {["Asset pack generation for UI/UX kits.", "Marketing creative variant testing.", "Rapid character/environment concepting.", "E-commerce product background batching."].map(item => (
                     <li key={item} className="flex gap-4 items-start text-sm text-gray-500 dark:text-gray-600">
                        <CheckCircle2 size={16} className="text-brand-blue shrink-0 mt-0.5" />
                        <span>{item}</span>
                     </li>
                   ))}
                 </ul>
              </div>
              <div className="p-8 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] space-y-4 flex flex-col justify-center rounded-sm">
                 <Cpu size={24} className="text-brand-blue" />
                 <h3 className="text-xl font-black uppercase tracking-tighter">Infrastructure</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-600 leading-relaxed font-medium uppercase tracking-widest">
                   H100 Parallel Clusters · Real-time VPC Encryption · 8K Neural Upscaling · 48ms Node Latency
                 </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] mb-6">Capabilities_Manifest</h3>
            <div className="space-y-4">
              {[
                { title: "Parallel Inference", desc: "Process multiple neural branches in one run." },
                { title: "Style Anchoring", desc: "Locked-style generation across entire batches." },
                { title: "Refinement Terminal", desc: "Single-click 8K upscaling and artifact fixing." },
                { title: "SDK Integration", desc: "Export directly to Figma, Unreal, or Shopify." }
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
              <h2 className="text-3xl font-black uppercase tracking-tighter">Neural_Engine_Stack</h2>
              <p className="text-gray-500 dark:text-gray-600 text-sm font-medium leading-relaxed uppercase tracking-widest">Proprietary orchestration of industrial models.</p>
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

        {/* SHOWCASE */}
        <section className="mb-32">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">Batch_Outputs</h2>
              <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-[0.4em]">Grid Validation // Zero-Quality Drift</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => scrollShowcase('left')} className="p-4 border border-black/10 dark:border-white/10 text-gray-400 hover:text-brand-blue transition-all rounded-full"><ArrowRight size={20} className="rotate-180" /></button>
              <button onClick={() => scrollShowcase('right')} className="p-4 border border-black/10 dark:border-white/10 text-gray-400 hover:text-brand-blue transition-all rounded-full"><ArrowRight size={20} /></button>
            </div>
          </div>
          
          <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-8 scroll-smooth snap-x snap-mandatory">
            {showcaseItems.map((img, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedShowcaseImg(img.url)}
                className="min-w-[300px] md:min-w-[500px] h-[400px] border border-black/5 dark:border-white/5 group relative overflow-hidden bg-gray-100 dark:bg-[#0a0a0a] cursor-zoom-in snap-start rounded-sm"
              >
                <img src={img.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt={img.label} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                <div className="absolute bottom-8 left-8 space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <p className="text-[10px] font-black uppercase text-brand-blue tracking-[0.3em]">{img.label}</p>
                   <h4 className="text-2xl font-black uppercase text-white tracking-tighter leading-none">Batch_Verified</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONVERSION */}
        <section className="pb-40">
           <div className="bg-gradient-to-br from-brand-blue/10 to-transparent border border-brand-blue/20 p-12 lg:p-24 relative overflow-hidden group rounded-sm shadow-xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-brand-blue/10 transition-all duration-1000"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                 <div className="space-y-8 max-w-2xl text-center lg:text-left">
                    <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.8] text-black dark:text-white">Scale Your <br /> <span className="text-brand-blue italic">Creative Ops.</span></h2>
                    <p className="text-gray-600 dark:text-gray-500 text-lg leading-relaxed font-medium">
                       Deploy a dedicated Omni-Grid Node for your studio. 16-way parallel inference with custom VPC hosting and private IP security.
                    </p>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
                    <Link to="/booking" className="btn-sky-primary px-16 py-8 text-[11px] uppercase tracking-[0.4em] text-center shadow-2xl transition-all">Request_Private_Node</Link>
                    <Link to="/booking" className="btn-sky-secondary px-16 py-8 text-[11px] uppercase tracking-[0.4em] text-center border border-black/10 dark:border-white/20 hover:border-brand-blue/50 text-black dark:text-white">Speak_To_Architect</Link>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

export default Product5OmniGrid;
