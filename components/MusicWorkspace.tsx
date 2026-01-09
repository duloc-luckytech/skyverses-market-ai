
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, Download, Volume2, 
  Settings2, Loader2, Zap, AudioLines, 
  CheckCircle2, Plus, Info, RefreshCw, 
  Mic, SlidersHorizontal, Activity, Share, Music as MusicIcon,
  History, LayoutGrid, Disc, Radio, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PICKS = [
  { 
    id: 'p1', 
    name: 'Multilingual vocals', 
    tags: 'Passionate, Raw, Spanish, A Capella', 
    color: 'bg-orange-500',
    details: ['Passionate', 'Raw', 'Spanish', 'A Capella']
  },
  { 
    id: 'p2', 
    name: 'Game soundtracks', 
    tags: 'Mysterious, Jungle, Tribal, Rhythmic', 
    color: 'bg-purple-600',
    details: ['Mysterious', 'Jungle', 'Tribal', 'Rhythmic']
  },
  { 
    id: 'p3', 
    name: 'Corporate music', 
    tags: 'Downtempo, Chill, Warm, Modern', 
    color: 'bg-blue-400',
    details: ['Downtempo', 'Chill', 'Warm', 'Modern']
  }
];

const MusicWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [activePick, setActivePick] = useState(PICKS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsPlaying(true);
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB] dark:bg-[#030304] overflow-hidden text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#08080a] border-b border-gray-200 dark:border-white/10 px-8 py-6 flex justify-between items-center shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-xl flex items-center justify-center text-brand-blue">
            <MusicIcon size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="font-black text-xl tracking-tight uppercase italic">Neural Music Studio</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enterprise Composition Engine</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-full">
          <X size={24} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar pb-32">
        <div className="max-w-[1200px] mx-auto p-12">
          
          <div className="bg-white dark:bg-[#0a0a0c] border border-gray-100 dark:border-white/5 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row h-full min-h-[600px]">
             
             {/* LEFT PANEL: CONFIG */}
             <div className="w-full lg:w-1/2 p-10 border-r border-gray-50 dark:border-white/5 flex flex-col justify-between">
                <div className="space-y-10">
                   <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.4em] block">{t('music.workspace.label')}</label>
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('music.workspace.placeholder')}
                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-xl p-6 text-sm font-medium focus:ring-1 focus:ring-brand-blue outline-none transition-all resize-none h-40 leading-relaxed"
                      />
                      <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="bg-slate-600 dark:bg-white dark:text-black text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                      >
                         {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
                         {t('music.workspace.generate')}
                      </button>
                   </div>

                   <div className="space-y-6">
                      <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.4em] block">{t('music.workspace.picks')}</label>
                      <div className="space-y-3">
                         {PICKS.map(pick => (
                            <button 
                              key={pick.id}
                              onClick={() => setActivePick(pick)}
                              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${activePick.id === pick.id ? 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                               <div className={`w-12 h-12 rounded-lg ${pick.color} flex items-center justify-center text-white/50 shadow-lg`}>
                                  <Disc className={isPlaying && activePick.id === pick.id ? 'animate-spin' : ''} />
                               </div>
                               <div className="text-left flex-grow">
                                  <h4 className="text-sm font-black uppercase italic tracking-tight">{pick.name}</h4>
                                  <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest">{pick.tags}</p>
                               </div>
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* RIGHT PANEL: VISUALIZER */}
             <div className="w-full lg:w-1/2 bg-gray-50/50 dark:bg-black/20 p-12 flex flex-col items-center justify-center relative overflow-hidden">
                
                {/* 3D Orbiting Sphere Visualizer */}
                <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
                   <div className={`absolute inset-0 rounded-[2.5rem] ${activePick.color} opacity-80 shadow-2xl transition-all duration-700`}></div>
                   
                   <div className="relative z-10 w-full h-full p-10 flex flex-col justify-between text-white">
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">{activePick.name}</h3>
                      
                      {/* Central Glowing Sphere */}
                      <div className="flex-grow flex items-center justify-center">
                         <motion.div 
                           animate={isPlaying ? { scale: [1, 1.05, 1], rotate: 360 } : {}}
                           transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                           className="w-48 h-48 rounded-full bg-gradient-to-tr from-white/30 to-transparent backdrop-blur-3xl border border-white/20 shadow-[0_0_80px_rgba(255,255,255,0.2)] flex items-center justify-center"
                         >
                            <div className="w-40 h-40 rounded-full bg-white/10 border border-white/5 flex items-center justify-center">
                               <div className="w-12 h-12 rounded-full bg-white/20 shadow-inner"></div>
                            </div>
                         </motion.div>
                      </div>

                      <div className="space-y-1">
                         {activePick.details.map((d, i) => (
                            <p key={i} className="text-xs font-black uppercase tracking-widest opacity-80">{d}</p>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Playback HUD */}
                <div className="mt-12 w-full max-w-[400px] flex items-center gap-6">
                   <button 
                     onClick={() => setIsPlaying(!isPlaying)}
                     className="w-14 h-14 rounded-full bg-white dark:bg-black/60 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all text-slate-800 dark:text-white"
                   >
                      {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                   </button>
                   
                   {/* Waveform Mock */}
                   <div className="flex-grow h-8 flex items-center gap-1 opacity-20">
                      {Array.from({length: 40}).map((_, i) => (
                         <motion.div 
                           key={i}
                           animate={isPlaying ? { height: [4, 24, 8, 30, 4][i % 5] } : { height: 4 }}
                           transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.02 }}
                           className="w-1 bg-slate-400 dark:bg-white rounded-full"
                         />
                      ))}
                   </div>
                </div>

                {/* Footer Controls */}
                <div className="absolute bottom-8 right-8 flex gap-3">
                   <button className="p-3 bg-white dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10 hover:text-brand-blue transition-colors shadow-sm">
                      <Download size={18} />
                   </button>
                   <button className="p-3 bg-white dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10 hover:text-brand-blue transition-colors shadow-sm">
                      <Share size={18} />
                   </button>
                </div>
             </div>

          </div>

          {/* Features / Details */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
             {[
               { icon: <Disc />, title: 'Zero Artifacts', desc: '48kHz studio-grade audio synthesis with no robotic compression.' },
               { icon: <SlidersHorizontal />, title: 'Full Control', desc: 'Specify BPM, key signatures, and instrumentation layers via text.' },
               { icon: <ShieldCheck />, title: 'IP Protection', desc: 'Every track generated is 100% royalty-free and owned by your organization.' }
             ].map((f, i) => (
                <div key={i} className="flex gap-6 items-start group">
                   <div className="w-12 h-12 border border-gray-200 dark:border-white/10 rounded-sm flex items-center justify-center text-gray-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all">
                      {React.cloneElement(f.icon as React.ReactElement<any>, { size: 20 })}
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-base font-black uppercase italic tracking-tight">{f.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">"{f.desc}"</p>
                   </div>
                </div>
             ))}
          </div>

        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default MusicWorkspace;
