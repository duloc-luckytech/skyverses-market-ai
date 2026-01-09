
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import AetherStudioInterface from '../../components/AetherStudioInterface';
import { 
  ChevronLeft, Star, Zap, Cpu, ShieldCheck, 
  Layers, Sparkles, CheckCircle2,
  Bug, Flag, Send, Terminal, Target,
  X, ZoomIn, Play, Share2, Heart, ArrowRight,
  Info, Activity, Clapperboard, Film, MonitorPlay
} from 'lucide-react';

const Product3Video = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'aether-cinematic-engine');
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

  const showcaseImages = [
    { url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1200", label: "PRODUCTION_01: NARRATIVE_ESTABLISHMENT" },
    { url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200", label: "PRODUCTION_02: CHARACTER_CONTINUITY" },
    { url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200", label: "PRODUCTION_03: VOLUMETRIC_LIGHTING" },
    { url: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200", label: "PRODUCTION_04: ACTION_SEQUENCE" }
  ];

  return (
    <div className="pt-24 bg-white dark:bg-black min-h-screen text-black dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden transition-colors duration-500">
      
      {/* 1. STUDIO MODAL */}
      {isDemoOpen && (
        <div className="fixed inset-0 z-[250] bg-white/98 dark:bg-black/98 flex flex-col animate-in fade-in duration-300">
          <div className="h-16 border-b border-black/10 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-600 dark:text-white/70">Aether_Studio // Film_Pipeline_v9.0</span>
             </div>
             <button onClick={() => setIsDemoOpen(false)} className="w-10 h-10 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-all">
                <X size={18} />
             </button>
          </div>
          <div className="flex-grow overflow-hidden">
             <AetherStudioInterface />
          </div>
        </div>
      )}

      {/* 2. SHOWCASE LIGHTBOX */}
      {selectedShowcaseImg && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedShowcaseImg(null)}>
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-10"><X size={32} /></button>
          <img src={selectedShowcaseImg} className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500" alt="Showcase" />
        </div>
      )}

      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        
        {/* SECTION 1 — HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-16">
          <div className="space-y-4">
            <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 hover:text-brand-blue transition-colors tracking-[0.2em]">
              <ChevronLeft size={14} /> Back to Repository
            </Link>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none">{solution.name[lang]}</h1>
                <div className="px-3 py-1 bg-brand-blue/10 border border-brand-blue/30 rounded-sm w-fit">
                   <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">Class_S_Cinema</span>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xl font-medium max-w-2xl leading-relaxed italic">"The definitive flagship for automated long-form cinematic production."</p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= 4 ? "currentColor" : "none"} />)}
                </div>
                <span className="text-[11px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">4.9 (42,000 SCENES_GENERATED)</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-gray-400 dark:text-gray-700 uppercase tracking-widest">Pipeline Active</span>
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

        {/* SECTION 2 — HERO PREVIEW / TRY DEMO TRIGGER */}
        <section className="mb-24 relative group">
           <div className="aspect-[21/9] w-full bg-gray-100 dark:bg-[#080808] border border-black/5 dark:border-white/5 overflow-hidden relative shadow-2xl rounded-sm">
              <img src={solution.imageUrl} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105" alt="Aether Hub" />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                 <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex justify-center gap-4">
                       <Film className="w-12 h-12 text-brand-blue" />
                       <Clapperboard className="w-12 h-12 text-black/10 dark:text-white/10" />
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none italic text-black dark:text-white">Direct the <br /> <span className="text-brand-blue">Neural Narrative</span></h2>
                       <p className="text-gray-600 dark:text-gray-500 text-sm uppercase font-black tracking-widest">Flagship Script-to-Screen Production Engine</p>
                    </div>
                    <button 
                      onClick={() => setIsDemoOpen(true)}
                      className="bg-brand-blue text-white px-12 py-6 text-xs font-black uppercase tracking-[0.4em] hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-[0_0_50px_rgba(0,144,255,0.2)] active:scale-[0.98] flex items-center gap-4 mx-auto group/btn"
                    >
                      Initialize_Studio <Play size={16} className="fill-current group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>
              
              <div className="absolute bottom-8 left-8 flex items-center gap-4 px-4 py-2 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-sm">
                 <Sparkles className="text-brand-blue w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-white/60 italic">Interactive_Pipeline_v9.0 Ready</span>
              </div>
           </div>
        </section>

        {/* SECTION 3 — SYSTEM ARCHITECTURE */}
        <section className="mb-32 grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                <div className="w-12 h-[2px] bg-brand-blue"></div> Cinematic_Philosophy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-medium">
                Aether Cinematic Engine is designed for high-end film production that demands more than just isolated shots. It is engineered to maintain narrative integrity across long durations, utilizing temporal character anchoring and visual environment consistency. Aether transforms the production process from a series of generations into a unified, high-throughput cinematic pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="p-8 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] space-y-4 rounded-sm">
                 <Target size={24} className="text-brand-blue" />
                 <h3 className="text-xl font-black uppercase tracking-tighter">Key_Sectors</h3>
                 <ul className="space-y-3">
                   {["Film studios & episodic content.", "Game cinematics & trailers.", "High-end commercial storytelling.", "Virtual world world-building."].map(item => (
                     <li key={item} className="flex gap-4 items-start text-sm text-gray-500 dark:text-gray-600">
                        <CheckCircle2 size={16} className="text-brand-blue shrink-0 mt-0.5" />
                        <span>{item}</span>
                     </li>
                   ))}
                 </ul>
              </div>
              <div className="p-8 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] space-y-4 flex flex-col justify-center rounded-sm">
                 <Cpu size={24} className="text-brand-blue" />
                 <h3 className="text-xl font-black uppercase tracking-tighter">Authorized_Users</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-600 leading-relaxed font-medium uppercase tracking-widest">
                   Film Directors · Pipeline Technical Directors · Cinematographers · Studio Heads
                 </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] mb-6">Pipeline_Manifest</h3>
            <div className="space-y-4">
              {[
                { title: "Script-to-Screen", desc: "Automated storyboard-to-render orchestration." },
                { title: "Character Anchor", desc: "Maintains 99.9% identity consistency across scenes." },
                { title: "Temporal Coherence", desc: "Eliminates flicker and visual artifacts in motion." },
                { title: "Studio Metadata", desc: "Native support for camera paths and light data." }
              ].map(f => (
                <div key={f.title} className="p-5 border border-black/10 dark:border-white/10 hover:border-brand-blue/30 transition-all group rounded-sm">
                   <h4 className="text-[12px] font-black uppercase text-black dark:text-white mb-1 group-hover:text-brand-blue">{f.title}</h4>
                   <p className="text-[11px] text-gray-500 dark:text-gray-600 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 — TECHNICAL STACK */}
        <section className="mb-32 py-20 border-y border-black/10 dark:border-white/5">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="max-w-xl space-y-6 text-center lg:text-left">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Neural_Engine_Stack</h2>
              <p className="text-gray-500 dark:text-gray-600 text-sm font-medium leading-relaxed uppercase tracking-widest">Proprietary orchestration of industrial-grade models.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
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

        {/* SECTION 5 — VISUAL SHOWCASE */}
        <section className="mb-32">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">Production_Archives</h2>
              <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-[0.4em]">Verified Frames // Zero-Coherence Drift</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => scrollShowcase('left')} className="p-4 border border-black/10 dark:border-white/10 text-gray-400 hover:text-brand-blue transition-all active:scale-95 rounded-full"><ArrowRight size={20} className="rotate-180" /></button>
              <button onClick={() => scrollShowcase('right')} className="p-4 border border-black/10 dark:border-white/10 text-gray-400 hover:text-brand-blue transition-all active:scale-95 rounded-full"><ArrowRight size={20} /></button>
            </div>
          </div>
          
          <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-8 scroll-smooth snap-x snap-mandatory">
            {showcaseImages.map((img, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedShowcaseImg(img.url)}
                className="min-w-[300px] md:min-w-[450px] h-[550px] border border-black/5 dark:border-white/5 group relative overflow-hidden bg-gray-100 dark:bg-[#0a0a0a] cursor-zoom-in snap-start rounded-sm"
              >
                <img src={img.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt={img.label} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                <div className="absolute bottom-8 left-8 space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <p className="text-[10px] font-black uppercase text-brand-blue tracking-[0.3em]">{img.label}</p>
                   <h4 className="text-2xl font-black uppercase text-white tracking-tighter leading-none">Synthesis_Verified</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6 — REPORT */}
        <section id="report" className="mb-32 p-12 lg:p-20 border border-black/10 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] relative transition-all rounded-sm opacity-40 hover:opacity-100">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
               <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center justify-center gap-6 text-black dark:text-white">
                  <div className="w-12 h-px bg-red-500/50"></div> Log_A_Synthesis_Audit <div className="w-12 h-px bg-red-500/50"></div>
               </h2>
               <p className="text-gray-500 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Help refine the continuity weights</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('Audit Logged.'); }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-widest">Audit_Category</label>
                 <select className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 text-[11px] font-black uppercase text-black dark:text-white outline-none focus:border-red-500 transition-all appearance-none rounded-none">
                    <option value="bug">Technical Pipeline Bug</option>
                    <option value="output">Coherence Failure</option>
                    <option value="latency">High Compute Latency</option>
                 </select>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-widest">Support_Alias</label>
                 <input type="email" placeholder="PIPELINE_ADMIN@STUDIO.COM" className="w-full bg-white/5 border border-black/10 dark:border-white/10 p-5 text-[11px] font-black uppercase text-black dark:text-white outline-none focus:border-brand-blue" />
              </div>
              <div className="md:col-span-2 space-y-4">
                 <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-widest">Detailed_Context</label>
                 <textarea required rows={4} className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 text-sm text-gray-600 dark:text-gray-400 font-medium focus:outline-none focus:border-red-500 resize-none" placeholder="Provide sequence ID and frames..." />
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row justify-between items-center gap-8 pt-4">
                 <div className="flex items-center gap-4 text-gray-400 dark:text-gray-600">
                    <ShieldCheck size={14} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Telemetry_Trace_Attached</span>
                 </div>
                 <button type="submit" className="w-full sm:w-auto px-16 py-6 bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.4em] hover:bg-red-500 dark:hover:bg-brand-blue dark:hover:text-white transition-all shadow-2xl rounded-sm">
                    Submit_Audit
                 </button>
              </div>
            </form>
          </div>
        </section>

        {/* SECTION 7 — CONVERSION */}
        <section className="pb-40">
           <div className="bg-gradient-to-br from-brand-blue/10 to-transparent border border-brand-blue/20 p-12 lg:p-24 relative overflow-hidden group rounded-sm shadow-xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-brand-blue/10 transition-all duration-1000"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                 <div className="space-y-8 max-w-2xl text-center lg:text-left">
                    <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.8] text-black dark:text-white">Build the <br /> <span className="text-brand-blue italic">First Epic.</span></h2>
                    <p className="text-gray-600 dark:text-gray-500 text-lg leading-relaxed font-medium">
                       Deploy a dedicated Aether Pipeline for your studio. 4K high-fidelity synthesis with full story-mode logic and VPC security.
                    </p>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
                    <Link to="/booking" className="btn-sky-primary px-16 py-8 text-[11px] uppercase tracking-[0.4em] text-center shadow-2xl transition-all">Book_Studio_Setup</Link>
                    <Link to="/booking" className="btn-sky-secondary px-16 py-8 text-[11px] uppercase tracking-[0.4em] text-center border border-black/10 dark:border-white/20 hover:border-brand-blue/50 text-black dark:text-white">Download_Whitepaper</Link>
                 </div>
              </div>
           </div>
        </section>

      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes progress-slow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-progress-slow {
          animation: progress-slow 4s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default Product3Video;
