import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Upload, Maximize2, Sparkles, 
  Download, Zap, ShieldCheck, CheckCircle2, 
  ArrowRight, Play, Info, Layers, 
  ImageIcon, Search, Activity, MousePointer2,
  Image as LucideImage
} from 'lucide-react';
import UpscaleWorkspace from '../../components/UpscaleWorkspace';
import { useLanguage } from '../../context/LanguageContext';

const ImageUpscaleAI = () => {
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <UpscaleWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050505] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-[#4ade80]/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#4ade80]/5 dark:bg-[#4ade80]/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#00a870] dark:text-[#4ade80] text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} /> Industrial Image Enhancement
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[100px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Upscale to <br />
                <span className="text-[#00a870] dark:text-[#4ade80]">Stunning 4K.</span>
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-[#00a870] dark:border-[#4ade80] pl-8 max-w-xl transition-colors">
                Enhance resolution, restore details, and upgrade your visuals using advanced AI upscaling.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-[#00a870] dark:bg-[#4ade80] text-white dark:text-black px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(74,222,128,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Upload Image <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all backdrop-blur-md flex items-center justify-center gap-4">
                View Example <Play size={16} fill="currentColor" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <div 
              onClick={() => setIsStudioOpen(true)}
              className="aspect-square bg-slate-50 dark:bg-[#0a0a0c] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-8 cursor-pointer group hover:border-[#00a870] dark:hover:border-[#4ade80]/50 transition-all relative overflow-hidden shadow-sm dark:shadow-none"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-24 h-24 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-gray-500 group-hover:text-[#00a870] dark:group-hover:text-[#4ade80] group-hover:bg-[#4ade80]/10 transition-all shadow-sm">
                  <Upload size={40} />
               </div>
               <div className="space-y-2 text-center relative z-10">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">Drag & Drop Here</h3>
                  <p className="text-xs text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest">Supports JPG, PNG, WEBP up to 20MB</p>
               </div>
               
               <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center opacity-60 dark:opacity-40 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3">
                     <Activity size={14} className="text-[#00a870] dark:text-[#4ade80]" />
                     <span className="text-[10px] font-black uppercase text-slate-600 dark:text-white">Neural_Processing: 0.4s</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <ShieldCheck size={14} className="text-blue-500 dark:text-blue-400" />
                     <span className="text-[10px] font-black uppercase text-slate-600 dark:text-white">VPC_SECURE</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ... rest of the file stays the same ... */}
      <section className="py-40 bg-slate-50 dark:bg-[#080808] border-y border-slate-100 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Instant Production Flow</h2>
             <p className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Simple Steps // Complex Neural Synthesis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Upload Image', desc: 'Drag & drop your source file or select from your device local storage.', icon: <Upload /> },
              { step: '02', title: 'AI Upscale', desc: 'Our neural core enhances resolution and sharpens details in real-time.', icon: <Maximize2 /> },
              { step: '03', title: 'Download 4K', desc: 'Get a clean, high-resolution result ready for professional deployment.', icon: <Download /> }
            ].map((s, i) => (
              <div key={i} className="p-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-sm relative group overflow-hidden hover:border-[#00a870] dark:hover:border-[#4ade80]/30 transition-all shadow-sm">
                <div className="absolute -top-10 -right-10 text-[140px] font-black text-slate-900/[0.03] dark:text-white/[0.02] italic group-hover:text-[#4ade80]/5 transition-colors">{s.step}</div>
                <div className="w-16 h-16 bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center text-[#00a870] dark:text-[#4ade80] mb-10 rounded-sm group-hover:scale-110 transition-transform">
                   {React.cloneElement(s.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4 text-slate-900 dark:text-white">{s.title}</h4>
                <p className="text-slate-500 dark:text-gray-400 leading-relaxed font-bold uppercase text-xs tracking-widest leading-loose">"{s.desc}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-40 bg-white dark:bg-black transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-3xl">
              {[
                { t: 'AI-Powered Synth', i: <Zap />, d: 'Instant synthesis of high-frequency details for crisp edges.' },
                { t: 'Batch Processing', i: <Layers />, d: 'Optimize entire asset libraries in a single orchestrated run.' },
                { t: 'Visual Comparison', i: <Search />, d: 'Split-view mode to audit pixel-level enhancements.' },
                { t: 'Detail Retention', i: <Activity />, d: 'AI understands textures to prevent "plastic" or over-smoothed looks.' },
                { t: 'Multi-Format', i: <ImageIcon />, d: 'Universal support for industrial JPG, PNG, and WEBP inputs.' },
                { t: 'Fast Inference', i: <Activity />, d: 'Average processing time under 2 seconds per 4K upscale.' },
                { t: 'Zero Watermark', i: <CheckCircle2 />, d: 'Clean production-ready output for all professional plans.' },
                { t: 'VPC Privacy', i: <ShieldCheck />, d: 'Local sandbox isolation ensuring your data never trains the model.' }
              ].map((f, i) => (
                <div key={i} className="p-12 bg-white dark:bg-[#0a0a0c] space-y-6 hover:bg-[#4ade80]/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                   <div className="text-[#00a870] dark:text-[#4ade80]/60 group-hover:dark:text-[#4ade80] transition-colors">
                      {React.cloneElement(f.i as React.ReactElement<any>, { size: 24 })}
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-lg font-black uppercase tracking-widest italic text-slate-900 dark:text-white">{f.t}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400 font-bold uppercase leading-relaxed tracking-tighter leading-loose">"{f.d}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="py-40 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#080808] transition-colors">
         <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-20">
            <div className="text-center space-y-4">
               <h2 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Experience the Shift.</h2>
               <p className="text-slate-400 dark:text-gray-500 font-bold uppercase text-[12px] tracking-[0.5em]">"See the difference AI makes in seconds."</p>
            </div>
            
            <div className="relative aspect-video bg-slate-200 dark:bg-black border border-slate-200 dark:border-white/5 rounded-sm overflow-hidden shadow-3xl group">
               <img src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1600" className="absolute inset-0 w-full h-full object-cover blur-md grayscale opacity-50" alt="Low Res" />
               <div className="absolute inset-0 w-1/2 overflow-hidden border-r-2 border-[#00a870] dark:border-[#4ade80] shadow-2xl z-20">
                  <img src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=100&w=1600" className="absolute left-0 w-[200%] h-full object-cover" alt="High Res" />
                  <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-[#00a870] dark:bg-[#4ade80] text-white dark:text-black text-[10px] font-black uppercase tracking-widest">AI_UPSCALE_4K</div>
               </div>
               <div className="absolute bottom-6 right-6 px-4 py-1.5 bg-black/10 dark:bg-white/10 backdrop-blur-md text-slate-800 dark:text-white text-[10px] font-black uppercase tracking-widest">ORIGINAL_SD</div>
               
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-110 transition-transform">
                  <div className="w-16 h-16 rounded-full bg-[#4ade80]/20 backdrop-blur-xl border border-[#4ade80]/40 flex items-center justify-center text-[#00a870] dark:text-[#4ade80] shadow-2xl">
                     <MousePointer2 size={24} />
                  </div>
               </div>
            </div>
         </div>
      </section>

      <section className="py-40 bg-white dark:bg-black transition-colors duration-500">
         <div className="max-w-[1400px] mx-auto px-6 lg:px-12 space-y-24">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4">
                 <h2 className="text-5xl lg:text-[100px] font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Market Every <br /><span className="text-[#00a870] dark:text-[#4ade80]">Detail.</span></h2>
              </div>
              <p className="text-slate-400 dark:text-gray-500 font-bold uppercase text-xs tracking-widest max-w-xs text-right italic transition-colors">"From blurry concepts to production-grade 4K masters."</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { t: 'Real Estate Photos', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' },
                { t: 'E-commerce Products', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800' },
                { t: 'Old Memories', img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=800' },
                { t: 'Game Textures', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800' },
                { t: 'Marketing Assets', img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800' },
                { t: 'Content Creation', img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1600' }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden aspect-video border border-slate-100 dark:border-white/5 rounded-sm shadow-2xl hover:border-[#4ade80]/40 transition-all cursor-pointer bg-slate-100 dark:bg-[#0a0a0a]">
                   <img src={item.img} className="w-full h-full object-cover grayscale opacity-40 dark:opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" alt={item.t} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-8 flex flex-col justify-end">
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white translate-y-2 group-hover:translate-y-0 transition-transform">{item.t}</h4>
                   </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      <section className="py-60 text-center relative overflow-hidden bg-slate-50 dark:bg-[#020203] border-t border-slate-100 dark:border-white/5 transition-colors">
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-slate-300 dark:text-[#4ade80] leading-none tracking-tighter select-none italic">
          UPSCALE UPSCALE UPSCALE
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white transition-colors">Upgrade Your <br /> <span className="text-[#00a870] dark:text-[#4ade80]">Images.</span></h2>
           <div className="space-y-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-[#00a870] dark:bg-[#4ade80] text-white dark:text-black px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(74,222,128,0.2)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              Upscale Images Now <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Universal Credit Ready • Enterprise Privacy • 8K Support</p>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#030304] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                 <span className="text-slate-900 dark:text-white text-lg tracking-tighter italic font-black uppercase transition-colors">Image Upscale AI</span>
              </div>
              <p className="max-w-xs text-center md:text-left opacity-50 font-bold leading-relaxed">Industrial-grade image enhancement. 4K/8K resolution scaling and high-frequency detail restoration.</p>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-[#00a870] dark:hover:text-[#4ade80] transition-colors">Tech Docs</a>
              <a href="#" className="hover:text-[#00a870] dark:hover:text-[#4ade80] transition-colors">Privacy Node</a>
              <a href="#" className="hover:text-[#00a870] dark:hover:text-[#4ade80] transition-colors">Support Registry</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default ImageUpscaleAI;