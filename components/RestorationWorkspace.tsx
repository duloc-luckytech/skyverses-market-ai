
import React, { useState } from 'react';
import { X, RefreshCw, Coins, Zap, Loader2 } from 'lucide-react';
import { useRestoration } from '../hooks/useRestoration';
import { RestorationSidebar } from './restoration/RestorationSidebar';
import { RestorationViewport } from './restoration/RestorationViewport';
import { RestorationControls } from './restoration/RestorationControls';
import ProductImageWorkspace from './ProductImageWorkspace';
import UpscaleWorkspace from './UpscaleWorkspace';
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
    credits
  } = useRestoration();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImageUrl, setEditorImageUrl] = useState<string | null>(null);
  
  const [isUpscaleOpen, setIsUpscaleOpen] = useState(false);
  const [upscaleImageUrl, setUpscaleImageUrl] = useState<string | null>(null);

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

  // Nút Phục chế chỉ enabled khi có job đang active và trạng thái là Khởi tạo hoặc Lỗi
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

      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between shrink-0 z-[120] bg-white dark:bg-[#0b0c10] border-b border-slate-100 dark:border-white/5 transition-colors">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600">
              <RefreshCw size={20} />
           </div>
           <div className="flex flex-col">
              <h2 className="text-sm font-black uppercase italic tracking-tight">Restoration Studio</h2>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500">Industrial_Core_v7</p>
           </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-8">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full">
              <Coins size={12} className="text-yellow-500" />
              <span className="text-[10px] font-black">{(credits || 0).toLocaleString()} CR</span>
           </div>
           <button 
             onClick={runRestoration}
             disabled={!canRun}
             className={`px-8 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest transition-all shadow-xl ${canRun ? 'bg-emerald-600 text-white hover:scale-105 active:scale-95 cursor-pointer' : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/20 cursor-not-allowed grayscale'}`}
           >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
              <span className="ml-2">Phục chế ngay (100)</span>
           </button>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <X size={24} />
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
      `}</style>
    </div>
  );
};

export default RestorationWorkspace;
