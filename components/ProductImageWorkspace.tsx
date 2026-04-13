import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Coins, Layers, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useProductImageEditor } from '../hooks/useProductImageEditor';
import { EditorHeader } from './product-image/EditorHeader';
import { EditorViewport } from './product-image/EditorViewport';
import { EditorSidebar } from './product-image/EditorSidebar';
import { PromptBar } from './product-image/PromptBar';
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

  const isDrawMode = e.activeTool === 'pen' || e.activeTool === 'eraser';
  const handlePromptAction = isDrawMode ? e.applyDraw : e.handleGenerate;
  const isGenerateDisabled = isDrawMode
    ? (e.isGenerating || !e.result || !e.prompt.trim())
    : e.isGenerateDisabled;

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

        {/* Mobile Sidebar Backdrop */}
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

        {/* Header */}
        <EditorHeader
          activeTool={e.activeTool}
          setActiveTool={e.setActiveTool}
          isCropping={e.isCropping}
          setIsCropping={e.setIsCropping}
          brushSize={e.brushSize}
          setBrushSize={e.setBrushSize}
          selectedTextId={e.selectedTextId}
          deleteSelectedText={e.deleteSelectedText}
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

        {/* Hidden file input */}
        <input
          id="editor-file-input"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(event) => {
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
          }}
        />

        {/* Main Workspace */}
        <div className="flex-grow flex overflow-hidden relative">
          {/* Left Sidebar */}
          {!e.isCropping && (
            <EditorSidebar
              activeTab={e.activeTab}
              setActiveTab={e.setActiveTab}
              visibleLayers={e.visibleLayers}
              setVisibleLayers={e.setVisibleLayers}
              selectedModel={e.selectedModel}
              setSelectedModel={e.setSelectedModel}
              models={e.availableModels}
              onSetPrompt={e.setPrompt}
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

          {/* Viewport and Bottom Bar */}
          <div className="flex-grow flex flex-col relative overflow-hidden">
            <EditorViewport
              result={e.result}
              zoom={e.zoom}
              setZoom={e.setZoom}
              panOffset={e.panOffset}
              setPanOffset={e.setPanOffset}
              activeTool={e.activeTool}
              isCropping={e.isCropping}
              setIsCropping={e.setIsCropping}
              cropBox={e.cropBox}
              setDragStart={e.setDragStart}
              setResizeHandle={e.setResizeHandle}
              applyCrop={e.applyCrop}
              cropRatio={e.cropRatio}
              handleRatioSelect={e.handleRatioSelect}
              ratioPresets={RATIO_PRESETS}
              textLayers={e.textLayers}
              handleTextMouseDown={e.handleTextMouseDown}
              selectedTextId={e.selectedTextId}
              visibleLayers={e.visibleLayers}
              canvasRef={e.canvasRef}
              imageRef={e.imageRef}
              containerRef={e.containerRef}
              onMouseDown={e.handleMouseDownViewport}
              onUploadClick={() => (window as any).document.getElementById('editor-file-input')?.click()}
              isGenerating={e.isGenerating}
              updateTextLayer={e.updateTextLayer}
              onDrop={e.handleDrop}
            />

            {/* Prompt Bar - Only show when not cropping */}
            {!e.isCropping && (
              <PromptBar
                isDrawMode={isDrawMode}
                prompt={e.prompt}
                onPromptChange={e.setPrompt}
                onPromptSubmit={handlePromptAction}
                isGenerating={e.isGenerating}
                isGenerateDisabled={isGenerateDisabled}
                onGenerate={handlePromptAction}
                generateTooltip={isDrawMode ? (!e.result ? 'Need an image to edit' : !e.prompt.trim() ? 'Enter an edit description' : null) : e.generateTooltip}
                credits={e.credits}
                usagePreference={e.usagePreference}
                actionCost={ACTION_COST}
                references={e.references}
                onAddReference={() => e.setIsLibraryOpen(true)}
                availableModels={e.availableModels}
                selectedModel={e.selectedModel}
                setSelectedModel={e.setSelectedModel}
                selectedRatio={e.selectedRatio}
                setSelectedRatio={e.setSelectedRatio}
                selectedRes={e.selectedRes}
                setSelectedRes={e.setSelectedRes}
                selectedEngine={e.selectedEngine}
                onSelectEngine={e.setSelectedEngine}
                selectedMode={e.selectedMode}
                setSelectedMode={e.setSelectedMode}
                familyList={e.familyList}
                selectedFamily={e.selectedFamily}
                setSelectedFamily={e.setSelectedFamily}
                familyModels={e.familyModels}
                familyModes={e.familyModes}
                familyRatios={e.familyRatios}
                familyResolutions={e.familyResolutions}
              />
            )}

            {/* Asset Rail - Right side */}
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-20 lg:w-24 bg-white/60 dark:bg-[#0b0c10]/60 backdrop-blur-xl border-l border-slate-100 dark:border-white/5 z-50 flex flex-col items-center py-4 gap-2 md:gap-3 overflow-y-auto no-scrollbar">
              <div className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 dark:text-white/30 tracking-widest flex flex-col items-center gap-1 mb-1 text-center shrink-0">
                <Layers size={12} /> Versions
              </div>
              {allAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => e.setResult(asset.url)}
                  className={`relative w-11 h-11 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 hover:scale-105 ${
                    e.result === asset.url
                      ? 'border-brand-blue shadow-lg shadow-brand-blue/20'
                      : 'border-slate-200 dark:border-white/10 opacity-50 hover:opacity-100'
                  }`}
                  title={asset.label}
                  aria-label={asset.label}
                >
                  <img src={asset.url} className="w-full h-full object-cover" alt={asset.label} />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent py-0.5">
                    <span className="text-[5px] md:text-[6px] font-black text-white uppercase text-center block tracking-tighter">
                      {asset.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modals */}
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
            if (e.isResumingGenerate) {
              e.setIsResumingGenerate(false);
              e.handleGenerate();
            }
          }}
          hasPersonalKey={e.hasPersonalKey}
          totalCost={ACTION_COST}
        />

        {/* Low Credit Alert */}
        <AnimatePresence>
          {e.showLowCreditAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-sm w-full bg-white dark:bg-[#14151a] p-8 md:p-10 border border-slate-200 dark:border-white/[0.06] rounded-2xl text-center space-y-6 shadow-2xl transition-colors"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
                  <Coins size={32} className="md:w-10 md:h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                    Insufficient Credits
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Each edit costs <strong className="text-orange-500">{ACTION_COST} CR</strong>. Top up to continue using the AI Editor.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/credits"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all text-center"
                  >
                    Top Up Credits
                  </Link>
                  <button
                    onClick={() => e.setShowLowCreditAlert(false)}
                    className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Later
                  </button>
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
