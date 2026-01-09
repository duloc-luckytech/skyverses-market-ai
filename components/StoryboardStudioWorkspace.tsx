
import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStoryboardStudio } from '../hooks/useStoryboardStudio';
import { HeaderNav } from './storyboard-studio/HeaderNav';
import { StoryboardTab } from './storyboard-studio/StoryboardTab';
import { AssetsTab } from './storyboard-studio/AssetsTab';
import { SettingsTab } from './storyboard-studio/SettingsTab';
import { LogicTab } from './storyboard-studio/LogicTab';
import { CharacterEditModal } from './storyboard-studio/CharacterEditModal';
import { StoryboardProgressModal } from './storyboard-studio/StoryboardProgressModal';
import { FooterControls } from './storyboard-studio/FooterControls';
import ExplorerDetailModal from './ExplorerDetailModal';

const StoryboardStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const s = useStoryboardStudio();
  const assetUploadRef = useRef<HTMLInputElement>(null);
  const [activeUploadAssetId, setActiveUploadAssetId] = useState<string | null>(null);

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (activeUploadAssetId) {
          s.updateAsset(activeUploadAssetId, { url: reader.result as string, status: 'done' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-[#050506] text-white font-sans overflow-hidden transition-colors duration-500">
      
      <HeaderNav 
        activeTab={s.activeTab} 
        setActiveTab={s.setActiveTab} 
        onClose={onClose} 
      />

      <div className="flex-grow overflow-hidden relative flex flex-col">
        <AnimatePresence mode="wait">
          
          {s.activeTab === 'STORYBOARD' && (
            <StoryboardTab 
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
              assetUploadRef={assetUploadRef}
              setActiveUploadAssetId={setActiveUploadAssetId}
              onOpenSettings={() => s.setActiveTab('SETTINGS')}
              onLoadSample={s.handleLoadSample}
              onLoadSuggestion={s.handleLoadSuggestion}
              settings={s.settings}
            />
          )}

          {s.activeTab === 'ASSETS' && <AssetsTab />}

          {s.activeTab === 'SETTINGS' && (
            <SettingsTab 
              script={s.script}
              setScript={s.setScript}
              settings={s.settings}
              setSettings={s.setSettings}
              onLoadSample={s.handleLoadSample}
              onLoadSuggestion={s.handleLoadSuggestion}
              isEnhancing={s.isEnhancing}
              isProcessing={s.isProcessing}
              onSaveAndGenerate={s.handleSaveAndGenerate}
            />
          )}

          {s.activeTab === 'LOGIC' && (
            <LogicTab 
              systemPrompt={s.systemPrompt}
              setSystemPrompt={s.setSystemPrompt}
            />
          )}
        </AnimatePresence>
      </div>

      <FooterControls 
        scenesCount={s.selectedSceneIds.length}
        isProcessing={s.isProcessing}
        canCreate={!!s.script.trim()}
        onSynthesize={s.handleCreateStoryboard}
        onReset={() => s.setSelectedSceneIds([])}
      />

      {/* Progress Modal */}
      <AnimatePresence>
        {s.showProgressModal && (
          <StoryboardProgressModal 
            logs={s.terminalLogs}
            onClose={s.closeProgressModal}
          />
        )}
      </AnimatePresence>

      {/* Asset Modal */}
      <AnimatePresence>
        {s.isAssetModalOpen && s.editingAsset && (
          <CharacterEditModal 
            asset={s.editingAsset}
            onClose={s.closeAssetModal}
            onSave={s.saveAsset}
            onDelete={(id) => { s.removeAsset(id); s.closeAssetModal(); }}
            updateAsset={(updates) => s.setEditingAsset(prev => prev ? ({ ...prev, ...updates }) : null)}
          />
        )}
      </AnimatePresence>

      {/* Explorer Modal */}
      <ExplorerDetailModal 
        item={s.viewingExplorerItem}
        onClose={() => s.setViewingExplorerItem(null)}
      />

      <input 
        type="file" 
        ref={assetUploadRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleAssetUpload} 
      />
    </div>
  );
};

export default StoryboardStudioWorkspace;
