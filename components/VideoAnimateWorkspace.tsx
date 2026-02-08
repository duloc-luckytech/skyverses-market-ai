import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Mic, Play, Zap, 
  Download, Loader2, Sparkles, User, 
  Search, Plus, History as HistoryIcon, Volume2, 
  VolumeX, Check, ChevronDown, MonitorPlay,
  Image as ImageIcon,
  MoreVertical, ShieldCheck, Cpu,
  Mic2, Headphones, AlertTriangle,
  Share2, Wand2, Grid, LayoutGrid,
  Link as LinkIcon, FolderOpen, Monitor,
  Maximize2, AlertCircle, Trash2, Info,
  Film, ChevronLeft, Move, Globe, Server,
  Clipboard, Search as SearchIcon, CheckCircle2,
  // Add Terminal icon to fix "Cannot find name 'Terminal'" error
  Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { useVideoAnimate, RATIOS, QUALITY_MODES, RenderTask } from '../hooks/useVideoAnimate';
import ResourceAuthModal from './common/ResourceAuthModal';
import { ResourceControl } from './fashion-studio/ResourceControl';
import { AnimateIntelView } from './video-animate/AnimateIntelView';
import { AnimateTemplateModal } from './video-animate/AnimateTemplateModal';
import ImageLibraryModal from './ImageLibraryModal';
import { QuickImageGenModal } from './QuickImageGenModal';

interface VideoResultCardProps {
  task: RenderTask;
  onDelete: (id: string) => void;
  onDownload: (url: string, id: string) => void;
}

