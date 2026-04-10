import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { DURATION_PRESETS, type DurationPreset } from '../../../hooks/useStoryboardStudio';

interface DurationControlProps {
  duration: number;
  onChange: (d: DurationPreset) => void;
  disabled?: boolean;
}

export const DurationControl: React.FC<DurationControlProps> = ({ duration, onChange, disabled }) => {
  return (
    <div
      className="flex items-center gap-1 group/dur"
      onClick={e => e.stopPropagation()}
    >
      <Clock size={10} className="text-white/25 group-hover/dur:text-white/50 transition-colors shrink-0" />
      <div className="flex gap-0.5">
        {DURATION_PRESETS.map(preset => (
          <motion.button
            key={preset}
            whileTap={{ scale: 0.85 }}
            onClick={e => { e.stopPropagation(); if (!disabled) onChange(preset); }}
            disabled={disabled}
            className={`text-[9px] font-mono px-1 py-px rounded transition-all leading-none ${
              duration === preset
                ? 'bg-brand-blue text-white font-black'
                : 'text-white/30 hover:text-white/70 hover:bg-white/10'
            }`}
          >
            {preset}s
          </motion.button>
        ))}
      </div>
    </div>
  );
};
