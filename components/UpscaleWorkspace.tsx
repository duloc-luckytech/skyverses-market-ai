import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, Plus, Loader2, Download, Trash2, Trash,
  Check, Eye, Edit3, MoveHorizontal, Sparkles,
  ChevronDown, Monitor, FolderOpen, FileWarning,
  ArrowUpCircle, FileSearch, Coins, AlertTriangle
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
    if (!url) return 'Unknown';
    try {
      const parts = url.split('/');
      const nameWithExt = parts[parts.length - 1].split('?')[0];
      return decodeURIComponent(nameWithExt);
    } catch (e) {
      return 'Image';
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
      if (!response.ok) throw new Error("Network error");
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
        console.error("Upscale error:", err);
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
    if (!isAuthenticated) return "Đăng nhập để sử dụng";
    if (credits < UPSCALE_COST && jobs.length === 0) return `Cần ít nhất ${UPSCALE_COST} CR`;
    return null;
  }, [isAuthenticated, credits, jobs.length]);

  const upscaleTooltip = useMemo(() => {
    if (!isAuthenticated) return "Đăng nhập để sử dụng";
    if (credits < 100) return "Cần tối thiểu 100 CR";
    if (idleCount > 0 && credits < currentTotalCost) return `Không đủ credits (Cần ${currentTotalCost} CR)`;
    if (idleCount === 0 && !isProcessing) return "Thêm ảnh để bắt đầu";
    return null;
  }, [isAuthenticated, idleCount, credits, currentTotalCost, isProcessing]);

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-300 relative">

      {/* ═══ HEADER ═══ */}
      <header className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between shrink-0 z-[120] bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.06] sticky top-0">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Add button */}
          <div className="relative" ref={addMenuRef}>
            <button
              onClick={() => !isAddDisabled && setShowAddMenu(!showAddMenu)}
              disabled={isAddDisabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all ${
                !isAddDisabled
                ? 'bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-slate-700 dark:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                : 'bg-slate-100 dark:bg-white/[0.02] text-slate-300 dark:text-white/20 cursor-not-allowed'
              }`}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Thêm ảnh</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${showAddMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-xl overflow-hidden p-1.5 z-[130]"
                >
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-medium text-slate-600 dark:text-gray-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-lg transition-all"
                  >
                    <Monitor size={14} className="text-brand-blue" />
                    Tải từ máy tính
                  </button>
                  <button
                    onClick={() => setIsLibraryOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-medium text-slate-600 dark:text-gray-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-lg transition-all"
                  >
                    <FolderOpen size={14} className="text-purple-500" />
                    Chọn từ thư viện
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear all */}
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/[0.06] rounded-xl text-[11px] font-medium transition-all"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Xóa tất cả</span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Credits */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-full">
            <Sparkles size={11} className="text-brand-blue" fill="currentColor" />
            <span className="text-[10px] font-bold text-slate-700 dark:text-white">{(credits || 0).toLocaleString()}</span>
          </div>

          {/* Upscale CTA */}
          <div className="relative group/upscale">
            <button
              onClick={runUpscaleBatch}
              disabled={isUpscaleDisabled}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all ${
                !isUpscaleDisabled
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98]'
                : 'bg-slate-100 dark:bg-white/[0.03] text-slate-300 dark:text-white/20 cursor-not-allowed'
              }`}
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpCircle size={14} />}
              <span className="hidden sm:inline">Upscale</span>
            </button>

            {upscaleTooltip && (
              <div className="absolute top-full right-0 mt-2 group-hover/upscale:opacity-100 opacity-0 pointer-events-none transition-opacity z-[130]">
                <div className="bg-slate-900 dark:bg-white text-white dark:text-black text-[9px] font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                  {upscaleTooltip}
                </div>
              </div>
            )}
          </div>

          {/* Close */}
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
            <X size={20} />
          </button>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleUpload} />
      </header>

      {/* ═══ MAIN GRID ═══ */}
      <main className="flex-grow p-4 md:p-6 overflow-y-auto no-scrollbar bg-slate-50/50 dark:bg-transparent transition-colors z-10">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            <AnimatePresence>
              {jobs.map((job, idx) => {
                const isWebp = job.original.toLowerCase().endsWith('.webp');
                const fileName = getFileName(job.original);
                const fileExt = getFileExt(job.original);

                return (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`relative group aspect-square bg-white dark:bg-white/[0.02] rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                      isWebp
                        ? 'cursor-not-allowed grayscale border-black/[0.06] dark:border-white/[0.04]'
                        : 'hover:border-emerald-500/30 cursor-pointer border-black/[0.06] dark:border-white/[0.06]'
                    }`}
                    onClick={() => !isWebp && job.status === 'DONE' && setComparisonJob(job)}
                  >
                    {/* Image or uploading state */}
                    {job.status === 'UPLOADING' ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 dark:bg-black/40 backdrop-blur-sm">
                        <Loader2 size={28} className="text-brand-blue animate-spin" />
                        <p className="text-[10px] font-semibold text-brand-blue">Đang tải lên...</p>
                      </div>
                    ) : (
                      <img src={job.result || job.original} className={`w-full h-full object-cover transition-all duration-500 ${job.status === 'PROCESSING' ? 'blur-sm opacity-40' : ''} ${isWebp ? 'opacity-40' : ''}`} alt="" />
                    )}

                    {/* WebP warning */}
                    {isWebp && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 p-4 text-center">
                        <FileWarning size={28} className="text-red-400 mb-2" />
                        <span className="bg-red-500/90 text-white px-2.5 py-1 rounded-lg text-[9px] font-semibold">
                          .WebP chưa hỗ trợ
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-30">
                      <span className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-semibold text-slate-700 dark:text-white/80 border border-black/[0.06] dark:border-white/10">
                        #{idx + 1}
                      </span>
                      {job.status === 'DONE' ? (
                        <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      ) : !isWebp && (
                        <div className="bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-semibold text-white/60 border border-white/10">
                          {fileExt}
                        </div>
                      )}
                    </div>

                    {/* Processing overlay */}
                    {job.status === 'PROCESSING' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20">
                        <Loader2 size={28} className="text-emerald-400 animate-spin" />
                        <p className="text-[10px] font-semibold text-emerald-400">Đang xử lý...</p>
                      </div>
                    )}

                    {/* Hover actions */}
                    {!isWebp && (
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-40">
                        {job.status === 'DONE' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setComparisonJob(job); }}
                            className="p-2.5 bg-white text-slate-900 rounded-xl hover:scale-110 transition-transform shadow-lg"
                            title="So sánh"
                          >
                            <Eye size={15} />
                          </button>
                        )}

                        {job.status !== 'PROCESSING' && job.status !== 'UPLOADING' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditImage(job.result || job.original); }}
                            className="p-2.5 bg-brand-blue text-white rounded-xl hover:scale-110 transition-transform shadow-lg"
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={15} />
                          </button>
                        )}

                        {job.status !== 'PROCESSING' && job.status !== 'UPLOADING' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeJob(job.id); }}
                            className="p-2.5 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg"
                            title="Xóa"
                          >
                            <Trash size={15} />
                          </button>
                        )}
                      </div>
                    )}

                    {/* WebP remove button */}
                    {isWebp && (
                      <div className="absolute top-3 right-3 z-40">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeJob(job.id); }}
                          className="p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    )}

                    {/* Bottom info */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none z-30">
                      <div className="space-y-0.5 min-w-0 pr-3">
                        <p className="text-[9px] font-semibold text-white truncate">
                          {fileName}
                        </p>
                        <p className="text-[8px] font-medium text-white/50">
                          {job.status === 'DONE' ? 'Đã nâng cấp' : 'Ảnh gốc'} · {job.res}
                        </p>
                      </div>
                      {job.result && job.status === 'DONE' && (
                        <button
                          disabled={isDownloading === `upscale_${job.id}.png`}
                          onClick={(e) => { e.stopPropagation(); triggerDownload(job.result!, `upscale_${job.id}.png`); }}
                          className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white pointer-events-auto hover:bg-white hover:text-black transition-all border border-white/10"
                        >
                          {isDownloading === `upscale_${job.id}.png` ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Add card */}
            <motion.div
              onClick={() => !isAddDisabled && setShowAddMenu(!showAddMenu)}
              className={`relative aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group ${
                !isAddDisabled
                ? 'bg-white dark:bg-white/[0.01] border-black/[0.08] dark:border-white/[0.06] cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]'
                : 'bg-slate-50 dark:bg-white/[0.01] border-black/[0.04] dark:border-white/[0.03] cursor-not-allowed opacity-40'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${!isAddDisabled ? 'bg-black/[0.04] dark:bg-white/[0.04] text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/10' : 'text-slate-300 dark:text-gray-700'}`}>
                <Plus size={22} />
              </div>
              <p className={`text-[11px] font-medium transition-colors ${!isAddDisabled ? 'text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400' : 'text-slate-300 dark:text-gray-700'}`}>Thêm ảnh</p>

              {addTooltip && !showAddMenu && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[110]">
                  <div className="bg-slate-900 dark:bg-white text-white dark:text-black text-[9px] font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                    {addTooltip}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Empty state */}
          {jobs.length === 0 && (
            <div className="h-[50vh] flex flex-col items-center justify-center opacity-10 space-y-4 select-none pt-12">
              <FileSearch strokeWidth={1} className="w-16 h-16 md:w-20 md:h-20" />
              <p className="text-lg md:text-xl font-bold tracking-tight">Chưa có ảnh nào</p>
            </div>
          )}
        </div>
      </main>

      {/* ═══ COMPARISON MODAL ═══ */}
      <AnimatePresence>
        {comparisonJob && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white/98 dark:bg-black/98 backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Comparison header */}
            <div className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-[12px] font-bold leading-none">So sánh kết quả</h3>
                  <p className="text-[10px] text-slate-400 dark:text-[#555] mt-0.5">{comparisonJob.sourceRes} → {comparisonJob.res}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => handleEditImage(comparisonJob.result || comparisonJob.original)}
                  className="p-2 bg-brand-blue text-white rounded-xl hover:scale-105 transition-transform shadow-md"
                  title="Chỉnh sửa"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  disabled={isDownloading === `upscale_master_${comparisonJob.id}.png`}
                  onClick={() => triggerDownload(comparisonJob.result!, `upscale_master_${comparisonJob.id}.png`)}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black px-4 md:px-6 py-2 rounded-xl font-semibold text-[11px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isDownloading === `upscale_master_${comparisonJob.id}.png` ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  <span className="hidden sm:inline">Tải xuống</span>
                </button>
                <button
                  onClick={() => setComparisonJob(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Comparison viewport */}
            <div className="flex-grow relative overflow-hidden bg-slate-100 dark:bg-[#050505] flex items-center justify-center p-4 md:p-10">
              <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                <img src={comparisonJob.original} className="absolute inset-0 w-full h-full object-contain select-none" alt="Original" />

                <div
                  className="absolute inset-0 overflow-hidden select-none"
                  style={{ width: `${sliderPosition}%`, borderRight: '2px solid #10b981' }}
                >
                  <img
                    src={comparisonJob.result!}
                    className="absolute inset-0 h-full object-contain"
                    style={{ width: `calc(100% * 100 / ${sliderPosition})`, maxWidth: 'none' }}
                    alt="Upscaled"
                  />
                </div>

                {/* Slider handle */}
                <div
                  className="absolute inset-y-0 z-10 w-0.5 bg-emerald-500 cursor-ew-resize pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 rounded-full shadow-lg flex items-center justify-center text-white">
                    <MoveHorizontal strokeWidth={2.5} size={16} />
                  </div>
                </div>

                <input
                  type="range" min="0" max="100" value={sliderPosition}
                  onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />

                {/* Labels */}
                <div className="absolute bottom-4 left-4 z-30 pointer-events-none px-2.5 py-1 bg-emerald-500 text-white text-[9px] font-semibold rounded-lg shadow-lg">
                  Đã nâng cấp
                </div>
                <div className="absolute bottom-4 right-4 z-30 pointer-events-none px-2.5 py-1 bg-black/60 backdrop-blur-md text-white/80 text-[9px] font-semibold rounded-lg border border-white/10">
                  Ảnh gốc
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="h-10 md:h-12 px-6 flex items-center justify-center bg-white dark:bg-black border-t border-black/[0.04] dark:border-white/[0.04]">
              <p className="text-[9px] font-medium text-slate-400 dark:text-[#555] text-center">
                Kéo thanh trượt để so sánh chi tiết trước và sau khi nâng cấp
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MODALS ═══ */}
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

      {/* Low credit alert */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-sm w-full bg-white dark:bg-[#161618] p-8 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500">
                <Coins size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Không đủ credits</h3>
                <p className="text-xs text-slate-500 dark:text-[#666] leading-relaxed">
                  Upscale ảnh cần {UPSCALE_COST} credits mỗi ảnh. Nạp thêm để tiếp tục sử dụng.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link to="/credits" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg hover:brightness-110 transition-all text-center">
                  Nạp Credits
                </Link>
                <button onClick={() => setShowLowCreditAlert(false)} className="text-xs font-medium text-slate-400 hover:text-emerald-500 transition-colors">
                  Bỏ qua
                </button>
              </div>
            </motion.div>
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