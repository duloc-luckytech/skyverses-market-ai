import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Loader2, Play, Film,
  Terminal, ShieldCheck, Download,
  LayoutGrid, Plus,
  ArrowRight, Square, CheckCircle2,
  AlertTriangle, Layers, AlignLeft,
  Sparkles, Camera, MonitorPlay,
  Lock, ExternalLink, Activity, Share2,
  Clapperboard, Sliders, Settings2, BookOpen,
  ChevronRight, MoreVertical, Menu, LogOut,
  History as HistoryIcon
} from 'lucide-react';
import { useStoryboardStudio } from '../hooks/useStoryboardStudio';
import { HeaderNav } from './storyboard-studio/HeaderNav';
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
    <div className="h-full w-full flex flex-col bg-white dark:bg-[#050506] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500 relative">
      <HeaderNav
        activeTab={s.activeTab}
        setActiveTab={s.setActiveTab}
        onClose={onClose}
        projectName={s.projectName}
      />

      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden relative">
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
            LEFT SIDEBAR — Phase 1 Upgrade
        ══════════════════════════════════════════════════════ */}
        <aside className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[450px] bg-white dark:bg-[#08080a] lg:bg-slate-50 lg:dark:bg-[#020203] border-t lg:border-t-0 lg:border-r border-black/10 dark:border-white/5 flex flex-col z-[150] lg:z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none transition-all duration-500 ease-in-out ${isMobileExpanded ? 'h-[92dvh] rounded-t-[2.5rem]' : 'h-32 lg:h-full lg:rounded-none'}`}>

          {/* MOBILE QUICK BAR */}
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

          {/* ── Desktop sidebar body ── */}
          <div className={`flex-grow overflow-y-auto no-scrollbar ${!isMobileExpanded ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>

            {/* Sidebar header */}
            <div className="hidden lg:flex items-center gap-3 px-5 pt-6 pb-4 border-b border-white/5 shrink-0">
              <Clapperboard size={16} className="text-brand-blue" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Studio Control</h3>
            </div>

            {/* ── Phase 1: Rich sidebar sections ── */}
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
                  // Select all scenes before batch generate
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

          {/* ── CTA button (desktop) ── */}
          <div className={`p-6 border-t border-black/5 dark:border-white/10 bg-slate-50/80 dark:bg-black/40 space-y-4 shrink-0 shadow-2xl ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <button
              onClick={s.handleCreateStoryboard}
              disabled={s.isProcessing || !s.script.trim()}
              className={`w-full py-5 rounded-xl text-white font-black uppercase text-xs tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-4 ${s.isProcessing || !s.script.trim() ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed' : 'bg-brand-blue hover:brightness-110 active:scale-95 shadow-brand-blue/20'}`}
            >
              {s.isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
              PHÂN TÁCH KỊCH BẢN
            </button>
          </div>
        </aside>

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