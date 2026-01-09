
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Loader2, Play, Film, 
  Terminal, ShieldCheck, Download, 
  History as HistoryIcon, LayoutGrid, Plus, 
  ArrowRight, Square, CheckCircle2, 
  AlertTriangle, Layers, AlignLeft, 
  Sparkles, Camera, MonitorPlay,
  Lock, ExternalLink, Activity, Share2, 
  Clapperboard, Sliders, Settings2, BookOpen,
  ChevronRight, MoreVertical, Menu, LogOut,
  Upload, MousePointer2, Move, RotateCcw,
  Monitor, Cpu, Crown, FastForward, Repeat,
  Maximize2, Trash2, Palette, Wand2,
  Smartphone, Monitor as MonitorIcon, Clock,
  Check, AlertCircle, Sun, CloudRain, Wind,
  Focus, Minimize2, Radio, Target, ZoomIn, Eye
} from 'lucide-react';
import { generateDemoVideo } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';

interface Scene {
  id: string;
  url: string | null;
  status: 'idle' | 'rendering' | 'done' | 'error';
  text: string;
  meta: {
    shot: string;
    motion: string;
    lighting: string;
  }
}

const SHOT_TYPES = ['WIDE', 'MEDIUM', 'CLOSE UP', 'POV', 'AERIAL'];
const MOTION_PRESETS = ['CINEMATIC TRACK', 'ZOOM IN', 'PAN RIGHT', 'STABLE STATIC'];

const GenyuWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang, t } = useLanguage();
  
  // Studio Core States
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'STORY' | 'DIRECT' | 'HISTORY'>('STORY');
  
  // UI States
  const [inputText, setInputText] = useState('');
  const [needsKey, setNeedsKey] = useState(false);
  const [logs, setLogs] = useState<string[]>(['ARCHITECT STUDIO initialized.', 'Secure Node active.']);

  // Current Parameters
  const [selectedShot, setSelectedShot] = useState(SHOT_TYPES[0]);
  const [selectedMotion, setSelectedMotion] = useState(MOTION_PRESETS[0]);
  const [intensity, setIntensity] = useState(128);

  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setNeedsKey(!hasKey);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-5), `> ${msg}`]);

  const handleAddScene = () => {
    if (!inputText.trim()) return;
    const newId = Date.now().toString();
    const newScene: Scene = { 
      id: newId, 
      url: null, 
      status: 'idle', 
      text: inputText,
      meta: {
        shot: selectedShot,
        motion: selectedMotion,
        lighting: 'Studio Cinematic'
      }
    };
    setScenes(prev => [...prev, newScene]);
    setActiveSceneId(newId);
    setInputText('');
    addLog(`Scene added to production queue.`);
  };

  const synthesizeScene = async (sceneId: string) => {
    const target = scenes.find(s => s.id === sceneId);
    if (!target || target.status === 'rendering') return;

    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: 'rendering' } : s));
    addLog(`Synthesizing Industrial Take #${sceneId.slice(-4)}...`);

    try {
      const idx = scenes.findIndex(s => s.id === sceneId);
      const prevVideo = idx > 0 ? scenes[idx-1].url : undefined;
      const directive = `${target.text}. Shot: ${target.meta.shot}. Motion: ${target.meta.motion}. Intensity: ${intensity}. B2B Quality.`;

      const url = await generateDemoVideo({ 
        prompt: directive, 
        resolution: '1080p', 
        aspectRatio: '16:9',
        previousVideoUri: prevVideo || undefined,
        isUltra: true
      });
      
      if (url) {
        setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: 'done', url: url } : s));
        addLog(`Synthesis complete. Take verified.`);
      }
    } catch (err: any) {
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: 'error' } : s));
      if (err?.message?.includes("Requested entity was not found")) setNeedsKey(true);
      addLog(`Critical Synthesis Failure.`);
    }
  };

  const activeScene = scenes.find(s => s.id === activeSceneId);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#030304] text-black dark:text-white font-sans overflow-hidden relative selection:bg-brand-blue/30">
      
      {/* 1. LEFT PANEL */}
      <aside className="w-full lg:w-[400px] shrink-0 flex flex-col border-r border-black/10 dark:border-white/5 bg-[#f9f9fb] dark:bg-[#080808] z-[100] shadow-2xl transition-colors duration-500 overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-black/10 dark:border-white/5 bg-brand-blue/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Clapperboard size={20} className="text-brand-blue" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue">ARCHITECT TERMINAL</h2>
           </div>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar p-6 lg:p-8 space-y-8">
           <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-sm">
             {['STORY', 'DIRECT', 'HISTORY'].map(tab => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTab(tab as any)}
                 className={`flex-grow py-2.5 text-[8px] font-black uppercase transition-all rounded-sm ${activeTab === tab ? 'bg-white dark:bg-black shadow-md' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
               >
                 {tab}
               </button>
             ))}
           </div>

           <AnimatePresence mode="wait">
             {activeTab === 'STORY' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                        <Terminal size={14} className="text-brand-blue" /> Narrative Directive
                     </label>
                     <textarea 
                       value={inputText}
                       onChange={(e) => setInputText(e.target.value)}
                       className="w-full h-32 p-4 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-sm text-[12px] font-bold uppercase tracking-tight focus:border-brand-blue outline-none transition-all resize-none italic"
                       placeholder="Enter technical scene description..."
                     />
                     <button onClick={handleAddScene} className="w-full py-4 bg-brand-blue text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                        <Plus size={16} /> Append to Pipeline
                     </button>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </aside>

      {/* 2. CENTER: VIEWPORT HUB */}
      <main className="flex-grow flex flex-col bg-[#f1f1f3] dark:bg-[#010102] relative overflow-hidden transition-colors duration-500 min-h-0">
         <div className="flex-grow flex items-center justify-center p-4 lg:p-16 relative">
            <AnimatePresence mode="wait">
               {activeScene ? (
                  <motion.div key={activeScene.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative group w-full max-w-6xl aspect-video bg-black rounded-sm overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/5">
                     {activeScene.url ? (
                        <video key={activeScene.url} src={activeScene.url} autoPlay loop muted className="w-full h-full object-contain" />
                     ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10 p-6 text-center">
                           {activeScene.status === 'rendering' ? (
                              <div className="flex flex-col items-center gap-6">
                                 <Loader2 size={48} className="text-brand-blue animate-spin" />
                                 <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Computing Cinematic Lattice</p>
                              </div>
                           ) : (
                              <button onClick={() => synthesizeScene(activeScene.id)} className="bg-brand-blue text-white px-8 lg:px-12 py-4 lg:py-5 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:brightness-110 active:scale-[0.98] flex items-center gap-4">
                                 <Zap size={18} fill="currentColor" /> Initialize Render
                              </button>
                           )}
                        </div>
                     )}
                  </motion.div>
               ) : (
                  <div className="text-center space-y-6 lg:space-y-8 opacity-10 p-6">
                     <MonitorPlay size={80} strokeWidth={1} className="mx-auto" />
                     <p className="text-sm lg:text-xl font-black uppercase tracking-[1em]">Awaiting Instructions</p>
                  </div>
               )}
            </AnimatePresence>
         </div>

         {/* TIMELINE HUB */}
         <div className="h-32 lg:h-40 border-t border-black/10 dark:border-white/5 bg-white dark:bg-[#080808] p-6 lg:p-8 flex items-center justify-between z-[90] shrink-0 transition-colors duration-500 shadow-2xl">
            <div className="flex items-center gap-6 lg:gap-12 overflow-x-auto no-scrollbar flex-grow">
               <div className="space-y-3 lg:space-y-4 shrink-0">
                  <div className="flex items-center gap-3">
                     <HistoryIcon size={14} className="text-gray-400" />
                     <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-gray-500">Master Sequencer</span>
                  </div>
               </div>
            </div>
         </div>
      </main>

      {/* AUTH MODAL */}
      {needsKey && (
        <div className="absolute inset-0 z-[1000] bg-white/95 dark:bg-black/98 backdrop-blur-2xl flex items-center justify-center p-8 text-center transition-colors duration-500">
          <div className="max-w-md space-y-12 animate-in zoom-in duration-500">
            <div className="w-24 h-24 border-2 border-brand-blue mx-auto flex items-center justify-center shadow-2xl">
              <Lock className="w-10 h-10 text-brand-blue animate-pulse" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic">Industrial Lock</h3>
              <p className="text-[11px] lg:text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-widest font-bold">
                Professional narrative synthesis requires a **PAID** GCP Project API Key.
              </p>
              <div className="pt-8 flex flex-col gap-6 items-center">
                <button 
                  onClick={() => { if ((window as any).aistudio) (window as any).aistudio.openSelectKey(); setNeedsKey(false); }}
                  className="py-5 lg:py-6 px-16 lg:px-20 bg-brand-blue text-white text-[11px] lg:text-[12px] tracking-[0.4em] font-black uppercase shadow-2xl w-full rounded-sm hover:scale-105 transition-all"
                >
                  Link Enterprise Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenyuWorkspace;
