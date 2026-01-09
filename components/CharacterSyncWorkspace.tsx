
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Loader2, Download, History as HistoryIcon, 
  Activity, Monitor, Key, Coins, Film, CheckCircle2, Share2, 
  Plus, Settings, Calendar, Clock, AlertCircle, Box, MonitorPlay,
  Volume2, VolumeX, RefreshCw, Trash2, Play, Pause, Maximize2, Edit3,
  ChevronUp, SlidersHorizontal, LayoutGrid, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageLibraryModal from './ImageLibraryModal';
import ResourceAuthModal from './common/ResourceAuthModal';
import ProductImageWorkspace from './ProductImageWorkspace';
import { GCSAssetMetadata } from '../services/storage';

// Import hooks & components
import { useCharacterSync, ProductionJob } from '../hooks/useCharacterSync';
import { RegistrySection } from './character-sync/RegistrySection';
import { NarrativeBeats } from './character-sync/NarrativeBeats';
import { ModelSelectionSection } from './character-sync/ModelSelectionSection';
import { ParameterSettings } from './character-sync/ParameterSettings';
import { TutorialModal } from './character-sync/TutorialModal';
import { TemplateModal } from './character-sync/TemplateModal';
import { GuideSlider } from './character-sync/GuideSlider';

const ProductionCard: React.FC<{ 
  job: ProductionJob;
  onDownload: (url: string, filename: string) => void;
  onDelete: (id: string) => void;
  onFullscreen: (url: string) => void;
  onEdit: (url: string) => void;
}> = ({ job, onDownload, onDelete, onFullscreen, onEdit }) => {
  const isDone = job.status === 'COMPLETED';
  const isFailed = job.status === 'FAILED';
  const isProcessing = job.status === 'SYNTHESIZING';
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current || !isDone) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const cardBaseClass = "relative group bg-white dark:bg-[#111114] border border-black/5 dark:border-white/5 rounded-[2rem] overflow-hidden transition-all shadow-md hover:shadow-xl hover:border-brand-blue/30";

  return (
    <div className={cardBaseClass}>
      <div className="aspect-video bg-slate-100 dark:bg-black relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={togglePlay}>
         {isDone && job.url ? (
           <>
            <video 
              ref={videoRef}
              src={job.url} 
              loop 
              muted 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
            />
            <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
               {isPlaying ? <Pause size={32} className="text-white drop-shadow-lg" fill="currentColor" /> : <Play size={32} className="text-white drop-shadow-lg ml-1" fill="currentColor" />}
            </div>
           </>
         ) : isProcessing ? (
           <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <Loader2 size={24} className="text-brand-blue animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={12} className="text-brand-blue/40 animate-pulse" />
                </div>
              </div>
              <p className="text-[7px] font-black uppercase tracking-[0.2em] text-brand-blue animate-pulse">Rendering</p>
           </div>
         ) : isFailed ? (
           <div className="text-center px-4 space-y-2">
              <AlertCircle size={16} className="mx-auto text-red-500" />
              <p className="text-[8px] font-black uppercase text-red-500 leading-tight">
                {job.error || 'Lỗi tạo video, vui lòng thử lại'}
              </p>
           </div>
         ) : (
           <Activity size={16} className="text-gray-800 animate-pulse" />
         )}

         <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 z-20 flex gap-1.5">
            {isDone && job.url && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDownload(job.url!, `sync_${job.id}.mp4`); }}
                  className="p-1.5 bg-black/60 backdrop-blur-md rounded text-white hover:bg-brand-blue shadow-xl transition-all"
                  title="Tải xuống MP4"
                >
                  <Download size={12} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onFullscreen(job.url!); }}
                  className="p-1.5 bg-black/60 backdrop-blur-md rounded text-white hover:bg-brand-blue shadow-xl transition-all"
                  title="Phóng to"
                >
                  <Maximize2 size={12} />
                </button>
              </>
            )}
            {(isDone || isFailed) && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(job.id); }}
                className="p-1.5 bg-black/60 backdrop-blur-md rounded text-white hover:bg-red-600 shadow-xl transition-all"
                title="Xóa bản ghi"
              >
                <Trash2 size={12} />
              </button>
            )}
         </div>
      </div>

      <div className="p-4 space-y-2">
         <div className="space-y-0.5">
            <h4 className="text-[10px] font-black uppercase text-slate-800 dark:text-white leading-none truncate italic">"{job.prompt}"</h4>
            <div className="flex justify-between items-center mt-2">
               <span className="flex items-center gap-1"><Clock size={8} /> {job.timestamp}</span>
            </div>
         </div>

         <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/5">
            <div className={`flex items-center gap-0.5 text-[8px] font-black italic ${job.isRefunded ? 'text-emerald-500' : 'text-orange-500'}`}>
               <Zap size={8} fill="currentColor" />
               <span>{job.isRefunded ? 'ĐÃ HOÀN TRẢ' : `-${job.cost}`}</span>
            </div>
            <span className="text-[6px] font-black uppercase text-slate-300 dark:text-gray-700 italic">{job.modelName}</span>
         </div>
      </div>
    </div>
  );
};

const CharacterSyncWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits } = useAuth();
  const api = useCharacterSync();
  
  // UI Specific States
  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isResumingGenerate, setIsResumingGenerate] = useState(false);
  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Editor States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevHistoryLength = useRef(api.history.length);

  // Added todayKey to resolve missing name errors in current tab filters
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Auto Download Trigger
  useEffect(() => {
    if (autoDownload && api.history.length > prevHistoryLength.current) {
      const newItems = api.history.slice(0, api.history.length - prevHistoryLength.current);
      newItems.forEach(item => {
        if (item.url) handleDownload(item.url, `sync_${item.id}.mp4`);
      });
    }
    prevHistoryLength.current = api.history.length;
  }, [api.history, autoDownload]);

  useEffect(() => {
    const vault = localStorage.getItem('skyverses_model_vault');
    if (vault) {
      try {
        const keys = JSON.parse(vault);
        setHasPersonalKey(!!(keys.gemini && keys.gemini.trim() !== ''));
      } catch (e) { setHasPersonalKey(false); }
    }
  }, [showResourceModal]);

  const handleSynthesizeClick = async () => {
    // Tự động thu gọn sidebar trên mobile khi bắt đầu tạo
    if (window.innerWidth < 1024) setIsMobileExpanded(false);
    
    const status = await api.handleSynthesize();
    if (status === 'NEED_RESOURCE_MODAL') {
      setIsResumingGenerate(true);
      setShowResourceModal(true);
    } else if (status === 'LOW_CREDITS') {
      alert("Số dư không đủ.");
    }
  };

  const handleLibrarySelect = (assets: GCSAssetMetadata[]) => {
    if (assets.length > 0 && activeSlotIdx !== null && activeSlotIdx >= 0) {
      api.updateSlot(activeSlotIdx, { url: assets[0].url, mediaId: assets[0].mediaId || null });
    }
    setIsLibraryOpen(false);
  };

  const openEditor = (url: string) => {
    setEditorImage(url);
    setIsEditorOpen(true);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const handleDeleteJob = (id: string) => {
    api.setJobs(prev => prev.filter(j => j.id !== id));
    api.setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleDownloadAll = () => {
    const completed = api.history.filter(h => h.status === 'COMPLETED' && h.url);
    if (completed.length === 0) return;
    completed.forEach((h, i) => {
      setTimeout(() => handleDownload(h.url!, `sync_${h.id}.mp4`), i * 800);
    });
  };

  const groupedHistory = useMemo(() => {
    const groups: Record<string, ProductionJob[]> = {};
    
    api.history.forEach(job => {
      let key = job.dateKey;
      if (key === todayKey) key = 'Hôm nay';
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(job);
    });
    return groups;
  }, [api.history, todayKey]);

  const disabledReason = useMemo(() => {
    if (api.isGenerating) return null;
    const hasChar = api.slots.some(s => s.url);
    if (!hasChar) return "Vui lòng thêm ít nhất một Nhân vật";
    const hasPrompt = api.sequences.some(s => s.text.trim() !== '');
    if (!hasPrompt) return "Vui lòng nhập nội dung Kịch bản";
    if (!api.hasValidSequence) return "Kịch bản chưa chứa tên Nhân vật đã nạp";
    if (api.usagePreference === 'credits' && credits < api.totalCostEstimate) return `Cần ${api.totalCostEstimate} CR để khởi chạy`;
    return null;
  }, [api.isGenerating, api.slots, api.sequences, api.hasValidSequence, api.usagePreference, credits, api.totalCostEstimate]);

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-[#050506] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500 relative">
      
      {/* Container flex-col-reverse trên mobile để Main Viewport ở trên, Sidebar ở dưới */}
      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden relative">
        <AnimatePresence>
          {isMobileExpanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileExpanded(false)} className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm" />
          )}
        </AnimatePresence>

        <section className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[400px] bg-white dark:bg-[#08080a] lg:bg-slate-50 lg:dark:bg-[#020203] border-t lg:border-t-0 lg:border-r border-black/10 dark:border-white/5 flex flex-col z-[150] lg:z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none transition-all duration-500 ease-in-out ${isMobileExpanded ? 'h-[92dvh] rounded-t-[2.5rem]' : 'h-20 lg:h-full lg:rounded-none'}`}>
           
           {/* Mobile Handle Bar & Header */}
           <header 
             className="h-20 lg:h-12 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0c0c0e] flex flex-col lg:flex-row items-center justify-between px-6 shrink-0 z-160 cursor-pointer lg:cursor-default"
             onClick={() => window.innerWidth < 1024 && setIsMobileExpanded(!isMobileExpanded)}
           >
              {/* Mobile Handle Indicator */}
              <div className="lg:hidden w-12 h-1.5 bg-slate-300 dark:bg-white/10 rounded-full mt-2 mb-3"></div>

              <div className="flex items-center justify-between w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 lg:w-6 lg:h-6 bg-brand-blue rounded flex items-center justify-center text-white shadow-lg"><Monitor size={12} /></div>
                  <div className="flex flex-col lg:flex-row lg:items-center">
                    <h1 className="text-sm lg:text-xs font-black uppercase tracking-tight lg:tracking-[0.4em] italic leading-tight">Character Sync <span className="text-brand-blue">Studio</span></h1>
                    <p className="lg:hidden text-[8px] font-bold text-slate-400 uppercase tracking-widest">{isMobileExpanded ? 'Chạm để thu gọn' : 'Chạm để cấu hình'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                  <div className="lg:hidden p-2 rounded-full bg-slate-100 dark:bg-white/5 transition-transform duration-500">
                    {isMobileExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                  </div>
                </div>
              </div>
           </header>

           {/* Sidebar Body - Hidden when collapsed on mobile */}
           <div className={`flex-grow overflow-y-auto no-scrollbar ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
              <RegistrySection 
                slots={api.slots} 
                updateSlot={api.updateSlot} 
                onOpenLibrary={(idx) => { setActiveSlotIdx(idx); setIsLibraryOpen(true); }}
                onTriggerUpload={(idx) => { setActiveSlotIdx(idx); fileInputRef.current?.click(); }}
                uploadingIdx={api.uploadingIdx}
                onOpenTutorial={() => api.setShowTutorial(true)}
              />

              <NarrativeBeats 
                sequences={api.sequences} 
                setSequences={api.setSequences} 
                addSequence={api.addSequence} 
                removeSequence={api.removeSequence}
                activeCharacterNames={api.activeCharacterNames}
              />

              <ModelSelectionSection 
                availableModels={api.availableModels}
                selectedModel={api.selectedModel}
                setSelectedModel={api.setSelectedModel}
                selectedEngine={api.selectedEngine}
                setSelectedEngine={api.setSelectedEngine}
                unitCost={api.currentUnitCost}
              />

              <ParameterSettings 
                resolution={api.resolution}
                setResolution={api.setResolution}
                availableResolutions={api.availableResolutions}
                aspectRatio={api.aspectRatio}
                setAspectRatio={api.setAspectRatio}
                duration={api.duration}
                setDuration={api.setDuration}
                availableDurations={api.availableDurations}
              />
           </div>

           {/* Bottom Action Footer - Hidden when collapsed on mobile */}
           <div className={`p-6 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0e] lg:bg-slate-50/80 lg:dark:bg-[#08080a] space-y-4 shadow-2xl shrink-0 ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
              <div className="flex justify-between items-center px-1">
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest italic">Số dư:</span>
                    <div className="flex items-center gap-1 text-brand-blue font-black italic text-sm">
                       <Coins size={12} fill="currentColor" />
                       <span>{credits.toLocaleString()}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 pr-1 text-right">
                    <span className="text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest italic leading-none">Chi phí:</span>
                    <div className="flex items-center gap-1 text-orange-500 font-black italic text-sm leading-none">
                       <Zap size={12} fill="currentColor" />
                       <span>{api.currentUnitCost}</span>
                    </div>
                 </div>
              </div>

              <div className="relative group/genbtn">
                 <button 
                   onClick={handleSynthesizeClick} 
                   disabled={!!disabledReason || api.isGenerating} 
                   className={`w-full py-5 rounded-xl text-white font-black uppercase text-xs tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-4 group ${!!disabledReason || api.isGenerating ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-600 cursor-not-allowed grayscale' : 'bg-purple-600 shadow-purple-500/20 hover:brightness-110 active:scale-95'}`}
                 >
                    {api.isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />} 
                    TẠO
                 </button>

                 {disabledReason && (
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover/genbtn:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover/genbtn:translate-y-0 z-[160]">
                      <div className="bg-slate-800 dark:bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap border border-white/10 relative">
                         {disabledReason}
                         <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-900 rotate-45 -mb-1 border-r border-b border-white/10"></div>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </section>

        {/* Main Results Viewport */}
        <aside className="flex-grow h-full flex flex-col bg-[#f8f9fa] dark:bg-[#050506] lg:bg-white lg:dark:bg-[#08080a] border-l border-black/5 dark:border-white/5 transition-colors relative">
           <div className="h-14 lg:h-12 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-[#0c0c0e]/40 backdrop-blur-md z-40">
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/10">
                 {[
                   { id: 'CURRENT', label: 'Phiên hiện tại' },
                   { id: 'HISTORY', label: 'Lịch sử' }
                 ].map(tab => (
                   <button 
                    key={tab.id}
                    onClick={() => api.setActiveResultTab(tab.id as any)}
                    className={`px-4 md:px-6 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${api.activeResultTab === tab.id ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-slate-400 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white'}`}
                   >
                     {tab.label}
                   </button>
                 ))}
              </div>

              <div className="flex items-center gap-4">
                 <div className="hidden sm:flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full border border-black/5 dark:border-white/10">
                    <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">Tự động tải</span>
                    <button onClick={() => setAutoDownload(!autoDownload)} className={`w-8 h-4 rounded-full relative transition-colors ${autoDownload ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                       <motion.div animate={{ left: autoDownload ? 18 : 2 }} className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                    </button>
                 </div>
                 <button onClick={handleDownloadAll} className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-brand-blue text-white rounded-full text-[9px] font-black uppercase hover:brightness-110 shadow-lg">
                    <Download size={14} /> <span className="hidden xs:inline">Tải tất cả</span>
                 </button>
                 <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
              </div>
           </div>
           
           <div className="flex-grow overflow-y-auto no-scrollbar px-4 md:px-8 py-8 pb-32 lg:pb-12">
              <AnimatePresence mode="wait">
                {api.activeResultTab === 'CURRENT' ? (
                  <motion.div key="current" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                    {api.jobs.length === 0 && api.history.filter(h => h.dateKey === todayKey).length === 0 ? (
                       <GuideSlider onOpenTemplates={() => api.setIsTemplateModalOpen(true)} />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {api.jobs.map(job => (
                          <ProductionCard key={job.id} job={job} onDownload={handleDownload} onDelete={handleDeleteJob} onFullscreen={(url) => setFullscreenUrl(url)} onEdit={openEditor} />
                        ))}
                        {api.history.filter(h => h.dateKey === todayKey).map(job => (
                          <ProductionCard key={job.id} job={job} onDownload={handleDownload} onDelete={handleDeleteJob} onFullscreen={(url) => setFullscreenUrl(url)} onEdit={openEditor} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16">
                    {api.history.length === 0 ? (
                       <div className="py-24 text-center opacity-10 flex flex-col items-center gap-6 select-none"><Film size={80} strokeWidth={1} /><p className="text-sm font-black uppercase tracking-[0.5em]">No records found</p></div>
                    ) : (
                      (Object.entries(groupedHistory) as [string, ProductionJob[]][]).map(([date, items]) => (
                        <div key={date} className="space-y-6">
                           <div className="flex items-center gap-4"><div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5"><Calendar size={12} className="text-brand-blue" /></div><h5 className="text-[11px] font-black uppercase italic tracking-tighter text-slate-800 dark:text-white/80">{date}</h5><div className="h-px flex-grow bg-black/5 dark:border-white/10 opacity-40"></div></div>
                           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{items.map(job => (<ProductionCard key={job.id} job={job} onDownload={handleDownload} onDelete={handleDeleteJob} onFullscreen={(url) => setFullscreenUrl(url)} onEdit={openEditor} />))}</div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </aside>
      </div>

      <AnimatePresence>
        {fullscreenUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/95 flex flex-col items-center justify-center p-4 md:p-12">
            <button onClick={() => setFullscreenUrl(null)} className="absolute top-8 right-8 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-50 backdrop-blur-md"><X size={28} /></button>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-6xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-[0_0_150px_rgba(147,51,234,0.3)] border border-white/10 relative"><video src={fullscreenUrl} autoPlay controls className="w-full h-full object-contain" /></motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TemplateModal isOpen={api.isTemplateModalOpen} onClose={() => api.setIsTemplateModalOpen(false)} onApply={api.applyTemplate} />
      <TutorialModal isOpen={api.showTutorial} onClose={api.closeTutorial} />
      <ImageLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} onConfirm={handleLibrarySelect} onEdit={(url) => { openEditor(url); setIsLibraryOpen(false); }} maxSelect={1} />
      <ProductImageWorkspace isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} initialImage={editorImage} onApply={(newUrl) => { if (activeSlotIdx !== null && activeSlotIdx >= 0) { api.updateSlot(activeSlotIdx, { url: newUrl }); } setIsEditorOpen(false); }} />
      <ResourceAuthModal isOpen={showResourceModal} onClose={() => setShowResourceModal(false)} onConfirm={(pref) => { api.setUsagePreference(pref); localStorage.setItem('skyverses_usage_preference', pref); setShowResourceModal(false); if (isResumingGenerate) { setIsResumingGenerate(false); api.handleSynthesize(); } }} hasPersonalKey={hasPersonalKey} totalCost={api.currentUnitCost} />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => api.handleLocalUpload(e, activeSlotIdx)} />
    </div>
  );
};

export default CharacterSyncWorkspace;
