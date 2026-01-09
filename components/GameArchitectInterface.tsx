
import React, { useState } from 'react';
import { 
  BrainCircuit, Workflow, Settings2, Loader2, Zap, 
  Terminal, ShieldCheck, History as HistoryIcon, 
  Plus, Save, LayoutGrid, Code2, Database, Target, 
  Sliders, Activity, Bot, Cpu, MonitorPlay, Square,
  ImageIcon, Download, Boxes, Layers, ChevronRight,
  Maximize2, Box, Share2
} from 'lucide-react';
import { generateDemoText, generateDemoImage } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulationState {
  id: string;
  genre: string;
  loop: string;
  npcLogic: string;
  difficultyCurve: number;
  imageUrl?: string;
  timestamp: string;
}

const GameArchitectInterface = () => {
  const [projectTitle, setProjectTitle] = useState('CYBER_DRIFT_2099');
  const [genre, setGenre] = useState('3D_Cinematic_Voxel');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<SimulationState[]>([]);
  const [logicSummary, setLogicSummary] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const [weights, setWeights] = useState({
    voxelDensity: 88,
    physicsRigidity: 42,
    lightScattering: 65,
    worldComplexity: 92
  });

  const handleSimulate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setLogicSummary(null);
    setActiveImage(null);
    
    try {
      // 1. Generate Logic Summary
      const textPrompt = `Generate a technical 3D architectural logic for ${projectTitle} (${genre}). 
      Params: Density ${weights.voxelDensity}%, Rigidity ${weights.physicsRigidity}%, Scattering ${weights.lightScattering}%.
      Explain: 1. Geometry Instancing 2. PBR Material Logic 3. Global Illumination Strategy. 
      Tone: Chief AI Architect Technical Digest.`;
      
      const resText = await generateDemoText(textPrompt);
      setLogicSummary(resText);

      // 2. Generate Visual Preview
      const imgPrompt = `Extreme close-up of high-detail cinematic 3D geometry from ${projectTitle}. 
      Voxel-based environment, glowing emerald energy streams, volumetric fog, Unreal Engine 5 render style, 8k resolution.`;
      
      const resImg = await generateDemoImage(imgPrompt);
      if (resImg) setActiveImage(resImg);

      setHistory(prev => [{
        id: Date.now().toString(),
        genre,
        loop: 'Logic_Nodes_Compiled',
        npcLogic: 'Procedural_Entity_Active',
        difficultyCurve: weights.worldComplexity,
        imageUrl: resImg || undefined,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev]);

    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#030304] overflow-hidden text-black dark:text-white font-mono relative">
      
      {/* 1. LEFT SIDEBAR: PARAMETERS */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col bg-gray-50 dark:bg-[#050506] border-r border-black/10 dark:border-white/5 overflow-y-auto no-scrollbar p-8 space-y-10">
        <div className="space-y-8">
           <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
              <Settings2 className="w-4 h-4 text-emerald-500" /> Geometry_Matrix
           </label>
           
           <div className="space-y-8">
              <div className="space-y-2">
                 <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest px-1">Engine_Pipeline</span>
                 <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 text-[10px] font-black uppercase outline-none focus:border-emerald-500 transition-all rounded-sm">
                    <option>3D_Cinematic_Voxel</option>
                    <option>Photorealistic_Env</option>
                    <option>Stylized_Low_Poly</option>
                 </select>
              </div>

              {Object.entries(weights).map(([key, val]) => (
                <div key={key} className="space-y-3">
                   <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
                      <span>{key.replace(/([A-Z])/g, '_$1').toUpperCase()}</span>
                      <span className="text-emerald-500">{val}%</span>
                   </div>
                   <input type="range" min="0" max="100" value={val} onChange={(e) => setWeights({...weights, [key]: parseInt(e.target.value)})} className="w-full h-1 bg-black/10 dark:bg-white/10 appearance-none rounded-full accent-emerald-500" />
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-8 pt-8 border-t border-black/10 dark:border-white/5">
           <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-[0.4em] flex items-center gap-3">
              <HistoryIcon className="w-4 h-4 text-emerald-500" /> Voxel_Vault
           </label>
           <div className="space-y-3">
              {history.length === 0 ? (
                 <div className="py-12 text-center opacity-10 border border-dashed border-white/10">
                    <Database className="w-8 h-8 mx-auto mb-4" />
                    <p className="text-[9px] font-black uppercase tracking-widest">No Manifests</p>
                 </div>
              ) : (
                 history.map((h) => (
                    <div key={h.id} onClick={() => setActiveImage(h.imageUrl || null)} className="p-4 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/10 flex items-center gap-4 group cursor-pointer hover:border-emerald-500 transition-all">
                       <div className="w-10 h-10 bg-black rounded overflow-hidden shrink-0 grayscale group-hover:grayscale-0">
                          {h.imageUrl && <img src={h.imageUrl} className="w-full h-full object-cover" />}
                       </div>
                       <div className="flex-grow min-w-0">
                          <p className="text-[9px] font-black uppercase truncate">{h.genre}</p>
                          <p className="text-[7px] font-bold text-gray-500">{h.timestamp}</p>
                       </div>
                       <ChevronRight size={14} className="text-gray-700 group-hover:text-emerald-500" />
                    </div>
                 ))
              )}
           </div>
        </div>
      </div>

      {/* 2. CENTER: RENDERING VIEWPORT */}
      <div className="flex-grow flex flex-col bg-white dark:bg-[#020202] relative overflow-hidden">
        <div className="flex-grow flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-y-auto no-scrollbar">
           <div className="w-full max-w-5xl h-full flex flex-col gap-10">
              
              {/* Visual Display */}
              <div className="h-2/3 bg-slate-50 dark:bg-black border border-black/5 dark:border-white/5 relative overflow-hidden flex items-center justify-center shadow-2xl rounded-sm">
                 <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-12">
                         <div className="relative">
                            <Loader2 className="w-24 h-24 text-emerald-500 animate-spin" strokeWidth={1} />
                            <Boxes className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/40 animate-pulse" />
                         </div>
                         <div className="text-center space-y-3">
                            <p className="text-[14px] font-black uppercase tracking-[1em] text-emerald-500 animate-pulse">Orchestrating_3D_Lattice</p>
                            <div className="h-0.5 w-64 bg-white/5 rounded-full overflow-hidden">
                               <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-full bg-emerald-500" />
                            </div>
                         </div>
                      </motion.div>
                    ) : activeImage ? (
                      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full h-full group">
                         <img src={activeImage} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                         
                         <div className="absolute bottom-8 left-8 space-y-3">
                            <div className="flex gap-2">
                               <span className="bg-emerald-500 text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest italic">NEURAL_RENDER_v7</span>
                               <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-white/10">8K_UHD</span>
                            </div>
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">{projectTitle}</h3>
                         </div>

                         <div className="absolute top-8 right-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-transform"><Download size={20}/></button>
                            {/* Added missing Share2 icon */}
                            <button className="p-4 bg-emerald-500 text-black rounded-full shadow-2xl hover:scale-110 transition-transform"><Share2 size={20}/></button>
                         </div>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center gap-8 opacity-10">
                         <Box size={100} strokeWidth={0.5} />
                         <p className="text-xl font-black uppercase tracking-[1em]">Signal_Standby</p>
                      </div>
                    )}
                 </AnimatePresence>

                 {/* HUD Layer */}
                 <div className="absolute top-8 left-8 flex items-center gap-8 pointer-events-none z-20">
                    <div className="flex items-center gap-3 text-emerald-500/60 text-[10px] font-black uppercase tracking-widest">
                       <Activity size={14} className="animate-pulse" /> CLUSTER_LOAD: 42%
                    </div>
                    <div className="h-4 w-px bg-white/10"></div>
                    <div className="flex items-center gap-3 text-brand-blue/60 text-[10px] font-black uppercase tracking-widest">
                       <Cpu size={14} /> NVLINK: OPTIMAL
                    </div>
                 </div>
              </div>

              {/* Logic Terminal */}
              <div className="h-1/3 border border-black/10 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] p-10 overflow-y-auto custom-scrollbar relative shadow-inner">
                 <div className="absolute top-4 right-4"><Code2 size={16} className="text-emerald-500 opacity-20" /></div>
                 {logicSummary ? (
                   <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="flex items-center gap-4 text-emerald-500">
                         <Terminal size={18} />
                         <span className="text-[11px] font-black uppercase tracking-[0.4em]">Architectural_Manifest</span>
                      </div>
                      <p className="text-[12px] leading-relaxed text-gray-600 dark:text-gray-400 font-medium italic whitespace-pre-wrap">{logicSummary}</p>
                   </div>
                 ) : (
                   <div className="flex items-center justify-center h-full">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-700 uppercase tracking-widest animate-pulse">// Awaiting simulation data pipeline...</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* INPUT HUD */}
        <div className="h-40 border-t border-black/10 dark:border-white/5 bg-[#fafafa] dark:bg-black p-8 flex items-center gap-10 shrink-0 relative z-30 shadow-[0_-20px_60px_rgba(0,0,0,0.05)]">
           <div className="flex-grow flex flex-col gap-3">
              <label className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-2">
                 <Target size={12} className="text-emerald-500" /> Project_Directive
              </label>
              <input 
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value.toUpperCase())}
                className="w-full bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 p-5 text-[22px] font-black text-emerald-500 outline-none focus:border-emerald-500/40 tracking-widest italic rounded-sm transition-all"
                placeholder="NARRATIVE_IDENTIFIER..."
              />
           </div>
           <button 
             onClick={handleSimulate}
             disabled={isGenerating}
             className="w-80 bg-emerald-500 text-black h-24 flex flex-col items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_20px_80px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-20 group relative overflow-hidden rounded-sm"
           >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Zap size={28} fill="currentColor" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em]">Generate Synthesis</span>
           </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default GameArchitectInterface;
