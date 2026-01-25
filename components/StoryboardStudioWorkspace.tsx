
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
import ExplorerDetailModal from './ExplorerDetailModal';

const StoryboardStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const s = useStoryboardStudio();
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [isAestheticModalOpen, setIsAestheticModalOpen] = useState(false);

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-[#050506] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500 relative">
      <HeaderNav 
        activeTab={s.activeTab} 
        setActiveTab={s.setActiveTab} 
        onClose={onClose} 
      />

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
            />
          )}

          {s.activeTab === 'ASSETS' && (
            <AssetsTab key="tab-assets" />
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
