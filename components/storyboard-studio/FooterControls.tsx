
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MonitorPlay, ImageIcon, X, Check, Loader2, Zap, AlertCircle, Coins, Clock
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
  totalDuration?: number;
}

const formatDuration = (secs: number): string => {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

export const FooterControls: React.FC<FooterControlsProps> = ({
  scenesCount, selectedCount, isProcessing, canCreate, onSynthesize, onReset, onGenerateImages, onGenerateVideos, totalDuration,
}) => {
  const hasSelection = selectedCount > 0;

  return (
    <div className="relative border-t border-white/5 bg-[#08080a] flex items-center justify-center px-4 py-3 shrink-0 z-10">
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
                      {totalDuration !== undefined && totalDuration > 0 && (
                        <div className="hidden lg:flex items-center gap-1.5 ml-3 pl-3 border-l border-white/10 text-white/40">
                          <Clock size={11} />
                          <span className="text-[10px] font-black font-mono">{formatDuration(totalDuration)}</span>
                        </div>
                      )}
                   </div>

                   <div className="flex items-center gap-1.5 lg:gap-2 relative flex-grow lg:flex-grow-0">
                      <button
                        onClick={onGenerateImages}
                        disabled={!hasSelection || isProcessing}
                        aria-label={`Tạo hình ảnh cho ${selectedCount} cảnh đã chọn`}
                        className={`flex-1 lg:flex-none bg-[#0090ff] text-white px-3 lg:px-6 py-2.5 lg:py-3 text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 lg:gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed`}
                      >
                         <ImageIcon size={12}/><span className="hidden xs:inline">Tạo hình</span><span className="xs:hidden">Hình</span>
                      </button>

                      <button
                        onClick={onGenerateVideos}
                        disabled={!hasSelection || isProcessing}
                        aria-label={`Render video cho ${selectedCount} cảnh đã chọn`}
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
                    aria-label="Xóa tất cả phân cảnh"
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
                  className="flex items-center bg-[#1c1c1f] p-1 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  <button
                    onClick={onSynthesize}
                    disabled={isProcessing || !canCreate}
                    aria-label="Tạo kịch bản storyboard từ script"
                    className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all group relative overflow-hidden disabled:opacity-30 disabled:grayscale"
                  >
                     <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                     {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" className="group-hover:rotate-12 transition-transform" />}
                     <span className="italic">Tạo kịch bản</span>
                     <div className="h-4 w-px bg-white/20"></div>
                     <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full border border-white/10">
                        <Coins size={10} className="text-yellow-400" fill="currentColor" />
                        <span className="text-[9px] font-black tracking-normal">500</span>
                     </div>
                  </button>
                </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
};
