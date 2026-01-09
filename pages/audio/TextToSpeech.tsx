
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, Zap, Mic2, 
  Sparkles, AudioLines, ShieldCheck, 
  Settings2, Activity, Workflow, Info,
  Volume2, Globe, BrainCircuit, FastForward
} from 'lucide-react';
import TTSWorkspace from '../../components/TTSWorkspace';

const TextToSpeech = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'text-to-speech');
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#020203] animate-in fade-in duration-500">
        <TTSWorkspace onClose={() => setIsStudioOpen(false)} />
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
        <section className="min-h-[85vh] flex flex-col justify-center py-10 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-10">
                <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-brand-blue transition-all group rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md shadow-sm">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audio Infrastructure</span>
                </Link>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-brand-blue">
                      <Mic2 size={32} className="animate-pulse" />
                      <span className="text-[14px] font-black uppercase tracking-[0.8em] opacity-60 italic">NEURAL_SPEECH_v3.0</span>
                   </div>
                   <h1 className="text-7xl lg:text-[130px] font-black uppercase tracking-tighter leading-[0.75] italic text-black dark:text-white">
                     Text to <br /> <span className="text-brand-blue">Speech.</span>
                   </h1>
                </div>
                
                <p className="text-2xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-brand-blue pl-10 max-w-2xl italic">
                  “{t('tts.hero.subtitle')}”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-brand-blue text-white px-16 py-8 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    OPEN SPEECH LAB <Play size={20} fill="currentColor" />
                 </button>
                 <div className="flex flex-col justify-center px-4 border-l border-black/10 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-brand-blue/60 tracking-widest italic">48KHZ STUDIO QUALITY</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Professional Voice Synthesis</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-gray-100 dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl rounded-sm group p-12 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="h-1 w-24 bg-brand-blue/40"></div>
                    <div className="space-y-8">
                       <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Synthetics_Tier</span>
                          <span className="text-2xl font-black text-brand-blue italic">PRO_AUDIO</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Human_Factor</span>
                          <span className="text-2xl font-black text-brand-blue italic">98.5%</span>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-brand-blue tracking-[0.5em]">SYSTEM INTERFACE</p>
                     <h3 className="text-3xl font-black italic text-black dark:text-white leading-tight uppercase tracking-tighter">Voice_Core.</h3>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section className="py-40 border-t border-black/5 dark:border-white/5">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
              {[
                { title: 'Ultra-Lifelike', icon: <BrainCircuit />, desc: 'Advanced neural networks simulate human breath, tone, and emotional nuance.' },
                { title: 'Instant Synthesis', icon: <Zap />, desc: 'Convert thousands of words into speech in seconds with our high-throughput cluster.' },
                { title: 'Global Dialects', icon: <Globe />, desc: 'Support for over 29 languages and hundreds of regional accents.' },
                { title: 'Direct API', icon: <Workflow />, desc: 'Integrate real-time speech synthesis directly into your apps and pipelines.' },
                { title: 'Voice Design', icon: <Settings2 />, desc: 'Fine-tune pitch, speed, and emotional stability for the perfect brand match.' },
                { title: 'HD Mastering', icon: <AudioLines />, desc: 'Professional 48kHz audio output ready for broadcast and high-end media.' }
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

        {/* --- CONVERSION --- */}
        <section className="py-60 text-center relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-blue/[0.05] rounded-full blur-[200px] pointer-events-none"></div>
           
           <div className="space-y-12 relative z-10 max-w-4xl mx-auto">
              <h2 className="text-7xl lg:text-[160px] font-black uppercase tracking-tighter leading-[0.8] italic text-black dark:text-white">
                Speak <br /> <span className="text-brand-blue">Elegance.</span>
              </h2>
              <p className="text-gray-400 dark:text-gray-600 uppercase text-[16px] font-black tracking-[1.5em] italic">NEURAL SPEECH ARCHITECTURE</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-16">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-brand-blue text-white px-24 py-8 text-sm font-black uppercase tracking-[0.5em] shadow-[0_20px_60px_rgba(0,144,255,0.4)] hover:scale-105 active:scale-95 transition-all rounded-sm">
                    Access Voice Hub
                 </button>
                 <Link to="/booking" className="px-24 py-8 border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white text-sm font-black uppercase tracking-[0.5em] transition-all rounded-sm italic">
                    Talk to an Architect
                 </Link>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

export default TextToSpeech;
