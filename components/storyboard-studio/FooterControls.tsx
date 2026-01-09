
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MonitorPlay, ImageIcon, X, Check, Loader2, Zap 
} from 'lucide-react';

interface FooterControlsProps {
  scenesCount: number;
  isProcessing: boolean;
  canCreate: boolean;
  onSynthesize: () => void;
  onReset: () => void;
}

export const FooterControls: React.FC<FooterControlsProps> = ({ 
  scenesCount, isProcessing, canCreate, onSynthesize, onReset
}) => {
  return (
    <div className="h-20 lg:h-24 border-t border-white/5 bg-[#08080a] flex items-center justify-center px-4 lg:px-10 shrink-0 z-[170]">
       <div className="flex items-center gap-4 w-full max-w-4xl justify-center">
          <AnimatePresence mode="wait">
             {scenesCount > 0 ? (
                <motion.div 
                  key="action-bar"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 20 }} 
                  className="flex items-center gap-2 bg-[#1c1c1f] px-3 lg:px-4 py-2.5 lg:py-3 border border-brand-blue/30 rounded-2xl shadow-2xl w-full sm:w-auto"
                >
                   <div className="flex items-center gap-2 px-2 lg:px-4 border-r border-white/10 mr-1 lg:mr-2">
                      <div className="w-4 h-4 lg:w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center text-white shadow-[0_0_100px_rgba(0,144,255,0.3)]">
                         <Check size={10} strokeWidth={4} />
                      </div>
                      <span className="text-[10px] lg:text-xs font-black text-white whitespace-nowrap">{scenesCount} <span className="hidden sm:inline">cảnh</span></span>
                   </div>

                   <div className="flex items-center gap-1.5 lg:gap-2">
                      <button className="bg-[#0090ff] text-white px-3 lg:px-6 py-2 lg:py-3 text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 lg:gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                         <ImageIcon size={12}/><span className="hidden sm:inline">Tạo hình</span>
                      </button>
                      <button className="bg-[#9333ea] text-white px-3 lg:px-6 py-2 lg:py-3 text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 lg:gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                         <MonitorPlay size={12}/><span className="hidden sm:inline">Tạo video</span>
                      </button>
                   </div>

                   <div className="h-6 w-px bg-white/10 mx-1 lg:mx-2"></div>
                   
                   <button onClick={onReset} className="p-1.5 lg:p-2 text-gray-500 hover:text-red-500 transition-colors">
                      <X size={18}/>
                   </button>
                </motion.div>
             ) : (
                <motion.div 
                  key="create-bar"
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full sm:w-auto flex items-center bg-[#1c1c1f] p-1.5 border border-white/5 rounded-2xl shadow-2xl"
                >
                  <button 
                    onClick={onSynthesize}
                    disabled={isProcessing || !canCreate}
                    className="px-10 lg:px-16 py-4 lg:py-4 bg-brand-blue text-white rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] lg:tracking-[0.4em] flex items-center justify-center gap-3 lg:gap-4 hover:brightness-110 active:scale-[0.98] transition-all group relative overflow-hidden disabled:opacity-30 disabled:grayscale"
                  >
                     <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                     {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
                     Tạo kịch bản
                  </button>
                </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
};