const VideoResultCard: React.FC<VideoResultCardProps> = ({ task, onDelete, onDownload }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:border-brand-blue/40"
    >
      <div className="aspect-video bg-black relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={togglePlay}>
        {task.status === 'processing' ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-cyan-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 animate-pulse">Rendering...</p>
          </div>
        ) : task.url ? (
          <>
            <video 
              ref={videoRef}
              src={task.url} 
              autoPlay 
              loop 
              muted={isMuted} 
              playsInline 
              className="w-full h-full object-cover" 
            />
            
            <div className="absolute top-4 left-4 z-20">
               <span className={`px-3 py-1 rounded-md text-[8px] font-black uppercase text-white shadow-lg ${task.type === 'MOTION' ? 'bg-cyan-500' : 'bg-purple-600'}`}>
                  {task.type}
               </span>
            </div>

            <div className={`absolute inset-0 bg-black/20 transition-opacity flex items-center justify-center ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
              <Play size={48} fill="white" className="text-white ml-2" />
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
               <button 
                onClick={toggleMute}
                className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-brand-blue transition-colors"
               >
                 {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
               </button>
               <button 
                onClick={handleFullScreen}
                className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-brand-blue transition-colors"
               >
                 <Maximize2 size={16} />
               </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-red-500 gap-3 p-6 text-center">
            <AlertCircle size={32} />
            <p className="text-[10px] font-black uppercase italic">Video tạo lỗi</p>
          </div>
        )}
        
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
          {task.url && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDownload(task.url!, task.id); }}
              className="p-2.5 bg-white text-black rounded-lg shadow-xl hover:scale-110 transition-transform"
            >
              <Download size={16} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-2.5 bg-white text-red-500 rounded-lg shadow-xl hover:scale-110 transition-transform"
          >
            <Trash2 size={16}/>
          </button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-800 dark:text-white truncate max-w-[200px]">"{task.model}"</h4>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <HistoryIcon size={12} /> {task.timestamp}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-brand-blue transition-colors"><Share2 size={14}/></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LinkExtractorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onExtract: (url: string) => void;
}> = ({ isOpen, onClose, onExtract }) => {
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setIsExtracting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onExtract(url);
    setIsExtracting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-white dark:bg-[#121214] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col transition-colors duration-500"
          >
            <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-black/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue shadow-inner">
                  <LinkIcon size={20} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-lg font-black uppercase tracking-tight italic text-slate-900 dark:text-white leading-none">Trích xuất từ liên kết</h3>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Uplink: SNS, URL, Social Assets</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white/5 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                    <Globe size={18} />
                  </div>
                  <input 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl py-5 pl-14 pr-24 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 shadow-inner"
                    placeholder="Dán link bài viết hoặc video..."
                  />
                  <button 
                    onClick={handlePaste}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-all flex items-center gap-2"
                  >
                    <Clipboard size={14} /> DÁN
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-gray-600 font-bold uppercase italic px-1">
                  * Hỗ trợ: TikTok, Facebook, Instagram, YouTube, Threads, v.v.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-white/5 rounded-[2rem] space-y-6">
                 <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-300 dark:text-gray-800 shadow-sm">
                    <SearchIcon size={32} />
                 </div>
                 <div className="text-center space-y-2">
                    <h4 className="text-lg font-black uppercase italic tracking-tight text-slate-800 dark:text-white">Sẵn sàng phân tích</h4>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
                       Hệ thống sẽ tự động quét và lấy ra hình ảnh gốc chất lượng cao nhất từ liên kết.
                    </p>
                 </div>
              </div>
            </div>

            <div className="p-8 border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-black/20 shrink-0">
               <button 
                 onClick={handleSubmit}
                 disabled={!url.trim() || isExtracting}
                 className="w-full py-5 bg-brand-blue text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-brand-blue/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-30 relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isExtracting ? (
                    <div className="flex items-center gap-3">
                       <Loader2 className="animate-spin" size={18} /> 
                       <span>Đang phân tích định danh</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                       <LinkIcon size={18} /> 
                       <span>Xác thực & Trích xuất</span>
                    </div>
                  )}
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const VideoAnimateWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits, isAuthenticated, login } = useAuth();
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
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  // AUTO-RUN LOGIC FROM GLOBAL BAR
  useEffect(() => {
    const autoPrompt = localStorage.getItem('skyverses_global_auto_prompt');
    const autoRun = localStorage.getItem('skyverses_global_auto_run');
    const autoModality = localStorage.getItem('skyverses_global_auto_modality');

    if (autoRun === 'true' && autoModality === 'animate' && autoPrompt && v.selectedModel) {
      v.setPrompt(autoPrompt);
      localStorage.removeItem('skyverses_global_auto_run');
      localStorage.removeItem('skyverses_global_auto_prompt');
      localStorage.removeItem('skyverses_global_auto_modality');
      
      // Note: This workspace requires images. If auto-run is triggered without a source image,
      // it just fills the prompt but won't synthesize.
      // In a more advanced version, we could use the prompt to auto-generate a source image.
    }
  }, [v.selectedModel]);

  const hasJobs = v.tasks.length > 0;

  const activeGradient = v.mode === 'MOTION' 
    ? 'from-cyan-500 to-blue-600 shadow-cyan-500/20' 
    : 'from-purple-600 to-fuchsia-600 shadow-purple-500/20';

  const handleApplyTemplate = (tmpl: any) => {
    v.setMode(tmpl.type as any);
    if (tmpl.type === 'MOTION') {
      v.setSourceImg(tmpl.input);
      v.setRefVideo(tmpl.ref);
    } else if (tmpl.type === 'SWAP') {
      v.setSourceImg(tmpl.ref);
      v.setRefVideo(tmpl.input);
    }
    setShowTemplateModal(false);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const handleDownloadAll = () => {
    const completedTasks = v.tasks.filter(t => t.status === 'completed' && t.url);
    completedTasks.forEach((t, i) => {
      setTimeout(() => handleDownload(t.url!, `video_${t.id}.mp4`), i * 800);
    });
  };

  const handleExtractFromLink = (extractedUrl: string) => {
    if (extractedUrl.includes('http')) {
      if (uploadTarget === 'IMG') v.setSourceImg(extractedUrl);
      else v.setRefVideo(extractedUrl);
    }
    setShowLinkExtractor(false);
  };

  const renderInputs = () => {
    const identityInput = (
      <div key="identity-input" className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon size={14} className="text-cyan-500" /> {v.mode === 'MOTION' ? 'Chọn ảnh' : 'Identity'}
          </label>
          <button 
            onClick={() => setShowQualityModal(true)}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-blue/10 rounded-md text-[9px] font-black text-brand-blue uppercase hover:bg-brand-blue hover:text-white transition-all border border-brand-blue/20"
          >
            <Info size={12} /> Hướng dẫn
          </button>
        </div>
        <div 
          className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 cursor-pointer group ${v.sourceImg ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-slate-200 dark:border-white/10 hover:border-cyan-500/40 bg-slate-50 dark:bg-white/[0.02]'}`}
        >
          {v.sourceImg ? (
            <>
              <img src={v.sourceImg} className="w-full h-full object-cover" alt="Identity" />
              <button 
                onClick={(e) => { e.stopPropagation(); v.setSourceImg(null); }}
                className="absolute top-3 right-3 p-1.5 bg-red-500 rounded-full hover:scale-110 transition-transform shadow-xl text-white z-50"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </>
          ) : (
            <div className="text-center space-y-2 p-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 mx-auto group-hover:scale-110 transition-transform shadow-inner">
                <User size={28} />
              </div>
              <p className="text-[9px] font-black uppercase text-slate-400">Chọn nguồn ảnh</p>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 z-40">
             <button 
               onClick={(e) => { e.stopPropagation(); setUploadTarget('IMG'); imgInputRef.current?.click(); }}
               className="w-full py-2.5 bg-white text-black text-[9px] font-black uppercase rounded-lg hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl"
             >
                <Monitor size={12} /> Tải từ máy tính
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); setUploadTarget('IMG'); setIsLibraryOpen(true); }}
               className="w-full py-2.5 bg-white text-black text-[9px] font-black uppercase rounded-lg hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl"
             >
                <FolderOpen size={12} /> Từ thư viện
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); setShowQuickGen(true); }}
               className="w-full py-2.5 bg-white text-black text-[9px] font-black uppercase rounded-lg hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl"
             >
                <Sparkles size={12} /> Tạo ảnh AI
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); setUploadTarget('IMG'); setShowLinkExtractor(true); }}
               className="w-full py-2.5 bg-white text-black text-[9px] font-black uppercase rounded-lg hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl"
             >
                <LinkIcon size={12} /> Từ liên kết
             </button>
          </div>

          <input type="file" ref={imgInputRef} className="hidden" accept="image/*" onChange={(e) => v.handleFileUpload(e, 'IMG')} />
        </div>
      </div>
    );

    const motionInput = (
      <div key="motion-input" className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Film size={14} className="text-purple-500" /> {v.mode === 'MOTION' ? 'Motion' : 'Original Video'}
        </label>
        <div 
          className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 cursor-pointer group ${v.refVideo ? 'border-purple-500 shadow-[0_0_30_rgba(147,51,234,0.1)]' : 'border-slate-200 dark:border-white/10 hover:border-purple-500/40 bg-slate-50 dark:bg-white/[0.02]'}`}
        >
          {v.refVideo ? (
            <>
              <video 
                src={v.refVideo} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover" 
              />
              <button 
                onClick={(e) => { e.stopPropagation(); v.setRefVideo(null); }}
                className="absolute top-3 right-3 p-1 bg-red-500 rounded-full hover:scale-110 transition-transform shadow-xl text-white"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </>
          ) : (
            <div className="text-center space-y-2 p-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 mx-auto group-hover:scale-110 transition-transform shadow-inner">
                <MonitorPlay size={28} />
              </div>
              <p className="text-[9px] font-black uppercase text-slate-400">Tải video mẫu</p>
            </div>
          )}

          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 z-40">
             <button 
               onClick={(e) => { e.stopPropagation(); setUploadTarget('VID'); vidInputRef.current?.click(); }}
               className="w-full py-2.5 bg-white text-black text-[9px] font-black uppercase rounded-lg hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl"
             >
                <Monitor size={12} /> Tải từ máy tính
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); setUploadTarget('VID'); setIsLibraryOpen(true); }}
               className="w-full py-2.5 bg-white text-black text-[9px] font-black uppercase rounded-lg hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl"
             >
                <FolderOpen size={12} /> Từ thư viện
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); setUploadTarget('VID'); setShowLinkExtractor(true); }}
               className="w-full py-2.5 bg-white text-black text-[9px] font-black uppercase rounded-lg hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl"
             >
                <LinkIcon size={12} /> Từ liên kết
             </button>
          </div>

          <input type="file" ref={vidInputRef} className="hidden" accept="video/*" onChange={(e) => v.handleFileUpload(e, 'VID')} />
        </div>
      </div>
    );

    return v.mode === 'SWAP' ? [motionInput, identityInput] : [identityInput, motionInput];
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#fcfcfd] dark:bg-[#0c0c0e] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500 selection:bg-brand-blue/30 overflow-x-hidden">
      
      {/* --- HEADER --- */}
      <header className="h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-50 bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-cyan-500 rounded-md flex items-center justify-center shadow-lg text-white">
              <Film size={16} fill="currentColor" />
            </div>
            <span className="text-lg font-black tracking-tight italic uppercase">Animate Studio</span>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-[#1a1a1a] p-1 rounded-xl border border-black/5 dark:border-white/10 shadow-inner transition-colors">
           <button 
             onClick={() => v.setMode('MOTION')}
             className={`px-8 py-2 rounded-lg text-[11px] font-black uppercase flex items-center gap-2.5 transition-all duration-300 ${v.mode === 'MOTION' ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
           >
              <Move size={14} /> Motion
           </button>
           <button 
             onClick={() => v.setMode('SWAP')}
             className={`px-8 py-2 rounded-lg text-[11px] font-black uppercase flex items-center gap-2.5 transition-all duration-300 ${v.mode === 'SWAP' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
           >
              <User size={14} /> Swap
           </button>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full border border-black/5 dark:border-white/10">
              <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">Tự động tải</span>
              <button 
                onClick={() => setAutoDownload(!autoDownload)}
                className={`w-8 h-4 rounded-full relative transition-colors ${autoDownload ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}
              >
                <motion.div animate={{ left: autoDownload ? 18 : 2 }} className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
              </button>
           </div>
           
           <button 
             onClick={handleDownloadAll}
             className="px-6 py-2 bg-brand-blue text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all shadow-lg"
           >
              <Download size={14}/> Tải tất cả
           </button>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden">
        
        <div className="w-[400px] xl:w-[480px] shrink-0 border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#0d0d0f] flex flex-col transition-all duration-500">
           <div className="flex-grow overflow-y-auto no-scrollbar p-8 lg:p-10 space-y-10">
              {/* PROMPT INPUT SECTION */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={14} className="text-brand-blue" /> Kịch bản / Prompt
                </label>
                <textarea 
                  value={v.prompt}
                  onChange={(e) => v.setPrompt(e.target.value)}
                  className="w-full h-32 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-4 rounded-2xl text-[12px] font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-blue transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 shadow-inner"
                  placeholder="Mô tả bối cảnh hoặc cảm xúc..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                 {renderInputs()}
              </div>

              <div className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5 relative z-20">
                <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em] text-center italic">Infrastructure & Logic</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SOURCE SELECTOR */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1 italic flex items-center gap-2">
                      <Globe size={12} className="text-brand-blue" /> Infrastructure
                    </label>
                    <select 
                      value={v.selectedEngine}
                      onChange={(e) => v.setSelectedEngine(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white appearance-none cursor-pointer shadow-sm"
                    >
                      <option value="wan">Wan Direct</option>
                      <option value="fxlab">Fxlab Node</option>
                      <option value="gommo">Gommo Cluster</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest ml-1 italic flex items-center gap-2">
                      <Server size={12} className="text-brand-blue" /> Neural Model
                    </label>
                    <div className="relative">
                      <button 
                        onClick={() => setShowModelMenu(!showModelMenu)}
                        className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-3 rounded-xl flex items-center justify-between group hover:border-brand-blue/30 transition-all shadow-sm"
                      >
                        <span className="font-black text-[10px] tracking-tight uppercase italic text-slate-900 dark:text-white truncate pr-4">
                          {v.selectedModel?.name || 'Loading...'}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showModelMenu ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {showModelMenu && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full mb-2 w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-3xl p-2 z-[110] overflow-hidden max-h-60 overflow-y-auto no-scrollbar"
                          >
                            {v.availableModels.map(m => (
                              <button 
                                key={m._id} 
                                onClick={() => { v.setSelectedModel(m); setShowModelMenu(false); }}
                                className={`w-full p-4 flex flex-col items-start rounded-xl transition-all ${v.selectedModel?._id === m._id ? 'bg-brand-blue/10 text-brand-blue' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400'}`}
                              >
                                <p className="text-[10px] font-black uppercase italic">{m.name}</p>
                                <p className="text-[8px] font-medium opacity-60 uppercase tracking-widest mt-1 line-clamp-1">{m.description || 'Professional production model'}</p>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic">Dung lượng</label>
                    <select 
                      value={v.selectedQuality} 
                      onChange={e => v.setSelectedQuality(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white shadow-inner"
                    >
                      {QUALITY_MODES.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic">Tỉ lệ</label>
                    <select 
                      value={v.selectedRatio} 
                      onChange={e => v.setSelectedRatio(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white shadow-inner"
                    >
                      {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                 </div>
              </div>
           </div>

           <div className="p-8 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 shrink-0 space-y-4 transition-colors">
              <div className="flex items-center justify-between px-1 mb-2">
                 <div className="text-left flex flex-col">
                    <span className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-1 italic">Chi phí ước tính</span>
                    <div className="flex items-center gap-1.5 text-orange-500 leading-none">
                       <Zap size={10} fill="currentColor" />
                       <span className="text-[11px] font-black italic">{v.estimatedCost} credits</span>
                    </div>
                 </div>
              </div>

              <button 
                 onClick={v.handleSynthesize}
                 disabled={v.isGenerating || !v.sourceImg || !v.selectedModel}
                 className={`w-full py-6 rounded-2xl flex items-center justify-center gap-4 text-[13px] font-black uppercase tracking-[0.3em] shadow-xl transition-all active:scale-[0.97] group overflow-hidden relative ${v.sourceImg && v.selectedModel ? `bg-gradient-to-r ${activeGradient} text-white` : 'bg-slate-100 dark:bg-[#222] text-slate-400 dark:text-gray-500 cursor-not-allowed grayscale'}`}
              >
                 <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                 {v.isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                 KHỞI CHẠY STUDIO
              </button>
              
              {credits < v.estimatedCost && v.sourceImg && (
                <div className="flex items-center justify-center gap-2 text-amber-500 animate-pulse">
                  <AlertTriangle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Số dư cạn kiệt (Cần {v.estimatedCost} CR)</span>
                </div>
              )}
           </div>
        </div>

        <div className="flex-grow flex flex-col bg-[#f0f1f4] dark:bg-[#050507] overflow-hidden relative">
           <AnimatePresence mode="wait">
              {hasJobs ? (
                 <motion.div 
                    key="results-grid"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-grow overflow-y-auto no-scrollbar p-10 space-y-12"
                 >
                    <div className="max-w-[1400px] mx-auto space-y-12">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                                <LayoutGrid size={24} />
                             </div>
                             <div className="space-y-0.5">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Sản phẩm hiện tại</h3>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <button onClick={() => setShowTemplateModal(true)} className="px-6 py-2 bg-purple-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all shadow-lg"><Sparkles size={14}/> Template</button>
                             <button onClick={() => v.setTasks([])} className="px-6 py-2 border border-black/5 dark:border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all">Dọn dẹp</button>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                          {v.tasks.map((task) => (
                             <VideoResultCard 
                               key={task.id} 
                               task={task} 
                               onDelete={(id) => v.setTasks(prev => prev.filter(t => t.id !== id))} 
                               onDownload={(url, id) => handleDownload(url, `render_${id}.mp4`)} 
                             />
                          ))}
                       </div>
                    </div>
                 </motion.div>
              ) : (
                 <AnimateIntelView 
                    mode={v.mode} 
                    onShowTemplates={() => setShowTemplateModal(true)}
                    onDownload={handleDownload}
                 />
              )}
           </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showQuickGen && (
          <QuickImageGenModal 
            isOpen={showQuickGen}
            onClose={() => setShowQuickGen(false)}
            onSuccess={() => {
              setShowQuickGen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLinkExtractor && (
          <LinkExtractorModal 
            isOpen={showLinkExtractor}
            onClose={() => setShowLinkExtractor(false)}
            onExtract={handleExtractFromLink}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLibraryOpen && (
          <ImageLibraryModal 
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
            onConfirm={(assets) => {
              if (assets.length > 0) {
                if (uploadTarget === 'IMG') v.setSourceImg(assets[0].url);
                else v.setRefVideo(assets[0].url);
              }
              setIsLibraryOpen(false);
            }}
            maxSelect={1}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQualityModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-3xl flex flex-col transition-colors"
            >
              <div className="p-8 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                     <Info size={20} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest italic text-slate-900 dark:text-white leading-none">Hướng dẫn chất lượng</h3>
                </div>
                <button onClick={() => setShowQualityModal(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <X size={28} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-10 space-y-10 no-scrollbar">
                <div className="space-y-6">
                   <div className="flex gap-4 items-start group">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm">
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="text-sm md:text-base font-bold text-slate-600 dark:text-gray-300 leading-relaxed uppercase tracking-tight italic">
                         "Video có nhân vật không bị che khuất quá nhiều sẽ cho ra kết quả đẹp nhất. Hãy đảm bảo nhân vật luôn xuất hiện xuyên suốt."
                      </p>
                   </div>
                   <div className="flex gap-4 items-start group">
                      <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0 shadow-sm">
                        <Maximize2 size={18} />
                      </div>
                      <p className="text-sm md:text-base font-bold text-slate-600 dark:text-gray-300 leading-relaxed uppercase tracking-tight italic">
                         "Ảnh nhân vật và video đầu vào có độ phân giải càng cao <span className="text-brand-blue font-black">(720x1280)</span> thì video đầu ra càng sắc nét."
                      </p>
                   </div>
                </div>

                <div className="space-y-6 pt-10 border-t border-black/5 dark:border-white/10">
                   <div className="flex items-center gap-3 text-orange-500">
                      <Sparkles size={18} fill="currentColor" />
                      <span className="text-xs font-black uppercase tracking-[0.4em] italic">Mẹo tối ưu: Fix da nhựa</span>
                   </div>
                   <p className="text-[12px] font-bold text-slate-500 dark:text-gray-400 uppercase italic leading-relaxed pl-1">
                      Hãy sử dụng model <span className="text-orange-500">Làm ảnh siêu thực - Fix da nhựa</span> cho ảnh trước khi tạo video để đạt độ chân thực tối đa.
                   </p>
                   
                   <div className="relative aspect-video rounded-[1.5rem] overflow-hidden border border-black/5 dark:border-white/10 group/compare bg-black shadow-2xl">
                      <div className="absolute inset-0 flex">
                         <div className="w-1/2 h-full relative">
                            <img 
                              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400" 
                              className="w-full h-full object-cover blur-[1px] grayscale opacity-40" 
                              alt="Plastic Skin" 
                            />
                            <div className="absolute bottom-3 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded text-[8px] font-black text-white uppercase tracking-widest">GỐC (DA NHỰA)</div>
                         </div>
                         <div className="w-1/2 h-full relative">
                            <img 
                              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400" 
                              className="w-full h-full object-cover brightness-110" 
                              alt="Realistic" 
                            />
                            <div className="absolute bottom-3 right-4 px-3 py-1 bg-orange-600 rounded text-[8px] font-black text-white uppercase tracking-widest shadow-lg">FIX SIÊU THỰC</div>
                         </div>
                      </div>
                      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/20 z-10 shadow-[0_0_10px_white]"></div>
                   </div>
                </div>
              </div>

              <div className="p-8 border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-center">
                <button 
                  onClick={() => setShowQualityModal(false)}
                  className="px-16 py-4 bg-brand-blue text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  Đã hiểu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResourceAuthModal 
        isOpen={showResourceModal} 
        onClose={() => setShowResourceModal(false)} 
        onConfirm={(pref) => {
          v.setUsagePreference(pref as any);
          localStorage.setItem('skyverses_usage_preference', pref);
          setShowResourceModal(false);
        }} 
        hasPersonalKey={v.usagePreference === 'key' || !!localStorage.getItem('skyverses_model_vault')} 
        totalCost={v.estimatedCost} 
      />

      <AnimateTemplateModal 
        isOpen={showTemplateModal} 
        onClose={() => setShowTemplateModal(false)} 
        onApply={handleApplyTemplate} 
        initialMode={v.mode} 
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default VideoAnimateWorkspace;