
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Armchair, Share2, Download } from 'lucide-react';

interface ViewportContentProps {
  resultImage: string | null;
  isGenerating: boolean;
}

export const ViewportContent: React.FC<ViewportContentProps> = ({ resultImage, isGenerating }) => {
  return (
    <div className="flex-grow flex items-center justify-center p-8 lg:p-20 relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <AnimatePresence mode="wait">
        {resultImage ? (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-5xl w-full aspect-video bg-white dark:bg-black rounded-xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_0_150px_rgba(168,85,247,0.15)] border border-slate-200 dark:border-white/10">
            <img src={resultImage} className="w-full h-full object-cover" alt="Render result" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
            <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
              <button className="p-4 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full shadow-2xl text-slate-800 dark:text-white hover:bg-brand-blue hover:text-white transition-all"><Share2 size={20}/></button>
              <a href={resultImage} download={`skyverses_real_estate_${Date.now()}.png`} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><Download size={20}/></a>
            </div>
            <div className="absolute bottom-6 left-6 z-30 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest rounded-sm shadow-xl italic">NEURAL RENDER v2.5</span>
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-sm border border-white/10">8K ULTRA HD</span>
              </div>
            </div>
          </motion.div>
        ) : isGenerating ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-12 text-center relative z-10">
            <div className="relative">
              <Loader2 size={120} className="text-purple-500 animate-spin" strokeWidth={1} />
              <Sparkles size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400 animate-pulse" />
            </div>
            <div className="space-y-4">
              <p className="text-xl font-black uppercase tracking-[0.6em] animate-pulse italic text-slate-800 dark:text-white">ĐANG TỔNG HỢP KHÔNG GIAN...</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">Architect Node #042 // Neural Lattice</p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} className="text-center space-y-12 flex flex-col items-center select-none cursor-default">
            <div className="w-32 h-32 rounded-[2.5rem] border-4 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center">
              <Armchair size={80} strokeWidth={1} className="text-slate-400 dark:text-white" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-[0.6em] italic leading-none text-slate-800 dark:text-white">MAGIC AI ENGINE</h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
