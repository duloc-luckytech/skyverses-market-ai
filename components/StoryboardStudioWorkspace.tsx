import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Loader2, Layers, Camera, MonitorPlay,
  Clapperboard, Sliders, ChevronRight, Menu
} from 'lucide-react';
import { useStoryboardStudio } from '../hooks/useStoryboardStudio';
import { StoryboardTab } from './storyboard-studio/StoryboardTab';
import { AssetsTab } from './storyboard-studio/AssetsTab';
import { SettingsTab } from './storyboard-studio/SettingsTab';
import { FooterControls } from './storyboard-studio/FooterControls';
import { CharacterEditModal } from './storyboard-studio/CharacterEditModal';
import { StoryboardProgressModal } from './storyboard-studio/StoryboardProgressModal';
import { RenderConfigModal } from './storyboard-studio/RenderConfigModal';
import { AestheticProfileModal } from './storyboard-studio/AestheticProfileModal';
import { ExportTab } from './storyboard-studio/ExportTab';
import ExplorerDetailModal from './ExplorerDetailModal';
import { MobileGeneratorBar } from './common/MobileGeneratorBar';
import { useAuth } from '../context/AuthContext';
// ── Phase 1: Sidebar sub-components ──────────────────────────────────────────
import { ProjectInfoSection }  from './storyboard-studio/sidebar/ProjectInfoSection';
import { CharactersQuickView } from './storyboard-studio/sidebar/CharactersQuickView';
import { StyleGuideChips }     from './storyboard-studio/sidebar/StyleGuideChips';
import { ProductionStats }     from './storyboard-studio/sidebar/ProductionStats';
import { AIQuickActions }      from './storyboard-studio/sidebar/AIQuickActions';

const StoryboardStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits } = useAuth();
  const s = useStoryboardStudio();
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [isAestheticModalOpen, setIsAestheticModalOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Derived credit estimates for sidebar
  const imageCredits = s.scenes.filter(sc => !sc.visualUrl).length * 100;
  const videoCredits = s.scenes.filter(sc => !sc.videoUrl).length * 50;

  // Sync mobile quick bar prompt with main script
  const handleQuickPromptChange = (val: string) => {
    s.setScript(val);
  };

  const handleQuickGenerate = () => {
    setIsMobileExpanded(false);
    s.handleCreateStoryboard();
  };

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500 relative">

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileExpanded && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileExpanded(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          LEFT SIDEBAR — đồng bộ với Image/Video/RE Workspace
      ══════════════════════════════════════════════════════ */}

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileExpanded(true)}
        className="lg:hidden fixed bottom-6 left-4 z-[130] w-12 h-12 bg-brand-blue rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform"
      >
        <Menu size={20} />
      </button>

      <aside className={`
        ${isMobileExpanded ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-[150]
        w-[320px] lg:w-[340px] xl:w-[360px] shrink-0
        bg-white dark:bg-[#0c0c10] border-r border-black/[0.06] dark:border-white/[0.04]
        flex flex-col transition-transform duration-300
      `}>

        {/* ─── SIDEBAR HEADER ─── */}
        <div className="px-4 pt-3 pb-2.5 border-b border-black/[0.06] dark:border-white/[0.04] shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-brand-blue flex items-center justify-center">
                  <Clapperboard size={12} className="text-white" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white">Storyboard Studio</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileExpanded(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >✕</button>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
            {[
              { id: 'STORYBOARD', label: 'Board', icon: <Layers size={10} /> },
              { id: 'ASSETS', label: 'Tài sản', icon: <Camera size={10} /> },
              { id: 'SETTINGS', label: 'Cấu hình', icon: <Sliders size={10} /> },
              { id: 'EXPORT', label: 'Export', icon: <MonitorPlay size={10} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => s.setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-semibold uppercase tracking-wider transition-all ${
                  s.activeTab === tab.id
                    ? 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white/60'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── SIDEBAR CONTENT ─── */}
        <div className={`flex-grow overflow-y-auto no-scrollbar ${!isMobileExpanded ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>
          <MobileGeneratorBar
            isExpanded={isMobileExpanded}
            setIsExpanded={setIsMobileExpanded}
            prompt={s.script}
            setPrompt={handleQuickPromptChange}
            credits={credits}
            totalCost={500}
            isGenerating={s.isProcessing}
            isGenerateDisabled={s.isProcessing || !s.script.trim()}
            onGenerate={handleQuickGenerate}
            onOpenLibrary={() => s.setActiveTab('ASSETS')}
            generateLabel="PHÂN TÁCH"
            type="video"
            tooltip={!s.script.trim() ? "Vui lòng nhập kịch bản" : null}
          />

          <div className="flex-grow overflow-y-auto no-scrollbar">
            <ProjectInfoSection
              projectName={s.projectName}
              onProjectNameChange={s.setProjectName}
              totalScenes={s.scenes.length}
              renderedCount={s.renderedScenes.length}
              creditCostEstimate={s.creditCostEstimate}
            />

            <CharactersQuickView
              assets={s.assets}
              onNavigateToAssets={() => s.setActiveTab('ASSETS')}
            />

            <StyleGuideChips
              format={s.settings.format}
              style={s.settings.style}
              culture={s.settings.culture}
              onOpenAestheticModal={() => setIsAestheticModalOpen(true)}
            />

            <ProductionStats
              totalScenes={s.scenes.length}
              renderedCount={s.renderedScenes.length}
              totalDuration={s.computedTotalDuration}
            />

            <AIQuickActions
              isProcessing={s.isProcessing}
              imageCredits={imageCredits}
              videoCredits={videoCredits}
              totalCreditEstimate={s.creditCostEstimate}
              onEnhanceAllPrompts={s.handleEnhanceAllPrompts}
              onGenerateBatchImages={() => {
                s.selectAllScenes();
                setTimeout(() => s.handleGenerateBatchImages(), 100);
              }}
              onGenerateBatchVideos={() => {
                s.selectAllScenes();
                setTimeout(() => s.handleGenerateBatchVideos(), 100);
              }}
            />
          </div>
        </div>

        {/* ─── SIDEBAR FOOTER ─── */}
        <div className="shrink-0 border-t border-black/[0.06] dark:border-white/[0.04] bg-white/80 dark:bg-[#0c0c10]/80 backdrop-blur-lg">
          {/* Credits bar */}
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {credits.toLocaleString()} CR
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-500/80">
              <Zap size={10} fill="currentColor" />
              <span className="text-[11px] font-semibold">{s.creditCostEstimate}</span>
            </div>
          </div>

          {/* Generate button */}
          <div className="px-4 pb-4">
            <div className="relative group/btn">
              <button
                onClick={s.handleCreateStoryboard}
                disabled={s.isProcessing || !s.script.trim()}
                className={`w-full py-3.5 rounded-xl text-white font-semibold uppercase text-[11px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2.5 ${
                  s.isProcessing || !s.script.trim()
                    ? 'bg-slate-200 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'bg-brand-blue hover:brightness-110 active:scale-[0.98] shadow-brand-blue/20'
                }`}
              >
                {s.isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                {s.isProcessing ? 'Đang xử lý...' : 'Phân tách kịch bản'}
              </button>
              {!s.script.trim() && !s.isProcessing && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all z-50">
                  <div className="bg-slate-900 dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-lg text-[9px] font-semibold whitespace-nowrap shadow-xl">
                    Vui lòng nhập kịch bản
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
            {s.activeTab === 'STORYBOARD' && (
              <StoryboardTab
                key="tab-story"
                script={s.script}
                setScript={s.setScript}
                scriptRefImage={s.scriptRefImage}
                setScriptRefImage={s.setScriptRefImage}
                scriptRefAudio={s.scriptRefAudio}
                setScriptRefAudio={s.setScriptRefAudio}
                totalDuration={s.totalDuration}
                setTotalDuration={s.setTotalDuration}
                sceneDuration={s.sceneDuration}
                voiceOverEnabled={s.voiceOverEnabled}
                setVoiceOverEnabled={s.setVoiceOverEnabled}
                assets={s.assets}
                addAsset={s.addAsset}
                removeAsset={s.removeAsset}
                updateAsset={s.updateAsset}
                updateScene={s.updateScene}
                handleReGenerateAsset={s.handleReGenerateAsset}
                openAssetModal={s.openAssetModal}
                onViewAsset={s.openExplorerView}
                onViewScene={s.openExplorerViewScene}
                scenes={s.scenes}
                selectedSceneIds={s.selectedSceneIds}
                toggleSceneSelection={s.toggleSceneSelection}
                selectAllScenes={s.selectAllScenes}
                isProcessing={s.isProcessing}
                isEnhancing={s.isEnhancing}
                assetUploadRef={s.assetUploadRef}
                setActiveUploadAssetId={s.setActiveUploadAssetId}
                onOpenSettings={() => s.setActiveTab('SETTINGS')}
                onOpenRenderConfig={() => setIsRenderModalOpen(true)}
                onOpenAestheticConfig={() => setIsAestheticModalOpen(true)}
                onLoadSample={s.handleLoadSample}
                onLoadSuggestion={s.handleLoadSuggestion}
                settings={s.settings}
                onReGenerateSceneImage={s.handleReGenerateSceneImage}
                onReGenerateSceneVideo={s.handleReGenerateSceneVideo}
                onDeleteScene={(id) => s.setScenes(prev => prev.filter(sc => sc.id !== id))}
                onEnhanceScenePrompt={s.handleEnhanceScenePrompt}
                enhancingSceneId={s.enhancingSceneId}
                onReorder={s.handleReorder}
                onShotTypeChange={s.handleShotTypeChange}
                onDurationChange={s.handleSceneDurationChange}
              />
            )}

            {s.activeTab === 'ASSETS' && (
              <AssetsTab
                key="tab-assets"
                assets={s.assets}
                addAsset={s.addAsset}
                removeAsset={s.removeAsset}
                updateAsset={s.updateAsset}
                handleReGenerateAsset={s.handleReGenerateAsset}
                openAssetModal={s.openAssetModal}
                onViewAsset={s.openExplorerView}
              />
            )}

            {s.activeTab === 'SETTINGS' && (
              <SettingsTab
                key="tab-settings"
                script={s.script}
                setScript={s.setScript}
                settings={s.settings}
                setSettings={s.setSettings}
                onLoadSample={s.handleLoadSample}
                onLoadSuggestion={s.handleLoadSuggestion}
                onOpenAestheticConfig={() => setIsAestheticModalOpen(true)}
                onOpenRenderConfig={() => setIsRenderModalOpen(true)}
                isEnhancing={s.isEnhancing}
                isProcessing={s.isProcessing}
                onSaveAndGenerate={s.handleSaveAndGenerate}
              />
            )}
            {s.activeTab === 'EXPORT' && (
              <ExportTab
                key="tab-export"
                scenes={s.scenes}
                assets={s.assets}
                script={s.script}
                settings={s.settings}
                totalDuration={s.totalDuration}
                onExportJSON={s.handleExportProjectJSON}
                onImportJSON={s.handleImportProjectJSON}
                onNewProject={s.handleNewProject}
                onViewScene={(scene) => s.openExplorerViewScene(scene)}
                isProcessing={s.isProcessing}
              />
            )}
          </AnimatePresence>
      </div>

      <FooterControls
        scenesCount={s.scenes.length}
        selectedCount={s.selectedSceneIds.length}
        isProcessing={s.isProcessing}
        canCreate={s.script.trim().length > 0}
        onSynthesize={s.handleCreateStoryboard}
        onGenerateImages={s.handleGenerateBatchImages}
        onGenerateVideos={s.handleGenerateBatchVideos}
        onReset={() => s.setScenes([])}
        totalDuration={s.computedTotalDuration}
      />

      <input
        type="file"
        ref={s.assetUploadRef}
        className="hidden"
        accept="image/*"
        onChange={s.handleAssetUpload}
      />

      {/* Modals & Overlays */}
      <RenderConfigModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        settings={s.settings}
        setSettings={s.setSettings}
      />

      <AestheticProfileModal
        isOpen={isAestheticModalOpen}
        onClose={() => setIsAestheticModalOpen(false)}
        settings={s.settings}
        setSettings={s.setSettings}
      />

      <AnimatePresence>
        {s.isAssetModalOpen && s.editingAsset && (
          <CharacterEditModal
            asset={s.editingAsset}
            updateAsset={(updates) => s.setEditingAsset(prev => prev ? { ...prev, ...updates } : null)}
            onClose={s.closeAssetModal}
            onSave={s.saveAsset}
            onDelete={s.removeAsset}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {s.showProgressModal && (
          <StoryboardProgressModal
            logs={s.terminalLogs}
            onClose={s.closeProgressModal}
          />
        )}
      </AnimatePresence>

      <ExplorerDetailModal
        item={s.viewingExplorerItem}
        onClose={() => s.setViewingExplorerItem(null)}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StoryboardStudioWorkspace;