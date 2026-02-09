
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ChevronDown, ChevronUp, 
  Video, SlidersHorizontal, Sparkles,
  Zap, Loader2, X, Image as ImageIcon,
  Move, Activity
} from 'lucide-react';
import { useGlobalTools } from '../hooks/useGlobalTools';
import AIVideoGeneratorWorkspace from './AIVideoGeneratorWorkspace';
import AIImageGeneratorWorkspace from './AIImageGeneratorWorkspace';
import VideoAnimateWorkspace from './VideoAnimateWorkspace';
import ImageLibraryModal from './ImageLibraryModal';
import GlobalSettingsModal from './GlobalSettingsModal';

const GlobalToolsBar: React.FC = () => {
  const {
    prompt, setPrompt, isExpanded, setIsExpanded,
    modality, setModality,
    selectedAsset, setSelectedAsset,
    isVideoModalOpen, setIsVideoModalOpen,
    isImageModalOpen, setIsImageModalOpen,
    isAnimateModalOpen, setIsAnimateModalOpen,
    isLibraryOpen, setIsLibraryOpen,
    isSettingsOpen, setIsSettingsOpen,
    textareaRef, handleGenerate, handleClear, onKeyDown, credits
  } = useGlobalTools();

  const [showModalityMenu, setShowModalityMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close modality menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowModalityMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[300] w-full max-w-2xl px-4 pb-6 pointer-events-none">
        <motion.div 
          layout
          initial={false}
          animate={{ 
            height: isExpanded ? 'auto' : '60px',
            width: isExpanded ? '100%' : '220px',
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="mx-auto pointer-events-auto relative rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.7)] overflow-hidden p-[1px] transition-colors group"
        >
          {/* RUNNING BORDER ANIMATION LAYER */}
          <div className="absolute inset-[-500%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_320deg,#0090ff_360deg)] opacity-30 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          {/* INNER CONTENT LAYER */}
          <div className="relative w-full h-full bg-white/95 dark:bg-[#0d0d0f]/98 backdrop-blur-3xl rounded-[2rem] overflow-hidden transition-colors">
            <AnimatePresence mode="wait">
              {isExpanded ? (
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
                        onClick={() => setIsLibraryOpen(true)}
                        className="w-9 h-9 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-400 dark:text-gray-400 transition-all active:scale-95 overflow-hidden border border-black/5 dark:border-white/10"
                      >
                        {selectedAsset ? (
                          <img src={selectedAsset} className="w-full h-full object-cover" alt="Selected" />
                        ) : (
                          <Plus size={16} />
                        )}
                      </button>
                      {selectedAsset && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedAsset(null); }}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                        >
                          <X size={10} strokeWidth={4} />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-grow pt-1.5">
                      <textarea 
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Mô tả ý tưởng sáng tạo của bạn..."
                        className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 resize-none max-h-48 min-h-[28px] no-scrollbar leading-relaxed"
                        rows={1}
                      />
                    </div>

                    <div className="flex flex-col gap-0.5 shrink-0">
                       {prompt && (
                         <button 
                            onClick={handleClear}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                         >
                            <X size={14} />
                         </button>
                       )}
                       <button 
                         onClick={() => setIsExpanded(false)}
                         className="p-1.5 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                       >
                         <ChevronDown size={18} />
                       </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1 px-2 pb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="relative" ref={menuRef}>
                        <button 
                          onClick={() => setShowModalityMenu(!showModalityMenu)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${showModalityMenu ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:text-brand-blue'}`}
                        >
                          {modality === 'video' ? <Video size={14} /> : modality === 'image' ? <ImageIcon size={14} /> : <Activity size={14} />}
                        </button>

                        <AnimatePresence>
                          {showModalityMenu && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.9 }}
                              className="absolute bottom-full mb-3 left-0 bg-white dark:bg-[#1a1a1e] border border-black/10 dark:border-white/10 rounded-xl p-1 shadow-2xl z-[310] min-w-[120px]"
                            >
                               <button 
                                 onClick={() => { setModality('video'); setShowModalityMenu(false); }}
                                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${modality === 'video' ? 'bg-brand-blue text-white' : 'text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                               >
                                 <Video size={12} /> Video AI
                               </button>
                               <button 
                                 onClick={() => { setModality('image'); setShowModalityMenu(false); }}
                                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${modality === 'image' ? 'bg-brand-blue text-white' : 'text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                               >
                                 <ImageIcon size={12} /> Image AI
                               </button>
                               <button 
                                 onClick={() => { setModality('animate'); setShowModalityMenu(false); }}
                                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${modality === 'animate' ? 'bg-brand-blue text-white' : 'text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                               >
                                 <Activity size={12} /> Animate AI
                               </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <button 
                        onClick={handleGenerate}
                        disabled={!prompt.trim()}
                        className={`relative overflow-hidden px-6 h-8 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.95] shadow-md ${
                          !prompt.trim()
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
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-8 h-8 bg-slate-50 dark:bg-white/5 hover:bg-brand-blue/10 dark:hover:bg-brand-blue/10 rounded-full flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-brand-blue transition-all"
                      >
                        <SlidersHorizontal size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-black/40 px-3 h-8 rounded-full border border-black/5 dark:border-white/5 shadow-inner transition-colors shrink-0">
                       <Sparkles size={10} className="text-brand-blue" fill="currentColor" />
                       <span className="text-[10px] font-black italic text-slate-700 dark:text-white">{(credits || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsExpanded(true)}
                  className="w-full h-full flex items-center justify-between px-6 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
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
        {isVideoModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-black">
             <AIVideoGeneratorWorkspace onClose={() => setIsVideoModalOpen(false)} />
          </motion.div>
        )}
        {isImageModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-black">
             <AIImageGeneratorWorkspace onClose={() => setIsImageModalOpen(false)} />
          </motion.div>
        )}
        {isAnimateModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-black">
             <VideoAnimateWorkspace onClose={() => setIsAnimateModalOpen(false)} />
          </motion.div>
        )}
        {isLibraryOpen && (
          <ImageLibraryModal 
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
            onConfirm={(assets) => {
              if (assets.length > 0) {
                 setSelectedAsset(assets[0].url);
              }
              setIsLibraryOpen(false);
            }}
          />
        )}
        {isSettingsOpen && (
          <GlobalSettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
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
