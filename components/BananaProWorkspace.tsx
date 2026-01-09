
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Layers, Sparkles, RefreshCw, 
  Download, Lock, X, Check, Trash2, Zap, 
  Share2, Maximize2, Plus, Terminal,
  LayoutGrid, Book, AlignLeft, Palette,
  Loader2, Play, Film, MessageSquare,
  CheckCircle2, Menu, Activity, Users,
  History, Upload, Dna, Fingerprint,
  ChevronRight, Bookmark, ArrowRight,
  Database, ShieldCheck, Copy, Eye, Edit3,
  MousePointer2, Coins, AlertTriangle
} from 'lucide-react';
import { generateDemoImage } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface ActorDNA {
  id: string;
  name: string;
  role: 'Protagonist' | 'Rival' | 'Mentor' | 'Support';
  refs: string[];
}

interface Panel {
  id: string;
  url: string | null;
  status: 'idle' | 'rendering' | 'done' | 'error';
  intent: string;
  memory: string; 
}

interface Chapter {
  id: string;
  title: string;
  panels: Panel[];
  isCanon: boolean;
}

const PRESET_ACTORS: ActorDNA[] = [
  {
    id: 'p-act-1',
    name: 'Ronin_X',
    role: 'Protagonist',
    refs: ['https://images.unsplash.com/photo-1578632738981-63806a624da5?q=80&w=800']
  },
  {
    id: 'p-act-2',
    name: 'Cyber_Sensei',
    role: 'Mentor',
    refs: ['https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=800']
  },
  {
    id: 'p-act-3',
    name: 'Neo_Stalker',
    role: 'Rival',
    refs: ['https://images.unsplash.com/photo-1607112812619-182cb1c7bb61?q=80&w=800']
  }
];

const BananaProWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  const { credits, useCredits, isAuthenticated, login } = useAuth();
  
  const [actors, setActors] = useState<ActorDNA[]>(PRESET_ACTORS);
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: 'ch1', title: 'Chapter 01: The Awakening', isCanon: true, panels: [
      { id: 'p1', url: null, status: 'idle', intent: 'Splash: Ronin X and Neo Stalker facing each other in the neon district.', memory: 'Initial meeting' },
      { id: 'p2', url: null, status: 'idle', intent: 'Close up on Ronin X eyes activating neural link.', memory: 'Power charge' },
      { id: 'p3', url: null, status: 'idle', intent: 'Wide shot of Cyber Sensei observing from the shadows.', memory: 'Hidden watcher' },
      { id: 'p4', url: null, status: 'idle', intent: 'The two rivals clashing, creating a massive energy rift.', memory: 'Battle climax' }
    ]}
  ]);
  const [activeChapterId, setActiveChapterId] = useState('ch1');
  const [isCanonMode, setIsCanonMode] = useState(true);
  const [status, setStatus] = useState('OPERATIONAL');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isConstructing, setIsConstructing] = useState(false);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  const handleActorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newActor: ActorDNA = {
          id: `act-${Date.now()}`,
          name: `NEW_HERO_${actors.length + 1}`,
          role: 'Protagonist',
          refs: [reader.result as string]
        };
        setActors(prev => [...prev, newActor]);
        setStatus('IDENTITY DNA EXTRACTED');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeActor = (id: string) => {
    setActors(prev => prev.filter(a => a.id !== id));
    setStatus('IDENTITY_MODIFIED');
  };

  const handleBranchVariant = () => {
    const currentChapter = chapters.find(c => c.id === activeChapterId);
    if (!currentChapter) return;

    const newVariant: Chapter = {
      ...JSON.parse(JSON.stringify(currentChapter)), 
      id: `var-${Date.now()}`,
      title: `${currentChapter.title} (Alternate Timeline)`,
      isCanon: false
    };

    setChapters(prev => [...prev, newVariant]);
    setActiveChapterId(newVariant.id);
    setIsCanonMode(false);
    setStatus('BRANCH_CREATED');
  };

  const handleRenameChapter = (id: string, newTitle: string) => {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, title: newTitle } : ch));
  };

  const constructChapter = async () => {
    const chapter = chapters.find(c => c.id === activeChapterId);
    if (!chapter || isConstructing) return;

    // 1. Auth & Credit Validation
    if (!isAuthenticated) {
      login();
      return;
    }

    if (credits < 5) {
      setShowLowCreditAlert(true);
      setStatus('QUOTA_EXCEEDED');
      return;
    }
    
    // 2. Deduct Credits
    const deductionSuccessful = useCredits(5);
    if (!deductionSuccessful) return;

    setIsConstructing(true);
    setStatus('SYNTHESIZING_SERIAL');

    try {
      const updatedPanels = [...chapter.panels];
      for (let i = 0; i < updatedPanels.length; i++) {
        const p = updatedPanels[i];
        setStatus(`SYNTHESIZING_PANEL_0${i+1}`);
        
        const actorContext = actors.map(a => `Character: ${a.name}, Role: ${a.role}`).join('. ');
        const directive = `Professional anime serial manga panel. Continuity Mode Active. ${actorContext}. Narrative Intent: ${p.intent}. Memory Context: ${p.memory}. Style: High-fidelity Shonen Anime, vibrant coloring, cinematic composition.`;
        
        const res = await generateDemoImage(directive, actors.flatMap(a => a.refs));
        if (res) {
          updatedPanels[i] = { ...p, url: res, status: 'done' };
          setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, panels: [...updatedPanels] } : c));
        }
        await new Promise(r => setTimeout(r, 600));
      }
      setStatus('OPERATIONAL');
    } catch (err) {
      setStatus('SYNTHESIS_ERROR');
    } finally {
      setIsConstructing(false);
    }
  };

  const currentChapter = chapters.find(c => c.id === activeChapterId);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#f8f8f8] dark:bg-[#030304] text-black dark:text-white font-sans overflow-hidden relative">
      
      {/* 1. EDITORIAL BOARD (SIDEBAR) */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside 
            initial={{ x: -450, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -450, opacity: 0 }}
            className="absolute lg:relative w-[320px] lg:w-[420px] h-full flex flex-col border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#080808] z-[100] overflow-y-auto no-scrollbar p-0 shadow-2xl"
          >
            <div className="p-8 lg:p-10 space-y-12 pb-40">
              <header className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#FFE135] flex items-center justify-center rounded-sm text-black shadow-lg">
                       <Dna size={20} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-0.5">
                       <h2 className="text-lg font-black uppercase tracking-tighter italic text-black dark:text-white">Banana Comic</h2>
                       <p className="text-[9px] text-[#FFE135] font-black uppercase tracking-[0.2em]">Continuity Engine</p>
                    </div>
                 </div>
                 <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-400">
                   <X size={20} />
                 </button>
              </header>

              {/* CREDIT HUD */}
              <div className="p-5 border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] rounded-sm space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-500">
                       <Coins size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Compute_Balance</span>
                    </div>
                    <span className="text-xs font-black text-[#FFE135] italic">{credits.toLocaleString()} CR</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">Cost per chapter: 5 Credits</p>
                    <Link to="/credits" className="text-[8px] font-black text-brand-blue uppercase hover:underline">Refill +</Link>
                 </div>
              </div>

              <section className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-3">
                       <Users size={14} /> Identity Anchors
                    </label>
                    <button onClick={() => fileInputRef.current?.click()} className="p-1.5 border border-dashed border-black/10 dark:border-white/10 rounded-full hover:bg-[#FFE135] transition-all">
                       <Plus size={12} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleActorUpload} />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    {actors.length === 0 ? (
                       <div className="col-span-2 py-8 border border-dashed border-black/5 dark:border-white/5 flex flex-col items-center justify-center opacity-20 text-center">
                          <Fingerprint size={32} className="mb-2" />
                          <p className="text-[8px] font-black uppercase">No Identity Locked</p>
                       </div>
                    ) : (
                       actors.map(actor => (
                          <div key={actor.id} className="p-3 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-black group relative rounded-sm shadow-sm overflow-hidden text-black dark:text-white">
                             <div className="aspect-square bg-black overflow-hidden mb-3">
                                <img src={actor.refs[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                             </div>
                             <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                  <p className="text-[9px] font-black uppercase truncate max-w-[80px]">{actor.name}</p>
                                  <span className="text-[7px] text-[#FFE135] font-bold uppercase">{actor.role}</span>
                                </div>
                                <button onClick={() => removeActor(actor.id)} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                   <Trash2 size={10} />
                                </button>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </section>

              <section className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-3">
                    <Database size={14} /> Narrative Vault
                 </label>
                 <div className="space-y-2">
                    {chapters.map(ch => (
                       <div 
                         key={ch.id} 
                         onClick={() => { setActiveChapterId(ch.id); setIsCanonMode(ch.isCanon); }}
                         className={`w-full p-4 border transition-all text-left flex justify-between items-center cursor-pointer ${activeChapterId === ch.id ? 'border-[#FFE135] bg-[#FFE135]/5 shadow-sm' : 'border-black/5 dark:border-white/5 text-gray-500'}`}
                       >
                          <div className="space-y-1 flex-grow pr-4">
                             <span className="text-[8px] font-black opacity-40 uppercase">{ch.isCanon ? 'Serial Work' : 'Parallel Arc'}</span>
                             {activeChapterId === ch.id ? (
                                <input 
                                  autoFocus
                                  value={ch.title}
                                  onChange={(e) => handleRenameChapter(ch.id, e.target.value)}
                                  className="w-full bg-transparent border-none text-[11px] font-black uppercase italic tracking-tight outline-none focus:text-[#FFE135]"
                                />
                             ) : (
                                <h4 className="text-[11px] font-black uppercase italic tracking-tight truncate">{ch.title}</h4>
                             )}
                          </div>
                          <div className="shrink-0">
                            {ch.isCanon ? <ShieldCheck size={14} className="text-[#FFE135]" /> : <RefreshCw size={12} className="text-purple-500" />}
                          </div>
                       </div>
                    ))}
                    <button onClick={handleBranchVariant} className="w-full py-3 border border-dashed border-black/10 dark:border-white/10 text-[9px] font-black uppercase text-gray-400 flex items-center justify-center gap-2 hover:border-[#FFE135] hover:text-[#FFE135] transition-all">
                       <Plus size={14} /> Branch Variant
                    </button>
                 </div>
              </section>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. PRODUCTION CANVAS (CENTER) */}
      <main className="flex-grow flex flex-col bg-[#f0f0f2] dark:bg-[#010101] relative overflow-hidden">
        
        {/* HUD HEADER */}
        <div className="h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 bg-white/50 dark:bg-black/50 backdrop-blur-md z-[70] shadow-sm">
          <div className="flex items-center gap-6">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 hover:text-[#FFE135] transition-colors">
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFE135] mono italic">BANANA COMIC</span>
              <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isCanonMode ? 'bg-black text-white shadow-lg shadow-black/20' : 'bg-[#FFE135] text-black shadow-lg shadow-yellow-500/20'}`}>
                {isCanonMode ? 'CANON' : 'VARIANT'}
              </div>
            </div>
            <div className="h-4 w-px bg-black/10 dark:border-white/10 hidden md:block"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mono italic animate-pulse hidden md:block">{status}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* CHRONICLE PAGE VIEWPORT */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 lg:p-16 flex items-center justify-center">
           <div className="w-full max-w-5xl aspect-[1/1.41] bg-white dark:bg-[#0a0a0c] shadow-[0_0_100px_rgba(0,0,0,0.1)] border-[12px] border-white dark:border-[#111] p-6 lg:p-10 grid grid-cols-2 grid-rows-2 gap-4 lg:gap-8 relative overflow-hidden">
              
              {currentChapter?.panels.map((p, idx) => (
                 <div 
                   key={p.id} 
                   className={`relative border-2 border-black/5 dark:border-white/5 transition-all group hover:border-[#FFE135] ${idx === 0 ? 'col-span-2' : ''}`}
                 >
                    {p.url ? (
                       <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                         <img src={p.url} className={`w-full h-full object-cover transition-opacity duration-1000 ${p.status === 'rendering' ? 'opacity-20' : 'opacity-100'}`} />
                         
                         {/* Hover Controls */}
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-40">
                            <button 
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedFullImage(p.url); }} 
                              className="p-4 bg-white text-black rounded-full shadow-2xl hover:bg-[#FFE135] transition-all transform scale-90 group-hover:scale-100 active:scale-95"
                              title="Maximize Viewport"
                            >
                               <Maximize2 size={24} />
                            </button>
                         </div>
                       </div>
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-white/[0.02] opacity-10 space-y-4">
                          <LayoutGrid size={48} strokeWidth={1} />
                          <p className="text-[10px] font-black uppercase tracking-widest">Beat 0{idx+1}</p>
                       </div>
                    )}

                    {p.status === 'rendering' && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                          <Loader2 className="w-10 h-10 text-[#FFE135] animate-spin mb-4" />
                       </div>
                    )}

                    {p.url && p.status === 'done' && (
                       <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-50">
                          <a href={p.url} download className="p-3 bg-black text-white shadow-xl rounded-full hover:scale-110 active:scale-95"><Download size={14} /></a>
                       </div>
                    )}
                 </div>
              ))}

              {isConstructing && (
                 <div className="absolute inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-xl z-[100] flex flex-col items-center justify-center space-y-12">
                    <Loader2 size={100} className="text-[#FFE135] animate-spin" />
                    <div className="space-y-4 text-center">
                       <h3 className="text-3xl font-black uppercase tracking-[0.4em] italic text-black dark:text-white">Manifesting Serial</h3>
                       <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mono">Narrative Memory Synchronizing...</p>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* BOTTOM HUD */}
        <div className="h-32 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#080808] p-8 lg:px-12 flex items-center justify-between z-40 shadow-2xl shrink-0">
           <div className="flex items-center gap-12 lg:gap-16">
              <div className="hidden md:flex flex-col gap-3">
                 <div className="flex items-center gap-3">
                    <History size={16} className="text-[#FFE135]" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mono">Continuity Fidelity</p>
                 </div>
                 <div className="flex gap-4">
                    {[1,2,3,4,5].map(i => (
                       <div key={i} className={`w-8 h-1.5 ${i <= 4 ? 'bg-[#FFE135]' : 'bg-gray-200 dark:bg-gray-800'} rounded-sm`} />
                    ))}
                 </div>
              </div>
           </div>

           <div className="flex gap-4">
              <button 
                onClick={constructChapter}
                disabled={isConstructing || actors.length === 0}
                className={`group h-24 px-16 lg:px-32 flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden rounded-sm shadow-2xl ${actors.length > 0 ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-800'}`}
              >
                 <BookOpen size={24} className={isConstructing ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isConstructing ? 'Synthesizing' : 'Manifest Chapter'}</span>
                 <div className="absolute inset-0 bg-[#FFE135]/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
           </div>
        </div>
      </main>

      {/* LOW CREDIT DIALOG */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
               className="max-w-md w-full bg-white dark:bg-[#0c0c0e] p-10 border border-black/10 dark:border-white/10 rounded-sm space-y-8 text-center shadow-3xl"
             >
                <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500">
                   <AlertTriangle size={40} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic text-black dark:text-white">Quota Depleted</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                     Serial synthesis requires **5 credits** per chapter. Your current compute balance is insufficient.
                   </p>
                </div>
                <div className="flex flex-col gap-4">
                   <Link 
                     to="/credits" 
                     className="bg-brand-blue text-white py-5 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:scale-105 transition-all"
                   >
                     Top Up Credits
                   </Link>
                   <button 
                     onClick={() => setShowLowCreditAlert(false)}
                     className="text-[10px] font-black uppercase text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                   >
                     Maybe Later
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL IMAGE LIGHTBOX */}
      <AnimatePresence>
        {selectedFullImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-3xl overflow-y-auto custom-scrollbar"
            onClick={() => setSelectedFullImage(null)}
          >
            <button 
              className="fixed top-8 right-8 text-white/50 hover:text-[#FFE135] transition-colors z-[1001] bg-black/50 p-2 rounded-full backdrop-blur-md"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedFullImage(null); }}
            >
              <X size={48} strokeWidth={1} />
            </button>

            <div className="min-h-screen w-full flex flex-col items-center p-4 lg:p-20 relative">
              <motion.div 
                initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }}
                className="relative max-w-5xl w-full flex flex-col items-center"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <img 
                  src={selectedFullImage} 
                  className="w-full h-auto shadow-[0_0_150px_rgba(255,225,53,0.15)] border border-white/10 rounded-sm" 
                  alt="Full Narrative Art" 
                />
                
                <div className="mt-12 mb-20 flex flex-col sm:flex-row items-center gap-6">
                   <button className="flex items-center gap-3 bg-[#FFE135] text-black px-12 py-4 text-[12px] font-black uppercase rounded-sm shadow-2xl hover:scale-105 active:scale-95 transition-all">
                      <Download size={16} /> Save Masterpiece
                   </button>
                   <button className="flex items-center gap-3 bg-white/10 text-white border border-white/10 px-10 py-4 text-[12px] font-black uppercase rounded-sm hover:bg-white hover:text-black transition-all backdrop-blur-md">
                      <Share2 size={16} /> Broadcast
                   </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 225, 53, 0.4); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default BananaProWorkspace;
