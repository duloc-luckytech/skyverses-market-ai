
import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, Clapperboard, MonitorPlay, Bot, BrainCircuit, 
  Target, Sparkles, Play, Trash2, Activity, Terminal, 
  Layers, Cpu, ShieldCheck, Download, CheckCircle2, 
  Sliders, LayoutGrid, Eye, CornerDownRight, Zap, 
  Loader2, User, Camera, Music, Move, ChevronRight,
  ArrowRight, Video, AlertCircle, RefreshCw, Share2, Lock, ExternalLink
} from 'lucide-react';
// Added generateDemoImage to imports
import { generateDemoVideo, generateDemoText, generateDemoImage } from '../services/gemini';

type PipelineStage = 'FOUNDATION' | 'ANIMATION_PLAN' | 'CHAR_MOTION' | 'CUTSCENE_PLAN' | 'SCENE_GEN' | 'FINAL_CUT';

interface StageData {
  characterProfile?: { name: string; role: string; visualUrl: string };
  animationBlueprint?: string[];
  motionAssets?: { id: string; url: string; label: string }[];
  cutsceneScript?: string[];
  finalScenes?: { id: string; url: string; label: string }[];
}

const CinematicPipelineInterface = () => {
  const [activeStage, setActiveStage] = useState<PipelineStage>('FOUNDATION');
  const [isBusy, setIsBusy] = useState(false);
  const [logs, setLogs] = useState<{t: string; msg: string; type: string}[]>([]);
  const [data, setData] = useState<StageData>({});
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

  const addLog = (type: string, msg: string) => {
    setLogs(prev => [...prev, { t: new Date().toLocaleTimeString(), msg, type }]);
  };

  const nextStage = () => {
    const stages: PipelineStage[] = ['FOUNDATION', 'ANIMATION_PLAN', 'CHAR_MOTION', 'CUTSCENE_PLAN', 'SCENE_GEN', 'FINAL_CUT'];
    const idx = stages.indexOf(activeStage);
    if (idx < stages.length - 1) setActiveStage(stages[idx + 1]);
  };

  // --- STAGE EXECUTION LOGIC ---

  const runFoundation = async () => {
    setIsBusy(true);
    addLog('THINK', 'Analyzing character identity anchors...');
    // Fix: generateDemoImage is now correctly imported
    const res = await generateDemoImage('Portrait of a cybernetic warrior princess, ornate gold armor, glowing neon blue highlights, cinematic lighting, 8k resolution, character sheet style.');
    if (res) {
      setData(prev => ({ ...prev, characterProfile: { name: 'AETHERA_V1', role: 'Royal Vanguard', visualUrl: res } }));
      addLog('DONE', 'Identity matrix locked. Profile: AETHERA_V1.');
    }
    setIsBusy(false);
  };

  const runAnimPlan = async () => {
    setIsBusy(true);
    addLog('PLAN', 'Drafting animation blueprint for Royal Vanguard archetype...');
    const blueprint = await generateDemoText('Generate a list of 4 required animations for a Royal Vanguard character in a cinematic trailer. Include Motion Intent and Pacing. Keep it technical.');
    const lines = blueprint.split('\n').filter(l => l.trim().length > 5).slice(0, 4);
    setData(prev => ({ ...prev, animationBlueprint: lines }));
    addLog('DONE', 'Animation blueprint validated.');
    setIsBusy(false);
  };

  const runCharMotion = async () => {
    setIsBusy(true);
    addLog('SYNTH', 'Orchestrating image-to-motion nodes for profile AETHERA_V1...');
    try {
      // Fix: generateDemoVideo expects a single VideoProductionParams object
      // Fix: Changed firstFrame to references
      const url = await generateDemoVideo({
        prompt: 'A cinematic motion of a cybernetic warrior princess in gold armor, breathing, glowing neon lights, slow camera zoom, 4k high quality.',
        references: data.characterProfile?.visualUrl ? [data.characterProfile.visualUrl] : undefined
      });
      if (url) {
        setData(prev => ({ ...prev, motionAssets: [{ id: 'm1', url, label: 'IDLE_BREATH_V1' }] }));
        addLog('DONE', 'Primary motion asset synthesized.');
      }
    } catch (err: any) {
      console.error("Synthesis Error:", err);
      const errorStr = typeof err === 'string' ? err : JSON.stringify(err);
      if (errorStr.includes('Requested entity was not found') || errorStr.includes('404')) {
        setNeedsKey(true);
        handleSelectKey();
      }
    } finally {
      setIsBusy(false);
    }
  };

  const runCutscenePlan = async () => {
    setIsBusy(true);
    addLog('DIRECT', 'Directing cutscene script logic...');
    const script = await generateDemoText('Write a 3-shot cinematic script for a game reveal. Shot 1: Close-up. Shot 2: Wide. Shot 3: Action. Character is AETHERA_V1. Atmospheric desert ruins.');
    const lines = script.split('\n').filter(l => l.includes('Shot')).slice(0, 3);
    setData(prev => ({ ...prev, cutsceneScript: lines }));
    addLog('DONE', 'Cutscene script compiled.');
    setIsBusy(false);
  };

  const runSceneGen = async () => {
    setIsBusy(true);
    addLog('SYNTH', 'Rendering final scenes with character identity locking...');
    try {
      // Fix: generateDemoVideo expects a single VideoProductionParams object
      // Fix: Changed firstFrame to references
      const url = await generateDemoVideo({
        prompt: 'Cinematic trailer shot: cybernetic warrior walking through ancient desert ruins, sand storm, volumetric sun rays, high fidelity cinematography.',
        references: data.characterProfile?.visualUrl ? [data.characterProfile.visualUrl] : undefined
      });
      if (url) {
        setData(prev => ({ ...prev, finalScenes: [{ id: 's1', url, label: 'SCENE_01_RUINS' }] }));
        addLog('DONE', 'Final scene rendering successful.');
      }
    } catch (err: any) {
      console.error("Rendering Error:", err);
      const errorStr = typeof err === 'string' ? err : JSON.stringify(err);
      if (errorStr.includes('Requested entity was not found') || errorStr.includes('404')) {
        setNeedsKey(true);
        handleSelectKey();
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#020203] overflow-hidden text-black dark:text-white font-mono">
      
      {/* 1. PIPELINE STEPPER (LEFT) */}
      <div className="w-full lg:w-[320px] shrink-0 flex flex-col bg-[#f8f8f8] dark:bg-[#080808] border-r border-black/10 dark:border-white/5 overflow-y-auto no-scrollbar">
         <div className="p-8 border-b border-black/10 dark:border-white/5">
            <h3 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] flex items-center gap-3">
               <Film className="w-4 h-4" /> Pipeline_Ops
            </h3>
         </div>
         <div className="flex-grow p-4 space-y-2">
            {[
              { id: 'FOUNDATION', icon: <User size={14} />, label: 'Character_Base' },
              { id: 'ANIMATION_PLAN', icon: <BrainCircuit size={14} />, label: 'Motion_Logic' },
              { id: 'CHAR_MOTION', icon: <Move size={14} />, label: 'Asset_Synthesis' },
              { id: 'CUTSCENE_PLAN', icon: <Terminal size={14} />, label: 'Director_Script' },
              { id: 'SCENE_GEN', icon: <Video size={14} />, label: 'Final_Render' },
              { id: 'FINAL_CUT', icon: <Clapperboard size={14} />, label: 'Assembly' }
            ].map((step, idx) => (
              <button 
                key={step.id}
                onClick={() => !isBusy && setActiveStage(step.id as PipelineStage)}
                className={`w-full flex items-center gap-4 p-4 border transition-all rounded-sm group ${activeStage === step.id ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-white dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-gray-400 hover:border-brand-blue/30'}`}
              >
                <div className={`p-2 border rounded-sm transition-colors ${activeStage === step.id ? 'border-white/40' : 'border-black/10 dark:border-white/10 group-hover:border-brand-blue/50'}`}>
                  {step.icon}
                </div>
                <div className="text-left">
                   <p className="text-[8px] font-black opacity-40 uppercase">Stage_0{idx+1}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest">{step.label}</p>
                </div>
                {activeStage === step.id && <ChevronRight className="ml-auto w-4 h-4" />}
              </button>
            ))}
         </div>
         <div className="p-6 mt-auto border-t border-black/10 dark:border-white/5">
            <div className="p-4 bg-brand-blue/5 border border-brand-blue/20 space-y-3">
               <div className="flex items-center gap-3 text-brand-blue">
                  <ShieldCheck size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Pipeline_Encrypted</span>
               </div>
               <p className="text-[7px] font-bold text-gray-500 uppercase leading-relaxed italic">Identity locked at kernel level.</p>
            </div>
         </div>
      </div>

      {/* 2. PRODUCTION HUB (CENTER) */}
      <div className="flex-grow flex flex-col bg-white dark:bg-[#020202] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #0090ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="flex-grow overflow-y-auto p-8 lg:p-12 relative z-10 no-scrollbar">
           <div className="max-w-4xl mx-auto space-y-12 pb-40">
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/5 pb-8">
                 <div className="flex items-center gap-4">
                    <Bot className="w-8 h-8 text-brand-blue" />
                    <div className="space-y-0.5">
                       <span className="text-[14px] font-black uppercase tracking-[0.4em] text-black dark:text-white">ACA-V2_Director</span>
                       <p className="text-[9px] font-bold text-brand-blue uppercase tracking-widest">{activeStage}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-sm border border-brand-blue/20 shadow-lg">
                       <Activity size={10} className="animate-pulse text-brand-blue" />
                       <span className="text-[8px] font-black uppercase tracking-widest">Pipeline_Sync: ACTIVE</span>
                    </div>
                 </div>
              </div>

              {/* STAGE SPECIFIC CONTENT */}
              <div className="min-h-[400px] flex flex-col items-center justify-center">
                 {activeStage === 'FOUNDATION' && (
                    <div className="w-full space-y-10 animate-in fade-in zoom-in-95 duration-500">
                       {data.characterProfile ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="aspect-[3/4] bg-black border border-white/10 relative group overflow-hidden">
                                <img src={data.characterProfile.visualUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                <div className="absolute bottom-6 left-6 text-[10px] font-black uppercase text-white tracking-widest">Locked_Identity_v1.0</div>
                             </div>
                             <div className="space-y-8 flex flex-col justify-center">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase text-gray-500">Designation</label>
                                   <p className="text-3xl font-black text-brand-blue">{data.characterProfile.name}</p>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase text-gray-500">Archetype</label>
                                   <p className="text-xl font-bold uppercase">{data.characterProfile.role}</p>
                                </div>
                                <button onClick={nextStage} className="btn-sky-primary py-5 px-10 text-[10px] w-fit">Proceed_to_Motion</button>
                             </div>
                          </div>
                       ) : (
                          <div className="text-center space-y-8">
                             <User className="w-20 h-20 mx-auto text-gray-200 dark:text-gray-800" />
                             <button onClick={runFoundation} disabled={isBusy} className="bg-brand-blue text-white px-12 py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all">
                                {isBusy ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Lock_Initial_Identity'}
                             </button>
                          </div>
                       )}
                    </div>
                 )}

                 {activeStage === 'ANIMATION_PLAN' && (
                    <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       {data.animationBlueprint ? (
                          <div className="space-y-4">
                             {data.animationBlueprint.map((line, i) => (
                                <div key={i} className="p-6 border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex items-center gap-6">
                                   <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-[10px] font-black text-brand-blue">0{i+1}</div>
                                   <p className="text-xs font-bold uppercase tracking-tight text-gray-600 dark:text-gray-400">{line}</p>
                                   <CheckCircle2 className="ml-auto w-4 h-4 text-green-500" />
                                </div>
                             ))}
                             <button onClick={nextStage} className="mt-10 btn-sky-primary py-5 px-10 text-[10px]">Initialize_Asset_Synthesis</button>
                          </div>
                       ) : (
                          <button onClick={runAnimPlan} disabled={isBusy} className="bg-brand-blue text-white px-12 py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all">
                             {isBusy ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Compile_Motion_Logic'}
                          </button>
                       )}
                    </div>
                 )}

                 {activeStage === 'CHAR_MOTION' && (
                    <div className="w-full space-y-10 animate-in fade-in zoom-in-95 duration-500">
                       {data.motionAssets ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {data.motionAssets.map(asset => (
                                <div key={asset.id} className="relative group border border-black/10 dark:border-white/5 bg-black/[0.02] overflow-hidden rounded-sm transition-all hover:border-brand-blue/30">
                                   <div className="aspect-video bg-black flex items-center justify-center relative">
                                      <video src={asset.url} autoPlay loop muted className="w-full h-full object-cover" />
                                      <div className="absolute top-4 left-4 bg-black/60 px-2 py-0.5 text-[8px] font-black text-white uppercase border border-white/10">{asset.label}</div>
                                   </div>
                                </div>
                             ))}
                             <div className="flex flex-col justify-center items-start gap-4">
                                <button onClick={runCharMotion} disabled={isBusy} className="text-[10px] font-black uppercase text-gray-500 hover:text-brand-blue transition-colors flex items-center gap-2"><RefreshCw size={14} /> Regenerate_Variant</button>
                                <button onClick={nextStage} className="btn-sky-primary py-5 px-10 text-[10px]">Approve_Motion_Set</button>
                             </div>
                          </div>
                       ) : (
                          <button onClick={runCharMotion} disabled={isBusy} className="bg-brand-blue text-white px-12 py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all">
                             {isBusy ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Synthesize_Motion_Assets'}
                          </button>
                       )}
                    </div>
                 )}

                 {activeStage === 'CUTSCENE_PLAN' && (
                    <div className="w-full space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                       {data.cutsceneScript ? (
                          <div className="space-y-6">
                             {data.cutsceneScript.map((shot, i) => (
                                <div key={i} className="p-8 border-l-4 border-brand-blue bg-gray-50 dark:bg-white/[0.02] space-y-4">
                                   <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-black uppercase text-brand-blue">Director_Shot_0{i+1}</span>
                                      <Camera size={14} className="text-gray-300" />
                                   </div>
                                   <p className="text-sm font-bold leading-relaxed text-black dark:text-white uppercase tracking-tighter">{shot}</p>
                                </div>
                             ))}
                             <button onClick={nextStage} className="btn-sky-primary py-5 px-10 text-[10px]">Render_Cinematic_Sequence</button>
                          </div>
                       ) : (
                          <button onClick={runCutscenePlan} disabled={isBusy} className="bg-brand-blue text-white px-12 py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all">
                             {isBusy ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Direct_Cutscene_Logic'}
                          </button>
                       )}
                    </div>
                 )}

                 {activeStage === 'SCENE_GEN' && (
                    <div className="w-full space-y-10 animate-in fade-in zoom-in-95 duration-500">
                       {data.finalScenes ? (
                          <div className="space-y-10">
                             <div className="aspect-video bg-black border-4 border-brand-blue/20 relative shadow-2xl">
                                <video src={data.finalScenes[0].url} autoPlay loop muted className="w-full h-full object-cover" />
                                <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest border border-white/10 backdrop-blur-md">
                                   <Sparkles className="text-brand-blue w-4 h-4" /> Final_Render_Alpha
                                </div>
                             </div>
                             <div className="flex justify-center gap-6">
                                <button onClick={runSceneGen} className="p-5 border border-black/10 dark:border-white/10 text-gray-500 hover:text-brand-blue transition-colors"><RefreshCw size={20} /></button>
                                <button onClick={nextStage} className="btn-sky-primary py-5 px-20 text-[11px] font-black uppercase tracking-[0.4em]">Initialize_Final_Cut</button>
                             </div>
                          </div>
                       ) : (
                          <button onClick={runSceneGen} disabled={isBusy} className="bg-brand-blue text-white px-12 py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all">
                             {isBusy ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Execute_Scene_Synthesis'}
                          </button>
                       )}
                    </div>
                 )}

                 {activeStage === 'FINAL_CUT' && (
                    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                       <div className="text-center space-y-6">
                          <CheckCircle2 className="w-20 h-20 mx-auto text-green-500" />
                          <h4 className="text-2xl font-black uppercase tracking-widest text-black dark:text-white">Production_Complete</h4>
                          <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em]">Cutscene Ready for Engine Integration</p>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <button className="bg-brand-blue text-white py-6 px-10 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-black transition-all">
                             <Download size={18} /> Export_All_Assets
                          </button>
                          <button className="border border-black/10 dark:border-white/10 py-6 px-10 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-brand-blue hover:text-white transition-all">
                             <Share2 size={18} /> Share_Preview_Link
                          </button>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* DIRECTOR HUD (BOTTOM) */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#fafafa] dark:bg-black border-t border-black/10 dark:border-white/5 p-6 lg:p-10 flex items-center justify-between z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
           <div className="hidden lg:flex flex-col gap-3">
              <div className="flex items-center gap-6">
                 {['FOUNDATION', 'MOTION', 'SCRIPT', 'RENDER', 'DONE'].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${activeStage === step ? 'bg-brand-blue animate-pulse' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                       <span className={`text-[8px] font-black uppercase tracking-widest ${activeStage === step ? 'text-brand-blue' : 'text-gray-400'}`}>{step}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="flex items-center gap-6 w-full lg:w-auto">
              <button 
                onClick={() => {setData({}); setActiveStage('FOUNDATION'); setLogs([])}}
                className="p-5 border border-black/10 dark:border-white/10 text-gray-400 hover:text-red-500 transition-all active:scale-95 disabled:opacity-20"
              >
                <Trash2 size={20} />
              </button>
              <div className="h-10 w-[1px] bg-black/10 dark:border-white/10 mx-2"></div>
              <div className="flex flex-col items-end gap-1">
                 <span className="text-[8px] font-black uppercase text-gray-400">Project_Status</span>
                 <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest animate-pulse">Waiting_For_Director</span>
              </div>
           </div>
        </div>
      </div>

      {/* 3. DIRECTOR LOG (RIGHT) */}
      <div className="hidden xl:flex w-[400px] shrink-0 flex flex-col bg-[#fdfdfd] dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-hidden">
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
               <Activity className="w-4 h-4 text-brand-blue" /> Director_Log
            </h3>
         </div>
         <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar pb-32">
            {logs.length === 0 ? (
               <div className="py-24 text-center opacity-10">
                  <Activity className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest italic">Awaiting Telemetry</p>
               </div>
            ) : (
               logs.map((log, i) => (
                  <div key={i} className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400">
                        <span className={`px-2 py-0.5 rounded-sm ${log.type === 'THINK' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-black/5 dark:bg-white/5'}`}>{log.type}</span>
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
                  <span className="text-[9px] font-black uppercase">Thinking...</span>
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
                Cinematic synthesis requires an authorized production API key.
              </p>
              <div className="pt-6 flex flex-col gap-4">
                <button onClick={handleSelectKey} className="btn-sky-primary py-4 px-10 text-[10px] tracking-widest uppercase">Select Production Key</button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] text-gray-600 hover:text-brand-blue flex items-center justify-center gap-2 font-black uppercase">Billing Architecture <ExternalLink className="w-3 h-3" /></a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinematicPipelineInterface;
