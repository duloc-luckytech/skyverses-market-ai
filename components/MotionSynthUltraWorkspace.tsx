
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Download, Zap, Share2, Loader2, Play, Film, 
  Terminal, Activity, ShieldCheck, Clapperboard, 
  Lock, ExternalLink, Camera, Settings2, Sliders, 
  LayoutGrid, Trash2, Box, Info, FastForward,
  MonitorPlay, Maximize2, Plus, Fingerprint, Crown,
  ArrowRight, CornerDownRight, Square, RotateCcw,
  CheckCircle2, AlertTriangle, Cpu, Database,
  History as HistoryIcon
} from 'lucide-react';
import { generateDemoVideo, VideoProductionParams } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';

const MotionSynthUltraWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  
  // Studio States
  const [activeTab, setActiveTab] = useState<'DIRECTIVES' | 'DNA' | 'PHYSICS' | 'COMPUTE'>('DIRECTIVES');
  const [logs, setLogs] = useState<{t: string, msg: string, type: 'info' | 'warn' | 'success'}[]>([
    { t: new Date().toLocaleTimeString(), msg: 'VEO_ENGINE_ULTRA_V3 initialized.', type: 'info' },
    { t: new Date().toLocaleTimeString(), msg: 'Node H100 sync established.', type: 'success' }
  ]);

  // Parameters
  const [prompt, setPrompt] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [cameraMotion, setCameraMotion] = useState('Dolly In');
  const [motionBucket, setMotionBucket] = useState(128);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [needsKey, setNeedsKey] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
  }, [logs]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'success' = 'info') => {
    setLogs(prev => [...prev, { t: new Date().toLocaleTimeString(), msg, type }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (references.length >= 3) return;
        setReferences(prev => [...prev, reader.result as string]);
        addLog(`Reference asset [${references.length + 1}] locked.`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesis = async () => {
    if (isGenerating || !prompt.trim()) return;
    
    setIsGenerating(true);
    setResultVideo(null);
    addLog('Injecting semantic directives...', 'info');
    addLog('Synthesizing temporal lattice...', 'info');

    try {
      const params: VideoProductionParams = {
        prompt: `Directing: ${prompt}. Camera: ${cameraMotion}. Motion intensity: ${motionBucket}. Cinematic high-fidelity, 1080p.`,
        resolution: '1080p',
        isUltra: true,
        references
      };

      const url = await generateDemoVideo(params);
      if (url) {
        setResultVideo(url);
        setHistory(prev => [{ url, prompt, timestamp: new Date().toLocaleTimeString() }, ...prev]);
        addLog('Synthesis cycle complete. Manifest generated.', 'success');
      }
    } catch (err: any) {
      addLog('Critical synthesis error detected.', 'warn');
      if (err?.message?.includes("Requested entity was not found")) setNeedsKey(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#050505] text-white font-mono overflow-hidden relative selection:bg-yellow-500/30">
      
      {/* 1. LEFT SIDE: DIRECTIVES & DNA */}
      <aside className="w-[450px] shrink-0 h-full flex flex-col border-r border-white/5 bg-[#080808] z-50">
        <div className="p-8 flex items-center justify-between border-b border-white/5">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500 text-black rounded-sm shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                 <Crown size={18} />
              </div>
              <div className="space-y-0.5">
                 <h2 className="text-xs font-black uppercase tracking-[0.4em] text-yellow-500">Ultra Studio</h2>
                 <p className="text-[14px] font-black uppercase italic tracking-tighter">VEO_DIRECTOR_v3</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
              <X size={24} />
           </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 border-b border-white/5 bg-black/40">
           {(['DIRECTIVES', 'DNA', 'PHYSICS', 'COMPUTE'] as const).map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab)}
               className={`py-4 text-[8px] font-black uppercase tracking-widest border-r border-white/5 transition-all ${activeTab === tab ? 'text-yellow-500 bg-yellow-500/5' : 'text-gray-600 hover:text-white'}`}
             >
                {tab}
             </button>
           ))}
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar p-8">
           <AnimatePresence mode="wait">
              {activeTab === 'DIRECTIVES' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Terminal size={14} className="text-yellow-500" /> Semantic Payload
                      </label>
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-48 p-6 bg-black border border-white/10 rounded-sm text-sm font-bold focus:outline-none focus:border-yellow-500 transition-all uppercase tracking-tighter shadow-inner text-yellow-500/90"
                        placeholder="Direct narrative intent..."
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Camera size={14} className="text-yellow-500" /> Virtual Trajectory
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Dolly In', 'Orbit Right', 'Crane Down', 'Pan Left', 'Static Master', 'Dynamic Zoom'].map(m => (
                           <button 
                             key={m} 
                             onClick={() => setCameraMotion(m)}
                             className={`py-3 text-[9px] font-black uppercase border transition-all ${cameraMotion === m ? 'bg-yellow-500 text-black border-yellow-500' : 'border-white/5 text-gray-600 hover:text-white'}`}
                           >
                              {m}
                           </button>
                        ))}
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'DNA' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2">
                            <Fingerprint size={14} className="text-yellow-500" /> Identity Anchors
                         </label>
                         <span className="text-[8px] text-yellow-500/40">{references.length}/3 locked</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                         {references.map((ref, idx) => (
                           <div key={idx} className="relative aspect-square border border-yellow-500/20 bg-black group rounded-sm overflow-hidden shadow-2xl">
                              <img src={ref} className="w-full h-full object-cover grayscale" />
                              <button onClick={() => setReferences(prev => prev.filter((_, i) => i !== idx))} className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                 <Trash2 size={16} />
                              </button>
                           </div>
                         ))}
                         {references.length < 3 && (
                           <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="aspect-square border border-dashed border-white/10 hover:border-yellow-500 flex flex-col items-center justify-center gap-2 transition-all group"
                           >
                              <Plus size={20} className="text-gray-600 group-hover:text-yellow-500" />
                              <span className="text-[7px] font-black uppercase text-gray-700">Add Ref</span>
                           </button>
                         )}
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                      <p className="text-[8px] text-gray-600 leading-relaxed uppercase tracking-widest italic">
                        * Multi-reference pinning allows for 100% actor and environment consistency.
                      </p>
                   </div>
                </motion.div>
              )}

              {activeTab === 'PHYSICS' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                   <div className="space-y-6">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Sliders size={14} className="text-yellow-500" /> Temporal Control
                      </label>
                      <div className="space-y-6">
                         <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase">
                               <span className="text-gray-400">Motion Strength</span>
                               <span className="text-yellow-500">{motionBucket}</span>
                            </div>
                            <input 
                              type="range" min="64" max="255" value={motionBucket}
                              onChange={(e) => setMotionBucket(parseInt(e.target.value))}
                              className="w-full h-1 bg-white/5 appearance-none rounded-full accent-yellow-500"
                            />
                         </div>
                         <div className="p-5 border border-yellow-500/10 bg-yellow-500/5 space-y-4">
                            <div className="flex items-center gap-2 text-yellow-500">
                               <ShieldCheck size={14} />
                               <span className="text-[9px] font-black uppercase">Flicker_Shield_Active</span>
                            </div>
                            <p className="text-[8px] text-gray-500 leading-relaxed uppercase">Neural temporal smoothing enabled. Zero-artifact output prioritization.</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'COMPUTE' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Cpu size={14} className="text-yellow-500" /> Infrastructure
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                         {[
                           { label: 'Cluster', val: 'H100_ULTRA_042' },
                           { label: 'Memory', val: '80GB_VRAM' },
                           { label: 'Latency', val: '24ms' },
                           { label: 'Modality', val: 'TEXT_TO_MOTION_S' }
                         ].map(item => (
                           <div key={item.label} className="p-4 bg-white/[0.02] border border-white/5 flex justify-between items-center">
                              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{item.label}</span>
                              <span className="text-[10px] font-black text-yellow-500 italic">{item.val}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* LOG CONSOLE (BOTTOM LEFT) */}
        <div className="h-48 border-t border-white/5 p-6 bg-black flex flex-col gap-3">
           <div className="flex justify-between items-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Node_Telemetry</span>
              <div className="flex gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>
           </div>
           <div ref={logContainerRef} className="flex-grow overflow-y-auto font-mono text-[9px] no-scrollbar space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                   <span className="text-gray-700">[{log.t}]</span>
                   <span className={log.type === 'success' ? 'text-green-500' : log.type === 'warn' ? 'text-yellow-500' : 'text-gray-400'}>
                      {log.type === 'success' ? '✔' : log.type === 'warn' ? '!!' : '>'} {log.msg}
                   </span>
                </div>
              ))}
           </div>
        </div>
      </aside>

      {/* 2. CENTER: THE VIEWPORT */}
      <main className="flex-grow flex flex-col bg-[#020202] relative overflow-hidden">
        {/* VIEWPORT OVERLAY HUD */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-40 pointer-events-none">
           <div className="flex items-center gap-6">
              <div className="flex flex-col">
                 <span className="text-[12px] font-black uppercase tracking-[0.4em] italic text-yellow-500">VEO_ULTRA_VIEWPORT</span>
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black text-white/40 uppercase">Broadcast: 1080p // 24FPS</span>
                 </div>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-3">
                 <Activity size={12} className="text-yellow-500 animate-pulse" />
                 <span className="text-[8px] font-black text-white/60 tracking-widest uppercase">Sync: ACTIVE</span>
              </div>
           </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center p-12 lg:p-24 relative">
          <AnimatePresence mode="wait">
            {!resultVideo && !isGenerating ? (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-12">
                 <div className="w-32 h-32 border-2 border-dashed border-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                    <MonitorPlay size={64} className="text-yellow-500/20" />
                 </div>
                 <p className="text-[12px] font-black uppercase tracking-[0.8em] text-gray-700 animate-pulse">Waiting_For_Director_Instruction</p>
              </motion.div>
            ) : isGenerating ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-16">
                 <div className="relative">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-[100px] rounded-full animate-pulse scale-150"></div>
                    <Loader2 size={120} className="text-yellow-500 animate-spin" strokeWidth={1.5} />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Zap size={40} className="text-yellow-500 animate-pulse" />
                    </div>
                 </div>
                 <div className="space-y-6 text-center">
                    <h3 className="text-4xl font-black uppercase tracking-[0.5em] italic text-white leading-none">Synthesizing</h3>
                    <div className="flex gap-2 justify-center">
                       {Array.from({length: 6}).map((_, i) => (
                         <div key={i} className="w-16 h-0.5 bg-yellow-500/10 overflow-hidden">
                            <div className="h-full bg-yellow-500 animate-[progress_2s_infinite_linear]" style={{ animationDelay: `${i*0.3}s` }}></div>
                         </div>
                       ))}
                    </div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Temporal_Interpolation_Node // GPU_CLUSTER_A</p>
                 </div>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group w-full max-w-7xl shadow-[0_60px_150px_rgba(0,0,0,1)] border border-white/5 rounded-sm overflow-hidden bg-black aspect-video">
                 <video key={resultVideo} src={resultVideo!} autoPlay loop muted className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                 
                 <div className="absolute bottom-10 left-10 space-y-4">
                    <div className="flex gap-3">
                       <span className="bg-yellow-500 text-black px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl flex items-center gap-3 italic">
                          <Film size={12} /> Master_Take_Ultra
                       </span>
                    </div>
                    <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none text-white">VEO_SYNTH_042</h2>
                 </div>

                 <div className="absolute top-10 right-10 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button className="p-5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full hover:bg-yellow-500 hover:text-black transition-all shadow-2xl">
                       <Share2 size={24} />
                    </button>
                    <a href={resultVideo!} download className="p-5 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
                       <Download size={24} />
                    </a>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TIMELINE / HISTORY HUB */}
        <div className="h-48 border-t border-white/5 bg-[#080808] p-8 flex items-center justify-between z-40 shadow-2xl">
           <div className="flex items-center gap-12">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <HistoryIcon size={16} className="text-gray-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">Vault_Explorer</span>
                 </div>
                 <div className="flex gap-4">
                    {history.map((h, i) => (
                      <button 
                        key={i} onClick={() => setResultVideo(h.url)}
                        className={`w-20 h-20 border-2 transition-all overflow-hidden relative group/thumb ${resultVideo === h.url ? 'border-yellow-500 scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-white/5 opacity-30 hover:opacity-100'}`}
                      >
                         <video src={h.url} className="w-full h-full object-cover" muted />
                         <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover/thumb:opacity-100 transition-opacity"></div>
                      </button>
                    ))}
                    {history.length < 4 && Array.from({length: 4 - history.length}).map((_, i) => (
                       <div key={i} className="w-20 h-20 border border-white/5 bg-white/[0.01] rounded-sm flex items-center justify-center opacity-5">
                          <Film size={20} />
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="flex gap-6 items-center">
              {resultVideo && (
                 <button className="h-24 px-12 border border-yellow-500/20 text-yellow-500/60 hover:text-yellow-500 hover:bg-yellow-500/5 transition-all flex flex-col items-center justify-center gap-2 group">
                    <FastForward size={24} className="group-hover:translate-x-1 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Extend +7s</span>
                 </button>
              )}
              <button 
                onClick={handleSynthesis}
                disabled={isGenerating || !prompt.trim()}
                className={`h-24 px-20 lg:px-40 flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden group shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-sm ${prompt.trim() ? 'bg-yellow-500 text-black hover:scale-105 active:scale-95' : 'bg-white/5 text-gray-800'}`}
              >
                 <Zap size={28} fill="currentColor" className={isGenerating ? 'animate-pulse' : ''} />
                 <span className="text-[11px] font-black uppercase tracking-[0.6em]">{isGenerating ? 'Synthesizing' : 'Launch Master Synth'}</span>
                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
           </div>
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR: DNA INSPECTOR */}
      <aside className="hidden xl:flex w-[350px] shrink-0 flex flex-col bg-[#080808] border-l border-white/5">
         <div className="h-16 border-b border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
               <Database className="w-4 h-4 text-yellow-500" /> DNA_Inspector
            </h3>
         </div>
         <div className="flex-grow p-8 space-y-12 overflow-y-auto no-scrollbar">
            <div className="space-y-6">
               <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest italic">Identity_Consistency</label>
               <div className="aspect-[3/4] bg-black border border-white/5 p-8 flex flex-col justify-between relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Fingerprint size={120} />
                  </div>
                  <div className="relative z-10 flex justify-between items-start">
                     <Lock size={20} className="text-yellow-500" />
                     <span className="text-[9px] font-black text-gray-700">HASH: VEO_992_X</span>
                  </div>
                  <div className="relative z-10 space-y-4">
                     <p className="text-5xl font-black italic">99.9%</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Parity Stability</p>
                     <div className="h-[1px] w-full bg-white/10"></div>
                     <p className="text-[9px] text-gray-500 uppercase leading-relaxed font-bold">Identity locked across sequence lattice. Zero-drift logic active.</p>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest italic">Output_Metric</label>
               <div className="space-y-4">
                  {[
                    { l: 'Bitrate', v: '45Mbps' },
                    { l: 'Sampling', v: 'High' },
                    { l: 'Coherence', v: 'Optimal' }
                  ].map(stat => (
                    <div key={stat.l} className="flex justify-between items-center border-b border-white/5 pb-3">
                       <span className="text-[9px] font-black text-gray-600 uppercase">{stat.l}</span>
                       <span className="text-[10px] font-black text-white">{stat.v}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
         <div className="p-8 border-t border-white/5">
            <button className="w-full py-5 bg-white/5 border border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-yellow-500 transition-all">Export_Studio_Logs</button>
         </div>
      </aside>

      {/* AUTH OVERLAY */}
      {needsKey && (
        <div className="absolute inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-12 animate-in zoom-in duration-500">
            <div className="w-24 h-24 border-2 border-yellow-500 mx-auto flex items-center justify-center shadow-2xl shadow-yellow-500/20">
              <Lock className="w-10 h-10 text-yellow-500 animate-pulse" />
            </div>
            <div className="space-y-6">
              <h3 className="text-4xl font-black uppercase tracking-tighter italic">Studio_Lock</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
                Quyền truy cập Ultra Pro yêu cầu xác thực API Key từ dự án **PAID** GCP để khởi chạy H100 Node.
              </p>
              <div className="pt-10 flex flex-col gap-6 items-center">
                <button 
                  onClick={() => { if ((window as any).aistudio) (window as any).aistudio.openSelectKey(); setNeedsKey(false); }}
                  className="py-6 px-16 bg-yellow-500 text-black text-[12px] tracking-[0.3em] font-black uppercase shadow-2xl w-full"
                >
                  Xác thực Pipeline Key
                </button>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  className="text-[10px] text-gray-600 hover:text-yellow-500 transition-colors uppercase font-black tracking-widest"
                >
                  Tài liệu Billing Google <ExternalLink className="w-3 h-3 inline ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eab308; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default MotionSynthUltraWorkspace;
