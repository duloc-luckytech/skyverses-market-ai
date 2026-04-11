/**
 * TimelineView.tsx — Phase 4: Horizontal Timeline View
 *
 * Horizontal timeline kiểu Premiere/DaVinci:
 *  - Ruler với timecodes (0s, 8s, 16s, …)
 *  - Scene blocks proportional to duration, draggable để reorder
 *  - Shot type color coding
 *  - Character tag dưới mỗi block
 *  - Click scene để select/deselect
 *  - Hover actions: regen image, regen video, delete
 *  - Playhead indicator kéo được
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  Play, Pause, RefreshCw, Trash2, Film, Image as LucideImage,
  Loader2, User, ChevronRight, Maximize2, Clock,
} from 'lucide-react';
import type { Scene, ReferenceAsset, ShotType } from '../../hooks/useStoryboardStudio';
import { SHOT_TYPE_COLORS, SHOT_TYPE_LABELS } from '../../hooks/useStoryboardStudio';

// ─── Constants ────────────────────────────────────────────────────────────────

/** px per second on the timeline ruler */
const PX_PER_SEC = 60;

/** Height of each track row */
const TRACK_HEIGHT = 96;

/** Ruler height */
const RULER_HEIGHT = 32;

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimelineViewProps {
  scenes: Scene[];
  assets: ReferenceAsset[];
  selectedSceneIds: string[];
  isProcessing: boolean;
  onReorder: (reordered: Scene[]) => void;
  onToggleSelect: (id: string) => void;
  onView: (scene: Scene) => void;
  onReGenerateImage: (id: string) => void;
  onReGenerateVideo: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  enhancingSceneId?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert seconds to "Xs" or "Xm Ys" label */
const fmtTime = (s: number): string => {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem === 0 ? `${m}m` : `${m}m ${rem}s`;
};

/** Build color classes for shot type block background */
const shotBg: Record<ShotType, string> = {
  WIDE: 'from-sky-500/20   to-sky-500/10   border-sky-500/30',
  MED:  'from-violet-500/20 to-violet-500/10 border-violet-500/30',
  CU:   'from-amber-500/20  to-amber-500/10  border-amber-500/30',
  ECU:  'from-rose-500/20   to-rose-500/10   border-rose-500/30',
  POV:  'from-emerald-500/20 to-emerald-500/10 border-emerald-500/30',
};

const shotLabel: Record<ShotType, string> = {
  WIDE: 'sky', MED: 'violet', CU: 'amber', ECU: 'rose', POV: 'emerald',
};

// ─── Scene Block ─────────────────────────────────────────────────────────────

interface SceneBlockProps {
  scene: Scene;
  index: number;
  assets: ReferenceAsset[];
  isSelected: boolean;
  isEnhancing: boolean;
  onToggle: () => void;
  onView: () => void;
  onReGenerateImage: () => void;
  onReGenerateVideo: () => void;
  onDelete: () => void;
}

const SceneBlock: React.FC<SceneBlockProps> = ({
  scene, index, assets, isSelected, isEnhancing,
  onToggle, onView, onReGenerateImage, onReGenerateVideo, onDelete,
}) => {
  const dragControls = useDragControls();
  const [hovered, setHovered] = useState(false);

  const blockW = (scene.duration ?? 8) * PX_PER_SEC;
  const shot = scene.shotType ?? 'WIDE';
  const bg = shotBg[shot] ?? shotBg.WIDE;

  // Characters linked to this scene
  const sceneChars = assets.filter(
    a => a.type === 'CHARACTER' && (scene.characterIds ?? []).includes(a.id),
  );

  return (
    <Reorder.Item
      value={scene}
      dragListener={false}
      dragControls={dragControls}
      className="relative shrink-0 cursor-pointer"
      style={{ width: blockW, height: TRACK_HEIGHT }}
      whileDrag={{ scale: 1.03, zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
    >
      {/* Main block */}
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onToggle}
        className={`
          relative h-full rounded-xl border bg-gradient-to-br overflow-hidden select-none
          transition-all duration-150
          ${bg}
          ${isSelected ? 'ring-2 ring-brand-blue ring-offset-1 ring-offset-black/50' : ''}
        `}
        style={{ width: blockW - 4, marginRight: 4 }}
      >
        {/* Thumbnail background */}
        {scene.visualUrl && (
          <img
            src={scene.visualUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            draggable={false}
          />
        )}

        {/* Top row: drag handle + scene# + shot badge */}
        <div className="relative flex items-center gap-1.5 px-2 pt-2 pb-1">
          {/* Drag handle */}
          <div
            onPointerDown={e => dragControls.start(e)}
            className="cursor-grab active:cursor-grabbing touch-none p-0.5 rounded opacity-40 hover:opacity-100 transition-opacity shrink-0"
            title="Kéo để reorder"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" className="fill-current text-white/60">
              <circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/>
              <circle cx="2" cy="6" r="1.2"/><circle cx="6" cy="6" r="1.2"/>
              <circle cx="2" cy="10" r="1.2"/><circle cx="6" cy="10" r="1.2"/>
            </svg>
          </div>

          {/* Scene number */}
          <span className="text-[9px] font-black text-white/80 uppercase tracking-widest shrink-0">
            #{scene.order.toString().padStart(2, '0')}
          </span>

          {/* Shot type badge */}
          <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full border shrink-0 ${SHOT_TYPE_COLORS[shot]}`}>
            {SHOT_TYPE_LABELS[shot]}
          </span>

          {/* Status dot */}
          <div className="ml-auto shrink-0">
            {scene.status === 'generating' || isEnhancing ? (
              <Loader2 size={9} className="animate-spin text-brand-blue" />
            ) : scene.status === 'done' ? (
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : scene.status === 'error' ? (
              <div className="w-2 h-2 rounded-full bg-rose-400" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-white/20" />
            )}
          </div>
        </div>

        {/* Prompt text */}
        <p className="relative px-2 text-[9px] leading-snug text-white/60 line-clamp-2 mb-auto">
          {scene.prompt.slice(0, 80)}
        </p>

        {/* Bottom row: duration + characters */}
        <div className="relative flex items-center justify-between px-2 pb-2 mt-auto pt-1">
          <div className="flex items-center gap-1 text-white/40">
            <Clock size={8} />
            <span className="text-[8px] font-bold">{fmtTime(scene.duration ?? 8)}</span>
          </div>

          {/* Character avatars */}
          <div className="flex items-center -space-x-1">
            {sceneChars.slice(0, 3).map(char => (
              char.url ? (
                <img
                  key={char.id}
                  src={char.url}
                  alt={char.name}
                  title={char.name}
                  className="w-5 h-5 rounded-full border border-black/40 object-cover shrink-0"
                  draggable={false}
                />
              ) : (
                <div
                  key={char.id}
                  title={char.name}
                  className="w-5 h-5 rounded-full border border-black/40 bg-white/10 flex items-center justify-center shrink-0"
                >
                  <User size={8} className="text-white/50" />
                </div>
              )
            ))}
            {sceneChars.length === 0 && (
              <span className="text-[7px] text-white/20 italic">—</span>
            )}
          </div>
        </div>

        {/* Video indicator */}
        {scene.videoUrl && (
          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded bg-purple-500/30 flex items-center justify-center">
            <Film size={8} className="text-purple-300" />
          </div>
        )}

        {/* Hover action bar */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1 py-1.5 bg-black/60 backdrop-blur-sm"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={onView}
                title="Xem chi tiết"
                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-brand-blue hover:text-white flex items-center justify-center text-white/60 transition-all"
              >
                <Maximize2 size={9} />
              </button>
              <button
                onClick={onReGenerateImage}
                title="Tái tạo ảnh"
                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-sky-500 hover:text-white flex items-center justify-center text-white/60 transition-all"
              >
                <LucideImage size={9} />
              </button>
              <button
                onClick={onReGenerateVideo}
                title="Tái tạo video"
                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-purple-500 hover:text-white flex items-center justify-center text-white/60 transition-all"
              >
                <Film size={9} />
              </button>
              <button
                onClick={onDelete}
                title="Xóa"
                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-rose-500 hover:text-white flex items-center justify-center text-white/60 transition-all"
              >
                <Trash2 size={9} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reorder.Item>
  );
};

// ─── Ruler ────────────────────────────────────────────────────────────────────

interface RulerProps {
  totalSeconds: number;
  currentTime: number;
  onSeek: (t: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const Ruler: React.FC<RulerProps> = ({ totalSeconds, currentTime, onSeek, containerRef }) => {
  const rulerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    const rect = rulerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const t = Math.max(0, Math.min(totalSeconds, x / PX_PER_SEC));
    onSeek(t);
  };

  const ticks: number[] = [];
  // Major tick every 8s, minor tick every 4s
  for (let t = 0; t <= totalSeconds + 8; t += 4) ticks.push(t);

  return (
    <div
      ref={rulerRef}
      onClick={handleClick}
      className="relative flex-shrink-0 cursor-col-resize bg-slate-100 dark:bg-black/60 border-b border-slate-200 dark:border-white/8"
      style={{ height: RULER_HEIGHT, width: Math.max(totalSeconds * PX_PER_SEC + 120, 600) }}
    >
      {ticks.map(t => {
        const isMajor = t % 8 === 0;
        return (
          <div
            key={t}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: t * PX_PER_SEC }}
          >
            <div className={`${isMajor ? 'h-4 w-px bg-slate-400 dark:bg-white/30' : 'h-2 w-px bg-slate-300 dark:bg-white/10'}`} />
            {isMajor && (
              <span className="text-[8px] font-bold text-slate-400 dark:text-white/30 mt-0.5 select-none">
                {fmtTime(t)}
              </span>
            )}
          </div>
        );
      })}

      {/* Playhead indicator */}
      <motion.div
        className="absolute top-0 bottom-0 w-px bg-brand-blue pointer-events-none"
        style={{ left: currentTime * PX_PER_SEC }}
      >
        <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-brand-blue rotate-45" />
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TimelineView: React.FC<TimelineViewProps> = ({
  scenes,
  assets,
  selectedSceneIds,
  isProcessing,
  onReorder,
  onToggleSelect,
  onView,
  onReGenerateImage,
  onReGenerateVideo,
  onDelete,
  enhancingSceneId,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = scenes.reduce((acc, s) => acc + (s.duration ?? 8), 0);

  // Determine which scene is "active" based on playhead
  const activeSceneIndex = (() => {
    let t = 0;
    for (let i = 0; i < scenes.length; i++) {
      t += scenes[i].duration ?? 8;
      if (currentTime < t) return i;
    }
    return scenes.length - 1;
  })();

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [isPlaying, totalDuration]);

  // Scroll playhead into view during playback
  useEffect(() => {
    if (!isPlaying || !scrollRef.current) return;
    const x = currentTime * PX_PER_SEC;
    const container = scrollRef.current;
    const visible = container.scrollLeft + container.clientWidth;
    if (x > visible - 80) {
      container.scrollLeft = x - container.clientWidth / 2;
    }
  }, [currentTime, isPlaying]);

  const handleSeek = useCallback((t: number) => {
    setCurrentTime(t);
    setIsPlaying(false);
  }, []);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-400 dark:text-white/30">
        <Loader2 size={20} className="animate-spin text-brand-blue" />
        <span className="text-[11px] font-black uppercase tracking-widest">Đang phân tích...</span>
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
          <Film size={28} className="text-slate-300 dark:text-white/15" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">
          Chưa có phân cảnh để hiển thị timeline
        </p>
      </div>
    );
  }

  // Build cumulative start times for each scene
  const sceneOffsets: number[] = [];
  let offset = 0;
  for (const s of scenes) {
    sceneOffsets.push(offset);
    offset += s.duration ?? 8;
  }

  const totalWidth = Math.max(totalDuration * PX_PER_SEC + 120, 600);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a0a0e] overflow-hidden shadow-sm"
    >
      {/* ── Transport controls ─────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(v => !v)}
          className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-md shadow-brand-blue/20"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        {/* Time display */}
        <div className="tabular-nums text-[11px] text-slate-500 dark:text-white/40 min-w-[72px]">
          {fmtTime(Math.round(currentTime))} / {fmtTime(totalDuration)}
        </div>

        {/* Reset */}
        <button
          onClick={() => { setCurrentTime(0); setIsPlaying(false); }}
          className="w-7 h-7 rounded-xl border border-slate-200 dark:border-white/8 flex items-center justify-center text-slate-400 dark:text-white/30 hover:text-brand-blue hover:border-brand-blue/30 transition-all"
          title="Reset về 0"
        >
          <RefreshCw size={11} />
        </button>

        <div className="ml-auto flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">
          <span>{scenes.length} cảnh</span>
          <span>·</span>
          <span>{fmtTime(totalDuration)} tổng</span>
        </div>
      </div>

      {/* ── Track labels column ─────────────────────────────────── */}
      <div className="flex overflow-hidden">
        {/* Left labels panel */}
        <div
          className="shrink-0 border-r border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-black/40"
          style={{ width: 80 }}
        >
          {/* Ruler label cell */}
          <div
            className="flex items-center justify-center border-b border-slate-200 dark:border-white/8"
            style={{ height: RULER_HEIGHT }}
          >
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">
              Time
            </span>
          </div>
          {/* Track label */}
          <div
            className="flex items-center justify-center"
            style={{ height: TRACK_HEIGHT }}
          >
            <div className="-rotate-90 whitespace-nowrap text-[8px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">
              Scenes
            </div>
          </div>
          {/* Character track label */}
          <div
            className="flex items-center justify-center border-t border-slate-200 dark:border-white/8"
            style={{ height: 32 }}
          >
            <div className="-rotate-90 whitespace-nowrap text-[8px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">
              Chars
            </div>
          </div>
        </div>

        {/* Scrollable timeline area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto no-scrollbar relative"
          style={{ maxHeight: RULER_HEIGHT + TRACK_HEIGHT + 32 + 2 }}
        >
          <div style={{ width: totalWidth }}>

            {/* Ruler */}
            <Ruler
              totalSeconds={totalDuration}
              currentTime={currentTime}
              onSeek={handleSeek}
              containerRef={scrollRef}
            />

            {/* Scene track */}
            <Reorder.Group
              axis="x"
              values={scenes}
              onReorder={onReorder}
              className="flex items-stretch gap-0 bg-slate-100/50 dark:bg-white/[0.015] border-b border-slate-200 dark:border-white/5"
              style={{ height: TRACK_HEIGHT, width: totalWidth }}
            >
              {scenes.map((scene, i) => (
                <SceneBlock
                  key={scene.id}
                  scene={scene}
                  index={i}
                  assets={assets}
                  isSelected={selectedSceneIds.includes(scene.id)}
                  isEnhancing={enhancingSceneId === scene.id}
                  onToggle={() => onToggleSelect(scene.id)}
                  onView={() => onView(scene)}
                  onReGenerateImage={() => onReGenerateImage(scene.id)}
                  onReGenerateVideo={() => onReGenerateVideo(scene.id)}
                  onDelete={() => onDelete(scene.id)}
                />
              ))}
            </Reorder.Group>

            {/* Character presence track */}
            <div
              className="flex bg-slate-50 dark:bg-black/30"
              style={{ height: 32, width: totalWidth }}
            >
              {scenes.map((scene, i) => {
                const sceneChars = assets.filter(
                  a => a.type === 'CHARACTER' && (scene.characterIds ?? []).includes(a.id),
                );
                const blockW = (scene.duration ?? 8) * PX_PER_SEC;
                const shot = scene.shotType ?? 'WIDE';
                return (
                  <div
                    key={scene.id}
                    className="flex items-center gap-1 px-2 shrink-0 border-r border-slate-200 dark:border-white/5"
                    style={{ width: blockW }}
                  >
                    {sceneChars.length === 0 ? (
                      <span className="text-[8px] text-slate-300 dark:text-white/15 italic">—</span>
                    ) : (
                      sceneChars.slice(0, 3).map(char => (
                        <span
                          key={char.id}
                          title={char.name}
                          className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full truncate max-w-[50px] ${SHOT_TYPE_COLORS[shot]}`}
                        >
                          {char.name.split(' ')[0]}
                        </span>
                      ))
                    )}
                  </div>
                );
              })}
            </div>

            {/* Playhead vertical line (overlaid on whole timeline) */}
            <div
              className="absolute top-0 bottom-0 w-px bg-brand-blue/60 pointer-events-none"
              style={{ left: currentTime * PX_PER_SEC }}
            />
          </div>
        </div>
      </div>

      {/* ── Scene info strip (shows active scene) ──────────────── */}
      <AnimatePresence mode="wait">
        {scenes[activeSceneIndex] && (
          <motion.div
            key={activeSceneIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-3 px-4 py-2 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]"
          >
            <ChevronRight size={12} className="text-brand-blue shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 shrink-0">
              Cảnh #{scenes[activeSceneIndex].order.toString().padStart(2, '0')}
            </span>
            <span
              className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${SHOT_TYPE_COLORS[scenes[activeSceneIndex].shotType ?? 'WIDE']}`}
            >
              {SHOT_TYPE_LABELS[scenes[activeSceneIndex].shotType ?? 'WIDE']}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-white/40 truncate flex-1">
              {scenes[activeSceneIndex].prompt.slice(0, 120)}
            </p>
            <span className="text-[9px] tabular-nums text-slate-300 dark:text-white/20 shrink-0">
              {fmtTime(sceneOffsets[activeSceneIndex])} → {fmtTime(sceneOffsets[activeSceneIndex] + (scenes[activeSceneIndex].duration ?? 8))}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimelineView;
