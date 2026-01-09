import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, ShieldCheck, 
  Users, Target, Film, Clapperboard, 
  Sparkles, CheckCircle2, Lock, 
  Layers, MessageSquare, ArrowRight,
  UserCheck, Palette, MonitorPlay,
  Share2, Heart, Download, Info,
  Fingerprint, Smartphone, Cpu,
  Activity, UserPlus as UserPlusIcon,
  Trash2, Plus, LayoutGrid, X,
  // Add missing icons
  ChevronRight, Terminal, BrainCircuit, Upload, 
  History as HistoryIcon, Database, RefreshCw, Maximize2
} from 'lucide-react';
import CharacterSyncWorkspace from '../components/CharacterSyncWorkspace';
import { useLanguage } from '../context/LanguageContext';

const ProductCharacterSync = () => {
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-black animate-in fade-in duration-500">
        <CharacterSyncWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-purple-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-600/10 rounded-full blur-[200px]"></div>
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[200px]"></div>
        </div>

        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-6 space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.3em] italic"
            >
              <Fingerprint size={14} /> Identity Persistence Engine
            </motion.div>
            
            <div className="space-y-8">
              <h1 className="text-6xl lg:text-[110px] font-black leading-[0.85] tracking-tighter italic uppercase">
                Sync Characters <span className="text-purple-500">Once.</span> <br />
                Create Stories Forever.
              </h1>
              <p className="text-xl lg:text-3xl text-gray-400 font-medium leading-tight border-l-2 border-purple-500 pl-8 max-w-2xl">
                An AI tool that locks character identity across images, scenes, comics, and videos. Maintain 100% consistency across your entire production.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-purple-600 text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(147,51,234,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Try Character Sync <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              {/* Fix: ChevronRight added to imports */}
              <button className="px-12 py-6 border border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                View Showcase <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
             <div className="aspect-square bg-white/5 border border-white/10 rounded-[3rem] p-1 shadow-3xl overflow-hidden group">
                <div className="h-full w-full bg-black rounded-[2.9rem] flex items-center justify-center relative">
                   <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-[5s]" alt="Sync Visual" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-24 h-24 rounded-full bg-purple-600/80 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl animate-pulse">
                         <Fingerprint size={48} />
                      </div>
                   </div>
                   <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">DNA_LOCKED_v4</p>
                         <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Visual Consistency.</h3>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      {/* Fix: JSX Tags are properly closed to avoid scoping issues */}
      <section className="py-40 border-y border-white/5 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="space-y-8">
              <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none">Why Consistency <br />Is Hard with AI.</h2>
              <div className="space-y-6">
                 {[
                   'Characters change face every single generation.',
                   'Outfits and art styles drift between prompts.',
                   'No long-term memory of character traits.',
                   'Manual management of multi-character scenes is chaotic.'
                 ].map(point => (
                    <div key={point} className="flex gap-4 items-start group">
                       <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                          <X size={14} strokeWidth={4} />
                       </div>
                       <p className="text-lg text-gray-500 font-medium group-hover:text-gray-300 transition-colors">"{point}"</p>
                    </div>
                 ))}
              </div>
           </div>
           <div className="p-16 border border-white/5 bg-white/[0.01] rounded-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
              <div className="relative z-10 grid grid-cols-3 gap-4">
                 {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-[3/4] bg-gray-900 rounded border border-white/5 overflow-hidden grayscale">
                       <img src={`https://i.pravatar.cc/300?u=err${i}`} className="w-full h-full object-cover opacity-20" />
                    </div>
                 ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                 <div className="bg-red-600 text-white px-6 py-2 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl -rotate-12">Broken_Identity</div>
              </div>
           </div>
        </div>
      </section>

      {/* 3. SOLUTION SECTION */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center space-y-24">
           <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic">Character Sync <br /><span className="text-purple-500">Fixes This.</span></h2>
              <p className="text-xl text-gray-400">We created a **Character Layer** that sits above your prompts. Define your cast once, then reference them by name across every project.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 shadow-3xl">
              {[
                { t: 'DNA Anchoring', d: 'Upload up to 10 images to define a character visual lock.', i: <Fingerprint /> },
                { t: 'Semantic Binding', d: 'Prompts reference actors by name like a director script.', i: <Terminal /> },
                { t: 'Context Memory', d: 'AI remembers character relationships and personality traits.', i: <BrainCircuit /> },
                { t: 'Zero-Drift Sync', d: 'Maintains face, hair, and outfit details across any pose.', i: <Activity /> }
              ].map((item, i) => (
                <div key={i} className="p-16 bg-[#080808] space-y-8 group hover:bg-purple-500/[0.02] transition-all duration-500 border-r border-white/5 last:border-r-0">
                   <div className="w-14 h-14 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-purple-500 group-hover:border-purple-500 transition-all rounded-sm shadow-xl">
                      {React.cloneElement(item.i as React.ReactElement<any>, { size: 24 })}
                   </div>
                   <div className="text-left space-y-3">
                      <h4 className="text-2xl font-black uppercase tracking-tighter italic">{item.t}</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{item.d}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. CORE FEATURES GRID */}
      <section className="py-40 bg-[#08080a] border-y border-white/5">
         <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-20">
            {/* FIXED: Changed to 2 columns on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
               {[
                 { t: 'Character Image Upload', d: 'Upload 10 identity anchors per project. Each image becomes a visual source of truth.', i: <Upload /> },
                 { t: 'Name & Role Casting', d: 'Assign names (e.g. Luna) and roles (e.g. Villain). Describe personality for deeper AI context.', i: <UserCheck /> },
                 { t: 'Prompt Binding', d: 'Write: "Luna enters the lab." AI automatically applies the locked visual DNA of Luna.', i: <Zap /> },
                 { t: 'Multi-Actor Control', i: <Users />, d: 'Reference up to 3 actors in one scene. No identity mix or visual artifacts.' },
                 { t: 'Infinite History', i: <HistoryIcon />, d: 'Auto-save every generation. Browse history by character, project, or prompt.' },
                 { t: 'Shared Library', i: <Database />, d: 'Central hub for all your characters. Reuse a hero across multiple stories and videos.' }
               ].map((f, i) => (
                  <div key={i} className="p-10 border border-white/10 bg-white/[0.02] rounded-sm hover:border-purple-500/40 transition-all group">
                     <div className="text-purple-400 mb-6 group-hover:scale-110 transition-transform">{f.i}</div>
                     <h4 className="text-xl font-black uppercase italic mb-4">{f.t}</h4>
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed leading-loose">"{f.d}"</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. STEP FLOW */}
      <section className="py-40 relative">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-24">
           <h2 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic">How it Works.</h2>
           <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {[
                { s: '01', t: 'Upload', i: <Upload /> },
                { s: '02', t: 'Define', i: <UserCheck /> },
                { s: '03', t: 'Script', i: <Terminal /> },
                { s: '04', t: 'Synthesize', i: <RefreshCw /> },
                { s: '05', t: 'Iterate', i: <Maximize2 /> }
              ].map((step, i) => (
                <div key={i} className="space-y-6 group">
                   <div className="aspect-square rounded-full border border-white/10 flex items-center justify-center relative group-hover:border-purple-500/40 transition-all">
                      <div className="absolute inset-0 bg-purple-500/5 blur-xl scale-0 group-hover:scale-100 transition-transform"></div>
                      <div className="text-purple-500 relative z-10">{step.i}</div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-black border border-white/10 rounded-full flex items-center justify-center text-[10px] font-black">{step.s}</div>
                   </div>
                   <h4 className="text-xs font-black uppercase tracking-[0.4em]">{step.t}</h4>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 6. COMPARISON SECTION */}
      <section className="py-40 bg-black border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6">
           <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                 <thead>
                    <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                       <th className="p-8 text-left">Protocol</th>
                       <th className="p-8 text-center">Traditional AI</th>
                       <th className="p-8 text-center text-purple-400">Character Sync AI</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {[
                      { l: 'Visual Memory', t: 'Random ❌', s: 'Persistent ✅' },
                      { l: 'Character Referencing', t: 'Re-prompting ❌', s: 'Name-based ✅' },
                      { l: 'Identity Drifting', t: 'Frequent ❌', s: 'Zero-Drift ✅' },
                      { l: 'History Management', t: 'None ❌', s: 'Full Registry ✅' }
                    ].map(row => (
                       <tr key={row.l} className="group hover:bg-white/[0.01]">
                          <td className="p-8 text-xs font-black uppercase text-gray-500">{row.l}</td>
                          <td className="p-8 text-center text-[11px] font-bold uppercase">{row.t}</td>
                          <td className="p-8 text-center text-[11px] font-black uppercase text-purple-400 italic">{row.s}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-60 text-center relative overflow-hidden bg-purple-600">
        <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-white leading-none tracking-tighter select-none italic">
          SYNC SYNC SYNC SYNC SYNC
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-white">Build Worlds, <br /> Not Just Prompts.</h2>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-black text-white px-20 py-8 rounded-sm text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
            >
              Start Creating Characters
            </button>
            <Link to="/booking" className="bg-white/10 text-white border border-white/20 px-20 py-8 rounded-sm text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Request Enterprise Access
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const Gamepad = ({ size }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>;

export default ProductCharacterSync;