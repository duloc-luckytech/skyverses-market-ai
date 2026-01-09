
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Zap, ShieldCheck, Sparkles, 
  ArrowRight, Video, UserCircle, 
  Maximize2, Share2, Layers, 
  RefreshCw, ChevronLeft, Lock,
  Film, Activity, Palette,
  // Added MonitorPlay to imports
  MonitorPlay
} from 'lucide-react';
import { Link } from 'react-router-dom';
import VideoAnimateWorkspace from '../../components/VideoAnimateWorkspace';
import { useLanguage } from '../../context/LanguageContext';

const VideoAnimateAI = () => {
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <VideoAnimateWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* --- HERO SECTION --- */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-cyan-600/5 dark:bg-cyan-600/10 rounded-full blur-[200px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] italic"
            >
              <Sparkles size={14} /> AI-Powered Animation Studio
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[110px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Bring Any Image <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-500">to Life.</span>
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-cyan-500 pl-8 max-w-xl">
                Upload a photo and a reference video — AI blends them into a dynamic animated scene with consistent identity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-cyan-600 text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Create Animated Video <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all bg-white/50 dark:bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                Watch Demo <Play size={16} fill="currentColor" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-6"
          >
            {/* DUAL INPUT VISUALIZATION */}
            <div className="relative bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl p-8 shadow-3xl overflow-hidden transition-colors">
               <div className="grid grid-cols-2 gap-8 mb-12 relative">
                  {/* Arrows */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-2 text-cyan-500 animate-pulse">
                     <ArrowRight size={24} />
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Source Image</p>
                     <div className="aspect-square bg-slate-100 dark:bg-black rounded-lg border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-50 grayscale" alt="Source" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Motion Reference</p>
                     <div className="aspect-square bg-slate-100 dark:bg-black rounded-lg border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden relative">
                        <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-30 grayscale" alt="Motion" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                              <Film size={20} />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-4 pt-12 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black uppercase text-cyan-500 tracking-widest text-center">AI Motion Output</p>
                  <div className="aspect-video bg-black rounded-lg border border-cyan-500/30 overflow-hidden relative shadow-2xl">
                     <video src="https://framerusercontent.com/assets/U4v4W7xT3tL0N8I.mp4" autoPlay loop muted className="w-full h-full object-cover opacity-80" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                     <div className="absolute bottom-4 left-4 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                        <span className="text-[8px] font-black uppercase text-white tracking-[0.4em]">Rendering_Sequence_VEO3</span>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-40 bg-slate-50 dark:bg-[#070709] border-y border-slate-200 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">The Animation Loop</h2>
             <p className="text-slate-500 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Simple Steps // Recursive Neural Synthesis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Upload an Image', desc: 'Choose a portrait, character, or subject. This defines the appearance and identity.', icon: <UserCircle /> },
              { step: '02', title: 'Add Motion (Optional)', desc: 'Upload a reference video to define movement, camera dynamics, and energy.', icon: <Film /> },
              { step: '03', title: 'Generate AI Video', desc: 'AI extracts motion and applies it to your image, rendering a perfectly synced scene.', icon: <Zap /> }
            ].map((s, i) => (
              <div key={i} className="p-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-sm relative group overflow-hidden hover:border-cyan-500/30 transition-all shadow-sm">
                <div className="absolute -top-10 -right-10 text-[140px] font-black text-slate-900/[0.02] dark:text-white/[0.02] italic">{s.step}</div>
                <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-10 rounded-sm group-hover:scale-110 transition-transform">
                   {React.cloneElement(s.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4 text-slate-900 dark:text-white">{s.title}</h4>
                <p className="text-slate-500 dark:text-gray-500 leading-relaxed font-bold uppercase text-xs tracking-widest leading-loose">"{s.desc}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CORE FEATURES --- */}
      <section className="py-40 bg-white dark:bg-black transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-xl">
              {[
                { t: 'Image-to-Video', i: <Video />, d: 'Animate static portraits into cinematic movement loops.' },
                { t: 'Motion Transfer', i: <Activity />, d: 'Apply real human movement to your AI characters.' },
                { t: 'Face Swap Tech', i: <RefreshCw />, d: 'Seamlessly replace faces in any video while keeping motion.' },
                { t: 'Multiple Styles', i: <Palette />, d: 'Support for Action, Dance, and Cinematic motion presets.' },
                { t: '1080P Output', i: <Maximize2 />, d: 'High-fidelity renders ready for professional broadcast.' },
                { t: 'Wan 2.2 Core', i: <Layers />, d: 'Powered by state-of-the-art animation foundation models.' },
                { t: 'Fast Processing', i: <Zap />, d: 'Rapid inference via dedicated H100 cluster nodes.' },
                { t: 'Clean Studio UI', i: <MonitorPlay />, d: 'Professional workspace designed for rapid creative flow.' }
              ].map((f, i) => (
                <div key={i} className="p-12 bg-white dark:bg-[#0a0a0c] space-y-6 hover:bg-cyan-500/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                   <div className="text-cyan-600 dark:text-cyan-400 opacity-60 group-hover:opacity-100 transition-colors">
                      {React.cloneElement(f.i as React.ReactElement<any>, { size: 24 })}
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

      {/* --- FINAL CTA --- */}
      <section className="py-60 text-center relative overflow-hidden bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-white/5 transition-colors">
        <div className="absolute inset-0 z-0 opacity-5 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-cyan-600 dark:text-cyan-500 leading-none tracking-tighter select-none italic">
          MOTION MOTION MOTION MOTION
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white transition-colors">Turn Photos <br /> Into <span className="text-cyan-600 dark:text-cyan-500">Living Videos.</span></h2>
           <div className="space-y-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-cyan-600 text-white px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(6,182,212,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              Start Animating Now <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Universal Credit Ready • 1080P Synthesis • High-Speed Export</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#030304] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                 <span className="text-slate-900 dark:text-white text-lg tracking-tighter italic font-black">VIDEO ANIMATE AI</span>
              </div>
              <p className="max-w-xs text-center md:text-left opacity-50 font-bold leading-relaxed">Advanced Image-to-Video orchestration. Professional motion transfer and temporal synthesis.</p>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-500 transition-colors">Studio Documentation</a>
              <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-500 transition-colors">Privacy Node</a>
              <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-500 transition-colors">Service Terms</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default VideoAnimateAI;
