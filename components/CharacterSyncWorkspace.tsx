import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Loader2, Download, Activity, Monitor, Coins, Film,
  Calendar, Clock, AlertCircle, Play, Pause, Maximize2,
  Trash2, ChevronLeft, Fingerprint, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ImageLibraryModal from './ImageLibraryModal';
import ResourceAuthModal from './common/ResourceAuthModal';
import ProductImageWorkspace from './ProductImageWorkspace';
import { GCSAssetMetadata } from '../services/storage';

import { useCharacterSync, ProductionJob } from '../hooks/useCharacterSync';
import { RegistrySection } from './character-sync/RegistrySection';
import { NarrativeBeats } from './character-sync/NarrativeBeats';
import { ModelSelectionSection } from './character-sync/ModelSelectionSection';
import { ParameterSettings } from './character-sync/ParameterSettings';
import { TutorialModal } from './character-sync/TutorialModal';
import { TemplateModal } from './character-sync/TemplateModal';
import { GuideSlider } from './character-sync/GuideSlider';
import { MobileGeneratorBar } from './common/MobileGeneratorBar';

/* ─── PRODUCTION CARD ─── */
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
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="group relative bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-purple-500/20 transition-all">
      <div className="aspect-video bg-slate-100 dark:bg-black relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={togglePlay}>
        {isDone && job.url ? (
          <>
            <video ref={videoRef} src={job.url} loop muted className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
              {isPlaying ? <Pause size={28} className="text-white drop-shadow-lg" fill="currentColor" /> : <Play size={28} className="text-white drop-shadow-lg ml-0.5" fill="currentColor" />}
            </div>
          </>
        ) : isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="text-purple-400 animate-spin" />
            <p className="text-[9px] font-bold uppercase tracking-wider text-purple-400 animate-pulse">Rendering...</p>
          </div>
        ) : isFailed ? (
          <div className="text-center px-4 space-y-1.5">
            <AlertCircle size={16} className="mx-auto text-red-400" />
            <p className="text-[9px] font-medium text-red-400">{job.error || 'Lỗi tạo video'}</p>
          </div>
        ) : (
          <Activity size={16} className="text-slate-400 animate-pulse" />
        )}

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1.5 z-20">
          {isDone && job.url && (
            <>
              <button onClick={e => { e.stopPropagation(); onDownload(job.url!, `sync_${job.id}.mp4`); }}
                className="p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-purple-500 transition-all">
                <Download size={12} />
              </button>
              <button onClick={e => { e.stopPropagation(); onFullscreen(job.url!); }}
                className="p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-purple-500 transition-all">
                <Maximize2 size={12} />
              </button>
            </>
          )}
          {(isDone || isFailed) && (
            <button onClick={e => { e.stopPropagation(); onDelete(job.id); }}
              className="p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-all">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h4 className="text-xs font-bold text-slate-700 dark:text-white/80 truncate">{job.prompt}</h4>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500"><Clock size={8} /> {job.timestamp}</span>
          <div className={`flex items-center gap-0.5 text-[9px] font-semibold ${job.isRefunded ? 'text-emerald-500' : 'text-amber-500/80'}`}>
            <Zap size={8} fill="currentColor" />
            <span>{job.isRefunded ? 'Hoàn trả' : `-${job.cost}`}</span>
          </div>
        </div>
        <p className="text-[8px] text-slate-300 dark:text-slate-600 truncate">{job.modelName}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN WORKSPACE
   ═══════════════════════════════════════════════════ */
const CharacterSyncWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits, login, isAuthenticated } = useAuth();
  const api = useCharacterSync();

  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isResumingGenerate, setIsResumingGenerate] = useState(false);
  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const [fullscreenVideo, setFullscreenVideo] = useState<{url: string, hasSound: boolean, id: string} | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevHistoryLength = useRef(api.history.length);
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    if (autoDownload && api.history.length > prevHistoryLength.current) {
      const newItems = api.history.slice(0, api.history.length - prevHistoryLength.current);
      newItems.forEach(item => { if (item.url) handleDownload(item.url, `sync_${item.id}.mp4`); });
    }
    prevHistoryLength.current = api.history.length;
  }, [api.history, autoDownload]);

  useEffect(() => {
    const vault = localStorage.getItem('skyverses_model_vault');
    if (vault) {
      try { const keys = JSON.parse(vault); setHasPersonalKey(!!(keys.gemini && keys.gemini.trim() !== '')); }
      catch { setHasPersonalKey(false); }
    }
  }, [showResourceModal]);

  const handleSynthesizeClick = async () => {
    if (!isAuthenticated) { login(); return; }
    if (window.innerWidth < 1024) setIsMobileExpanded(false);
    const status = await api.handleSynthesize();
    if (status === 'NEED_RESOURCE_MODAL') { setIsResumingGenerate(true); setShowResourceModal(true); }
    else if (status === 'LOW_CREDITS') { alert("Số dư không đủ."); }
  };

  const handleLibrarySelect = (assets: GCSAssetMetadata[]) => {
    if (assets.length > 0 && activeSlotIdx !== null && activeSlotIdx >= 0) {
      api.updateSlot(activeSlotIdx, { url: assets[0].url, mediaId: assets[0].mediaId || null });
    }
    setIsLibraryOpen(false);
  };

  const openEditor = (url: string) => { setEditorImage(url); setIsEditorOpen(true); };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch { window.open(url, '_blank'); }
  };

  const handleDeleteJob = (id: string) => {
    api.setJobs(prev => prev.filter(j => j.id !== id));
    api.setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleDownloadAll = () => {
    const completed = api.history.filter(h => h.status === 'COMPLETED' && h.url);
    completed.forEach((h, i) => setTimeout(() => handleDownload(h.url!, `sync_${h.id}.mp4`), i * 800));
  };

  const groupedHistory = useMemo(() => {
    const groups: Record<string, ProductionJob[]> = {};
    api.history.forEach(job => {
      const key = job.dateKey === todayKey ? 'Hôm nay' : job.dateKey;
      if (!groups[key]) groups[key] = [];
      groups[key].push(job);
    });
    return groups;
  }, [api.history, todayKey]);

  const disabledReason = useMemo(() => {
    if (api.isGenerating) return null;
    if (!api.slots.some(s => s.url)) return "Thêm ít nhất một Nhân vật";
    if (!api.sequences.some(s => s.text.trim() !== '')) return "Nhập nội dung Kịch bản";
    if (!api.hasValidSequence) return "Kịch bản chưa chứa tên Nhân vật";
    if (api.usagePreference === 'credits' && credits < api.totalCostEstimate) return `Cần ${api.totalCostEstimate} CR`;
    return null;
  }, [api.isGenerating, api.slots, api.sequences, api.hasValidSequence, api.usagePreference, credits, api.totalCostEstimate]);

  const primaryPrompt = api.sequences[0]?.text || '';
  const setPrimaryPrompt = (val: string) => api.setSequences(prev => prev.map((s, i) => i === 0 ? { ...s, text: val } : s));

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-300 relative">

      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden relative">
        {/* Mobile overlay */}
        <AnimatePresence>
          {isMobileExpanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileExpanded(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[140]" />
          )}
        </AnimatePresence>

        {/* ─── LEFT SIDEBAR ─── */}
        <section className={`
          fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[340px] xl:w-[360px]
          bg-white dark:bg-[#0c0c10] border-t lg:border-t-0 lg:border-r border-slate-200/80 dark:border-white/[0.04]
          flex flex-col z-[150] lg:z-50 transition-all duration-300
          ${isMobileExpanded ? 'h-[92dvh] rounded-t-2xl shadow-2xl' : 'h-32 lg:h-full lg:rounded-none'}
        `}>

          {/* Mobile Quick Bar */}
          <MobileGeneratorBar
            isExpanded={isMobileExpanded}
            setIsExpanded={setIsMobileExpanded}
            prompt={primaryPrompt}
            setPrompt={setPrimaryPrompt}
            credits={credits}
            totalCost={api.currentUnitCost}
            isGenerating={api.isGenerating}
            isGenerateDisabled={!!disabledReason || api.isGenerating}
            onGenerate={handleSynthesizeClick}
            onOpenLibrary={() => {
              const firstEmptyIdx = api.slots.findIndex(s => !s.url);
              setActiveSlotIdx(firstEmptyIdx >= 0 ? firstEmptyIdx : 0);
              setIsLibraryOpen(true);
            }}
            generateLabel="TẠO"
            type="video"
            tooltip={disabledReason}
          />

          {/* Desktop Header */}
          <header className="hidden lg:flex h-14 border-b border-slate-200/80 dark:border-white/[0.04] bg-white/90 dark:bg-[#0c0c10]/90 backdrop-blur-lg items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <ChevronLeft size={18} />
              </button>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white">
                <Fingerprint size={14} />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-white">Character Sync</span>
            </div>
          </header>

          {/* Sidebar Body */}
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

          {/* Footer */}
          <div className={`shrink-0 border-t border-slate-200/80 dark:border-white/[0.04] bg-white/80 dark:bg-[#0c0c10]/80 backdrop-blur-lg px-4 py-3 space-y-2.5 ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins size={10} className="text-purple-500" />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{credits.toLocaleString()} CR</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500/80">
                <Zap size={10} fill="currentColor" />
                <span className="text-[11px] font-semibold">{api.currentUnitCost}</span>
              </div>
            </div>

            <div className="relative group/genbtn">
              <button onClick={handleSynthesizeClick}
                disabled={!!disabledReason || api.isGenerating}
                className={`w-full py-3.5 rounded-xl text-white font-bold uppercase text-[11px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2.5
                  ${!disabledReason && !api.isGenerating
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:brightness-110 active:scale-[0.98] shadow-purple-500/20'
                    : 'bg-slate-200 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}>
                {api.isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                TẠO
              </button>
              {disabledReason && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/genbtn:opacity-100 pointer-events-none transition-all z-[160]">
                  <div className="bg-slate-800 text-white text-[9px] font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-white/10">
                    {disabledReason}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── RIGHT VIEWPORT ─── */}
        <aside className="flex-grow h-full flex flex-col bg-slate-50 dark:bg-[#050508] transition-colors relative">
          {/* Viewport Header */}
          <div className="h-14 border-b border-slate-200/80 dark:border-white/[0.04] flex items-center justify-between px-4 lg:px-6 shrink-0 bg-white/90 dark:bg-[#0c0c10]/90 backdrop-blur-lg z-40">
            <div className="flex bg-slate-100 dark:bg-white/[0.03] p-1 rounded-xl border border-slate-200/80 dark:border-white/[0.04]">
              {[
                { id: 'CURRENT', label: 'Phiên hiện tại' },
                { id: 'HISTORY', label: 'Lịch sử' }
              ].map(tab => (
                <button key={tab.id} onClick={() => api.setActiveResultTab(tab.id as any)}
                  className={`px-4 md:px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${api.activeResultTab === tab.id
                    ? 'bg-white dark:bg-white/[0.06] text-purple-500 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-white/[0.03] px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-white/[0.04]">
                <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">Auto tải</span>
                <button onClick={() => setAutoDownload(!autoDownload)}
                  className={`w-7 h-3.5 rounded-full relative transition-colors ${autoDownload ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <motion.div animate={{ left: autoDownload ? 15 : 2 }} className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                </button>
              </div>
              <button onClick={handleDownloadAll}
                className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-purple-500 text-white rounded-lg text-[10px] font-bold hover:brightness-110 shadow-md transition-all">
                <Download size={13} /> Tải tất cả
              </button>
              <button onClick={onClose} className="lg:hidden p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-grow overflow-y-auto no-scrollbar px-4 md:px-6 lg:px-8 py-6 pb-32 lg:pb-8">
            <AnimatePresence mode="wait">
              {api.activeResultTab === 'CURRENT' ? (
                <motion.div key="current" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  {api.jobs.length === 0 && api.history.filter(h => h.dateKey === todayKey).length === 0 ? (
                    <GuideSlider onOpenTemplates={() => api.setIsTemplateModalOpen(true)} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {api.jobs.map(job => (
                        <ProductionCard key={job.id} job={job} onDownload={handleDownload} onDelete={handleDeleteJob}
                          onFullscreen={url => setFullscreenVideo({url, hasSound: false, id: job.id})} onEdit={openEditor} />
                      ))}
                      {api.history.filter(h => h.dateKey === todayKey).map(job => (
                        <ProductionCard key={job.id} job={job} onDownload={handleDownload} onDelete={handleDeleteJob}
                          onFullscreen={url => setFullscreenVideo({url, hasSound: false, id: job.id})} onEdit={openEditor} />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                  {api.history.length === 0 ? (
                    <div className="py-24 text-center opacity-10 flex flex-col items-center gap-4 select-none">
                      <Film size={64} strokeWidth={1} />
                      <p className="text-sm font-bold uppercase tracking-wider">Chưa có bản ghi</p>
                    </div>
                  ) : (
                    (Object.entries(groupedHistory) as [string, ProductionJob[]][]).map(([date, items]) => (
                      <div key={date} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500"><Calendar size={12} /></div>
                          <h5 className="text-xs font-bold text-slate-700 dark:text-white/80">{date}</h5>
                          <div className="h-px flex-grow bg-slate-200/60 dark:bg-white/[0.04]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {items.map(job => (
                            <ProductionCard key={job.id} job={job} onDownload={handleDownload} onDelete={handleDeleteJob}
                              onFullscreen={url => setFullscreenVideo({url, hasSound: false, id: job.id})} onEdit={openEditor} />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {/* ─── MODALS ─── */}
      <AnimatePresence>
        {fullscreenVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 md:p-12">
            <button onClick={() => setFullscreenVideo(null)} className="absolute top-6 right-6 p-2.5 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all z-50 backdrop-blur-md">
              <X size={20} />
            </button>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <video src={fullscreenVideo.url} autoPlay controls className="w-full h-full object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TemplateModal isOpen={api.isTemplateModalOpen} onClose={() => api.setIsTemplateModalOpen(false)} onApply={api.applyTemplate} />
      <TutorialModal isOpen={api.showTutorial} onClose={api.closeTutorial} />
      <ImageLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} onConfirm={handleLibrarySelect}
        onEdit={url => { openEditor(url); setIsLibraryOpen(false); }} maxSelect={1} />
      <ProductImageWorkspace isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} initialImage={editorImage}
        onApply={newUrl => { if (activeSlotIdx !== null && activeSlotIdx >= 0) api.updateSlot(activeSlotIdx, { url: newUrl }); setIsEditorOpen(false); }} />
      <ResourceAuthModal isOpen={showResourceModal} onClose={() => setShowResourceModal(false)}
        onConfirm={pref => { api.setUsagePreference(pref); localStorage.setItem('skyverses_usage_preference', pref); setShowResourceModal(false);
          if (isResumingGenerate) { setIsResumingGenerate(false); api.handleSynthesize(); } }}
        hasPersonalKey={hasPersonalKey} totalCost={api.currentUnitCost} />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => api.handleLocalUpload(e, activeSlotIdx)} />
    </div>
  );
};

export default CharacterSyncWorkspace;