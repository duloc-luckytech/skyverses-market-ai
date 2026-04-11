import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Loader2, Layers, Camera, MonitorPlay,
  Clapperboard, Sliders, ChevronRight, Menu, ChevronDown,
  Sparkles, LayoutGrid, Paperclip, Music, Image as LucideImage,
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
import { useAuth } from '../context/AuthContext';
import { CharactersQuickView } from './storyboard-studio/sidebar/CharactersQuickView';
import { StyleGuideChips }     from './storyboard-studio/sidebar/StyleGuideChips';
import { OnboardingWizard, shouldShowWizard } from './storyboard-studio/OnboardingWizard';

// ── Collapsible section wrapper ───────────────────────────────────────────────
const CollapsibleSection: React.FC<{
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ label, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
      >
        <span>{label}</span>
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StoryboardStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits } = useAuth();
  const s = useStoryboardStudio();
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [isAestheticModalOpen, setIsAestheticModalOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [showWizard, setShowWizard] = useState(() => shouldShowWizard());

  // Refs for attachment inputs inside sidebar
  const sidebarImageRef = useRef<HTMLInputElement>(null);
  const sidebarAudioRef = useRef<HTMLInputElement>(null);

  const handleSidebarImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => s.setScriptRefImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSidebarAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) s.setScriptRefAudio(file.name);
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

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileExpanded(true)}
        aria-label="Mở thanh kịch bản"
        aria-expanded={isMobileExpanded}
        className="lg:hidden fixed bottom-6 left-4 z-[130] w-12 h-12 bg-brand-blue rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform"
      >
        <Menu size={20} />
      </button>

      {/* ══════════════════════════════════════════════════════
          LEFT SIDEBAR — Script Editor (tab=STORYBOARD)
      ══════════════════════════════════════════════════════ */}
      <aside
        aria-label="Script Editor — Storyboard Studio"
        className={`
          ${isMobileExpanded ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-[150]
          w-[320px] lg:w-[340px] xl:w-[360px] shrink-0
          bg-white dark:bg-[#0c0c10] border-r border-black/[0.06] dark:border-white/[0.04]
          flex flex-col transition-transform duration-300
        `}
      >

        {/* ─── SIDEBAR HEADER ─── */}
        <div className="px-4 pt-3 pb-2.5 border-b border-black/[0.06] dark:border-white/[0.04] shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                aria-label="Đóng Storyboard Studio"
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
              aria-label="Đóng thanh điều hướng"
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >✕</button>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
            {[
              { id: 'STORYBOARD', label: 'Board', icon: <Layers size={10} /> },
              { id: 'ASSETS',     label: 'Tài sản', icon: <Camera size={10} /> },
              { id: 'SETTINGS',   label: 'Cấu hình', icon: <Sliders size={10} /> },
              { id: 'EXPORT',     label: 'Export', icon: <MonitorPlay size={10} /> },
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

        {/* ─── SIDEBAR BODY ─── */}
        {s.activeTab === 'STORYBOARD' ? (
          /* ── SCRIPT EDITOR (tab = STORYBOARD) ── */
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Script label */}
            <div className="px-4 pt-3 pb-1 shrink-0">
              <span className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-white/30">
                ✏️ KỊCH BẢN
              </span>
            </div>

            {/* Textarea — flex-1 so it fills available space */}
            <div className="flex-1 px-4 pb-2 flex flex-col min-h-0">
              <textarea
                value={s.script}
                onChange={(e) => s.setScript(e.target.value)}
                disabled={s.isProcessing}
                placeholder="Nhập ý tưởng kịch bản... Càng chi tiết, phân cảnh càng chuẩn"
                className={`
                  w-full flex-1 min-h-[160px] resize-none
                  bg-slate-50 dark:bg-white/[0.03]
                  border border-slate-200 dark:border-white/[0.07]
                  rounded-xl px-3.5 py-3
                  text-sm font-medium leading-relaxed
                  text-slate-800 dark:text-white
                  placeholder:text-slate-300 dark:placeholder:text-white/20
                  outline-none
                  focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/10
                  transition-all duration-200
                  no-scrollbar
                  ${s.isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              />
            </div>

            {/* Quick action row */}
            <div className="px-4 pb-3 shrink-0 flex items-center gap-2 flex-wrap">
              {/* AI suggestion */}
              <button
                onClick={s.handleLoadSuggestion}
                disabled={s.isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/20 hover:border-brand-blue/40 text-[10px] font-black uppercase tracking-wider text-brand-blue transition-all disabled:opacity-40"
              >
                <Sparkles size={11} /> Gợi ý AI
              </button>

              {/* Use template */}
              <button
                onClick={s.handleLoadSample}
                disabled={s.isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.07] border border-slate-200 dark:border-white/[0.08] text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 transition-all disabled:opacity-40"
              >
                <LayoutGrid size={11} /> Dùng mẫu
              </button>

              {/* Attachment buttons — compact icons */}
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => sidebarImageRef.current?.click()}
                  title="Tải ảnh reference"
                  className={`p-1.5 rounded-lg border transition-all text-[10px] ${
                    s.scriptRefImage
                      ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                      : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-white/30 hover:text-brand-blue hover:border-brand-blue/30'
                  }`}
                >
                  <LucideImage size={13} />
                </button>
                <button
                  onClick={() => sidebarAudioRef.current?.click()}
                  title="Tải audio lời bình"
                  className={`p-1.5 rounded-lg border transition-all ${
                    s.scriptRefAudio
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-white/30 hover:text-emerald-500 hover:border-emerald-400/30'
                  }`}
                >
                  <Music size={13} />
                </button>
              </div>

              {/* Hidden file inputs */}
              <input type="file" ref={sidebarImageRef} className="hidden" accept="image/*"  onChange={handleSidebarImageUpload} />
              <input type="file" ref={sidebarAudioRef} className="hidden" accept="audio/*"  onChange={handleSidebarAudioUpload} />
            </div>

            {/* Attachment pills — only when files are selected */}
            <AnimatePresence>
              {(s.scriptRefImage || s.scriptRefAudio) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden px-4 pb-2 shrink-0 flex flex-wrap gap-2"
                >
                  {s.scriptRefImage && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-[9px] font-bold text-brand-blue">
                      <Paperclip size={9} /> Ảnh ref
                      <button onClick={() => s.setScriptRefImage(null)} className="ml-1 opacity-60 hover:opacity-100">✕</button>
                    </span>
                  )}
                  {s.scriptRefAudio && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Music size={9} /> {s.scriptRefAudio}
                      <button onClick={() => s.setScriptRefAudio(null)} className="ml-1 opacity-60 hover:opacity-100">✕</button>
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate button — full width, sticky bottom */}
            <div className="px-4 pb-3 shrink-0">
              <button
                onClick={s.handleCreateStoryboard}
                disabled={s.isProcessing || !s.script.trim()}
                className={`
                  w-full flex items-center justify-center gap-2
                  py-3 rounded-xl
                  text-[11px] font-black uppercase tracking-widest
                  transition-all duration-200
                  ${s.isProcessing || !s.script.trim()
                    ? 'bg-brand-blue/30 text-white/40 cursor-not-allowed'
                    : 'bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg shadow-brand-blue/25 active:scale-[0.98]'
                  }
                `}
              >
                {s.isProcessing ? (
                  <><Loader2 size={14} className="animate-spin" /> Đang phân tách...</>
                ) : (
                  <><Zap size={14} fill="currentColor" /> Tạo kịch bản <span className="ml-1 opacity-60 font-medium">500 CR</span></>
                )}
              </button>
            </div>

            {/* Collapsible: Nhân vật & Phong cách */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <CollapsibleSection label="Nhân vật & Phong cách">
                <div className="pb-3">
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
                </div>
              </CollapsibleSection>
            </div>

            {/* Footer credits bar */}
            <div className="shrink-0 border-t border-black/[0.06] dark:border-white/[0.04] px-4 py-2.5 flex items-center justify-between bg-white/80 dark:bg-[#0c0c10]/80 backdrop-blur-lg">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {credits.toLocaleString()} CR
              </span>
              <div className="flex items-center gap-1 text-amber-500/80">
                <Zap size={10} fill="currentColor" />
                <span className="text-[11px] font-semibold">{s.creditCostEstimate}</span>
              </div>
            </div>
          </div>

        ) : (
          /* ── OTHER TABS: minimal sidebar (just credits) ── */
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar flex items-center justify-center p-6">
              <p className="text-[10px] font-medium text-slate-300 dark:text-white/20 text-center leading-relaxed">
                Chọn tab <span className="font-black text-brand-blue">Board</span> để viết kịch bản và tạo phân cảnh
              </p>
            </div>
            <div className="shrink-0 border-t border-black/[0.06] dark:border-white/[0.04] px-4 py-2.5 flex items-center justify-between bg-white/80 dark:bg-[#0c0c10]/80 backdrop-blur-lg">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {credits.toLocaleString()} CR
              </span>
              <div className="flex items-center gap-1 text-amber-500/80">
                <Zap size={10} fill="currentColor" />
                <span className="text-[11px] font-semibold">{s.creditCostEstimate}</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
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
              onDuplicateScene={(id) => {
                const src = s.scenes.find(sc => sc.id === id);
                if (!src) return;
                const copy = {
                  ...src,
                  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  order: src.order + 0.5,
                  status: 'idle' as const,
                  visualUrl: null,
                  videoUrl: null,
                };
                s.setScenes(prev => {
                  const inserted = [...prev];
                  const idx = inserted.findIndex(sc => sc.id === id);
                  inserted.splice(idx + 1, 0, copy);
                  return inserted.map((sc, i) => ({ ...sc, order: i + 1 }));
                });
              }}
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
      </div>

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

      {/* Onboarding Wizard — lần đầu sử dụng */}
      <AnimatePresence>
        {showWizard && (
          <OnboardingWizard
            onComplete={(script) => {
              if (script) s.setScript(script);
              setShowWizard(false);
            }}
            onSkip={() => setShowWizard(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StoryboardStudioWorkspace;
