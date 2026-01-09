
import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, Loader2, Download, Terminal, 
  Settings2, History as HistoryIcon, Wand2, Info,
  Sparkles, Layers, Cpu, ShieldCheck,
  Grid, LayoutGrid, CheckCircle2, 
  Maximize2, Trash2, Sliders, Palette,
  MousePointer2, Share2, ZoomIn, RefreshCw
} from 'lucide-react';
import { generateDemoImage } from '../services/gemini';

interface GridItem {
  id: string;
  url: string;
  isSelected: boolean;
  isRefined: boolean;
}

const OmniGridDemoInterface = () => {
  const [prompt, setPrompt] = useState('');
  const [batchSize, setBatchSize] = useState(4);
  const [items, setItems] = useState<GridItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeItem, setActiveItem] = useState<GridItem | null>(null);
  const [credits, setCredits] = useState(3);

  // Config States
  const [variation, setVariation] = useState(30);
  const [profile, setProfile] = useState('Marketing_Visuals');

  const handleBatchSynthesis = async () => {
    if (!prompt.trim() || isGenerating || credits <= 0) return;
    setIsGenerating(true);
    setItems([]);
    setActiveItem(null);

    try {
      // Simulate parallel batch calls (in a real app, this would be a single batch endpoint)
      const results: GridItem[] = [];
      const synthesisCount = batchSize;
      
      // We'll generate the first one properly and mock siblings for demo efficiency
      // following the principle: Visual comparison over text
      const firstResult = await generateDemoImage(`[OMNI_GRID] ${prompt}. Variations for professional ${profile}. High fidelity.`);
      
      if (firstResult) {
        results.push({ id: '0', url: firstResult, isSelected: false, isRefined: false });
        
        // Mock siblings with slight variation prompts if batchSize > 1
        for (let i = 1; i < synthesisCount; i++) {
           results.push({ 
             id: i.toString(), 
             url: firstResult, // In a real system these would be unique
             isSelected: false, 
             isRefined: false 
           });
        }
        
        setItems(results);
        setCredits(prev => prev - 1);
      }
    } catch (err) {
      console.error("OmniGrid Batch Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelect = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, isSelected: !item.isSelected } : item));
  };

  const handleRefine = () => {
    if (!activeItem) return;
    setIsGenerating(true);
    setTimeout(() => {
      setItems(prev => prev.map(item => item.id === activeItem.id ? { ...item, isRefined: true } : item));
      setActiveItem(prev => prev ? { ...prev, isRefined: true } : null);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#080808] overflow-hidden text-black dark:text-white">
      
      {/* 1. ORCHESTRATOR SIDEBAR */}
      <div className="w-full lg:w-[350px] shrink-0 flex flex-col border-r border-black/10 dark:border-white/5 bg-gray-50 dark:bg-[#050506] overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
            <Settings2 size={12} className="text-brand-blue" /> Production_Profile
          </label>
          <div className="space-y-3">
            {['Marketing_Visuals', 'Game_Asset_Pack', 'App_UI_Kit', 'Cinematic_Art'].map(p => (
              <button 
                key={p} 
                onClick={() => setProfile(p)}
                className={`w-full p-4 border text-left text-[10px] font-black uppercase transition-all ${profile === p ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-black/5 dark:border-white/5 text-gray-400'}`}
              >
                {p.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-black/10 dark:border-white/5">
           <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em]">Batch_Parameters</label>
           <div className="space-y-6">
              <div className="space-y-3">
                 <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                    <span>Batch Size</span>
                    <span className="text-brand-blue">{batchSize} Units</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {[4, 9, 16].map(s => (
                      <button key={s} onClick={() => setBatchSize(s)} className={`py-2 border text-[10px] font-black ${batchSize === s ? 'bg-brand-blue border-brand-blue text-white' : 'border-black/5 dark:border-white/5 text-gray-400'}`}>{s}</button>
                    ))}
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                    <span>Variation Delta</span>
                    <span className="text-brand-blue">{variation}%</span>
                 </div>
                 <input type="range" min="0" max="100" value={variation} onChange={(e) => setVariation(parseInt(e.target.value))} className="w-full h-1 bg-black/10 dark:bg-white/10 appearance-none rounded-full accent-brand-blue" />
              </div>
           </div>
        </div>

        <div className="mt-auto pt-6 border-t border-black/10 dark:border-white/5">
           <div className="p-4 bg-brand-blue/5 border border-brand-blue/20 space-y-3">
              <div className="flex items-center gap-3 text-brand-blue">
                 <ShieldCheck size={14} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Node Quota: 0{credits}/03</span>
              </div>
              <p className="text-[7px] font-bold text-gray-500 uppercase leading-relaxed">Parallel inference active. Batching enabled.</p>
           </div>
        </div>
      </div>

      {/* 2. GRID VIEWPORT */}
      <div className="flex-grow flex flex-col bg-gray-100 dark:bg-[#020203] relative overflow-hidden">
        <div className="flex-grow flex flex-col p-6 lg:p-10 overflow-y-auto no-scrollbar relative">
           {items.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center opacity-20 space-y-6">
                 <LayoutGrid className="w-24 h-24" />
                 <p className="text-[12px] font-black uppercase tracking-[0.6em]">Awaiting_Batch_Directive</p>
              </div>
           ) : (
              <div className={`grid gap-4 ${batchSize === 4 ? 'grid-cols-2' : batchSize === 9 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                 {items.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setActiveItem(item)}
                      className={`relative aspect-square border transition-all cursor-pointer group overflow-hidden ${activeItem?.id === item.id ? 'ring-2 ring-brand-blue border-transparent' : 'border-black/5 dark:border-white/5 hover:border-brand-blue/50'}`}
                    >
                       <img src={item.url} className={`w-full h-full object-cover transition-all ${item.isRefined ? 'scale-100' : 'scale-105 blur-sm opacity-60'}`} />
                       <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       
                       <button 
                         onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                         className={`absolute top-2 right-2 w-6 h-6 border flex items-center justify-center transition-all ${item.isSelected ? 'bg-brand-blue border-brand-blue text-white' : 'bg-black/40 border-white/20 text-white/50'}`}
                       >
                          <CheckCircle2 size={12} />
                       </button>

                       {item.isRefined && (
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-brand-blue text-white text-[7px] font-black uppercase tracking-widest">Refined_8K</div>
                       )}
                    </div>
                 ))}
              </div>
           )}

           {isGenerating && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-30 flex flex-col items-center justify-center">
                 <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white animate-pulse italic">Synthesizing_Grid_Matrix...</p>
              </div>
           )}
        </div>

        {/* PROMPT FOOTER */}
        <div className="h-32 border-t border-black/10 dark:border-white/5 bg-white dark:bg-black p-4 flex gap-4 shrink-0 relative z-20">
          <div className="flex-grow flex flex-col gap-2">
            <label className="text-[8px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-[0.3em] flex items-center gap-2"><Wand2 size={12} className="text-brand-blue" /> Master_Directive</label>
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              className="flex-grow bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-3 text-[11px] font-black uppercase text-black dark:text-white focus:outline-none focus:border-brand-blue/30 resize-none tracking-tight" 
              placeholder="Describe universal visual concept..." 
            />
          </div>
          <button 
            onClick={handleBatchSynthesis} 
            disabled={isGenerating || !prompt.trim() || credits <= 0} 
            className="w-40 bg-brand-blue text-white flex flex-col items-center justify-center gap-2 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all group shadow-2xl active:scale-[0.98] disabled:opacity-20"
          >
            <Zap size={20} className="fill-current group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Run Batch</span>
          </button>
        </div>
      </div>

      {/* 3. REFINEMENT SIDEBAR */}
      <div className="hidden xl:flex w-[320px] shrink-0 flex flex-col bg-gray-50 dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
            <Sparkles size={14} className="text-brand-blue" /> Selected_Node
          </label>
          
          {activeItem ? (
             <div className="space-y-8">
                <div className="aspect-square border border-black/10 dark:border-white/10 bg-black overflow-hidden relative group">
                   <img src={activeItem.url} className={`w-full h-full object-cover ${activeItem.isRefined ? 'opacity-100' : 'opacity-40 blur-sm'}`} />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                      <ZoomIn className="w-8 h-8 text-white" />
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Refinement_Tools</h4>
                   <div className="space-y-2">
                      {[
                        { icon: <Maximize2 size={12} />, label: '8K_Upscale' },
                        { icon: <Layers size={12} />, label: 'Detail_Inject' },
                        { icon: <Palette size={12} />, label: 'Color_Norm' }
                      ].map(tool => (
                        <button 
                          key={tool.label}
                          onClick={handleRefine}
                          disabled={isGenerating || activeItem.isRefined}
                          className="w-full p-3 border border-black/5 dark:border-white/5 bg-white dark:bg-white/[0.02] flex items-center gap-4 text-[9px] font-black uppercase text-gray-600 dark:text-gray-400 hover:border-brand-blue transition-all disabled:opacity-30"
                        >
                           {tool.icon} {tool.label}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="pt-6 border-t border-black/10 dark:border-white/5 flex gap-2">
                   <button className="flex-grow py-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-[9px] font-black uppercase tracking-widest hover:text-brand-blue transition-all">Export_Candidate</button>
                   <button className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                </div>
             </div>
          ) : (
             <div className="py-20 text-center border border-dashed border-black/10 dark:border-white/10 opacity-20">
                <MousePointer2 className="mx-auto mb-4" />
                <p className="text-[8px] font-black uppercase tracking-widest">Select Candidate <br /> For Refinement</p>
             </div>
          )}
        </div>

        {items.some(i => i.isSelected) && (
           <div className="mt-auto pt-6 border-t border-black/10 dark:border-white/5 animate-in slide-in-from-bottom-4">
              <button className="w-full bg-brand-blue text-white py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all">
                 Package_Selected_({items.filter(i => i.isSelected).length})
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default OmniGridDemoInterface;
