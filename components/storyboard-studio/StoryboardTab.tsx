
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls, useMotionValue, useTransform } from 'framer-motion';
import {
  Check, MonitorPlay, User, Maximize2,
  Grid2X2, Film,
  Image as LucideImage, Loader2, Square as SquareIcon, LayoutGrid,
  Clapperboard,
  Play, AlignJustify, Volume2, Music2,
} from 'lucide-react';
import { ReferenceAsset, Scene, ShotType, DurationPreset } from '../../hooks/useStoryboardStudio';
import { SceneCardHeader }    from './scene-card/SceneCardHeader';
import { DragHandle }         from './scene-card/DragHandle';
import { SceneHoverActions }  from './scene-card/SceneHoverActions';
import TimelineView           from './TimelineView';
import { TemplatePickerModal } from './TemplatePickerModal';

interface StoryboardTabProps {
  script: string;
  setScript: (v: string) => void;
  scriptRefImage: string | null;
  setScriptRefImage: (v: string | null) => void;
  scriptRefAudio: string | null;
  setScriptRefAudio: (v: string | null) => void;
  totalDuration: number;
  setTotalDuration: (v: number) => void;
  sceneDuration: number;
  voiceOverEnabled: boolean;
  setVoiceOverEnabled: (v: boolean) => void;
  assets: ReferenceAsset[];
  addAsset: (type: any) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, updates: any) => void;
  updateScene: (id: string, updates: any) => void;
  handleReGenerateAsset: (id: string) => void;
  openAssetModal: (asset?: ReferenceAsset) => void;
  onViewAsset: (asset: ReferenceAsset) => void;
  onViewScene: (scene: Scene) => void;
  scenes: Scene[];
  selectedSceneIds: string[];
  toggleSceneSelection: (id: string) => void;
  selectAllScenes: () => void;
  isProcessing: boolean;
  isEnhancing?: boolean;
  assetUploadRef: React.RefObject<HTMLInputElement | null>;
  setActiveUploadAssetId: (id: string) => void;
  onOpenSettings: () => void;
  onOpenRenderConfig: () => void;
  onOpenAestheticConfig: () => void;
  onLoadSample: () => void;
  onLoadSuggestion: () => void;
  settings: any;
  onReGenerateSceneImage: (sceneId: string) => void;
  onReGenerateSceneVideo: (sceneId: string) => void;
  onDeleteScene: (sceneId: string) => void;
  onDuplicateScene?: (sceneId: string) => void;
  onEnhanceScenePrompt?: (sceneId: string) => void;
  enhancingSceneId?: string | null;
  onReorder: (reordered: Scene[]) => void;
  onShotTypeChange: (sceneId: string, shotType: ShotType) => void;
  onDurationChange: (sceneId: string, duration: DurationPreset) => void;
  onGenerateImages?: () => void;
  onGenerateVideos?: () => void;
  onDownloadScene?: (scene: Scene) => void;
  onDownloadAudio?: (scene: Scene) => void;
  onGenerateVoiceover?: (sceneId: string) => void;
  onMoveScene?: (id: string, direction: 'up' | 'down') => void;
}

// ─── SCENE CARD WRAPPER (with drag support) ─────────────────────────────────
interface SceneCardWrapperProps {
  scene: Scene;
  index: number;
  isSelected: boolean;
  assets: ReferenceAsset[];
  isProcessing: boolean;
  isEnhancingPrompt?: boolean;
  viewLayout?: 'grid' | 'list' | 'timeline';
  onToggle: () => void;
  onView: () => void;
  onUpdate: (updates: any) => void;
  onReGenerateImage: () => void;
  onReGenerateVideo: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onEnhancePrompt?: () => void;
  onDownload?: () => void;
  onDownloadAudio?: () => void;
  onGenerateVoiceover?: () => void;
  onShotTypeChange: (st: ShotType) => void;
  onDurationChange: (d: DurationPreset) => void;
}

