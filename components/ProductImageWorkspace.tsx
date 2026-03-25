import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wand2, AlertTriangle, ImagePlus, Settings2, Coins, Zap, Layers, Send } from 'lucide-react';
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
  const ACTION_COST = e.selectedModelCost;
  
  const [isMobileSidebarExpanded, setIsMobileSidebarExpanded] = useState(false);

  if (!isOpen) return null;

  const isGenerateDisabled = e.isGenerating || (!e.isAuthenticated) || (!e.usagePreference) || (!e.prompt.trim());

  const allAssets = [
    ...(e.originalSource ? [{ id: 'original', url: e.originalSource, label: 'Original' }] : []),
    ...e.history.map((h, i) => ({ id: h.id, url: h.url, label: `v${i + 1}` }))
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 10 }} 
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[700] flex flex-col bg-white dark:bg-[#0b0c10] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500"
      >
        
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {isMobileSidebarExpanded && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileSidebarExpanded(false)} 
              className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm" 
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

        {/* ═══ MAIN WORKSPACE AREA ═══ */}
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
              selectedEngine={e.selectedEngine}
              onSelectEngine={e.setSelectedEngine}
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

            {/* ═══ PROMPT BAR ═══ */}
            {!e.isCropping && (
              <div className="absolute bottom-20 lg:bottom-6 left-0 right-16 md:right-24 px-4 md:px-6 z-40 transition-all">
                <div className="relative mx-auto flex items-center bg-white/95 dark:bg-[#14151a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.06] rounded-2xl h-14 md:h-16 px-2 md:px-4 shadow-[0_8px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] focus-within:border-brand-blue/40 transition-all overflow-hidden max-w-4xl">
                    {/* Ảnh tham chiếu */}
                    <div className="flex items-center gap-1 md:gap-2 pl-2 md:pl-3 pr-1.5 border-r border-slate-100 dark:border-white/5 mr-1.5 md:mr-3 shrink-0">
                      {e.references.slice(0, 1).map((ref, idx) => (
                        <div key={idx} className="relative w-8 h-8 md:w-9 md:h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
                          <img src={ref} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <button onClick={() => e.setIsLibraryOpen(true)} className="w-8 h-8 md:w-9 md:h-9 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center text-slate-300 dark:text-white/20 hover:border-brand-blue hover:text-brand-blue transition-all" title="Thêm ảnh tham chiếu"><ImagePlus size={14} /></button>
                    </div>

                    {/* Prompt input */}
                    <input 
                      value={e.prompt} 
                      onChange={(ev) => e.setPrompt(ev.target.value)} 
                      onKeyDown={(ev) => ev.key === 'Enter' && e.handleGenerate()} 
                      className="flex-grow bg-transparent border-none outline-none text-[11px] md:text-sm font-bold text-slate-800 dark:text-white px-2 placeholder:text-slate-300 dark:placeholder:text-slate-600 truncate" 
                      placeholder="VD: Xóa nền, thêm ánh sáng vàng, làm mịn da..." 
                    />

                    {/* Right actions */}
                    <div className="flex items-center gap-1.5 md:gap-3 pl-1.5 md:pl-3 border-l border-slate-100 dark:border-white/5 shrink-0 ml-1 md:ml-2">
                        <div className="hidden sm:block">
                          <ModelAISelector 
                            selectedModel={e.selectedModel}
                            models={e.availableModels}
                            onSelect={e.setSelectedModel}
                            selectedEngine={e.selectedEngine}
                            onSelectEngine={e.setSelectedEngine}
                            variant="compact"
                          />
                        </div>

                        {/* Số dư & Chi phí */}
                        <div className="hidden lg:flex items-center gap-2 border-l border-slate-100 dark:border-white/5 pl-3">
                           <div className="flex flex-col items-end gap-0.5">
                              <div className="flex items-center gap-1">
                                <Coins size={9} className="text-amber-500" />
                                <span className={`text-[10px] font-black leading-none tracking-tight ${e.usagePreference === 'key' ? 'text-purple-500' : 'text-slate-700 dark:text-white'}`}>
                                   {e.usagePreference === 'key' ? 'Unlimited' : `${e.credits.toLocaleString()}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-0.5 text-[8px] font-bold text-orange-500">
                                 <Zap size={8} fill="currentColor" />
                                 <span>−{ACTION_COST} / lượt</span>
                              </div>
                           </div>
                           <button 
                             onClick={() => e.setShowResourceModal(true)}
                             className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg hover:text-brand-blue transition-colors text-slate-400"
                             title="Đổi nguồn xử lý"
                           >
                              <Settings2 size={12} />
                           </button>
                        </div>

                        {/* Nút tạo ảnh */}
                        <button 
                          onClick={() => e.handleGenerate()} 
                          disabled={isGenerateDisabled} 
                          className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95 shrink-0 ${isGenerateDisabled ? 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/20 cursor-not-allowed' : 'bg-brand-blue text-white hover:scale-105 hover:shadow-brand-blue/30'}`}
                          title="Chạy AI chỉnh sửa"
                        >
                          {e.isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
              </div>
            )}

            {/* ═══ ASSET RAIL (Right) ═══ */}
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-20 lg:w-24 bg-white/60 dark:bg-[#0b0c10]/60 backdrop-blur-xl border-l border-slate-100 dark:border-white/5 z-50 flex flex-col items-center py-4 gap-2 md:gap-3 overflow-y-auto no-scrollbar">
                <div className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 dark:text-white/30 tracking-widest flex flex-col items-center gap-1 mb-1 text-center shrink-0">
                  <Layers size={12} /> Phiên bản
                </div>
                {allAssets.map((asset) => (
                  <button 
                    key={asset.id} 
                    onClick={() => e.setResult(asset.url)}
                    className={`relative w-11 h-11 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 hover:scale-105 ${e.result === asset.url ? 'border-brand-blue shadow-lg shadow-brand-blue/20' : 'border-slate-200 dark:border-white/10 opacity-50 hover:opacity-100'}`}
                  >
                    <img src={asset.url} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent py-0.5">
                       <span className="text-[5px] md:text-[6px] font-black text-white uppercase text-center block tracking-tighter">{asset.label}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* ═══ MODALS ═══ */}
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

        {/* ═══ LOW CREDIT ALERT ═══ */}
        <AnimatePresence>
          {e.showLowCreditAlert && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
               <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-sm w-full bg-white dark:bg-[#14151a] p-8 md:p-10 border border-slate-200 dark:border-white/[0.06] rounded-2xl text-center space-y-6 shadow-2xl transition-colors">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
                     <Coins size={32} className="md:w-10 md:h-10" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Không đủ Credits</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Mỗi lượt chỉnh sửa tốn <strong className="text-orange-500">{ACTION_COST} CR</strong>. Nạp thêm để tiếp tục sử dụng AI Editor.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                     <Link to="/credits" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all text-center">Nạp Credits ngay</Link>
                     <button onClick={() => e.setShowLowCreditAlert(false)} className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Để sau</button>
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