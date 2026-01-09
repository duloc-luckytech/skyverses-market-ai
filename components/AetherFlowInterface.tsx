
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Loader2, Code2, Terminal, Play, 
  Plus, Save, Layers, Box, 
  Settings2, Activity, Braces, Copy, Share2, 
  Eye, Cpu, Command, Search, Database,
  ArrowRight, Workflow, LayoutGrid, Trash2,
  X, Image as ImageIcon, Video, Mic2, Gamepad,
  CheckCircle, AlertCircle, RefreshCw, BarChart3
} from 'lucide-react';
import { generateDemoText, generateDemoImage } from '../services/gemini';

type NodeType = 'PROMPT' | 'IMAGE' | 'LOGIC' | 'SCENE' | 'VOICE';

interface Node {
  id: string;
  type: NodeType;
  label: string;
  prompt: string;
  status: 'idle' | 'running' | 'done' | 'error';
  output?: string;
  executionTime?: number;
}

const MAX_CONTEXT_CHARS = 300000; // ~75,000 tokens safety limit

const AetherFlowInterface = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'PROMPT', label: 'Scene Architect', prompt: 'Design a cinematic interior of a floating library above a storm.', status: 'idle' },
    { id: '2', type: 'IMAGE', label: 'Visual Synthesizer', prompt: 'Convert the previous description into a highly detailed 8K render directive.', status: 'idle' }
  ]);
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0].id);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Orchestrator v1.0.4 booting...', '[SYSTEM] Neural link established.']);
  const [contextSize, setContextSize] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const addNode = (type: NodeType) => {
    const newNode: Node = {
      id: Date.now().toString(),
      type,
      label: `Node_${nodes.length + 1}`,
      prompt: '',
      status: 'idle'
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
    setLogs(prev => [...prev, `[NODE] Added new ${type} unit.`]);
  };

  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const updateNodePrompt = (id: string, prompt: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, prompt } : n));
  };

  const truncateContext = (text: string) => {
    if (text.length > MAX_CONTEXT_CHARS) {
      setLogs(prev => [...prev, '[WARNING] Context window limit approaching. Truncating historical buffer.']);
      return text.slice(-MAX_CONTEXT_CHARS);
    }
    return text;
  };

  const executePipeline = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setLogs(prev => [...prev, '[PIPELINE] Sequential execution initiated.']);
    setContextSize(0);

    let currentContext = "";

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const startTime = Date.now();
      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'running' } : n));
      setLogs(prev => [...prev, `[NODE] Running ${node.label}...`]);

      try {
        let output = "";
        // Clean and truncate context to prevent token capacity errors
        const truncatedContext = truncateContext(currentContext);
        setContextSize(truncatedContext.length);
        
        const compositePrompt = i === 0 
          ? node.prompt 
          : `PIPELINE_CONTEXT: ${truncatedContext}\n\nCURRENT_DIRECTIVE: ${node.prompt}`;

        if (node.type === 'IMAGE') {
          const res = await generateDemoImage(compositePrompt);
          if (res === "ERROR_IMAGE_CONTEXT_OVERFLOW") throw new Error("TOKEN_LIMIT_EXCEEDED");
          output = res || "IMAGE_BUFFER_ERROR";
        } else {
          const res = await generateDemoText(compositePrompt);
          if (res === "ERROR_TOKEN_CAPACITY_EXCEEDED") throw new Error("TOKEN_LIMIT_EXCEEDED");
          output = res;
        }

        const duration = (Date.now() - startTime) / 1000;
        setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'done', output, executionTime: duration } : n));
        setLogs(prev => [...prev, `[NODE] ${node.label} completed in ${duration}s.`]);
        currentContext = output;
      } catch (err: any) {
        setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'error' } : n));
        const errMsg = err.message === "TOKEN_LIMIT_EXCEEDED" 
          ? "CRITICAL: Context Window Exceeded. Try reducing previous outputs." 
          : `SYSTEM_ERROR: ${err.message || 'UNKNOWN'}`;
        setLogs(prev => [...prev, `[ERROR] ${errMsg}`]);
        break;
      }
    }

    setIsExecuting(false);
    setLogs(prev => [...prev, '[PIPELINE] Execution cycle finished.']);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#030304] overflow-hidden text-black dark:text-white font-mono">
      
      {/* 1. NODE LIBRARY (LEFT) */}
      <div className="w-full lg:w-[280px] shrink-0 flex flex-col bg-[#fdfdfd] dark:bg-[#050506] border-r border-black/10 dark:border-white/5">
         <div className="p-6 border-b border-black/10 dark:border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Node_Library</h3>
         </div>
         <div className="flex-grow overflow-y-auto p-4 space-y-2 no-scrollbar">
            {[
              { type: 'PROMPT', icon: <Terminal size={14} />, desc: 'Text synthesis' },
              { type: 'IMAGE', icon: <ImageIcon size={14} />, desc: 'Visual generation' },
              { type: 'LOGIC', icon: <Braces size={14} />, desc: 'Reasoning logic' },
              { type: 'SCENE', icon: <Video size={14} />, desc: 'Scene breakdown' },
              { type: 'VOICE', icon: <Mic2 size={14} />, desc: 'Voice scripting' }
            ].map(item => (
              <button 
                key={item.type}
                onClick={() => addNode(item.type as NodeType)}
                className="w-full flex items-center gap-4 p-4 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-brand-blue/40 hover:bg-brand-blue/[0.02] transition-all group rounded-sm"
              >
                <div className="p-2 border border-black/10 dark:border-white/10 group-hover:border-brand-blue/50 text-gray-400 group-hover:text-brand-blue transition-all">
                  {item.icon}
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-black uppercase tracking-widest">{item.type}</p>
                   <p className="text-[8px] text-gray-500 uppercase">{item.desc}</p>
                </div>
              </button>
            ))}
         </div>
         <div className="p-6 mt-auto border-t border-black/10 dark:border-white/5 space-y-4">
            <div className="p-4 bg-brand-blue/5 border border-brand-blue/20 space-y-3">
               <div className="flex items-center justify-between text-brand-blue">
                  <div className="flex items-center gap-2">
                    <Cpu size={12} />
                    <span className="text-[8px] font-black uppercase">Edge_Processing</span>
                  </div>
                  <div className="text-[8px] font-black bg-brand-blue/10 px-1.5 py-0.5 rounded">LOCAL</div>
               </div>
               <p className="text-[7px] text-gray-500 uppercase leading-relaxed font-bold">Client-side execution powered by Gemini 3 Flash.</p>
            </div>
            <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-400 px-1">
               <span>Context Load</span>
               <span className={contextSize > MAX_CONTEXT_CHARS * 0.8 ? 'text-red-500' : 'text-brand-blue'}>
                 {Math.round((contextSize / MAX_CONTEXT_CHARS) * 100)}%
               </span>
            </div>
         </div>
      </div>

      {/* 2. CANVAS (CENTER) */}
      <div className="flex-grow flex flex-col bg-white dark:bg-[#020202] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #0090ff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="flex-grow overflow-auto p-12 lg:p-20 relative z-10 flex flex-col items-center no-scrollbar">
           <div className="w-full max-w-2xl space-y-12 pb-40">
              {nodes.length === 0 ? (
                <div className="py-40 text-center opacity-10 flex flex-col items-center gap-6">
                   <Workflow size={64} />
                   <p className="text-[12px] font-black uppercase tracking-[0.6em]">Initialize_Node_Sequence</p>
                </div>
              ) : (
                nodes.map((node, idx) => (
                  <div key={node.id} className="relative group">
                    <div 
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`relative z-10 w-full p-6 border transition-all cursor-pointer ${selectedNodeId === node.id ? 'border-brand-blue bg-brand-blue/[0.02] shadow-[0_0_40px_rgba(0,144,255,0.05)]' : 'bg-white dark:bg-black border-black/10 dark:border-white/5 hover:border-brand-blue/30'}`}
                    >
                      <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center gap-3">
                            <span className="text-[8px] font-black text-gray-400">NODE_0{idx+1}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">{node.type}</span>
                         </div>
                         <div className="flex items-center gap-4">
                            {node.executionTime && (
                              <span className="text-[8px] font-black text-gray-400 uppercase">{node.executionTime}s</span>
                            )}
                            <span className={`text-[7px] font-black uppercase tracking-widest ${node.status === 'done' ? 'text-green-500' : node.status === 'running' ? 'text-brand-blue animate-pulse' : node.status === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
                               {node.status}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); removeNode(node.id); }} className="text-gray-300 hover:text-red-500 transition-colors">
                               <Trash2 size={12} />
                            </button>
                         </div>
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-tight text-black dark:text-white truncate">{node.label}</h4>
                      {node.output && (
                         <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                            {node.type === 'IMAGE' ? (
                               <div className="aspect-video bg-black/5 border border-black/5 dark:border-white/5 overflow-hidden">
                                  <img src={node.output} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                               </div>
                            ) : (
                               <p className="text-[10px] text-gray-500 line-clamp-2 italic">"{node.output}"</p>
                            )}
                         </div>
                      )}
                    </div>
                    {idx < nodes.length - 1 && (
                      <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 flex flex-col items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                         <div className="w-[1px] h-12 bg-brand-blue"></div>
                         <ArrowRight className="rotate-90 w-3 h-3 text-brand-blue" />
                      </div>
                    )}
                  </div>
                ))
              )}
           </div>
        </div>

        {/* BOTTOM HUD */}
        <div className="absolute bottom-0 left-0 right-0 h-32 lg:h-36 bg-[#fafafa] dark:bg-black border-t border-black/10 dark:border-white/5 p-6 flex flex-col lg:flex-row items-center justify-between z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
           <div className="hidden lg:flex flex-col gap-3 flex-grow max-w-xl">
              <div className="flex justify-between items-center">
                 <label className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-2">
                    <Activity size={12} /> Telemetry_Logs
                 </label>
                 <div className="flex gap-4 text-[8px] font-black uppercase text-gray-300">
                    <span>In-Memory: {Math.round(contextSize / 1024)}KB</span>
                    <span>Safety_Mode: ACTIVE</span>
                 </div>
              </div>
              <div ref={scrollRef} className="bg-black/5 dark:bg-white/[0.01] border border-black/5 dark:border-white/10 p-3 h-20 overflow-y-auto no-scrollbar font-mono text-[9px] text-gray-400">
                 {logs.map((log, i) => (
                   <div key={i} className={log.includes('[ERROR]') ? 'text-red-500' : log.includes('[WARNING]') ? 'text-yellow-500' : ''}>
                     {log}
                   </div>
                 ))}
              </div>
           </div>

           <div className="flex items-center gap-6">
              <button 
                onClick={executePipeline} disabled={isExecuting || nodes.length === 0}
                className="bg-brand-blue text-white px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-20 rounded-sm"
              >
                {isExecuting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play size={16} fill="currentColor" />}
                EXECUTE_WORKFLOW
              </button>
           </div>
        </div>
      </div>

      {/* 3. INSPECTOR (RIGHT) */}
      <div className="hidden xl:flex w-[350px] shrink-0 flex flex-col bg-[#fdfdfd] dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-hidden">
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
               <Settings2 className="w-4 h-4 text-brand-blue" /> Node_Inspector
            </h3>
         </div>
         <div className="flex-grow overflow-y-auto p-8 space-y-10 no-scrollbar">
            {selectedNode ? (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase text-gray-400">Identification</label>
                     <input 
                       value={selectedNode.label} 
                       onChange={(e) => setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, label: e.target.value.toUpperCase() } : n))}
                       className="w-full bg-transparent border-b border-black/10 dark:border-white/10 p-1 text-xs font-black uppercase text-brand-blue focus:border-brand-blue outline-none" 
                     />
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black uppercase text-gray-400">Directive_Payload</label>
                        <span className="text-[8px] font-black text-gray-300">{selectedNode.prompt.length} CH</span>
                     </div>
                     <textarea 
                       value={selectedNode.prompt} 
                       onChange={(e) => updateNodePrompt(selectedNode.id, e.target.value)}
                       className="w-full h-40 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 p-4 text-[11px] leading-relaxed text-black dark:text-white focus:outline-none focus:border-brand-blue/30 resize-none font-mono"
                       placeholder="Enter neural instruction..."
                     />
                  </div>

                  {selectedNode.output && (
                     <div className="space-y-4 pt-8 border-t border-black/10 dark:border-white/5">
                        <div className="flex justify-between items-center">
                           <label className="text-[9px] font-black uppercase text-green-500 flex items-center gap-2"><CheckCircle size={12} /> Last_Output</label>
                           <button onClick={() => setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, output: undefined, status: 'idle' } : n))} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"><RefreshCw size={10} /></button>
                        </div>
                        <div className="p-4 bg-black text-[#00ff41] text-[10px] leading-relaxed font-mono border border-[#00ff41]/20 break-words whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                           {selectedNode.type === 'IMAGE' ? "IMAGE_BINARY_STORED" : selectedNode.output}
                        </div>
                     </div>
                  )}
               </div>
            ) : (
               <div className="py-24 text-center opacity-10">
                  <Command className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest italic">Awaiting Selection</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default AetherFlowInterface;
