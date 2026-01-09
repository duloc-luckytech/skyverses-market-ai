
import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, Loader2, Video, Film, Play, 
  Terminal, ShieldCheck, History as HistoryIcon, 
  Download, Layers, Camera, Sliders, 
  Palette, CheckCircle2, Info, Lock, 
  ExternalLink, Activity, Upload,
  Square, RotateCcw, MonitorPlay
} from 'lucide-react';
import { generateDemoVideo } from '../services/gemini';

interface Take {
  url: string;
  prompt: string;
  motion: string;
  timestamp: string;
}

const MotionCraftInterface = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [takes, setTakes] = useState<Take[]>([]);
  const [needsKey, setNeedsKey] = useState(false);

  // Motion Config
  const [motionPreset, setMotionPreset] = useState('Orbit');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [sourceImage, setSourceImage] = useState<string | null>(null);

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

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setNeedsKey(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesis = async () => {
    if ((!prompt.trim() && !sourceImage) || isGenerating) return;
    setIsGenerating(true);

    try {
      const directive = `${motionPreset} camera logic. Directive: ${prompt}`;
      const url = await generateDemoVideo({
        prompt: directive,
        references: sourceImage ? [sourceImage] : undefined,
        aspectRatio: aspectRatio as '16:9' | '9:16'
      });
      if (url) {
        setActiveVideo(url);
        setTakes(prev => [{
          url,
          prompt: prompt || 'Reference Image Synthesis',
          motion: motionPreset,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev]);
      }
    } catch (err: any) {
      console.error("Velocity Synthesis Error:", err);
      if (err?.message?.includes('Requested entity was not found')) {
        setNeedsKey(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#080808] overflow-hidden text-black dark:text-white">
      <div className="w-full lg:w-[350px] shrink-0 flex flex-col border-r border-black/10 dark:border-white/5 bg-gray-50 dark:bg-[#050506] overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
            <Sliders size={12} className="text-brand-blue" /> Engine_Presets
          </label>
          <div className="p-4 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[7px] font-black uppercase text-gray-400 dark:text-gray-700">Camera_Motion</label>
              <div className="grid grid-cols-2 gap-2">
                {['Orbit', 'Dolly', 'Pan', 'Zoom'].map(m => (
                  <button 
                    key={m} 
                    onClick={() => setMotionPreset(m)}
                    className={`py-2.5 text-[9px] font-black uppercase border transition-all ${motionPreset === m ? 'bg-brand-blue border-brand-blue text-white' : 'border-black/5 dark:border-white/5 text-gray-400'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em]">Reference_Frame</label>
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="aspect-video border border-dashed border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer group hover:border-brand-blue transition-all relative overflow-hidden"
           >
              {sourceImage ? (
                <img src={sourceImage} className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload size={20} className="text-gray-400 mb-2 group-hover:text-brand-blue transition-colors" />
                  <span className="text-[8px] font-black uppercase text-gray-500">Initialize with Frame</span>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
           </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col bg-gray-100 dark:bg-[#020203] relative overflow-hidden">
        <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
          <div className={`w-full relative z-10 transition-all duration-700 ${aspectRatio === '9:16' ? 'max-w-xs aspect-[9/16]' : 'max-w-4xl aspect-video'}`}>
            <div className="w-full h-full bg-black border border-black/10 dark:border-white/10 relative overflow-hidden flex items-center justify-center group/view shadow-2xl">
              {activeVideo ? (
                <video key={activeVideo} src={activeVideo} autoPlay loop muted className={`w-full h-full object-contain ${isGenerating ? 'opacity-20 blur-3xl scale-105' : 'opacity-100'}`} />
              ) : (
                <div className="text-center opacity-10">
                   <MonitorPlay className="w-20 h-20 mx-auto mb-4" />
                   <p className="text-[11px] font-black uppercase tracking-[0.6em]">Terminal_Standby</p>
                </div>
              )}
              
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-20">
                   <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Accelerating_Synthesis...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-32 border-t border-black/10 dark:border-white/5 bg-white dark:bg-black p-4 flex gap-4 shrink-0 relative z-20">
          <div className="flex-grow flex flex-col gap-2">
            <label className="text-[8px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-[0.3em] flex items-center gap-2"><Zap size={12} className="text-brand-blue" /> Intent_Directive</label>
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              className="flex-grow bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-3 text-[11px] font-black uppercase text-black dark:text-white focus:outline-none focus:border-brand-blue/30 resize-none tracking-tight leading-relaxed" 
              placeholder="Describe motion..." 
            />
          </div>
          <button 
            onClick={handleSynthesis} 
            disabled={isGenerating || (!prompt.trim() && !sourceImage)} 
            className="w-40 bg-brand-blue text-white flex flex-col items-center justify-center gap-2 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all group shadow-2xl active:scale-[0.98] disabled:opacity-20"
          >
            <Zap size={20} className="fill-current group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Generate</span>
          </button>
        </div>
      </div>

      <div className="hidden xl:flex w-[320px] shrink-0 flex flex-col bg-gray-50 dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
            <HistoryIcon size={14} className="text-brand-blue" /> Velocity_Archives
          </label>
          <div className="space-y-4">
            {takes.map((t, i) => (
              <div key={i} onClick={() => setActiveVideo(t.url)} className="group cursor-pointer border border-black/5 dark:border-white/5 overflow-hidden transition-all hover:border-brand-blue/30">
                <div className="aspect-video bg-black relative">
                   <video src={t.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {needsKey && (
        <div className="absolute inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 border border-brand-blue mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8 text-brand-blue animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Auth Required</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
                Motion Craft high-speed synthesis requires an authorized production API key.
              </p>
              <div className="pt-6 flex flex-col gap-4">
                <button onClick={handleSelectKey} className="btn-sky-primary py-4 px-10 text-[10px] tracking-widest uppercase">Select Production Key</button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] text-gray-600 hover:text-brand-blue flex items-center justify-center gap-2 font-black uppercase">Billing Architecture <ExternalLink className="w-3 h-3" /></a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotionCraftInterface;
