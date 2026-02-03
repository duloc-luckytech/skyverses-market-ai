
import React, { useState, useRef, useEffect } from 'react';
// Added motion import
import { motion } from 'framer-motion';
import { 
  Mic2, Play, Volume2, Settings2, Download, 
  Loader2, Zap, AudioLines, CheckCircle2, 
  UserCheck, Sliders, ShieldAlert, 
  Fingerprint, Activity, Square, Terminal, Plus, Save, 
  History as HistoryIcon, Database, X
} from 'lucide-react';
import { generateMultiSpeakerAudio } from '../services/gemini';

const AuraStudioInterface = () => {
  const [script, setScript] = useState('Director: System check complete. Are we live?\nPilot: Transmission verified. Identity matrix at 99.9% consistency.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [speakerA, setSpeakerA] = useState({ name: 'Director', voice: 'Kore', weight: 85 });
  const [speakerB, setSpeakerB] = useState({ name: 'Pilot', voice: 'Puck', weight: 92 });
  const [activeSpeakerNode, setActiveSpeakerNode] = useState<'A' | 'B'>('A');

  const [history, setHistory] = useState<{name: string, timestamp: string, buffer: AudioBuffer}[]>([]);
  const [currentBuffer, setCurrentBuffer] = useState<AudioBuffer | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const protocols = [
    { name: 'Kore', label: 'IDENTITY_01', desc: 'Consistent brand narration for leadership content.' },
    { name: 'Puck', label: 'IDENTITY_02', desc: 'Vibrant and energetic for customer-facing media.' },
    { name: 'Charon', label: 'IDENTITY_03', desc: 'Deep, resonant textures for high-end storytelling.' },
    { name: 'Zephyr', label: 'IDENTITY_04', desc: 'Conversational, natural flow with emotive nuances.' },
    { name: 'Fenrir', label: 'IDENTITY_05', desc: 'Grave and focused for instructional precision.' }
  ];

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  const handleSynthesis = async () => {
    if (!script.trim() || isGenerating) return;
    setIsGenerating(true);
    stopPlayback();

    try {
      const buffer = await generateMultiSpeakerAudio(script, speakerA, speakerB);
      if (buffer) {
        setCurrentBuffer(buffer);
        const name = script.split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 20) || 'Multi-Take';
        setHistory(prev => [{ name, timestamp: new Date().toLocaleTimeString(), buffer }, ...prev]);
        playBuffer(buffer);
      }
    } catch (err) {
      console.error("Aura Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const playBuffer = (buffer: AudioBuffer) => {
    stopPlayback();
    if (!audioCtxRef.current) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => setIsPlaying(false);
    source.start(0);
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#030304] overflow-hidden text-black dark:text-white font-mono relative">
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col bg-gray-50 dark:bg-[#050506] border-r border-black/10 dark:border-white/5 overflow-y-auto no-scrollbar p-8 space-y-10">
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
                 <UserCheck className="w-4 h-4 text-brand-blue" /> Identity_Matrix
              </label>
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-sm border border-black/10 dark:border-white/5">
                 <button onClick={() => setActiveSpeakerNode('A')} className={`px-4 py-1.5 text-[8px] font-black uppercase transition-all ${activeSpeakerNode === 'A' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}>Node_A</button>
                 <button onClick={() => setActiveSpeakerNode('B')} className={`px-4 py-1.5 text-[8px] font-black uppercase transition-all ${activeSpeakerNode === 'B' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}>Node_B</button>
              </div>
           </div>

           <div className="p-6 bg-white dark:bg-white/[0.02] border border-black/10 dark:border-white/5 space-y-8">
              <div className="space-y-2">
                 <label className="text-[8px] font-black uppercase text-gray-400">Protocol_Alias</label>
                 <input 
                   value={activeSpeakerNode === 'A' ? speakerA.name : speakerB.name} 
                   onChange={(e) => activeSpeakerNode === 'A' ? setSpeakerA({...speakerA, name: e.target.value}) : setSpeakerB({...speakerB, name: e.target.value})}
                   className="w-full bg-transparent border-b border-black/10 dark:border-white/10 text-brand-blue text-sm font-black uppercase outline-none focus:border-brand-blue pb-2"
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-[8px] font-black uppercase text-gray-400">Neural_Base</label>
                 <div className="space-y-1.5">
                    {protocols.map(p => (
                       <button 
                         key={p.name}
                         onClick={() => activeSpeakerNode === 'A' ? setSpeakerA({...speakerA, voice: p.name}) : setSpeakerB({...speakerB, voice: p.name})}
                         className={`w-full p-4 text-left border rounded-sm transition-all ${ (activeSpeakerNode === 'A' ? speakerA.voice : speakerB.voice) === p.name ? 'border-brand-blue bg-brand-blue/5' : 'border-black/5 dark:border-white/5 opacity-60 hover:opacity-100'}`}
                       >
                          <h4 className="text-[9px] font-black uppercase text-black dark:text-white">{p.label}</h4>
                          <p className="text-[8px] text-gray-500">{p.desc}</p>
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
        <div className="mt-auto p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-sm">
           <p className="text-[7px] text-gray-500 font-bold uppercase italic leading-relaxed">Compliance hash verified. Node encryption AES-256 active.</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col bg-white dark:bg-[#020202] relative overflow-hidden">
        <div className="flex-grow p-8 lg:p-12 overflow-y-auto no-scrollbar relative flex flex-col items-center justify-center">
           <textarea 
             value={script}
             onChange={(e) => setScript(e.target.value)}
             className="w-full max-w-4xl bg-transparent border-none text-2xl lg:text-4xl font-bold text-black dark:text-white focus:outline-none resize-none selection:bg-brand-blue/20 leading-relaxed uppercase tracking-tight h-[60%]"
             placeholder="[SPEAKER]: Narrative script..."
           />
           {isPlaying && (
             <div className="flex items-center gap-1 h-8 opacity-20">
                {Array.from({length: 40}).map((_, i) => (
                  <motion.div key={i} className="w-1 bg-brand-blue" animate={{ height: [4, 30, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.02 }} />
                ))}
             </div>
           )}
        </div>

        <div className="h-32 lg:h-36 bg-gray-50 dark:bg-black border-t border-black/10 dark:border-white/5 p-6 lg:p-10 flex items-center justify-between shrink-0 z-10 shadow-2xl">
           <div className="flex items-center gap-8">
              <button 
                onClick={isPlaying ? stopPlayback : () => currentBuffer && playBuffer(currentBuffer)}
                disabled={!currentBuffer}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${!currentBuffer ? 'bg-black/5 dark:bg-white/5 text-gray-300' : 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 shadow-xl'}`}
              >
                {isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
              <div className="hidden sm:flex flex-col gap-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Aura_System_Active</span>
                 <div className="h-1 w-48 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-brand-blue transition-all duration-300 ${isPlaying ? 'w-full' : 'w-0'}`}></div>
                 </div>
              </div>
           </div>
           <button onClick={handleSynthesis} disabled={isGenerating || !script.trim()} className="bg-brand-blue text-white h-16 px-12 text-[11px] font-black uppercase tracking-[0.5em] flex items-center gap-4 hover:bg-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-20 rounded-sm">
             {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap size={18} fill="currentColor" />}
             Synthesize
           </button>
        </div>
      </div>
    </div>
  );
};

export default AuraStudioInterface;
