
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Download, RefreshCw, Zap, Share2, 
  Loader2, Play, Film, CheckCircle2,
  Terminal, Activity, Palette, ShieldCheck,
  Clapperboard, Lock, ExternalLink, Camera,
  Maximize2, Plus, Sliders, Settings2, History,
  LayoutGrid, Trash2, Box, Wand2, Info, FastForward,
  MonitorPlay, Camera as CameraIcon, Crown, Rocket, Fingerprint
} from 'lucide-react';
import { generateDemoVideo, VideoProductionParams } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';

type Tier = 'PRO' | 'ULTRA';

interface Reference {
  id: string;
  url: string;
  type: 'CHARACTER' | 'ENVIRONMENT' | 'PROP';
}

const TextToVideoWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  
  // Tier State
  const [tier, setTier] = useState<Tier>('PRO');
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState<'DIRECTIVES' | 'ASSETS' | 'TECHNICAL'>('DIRECTIVES');
  
  // Prompt & Config
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  // Assets
  const [references, setReferences] = useState<Reference[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & Results
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [needsKey, setNeedsKey] = useState(false);
  const [status, setStatus] = useState('SYSTEM_IDLE');

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
      reader.onloadend = () => {
        if (references.length >= (tier === 'ULTRA' ? 3 : 1)) return;
        const newRef: Reference = {
          id: Date.now().toString(),
          url: reader.result as string,
          type: 'CHARACTER'
        };
        setReferences(prev => [...prev, newRef]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    if (isGenerating || !prompt.trim()) return;
    
    if (needsKey) {
      if ((window as any).aistudio) await (window as any).aistudio.openSelectKey();
      setNeedsKey(false);
      return;
    }

    setIsGenerating(true);
    setResultVideo(null);
    setStatus('ORCHESTRATING_NEURAL_LINK...');

    try {
      const params: VideoProductionParams = {
        prompt,
        resolution,
        aspectRatio,
        isUltra: tier === 'ULTRA',
        references: references.map(r => r.url)
      };

      const url = await generateDemoVideo(params);
      if (url) {
        setResultVideo(url);
        setHistory(prev => [{ url, prompt, tier, timestamp: new Date().toLocaleTimeString() }, ...prev]);
        setStatus('MANIFEST_COMPLETED');
      }
    } catch (err: any) {
      setStatus('SYNTH_ERROR');
      if (err?.message?.includes("Requested entity was not found")) setNeedsKey(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row h-full w-full font-sans overflow-hidden relative transition-colors duration-700 ${tier === 'ULTRA' ? 'bg-[#050505] text-white' : 'bg-white text-black dark:bg-[#020202] dark:text-white'}`}>
      
      {/* 1. STUDIO SIDEBAR */}
      <aside className={`w-full lg:w-[450px] shrink-0 h-full flex flex-col border-r z-[60] overflow-y-auto no-scrollbar shadow-2xl transition-all duration-700 ${tier === 'ULTRA' ? 'bg-[#0a0a0c] border-white/5 shadow-yellow-500/5' : 'bg-[#fafafa] dark:bg-[#080808] border-black/5 dark:border-white/5'}`}>
        <div className="p-8 lg:p-10 space-y-10 pb-40">
          
          {/* TIER SWITCHER */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-sm text-white shadow-xl transition-all duration-700 ${tier === 'ULTRA' ? 'bg-yellow-500 shadow-yellow-500/20' : 'bg-brand-blue shadow-brand-blue/20'}`}>
                   {tier === 'ULTRA' ? <Crown size={24} /> : <Rocket size={24} />}
                </div>
                <div className="space-y-0.5">
                   <h3 className={`text-xs font-black uppercase tracking-[0.4em] transition-colors ${tier === 'ULTRA' ? 'text-yellow-500' : 'text-brand-blue'}`}>Motion_Synth</h3>
                   <p className="text-xl font-black uppercase tracking-tighter italic">Studio Console</p>
                </div>
             </div>

             <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-sm border border-black/5 dark:border-white/10">
                <button 
                  onClick={() => { setTier('PRO'); setResolution('720p'); }}
                  className={`flex-grow flex items-center justify-center gap-2 py-3 text-[9px] font-black uppercase transition-all rounded-sm ${tier === 'PRO' ? 'bg-white dark:bg-black text-brand-blue shadow-lg' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                >
                   <Rocket size={12} /> PRO Tier
                </button>
                <button 
                  onClick={() => setTier('ULTRA')}
                  className={`flex-grow flex items-center justify-center gap-2 py-3 text-[9px] font-black uppercase transition-all rounded-sm ${tier === 'ULTRA' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                >
                   <Crown size={12} /> ULTRA PRO
                </button>
             </div>
          </div>

          {/* TABS */}
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-sm">
             {['DIRECTIVES', 'ASSETS', 'TECHNICAL'].map(tab => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTab(tab as any)}
                 className={`flex-grow py-2.5 text-[8px] font-black uppercase transition-all rounded-sm ${activeTab === tab ? 'bg-white dark:bg-black shadow-md' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
               >
                 {tab}
               </button>
             ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'DIRECTIVES' && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-4">
                  <label className={`text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 ${tier === 'ULTRA' ? 'text-yellow-500/50' : 'text-gray-400'}`}>
                    <Terminal size={14} className={tier === 'ULTRA' ? 'text-yellow-500' : 'text-brand-blue'} /> Semantic Intent
                  </label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className={`w-full h-40 p-5 text-sm font-bold focus:outline-none transition-all rounded-sm uppercase tracking-tighter shadow-inner ${tier === 'ULTRA' ? 'bg-black/60 border-white/10 focus:border-yellow-500' : 'bg-white dark:bg-black/40 border-black/10 dark:border-white/10 focus:border-brand-blue'}`}
                    placeholder="Describe sequence, camera behavior, lighting..."
                  />
                </div>
              </motion.section>
            )}

            {activeTab === 'ASSETS' && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 ${tier === 'ULTRA' ? 'text-yellow-500/50' : 'text-gray-400'}`}>
                      <Fingerprint size={14} className={tier === 'ULTRA' ? 'text-yellow-500' : 'text-brand-blue'} /> Identity Lock
                    </label>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">
                       {references.length} / {tier === 'ULTRA' ? 3 : 1} Slots
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {references.map(ref => (
                      <div key={ref.id} className="relative aspect-square border border-white/10 bg-black group rounded-sm overflow-hidden">
                         <img src={ref.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                         <button onClick={() => setReferences(prev => prev.filter(r => r.id !== ref.id))} className="absolute top-1 right-1 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={10} />
                         </button>
                      </div>
                    ))}
                    {references.length < (tier === 'ULTRA' ? 3 : 1) && (
                      <button onClick={() => fileInputRef.current?.click()} className={`aspect-square border-2 border-dashed flex flex-col items-center justify-center gap-2 group transition-all rounded-sm ${tier === 'ULTRA' ? 'border-yellow-500/20 hover:border-yellow-500 hover:bg-yellow-500/5' : 'border-black/10 dark:border-white/10 hover:border-brand-blue'}`}>
                        <Plus className={tier === 'ULTRA' ? 'text-yellow-500' : 'text-brand-blue'} />
                        <span className="text-[7px] font-black uppercase text-gray-400">Add Asset</span>
                      </button>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  <p className="text-[8px] text-gray-500 italic uppercase tracking-widest leading-relaxed">
                    {tier === 'ULTRA' ? 'Multi-reference allows character, environment, and style consistency in one pipeline.' : 'Pro tier supports single image initialization for rapid prototyping.'}
                  </p>
                </div>
              </motion.section>
            )}

            {activeTab === 'TECHNICAL' && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-6">
                  <label className={`text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 ${tier === 'ULTRA' ? 'text-yellow-500/50' : 'text-gray-400'}`}>
                     <Settings2 size={14} className={tier === 'ULTRA' ? 'text-yellow-500' : 'text-brand-blue'} /> Output Node
                  </label>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Target Resolution</span>
                        <div className="grid grid-cols-2 gap-2">
                           <button 
                             onClick={() => setResolution('720p')}
                             className={`py-3 text-[10px] font-black uppercase border rounded-sm transition-all ${resolution === '720p' ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-xl' : 'border-black/5 dark:border-white/10 text-gray-400'}`}
                           >
                              720p Fast
                           </button>
                           <button 
                             disabled={tier === 'PRO'}
                             onClick={() => setResolution('1080p')}
                             className={`py-3 text-[10px] font-black uppercase border rounded-sm transition-all flex items-center justify-center gap-2 ${resolution === '1080p' ? 'bg-yellow-500 text-black border-transparent shadow-xl' : 'border-black/5 dark:border-white/10 text-gray-400'} ${tier === 'PRO' ? 'opacity-20 cursor-not-allowed' : ''}`}
                           >
                              1080p {tier === 'ULTRA' && <Crown size={10} />}
                           </button>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Aspect Ratio</span>
                        <div className="grid grid-cols-2 gap-2">
                           {['16:9', '9:16'].map(ratio => (
                             <button 
                               key={ratio} onClick={() => setAspectRatio(ratio as any)}
                               className={`py-3 text-[10px] font-black uppercase border rounded-sm transition-all ${aspectRatio === ratio ? (tier === 'ULTRA' ? 'bg-yellow-500 text-black border-transparent' : 'bg-black dark:bg-white text-white dark:text-black border-transparent') : 'border-black/5 dark:border-white/10 text-gray-400'}`}
                             >
                                {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
                
                <div className={`p-6 border rounded-sm space-y-3 transition-colors duration-700 ${tier === 'ULTRA' ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-brand-blue/20 bg-brand-blue/5'}`}>
                   <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className={tier === 'ULTRA' ? 'text-yellow-500' : 'text-brand-blue'} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${tier === 'ULTRA' ? 'text-yellow-500' : 'text-brand-blue'}`}>{tier} Production Secure</span>
                   </div>
                   <p className="text-[8px] text-gray-500 font-bold uppercase leading-relaxed tracking-wider">
                     {tier === 'ULTRA' ? 'Running on H100 Cinematic Cluster Node. High-reasoning temporal gates active.' : 'Running on V100 Fast-Inference Node. Optimized for social delivery.'}
                   </p>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* 2. VIEWPORT & RENDERING */}
      <main className="flex-grow flex flex-col bg-gray-50 dark:bg-[#020202] relative overflow-hidden transition-colors">
        
        {/* HUD HEADER */}
        <div className="h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 bg-white/50 dark:bg-black/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-6">
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] mono italic ${tier === 'ULTRA' ? 'text-yellow-500' : 'text-brand-blue'}`}>VEO_DIRECTOR_{tier}</span>
            <div className="h-4 w-px bg-black/10 dark:border-white/10"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mono animate-pulse italic">{status}</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* MAIN STAGE */}
        <div className="flex-grow flex items-center justify-center p-8 lg:p-20 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!resultVideo && !isGenerating ? (
              <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10 max-w-sm">
                <div className={`w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center mx-auto transition-colors duration-700 ${tier === 'ULTRA' ? 'border-yellow-500/30 text-yellow-500/20' : 'border-brand-blue/30 text-brand-blue/20'}`}>
                  <MonitorPlay size={48} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 italic">Stage Offline</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                     Orchestrate directives via the console. {tier} synthesis will engage upon ignition.
                  </p>
                </div>
              </motion.div>
            ) : isGenerating ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-12">
                <div className="relative">
                  <Loader2 size={100} className={`animate-spin ${tier === 'ULTRA' ? 'text-yellow-500' : 'text-brand-blue'}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity size={32} className={`animate-pulse ${tier === 'ULTRA' ? 'text-yellow-500/40' : 'text-brand-blue/40'}`} />
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <p className="text-[16px] font-black uppercase tracking-[0.8em] animate-pulse">Synthesizing Sequence</p>
                  <div className="flex gap-2 justify-center">
                     {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className={`w-12 h-1 overflow-hidden rounded-full ${tier === 'ULTRA' ? 'bg-yellow-500/10' : 'bg-brand-blue/10'}`}>
                           <div className={`h-full animate-progress ${tier === 'ULTRA' ? 'bg-yellow-500' : 'bg-brand-blue'}`} style={{ animationDelay: `${i*0.4}s` }}></div>
                        </div>
                     ))}
                  </div>
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] italic">H100_Cluster_{tier === 'ULTRA' ? 'Cinematic' : 'Fast'}_Inference</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`relative group w-full shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5 bg-black rounded-sm overflow-hidden ${aspectRatio === '16:9' ? 'max-w-6xl aspect-video' : 'max-w-md aspect-[9/16]'}`}>
                <video key={resultVideo} src={resultVideo!} autoPlay loop muted className="w-full h-full object-cover" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                
                {/* Cinema Overlays */}
                <div className="absolute top-8 left-8 flex items-center gap-6 text-white/20 pointer-events-none uppercase mono">
                   <div className="flex flex-col">
                      <span className="text-[7px] font-black tracking-widest">FPS: 24_STABLE</span>
                      <span className="text-[7px] font-black tracking-widest">BITRATE: 45MBPS</span>
                   </div>
                   <div className="h-6 w-px bg-white/10"></div>
                   <div className="text-[7px] font-black tracking-widest">{tier}_NODE_TAKE</div>
                </div>

                <div className="absolute bottom-10 left-10 space-y-4">
                   <div className="flex gap-2">
                      <span className={`text-[9px] font-black uppercase px-4 py-1.5 shadow-lg tracking-widest flex items-center gap-2 ${tier === 'ULTRA' ? 'bg-yellow-500 text-black' : 'bg-brand-blue text-white'}`}>
                         <Film size={10} /> {tier}_SYNTHESIS_MASTER
                      </span>
                   </div>
                   <div className="space-y-1">
                      <h2 className="text-5xl font-black uppercase text-white tracking-tighter italic mono leading-none">TAKE_ALPHA</h2>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em]">{tier} // {resolution} // {aspectRatio}</p>
                   </div>
                </div>

                <div className="absolute top-8 right-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-brand-blue transition-all shadow-2xl"><Share2 size={20} /></button>
                  <a href={resultVideo!} download className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"><Download size={20} /></a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HUD FOOTER: ACTIONS */}
        <div className={`h-40 border-t p-8 lg:px-12 flex items-center justify-between z-40 transition-all duration-700 shadow-2xl shrink-0 ${tier === 'ULTRA' ? 'bg-[#080808] border-white/5' : 'bg-white dark:bg-[#080808] border-black/5 dark:border-white/10'}`}>
           <div className="flex items-center gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <History size={14} />
                  <p className="text-[9px] font-black uppercase tracking-widest mono italic">Session_Vault</p>
                </div>
                <div className="flex gap-3">
                   {history.map((take, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setResultVideo(take.url)}
                        className={`w-16 h-16 rounded-sm border transition-all overflow-hidden relative group/take ${resultVideo === take.url ? (tier === 'ULTRA' ? 'border-yellow-500 ring-2 ring-yellow-500/30' : 'border-brand-blue ring-2 ring-brand-blue/30') : 'border-white/10 opacity-30 hover:opacity-100'}`}
                      >
                         <video src={take.url} className="w-full h-full object-cover" muted />
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/take:opacity-100 bg-black/40 transition-opacity">
                            <Maximize2 size={16} className="text-white" />
                         </div>
                      </button>
                   ))}
                   {history.length === 0 && Array.from({length: 4}).map((_, i) => <div key={i} className="w-16 h-16 rounded-sm border border-black/5 dark:border-white/5 bg-black/[0.02]" />)}
                </div>
              </div>
           </div>

           <div className="flex gap-4">
              {resultVideo && tier === 'ULTRA' && (
                 <button 
                   disabled={isExtending || isGenerating}
                   className="h-24 px-12 lg:px-20 flex flex-col items-center justify-center gap-2 transition-all rounded-sm border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black group shadow-xl"
                 >
                    <FastForward size={24} className={isExtending ? 'animate-pulse' : 'group-hover:translate-x-1 transition-transform'} />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">Extend +7s</span>
                 </button>
              )}
              
              <button 
                onClick={handleSynthesize}
                disabled={isGenerating || !prompt.trim()}
                className={`h-24 px-20 lg:px-48 flex flex-col items-center justify-center gap-2 transition-all rounded-sm relative overflow-hidden group shadow-2xl ${prompt.trim() ? (tier === 'ULTRA' ? 'bg-yellow-500 text-black hover:scale-105' : 'bg-brand-blue text-white hover:scale-105') : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-800'}`}
              >
                 <Zap className={`w-8 h-8 ${isGenerating ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'}`} fill="currentColor" />
                 <span className="text-[10px] font-black uppercase tracking-[0.5em]">{isGenerating ? 'Synthesizing' : 'Initiate Synthesis'}</span>
                 <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
           </div>
        </div>
      </main>

      {/* AUTH OVERLAY */}
      {needsKey && (
        <div className="absolute inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-12 animate-in fade-in zoom-in duration-500">
            <div className={`w-24 h-24 border-2 mx-auto flex items-center justify-center shadow-2xl ${tier === 'ULTRA' ? 'border-yellow-500 shadow-yellow-500/20' : 'border-brand-blue shadow-brand-blue/20'}`}>
              <Lock className={`w-10 h-10 animate-pulse ${tier === 'ULTRA' ? 'text-yellow-500' : 'text-brand-blue'}`} />
            </div>
            <div className="space-y-6">
              <h3 className="text-4xl font-black uppercase tracking-tighter italic">Production_Lock</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
                High-frequency temporal synthesis via Veo 3.1 requires authorization from a **PAID** GCP project node.
              </p>
              <div className="pt-10 flex flex-col gap-6 items-center">
                <button 
                  onClick={() => { if ((window as any).aistudio) (window as any).aistudio.openSelectKey(); setNeedsKey(false); }}
                  className={`py-6 px-16 text-[12px] tracking-[0.3em] rounded-none shadow-2xl w-full font-black uppercase ${tier === 'ULTRA' ? 'bg-yellow-500 text-black' : 'bg-brand-blue text-white'}`}
                >
                  Authorize Pipeline Key
                </button>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-gray-600 hover:text-brand-blue flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-colors"
                >
                  GCP Billing Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 2s infinite ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 144, 255, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default TextToVideoWorkspace;
