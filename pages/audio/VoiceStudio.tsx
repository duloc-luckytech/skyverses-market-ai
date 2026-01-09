
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, Mic2, 
  Sparkles, AudioLines, ShieldCheck, 
  Settings2, Activity, Workflow, Info,
  Volume2, Globe, BrainCircuit, Headphones,
  Server, Lock, Crown, ArrowRight, CheckCircle2,
  Database, Fingerprint, Layers, LayoutGrid,
  ChevronRight, Star, Wand2, Copy, Download,
  Terminal, MonitorPlay, Smartphone, Gamepad,
  BookOpen, Megaphone, Bot, Layout, 
  Settings, MessageSquare
} from 'lucide-react';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import VoiceStudioWorkspace from '../../components/VoiceStudioWorkspace';

const VoiceStudio = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'ai-voice-studio');
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <VoiceStudioWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-orange-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-orange-600/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      </div>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 lg:px-12 py-20 overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} /> The All-in-One Voice Ecosystem
            </div>
            
            <h1 className="text-6xl lg:text-[100px] font-black leading-[0.85] tracking-tighter italic uppercase">
              Voice Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-purple-500">
                Vision.
              </span>
            </h1>
            
            <p className="text-xl lg:text-3xl text-gray-400 font-medium max-w-xl leading-tight border-l-2 border-orange-500 pl-8">
              Design unique AI voices from text description, clone your digital identity, and synthesize studio-quality narration for global content.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-orange-600 text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(234,88,12,0.3)] hover:scale-105 active:scale-[0.95] transition-all flex items-center justify-center gap-4 group"
              >
                Launch Voice Studio <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                View Use Cases <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-video bg-[#0a0a0c] border border-white/5 rounded-xl p-4 shadow-3xl overflow-hidden group ring-1 ring-white/10">
               <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent"></div>
               <div className="h-full w-full bg-[#050505] rounded-lg border border-white/5 flex overflow-hidden">
                  <div className="w-1/3 border-r border-white/5 p-4 space-y-6 hidden md:block">
                    <div className="space-y-2">
                      <div className="h-1 w-8 bg-orange-500"></div>
                      <div className="h-3 w-full bg-white/5 rounded-sm"></div>
                    </div>
                    <div className="space-y-4 pt-4 opacity-40">
                      {[1, 2, 3].map(i => <div key={i} className="h-8 w-full bg-white/5 rounded-sm border border-white/5"></div>)}
                    </div>
                  </div>
                  <div className="flex-grow p-6 flex flex-col justify-between">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <AudioLines className="text-orange-500 animate-pulse" size={20} />
                           <div className="h-2 w-32 bg-white/10 rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                           <div className="h-3 w-full bg-white/5 rounded-sm"></div>
                           <div className="h-3 w-5/6 bg-white/5 rounded-sm"></div>
                           <div className="h-3 w-4/6 bg-white/5 rounded-sm"></div>
                        </div>
                     </div>
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest italic">Acoustic_Engine_v1.4</p>
                           <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Identity Mastery.</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center shadow-2xl">
                           <Play size={16} fill="white" className="ml-1" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: TRUST --- */}
      <section className="py-20 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 whitespace-nowrap">Trusted by industry leaders</p>
             <div className="flex flex-wrap justify-center gap-16 items-center">
                <span className="text-2xl font-black italic tracking-tighter">SSTUDIO_CORE</span>
                <span className="text-2xl font-black italic tracking-tighter">VOX_NET</span>
                <span className="text-2xl font-black italic tracking-tighter">PIXEL_LABS</span>
                <span className="text-2xl font-black italic tracking-tighter">NARRATIVE_AI</span>
             </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: CORE FEATURES --- */}
      <section className="py-40 bg-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="text-center space-y-4 mb-24">
              <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">Industrial Capabilities</h2>
              <p className="text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Studio Grade // Zero Latency // Global Reach</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 shadow-3xl">
              {[
                { title: 'AI Voice Design', icon: <Sparkles />, desc: 'Describe a personality and generate a unique vocal identity instantly.' },
                { title: 'Professional Cloning', icon: <Fingerprint />, desc: 'High-fidelity digital twin creation from limited audio samples.' },
                { title: 'Multi-Engine Logic', icon: <Layers />, desc: 'Seamlessly switch between top-tier acoustic engines for specific tasks.' },
                { title: 'Fleet Management', icon: <Database />, desc: 'Organize, search, and version your entire library of AI voice models.' }
              ].map((f, i) => (
                <div key={i} className="p-12 bg-[#080808] space-y-8 group hover:bg-orange-500/[0.02] transition-all duration-500 border-r border-white/5 last:border-r-0">
                   <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-orange-500 group-hover:border-orange-500 transition-all rounded-sm shadow-sm">
                      {React.cloneElement(f.icon as React.ReactElement<any>, { size: 24 })}
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-2xl font-black uppercase tracking-tighter italic">{f.title}</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.desc}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- SECTION 4: FEATURE DEEP DIVE --- */}
      <section className="py-40 space-y-60 relative overflow-hidden">
        
        {/* A - AI Voice Design */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="space-y-10 order-2 lg:order-1">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-orange-500">
                    <Wand2 size={24} />
                    <span className="text-[10px] font-black uppercase tracking-[0.6em]">Semantic_Synthesis</span>
                 </div>
                 <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-white">Design by <br /><span className="text-orange-500">Description.</span></h2>
                 <p className="text-xl text-gray-400 font-medium">Define vocal traits using natural language. Our system analyzes age, gender, regional accent, and emotional nuance to architect a unique sonic entity.</p>
              </div>
              <ul className="space-y-4">
                 {['Precise age and gender modulation.', 'Global regional accent selection.', 'Inject emotional weight (Happy, Serious, Narrative).'].map(item => (
                    <li key={item} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-500 group">
                       <CheckCircle2 size={16} className="text-orange-500" /> {item}
                    </li>
                 ))}
              </ul>
           </div>
           <div className="order-1 lg:order-2 p-1 border border-white/10 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent">
              <div className="bg-[#0a0a0c] aspect-square rounded-lg border border-white/5 flex items-center justify-center p-12 overflow-hidden group">
                 <Mic2 size={120} strokeWidth={1} className="text-orange-500/20 group-hover:scale-110 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#ea580c10_0%,_transparent_60%)]"></div>
              </div>
           </div>
        </div>

        {/* B - Voice Cloning */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="p-1 border border-white/10 rounded-xl bg-gradient-to-bl from-purple-500/10 to-transparent">
              <div className="bg-[#0a0a0c] aspect-[4/3] rounded-lg border border-white/5 flex items-center justify-center p-12 overflow-hidden group">
                 <Fingerprint size={120} strokeWidth={1} className="text-purple-500/20 group-hover:scale-110 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#a855f710_0%,_transparent_60%)]"></div>
              </div>
           </div>
           <div className="space-y-10">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-purple-500">
                    <Copy size={24} />
                    <span className="text-[10px] font-black uppercase tracking-[0.6em]">Digital_Twinning</span>
                 </div>
                 <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-white">Cloning <br /><span className="text-purple-500">Stability.</span></h2>
                 <p className="text-xl text-gray-400 font-medium">Upload limited audio samples (MP3, WAV, M4A) to generate a high-fidelity digital twin. Our algorithm anchors vocal DNA to ensure 99.9% consistency across scripts.</p>
              </div>
              <div className="flex items-center gap-6 p-6 border border-white/5 bg-white/[0.02] rounded-sm group hover:border-purple-500/30 transition-all">
                 <ShieldCheck className="text-purple-500 w-12 h-12" />
                 <div className="space-y-1">
                    <h5 className="text-sm font-black uppercase tracking-widest italic">Industrial Protection</h5>
                    <p className="text-[10px] text-gray-500 uppercase tracking-tight font-bold">Cloned data is protected by private VPC protocols.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* C - Voice Library */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="space-y-10 order-2 lg:order-1">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-amber-500">
                    <Database size={24} />
                    <span className="text-[10px] font-black uppercase tracking-[0.6em]">Vocal_Fleet</span>
                 </div>
                 <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-white">Your Personal <br /><span className="text-amber-500">Vault.</span></h2>
                 <p className="text-xl text-gray-400 font-medium">Manage your fleet of AI voices in a central registry. Categorize by engine, availability status, and usage history for optimized production workflows.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { l: 'Uptime', v: '99.9%' },
                   { l: 'Storage', v: 'Encrypted' },
                   { l: 'Latency', v: 'Instant' },
                   { l: 'Access', v: 'Secure' }
                 ].map(stat => (
                    <div key={stat.l} className="border-l border-white/10 pl-6 space-y-1">
                       <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{stat.l}</p>
                       <p className="text-xl font-black italic">{stat.v}</p>
                    </div>
                 ))}
              </div>
           </div>
           <div className="order-1 lg:order-2 p-1 border border-white/10 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent">
              <div className="bg-[#0a0a0c] aspect-square rounded-lg border border-white/5 flex items-center justify-center p-12 overflow-hidden group">
                 <LayoutGrid size={120} strokeWidth={1} className="text-amber-500/20 group-hover:scale-110 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#f59e0b10_0%,_transparent_60%)]"></div>
              </div>
           </div>
        </div>
      </section>

      {/* --- SECTION 5: HOW IT WORKS --- */}
      <section className="py-40 bg-[#08080a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">How it Works</h2>
             <p className="text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Acoustic Pipeline // Deterministic Workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { s: '01', t: 'Design or Choose', d: 'Select a voice from your vault or describe a new persona for instant synthesis.', i: <Headphones /> },
              { s: '02', t: 'Input Script', d: 'Enter your raw text script. Multilingual support with deep semantic parsing.', i: <Terminal /> },
              { s: '03', t: 'Generate & Export', d: 'AI synthesizes and masters audio at 48kHz. Export instantly for global deployment.', i: <Download /> }
            ].map((step, i) => (
              <div key={i} className="p-12 bg-white/5 border border-white/10 rounded-sm relative group hover:border-orange-500/40 transition-all shadow-sm">
                <div className="absolute top-4 right-8 text-5xl font-black italic text-orange-500/10 transition-colors group-hover:text-orange-500/20">{step.s}</div>
                <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-10 rounded-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                   {React.cloneElement(step.i as React.ReactElement<any>, { size: 28 })}
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4">{step.t}</h4>
                <p className="text-gray-500 leading-relaxed font-bold uppercase text-xs tracking-widest leading-loose">"{step.d}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 6: USE CASES --- */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24">
           <div className="flex justify-between items-end">
              <div className="space-y-4">
                 <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic">Sector Applications.</h2>
                 <p className="text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Global Verticals // Industrial Speed</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
              {[
                { t: 'YouTube Narration', i: <MonitorPlay />, d: 'Automate high-quality voiceovers for content at scale.' },
                { t: 'TikTok & Reels', i: <Smartphone />, d: 'Generate trending viral voices with instant phonetic sync.' },
                { t: 'Game Characters', i: <Gamepad />, d: 'Give voice to complex NPCs with unique vocal DNA profiles.' },
                { t: 'E-Learning', i: <BookOpen />, d: 'Convert course libraries into engaging audible learning experiences.' },
                { t: 'Marketing Ads', i: <Megaphone />, d: 'Deliver broadcast-grade V.O. for commercial brand campaigns.' },
                { t: 'Support Bots', i: <Bot />, d: 'Humanize customer interactions with expressive synthetic speech.' }
              ].map((item, i) => (
                <div key={i} className="p-12 bg-[#080808] space-y-6 hover:bg-orange-500/[0.02] transition-all duration-500 group border-r border-white/5 last:border-r-0">
                   <div className="text-gray-500 group-hover:text-orange-500 transition-colors">
                      {item.i}
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-lg font-black uppercase tracking-widest italic">{item.t}</h4>
                      <p className="text-[11px] text-gray-500 font-bold uppercase leading-relaxed tracking-tighter leading-loose">"{item.d}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- SECTION 7: PRICING --- */}
      <section className="py-40 border-t border-white/5 bg-[#08080a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center space-y-24">
           <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">Unified Quota</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Starter Node', credits: '1,000', price: 'Free Tier', features: ['10 Voice Designs', 'Standard Synthesis', 'Community Support'] },
                { name: 'Creator Hub', credits: '5,000', price: '$49 / mo', features: ['Unlimited Design', 'High-Priority Node', 'Commercial License'], popular: true },
                { name: 'Studio Pro', credits: '25,000', price: '$199 / mo', features: ['Team Orchestration', 'Custom API Hook', 'H100 Node Sync'] }
              ].map((plan) => (
                <div key={plan.name} className={`p-12 bg-black border transition-all rounded-sm flex flex-col justify-between group ${plan.popular ? 'border-orange-500 shadow-[0_30px_90px_rgba(234,88,12,0.1)] scale-105 z-10' : 'border-white/5 opacity-80 hover:opacity-100'}`}>
                   <div className="space-y-10 text-left">
                      <div className="space-y-2">
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{plan.name}</span>
                         <h4 className="text-5xl font-black italic text-white tracking-tighter">{plan.credits}</h4>
                         <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Monthly Credits</p>
                      </div>
                      <div className="space-y-4 pt-8 border-t border-white/5">
                         {plan.features.map(f => (
                            <div key={f} className="flex items-center gap-3">
                               <CheckCircle2 size={16} className="text-orange-500" />
                               <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">{f}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="mt-16 space-y-6">
                      <div className="text-3xl font-black italic text-white tracking-tighter">{plan.price}</div>
                      <button 
                        onClick={() => setIsStudioOpen(true)}
                        className={`py-6 w-full text-[11px] font-black uppercase tracking-[0.3em] transition-all rounded-sm ${plan.popular ? 'bg-orange-500 text-white shadow-xl' : 'bg-white/5 text-gray-400 hover:bg-white hover:text-black border border-white/10'}`}>
                         Initialize Plan
                      </button>
                   </div>
                </div>
              ))}
           </div>
           <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest max-w-2xl mx-auto">
             * Credit-based usage for ultimate scalability. One credit = 100 characters synthesized on standard engines. Pro engines apply specific weightings.
           </p>
        </div>
      </section>

      {/* --- SECTION 8: FINAL CTA --- */}
      <section className="py-60 text-center relative overflow-hidden bg-white text-black border-t border-white/5 transition-colors">
        <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-black leading-none tracking-tighter select-none italic">
          VOICE VOICE VOICE VOICE
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic">Start <br /> <span className="text-orange-600">Building.</span></h2>
           <div className="space-y-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-black text-white px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              Launch Studio Node <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Universal Credit Ready • Enterprise Privacy • Instant Export</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 9: FOOTER --- */}
      <footer className="py-20 border-t border-white/5 bg-black transition-colors duration-500">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-widest text-gray-500">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                 <span className="text-white text-lg tracking-tighter italic font-black uppercase">AI VOICE STUDIO</span>
              </div>
              <p className="max-w-xs text-center md:text-left opacity-50 font-bold leading-relaxed">Industrial-grade acoustic synthesis for creative studios. Powered by Skyverses neural network.</p>
           </div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-orange-600 transition-colors">Documentation</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Privacy Policy</a>
           </div>
        </div>
        <div className="mt-12 text-center text-[8px] opacity-20 uppercase tracking-[0.3em]">
           © 2025 Skyverses Soul Inc. All Rights Reserved.
        </div>
      </footer>

    </div>
  );
};

export default VoiceStudio;
