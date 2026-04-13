
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage = 'outline' | 'building' | 'idle';

interface Props {
  isVisible: boolean;
  stage: Stage;
  progress: number; // 0-100
  streamText: string;
  onCancel: () => void;
}

// ── Stage config ──────────────────────────────────────────────────────────────

const STAGES: { id: Stage; label: string }[] = [
  { id: 'outline',  label: '✨ Tạo outline' },
  { id: 'building', label: '📐 Xây dựng slides' },
];

const STAGE_ORDER: Stage[] = ['outline', 'building'];

function getStageStatus(stageId: Stage, current: Stage): 'done' | 'active' | 'pending' {
  const currentIdx = STAGE_ORDER.indexOf(current);
  const stageIdx   = STAGE_ORDER.indexOf(stageId);
  if (stageIdx < currentIdx) return 'done';
  if (stageIdx === currentIdx) return 'active';
  return 'pending';
}

// ── Component ─────────────────────────────────────────────────────────────────

const SlideGeneratingOverlay: React.FC<Props> = ({
  isVisible,
  stage,
  progress,
  streamText,
  onCancel,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom as new tokens arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [streamText]);

  const stageLabel = {
    outline:  'Đang tạo nội dung outline...',
    building: 'Đang xây dựng slides...',
    idle:     '',
  }[stage];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="slide-generating-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8"
        >
          {/* ── Inner card ── */}
          <div className="w-full max-w-md flex flex-col items-center gap-6">

            {/* Spinning icon */}
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-14 h-14 rounded-full border-[3px] border-brand-blue/20 border-t-brand-blue"
              />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                {stage === 'outline'  && '✨'}
                {stage === 'building' && '📐'}
                {stage === 'idle'     && '⚡'}
              </div>
            </div>

            {/* Stage label */}
            <div className="text-center">
              <p className="text-white font-semibold text-sm">{stageLabel}</p>
              <p className="text-white/40 text-xs mt-1">
                {progress > 0 ? `${progress}%` : 'Đang khởi động...'}
              </p>
            </div>

            {/* Stage pills */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {STAGES.map((s, idx) => {
                const status = getStageStatus(s.id, stage);
                return (
                  <React.Fragment key={s.id}>
                    <span
                      className={[
                        'px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-300',
                        status === 'active'  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' : '',
                        status === 'done'    ? 'text-emerald-400 opacity-70 line-through' : '',
                        status === 'pending' ? 'text-white/25' : '',
                      ].join(' ')}
                    >
                      {s.label}
                    </span>
                    {idx < STAGES.length - 1 && (
                      <span className="text-white/20 text-xs">→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-blue to-violet-500"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            {/* Terminal stream — only visible during outline stage */}
            <AnimatePresence>
              {stage === 'outline' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <div
                    ref={terminalRef}
                    className="w-full bg-black/60 rounded-xl border border-white/10 p-4 font-mono text-[11px] text-emerald-400 overflow-y-auto max-h-[140px] leading-relaxed"
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

            {/* Cancel button */}
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-xs transition-colors mt-2"
            >
              <X size={12} />
              Huỷ tạo deck
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SlideGeneratingOverlay;
