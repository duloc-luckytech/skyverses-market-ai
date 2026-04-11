import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { DURATION_PRESETS, type DurationPreset } from '../../../hooks/useStoryboardStudio';

interface DurationControlProps {
  duration: number;
  onChange: (d: DurationPreset) => void;
  disabled?: boolean;
}

/** Human-friendly hint for each duration preset */
const DURATION_HINTS: Record<number, string> = {
  4:  '4s — TikTok / Reels ngắn',
  8:  '8s — Cảnh tiêu chuẩn',
  12: '12s — Cảnh chi tiết',
  16: '16s — Cảnh dài / slow-mo',
};

export const DurationControl: React.FC<DurationControlProps> = ({ duration, onChange, disabled }) => {
  return (
    <div
      className="flex items-center gap-1 group/dur"
      onClick={e => e.stopPropagation()}
    >
      <Clock size={10} className="text-white/25 group-hover/dur:text-white/50 transition-colors shrink-0" />
      <div className="flex gap-0.5">
        {DURATION_PRESETS.map(preset => (
          <div key={preset} className="relative group/preset">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={e => { e.stopPropagation(); if (!disabled) onChange(preset); }}
              disabled={disabled}
              className={`text-[9px] tabular-nums px-1 py-px rounded transition-all leading-none
                ${duration === preset
                  ? 'bg-brand-blue text-white font-black'
                  : disabled
                    ? 'text-white/15 cursor-not-allowed'
                    : 'text-white/30 hover:text-white/70 hover:bg-white/10'
                }`}
            >
              {preset}s
            </motion.button>

            {/* Tooltip */}
            {!disabled && (
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/preset:opacity-100 transition-opacity z-50 whitespace-nowrap">
                <div className="bg-slate-900 dark:bg-[#0a0a0d] border border-white/10 rounded-lg px-2 py-1.5 text-[9px] font-medium text-white/70 shadow-xl">
                  {DURATION_HINTS[preset] ?? `${preset}s`}
                </div>
                {/* Arrow */}
                <div className="mx-auto w-2 h-1 overflow-hidden -mt-px">
                  <div className="w-2 h-2 bg-slate-900 dark:bg-[#0a0a0d] border-r border-b border-white/10 rotate-45 origin-top-left translate-y-0.5 translate-x-0.5" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