const SceneCardWrapper: React.FC<SceneCardWrapperProps> = ({
  scene, index, isSelected, assets, isProcessing, isEnhancingPrompt,
  viewLayout = 'list',
  onToggle, onView, onUpdate, onReGenerateImage, onReGenerateVideo,
  onDelete, onDuplicate, onEnhancePrompt, onDownload, onDownloadAudio, onGenerateVoiceover,
  onShotTypeChange, onDurationChange,
}) => {
  const dragControls = useDragControls();
  const y = useMotionValue(0);
  const boxShadow = useTransform(
    y,
    [-5, 0, 5],
    ['0 8px 30px rgba(0,144,255,0.18)', '0 2px 8px rgba(0,0,0,0.08)', '0 8px 30px rgba(0,144,255,0.18)']
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const isListView = viewLayout === 'list';
  const hasVideo = !!scene.videoUrl;
  const hasImage = !!scene.visualUrl;
  const isGenerating = scene.status === 'generating';

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play(); setIsPlaying(true); }
    else { vid.pause(); setIsPlaying(false); }
  }, []);

  const characterAssets = (scene.characterIds || [])
    .map(id => assets.find(a => a.id === id))
    .filter(Boolean) as ReferenceAsset[];

  // ── Visual area (shared between list & grid layouts) ─────────────────
  const visualArea = (
    <div className={`relative bg-slate-100 dark:bg-black overflow-hidden ${isListView ? 'w-[38%] shrink-0 self-stretch' : 'aspect-video'}`}>
      <div className={`relative w-full h-full ${!isListView ? 'aspect-video' : ''}`}>

        {/* State A: Empty */}
        {!hasImage && !hasVideo && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0f0f14] dark:to-[#0a0a0e]">
            <Clapperboard size={isListView ? 24 : 32} className="text-slate-300 dark:text-white/15" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-white/15">Chưa render</span>
          </div>
        )}

        {/* State B: Has image */}
        {hasImage && !hasVideo && (
          <>
            <img
              src={scene.visualUrl!}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt={`Cảnh ${scene.order}`}
              onClick={(e) => { e.stopPropagation(); onView(); }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); onView(); }}
              className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/15 rounded-lg px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white/80 hover:text-white hover:bg-brand-blue/70 transition-all opacity-60 hover:opacity-100 z-10"
            >
              <Maximize2 size={10} /> <span className={isListView ? '' : 'hidden sm:inline'}>Xem</span>
            </button>
          </>
        )}

        {/* State C: Has video */}
        {hasVideo && (
          <>
            <video
              ref={videoRef}
              src={scene.videoUrl!}
              autoPlay loop muted playsInline
              className="absolute inset-0 w-full h-full object-cover"
              onClick={(e) => { e.stopPropagation(); onView(); }}
            />
            <button
              onClick={togglePlay}
              className={`absolute transition-all duration-200 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white hover:bg-brand-blue/70 z-10
                ${isPlaying
                  ? 'bottom-2 left-2 w-6 h-6 opacity-50 hover:opacity-100'
                  : 'inset-0 m-auto w-10 h-10 opacity-90'
                }`}
            >
              {isPlaying
                ? <SquareIcon size={10} fill="currentColor" />
                : <Play size={16} fill="currentColor" className="ml-0.5" />
              }
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onView(); }}
              className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/15 rounded-lg px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white/80 hover:text-white hover:bg-brand-blue/70 transition-all opacity-60 hover:opacity-100 z-10"
            >
              <Play size={10} fill="currentColor" /> <span className={isListView ? '' : 'hidden sm:inline'}>Xem</span>
            </button>
          </>
        )}

        {/* Generating overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-20">
            <div className="relative">
              <Loader2 className="text-brand-blue animate-spin" size={28} />
              <div className="absolute inset-0 rounded-full bg-brand-blue/20 blur-xl animate-pulse" />
            </div>
            <span className="text-[9px] font-black text-slate-700 dark:text-white uppercase tracking-[0.4em] animate-pulse">Rendering...</span>
          </div>
        )}

        {/* Media type badge */}
        {hasVideo && <div className="absolute top-2 right-9 bg-purple-600 text-white text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md z-10">VIDEO</div>}
        {hasImage && !hasVideo && <div className="absolute top-2 right-9 bg-brand-blue text-white text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md z-10">HÌNH</div>}

        {/* Selection checkbox */}
        <div
          role="checkbox"
          aria-checked={isSelected}
          aria-label={`Chọn cảnh ${index + 1}`}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer
            ${isSelected
              ? 'bg-brand-blue border-brand-blue'
              : 'bg-white/50 dark:bg-black/40 border-slate-300 dark:border-white/20 opacity-0 group-hover:opacity-100'
            }`}
        >
          {isSelected && <Check size={11} strokeWidth={3.5} className="text-white" />}
        </div>
      </div>
    </div>
  );

  // ── Info pane (header + character + prompt + actions) ─────────────────
  const infoPane = (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Header */}
      <SceneCardHeader
        sceneIndex={index}
        shotType={scene.shotType ?? 'WIDE'}
        duration={scene.duration ?? 8}
        status={scene.status}
        errorMessage={scene.errorMessage}
        onShotTypeChange={onShotTypeChange}
        onDurationChange={onDurationChange}
        isProcessing={isProcessing}
      />

      {/* Character strip */}
      {characterAssets.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
          <User size={10} className="text-emerald-500 shrink-0" />
          <span className="text-[7px] font-black uppercase text-emerald-500 tracking-widest shrink-0">Mỏ neo:</span>
          <div className="flex -space-x-1.5">
            {characterAssets.slice(0, 4).map((asset) => (
              <div key={asset.id} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0d0d10] overflow-hidden shadow-sm" title={asset.name}>
                {asset.url
                  ? <img src={asset.url} className="w-full h-full object-cover" alt={asset.name} />
                  : <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[7px] font-black text-slate-500">{asset.name.charAt(0)}</div>
                }
              </div>
            ))}
            {characterAssets.length > 4 && (
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0d0d10] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[7px] font-black text-slate-500">+{characterAssets.length - 4}</div>
            )}
          </div>
        </div>
      )}

      {/* Prompt textarea */}
      <div className="px-4 py-3 flex-grow bg-white dark:bg-transparent">
        <p className="text-[7px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest mb-1.5">Kịch bản chi tiết</p>
        <textarea
          value={scene.prompt}
          onChange={(e) => onUpdate({ prompt: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-transparent border-none p-0 text-[12px] font-medium leading-relaxed text-slate-600 dark:text-gray-300 italic focus:ring-0 resize-none outline-none no-scrollbar"
          rows={isListView ? 3 : 4}
        />
      </div>

      {/* Audio player — hiện khi scene có audioUrl */}
      {scene.audioUrl && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-violet-500/15 flex items-center justify-center shrink-0">
            <Music2 size={10} className="text-violet-400" />
          </div>
          <span className="text-[7px] font-black uppercase text-violet-400 tracking-widest shrink-0">Voice-over</span>
          <audio
            src={scene.audioUrl}
            controls
            className="flex-1 h-6 min-w-0"
            style={{ colorScheme: 'dark' }}
            onClick={(e) => e.stopPropagation()}
          />
          {onDownloadAudio && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownloadAudio(); }}
              title="Tải audio xuống"
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 dark:text-white/30 hover:bg-violet-500/15 hover:text-violet-400 transition-all"
            >
              <Volume2 size={11} />
            </button>
          )}
        </div>
      )}

      {/* Bottom action bar */}
      <SceneHoverActions
        isProcessing={isProcessing}
        isEnhancingPrompt={isEnhancingPrompt}
        onRegenerateImage={onReGenerateImage}
        onRegenerateVideo={onReGenerateVideo}
        onEnhancePrompt={onEnhancePrompt ?? (() => {})}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onDownload={onDownload}
        onGenerateVoiceover={onGenerateVoiceover}
        isListView={isListView}
      />
    </div>
  );

  return (
    <Reorder.Item
      value={scene}
      dragListener={false}
      dragControls={dragControls}
      style={{ boxShadow, y }}
      layout
      layoutId={scene.id}
      className="relative group"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Drag handle */}
      <DragHandle dragControls={dragControls} />

      <div
        onClick={onToggle}
        className={`relative flex overflow-hidden transition-all duration-300 cursor-pointer ml-1 rounded-2xl
          ${isListView ? 'flex-row min-h-[120px]' : 'flex-col'}
          ${isSelected
            ? 'ring-2 ring-brand-blue shadow-[0_0_0_4px_rgba(0,144,255,0.12)]'
            : 'ring-1 ring-slate-200 dark:ring-white/8 hover:ring-brand-blue/30 hover:shadow-xl dark:hover:shadow-brand-blue/5'
          }
          bg-white dark:bg-[#0d0d10]`}
      >
        {visualArea}
        {infoPane}
      </div>
    </Reorder.Item>
  );
};

