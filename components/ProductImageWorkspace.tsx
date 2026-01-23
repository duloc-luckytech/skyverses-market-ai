
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wand2, AlertTriangle, Plus, Settings, Coins, Key, Zap, Image as ImageIcon, History as HistoryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useProductImageEditor } from '../hooks/useProductImageEditor';
import { EditorHeader } from './product-image/EditorHeader';
import { EditorViewport } from './product-image/EditorViewport';
import { EditorSidebar } from './product-image/EditorSidebar';
import { ModelAISelector } from './product-image/ModelAISelector';
import ResourceAuthModal from './common/ResourceAuthModal';
import ImageLibraryModal from './ImageLibraryModal';

interface ProductImageWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: string | null;
  onApply?: (editedUrl: string) => void;
}

const RATIO_PRESETS = [
  { label: 'Free', value: 0 },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
];

const ProductImageWorkspace: React.FC<ProductImageWorkspaceProps> = ({ 
  isOpen, onClose, initialImage, onApply
}) => {
  const { theme } = useTheme();
  const e = useProductImageEditor(initialImage, theme);
  const ACTION_COST = e.selectedModel?.cost || 150;
  
  const [isMobileSidebarExpanded, setIsMobileSidebarExpanded] = useState(false);

  if (!isOpen) return null;

  const isGenerateDisabled = e.isGenerating || (!e.isAuthenticated) || (!e.usagePreference) || (!e.prompt.trim());

  const allAssets = [
    ...(e.originalSource ? [{ id: 'original', url: e.originalSource, label: 'Gốc' }] : []),
    ...e.history.map(h => ({ id: h.id, url: h.url, label: 'Edit' }))
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 1.05 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 1.05 }} 
        className="fixed inset-0 z-[700] flex flex-col bg-white dark:bg-[#050b10] text-slate-700 dark:text-slate-300 font-sans overflow-hidden transition-colors duration-500"
      >
        
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {isMobileSidebarExpanded && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileSidebarExpanded(false)} 
              className="lg:hidden fixed inset-0 bg-black/60 z-[115] backdrop-blur-sm" 
            />
          )}
        </AnimatePresence>

        <EditorHeader 
          activeTool={e.activeTool} setActiveTool={e.setActiveTool}
          isCropping={e.isCropping} setIsCropping={e.setIsCropping}
          brushSize={e.brushSize} setBrushSize={e.setBrushSize}
          selectedTextId={e.selectedTextId} deleteSelectedText={e.deleteSelectedText}
          onUpload={() => (window as any).document.getElementById('editor-file-input')?.click()}
          onExport={e.handleExport}
          onClose={onClose}
          credits={e.credits}
          isActionsDisabled={!e.result}
          onAddText={e.addTextLayer}
          onUndo={e.handleUndo}
          onRedo={e.handleRedo}
          canUndo={e.canUndo}
          canRedo={e.canRedo}
        />
        <input id="editor-file-input" type="file" className="hidden" accept="image/*" onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const dataUrl = ev.target?.result as string;
              e.setOriginalSource(dataUrl);
              e.pushToHistory(dataUrl); 
            };
            reader.readAsDataURL(file);
          }
        }} />

        <div className="flex-grow flex overflow-hidden relative">
          {!e.isCropping && (
            <EditorSidebar 
              activeTab={e.activeTab} setActiveTab={e.setActiveTab}
              visibleLayers={e.visibleLayers} setVisibleLayers={e.setVisibleLayers}
              selectedModel={e.selectedModel} setSelectedModel={e.setSelectedModel}
              models={e.availableModels} onSetPrompt={e.setPrompt}
              history={e.history} 
              originalSource={e.originalSource}
              onHistoryClick={(url) => e.setResult(url)}
              isActionsDisabled={!e.result}
              actionCost={ACTION_COST}
              textLayers={e.textLayers}
              selectedTextId={e.selectedTextId}
              updateTextLayer={e.updateTextLayer}
              deleteSelectedText={e.deleteSelectedText}
              isMobileExpanded={isMobileSidebarExpanded}
              setIsMobileExpanded={setIsMobileSidebarExpanded}
            />
          )}

          <div className="flex-grow flex flex-col relative overflow-hidden">
            <EditorViewport 
              result={e.result} zoom={e.zoom} setZoom={e.setZoom}
              panOffset={e.panOffset} setPanOffset={e.setPanOffset}
              activeTool={e.activeTool} isCropping={e.isCropping} setIsCropping={e.setIsCropping}
              cropBox={e.cropBox} setDragStart={e.setDragStart} setResizeHandle={e.setResizeHandle}
              applyCrop={e.applyCrop} cropRatio={e.cropRatio} handleRatioSelect={e.handleRatioSelect}
              ratioPresets={RATIO_PRESETS} textLayers={e.textLayers} handleTextMouseDown={e.handleTextMouseDown}
              selectedTextId={e.selectedTextId} visibleLayers={e.visibleLayers}
              canvasRef={e.canvasRef} imageRef={e.imageRef} containerRef={e.containerRef}
              onMouseDown={e.handleMouseDownViewport}
              onUploadClick={() => (window as any).document.getElementById('editor-file-input')?.click()}
              isGenerating={e.isGenerating}
              updateTextLayer={e.updateTextLayer}
              onDrop={e.handleDrop}
            />

            {!e.isCropping && (
              <div className="absolute bottom-20 lg:bottom-10 left-0 right-16 md:right-24 px-4 md:px-6 z-40 transition-all">
                <div className="relative mx-auto flex items-center bg-white/95 dark:bg-[#0d151c]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] h-14 md:h-20 px-2 md:px-4 shadow-[0_32px_64px_rgba(0,0,0,0.15)] group focus-within:border-brand-blue/50 transition-all overflow-hidden max-w-4xl">
                    <div className="flex items-center gap-1 md:gap-2 pl-2 md:pl-4 pr-1.5 border-r border-slate-200 dark:border-white/5 mr-1.5 md:mr-3 shrink-0">
                      {e.references.slice(0, 1).map((ref, idx) => (
                        <div key={idx} className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden border border-black/10">
                          <img src={ref} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <button onClick={() => e.setIsLibraryOpen(true)} className="w-8 h-8 md:w-10 md:h-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center text-slate-300 hover:border-brand-blue transition-all"><Plus size={16} /></button>
                    </div>

                    <input 
                      value={e.prompt} 
                      onChange={(ev) => e.setPrompt(ev.target.value)} 
                      onKeyDown={(ev) => ev.key === 'Enter' && e.handleGenerate()} 
                      className="flex-grow bg-transparent border-none outline-none text-[11px] md:text-sm font-bold text-slate-800 dark:text-white px-2 placeholder:text-slate-400 dark:placeholder:text-slate-600 truncate" 
                      placeholder="Mô tả sự thay đổi..." 
                    />

                    <div className="flex items-center gap-1.5 md:gap-4 pl-1.5 md:pl-4 border-l border-slate-200 dark:border-white/5 shrink-0 ml-1 md:ml-2">
                        <div className="hidden sm:block">
                          <ModelAISelector 
                            selectedModel={e.selectedModel}
                            models={e.availableModels}
                            onSelect={e.setSelectedModel}
                            variant="compact"
                          />
                        </div>

                        <div className="hidden lg:flex flex-col items-end border-l border-slate-100 dark:border-white/5 pl-2 md:pl-4">
                           <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[6px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest leading-none">
                                Balance
                              </span>
                              <div className="flex items-center gap-0.5 text-[6px] font-black text-orange-500 italic">
                                 <Zap size={6} fill="currentColor" />
                                 <span>{ACTION_COST} CR</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-1.5 md:gap-2">
                              <span className={`text-[10px] md:text-xs font-black italic leading-none tracking-tight ${e.usagePreference === 'key' ? 'text-purple-500' : 'text-brand-blue'}`}>
                                 {e.usagePreference === 'key' ? 'U.LTD' : `${e.credits.toLocaleString()}`}
                              </span>
                              <button 
                                onClick={() => e.setShowResourceModal(true)}
                                className="p-1 bg-slate-100 dark:bg-white/5 rounded-md hover:text-brand-blue transition-colors"
                                title="Change Resource Node"
                              >
                                 <Settings size={12} />
                              </button>
                           </div>
                        </div>

                        <button 
                          onClick={() => e.handleGenerate()} 
                          disabled={isGenerateDisabled} 
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 group/btn overflow-hidden relative shrink-0 ${isGenerateDisabled ? 'bg-slate-100 dark:bg-[#1a1a1e] text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'bg-brand-blue text-white hover:scale-105'}`}
                        >
                          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:btn:translate-x-full transition-transform duration-700"></div>
                          {e.isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                        </button>
                    </div>
                </div>
              </div>
            )}

            {/* Vertical Asset List - Always Right Side */}
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-20 lg:w-24 bg-white/40 dark:bg-[#050b10]/40 backdrop-blur-xl border-l border-black/5 dark:border-white/5 z-50 flex flex-col items-center py-6 gap-3 md:gap-4 overflow-y-auto no-scrollbar">
                <div className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest flex flex-col items-center gap-1 mb-2 text-center shrink-0">
                  <HistoryIcon size={12} /> Tệp tin
                </div>
                {allAssets.map((asset) => (
                  <button 
                    key={asset.id} 
                    onClick={() => e.setResult(asset.url)}
                    className={`relative w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all shrink-0 hover:scale-105 ${e.result === asset.url ? 'border-brand-blue shadow-lg' : 'border-black/5 dark:border-white/10 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={asset.url} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5">
                       <span className="text-[5px] md:text-[6px] font-black text-white uppercase text-center block tracking-tighter">{asset.label}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        <ImageLibraryModal 
          isOpen={e.isLibraryOpen} 
          onClose={() => e.setIsLibraryOpen(false)} 
          onConfirm={(assets) => e.setReferences(assets.map(a => a.url))}
          maxSelect={6}
        />
        
        <ResourceAuthModal 
          isOpen={e.showResourceModal} 
          onClose={() => e.setShowResourceModal(false)} 
          onConfirm={(pref) => {
            e.setUsagePreference(pref);
            localStorage.setItem('skyverses_usage_preference', pref);
            e.setShowResourceModal(false);
            if (e.isResumingGenerate) { e.setIsResumingGenerate(false); e.handleGenerate(); }
          }} 
          hasPersonalKey={e.hasPersonalKey} 
          totalCost={ACTION_COST} 
        />

        <AnimatePresence>
          {e.showLowCreditAlert && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
               <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-[#111114] p-12 border border-slate-200 dark:border-white/10 rounded-[2rem] text-center space-y-8 shadow-3xl transition-colors">
                  <div className="w-24 h-24 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto text-orange-500 shadow-xl dark:shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                     <AlertTriangle size={48} />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Hạn ngạch cạn kiệt</h3>
                     <p className="text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight">Số dư của bạn hiện không đủ để khởi chạy tác vụ này.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                     <Link to="/credits" className="bg-brand-blue text-white py-5 rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:scale-105 transition-all text-center">Nạp thêm Credits</Link>
                     <button onClick={() => e.setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 hover:text-brand-blue transition-colors tracking-widest italic underline underline-offset-8 decoration-white/20">Bỏ qua</button>
                  </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductImageWorkspace;
