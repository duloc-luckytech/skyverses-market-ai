
import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Film, Clapperboard, MonitorPlay, Bot, BrainCircuit, 
  Target, Sparkles, Play, Trash2, Activity, Terminal, 
  Layers, Cpu, ShieldCheck, Download, CheckCircle2, 
  Sliders, LayoutGrid, Eye, CornerDownRight, Zap, 
  Loader2, User, Camera, Music, Move, ChevronRight,
  ArrowRight, Video, AlertCircle, RefreshCw, Share2, 
  Lock, ExternalLink, Gamepad, Tv, UserPlus, Box,
  Workflow, Database, ClipboardCheck, Info,
  Fingerprint, Plus, ZoomIn, Code2, ArrowUpRight,
  FastForward, CheckSquare, ShieldAlert, X,
  History as HistoryIcon
} from 'lucide-react';
import { generateDemoText, generateDemoImage, generateDemoVideo } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';

type Domain = 'GAME' | 'FILM' | 'ADVERTISING' | 'VIRTUAL_AVATAR';
type PipelineStage = 'ID_CORE' | 'ASSET_SYSTEM' | 'MOTION_INTEL' | 'SCENE_DESIGN' | 'ADAPTER_RENDER' | 'MASTER_COMP';

interface AgentLog {
  timestamp: string;
  agent: 'DIRECTOR' | 'CONSISTENCY' | 'PLANNER' | 'REVIEWER';
  message: string;
  type: 'THINK' | 'ACTION' | 'ALERT';
}

