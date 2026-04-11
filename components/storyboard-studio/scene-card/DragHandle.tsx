import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DragControls } from 'framer-motion';

interface DragHandleProps {
  dragControls: DragControls;
}

export const DragHandle: React.FC<DragHandleProps> = ({ dragControls }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      onPointerDown={e => {
        e.preventDefault();
        setIsDragging(true);
        dragControls.start(e);
      }}
      onPointerUp={() => setIsDragging(false)}
      onPointerCancel={() => setIsDragging(false)}
      animate={isDragging ? { scale: 1.15, opacity: 1 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`absolute left-0 top-0 bottom-0 w-7 flex items-center justify-center z-10 transition-all
        ${isDragging
          ? 'cursor-grabbing bg-brand-blue/15 shadow-[2px_0_12px_rgba(59,130,246,0.3)]'
          : 'cursor-grab opacity-0 group-hover:opacity-100 bg-gradient-to-r from-white/[0.04] to-transparent'
        }`}
      title="Kéo để sắp xếp lại"
    >
      <GripVertical
        size={14}
        className={`transition-colors ${isDragging ? 'text-brand-blue' : 'text-white/30 hover:text-white/60'}`}
      />
    </motion.div>
  );
};
