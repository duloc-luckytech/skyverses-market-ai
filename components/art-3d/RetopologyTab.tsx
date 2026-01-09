import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, HelpCircle, Crown, Zap } from 'lucide-react';

interface RetopologyTabProps {
  variants: any;
}

export const RetopologyTab: React.FC<RetopologyTabProps> = ({ variants }) => {
  const [topology, setTopology] = useState<'Quad' | 'Triangle'>('Quad');
  const [smartLowPoly, setSmartLowPoly] = useState(false);
  const [polyCount, setPolyCount] = useState(50);

  return (
    <motion.div 
      variants={variants} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="h-full flex flex-col space-y-8"
    >
      {/* Topology Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-[13px] font-bold text-white">Topology</span>
          <HelpCircle size={16} className="text-gray-500" />
        </div>
        <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
          <button 
            onClick={() => setTopology('Quad')}
            className={`flex-grow py-3 text-xs font-bold rounded-lg transition-all ${
              topology === 'Quad' 
              ? 'bg-[#5e5ce6] text-white shadow-lg' 
              : 'text-gray-500 hover:text-white'
            }`}
          >
            Quad
          </button>
          <button 
            onClick={() => setTopology('Triangle')}
            className={`flex-grow py-3 text-xs font-bold rounded-lg transition-all ${
              topology === 'Triangle' 
              ? 'bg-[#5e5ce6] text-white shadow-lg' 
              : 'text-gray-500 hover:text-white'
            }`}
          >
            Triangle
          </button>
        </div>
      </div>

      {/* Smart Low Poly Section */}
      <div className="flex items-center justify-between p-1">
        <div className="flex items-center gap-2">
          <Crown size={16} className="text-yellow-500" fill="currentColor" />
          <span className="text-[13px] font-bold text-white">Smart Low Poly</span>
          <span className="px-1.5 py-0.5 bg-[#ff2d55] text-white text-[10px] font-black rounded-lg leading-none">v2</span>
          <HelpCircle size={16} className="text-gray-500" />
        </div>
        <button 
          onClick={() => setSmartLowPoly(!smartLowPoly)}
          className={`w-12 h-6 rounded-full relative transition-colors ${smartLowPoly ? 'bg-[#5e5ce6]' : 'bg-white/10'}`}
        >
          <motion.div 
            animate={{ x: smartLowPoly ? 26 : 2 }}
            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
          />
        </button>
      </div>

      {/* Polygon Count Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-[13px] font-bold text-white">Polygon Count</span>
          <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg">
            <span className="text-xs font-bold text-white">Auto</span>
          </div>
        </div>
        <div className="px-1 py-2">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={polyCount}
            onChange={(e) => setPolyCount(parseInt(e.target.value))}
            className="w-full h-1 bg-white/10 appearance-none rounded-full accent-[#5e5ce6] cursor-pointer"
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Action Button */}
      <div className="pb-4">
        <button className="w-full py-4 px-6 bg-[#1c1d22] border border-white/5 rounded-full flex items-center justify-center gap-3 group hover:bg-[#25272d] transition-all shadow-xl active:scale-[0.98]">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500 italic">Retopology</span>
          <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
            <Zap size={12} className="text-gray-500" fill="currentColor" />
            <span className="text-[11px] font-black italic text-gray-500">10</span>
          </div>
        </button>
      </div>
    </motion.div>
  );
};