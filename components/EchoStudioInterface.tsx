
import React, { useState, useRef, useEffect } from 'react';
// Added motion import
import { motion } from 'framer-motion';
import { 
  Mic2, Play, Volume2, Download, 
  Loader2, Zap, AudioLines, 
  Square, Terminal, Plus, User, Sparkles, 
  History as HistoryIcon, X
} from 'lucide-react';
import { generateDemoAudio } from '../services/gemini';

const EchoStudioInterface = () => {
  const [script, setScript] = useState('Welcome to the future of neural narration. This is Echo Voice Engine, built for high-performance content teams.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVoice, setActiveVoice] = useState('Kore');
  const [currentBuffer, setCurrentBuffer] = useState<AudioBuffer | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const voices = [
    { name: 'Kore', label: 'IDENTITY_01', desc: 'Authoritative and steady.' },
    { name: 'Puck', label: 'IDENTITY_02', desc: 'Dynamic and youthful.' },
    { name: 'Charon', label: 'IDENTITY_03', desc: 'Resonant and cinematic.' },
    { name: 'Zephyr', label: 'IDENTITY_04', desc: 'Smooth and conversational.' }
  ];

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  const handleSynthesis = async () => {
    if (!script.trim() || isGenerating) return;
    setIsGenerating(true);
    stopPlayback();

    try {
      const buffer = await generateDemoAudio(script, activeVoice);
      if (buffer) {
        setCurrentBuffer(buffer);
        playBuffer(buffer);
      }
    } catch (err) {
      console.error("Echo Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const playBuffer = (buffer: AudioBuffer) => {
    stopPlayback();
    if (!audioCtxRef.current) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    
    const ctx = audioCtxRef.current;
    if (ctx) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start(0);
      sourceNodeRef.current = source;
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#030304] overflow-hidden text-black dark:text-white font-mono relative">
      <div className="w-full lg:w-[360px] shrink-0 flex flex-col bg-gray-50 dark:bg-[#050506] border-r border-black/10 dark:border-white/5 overflow-y-auto no-scrollbar p-8 space-y-8">
        <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
          <User className="w-4 h-4 text-brand-blue" /> Voice_Casting
        </label>
        <div className="space-y-2">
          {voices.map(v => (
            <button 
              key={v.name}
              onClick={() => setActiveVoice(v.name)}
              className={`w-full p-5 text-left border rounded-sm transition-all ${activeVoice === v.name ? 'border-brand-blue bg-brand-blue/5' : 'border-black/5 dark:border-white/5 opacity-60 hover:opacity-100'}`}
            >
              <h4 className="text-[10px] font-black uppercase tracking-widest">{v.label}</h4>
              <p className="text-[8px] text-gray-500">{v.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col bg-white dark:bg-[#020202] relative">
        <div className="flex-grow p-12 overflow-y-auto no-scrollbar flex flex-col items-center justify-center">
           <textarea 
             value={script}
             onChange={(e) => setScript(e.target.value)}
             className="w-full max-w-3xl bg-transparent border-none text-2xl lg:text-3xl font-black text-black dark:text-white focus:outline-none resize-none uppercase h-[50%]"
             placeholder="Input narration script..."
           />
           {isPlaying && (
             <div className="flex items-center gap-1 h-4 opacity-10">
                {Array.from({length: 30}).map((_, i) => (
                  <motion.div key={i} className="w-1.5 bg-brand-blue" animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.05 }} />
                ))}
             </div>
           )}
        </div>

        <div className="h-32 border-t border-black/10 dark:border-white/5 p-10 flex items-center justify-between shrink-0 bg-gray-50 dark:bg-black shadow-2xl">
           <button 
            onClick={isPlaying ? stopPlayback : () => currentBuffer && playBuffer(currentBuffer)}
            disabled={!currentBuffer}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${!currentBuffer ? 'opacity-20' : 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 shadow-xl'}`}
           >
            {isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
           </button>
           <button onClick={handleSynthesis} disabled={isGenerating || !script.trim()} className="bg-brand-blue text-white px-12 py-5 text-[11px] font-black uppercase tracking-[0.5em] flex items-center gap-4 hover:bg-black transition-all shadow-xl disabled:opacity-20 rounded-sm">
             {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap size={18} fill="currentColor" />}
             Produce
           </button>
        </div>
      </div>
    </div>
  );
};

export default EchoStudioInterface;
