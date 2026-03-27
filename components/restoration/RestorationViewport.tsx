
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Loader2, Sparkles, MoveHorizontal, Wand2, 
  HelpCircle, Image as ImageIcon, Download, Edit3, Maximize2,
  Upload, Scan, RefreshCw, ArrowRight, Zap, Layers, RotateCcw,
  AlertTriangle, RotateCw
} from 'lucide-react';
import { RestoreJob, RESTORATION_PRESETS } from '../../hooks/useRestoration';

interface Props {
  activeJob: RestoreJob | undefined;
  onApplyTemplate: (url: string) => void;
  onDownload: (url: string) => void;
  onEdit: (url: string) => void;
  onUpscale: (url: string) => void;
  onRetry?: (jobId: string) => void;  // #3 NEW
}

const GUIDE_STEPS = [
  { id: 1, title: 'Tải ảnh gốc', desc: 'Chọn ảnh cũ bị mờ, xước hoặc hư hỏng cần phục chế', icon: Upload },
  { id: 2, title: 'Chọn kịch bản AI', desc: 'Chọn loại phục chế phù hợp với tình trạng ảnh', icon: Scan },
  { id: 3, title: 'Kích hoạt Neural Core', desc: 'AI phân tích và tái tạo mọi chi tiết bị mất', icon: Zap }
];

