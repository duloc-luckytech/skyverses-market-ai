
import React from 'react';
import { motion } from 'framer-motion';

interface AxisGizmoProps {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  onSnap: (view: 'FRONT' | 'BACK' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT') => void;
}

export const AxisGizmo: React.FC<AxisGizmoProps> = ({ rotationX, rotationY, rotationZ, onSnap }) => {
  // Ngăn chặn sự kiện drag lan ra ngoài khi click vào gizmo
  const stopPropa = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div 
      className="absolute top-6 right-6 w-24 h-24 z-50 pointer-events-none"
      onMouseDown={stopPropa}
    >
      <div className="relative w-full h-full flex items-center justify-center perspective-[500px]">
        {/* Nhóm xoay trung tâm đồng bộ với model */}
        <div 
          className="relative w-0 h-0 transition-transform duration-100 ease-out"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: `rotateX(${-rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`
          }}
        >
          {/* Trục X - Positive (Right) */}
          <div style={{ transform: 'rotateY(90deg) translateZ(40px)', transformStyle: 'preserve-3d' }} className="absolute">
            <button 
              onClick={() => onSnap('RIGHT')}
              className="pointer-events-auto w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg hover:scale-125 transition-transform"
            >X</button>
            <div className="absolute top-1/2 left-1/2 -translate-x-full -translate-y-1/2 w-10 h-[2px] bg-red-500/50 origin-right"></div>
          </div>
          
          {/* Trục X - Negative (Left) */}
          <div style={{ transform: 'rotateY(-90deg) translateZ(40px)' }} className="absolute">
            <button onClick={() => onSnap('LEFT')} className="pointer-events-auto w-4 h-4 rounded-full bg-red-900/40 border border-white/20 hover:scale-125 transition-transform"></button>
          </div>

          {/* Trục Y - Positive (Top) */}
          <div style={{ transform: 'rotateX(90deg) translateZ(40px)', transformStyle: 'preserve-3d' }} className="absolute">
            <button 
              onClick={() => onSnap('TOP')}
              className="pointer-events-auto w-6 h-6 rounded-full bg-[#dfff1a] border-2 border-white flex items-center justify-center text-[10px] font-black text-black shadow-lg hover:scale-125 transition-transform"
            >Y</button>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-[2px] h-10 bg-[#dfff1a]/50 origin-bottom"></div>
          </div>

          {/* Trục Y - Negative (Bottom) */}
          <div style={{ transform: 'rotateX(-90deg) translateZ(40px)' }} className="absolute">
            <button onClick={() => onSnap('BOTTOM')} className="pointer-events-auto w-4 h-4 rounded-full bg-yellow-900/40 border border-white/20 hover:scale-125 transition-transform"></button>
          </div>

          {/* Trục Z - Positive (Front) */}
          <div style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }} className="absolute">
            <button 
              onClick={() => onSnap('FRONT')}
              className="pointer-events-auto w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg hover:scale-125 transition-transform"
            >Z</button>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-10 bg-blue-500/50 origin-center rotateX(90deg)"></div>
          </div>

          {/* Trục Z - Negative (Back) */}
          <div style={{ transform: 'rotateY(180deg) translateZ(40px)' }} className="absolute">
            <button onClick={() => onSnap('BACK')} className="pointer-events-auto w-4 h-4 rounded-full bg-blue-900/40 border border-white/20 hover:scale-125 transition-transform"></button>
          </div>
        </div>
      </div>
    </div>
  );
};
