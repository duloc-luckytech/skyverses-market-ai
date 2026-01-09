
import React, { useState, useRef, useEffect } from 'react';
import { 
  Monitor, Play, Clapperboard, Layers, 
  Settings2, Download, Loader2, Zap, Upload, 
  Target, ShieldCheck, Lock, ExternalLink, 
  History as HistoryIcon, Share2, Briefcase, Camera, Sun, 
  Terminal, Activity, X
} from 'lucide-react';
import { generateDemoVideo } from '../services/gemini';

const NexusStudioInterface = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [history, setHistory] = useState<{url: string, prompt: string, segment: string, timestamp: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);

  const [segment, setSegment] = useState('Product Showcase');
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!process.env.API_KEY && !hasKey) setNeedsKey(true);
      }
    };
    checkKey();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setNeedsKey(false);
    }
  };

  const handleSynthesis = async () => {
    if ((!prompt.trim() && !selectedImage) || isGenerating) return;
    setIsGenerating(true);

    try {
      const fullPrompt = `${segment} production. Scene content: ${prompt}`;
      const videoUrl = await generateDemoVideo({
        prompt: fullPrompt,
        references: selectedImage ? [selectedImage] : undefined,
        resolution: '1080p'
      });
      
      if (videoUrl) {
        setActiveVideo(videoUrl);
        setHistory(prev => [{ 
          url: videoUrl, 
          prompt: prompt || 'Reference Take', 
          segment,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev]);
      }
    } catch (err: any) {
      console.error("Studio Render Failed:", err);
      if (err?.message?.includes('Requested entity was not found')) {
        setNeedsKey(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#050505] overflow-hidden text-black dark:text-white relative">
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col border-r border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black overflow-y-auto no-scrollbar p-8 space-y-12">
        <div className="space-y-6">
          <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-widest flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-brand-blue" /> Production_Profile
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Brand Film', 'Product Showcase', 'Social Ad', 'Cinematic'].map(s => (
              <button 
                key={s} 
                onClick={() => setSegment(s)}
                className={`py-3 px-3 text-[9px] font-black uppercase border transition-all text-left ${segment === s ? 'bg-brand-blue border-brand-blue text-white' : 'border-black/5 dark:border-white/5 text-gray-400 dark:text-gray-700 hover:border-brand-blue/30'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
           <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-widest flex items-center gap-3">
              <Layers className="w-4 h-4 text-brand-blue" /> Master_Keyframe
           </label>
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="aspect-video border border-dashed border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer group hover:border-brand-blue transition-all relative overflow-hidden"
           >
              {selectedImage ? (
                <img src={selectedImage} className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 dark:text-gray-700 mb-2 group-hover:text-brand-blue transition-colors" />
                  <span className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-700">Drop Master Frame</span>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
           </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col relative bg-gray-100 dark:bg-[#020202] overflow-hidden">
        <div className="flex-grow flex flex-col items-center justify-center p-6 lg:p-12 relative">
           <div className="w-full max-w-5xl relative z-10 group">
              <div className="aspect-video bg-black border border-black/10 dark:border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center">
                 {activeVideo ? (
                   <video key={activeVideo} src={activeVideo} autoPlay loop muted className={`w-full h-full object-contain ${isGenerating ? 'opacity-20 scale-105 blur-2xl' : 'opacity-100'}`} />
                 ) : (
                   <div className="flex flex-col items-center justify-center space-y-6 opacity-10 dark:opacity-5">
                      <Monitor className="w-16 h-16 text-black dark:text-white" />
                      <span className="text-xl font-black uppercase tracking-[0.8em] text-black dark:text-white">Signal_Offline</span>
                   </div>
                 )}

                 {isGenerating && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl z-20">
                      <Loader2 className="w-20 h-20 text-brand-blue animate-spin mb-8" />
                      <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white animate-pulse">Synthesizing_Take...</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="h-40 border-t border-black/10 dark:border-white/10 bg-white dark:bg-black/90 p-8 shrink-0 relative z-20">
           <div className="max-w-5xl mx-auto flex gap-6 h-full">
              <div className="flex-grow relative h-full">
                 <textarea 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   placeholder="Direct industrial intent command..."
                   className="w-full h-full bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 p-5 text-[13px] mono font-black focus:outline-none focus:border-brand-blue/30 text-black dark:text-white uppercase tracking-tighter resize-none"
                   disabled={isGenerating}
                 />
              </div>
              <button onClick={handleSynthesis} disabled={isGenerating || (!prompt.trim() && !selectedImage)} className="w-64 bg-brand-blue text-white flex flex-col items-center justify-center gap-3 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all group active:scale-[0.98] disabled:opacity-20">
                 <Zap className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synthesize_Take</span>
              </button>
           </div>
        </div>
      </div>

      <div className="hidden xl:flex w-[320px] shrink-0 flex flex-col border-l border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black overflow-hidden">
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
               <HistoryIcon className="w-4 h-4 text-brand-blue" /> Take_Archives
            </h3>
         </div>
         <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
            {history.map((take, idx) => (
               <div key={idx} onClick={() => setActiveVideo(take.url)} className={`group border cursor-pointer transition-all overflow-hidden relative ${activeVideo === take.url ? 'border-brand-blue bg-brand-blue/[0.03]' : 'border-black/5 dark:border-white/5 opacity-50 hover:opacity-100'}`}>
                  <video src={take.url} className="w-full h-full object-cover" muted />
               </div>
            ))}
         </div>
      </div>

      {needsKey && (
        <div className="absolute inset-0 z-[100] bg-white/95 dark:bg-black/98 backdrop-blur-2xl flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-12 animate-in fade-in zoom-in duration-700">
             <div className="w-24 h-24 border border-brand-blue mx-auto flex items-center justify-center">
                <Lock className="w-10 h-10 text-brand-blue" />
             </div>
             <div className="space-y-6">
                <h2 className="text-4xl font-black uppercase tracking-tighter text-black dark:text-white">Production Required</h2>
                <p className="text-[12px] text-gray-500 dark:text-gray-600 leading-relaxed uppercase tracking-widest font-bold">
                   Studio synthesis requires a paid project API key.
                </p>
                <div className="pt-10 flex flex-col gap-4 items-center">
                   <button onClick={handleSelectKey} className="btn-sky-primary px-12 py-5 text-[11px] w-full">AUTH_PAID_PROJECT</button>
                   <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] text-gray-400 dark:text-gray-700 hover:text-brand-blue font-black uppercase">Billing_Specs <ExternalLink className="w-3 h-3" /></a>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexusStudioInterface;
