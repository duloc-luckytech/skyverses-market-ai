
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls, useMotionValue, useTransform } from 'framer-motion';
import {
  Zap, Layers, Plus, RefreshCw, AlertCircle, Clock,
  Trash2, Check, MonitorPlay, User, Maximize2,
  Download, Grid2X2, Edit3, Film,
  Image as LucideImage, Loader2, Square as SquareIcon, LayoutGrid, Settings,
  Sparkles, Camera, Music, Mic, FileAudio, Clapperboard,
  Play, Video, AlignJustify,
} from 'lucide-react';
import { ReferenceAsset, Scene, ShotType, DurationPreset } from '../../hooks/useStoryboardStudio';
import { IdentityAnchors } from './IdentityAnchors';
import { SceneCardHeader }    from './scene-card/SceneCardHeader';
import { DragHandle }         from './scene-card/DragHandle';
import { SceneHoverActions }  from './scene-card/SceneHoverActions';
import AIScriptAssistant      from './AIScriptAssistant';
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
  onEnhanceScenePrompt?: (sceneId: string) => void;
  enhancingSceneId?: string | null;
  onReorder: (reordered: Scene[]) => void;
  onShotTypeChange: (sceneId: string, shotType: ShotType) => void;
  onDurationChange: (sceneId: string, duration: DurationPreset) => void;
}

// ─── SCENE CARD WRAPPER (with drag support) ─────────────────────────────────
interface SceneCardWrapperProps {
  scene: Scene;
  index: number;
  isSelected: boolean;
  assets: ReferenceAsset[];
  isProcessing: boolean;
  isEnhancingPrompt?: boolean;
  onToggle: () => void;
  onView: () => void;
  onUpdate: (updates: any) => void;
  onReGenerateImage: () => void;
  onReGenerateVideo: () => void;
  onDelete: () => void;
  onEnhancePrompt?: () => void;
  onShotTypeChange: (st: ShotType) => void;
  onDurationChange: (d: DurationPreset) => void;
}

