import React from 'react';
import { motion } from 'framer-motion';
import { SHOT_TYPES, SHOT_TYPE_COLORS, type ShotType } from '../../../hooks/useStoryboardStudio';

interface ShotTypeBadgeProps {
  shotType: ShotType;
  onChange: (next: ShotType) => void;
  disabled?: boolean;
}

export const ShotTypeBadge: React.FC<ShotTypeBadgeProps> = ({ shotType, onChange, disabled }) => {
  const cycleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const idx  = SHOT_TYPES.indexOf(shotType);
    const next = SHOT_TYPES[(idx + 1) % SHOT_TYPES.length];
    onChange(next);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={cycleNext}
      disabled={disabled}
      title={`Shot: ${shotType} — click to cycle`}
      className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest transition-all select-none disabled:cursor-not-allowed disabled:opacity-50 ${SHOT_TYPE_COLORS[shotType]}`}
    >
      {shotType}
    </motion.button>
  );
};
