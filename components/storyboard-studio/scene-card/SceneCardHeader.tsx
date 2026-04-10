import React from 'react';
import { ShotTypeBadge } from './ShotTypeBadge';
import { DurationControl } from './DurationControl';
import type { ShotType, DurationPreset } from '../../../hooks/useStoryboardStudio';

const STATUS_CONFIG: Record<string, { dot: string; label: string; badge: string }> = {
  idle:       { dot: 'bg-white/20',                label: 'Idle',       badge: 'bg-white/10 text-white/30 border-white/10' },
  analyzing:  { dot: 'bg-amber-400 animate-pulse', label: 'Phân tích',  badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  generating: { dot: 'bg-brand-blue animate-pulse',label: 'Rendering',  badge: 'bg-brand-blue/15 text-brand-blue border-brand-blue/25' },
  done:       { dot: 'bg-emerald-500',             label: 'Done ✓',     badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  error:      { dot: 'bg-rose-500',                label: 'Lỗi',        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
};

interface SceneCardHeaderProps {
  sceneIndex: number;
  shotType: ShotType;
  duration: number;
  status: string;
  onShotTypeChange: (st: ShotType) => void;
  onDurationChange: (d: DurationPreset) => void;
  isProcessing: boolean;
}

export const SceneCardHeader: React.FC<SceneCardHeaderProps> = ({
  sceneIndex,
  shotType,
  duration,
  status,
  onShotTypeChange,
  onDurationChange,
  isProcessing,
}) => {
  const { dot, label, badge } = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02]"
      onClick={e => e.stopPropagation()}
    >
      {/* Scene number — pill badge nổi bật */}
      <span className="shrink-0 inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded-full bg-brand-blue/90 text-white text-[8px] font-black font-mono leading-none shadow-sm">
        #{sceneIndex + 1}
      </span>

      {/* Shot type badge */}
      <ShotTypeBadge
        shotType={shotType}
        onChange={onShotTypeChange}
        disabled={isProcessing}
      />

      {/* Duration control */}
      <div className="flex-1 min-w-0">
        <DurationControl
          duration={duration}
          onChange={onDurationChange}
          disabled={isProcessing}
        />
      </div>

      {/* Status badge — màu theo trạng thái */}
      <div
        className={`flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest leading-none ${badge}`}
        title={label}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
        <span className="hidden sm:inline">{label}</span>
      </div>
    </div>
  );
};
