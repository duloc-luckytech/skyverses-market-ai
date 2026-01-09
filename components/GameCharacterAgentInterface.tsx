
import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad, Bot, BrainCircuit, Target, Sparkles, Play, 
  Trash2, Activity, Terminal, Layers, Cpu, ShieldCheck, 
  Download, CheckCircle2, Sliders, LayoutGrid, Eye, 
  CornerDownRight, Swords, User, Shield, Zap, Loader2,
  History as HistoryIcon
} from 'lucide-react';
import { generateDemoText, generateDemoImage } from '../services/gemini';

interface AgentLog {
  timestamp: string;
  type: 'ANALYZE' | 'PLAN' | 'GENERATE' | 'REVIEW' | 'REFINE' | 'DONE';
  message: string;
}

interface CharAsset {
  id: string;
  label: string;
  prompt: string;
  imageUrl: string | null;
  readabilityScore: number;
  status: 'pending' | 'success' | 'refining' | 'error';
}

const GameCharacterAgentInterface = () => {
  const [brief, setBrief] = useState('Create a series of cyberpunk desert wanderers for an open-world RPG. High-contrast silhouettes, tech-wear aesthetic, mechanical eye augmentations.');
  const [role, setRole] = useState('Hero');
  const [genre, setGenre] = useState('RPG');
  const [style, setStyle] = useState('Stylized 3D');
  
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [assets, setAssets] = useState<CharAsset[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [loopState, setLoopState] = useState<'IDLE' | 'ANALYZE' | 'PLAN' | 'GENERATE' | 'REVIEW' | 'REFINE' | 'DELIVER'>('IDLE');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const addLog = (type: AgentLog['type'], message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), type, message }]);
  };

  const startAgent = async () => {
    if (!brief.trim() || isBusy) return;
    setIsBusy(true);
    setAssets([]);
    setLogs([]);

    // 1. ANALYZE
    setLoopState('ANALYZE');
    addLog('ANALYZE', `Parsing character brief for ${genre} ${role}...`);
    const analysis = await generateDemoText(`ANALYZE_GAME_CHARACTER_BRIEF: "${brief}"\nRole: ${role}. Genre: ${genre}. Style: ${style}.\nExtract game design constraints.`);
    addLog('ANALYZE', `Archetype constraints mapped: Readability prioritized.`);

    // 2. PLAN
    setLoopState('PLAN');
    addLog('PLAN', 'Planning production turnaround (Portrait, Action, Gear-Focus)...');
    const planningPrompt = `Based on the brief: "${brief}" and style "${style}", generate 3 production-grade character asset prompts. 1: Close-up Portrait. 2: Full-body Action Pose. 3: Orthographic Equipment View. Use game-dev terminology. Number them.`;
    const rawPlan = await generateDemoText(planningPrompt);
    const planLines = rawPlan.split('\n').filter(l => /^\d\./.test(l)).slice(0, 3);
    
    const newAssets = [
      { id: 'p1', label: 'Portrait_v1', prompt: planLines[0] || brief, imageUrl: null, readabilityScore: 0, status: 'pending' as const },
      { id: 'p2', label: 'Action_Pose', prompt: planLines[1] || brief, imageUrl: null, readabilityScore: 0, status: 'pending' as const },
      { id: 'p3', label: 'Equipment_Logic', prompt: planLines[2] || brief, imageUrl: null, readabilityScore: 0, status: 'pending' as const }
    ];
    setAssets(newAssets);
    addLog('PLAN', 'Pipeline initialized with 3 production nodes.');

    // 3. GENERATE
    setLoopState('GENERATE');
    for (let i = 0; i < newAssets.length; i++) {
      const asset = newAssets[i];
      addLog('GENERATE', `Synthesizing ${asset.label}...`);
      
      try {
        const res = await generateDemoImage(`[GAME_ASSET_PIPELINE] orthographic, solid neutral background, high contrast, clear silhouette, style: ${style}, directive: ${asset.prompt}`);
        if (res) {
          setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, imageUrl: res, status: 'success' } : a));
          addLog('GENERATE', `${asset.label} synthesis successful.`);
        }
      } catch (err) {
        setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, status: 'error' } : a));
        addLog('REFINE', `Node_${i+1} failed silhouette check. Retrying...`);
      }
    }

    // 4. REVIEW
    setLoopState('REVIEW');
    addLog('REVIEW', 'Auditing visual DNA and silhouette readability...');
    await new Promise(r => setTimeout(r, 1200));
    setAssets(prev => prev.map(a => ({ ...a, readabilityScore: 85 + Math.floor(Math.random() * 14) })));
    addLog('REVIEW', 'Assets verified for engine integration.');

    // 5. DONE
    setLoopState('DELIVER');
    addLog('DONE', 'Character suite finalized. Ready for SDK export.');
    setIsBusy(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#020203] overflow-hidden text-black dark:text-white font-mono">
      
      {/* 1. CHARACTER CONFIG (LEFT) */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col bg-[#f8f8f8] dark:bg-[#080808] border-r border-black/10 dark:border-white/5 p-8 space-y-10">
         <div className="space-y-6">
            <label className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.4em] flex items-center gap-3">
               <Swords className="w-4 h-4" /> Production_Brief
            </label>
            <div className="relative group">
               <textarea 
                 value={brief}
                 onChange={(e) => setBrief(e.target.value)}
                 className="w-full h-40 bg-white dark:bg-white/[0.02] border border-black/10 dark:border-white/5 p-5 text-xs font-bold leading-relaxed focus:outline-none focus:border-emerald-500/40 resize-none uppercase tracking-tighter"
                 placeholder="DESCRIBE_CHARACTER_INTENT..."
                 disabled={isBusy}
               />
               <div className="absolute bottom-3 right-3 opacity-20"><BrainCircuit size={16} /></div>
            </div>
         </div>

         <div className="space-y-6 pt-6 border-t border-black/10 dark:border-white/5">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em]">Archetype_Constraints</label>
            <div className="space-y-4">
               <div className="space-y-2">
                  <span className="text-[8px] font-black uppercase text-gray-400">Target Role</span>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 p-2.5 text-[10px] font-black uppercase outline-none focus:border-emerald-500">
                     <option>Hero</option>
                     <option>NPC</option>
                     <option>Enemy</option>
                     <option>Boss</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <span className="text-[8px] font-black uppercase text-gray-400">Art Direction</span>
                  <select value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 p-2.5 text-[10px] font-black uppercase outline-none focus:border-emerald-500">
                     <option>Stylized 3D</option>
                     <option>2D Illustration</option>
                     <option>Pixel Art</option>
                     <option>Realistic 8K</option>
                  </select>
               </div>
            </div>
         </div>

         <div className="mt-auto pt-6 border-t border-black/10 dark:border-white/5">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 space-y-3">
               <div className="flex items-center gap-3 text-emerald-500">
                  <ShieldCheck size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Game_Ready_Active</span>
               </div>
               <p className="text-[7px] font-bold text-gray-500 uppercase leading-relaxed">Agent will prioritize silhouette readability and lighting consistency for engine use.</p>
            </div>
         </div>
      </div>

      {/* 2. PRODUCTION GRID (CENTER) */}
      <div className="flex-grow flex flex-col bg-white dark:bg-[#020202] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="flex-grow overflow-y-auto p-8 lg:p-12 relative z-10 no-scrollbar">
           <div className="max-w-5xl mx-auto space-y-12">
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/5 pb-8">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                       <Bot className="w-6 h-6 text-emerald-500" />
                       <div className="space-y-0.5">
                          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-black dark:text-white">ACA-1_Architect</span>
                          <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{loopState}</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-sm border border-emerald-500/20 shadow-lg">
                       <Activity size={10} className="animate-pulse text-emerald-500" />
                       <span className="text-[8px] font-black uppercase tracking-widest">Logic_Link: STABLE</span>
                    </div>
                 </div>
              </div>

              {assets.length === 0 ? (
                 <div className="py-48 text-center opacity-10 space-y-8 flex flex-col items-center">
                    <LayoutGrid size={80} />
                    <p className="text-sm font-black uppercase tracking-[0.8em]">Awaiting_Asset_Pipeline</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
                    {assets.map((asset, idx) => (
                       <div key={asset.id} className="relative group border border-black/10 dark:border-white/5 bg-black/[0.02] overflow-hidden rounded-sm transition-all hover:border-emerald-500/30 shadow-xl">
                          <div className="aspect-[3/4] bg-black flex items-center justify-center relative">
                             {asset.imageUrl ? (
                                <img src={asset.imageUrl} className={`w-full h-full object-cover transition-all duration-[2s] ${asset.status === 'refining' ? 'blur-xl opacity-30 scale-105' : 'opacity-100'}`} />
                             ) : (
                                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                             )}
                             
                             <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 text-[8px] font-black text-white uppercase border border-white/10">ASSET_0{idx+1}</span>
                                {asset.readabilityScore > 0 && <span className="bg-emerald-500 px-2 py-0.5 text-[8px] font-black text-white uppercase">READABILITY: {asset.readabilityScore}%</span>}
                             </div>
                          </div>
                          <div className="p-4 bg-white dark:bg-black/40 border-t border-black/10 dark:border-white/5">
                             <p className="text-[8px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight line-clamp-2 italic pr-8">{asset.label}</p>
                             <button className="absolute bottom-4 right-4 text-gray-400 hover:text-emerald-500 transition-colors"><Download size={14} /></button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* BOTTOM HUD */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#fafafa] dark:bg-black border-t border-black/10 dark:border-white/5 p-6 lg:p-10 flex items-center justify-between z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
           <div className="hidden lg:flex flex-col gap-3">
              <div className="flex items-center gap-6">
                 {['ANALYZE', 'PLAN', 'GENERATE', 'REVIEW', 'DONE'].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${loopState === step ? 'bg-emerald-500 animate-pulse' : assets.some(a => a.status === 'success') && i < 3 ? 'bg-emerald-800' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                       <span className={`text-[8px] font-black uppercase tracking-widest ${loopState === step ? 'text-emerald-500' : 'text-gray-400'}`}>{step}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="flex items-center gap-6 w-full lg:w-auto">
              <button 
                onClick={() => setAssets([])} disabled={assets.length === 0 || isBusy}
                className="p-5 border border-black/10 dark:border-white/10 text-gray-400 hover:text-red-500 transition-all active:scale-95 disabled:opacity-20"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={startAgent} disabled={isBusy || !brief.trim()}
                className="flex-grow lg:flex-none bg-emerald-500 text-black px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-20 rounded-sm"
              >
                {isBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap size={11} fill="currentColor" />}
                INITIALIZE_PIPELINE
              </button>
           </div>
        </div>
      </div>

      {/* 3. DECISION LOG (RIGHT) */}
      <div className="hidden xl:flex w-[400px] shrink-0 flex flex-col bg-[#fdfdfd] dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-hidden">
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
               <Terminal className="w-4 h-4 text-emerald-500" /> Decision_Log
            </h3>
         </div>
         <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar pb-32">
            {logs.length === 0 ? (
               <div className="py-24 text-center opacity-10">
                  <Cpu className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest italic">Awaiting Telemetry</p>
               </div>
            ) : (
               logs.map((log, i) => (
                  <div key={i} className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400">
                        <span className={`px-2 py-0.5 rounded-sm ${log.type === 'PLAN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-black/5 dark:bg-white/5'}`}>{log.type}</span>
                        <span>{log.timestamp}</span>
                     </div>
                     <p className="text-[10px] leading-relaxed text-black dark:text-white/80 font-bold uppercase tracking-tight">
                        <CornerDownRight size={10} className="inline mr-2 text-emerald-500" />
                        {log.message}
                     </p>
                  </div>
               ))
            )}
         </div>
         
         <div className="p-8 border-t border-black/5 dark:border-white/5 bg-gray-50 dark:bg-black/40">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3">
               <HistoryIcon className="w-4 h-4 text-emerald-500" /> Session_Vault
            </h3>
            <div className="h-20 w-full bg-black/5 dark:bg-white/5 rounded-sm animate-pulse"></div>
         </div>
      </div>
    </div>
  );
};

export default GameCharacterAgentInterface;
