
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Loader2, Sparkles, MoveHorizontal, Wand2, 
  HelpCircle, Image as ImageIcon, Download, Edit3, Maximize2 
} from 'lucide-react';
import { RestoreJob, RESTORATION_PRESETS } from '../../hooks/useRestoration';

interface Props {
  activeJob: RestoreJob | undefined;
  onApplyTemplate: (url: string) => void;
  onDownload: (url: string) => void;
  onEdit: (url: string) => void;
  onUpscale: (url: string) => void;
}

const GUIDE_STEPS = [
  { id: 1, title: 'Tải ảnh', desc: 'Chọn ảnh cũ bị mờ hoặc hư hỏng' },
  { id: 2, title: 'Chọn kịch bản', desc: 'Chọn loại phục chế phù hợp' },
  { id: 3, title: 'Kích hoạt', desc: 'AI xử lý và tái tạo chi tiết' }
];

export const RestorationViewport: React.FC<Props> = ({ activeJob, onApplyTemplate, onDownload, onEdit, onUpscale }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [imgLoading, setImgLoading] = useState(true);

  return (
    <div className="flex-grow flex flex-col bg-slate-100 dark:bg-[#050505] overflow-hidden transition-colors duration-500">
      <div className="flex-grow relative flex items-center justify-center p-4 md:p-12 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-video bg-brand-blue/10 rounded-full blur-[120px]"></div>
        </div>

        <AnimatePresence mode="wait">
          {activeJob ? (
            <motion.div key={activeJob.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-5xl aspect-video bg-white dark:bg-black shadow-3xl rounded-xl md:rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden group">
              {activeJob.status === 'DONE' && activeJob.result ? (
                <div className="w-full h-full relative">
                  <img src={activeJob.original} className="absolute inset-0 w-full h-full object-contain" alt="Original" />
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%`, borderRight: '2px solid #10b981' }}
                  >
                    <img 
                      src={activeJob.result} 
                      className="absolute inset-0 h-full object-contain" 
                      style={{ width: `calc(100% * 100 / ${sliderPosition})`, maxWidth: 'none' }}
                      alt="Restored" 
                    />
                  </div>
                  <div 
                    className="absolute inset-y-0 z-10 w-1 cursor-ew-resize pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center text-white border-2 border-white dark:border-black">
                      <MoveHorizontal strokeWidth={3} className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={sliderPosition}
                    onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  />
                  <div className="absolute bottom-6 left-6 z-30 pointer-events-none px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-xl italic">Ảnh phục hồi</div>
                  <div className="absolute bottom-6 right-6 z-30 pointer-events-none px-4 py-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded border border-white/10 italic">Ảnh gốc</div>
                </div>
              ) : activeJob.status === 'PROCESSING' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-30 bg-white/40 dark:bg-black/40 backdrop-blur-md">
                  <div className="relative">
                    <Loader2 size={100} className="text-emerald-500 animate-spin" strokeWidth={1} />
                    <Sparkles size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/50 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[14px] font-black uppercase tracking-[0.8em] text-emerald-600 dark:text-emerald-400 animate-pulse italic">ĐANG TỔNG HỢP PIXEL...</p>
                    <p className="text-[8px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">Vision_Core_Inference node_042 active</p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center bg-slate-50 dark:bg-black/40">
                  {imgLoading && (
                     <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Loader2 size={40} className="animate-spin text-brand-blue" />
                     </div>
                  )}
                  <img 
                    src={activeJob.original} 
                    onLoad={() => setImgLoading(false)}
                    className="max-w-full max-h-full object-contain opacity-50 grayscale transition-opacity duration-1000" 
                    alt="Draft" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="w-full max-w-5xl h-full flex flex-col items-center justify-center space-y-16 py-12">
              {/* Guide Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl px-4">
                {GUIDE_STEPS.map((step) => (
                  <div key={step.id} className="bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-6 rounded-2xl flex items-start gap-4 shadow-sm group hover:border-brand-blue/30 transition-all">
                    <span className="text-2xl font-black text-emerald-500 italic opacity-50 group-hover:opacity-100 transition-opacity">0{step.id}</span>
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-tight">{step.title}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold italic">"{step.desc}"</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Templates Section */}
              <div className="space-y-8 w-full px-4">
                <div className="flex items-center gap-4">
                   <div className="h-px flex-grow bg-black/5 dark:bg-white/5"></div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-gray-600 italic">Khám phá sức mạnh Phục chế</h3>
                   <div className="h-px flex-grow bg-black/5 dark:border-white/5"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {RESTORATION_PRESETS.map((preset) => (
                     <button 
                      key={preset.id}
                      onClick={() => onApplyTemplate(preset.sampleUrl!)}
                      className="group relative aspect-[3/4] bg-slate-200 dark:bg-white/5 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 hover:border-emerald-500 transition-all shadow-md hover:shadow-2xl"
                     >
                       <img src={preset.sampleUrl} className="w-full h-full object-cover opacity-60 dark:opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                       <div className="absolute bottom-4 left-4 right-4 text-left">
                          <p className="text-[9px] font-black uppercase text-white truncate italic tracking-tight">{preset.label}</p>
                       </div>
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="p-3 bg-emerald-600 rounded-full text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                            <Wand2 size={16} />
                          </div>
                       </div>
                     </button>
                   ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 dark:text-gray-700">
                 <HelpCircle size={16} />
                 <p className="text-[10px] font-black uppercase tracking-widest italic">Lựa chọn ảnh mẫu để trải nghiệm hệ thống ngay lập tức</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* TOOLS BAR BOTTOM */}
      <AnimatePresence>
        {activeJob && activeJob.status === 'DONE' && activeJob.result && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="h-20 shrink-0 bg-white/80 dark:bg-black/60 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 flex items-center justify-center px-4 md:px-8 z-[80] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center gap-2 md:gap-4 bg-white/50 dark:bg-black/40 p-1.5 rounded-2xl border border-black/5 dark:border-white/10 shadow-2xl">
              <button 
                onClick={() => onEdit(activeJob.result!)}
                className="flex items-center gap-2.5 px-4 md:px-6 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white hover:bg-brand-blue hover:text-white transition-all group border border-transparent hover:border-brand-blue/30"
              >
                <Edit3 size={16} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Editor Studio</span>
              </button>
              
              <div className="w-px h-6 bg-black/5 dark:bg-white/10"></div>
              
              <button 
                onClick={() => onUpscale(activeJob.result!)}
                className="flex items-center gap-2.5 px-4 md:px-6 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white hover:bg-purple-600 hover:text-white transition-all group border border-transparent hover:border-purple-500/30"
              >
                <Maximize2 size={16} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Nâng cấp 4K</span>
              </button>

              <div className="w-px h-6 bg-black/5 dark:bg-white/10"></div>

              <button 
                onClick={() => onDownload(activeJob.result!)}
                className="flex items-center gap-2.5 px-6 md:px-8 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:brightness-110 transition-all group shadow-lg shadow-emerald-600/20"
              >
                <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                <span>Tải xuống</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RestorationViewport;
