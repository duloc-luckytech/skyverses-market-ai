
import React, { useState } from 'react';
import { X, RefreshCw, Coins, Zap, Loader2, Sparkles, Shield, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useRestoration } from '../hooks/useRestoration';
import { RestorationSidebar } from './restoration/RestorationSidebar';
import { RestorationViewport } from './restoration/RestorationViewport';
import { RestorationControls } from './restoration/RestorationControls';
import ProductImageWorkspace from './ProductImageWorkspace';
import UpscaleWorkspace from './UpscaleWorkspace';
import ResourceAuthModal from './common/ResourceAuthModal';
import { ResourceControl } from './fashion-studio/ResourceControl';
import { AnimatePresence, motion } from 'framer-motion';

const RestorationWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    jobs,
    activeJobId,
    setActiveJobId,
    isProcessing,
    selectedPresetId,
    setSelectedPresetId,
    handleUpload,
    handleApplyTemplate,
    runRestoration,
    retryJob,
    credits,
    restoreCost,
    usagePreference,
    setUsagePreference,
    hasPersonalKey,
    toast,
    dismissToast,
  } = useRestoration();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImageUrl, setEditorImageUrl] = useState<string | null>(null);
  
  const [isUpscaleOpen, setIsUpscaleOpen] = useState(false);
  const [upscaleImageUrl, setUpscaleImageUrl] = useState<string | null>(null);

  const [showResourceModal, setShowResourceModal] = useState(false);

  const activeJob = jobs.find(j => j.id === activeJobId);

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `restored_${activeJobId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenEditor = (url: string) => {
    setEditorImageUrl(url);
    setIsEditorOpen(true);
  };

  const handleOpenUpscale = (url: string) => {
    setUpscaleImageUrl(url);
    setIsUpscaleOpen(true);
  };

  const canRun = activeJob && (activeJob.status === 'Khởi tạo' || activeJob.status === 'ERROR') && !isProcessing;

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-[#08090d] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500 relative">
      
      <ProductImageWorkspace 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        initialImage={editorImageUrl} 
      />

      <AnimatePresence>
        {isUpscaleOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-2xl overflow-hidden"
          >
            <UpscaleWorkspace 
              onClose={() => setIsUpscaleOpen(false)} 
              initialImage={upscaleImageUrl}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ResourceAuthModal 
        isOpen={showResourceModal} 
        onClose={() => setShowResourceModal(false)} 
        onConfirm={(pref) => {
          setUsagePreference(pref);
          localStorage.setItem('skyverses_usage_preference', pref);
          setShowResourceModal(false);
        }} 
        hasPersonalKey={hasPersonalKey} 
        totalCost={restoreCost} 
      />

      {/* ═══════════════ #2 TOAST NOTIFICATION ═══════════════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full px-4"
          >
            <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-2xl ${
              toast.type === 'error'
                ? 'bg-red-50/95 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                : toast.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                : 'bg-blue-50/95 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400'
            }`}>
              {toast.type === 'error' && <AlertTriangle size={16} className="shrink-0" />}
              {toast.type === 'success' && <CheckCircle2 size={16} className="shrink-0" />}
              {toast.type === 'info' && <Info size={16} className="shrink-0" />}
              <p className="text-[11px] font-bold flex-grow">{toast.message}</p>
              <button onClick={dismissToast} className="text-current/50 hover:text-current ml-2 shrink-0">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ PREMIUM HEADER ═══════════════ */}
      <header className="h-16 md:h-[72px] px-4 md:px-6 flex items-center justify-between shrink-0 z-[120] bg-white/80 dark:bg-[#0b0c10]/80 backdrop-blur-2xl border-b border-slate-100 dark:border-white/[0.04] transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <RefreshCw size={18} strokeWidth={2.5} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-[#0b0c10] animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm md:text-[15px] font-black uppercase italic tracking-tight leading-none text-slate-900 dark:text-white">Restoration Hub</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">Neural Vision Core • Online</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          <ResourceControl 
            usagePreference={usagePreference}
            credits={credits}
            actionCost={restoreCost}
            onSettingsClick={() => setShowResourceModal(true)}
          />

          {/* Run Button */}
          <button 
            onClick={runRestoration}
            disabled={!canRun}
            className={`relative px-5 md:px-8 py-2.5 md:py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 md:gap-3 overflow-hidden ${
              canRun 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-emerald-600/25' 
              : 'bg-slate-100 dark:bg-white/[0.04] text-slate-300 dark:text-white/20 cursor-not-allowed'
            }`}
          >
            {canRun && <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></span>}
            {isProcessing ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} fill="currentColor" />}
            <span>Phục chế <span className="hidden sm:inline">ngay</span> ({restoreCost} CR)</span>
          </button>
          
          <div className="w-px h-8 bg-slate-100 dark:bg-white/[0.04] hidden md:block"></div>
          
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all bg-slate-50 dark:bg-white/[0.04] hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl border border-slate-100 dark:border-white/[0.06]"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* ═══════════════ MAIN WORKSPACE ═══════════════ */}
      <main className="flex-grow flex overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/[0.02] dark:bg-emerald-500/[0.03] rounded-full blur-[150px]"></div>
        </div>

        <RestorationSidebar 
          jobs={jobs} 
          activeJobId={activeJobId} 
          onSelect={setActiveJobId} 
          onUpload={handleUpload} 
        />
        <RestorationViewport 
          activeJob={activeJob} 
          onApplyTemplate={handleApplyTemplate} 
          onDownload={handleDownload}
          onEdit={handleOpenEditor}
          onUpscale={handleOpenUpscale}
          onRetry={retryJob}
        />
        <RestorationControls 
          selectedPresetId={selectedPresetId} 
          onPresetChange={setSelectedPresetId} 
          activeJob={activeJob}
          onDownload={handleDownload}
          onEdit={handleOpenEditor}
        />
      </main>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 0;
          width: 0;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}
      </style>
    </div>
  );
};

export default RestorationWorkspace;