export const RestorationViewport: React.FC<Props> = ({ activeJob, onApplyTemplate, onDownload, onEdit, onUpscale, onRetry }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [imgLoading, setImgLoading] = useState(true);

  return (
    <div className="flex-grow flex flex-col bg-slate-50/50 dark:bg-[#050506] overflow-hidden transition-colors duration-500 relative">
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04] rounded-full blur-[120px]"></div>
      </div>

      <div className="flex-grow relative flex items-center justify-center p-4 md:p-10 overflow-hidden z-10">
        <AnimatePresence mode="wait">
          {activeJob ? (
            <motion.div 
              key={activeJob.id} 
              initial={{ opacity: 0, scale: 0.96, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-5xl aspect-video bg-white dark:bg-[#0a0a0e] shadow-2xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.4)] rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/[0.06] overflow-hidden group"
            >
              {/* Window chrome bar */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-white/80 dark:bg-[#0d0e12]/80 backdrop-blur-md z-40 flex items-center px-4 border-b border-slate-100 dark:border-white/[0.04]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50"></div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    activeJob.status === 'DONE' ? 'bg-emerald-500' 
                    : activeJob.status === 'ERROR' ? 'bg-red-500' 
                    : activeJob.status === 'PROCESSING' ? 'bg-amber-500 animate-pulse' 
                    : 'bg-emerald-500 animate-pulse'
                  }`}></div>
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-gray-500">
                    {activeJob.status === 'DONE' ? 'Restoration Complete' 
                    : activeJob.status === 'ERROR' ? 'Error — Tap Retry' 
                    : activeJob.status === 'PROCESSING' ? (activeJob.progressStep || 'Processing...') 
                    : `Task #${activeJob.id.slice(-4)}`}
                  </span>
                </div>
              </div>

              {activeJob.status === 'DONE' && activeJob.result ? (
                /* ═══ RESULT VIEW — Before/After Slider ═══ */
                <div className="w-full h-full relative pt-10">
                  <img src={activeJob.original} className="absolute inset-0 w-full h-full object-contain pt-10" alt="Original" />
                  <div 
                    className="absolute inset-0 overflow-hidden pt-10"
                    style={{ width: `${sliderPosition}%`, borderRight: '2px solid #10b981' }}
                  >
                    <img 
                      src={activeJob.result} 
                      className="absolute inset-0 h-full object-contain pt-10" 
                      style={{ width: `calc(100% * 100 / ${sliderPosition})`, maxWidth: 'none' }}
                      alt="Restored" 
                    />
                  </div>

                  {/* Slider Handle */}
                  <div 
                    className="absolute inset-y-0 z-10 w-1 cursor-ew-resize pointer-events-none pt-10"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.5)] flex items-center justify-center text-white border-2 border-white dark:border-[#0a0a0e]">
                      <MoveHorizontal strokeWidth={2.5} className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <input 
                    type="range" min="0" max="100" value={sliderPosition}
                    onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 pt-10"
                  />

                  {/* Labels */}
                  <div className="absolute bottom-5 left-5 z-30 pointer-events-none flex items-center gap-2 px-4 py-2 bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-emerald-600/20">
                    <Sparkles size={12} /> Ảnh phục hồi
                  </div>
                  <div className="absolute bottom-5 right-5 z-30 pointer-events-none flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl text-white/80 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/10">
                    <RotateCcw size={12} /> Ảnh gốc
                  </div>
                </div>

              ) : activeJob.status === 'ERROR' ? (
                /* ═══ #3 ERROR STATE — with Retry Button ═══ */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-30 bg-white/80 dark:bg-black/70 backdrop-blur-xl pt-10">
                  {/* Background image faded */}
                  {activeJob.original && (
                    <img src={activeJob.original} className="absolute inset-0 w-full h-full object-contain opacity-10 pt-10" alt="" />
                  )}
                  
                  <div className="relative z-10 text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <AlertTriangle size={36} className="text-red-500" strokeWidth={1.5} />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-black uppercase tracking-[0.3em] text-red-600 dark:text-red-400 italic">
                        Lỗi xử lý
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
                        {activeJob.errorMessage || 'Đã xảy ra lỗi trong quá trình phục chế. Credit đã được hoàn trả tự động.'}
                      </p>
                    </div>

                    {onRetry && (
                      <button
                        onClick={() => onRetry(activeJob.id)}
                        className="inline-flex items-center gap-2.5 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/25"
                      >
                        <RotateCw size={14} />
                        Thử lại (Miễn phí)
                      </button>
                    )}
                  </div>
                </div>

              ) : activeJob.status === 'PROCESSING' ? (
                /* ═══ #5 PROCESSING STATE — with Real Progress ═══ */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-30 bg-white/60 dark:bg-black/60 backdrop-blur-xl">
                  {/* Background image faded */}
                  {activeJob.original && (
                    <img src={activeJob.original} className="absolute inset-0 w-full h-full object-contain opacity-5" alt="" />
                  )}

                  <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="relative">
                      <div className="absolute inset-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] animate-pulse"></div>
                      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Loader2 size={48} className="text-emerald-500 animate-spin" strokeWidth={1.5} />
                        <Sparkles size={18} className="absolute text-emerald-400/60 animate-pulse" />
                      </div>
                    </div>

                    <div className="text-center space-y-4 w-72">
                      <p className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 animate-pulse italic">
                        {activeJob.progressStep || 'Đang xử lý...'}
                      </p>

                      {/* #5 — Real progress bar */}
                      <div className="space-y-2">
                        <div className="w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${activeJob.progress || 5}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                          {activeJob.progress || 0}%
                        </p>
                      </div>

                      <p className="text-[8px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em]">
                        Vision_Core_Inference • Neural_Node_042 • Active
                      </p>
                    </div>
                  </div>
                </div>

              ) : (
                /* ═══ AWAITING STATE — Image Preview ═══ */
                <div className="relative w-full h-full flex items-center justify-center bg-slate-50/50 dark:bg-black/20 pt-10">
                  {imgLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <Loader2 size={32} className="animate-spin text-emerald-500/40" />
                    </div>
                  )}
                  <img 
                    src={activeJob.original} 
                    onLoad={() => setImgLoading(false)}
                    className="max-w-full max-h-full object-contain opacity-60 grayscale transition-opacity duration-1000" 
                    alt="Draft" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-full border border-slate-200 dark:border-white/10 shadow-xl">
                    <Zap size={12} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-gray-400">
                      Chọn kịch bản & nhấn "Phục chế ngay" để bắt đầu
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* ═══════════════ EMPTY STATE — Welcome ═══════════════ */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-5xl h-full flex flex-col items-center justify-center space-y-14 py-8"
            >
              {/* Hero Title */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/15 rounded-2xl flex items-center justify-center mb-6">
                  <RefreshCw size={28} className="text-emerald-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                  Neural Restoration Studio
                </h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em]">
                  Phục chế ảnh chuyên nghiệp với AI thế hệ mới
                </p>
              </div>

              {/* Guide Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl px-4">
                {GUIDE_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] p-5 md:p-6 rounded-2xl flex items-start gap-4 group hover:border-emerald-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.06] dark:bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                          <Icon size={18} />
                        </div>
                        <span className="text-lg font-black text-emerald-500/30 italic">0{step.id}</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        <p className="text-[11px] font-black uppercase text-slate-800 dark:text-white tracking-tight">{step.title}</p>
                        <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ═══ Sample Templates — Updated for 8 presets ═══ */}
              <div className="space-y-6 w-full px-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-grow bg-slate-100 dark:bg-white/[0.04]"></div>
                  <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-gray-600 italic flex items-center gap-2">
                    <Layers size={12} /> Khám phá sức mạnh phục chế
                  </h3>
                  <div className="h-px flex-grow bg-slate-100 dark:bg-white/[0.04]"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {RESTORATION_PRESETS.map((preset) => (
                    <button 
                      key={preset.id}
                      onClick={() => onApplyTemplate(preset.sampleUrl!)}
                      className="group relative aspect-[4/3] bg-slate-100 dark:bg-white/[0.03] rounded-2xl overflow-hidden border border-slate-100 dark:border-white/[0.05] hover:border-emerald-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
                    >
                      <img 
                        src={preset.sampleUrl} 
                        className="w-full h-full object-cover opacity-50 dark:opacity-30 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700" 
                        alt="" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <p className="text-[8px] md:text-[9px] font-black uppercase text-white truncate tracking-tight">{preset.label}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-2xl shadow-emerald-600/30 scale-75 group-hover:scale-100 transition-transform duration-300">
                          <Wand2 size={16} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300 dark:text-gray-700">
                <HelpCircle size={13} />
                <p className="text-[9px] font-bold uppercase tracking-[0.15em]">Chọn ảnh mẫu để trải nghiệm hệ thống ngay lập tức</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════ TOOLS BAR BOTTOM ═══════════════ */}
      <AnimatePresence>
        {activeJob && activeJob.status === 'DONE' && activeJob.result && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="h-[72px] shrink-0 bg-white/90 dark:bg-[#0b0c10]/90 backdrop-blur-2xl border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-center px-4 md:px-8 z-[80]"
          >
            <div className="flex items-center gap-1.5 md:gap-2 bg-slate-50 dark:bg-white/[0.03] p-1.5 rounded-2xl border border-slate-100 dark:border-white/[0.06] shadow-xl">
              <button 
                onClick={() => onEdit(activeJob.result!)}
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-white/70 hover:bg-blue-500 hover:text-white transition-all duration-200 group"
              >
                <Edit3 size={15} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Editor Studio</span>
              </button>
              
              <div className="w-px h-7 bg-slate-200 dark:bg-white/[0.06]"></div>
              
              <button 
                onClick={() => onUpscale(activeJob.result!)}
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-white/70 hover:bg-purple-600 hover:text-white transition-all duration-200 group"
              >
                <Maximize2 size={15} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Nâng cấp 4K</span>
              </button>

              <div className="w-px h-7 bg-slate-200 dark:bg-white/[0.06]"></div>

              <button 
                onClick={() => onDownload(activeJob.result!)}
                className="flex items-center gap-2 px-5 md:px-8 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 transition-all duration-200 group shadow-lg shadow-emerald-600/15"
              >
                <Download size={15} className="group-hover:translate-y-0.5 transition-transform" />
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
