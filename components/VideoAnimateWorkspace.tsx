import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Play, Zap, Download, Loader2, Sparkles,
  User, Volume2, VolumeX, Check, ChevronDown, MonitorPlay,
  Image as ImageIcon, Maximize2, AlertCircle, Trash2, Info,
  Film, ChevronLeft, Move, Globe, Server, Clipboard,
  Search as SearchIcon, CheckCircle2, FolderOpen, Monitor,
  Link as LinkIcon, LayoutGrid, Share2, PenLine,
  Settings2, ChevronUp, Brain, SlidersHorizontal, Ratio,
  Hash, Menu, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVideoAnimate, RATIOS, QUALITY_MODES, RenderTask } from '../hooks/useVideoAnimate';
import ResourceAuthModal from './common/ResourceAuthModal';
import { AnimateIntelView } from './video-animate/AnimateIntelView';
import { AnimateTemplateModal } from './video-animate/AnimateTemplateModal';
import ImageLibraryModal from './ImageLibraryModal';
import { QuickImageGenModal } from './QuickImageGenModal';
import { API_BASE_URL } from '../apis/config';

/* ─── VIDEO RESULT CARD ─── */
const VideoResultCard: React.FC<{
  task: RenderTask;
  onDelete: (id: string) => void;
  onDownload: (url: string, id: string) => void;
}> = ({ task, onDelete, onDownload }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-indigo-500/20 transition-all"
    >
      <div className="aspect-video bg-black relative overflow-hidden cursor-pointer" onClick={togglePlay}>
        {task.status === 'processing' ? (
          <div className="flex flex-col items-center gap-3 h-full justify-center">
            <Loader2 size={32} className="text-indigo-400 animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 animate-pulse">Rendering...</p>
          </div>
        ) : task.url ? (
          <>
            <video ref={videoRef} src={task.url} autoPlay loop muted={isMuted} playsInline className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 z-20">
              <span className={`px-2.5 py-1 rounded-md text-[8px] font-bold uppercase text-white ${task.type === 'MOTION' ? 'bg-indigo-500' : 'bg-violet-600'}`}>
                {task.type}
              </span>
            </div>
            <div className={`absolute inset-0 bg-black/30 transition-opacity flex items-center justify-center ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
              <Play size={36} fill="white" className="text-white ml-1" />
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={e => { e.stopPropagation(); if (videoRef.current) { videoRef.current.muted = !videoRef.current.muted; setIsMuted(!isMuted); } }}
                className="p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white/80 hover:bg-indigo-500 transition-colors">
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <button onClick={e => { e.stopPropagation(); videoRef.current?.requestFullscreen?.(); }}
                className="p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white/80 hover:bg-indigo-500 transition-colors">
                <Maximize2 size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-red-400 gap-2 h-full">
            <AlertCircle size={24} />
            <p className="text-[10px] font-bold uppercase">Lỗi tạo video</p>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-20">
          {task.url && (
            <button onClick={e => { e.stopPropagation(); onDownload(task.url!, task.id); }}
              className="p-2 bg-white dark:bg-black/60 text-slate-700 dark:text-white rounded-lg shadow-lg hover:bg-indigo-500 hover:text-white transition-all">
              <Download size={14} />
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); onDelete(task.id); }}
            className="p-2 bg-white dark:bg-black/60 text-red-400 rounded-lg shadow-lg hover:bg-red-500 hover:text-white transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-1">
        <h4 className="text-xs font-bold text-slate-700 dark:text-white/80 truncate">{task.model}</h4>
        <p className="text-[9px] text-slate-400 dark:text-slate-500">{task.timestamp}</p>
      </div>
    </motion.div>
  );
};

/* ─── LINK EXTRACTOR MODAL ─── */
const LinkExtractorModal: React.FC<{
  isOpen: boolean; onClose: () => void; onExtract: (url: string) => void;
}> = ({ isOpen, onClose, onExtract }) => {
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setIsExtracting(true);
    await new Promise(r => setTimeout(r, 1500));
    onExtract(url);
    setIsExtracting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <LinkIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Trích xuất từ liên kết</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">TikTok, Facebook, Instagram, YouTube...</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={url} onChange={e => setUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl py-3.5 pl-11 pr-20 text-sm font-medium outline-none focus:border-indigo-500/40 transition-all text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  placeholder="Dán link bài viết hoặc video..." />
                <button onClick={async () => { try { setUrl(await navigator.clipboard.readText()); } catch {} }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-bold uppercase text-slate-500 hover:text-indigo-500 transition-all flex items-center gap-1.5">
                  <Clipboard size={12} /> Dán
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-white/[0.04]">
              <button onClick={handleSubmit} disabled={!url.trim() || isExtracting}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                {isExtracting ? <><Loader2 className="animate-spin" size={16} /> Đang phân tích...</> : <><LinkIcon size={16} /> Trích xuất</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ─── PILL ─── */
const Pill = ({ label, active, onClick, disabled }: { label: string; active: boolean; onClick: () => void; disabled?: boolean }) => (
  <button onClick={onClick} disabled={disabled}
    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border ${active
      ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/25'
      : 'bg-transparent border-black/[0.06] dark:border-white/[0.04] text-slate-600 dark:text-[#888] hover:text-slate-800 dark:hover:text-white/70'
      }`}
  >{label}</button>
);

/* ─── UPLOAD SLOT ─── */
const UploadSlot: React.FC<{
  label: string; icon: React.ReactNode; accentColor: string;
  media: string | null; isVideo?: boolean;
  onClear: () => void;
  onUpload: () => void; onLibrary: () => void; onLink: () => void;
  onQuickGen?: () => void;
}> = ({ label, icon, accentColor, media, isVideo, onClear, onUpload, onLibrary, onLink, onQuickGen }) => (
  <div className="space-y-1.5">
    <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
      {icon} {label}
    </p>
    <div className={`relative aspect-[3/4] rounded-xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center cursor-pointer group
      ${media ? `border-${accentColor}-500/40` : 'border-slate-200 dark:border-white/[0.06] hover:border-indigo-500/30 bg-slate-50 dark:bg-white/[0.02]'}`}>
      {media ? (
        <>
          {isVideo
            ? <video src={media} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            : <img src={media} className="w-full h-full object-cover" alt="" />
          }
          <button onClick={e => { e.stopPropagation(); onClear(); }}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:scale-110 transition-transform z-50">
            <X size={10} strokeWidth={3} />
          </button>
        </>
      ) : (
        <div className="text-center space-y-2 p-3">
          <div className={`w-10 h-10 rounded-xl bg-${accentColor}-500/10 flex items-center justify-center text-${accentColor}-500 mx-auto group-hover:scale-110 transition-transform`}>
            {isVideo ? <MonitorPlay size={22} /> : <User size={22} />}
          </div>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">Chọn {isVideo ? 'video' : 'ảnh'}</p>
        </div>
      )}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-3 z-40">
        <button onClick={e => { e.stopPropagation(); onUpload(); }}
          className="w-full py-2 bg-white text-black text-[9px] font-bold rounded-lg hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-1.5">
          <Monitor size={10} /> Tải lên
        </button>
        <button onClick={e => { e.stopPropagation(); onLibrary(); }}
          className="w-full py-2 bg-white text-black text-[9px] font-bold rounded-lg hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-1.5">
          <FolderOpen size={10} /> Thư viện
        </button>
        {onQuickGen && (
          <button onClick={e => { e.stopPropagation(); onQuickGen(); }}
            className="w-full py-2 bg-white text-black text-[9px] font-bold rounded-lg hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-1.5">
            <Sparkles size={10} /> Tạo ảnh AI
          </button>
        )}
        <button onClick={e => { e.stopPropagation(); onLink(); }}
          className="w-full py-2 bg-white text-black text-[9px] font-bold rounded-lg hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-1.5">
          <LinkIcon size={10} /> Từ URL
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   MAIN WORKSPACE
   ═══════════════════════════════════════════════════ */
const VideoAnimateWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits } = useAuth();
  const v = useVideoAnimate();

  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showQuickGen, setShowQuickGen] = useState(false);
  const [showLinkExtractor, setShowLinkExtractor] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'IMG' | 'VID'>('IMG');
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [configExpanded, setConfigExpanded] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  // Check product lock
  useEffect(() => {
    fetch(`${API_BASE_URL}/config`)
      .then(r => r.json())
      .then(data => {
        if (data?.success && data.data?.productLocks?.['video-animate-ai']) {
          setIsLocked(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const autoPrompt = localStorage.getItem('skyverses_global_auto_prompt');
    const autoRun = localStorage.getItem('skyverses_global_auto_run');
    const autoModality = localStorage.getItem('skyverses_global_auto_modality');
    if (autoRun === 'true' && autoModality === 'animate' && autoPrompt && v.selectedModel) {
      v.setPrompt(autoPrompt);
      localStorage.removeItem('skyverses_global_auto_run');
      localStorage.removeItem('skyverses_global_auto_prompt');
      localStorage.removeItem('skyverses_global_auto_modality');
    }
  }, [v.selectedModel]);

  const hasJobs = v.tasks.length > 0;

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl; link.download = filename;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); window.URL.revokeObjectURL(blobUrl);
    } catch { window.open(url, '_blank'); }
  };

  const handleDownloadAll = () => {
    v.tasks.filter(t => t.status === 'completed' && t.url)
      .forEach((t, i) => setTimeout(() => handleDownload(t.url!, `video_${t.id}.mp4`), i * 800));
  };

  const handleExtractFromLink = (extractedUrl: string) => {
    if (extractedUrl.includes('http')) {
      if (uploadTarget === 'IMG') v.setSourceImg(extractedUrl);
      else v.setRefVideo(extractedUrl);
    }
    setShowLinkExtractor(false);
  };

  const handleApplyTemplate = (tmpl: any) => {
    v.setMode(tmpl.type as any);
    if (tmpl.type === 'MOTION') { v.setSourceImg(tmpl.input); v.setRefVideo(tmpl.ref); }
    else { v.setSourceImg(tmpl.ref); v.setRefVideo(tmpl.input); }
    setShowTemplateModal(false);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">

      {/* ─── HEADER ─── */}
      <header className="h-14 border-b border-slate-200/80 dark:border-white/[0.04] flex items-center justify-between px-4 lg:px-6 shrink-0 z-50 bg-white/90 dark:bg-[#0c0c10]/90 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white">
              <Film size={14} />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-white">Animate Studio</span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-100 dark:bg-white/[0.03] p-1 rounded-xl border border-slate-200/80 dark:border-white/[0.04]">
          <button onClick={() => v.setMode('MOTION')}
            className={`px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 transition-all ${v.mode === 'MOTION'
              ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
            <Move size={12} /> Motion
          </button>
          <button onClick={() => v.setMode('SWAP')}
            className={`px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 transition-all ${v.mode === 'SWAP'
              ? 'bg-violet-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
            <User size={12} /> Swap
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-white/[0.03] px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-white/[0.04]">
            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">Auto tải</span>
            <button onClick={() => setAutoDownload(!autoDownload)}
              className={`w-7 h-3.5 rounded-full relative transition-colors ${autoDownload ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <motion.div animate={{ left: autoDownload ? 15 : 2 }} className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
            </button>
          </div>
          <button onClick={handleDownloadAll}
            className="hidden lg:flex px-4 py-1.5 bg-indigo-500 text-white rounded-lg text-[10px] font-bold items-center gap-1.5 hover:brightness-110 transition-all shadow-md">
            <Download size={13} /> Tải tất cả
          </button>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden relative">

        {/* ─── MOBILE FAB ─── */}
        <button onClick={() => setIsMobileExpanded(true)}
          className="lg:hidden fixed bottom-6 left-4 z-[130] w-12 h-12 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform">
          <Menu size={20} />
        </button>

        {/* ─── LEFT SIDEBAR ─── */}
        <aside className={`
          ${isMobileExpanded ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-[150]
          w-[320px] lg:w-[340px] xl:w-[360px] shrink-0
          bg-white dark:bg-[#0c0c10] border-r border-slate-200/80 dark:border-white/[0.04]
          flex flex-col transition-transform duration-300
        `}>
          {/* Close mobile */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.04]">
            <span className="text-xs font-bold text-slate-700 dark:text-white">Cấu hình</span>
            <button onClick={() => setIsMobileExpanded(false)} className="p-1 text-slate-400 hover:text-slate-700">✕</button>
          </div>

          <div className="flex-grow overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
            {/* PROMPT */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
                <PenLine size={11} className="text-indigo-400" /> Kịch bản
              </p>
              <textarea value={v.prompt} onChange={e => v.setPrompt(e.target.value)}
                className="w-full min-h-[80px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-lg p-3 text-xs font-medium focus:border-indigo-500/30 outline-none transition-all resize-y text-slate-800 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-[#333] leading-relaxed"
                placeholder="Mô tả bối cảnh, cảm xúc, hành động..." />
            </div>

            {/* MEDIA INPUTS */}
            <div className="grid grid-cols-2 gap-3">
              {v.mode === 'SWAP' ? (
                <>
                  <UploadSlot label="Original Video" icon={<Film size={11} className="text-violet-400" />} accentColor="violet"
                    media={v.refVideo} isVideo onClear={() => v.setRefVideo(null)}
                    onUpload={() => { setUploadTarget('VID'); vidInputRef.current?.click(); }}
                    onLibrary={() => { setUploadTarget('VID'); setIsLibraryOpen(true); }}
                    onLink={() => { setUploadTarget('VID'); setShowLinkExtractor(true); }} />
                  <UploadSlot label="Identity" icon={<User size={11} className="text-indigo-400" />} accentColor="indigo"
                    media={v.sourceImg} onClear={() => v.setSourceImg(null)}
                    onUpload={() => { setUploadTarget('IMG'); imgInputRef.current?.click(); }}
                    onLibrary={() => { setUploadTarget('IMG'); setIsLibraryOpen(true); }}
                    onLink={() => { setUploadTarget('IMG'); setShowLinkExtractor(true); }}
                    onQuickGen={() => setShowQuickGen(true)} />
                </>
              ) : (
                <>
                  <UploadSlot label="Chọn ảnh" icon={<ImageIcon size={11} className="text-indigo-400" />} accentColor="indigo"
                    media={v.sourceImg} onClear={() => v.setSourceImg(null)}
                    onUpload={() => { setUploadTarget('IMG'); imgInputRef.current?.click(); }}
                    onLibrary={() => { setUploadTarget('IMG'); setIsLibraryOpen(true); }}
                    onLink={() => { setUploadTarget('IMG'); setShowLinkExtractor(true); }}
                    onQuickGen={() => setShowQuickGen(true)} />
                  <UploadSlot label="Motion" icon={<Film size={11} className="text-violet-400" />} accentColor="violet"
                    media={v.refVideo} isVideo onClear={() => v.setRefVideo(null)}
                    onUpload={() => { setUploadTarget('VID'); vidInputRef.current?.click(); }}
                    onLibrary={() => { setUploadTarget('VID'); setIsLibraryOpen(true); }}
                    onLink={() => { setUploadTarget('VID'); setShowLinkExtractor(true); }} />
                </>
              )}
            </div>

            <p className="text-[8px] text-slate-400 dark:text-slate-500 px-0.5 leading-relaxed">
              Ảnh nhân vật & video mẫu độ phân giải cao (720×1280+) cho kết quả tốt nhất.
            </p>

            <input type="file" ref={imgInputRef} className="hidden" accept="image/*" onChange={e => v.handleFileUpload(e, 'IMG')} />
            <input type="file" ref={vidInputRef} className="hidden" accept="video/*" onChange={e => v.handleFileUpload(e, 'VID')} />

            {/* ─── CONFIG SECTION (Collapsible) ─── */}
            <div className="border-t border-slate-100 dark:border-white/[0.04] pt-3">
              <button onClick={() => setConfigExpanded(!configExpanded)} className="w-full flex items-center justify-between group py-1">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Settings2 size={12} className="text-indigo-400" /> Cấu hình AI
                </span>
                {configExpanded
                  ? <ChevronUp size={12} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  : <ChevronDown size={12} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />}
              </button>

              {configExpanded && (
                <div className="space-y-3 pt-2">
                  {/* Infrastructure */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                      <Globe size={10} className="text-cyan-500" /> Infrastructure
                    </p>
                    <div className="relative">
                      <select value={v.selectedEngine} onChange={e => v.setSelectedEngine(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] px-2.5 py-2 rounded-lg text-xs font-medium outline-none appearance-none focus:border-indigo-500/40 transition-all cursor-pointer text-slate-700 dark:text-white/80">
                        <option value="wan">Wan Direct</option>
                        <option value="fxlab">FxLab Node</option>
                        <option value="gommo">Gommo Cluster</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#555] pointer-events-none" size={11} />
                    </div>
                  </div>

                  {/* Model */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
                      <Brain size={11} className="text-cyan-500" /> Neural Model
                    </p>
                    <div className="relative">
                      <button onClick={() => setShowModelMenu(!showModelMenu)}
                        className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] px-2.5 py-2 rounded-lg flex items-center justify-between hover:border-indigo-500/30 transition-all">
                        <span className="text-xs font-semibold text-slate-700 dark:text-white/80 truncate pr-2">
                          {v.selectedModel?.name || 'Loading...'}
                        </span>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {showModelMenu && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                            className="absolute bottom-full mb-1 w-full bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.06] rounded-xl shadow-xl p-1.5 z-[110] max-h-48 overflow-y-auto no-scrollbar">
                            {v.availableModels.map(m => (
                              <button key={m._id} onClick={() => { v.setSelectedModel(m); setShowModelMenu(false); }}
                                className={`w-full p-2.5 flex flex-col items-start rounded-lg transition-all text-left ${v.selectedModel?._id === m._id
                                  ? 'bg-indigo-500/10 text-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-white/[0.03] text-slate-600 dark:text-slate-400'}`}>
                                <p className="text-[10px] font-bold">{m.name}</p>
                                {m.description && <p className="text-[8px] opacity-60 mt-0.5 line-clamp-1">{m.description}</p>}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Quality + Ratio pills */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                        <SlidersHorizontal size={10} className="text-amber-400" /> Chất lượng
                      </p>
                      <div className="flex gap-0.5">
                        {QUALITY_MODES.map(q => <Pill key={q} label={q} active={v.selectedQuality === q} onClick={() => v.setSelectedQuality(q)} />)}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                        <Ratio size={10} className="text-emerald-400" /> Tỷ lệ
                      </p>
                      <div className="flex gap-0.5">
                        {RATIOS.map(r => <Pill key={r} label={r} active={v.selectedRatio === r} onClick={() => v.setSelectedRatio(r)} />)}
                      </div>
                    </div>
                  </div>

                  {/* Model info */}
                  {v.selectedModel && (
                    <p className="text-[9px] text-slate-400 dark:text-[#444] truncate px-0.5">
                      → {v.selectedModel.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─── FOOTER: Cost + Generate ─── */}
          <div className="shrink-0 border-t border-slate-200/80 dark:border-white/[0.04] bg-white/80 dark:bg-[#0c0c10]/80 backdrop-blur-lg px-4 py-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setShowQualityModal(true)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-400 transition-colors rounded-md hover:bg-black/5 dark:hover:bg-white/5">
                  <Info size={12} />
                </button>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{credits.toLocaleString()} CR</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500/80">
                <Zap size={10} fill="currentColor" />
                <span className="text-[11px] font-semibold">{v.estimatedCost}</span>
              </div>
            </div>
            <button onClick={isLocked ? undefined : v.handleSynthesize}
              disabled={isLocked || v.isGenerating || !v.sourceImg || !v.selectedModel}
              className={`w-full py-3.5 rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2.5
                ${isLocked
                  ? 'bg-slate-200 dark:bg-white/[0.04] text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : v.sourceImg && v.selectedModel
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:brightness-110 active:scale-[0.98] shadow-indigo-500/20'
                    : 'bg-slate-200 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}>
              {isLocked ? <><Lock size={14} /> Sắp ra mắt</> : <>{v.isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />} Khởi chạy Studio</>}
            </button>
          </div>
        </aside>

        {/* ─── VIEWPORT (Right) ─── */}
        <div className="flex-grow flex flex-col bg-slate-50 dark:bg-[#050508] overflow-hidden">
          <AnimatePresence mode="wait">
            {hasJobs ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-grow overflow-y-auto no-scrollbar p-6 lg:p-8">
                <div className="max-w-[1400px] mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><LayoutGrid size={18} /></div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Kết quả</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowTemplateModal(true)}
                        className="px-4 py-1.5 bg-violet-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-md">
                        <Sparkles size={12} /> Template
                      </button>
                      <button onClick={() => v.setTasks([])}
                        className="px-4 py-1.5 border border-slate-200 dark:border-white/[0.04] rounded-lg text-[10px] font-bold text-slate-400 hover:text-red-500 transition-all">
                        Dọn dẹp
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {v.tasks.map(task => (
                      <VideoResultCard key={task.id} task={task}
                        onDelete={id => v.setTasks(prev => prev.filter(t => t.id !== id))}
                        onDownload={(url, id) => handleDownload(url, `render_${id}.mp4`)} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <AnimateIntelView mode={v.mode} onShowTemplates={() => setShowTemplateModal(true)} onDownload={handleDownload} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── MODALS ─── */}
      <AnimatePresence>
        {showQuickGen && <QuickImageGenModal isOpen={showQuickGen} onClose={() => setShowQuickGen(false)} onSuccess={() => setShowQuickGen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showLinkExtractor && <LinkExtractorModal isOpen={showLinkExtractor} onClose={() => setShowLinkExtractor(false)} onExtract={handleExtractFromLink} />}
      </AnimatePresence>
      <AnimatePresence>
        {isLibraryOpen && (
          <ImageLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)}
            onConfirm={assets => { if (assets.length > 0) { if (uploadTarget === 'IMG') v.setSourceImg(assets[0].url); else v.setRefVideo(assets[0].url); } setIsLibraryOpen(false); }}
            maxSelect={1} />
        )}
      </AnimatePresence>

      {/* Quality Guide Modal */}
      <AnimatePresence>
        {showQualityModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.06] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Info size={18} /></div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Hướng dẫn chất lượng</h3>
                </div>
                <button onClick={() => setShowQualityModal(false)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  'Video có nhân vật không bị che khuất sẽ cho kết quả tốt nhất.',
                  'Ảnh nhân vật và video đầu vào có độ phân giải càng cao (720×1280) thì video đầu ra càng sắc nét.',
                  'Sử dụng model "Làm ảnh siêu thực" cho ảnh trước khi tạo video sẽ đạt độ chân thực tối đa.',
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                      <CheckCircle2 size={14} />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-white/[0.04] text-center">
                <button onClick={() => setShowQualityModal(false)}
                  className="px-10 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg hover:brightness-110 transition-all">
                  Đã hiểu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResourceAuthModal isOpen={showResourceModal} onClose={() => setShowResourceModal(false)}
        onConfirm={pref => { v.setUsagePreference(pref as any); localStorage.setItem('skyverses_usage_preference', pref); setShowResourceModal(false); }}
        hasPersonalKey={v.usagePreference === 'key' || !!localStorage.getItem('skyverses_model_vault')}
        totalCost={v.estimatedCost} />

      <AnimateTemplateModal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)}
        onApply={handleApplyTemplate} initialMode={v.mode} />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default VideoAnimateWorkspace;