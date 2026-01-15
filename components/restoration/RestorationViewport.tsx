
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
    <div className="flex-grow flex flex-col bg-[#0a0a0c] overflow-hidden transition-colors">
      <div className="flex-grow relative flex items-center justify-center p-4 md:p-12 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeJob ? (
            <motion.div key={activeJob.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-5xl aspect-video bg-black shadow-3xl rounded-lg overflow-hidden group">
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
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center text-white">
                      <MoveHorizontal strokeWidth={3} className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={sliderPosition}
                    onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  />
                  <div className="absolute bottom-6 left-6 z-30 pointer-events-none px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-xl">Ảnh phục hồi</div>
                  <div className="absolute bottom-6 right-6 z-30 pointer-events-none px-4 py-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded border border-white/10">Ảnh gốc</div>
                </div>
              ) : activeJob.status === 'PROCESSING' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-30 bg-black/40 backdrop-blur-md">
                  <div className="relative">
                    <Loader2 size={100} className="text-emerald-500 animate-spin" strokeWidth={1} />
                    <Sparkles size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/50 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[14px] font-black uppercase tracking-[0.8em] text-emerald-500 animate-pulse">Đang phục chế</p>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Applying Professional Vision core...</p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {imgLoading && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Loader2 size={40} className="animate-spin text-brand-blue" />
                     </div>
                  )}
                  <img 
                    src={activeJob.original} 
                    onLoad={() => setImgLoading(false)}
                    className="w-full h-full object-cover opacity-50 grayscale" 
                    alt="Draft" 
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <div className="w-full max-w-5xl h-full flex flex-col items-center justify-center space-y-16 py-12">
              {/* Guide Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                {GUIDE_STEPS.map((step) => (
                  <div key={step.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4">
                    <span className="text-2xl font-black text-emerald-500 italic opacity-50">0{step.id}</span>
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-white tracking-tight">{step.title}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Templates Section */}
              <div className="space-y-8 w-full">
                <div className="flex items-center gap-4">
                   <div className="h-px flex-grow bg-white/5"></div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Bắt đầu nhanh với mẫu</h3>
                   <div className="h-px flex-grow bg-white/5"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {RESTORATION_PRESETS.map((preset) => (
                     <button 
                      key={preset.id}
                      onClick={() => onApplyTemplate(preset.sampleUrl!)}
                      className="group relative aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-500 transition-all shadow-xl"
                     >
                       <img src={preset.sampleUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                       <div className="absolute bottom-4 left-4 right-4 text-left">
                          <p className="text-[9px] font-black uppercase text-white truncate">{preset.label}</p>
                       </div>
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="p-3 bg-emerald-600 rounded-full text-white shadow-2xl">
                            <Wand2 size={16} />
                          </div>
                       </div>
                     </button>
                   ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600 opacity-50">
                 <HelpCircle size={16} />
                 <p className="text-[10px] font-black uppercase tracking-widest italic">Nhấn vào ảnh mẫu để thử nghiệm ngay</p>
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
            className="h-20 shrink-0 bg-white/5 border-t border-white/10 flex items-center justify-center px-8 z-[80]"
          >
            <div className="flex items-center gap-4 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-2xl">
              <button 
                onClick={() => onEdit(activeJob.result!)}
                className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-blue transition-all group"
              >
                <Edit3 size={16} className="group-hover:scale-110 transition-transform" />
                Editor Image Studio
              </button>
              
              <div className="w-px h-6 bg-white/10 mx-1"></div>
              
              <button 
                onClick={() => onUpscale(activeJob.result!)}
                className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-purple-600 transition-all group"
              >
                <Maximize2 size={16} className="group-hover:scale-110 transition-transform" />
                Upscale 4K
              </button>

              <div className="w-px h-6 bg-white/10 mx-1"></div>

              <button 
                onClick={() => onDownload(activeJob.result!)}
                className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-600 transition-all group"
              >
                <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                Download
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
