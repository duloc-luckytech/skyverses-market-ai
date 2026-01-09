
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, Download, Volume2, 
  Settings2, Loader2, Zap, AudioLines, 
  CheckCircle2, Plus, Info, RefreshCw, 
  Mic, SlidersHorizontal, Activity, Share
} from 'lucide-react';
import { generateDemoAudio } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';

const VOICE_PRESETS = [
  { id: 'Kore', name: 'Kore', traits: 'Professional, Deep', gender: 'Male' },
  { id: 'Puck', name: 'Puck', traits: 'Vibrant, Energetic', gender: 'Male' },
  { id: 'Charon', name: 'Charon', traits: 'Deep, Resonant', gender: 'Male' },
  { id: 'Zephyr', name: 'Zephyr', traits: 'Smooth, Natural', gender: 'Female' },
  { id: 'Fenrir', name: 'Fenrir', traits: 'Technical, Grave', gender: 'Male' }
];

const TTSWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useLanguage();
  
  const [text, setText] = useState('Welcome to the future of neural speech. This is Skyverses TTS engine, designed for high-fidelity enterprise narration.');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_PRESETS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;
    setIsGenerating(true);
    stopPlayback();

    try {
      const buffer = await generateDemoAudio(text, selectedVoice.id);
      if (buffer) {
        setAudioBuffer(buffer);
        playBuffer(buffer);
      }
    } catch (error) {
      console.error("TTS Synthesis Error:", error);
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

  const downloadAudio = () => {
    if (!audioBuffer) return;
    // In a real app, you'd convert AudioBuffer to WAV blob here
    alert("Audio export ready. (Demo limitation: Blob conversion not available in frontend-only sandbox)");
  };

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB] dark:bg-[#030304] overflow-hidden text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#08080a] border-b border-gray-200 dark:border-white/10 px-8 py-6 flex justify-between items-center shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-xl flex items-center justify-center text-brand-blue">
            <Mic size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="font-black text-xl tracking-tight uppercase italic">Neural TTS Studio</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enterprise Speech Synthesis</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-full">
          <X size={24} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar pb-32">
        <div className="max-w-5xl mx-auto p-8 space-y-10">
          
          {/* Main Editor Card */}
          <div className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
             <div className="relative">
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-2xl p-8 text-lg font-medium text-gray-700 dark:text-gray-300 min-h-[250px] focus:ring-2 focus:ring-brand-blue outline-none transition-all leading-relaxed no-scrollbar"
                  placeholder={t('tts.workspace.placeholder')}
                />
                <div className="absolute right-6 bottom-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white dark:bg-black px-2 py-1 rounded">
                   {text.length} / 5000 chars
                </div>
             </div>

             <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('tts.workspace.settings')}</span>
                      <div className="flex items-center gap-3">
                         <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                            {['Kore', 'Zephyr'].map(v => (
                               <button 
                                 key={v}
                                 onClick={() => setSelectedVoice(VOICE_PRESETS.find(p => p.id === v)!)}
                                 className={`px-5 py-2 text-xs font-black uppercase rounded-md transition-all ${selectedVoice.id === v ? 'bg-white dark:bg-black text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                               >
                                  {v}
                               </button>
                            ))}
                         </div>
                         <button className="p-2 border border-gray-200 dark:border-white/10 rounded-lg text-gray-400 hover:text-brand-blue"><SlidersHorizontal size={18}/></button>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                   {audioBuffer && (
                      <button onClick={downloadAudio} className="p-4 border border-gray-200 dark:border-white/10 rounded-xl text-gray-500 hover:text-brand-blue hover:border-brand-blue transition-all">
                         <Download size={20} />
                      </button>
                   )}
                   <button 
                     onClick={handleGenerate}
                     disabled={isGenerating || !text.trim()}
                     className="bg-slate-900 dark:bg-white dark:text-black text-white px-10 py-4 rounded-xl text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                   >
                     {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                     {t('tts.workspace.generate')}
                   </button>
                </div>
             </div>
          </div>

          {/* Visualizer Area */}
          <div className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm h-32 flex items-center justify-center relative overflow-hidden">
             <div className="flex items-center gap-1 h-12 w-full justify-center opacity-40">
                {Array.from({length: 60}).map((_, i) => (
                   <motion.div 
                     key={i}
                     className={`w-1 rounded-full bg-brand-blue ${isPlaying ? 'animate-pulse' : 'h-2'}`}
                     animate={{ height: isPlaying ? [10, 40, 15, 35, 10][i % 5] : 8 }}
                     transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                   />
                ))}
             </div>
             {audioBuffer && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/[0.02]">
                   <button 
                     onClick={isPlaying ? stopPlayback : () => playBuffer(audioBuffer)}
                     className="w-16 h-16 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                   >
                      {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
                   </button>
                </div>
             )}
          </div>

          {/* Voice Library Card */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="font-black text-lg uppercase tracking-widest italic">Voice Library</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">5 Enterprise Models</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {VOICE_PRESETS.map((voice) => (
                   <button 
                     key={voice.id}
                     onClick={() => setSelectedVoice(voice)}
                     className={`p-6 border text-left transition-all rounded-2xl group ${selectedVoice.id === voice.id ? 'border-brand-blue bg-brand-blue/5 shadow-lg' : 'bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/5 hover:border-brand-blue/30'}`}
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-brand-blue transition-colors">
                            <Volume2 size={24} />
                         </div>
                         {selectedVoice.id === voice.id && <CheckCircle2 size={20} className="text-brand-blue" />}
                      </div>
                      <h4 className="text-lg font-black uppercase italic tracking-tight">{voice.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{voice.traits}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                         <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 rounded">{voice.gender}</span>
                         <button className="text-[10px] font-black uppercase text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Preview <Play size={10} fill="currentColor"/></button>
                      </div>
                   </button>
                ))}
             </div>
          </div>

        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default TTSWorkspace;
