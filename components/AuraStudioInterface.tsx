
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic2, Play, Volume2, Settings2, Download, 
  Loader2, Zap, AudioLines, Database, Lock, 
  CheckCircle2, ListMusic, MessageSquareText, 
  UserCheck, Sliders, Scale, ShieldAlert, 
  Fingerprint, Activity, Square, Terminal, Plus, Save, 
  History as HistoryIcon
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
    { name: 'Kore', label: 'IDENTITY_01', tone: 'Authoritative', desc: 'Consistent brand narration for leadership content.' },
    { name: 'Puck', label: 'IDENTITY_02', tone: 'Dynamic', desc: 'Vibrant and energetic for customer-facing media.' },
    { name: 'Charon', label: 'IDENTITY_03', tone: 'Cinematic', desc: 'Deep, resonant textures for high-end storytelling.' },
    { name: 'Zephyr', label: 'IDENTITY_04', tone: 'Humanoid', desc: 'Conversational, natural flow with emotive nuances.' },
    { name: 'Fenrir', label: 'IDENTITY_05', tone: 'Technical', desc: 'Grave and focused for instructional precision.' }
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
        setHistory(prev => [{ 
          name: script.split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 28) || 'Multi-Speaker_Take', 
          timestamp: new Date().toLocaleTimeString(), 
          buffer 
        }, ...prev]);
        playBuffer(buffer);
      }
    } catch (err) {
      console.error("Aura Synthesis Error:", err);
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
      
      {/* 1. CONFIG SIDEBAR: IDENTITY MATRIX */}
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

           <div className="p-6 bg-white dark:bg-white/[0.02] border border-black/10 dark:border-white/5 space-y-8 shadow-sm">
              <div className="space-y-2">
                 <label className="text-[8px] font-black uppercase text-gray-400">Protocol_Alias</label>
                 <input 
                   value={activeSpeakerNode === 'A' ? speakerA.name : speakerB.name} 
                   onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (activeSpeakerNode === 'A') setSpeakerA({...speakerA, name: val});
                      else setSpeakerB({...speakerB, name: val});
                   }}
                   className="w-full bg-transparent border-b border-black/10 dark:border-white/10 text-brand-blue text-sm font-black uppercase outline-none focus:border-brand-blue pb-2"
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-[8px] font-black uppercase text-gray-400">Neural_Base</label>
                 <div className="space-y-1.5">
                    {protocols.map(p => (
                       <button 
                         key={p.name}
                         onClick={() => {
                            if (activeSpeakerNode === 'A') setSpeakerA({...speakerA, voice: p.name});
                            else setSpeakerB({...speakerB, voice: p.name});
                         }}
                         className={`w-full p-4 text-left transition-all border flex justify-between items-center rounded-sm ${ (activeSpeakerNode === 'A' ? speakerA.voice : speakerB.voice) === p.name ? 'border-brand-blue bg-brand-blue/5' : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'}`}
                       >
                          <div className="space-y-1">
                             <h4 className="text-[9px] font-black uppercase text-black dark:text-white tracking-widest">{p.label}</h4>
                             <p className="text-[8px] text-gray-500 font-medium leading-relaxed">{p.desc}</p>
                          </div>
                          {(activeSpeakerNode === 'A' ? speakerA.voice : speakerB.voice) === p.name && <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue" />}
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-8 pt-8 border-t border-black/10 dark:border-white/5">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
                 <Sliders className="w-4 h-4 text-brand-blue" /> Consistency
              </label>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                       <span>Identity_Weight</span>
                       <span className="text-brand-blue">{activeSpeakerNode === 'A' ? speakerA.weight : speakerB.weight}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={activeSpeakerNode === 'A' ? speakerA.weight : speakerB.weight} 
                      onChange={(e) => {
                         const val = parseInt(e.target.value);
                         if (activeSpeakerNode === 'A') setSpeakerA({...speakerA, weight: val});
                         else setSpeakerB({...speakerB, weight: val});
                      }}
                      className="w-full h-1 bg-black/10 dark:bg-white/5 appearance-none rounded-full accent-brand-blue" 
                    />
                 </div>
                 <div className="p-4 border border-brand-blue/20 bg-brand-blue/5 rounded-sm space-y-3">
                    <div className="flex items-center gap-2 text-brand-blue">
                       <ShieldAlert className="w-3.5 h-3.5" />
                       <span className="text-[8px] font-black uppercase tracking-widest">Compliance_Verified</span>
                    </div>
                    <p className="text-[7px] text-gray-500 font-bold uppercase leading-relaxed">Identity cloning hash verified. Node transmission authorized.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. CENTER: VIEWPORT & EDITOR */}
      <div className="flex-grow flex flex-col bg-white dark:bg-[#020202] relative overflow-hidden">
        <div className="flex-grow flex flex-col p-8 lg:p-12 overflow-y-auto custom-scrollbar relative">
           <div className="max-w-4xl mx-auto w-full space-y-10">
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/5 pb-8">
                 <div className="flex items-center gap-4">
                    <Terminal className="w-5 h-5 text-brand-blue" />
                    <div className="space-y-0.5">
                       <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-gray-600">Director_Console</span>
                       <p className="text-[8px] font-bold text-gray-300 dark:text-gray-800 uppercase tracking-widest">Multi-Speaker Context Synthesis</p>
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
                   placeholder="[NAME]: Dialogue payload..."
                   className="w-full min-h-[300px] bg-transparent border-none text-2xl lg:text-4xl font-bold text-black dark:text-white/90 placeholder:text-black/5 dark:placeholder:text-white/5 focus:outline-none resize-none selection:bg-brand-blue/20 leading-[1.3] tracking-tighter"
                 />
              </div>
           </div>

           {/* Dynamic Aura Waveform Visualization (Mock) */}
           <div className="absolute bottom-12 left-12 right-12 h-20 pointer-events-none opacity-10">
              <div className="flex items-center justify-center gap-1 h-full">
                 {Array.from({length: 40}).map((_, i) => (
                    <div key={i} className={`w-1 bg-brand-blue rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-1'}`} style={{ height: isPlaying ? `${Math.random() * 100}%` : '4px', animationDelay: `${i*0.05}s` }}></div>
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
                 <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase tracking-widest text-brand-blue">{speakerA.name}</span>
                       <span className="text-[7px] text-gray-400 dark:text-gray-700 font-bold uppercase">ID: {speakerA.voice}</span>
                    </div>
                    <div className="w-10 h-[1px] bg-black/10 dark:bg-white/10"></div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-800">{speakerB.name}</span>
                       <span className="text-[7px] text-gray-400 dark:text-gray-800 font-bold uppercase">ID: {speakerB.voice}</span>
                    </div>
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

      {/* 3. VAULT SIDEBAR (DESKTOP) */}
      <div className="hidden xl:flex w-[320px] shrink-0 flex flex-col bg-gray-50 dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-hidden">
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white flex items-center gap-3">
               <HistoryIcon className="w-4 h-4 text-brand-blue" /> Take_Archives
            </h3>
         </div>
         <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
            {history.length === 0 ? (
               <div className="py-24 text-center opacity-10">
                  <Database className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Vault_Empty</p>
               </div>
            ) : (
               history.map((take, idx) => (
                  <div key={idx} onClick={() => playBuffer(take.buffer)} className={`group border cursor-pointer transition-all p-5 rounded-sm flex flex-col gap-3 ${currentBuffer === take.buffer ? 'border-brand-blue bg-brand-blue/[0.03]' : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'}`}>
                     <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black uppercase text-black dark:text-white truncate pr-4">{take.name}</p>
                        <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-blue" />
                     </div>
                     <div className="flex justify-between text-[7px] font-bold text-gray-500 uppercase">
                        <span>{take.timestamp}</span>
                        <span className="text-brand-blue">48kHz</span>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
};

export default AuraStudioInterface;
