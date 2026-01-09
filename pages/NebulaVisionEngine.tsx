
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../data';
import DemoModal from '../components/DemoModal';
import { useLanguage } from '../context/LanguageContext';
import { 
  ChevronLeft, 
  Cpu, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  Info,
  Box,
  Activity,
  Maximize2
} from 'lucide-react';

const NebulaVisionEngine = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'nebula-vision-engine');
  const { lang, t } = useLanguage();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(solution?.imageUrl || '');

  if (!solution) return null;

  const specs = [
    { label: 'ENGINE_ID', value: solution.id },
    { label: 'CORE_KERNEL', value: 'GEMINI_2.5_ULTRA' },
    { label: 'PROCESSING', value: 'NEURAL_EDGE_NODE' },
    { label: 'OUTPUT_MAX', value: '8K_ULTRA_HD' },
    { label: 'SECURITY', value: 'VPC_ISOLATED' }
  ];

  return (
    <div className="pt-24 bg-black min-h-screen relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none"></div>

      <DemoModal 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)} 
        type={solution.demoType} 
        title={solution.name[lang]} 
      />

      <div className="max-w-[1700px] mx-auto px-6 lg:px-20 py-12 relative z-10">
        <Link to="/market" className="inline-flex items-center gap-3 text-[10px] mono text-gray-500 hover:text-brand-blue mb-16 uppercase tracking-[0.4em] group transition-all">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          RETURN_TO_REPOSITORY
        </Link>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">
          
          {/* Visual Showcase (Left) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative aspect-[16/9] border border-white/10 bg-brand-gray/50 group overflow-hidden shadow-[0_0_80px_rgba(0,144,255,0.1)]">
              <img 
                src={activeImage} 
                alt="Main Visual" 
                className="w-full h-full object-cover opacity-90 transition-all duration-1000 grayscale group-hover:grayscale-0" 
              />
              
              {/* Overlay HUD */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute top-10 left-10 flex items-center gap-4">
                 <div className="w-1 h-20 bg-brand-blue shadow-[0_0_20px_rgba(0,144,255,0.8)]"></div>
                 <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-blue italic">System_Designation</p>
                    <h1 className="text-5xl font-black uppercase text-white tracking-tighter leading-none">NEBULA-7</h1>
                 </div>
              </div>

              <div className="absolute bottom-10 right-10">
                <button 
                  onClick={() => setIsDemoOpen(true)}
                  className="bg-brand-blue text-white px-12 py-6 font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-6 hover:bg-white hover:text-black transition-all shadow-2xl group/btn"
                >
                  INITIALIZE SYNTHESIS <Sparkles className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                </button>
              </div>

              <div className="absolute bottom-10 left-10 text-[9px] mono text-gray-500 uppercase tracking-widest flex items-center gap-4">
                 <Activity className="w-4 h-4 text-brand-blue" /> LIVE_RENDER_STREAMING_v4.2
              </div>
            </div>

            {/* Thumbnail Gallery Sub-list */}
            <div className="grid grid-cols-4 gap-4">
              {[solution.imageUrl, ...(solution.gallery || [])].map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-video border overflow-hidden transition-all duration-500 group ${activeImage === img ? 'border-brand-blue scale-95 shadow-[0_0_20px_rgba(0,144,255,0.3)]' : 'border-white/10 opacity-40 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className={`absolute inset-0 bg-brand-blue/20 transition-opacity ${activeImage === img ? 'opacity-100' : 'opacity-0'}`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Intel (Right) */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="bg-brand-blue/10 border border-brand-blue/30 px-3 py-1 text-[9px] font-black mono text-brand-blue uppercase tracking-widest">VISION_CLASS_S</span>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[9px] font-black mono text-gray-500 uppercase tracking-widest tracking-tight">NODE_ONLINE</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">The Future <br /> of Rendering.</h2>
                <p className="text-xl font-light text-gray-400 leading-relaxed italic opacity-80">
                  "{solution.description[lang]}"
                </p>
              </div>
            </div>

            {/* Spec Table */}
            <div className="bg-white/5 border border-white/10">
              {specs.map((spec, i) => (
                <div key={spec.label} className={`p-6 flex justify-between items-center group hover:bg-white/5 transition-colors ${i !== specs.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest group-hover:text-gray-400">{spec.label}</span>
                  <span className="mono text-[11px] font-bold text-white group-hover:text-brand-blue">{spec.value}</span>
                </div>
              ))}
            </div>

            <div className="p-10 border border-brand-blue/20 bg-brand-blue/5 space-y-6 relative group overflow-hidden">
               <div className="absolute inset-0 bg-brand-blue/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-1000"></div>
               <div className="relative z-10 flex items-center gap-4 text-brand-blue">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Enterprise_Encryption</span>
               </div>
               <p className="relative z-10 text-[11px] text-gray-500 leading-loose font-medium uppercase tracking-tight">
                 Nebula-7 implements Zero-Knowledge-Proofs for every architectural frame generated. 
                 Proprietary geometry never leaves your designated VPC instance.
               </p>
            </div>
          </div>
        </div>

        {/* Neural Stack Section */}
        <section className="py-24 border-t border-white/5 relative mb-32">
           <div className="flex flex-col lg:flex-row gap-20">
              <div className="lg:w-1/3 space-y-8">
                 <div className="inline-block p-4 bg-brand-blue text-white mb-6">
                    <Layers className="w-8 h-8" />
                 </div>
                 <h3 className="text-5xl font-black uppercase tracking-tighter leading-none">Neural Stack <br /> Architecture.</h3>
                 <p className="text-gray-500 text-sm mono leading-relaxed uppercase tracking-widest">
                   Proprietary multi-modal orchestration combining standard logic with temporal synthesis.
                 </p>
              </div>

              <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
                 {solution.neuralStack?.map((stack, idx) => (
                    <div key={idx} className="bg-black p-12 space-y-8 hover:bg-brand-gray/50 transition-all group">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <h4 className="text-3xl font-black uppercase tracking-tighter text-white group-hover:text-brand-blue transition-colors">{stack.name}</h4>
                             <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">BUILD_v{stack.version}</p>
                          </div>
                          <Info className="w-5 h-5 text-gray-800 group-hover:text-brand-blue" />
                       </div>
                       <p className="text-gray-500 text-sm italic font-medium group-hover:text-white transition-colors">
                         {stack.capability[lang]}
                       </p>
                       <div className="pt-8 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase text-gray-700">
                          <span>Status: Optimized</span>
                          <Zap className="w-4 h-4 text-brand-blue" />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Detailed Logic breakdown */}
        <section className="py-32 border-y border-white/5 bg-white/[0.01]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
            <div className="space-y-10">
               <div className="flex items-center gap-4 text-brand-blue">
                  <Terminal className="w-10 h-10" />
                  <span className="text-xs font-black uppercase tracking-[0.5em]">LOGIC_GATES_ACTIVE</span>
               </div>
               <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">Technical <br /> Mastery.</h2>
               <div className="space-y-6">
                 {solution.features.map((feat, i) => {
                   // Fix: handle LocalizedString or plain string in features array to avoid type errors and support localization
                   const featText = typeof feat === 'string' ? feat : feat[lang];
                   const [title, desc] = featText.split(':');
                   return (
                     <div key={i} className="space-y-2 border-l border-brand-blue/30 pl-8 py-2 hover:border-brand-blue transition-all">
                        <h4 className="text-lg font-black uppercase text-white tracking-tight">{title}</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                     </div>
                   );
                 })}
               </div>
            </div>

            <div className="relative">
               <div className="absolute inset-0 bg-brand-blue/5 blur-[120px] rounded-full"></div>
               <div className="relative border border-white/10 p-16 aspect-square flex flex-col justify-between overflow-hidden group">
                  <div className="absolute inset-0 bg-white/5 translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                  <div className="relative z-10 flex justify-between items-start">
                     <Cpu className="w-16 h-16 text-brand-blue animate-pulse" />
                     <span className="mono text-[10px] text-gray-700 uppercase font-black">Performance_Audit</span>
                  </div>
                  <div className="relative z-10 space-y-6">
                     <div className="text-[120px] font-black leading-none tracking-tighter text-white group-hover:text-brand-blue transition-colors">8X</div>
                     <p className="text-2xl font-black uppercase tracking-[0.2em] text-white">Faster Rendering Cycle</p>
                     <p className="text-xs text-gray-600 uppercase font-black tracking-widest italic">Compared to Legacy RTX-Nodes</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-60 text-center">
          <div className="max-w-4xl mx-auto space-y-16">
            <h2 className="text-7xl md:text-[140px] font-black uppercase tracking-tighter leading-[0.8] text-white">
              Ready to <br /> <span className="text-brand-blue italic">Build?</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
              <Link to="/booking" className="btn-sky-primary px-20 py-8 text-[11px] uppercase tracking-widest shadow-2xl">
                Deploy Nebula Node
              </Link>
              <button 
                onClick={() => setIsDemoOpen(true)}
                className="btn-sky-secondary px-20 py-8 text-[11px] uppercase tracking-widest hover:border-brand-blue hover:text-brand-blue"
              >
                Access Lab Demo
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NebulaVisionEngine;
