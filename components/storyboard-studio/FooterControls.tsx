
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MonitorPlay, ImageIcon, X, Check, Loader2, Zap, AlertCircle, Coins
} from 'lucide-react';

interface FooterControlsProps {
  scenesCount: number;
  selectedCount: number;
  isProcessing: boolean;
  canCreate: boolean;
  onSynthesize: () => void;
  onReset: () => void;
  onGenerateImages: () => void;
  onGenerateVideos: () => void;
}

export const FooterControls: React.FC<FooterControlsProps> = ({ 
  scenesCount, selectedCount, isProcessing, canCreate, onSynthesize, onReset, onGenerateImages, onGenerateVideos
}) => {
  const hasSelection = selectedCount > 0;

  return (
    <div className="fixed lg:relative bottom-16 lg:bottom-0 left-0 right-0 h-20 lg:h-24 lg:border-t border-white/5 bg-transparent lg:bg-[#08080a] flex items-center justify-center px-4 lg:px-10 shrink-0 z-[170]">
       {/* Gradient phủ phía sau trên mobile để tách biệt với nội dung cuộn */}
       <div className="lg:hidden absolute inset-x-0 bottom-[-64px] h-32 bg-gradient-to-t from-[#050506] via-[#050506] to-transparent pointer-events-none"></div>

       <div className="flex items-center gap-4 w-full max-w-5xl justify-center relative z-10">
          <AnimatePresence mode="wait">
             {scenesCount > 0 ? (
                <motion.div 
                  key="action-bar"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 20 }} 
                  className="flex items-center gap-2 bg-[#1c1c1f]/90 backdrop-blur-xl px-3 lg:px-4 py-2.5 lg:py-3 border border-brand-blue/30 rounded-[1.5rem] lg:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full sm:w-auto"
                >
                   <div className="flex items-center gap-2 px-2 lg:px-4 border-r border-white/10 mr-1 lg:mr-2">
                      <div className={`w-4 h-4 lg:w-5 h-5 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${hasSelection ? 'bg-brand-blue shadow-brand-blue/40' : 'bg-gray-600'}`}>
                         <Check size={10} strokeWidth={4} />
                      </div>
                      <div className="flex flex-col items-start min-w-[50px] lg:min-w-[60px]">
                        <span className="text-[10px] lg:text-xs font-black text-white whitespace-nowrap leading-none">{selectedCount} / {scenesCount}</span>
                        <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest mt-1">Đã chọn</span>
                      </div>
                   </div>

                   <div className="flex items-center gap-1.5 lg:gap-2 relative flex-grow lg:flex-grow-0">
                      <button 
                        onClick={onGenerateImages}
                        disabled={!hasSelection || isProcessing}
                        className={`flex-1 lg:flex-none bg-[#0090ff] text-white px-3 lg:px-6 py-2.5 lg:py-3 text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 lg:gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed`}
                      >
                         <ImageIcon size={12}/><span className="hidden xs:inline">Tạo hình</span><span className="xs:hidden">Hình</span>
                      </button>
                      
                      <button 
                        onClick={onGenerateVideos}
                        disabled={!hasSelection || isProcessing}
                        className={`flex-1 lg:flex-none bg-[#9333ea] text-white px-3 lg:px-6 py-2.5 lg:py-3 text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 lg:gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed`}
                      >
                         <MonitorPlay size={12}/><span className="hidden xs:inline">Tạo video</span><span className="xs:hidden">Video</span>
                      </button>

                      {!hasSelection && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap pointer-events-none animate-bounce shadow-2xl">
                           <p className="text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                             <AlertCircle size={10} className="text-brand-blue" /> Chọn cảnh để bắt đầu
                           </p>
                        </div>
                      )}
                   </div>

                   <div className="h-6 w-px bg-white/10 mx-1 lg:mx-2"></div>
                   
                   <button 
                    onClick={onReset} 
                    title="Xóa tất cả phân cảnh"
                    className="p-1.5 lg:p-2 text-gray-500 hover:text-red-500 transition-colors"
                   >
                      <X size={18}/>
                   </button>
                </motion.div>
             ) : (
                <motion.div 
                  key="create-bar"
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full sm:w-auto flex items-center bg-[#1c1c1f] p-1 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  <button 
                    onClick={onSynthesize}
                    disabled={isProcessing || !canCreate}
                    className="flex-grow sm:flex-none px-12 lg:px-20 py-4 bg-brand-blue text-white rounded-[1.6rem] text-[11px] lg:text-[12px] font-black uppercase tracking-[0.2em] lg:tracking-[0.4em] flex items-center justify-center gap-4 hover:brightness-110 active:scale-[0.98] transition-all group relative overflow-hidden disabled:opacity-30 disabled:grayscale"
                  >
                     <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                     
                     <div className="flex items-center gap-3">
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" className="group-hover:rotate-12 transition-transform" />}
                        <span className="italic">Tạo kịch bản</span>
                     </div>

                     <div className="h-6 w-px bg-white/20 mx-1"></div>

                     <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-white/10">
                        <Coins size={12} className="text-yellow-400" fill="currentColor" />
                        <span className="text-[10px] font-black italic tracking-normal">500</span>
                     </div>
                  </button>
                </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
};
