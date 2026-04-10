import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

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

export const ProductionStats: React.FC<ProductionStatsProps> = ({
  totalScenes,
  renderedCount,
  totalDuration,
}) => {
  const percent = totalScenes > 0 ? Math.round((renderedCount / totalScenes) * 100) : 0;

  const stats = [
    { label: 'Scenes',    value: totalScenes,                accent: 'text-white' },
    { label: 'Rendered',  value: renderedCount,              accent: 'text-emerald-400' },
    { label: 'Complete',  value: `${percent}%`,              accent: 'text-brand-blue' },
    { label: 'Duration',  value: formatDuration(totalDuration), accent: 'text-purple-400' },
  ];

  return (
    <div className="px-5 py-4 border-b border-white/8 space-y-2.5">
      {/* Header */}
      <p className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
        <BarChart3 size={12} />
        Production Stats
      </p>

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
    </div>
  );
};
