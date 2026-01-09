
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { generateDemoImage } from '../../services/gemini';
import { 
  ChevronLeft, History as HistoryIcon, Settings, Download, Loader2, 
  Lock, Target, Layout, Monitor, Zap, Palette, X
} from 'lucide-react';

const Product3Image = () => {
  const solution = SOLUTIONS.find(s => s.slug === 'nebula-9-signature');
  
  const [activeImage, setActiveImage] = useState(solution?.imageUrl || '');
  const [history, setHistory] = useState<{url: string, seed: number}[]>(
    (solution?.gallery || []).map(url => ({ url, seed: 12345 }))
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileTab, setMobileTab] = useState<'config' | 'canvas' | 'history'>('canvas');
  
  const [prompt, setPrompt] = useState('');
  const [intent, setIntent] = useState('Brand Visual');
  const [styleLock, setStyleLock] = useState(true);
  const [weights, setWeights] = useState({ lighting: 80, composition: 95 });

  if (!solution) return null;

  const handleSynthesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setMobileTab('canvas');
    try {
      const result = await generateDemoImage(`Signature: ${prompt}`);
      if (result) {
        setActiveImage(result);
        setHistory(prev => [{ url: result, seed: Math.random() }, ...prev]);
      }
    } catch (error) {
      console.error("Synthesis Failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const ConfigTab = () => (
    <div className="flex-grow p-6 space-y-8 overflow-y-auto">
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2"><Target className="w-3 h-3 text-brand-blue" /> Intent_Profile</label>
        <div className="grid grid-cols-2 gap-2">
          {['Brand Visual', 'Game Asset', 'Product Shot', 'Concept Art'].map(prof => (
            <button key={prof} onClick={() => setIntent(prof)} className={`py-3 px-3 text-[9px] font-bold uppercase border transition-all text-left ${intent === prof ? 'border-brand-blue bg-brand-blue/5 text-white' : 'border-white/5 text-gray-600'}`}>
              {prof}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-white/5">
         <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2"><Lock className="w-3 h-3" /> Identity_Lock</label>
         <button onClick={() => setStyleLock(!styleLock)} className={`w-full p-4 border flex justify-between items-center ${styleLock ? 'border-brand-blue bg-brand-blue/5' : 'border-white/5 text-gray-600'}`}>
            <span className="text-[10px] font-black uppercase">Style_Lock</span>
            {styleLock ? <Lock className="w-4 h-4 text-brand-blue" /> : <X className="w-4 h-4" />}
         </button>
      </div>

      <div className="space-y-6 pt-6 border-t border-white/5">
         <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Architectural_Weights</label>
         {Object.entries(weights).map(([key, val]) => (
           <div key={key} className="space-y-2">
              <div className="flex justify-between text-[9px] font-black uppercase mono"><span className="text-gray-600">{key}</span><span className="text-brand-blue">{val}%</span></div>
              <input type="range" min="0" max="100" value={val} onChange={(e) => setWeights(prev => ({ ...prev, [key]: parseInt(e.target.value) }))} className="w-full h-1 bg-white/10 appearance-none rounded-full accent-brand-blue" />
           </div>
         ))}
      </div>
    </div>
  );

  const CanvasTab = () => (
    <div className="flex-grow flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#050505]">
       <div className="relative w-full aspect-square max-w-md bg-white/[0.01] border border-white/5 shadow-2xl overflow-hidden flex items-center justify-center">
          <img src={activeImage} className={`max-w-full max-h-full object-contain transition-all duration-1000 ${isGenerating ? 'opacity-20 blur-2xl scale-105' : 'opacity-100'}`} />
          
          {isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
               <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Processing...</p>
            </div>
          )}
          
          <div className="absolute bottom-4 right-4">
             <a href={activeImage} download className="p-3 bg-brand-blue text-white rounded-full"><Download className="w-5 h-5" /></a>
          </div>
       </div>

       <div className="w-full max-w-md mt-6 px-2">
          <form onSubmit={handleSynthesis} className="flex flex-col gap-4">
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="Intent Parameters..."
               className="w-full bg-white/5 border border-white/10 p-4 text-sm mono font-black focus:outline-none focus:border-brand-blue/30 h-24 uppercase"
             />
             <button type="submit" disabled={isGenerating || !prompt.trim()} className="bg-brand-blue text-white py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3">
               <Zap className="w-4 h-4 fill-current" /> Render Sequence
             </button>
          </form>
       </div>
    </div>
  );

  const HistoryTab = () => (
    <div className="flex-grow p-6 space-y-6 overflow-y-auto">
       <div className="grid grid-cols-2 gap-4">
          {history.map((entry, idx) => (
            <button key={idx} onClick={() => { setActiveImage(entry.url); setMobileTab('canvas'); }} className={`relative aspect-square border overflow-hidden ${activeImage === entry.url ? 'border-brand-blue' : 'border-white/5 opacity-40'}`}>
               <img src={entry.url} className="w-full h-full object-cover" />
            </button>
          ))}
       </div>
    </div>
  );

  return (
    <div className="pt-20 bg-black min-h-screen flex flex-col font-sans overflow-hidden">
      {/* HUD */}
      <div className="h-14 border-b border-white/10 bg-black flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <Link to="/market" className="text-gray-500"><ChevronLeft size={15} /></Link>
          <span className="text-[10px] font-black uppercase tracking-widest text-white truncate max-w-[150px]">Nebula-9 Studio</span>
        </div>
        <div className="flex items-center gap-4">
           <Monitor className="w-4 h-4 text-brand-blue" />
        </div>
      </div>

      {/* MOBILE CONTENT AREA */}
      <div className="flex-grow flex flex-col overflow-hidden">
         {mobileTab === 'config' && <ConfigTab />}
         {mobileTab === 'canvas' && <CanvasTab />}
         {mobileTab === 'history' && <HistoryTab />}
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="h-20 border-t border-white/10 bg-black grid grid-cols-3 shrink-0">
         <button onClick={() => setMobileTab('config')} className={`flex flex-col items-center justify-center gap-1 transition-all ${mobileTab === 'config' ? 'text-brand-blue' : 'text-gray-500'}`}>
            <Settings className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Config</span>
         </button>
         <button onClick={() => setMobileTab('canvas')} className={`flex flex-col items-center justify-center gap-1 transition-all ${mobileTab === 'canvas' ? 'text-brand-blue' : 'text-gray-500'}`}>
            <Layout className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Canvas</span>
         </button>
         <button onClick={() => setMobileTab('history')} className={`flex flex-col items-center justify-center gap-1 transition-all ${mobileTab === 'history' ? 'text-brand-blue' : 'text-gray-500'}`}>
            <HistoryIcon className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">History</span>
         </button>
      </div>
    </div>
  );
};

export default Product3Image;
