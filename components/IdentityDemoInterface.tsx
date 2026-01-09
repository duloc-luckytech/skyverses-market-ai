
import React, { useState, useRef } from 'react';
import { 
  UserCheck, Dna, Fingerprint, Lock, 
  Settings2, Download, Loader2, Zap, 
  Terminal, History as HistoryIcon, Plus, Upload, 
  Image as ImageIcon, User, Sliders,
  CheckCircle2, Info, Camera, Palette
} from 'lucide-react';
import { generateDemoImage } from '../services/gemini';

interface Version {
  url: string;
  timestamp: string;
  metadata: string;
}

const IdentityDemoInterface = () => {
  // Character DNA State
  const [charName, setCharName] = useState('NOVA_CORE_01');
  const [charDescription, setCharDescription] = useState('Pale skin, cybernetic blue eyes, sharp jawline, short silver pixie hair.');
  const [locks, setLocks] = useState({ face: true, proportions: true, skin: true });

  // Directives State
  const [scenePrompt, setScenePrompt] = useState('sitting in a rain-slicked cyberpunk street, neon reflection on face');
  const [outfit, setOutfit] = useState('Obsidian tactical gear');
  const [style, setStyle] = useState('Cinematic Photorealistic');
  const [camera, setCamera] = useState('Close Up, 85mm');

  // App State
  const [activeImage, setActiveImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600');
  const [versions, setVersions] = useState<Version[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSynthesis = async () => {
    if (!scenePrompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const identityAnchor = `Character name: ${charName}. Physical appearance: ${charDescription}. Must maintain strict facial geometry.`;
      const finalPrompt = `[IDENTITY_LOCK: ${locks.face ? 'HIGH' : 'OFF'}] ${identityAnchor} Scene: ${scenePrompt}. Wearing: ${outfit}. Style: ${style}. Camera: ${camera}. Ultra high resolution, consistent character details.`;
      
      const result = await generateDemoImage(finalPrompt);
      if (result) {
        setActiveImage(result);
        setVersions(prev => [{
          url: result,
          timestamp: new Date().toLocaleTimeString(),
          metadata: `${outfit} // ${style}`
        }, ...prev]);
      }
    } catch (err) {
      console.error("Identity Synthesis Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleLock = (key: keyof typeof locks) => {
    setLocks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#080808] overflow-hidden text-black dark:text-white">
      {/* Identity Sidebar */}
      <div className="w-full lg:w-[350px] shrink-0 flex flex-col border-r border-black/10 dark:border-white/5 bg-gray-50 dark:bg-[#050506] overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
            <Dna size={12} className="text-brand-blue" /> Character_DNA
          </label>
          <div className="p-4 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-4 shadow-sm">
            <div className="space-y-1">
              <label className="text-[7px] font-black uppercase text-gray-400 dark:text-gray-700">Designation</label>
              <input 
                value={charName} 
                onChange={(e) => setCharName(e.target.value.toUpperCase())} 
                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 text-brand-blue text-xs font-black uppercase outline-none focus:border-brand-blue pb-1" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[7px] font-black uppercase text-gray-400 dark:text-gray-700">Morphology</label>
              <textarea 
                value={charDescription} 
                onChange={(e) => setCharDescription(e.target.value)} 
                className="w-full h-16 bg-transparent border border-black/5 dark:border-white/5 p-2 text-[10px] font-medium text-gray-600 dark:text-gray-400 focus:outline-none resize-none italic" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em]">Consistency_Matrix</label>
          <div className="space-y-1.5">
            {Object.entries(locks).map(([key, val]) => (
              <button 
                key={key} 
                onClick={() => toggleLock(key as any)} 
                className={`w-full p-3 border flex justify-between items-center transition-all ${val ? 'border-brand-blue/40 bg-brand-blue/5 text-brand-blue' : 'border-black/5 dark:border-white/5 text-gray-400 opacity-50'}`}
              >
                <span className="text-[8px] font-black uppercase">{key}_Geometry</span>
                {val ? <Lock size={10} className="text-brand-blue" /> : <Plus size={10} className="text-gray-400" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-black/10 dark:border-white/5">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3 mb-4">
            <Fingerprint size={12} className="text-brand-blue" /> Anchors
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue transition-all">
              <Upload size={16} className="text-gray-400 mb-1" />
              <span className="text-[7px] font-black uppercase text-gray-400">Add_Ref</span>
            </div>
            <div className="aspect-square bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-hidden relative grayscale opacity-50">
              <img src={activeImage} className="w-full h-full object-cover" />
            </div>
            <input type="file" ref={fileInputRef} className="hidden" />
          </div>
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-grow flex flex-col bg-gray-100 dark:bg-[#020203] relative overflow-hidden">
        <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
          <div className="w-full max-w-2xl aspect-square relative z-10">
            <div className="w-full h-full bg-black border border-black/10 dark:border-white/10 relative overflow-hidden flex items-center justify-center group/view shadow-2xl">
              <img src={activeImage} className={`w-full h-full object-cover transition-all duration-[2s] ${isGenerating ? 'opacity-20 scale-105 blur-3xl' : 'opacity-100'}`} />
              
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-20">
                   <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Orchestrating_Identity...</p>
                </div>
              )}

              <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover/view:opacity-100 transition-opacity">
                <a href={activeImage} download className="p-3 bg-brand-blue text-white rounded-full shadow-xl hover:scale-110 transition-all"><Download size={16} /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="h-32 border-t border-black/10 dark:border-white/5 bg-white dark:bg-black p-4 flex gap-4 shrink-0 relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-none">
          <div className="flex-grow flex flex-col gap-2">
            <label className="text-[8px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-[0.3em] flex items-center gap-2"><Terminal size={12} className="text-brand-blue" /> Directive</label>
            <textarea 
              value={scenePrompt} 
              onChange={(e) => setScenePrompt(e.target.value)} 
              className="flex-grow bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-3 text-[11px] font-black uppercase text-black dark:text-white focus:outline-none focus:border-brand-blue/30 resize-none tracking-tight" 
              placeholder="Scene directive..." 
            />
          </div>
          <button 
            onClick={handleSynthesis} 
            disabled={isGenerating || !scenePrompt.trim()} 
            className="w-32 bg-brand-blue text-white flex flex-col items-center justify-center gap-2 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all group shadow-2xl active:scale-[0.98] disabled:opacity-20"
          >
            <Zap size={20} className="fill-current group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Synthesize</span>
          </button>
        </div>
      </div>

      {/* Settings Sidebar (Desktop Only) */}
      <div className="hidden xl:flex w-[280px] shrink-0 flex flex-col bg-gray-50 dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
            <Settings2 size={14} className="text-brand-blue" /> Parameters
          </label>
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[7px] font-black uppercase text-gray-400 dark:text-gray-800 tracking-widest">Outfit</span>
              <input 
                value={outfit} 
                onChange={(e) => setOutfit(e.target.value)} 
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 text-[9px] font-bold uppercase text-black dark:text-white outline-none" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-[7px] font-black uppercase text-gray-400 dark:text-gray-800 tracking-widest">Style</span>
              <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value)} 
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 text-[9px] font-black uppercase text-black dark:text-white outline-none"
              >
                <option>Cinematic Photorealistic</option>
                <option>Anime_Style_S4</option>
                <option>3D_Render_Unreal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-black/10 dark:border-white/5 space-y-6">
          <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 dark:text-gray-600 flex items-center gap-3"><HistoryIcon size={12} className="text-brand-blue" /> Archives</h3>
          <div className="space-y-3">
            {versions.slice(0, 3).map((v, i) => (
              <div key={i} onClick={() => setActiveImage(v.url)} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 border border-black/10 dark:border-white/5 overflow-hidden">
                  <img src={v.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-[7px] font-black text-black dark:text-white uppercase truncate">{v.metadata}</p>
                  <span className="text-[6px] font-bold text-gray-400 dark:text-gray-700 uppercase">{v.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityDemoInterface;
