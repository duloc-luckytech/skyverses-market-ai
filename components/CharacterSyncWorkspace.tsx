import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Loader2, Download, Activity, Coins, Film,
  Calendar, AlertCircle, Search,
  ChevronLeft, Fingerprint, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { videosApi } from '../apis/videos';
import ImageLibraryModal from './ImageLibraryModal';
import ResourceAuthModal from './common/ResourceAuthModal';
import ProductImageWorkspace from './ProductImageWorkspace';
import { GCSAssetMetadata } from '../services/storage';

import { useCharacterSync, ProductionJob, MAX_CHARACTERS } from '../hooks/useCharacterSync';
import { RegistrySection } from './character-sync/RegistrySection';
import { NarrativeBeats } from './character-sync/NarrativeBeats';
import { ConfigurationSection } from './character-sync/ConfigurationSection';
import { TutorialModal } from './character-sync/TutorialModal';
import { TemplateModal } from './character-sync/TemplateModal';
import { GuideSlider } from './character-sync/GuideSlider';
import { MobileGeneratorBar } from './common/MobileGeneratorBar';
import { VideoCard, VideoResult } from './video-generator/VideoCard';
import { JobLogsModal } from './common/JobLogsModal';


/* ═══════════════════════════════════════════════════
   MAIN WORKSPACE
   ═══════════════════════════════════════════════════ */
const CharacterSyncWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits, login, isAuthenticated } = useAuth();
  const api = useCharacterSync();

  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [pendingAsset, setPendingAsset] = useState<{url: string, mediaId: string | null} | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isResumingGenerate, setIsResumingGenerate] = useState(false);
  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const [fullscreenVideo, setFullscreenVideo] = useState<{url: string, hasSound: boolean, id: string} | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [selectedLogTask, setSelectedLogTask] = useState<VideoResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevHistoryLength = useRef(api.history.length);
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  // ─── SERVER-SIDE HISTORY STATE ───
  const [serverHistory, setServerHistory] = useState<VideoResult[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const historyObserver = useRef<IntersectionObserver | null>(null);

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

  // ─── FETCH SERVER HISTORY ───
  const fetchHistory = async (pageNum: number, isInitial = false) => {
    if (pageNum === 1) setLoadingHistory(true);
    try {
      const res = await videosApi.getJobs({
        page: pageNum,
        limit: 15,
        status: 'done',
        type: 'ingredient',
        q: historySearch || undefined,
      });
      if (res.success && res.data) {
        const mapped: VideoResult[] = res.data.map(item => {
          const d = new Date(item.createdAt);
          return {
            id: item.jobId,
            url: item.videoUrl || null,
            prompt: item.prompt || 'Untitled',
            fullTimestamp: d.toLocaleString('vi-VN'),
            dateKey: d.toISOString().split('T')[0],
            displayDate: d.toLocaleDateString('vi-VN'),
            model: item.model || 'Unknown',
            mode: 'standard',
            duration: '8s',
            status: item.status === 'done' ? 'done' as const : 'error' as const,
            hasSound: false,
            aspectRatio: '16:9' as const,
            cost: 0,
          };
        });
        if (isInitial) setServerHistory(mapped);
        else setServerHistory(prev => [...prev, ...mapped]);
        setHasMoreHistory(res.meta.page < res.meta.totalPages);
      }
    } catch (err) {
      console.error('[CharSync] History fetch error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (api.activeResultTab === 'HISTORY') {
      setHistoryPage(1);
      fetchHistory(1, true);
    }
  }, [api.activeResultTab, historySearch]);

  const lastHistoryRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingHistory) return;
    if (historyObserver.current) historyObserver.current.disconnect();
    historyObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreHistory) {
        setHistoryPage(prev => {
          const n = prev + 1;
          fetchHistory(n);
          return n;
        });
      }
    });
    if (node) historyObserver.current.observe(node);
  }, [loadingHistory, hasMoreHistory]);

  const handleSynthesizeClick = async () => {
    if (!isAuthenticated) { login(); return; }
    if (window.innerWidth < 1024) setIsMobileExpanded(false);
    const status = await api.handleSynthesize();
    if (status === 'NEED_RESOURCE_MODAL') { setIsResumingGenerate(true); setShowResourceModal(true); }
    else if (status === 'LOW_CREDITS') { alert("Số dư không đủ."); }
  };

  const handleRetry = (res: VideoResult) => {
    // Remove failed job from local state
    handleDeleteJob(res.id);
    // Put the prompt back into the first sequence
    if (res.prompt && res.prompt.trim()) {
      api.setSequences(prev => {
        const updated = [...prev];
        if (updated.length > 0) updated[0] = { ...updated[0], text: res.prompt };
        return updated;
      });
    }
    // Re-trigger generation
    handleSynthesizeClick();
  };

  // Flow for adding a new character: library → name → add
  const handleAddCharacterClick = () => {
    if (api.slots.length >= MAX_CHARACTERS) return;
    setIsAddingCharacter(true);
    setActiveSlotIdx(null);
    setIsLibraryOpen(true);
  };

  const handleLibrarySelect = (assets: GCSAssetMetadata[]) => {
    if (assets.length === 0) { setIsLibraryOpen(false); return; }
    const asset = assets[0];

    if (isAddingCharacter) {
      // Adding new character → show naming modal
      setPendingAsset({ url: asset.url, mediaId: asset.mediaId || null });
      setCharacterName('');
      setIsLibraryOpen(false);
    } else if (activeSlotIdx !== null && activeSlotIdx >= 0) {
      // Replacing existing slot image
      api.updateSlot(activeSlotIdx, { url: asset.url, mediaId: asset.mediaId || null });
      setIsLibraryOpen(false);
    } else {
      setIsLibraryOpen(false);
    }
  };

  const handleConfirmAddCharacter = () => {
    if (!pendingAsset) return;
    const name = characterName.trim() || `NV ${api.slots.length + 1}`;
    api.addCharacterFromLibrary(pendingAsset.url, pendingAsset.mediaId, name);
    setPendingAsset(null);
    setCharacterName('');
    setIsAddingCharacter(false);
  };

  const handleCancelAddCharacter = () => {
    setPendingAsset(null);
    setCharacterName('');
    setIsAddingCharacter(false);
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



  const disabledReason = useMemo(() => {
    if (api.isGenerating) return null;
    if (!api.slots.some(s => s.url)) return "Thêm ít nhất một Nhân vật";
    if (!api.sequences.some(s => s.text.trim() !== '')) return "Nhập nội dung Kịch bản";
    if (api.usagePreference === 'credits' && credits < api.totalCostEstimate) return `Cần ${api.totalCostEstimate} CR`;
    return null;
  }, [api.isGenerating, api.slots, api.sequences, api.usagePreference, credits, api.totalCostEstimate]);

  /* ─── Map ProductionJob → VideoResult for VideoCard ─── */
  const mapJobToResult = (job: ProductionJob): VideoResult => ({
    id: job.id,
    url: job.url || null,
    prompt: job.prompt,
    fullTimestamp: job.timestamp,
    dateKey: job.dateKey,
    displayDate: job.dateKey === todayKey ? 'Hôm nay' : job.dateKey,
    model: job.modelName,
    mode: 'standard',
    duration: job.duration,
    resolution: job.resolution,
    status: job.status === 'COMPLETED' ? 'done' : job.status === 'FAILED' ? 'error' : 'processing',
    hasSound: false,
    aspectRatio: (job.ratio === '9:16' ? '9:16' : '16:9') as '16:9' | '9:16',
    cost: job.cost,
    isRefunded: job.isRefunded,
    errorMessage: job.error,
  });

  const sessionResults = useMemo(() => {
    const jobResults = api.jobs.map(mapJobToResult);
    const todayResults = api.history.filter(h => h.dateKey === todayKey).map(mapJobToResult);
    return [...jobResults, ...todayResults];
  }, [api.jobs, api.history, todayKey]);

  const processingCount = useMemo(() => sessionResults.filter(r => r.status === 'processing').length, [sessionResults]);
  const doneCount = useMemo(() => sessionResults.filter(r => r.status === 'done').length, [sessionResults]);
  const errorCount = useMemo(() => sessionResults.filter(r => r.status === 'error').length, [sessionResults]);

  const historyResults = useMemo(() => api.history.map(mapJobToResult), [api.history]);

  // Server-side history grouped by date
  const groupedServerHistory = useMemo(() => {
    const groups: Record<string, VideoResult[]> = {};
    serverHistory.forEach(res => {
      const key = res.dateKey === todayKey ? 'Hôm nay' : res.displayDate || res.dateKey;
      if (!groups[key]) groups[key] = [];
      groups[key].push(res);
    });
    return groups;
  }, [serverHistory, todayKey]);
  const sortedServerKeys = useMemo(() => Object.keys(groupedServerHistory).sort((a, b) => b.localeCompare(a)), [groupedServerHistory]);

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
              if (api.slots.length === 0) {
                handleAddCharacterClick();
              } else {
                const firstEmptyIdx = api.slots.findIndex(s => !s.url);
                setActiveSlotIdx(firstEmptyIdx >= 0 ? firstEmptyIdx : 0);
                setIsLibraryOpen(true);
              }
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
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white">
                <Fingerprint size={12} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-white">Character Sync</span>
            </div>
          </header>

          {/* Sidebar Body */}
          <div className={`flex-grow overflow-y-auto no-scrollbar ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <RegistrySection
              slots={api.slots}
              updateSlot={api.updateSlot}
              removeCharacter={api.removeCharacter}
              onAddCharacter={handleAddCharacterClick}
              onOpenLibrary={(idx) => { setIsAddingCharacter(false); setActiveSlotIdx(idx); setIsLibraryOpen(true); }}
              onTriggerUpload={(idx) => { setActiveSlotIdx(idx); fileInputRef.current?.click(); }}
              uploadingIdx={api.uploadingIdx}
              onOpenTutorial={() => api.setShowTutorial(true)}
              onReorderSlots={api.setSlots}
            />
            <NarrativeBeats
              sequences={api.sequences}
              setSequences={api.setSequences}
              addSequence={api.addSequence}
              removeSequence={api.removeSequence}
              activeCharacterNames={api.activeCharacterNames}
            />
            <ConfigurationSection
              availableModels={api.availableModels}
              selectedModel={api.selectedModel}
              setSelectedModel={api.setSelectedModel}
              selectedEngine={api.selectedEngine}
              setSelectedEngine={api.setSelectedEngine}
              resolution={api.resolution}
              setResolution={api.setResolution}
              availableResolutions={api.availableResolutions}
              aspectRatio={api.aspectRatio}
              setAspectRatio={api.setAspectRatio}
              duration={api.duration}
              setDuration={api.setDuration}
              availableDurations={api.availableDurations}
              isGenerating={api.isGenerating}
            />
          </div>

          {/* Footer */}
          <div className={`shrink-0 border-t border-slate-200/80 dark:border-white/[0.04] bg-white/80 dark:bg-[#0c0c10]/80 backdrop-blur-lg px-4 py-3 space-y-2.5 ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins size={9} className="text-purple-500" />
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{credits.toLocaleString()} CR</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500/80">
                <Zap size={9} fill="currentColor" />
                <span className="text-[10px] font-semibold">{api.currentUnitCost}</span>
              </div>
            </div>

            <div className="relative group/genbtn">
              <button onClick={handleSynthesizeClick}
                disabled={!!disabledReason || api.isGenerating}
                className={`w-full py-3 rounded-xl text-white font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2
                  ${!disabledReason && !api.isGenerating
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:brightness-110 active:scale-[0.98] shadow-purple-500/20'
                    : 'bg-slate-200 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}>
                {api.isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                TẠO
              </button>
              {disabledReason && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/genbtn:opacity-100 pointer-events-none transition-all z-[160]">
                  <div className="bg-slate-800 text-white text-[8px] font-semibold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap border border-white/10">
                    {disabledReason}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── RIGHT VIEWPORT ─── */}
        <aside className="flex-grow h-full flex flex-col bg-slate-50 dark:bg-[#050508] transition-colors relative">
          {/* ─── TOOLBAR ─── */}
          <div className="h-12 border-b border-black/[0.06] dark:border-white/[0.04] bg-white/95 dark:bg-[#111114]/95 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-40">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="lg:hidden p-1.5 -ml-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><ChevronLeft size={18} /></button>
              <div className="flex bg-black/[0.03] dark:bg-white/[0.03] rounded-lg border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
                <button onClick={() => api.setActiveResultTab('CURRENT')} className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${api.activeResultTab === 'CURRENT' ? 'bg-black/[0.05] dark:bg-white/[0.06] text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  <span className="flex items-center gap-1.5"><Film size={12} /> Lab</span>
                </button>
                <button onClick={() => api.setActiveResultTab('HISTORY')} className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${api.activeResultTab === 'HISTORY' ? 'bg-black/[0.05] dark:bg-white/[0.06] text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> History</span>
                </button>
              </div>

              {/* Status chips */}
              {api.activeResultTab === 'CURRENT' && sessionResults.length > 0 && (
                <div className="hidden md:flex items-center gap-2 ml-2">
                  {processingCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                      <Loader2 size={10} className="animate-spin" /> {processingCount}
                    </span>
                  )}
                  {doneCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <Activity size={10} /> {doneCount}
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-semibold text-red-600 dark:text-red-400">
                      <AlertCircle size={10} /> {errorCount}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-black/[0.03] dark:bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-black/[0.06] dark:border-white/[0.04]">
                <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">Auto DL</span>
                <button onClick={() => setAutoDownload(!autoDownload)} className={`w-7 h-3.5 rounded-full relative transition-colors ${autoDownload ? 'bg-purple-500' : 'bg-slate-300 dark:bg-white/[0.1]'}`}>
                  <motion.div animate={{ left: autoDownload ? 14 : 2 }} className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                </button>
              </div>
              <button onClick={handleDownloadAll} title="Tải tất cả"
                className="p-2 bg-purple-500/10 text-purple-500 dark:text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all border border-purple-500/20">
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* ─── CONTENT ─── */}
          <div className="flex-grow overflow-y-auto no-scrollbar p-4 md:p-6 lg:p-8 pb-32 lg:pb-8 relative z-10">
            <AnimatePresence mode="wait">
              {api.activeResultTab === 'CURRENT' ? (
                <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  {sessionResults.length === 0 ? (
                    <GuideSlider onOpenTemplates={() => api.setIsTemplateModalOpen(true)} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {sessionResults.map(res => (
                        <VideoCard key={res.id} res={res} isSelected={false} onToggleSelect={() => {}}
                          onFullscreen={(url, hs, id) => setFullscreenVideo({ url, hasSound: hs, id })}
                          onDelete={handleDeleteJob}
                          onRetry={handleRetry}
                          onDownload={handleDownload}
                          onViewLogs={(r) => setSelectedLogTask(r)} />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
                  {/* Search bar */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
                    <div className="space-y-1">
                      <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white/90">Lịch sử <span className="text-purple-500 dark:text-purple-400">lưu trữ</span></h2>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Tất cả video Character Sync đã tạo thành công.</p>
                    </div>
                    <div className="relative group w-full md:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-purple-400 transition-colors" size={14} />
                      <input type="text" value={historySearch} onChange={e => setHistorySearch(e.target.value)}
                        placeholder="Tìm theo prompt..."
                        className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.04] rounded-lg pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-purple-500/30 text-slate-700 dark:text-white/70 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                    </div>
                  </div>

                  {loadingHistory && serverHistory.length === 0 ? (
                    <div className="py-32 flex flex-col items-center gap-3 opacity-40">
                      <Loader2 className="animate-spin text-purple-400" size={32} />
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Đang đồng bộ...</p>
                    </div>
                  ) : serverHistory.length > 0 ? (
                    <div className="space-y-8">
                      {sortedServerKeys.map(date => (
                        <div key={date} className="space-y-4">
                          <div className="flex items-center gap-3 px-1">
                            <Calendar size={14} className="text-purple-400" />
                            <h3 className="text-sm font-semibold text-slate-600 dark:text-white/70">{date}</h3>
                            <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 bg-black/[0.03] dark:bg-white/[0.03] px-2 py-0.5 rounded-full">{groupedServerHistory[date].length} video</span>
                            <div className="h-px flex-grow bg-black/[0.06] dark:bg-white/[0.04]" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {groupedServerHistory[date].map((res, idx) => {
                              const isLast = serverHistory.indexOf(res) === serverHistory.length - 1;
                              return (
                                <div key={res.id} ref={isLast ? lastHistoryRef : null}>
                                  <VideoCard res={res} isSelected={false} onToggleSelect={() => {}}
                                    onFullscreen={(url, hs, id) => setFullscreenVideo({ url, hasSound: hs, id })}
                                    onDelete={handleDeleteJob}
                                    onRetry={handleRetry}
                                    onDownload={handleDownload}
                                    onViewLogs={(r) => setSelectedLogTask(r)} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {loadingHistory && (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-purple-400" size={28} /></div>
                      )}
                    </div>
                  ) : (
                    <div className="py-32 text-center flex flex-col items-center gap-4">
                      <Film size={60} strokeWidth={1} className="text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Chưa có lịch sử</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Tạo video Character Sync đầu tiên để bắt đầu.</p>
                    </div>
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

      <AnimatePresence>
        {selectedLogTask && (
          <JobLogsModal
            isOpen={true}
            logs={selectedLogTask.logs || []}
            status={selectedLogTask.status}
            title="Character Sync Trace"
            subtitle="Node Process Trace"
            jobId={selectedLogTask.id}
            onClose={() => setSelectedLogTask(null)}
          />
        )}
      </AnimatePresence>
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

      {/* ─── NAMING MODAL ─── */}
      <AnimatePresence>
        {pendingAsset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Đặt tên nhân vật</h3>
                    <p className="text-[10px] text-slate-400">Nhân vật {api.slots.length + 1}/{MAX_CHARACTERS}</p>
                  </div>
                </div>
                <button onClick={handleCancelAddCharacter} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                  <X size={18} />
                </button>
              </div>

              {/* Preview + Name */}
              <div className="p-5 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-28 rounded-xl overflow-hidden border-2 border-purple-500/30 shrink-0">
                    <img src={pendingAsset.url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-grow space-y-2">
                    <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      Tên nhân vật
                    </label>
                    <input
                      autoFocus
                      value={characterName}
                      onChange={e => setCharacterName(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter' && characterName.trim()) handleConfirmAddCharacter(); }}
                      className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl py-3 px-4 text-sm font-bold uppercase outline-none focus:border-purple-500/40 transition-all text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      placeholder="VD: MINH, ANNA..."
                      maxLength={20}
                    />
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-relaxed">
                      Tên sẽ dùng trong kịch bản để AI nhận diện nhân vật.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-slate-100 dark:border-white/[0.04] flex gap-3">
                <button onClick={handleCancelAddCharacter}
                  className="flex-1 py-3 border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  Hủy
                </button>
                <button onClick={handleConfirmAddCharacter}
                  disabled={!characterName.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <User size={14} /> Thêm nhân vật
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharacterSyncWorkspace;