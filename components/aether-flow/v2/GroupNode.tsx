
import React from 'react';
import { NodeProps } from '@xyflow/react';

export const GroupNode = ({ data }: any) => {
  const color = data.color || '#3f789e';
  const fontSize = data.fontSize || 24;

  return (
    <div className="w-full h-full relative pointer-events-none">
      {/* Background with border and opacity */}
      <div 
        className="absolute inset-0 border-4 rounded-3xl"
        style={{ 
          borderColor: color, 
          backgroundColor: `${color}15`, // 15% opacity
          backdropFilter: 'blur(2px)'
        }}
      />
      
      {/* Group Title Label */}
      <div className="absolute top-0 left-8 -translate-y-full pb-4">
        <h3 
          className="font-black uppercase italic tracking-tighter"
          style={{ 
            color: color,
            fontSize: `${fontSize}px`,
            textShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {data.label}
        </h3>
      </div>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 rounded-tl-3xl opacity-50" style={{ borderColor: color }} />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-8 border-r-8 rounded-tr-3xl opacity-50" style={{ borderColor: color }} />
    </div>
  );
};
