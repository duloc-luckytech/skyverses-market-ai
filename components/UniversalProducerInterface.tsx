
import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Film, Clapperboard, MonitorPlay, Bot, BrainCircuit, 
  Target, Sparkles, Play, Trash2, Activity, Terminal, 
  Layers, Cpu, ShieldCheck, Download, CheckCircle2, 
  Sliders, LayoutGrid, Eye, CornerDownRight, Zap, 
  Loader2, User, Camera, Music, Move, ChevronRight,
  ArrowRight, Video, AlertCircle, RefreshCw, Share2, 
  Lock, ExternalLink, Gamepad, Tv, UserPlus, Box
} from 'lucide-react';
import { generateDemoVideo, generateDemoText, generateDemoImage } from '../services/gemini';

type Domain = 'GAME' | 'FILM' | 'ADVERTISING' | 'VIRTUAL_AVATAR';
type PipelineStage = 'IDENTITY' | 'ASSETS' | 'MOTION' | 'SCENE' | 'DOMAIN_RENDER' | 'MASTER';

interface UniversalAsset {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'LOGIC';
  label: string;
}

const UniversalProducerInterface = () => {
  const [activeDomain, setActiveDomain] = useState<Domain>('GAME');
  const [activeStage, setActiveStage] = useState<PipelineStage>('IDENTITY');
  const [isBusy, setIsBusy] = useState(false);
  const [logs, setLogs] = useState<{t: string; msg: string; agent: string}[]>([]);
  const [characterDna, setCharacterDna] = useState<{name: string, role: string, img: string | null}>({ name: 'ELARA_PRIME', role: 'Cyber-Ronin', img: null });
  const [assetLibrary, setAssetLibrary] = useState<UniversalAsset[]>([]);
  const [activeRender, setActiveRender] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!process.env.API_KEY && !hasKey) setNeedsKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setNeedsKey(false);
    }
  };

  const addLog = (agent: string, msg: string) => {
    setLogs(prev => [...prev, { t: new Date().toLocaleTimeString(), msg, agent }]);
  };

  // --- STAGE LOGIC ---

  const runStage = async (stage: PipelineStage) => {
    setIsBusy(true);
    switch(stage) {
      case 'IDENTITY':
        addLog('CONSISTENCY_AGENT', 'Initializing character DNA matrix...');
        const res = await generateDemoImage('Cyber-ronin character portrait, high-tech samurai armor, glowing purple neon elements, sharp features, white hair, cinematic lighting, ultra-high resolution.');
        if (res) {
          setCharacterDna(prev => ({ ...prev, img: res }));
          addLog('DIRECTOR', 'Identity Locked: ELARA_PRIME. Visual anchors confirmed.');
        }
        break;
      case 'ASSETS':
        addLog('PLANNER', 'Synthesizing domain-neutral equipment library...');
        const equipment = await generateDemoImage(`Full-body view of ${characterDna.name} equipment, 4-point turnaround, armor details, katana hilt, tech-pouches. Orthographic.`);
        if (equipment) {
          setAssetLibrary(prev => [{ id: 'eq1', url: equipment, type: 'IMAGE', label: 'MASTER_GEAR_SET' }, ...prev]);
          addLog('REVIEW_AGENT', 'Asset library validated for cross-domain scaling.');
        }
        break;
      case 'MOTION':
        addLog('PLANNER', 'Generating platform-agnostic behavior trees...');
        const logic = await generateDemoText(`Create 3 cinematic motion intents for ${characterDna.name} (${characterDna.role}). Include: 1. Stealth Prowl, 2. Katana Unsheathe, 3. Neural Calibration.`);
        addLog('DIRECTOR', 'Behavior blueprints compiled. Logic ready for temporal synthesis.');
        break;
      case 'DOMAIN_RENDER':
        addLog('RENDER_ORCHESTRATOR', `Synthesizing ${activeDomain} specific visual sequence...`);
        try {
          const promptMap = {
            GAME: 'Game cutscene: Cyber-ronin unsheathes katana in a futuristic rainy alley, combat-ready posture, volumetric fog, Unreal Engine 5 look.',
            FILM: 'Cinematic film shot: close up tracking ronin eyes, rain dripping off helmet, atmospheric noir lighting, anamorphic lens 35mm.',
            ADVERTISING: 'Advertising hero shot: Cyber-ronin standing on a skyscraper ledge, holding a branded luxury device, neon city lights reflecting on chrome armor, high-fashion polish.',
            VIRTUAL_AVATAR: 'Live avatar loop: cyber-ronin breathing, micro-movements, looking at camera, high-fidelity social content style.'
          };
          // Fix: generateDemoVideo expects a single VideoProductionParams object
          // Fix: Changed firstFrame to references
          const url = await generateDemoVideo({
            prompt: promptMap[activeDomain],
            references: characterDna.img ? [characterDna.img] : undefined
          });
          if (url) {
            setActiveRender(url);
            addLog('DONE', `${activeDomain} render sequence completed and verified.`);
          }
        } catch (err: any) {
           const errorStr = typeof err === 'string' ? err : JSON.stringify(err);
           if (errorStr.includes('Requested entity was not found') || errorStr.includes('404')) {
              setNeedsKey(true);
              handleSelectKey();
           }
        }
        break;
    }
    setIsBusy(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#020203] overflow-hidden text-black dark:text-white font-mono">
      
      {/* 1. DOMAIN & STAGE NAV (LEFT) */}
      <div className="w-full lg:w-[320px] shrink-0 flex flex-col bg-[#f8f8f8] dark:bg-[#080808] border-r border-black/10 dark:border-white/5 overflow-y-auto no-scrollbar">
         <div className="p-8 border-b border-black/10 dark:border-white/5 space-y-2">
            <h3 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] flex items-center gap-3">
               <Globe className="w-4 h-4" /> Global_Uplink
            </h3>
            <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest italic">AUP-X1 Synthetic Studio</p>
         </div>

         <div className="p-6 space-y-8">
            <div className="space-y-4">
               <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Active_Domain</label>
               <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'GAME', icon: <Gamepad size={12} /> },
                    { id: 'FILM', icon: <Film size={12} /> },
                    { id: 'ADVERTISING', icon: <Tv size={12} /> },
                    { id: 'VIRTUAL_AVATAR', icon: <UserPlus size={12} /> }
                  ].map(d => (
                    <button 
                      key={d.id} 
                      onClick={() => setActiveDomain(d.id as Domain)}
                      className={`flex items-center gap-3 p-3 border transition-all rounded-sm ${activeDomain === d.id ? 'bg-brand-blue border-brand-blue text-white shadow-lg' : 'bg-white dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-gray-400'}`}
                    >
                      {d.icon}
                      <span className="text-[8px] font-black">{d.id.split('_')[0]}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Pipeline_Sequence</label>
               {[
                 { id: 'IDENTITY', label: 'Character_Core', step: '01' },
                 { id: 'ASSETS', label: 'Asset_Library', step: '02' },
                 { id: 'MOTION', label: 'Behavior_Map', step: '03' },
                 { id: 'SCENE', label: 'Scene_Graph', step: '04' },
                 { id: 'DOMAIN_RENDER', label: 'Domain_Synth', step: '05' },
                 { id: 'MASTER', label: 'Final_Cut', step: '06' }
               ].map((s) => (
                 <button 
                   key={s.id} 
                   onClick={() => setActiveStage(s.id as PipelineStage)}
                   className={`w-full flex items-center justify-between p-4 border transition-all rounded-sm group ${activeStage === s.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-transparent border-black/5 dark:border-white/5 text-gray-400'}`}
                 >
                   <div className="flex flex-col items-start">
                      <span className="text-[7px] opacity-40 font-black">PHASE_{s.step}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                   </div>
                   {activeStage === s.id && <ChevronRight size={14} className="animate-pulse" />}
                 </button>
               ))}
            </div>
         </div>

         <div className="mt-auto p-6 border-t border-black/10 dark:border-white/5">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 space-y-2">
               <div className="flex items-center gap-2 text-emerald-500">
                  <ShieldCheck size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Safe_Render_Node</span>
               </div>
               <p className="text-[7px] text-gray-500 font-bold uppercase leading-relaxed">Identity pinned to H100 VPC cluster.</p>
            </div>
         </div>
      </div>

      {/* 2. PRODUCTION HUB (CENTER) */}
      <div className="flex-grow flex flex-col bg-white dark:bg-[#020202] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #0090ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="flex-grow overflow-y-auto p-8 lg:p-12 relative z-10 no-scrollbar pb-40">
           <div className="max-w-5xl mx-auto space-y-12">
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/5 pb-8">
                 <div className="flex items-center gap-4">
                    <BrainCircuit className="w-8 h-8 text-brand-blue" />
                    <div className="space-y-0.5">
                       <span className="text-[14px] font-black uppercase tracking-[0.4em] text-black dark:text-white">AUP-X1_Orchestrator</span>
                       <p className="text-[9px] font-bold text-brand-blue uppercase tracking-widest">Active_Phase: {activeStage}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-sm border border-brand-blue/20 shadow-lg">
                       <Activity size={10} className="animate-pulse text-brand-blue" />
                       <span className="text-[8px] font-black uppercase tracking-widest">Cluster_Sync: 12ms</span>
                    </div>
                 </div>
              </div>

              {/* STAGE RENDERING ENGINE */}
              <div className="min-h-[500px] flex items-center justify-center w-full">
                 {activeStage === 'IDENTITY' && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in zoom-in-95 duration-500">
                       <div className="aspect-[3/4] bg-black border border-white/10 relative group overflow-hidden shadow-2xl">
                          {characterDna.img ? (
                             <img src={characterDna.img} className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-gray-800 space-y-6">
                                <User size={64} />
                                <p className="text-[10px] font-black uppercase tracking-[0.6em]">DNA_AWAITING</p>
                             </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                       </div>
                       <div className="flex flex-col justify-center space-y-10">
                          <div className="space-y-6">
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Character_Designation</label>
                                <p className="text-4xl font-black text-brand-blue italic">{characterDna.name}</p>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Archetype_Profile</label>
                                <p className="text-xl font-bold uppercase">{characterDna.role}</p>
                             </div>
                          </div>
                          <button onClick={() => runStage('IDENTITY')} disabled={isBusy} className="btn-sky-primary py-6 px-12 text-[11px] w-fit flex items-center gap-4">
                             {isBusy ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                             Initialize_Universal_Identity
                          </button>
                       </div>
                    </div>
                 )}

                 {activeStage === 'DOMAIN_RENDER' && (
                    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                       <div className="aspect-video bg-black border-4 border-brand-blue/20 shadow-2xl relative overflow-hidden group">
                          {activeRender ? (
                             <video key={activeRender} src={activeRender} autoPlay loop muted className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-gray-800 space-y-6">
                                <MonitorPlay size={80} />
                                <p className="text-[14px] font-black uppercase tracking-[0.8em]">Viewport_Standby</p>
                             </div>
                          )}
                          <div className="absolute top-6 left-6 px-4 py-2 bg-brand-blue text-white text-[9px] font-black uppercase tracking-widest shadow-xl border border-white/20 backdrop-blur-md">
                             ADAPTER_{activeDomain}_ACTIVE
                          </div>
                       </div>
                       <div className="flex flex-col items-center gap-8">
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em] max-w-xl text-center leading-loose">
                             Generating cinematic sequence for {activeDomain} targets. Character DNA ELARA_PRIME injected into temporal logic gates.
                          </p>
                          <div className="flex gap-6">
                             <button onClick={() => runStage('DOMAIN_RENDER')} disabled={isBusy} className="btn-sky-primary py-6 px-24 text-[11px] flex items-center gap-4">
                                {isBusy ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap size={16} fill="currentColor" />}
                                Start_{activeDomain}_Synthesis
                             </button>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeStage !== 'IDENTITY' && activeStage !== 'DOMAIN_RENDER' && (
                    <div className="text-center space-y-8 opacity-40">
                       <Box size={80} className="mx-auto text-gray-400" />
                       <p className="text-[12px] font-black uppercase tracking-[0.8em]">Stage_Logic_Loading...</p>
                       <button onClick={() => runStage(activeStage)} disabled={isBusy} className="btn-sky-secondary py-4 px-12 text-[10px]">Manual_Trigger_Alpha</button>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* PRODUCTION HUD (BOTTOM) */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#fafafa] dark:bg-black border-t border-black/10 dark:border-white/5 p-6 lg:p-10 flex items-center justify-between z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
           <div className="hidden lg:flex items-center gap-12">
              <div className="flex items-center gap-6">
                 {['IDENTITY', 'ASSETS', 'MOTION', 'DOMAIN', 'MASTER'].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${activeStage === step ? 'bg-brand-blue animate-pulse' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                       <span className={`text-[8px] font-black uppercase tracking-widest ${activeStage === step ? 'text-brand-blue' : 'text-gray-400'}`}>{step}</span>
                    </div>
                 ))}
              </div>
              <div className="h-10 w-px bg-black/5 dark:bg-white/5 mx-4"></div>
              <div className="space-y-1">
                 <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">System_Security</p>
                 <div className="flex items-center gap-2 text-green-500">
                    <Lock size={10} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Private_Node_Stable</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-6 w-full lg:w-auto">
              <button 
                onClick={() => {setActiveStage('IDENTITY'); setCharacterDna({name: 'ELARA_PRIME', role: 'Cyber-Ronin', img: null}); setLogs([])}}
                className="p-5 border border-black/10 dark:border-white/10 text-gray-400 hover:text-red-500 transition-all active:scale-95 disabled:opacity-20"
              >
                <Trash2 size={20} />
              </button>
              <button 
                className="flex-grow lg:flex-none bg-brand-blue text-white px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl active:scale-[0.98] rounded-sm"
              >
                EXPORT_UNIVERSAL_MANIFEST <Download size={16} />
              </button>
           </div>
        </div>
      </div>

      {/* 3. MULTI-AGENT LOG (RIGHT) */}
      <div className="hidden xl:flex w-[400px] shrink-0 flex flex-col bg-[#fdfdfd] dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-hidden">
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
               <Activity className="w-4 h-4 text-brand-blue" /> Orchestration_Log
            </h3>
         </div>
         <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar pb-32">
            {logs.length === 0 ? (
               <div className="py-24 text-center opacity-10">
                  <Cpu className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest italic">Awaiting Agent Uplink</p>
               </div>
            ) : (
               logs.map((log, i) => (
                  <div key={i} className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400">
                        <span className={`px-2 py-0.5 rounded-sm bg-black/5 dark:bg-white/5 ${log.agent === 'DIRECTOR' ? 'text-brand-blue' : 'text-gray-500'}`}>{log.agent}</span>
                        <span>{log.t}</span>
                     </div>
                     <p className="text-[10px] leading-relaxed text-black dark:text-white/80 font-bold uppercase tracking-tight">
                        <CornerDownRight size={10} className="inline mr-2 text-brand-blue" />
                        {log.msg}
                     </p>
                  </div>
               ))
            )}
            {isBusy && (
               <div className="flex items-center gap-4 text-brand-blue animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-blue"></div>
                  <span className="text-[9px] font-black uppercase">Agents reasoning...</span>
               </div>
            )}
         </div>
      </div>

      {needsKey && (
        <div className="absolute inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 border border-brand-blue mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8 text-brand-blue animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Auth Required</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
                Universal synthesis requires an authorized paid production API key.
              </p>
              <div className="pt-6 flex flex-col gap-4">
                <button onClick={handleSelectKey} className="btn-sky-primary py-4 px-10 text-[10px] tracking-widest uppercase">Connect Paid Key</button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] text-gray-600 hover:text-brand-blue flex items-center justify-center gap-2 font-black uppercase">GCP Billing Docs <ExternalLink className="w-3 h-3" /></a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalProducerInterface;
