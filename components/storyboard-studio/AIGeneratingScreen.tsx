import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Film, Image as ImageIcon, Edit3, CheckCircle2 } from 'lucide-react';

interface AIGeneratingScreenProps {
  logs: string[];
  totalScenes?: number;
  progress?: number;
}

/* ── Processing stages ───────────────────────── */
const STAGES = [
  { id: 0, label: 'Phân tích',   icon: <Edit3 size={13} />,      color: 'text-sky-400',     bg: 'bg-sky-500/15',   border: 'border-sky-500/30' },
  { id: 1, label: 'Generate ảnh', icon: <ImageIcon size={13} />, color: 'text-violet-400',  bg: 'bg-violet-500/15', border: 'border-violet-500/30' },
  { id: 2, label: 'Tạo video',   icon: <Film size={13} />,       color: 'text-pink-400',    bg: 'bg-pink-500/15',   border: 'border-pink-500/30' },
  { id: 3, label: 'Hoàn tất',    icon: <CheckCircle2 size={13} />, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
];

const AVG_SECS_PER_SCENE = 18;

const detectStage = (logs: string[]): number => {
  const last = logs[logs.length - 1]?.toLowerCase() ?? '';
  if (last.includes('hoàn') || last.includes('done') || last.includes('complete')) return 3;
  if (last.includes('video') || last.includes('render')) return 2;
  if (last.includes('ảnh') || last.includes('image') || last.includes('generat')) return 1;
  return logs.length > 0 ? 1 : 0;
};

/* ── Floating particle ───────────────────────── */
const Particle: React.FC<{ delay: number; x: number; size: number; opacity: number }> = ({ delay, x, size, opacity }) => (
  <motion.div
    className="absolute bottom-0 rounded-full bg-brand-blue pointer-events-none"
    style={{ left: `${x}%`, width: size, height: size, opacity }}
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: -600, opacity: [0, opacity, 0] }}
    transition={{ duration: 6 + Math.random() * 4, delay, repeat: Infinity, ease: 'easeOut' }}
  />
);

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  delay: i * 0.4,
  x: 5 + (i * 5.5) % 90,
  size: 3 + (i % 4) * 2,
  opacity: 0.12 + (i % 5) * 0.06,
}));

/* ── Rotating tips text ──────────────────────── */
const TIPS_TEXT = [
  'AI đang phân tích từng cảnh quay theo phong cách điện ảnh...',
  'Đang áp dụng bố cục shot & góc máy tối ưu cho kịch bản...',
  'Tạo mô tả hình ảnh chi tiết cho từng phân cảnh...',
  'Đồng bộ nhân vật & địa điểm xuyên suốt kịch bản...',
  'Sắp hoàn tất — kịch bản đang được định hình...',
];

export const AIGeneratingScreen: React.FC<AIGeneratingScreenProps> = ({
  logs,
  totalScenes = 0,
  progress: progressProp,
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTipIndex(i => (i + 1) % TIPS_TEXT.length), 4000);
    return () => clearInterval(id);
  }, []);

  const progress = useMemo(() => {
    if (progressProp !== undefined) return Math.min(100, Math.max(0, progressProp));
    if (totalScenes === 0) return logs.length > 0 ? 20 : 5;
    return Math.min(95, Math.round((logs.length / (totalScenes * 3 + 2)) * 100));
  }, [progressProp, logs.length, totalScenes]);

  const currentStage = detectStage(logs);

  const elapsedSecs = Math.round((now - startTime) / 1000);
  const estTotalSecs = totalScenes > 0 ? totalScenes * AVG_SECS_PER_SCENE : 30;
  const etaSecs = Math.max(0, estTotalSecs - elapsedSecs);
  const etaLabel = etaSecs >= 60
    ? `~${Math.ceil(etaSecs / 60)} phút`
    : etaSecs > 5
      ? `~${etaSecs}s`
      : 'Sắp xong';

  /* Last log line */
  const lastLog = logs[logs.length - 1] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 60%, #0d0d18 0%, #060608 100%)' }}
    >
      {/* ── Background glow blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(56,117,255,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Particles ── */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map(p => <Particle key={p.id} {...p} />)}
      </div>

      {/* ── Main card ── */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-6 w-full max-w-lg">

        {/* ── AI Orb ── */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse rings */}
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-brand-blue/20"
              style={{ width: 80 + i * 32, height: 80 + i * 32 }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
          {/* Inner glow disc */}
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-blue via-blue-500 to-violet-600 flex items-center justify-center shadow-[0_0_60px_rgba(56,117,255,0.5)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <motion.div
              animate={{ rotate: -360, scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles size={32} className="text-white" />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Title ── */}
        <div className="text-center space-y-2">
          <motion.h2
            className="text-2xl md:text-3xl font-black text-white tracking-tight"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            AI đang tạo kịch bản
            <motion.span
              className="inline-flex ml-1 gap-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-brand-blue inline-block"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
            </motion.span>
          </motion.h2>

          {/* Rotating tip */}
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              className="text-sm text-white/40 font-medium tracking-wide max-w-sm mx-auto"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
            >
              {TIPS_TEXT[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── Progress section ── */}
        <div className="w-full space-y-4">
          {/* Stage pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {STAGES.map((s, i) => (
              <React.Fragment key={s.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-500 ${
                    currentStage === s.id
                      ? `${s.bg} ${s.border} ${s.color}`
                      : currentStage > s.id
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        : 'bg-white/[0.03] border-white/8 text-white/20'
                  }`}
                >
                  {currentStage > s.id ? (
                    <CheckCircle2 size={11} />
                  ) : currentStage === s.id ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block"
                    >
                      <Zap size={11} />
                    </motion.span>
                  ) : s.icon}
                  {s.label}
                </motion.div>
                {i < STAGES.length - 1 && (
                  <div className={`h-px w-5 rounded-full transition-all duration-500 ${currentStage > i ? 'bg-emerald-500/40' : 'bg-white/8'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="relative h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.05]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-blue via-blue-400 to-violet-500"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.8 }}
              />
              {/* shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-black uppercase tracking-widest text-brand-blue">
                {progress}% hoàn thành
              </span>
              <span className="text-[11px] font-medium text-white/25">{etaLabel}</span>
            </div>
          </div>
        </div>

        {/* ── Live log line ── */}
        <AnimatePresence mode="wait">
          {lastLog && (
            <motion.div
              key={lastLog}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] w-full"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              <p className="text-[11px] font-mono text-green-400/70 truncate">{lastLog}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
