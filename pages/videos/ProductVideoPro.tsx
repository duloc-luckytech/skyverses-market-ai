
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, Zap, MonitorPlay, 
  Activity, Video, Target, Sparkles, Upload,
  RefreshCw, Download, Loader2, Lock, ExternalLink,
  // Added Plus to imports
  Plus
} from 'lucide-react';
import { generateDemoVideo } from '../../services/gemini';

const ProductVideoPro = () => {
  const solution = SOLUTIONS.find(s => s.id === 'MOTION-SYNTH-PRO');
  const { lang } = useLanguage();
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setNeedsKey(!hasKey);
      }
    };
    checkKey();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    if (isGenerating || !prompt.trim()) return;
    
    if (needsKey && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setNeedsKey(false);
      return;
    }

    setIsGenerating(true);
    setResultVideo(null);

    try {
      const url = await generateDemoVideo({
        prompt,
        references: selectedImg ? [selectedImg] : undefined,
        resolution: '720p',
        isUltra: false
      });
      if (url) setResultVideo(url);
    } catch (err: any) {
      if (err?.message?.includes("Requested entity was not found")) setNeedsKey(true);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!solution) return null;

  return (
    <div className="pt-24 bg-white dark:bg-[#030304] min-h-screen text-black dark:text-white font-sans selection:bg-brand-blue/30 transition-colors duration-500 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Simple Header */}
        <div className="mb-12 space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-brand-blue transition-colors tracking-widest">
            <ChevronLeft size={14} /> Back to Repository
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">Motion Synth <span className="text-brand-blue">Pro.</span></h1>
            <div className="px-3 py-1 bg-brand-blue/10 border border-brand-blue/30 rounded-sm w-fit shrink-0">
               <span className="text-[9px] font-black text-brand-blue uppercase">Rapid_Edge</span>
            </div>
          </div>
          <p className="text-gray-500 max-w-xl text-lg font-medium">{solution.description[lang]}</p>
        </div>

        {/* Minimal Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Controls (Left) */}
           <div className="lg:col-span-4 space-y-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <Target size={14} className="text-brand-blue" /> Cinematic Intent
                 </label>
                 <textarea 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   className="w-full h-32 p-4 bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-sm focus:outline-none focus:border-brand-blue transition-all text-sm font-bold uppercase tracking-tight"
                   placeholder="A cinematic drone shot of Neo-Tokyo..."
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <Upload size={14} className="text-brand-blue" /> Reference Frame (Optional)
                 </label>
                 <div 
                   onClick={() => document.getElementById('pro-upload')?.click()}
                   className="aspect-video border border-dashed border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer group hover:border-brand-blue transition-all relative overflow-hidden rounded-sm"
                 >
                    {selectedImg ? (
                       <img src={selectedImg} className="w-full h-full object-cover" alt="Ref" />
                    ) : (
                       <div className="text-center space-y-2">
                          <Plus className="mx-auto text-gray-400" size={20} />
                          <span className="text-[8px] font-black uppercase text-gray-500">Add Keyframe</span>
                       </div>
                    )}
                 </div>
                 <input id="pro-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>

              <button 
                onClick={handleSynthesize}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-6 bg-brand-blue text-white font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-20"
              >
                 {isGenerating ? <Loader2 className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                 {isGenerating ? 'Synthesizing...' : 'Synthesize Video'}
              </button>
           </div>

           {/* Viewport (Right) */}
           <div className="lg:col-span-8">
              <div className="aspect-video bg-black border border-black/10 dark:border-white/10 rounded-sm relative overflow-hidden shadow-2xl flex flex-col items-center justify-center group">
                 {resultVideo ? (
                    <video key={resultVideo} src={resultVideo} autoPlay loop muted className="w-full h-full object-cover" />
                 ) : isGenerating ? (
                    <div className="text-center space-y-6">
                       <Loader2 size={60} className="text-brand-blue animate-spin mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50 animate-pulse">Neural_Buffer_Active</p>
                    </div>
                 ) : (
                    <div className="text-center opacity-10">
                       <MonitorPlay size={80} />
                       <p className="text-[14px] font-black uppercase tracking-[0.8em] mt-4">Stage_Standby</p>
                    </div>
                 )}

                 {resultVideo && !isGenerating && (
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                       <a href={resultVideo} download className="p-4 bg-white text-black rounded-full shadow-2xl"><Download size={20} /></a>
                    </div>
                 )}
                 
                 <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-sm border border-white/10 text-[7px] font-black uppercase text-white/40 tracking-widest italic">
                    <Activity size={10} className="text-brand-blue" /> PRO_NODE_720P_STABLE
                 </div>
              </div>
           </div>
        </div>

        {/* Pro CTA */}
        <div className="mt-32 p-12 bg-brand-blue/5 border border-brand-blue/20 rounded-sm flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-2 text-center md:text-left">
              <h4 className="text-2xl font-black uppercase tracking-tighter">Need more control?</h4>
              <p className="text-sm text-gray-500 font-medium max-w-sm">Upgrade to Ultra Pro for multi-reference locking, 1080p, and temporal extension.</p>
           </div>
           <Link to="/product/motion-synth-ultra" className="px-10 py-5 border-2 border-brand-blue text-brand-blue font-black uppercase text-[10px] tracking-[0.4em] hover:bg-brand-blue hover:text-white transition-all shadow-xl">
              Switch to Ultra Pro
           </Link>
        </div>
      </div>

      {/* Auth Modal for Veo */}
      {needsKey && (
        <div className="fixed inset-0 z-[500] bg-white/95 dark:bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-12">
            <div className="w-24 h-24 border-2 border-brand-blue mx-auto flex items-center justify-center">
              <Lock className="w-10 h-10 text-brand-blue animate-pulse" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic">Auth Required</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
                Motion Synth requires authorization from a **PAID** GCP project node.
              </p>
              <button 
                onClick={() => { if ((window as any).aistudio) (window as any).aistudio.openSelectKey(); setNeedsKey(false); }}
                className="btn-sky-primary py-6 px-16 text-[12px] tracking-[0.3em] w-full font-black uppercase shadow-2xl"
              >
                Authorize Pipeline
              </button>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="block text-[10px] text-gray-600 hover:text-brand-blue font-black uppercase">GCP Billing Architecture <ExternalLink size={10} className="inline ml-1" /></a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVideoPro;
