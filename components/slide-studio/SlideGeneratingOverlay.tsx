
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ImagePlay, CheckCircle2, Loader2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage = 'outline' | 'building' | 'genImages' | 'idle';

interface Props {
  isVisible: boolean;
  stage: Stage;
  progress: number;       // 0-100 — used during outline/building
  streamText: string;
  onCancel: () => void;
  /** Image deck gen-all progress — passed from workspace */
  genAllProgress?: { done: number; total: number } | null;
  /** Whether Image Deck Mode gen-all is running */
  isGenAlling?: boolean;
}

// ── Stage pills config ────────────────────────────────────────────────────────

const STAGE_ORDER: Stage[] = ['outline', 'building'];

function getStageStatus(stageId: Stage, current: Stage): 'done' | 'active' | 'pending' {
  const currentIdx = STAGE_ORDER.indexOf(current);
  const stageIdx   = STAGE_ORDER.indexOf(stageId);
  if (stageIdx < currentIdx) return 'done';
  if (stageIdx === currentIdx) return 'active';
  return 'pending';
}

// ── Floating particle (pure CSS, no canvas) ───────────────────────────────────

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: `${8 + Math.round(Math.sin(i * 1.3) * 38 + 38)}%`,
  y: `${8 + Math.round(Math.cos(i * 0.9) * 38 + 38)}%`,
  size: 3 + (i % 4),
  delay: i * 0.22,
  duration: 3.5 + (i % 3) * 0.8,
}));

// ── Component ─────────────────────────────────────────────────────────────────

const SlideGeneratingOverlay: React.FC<Props> = ({
  isVisible, stage, progress, streamText, onCancel,
  genAllProgress, isGenAlling,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [streamText]);

  // Determine if overlay should be shown
  const show = isVisible || (!!isGenAlling && !!genAllProgress);
  const showImageDeckStage = !!isGenAlling && !!genAllProgress;

  const stageLabelMap: Record<Stage, string> = {
    outline:   'Đang tạo nội dung outline...',
    building:  'Đang xây dựng slides...',
    genImages: 'Đang gen ảnh AI cho từng slide...',
    idle:      '',
  };
  const stageLabel = showImageDeckStage ? stageLabelMap.genImages : stageLabelMap[stage];
  const stageIcon  = showImageDeckStage ? '🎨' : stage === 'outline' ? '✨' : stage === 'building' ? '📐' : '⚡';

  const barPct = showImageDeckStage && genAllProgress
    ? Math.round((genAllProgress.done / genAllProgress.total) * 100)
    : progress;

  const pills: { id: Stage; label: string }[] = [
    { id: 'outline',  label: '✨ Outline' },
    { id: 'building', label: '📐 Slides' },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="slide-generating-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 z-[200] bg-slate-950/96 backdrop-blur-lg flex flex-col items-center justify-center p-8 overflow-hidden"
        >
          {/* ── Floating particles background ── */}
          {PARTICLES.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-brand-blue/20 pointer-events-none"
              style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
              animate={{ y: [-8, 8, -8], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          {/* ── Inner card ── */}
          <div className="w-full max-w-md flex flex-col items-center gap-5 relative z-10">

            {/* Glowing animated icon ring */}
            <div className="relative">
              {/* Outer glow pulse */}
              <motion.div
                className="absolute inset-0 rounded-full bg-brand-blue/20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: showImageDeckStage ? 1.5 : 2.5, repeat: Infinity, ease: 'linear' }}
                className={`w-16 h-16 rounded-full border-[3px] border-t-brand-blue ${
                  showImageDeckStage ? 'border-violet-500/20 border-t-violet-400' : 'border-brand-blue/20'
                }`}
              />
              {/* Icon center */}
              <div className="absolute inset-0 flex items-center justify-center text-2xl select-none">
                {stageIcon}
              </div>
            </div>

            {/* Stage label + % */}
            <div className="text-center">
              <motion.p
                key={stageLabel}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white font-semibold text-sm leading-snug"
              >
                {stageLabel}
              </motion.p>
              <p className="text-white/40 text-xs mt-1">
                {barPct > 0 ? `${barPct}%` : 'Đang khởi động...'}
              </p>
            </div>

            {/* Stage pills — only for non-image-deck stages */}
            {!showImageDeckStage && isVisible && (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {pills.map((s, idx) => {
                  const status = getStageStatus(s.id, stage);
                  return (
                    <React.Fragment key={s.id}>
                      <motion.span
                        animate={status === 'active' ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className={[
                          'px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-300',
                          status === 'active'  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' : '',
                          status === 'done'    ? 'text-emerald-400 opacity-70 line-through' : '',
                          status === 'pending' ? 'text-white/25' : '',
                        ].join(' ')}
                      >
                        {s.label}
                      </motion.span>
                      {idx < pills.length - 1 && (
                        <span className="text-white/20 text-xs">→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* ── Image Deck gen-all grid ── */}
            <AnimatePresence>
              {showImageDeckStage && genAllProgress && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  {/* Slide chips grid */}
                  <div className="grid grid-cols-6 gap-1.5 justify-center mb-3">
                    {Array.from({ length: genAllProgress.total }, (_, i) => {
                      const isDone = i < genAllProgress.done;
                      const isActive = i === genAllProgress.done;
                      return (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className={`relative aspect-video rounded-md flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                            isDone
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                              : isActive
                                ? 'bg-violet-500/20 border border-violet-400/60 text-violet-300'
                                : 'bg-white/[0.05] border border-white/[0.08] text-white/20'
                          }`}
                        >
                          {isDone
                            ? <CheckCircle2 size={10} className="text-emerald-400" />
                            : isActive
                              ? <Loader2 size={9} className="animate-spin text-violet-400" />
                              : <span>{i + 1}</span>
                          }
                          {/* Active glow */}
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-md bg-violet-400/10"
                              animate={{ opacity: [0.3, 0.8, 0.3] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Count text */}
                  <p className="text-center text-[11px] text-white/50">
                    <span className="text-violet-400 font-bold">{genAllProgress.done}</span>
                    <span className="text-white/30"> / {genAllProgress.total} ảnh đã gen</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar */}
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  showImageDeckStage
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-400'
                    : 'bg-gradient-to-r from-brand-blue to-violet-500'
                }`}
                initial={{ width: '0%' }}
                animate={{ width: `${barPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* Terminal stream — only during outline */}
            <AnimatePresence>
              {stage === 'outline' && isVisible && !showImageDeckStage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <div
                    ref={terminalRef}
                    className="w-full bg-black/60 rounded-xl border border-white/10 p-4 font-mono text-[11px] text-emerald-400 overflow-y-auto max-h-[130px] leading-relaxed"
                  >
                    {streamText.length > 0 ? (
                      <>
                        <span className="whitespace-pre-wrap">{streamText.slice(-600)}</span>
                        <span className="inline-block w-[5px] h-[12px] bg-emerald-400 ml-0.5 animate-pulse align-middle" />
                      </>
                    ) : (
                      <span className="text-white/20">Đang kết nối AI...</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image Deck mode label */}
            {showImageDeckStage && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30">
                <ImagePlay size={11} className="text-violet-400" />
                <span className="text-[10px] text-violet-300 font-semibold">Image Deck Mode</span>
              </div>
            )}

            {/* Cancel */}
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-xs transition-colors mt-1"
            >
              <X size={12} />
              Huỷ
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SlideGeneratingOverlay;
