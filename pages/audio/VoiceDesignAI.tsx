import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Zap, ShieldCheck, Sparkles, 
  ArrowRight, Mic2, Volume2, 
  CheckCircle2, Download, Wand2,
  Users, Gamepad, BookOpen, Megaphone,
  Bot, Newspaper, Layers, Lock,
  Globe, Database, Share2, MessageSquare, Activity, Video, X
} from 'lucide-react';
import VoiceDesignWorkspace from '../../components/VoiceDesignWorkspace';
import { Link } from 'react-router-dom';

const VoiceDesignAI: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Khóa cuộn trang bên ngoài khi mở Modal
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <div className="bg-white dark:bg-[#0B0D12] min-h-screen text-slate-900 dark:text-[#E6E8EE] font-sans selection:bg-[#7C7CFF]/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 0. FULL-WIDTH MODAL TOOL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex flex-col overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 dark:bg-black/90 backdrop-blur-xl z-0"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full h-full bg-white dark:bg-[#0c0c0e] z-10 flex flex-col shadow-2xl"
            >
              {/* Toolbar Top */}
              <div className="flex items-center justify-between p-4 md:px-8 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/40 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#7C7CFF]/10 rounded-lg flex items-center justify-center text-[#7C7CFF]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] italic text-slate-800 dark:text-white">Voice_Design_Studio</h2>
                    <p className="text-[8px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest hidden sm:block">Skyverses x ElevenLabs // Terminal 4.2</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="hidden md:flex items-center gap-6 text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 italic">
                      <span>Latency: 12ms</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   </div>
                   <button 
                     onClick={() => setIsModalOpen(false)}
                     className="p-2.5 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all rounded-full"
                   >
                     <X size={28} />
                   </button>
                </div>
              </div>
              
              {/* Workspace Container */}
              <div className="flex-grow overflow-hidden">
                <VoiceDesignWorkspace />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-24 py-20 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[#7C7CFF]/5 dark:bg-[#7C7CFF]/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#4FD1C5]/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-5 space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7C7CFF]/10 border border-[#7C7CFF]/20 text-[#7C7CFF] text-[10px] font-black uppercase tracking-[0.3em] italic"
            >
              <Sparkles size={14} /> AI Voice Technology
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[100px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Design AI Voices <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C7CFF] to-[#4FD1C5]">That Sound Real.</span>
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-[#9AA0B2] font-medium max-w-xl leading-tight border-l-2 border-[#7C7CFF] pl-8 transition-all">
                Describe a voice in plain language. <br />
                Get professional AI voice samples in seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#7C7CFF] text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(124,124,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Create Your First Voice <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] text-slate-600 dark:text-[#E6E8EE] hover:bg-slate-50 dark:hover:bg-white hover:text-black dark:hover:text-black transition-all bg-white/50 dark:bg-white/5 backdrop-blur-md flex items-center justify-center gap-4 shadow-sm">
                Watch Demo <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-7 h-[600px] relative group"
          >
             {/* Thumbnail/Preview của Workspace */}
             <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 relative shadow-2xl transition-colors">
                <img 
                  src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1600" 
                  className="w-full h-full object-cover opacity-20 grayscale group-hover:scale-105 transition-all duration-1000"
                  alt="Workspace Preview"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                   <div className="w-20 h-20 bg-[#7C7CFF]/10 dark:bg-[#7C7CFF]/20 rounded-full flex items-center justify-center border border-[#7C7CFF]/20 dark:border-[#7C7CFF]/40 text-[#7C7CFF] animate-pulse">
                      <Zap size={32} fill="currentColor" />
                   </div>
                   <button 
                     onClick={() => setIsModalOpen(true)}
                     className="px-8 py-3 bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-sm"
                   >
                     Launch Studio Terminal
                   </button>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (3 STEPS) */}
      <section className="py-40 border-y border-slate-200 dark:border-white/5 relative bg-slate-50 dark:bg-[#0D0F16] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">The Design Flow</h2>
             <p className="text-slate-400 dark:text-[#9AA0B2] uppercase text-[10px] font-black tracking-[0.5em]">Simple Interaction // Neural Results</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { s: 'Step 1', t: 'Describe the Voice', d: 'Input keywords or full sentences. "Young female voice, warm, friendly, professional news delivery."', i: <MessageSquare size={32} /> },
              { s: 'Step 2', t: 'Generate Samples', d: 'AI generates 3–5 unique variations instantly. Each with high-fidelity spectral clarity.', i: <Zap size={32} /> },
              { s: 'Step 3', t: 'Save & Reuse', d: 'Store your unique voice DNA in your library. Deploy in videos, games, or apps.', i: <CheckCircle2 size={32} /> }
            ].map((step, i) => (
              <div key={i} className="p-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-sm relative group hover:border-[#7C7CFF]/30 transition-all shadow-sm hover:shadow-xl">
                <div className="absolute top-4 right-8 text-5xl font-black italic text-[#7C7CFF]/5 dark:text-[#7C7CFF]/10 group-hover:text-[#7C7CFF]/20 transition-colors">{step.s}</div>
                <div className="text-[#7C7CFF] mb-10 group-hover:scale-110 transition-transform">
                   {step.i}
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4 text-slate-800 dark:text-white">{step.t}</h4>
                <p className="text-slate-500 dark:text-[#9AA0B2] leading-relaxed font-bold uppercase text-xs tracking-widest leading-loose">"{step.d}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section className="py-40 bg-white dark:bg-[#0B0D12] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden rounded-xl">
              {[
                { t: 'Text-to-Voice Design', i: <Wand2 />, d: 'Create high-fidelity voices from natural language descriptions.' },
                { t: 'Multiple Variations', i: <Layers />, d: 'Generate different tones and spectral weights from a single prompt.' },
                { t: 'Voice Library', i: <Database />, d: 'Save, search, and manage your custom voice fleet effortlessly.' },
                { t: 'Commercial Ready', i: <ShieldCheck />, d: 'Voices authorized for global commercial distribution and ads.' },
                { t: 'Fast Generation', i: <Activity />, d: 'Neural inference processed in seconds via high-throughput nodes.' },
                { t: 'No Training Required', i: <Zap />, d: 'Instant synthesis with zero recordings or file uploads needed.' }
              ].map((f, i) => (
                <div key={i} className="p-16 bg-white dark:bg-[#141821] space-y-8 group hover:bg-[#7C7CFF]/[0.02] transition-all duration-500 border-r border-slate-100 dark:border-white/5 last:border-r-0">
                   <div className="w-12 h-12 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-[#7C7CFF] group-hover:border-[#7C7CFF] transition-all rounded-sm shadow-sm dark:shadow-xl">
                      {React.cloneElement(f.i as React.ReactElement<any>, { size: 24 })}
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800 dark:text-white">{f.t}</h4>
                      <p className="text-sm text-slate-500 dark:text-[#9AA0B2] font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.d}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. INTERACTIVE UI SHOWCASE */}
      <section className="py-40 border-t border-slate-200 dark:border-white/5 relative bg-slate-50 dark:bg-transparent transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24">
           <div className="text-center space-y-4">
              <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter text-slate-800 dark:text-slate-100">Pro Studio UI</h2>
              <p className="text-slate-400 dark:text-[#9AA0B2] uppercase text-[10px] font-black tracking-[0.5em]">The tool of choice for digital architects.</p>
           </div>
           <div className="relative h-[800px] shadow-[0_0_150px_rgba(124,124,255,0.1)] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
              <VoiceDesignWorkspace />
           </div>
        </div>
      </section>

      {/* 5. USE CASES */}
      <section className="py-40 bg-white dark:bg-[#0D0F16] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="text-center space-y-4 mb-24">
              <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white">Designed for <br /><span className="text-[#7C7CFF]">Every Frontier.</span></h2>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[
                { t: 'AI Video V.O.', i: <Video /> },
                { t: 'Game Characters', i: <Gamepad /> },
                { t: 'Audiobooks', i: <BookOpen /> },
                { t: 'Advertising', i: <Megaphone /> },
                { t: 'AI Assistants', i: <Bot /> },
                { t: 'News & M.C.', i: <Newspaper /> }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-6 p-8 border border-slate-100 dark:border-white/5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] hover:bg-[#7C7CFF]/10 dark:hover:bg-[#7C7CFF]/10 transition-all cursor-default group shadow-sm">
                   <div className="text-slate-400 dark:text-gray-500 group-hover:text-[#7C7CFF] transition-colors">{item.i}</div>
                   <span className="text-[11px] font-black uppercase tracking-widest text-center text-slate-600 dark:text-white">{item.t}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 6. SOCIAL PROOF */}
      <section className="py-40 bg-slate-50 dark:bg-[#0B0D12] text-center border-y border-slate-200 dark:border-white/5 transition-colors">
         <div className="max-w-4xl mx-auto space-y-12">
            <p className="text-slate-400 dark:text-[#9AA0B2] uppercase text-[12px] font-black tracking-[0.6em]">Trusted by 10,000+ creators</p>
            <div className="flex flex-wrap justify-center gap-16 opacity-30 dark:opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
               <span className="text-2xl font-black italic tracking-tighter text-slate-800 dark:text-slate-100">YOUTUBE</span>
               <span className="text-2xl font-black italic tracking-tighter text-slate-800 dark:text-slate-100">SPOTIFY</span>
               <span className="text-2xl font-black italic tracking-tighter text-slate-800 dark:text-slate-100">TWITCH</span>
               <span className="text-2xl font-black italic tracking-tighter text-slate-800 dark:text-slate-100">AUDIBLE</span>
            </div>
            <div className="pt-12">
               <p className="text-2xl lg:text-4xl font-light italic text-slate-700 dark:text-[#E6E8EE] max-w-2xl mx-auto leading-relaxed">
                 "This tool replaced our entire voice recording workflow. The consistency is industrial-grade."
               </p>
               <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#7C7CFF]">Chief Creative, Apex Studios</p>
            </div>
         </div>
      </section>

      {/* 7. PRICING */}
      <section className="py-40 bg-white dark:bg-[#0D0F16] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center space-y-24">
           <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-slate-100">Investment Tiers</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Free Plan', price: '$0', desc: 'Experiment with neural audio.', features: ['10 generations / mo', 'Watermarked audio', 'Community support'] },
                { name: 'Pro Plan', price: '$49', desc: 'The choice for daily creators.', features: ['Unlimited voice design', 'Commercial license', 'High-fidelity export'], popular: true },
                { name: 'Studio Plan', price: '$199', desc: 'Enterprise industrial scale.', features: ['Team orchestration', 'API access node', 'Priority H100 inference'] }
              ].map((plan) => (
                <div key={plan.name} className={`p-12 bg-slate-50 dark:bg-[#141821] border transition-all rounded-sm flex flex-col justify-between group ${plan.popular ? 'border-[#7C7CFF] shadow-[0_30px_90px_rgba(124,124,255,0.1)] scale-105 z-20' : 'border-slate-200 dark:border-white/5 opacity-80 hover:opacity-100 shadow-sm'}`}>
                   <div className="space-y-10 text-left">
                      <div className="space-y-2">
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-gray-500">{plan.name}</span>
                         <h4 className="text-5xl font-black italic text-slate-900 dark:text-slate-100">{plan.price}</h4>
                      </div>
                      <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-white/5">
                         {plan.features.map(f => (
                            <div key={f} className="flex items-center gap-3">
                               <CheckCircle2 size={16} className="text-[#7C7CFF]" />
                               <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#9AA0B2]">{f}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                   <button 
                    onClick={() => setIsModalOpen(true)}
                    className={`mt-16 py-6 w-full text-[11px] font-black uppercase tracking-[0.3em] transition-all rounded-sm ${plan.popular ? 'bg-[#7C7CFF] text-white shadow-xl' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-white hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-black border border-slate-200 dark:border-white/10 shadow-sm'}`}>
                      Initialize Plan
                   </button>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-60 text-center relative overflow-hidden bg-[#7C7CFF]">
        <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-white leading-none tracking-tighter select-none italic">
          VOICE VOICE VOICE VOICE
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[130px] font-black uppercase tracking-tighter leading-[0.8] italic text-white">Start Designing <br /> AI Voices Today.</h2>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-10">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-black text-white px-20 py-8 rounded-sm text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
            >
              Create Voice Now
            </button>
            <button className="bg-white/10 text-white border border-white/20 px-20 py-8 rounded-sm text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="py-20 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0B0D12] text-slate-500 dark:text-[#9AA0B2] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-widest">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4 text-slate-900 dark:text-slate-100">
                 <span className="text-lg tracking-tighter italic font-black uppercase">Voice Design AI</span>
              </div>
              <p className="max-w-xs text-center md:text-left opacity-70 font-bold leading-relaxed">Industrial-grade AI voice synthesis. Build expressive, natural identities for global deployment.</p>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-[#7C7CFF] transition-colors">Pricing</a>
              <a href="#" className="hover:text-[#7C7CFF] transition-colors">Docs</a>
              <a href="#" className="hover:text-[#7C7CFF] transition-colors">API</a>
              <a href="#" className="hover:text-[#7C7CFF] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#7C7CFF] transition-colors">Terms</a>
           </div>
        </div>
        <div className="mt-12 text-center text-[8px] opacity-20 uppercase tracking-[0.3em]">
           © 2025 Voice Design AI // Part of Skyverses Soul Network
        </div>
      </footer>
    </div>
  );
};

export default VoiceDesignAI;
