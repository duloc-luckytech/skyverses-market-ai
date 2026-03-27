
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Loader2, Download, ChevronLeft, RefreshCw, Plus,
  CheckCircle2, AlertCircle, Clock, ImageIcon, Target, ShieldCheck,
  AlertTriangle, Info, Coins, Upload
} from 'lucide-react';
import { useRestoration, RESTORATION_PRESETS, RestoreJob } from '../hooks/useRestoration';
import { RestorationViewport } from './restoration/RestorationViewport';
import ProductImageWorkspace from './ProductImageWorkspace';
import UpscaleWorkspace from './UpscaleWorkspace';
import ResourceAuthModal from './common/ResourceAuthModal';
import { MobileGeneratorBar } from './common/MobileGeneratorBar';

/* ─── Status config ─── */
const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  'DONE': { icon: CheckCircle2, color: 'text-emerald-500', label: 'Hoàn tất' },
  'Khởi tạo': { icon: Clock, color: 'text-blue-500', label: 'Sẵn sàng' },
  'PROCESSING': { icon: Loader2, color: 'text-amber-500', label: 'Đang xử lý' },
  'ERROR': { icon: AlertCircle, color: 'text-red-500', label: 'Lỗi' },
};

const RestorationWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    jobs, activeJobId, setActiveJobId, isProcessing,
    selectedPresetId, setSelectedPresetId,
    handleUpload, handleApplyTemplate, runRestoration, retryJob, deleteJob,
    credits, restoreCost,
    usagePreference, setUsagePreference, hasPersonalKey,
    toast, dismissToast,
  } = useRestoration();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImageUrl, setEditorImageUrl] = useState<string | null>(null);
  const [isUpscaleOpen, setIsUpscaleOpen] = useState(false);
  const [upscaleImageUrl, setUpscaleImageUrl] = useState<string | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
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

  const handleOpenEditor = (url: string) => { setEditorImageUrl(url); setIsEditorOpen(true); };
  const handleOpenUpscale = (url: string) => { setUpscaleImageUrl(url); setIsUpscaleOpen(true); };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-300 relative">

      {/* ─── Sub-workspaces ─── */}
      <ProductImageWorkspace isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} initialImage={editorImageUrl} />
      <AnimatePresence>
        {isUpscaleOpen && (
          <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-2xl overflow-hidden">
            <UpscaleWorkspace onClose={() => setIsUpscaleOpen(false)} initialImage={upscaleImageUrl} />
          </motion.div>
        )}
      </AnimatePresence>
      <ResourceAuthModal isOpen={showResourceModal} onClose={() => setShowResourceModal(false)}
        onConfirm={(pref) => { setUsagePreference(pref); localStorage.setItem('skyverses_usage_preference', pref); setShowResourceModal(false); }}
        hasPersonalKey={hasPersonalKey} totalCost={restoreCost} />

      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full px-4">
            <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-2xl ${
              toast.type === 'error' ? 'bg-red-50/95 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
              : toast.type === 'success' ? 'bg-emerald-50/95 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-blue-50/95 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400'
            }`}>
              {toast.type === 'error' && <AlertTriangle size={16} className="shrink-0" />}
              {toast.type === 'success' && <CheckCircle2 size={16} className="shrink-0" />}
              {toast.type === 'info' && <Info size={16} className="shrink-0" />}
              <p className="text-[11px] font-bold flex-grow">{toast.message}</p>
              <button onClick={dismissToast} className="opacity-50 hover:opacity-100 ml-2 shrink-0"><X size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ MAIN 2-COLUMN LAYOUT ═══════════════ */}
      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden relative">

        {/* Mobile overlay */}
        <AnimatePresence>
          {isMobileExpanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileExpanded(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[140]" />
          )}
        </AnimatePresence>

        {/* ═══ LEFT SIDEBAR ═══ */}
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
            prompt=""
            setPrompt={() => {}}
            credits={credits}
            totalCost={restoreCost}
            isGenerating={isProcessing}
            isGenerateDisabled={!canRun || isProcessing}
            onGenerate={() => runRestoration()}
            onOpenLibrary={() => fileInputRef.current?.click()}
            generateLabel="PHỤC CHẾ"
            type="image"
            tooltip={!canRun ? 'Chọn ảnh và kịch bản trước' : undefined}
          />

          {/* Desktop Header */}
          <header className="hidden lg:flex h-14 border-b border-slate-200/80 dark:border-white/[0.04] bg-white/90 dark:bg-[#0c0c10]/90 backdrop-blur-lg items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <ChevronLeft size={18} />
              </button>
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                <RefreshCw size={12} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-white">Restoration Hub</span>
            </div>
          </header>

          {/* ─── Sidebar Scrollable Body ─── */}
          <div className={`flex-grow overflow-y-auto no-scrollbar ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>

            {/* Upload Section */}
            <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.04]">
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-200/60 dark:border-emerald-500/15 rounded-xl flex items-center justify-center gap-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:border-emerald-400 dark:hover:border-emerald-500/30 transition-all group shadow-sm hover:shadow-md hover:shadow-emerald-500/5">
                <Upload size={14} className="group-hover:scale-110 transition-transform" />
                Tải ảnh mới
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </div>

            {/* Preset Selection */}
            <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.04]">
              <div className="flex items-center gap-2 mb-3">
                <Target size={13} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kịch bản phục chế</span>
              </div>
              <div className="space-y-1.5">
                {RESTORATION_PRESETS.map((preset, index) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button key={preset.id} onClick={() => setSelectedPresetId(preset.id)}
                      className={`w-full rounded-xl border transition-all duration-200 text-left p-3 flex items-start gap-3 group ${
                        isSelected
                          ? 'border-emerald-500/30 bg-emerald-500/[0.04] shadow-sm ring-1 ring-emerald-500/15'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:border-slate-100 dark:hover:border-white/[0.06]'
                      }`}>
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

            {/* Job Queue */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={13} className="text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Hàng đợi</span>
                </div>
                {jobs.length > 0 && (
                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{jobs.length}</span>
                )}
              </div>

              <div className="space-y-1.5">
                {jobs.map((job) => {
                  const isActive = activeJobId === job.id;
                  const status = statusConfig[job.status] || statusConfig['Khởi tạo'];
                  const StatusIcon = status.icon;
                  return (
                    <button key={job.id} onClick={() => setActiveJobId(job.id)}
                      className={`w-full rounded-xl border transition-all duration-200 flex items-center gap-3 p-2.5 group ${
                        isActive
                          ? 'border-emerald-500/40 bg-emerald-500/[0.04] shadow-sm ring-1 ring-emerald-500/20'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:border-slate-100 dark:hover:border-white/[0.06]'
                      }`}>
                      <div className={`w-12 h-12 rounded-lg bg-slate-100 dark:bg-black/40 overflow-hidden shrink-0 border border-slate-200 dark:border-white/[0.06] ${isActive ? 'ring-1 ring-emerald-500/30' : ''}`}>
                        {job.original ? <img src={job.original} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-slate-300" /></div>}
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
                  );
                })}
                {jobs.length === 0 && (
                  <div className="py-8 text-center">
                    <ImageIcon size={24} strokeWidth={1.5} className="mx-auto mb-2 text-slate-200 dark:text-white/10" />
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-300 dark:text-slate-600">Chưa có ảnh nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Footer: Credits + Generate ─── */}
          <div className={`shrink-0 border-t border-slate-200/80 dark:border-white/[0.04] bg-white/80 dark:bg-[#0c0c10]/80 backdrop-blur-lg px-4 py-3 space-y-2.5 ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            {/* Info Card */}
            <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-500/[0.04] border border-emerald-100 dark:border-emerald-500/10 rounded-xl flex items-start gap-2.5">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Neural Audit</p>
                <p className="text-[8px] text-slate-500 dark:text-slate-500 mt-0.5 leading-relaxed">Giữ cấu trúc nguyên bản, chỉ tái tạo pixel bị tổn thương. Bảo mật VPC.</p>
              </div>
            </div>

            {/* Credits row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins size={9} className="text-emerald-500" />
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{credits.toLocaleString()} CR</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500/80">
                <Zap size={9} fill="currentColor" />
                <span className="text-[10px] font-semibold">{restoreCost}</span>
              </div>
            </div>

            {/* Generate Button */}
            <button onClick={runRestoration} disabled={!canRun || isProcessing}
              className={`w-full py-3 rounded-xl text-white font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
                canRun && !isProcessing
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-[0.98] shadow-emerald-500/20'
                  : 'bg-slate-200 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}>
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
              PHỤC CHẾ
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

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 0; width: 0; }
      `}</style>
    </div>
  );
};

export default RestorationWorkspace;
