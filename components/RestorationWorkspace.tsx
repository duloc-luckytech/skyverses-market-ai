
import React, { useState } from 'react';
import { X, RefreshCw, Coins, Zap, Loader2 } from 'lucide-react';
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
    credits,
    usagePreference,
    setUsagePreference,
    hasPersonalKey
  } = useRestoration();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImageUrl, setEditorImageUrl] = useState<string | null>(null);
  
  const [isUpscaleOpen, setIsUpscaleOpen] = useState(false);
  const [upscaleImageUrl, setUpscaleImageUrl] = useState<string | null>(null);

  const [showResourceModal, setShowResourceModal] = useState(false);

  const activeJob = jobs.find(j => j.id === activeJobId);
  const RESTORE_COST = 100;

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
    <div className="h-full w-full flex flex-col bg-white dark:bg-[#0b0c10] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500 relative">
      
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
        totalCost={RESTORE_COST} 
      />

      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between shrink-0 z-[120] bg-white dark:bg-[#0d0e12] border-b border-slate-200 dark:border-white/5 transition-colors shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 shadow-inner">
              <RefreshCw size={20} />
           </div>
           <div className="flex flex-col">
              <h2 className="text-sm md:text-base font-black uppercase italic tracking-tighter leading-none">Restoration Hub</h2>
              <p className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-1">Image History Repair Node</p>
           </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-8">
           <ResourceControl 
              usagePreference={usagePreference}
              credits={credits}
              actionCost={RESTORE_COST}
              onSettingsClick={() => setShowResourceModal(true)}
           />

           <button 
             onClick={runRestoration}
             disabled={!canRun}
             className={`px-4 md:px-8 py-2 md:py-3 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2 md:gap-3 ${
               canRun 
               ? 'bg-emerald-600 text-white hover:scale-105 active:scale-95 shadow-emerald-600/20' 
               : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/20 cursor-not-allowed grayscale'
             }`}
           >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
              <span>Phục chế <span className="hidden sm:inline">ngay</span> ({RESTORE_COST} CR)</span>
           </button>
           
           <div className="w-px h-8 bg-black/5 dark:bg-white/5 hidden md:block"></div>
           
           <button onClick={onClose} className="p-1 md:p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-white/5 rounded-full">
              <X size={20} className="md:w-6 md:h-6" />
           </button>
        </div>
      </header>

      <main className="flex-grow flex overflow-hidden">
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
      `}</style>
    </div>
  );
};

export default RestorationWorkspace;
