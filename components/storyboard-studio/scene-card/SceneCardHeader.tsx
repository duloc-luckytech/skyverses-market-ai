import React from 'react';
import { ShotTypeBadge } from './ShotTypeBadge';
import { DurationControl } from './DurationControl';
import type { ShotType, DurationPreset } from '../../../hooks/useStoryboardStudio';

const STATUS_CONFIG: Record<string, { dot: string; label: string }> = {
  idle:       { dot: 'bg-white/20',                       label: 'Idle' },
  analyzing:  { dot: 'bg-amber-400 animate-pulse',         label: 'Analyzing' },
  generating: { dot: 'bg-brand-blue animate-pulse',        label: 'Rendering' },
  done:       { dot: 'bg-emerald-500',                     label: 'Done' },
  error:      { dot: 'bg-rose-500',                        label: 'Error' },
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
  const { dot, label } = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 border-b border-white/8 bg-white/[0.02]"
      onClick={e => e.stopPropagation()}
    >
      {/* Scene number */}
      <span className="text-[9px] font-black text-white/30 shrink-0 w-5 text-center font-mono">
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

      {/* Status dot + label */}
      <div className="flex items-center gap-1.5 shrink-0" title={label}>
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-[9px] text-white/30 hidden sm:inline font-bold uppercase tracking-widest leading-none">{label}</span>
      </div>
    </div>
  );
};
