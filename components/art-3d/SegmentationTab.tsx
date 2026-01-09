import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle, Crown, Zap, Box, CheckCircle2, HelpCircle } from 'lucide-react';

interface SegmentationTabProps {
  variants: any;
}

export const SegmentationTab: React.FC<SegmentationTabProps> = ({ variants }) => {
  const [isSegmented, setIsSegmented] = useState(false);

  return (
    <motion.div 
      variants={variants} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="h-full flex flex-col"
    >
      <div className="flex-grow flex flex-col">
        {!isSegmented ? (
          <div className="flex flex-col items-center justify-center space-y-8 py-10 animate-in fade-in duration-500">
            {/* Exploded Model Preview */}
            <div className="w-full aspect-square relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 to-transparent rounded-full blur-3xl opacity-20"></div>
              <img 
                src="https://ai-cdn.gommo.net/ai/images/c1df07a5156c5710/9eb466139cc29515.png" 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,144,255,0.1)]" 
                alt="Segmentation Preview" 
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-[13px] text-gray-400 font-bold tracking-tight px-4">
                Split your model into editable parts
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4 animate-in slide-in-from-right-4 duration-500">
             {/* Part Completion List Header */}
             <div className="flex items-center gap-3 px-2">
                <div className="p-1.5 bg-brand-blue/10 rounded-lg text-brand-blue">
                   <Box size={14} />
                </div>
                <h3 className="text-[12px] font-black uppercase tracking-widest text-white">Part Completion</h3>
             </div>

             <div className="space-y-2">
                {[
                  { id: 'tripo_node_e616e6aa-fb7d-45e8-9...', status: 'done' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-brand-blue/30 transition-all">
                    <CheckCircle2 size={16} className="text-brand-blue shrink-0" />
                    <span className="text-[11px] font-mono text-gray-400 truncate">{item.id}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Persistent Bottom Controls */}
      <div className="mt-auto space-y-4 pt-6 border-t border-white/5 pb-4">
        {!isSegmented ? (
          <div className="space-y-4">
            <button 
              onClick={() => setIsSegmented(true)}
              className="w-full py-4 px-6 bg-[#1c1d22] border border-white/5 rounded-full flex items-center justify-between group hover:bg-[#25272d] transition-all shadow-xl active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                  <Crown size={16} fill="currentColor" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white italic">Start Segmenting</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                <Zap size={10} className="text-yellow-400" fill="currentColor" />
                <span className="text-[11px] font-black italic text-white">40</span>
              </div>
            </button>

            <div className="flex items-center gap-3 px-4 py-2 opacity-40">
              <Box size={14} className="text-gray-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 italic">Part Completion</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <button className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-brand-blue transition-colors group">
              How it works <HelpCircle size={12} className="group-hover:rotate-12 transition-transform" />
            </button>

            <button 
              className="w-full py-4 px-6 bg-[#1c1d22] border border-white/5 rounded-full flex items-center justify-between group hover:bg-[#25272d] transition-all shadow-xl active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                  <Crown size={16} fill="currentColor" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white italic">Part Completion</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                <Zap size={10} className="text-yellow-400" fill="currentColor" />
                <span className="text-[11px] font-black italic text-white">5</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};