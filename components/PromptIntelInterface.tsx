
import React, { useState, useMemo } from 'react';
import { 
  Zap, Loader2, Target, ShieldCheck, 
  Sliders, Palette, CheckCircle2, 
  Info, Activity, Braces, Copy, Share2, Eye, 
  Cpu, Command, Search, Database, Terminal,
  BarChart3, AlertTriangle, ArrowRight, Gauge,
  FlaskConical, CheckCircle, Flame,
  History as HistoryIcon
} from 'lucide-react';
import { generateDemoText } from '../services/gemini';

interface Metric {
  label: string;
  value: number;
  status: 'low' | 'med' | 'high';
}

interface EvaluationResult {
  score: number;
  metrics: Metric[];
  optimization: string;
  variance: number;
  sensitivity: { model: string; delta: number }[];
}

const PromptIntelInterface = () => {
  const [prompt, setPrompt] = useState('Analyze the quarterly logistics report for latency spikes and route optimization suggestions. Output must be valid JSON with key "remedy".');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'METRICS' | 'SENSITIVITY' | 'OPTIMIZATION'>('METRICS');
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);

  const handleAudit = async () => {
    if (!prompt.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setEvalResult(null);

    try {
      // Logic: Use Gemini to evaluate the prompt as an "Architectural Strategist"
      const analysisPrompt = `EVALUATE_PROMPT_PRODUCTION_READINESS:
      PROMPT_PAYLOAD: "${prompt}"
      
      Output a structured analysis focusing on:
      1. Logic Clarity
      2. Model Specific Sensitivity
      3. Ambiguity Detection
      4. Proposed Production-Grade Rewrite
      5. Scoring (0-100)`;

      const rawAnalysis = await generateDemoText(analysisPrompt);
      
      // Simulate Metric Synthesis based on result
      setTimeout(() => {
        setEvalResult({
          score: 84 + Math.floor(Math.random() * 12),
          metrics: [
            { label: 'Consistency', value: 92, status: 'high' },
            { label: 'Token Efficiency', value: 68, status: 'med' },
            { label: 'Constraint Strength', value: 88, status: 'high' },
            { label: 'Ambiguity Risk', value: 12, status: 'low' }
          ],
          variance: 0.042,
          sensitivity: [
            { model: 'Gemini 3 Pro', delta: 98 },
            { model: 'GPT-4o', delta: 94 },
            { model: 'SDXL 1.0', delta: 12 }
          ],
          optimization: rawAnalysis
        });
        setIsAnalyzing(false);
      }, 1500);

    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#030304] overflow-hidden text-black dark:text-white font-mono">
      
      {/* 1. ASSET EXPLORER (LEFT) */}
      <div className="w-full lg:w-[350px] shrink-0 flex flex-col bg-[#fdfdfd] dark:bg-[#050506] border-r border-black/10 dark:border-white/5">
        <div className="p-6 space-y-6">
           <div className="relative flex items-center bg-white dark:bg-[#0a0a0b] border border-black/[0.08] dark:border-white/5 rounded-sm overflow-hidden h-12">
              <Search size={14} className="ml-4 text-gray-400" />
              <input 
                type="text"
                placeholder="SEARCH_LOGIC..."
                className="flex-grow bg-transparent border-none px-3 text-[10px] font-black uppercase tracking-widest focus:outline-none"
              />
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-[0.4em] flex items-center gap-3">
                 <Database className="w-4 h-4 text-brand-blue" /> Production_Assets
              </label>
              <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[400px]">
                 {[
                   { name: 'Legal_Audit_Core', status: 'PRODUCTION', score: 98 },
                   { name: 'Motion_Scene_Director', status: 'STABLE', score: 91 },
                   { name: 'Inventory_Gen_V4', status: 'TESTING', score: 74 },
                   { name: 'Draft_Node_77', status: 'DRAFT', score: 42 }
                 ].map((asset) => (
                    <div key={asset.name} className="p-4 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 group cursor-pointer hover:border-brand-blue/30 transition-all">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black uppercase tracking-tight">{asset.name}</span>
                          <span className={`text-[7px] font-black px-2 py-0.5 rounded-sm ${asset.status === 'PRODUCTION' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>{asset.status}</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="flex-grow h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-blue" style={{ width: `${asset.score}%` }}></div>
                          </div>
                          <span className="text-[9px] font-black text-brand-blue">{asset.score}%</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="mt-auto p-6 border-t border-black/10 dark:border-white/5">
           <div className="p-4 bg-brand-blue/5 border border-brand-blue/20 space-y-3">
              <div className="flex items-center gap-2 text-brand-blue">
                 <ShieldCheck size={14} />
                 <span className="text-[9px] font-black uppercase">Governance_Active</span>
              </div>
              <p className="text-[8px] text-gray-500 font-bold uppercase leading-relaxed tracking-wider">Evaluation nodes are VPC isolated. Private data remains within the enterprise perimeter.</p>
           </div>
        </div>
      </div>

      {/* 2. INTEL ENGINE (CENTER) */}
      <div className="flex-grow flex flex-col bg-white dark:bg-[#020202] relative overflow-hidden">
        <div className="flex-grow flex flex-col p-8 lg:p-12 overflow-y-auto custom-scrollbar relative">
           <div className="max-w-4xl mx-auto w-full space-y-12 pb-32">
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/5 pb-8">
                 <div className="flex items-center gap-4">
                    <FlaskConical className="w-5 h-5 text-brand-blue" />
                    <div>
                       <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">PIM_Runner_v4.2</span>
                       <p className="text-[8px] font-bold text-gray-300 dark:text-gray-800 uppercase tracking-widest">Awaiting Stress-Test Deployment</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"><Copy size={16} /></button>
                    <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"><Share2 size={16} /></button>
                 </div>
              </div>
              
              <div className="space-y-6">
                 <div className="p-8 border border-black/10 dark:border-white/5 bg-gray-50 dark:bg-black relative group">
                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                       <span className="text-[8px] font-black text-gray-500 uppercase">Input Mode: RAW_LOGIC</span>
                       <Terminal size={12} />
                    </div>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-transparent border-none text-xl lg:text-3xl font-black text-black dark:text-white focus:outline-none resize-none min-h-[120px] tracking-tight leading-tight uppercase placeholder:text-gray-100 dark:placeholder:text-gray-900"
                      placeholder="ENTER_PROMPT_FOR_AUDIT..."
                    />
                 </div>

                 {/* TAB NAVIGATION */}
                 <div className="flex border-b border-black/10 dark:border-white/5">
                    {['METRICS', 'SENSITIVITY', 'OPTIMIZATION'].map(tab => (
                       <button 
                         key={tab} 
                         onClick={() => setActiveTab(tab as any)}
                         className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-brand-blue' : 'text-gray-400'}`}
                       >
                          {tab}
                          {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue"></div>}
                       </button>
                    ))}
                 </div>

                 {/* TAB CONTENT */}
                 <div className="min-h-[300px]">
                    {!evalResult ? (
                       <div className="py-24 text-center opacity-10 space-y-4">
                          <div className="flex flex-col items-center gap-4">
                             <Gauge className="w-16 h-16 mx-auto" />
                             <HistoryIcon className="w-6 h-6 text-brand-blue/30" />
                          </div>
                          <p className="text-[11px] font-black uppercase tracking-[0.4em]">Initialize_Node_Audit</p>
                       </div>
                    ) : (
                       <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                          {activeTab === 'METRICS' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
                                {evalResult.metrics.map(m => (
                                   <div key={m.label} className="space-y-3">
                                      <div className="flex justify-between items-center">
                                         <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{m.label}</span>
                                         <span className={`text-[10px] font-black uppercase ${m.status === 'high' ? 'text-green-500' : 'text-yellow-500'}`}>{m.value}%</span>
                                      </div>
                                      <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                         <div className={`h-full ${m.status === 'high' ? 'bg-green-500' : 'bg-brand-blue'}`} style={{ width: `${m.value}%` }}></div>
                                      </div>
                                   </div>
                                ))}
                                <div className="md:col-span-2 p-6 border border-brand-blue/20 bg-brand-blue/5 rounded-sm flex items-center justify-between">
                                   <div className="flex items-center gap-6">
                                      <div className="p-4 bg-brand-blue text-white rounded-full"><Gauge size={24} /></div>
                                      <div>
                                         <h4 className="text-2xl font-black text-black dark:text-white leading-none mb-1">{evalResult.score}%</h4>
                                         <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Aggregate_Logic_Stability</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-[8px] font-black uppercase text-brand-blue tracking-[0.2em] mb-1">Variance Coefficient</p>
                                      <p className="text-sm font-black text-black dark:text-white">±{evalResult.variance}</p>
                                   </div>
                                </div>
                             </div>
                          )}

                          {activeTab === 'SENSITIVITY' && (
                             <div className="space-y-6 py-8">
                                {evalResult.sensitivity.map(s => (
                                   <div key={s.model} className="p-5 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-between group hover:border-brand-blue/30 transition-all">
                                      <div className="flex items-center gap-4">
                                         <Cpu size={18} className="text-gray-400 group-hover:text-brand-blue transition-colors" />
                                         <span className="text-[11px] font-black uppercase text-black dark:text-white tracking-widest">{s.model}</span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                         <span className="text-[9px] font-black text-gray-400 uppercase">Delta Performance</span>
                                         <div className="w-32 h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-blue" style={{ width: `${s.delta}%` }}></div>
                                         </div>
                                         <span className="text-[11px] font-black text-black dark:text-white">{s.delta}%</span>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          )}

                          {activeTab === 'OPTIMIZATION' && (
                             <div className="space-y-8 py-8">
                                <div className="space-y-4">
                                   <label className="text-[9px] font-black uppercase text-brand-blue tracking-widest flex items-center gap-2">
                                      <Activity size={14} /> Intelligence_Audit_Logs
                                   </label>
                                   <div className="p-6 bg-black text-[#00ff41] text-[11px] font-mono leading-relaxed border border-[#00ff41]/20 shadow-[0_0_30px_rgba(0,255,65,0.05)] whitespace-pre-wrap">
                                      {evalResult.optimization}
                                   </div>
                                </div>
                                <button className="w-full py-4 border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4">
                                   <Zap size={16} fill="currentColor" /> PROMOTE_TO_PRODUCTION
                                </button>
                             </div>
                          )}
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* COMPILE HUD */}
        <div className="absolute bottom-20 lg:bottom-0 left-0 right-0 h-32 lg:h-36 bg-[#fafafa] dark:bg-black border-t border-black/10 dark:border-white/5 p-6 flex items-center justify-between z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
           <div className="hidden sm:flex items-center gap-12">
              <div className="space-y-2">
                 <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                    <span>Audit Intensity</span>
                    <span className="text-brand-blue">DEEP_STRESS</span>
                 </div>
                 <div className="h-1 w-40 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue w-[85%]"></div>
                 </div>
              </div>
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Validator_Node</span>
                 <p className="text-[11px] font-black uppercase text-black dark:text-white tracking-widest">H100_CLUSTER_A</p>
              </div>
           </div>

           <button 
             onClick={handleAudit}
             disabled={isAnalyzing || !prompt.trim()}
             className="w-full sm:w-auto bg-brand-blue text-white px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-20"
           >
             {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
             RUN_LOGIC_AUDIT
           </button>
        </div>
      </div>

      {/* 3. RISK SIDEBAR (RIGHT) */}
      <div className="hidden xl:flex w-[320px] shrink-0 flex flex-col bg-[#fdfdfd] dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-hidden">
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
               <AlertTriangle className="w-4 h-4 text-brand-blue" /> Production_Risks
            </h3>
         </div>
         <div className="flex-grow overflow-y-auto p-8 space-y-10 no-scrollbar">
            {isAnalyzing ? (
               <div className="py-20 text-center space-y-8 animate-pulse">
                  <Cpu className="w-12 h-12 text-brand-blue mx-auto animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">STRESSING_LOGIC...</p>
               </div>
            ) : evalResult ? (
               <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-red-500">
                        <Flame size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Stability_Flags</span>
                     </div>
                     <div className="space-y-2">
                        {[
                          'Potential hallucination on "remedy" key.',
                          'Token inefficiency in instruction lead.',
                          'Model drift detected on SDXL node.'
                        ].map(flag => (
                           <div key={flag} className="p-3 border border-red-500/10 bg-red-500/5 text-[9px] font-black uppercase text-red-400 tracking-tight leading-tight">
                              !! {flag}
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">REGRESSION_MAP</h4>
                     <div className="aspect-square bg-black border border-white/10 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-10">
                           {Array.from({length: 64}).map((_, i) => <div key={i} className="border-[0.5px] border-brand-blue"></div>)}
                        </div>
                        <Activity className="w-16 h-16 text-brand-blue animate-pulse" />
                     </div>
                  </div>

                  <div className="p-6 border border-brand-blue/20 bg-brand-blue/5 rounded-sm space-y-4">
                     <div className="flex items-center gap-3 text-brand-blue">
                        <CheckCircle size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Optimization_Ready</span>
                     </div>
                     <p className="text-[8px] text-gray-500 font-bold uppercase leading-relaxed tracking-wider">A higher fidelity variant has been computed. Deploy suggested logic to increase reliability by 14%.</p>
                  </div>
               </div>
            ) : (
               <div className="py-24 text-center opacity-10">
                  <Command className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest italic">Awaiting Telemetry</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default PromptIntelInterface;