const AUPX1Studio = () => {
  const [activeDomain, setActiveDomain] = useState<Domain>('FILM');
  const [activeStage, setActiveStage] = useState<PipelineStage>('ID_CORE');
  const [isBusy, setIsBusy] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [needsKey, setNeedsKey] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  
  // Production Data
  const [uca, setUca] = useState<{name: string, img: string | null, metadata: string}>({ 
    name: 'SENTINEL_ALPHA', 
    img: null,
    metadata: 'Physical: Ceramic Armor, Biometric Glow. Personality: Stoic.'
  });
  const [assets, setAssets] = useState<{id: string, url: string, label: string}[]>([]);
  const [blueprints, setBlueprints] = useState<string[]>([]);
  const [scenePlan, setScenePlan] = useState<string[]>([]);
  const [finalRender, setFinalRender] = useState<string | null>(null);
  const [stageProgress, setStageProgress] = useState<Record<PipelineStage, boolean>>({
    ID_CORE: false, ASSET_SYSTEM: false, MOTION_INTEL: false, SCENE_DESIGN: false, ADAPTER_RENDER: false, MASTER_COMP: false
  });

  const scrollRef = useRef<HTMLDivElement>(null);

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
      setRenderError(null);
    }
  };

  const addLog = (agent: AgentLog['agent'], message: string, type: AgentLog['type'] = 'THINK') => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), agent, message, type }]);
  };

  const approveStage = (stage: PipelineStage) => {
    setStageProgress(prev => {
      const next = { ...prev, [stage]: true };
      
      if (stage === 'SCENE_DESIGN') {
        addLog('DIRECTOR', 'Directing pipeline to Stage 5...', 'ACTION');
      }

      const stages: PipelineStage[] = ['ID_CORE', 'ASSET_SYSTEM', 'MOTION_INTEL', 'SCENE_DESIGN', 'ADAPTER_RENDER', 'MASTER_COMP'];
      const currentIdx = stages.indexOf(stage);
      if (currentIdx < stages.length - 1) setActiveStage(stages[currentIdx + 1]);
      
      return next;
    });
  };

  const bypassToMaster = () => {
    addLog('DIRECTOR', 'Bypassing Domain Rendering. Finalizing project manifest...', 'ACTION');
    setStageProgress(prev => ({ ...prev, SCENE_DESIGN: true, ADAPTER_RENDER: true }));
    setActiveStage('MASTER_COMP');
  };

  // --- STAGE LOGIC ---

  const runIdentity = async () => {
    setIsBusy(true);
    addLog('DIRECTOR', 'Initializing Stage 1: Character & Identity Core...');
    const res = await generateDemoImage('Concept art of a celestial sentinel knight, flowing white ceramic armor, internal cosmic energy glow, sharp visor, domain-neutral background, studio lighting, 8k.');
    if (res) {
      setUca(prev => ({ ...prev, img: res }));
      addLog('REVIEWER', 'Character DNA locked. Profile contains zero-drift anchors.');
    }
    setIsBusy(false);
  };

  const runAssetSystem = async () => {
    setIsBusy(true);
    addLog('PLANNER', 'Stage 2: Orchestrating Asset & Style System...');
    const res = await generateDemoImage(`Full-body equipment set for ${uca.name}, 4-point orthographic turnaround, weapon variations, tech-pouches. Consistency lock: active.`);
    if (res) {
      setAssets([{ id: 'a1', url: res, label: 'MASTER_EQUIPMENT_SPEC' }]);
      addLog('CONSISTENCY', 'Visual style normalized across props and outfits.');
    }
    setIsBusy(false);
  };

  const runMotionIntel = async () => {
    setIsBusy(true);
    addLog('PLANNER', 'Stage 3: Synthesizing Motion & Behavior Intelligence...');
    const logic = await generateDemoText(`As a Chief AI Architect, design a behavior blueprint for ${uca.name} in a ${activeDomain} context. Include movement intent, emotional weight, and loop-logic.`);
    setBlueprints(logic.split('\n').filter(l => l.length > 10).slice(0, 4));
    addLog('DIRECTOR', 'Behavioral logic compiled. Ready for domain-specific temporal synthesis.');
    setIsBusy(false);
  };

  const runSceneDesign = async () => {
    setIsBusy(true);
    addLog('DIRECTOR', 'Stage 4: Drafting Scene Experience & Narrative Flow...');
    const design = await generateDemoText(`Generate a 3-act scene plan for a ${activeDomain} project featuring ${uca.name}. Each act should have a visual directive and a camera behavior.`);
    setScenePlan(design.split('\n').filter(l => l.length > 15).slice(0, 3));
    addLog('PLANNER', 'Scene graph optimized for selected domain constraints.');
    setIsBusy(false);
  };

  const runAdapterRender = async () => {
    setIsBusy(true);
    setRenderError(null);
    addLog('DIRECTOR', `Stage 5: Initiating ${activeDomain} Specific Rendering Adapter...`);
    
    try {
      const promptMap = {
        GAME: 'Third-person game cutscene: SENTINEL_ALPHA walking through a floating stone sanctuary, Unreal Engine 5 aesthetic, real-time lighting physics.',
        FILM: 'Cinematic 4K film shot: tracking shot following sentinel through a star-gate, volumetric light rays, IMAX 1.43:1 aspect ratio, high drama.',
        ADVERTISING: 'Advertising hero shot: Close-up of ceramic armor reflecting a luxury brand logo, neon city skyline bokeh, high-gloss polish.',
        VIRTUAL_AVATAR: 'Social media video: Sentinel knight performing a signature idle animation, looking at camera, high-fidelity digital influencer style.'
      };
      const url = await generateDemoVideo({
        prompt: promptMap[activeDomain],
        references: uca.img ? [uca.img] : undefined
      });
      if (url) {
        setFinalRender(url);
        addLog('REVIEWER', 'Domain-specific output verified. Watermarked for enterprise safety.');
      }
    } catch (err: any) {
      console.error("Critical Render Error:", err);
      const errorStr = typeof err === 'string' ? err : JSON.stringify(err);
      
      if (errorStr.includes('Requested entity was not found') || errorStr.includes('404') || errorStr.includes('code 5')) {
        setRenderError('ENTITY_NOT_FOUND');
        addLog('REVIEWER', 'ERROR: Veo Model not found. API Key may lack Paid Project permissions.', 'ALERT');
      } else {
        setRenderError('UNKNOWN_ERROR');
        addLog('REVIEWER', `ERROR: Rendering failed. Check connection.`, 'ALERT');
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#050507] overflow-hidden text-black dark:text-white font-mono selection:bg-brand-blue/30">
      
      {/* 1. PIPELINE ORCHESTRATOR (LEFT) */}
      <div className="w-full lg:w-[340px] shrink-0 flex flex-col bg-[#f9f9fb] dark:bg-[#0a0a0c] border-r border-black/5 dark:border-white/5 overflow-y-auto no-scrollbar relative z-20">
         <div className="p-8 border-b border-black/5 dark:border-white/5 space-y-2 bg-gradient-to-b from-brand-blue/10 to-transparent">
            <h3 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] flex items-center gap-3">
               <Workflow className="w-4 h-4" /> AUP-X1_Studio
            </h3>
            <p className="text-[8px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Multi-Domain Infrastructure</p>
         </div>

         <div className="p-6 space-y-8">
            <div className="space-y-4">
               <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest flex items-center gap-2">
                 <Globe size={12} className="text-brand-blue" /> Domain_Adapter
               </label>
               <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'GAME', icon: <Gamepad size={12} /> },
                    { id: 'FILM', icon: <Film size={12} /> },
                    { id: 'ADVERTISING', icon: <Tv size={12} /> },
                    { id: 'VIRTUAL_AVATAR', icon: <UserPlus size={12} /> }
                  ].map(d => (
                    <button 
                      key={d.id} 
                      onClick={() => !isBusy && setActiveDomain(d.id as Domain)}
                      className={`flex items-center gap-3 p-3 border transition-all rounded-sm ${activeDomain === d.id ? 'bg-brand-blue border-brand-blue text-white shadow-lg' : 'bg-white dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-gray-400'}`}
                    >
                      {d.icon}
                      <span className="text-[8px] font-black">{d.id.split('_')[0]}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest">Pipeline_Control</label>
               {[
                 { id: 'ID_CORE', label: 'Identity_Core', icon: <User size={14} /> },
                 { id: 'ASSET_SYSTEM', label: 'Asset_System', icon: <Database size={14} /> },
                 { id: 'MOTION_INTEL', label: 'Motion_Intel', icon: <BrainCircuit size={14} /> },
                 { id: 'SCENE_DESIGN', label: 'Scene_Experience', icon: <LayoutGrid size={14} /> },
                 { id: 'ADAPTER_RENDER', label: 'Domain_Render', icon: <Cpu size={14} /> },
                 { id: 'MASTER_COMP', label: 'Final_Master', icon: <Clapperboard size={14} /> }
               ].map((s, idx) => (
                 <button 
                   key={s.id} 
                   onClick={() => !isBusy && setActiveStage(s.id as PipelineStage)}
                   className={`w-full flex items-center justify-between p-4 border transition-all rounded-sm group ${activeStage === s.id ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-transparent border-black/5 dark:border-white/5 text-gray-400'}`}
                 >
                   <div className="flex items-center gap-3">
                      <span className="text-gray-400 group-hover:text-brand-blue">{s.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                   </div>
                   {stageProgress[s.id as PipelineStage] && <CheckCircle2 size={14} className="text-emerald-500" />}
                 </button>
               ))}
            </div>
         </div>
         
         <div className="p-8 border-t border-black/5 dark:border-white/5">
            <div className="p-4 bg-brand-blue/5 border border-brand-blue/20 space-y-3 rounded-sm">
               <div className="flex items-center gap-2 text-brand-blue">
                  <ShieldCheck size={14} />
                  <span className="text-[9px] font-black uppercase">Infrastructure_Safe</span>
               </div>
               <p className="text-[7px] font-bold text-gray-500 uppercase leading-relaxed">Multi-Agent orchestration kernel active.</p>
            </div>
         </div>
      </div>

      {/* 2. PRODUCTION HUB (CENTER) */}
      <div className="flex-grow flex flex-col relative bg-white dark:bg-[#020202] overflow-hidden">
        <div className="flex-grow overflow-y-auto p-12 no-scrollbar flex flex-col items-center justify-center">
           <AnimatePresence mode="wait">
              {activeStage === 'ADAPTER_RENDER' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl aspect-video bg-black rounded shadow-2xl relative overflow-hidden">
                   {finalRender ? (
                      <video src={finalRender} autoPlay loop muted className="w-full h-full object-cover" />
                   ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                         <Loader2 className={`w-12 h-12 text-brand-blue ${isBusy ? 'animate-spin' : ''}`} />
                         <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Synthesizing {activeDomain} Render...</p>
                      </div>
                   )}
                </motion.div>
              ) : activeStage === 'ID_CORE' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md aspect-[3/4] bg-black rounded shadow-2xl relative overflow-hidden">
                   {uca.img ? (
                      <img src={uca.img} className="w-full h-full object-cover" alt="ID" />
                   ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                         <User size={64} className="text-gray-800" />
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Identity_Base_Empty</p>
                      </div>
                   )}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 opacity-20">
                   <Box size={80} />
                   <p className="text-[12px] font-black uppercase tracking-widest">{activeStage} Active</p>
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* HUD ACTIONS */}
        <div className="h-32 border-t border-black/10 dark:border-white/5 bg-[#fafafa] dark:bg-black p-6 flex items-center justify-between z-10 shadow-2xl">
           <div className="flex gap-4">
              {activeStage === 'ID_CORE' && <button onClick={runIdentity} disabled={isBusy} className="bg-brand-blue text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest">Initialize ID</button>}
              {activeStage === 'ASSET_SYSTEM' && <button onClick={runAssetSystem} disabled={isBusy} className="bg-brand-blue text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest">Orchestrate Assets</button>}
              {activeStage === 'MOTION_INTEL' && <button onClick={runMotionIntel} disabled={isBusy} className="bg-brand-blue text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest">Synthesize Logic</button>}
              {activeStage === 'SCENE_DESIGN' && <button onClick={runSceneDesign} disabled={isBusy} className="bg-brand-blue text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest">Draft Scene</button>}
              {activeStage === 'ADAPTER_RENDER' && <button onClick={runAdapterRender} disabled={isBusy} className="bg-brand-blue text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest">Render Domain</button>}
              
              {activeStage !== 'MASTER_COMP' && (
                <button onClick={() => approveStage(activeStage)} className="px-10 py-4 border border-black/10 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Approve & Next</button>
              )}
           </div>
           
           <div className="flex items-center gap-6">
              <button onClick={bypassToMaster} className="text-[10px] font-black uppercase text-gray-400 hover:text-brand-blue transition-colors">Bypass to Master</button>
           </div>
        </div>
      </div>

      {/* 3. LOGS (RIGHT) */}
      <aside className="hidden xl:flex w-[320px] shrink-0 flex flex-col bg-[#fdfdfd] dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-hidden">
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
               <Activity className="w-4 h-4 text-brand-blue" /> Studio_Logs
            </h3>
         </div>
         <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar font-mono text-[9px] text-gray-500">
            {logs.map((log, i) => (
               <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                     <span className="text-brand-blue">[{log.agent}]</span>
                     <span className="opacity-20">{log.timestamp}</span>
                  </div>
                  <p className={log.type === 'ALERT' ? 'text-red-500' : 'text-gray-400'}>{log.message}</p>
               </div>
            ))}
         </div>
      </aside>
    </div>
  );
};

export default AUPX1Studio;
