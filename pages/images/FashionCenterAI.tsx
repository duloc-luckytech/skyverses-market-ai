
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, ShieldCheck, 
  Sparkles, CheckCircle2, Layout, 
  Maximize2, Download, ArrowRight, 
  Target, Box, Palette, Layers, 
  Type, Search, History, MousePointer2,
  Lock, ExternalLink, Activity, Shirt,
  User, Scissors, Scan, Crown, Smartphone,
  Image as ImageIcon, Settings2, RefreshCw
} from 'lucide-react';
import FashionStudioWorkspace from '../../components/FashionStudioWorkspace';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const FashionCenterAI = () => {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <FashionStudioWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050505] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-pink-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
           <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-pink-500/10 dark:bg-pink-600/10 rounded-full blur-[200px]"></div>
           <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[200px]"></div>
        </div>

        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-6 space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-[0.3em] italic"
            >
              <Sparkles size={14} /> AI Fashion Revolution
            </motion.div>
            
            <div className="space-y-8">
              <h1 className="text-6xl lg:text-[110px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Create <span className="text-pink-500">Fashion</span> <br />
                Without Photoshoots.
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-pink-500 pl-8 max-w-2xl">
                Upload a model and clothing. Let AI handle virtual try-on, outfit swapping, and professional fashion visuals in seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-pink-600 text-white px-12 py-6 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(219,39,119,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group"
              >
                Start Fashion Studio <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all bg-white/50 dark:bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                Watch Demo <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
             <div className="aspect-[3/4] bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-sm p-6 shadow-3xl overflow-hidden group transition-colors">
                <div className="flex h-full gap-6">
                   {/* Left Panel Simulator */}
                   <div className="w-1/3 h-full border-r border-slate-100 dark:border-white/5 pr-6 space-y-6 opacity-40 group-hover:opacity-100 transition-opacity">
                      <div className="space-y-2">
                        <div className="h-1 w-10 bg-pink-500"></div>
                        <div className="h-4 w-full bg-slate-100 dark:bg-white/10 rounded-sm"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-4">
                         {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5"></div>)}
                      </div>
                      <div className="space-y-3 pt-6">
                         <div className="h-2 w-1/2 bg-slate-100 dark:bg-white/10 rounded-sm"></div>
                         <div className="h-10 w-full bg-pink-500/10 dark:bg-pink-500/20 rounded-sm border border-pink-500/20 dark:border-pink-500/30"></div>
                      </div>
                   </div>
                   {/* Main Canvas Simulator */}
                   <div className="flex-grow bg-slate-50 dark:bg-black rounded-sm border border-pink-500/10 dark:border-pink-500/20 relative overflow-hidden flex items-center justify-center transition-colors">
                      <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 transition-all duration-1000" alt="Fashion Mock" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 dark:opacity-80"></div>
                      <div className="absolute bottom-8 left-8">
                         <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">VIRTUAL TRY-ON</h3>
                         <p className="text-[10px] font-black text-pink-400 dark:text-pink-500 uppercase tracking-[0.4em] mt-2 italic">Neural_Fitting_v4.2</p>
                      </div>
                      <div className="absolute top-6 right-6"><Scan className="text-pink-500 animate-pulse" size={32} /></div>
                   </div>
                </div>
             </div>
             {/* Floating Badge */}
             <div className="absolute -bottom-8 -right-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-sm shadow-3xl border-4 border-slate-900 dark:border-white animate-bounce hidden md:block transition-colors">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-pink-500/10 rounded-full text-pink-600"><Crown size={24}/></div>
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Resolution_Output</p>
                      <p className="text-xl font-black uppercase italic">Ultra HD 4K</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-40 border-y border-slate-100 dark:border-white/5 relative bg-slate-50 dark:bg-[#080808] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Automated Fashion Flow</h2>
             <p className="text-slate-400 dark:text-gray-500 uppercase text-[11px] font-black tracking-[1em] italic">Concept → Synthesis → Result</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { s: '01', t: 'Upload Model Image', d: 'Choose your person or select from our high-end studio model library.', i: <User /> },
              { s: '02', t: 'Upload Clothing', d: 'Upload a flat lay or ghost mannequin photo of the garment you want to try on.', i: <Shirt /> },
              { s: '03', t: 'Generate Results', d: 'AI maps the fabric textures and drape onto the model with realistic physics.', i: <Sparkles /> }
            ].map((step, i) => (
              <div key={i} className="p-12 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-sm relative group hover:border-pink-500/30 transition-all shadow-sm">
                <div className="absolute top-6 right-10 text-6xl font-black italic text-slate-900/[0.03] dark:text-white/[0.03] group-hover:text-pink-500/10 transition-colors">{step.s}</div>
                <div className="w-16 h-16 bg-pink-500/5 dark:bg-pink-500/10 border border-pink-500/10 dark:border-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-500 mb-10 rounded-sm group-hover:scale-110 transition-transform">
                   {React.cloneElement(step.i as React.ReactElement<any>, { size: 32 })}
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4 text-slate-900 dark:text-white">{step.t}</h4>
                <p className="text-slate-500 dark:text-gray-400 leading-relaxed font-bold uppercase text-xs tracking-widest leading-loose">"{step.d}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section className="py-40 bg-white dark:bg-[#050505] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-3xl">
              {[
                { t: 'Virtual Try-On', i: <User />, d: 'Apply any garment to any model image with perfect alignment.' },
                { t: 'Outfit Replacement', i: <Shirt />, d: 'Swap clothes on existing model photos without reshooting.' },
                { t: 'Texture Preservation', i: <Scan />, d: 'Maintain precise fabric details, patterns, and stitching.' },
                { t: 'Pose Control', i: <Activity />, d: 'AI understands body anatomy to prevent visual warping.' },
                { t: 'Studio Lighting', i: <Maximize2 />, d: 'Automated studio-grade lighting and shadow matching.' },
                { t: '8K Ultra Renders', i: <Sparkles />, d: 'High-resolution output ready for high-end e-commerce.' },
                { t: 'Batch Processing', i: <Layers />, d: 'Generate entire catalog variants in a single workflow.' },
                { t: 'IP Protection', i: <ShieldCheck />, d: 'Your proprietary designs are secure and never used for training.' }
              ].map((f, i) => (
                <div key={i} className="p-12 bg-white dark:bg-[#0a0a0c] space-y-6 hover:bg-pink-500/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                   <div className="w-12 h-12 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-pink-500 transition-colors rounded-sm shadow-sm dark:shadow-none">
                      {React.cloneElement(f.i as React.ReactElement<any>, { size: 20 })}
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-lg font-black uppercase tracking-widest italic text-slate-900 dark:text-white">{f.t}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-gray-500 font-bold uppercase leading-relaxed tracking-tighter leading-loose">"{f.d}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. STUDIO UI SHOWCASE */}
      <section className="py-40 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
             <div className="space-y-12">
                <div className="space-y-6">
                   <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Studio-Like <br /><span className="text-pink-500">Orchestration.</span></h2>
                   <p className="text-xl text-slate-500 dark:text-gray-400 font-medium">Professional controls for professional results. The power of a full production team in your browser.</p>
                </div>
                <div className="grid gap-6">
                   {[
                     { t: 'Multi-Modal Input', d: 'Upload models and garments independently for infinite combinations.' },
                     { t: 'Neural Physics', d: 'AI understands fabric weight and drape for realistic fitting.' },
                     { t: 'Studio Context', d: 'Choose backgrounds, lighting setups, and camera angles.' }
                   ].map(item => (
                     <div key={item.t} className="flex items-start gap-6 p-6 border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] rounded-sm group hover:border-pink-500/30 transition-all shadow-sm">
                        <CheckCircle2 size={24} className="text-pink-500 shrink-0" />
                        <div className="space-y-1">
                           <h5 className="font-black uppercase tracking-widest text-sm text-slate-800 dark:text-white">{item.t}</h5>
                           <p className="text-xs text-slate-500 dark:text-gray-500 uppercase font-bold tracking-tight">{item.d}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="relative">
                <div className="absolute inset-0 bg-pink-500/5 blur-[120px] rounded-full animate-pulse"></div>
                <div className="relative bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 p-12 rounded-sm shadow-3xl space-y-10 group overflow-hidden">
                   <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-6">
                      <span className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.4em]">Engine_Inspector</span>
                      <Settings2 size={16} className="text-pink-600 dark:text-pink-500" />
                   </div>
                   <div className="space-y-8">
                      {['Fabric Fidelity', 'Model Alignment', 'Lighting Match'].map(l => (
                        <div key={l} className="space-y-3">
                           <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 dark:text-gray-500"><span>{l}</span><span>94%</span></div>
                           <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-pink-500 w-[94%]"></div></div>
                        </div>
                      ))}
                   </div>
                   <div className="pt-6 grid grid-cols-3 gap-4">
                      {[1,2,3].map(i => <div key={i} className="aspect-[3/4] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-sm shadow-inner"></div>)}
                   </div>
                   <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-20 transition-opacity">
                      <Shirt size={200} className="text-slate-900 dark:text-white" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 5. USE CASES */}
      <section className="py-40 bg-slate-50 dark:bg-[#080808] transition-colors">
         <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24">
           <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4">
                 <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Fashion Every <br /><span className="text-pink-500">Deployment.</span></h2>
              </div>
              <p className="text-slate-400 dark:text-gray-500 font-bold uppercase text-xs tracking-widest max-w-xs text-right italic">"From catalog production to social hype — scaled in seconds."</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-xl">
              {[
                { t: 'E-commerce Catalogs', d: 'Generate consistent product images for thousands of SKUs.', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800' },
                { t: 'Digital Lookbooks', d: 'Architect premium brand stories with high-end models.', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800' },
                { t: 'Affiliate Marketing', d: 'Create unique marketing assets for any clothing link.', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800' },
                { t: 'Social Media Hype', d: 'Daily fashion posts for Instagram and TikTok.', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800' },
                { t: 'Campaign Testing', d: 'Visualize outfit combinations before production.', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800' },
                { t: 'Virtual Influencers', d: 'Dress digital humans in real-world collections.', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800' }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden aspect-[4/5] bg-slate-200 dark:bg-black transition-colors">
                   <img src={item.img} className="w-full h-full object-cover grayscale opacity-60 dark:opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" alt={item.t} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                      <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                         <h4 className="text-3xl font-black uppercase italic tracking-tighter text-white">{item.t}</h4>
                         <p className="text-[10px] text-pink-400 dark:text-pink-500 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">"{item.d}"</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-60 text-center relative overflow-hidden border-t border-slate-100 dark:border-white/5 bg-white dark:bg-black transition-colors">
        <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-slate-900 dark:text-pink-600 leading-none tracking-tighter select-none italic">
          FASHION FASHION FASHION FASHION
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
          <h2 className="text-8xl lg:text-[150px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white">Ship the <br /> <span className="text-pink-500">Visuals.</span></h2>
          <div className="space-y-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-pink-600 text-white px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(219,39,119,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              Launch Fashion Studio <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Universal Credit Ready • Enterprise Privacy • Instant Export</p>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-20 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#030304] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                 <span className="text-slate-900 dark:text-white text-lg tracking-tighter italic font-black">FASHION CENTER AI</span>
              </div>
              <p className="max-w-xs text-center md:text-left opacity-50 font-bold">Industrial-grade fashion asset production. Virtual try-on and high-fidelity visual synthesis.</p>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-pink-600 dark:hover:text-pink-500 transition-colors">Technical Docs</a>
              <a href="#" className="hover:text-pink-600 dark:hover:text-pink-500 transition-colors">Privacy Registry</a>
              <a href="#" className="hover:text-pink-600 dark:hover:text-pink-500 transition-colors">Support Node</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default FashionCenterAI;
