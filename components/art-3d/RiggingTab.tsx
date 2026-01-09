import React from 'react';
import { motion } from 'framer-motion';
import { Accessibility, Zap, ChevronUp } from 'lucide-react';

interface RiggingTabProps {
  variants: any;
}

export const RiggingTab: React.FC<RiggingTabProps> = ({ variants }) => (
  <motion.div 
    variants={variants} 
    initial="initial" 
    animate="animate" 
    exit="exit" 
    className="h-full flex flex-col"
  >
    <div className="flex-grow flex flex-col space-y-8">
      {/* Visual Preview Section */}
      <div className="w-full aspect-square relative flex items-center justify-center overflow-hidden rounded-[2rem] bg-black/20 border border-white/5 group">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent blur-3xl opacity-20"></div>
        <img 
          src="https://ai-cdn.gommo.net/ai/images/c1df07a5156c5710/8eb944108243aa97.png" 
          className="w-full h-full object-contain relative z-10 transition-transform duration-1000 group-hover:scale-110" 
          alt="Rigging Preview" 
        />
        
        {/* Mock Animation Label in image */}
        <div className="absolute top-1/2 right-10 -translate-y-12 z-20 space-y-2">
            <div className="px-8 py-2 bg-[#5e5ce6] text-white text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest">
                Animation
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-md bg-black/60 border border-white/10 flex items-center justify-center">
                        <div className="w-4 h-6 bg-gray-400/20 rounded-full"></div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      <div className="text-center space-y-3 px-2">
        <p className="text-[13px] text-gray-400 font-bold leading-relaxed tracking-tight">
          Instantly auto-rig any model and generate ready-to-use animations.
        </p>
      </div>
    </div>

    {/* Bottom Controls */}
    <div className="mt-auto space-y-6 pt-6 border-t border-white/5 pb-4">
      <button className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-pink-400 transition-colors group">
        v2.0-20250506 <ChevronUp size={12} className="group-hover:-translate-y-1 transition-transform" />
      </button>

      <button className="w-full py-4 px-6 bg-[#1c1d22] border border-white/5 rounded-full flex items-center justify-center gap-3 group hover:bg-[#25272d] transition-all shadow-xl active:scale-[0.98]">
        <span className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Auto Rig</span>
        <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
          <Zap size={12} className="text-gray-500" fill="currentColor" />
          <span className="text-[11px] font-black italic text-gray-500">20</span>
        </div>
      </button>
    </div>
  </motion.div>
);
