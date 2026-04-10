import React from 'react';
import { GripVertical } from 'lucide-react';
import type { DragControls } from 'framer-motion';

interface DragHandleProps {
  dragControls: DragControls;
}

export const DragHandle: React.FC<DragHandleProps> = ({ dragControls }) => {
  return (
    <div
      onPointerDown={e => {
        e.preventDefault();
        dragControls.start(e);
      }}
      className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-gradient-to-r from-white/[0.03] to-transparent"
    >
      <GripVertical size={14} className="text-white/30 hover:text-white/60 transition-colors" />
    </div>
  );
};
