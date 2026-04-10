
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Loader2, ChevronLeft, RefreshCw,
  CheckCircle2, AlertCircle, Clock, ImageIcon, Target, ShieldCheck,
  AlertTriangle, Info, Upload, Trash2, Clock4, Film, MessageSquare, FolderOpen
} from 'lucide-react';
import { useRestoration, RESTORATION_PRESETS, RestoreJob } from '../hooks/useRestoration';
import { RestorationViewport } from './restoration/RestorationViewport';
import ProductImageWorkspace from './ProductImageWorkspace';
import UpscaleWorkspace from './UpscaleWorkspace';
import ImageLibraryModal from './ImageLibraryModal';
import { GCSAssetMetadata } from '../services/storage';
import AISuggestPanel, { StylePreset } from './workspace/AISuggestPanel';

/* ─── AISuggestPanel: restoration style presets ─── */
const RESTORATION_STYLES: StylePreset[] = [
  { id: 'portrait',    label: 'Chân dung',    emoji: '👤', description: 'Tập trung phục hồi khuôn mặt, da, mắt, tóc',          promptPrefix: 'focus on face restoration, skin clarity, eye detail, ' },
  { id: 'wedding',     label: 'Ảnh cưới',     emoji: '💍', description: 'Phục chế ảnh cưới vintage — giữ không khí lãng mạn',   promptPrefix: 'wedding photo restoration, romantic, soft tones, ' },
  { id: 'colorize',    label: 'Tô màu',       emoji: '🎨', description: 'Tô màu ảnh đen trắng tự nhiên như màu gốc',             promptPrefix: 'colorize black and white photo, natural vivid colors, ' },
  { id: 'landscape',   label: 'Phong cảnh',   emoji: '🌄', description: 'Phục chế và upscale ảnh phong cảnh, thiên nhiên',       promptPrefix: 'landscape photo enhancement, sky detail, nature colors, ' },
  { id: 'memorial',    label: 'Kỷ niệm',      emoji: '🕰️', description: 'Xóa vết xước, gấp nếp — giữ trọn ký ức gia đình',      promptPrefix: 'memorial photo restore, remove scratches, preserve family memory, ' },
  { id: 'upscale_4k',  label: '4K / 8K',      emoji: '🔭', description: 'Nâng cấp độ phân giải lên 4K hoặc 8K siêu nét',        promptPrefix: 'ultra high resolution upscale 4K, maximum detail, sharp, ' },
];

const STORAGE_KEY = 'skyverses_restoration_vault';

/* ─── Status config ─── */
const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  'DONE':       { icon: CheckCircle2, color: 'text-emerald-500', label: 'Hoàn tất' },
  'Khởi tạo':  { icon: Clock,        color: 'text-blue-500',    label: 'Sẵn sàng' },
  'PROCESSING': { icon: Loader2,      color: 'text-amber-500',   label: 'Đang xử lý' },
  'ERROR':      { icon: AlertCircle,  color: 'text-red-500',     label: 'Lỗi' },
};

const RestorationWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    jobs, activeJobId, setActiveJobId, isProcessing,
    selectedPresetId, setSelectedPresetId,
    handleUpload, handleBatchUpload, handleDrop,
    handleApplyTemplate, runRestoration, retryJob, deleteJob,
    credits, customPrompt, setCustomPrompt,
    activeTab, setActiveTab, history, historyLoading,
    toast, dismissToast,
  } = useRestoration();

  const [isEditorOpen, setIsEditorOpen]   = useState(false);
  const [editorImageUrl, setEditorImageUrl] = useState<string | null>(null);
  const [isUpscaleOpen, setIsUpscaleOpen]   = useState(false);
  const [upscaleImageUrl, setUpscaleImageUrl] = useState<string | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isDragOver, setIsDragOver]         = useState(false);
  const [isLibraryOpen, setIsLibraryOpen]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeJob = jobs.find(j => j.id === activeJobId);
  const canRun = activeJob && (activeJob.status === 'Khởi tạo' || activeJob.status === 'ERROR') && !isProcessing;

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `restored_${activeJobId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenEditor  = (url: string) => { setEditorImageUrl(url); setIsEditorOpen(true); };
  const handleOpenUpscale = (url: string) => { setUpscaleImageUrl(url); setIsUpscaleOpen(true); };

  const onDragOver   = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave  = () => setIsDragOver(false);
  const onDropHandler = (e: React.DragEvent) => { setIsDragOver(false); handleDrop(e); };

  const handleLibrarySelect = (assets: GCSAssetMetadata[]) => {
    if (assets.length === 0) { setIsLibraryOpen(false); return; }
    assets.forEach(asset => handleApplyTemplate(asset.url));
    setIsLibraryOpen(false);
  };

  const displayJobs = activeTab === 'session' ? jobs : history;

  return (
    <div
      className="h-full w-full flex flex-col bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-300 relative"
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDropHandler}
    >
      {/* ─── Sub-workspaces ─── */}
      <ProductImageWorkspace isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} initialImage={editorImageUrl} />
      <AnimatePresence>
        {isUpscaleOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-2xl overflow-hidden"
          >
            <UpscaleWorkspace onClose={() => setIsUpscaleOpen(false)} initialImage={upscaleImageUrl} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Drag Overlay ─── */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-emerald-500/10 backdrop-blur-md flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white dark:bg-[#111] p-12 rounded-3xl border-2 border-dashed border-emerald-500 shadow-2xl text-center space-y-4">
              <Upload size={48} className="text-emerald-500 mx-auto" />
              <p className="text-lg font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Thả ảnh vào đây</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hỗ trợ nhiều ảnh cùng lúc</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Toast Notification ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full px-4"
          >
            <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-2xl ${
              toast.type === 'error'   ? 'bg-red-50/95 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
              : toast.type === 'success' ? 'bg-emerald-50/95 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-blue-50/95 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400'
            }`}>
              {toast.type === 'error'   && <AlertTriangle size={16} className="shrink-0" />}
              {toast.type === 'success' && <CheckCircle2  size={16} className="shrink-0" />}
              {toast.type === 'info'    && <Info          size={16} className="shrink-0" />}
              <p className="text-[11px] font-bold flex-grow">{toast.message}</p>
              <button onClick={dismissToast} className="opacity-50 hover:opacity-100 ml-2 shrink-0"><X size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ MAIN LAYOUT ═══════════════ */}
      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden relative">

        {/* Mobile overlay */}
        <AnimatePresence>
          {isMobileExpanded && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileExpanded(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[140]"
            />
          )}
        </AnimatePresence>

        {/* ═══ LEFT SIDEBAR ═══ */}
        <section className={`
          fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[340px] xl:w-[360px]
          bg-white dark:bg-[#0c0c10] border-t lg:border-t-0 lg:border-r border-slate-200/80 dark:border-white/[0.04]
          flex flex-col z-[150] lg:z-50 transition-all duration-300
          ${isMobileExpanded ? 'h-[92dvh] rounded-t-2xl shadow-2xl' : 'h-14 lg:h-full lg:rounded-none'}
        `}>

          {/* Mobile toggle */}
          <div
            className="lg:hidden flex items-center justify-between px-4 h-14 shrink-0 cursor-pointer"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                <RefreshCw size={11} />
              </div>
              <span className="text-xs font-bold">Restoration</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); runRestoration(); }}
              disabled={!canRun || isProcessing}
              className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                canRun && !isProcessing ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-white/[0.04] text-slate-400'
              }`}
            >
              {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} fill="currentColor" />}
              PHỤC CHẾ
            </button>
          </div>

          {/* Desktop Header */}
          <header className="hidden lg:flex h-14 border-b border-slate-200/80 dark:border-white/[0.04] bg-white/90 dark:bg-[#0c0c10]/90 backdrop-blur-lg items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                <RefreshCw size={12} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-white">Restoration Hub</span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
              <Zap size={10} className="text-emerald-500" fill="currentColor" />
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Miễn phí</span>
            </div>
          </header>

          {/* ─── Sidebar Body ─── */}
          <div className={`flex-grow overflow-y-auto no-scrollbar ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>

            {/* ── AISuggestPanel ── */}
            <div className="border-b border-slate-200/80 dark:border-white/[0.04]">
              <AISuggestPanel
                productSlug="ai-image-restorer"
                productName="AI Image Restoration"
                styles={RESTORATION_STYLES}
                onPromptSelect={(p) => setCustomPrompt(prev => p + (prev ? '\n' + prev : ''))}
                onApply={(cfg) => {
                  if (cfg.prompt) setCustomPrompt(cfg.prompt);
                  if (cfg.mode)  setSelectedPresetId(cfg.mode);
                }}
                historyKey={STORAGE_KEY}
                productContext="AI photo restoration tool: repairs old, damaged, blurry, scratched, or black-and-white photos. Upscales to 4K/8K. Features: face enhancement, colorization, noise removal, scratch repair."
                featuredTemplates={[
                  { label: 'Chân dung cũ',   prompt: 'Restore old black and white portrait photo, enhance face details, remove scratches, upscale to 4K', style: 'portrait' },
                  { label: 'Ảnh cưới xưa',   prompt: 'Restore vintage wedding photo, colorize naturally, remove damage, preserve romantic atmosphere', style: 'wedding' },
                  { label: 'Tô màu gia đình', prompt: 'Colorize black and white family photo from 1960s, natural skin tones, realistic colors', style: 'colorize' },
                ]}
              />
            </div>

            {/* ── Chọn ảnh ── */}
            <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.04] space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon size={13} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Chọn ảnh cần phục chế</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsLibraryOpen(true)}
                  className="py-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl flex flex-col items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:border-emerald-400 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all group"
                >
                  <FolderOpen size={16} className="group-hover:scale-110 transition-transform" />
                  Thư viện Cloud
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-200/60 dark:border-emerald-500/15 rounded-xl flex flex-col items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:border-emerald-400 dark:hover:border-emerald-500/30 transition-all group"
                >
                  <Upload size={16} className="group-hover:scale-110 transition-transform" />
                  Từ máy tính
                </button>
              </div>
              <p className="text-[8px] text-slate-300 dark:text-slate-600 text-center font-medium">Hoặc kéo thả ảnh vào khu vực bên phải</p>
              <input
                type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple
                onChange={(e) => e.target.files && handleBatchUpload(e.target.files)}
              />
            </div>

            {/* ── Chế độ phục chế ── */}
            <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.04]">
              <div className="flex items-center gap-2 mb-3">
                <Target size={13} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Chế độ phục chế</span>
              </div>
              <div className="space-y-1.5">
                {RESTORATION_PRESETS.map((preset, index) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`w-full rounded-xl border transition-all duration-200 text-left p-3 flex items-start gap-3 group ${
                        isSelected
                          ? 'border-emerald-500/30 bg-emerald-500/[0.04] shadow-sm ring-1 ring-emerald-500/15'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:border-slate-100 dark:hover:border-white/[0.06]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[9px] font-black transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-white/[0.06]'
                      }`}>
                        {isSelected ? <CheckCircle2 size={11} /> : String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-grow min-w-0 space-y-0.5">
                        <p className={`text-[10px] font-bold uppercase tracking-tight leading-snug ${
                          isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                        }`}>{preset.label}</p>
                        {isSelected && (
                          <p className="text-[8px] text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-2">
                            {preset.prompt.slice(0, 90)}...
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Hướng dẫn bổ sung ── */}
            <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={13} className="text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Hướng dẫn thêm cho AI</span>
                <span className="text-[8px] font-medium text-slate-300 dark:text-slate-600 ml-auto">Không bắt buộc</span>
              </div>
              <textarea
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                placeholder="VD: Làm rõ khuôn mặt, giữ nguyên nền cũ, tập trung sửa vết xước bên trái..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl py-2.5 px-3 text-[11px] font-medium outline-none focus:border-emerald-500/30 transition-all text-slate-700 dark:text-white/70 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none"
              />
            </div>

            {/* ── Danh sách ảnh / History ── */}
            <div className="p-4">
              <div className="flex items-center gap-1 mb-3 bg-slate-100 dark:bg-white/[0.03] rounded-lg p-1 border border-slate-200 dark:border-white/[0.04]">
                <button
                  onClick={() => setActiveTab('session')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === 'session' ? 'bg-white dark:bg-white/[0.06] text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <Film size={11} /> Phiên hiện tại
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === 'history' ? 'bg-white dark:bg-white/[0.06] text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <Clock4 size={11} /> Lịch sử
                </button>
              </div>

              {activeTab === 'history' && historyLoading && (
                <div className="py-8 flex items-center justify-center gap-2 text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Đang tải...</span>
                </div>
              )}

              <div className="space-y-1.5">
                {displayJobs.map((job) => {
                  const isActive = activeJobId === job.id;
                  const status = statusConfig[job.status] || statusConfig['Khởi tạo'];
                  const StatusIcon = status.icon;
                  return (
                    <div key={job.id} className="relative group/job">
                      <button
                        onClick={() => setActiveJobId(job.id)}
                        className={`w-full rounded-xl border transition-all duration-200 flex items-center gap-3 p-2.5 ${
                          isActive
                            ? 'border-emerald-500/40 bg-emerald-500/[0.04] shadow-sm ring-1 ring-emerald-500/20'
                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:border-slate-100 dark:hover:border-white/[0.06]'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg bg-slate-100 dark:bg-black/40 overflow-hidden shrink-0 border border-slate-200 dark:border-white/[0.06] ${isActive ? 'ring-1 ring-emerald-500/30' : ''}`}>
                          {job.original
                            ? <img src={job.original} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-slate-300" /></div>
                          }
                        </div>
                        <div className="flex flex-col flex-grow text-left overflow-hidden gap-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-700 dark:text-white/80 truncate">Task #{job.id.slice(-4)}</p>
                            <span className="text-[7px] text-slate-300 dark:text-slate-600 font-medium">{job.timestamp}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <StatusIcon size={10} className={`${status.color} ${job.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${status.color}`}>{status.label}</span>
                            {job.progress != null && job.status === 'PROCESSING' && (
                              <span className="text-[8px] font-bold text-amber-500 ml-auto">{job.progress}%</span>
                            )}
                          </div>
                        </div>
                      </button>

                      {activeTab === 'session' && job.status !== 'PROCESSING' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/0 text-transparent group-hover/job:bg-red-50 dark:group-hover/job:bg-red-500/10 group-hover/job:text-red-500 transition-all opacity-0 group-hover/job:opacity-100 hover:!bg-red-500 hover:!text-white z-10"
                          title="Xóa"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}

                {displayJobs.length === 0 && !historyLoading && (
                  <div className="py-8 text-center">
                    <ImageIcon size={24} strokeWidth={1.5} className="mx-auto mb-2 text-slate-200 dark:text-white/10" />
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-300 dark:text-slate-600">
                      {activeTab === 'session' ? 'Chọn ảnh từ thư viện hoặc tải lên để bắt đầu' : 'Chưa có kết quả nào trước đó'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Footer: Generate ─── */}
          <div className={`shrink-0 border-t border-slate-200/80 dark:border-white/[0.04] bg-white/80 dark:bg-[#0c0c10]/80 backdrop-blur-lg px-4 py-3 space-y-2.5 ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <div className="p-3 bg-emerald-50/80 dark:bg-emerald-500/[0.04] border border-emerald-100 dark:border-emerald-500/10 rounded-xl flex items-start gap-2.5">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Hoàn toàn miễn phí</p>
                <p className="text-[8px] text-slate-500 dark:text-slate-500 mt-0.5 leading-relaxed">AI tái tạo chi tiết bị hỏng, ảnh mã hóa đầu-cuối và tự xóa sau 24h.</p>
              </div>
            </div>
            <button
              onClick={runRestoration}
              disabled={!canRun || isProcessing}
              className={`w-full py-3 rounded-xl text-white font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
                canRun && !isProcessing
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-[0.98] shadow-emerald-500/20'
                  : 'bg-slate-200 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
              BẮT ĐẦU PHỤC CHẾ
            </button>
          </div>
        </section>

        {/* ═══ RIGHT VIEWPORT ═══ */}
        <aside className="flex-grow h-full flex flex-col bg-slate-50 dark:bg-[#050508] transition-colors relative">
          <RestorationViewport
            activeJob={activeJob}
            onApplyTemplate={handleApplyTemplate}
            onDownload={handleDownload}
            onEdit={handleOpenEditor}
            onUpscale={handleOpenUpscale}
            onRetry={retryJob}
          />
        </aside>
      </div>

      {/* ─── Modals ─── */}
      <ImageLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} onConfirm={handleLibrarySelect} maxSelect={6} />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default RestorationWorkspace;
