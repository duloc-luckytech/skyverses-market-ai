
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, Play, Zap, ShieldCheck, 
  Sparkles, CheckCircle2, User, 
  Video, MessageSquare, ArrowRight,
  MonitorPlay, Palette, Clock,
  Cpu, Layers, Smartphone, Share2, 
  ChevronRight, Volume2, Globe, LucideImage,
  Upload, Camera, Download,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AvatarLipsyncWorkspace from '../../components/AvatarLipsyncWorkspace';
import { useLanguage } from '../../context/LanguageContext';

const AvatarLipsyncAI = () => {
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <AvatarLipsyncWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-violet-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* --- TOP BAR CTA --- */}
      <div className="fixed top-24 right-12 z-[100] hidden md:block">
         <button 
           onClick={() => setIsStudioOpen(true)}
           className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center gap-3 shadow-sm dark:shadow-none"
         >
            <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
            <span className="text-slate-700 dark:text-white">Tạo video avatar nói với giọng của bạn</span>
         </button>
      </div>

      {/* --- 1. HERO SECTION --- */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
              <Sparkles size={14} /> AI-Powered Virtual Presenters
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[100px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Create Talking <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-500">Avatar Videos.</span>
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-violet-500 pl-8 max-w-xl">
                Upload an avatar, add your voice, and let AI generate perfectly lip-synced videos in seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-violet-600 text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Create Avatar Video <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
            {/* STUDIO PREVIEW MOCKUP */}
            <div className="relative aspect-video bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-3xl overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-transparent"></div>
               <div className="h-full w-full bg-black rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden relative">
                  <video 
                    src="https://framerusercontent.com/assets/U4v4W7xT3tL0N8I.mp4" 
                    autoPlay loop muted 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[5s]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                  
                  {/* Floating UI elements */}
                  <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                     <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                     <span className="text-[8px] font-black uppercase text-white tracking-widest">Rendering_Alpha_v1.2</span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-violet-400 tracking-widest italic">Lipsync_Sync: OK</p>
                        <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">Presenter_042</h3>
                     </div>
                     <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40"><Mic size={16}/></div>
                        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white"><Download size={16}/></div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 2. HOW IT WORKS --- */}
      <section className="py-40 border-y border-slate-200 dark:border-white/5 relative bg-slate-50 dark:bg-[#070709] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Instant Production Flow</h2>
             <p className="text-slate-500 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Simple Steps // Complex Neural Synthesis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Choose an Avatar', desc: 'Upload your own portrait image or select from our diverse high-fidelity avatar library.', icon: <User /> },
              { step: '02', title: 'Add Audio Input', desc: 'Upload a voice file, record directly in-browser, or generate speech via high-end TTS.', icon: <Mic /> },
              { step: '03', title: 'Generate & Ship', desc: 'AI synchronizes facial movement and speech automatically to create your video.', icon: <Zap /> }
            ].map((s, i) => (
              <div key={i} className="p-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-sm relative group overflow-hidden hover:border-violet-500/30 transition-all shadow-sm dark:shadow-2xl">
                <div className="absolute -top-10 -right-10 text-[140px] font-black text-slate-900/[0.02] dark:text-white/[0.02] italic group-hover:text-violet-500/[0.05] transition-colors">{s.step}</div>
                <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-10 rounded-sm group-hover:scale-110 transition-transform">
                   {React.cloneElement(s.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4 text-slate-900 dark:text-white">{s.title}</h4>
                <p className="text-slate-500 dark:text-gray-500 leading-relaxed font-bold uppercase text-xs tracking-widest leading-loose">"{s.desc}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 3. CORE FEATURES --- */}
      <section className="py-40 bg-white dark:bg-black transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-3xl">
              {[
                { t: 'Accurate AI Lipsync', i: <MessageSquare />, d: 'Pixel-perfect mouth synchronization with any audio frequency.' },
                { t: 'Multi-Audio Input', i: <Volume2 />, d: 'Support for Upload, Live Recording, and Pro-grade TTS.' },
                { t: 'Custom Uploads', i: <LucideImage />, d: 'Bring your own characters, brand mascots, or real people to life.' },
                { t: 'Facial Physics', i: <Activity />, d: 'Intelligent head tilts, eyebrow movement, and natural blinking.' },
                { t: 'Fast Generation', i: <Zap />, d: 'Synthesize high-fidelity video in minutes using our H100 cluster.' },
                { t: '8K Native Renders', i: <MonitorPlay />, d: 'Master-tier output ready for broadcast and high-end marketing.' },
                { t: 'Global Languages', i: <Globe />, d: 'Speak any language fluently with automated phonetic mapping.' },
                { t: 'VPC Security', i: <ShieldCheck />, d: 'Proprietary models are VPC-isolated for enterprise-grade privacy.' }
              ].map((f, i) => (
                <div key={i} className="p-12 bg-white dark:bg-[#0a0a0c] space-y-6 hover:bg-violet-500/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                   <div className="text-violet-600 dark:text-violet-400 opacity-60 group-hover:opacity-100 transition-colors">
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

      {/* --- 4. USE CASES --- */}
      <section className="py-40 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#070709] relative overflow-hidden transition-colors">
         <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4">
                 <h2 className="text-5xl lg:text-[100px] font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Animate Every <br /><span className="text-violet-600 dark:text-violet-500">Narrative.</span></h2>
              </div>
              <p className="text-slate-500 dark:text-gray-500 font-bold uppercase text-xs tracking-widest max-w-xs text-right italic">"From education to influencers — give your brand a face."</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { t: 'Marketing Ads', img: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=800' },
                { t: 'Online Courses', img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800' },
                { t: 'AI Influencers', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
                { t: 'Presentations', img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800' },
                { t: 'Corporate Training', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' },
                { t: 'Interactive Storytelling', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800' }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden aspect-[4/5] border border-slate-200 dark:border-white/5 rounded-sm shadow-xl hover:border-violet-500/40 transition-all cursor-pointer bg-slate-200 dark:bg-black">
                   <img src={item.img} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 dark:group-hover:opacity-60 transition-all duration-700 group-hover:scale-105" alt={item.t} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-10 flex flex-col justify-end">
                      <h4 className="text-3xl font-black uppercase italic tracking-tighter text-white translate-y-4 group-hover:translate-y-0 transition-transform">{item.t}</h4>
                   </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* --- 5. WHY US --- */}
      <section className="py-40 bg-white dark:bg-black transition-colors">
         <div className="max-w-4xl mx-auto px-6 text-center space-y-16">
            <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Why Avatar Lipsync AI?</h2>
            <div className="grid gap-12 text-left">
               {[
                 { t: 'Zero Production Costs', d: 'Eliminate the need for professional cameras, lighting, and sets. Your avatar is always ready.' },
                 { t: 'Brand Consistency', d: 'Keep your presenters uniform across global markets and multi-language content.' },
                 { t: 'Hyper-Speed Output', d: 'Go from script to final video in minutes, enabling high-frequency social delivery.' },
                 { t: 'Technical Mastery', d: 'Built on proprietary acoustic mapping tech for the most realistic mouth sync available.' }
               ].map((item, i) => (
                  <div key={i} className="flex gap-8 items-start border-b border-slate-100 dark:border-white/5 pb-10 group">
                     <span className="text-4xl font-black italic text-violet-600/20 dark:text-violet-500/20 group-hover:text-violet-600 dark:group-hover:text-violet-500 transition-colors leading-none">0{i+1}</span>
                     <div className="space-y-2">
                        <h4 className="text-2xl font-black uppercase italic text-slate-800 dark:text-white">{item.t}</h4>
                        <p className="text-slate-500 dark:text-gray-500 font-medium leading-relaxed uppercase text-xs tracking-widest">"{item.d}"</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- 6. FINAL CTA --- */}
      <section className="py-60 text-center relative overflow-hidden bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-white/5 transition-colors">
        <div className="absolute inset-0 z-0 opacity-5 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-violet-600 dark:text-violet-500 leading-none tracking-tighter select-none italic">
          SYNC SYNC SYNC SYNC
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white transition-colors">Animate Your <br /> <span className="text-violet-600 dark:text-violet-500">Identity.</span></h2>
           <div className="space-y-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-violet-600 text-white px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(139,92,246,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              Start Creating Now <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Universal Credit Ready • Enterprise Privacy • Instant Export</p>
          </div>
        </div>
      </section>

      {/* --- 7. FOOTER --- */}
      <footer className="py-20 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#030304] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                 <span className="text-slate-900 dark:text-white text-lg tracking-tighter italic font-black uppercase transition-colors">Avatar Lipsync AI</span>
              </div>
              <p className="max-w-xs text-center md:text-left opacity-50 font-bold leading-relaxed">Industrial-grade virtual presenter production. Perfectly synced mouth movement and facial synthesis.</p>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-violet-600 dark:hover:text-violet-500 transition-colors">Documentation</a>
              <a href="#" className="hover:text-violet-600 dark:hover:text-violet-500 transition-colors">Privacy Node</a>
              <a href="#" className="hover:text-violet-600 dark:hover:text-violet-500 transition-colors">Support Registry</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default AvatarLipsyncAI;
