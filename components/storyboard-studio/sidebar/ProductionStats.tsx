import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Crown, Zap } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface ProductionStatsProps {
  totalScenes: number;
  renderedCount: number;
  totalDuration: number;
}

const formatDuration = (secs: number): string => {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

/** Animate from 0 → target on mount */
function useCountUp(target: number, duration = 600): number {
  const [val, setVal] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out
      setVal(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return val;
}

const FREE_SCENE_LIMIT = 10;

export const ProductionStats: React.FC<ProductionStatsProps> = ({
  totalScenes,
  renderedCount,
  totalDuration,
}) => {
  const { isPro } = useAuth();
  const percent = totalScenes > 0 ? Math.round((renderedCount / totalScenes) * 100) : 0;

  const animScenes   = useCountUp(totalScenes);
  const animRendered = useCountUp(renderedCount);
  const animPercent  = useCountUp(percent);

  const quotaUsed = Math.min(totalScenes, FREE_SCENE_LIMIT);
  const quotaPct  = Math.round((quotaUsed / FREE_SCENE_LIMIT) * 100);

  const stats = [
    { label: 'Phân cảnh',  value: animScenes,                         accent: 'text-white' },
    { label: 'Đã render',  value: animRendered,                        accent: 'text-emerald-400' },
    { label: 'Hoàn thành', value: `${animPercent}%`,                   accent: 'text-brand-blue' },
    { label: 'Thời lượng', value: formatDuration(totalDuration),       accent: 'text-purple-400' },
  ];

  return (
    <div className="px-5 py-4 border-b border-white/8 space-y-2.5">
      {/* Header + tier badge */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
          <BarChart3 size={12} />
          Thống kê sản xuất
        </p>
        {isPro ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-brand-blue/15 to-purple-500/15 border border-brand-blue/25 text-[8px] font-black uppercase tracking-wider text-brand-blue">
            <Crown size={9} /> PRO
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-wider text-white/30">
            <Zap size={9} /> Free
          </div>
        )}
      </div>

      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl bg-white/[0.04] border border-white/8 px-3 py-2.5 space-y-0.5"
          >
            <p className={`text-sm font-black font-mono leading-none ${stat.accent}`}>
              {stat.value}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 leading-none mt-1">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quota bar — only for FREE users */}
      {!isPro && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">
              Cảnh đã dùng
            </p>
            <p className={`text-[9px] font-black font-mono ${quotaUsed >= FREE_SCENE_LIMIT ? 'text-red-400' : 'text-white/50'}`}>
              {quotaUsed}/{FREE_SCENE_LIMIT}
            </p>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${quotaUsed >= FREE_SCENE_LIMIT ? 'bg-red-500' : 'bg-gradient-to-r from-brand-blue to-purple-500'}`}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(100, quotaPct)}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
          {quotaUsed >= FREE_SCENE_LIMIT && (
            <p className="text-[8px] text-red-400/80 font-bold">Đạt giới hạn — Nâng cấp để tạo thêm</p>
          )}
        </motion.div>
      )}
    </div>
  );
};
