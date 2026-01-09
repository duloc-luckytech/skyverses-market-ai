
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
  Check, AlertCircle,
  History as HistoryIcon
} from 'lucide-react';
import { generateDemoVideo } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const TRAJECTORIES = [
  { id: 'orbit', name: 'Orbit', desc: { en: '360 degree orbit.', vi: 'Xoay camera 360 độ.', ko: '360도 궤도.', ja: '360度軌道。' } },
  { id: 'dolly', name: 'Dolly', desc: { en: 'Push in / Pull out.', vi: 'Tiến sát / lùi xa.', ko: '줌 인 / 줌 아웃.', ja: 'ズームイン/ズームアウト。' } },
  { id: 'crane', name: 'Crane', desc: { en: 'Vertical axis movement.', vi: 'Di chuyển trục dọc.', ko: '수직축 이동.', ja: '垂直軸移動。' } },
  { id: 'static', name: 'Static', desc: { en: 'Fixed camera.', vi: 'Camera cố định.', ko: '고정 카메라.', ja: '固定カメラ。' } }
];

interface RenderTask {
  id: string;
  prompt: string;
  status: 'processing' | 'completed' | 'error';
  videoUrl: string | null;
  timestamp: string;
  trajectory: string;
  duration: number;
}

const KineticWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang, t } = useLanguage();
  const { theme } = useTheme();
  
  // Assets & Config
  const [prompt, setPrompt] = useState('');
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [lastFrame, setLastFrame] = useState<string | null>(null);
  const [styleRef, setStyleRef] = useState<string | null>(null);
  const [activeTrajectory, setActiveTrajectory] = useState(TRAJECTORIES[0]);
  const [motionBucket, setMotionBucket] = useState(128);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedDuration, setSelectedDuration] = useState(6);

  // Multi-Video Task Management
  const [tasks, setTasks] = useState<RenderTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [logs, setLogs] = useState<string[]>([t('studio.ready'), t('studio.waiting')]);

  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setNeedsKey(!hasKey);
      }
    };
    checkKey();
  }, []);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-4), `> ${msg}`]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'FIRST' | 'LAST' | 'STYLE') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (target === 'FIRST') setFirstFrame(base64);
        else if (target === 'LAST') setLastFrame(base64);
        else setStyleRef(base64);
        addLog(`DNA_LOCK: ${target}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    if (!firstFrame) return;
    
    const taskId = Date.now().toString();
    const currentDuration = selectedDuration;
    
    const newTask: RenderTask = {
      id: taskId,
      prompt: prompt || "UNTITLED_RENDER",
      status: 'processing',
      videoUrl: null,
      timestamp: new Date().toLocaleTimeString(),
      trajectory: activeTrajectory.name,
      duration: currentDuration
    };

    setTasks(prev => [newTask, ...prev]);
    setActiveTaskId(taskId);
    addLog(`INITIALIZING_JOB_${taskId.slice(-4)} (${currentDuration}s)`);

    try {
      const directive = `${prompt}. ${activeTrajectory.name} motion. Duration: ${currentDuration}s. High quality.`;
      const references = [firstFrame];
      if (styleRef) references.push(styleRef);

      const url = await generateDemoVideo({ 
        prompt: directive, 
        references,
        lastFrame: lastFrame || undefined,
        resolution,
        aspectRatio,
        isUltra: true
      });
      
      if (url) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', videoUrl: url } : t));
        addLog(`JOB_${taskId.slice(-4)}_SUCCESS`);
      }
    } catch (err: any) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error' } : t));
      addLog(`JOB_${taskId.slice(-4)}_FAILURE`);
      if (err?.message?.includes("Requested entity was not found")) setNeedsKey(true);
    }
  };

  const handleExtend = async () => {
    const task = tasks.find(t => t.id === activeTaskId);
    if (!task || !task.videoUrl || task.status !== 'completed') return;

    addLog(`EXTENDING_JOB_${task.id.slice(-4)}`);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'processing' } : t));

    try {
      const url = await generateDemoVideo({
        prompt: `Continue smoothly.`,
        previousVideoUri: task.videoUrl,
        resolution: '720p',
        aspectRatio: aspectRatio,
        isUltra: true
      });
      
      if (url) {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed', videoUrl: url, duration: t.duration + 7.0 } : t));
        addLog(`EXTENSION_SUCCESS`);
      }
    } catch (err: any) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed' } : t));
      addLog(`EXTENSION_FAILURE`);
      if (err?.message?.includes("Requested entity was not found")) setNeedsKey(true);
    }
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);
  const processingCount = tasks.filter(t => t.status === 'processing').length;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#030304] text-black dark:text-white font-sans overflow-hidden relative selection:bg-yellow-500/30 transition-colors duration-500">
      
      {/* 1. CONTROL TERMINAL (LEFT) */}
      <aside className="w-full lg:w-[380px] h-full flex flex-col border-r border-black/5 dark:border-white/5 bg-[#fcfcfd] dark:bg-[#08080a] z-[100] shadow-2xl overflow-hidden transition-colors">
         <div className="p-8 space-y-10 overflow-y-auto no-scrollbar flex-grow">
            <header className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-yellow-500 flex items-center justify-center rounded-sm shadow-xl text-black">
                     <Crown size={18} />
                  </div>
                  <div className="space-y-0.5">
                     <h2 className="text-lg font-black uppercase tracking-tighter italic leading-none">Kinetic</h2>
                     <p className="text-[7px] text-yellow-600 dark:text-yellow-500 font-bold uppercase tracking-[0.3em]">STUDIO v3.1</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut size={18} />
               </button>
            </header>

            {/* CREATIVE DIRECTIVE */}
            <section className="space-y-4">
               <label className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.3em] flex items-center gap-3">
                  <Wand2 size={12} className="text-yellow-500" /> {t('studio.directives')}
               </label>
               <textarea 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 className="w-full h-20 bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-3 text-[11px] font-bold uppercase tracking-tight outline-none focus:border-yellow-500 transition-all resize-none"
                 placeholder={t('studio.placeholder')}
               />
            </section>

            {/* QUICK CONFIG */}
            <section className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                     <label className="text-[8px] font-black uppercase text-gray-400">Resolution</label>
                     <select value={resolution} onChange={(e) => setResolution(e.target.value as any)} className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-2 text-[9px] font-black uppercase outline-none">
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[8px] font-black uppercase text-gray-400">Aspect</label>
                     <div className="flex gap-1">
                        <button onClick={() => setAspectRatio('16:9')} className={`flex-grow p-2 border rounded-sm ${aspectRatio === '16:9' ? 'border-yellow-500 text-yellow-600' : 'border-black/5 text-gray-400'}`}><MonitorIcon size={12} className="mx-auto"/></button>
                        <button onClick={() => setAspectRatio('9:16')} className={`flex-grow p-2 border rounded-sm ${aspectRatio === '9:16' ? 'border-yellow-500 text-yellow-600' : 'border-black/5 text-gray-400'}`}><Smartphone size={12} className="mx-auto"/></button>
                     </div>
                  </div>
               </div>

               {/* DURATION SELECTOR */}
               <div className="space-y-3 pt-2">
                  <label className="text-[8px] font-black uppercase text-gray-400">{t('studio.duration')}</label>
                  <div className="flex gap-1">
                     {[4, 6, 8].map((s) => (
                        <button 
                          key={s}
                          onClick={() => setSelectedDuration(s)}
                          className={`flex-grow py-2 text-[9px] font-black border rounded-sm transition-all ${selectedDuration === s ? 'border-yellow-500 text-yellow-600 bg-yellow-500/5' : 'border-black/5 text-gray-400'}`}
                        >
                           {s}s
                        </button>
                     ))}
                  </div>
               </div>
            </section>

            {/* KEYFRAMES */}
            <section className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
               <label className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.3em]">{t('studio.frames')}</label>
               <div onClick={() => firstInputRef.current?.click()} className={`aspect-video border-2 border-dashed flex items-center justify-center cursor-pointer rounded-sm overflow-hidden ${firstFrame ? 'border-yellow-500' : 'border-black/10 dark:border-white/5'}`}>
                  {firstFrame ? <img src={firstFrame} className="w-full h-full object-cover" /> : <Upload size={18} className="text-gray-300" />}
                  <input type="file" ref={firstInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'FIRST')} />
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <div onClick={() => lastInputRef.current?.click()} className="aspect-square border border-dashed border-black/10 dark:border-white/5 flex items-center justify-center cursor-pointer">
                    {lastFrame ? <img src={lastFrame} className="w-full h-full object-cover" /> : <Repeat size={14} className="text-gray-300" />}
                    <input type="file" ref={lastInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'LAST')} />
                  </div>
                  <div onClick={() => styleInputRef.current?.click()} className="aspect-square border border-dashed border-black/10 dark:border-white/5 flex items-center justify-center cursor-pointer">
                    {styleRef ? <img src={styleRef} className="w-full h-full object-cover" /> : <Palette size={14} className="text-gray-300" />}
                    <input type="file" ref={styleInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'STYLE')} />
                  </div>
               </div>
            </section>

            {/* TRAJECTORY SELECTOR */}
            <section className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
               <label className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.3em]">Trajectory</label>
               <div className="grid grid-cols-1 gap-2">
                  {TRAJECTORIES.map(tr => (
                    <button 
                      key={tr.id}
                      onClick={() => setActiveTrajectory(tr)}
                      className={`p-3 border text-left flex justify-between items-center transition-all rounded-sm ${activeTrajectory.id === tr.id ? 'border-yellow-500 bg-yellow-500/5' : 'border-black/5 dark:border-white/5 opacity-60'}`}
                    >
                       <div>
                          <p className="text-[10px] font-black uppercase">{tr.name}</p>
                          <p className="text-[7px] text-gray-400 uppercase italic">{(tr.desc as any)[lang] || tr.desc.en}</p>
                       </div>
                       {activeTrajectory.id === tr.id && <Check size={12} className="text-yellow-600" />}
                    </button>
                  ))}
               </div>
            </section>

            {/* RECENT JOBS */}
            <section className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
               <label className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.4em] flex items-center justify-between">
                  <span>{t('studio.recent')}</span>
                  {processingCount > 0 && <span className="text-yellow-600 animate-pulse">{processingCount} active</span>}
               </label>
               <div className="space-y-2 pb-10">
                  {tasks.length === 0 ? (
                    <p className="text-[8px] text-gray-400 italic">No active renders</p>
                  ) : (
                    tasks.slice(0, 5).map(task => (
                      <button 
                        key={task.id} 
                        onClick={() => setActiveTaskId(task.id)}
                        className={`w-full p-3 border flex items-center gap-3 transition-all rounded-sm ${activeTaskId === task.id ? 'border-yellow-500 bg-yellow-500/5' : 'border-black/5 dark:border-white/5 opacity-60'}`}
                      >
                         <div className="w-8 h-8 bg-black rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                            {task.status === 'processing' ? <Loader2 size={12} className="animate-spin text-yellow-500" /> : task.videoUrl ? <Film size={12} className="text-white" /> : <AlertCircle size={12} className="text-red-500" />}
                         </div>
                         <div className="flex-grow text-left overflow-hidden">
                            <p className="text-[9px] font-black uppercase truncate">{task.prompt}</p>
                            <div className="flex justify-between text-[7px] text-gray-400 uppercase">
                               <span>{task.trajectory} // {task.duration}s</span>
                               <span>{task.timestamp}</span>
                            </div>
                         </div>
                         {task.status === 'completed' && <Check size={10} className="text-green-500" />}
                      </button>
                    ))
                  )}
               </div>
            </section>
         </div>

         <div className="h-20 border-t border-black/5 dark:border-white/5 p-5 bg-gray-50 dark:bg-black mt-auto flex flex-col gap-1 shrink-0">
            <div className="flex-grow overflow-hidden font-mono text-[8px] text-gray-400">
               {logs.map((log, i) => <p key={i}>{log}</p>)}
            </div>
         </div>
      </aside>

      {/* 2. PRODUCTION HUB (CENTER) */}
      <main className="flex-grow flex flex-col bg-[#f0f1f3] dark:bg-[#010102] relative overflow-hidden transition-colors duration-500">
         
         <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-50 pointer-events-none">
            <div className="px-3 py-1.5 bg-white/60 dark:bg-black/60 backdrop-blur-md border border-black/10 dark:border-white/10 flex items-center gap-2 pointer-events-auto">
               <div className={`w-1.5 h-1.5 rounded-full ${processingCount > 0 ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
               <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{t('studio.status.idle')}: {processingCount > 0 ? t('studio.status.rendering') : t('studio.status.idle')}</span>
            </div>
         </div>

         <div className="flex-grow flex items-center justify-center p-8 lg:p-20 relative">
            <AnimatePresence mode="wait">
               {activeTask ? (
                  <motion.div 
                    key={activeTask.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`relative w-full max-w-5xl bg-black rounded-sm overflow-hidden shadow-2xl ${aspectRatio === '16:9' ? 'aspect-video' : 'max-w-sm aspect-[9/16]'}`}
                  >
                     {activeTask.status === 'processing' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl space-y-6">
                           <Loader2 size={60} className="text-yellow-500 animate-spin" strokeWidth={1.5} />
                           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white animate-pulse">Synthesizing Job #{activeTask.id.slice(-4)}</p>
                        </div>
                     ) : activeTask.videoUrl ? (
                        <video key={activeTask.videoUrl} src={activeTask.videoUrl} autoPlay loop muted className="w-full h-full object-cover" />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-red-500">
                           <AlertCircle size={40} />
                        </div>
                     )}
                     
                     {activeTask.status === 'completed' && (
                        <div className="absolute bottom-6 left-6 space-y-2 pointer-events-none">
                           <div className="flex gap-2">
                             <span className="text-[7px] font-black uppercase bg-yellow-500 text-black px-2 py-1 shadow-lg tracking-widest italic">ULTRA MASTER</span>
                             <span className="text-[7px] font-black uppercase bg-black text-white px-2 py-1 shadow-lg tracking-widest">{activeTask.duration.toFixed(1)}s</span>
                           </div>
                           <h2 className="text-2xl font-black uppercase text-white tracking-tighter italic">{activeTask.prompt}</h2>
                        </div>
                     )}

                     {activeTask.status === 'completed' && (
                        <div className="absolute top-6 right-6 flex flex-col gap-3">
                           <button className="p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-yellow-500 hover:text-black transition-all shadow-2xl">
                              <Share2 size={16} />
                           </button>
                           <a href={activeTask.videoUrl!} download className="p-3 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-all">
                              <Download size={16} />
                           </a>
                        </div>
                     )}
                  </motion.div>
               ) : (
                  <div className="text-center opacity-10 space-y-6">
                     <MonitorPlay size={80} strokeWidth={1} />
                     <p className="text-xs font-black uppercase tracking-[0.8em]">{t('studio.status.idle')}</p>
                  </div>
               )}
            </AnimatePresence>
         </div>

         {/* PRODUCTION HUD (BOTTOM) */}
         <div className="h-32 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#080808] px-8 lg:px-12 flex items-center justify-between z-40 transition-colors">
            <div className="flex items-center gap-10">
               <div className="hidden md:flex flex-col gap-2">
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Master Output</span>
                  <div className="flex items-center gap-3">
                     <span className="text-[11px] font-black text-yellow-600 dark:text-yellow-500 uppercase italic">{resolution} HD</span>
                     <div className="h-3 w-px bg-black/10"></div>
                     <span className="text-[9px] font-bold text-gray-400">{activeTask?.duration.toFixed(1) || selectedDuration.toFixed(1)}s Native v3.1</span>
                  </div>
               </div>
            </div>

            <div className="flex gap-3">
               {activeTask && activeTask.status === 'completed' && (
                  <button 
                    onClick={handleExtend}
                    disabled={processingCount > 0}
                    className="h-16 px-10 border border-yellow-500 text-yellow-600 dark:text-yellow-500 flex flex-col items-center justify-center gap-1 hover:bg-yellow-500 hover:text-black transition-all rounded-sm italic group"
                  >
                     <FastForward size={20} className="group-hover:translate-x-1 transition-transform" />
                     <span className="text-[7px] font-black uppercase tracking-widest">{t('studio.extend')}</span>
                  </button>
               )}
               <button 
                 onClick={handleSynthesize}
                 disabled={!firstFrame || processingCount > 0}
                 className={`group h-16 px-12 lg:px-24 flex items-center justify-center gap-3 transition-all relative overflow-hidden rounded-sm shadow-2xl ${firstFrame ? 'bg-yellow-500 text-black hover:scale-105 active:scale-95' : 'bg-black/5 dark:bg-white/5 text-gray-400'}`}
               >
                  <Zap size={18} className={processingCount > 0 ? 'animate-pulse' : ''} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('studio.render')}</span>
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
               </button>
            </div>
         </div>
      </main>

      {/* AUTH OVERLAY */}
      {needsKey && (
        <div className="absolute inset-0 z-[1000] bg-white/95 dark:bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 text-center transition-colors">
          <div className="max-w-md space-y-10 animate-in zoom-in duration-500">
            <div className="w-16 h-16 border-2 border-yellow-500 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6 text-yellow-600 dark:text-yellow-500 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Auth Required</h3>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-widest font-bold">
                Quyền truy cập Kinetic Core yêu cầu API Key từ tài khoản trả phí GCP.
              </p>
              <div className="pt-6 flex flex-col gap-4 items-center">
                <button 
                  onClick={() => { if ((window as any).aistudio) (window as any).aistudio.openSelectKey(); setNeedsKey(false); }}
                  className="py-4 px-12 bg-yellow-500 text-black text-[11px] tracking-widest font-black uppercase shadow-2xl w-full rounded-sm transition-all"
                >
                  Xác thực Pipeline
                </button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] text-gray-500 hover:text-yellow-500 transition-colors uppercase font-black tracking-widest">Google Billing <ExternalLink size={10} className="inline ml-1" /></a>
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

export default KineticWorkspace;
