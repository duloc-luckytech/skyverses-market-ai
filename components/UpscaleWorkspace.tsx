import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  X, Upload, Maximize2, Zap, Download, 
  Loader2, Sparkles, Activity, History as HistoryIcon,
  LayoutGrid, Trash2, Share2, Eye, Plus, 
  ChevronLeft, MessageSquare, CloudUpload, Check, Coins, AlertTriangle,
  FolderOpen, ArrowUpCircle, Trash, MoveHorizontal, FileImage, FileSearch,
  ChevronDown, Monitor, FileWarning, Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { uploadToGCS, GCSAssetMetadata } from '../services/storage';
import { upscaleApi, UpscaleResponse } from '../apis/upscale';
import ImageLibraryModal from './ImageLibraryModal';
import ProductImageWorkspace from './ProductImageWorkspace';

interface UpscaleJob {
  id: string;
  original: string;
  result: string | null;
  status: 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'DONE' | 'ERROR';
  timestamp: string;
  res: string;
  sourceRes: string;
}

interface UpscaleWorkspaceProps {
  onClose: () => void;
  initialImage?: string | null;
}

const UpscaleWorkspace: React.FC<UpscaleWorkspaceProps> = ({ onClose, initialImage }) => {
  const { lang, t } = useLanguage();
  const { theme } = useTheme();
  const { credits, useCredits, isAuthenticated, login } = useAuth();
  
  const [jobs, setJobs] = useState<UpscaleJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [comparisonJob, setComparisonJob] = useState<UpscaleJob | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const UPSCALE_COST = 100;

  useEffect(() => {
    if (initialImage && jobs.length === 0) {
      const initId = 'init-' + Date.now();
      setJobs([{
        id: initId,
        original: initialImage,
        result: null,
        status: 'IDLE',
        timestamp: new Date().toLocaleTimeString(),
        res: '4K (UHD)',
        sourceRes: 'Detected'
      }]);
    }
  }, [initialImage]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFileName = (url: string) => {
    if (!url) return 'Unknown_File';
    try {
      const parts = url.split('/');
      const nameWithExt = parts[parts.length - 1].split('?')[0];
      return decodeURIComponent(nameWithExt);
    } catch (e) {
      return 'Image_Asset';
    }
  };

  const getFileExt = (url: string) => {
    const name = getFileName(url);
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'IMG';
  };

  const triggerDownload = async (url: string, filename: string) => {
    setIsDownloading(filename);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.body.appendChild(document.createElement('a'));
      link.href = blobUrl;
      link.download = filename;
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, '_blank');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files) as File[];
      
      for (const file of fileList) {
        const tempId = Date.now().toString() + Math.random();
        
        setJobs(prev => [...prev, {
          id: tempId,
          original: '', 
          result: null,
          status: 'UPLOADING',
          timestamp: new Date().toLocaleTimeString(),
          res: '4K (UHD)',
          sourceRes: 'SD'
        }]);

        try {
          const metadata = await uploadToGCS(file);
          setJobs(prev => prev.map(j => j.id === tempId ? { 
            ...j, 
            original: metadata.url, 
            status: 'IDLE' 
          } : j));
        } catch (err) {
          console.error("Upload failed:", err);
          setJobs(prev => prev.map(j => j.id === tempId ? { ...j, status: 'ERROR' } : j));
        }
      }
    }
    if (e.target) e.target.value = '';
    setShowAddMenu(false);
  };

  const handleLibraryConfirm = (selected: GCSAssetMetadata[]) => {
    const newJobs: UpscaleJob[] = selected.map(asset => ({
      id: asset.id,
      original: asset.url,
      result: null,
      status: 'IDLE',
      timestamp: new Date().toLocaleTimeString(),
      res: '4K (UHD)',
      sourceRes: 'Detected'
    }));
    setJobs(prev => [...prev, ...newJobs]);
    setIsLibraryOpen(false);
    setShowAddMenu(false);
  };

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const clearAll = () => {
    if (jobs.length === 0) return;
    if (window.confirm("Xóa tất cả ảnh trong danh sách?")) {
      setJobs([]);
    }
  };

  const runUpscaleBatch = async () => {
    const idleJobs = jobs.filter(j => j.status === 'IDLE' && !j.original.toLowerCase().endsWith('.webp'));
    if (idleJobs.length === 0 || isProcessing) return;
    if (!isAuthenticated) { login(); return; }
    
    const totalCost = idleJobs.length * UPSCALE_COST;
    if (credits < totalCost || credits < 100) { setShowLowCreditAlert(true); return; }

    setIsProcessing(true);
    
    for (const job of idleJobs) {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'PROCESSING' } : j));
      
      try {
        const response: UpscaleResponse = await upscaleApi.upscale(job.original);
        
        if (response.success && response.data?.image?.url) {
          useCredits(UPSCALE_COST);
          setJobs(prev => prev.map(j => j.id === job.id ? { 
            ...j, 
            status: 'DONE', 
            result: response.data!.image.url,
            res: `${response.data!.image.width}x${response.data!.image.height}`,
            sourceRes: `${response.data!.image.oldWidth}x${response.data!.image.oldHeight}`
          } : j));
        } else {
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'ERROR' } : j));
        }
      } catch (err) {
        console.error("Upscale task error:", err);
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'ERROR' } : j));
      }
    }
    
    setIsProcessing(false);
  };

  const handleEditImage = (url: string) => {
    setEditorImage(url);
    setIsEditorOpen(true);
  };

  const idleCount = jobs.filter(j => j.status === 'IDLE' && !j.original.toLowerCase().endsWith('.webp')).length;
  const currentTotalCost = idleCount * UPSCALE_COST;

  const isAddDisabled = !isAuthenticated || (credits < UPSCALE_COST && jobs.length === 0);
  const isUpscaleDisabled = isProcessing || idleCount === 0 || !isAuthenticated || (credits < currentTotalCost) || (credits < 100);

  const addTooltip = useMemo(() => {
    if (!isAuthenticated) return "Vui lòng đăng nhập để sử dụng";
    if (credits < UPSCALE_COST && jobs.length === 0) return `Cần ít nhất ${UPSCALE_COST} CR để thêm ảnh`;
    return null;
  }, [isAuthenticated, credits, jobs.length]);

  const upscaleTooltip = useMemo(() => {
    if (!isAuthenticated) return "Vui lòng đăng nhập để sử dụng";
    if (credits < 100) return `Hạn ngạch tối thiểu 100 CR`;
    if (idleCount > 0 && credits < currentTotalCost) return `Không đủ hạn ngạch (Cần ${currentTotalCost} CR)`;
    if (idleCount === 0 && !isProcessing) return "Thêm ảnh để bắt đầu";
    return null;
  }, [isAuthenticated, idleCount, credits, currentTotalCost, isProcessing]);

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-[#0b0c10] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500 relative">
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between shrink-0 z-[120] bg-white dark:bg-[#0b0c10] border-b border-slate-100 dark:border-white/5 transition-colors sticky top-0">
        <div className="flex items-center gap-2 md:gap-4">
           <div className="relative" ref={addMenuRef}>
              <button 
                onClick={() => !isAddDisabled && setShowAddMenu(!showAddMenu)}
                disabled={isAddDisabled}
                className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-[11px] md:text-sm font-bold transition-all shadow-sm ${
                  !isAddDisabled 
                  ? 'bg-slate-50 dark:bg-[#1a1b23] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#252630]' 
                  : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-300 dark:text-white/20 cursor-not-allowed grayscale'
                }`}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Thêm ảnh</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${showAddMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showAddMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-3 w-52 sm:w-56 bg-white dark:bg-[#1a1b23] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 z-[130]"
                  >
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
                     >
                        <Monitor size={16} className="text-brand-blue" />
                        Từ máy tính
                     </button>
                     <button 
                       onClick={() => setIsLibraryOpen(true)}
                       className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
                     >
                        <FolderOpen size={16} className="text-purple-500" />
                        Từ thư viện
                     </button>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           <button 
             onClick={clearAll}
             className="flex items-center gap-2 p-2 sm:px-5 sm:py-2 text-red-500 hover:bg-red-500/10 rounded-xl text-[11px] md:text-sm font-bold transition-all"
           >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Xóa tất cả</span>
           </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
           <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full transition-colors shrink-0">
              <Coins size={12} className="text-yellow-500" />
              <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-white leading-none">{(credits || 0).toLocaleString()} <span className="hidden xs:inline">CR</span></span>
           </div>
           
           <div className="relative group/upscale">
              <button 
                onClick={runUpscaleBatch}
                disabled={isUpscaleDisabled}
                className={`flex items-center gap-2 px-4 sm:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-sm tracking-widest transition-all shadow-xl ${
                  !isUpscaleDisabled
                  ? 'bg-[#00a870] text-white hover:scale-105 active:scale-95 shadow-[#00a870]/20'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/30 cursor-not-allowed border border-slate-200 dark:border-transparent grayscale'
                }`}
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpCircle size={16} />}
                <span className="hidden sm:inline">Upscale</span> <span className="hidden lg:inline">HD/4K</span>
              </button>

              {upscaleTooltip && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 group-hover/upscale:opacity-100 opacity-0 pointer-events-none transition-all duration-300 -translate-y-2 group-hover/upscale:translate-y-0 z-[130]">
                   <div className="bg-slate-800 dark:bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded shadow-2xl whitespace-nowrap border border-white/10 relative">
                      {upscaleTooltip}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-900 rotate-45 -mb-1 border-l border-t border-white/10"></div>
                   </div>
                </div>
              )}
           </div>

           <button onClick={onClose} className="p-1 md:p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X size={22} className="md:w-6 md:h-6" />
           </button>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleUpload} />
      </header>

      <main className="flex-grow p-4 md:p-8 overflow-y-auto no-scrollbar bg-slate-50/50 dark:bg-transparent transition-colors z-10">
         <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
               <AnimatePresence>
                  {jobs.map((job, idx) => {
                    const isWebp = job.original.toLowerCase().endsWith('.webp');
                    const fileName = getFileName(job.original);
                    const fileExt = getFileExt(job.original);

                    return (
                      <motion.div 
                        key={job.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`relative group aspect-square bg-white dark:bg-[#14151a] rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-2xl transition-all ${isWebp ? 'cursor-not-allowed grayscale' : 'hover:border-[#00a870]/40 cursor-pointer'}`}
                        onClick={() => !isWebp && job.status === 'DONE' && setComparisonJob(job)}
                      >
                         {job.status === 'UPLOADING' ? (
                           <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-50/80 dark:bg-black/40 backdrop-blur-sm">
                              <Loader2 size={32} className="text-brand-blue animate-spin" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Uploading</p>
                           </div>
                         ) : (
                           <img src={job.result || job.original} className={`w-full h-full object-cover transition-all duration-700 ${job.status === 'PROCESSING' ? 'blur-md opacity-40' : ''} ${isWebp ? 'opacity-40' : ''}`} alt="" />
                         )}
                         
                         {isWebp && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] p-6 text-center">
                               <FileWarning size={32} className="text-red-500 mb-2" />
                               <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                                  Định dạng .WebP chưa được hỗ trợ
                               </span>
                            </div>
                         )}

                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                         
                         <div className="absolute top-3 md:top-4 left-3 md:left-4 right-3 md:right-4 flex justify-between items-start z-30">
                            <span className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black text-slate-800 dark:text-white/80 border border-slate-200 dark:border-white/10 uppercase tracking-widest shadow-sm">
                               #{idx + 1}
                            </span>
                            {job.status === 'DONE' ? (
                              <div className="bg-[#00a870] text-white p-1 md:p-1.5 rounded-full shadow-lg">
                                 <Check size={10} strokeWidth={4} className="md:w-3 md:h-3" />
                              </div>
                            ) : !isWebp && (
                               <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white/60 border border-white/10 uppercase">
                                  {fileExt}
                               </div>
                            )}
                         </div>

                         {job.status === 'PROCESSING' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/40 dark:bg-transparent z-20">
                               <Loader2 size={32} className="text-[#00a870] animate-spin" />
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00a870] animate-pulse">Processing</p>
                            </div>
                         )}

                         {!isWebp && (
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 md:gap-3 z-40">
                              {job.status === 'DONE' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setComparisonJob(job); }}
                                  className="p-2 md:p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-2xl"
                                >
                                   <Eye size={16} className="md:w-4.5 md:h-4.5" />
                                </button>
                              )}
                              
                              {job.status !== 'PROCESSING' && job.status !== 'UPLOADING' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEditImage(job.result || job.original); }}
                                  className="p-2 md:p-3 bg-brand-blue text-white rounded-full hover:scale-110 transition-transform shadow-2xl"
                                  title="Chỉnh sửa hình ảnh"
                                >
                                   <Edit3 size={16} className="md:w-4.5 md:h-4.5" />
                                </button>
                              )}

                              {job.status !== 'PROCESSING' && job.status !== 'UPLOADING' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeJob(job.id); }}
                                  className="p-2 md:p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-2xl"
                                >
                                   <Trash size={16} className="md:w-4.5 md:h-4.5" />
                                </button>
                              )}
                           </div>
                         )}

                         {isWebp && (
                            <div className="absolute top-3 md:top-4 right-3 md:right-4 z-40">
                               <button 
                                  onClick={(e) => { e.stopPropagation(); removeJob(job.id); }}
                                  className="p-1.5 md:p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-all shadow-xl"
                                >
                                  <Trash size={12} className="md:w-3.5 md:h-3.5" />
                               </button>
                            </div>
                         )}

                         <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 flex justify-between items-end pointer-events-none z-30">
                            <div className="space-y-0.5 md:space-y-1 min-w-0 pr-4">
                               <p className="text-[9px] md:text-[10px] font-black text-white uppercase truncate tracking-tighter italic">
                                  {fileName}
                               </p>
                               <p className="text-[7px] md:text-[8px] font-bold text-white/60 uppercase tracking-widest">
                                  {job.status === 'DONE' ? 'Upscaled UHD' : 'Original SD'} • {job.res}
                               </p>
                            </div>
                            {job.result && job.status === 'DONE' && (
                              <button 
                                disabled={isDownloading === `upscale_${job.id}.png`}
                                onClick={(e) => { e.stopPropagation(); triggerDownload(job.result!, `upscale_${job.id}.png`); }}
                                className="p-1.5 md:p-2 bg-white/20 backdrop-blur-md rounded-lg text-white pointer-events-auto hover:bg-white hover:text-black transition-all border border-white/10"
                              >
                                 {isDownloading === `upscale_${job.id}.png` ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                              </button>
                            )}
                         </div>
                      </motion.div>
                    );
                  })}
               </AnimatePresence>

               <motion.div 
                 onClick={() => !isAddDisabled && setShowAddMenu(!showAddMenu)}
                 className={`relative aspect-square border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-2 md:gap-4 transition-all group shadow-sm dark:shadow-none ${
                   !isAddDisabled 
                   ? 'bg-white dark:bg-[#14151a]/40 border-slate-200 dark:border-white/5 cursor-pointer hover:border-[#00a870]/30 hover:bg-slate-50 dark:hover:bg-[#14151a]/60' 
                   : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-transparent cursor-not-allowed grayscale opacity-40'
                 }`}
               >
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all ${!isAddDisabled ? 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/20 group-hover:text-[#00a870] group-hover:bg-[#00a870]/10' : 'bg-transparent text-slate-300 dark:text-gray-700'}`}>
                     <Plus size={24} className="md:w-8 md:h-8" />
                  </div>
                  <div className="text-center space-y-0.5">
                     <p className={`text-xs md:text-sm font-bold transition-colors uppercase tracking-widest ${!isAddDisabled ? 'text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white' : 'text-slate-300 dark:text-gray-700'}`}>Thêm ảnh</p>
                  </div>
                  
                  {addTooltip && !showAddMenu && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:opacity-100 z-[110]">
                       <div className="bg-slate-800 dark:bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded shadow-2xl whitespace-nowrap border border-white/10 relative">
                          {addTooltip}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-900 rotate-45 -mb-1 border-r border-b border-white/10"></div>
                       </div>
                    </div>
                  )}
               </motion.div>
            </div>

            {jobs.length === 0 && (
               <div className="h-[60vh] flex flex-col items-center justify-center opacity-10 space-y-6 md:space-y-8 select-none pt-20">
                  <FileSearch strokeWidth={1} className="w-20 h-20 md:w-[120px] md:h-[120px] text-slate-900 dark:text-white" />
                  <h3 className="text-2xl md:text-4xl font-black uppercase tracking-[0.3em] md:tracking-[0.5em] italic text-slate-900 dark:text-white">No Media</h3>
               </div>
            )}
         </div>
      </main>

      <AnimatePresence>
        {comparisonJob && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white/98 dark:bg-black/98 backdrop-blur-3xl flex flex-col overflow-hidden transition-colors"
          >
             <div className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-colors border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3 md:gap-4">
                   <div className="p-1.5 md:p-2 bg-[#00a870]/20 rounded-lg text-[#00a870]">
                      <Sparkles size={16} className="md:w-4.5 md:h-4.5" />
                   </div>
                   <div className="space-y-0.5">
                      <h3 className="text-[11px] md:text-sm font-black uppercase tracking-widest italic leading-none text-slate-900 dark:text-white">Comparison</h3>
                      <p className="text-[8px] md:text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-widest">{comparisonJob.sourceRes} → {comparisonJob.res}</p>
                   </div>
                </div>

                <div className="flex items-center gap-2 md:gap-6">
                   <button 
                     onClick={() => handleEditImage(comparisonJob.result || comparisonJob.original)}
                     className="p-2 md:p-3 bg-brand-blue text-white rounded-full hover:scale-110 transition-transform shadow-2xl"
                     title="Chỉnh sửa hình ảnh"
                   >
                      <Edit3 size={16} className="md:w-4.5 md:h-4.5" />
                   </button>
                   <button 
                     disabled={isDownloading === `upscale_master_${comparisonJob.id}.png`}
                     onClick={() => triggerDownload(comparisonJob.result!, `upscale_master_${comparisonJob.id}.png`)}
                     className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 md:px-10 py-2 md:py-3 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50"
                   >
                      {isDownloading === `upscale_master_${comparisonJob.id}.png` ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                      <span className="hidden xs:inline">Tải xuống</span> 4K
                   </button>
                   <button 
                     onClick={onClose}
                     className="p-1.5 md:p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                   >
                      <X size={24} className="md:w-8 md:h-8" />
                   </button>
                </div>
             </div>

             <div className="flex-grow relative overflow-hidden bg-slate-100 dark:bg-[#050505] flex items-center justify-center p-4 md:p-12 transition-colors">
                <div className="relative w-full max-w-5xl aspect-video bg-black shadow-[0_0_150px_rgba(0,168,112,0.15)] rounded-lg overflow-hidden group">
                   <img src={comparisonJob.original} className="absolute inset-0 w-full h-full object-contain select-none" alt="Original" />
                   
                   <div 
                     className="absolute inset-0 overflow-hidden select-none"
                     style={{ width: `${sliderPosition}%`, borderRight: '2px solid #00a870' }}
                   >
                      <img 
                        src={comparisonJob.result!} 
                        className="absolute inset-0 h-full object-contain" 
                        style={{ width: `calc(100% * 100 / ${sliderPosition})`, maxWidth: 'none' }}
                        alt="Upscaled" 
                      />
                   </div>

                   <div 
                     className="absolute inset-y-0 z-10 w-1 bg-[#00a870] cursor-ew-resize pointer-events-none"
                     style={{ left: `${sliderPosition}%` }}
                   >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-[#00a870] rounded-full shadow-2xl flex items-center justify-center text-white">
                         <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <MoveHorizontal strokeWidth={3} className="w-4 h-4 md:w-5 md:h-5" />
                         </motion.div>
                      </div>
                   </div>

                   <input 
                     type="range" min="0" max="100" value={sliderPosition}
                     onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                   />

                   <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-30 pointer-events-none px-3 md:px-4 py-1.5 md:py-2 bg-[#00a870] text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl">
                      Upscaled Detail
                   </div>
                   <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 z-30 pointer-events-none px-3 md:px-4 py-1.5 md:py-2 bg-black/60 backdrop-blur-md text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-sm border border-white/10 shadow-xl">
                      Original SD
                   </div>
                </div>
             </div>
             
             <div className="h-12 md:h-16 px-6 md:px-10 flex items-center justify-center bg-white dark:bg-black border-t border-slate-100 dark:border-white/5 transition-colors">
                <p className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.4em] italic text-center">
                   Slide the bar to compare pixel density and detail restoration.
                </p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageLibraryModal 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        onConfirm={handleLibraryConfirm}
        maxSelect={5}
      />

      <ProductImageWorkspace 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)}
        initialImage={editorImage}
      />

      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
             <div className="max-w-sm w-full bg-white dark:bg-[#111218] p-8 md:p-10 border border-slate-200 dark:border-white/10 rounded-sm text-center space-y-6 md:space-y-8 shadow-3xl transition-colors">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500 transition-colors">
                  <AlertTriangle className="w-8 h-8 md:w-12 md:h-12" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-lg md:text-xl font-black uppercase italic text-slate-800 dark:text-white tracking-tight">Hạn ngạch cạn kiệt</h3>
                   <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight">
                      Tác vụ này yêu cầu **{UPSCALE_COST} credits** mỗi ảnh. Vui lòng nạp thêm để tiếp tục.
                   </p>
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                   <Link to="/credits" className="bg-[#00a870] text-white py-3 md:py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl text-center hover:brightness-110 transition-all">Nạp thêm Credits</Link>
                   <button onClick={() => setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors tracking-widest underline underline-offset-4">Đóng</button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 100%;
          width: 4px;
          cursor: ew-resize;
        }
      `}</style>
    </div>
  );
};

export default UpscaleWorkspace;