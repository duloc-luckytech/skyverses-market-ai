
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
import ExplorerDetailModal from './ExplorerDetailModal';
import { MonitorPlay, Zap, Loader2, X, ImageIcon, Mic, Check, Info, Settings } from 'lucide-react';

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

      {/* FOOTER ACTION BAR */}
      <div className="h-24 border-t border-white/5 bg-[#08080a] flex items-center justify-between px-10 shrink-0 z-[170]">
         <div className="flex items-center gap-12">
            <div className="space-y-1">
               <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest italic">MÔ HÌNH SẢN XUẤT</p>
               <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase text-brand-blue tracking-widest">{s.settings.model.toUpperCase()}</span>
                  <button onClick={() => s.setActiveTab('SETTINGS')} className="p-1 hover:bg-white/5 rounded transition-colors text-gray-500"><Settings size={12}/></button>
               </div>
            </div>
            <div className="h-8 w-px bg-white/5"></div>
            <div className="flex gap-4">
               <div className="flex items-center gap-3 px-4 py-2 border border-white/10 rounded-lg bg-black/40 shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                  <span className="text-[9px] font-black uppercase text-gray-400">Node_Uplink: Active</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <AnimatePresence mode="wait">
               {s.selectedSceneIds.length > 0 ? (
                  <motion.div 
                    key="action-bar"
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 20 }} 
                    className="flex items-center gap-2 bg-[#1c1c1f] px-4 py-3 border border-brand-blue/30 rounded-2xl shadow-2xl"
                  >
                     <div className="flex items-center gap-2 px-4 border-r border-white/10 mr-2">
                        <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center text-white shadow-[0_0_10px_rgba(0,144,255,0.3)]">
                           <Check size={12} strokeWidth={4} />
                        </div>
                        <span className="text-xs font-black text-white">{s.selectedSceneIds.length} cảnh đã chọn</span>
                     </div>

                     <div className="flex items-center gap-2">
                        <button 
                          onClick={s.handleGenerateBatchImages}
                          className="bg-[#0090ff] text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                           <ImageIcon size={14}/> Tạo hình ảnh
                        </button>
                        <button 
                          onClick={s.handleGenerateBatchVideos}
                          className="bg-[#9333ea] text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                           <MonitorPlay size={14}/> Tạo videos
                        </button>
                        <button className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-[#10b981] hover:text-white transition-all">
                           <Mic size={14}/> Tạo thoại (VO)
                        </button>
                     </div>

                     <div className="h-6 w-px bg-white/10 mx-2"></div>
                     
                     <button onClick={() => s.selectAllScenes()} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Bỏ chọn tất cả">
                        <X size={20}/>
                     </button>
                  </motion.div>
               ) : s.scenes.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-4 text-gray-500 italic text-[11px] font-bold"
                  >
                     <Info size={14} className="text-brand-blue" /> Chọn phân cảnh ở trên để khởi tạo tác vụ
                  </motion.div>
               ) : (
                  <motion.button 
                    key="create-btn"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={s.handleCreateStoryboard}
                    disabled={s.isProcessing || !s.script.trim()}
                    className="px-16 py-6 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-[0.4em] shadow-[0_15px_40px_rgba(0,144,255,0.3)] flex items-center justify-center gap-4 hover:brightness-110 active:scale-[0.98] transition-all group relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                     {s.isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                     Tạo kịch bản
                  </motion.button>
               )}
            </AnimatePresence>
         </div>
      </div>

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

      {/* Hidden inputs for functional triggers */}
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