const SceneCardWrapper: React.FC<SceneCardWrapperProps> = ({
  scene, index, isSelected, assets, isProcessing, isEnhancingPrompt,
  onToggle, onView, onUpdate, onReGenerateImage, onReGenerateVideo,
  onDelete, onEnhancePrompt, onShotTypeChange, onDurationChange,
}) => {
  const dragControls = useDragControls();
  const y = useMotionValue(0);
  const boxShadow = useTransform(
    y,
    [-5, 0, 5],
    ['0 8px 30px rgba(0,144,255,0.18)', '0 2px 8px rgba(0,0,0,0.08)', '0 8px 30px rgba(0,144,255,0.18)']
  );
  const [hovered, setHovered] = useState(false);

  const hasVideo = !!scene.videoUrl;
  const hasImage = !!scene.visualUrl;
  const isGenerating = scene.status === 'generating';

  const characterAssets = (scene.characterIds || [])
    .map(id => assets.find(a => a.id === id))
    .filter(Boolean) as ReferenceAsset[];

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
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ml-1
          ${isSelected
            ? 'ring-2 ring-brand-blue shadow-[0_0_0_4px_rgba(0,144,255,0.12)]'
            : 'ring-1 ring-slate-200 dark:ring-white/8 hover:ring-brand-blue/30 hover:shadow-xl dark:hover:shadow-brand-blue/5'
          }
          bg-white dark:bg-[#0d0d10]`}
      >
        {/* ── Scene card header (shot type, duration, status) ── */}
        <SceneCardHeader
          sceneIndex={index}
          shotType={scene.shotType ?? 'WIDE'}
          duration={scene.duration ?? 8}
          status={scene.status}
          onShotTypeChange={onShotTypeChange}
          onDurationChange={onDurationChange}
          isProcessing={isProcessing}
        />

        {/* ── Visual Area ─────────────────────────────────────── */}
        <div
          onClick={(e) => { if (hasImage || hasVideo) { e.stopPropagation(); onView(); } }}
          className="relative aspect-video bg-slate-100 dark:bg-black overflow-hidden"
        >
          {/* State A: Empty */}
          {!hasImage && !hasVideo && !isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0f0f14] dark:to-[#0a0a0e]">
              <Clapperboard size={32} className="text-slate-300 dark:text-white/15" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-white/15">Chưa render</span>
            </div>
          )}

          {/* State B: Has image */}
          {hasImage && !hasVideo && (
            <>
              <img src={scene.visualUrl!} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={`Cảnh ${scene.order}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={(e) => { e.stopPropagation(); onView(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-brand-blue/60 transition-colors"
                >
                  <Maximize2 size={11} /> Xem đầy đủ
                </button>
              </div>
            </>
          )}

          {/* State C: Has video */}
          {hasVideo && (
            <>
              <video src={scene.videoUrl!} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={(e) => { e.stopPropagation(); onView(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-brand-blue/60 transition-colors"
                >
                  <Play size={11} fill="currentColor" /> Xem toàn màn hình
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className="flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-white hover:bg-white/20 transition-colors"
                  title="Tải xuống"
                >
                  <Download size={11} />
                </button>
              </div>
            </>
          )}

          {/* Generating state overlay */}
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
          {hasVideo && (
            <div className="absolute top-2 right-9 bg-purple-600 text-white text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">VIDEO</div>
          )}
          {hasImage && !hasVideo && (
            <div className="absolute top-2 right-9 bg-brand-blue text-white text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">HÌNH</div>
          )}

          {/* Selection checkbox */}
          <div
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-sm
              ${isSelected
                ? 'bg-brand-blue border-brand-blue'
                : 'bg-white/50 dark:bg-black/40 border-slate-300 dark:border-white/20 opacity-0 group-hover:opacity-100'
              }`}
          >
            {isSelected && <Check size={11} strokeWidth={3.5} className="text-white" />}
          </div>

          {/* Hover quick actions overlay */}
          <SceneHoverActions
            visible={hovered && !isGenerating}
            isProcessing={isProcessing}
            isEnhancingPrompt={isEnhancingPrompt}
            onRegenerateImage={onReGenerateImage}
            onRegenerateVideo={onReGenerateVideo}
            onEnhancePrompt={onEnhancePrompt ?? (() => {})}
            onDelete={onDelete}
          />
        </div>

        {/* ── Character strip ─────────────────────────────────── */}
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

        {/* ── Prompt textarea ──────────────────────────────────── */}
        <div className="p-4 flex-grow space-y-3 bg-white dark:bg-transparent">
          <div>
            <p className="text-[7px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest mb-1.5">Kịch bản chi tiết</p>
            <textarea
              value={scene.prompt}
              onChange={(e) => onUpdate({ prompt: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent border-none p-0 text-[11px] font-medium leading-relaxed text-slate-600 dark:text-gray-300 italic focus:ring-0 resize-none min-h-[48px] outline-none no-scrollbar"
              rows={3}
            />
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
};

// ─── SCENE CARD (legacy — kept for backward compat) ────────────────────────
interface SceneCardProps {
  scene: Scene;
  isSelected: boolean;
  assets: ReferenceAsset[];
  onToggle: () => void;
  onView: () => void;
  onUpdate: (updates: any) => void;
  onReGenerateImage: () => void;
  onReGenerateVideo: () => void;
  onDelete: () => void;
  onEnhancePrompt?: () => void;
  isEnhancingPrompt?: boolean;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, isSelected, assets, onToggle, onView, onUpdate, onReGenerateImage, onReGenerateVideo, onDelete, onEnhancePrompt, isEnhancingPrompt }) => {
  const hasVideo = !!scene.videoUrl;
  const hasImage = !!scene.visualUrl;
  const isGenerating = scene.status === 'generating';

  const characterAssets = (scene.characterIds || [])
    .map(id => assets.find(a => a.id === id))
    .filter(Boolean) as ReferenceAsset[];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onToggle}
      className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
        ${isSelected
          ? 'ring-2 ring-brand-blue shadow-[0_0_0_4px_rgba(0,144,255,0.12)]'
          : 'ring-1 ring-slate-200 dark:ring-white/8 hover:ring-brand-blue/30 hover:shadow-xl dark:hover:shadow-brand-blue/5'
        }
        bg-white dark:bg-[#0d0d10]`}
    >
      {/* ── Visual Area ─────────────────────────────────────── */}
      <div
        onClick={(e) => { if (hasImage || hasVideo) { e.stopPropagation(); onView(); } }}
        className="relative aspect-video bg-slate-100 dark:bg-black overflow-hidden"
      >
        {!hasImage && !hasVideo && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0f0f14] dark:to-[#0a0a0e]">
            <Clapperboard size={32} className="text-slate-300 dark:text-white/15" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-white/15">Chưa render</span>
          </div>
        )}
        {hasImage && !hasVideo && (
          <>
            <img src={scene.visualUrl!} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={`Cảnh ${scene.order}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button onClick={(e) => { e.stopPropagation(); onView(); }} className="flex-1 flex items-center justify-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-brand-blue/60 transition-colors">
                <Maximize2 size={11} /> Xem đầy đủ
              </button>
              <button onClick={(e) => { e.stopPropagation(); onReGenerateVideo(); }} className="flex items-center justify-center gap-1.5 bg-purple-600/60 backdrop-blur-md border border-purple-400/20 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-purple-600/80 transition-colors" title="Tạo video từ cảnh này"><Video size={11} /></button>
              <button onClick={(e) => { e.stopPropagation(); onReGenerateImage(); }} className="flex items-center justify-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-white hover:bg-brand-blue/50 transition-colors" title="Tạo lại ảnh"><RefreshCw size={11} /></button>
            </div>
          </>
        )}
        {hasVideo && (
          <>
            <video src={scene.videoUrl!} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button onClick={(e) => { e.stopPropagation(); onView(); }} className="flex-1 flex items-center justify-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-brand-blue/60 transition-colors"><Play size={11} fill="currentColor" /> Xem toàn màn hình</button>
              <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-white hover:bg-white/20 transition-colors" title="Tải xuống"><Download size={11} /></button>
              <button onClick={(e) => { e.stopPropagation(); onReGenerateVideo(); }} className="flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-white hover:bg-purple-600/50 transition-colors" title="Render lại video"><RefreshCw size={11} /></button>
            </div>
          </>
        )}
        {isGenerating && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-20">
            <div className="relative"><Loader2 className="text-brand-blue animate-spin" size={28} /><div className="absolute inset-0 rounded-full bg-brand-blue/20 blur-xl animate-pulse" /></div>
            <span className="text-[9px] font-black text-slate-700 dark:text-white uppercase tracking-[0.4em] animate-pulse">Rendering...</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-lg px-2.5 py-1 border border-slate-200/60 dark:border-white/10">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Cảnh {String(scene.order).padStart(2, '0')}</span>
        </div>
        {hasVideo && <div className="absolute top-3 right-10 bg-purple-600 text-white text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">VIDEO</div>}
        {hasImage && !hasVideo && <div className="absolute top-3 right-10 bg-brand-blue text-white text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">HÌNH</div>}
        <div onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${isSelected ? 'bg-brand-blue border-brand-blue' : 'bg-white/50 dark:bg-black/40 border-slate-300 dark:border-white/20 opacity-0 group-hover:opacity-100'}`}>
          {isSelected && <Check size={11} strokeWidth={3.5} className="text-white" />}
        </div>
      </div>
      {characterAssets.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
          <User size={10} className="text-emerald-500 shrink-0" />
          <span className="text-[7px] font-black uppercase text-emerald-500 tracking-widest shrink-0">Mỏ neo:</span>
          <div className="flex -space-x-1.5">
            {characterAssets.slice(0, 4).map((asset) => (
              <div key={asset.id} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0d0d10] overflow-hidden shadow-sm" title={asset.name}>
                {asset.url ? <img src={asset.url} className="w-full h-full object-cover" alt={asset.name} /> : <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[7px] font-black text-slate-500">{asset.name.charAt(0)}</div>}
              </div>
            ))}
            {characterAssets.length > 4 && <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0d0d10] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[7px] font-black text-slate-500">+{characterAssets.length - 4}</div>}
          </div>
        </div>
      )}
      <div className="p-4 flex-grow space-y-3 bg-white dark:bg-transparent">
        <div>
          <p className="text-[7px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest mb-1.5">Kịch bản chi tiết</p>
          <textarea value={scene.prompt} onChange={(e) => onUpdate({ prompt: e.target.value })} onClick={(e) => e.stopPropagation()} className="w-full bg-transparent border-none p-0 text-[11px] font-medium leading-relaxed text-slate-600 dark:text-gray-300 italic focus:ring-0 resize-none min-h-[48px] outline-none no-scrollbar" rows={3} />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-gray-600"><Clock size={10} /><span>{scene.duration || 8}s</span></div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={onReGenerateImage} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 hover:text-brand-blue transition-colors group/regen" title="Tạo lại ảnh"><RefreshCw size={10} className="group-hover/regen:rotate-180 transition-transform duration-700" /><span className="hidden sm:inline">Ảnh</span></button>
            <button onClick={onReGenerateVideo} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 hover:text-purple-500 transition-colors" title="Render video"><Video size={10} /><span className="hidden sm:inline">Video</span></button>
            <button onClick={onDelete} className="text-slate-300 dark:text-white/15 hover:text-red-500 transition-colors" title="Xóa cảnh"><Trash2 size={14}/></button>
            {onEnhancePrompt && (<button onClick={onEnhancePrompt} disabled={isEnhancingPrompt} className="text-slate-300 dark:text-white/15 hover:text-amber-400 transition-colors disabled:opacity-40" title="✨ AI cải thiện prompt">{isEnhancingPrompt ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}</button>)}
          </div>
        </div>
      </div>
    </motion.div>
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
  onReGenerateSceneImage, onReGenerateSceneVideo, onDeleteScene,
  onEnhanceScenePrompt, enhancingSceneId,
  onReorder, onShotTypeChange, onDurationChange,
}) => {
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const mainAudioInputRef = useRef<HTMLInputElement>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setScriptRefImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMainAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setScriptRefAudio(file.name);
  };

  const allSelected = selectedSceneIds.length === scenes.length && scenes.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex-grow flex flex-col p-5 lg:p-10 overflow-y-auto no-scrollbar bg-[#fafafa] dark:bg-[#050506] transition-colors duration-500"
    >
      <div className="max-w-[1600px] mx-auto w-full space-y-8 lg:space-y-10 pb-48 lg:pb-40">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-l-4 border-brand-blue pl-5">
          <Zap size={18} className="text-brand-blue" />
          <h2 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Tạo Kịch Bản</h2>
        </div>

        {/* ── Script Input ─────────────────────────────────────── */}
        <div className="space-y-4 max-w-6xl mx-auto w-full">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-[0.4em] italic">Ý TƯỞNG KỊCH BẢN</label>
          <div className="relative group">
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              disabled={isEnhancing}
              className={`w-full h-40 lg:h-52 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/8 px-6 py-5 rounded-2xl text-base lg:text-lg font-medium leading-relaxed outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/8 transition-all resize-none shadow-sm dark:shadow-xl text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/15 ${isEnhancing ? 'opacity-50' : ''}`}
              placeholder="Nhập ý tưởng kịch bản tại đây. Càng chi tiết, ảnh/video càng sát với tầm nhìn của bạn..."
            />
            {isEnhancing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-2xl z-20">
                <Loader2 size={28} className="text-brand-blue animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white animate-pulse mt-3">AI đang phân tích...</span>
              </div>
            )}
            <div className="absolute bottom-4 right-4 flex gap-3">
              <button onClick={onLoadSuggestion} disabled={isEnhancing} className="flex items-center gap-1.5 text-[9px] font-black text-brand-blue uppercase tracking-widest hover:underline transition-all disabled:opacity-30">
                <Sparkles size={11} /> Gợi ý AI
              </button>
              <button onClick={() => setIsTemplatePickerOpen(true)} disabled={isEnhancing} className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest hover:underline transition-all disabled:opacity-30">
                <LayoutGrid size={11} /> Dùng mẫu
              </button>
            </div>
          </div>

          {/* Attachment pills */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => mainImageInputRef.current?.click()}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                scriptRefImage
                  ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/8 text-slate-400 dark:text-gray-500 hover:border-brand-blue/30 hover:text-brand-blue'
              }`}
            >
              <LucideImage size={12} />
              {scriptRefImage ? '✓ Ảnh reference' : 'Tải ảnh nhân vật'}
            </button>
            <button
              onClick={() => mainAudioInputRef.current?.click()}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                scriptRefAudio
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/8 text-slate-400 dark:text-gray-500 hover:border-emerald-400/30 hover:text-emerald-500'
              }`}
            >
              <FileAudio size={12} />
              {scriptRefAudio ? `✓ ${scriptRefAudio}` : 'Tải audio lời bình'}
            </button>
            <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={handleMainImageUpload} />
            <input type="file" ref={mainAudioInputRef} className="hidden" accept="audio/*" onChange={handleMainAudioUpload} />
          </div>
        </div>

        {/* ── Config summary bar ───────────────────────────────── */}
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Models bar */}
          <div className="xl:col-span-2 bg-white dark:bg-[#0a0a0e] border border-slate-200 dark:border-white/8 rounded-2xl p-4 lg:p-5 flex flex-wrap items-center gap-6 shadow-sm">
            {[
              { icon: <LucideImage size={13} />, label: 'Image', val: settings.imageModel?.replace(/_/g, ' ') || 'Auto', color: 'text-brand-blue bg-brand-blue/10' },
              { icon: <Film size={13} />, label: 'Video', val: settings.model?.toUpperCase() || 'Auto', color: 'text-purple-500 bg-purple-500/10' },
              { icon: <Maximize2 size={13} />, label: 'Res', val: '1080P · 16:9', color: 'text-emerald-500 bg-emerald-500/10' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${item.color}`}>{item.icon}</div>
                <div>
                  <p className="text-[7px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">{item.label}</p>
                  <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase italic leading-tight mt-0.5 truncate max-w-[120px]">{item.val}</p>
                </div>
              </div>
            ))}
            <button
              onClick={onOpenRenderConfig}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/8 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white transition-all border border-slate-100 dark:border-white/5"
            >
              <Settings size={12} /> Cấu hình
            </button>
          </div>

          {/* Aesthetic profile */}
          <div className="bg-white dark:bg-[#0a0a0e] border border-slate-200 dark:border-white/8 rounded-2xl p-4 lg:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-brand-blue" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Aesthetic Profile</span>
              </div>
              <button onClick={onOpenAestheticConfig} className="text-[8px] font-black text-brand-blue uppercase tracking-wider hover:underline">Cài đặt</button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {[
                { l: 'Format', v: settings.format },
                { l: 'Style', v: settings.style },
                { l: 'Culture', v: settings.culture },
              ].map((row) => row.v && (
                <div key={row.l} className="space-y-0.5">
                  <p className="text-[7px] font-black text-slate-400 dark:text-gray-600 uppercase leading-none">{row.l}</p>
                  <p className="text-[9px] font-bold text-slate-600 dark:text-gray-300 truncate leading-tight">{row.v}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 col-span-2">
                <div className="flex items-center gap-1"><Music size={9} className="text-slate-300 dark:text-white/20" /><div className={`w-1.5 h-1.5 rounded-full ${settings.bgm ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-white/10'}`} /></div>
                <div className="flex items-center gap-1"><Mic size={9} className="text-slate-300 dark:text-white/20" /><div className={`w-1.5 h-1.5 rounded-full ${settings.voiceOver ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-white/10'}`} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Duration HUD ─────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#0a0a0e] border border-slate-200 dark:border-white/8 rounded-2xl p-4 lg:p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 leading-none tracking-widest">Tổng thời lượng</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <input
                      type="number" step={8} min={8} value={totalDuration}
                      onChange={(e) => setTotalDuration(parseInt(e.target.value) || 8)}
                      className="bg-transparent border-none text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white w-14 outline-none focus:ring-0 p-0"
                    />
                    <span className="text-lg font-black italic text-slate-200 dark:text-white/20">s</span>
                  </div>
                </div>
              </div>
              <span className="text-[8px] font-black text-slate-200 dark:text-white/15 uppercase italic">÷8</span>
            </div>
            <div className="bg-white dark:bg-[#0a0a0e] border border-slate-200 dark:border-white/8 rounded-2xl p-4 lg:p-5 flex items-center justify-between shadow-sm opacity-60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 dark:text-gray-500">
                  <LayoutGrid size={16} />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 leading-none tracking-widest">Thời lượng cảnh</p>
                  <p className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white mt-1 leading-none">{sceneDuration}s</p>
                </div>
              </div>
              <span className="text-[8px] font-black text-slate-200 dark:text-white/15 uppercase italic">FIXED</span>
            </div>
          </div>
        </div>

        {/* ── Identity Anchors ─────────────────────────────────── */}
        <IdentityAnchors
          assets={assets}
          openAssetModal={openAssetModal}
          onViewAsset={onViewAsset}
          removeAsset={removeAsset}
          handleReGenerateAsset={handleReGenerateAsset}
        />

        {/* ── AI Script Assistant — Phase 3 ────────────────────── */}
        <AIScriptAssistant
          script={script}
          scenes={scenes}
          settings={settings}
          onScriptUpdate={setScript}
          isProcessing={isProcessing}
        />

        {/* ── Scene Grid ───────────────────────────────────────── */}
        <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-white/5">
          {/* Header toolbar */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <MonitorPlay size={18} className="text-brand-blue" />
                <h3 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Bản thảo phân cảnh</h3>
              </div>
              {scenes.length > 0 && (
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-600 mt-1 ml-7">
                  {scenes.length} phân cảnh · {selectedSceneIds.length > 0 ? `${selectedSceneIds.length} đã chọn` : 'Chưa chọn'}
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
                  <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:text-brand-blue transition-all shadow-sm">
                    <LucideImage size={12} /> Ảnh
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:text-purple-500 transition-all shadow-sm">
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
            <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <Clapperboard size={32} className="text-slate-300 dark:text-white/15" />
              </div>
              <div>
                <p className="text-lg font-black uppercase italic tracking-tight text-slate-300 dark:text-white/20">Chưa có phân cảnh</p>
                <p className="text-[11px] text-slate-400 dark:text-gray-600 mt-1">Nhập kịch bản và nhấn "Phân tách kịch bản" để bắt đầu</p>
              </div>
            </div>
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
                  onToggle={() => toggleSceneSelection(scene.id)}
                  onView={() => onViewScene(scene)}
                  onUpdate={(updates) => updateScene(scene.id, updates)}
                  onReGenerateImage={() => onReGenerateSceneImage(scene.id)}
                  onReGenerateVideo={() => onReGenerateSceneVideo(scene.id)}
                  onDelete={() => onDeleteScene(scene.id)}
                  onEnhancePrompt={onEnhanceScenePrompt ? () => onEnhanceScenePrompt(scene.id) : undefined}
                  onShotTypeChange={(st) => onShotTypeChange(scene.id, st)}
                  onDurationChange={(d) => onDurationChange(scene.id, d)}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        onSelect={(script) => setScript(script)}
      />
    </motion.div>
  );
};
