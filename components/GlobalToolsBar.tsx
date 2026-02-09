
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ChevronDown, ChevronUp, 
  Video, SlidersHorizontal, Sparkles,
  Zap, Loader2, X, Image as ImageIcon,
  Move, Activity, Monitor, Smartphone, Check,
  ChevronRight, MoreHorizontal
} from 'lucide-react';
import { useGlobalTools } from '../hooks/useGlobalTools';
import AIVideoGeneratorWorkspace from './AIVideoGeneratorWorkspace';
import AIImageGeneratorWorkspace from './AIImageGeneratorWorkspace';
import VideoAnimateWorkspace from './VideoAnimateWorkspace';
import ImageLibraryModal from './ImageLibraryModal';
import { pricingApi, PricingModel } from '../apis/pricing';

const GlobalToolsBar: React.FC = () => {
  const g = useGlobalTools();
  const [showModalityMenu, setShowModalityMenu] = useState(false);
  const [availableModels, setAvailableModels] = useState<PricingModel[]>([]);
  const [showAllModels, setShowAllModels] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch models from pricing API
  useEffect(() => {
    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const res = await pricingApi.getPricing({ tool: g.modality });
        if (res.success && res.data) {
          setAvailableModels(res.data);
          if (res.data.length > 0 && !res.data.find(m => m.modelKey === g.selectedModel)) {
            g.setSelectedModelId(res.data[0].modelKey);
          }
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
      } finally {
        setLoadingModels(false);
      }
    };
    if (g.isExpanded) fetchModels();
  }, [g.modality, g.isExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowModalityMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettingsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    g.setIsSettingsOpen(!g.isSettingsOpen);
  };

  const aspectRatios = [
    { id: '16:9', icon: <Monitor size={12} /> },
    { id: '4:3', icon: <div className="w-2.5 h-2 border border-current rounded-sm" /> },
    { id: '1:1', icon: <div className="w-2.5 h-2.5 border border-current rounded-sm" /> },
    { id: '3:4', icon: <div className="w-2 h-2.5 border border-current rounded-sm" /> },
    { id: '9:16', icon: <Smartphone size={12} /> }
  ];

  const Switch = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`w-8 h-4 rounded-full relative transition-all duration-300 ${active ? 'bg-[#0090ff] shadow-[0_0_8px_rgba(0,144,255,0.4)]' : 'bg-slate-200 dark:bg-zinc-800'}`}
    >
      <motion.div 
        animate={{ x: active ? 18 : 2 }}
        className="absolute top-0.5 left-0 w-3 h-3 bg-white rounded-full shadow-md"
      />
    </button>
  );

  const visibleModels = showAllModels ? availableModels : availableModels.slice(0, 3);

  return (
    <>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[300] w-full max-w-2xl px-4 pb-6 pointer-events-none">
        <motion.div 
          layout
          initial={false}
          animate={{ 
            height: g.isExpanded ? 'auto' : '56px',
            width: g.isExpanded ? '100%' : '240px',
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="mx-auto pointer-events-auto relative transition-all duration-300 group"
        >
          {/* BACKGROUND & BORDER ANIMATION */}
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
            <div className="absolute inset-[-500%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_320deg,#0090ff_360deg)] opacity-30 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-[1px] bg-white/95 dark:bg-[#0d0d0f]/98 backdrop-blur-3xl rounded-[2rem]"></div>
          </div>
          
          {/* CONTENT LAYER */}
          <div className="relative w-full h-full rounded-[2rem] flex flex-col z-10">
            <AnimatePresence mode="wait">
              {g.isExpanded ? (
                <motion.div 
                  key="expanded"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-1.5 lg:p-2"
                >
                  <div className="flex items-start gap-3 p-2">
                    <div className="relative shrink-0 mt-1">
                      <button 
                        onClick={() => g.setIsLibraryOpen(true)}
                        className="w-9 h-9 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-400 dark:text-gray-400 transition-all active:scale-95 overflow-hidden border border-black/5 dark:border-white/10"
                      >
                        {g.selectedAsset ? (
                          <img src={g.selectedAsset} className="w-full h-full object-cover" alt="Selected" />
                        ) : (
                          <Plus size={16} />
                        )}
                      </button>
                      {g.selectedAsset && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); g.setSelectedAsset(null); }}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                        >
                          <X size={10} strokeWidth={4} />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-grow pt-1.5">
                      <textarea 
                        ref={g.textareaRef}
                        value={g.prompt}
                        onChange={(e) => g.setPrompt(e.target.value)}
                        onKeyDown={g.onKeyDown}
                        placeholder="Mô tả ý tưởng sáng tạo của bạn..."
                        className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 resize-none max-h-48 min-h-[28px] no-scrollbar leading-relaxed"
                        rows={1}
                      />
                    </div>

                    <div className="flex flex-col gap-0.5 shrink-0">
                       {g.prompt && (
                         <button 
                            onClick={g.handleClear}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                         >
                            <X size={14} />
                         </button>
                       )}
                       <button 
                         onClick={() => { g.setIsExpanded(false); g.setIsSettingsOpen(false); }}
                         className="p-1.5 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                       >
                         <ChevronDown size={18} />
                       </button>
                    </div>
                  </div>

                  {/* INLINE SETTINGS EXTENSION */}
                  <AnimatePresence>
                    {g.isSettingsOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="block border-t border-black/5 dark:border-white/5 mt-2 pt-4 px-2 space-y-5 pb-4 overflow-hidden"
                      >
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                            {/* Models & Resolution */}
                            <div className="space-y-4">
                               <div className="space-y-2">
                                  <div className="flex items-center justify-between px-1">
                                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Model Engine</label>
                                    {availableModels.length > 3 && (
                                      <button 
                                        onClick={() => setShowAllModels(!showAllModels)}
                                        className="text-[8px] font-black text-brand-blue uppercase hover:underline flex items-center gap-0.5"
                                      >
                                        {showAllModels ? 'Less' : `+${availableModels.length - 3} More`}
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                     {loadingModels ? (
                                       <div className="w-full flex items-center justify-center py-2 opacity-20">
                                         <Loader2 size={14} className="animate-spin" />
                                       </div>
                                     ) : (
                                       visibleModels.map(m => (
                                         <button 
                                           key={m._id} onClick={() => g.setSelectedModelId(m.modelKey)}
                                           className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all border ${g.selectedModel === m.modelKey ? 'border-brand-blue bg-brand-blue/5 text-brand-blue shadow-sm' : 'border-black/5 dark:border-white/5 text-gray-500'}`}
                                         >
                                           {m.name}
                                         </button>
                                       ))
                                     )}
                                  </div>
                               </div>
                               <div className="flex items-center justify-between">
                                  <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Resolution</label>
                                  <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                                     {['1080P', '720P'].map(r => (
                                       <button key={r} onClick={() => g.setResolution(r)} className={`px-3 py-1 rounded-md text-[8px] font-black transition-all ${g.resolution === r ? 'bg-white dark:bg-[#2a2a2e] text-brand-blue shadow-sm' : 'text-gray-500'}`}>{r}</button>
                                     ))}
                                  </div>
                               </div>
                            </div>

                            {/* Ratio & Switches */}
                            <div className="space-y-4">
                               <div className="space-y-2">
                                  <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Aspect Ratio</label>
                                  <div className="flex gap-1 overflow-x-auto no-scrollbar">
                                     {aspectRatios.map(r => (
                                       <button 
                                         key={r.id} onClick={() => g.setAspectRatio(r.id)}
                                         className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-3 border rounded-md transition-all ${g.aspectRatio === r.id ? 'border-brand-blue text-brand-blue bg-brand-blue/5' : 'border-black/5 dark:border-white/5 text-gray-500'}`}
                                       >
                                          {r.icon}
                                          <span className="text-[7px] font-bold">{r.id}</span>
                                       </button>
                                     ))}
                                  </div>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="flex items-center justify-between gap-2">
                                     <span className="text-[8px] font-black text-gray-500 uppercase truncate">Enhance</span>
                                     <Switch active={g.switches.enhance} onChange={() => g.setSwitches({...g.switches, enhance: !g.switches.enhance})} />
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                     <span className="text-[8px] font-black text-gray-500 uppercase truncate">Credits</span>
                                     <Switch active={g.switches.credits} onChange={() => g.setSwitches({...g.switches, credits: !g.switches.credits})} />
                                  </div>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between mt-1 px-2 pb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="relative" ref={menuRef}>
                        <button 
                          onClick={() => setShowModalityMenu(!showModalityMenu)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${showModalityMenu ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:text-brand-blue'}`}
                        >
                          {g.modality === 'video' ? <Video size={14} /> : g.modality === 'image' ? <ImageIcon size={14} /> : <Activity size={14} />}
                        </button>

                        <AnimatePresence>
                          {showModalityMenu && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.9 }}
                              className="absolute bottom-full mb-3 left-0 bg-white dark:bg-[#1a1a1e] border border-black/10 dark:border-white/10 rounded-xl p-1 shadow-2xl z-[310] min-w-[140px]"
                            >
                               <button 
                                 onClick={() => { g.setModality('video'); setShowModalityMenu(false); }}
                                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${g.modality === 'video' ? 'bg-brand-blue text-white' : 'text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                               >
                                 <Video size={12} /> Video AI
                               </button>
                               <button 
                                 onClick={() => { g.setModality('image'); setShowModalityMenu(false); }}
                                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${g.modality === 'image' ? 'bg-brand-blue text-white' : 'text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                               >
                                 <ImageIcon size={12} /> Image AI
                               </button>
                               <button 
                                 onClick={() => { g.setModality('animate'); setShowModalityMenu(false); }}
                                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${g.modality === 'animate' ? 'bg-brand-blue text-white' : 'text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                               >
                                 <Activity size={12} /> Animate AI
                               </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <button 
                        onClick={g.handleGenerate}
                        disabled={!g.prompt.trim()}
                        className={`relative overflow-hidden px-6 h-8 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.95] shadow-md ${
                          !g.prompt.trim()
                            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 grayscale cursor-not-allowed'
                            : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:brightness-110'
                        }`}
                      >
                        <div className="flex items-center gap-2 relative z-10">
                           <Zap size={12} fill="currentColor" />
                           <span>Generate</span>
                        </div>
                      </button>

                      <button 
                        onClick={handleSettingsToggle}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${g.isSettingsOpen ? 'bg-brand-blue text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:text-brand-blue'}`}
                      >
                        <SlidersHorizontal size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-black/40 px-3 h-8 rounded-full border border-black/5 dark:border-white/5 shadow-inner transition-colors shrink-0 text-slate-800 dark:text-white">
                       <Sparkles size={10} className="text-brand-blue" fill="currentColor" />
                       <span className="text-[10px] font-black italic">{(g.credits || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => g.setIsExpanded(true)}
                  className="flex-grow w-full h-[56px] flex items-center justify-between px-6 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-blue blur-md opacity-20 group-hover:opacity-100 transition-opacity"></div>
                      <Sparkles size={16} className="text-brand-blue relative z-10 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400 group-hover:text-brand-blue transition-colors">Quick Studio</span>
                  </div>
                  <ChevronUp size={14} className="text-slate-400 dark:text-gray-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* FULLSCREEN WORKSPACE MODALS */}
      <AnimatePresence>
        {g.isVideoModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-black">
             <AIVideoGeneratorWorkspace onClose={() => g.setIsVideoModalOpen(false)} />
          </motion.div>
        )}
        {g.isImageModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-black">
             <AIImageGeneratorWorkspace onClose={() => g.setIsImageModalOpen(false)} />
          </motion.div>
        )}
        {g.isAnimateModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-black">
             <VideoAnimateWorkspace onClose={() => g.setIsAnimateModalOpen(false)} />
          </motion.div>
        )}
        {g.isLibraryOpen && (
          <ImageLibraryModal 
            isOpen={g.isLibraryOpen}
            onClose={() => g.setIsLibraryOpen(false)}
            onConfirm={(assets) => {
              if (assets.length > 0) {
                 g.setSelectedAsset(assets[0].url);
              }
              g.setIsLibraryOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default GlobalToolsBar;
