
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Add missing ShieldCheck to lucide-react imports
import { X, Loader2, Sparkles, MonitorPlay, Share2, Download, Edit3, Maximize2, ShieldCheck } from 'lucide-react';
import { RenderResult } from '../../hooks/useEventStudio';
import { EventConfig } from '../../constants/event-configs';

interface EventViewportProps {
  config: EventConfig;
  activeResult: RenderResult | null;
  isGenerating: boolean;
  onClose: () => void;
  accentColor: string;
  onEdit: (url: string) => void;
  onDownload: (url: string) => void;
}

export const EventViewport: React.FC<EventViewportProps> = ({ 
  config, activeResult, isGenerating, onClose, accentColor, onEdit, onDownload 
}) => {
  const EvIcon = config.icon;

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      {/* HUD Bar */}
      <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-30 transition-colors">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-${accentColor}-500 shadow-lg shadow-${accentColor}-500/50`}></div>
              <span className={`text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white`}>
                {config.name}
              </span>
           </div>
           <div className="h-4 w-px bg-black/10 dark:border-white/10 hidden sm:block"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-gray-500 italic hidden sm:block">VIRTUAL_STUDIO_NODE</span>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-black/5 dark:bg-white/5 rounded-full"><X size={20} /></button>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, var(--tw-gradient-from) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
        
        <AnimatePresence mode="wait">
          {activeResult ? (
            <motion.div 
              key={activeResult.id} 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="relative group max-w-4xl w-full aspect-[3/4] bg-white dark:bg-black rounded-xl overflow-hidden shadow-3xl border border-slate-200 dark:border-white/10"
            >
              {activeResult.status === 'processing' ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-black/60 backdrop-blur-sm z-20">
                    <div className="relative mb-8">
                       <Loader2 className={`animate-spin text-${accentColor}-600`} size={80} strokeWidth={1.5} />
                       <Sparkles className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-${accentColor}-400 animate-pulse`} size={30} />
                    </div>
                    <p className={`text-sm font-black uppercase tracking-[0.5em] text-${accentColor}-600 animate-pulse`}>SYNTHESIZING...</p>
                 </div>
              ) : activeResult.url ? (
                <>
                  <img src={activeResult.url} className="w-full h-full object-cover" alt="Production result" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                  <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
                    <button onClick={() => onEdit(activeResult.url!)} className={`p-4 bg-white dark:bg-black/80 backdrop-blur-md rounded-full shadow-2xl text-slate-800 dark:text-white hover:text-white hover:bg-${accentColor}-600 transition-all`}><Edit3 size={20}/></button>
                    <button className={`p-4 bg-white dark:bg-black/80 backdrop-blur-md rounded-full shadow-2xl text-slate-800 dark:text-white hover:text-white hover:bg-${accentColor}-600 transition-all`}><Share2 size={20}/></button>
                    <button onClick={() => onDownload(activeResult.url!)} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-xl"><Download size={20}/></button>
                  </div>
                  <div className="absolute bottom-6 left-6 z-30 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 bg-${accentColor}-600 text-white text-[9px] font-black uppercase tracking-widest rounded-sm shadow-xl italic`}>ULTRA MASTER RENDER</span>
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-sm border border-white/10">8K_UHD</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-red-50/50 dark:bg-red-900/5 gap-4">
                  <AlertCircle size={48} />
                  <p className="text-sm font-black uppercase tracking-widest">Hệ thống tổng hợp lỗi</p>
                </div>
              )}
            </motion.div>
          ) : isGenerating ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-12 text-center my-auto" style={{ zIndex: 100 }}>
               <div className="relative">
                  <Loader2 className={`animate-spin text-${accentColor}-600`} size={120} strokeWidth={1} />
                  <Sparkles className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-${accentColor}-400 animate-pulse`} size={40} />
               </div>
               <div className="space-y-4">
                  <p className="text-xl font-black uppercase tracking-[0.6em] animate-pulse italic text-slate-800 dark:text-white">ĐANG KIẾN TẠO THỰC THỂ...</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">Neural Cluster #042 // {accentColor.toUpperCase()}_PIPELINE</p>
               </div>
            </motion.div>
          ) : (
            <div className="text-center space-y-10 opacity-20 flex flex-col items-center select-none transition-opacity">
               <MonitorPlay size={120} strokeWidth={1} className="text-slate-900 dark:text-white animate-pulse" />
               <div className="space-y-2">
                  <h3 className="text-4xl font-black uppercase tracking-[0.5em] italic text-slate-900 dark:text-white leading-none">Studio Standby</h3>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 italic">HỆ THỐNG SẴN SÀNG KHỞI TẠO</p>
               </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Info */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-12 text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest transition-colors z-20">
         <div className="flex items-center gap-2"><Sparkles size={14} className={`text-${accentColor}-500`} /> 8K Visual Resolution</div>
         <div className="flex items-center gap-2 shadow-2xl"><ShieldCheck size={14} className={`text-${accentColor}-500`} /> Enterprise Private Node</div>
      </div>
    </div>
  );
};

const AlertCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);
