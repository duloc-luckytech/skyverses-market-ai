
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, Zap, Mic2, 
  MonitorPlay, Share2, Download, 
  ArrowRight, ShieldCheck, AudioLines, 
  Target, Sparkles, Workflow, Activity,
  Database, Fingerprint, Volume2, Music
} from 'lucide-react';
import AudioToVideoWorkspace from '../../components/AudioToVideoWorkspace';

const AudioToVideo = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'audio-to-video');
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#020203] animate-in fade-in duration-500">
        <AudioToVideoWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden transition-colors duration-500 pb-32">
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#10b98108_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,_#10b98112_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="min-h-[85vh] flex flex-col justify-center py-10 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-10">
                <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-emerald-500 transition-all group rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md shadow-sm">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Content Infrastructure</span>
                </Link>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-emerald-500">
                      <Mic2 size={32} className="animate-pulse" />
                      <span className="text-[14px] font-black uppercase tracking-[0.8em] opacity-60 italic">ACOUSTIC_MOTION_CORE v1.2</span>
                   </div>
                   <h1 className="text-7xl lg:text-[130px] font-black uppercase tracking-tighter leading-[0.75] italic text-black dark:text-white">
                     Audio <br /> <span className="text-emerald-500">to Motion.</span>
                   </h1>
                </div>
                
                <p className="text-2xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-emerald-500 pl-10 max-w-2xl italic">
                  “{solution.description[lang]}”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-emerald-500 text-white px-16 py-8 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    VÀO ACOUSTIC STUDIO <Play size={20} fill="currentColor" />
                 </button>
                 <div className="flex flex-col justify-center px-4 border-l border-black/10 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-emerald-500/60 tracking-widest italic">SONIC_FLOW_v1</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Visual Waveform Master</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-gray-100 dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl rounded-sm group p-12 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="h-1 w-24 bg-emerald-500/40"></div>
                    <div className="space-y-8">
                       <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Audio_Stability</span>
                          <span className="text-2xl font-black text-emerald-500 italic">98.2%</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Sync_Accuracy</span>
                          <span className="text-2xl font-black text-emerald-500 italic">FRAME_PERFECT</span>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.5em]">SONIC VISUALIZER</p>
                     <h3 className="text-3xl font-black italic text-black dark:text-white leading-tight uppercase tracking-tighter">Waveform_Logic.</h3>
                  </div>
               </div>
            </div>
          </div>
        </section>
        
        {/* --- INDUSTRIAL FLOW --- */}
        <section className="py-40 border-t border-black/5 dark:border-white/5 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
             <div className="lg:col-span-4 space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-emerald-500">
                      <Activity size={24} />
                      <span className="text-[10px] font-black uppercase tracking-[0.6em]">Sonic_Cycle</span>
                   </div>
                   <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">Acoustic <br /> <span className="text-emerald-500">Orchestra.</span></h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed font-medium uppercase tracking-widest">
                  Maximize engagement for your audio content. Audio to Motion provides the bridge between standard podcasts and high-impact social video.
                </p>
             </div>

             <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
                {[
                  { step: '01', label: 'Audio Ingestion', icon: <AudioLines size={20} />, desc: 'Upload or link audio payloads for neural waveform analysis.' },
                  { step: '02', label: 'Scene Matching', icon: <MonitorPlay size={20} />, desc: 'AI selects visual context that matches the narrative tone of your voice.' },
                  { step: '03', label: 'Kinetic Synth', icon: <Target size={20} />, desc: 'Dynamic typography and visualizers are rendered in frame-sync.' },
                  { step: '04', label: 'Master Export', icon: <Sparkles size={20} />, desc: 'Deliver production-grade 1080p video ready for social distribution.' }
                ].map((item) => (
                  <div key={item.step} className="p-12 lg:p-16 bg-white dark:bg-[#08080a] space-y-10 group hover:bg-emerald-500/[0.01] transition-all duration-700">
                    <div className="flex justify-between items-start">
                       <span className="text-4xl font-black text-emerald-500 italic opacity-40 group-hover:opacity-100 transition-opacity">{item.step}</span>
                       <div className="p-4 border border-black/10 dark:border-white/10 text-gray-400 group-hover:text-emerald-500 group-hover:border-emerald-500 transition-all">
                          {item.icon}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-2xl font-black uppercase tracking-tighter italic">{item.label}</h4>
                       <p className="text-sm text-gray-500 font-medium leading-relaxed opacity-70 uppercase tracking-widest leading-loose">"{item.desc}"</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AudioToVideo;
