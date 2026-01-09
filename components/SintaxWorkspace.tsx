
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Layers, LayoutGrid, Terminal, 
  Settings2, Copy, FileCode, Braces, 
  Trash2, Plus, Move, CheckCircle2,
  ShieldCheck, Activity, Box, Database,
  Wand2, Sparkles, AlertCircle, Loader2,
  History as HistoryIcon
} from 'lucide-react';
import { generateDemoText } from '../services/gemini';

interface Module {
  id: string;
  type: string;
  label: string;
  content: string;
  placeholder: string;
  description: string;
}

const MODULE_LIBRARY: Omit<Module, 'id'>[] = [
  { type: 'persona', label: 'Persona Strategy', content: 'Act as a Principal Design Architect specialized in enterprise AI systems...', placeholder: 'Define system identity and domain expertise...', description: 'Determines the expertise level and character tone.' },
  { type: 'objective', label: 'Mission Objective', content: 'The primary objective is to architect a scalable solution for...', placeholder: 'State the high-level mission goal...', description: 'Defines exactly what the system must achieve.' },
  { type: 'context', label: 'Operational Context', content: 'Operate within the environmental parameters of a global agency with focus on...', placeholder: 'Provide situational awareness and constraints...', description: 'Sets the background and operational boundaries.' },
  { type: 'constraints', label: 'System Restrictions', content: 'Avoid colloquialisms. Prioritize technical precision and deterministic logic...', placeholder: 'Define negative constraints and boundary limits...', description: 'Ensures strict compliance with quality standards.' },
  { type: 'format', label: 'Output Specification', content: 'Provide the terminal result in a strictly structured JSON format following...', placeholder: 'Define data delivery structure (JSON, YAML, etc)...', description: 'Sets the technical delivery format for the pipeline.' }
];

const SintaxWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeModules, setActiveModules] = useState<Module[]>([]);
  const [exportFormat, setExportFormat] = useState<'TEXT' | 'JSON'>('TEXT');
  const [blueprintName, setBlueprintName] = useState('Narrative Blueprint Alpha');
  const [isCopied, setIsCopied] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const addModule = (libMod: Omit<Module, 'id'>) => {
    setActiveModules([...activeModules, { ...libMod, id: `mod-${Date.now()}` }]);
    setAiSuggestion(null);
  };

  const removeModule = (id: string) => setActiveModules(prev => prev.filter(m => m.id !== id));
  
  const updateModule = (id: string, content: string) => {
    setActiveModules(prev => prev.map(m => m.id === id ? { ...m, content } : m));
  };

  const compiledText = useMemo(() => {
    return activeModules.map(m => `[${m.label.toUpperCase()}]\n${m.content}`).join('\n\n');
  }, [activeModules]);

  const compiledJSON = useMemo(() => {
    return JSON.stringify({
      blueprint: blueprintName,
      architecture: activeModules.map(m => ({ nodeType: m.type, payload: m.content }))
    }, null, 2);
  }, [activeModules, blueprintName]);

  const handleAiRefine = async () => {
    if (activeModules.length === 0 || isThinking) return;
    setIsThinking(true);
    setAiSuggestion(null);

    try {
      const current = activeModules.map(m => `${m.label}: ${m.content}`).join('\n');
      const res = await generateDemoText(`You are an Expert AI Prompt Architect. Analyze this modular structure and suggest 3 high-impact technical refinements to increase deterministic precision. Focus on professional B2B clarity. Keep it concise.\n\n${current}`);
      setAiSuggestion(res);
    } catch (err) {
      setAiSuggestion("Neural connection error. Retry uplink.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportFormat === 'JSON' ? compiledJSON : compiledText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#fafafc] dark:bg-[#030304] text-black dark:text-white font-sans overflow-hidden selection:bg-brand-blue/20">
      
      {/* --- MODULE PICKER (LEFT) --- */}
      <aside className="w-full lg:w-[320px] shrink-0 flex flex-col border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#080808] flex flex-col shadow-xl z-50 transition-colors">
        <div className="p-6 border-b border-black/5 dark:border-white/5 bg-brand-blue/5 flex items-center gap-3">
           <Database size={16} className="text-brand-blue" />
           <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Architectural Blocks</h3>
        </div>
        <div className="flex-grow overflow-y-auto no-scrollbar p-4 space-y-2">
           {MODULE_LIBRARY.map(libMod => (
             <button key={libMod.type} onClick={() => addModule(libMod)} className="w-full p-4 border border-black/5 dark:border-white/5 text-left transition-all hover:border-brand-blue/40 group bg-gray-50/50 dark:bg-white/5 rounded-sm">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] font-black uppercase group-hover:text-brand-blue">{libMod.label}</span>
                   <Plus size={14} className="text-gray-300" />
                </div>
                <p className="text-[8px] text-gray-500 uppercase leading-relaxed italic">"{libMod.description}"</p>
             </button>
           ))}
        </div>
      </aside>

      {/* --- CANVAS (CENTER) --- */}
      <main className="flex-grow flex flex-col relative bg-white dark:bg-[#020202]">
        <div className="h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 shrink-0 bg-white/50 dark:bg-black/50 backdrop-blur-md">
           <div className="flex items-center gap-4">
              <input 
                value={blueprintName} onChange={e => setBlueprintName(e.target.value)}
                className="bg-transparent border-none text-[11px] font-black uppercase text-brand-blue tracking-[0.2em] outline-none focus:text-black dark:focus:text-white w-72"
              />
              <div className="px-2 py-0.5 bg-brand-blue/10 border border-brand-blue/30 rounded-sm">
                 <span className="text-[7px] font-black text-brand-blue uppercase">Production Node Active</span>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={20}/></button>
        </div>

        <div className="flex-grow overflow-y-auto p-12 no-scrollbar relative">
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #0090ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

           <div className="max-w-2xl mx-auto space-y-6 pb-40 relative z-10">
              {activeModules.length === 0 ? (
                <div className="py-40 text-center opacity-10 space-y-6 flex flex-col items-center">
                   <LayoutGrid size={64} strokeWidth={1} />
                   <p className="text-[12px] font-black uppercase tracking-[0.6em]">Initialize System Blueprint</p>
                </div>
              ) : (
                <AnimatePresence>
                   {activeModules.map((mod, idx) => (
                      <motion.div key={mod.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 bg-[#fafafc] dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-sm group hover:border-brand-blue/30 transition-all">
                         <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                               <span className="text-[8px] font-black text-gray-400 uppercase">Block 0{idx+1} // {mod.label}</span>
                            </div>
                            <button onClick={() => removeModule(mod.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
                         </div>
                         <textarea 
                           value={mod.content} onChange={(e) => updateModule(mod.id, e.target.value)}
                           className="w-full bg-transparent border-none text-[13px] font-medium text-black dark:text-white/80 focus:outline-none focus:text-black dark:focus:text-white resize-none min-h-[60px] leading-relaxed"
                           placeholder={mod.placeholder}
                         />
                      </motion.div>
                   ))}
                </AnimatePresence>
              )}
           </div>
        </div>

        {/* --- AI ACTION FLOATER --- */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[70] flex gap-4">
           <button 
             onClick={handleAiRefine}
             disabled={isThinking || activeModules.length === 0}
             className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 rounded-sm"
           >
              {isThinking ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-brand-blue" />}
              Perform Structural Analysis
           </button>
        </div>
      </main>

      {/* --- LIVE MANIFEST (RIGHT) --- */}
      <aside className="w-full lg:w-[400px] shrink-0 border-l border-black/5 dark:border-white/5 bg-white dark:bg-[#050506] flex flex-col shadow-2xl z-50">
         <div className="p-6 h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-black/50">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Output</h3>
            <div className="flex gap-2">
               {['TEXT', 'JSON'].map(f => (
                  <button key={f} onClick={() => setExportFormat(f as any)} className={`text-[8px] font-black px-3 py-1 transition-all rounded-sm ${exportFormat === f ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}>{f}</button>
               ))}
            </div>
         </div>

         <div className="flex-grow overflow-y-auto p-6 lg:p-8 no-scrollbar space-y-8">
            {/* Output Panel */}
            <div className="p-6 bg-black text-[#00ff41] font-mono text-[11px] leading-relaxed border border-white/5 min-h-[300px] break-words whitespace-pre-wrap shadow-inner">
               {exportFormat === 'JSON' ? compiledJSON : (compiledText || '// Awaiting system input...')}
            </div>

            {/* AI Suggestion Panel */}
            {aiSuggestion && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 border border-brand-blue/20 bg-brand-blue/5 rounded-sm space-y-3">
                  <div className="flex items-center gap-2 text-brand-blue">
                     <Wand2 size={14} />
                     <span className="text-[9px] font-black uppercase tracking-widest">Architectural Refinement</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed italic border-l border-brand-blue/30 pl-4">
                    {aiSuggestion}
                  </p>
               </motion.div>
            )}
         </div>

         <div className="p-8 border-t border-black/5 dark:border-white/5 space-y-4 bg-gray-50/50 dark:bg-black/50">
            <button onClick={handleCopy} className="w-full py-5 bg-brand-blue text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 rounded-sm">
               {isCopied ? <CheckCircle2 size={16}/> : <Copy size={16}/>}
               {isCopied ? 'Specification Copied' : 'Copy Prompt Specification'}
            </button>
            <div className="flex justify-between text-[8px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest italic">
               <span className="flex items-center gap-2"><ShieldCheck size={12} className="text-green-500"/> Authorized Node</span>
               <span className="flex items-center gap-2">
                 <HistoryIcon size={12} className="mr-1" />
                 Global Sync: Active
               </span>
            </div>
         </div>
      </aside>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SintaxWorkspace;
