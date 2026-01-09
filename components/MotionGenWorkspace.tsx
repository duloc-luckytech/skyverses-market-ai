
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Wand2, Sliders, Play, 
  Download, Share2, Loader2, Zap, 
  Settings, ChevronRight, Info,
  Sparkles, MonitorPlay, CheckCircle2,
  Lock, ExternalLink, HelpCircle,
  // Added missing icons to fix errors
  Image as ImageIcon, RotateCcw, Plus, Activity
} from 'lucide-react';
import { generateDemoVideo } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';

const MotionGenWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang, t } = useLanguage();
  
  const [startImage, setStartImage] = useState<string | null>(null);
  const [endImage, setEndImage] = useState<string | null>(null);
  const [motionPrompt, setMotionPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [credits, setCredits] = useState(1);

  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setNeedsKey(!hasKey);
      }
    };
    checkKey();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'START' | 'END') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'START') setStartImage(reader.result as string);
        else setEndImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    if (!startImage || isGenerating) return;
    
    if (needsKey && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setNeedsKey(false);
      return;
    }

    setIsGenerating(true);
    setResultVideo(null);

    try {
      const url = await generateDemoVideo({
        prompt: motionPrompt || "Dynamic motion synthesis",
        references: [startImage],
        lastFrame: endImage || undefined,
        resolution: '720p',
        isUltra: true
      });
      if (url) {
        setResultVideo(url);
        setCredits(0);
      }
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes("Requested entity was not found")) setNeedsKey(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] dark:bg-[#020617] text-white font-sans overflow-hidden">
      {/* Header */}
      <div className="px-8 py-10 text-center shrink-0 space-y-4">
         <div className="flex items-center justify-center gap-3">
            <Sparkles className="text-white w-8 h-8" />
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Motion 1.0 <span className="bg-blue-600 text-[10px] not-italic px-2 py-0.5 rounded-full align-middle ml-2">NEW</span></h1>
         </div>
         <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Transform still images into dynamic videos with AI-powered motion.<br />
            Add an optional end frame to control the final state of your animation.
         </p>
         <div className="flex justify-center gap-3 pt-2">
            {['Smooth Motion', 'Multiple Durations', 'High Quality'].map(tag => (
               <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-blue-400" /> {tag}
               </span>
            ))}
         </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-grow overflow-y-auto no-scrollbar pb-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Controls Column */}
           <div className="lg:col-span-6 space-y-6">
              {/* Upload Section */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6 relative">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <ImageIcon className="w-4 h-4 text-blue-400" />
                       <h3 className="text-sm font-bold uppercase tracking-widest">Upload Images</h3>
                    </div>
                    <HelpCircle size={16} className="text-gray-500" />
                 </div>

                 <div className="flex items-center justify-center gap-6">
                    <div className="flex-1 space-y-2">
                       <p className="text-[10px] font-black uppercase text-center text-gray-500">Start <span className="text-red-500">Required</span></p>
                       <div 
                         onClick={() => startInputRef.current?.click()}
                         className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${startImage ? 'border-blue-500' : 'border-white/10 hover:border-white/20'}`}
                       >
                          {startImage ? (
                             <img src={startImage} className="w-full h-full object-cover" />
                          ) : (
                             <div className="text-center space-y-2">
                                <Upload size={24} className="text-blue-400 mx-auto" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Click / Drop / Paste</p>
                             </div>
                          )}
                          <input type="file" ref={startInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'START')} />
                       </div>
                    </div>

                    <div className="shrink-0 pt-6">
                       <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-500">
                          <RotateCcw size={14} />
                       </div>
                    </div>

                    <div className="flex-1 space-y-2">
                       <p className="text-[10px] font-black uppercase text-center text-gray-500">End <span className="text-blue-500/50">Optional</span></p>
                       <div 
                         onClick={() => endInputRef.current?.click()}
                         className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${endImage ? 'border-blue-500' : 'border-white/10 hover:border-white/20'}`}
                       >
                          {endImage ? (
                             <img src={endImage} className="w-full h-full object-cover" />
                          ) : (
                             <div className="text-center space-y-2">
                                <Plus size={24} className="text-blue-400 mx-auto" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Click / Drop / Paste</p>
                             </div>
                          )}
                          <input type="file" ref={endInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'END')} />
                       </div>
                    </div>
                 </div>
                 <p className="text-[9px] text-gray-500 text-center uppercase tracking-widest pt-2">JPG / PNG files up to 10MB with minimum dimensions of 300px</p>
              </div>

              {/* Prompt Section */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Wand2 className="w-4 h-4 text-blue-400" />
                       <h3 className="text-sm font-bold uppercase tracking-widest">Motion Prompt <span className="text-gray-600">(Optional)</span></h3>
                    </div>
                    <HelpCircle size={16} className="text-gray-500" />
                 </div>
                 <textarea 
                   value={motionPrompt}
                   onChange={(e) => setMotionPrompt(e.target.value)}
                   className="w-full h-24 bg-black/40 border border-white/5 rounded-xl p-4 text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                   placeholder="Motion Description"
                 />
                 <div className="flex justify-end">
                    <span className="text-[10px] font-bold text-gray-600">{motionPrompt.length} / 500</span>
                 </div>
              </div>

              {/* Advanced Section */}
              <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                 <div className="flex items-center gap-2">
                    <Settings size={16} className="text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Advanced Settings</span>
                 </div>
                 <ChevronRight size={16} className="text-gray-500 rotate-90" />
              </div>

              {/* Synthesis Control */}
              <div className="pt-4 flex flex-col gap-4">
                 <div className="flex items-center justify-end gap-4">
                    <button 
                      onClick={handleSynthesize}
                      disabled={isGenerating || !startImage}
                      className={`flex items-center gap-3 px-10 py-5 rounded-sm text-xs font-black uppercase tracking-[0.3em] transition-all shadow-2xl ${startImage ? 'bg-gray-200 text-black hover:bg-white' : 'bg-white/10 text-gray-600 cursor-not-allowed'}`}
                    >
                       {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
                       Add Motion
                    </button>
                    <div className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 flex items-center gap-2">
                       <Activity size={12} /> {credits} credit
                    </div>
                 </div>
                 <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500">
                    <Activity size={12} /> {credits} motion credits remaining <button className="text-blue-400 underline">Get more</button>
                 </div>
              </div>
           </div>

           {/* Preview Column */}
           <div className="lg:col-span-6">
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl h-full flex flex-col">
                 <div className="flex items-center gap-2 mb-6">
                    <Play className="w-4 h-4 text-blue-400" fill="currentColor" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Preview</h3>
                 </div>

                 <div className="flex-grow bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-12">
                    <AnimatePresence mode="wait">
                       {resultVideo ? (
                          <motion.video 
                            key={resultVideo}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            src={resultVideo} autoPlay loop muted className="w-full h-full object-contain" 
                          />
                       ) : isGenerating ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
                             <Loader2 size={80} className="text-blue-500 animate-spin mx-auto" />
                             <p className="text-[12px] font-black uppercase tracking-[0.6em] text-blue-400 animate-pulse">Neural_Interpolation_Active</p>
                          </motion.div>
                       ) : (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-10 w-full max-w-md">
                             <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                                <Sparkles size={48} className="text-blue-400" />
                             </div>
                             <div className="space-y-2">
                                <h4 className="text-xl font-black uppercase tracking-tight">No video generated yet</h4>
                                <p className="text-[11px] text-gray-500 uppercase leading-relaxed font-bold">Upload an image and click "Add Motion" to create your first animated video</p>
                             </div>

                             <div className="space-y-3 pt-6">
                                {[
                                  { s: '1', t: 'Upload start frame' },
                                  { s: '2', t: 'Add motion prompt (optional)' },
                                  { s: '3', t: 'Click "Add Motion"' }
                                ].map(step => (
                                   <div key={step.s} className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-black shrink-0">{step.s}</div>
                                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">{step.t}</span>
                                   </div>
                                ))}
                             </div>
                          </motion.div>
                       )}
                    </AnimatePresence>

                    {resultVideo && !isGenerating && (
                       <div className="absolute bottom-6 right-6 flex gap-3">
                          <button className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full hover:bg-blue-600 transition-all"><Share2 size={18}/></button>
                          <a href={resultVideo} download className="p-3 bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all"><Download size={18}/></a>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Auth Modal Overlay */}
      {needsKey && (
        <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-12 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 border-2 border-blue-500 mx-auto flex items-center justify-center shadow-2xl">
              <Lock className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic">Auth Required</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
                Motion 1.0 industrial synthesis requires an authorized production API key from a **PAID** GCP project.
              </p>
              <div className="pt-10 flex flex-col gap-6 items-center">
                <button 
                  onClick={() => { if ((window as any).aistudio) (window as any).aistudio.openSelectKey(); setNeedsKey(false); }}
                  className="py-6 px-16 bg-blue-600 text-white text-[12px] tracking-[0.3em] font-black uppercase shadow-2xl w-full hover:scale-105 active:scale-95 transition-all"
                >
                  Link Production Key
                </button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] text-gray-600 hover:text-blue-500 transition-colors uppercase font-black tracking-widest flex items-center gap-2">GCP Billing Docs <ExternalLink size={12} /></a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default MotionGenWorkspace;
