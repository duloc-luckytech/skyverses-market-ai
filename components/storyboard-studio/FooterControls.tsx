
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MonitorPlay, ImageIcon, Mic, X, Check, Loader2, Zap 
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
    <div className="h-24 border-t border-white/5 bg-[#08080a] flex items-center justify-between px-10 shrink-0 z-[170]">
       <div className="flex items-center gap-12">
          <div className="space-y-1">
             <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest italic">MÔ HÌNH AI KỊCH BẢN</p>
             <select className="bg-transparent border-none text-xs font-black uppercase text-brand-blue tracking-widest outline-none cursor-pointer hover:text-white transition-colors">
                <option>Gemini 3.0 Flash</option>
                <option>Gemini 3.0 Pro</option>
             </select>
          </div>
          <div className="h-8 w-px bg-white/5"></div>
          <div className="flex gap-4">
             <button className="px-4 py-2 border border-white/10 rounded-lg text-[9px] font-black uppercase text-gray-400 flex items-center gap-2 hover:bg-brand-blue/10 hover:text-brand-blue transition-all"><MonitorPlay size={14}/> Nano Banana Pro</button>
             <button className="px-4 py-2 border border-purple-500/30 bg-purple-500/5 rounded-lg text-[9px] font-black uppercase text-purple-500 flex items-center gap-2 shadow-lg"><MonitorPlay size={14}/> VEO 3.1 - HOT</button>
          </div>
       </div>

       <div className="flex items-center gap-6">
          <AnimatePresence mode="wait">
             {scenesCount > 0 ? (
                <motion.div 
                  key="action-bar"
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  className="flex items-center gap-2 bg-[#1c1c1f]/80 backdrop-blur-xl px-4 py-3 border border-white/5 rounded-2xl shadow-2xl"
                >
                   <div className="flex items-center gap-2 px-3 border-r border-white/10 mr-2">
                      <div className="w-5 h-5 rounded-full border-2 border-brand-blue flex items-center justify-center text-brand-blue shadow-[0_0_10px_rgba(0,144,255,0.3)]">
                         <Check size={12} strokeWidth={4} />
                      </div>
                      <span className="text-xs font-black text-white">{scenesCount}</span>
                   </div>

                   <div className="flex items-center gap-2">
                      <button className="bg-[#0090ff] text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                         <ImageIcon size={14}/> Generate Images
                      </button>
                      <button className="bg-[#9333ea] text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all">
                         <MonitorPlay size={14}/> Generate Videos
                      </button>
                      <button className="bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-[#10b981] hover:text-white active:scale-95 transition-all">
                         <Mic size={14}/> Tạo Audio VO
                      </button>
                   </div>

                   <div className="h-6 w-px bg-white/10 mx-2"></div>
                   
                   <button onClick={onReset} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                      <X size={20}/>
                   </button>
                </motion.div>
             ) : (
                <motion.button 
                  key="create-btn"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onClick={onSynthesize}
                  disabled={isProcessing || !canCreate}
                  className="px-16 py-6 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-[0.4em] shadow-[0_15px_40px_rgba(0,144,255,0.3)] flex items-center justify-center gap-4 hover:brightness-110 active:scale-95 transition-all group relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                   {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                   Tạo kịch bản
                </motion.button>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
};
