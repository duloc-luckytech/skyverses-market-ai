
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Loader2, Play, Film, 
  Terminal, Download, 
  LayoutGrid, Plus, 
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
  Focus, Minimize2, Radio,
  Target, ZoomIn, Eye,
  History as HistoryIcon
} from 'lucide-react';
import { generateDemoVideo } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';

const SHOT_TYPES = [
  { id: 'wide', name: 'Wide Shot', icon: <Maximize2 size={14}/> },
  { id: 'medium', name: 'Medium Shot', icon: <LayoutGrid size={14}/> },
  { id: 'closeup', name: 'Close Up', icon: <Target size={14}/> },
  { id: 'macro', name: 'Macro Detail', icon: <ZoomIn size={14}/> },
  { id: 'pov', name: 'POV', icon: <Eye size={14}/> }
];

const LIGHTING_MODES = [
  { id: 'studio', name: 'Studio Soft' },
  { id: 'golden', name: 'Golden Hour' },
  { id: 'neon', name: 'Neon Cyber' },
  { id: 'noir', name: 'High Contrast Noir' },
  { id: 'cinematic', name: 'Master Cinematic' }
];

interface SceneTake {
  id: string;
  directive: string;
  status: 'processing' | 'completed' | 'error';
  url: string | null;
  timestamp: string;
  meta: {
    shot: string;
    lighting: string;
    fps: number;
  };
}

const SceneArchitectWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useLanguage();
  
  // Configuration
  const [directive, setDirective] = useState('');
  const [activeShot, setActiveShot] = useState(SHOT_TYPES[0]);
  const [activeLighting, setActiveLighting] = useState(LIGHTING_MODES[0]);
  const [motionIntensity, setMotionIntensity] = useState(128);
  const [fogDensity, setFogDensity] = useState(20);
  const [timeScale, setTimeScale] = useState(1.0);
  const [refImage, setRefImage] = useState<string | null>(null);

  // Multi-Take Management
  const [takes, setTakes] = useState<SceneTake[]>([]);
  const [activeTakeId, setActiveTakeId] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [logs, setLogs] = useState<string[]>([t('studio.ready'), 'Awaiting directives...']);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setNeedsKey(!hasKey);
      }
    };
    checkKey();
  }, []);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-5), `> ${msg}`]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefImage(reader.result as string);
        addLog('Visual DNA locked for consistency.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    if (!directive.trim() && !refImage) return;

    const takeId = Date.now().toString();
    const newTake: SceneTake = {
      id: takeId,
      directive: directive || "Untitled Take",
      status: 'processing',
      url: null,
      timestamp: new Date().toLocaleTimeString(),
      meta: {
        shot: activeShot.name,
        lighting: activeLighting.name,
        fps: 24
      }
    };

    setTakes(prev => [newTake, ...prev]);
    setActiveTakeId(takeId);
    addLog(`Initializing Take #${takeId.slice(-4)}...`);

    try {
      const fullPrompt = `Cinematic ${activeShot.name}. Lighting: ${activeLighting.name}. Atmospheric fog: ${fogDensity}%. Motion intensity: ${motionIntensity}. Time-scale: ${timeScale}x. Directive: ${directive}. Ultra high fidelity.`;
      
      const url = await generateDemoVideo({ 
        prompt: fullPrompt, 
        references: refImage ? [refImage] : undefined,
        resolution: '1080p',
        aspectRatio: '16:9',
        isUltra: true
      });
      
      if (url) {
        setTakes(prev => prev.map(t => t.id === takeId ? { ...t, status: 'completed', url: url } : t));
        addLog(`Take #${takeId.slice(-4)} finalized.`);
      }
    } catch (err: any) {
      setTakes(prev => prev.map(t => t.id === takeId ? { ...t, status: 'error' } : t));
      addLog(`Critical Failure in Take #${takeId.slice(-4)}.`);
      if (err?.message?.includes("Requested entity was not found")) setNeedsKey(true);
    }
  };

  const activeTake = takes.find(t => t.id === activeTakeId);
  const processingCount = takes.filter(t => t.status === 'processing').length;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#050505] text-black dark:text-white font-sans overflow-hidden relative selection:bg-yellow-500/30 transition-colors">
      
      {/* 1. ARCHITECT TERMINAL (LEFT) */}
      <aside className="w-full lg:w-[420px] h-full flex flex-col border-r border-black/5 dark:border-white/5 bg-[#fcfcfd] dark:bg-[#080808] z-[100] shadow-2xl overflow-hidden">
         <div className="p-8 space-y-10 overflow-y-auto no-scrollbar flex-grow">
            <header className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-500 flex items-center justify-center rounded-sm shadow-xl text-black">
                     <Radio size={20} />
                  </div>
                  <div className="space-y-0.5">
                     <h2 className="text-xl font-black uppercase tracking-tighter italic leading-none">Architect</h2>
                     <p className="text-[8px] text-yellow-600 dark:text-yellow-500 font-bold uppercase tracking-[0.4em]">ULTRA_ELITE v7.4</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut size={20} />
               </button>
            </header>

            {/* CREATIVE INTENT */}
            <section className="space-y-4">
               <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.4em] flex items-center gap-3">
                  <Wand2 size={14} className="text-yellow-500" /> Narrative Intent
               </label>
               <textarea 
                 value={directive}
                 onChange={(e) => setDirective(e.target.value)}
                 className="w-full h-32 bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-4 text-[13px] font-bold uppercase tracking-tight outline-none focus:border-yellow-500 transition-all resize-none italic"
                 placeholder="Describe the cinematic moment..."
               />
            </section>

            {/* CINEMATOGRAPHY */}
            <section className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
               <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.4em]">Cinematography</label>
               <div className="grid grid-cols-2 gap-2">
                  {SHOT_TYPES.map(shot => (
                    <button 
                      key={shot.id} 
                      onClick={() => setActiveShot(shot)}
                      className={`flex items-center gap-3 p-3 border text-[10px] font-black uppercase transition-all rounded-sm ${activeShot.id === shot.id ? 'border-yellow-500 bg-yellow-500/5 text-yellow-600' : 'border-black/5 dark:border-white/5 text-gray-400'}`}
                    >
                       {shot.icon} {shot.name}
                    </button>
                  ))}
               </div>
            </section>

            {/* LIGHTING & ATMOSPHERE */}
            <section className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.4em]">Atmospheric Logic</label>
                  <select 
                    value={activeLighting.id} 
                    onChange={(e) => setActiveLighting(LIGHTING_MODES.find(l => l.id === e.target.value)!)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 text-[11px] font-black uppercase outline-none focus:border-yellow-500"
                  >
                     {LIGHTING_MODES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                     <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
                        <span className="flex items-center gap-2"><Wind size={10}/> Fog Density</span>
                        <span className="text-yellow-500">{fogDensity}%</span>
                     </div>
                     <input type="range" min="0" max="100" value={fogDensity} onChange={(e) => setFogDensity(parseInt(e.target.value))} className="w-full h-1 bg-black/10 dark:bg-white/5 appearance-none rounded-full accent-yellow-500" />
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
                        <span className="flex items-center gap-2"><Clock size={10}/> Time Scale</span>
                        <span className="text-yellow-500">{timeScale}x</span>
                     </div>
                     <input type="range" min="0.1" max="2.0" step="0.1" value={timeScale} onChange={(e) => setTimeScale(parseFloat(e.target.value))} className="w-full h-1 bg-black/10 dark:bg-white/5 appearance-none rounded-full accent-yellow-500" />
                  </div>
               </div>
            </section>

            {/* REFERENCE DNA */}
            <section className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
               <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.4em]">Visual DNA</label>
               <div onClick={() => fileInputRef.current?.click()} className={`aspect-video border-2 border-dashed flex items-center justify-center cursor-pointer rounded-sm overflow-hidden transition-all ${refImage ? 'border-yellow-500' : 'border-black/10 dark:border-white/5 hover:border-yellow-500/50'}`}>
                  {refImage ? <img src={refImage} className="w-full h-full object-cover" /> : <Upload size={24} className="text-gray-300" />}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
               </div>
            </section>
         </div>

         <div className="h-32 border-t border-black/5 dark:border-white/5 p-6 bg-gray-50 dark:bg-black mt-auto flex flex-col gap-2 shrink-0">
            <span className="text-[9px] font-black uppercase text-gray-400 italic">Production_Telemetry</span>
            <div className="flex-grow overflow-hidden font-mono text-[10px] text-gray-400">
               {logs.map((log, i) => <p key={i}>{log}</p>)}
            </div>
         </div>
      </aside>

      {/* 2. PRODUCTION HUB (CENTER) */}
      <main className="flex-grow flex flex-col bg-[#f0f1f3] dark:bg-[#010102] relative overflow-hidden">
         
         <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-50 pointer-events-none">
            <div className="px-5 py-2.5 bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 flex items-center gap-3 pointer-events-auto">
               <div className={`w-2 h-2 rounded-full ${processingCount > 0 ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status: {processingCount > 0 ? 'Synthesizing_Take' : 'Node_Standby'}</span>
            </div>
         </div>

         <div className="flex-grow flex items-center justify-center p-8 lg:p-16 relative">
            <AnimatePresence mode="wait">
               {activeTake ? (
                  <motion.div 
                    key={activeTake.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full max-w-6xl aspect-video bg-black rounded-sm overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,0.5)] border border-white/5 group"
                  >
                     {activeTake.status === 'processing' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl space-y-10">
                           <div className="relative">
                              <Loader2 size={100} className="text-yellow-500 animate-spin" strokeWidth={1} />
                              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-500/50 animate-pulse" size={40} />
                           </div>
                           <div className="text-center space-y-3">
                              <p className="text-[14px] font-black uppercase tracking-[1em] text-white animate-pulse">Rendering_Sequence</p>
                              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-500/50">H100_Cluster_042 // {activeTake.meta.shot}</p>
                           </div>
                        </div>
                     ) : activeTake.url ? (
                        <video key={activeTake.url} src={activeTake.url} autoPlay loop muted className="w-full h-full object-cover" />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-red-500">
                           <AlertCircle size={60} strokeWidth={1} />
                        </div>
                     )}
                     
                     {activeTake.status === 'completed' && (
                        <>
                           <div className="absolute bottom-8 left-8 space-y-4 pointer-events-none">
                              <div className="flex gap-2">
                                <span className="text-[9px] font-black uppercase bg-yellow-500 text-black px-4 py-1.5 shadow-lg tracking-widest italic">PRODUCTION MASTER</span>
                                <span className="text-[9px] font-black uppercase bg-black text-white px-4 py-1.5 shadow-lg tracking-widest">1080P // 24FPS</span>
                              </div>
                              <h2 className="text-4xl font-black uppercase text-white tracking-tighter italic leading-none">{activeTake.directive}</h2>
                           </div>

                           <div className="absolute top-8 right-8 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button className="p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-yellow-500 hover:text-black transition-all shadow-2xl">
                                 <Share2 size={24} />
                              </button>
                              <a href={activeTake.url!} download className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
                                 <Download size={24} />
                              </a>
                           </div>
                        </>
                     )}
                  </motion.div>
               ) : (
                  <div className="text-center opacity-10 space-y-10">
                     <MonitorPlay size={120} strokeWidth={0.5} />
                     <p className="text-xl font-black uppercase tracking-[1em]">Director_Offline</p>
                  </div>
               )}
            </AnimatePresence>
         </div>

         {/* PRODUCTION HUD (BOTTOM) */}
         <div className="h-40 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#080808] px-10 lg:px-16 flex items-center justify-between z-40 transition-colors shadow-2xl shrink-0">
            <div className="flex items-center gap-16">
               <div className="hidden md:flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                     <HistoryIcon size={18} className="text-gray-400" />
                     <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Takes_History</span>
                  </div>
                  <div className="flex gap-4">
                     {takes.slice(0, 5).map(t => (
                        <button 
                           key={t.id} onClick={() => setActiveTakeId(t.id)}
                           className={`w-16 h-10 border-2 transition-all overflow-hidden rounded-sm relative group/take ${activeTakeId === t.id ? 'border-yellow-500 scale-105 shadow-lg' : 'border-white/5 opacity-30 hover:opacity-100'}`}
                        >
                           {t.url ? <video src={t.url} className="w-full h-full object-cover" muted /> : <div className="w-full h-full bg-black flex items-center justify-center"><Loader2 size={12} className="animate-spin" /></div>}
                        </button>
                     ))}
                     {takes.length === 0 && [1,2,3,4,5].map(i => <div key={i} className="w-16 h-10 border border-dashed border-white/10 opacity-10" />)}
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
               {activeTake && activeTake.status === 'completed' && (
                  <button 
                    className="h-24 px-12 border border-yellow-500 text-yellow-600 dark:text-yellow-500 flex flex-col items-center justify-center gap-2 hover:bg-yellow-500 hover:text-black transition-all rounded-sm italic group shadow-xl"
                  >
                     <FastForward size={28} className="group-hover:translate-x-2 transition-transform" />
                     <span className="text-[9px] font-black uppercase tracking-widest">Extend +7s</span>
                  </button>
               )}
               <button 
                 onClick={handleSynthesize}
                 disabled={(!directive.trim() && !refImage) || processingCount > 0}
                 className={`group h-24 px-24 lg:px-48 flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden rounded-sm shadow-[0_20px_80px_rgba(234,179,8,0.2)] ${directive.trim() || refImage ? 'bg-yellow-500 text-black hover:scale-105 active:scale-95' : 'bg-black/5 dark:bg-white/5 text-gray-400'}`}
               >
                  <Zap size={28} className={processingCount > 0 ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'} fill="currentColor" />
                  <span className="text-[11px] font-black uppercase tracking-[0.6em]">{processingCount > 0 ? 'Synthesizing' : 'Launch Master Render'}</span>
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
               </button>
            </div>
         </div>
      </main>

      {/* AUTH OVERLAY */}
      {needsKey && (
        <div className="absolute inset-0 z-[1000] bg-white/95 dark:bg-black/98 backdrop-blur-3xl flex items-center justify-center p-12 text-center">
          <div className="max-w-md space-y-12 animate-in zoom-in duration-500">
            <div className="w-20 h-20 border-2 border-yellow-500 mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.3)]">
              <Lock className="w-8 h-8 text-yellow-600 dark:text-yellow-500 animate-pulse" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Security_Protocol_Active</h3>
              <p className="text-[12px] text-gray-600 dark:text-gray-400 uppercase tracking-widest font-bold leading-loose">
                Quyền truy cập Scene Architect Ultra yêu cầu xác thực API Key từ dự án **PAID** GCP để khởi chạy H100 Cinematic Node.
              </p>
              <div className="pt-8 flex flex-col gap-6 items-center">
                <button 
                  onClick={() => { if ((window as any).aistudio) (window as any).aistudio.openSelectKey(); setNeedsKey(false); }}
                  className="py-6 px-20 bg-yellow-500 text-black text-[12px] tracking-[0.4em] font-black uppercase shadow-2xl w-full rounded-sm hover:scale-105 transition-all"
                >
                  Xác thực H100 Pipeline
                </button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] text-gray-500 hover:text-yellow-500 transition-colors uppercase font-black tracking-widest italic border-b border-transparent hover:border-yellow-500">GCP Billing Documentation <ExternalLink className="w-3 h-3 inline ml-1" /></a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-progress { animation: progress 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default SceneArchitectWorkspace;
