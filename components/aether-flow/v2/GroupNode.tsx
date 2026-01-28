
import React from 'react';

export const GroupNode = ({ data }: any) => {
  const color = data.color || '#3f789e';
  const fontSize = data.fontSize || 24;

  return (
    <div className="w-full h-full relative">
      {/* Container Background & Border */}
      <div 
        className="absolute inset-0 border-2 rounded-[2.5rem] pointer-events-none"
        style={{ 
          borderColor: color, 
          backgroundColor: `${color}05`, // 5% opacity
          backdropFilter: 'blur(1px)'
        }}
      />
      
      {/* Group Title Label - Cố định góc trên bên trái của padding */}
      <div className="absolute top-6 left-8 pointer-events-none select-none z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: color }}></div>
          <h3 
            className="font-black uppercase italic tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ 
              color: color,
              fontSize: `${Math.max(14, fontSize * 0.9)}px`,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            {data.label}
          </h3>
        </div>
      </div>
      
      {/* Corner accents for industrial aesthetic */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 rounded-tl-[2.5rem] pointer-events-none opacity-40" style={{ borderColor: color }} />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 rounded-tr-[2.5rem] pointer-events-none opacity-40" style={{ borderColor: color }} />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 rounded-bl-[2.5rem] pointer-events-none opacity-10" style={{ borderColor: color }} />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 rounded-br-[2.5rem] pointer-events-none opacity-10" style={{ borderColor: color }} />
    </div>
  );
};
