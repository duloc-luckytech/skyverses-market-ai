
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic2, Play, Volume2, Settings2, Download, 
  Loader2, Zap, AudioLines, CheckCircle2, 
  MessageSquareText, Sliders, Activity, 
  Square, Terminal, Plus, Save, User, Sparkles, ListMusic, 
  History as HistoryIcon
} from 'lucide-react';
import { generateDemoAudio } from '../services/gemini';

const EchoStudioInterface = () => {
  const [script, setScript] = useState('Welcome to the future of neural narration. This is Echo Voice Engine, built for high-performance content teams.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [activeVoice, setActiveVoice] = useState('Kore');
  const [emotion, setEmotion] = useState('Calm');
  const [speed, setSpeed] = useState(1.0);

  const [history, setHistory] = useState<{name: string, voice: string, timestamp: string, buffer: AudioBuffer}[]>([]);
  const [currentBuffer, setCurrentBuffer] = useState<AudioBuffer | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const voices = [
    { name: 'Kore', type: 'Male', tone: 'Professional', desc: 'Authoritative and steady.' },
    { name: 'Puck', type: 'Male', tone: 'Energetic', desc: 'Dynamic and youthful.' },
    { name: 'Charon', type: 'Male', tone: 'Deep', desc: 'Resonant and cinematic.' },
    { name: 'Zephyr', type: 'Female', tone: 'Natural', desc: 'Smooth and conversational.' },
    { name: 'Fenrir', type: 'Male', tone: 'Serious', desc: 'Grave and intense.' }
  ];

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  const handleSynthesis = async () => {
    if (!script.trim() || isGenerating) return;
    setIsGenerating(true);
    stopPlayback();

    try {
      const prompt = `Say ${emotion.toLowerCase()}ly at ${speed}x speed: ${script}`;
      const buffer = await generateDemoAudio(prompt, activeVoice);
      
      if (buffer) {
        setCurrentBuffer(buffer);
        setHistory(prev => [{ 
          name: script.slice(0, 30) + '...', 
          voice: activeVoice,
          timestamp: new Date().toLocaleTimeString(), 
          buffer 
        }, ...prev]);
        playBuffer(buffer);
      }
    } catch (err) {
      console.error("Echo Synthesis Error:", err);
    } finally {
      setIsGenerating(true);
      // Giả lập delay sinh học của neural network
      setTimeout(() => setIsGenerating(false), 500);
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
    
    if (audioCtxRef.current) {
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtxRef.current.destination);
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
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#030304] overflow-hidden text-black dark:text-white relative">
      
      {/* 1. CONFIG SIDEBAR */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col bg-gray-50 dark:bg-[#050506] border-r border-black/10 dark:border-white/5 overflow-y-auto no-scrollbar p-8 space-y-10">
        <div className="space-y-6">
           <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
              <User className="w-4 h-4 text-brand-blue" /> Voice_Casting
           </label>
           <div className="space-y-2">
              {voices.map(v => (
                 <button 
                   key={v.name}
                   onClick={() => setActiveVoice(v.name)}
                   className={`w-full p-5 text-left transition-all border flex justify-between items-center rounded-sm ${activeVoice === v.name ? 'border-brand-blue bg-brand-blue/5' : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'}`}
                 >
                    <div className="space-y-1">
                       <div className="flex items-center gap-2">
                          <h4 className="text-[10px] font-black uppercase text-black dark:text-white tracking-widest">{v.name}</h4>
                          <span className="text-[6px] font-black uppercase bg-black/5 dark:bg-white/5 px-1 py-0.5">{v.type}</span>
                       </div>
                       <p className="text-[8px] text-gray-500 font-medium leading-relaxed">{v.desc}</p>
                    </div>
                    {activeVoice === v.name && <Volume2 className="w-3.5 h-3.5 text-brand-blue" />}
                 </button>
              ))}
           </div>
        </div>

        <div className="space-y-8 pt-8 border-t border-black/10 dark:border-white/5">
           <div className="space-y-6">
              <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
                 <Sparkles className="w-4 h-4 text-brand-blue" /> Style_Model
              </label>
              <div className="grid grid-cols-2 gap-2">
                 {['Calm', 'Energetic', 'Serious', 'Cheerful'].map(e => (
                    <button 
                      key={e}
                      onClick={() => setEmotion(e)}
                      className={`py-3 text-[9px] font-black uppercase border transition-all rounded-sm ${emotion === e ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'border-black/5 dark:border-white/5 text-gray-400 dark:text-gray-800'}`}
                    >
                       {e}
                    </button>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                 <span>Master Speed</span>
                 <span className="text-brand-blue">{speed.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="0.5" max="2.0" step="0.1"
                value={speed} 
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-black/10 dark:bg-white/5 appearance-none rounded-full accent-brand-blue" 
              />
           </div>
        </div>

        <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5 flex items-center gap-3">
           <CheckCircle2 size={14} className="text-green-500" />
           <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-700">Echo_Performance_Ready</span>
        </div>
      </div>

      {/* 2. CENTER: VIEWPORT */}
      <div className="flex-grow flex flex-col bg-white dark:bg-[#020202] relative overflow-hidden">
        <div className="flex-grow flex flex-col p-8 lg:p-12 overflow-y-auto custom-scrollbar relative">
           <div className="max-w-4xl mx-auto w-full space-y-10">
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/5 pb-8">
                 <div className="flex items-center gap-4">
                    <Terminal className="w-5 h-5 text-brand-blue" />
                    <div className="space-y-0.5">
                       <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-gray-600">Script_Console</span>
                       <p className="text-[8px] font-bold text-gray-300 dark:text-gray-800 uppercase tracking-widest">Neural Performance Synthesis</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setScript('')} className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-700 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> Clear</button>
                    <button className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-700 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"><Save className="w-3.5 h-3.5" /> Save</button>
                 </div>
              </div>
              
              <div className="relative">
                 <textarea 
                   value={script}
                   onChange={(e) => setScript(e.target.value)}
                   placeholder="Payload script for synthesis..."
                   className="w-full min-h-[300px] bg-transparent border-none text-2xl lg:text-3xl font-bold text-black dark:text-white/90 placeholder:text-black/5 dark:placeholder:text-white/5 focus:outline-none resize-none selection:bg-brand-blue/20 leading-relaxed uppercase tracking-tight"
                 />
              </div>
           </div>

           <div className="absolute bottom-12 left-12 right-12 h-20 pointer-events-none opacity-5">
              <div className="flex items-center justify-center gap-1 h-full">
                 {Array.from({length: 30}).map((_, i) => (
                    <div key={i} className={`w-1.5 bg-brand-blue rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-1'}`} style={{ height: isPlaying ? `${20 + Math.random() * 80}%` : '4px', animationDelay: `${i*0.04}s` }}></div>
                 ))}
              </div>
           </div>
        </div>

        {/* PRODUCTION HUD */}
        <div className="h-32 lg:h-36 bg-gray-50 dark:bg-black border-t border-black/10 dark:border-white/5 p-6 lg:p-10 flex items-center justify-between shrink-0 z-10 shadow-2xl">
           <div className="flex items-center gap-8 lg:gap-16">
              <button 
                onClick={isPlaying ? stopPlayback : () => currentBuffer && playBuffer(currentBuffer)}
                disabled={!currentBuffer}
                className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all shadow-2xl ${!currentBuffer ? 'bg-black/5 dark:bg-white/5 text-gray-300 dark:text-gray-800' : 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95'}`}
              >
                {isPlaying ? <Square className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
              </button>
              
              <div className="hidden sm:flex flex-col gap-3">
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">{activeVoice}</span>
                    <span className="text-[8px] text-gray-400 dark:text-gray-700 font-bold uppercase">// {emotion} // {speed}x</span>
                 </div>
                 <div className="h-1 w-48 lg:w-80 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-brand-blue transition-all duration-300 ${isPlaying ? 'w-full' : 'w-0'}`}></div>
                 </div>
              </div>
           </div>

           <div className="flex gap-4">
              <button 
                onClick={handleSynthesis}
                disabled={isGenerating || !script.trim()}
                className="bg-brand-blue text-white h-16 lg:h-auto px-10 py-6 lg:px-14 text-[11px] font-black uppercase tracking-[0.5em] flex items-center gap-4 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-2xl disabled:opacity-20 rounded-sm active:scale-[0.98]"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                <span className="hidden sm:inline">Synthesize</span>
              </button>
           </div>
        </div>
      </div>

      {/* 3. VAULT SIDEBAR */}
      <div className="hidden xl:flex w-[320px] shrink-0 flex flex-col bg-gray-50 dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-hidden">
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white flex items-center gap-3">
               <HistoryIcon className="w-4 h-4 text-brand-blue" /> Take_Archives
            </h3>
         </div>
         <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
            {history.length === 0 ? (
               <div className="py-24 text-center opacity-10">
                  <ListMusic className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Vault_Empty</p>
               </div>
            ) : (
               history.map((take, idx) => (
                  <div key={idx} onClick={() => playBuffer(take.buffer)} className={`group border cursor-pointer transition-all p-5 rounded-sm flex flex-col gap-3 ${currentBuffer === take.buffer ? 'border-brand-blue bg-brand-blue/[0.03]' : 'border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/10'}`}>
                     <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black uppercase text-black dark:text-white truncate pr-4">{take.name}</p>
                        <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-blue" />
                     </div>
                     <div className="flex justify-between text-[7px] font-bold text-gray-500 uppercase">
                        <span>{take.timestamp}</span>
                        <span className="text-brand-blue">{take.voice}</span>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
};

export default EchoStudioInterface;
