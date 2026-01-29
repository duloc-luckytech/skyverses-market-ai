import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageLibraryModal from './ImageLibraryModal';
import ResourceAuthModal from './common/ResourceAuthModal';
import ProductImageWorkspace from './ProductImageWorkspace';
import { GeneratorSidebar } from './image-generator/GeneratorSidebar';
import { GeneratorViewport } from './image-generator/GeneratorViewport';
import { useImageGenerator } from '../hooks/useImageGenerator';

const AIImageGeneratorWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const g = useImageGenerator();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-[#fcfcfd] dark:bg-[#0c0c0e] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500 relative">
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileExpanded && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsMobileExpanded(false)} 
            className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm" 
          />
        )}
      </AnimatePresence>

      {/* Cột 1: Sidebar Điều khiển (Trái) */}
      <GeneratorSidebar 
        onClose={onClose}
        activeMode={g.activeMode}
        setActiveMode={g.setActiveMode}
        usagePreference={g.usagePreference}
        setShowResourceModal={g.setShowResourceModal}
        totalCost={g.totalCost}
        references={g.references}
        setReferences={g.setReferences}
        setIsLibraryOpen={g.setIsLibraryOpen}
        prompt={g.prompt}
        setPrompt={g.setPrompt}
        quantity={g.quantity}
        setQuantity={g.setQuantity}
        isBulkImporting={g.isBulkImporting}
        setIsBulkImporting={g.setIsBulkImporting}
        bulkText={g.bulkText}
        setBulkText={g.setBulkText}
        handleBulkImport={() => {
          if (!g.bulkText.trim()) { g.setIsBulkImporting(false); return; }
          const lines = g.bulkText.split('\n').map(l => l.trim()).filter(l => l !== '');
          g.setBatchPrompts(lines);
          g.setIsBulkImporting(false);
        }}
        batchPrompts={g.batchPrompts}
        setBatchPrompts={g.setBatchPrompts}
        availableModels={g.availableModels}
        selectedModel={g.selectedModel}
        setSelectedModel={g.setSelectedModel}
        selectedRatio={g.selectedRatio}
        setSelectedRatio={g.setSelectedRatio}
        selectedRes={g.selectedRes}
        setSelectedRes={g.setSelectedRes}
        isGenerating={g.isGenerating}
        handleLocalFileUpload={g.handleLocalFileUpload}
        handleGenerate={g.handleGenerate}
        generateTooltip={g.generateTooltip}
        isGenerateDisabled={g.isGenerateDisabled}
        isMobileExpanded={isMobileExpanded}
        setIsMobileExpanded={setIsMobileExpanded}
        selectedMode={g.selectedMode}
        setSelectedMode={g.setSelectedMode}
        selectedEngine={g.selectedEngine}
        setSelectedEngine={g.setSelectedEngine}
      />

      {/* Cột 2: Viewport Hiển thị (Giữa) */}
      <GeneratorViewport 
        onClose={onClose}
        activePreviewUrl={g.activePreviewUrl}
        setActivePreviewUrl={g.setActivePreviewUrl}
        zoomLevel={g.zoomLevel}
        setZoomLevel={g.setZoomLevel}
        onApplyExample={(item) => {
          g.setPrompt(item.prompt);
          if (window.innerWidth < 1024) setIsMobileExpanded(true);
        }}
        onEdit={g.openEditor}
        onDownload={g.triggerDownload}
        results={g.results}
        selectedIds={g.selectedIds}
        toggleSelect={g.toggleSelect}
        deleteResult={g.deleteResult}
      />

      <ImageLibraryModal 
        isOpen={g.isLibraryOpen} 
        onClose={() => g.setIsLibraryOpen(false)} 
        onConfirm={g.handleLibrarySelect}
        maxSelect={6}
      />
      
      <ResourceAuthModal 
        isOpen={g.showResourceModal} 
        onClose={() => g.setShowResourceModal(false)} 
        onConfirm={(pref) => {
          g.setUsagePreference(pref);
          localStorage.setItem('skyverses_usage_preference', pref);
          g.setShowResourceModal(false);
          if (g.isResumingGenerate) { g.setIsResumingGenerate(false); g.handleGenerate(); }
        }} 
        hasPersonalKey={g.hasPersonalKey} 
        totalCost={g.totalCost} 
      />

      <AnimatePresence>
        {g.showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-[#111114] p-12 border border-slate-200 dark:border-white/10 rounded-[2rem] text-center space-y-8 shadow-3xl transition-colors">
                <div className="w-24 h-24 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto text-orange-500 shadow-xl dark:shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                   <AlertTriangle size={48} />
                </div>
                <div className="space-y-4">
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Hạn ngạch cạn kiệt</h3>
                   <p className="text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight">Image synthesis requires ít nhất **150 credits** per generation. <br />Your current node balance is too low.</p>
                </div>
                <div className="flex flex-col gap-4">
                   <Link to="/credits" className="bg-brand-blue text-white py-5 rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:scale-105 transition-all text-center">Nạp thêm Credits</Link>
                   <button onClick={() => g.setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors tracking-widest italic underline underline-offset-8 decoration-white/20">Bỏ qua</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductImageWorkspace 
        isOpen={g.isEditorOpen} 
        onClose={() => g.setIsEditorOpen(false)} 
        initialImage={g.editorImage}
        onApply={g.handleEditorApply}
      />
    </div>
  );
};

export default AIImageGeneratorWorkspace;
