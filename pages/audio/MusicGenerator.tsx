
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, Zap, Music, 
  Sparkles, AudioLines, ShieldCheck, 
  Settings2, Activity, Workflow, Info,
  Volume2, Globe, BrainCircuit, FastForward,
  Disc, Headphones, Radio
} from 'lucide-react';
import MusicWorkspace from '../../components/MusicWorkspace';

const MusicGenerator = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'music-generator');
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#020203] animate-in fade-in duration-500">
        <MusicWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden transition-colors duration-500 pb-32">
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#0090ff08_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,_#0090ff12_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="min-h-[85vh] flex flex-col justify-center py-10 lg:py-20 text-center">
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-5xl mx-auto">
            <div className="space-y-8">
              <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-brand-blue transition-all group rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md shadow-sm mx-auto">
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audio Infrastructure</span>
              </Link>

              <div className="space-y-6">
                 <h1 className="text-6xl lg:text-[110px] font-black uppercase tracking-tighter leading-[0.8] italic text-black dark:text-white">
                   Neural <br /> <span className="text-brand-blue">Music Generator.</span>
                 </h1>
              </div>
              
              <p className="text-xl lg:text-3xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto italic">
                “{t('music.hero.subtitle')}”
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4">
               <button onClick={() => setIsStudioOpen(true)} className="bg-brand-blue text-white px-20 py-8 text-[13px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm group relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  Get Started <Play size={20} fill="currentColor" />
               </button>
               <div className="text-left px-8 border-l border-black/10 dark:border-white/10">
                  <p className="text-[10px] font-bold uppercase text-brand-blue/60 tracking-widest italic">COMMERCIAL USE LICENSE</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Industrial Music Synthesis</p>
               </div>
            </div>
          </div>
        </section>

        {/* --- INTERACTIVE PREVIEW MOCKUP --- */}
        <section className="py-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <div className="bg-white dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 rounded-[2rem] p-1 shadow-3xl max-w-6xl mx-auto overflow-hidden group">
              <div className="bg-[#F9FAFB] dark:bg-black p-10 flex flex-col lg:flex-row gap-10">
                 <div className="w-full lg:w-1/2 space-y-12">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GENERATE A SONG</p>
                       <div className="h-16 w-full bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 flex items-center px-6">
                          <span className="text-sm text-gray-400 italic">Generate a high BPM afrobeat track...</span>
                       </div>
                       <div className="w-32 h-12 bg-gray-500/20 rounded-md"></div>
                    </div>
                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">OUR PICKS</p>
                       <div className="space-y-4">
                          {[
                            { c: 'bg-orange-500', t: 'Multilingual vocals' },
                            { c: 'bg-purple-600', t: 'Game soundtracks' }
                          ].map((p, i) => (
                            <div key={i} className="flex items-center gap-4 opacity-40">
                               <div className={`w-10 h-10 rounded-lg ${p.c}`}></div>
                               <div className="h-4 w-40 bg-gray-500/10 rounded"></div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="w-full lg:w-1/2 bg-white dark:bg-white/5 rounded-3xl p-10 flex flex-col items-center justify-center gap-8 border border-black/5 dark:border-white/5">
                    <div className="w-48 h-48 rounded-[2.5rem] bg-orange-500 shadow-2xl flex items-center justify-center overflow-hidden relative">
                       <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                       <Disc className="text-white/20 w-32 h-32 animate-spin" />
                    </div>
                    <div className="w-full space-y-4">
                       <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full"></div>
                       <div className="flex justify-between items-center px-2 text-[10px] font-black text-gray-400">
                          <span>0:42</span>
                          <span>3:12</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* --- CAPABILITIES --- */}
        <section className="py-40 border-t border-black/5 dark:border-white/5">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
              {[
                { title: 'Full Orchestration', icon: <Disc />, desc: 'From cinematic strings to electronic synths, architect multi-layered compositions with ease.' },
                { title: 'Global Vocals', icon: <Volume2 />, desc: 'Inject multilingual vocals with human-like emotional depth and perfect phonetic accuracy.' },
                { title: 'Domain Optimized', icon: <Radio />, desc: 'Specific weighting for Game Dev, Commercial Ads, and Social Content production.' },
                { title: 'BPM Precision', icon: <FastForward />, desc: 'Lock your generation to exact tempo and key signatures for seamless project integration.' },
                { title: 'Neural Mastering', icon: <AudioLines />, desc: 'Auto-leveling and spectral balance designed for 48kHz high-fidelity output.' },
                { title: 'Copyright Safe', icon: <ShieldCheck />, desc: 'All generations are uniquely synthesized and authorized for global commercial distribution.' }
              ].map((f, i) => (
                <div key={i} className="p-16 bg-white dark:bg-[#08080a] space-y-8 group hover:bg-brand-blue/[0.01] transition-all duration-500 border-r border-black/5 dark:border-white/5 last:border-r-0">
                   <div className="w-14 h-14 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all rounded-sm shadow-xl">
                      {React.cloneElement(f.icon as React.ReactElement<any>, { size: 24 })}
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-2xl font-black uppercase tracking-tighter italic">{f.title}</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.desc}"</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

      </div>
    </div>
  );
};

export default MusicGenerator;
