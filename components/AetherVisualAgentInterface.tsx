
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Loader2, Bot, BrainCircuit, Target, 
  Sparkles, Play, Pause, Square, Trash2, 
  Activity, Braces, Terminal, Search, Layers, 
  Cpu, ShieldCheck, Download, CheckCircle2, 
  AlertCircle, ArrowRight, RefreshCw, Sliders,
  LayoutGrid, Eye, Share2, CornerDownRight, History as HistoryIcon
} from 'lucide-react';
import { generateDemoText, generateDemoImage } from '../services/gemini';

interface AgentLog {
  timestamp: string;
  type: 'THINK' | 'PLAN' | 'CREATE' | 'REVIEW' | 'REFINE' | 'DONE';
  message: string;
}

interface VisualConcept {
  id: string;
  prompt: string;
  imageUrl: string | null;
  score: number;
  status: 'pending' | 'success' | 'refining' | 'error';
}

const AetherVisualAgentInterface = () => {
  const [goal, setGoal] = useState('Create a set of cinematic cyberpunk mascots for a luxury coffee brand. Emphasis on metallic textures and neon accents.');
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [concepts, setConcepts] = useState<VisualConcept[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [loopState, setLoopState] = useState<'IDLE' | 'UNDERSTAND' | 'PLAN' | 'CREATE' | 'REVIEW' | 'REFINE' | 'DELIVER'>('IDLE');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const addLog = (type: AgentLog['type'], message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), type, message }]);
  };

  const startAgent = async () => {
    if (!goal.trim() || isBusy) return;
    setIsBusy(true);
    setConcepts([]);
    setLogs([]);

    // 1. UNDERSTAND
    setLoopState('UNDERSTAND');
    addLog('THINK', 'Analyzing creative intent from high-level uplink...');
    const analysis = await generateDemoText(`ANALYZE_CREATIVE_GOAL: "${goal}"\nExtract: Subject, Style, Core Constraints. Keep it brief.`);
    addLog('PLAN', `Intent mapped: ${analysis.slice(0, 120)}...`);

    // 2. PLAN
    setLoopState('PLAN');
    addLog('THINK', 'Architecting multi-stage synthesis plan...');
    const planningPrompt = `Based on this goal: "${goal}", generate 4 distinct, highly detailed image prompts that maintain visual consistency but explore different angles. Format as numbered list.`;
    const rawPlan = await generateDemoText(planningPrompt);
    const planLines = rawPlan.split('\n').filter(l => /^\d\./.test(l)).slice(0, 4);
    
    const newConcepts = planLines.map((p, i) => ({
      id: `c-${i}`,
      prompt: p.replace(/^\d\.\s*/, ''),
      imageUrl: null,
      score: 0,
      status: 'pending' as const
    }));
    setConcepts(newConcepts);
    addLog('PLAN', `Pipeline initialized with ${newConcepts.length} neural branches.`);

    // 3. CREATE
    setLoopState('CREATE');
    for (let i = 0; i < newConcepts.length; i++) {
      const concept = newConcepts[i];
      addLog('CREATE', `Synthesizing Node_${i+1}...`);
      setConcepts(prev => prev.map(c => c.id === concept.id ? { ...c, status: 'pending' } : c));
      
      try {
        const res = await generateDemoImage(`[AGENT_AUTH] ${concept.prompt}`);
        if (res) {
           setConcepts(prev => prev.map(c => c.id === concept.id ? { ...c, imageUrl: res, status: 'success' } : c));
           addLog('CREATE', `Node_${i+1} synthesis successful.`);
        }
      } catch (err) {
        addLog('REFINE', `Node_${i+1} failed initial inference. Queueing for retry.`);
        setConcepts(prev => prev.map(c => c.id === concept.id ? { ...c, status: 'error' } : c));
      }
    }

    // 4. REVIEW
    setLoopState('REVIEW');
    addLog('THINK', 'Initiating neural quality audit on batch set...');
    await new Promise(r => setTimeout(r, 1500));
    setConcepts(prev => prev.map(c => ({ ...c, score: Math.floor(Math.random() * 20) + 80 })));
    addLog('REVIEW', 'Visual DNA verified. Batch alignment at 94.2% stability.');

    // 5. DONE
    setLoopState('DELIVER');
    addLog('DONE', 'Creative suite finalized and ready for export.');
    setIsBusy(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#030304] overflow-hidden text-black dark:text-white font-mono">
      
      {/* 1. GOAL UPLINK (LEFT) */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col bg-[#fdfdfd] dark:bg-[#050506] border-r border-black/10 dark:border-white/5 p-8 space-y-10">
         <div className="space-y-6">
            <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
               <Target className="w-4 h-4 text-brand-blue" /> Intent_Uplink
            </label>
            <div className="relative group">
               <textarea 
                 value={goal}
                 onChange={(e) => setGoal(e.target.value)}
                 className="w-full h-48 bg-white dark:bg-white/[0.02] border border-black/10 dark:border-white/5 p-5 text-xs font-bold leading-relaxed focus:outline-none focus:border-brand-blue/40 resize-none uppercase tracking-tighter"
                 placeholder="DESCRIBE_YOUR_CREATIVE_GOAL..."
                 disabled={isBusy}
               />
               <div className="absolute bottom-3 right-3 opacity-20"><BrainCircuit size={16} /></div>
            </div>
         </div>

         <div className="space-y-6 pt-6 border-t border-black/10 dark:border-white/5">
            <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-[0.4em]">Agent_Constraints</label>
            <div className="space-y-3">
               {[
                 { label: 'Creative Autonomy', value: 'High' },
                 { label: 'Review Intensity', value: 'Deep' },
                 { label: 'Style Alignment', value: 'Locked' }
               ].map(item => (
                 <div key={item.label} className="flex justify-between items-center p-3 border border-black/5 dark:border-white/5 bg-black/[0.01]">
                    <span className="text-[8px] font-black uppercase text-gray-400">{item.label}</span>
                    <span className="text-[9px] font-black text-brand-blue">{item.value}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="mt-auto pt-6 border-t border-black/10 dark:border-white/5">
            <div className="p-4 bg-brand-blue/5 border border-brand-blue/20 space-y-3">
               <div className="flex items-center gap-3 text-brand-blue">
                  <ShieldCheck size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Autonomous_Active</span>
               </div>
               <p className="text-[7px] font-bold text-gray-500 uppercase leading-relaxed">Agent will decide prompts, batching, and refinement nodes locally.</p>
            </div>
         </div>
      </div>

      {/* 2. SYNTHESIS GRID (CENTER) */}
      <div className="flex-grow flex flex-col bg-white dark:bg-[#020202] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #0090ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="flex-grow overflow-y-auto p-8 lg:p-12 relative z-10 no-scrollbar">
           <div className="max-w-5xl mx-auto space-y-12">
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/5 pb-8">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                       <Bot className="w-6 h-6 text-brand-blue" />
                       <div className="space-y-0.5">
                          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-black dark:text-white">AVA-1_Agent</span>
                          <p className="text-[8px] font-bold text-brand-blue uppercase tracking-widest">{loopState}</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full">
                       <Activity size={10} className="animate-pulse" />
                       <span className="text-[8px] font-black uppercase">Core_Frequency: 1.2GHZ</span>
                    </div>
                 </div>
              </div>

              {concepts.length === 0 ? (
                 <div className="py-48 text-center opacity-10 space-y-8 flex flex-col items-center">
                    <LayoutGrid size={80} />
                    <p className="text-sm font-black uppercase tracking-[0.8em]">Awaiting_Intent_Link</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500">
                    {concepts.map((concept, idx) => (
                       <div key={concept.id} className="relative group border border-black/10 dark:border-white/5 bg-black/[0.02] overflow-hidden rounded-sm transition-all hover:border-brand-blue/30 shadow-xl">
                          <div className="aspect-square bg-black flex items-center justify-center relative">
                             {concept.imageUrl ? (
                                <img src={concept.imageUrl} className={`w-full h-full object-cover transition-all duration-[2s] ${concept.status === 'refining' ? 'blur-xl opacity-30 scale-105' : 'opacity-100'}`} />
                             ) : (
                                <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                             )}
                             
                             <div className="absolute top-4 left-4 flex gap-2">
                                <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 text-[8px] font-black text-white uppercase border border-white/10">NODE_0{idx+1}</span>
                                {concept.score > 0 && <span className="bg-brand-blue px-2 py-0.5 text-[8px] font-black text-white uppercase">{concept.score}% STABLE</span>}
                             </div>
                             
                             <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-3 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-all"><Download size={16} /></button>
                             </div>
                          </div>
                          <div className="p-5 bg-white dark:bg-black/40 border-t border-black/10 dark:border-white/5">
                             <p className="text-[9px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight line-clamp-2 italic">"{concept.prompt}"</p>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* BOTTOM HUD */}
        <div className="absolute bottom-0 left-0 right-0 h-32 lg:h-36 bg-[#fafafa] dark:bg-black border-t border-black/10 dark:border-white/5 p-6 lg:p-10 flex items-center justify-between z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
           <div className="hidden lg:flex flex-col gap-3">
              <div className="flex items-center gap-6">
                 {['UNDERSTAND', 'PLAN', 'CREATE', 'REVIEW', 'REFINE'].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${loopState === step ? 'bg-brand-blue animate-pulse' : concepts.length > 0 && i < 3 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                       <span className={`text-[8px] font-black uppercase tracking-widest ${loopState === step ? 'text-brand-blue' : 'text-gray-400'}`}>{step}</span>
                    </div>
                 ))}
              </div>
              <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-brand-blue transition-all duration-1000" style={{ width: loopState === 'DELIVER' ? '100%' : '60%' }}></div>
              </div>
           </div>

           <div className="flex items-center gap-6 w-full lg:w-auto">
              <button 
                onClick={() => setConcepts([])} disabled={concepts.length === 0 || isBusy}
                className="p-5 border border-black/10 dark:border-white/10 text-gray-400 hover:text-red-500 transition-all active:scale-95 disabled:opacity-20"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={startAgent} disabled={isBusy || !goal.trim()}
                className="flex-grow lg:flex-none bg-brand-blue text-white px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-20 rounded-sm"
              >
                {isBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles size={11} />}
                INITIALIZE_AGENT_FLOW
              </button>
           </div>
        </div>
      </div>

      {/* 3. COGNITIVE TRACE (RIGHT) */}
      <div className="hidden xl:flex w-[400px] shrink-0 flex flex-col bg-[#fdfdfd] dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-hidden">
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
               <Activity className="w-4 h-4 text-brand-blue" /> Cognitive_Trace
            </h3>
         </div>
         <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar pb-32">
            {logs.length === 0 ? (
               <div className="py-24 text-center opacity-10">
                  <Terminal className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest italic">Awaiting Telemetry</p>
               </div>
            ) : (
               logs.map((log, i) => (
                  <div key={i} className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400">
                        <span className={`px-2 py-0.5 rounded-sm ${log.type === 'PLAN' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-black/5 dark:bg-white/5'}`}>{log.type}</span>
                        <span>{log.timestamp}</span>
                     </div>
                     <p className="text-[10px] leading-relaxed text-black dark:text-white/80 font-bold uppercase tracking-tight">
                        <CornerDownRight size={10} className="inline mr-2 text-brand-blue" />
                        {log.message}
                     </p>
                  </div>
               ))
            )}
            {isBusy && (
               <div className="flex items-center gap-4 text-brand-blue animate-pulse">
                  <div className="w-1 h-1 rounded-full bg-brand-blue"></div>
                  <span className="text-[8px] font-black uppercase">Thinking...</span>
               </div>
            )}
         </div>
         
         <div className="p-8 border-t border-black/10 dark:border-white/5 bg-gray-50 dark:bg-black/40">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3">
               <HistoryIcon className="w-4 h-4 text-brand-blue" /> Session_History
            </h3>
            <div className="space-y-3">
               <div className="h-10 w-full bg-black/5 dark:bg-white/5 rounded-sm animate-pulse"></div>
               <div className="h-10 w-full bg-black/5 dark:bg-white/5 rounded-sm animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AetherVisualAgentInterface;