// ─── MAIN TAB COMPONENT ─────────────────────────────────────────────────────
export const StoryboardTab: React.FC<StoryboardTabProps> = ({
  script, setScript, scriptRefImage, setScriptRefImage, scriptRefAudio, setScriptRefAudio,
  totalDuration, setTotalDuration, sceneDuration, voiceOverEnabled, setVoiceOverEnabled,
  assets, addAsset, removeAsset, updateAsset, updateScene, handleReGenerateAsset, openAssetModal,
  onViewAsset, onViewScene,
  scenes, selectedSceneIds, toggleSceneSelection, selectAllScenes,
  isProcessing, isEnhancing, assetUploadRef, setActiveUploadAssetId,
  onOpenSettings, onOpenRenderConfig, onOpenAestheticConfig, onLoadSample, onLoadSuggestion, settings,
  onReGenerateSceneImage, onReGenerateSceneVideo, onDeleteScene, onDuplicateScene,
  onEnhanceScenePrompt, enhancingSceneId,
  onReorder, onShotTypeChange, onDurationChange,
  onGenerateImages, onGenerateVideos,
  onDownloadScene, onDownloadAudio, onGenerateVoiceover, onMoveScene,
}) => {
  const [viewLayout, setViewLayout] = useState<'grid' | 'list' | 'timeline'>('list');
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [keyboardDeleteConfirm, setKeyboardDeleteConfirm] = useState<string | null>(null);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang focus vào input / textarea / contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return;

      // Chỉ kích hoạt khi đúng 1 scene được chọn
      if (selectedSceneIds.length !== 1) return;
      const sceneId = selectedSceneIds[0];

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          setKeyboardDeleteConfirm(sceneId);
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          onDuplicateScene?.(sceneId);
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          onEnhanceScenePrompt?.(sceneId);
          break;
        case 'ArrowUp':
          e.preventDefault();
          onMoveScene?.(sceneId, 'up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          onMoveScene?.(sceneId, 'down');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedSceneIds, onDuplicateScene, onEnhanceScenePrompt, onDeleteScene, onMoveScene]);

  const allSelected = selectedSceneIds.length === scenes.length && scenes.length > 0;
  const processingCount = scenes.filter(s => s.status === 'generating' || s.status === 'analyzing').length;
  const totalScenes = scenes.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex-1 min-h-0 flex flex-col bg-[#fafafa] dark:bg-[#050506] transition-colors duration-500 relative"
    >
      {/* ── Scrollable content area ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 lg:p-8 pb-24">
      <div className="max-w-[1600px] mx-auto w-full">

        {/* ── Scenes Panel ─────────────────────────────────────────── */}
        <div className="space-y-6 pt-2 border-slate-100 dark:border-white/5">
          {/* Header toolbar */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <MonitorPlay size={18} className="text-brand-blue" />
                <h3 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                  🎬 Phân Cảnh{scenes.length > 0 ? ` (${scenes.length})` : ''}
                </h3>
              </div>
              {scenes.length > 0 && selectedSceneIds.length > 0 && (
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-600 mt-1 ml-7">
                  {selectedSceneIds.length} đã chọn
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Select all */}
              {scenes.length > 0 && (
                <button
                  onClick={selectAllScenes}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                    allSelected
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'border-slate-200 dark:border-white/8 text-slate-500 dark:text-gray-500 hover:border-brand-blue/30 hover:text-brand-blue'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center ${allSelected ? 'bg-white border-white' : 'border-current'}`}>
                    {allSelected && <Check size={9} strokeWidth={3.5} className="text-brand-blue" />}
                  </div>
                  Chọn tất cả
                </button>
              )}
              {/* Download buttons */}
              {selectedSceneIds.length > 0 && (
                <>
                  <button
                    onClick={onGenerateImages}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                    <LucideImage size={12} /> Ảnh
                  </button>
                  <button
                    onClick={onGenerateVideos}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:text-purple-500 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                    <Film size={12} /> Video
                  </button>
                </>
              )}
              {/* Layout toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/8">
                {[
                  { id: 'list',     icon: <SquareIcon size={13} />,     title: 'Danh sách' },
                  { id: 'grid',     icon: <Grid2X2 size={13} />,        title: 'Lưới' },
                  { id: 'timeline', icon: <AlignJustify size={13} />,   title: 'Timeline' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setViewLayout(l.id as any)}
                    title={l.title}
                    className={`p-2 rounded-lg transition-all ${viewLayout === l.id ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white'}`}
                  >
                    {l.icon}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* ── Batch progress indicator ─────────────────────── */}
          <AnimatePresence>
            {processingCount > 0 && (
              <motion.div
                key="batch-progress"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 px-1 py-2">
                  {/* Spinner */}
                  <Loader2 size={13} className="text-brand-blue animate-spin shrink-0" />

                  {/* Label */}
                  <span className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">
                    <span className="text-brand-blue">{processingCount}</span>
                    /{totalScenes} đang xử lý…
                  </span>

                  {/* Progress bar */}
                  <div className="flex-1 h-1 bg-slate-100 dark:bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-blue rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${totalScenes > 0 ? ((totalScenes - processingCount) / totalScenes) * 100 : 0}%`,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Percent */}
                  <span className="text-[9px] font-black tabular-nums text-slate-400 dark:text-white/30 shrink-0">
                    {totalScenes > 0 ? Math.round(((totalScenes - processingCount) / totalScenes) * 100) : 0}%
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scene grid / list / timeline */}
          {viewLayout === 'timeline' ? (
            <TimelineView
              scenes={scenes}
              assets={assets}
              selectedSceneIds={selectedSceneIds}
              isProcessing={isProcessing}
              onReorder={onReorder}
              onToggleSelect={toggleSceneSelection}
              onView={onViewScene}
              onReGenerateImage={onReGenerateSceneImage}
              onReGenerateVideo={onReGenerateSceneVideo}
              onDelete={onDeleteScene}
              onDuplicate={onDuplicateScene}
              enhancingSceneId={enhancingSceneId}
            />
          ) : isProcessing ? (
            <div className={`grid gap-4 lg:gap-6 ${viewLayout === 'list' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-2 xl:grid-cols-3'}`}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-video bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl animate-pulse flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-brand-blue/40" size={24} />
                  <span className="text-[9px] font-black text-slate-300 dark:text-gray-700 uppercase tracking-widest">Đang phân tích...</span>
                </div>
              ))}
            </div>
          ) : scenes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center gap-6 py-16 px-6 text-center border-2 border-dashed border-slate-200 dark:border-white/8 rounded-2xl bg-white dark:bg-white/[0.01]"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <Clapperboard size={28} className="text-slate-300 dark:text-white/20" />
              </div>

              {/* Title */}
              <div>
                <p className="text-lg font-black uppercase italic tracking-tight text-slate-400 dark:text-white/30">🎬 Chưa có phân cảnh nào</p>
                <p className="text-[11px] text-slate-400 dark:text-gray-600 mt-1.5">Để bắt đầu, hãy làm theo 3 bước:</p>
              </div>

              {/* 3-step guide */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                {[
                  { num: '1', text: 'Nhập kịch bản ở thanh bên trái' },
                  { num: '2', text: 'Chọn model AI (Flux / SDXL)' },
                  { num: '3', text: 'Nhấn "Tạo kịch bản"' },
                ].map((step, i) => (
                  <React.Fragment key={step.num}>
                    <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-left">
                      <span className="w-6 h-6 rounded-full bg-brand-blue/90 text-white text-[10px] font-black flex items-center justify-center shrink-0">{step.num}</span>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-gray-300 whitespace-nowrap">{step.text}</span>
                    </div>
                    {i < 2 && <span className="text-slate-200 dark:text-white/15 font-black hidden sm:block">→</span>}
                  </React.Fragment>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => setIsTemplatePickerOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/20 hover:border-brand-blue/40 rounded-xl text-[11px] font-black uppercase tracking-widest text-brand-blue transition-all"
              >
                <LayoutGrid size={13} /> 📋 Dùng mẫu kịch bản có sẵn
              </button>
            </motion.div>
          ) : (
            <Reorder.Group
              axis="y"
              values={scenes}
              onReorder={onReorder}
              className={`grid gap-4 lg:gap-6 ${viewLayout === 'list' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-2 xl:grid-cols-3'}`}
            >
              {scenes.map((scene, i) => (
                <SceneCardWrapper
                  key={scene.id}
                  scene={scene}
                  index={i}
                  isSelected={selectedSceneIds.includes(scene.id)}
                  assets={assets}
                  isProcessing={isProcessing}
                  isEnhancingPrompt={enhancingSceneId === scene.id}
                  viewLayout={viewLayout}
                  onToggle={() => toggleSceneSelection(scene.id)}
                  onView={() => onViewScene(scene)}
                  onUpdate={(updates) => updateScene(scene.id, updates)}
                  onReGenerateImage={() => onReGenerateSceneImage(scene.id)}
                  onReGenerateVideo={() => onReGenerateSceneVideo(scene.id)}
                  onDelete={() => onDeleteScene(scene.id)}
                  onDuplicate={onDuplicateScene ? () => onDuplicateScene(scene.id) : undefined}
                  onEnhancePrompt={onEnhanceScenePrompt ? () => onEnhanceScenePrompt(scene.id) : undefined}
                  onDownload={onDownloadScene && (scene.videoUrl || scene.visualUrl) ? () => onDownloadScene(scene) : undefined}
                  onDownloadAudio={onDownloadAudio && scene.audioUrl ? () => onDownloadAudio(scene) : undefined}
                  onGenerateVoiceover={onGenerateVoiceover ? () => onGenerateVoiceover(scene.id) : undefined}
                  onShotTypeChange={(st) => onShotTypeChange(scene.id, st)}
                  onDurationChange={(d) => onDurationChange(scene.id, d)}
                />
              ))}
            </Reorder.Group>
          )}
        </div>

      </div>
      </div>

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        onSelect={(script) => setScript(script)}
      />

      {/* Keyboard delete confirm dialog */}
      <AnimatePresence>
        {keyboardDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setKeyboardDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="bg-white dark:bg-[#131318] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-[11px] font-black uppercase tracking-widest text-rose-500 mb-1">Xác nhận xoá</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-white/80 leading-snug">
                Bạn có chắc muốn xoá cảnh này không?
              </p>
              <p className="text-[10px] text-slate-400 dark:text-white/30 mt-1">Hành động này không thể hoàn tác.</p>
              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={() => setKeyboardDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-all"
                >
                  Huỷ
                </button>
                <button
                  onClick={() => {
                    onDeleteScene(keyboardDeleteConfirm);
                    setKeyboardDeleteConfirm(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
                >
                  Xoá cảnh
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
