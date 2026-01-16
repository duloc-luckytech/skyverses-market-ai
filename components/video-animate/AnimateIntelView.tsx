
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Layers, BookOpen, LayoutGrid, ImageIcon, Film, Play, Download 
} from 'lucide-react';
import { AnimateMode } from '../../hooks/useVideoAnimate';
import { useLanguage } from '../../context/LanguageContext';

const EXAMPLE_MEDIA = {
  motion: {
    input: "https://help-static-aliyun-doc.aliyuncs.com/assets/img/en-US/3287512671/p1008736.jpeg",
    ref: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20251031/stylii/move_input_video+%282%29.mp4",
    output: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20251031/stalwr/move_output_std+%281%29.mp4"
  },
  swap: {
    input: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20250919/uuzbqu/mix_input_video.mp4",
    ref: "https://help-static-aliyun-doc.aliyuncs.com/assets/img/en-US/0050602671/p1008733.jpeg",
    output: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20250919/wmcqkb/mix_output_std.mp4"
  }
};

interface AnimateIntelViewProps {
  mode: AnimateMode;
  onShowTemplates: () => void;
  onDownload: (url: string, filename: string) => void;
}

export const AnimateIntelView: React.FC<AnimateIntelViewProps> = ({ mode, onShowTemplates, onDownload }) => {
  const { t } = useLanguage();
  
  return (
    <motion.div 
      key="intel-view"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-grow flex flex-col p-10 xl:p-16 overflow-y-auto no-scrollbar"
    >
      <div className="max-w-6xl mx-auto w-full space-y-16">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start">
          <div className="space-y-10">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-700 ${mode === 'MOTION' ? 'bg-cyan-500 shadow-cyan-500/20' : 'bg-purple-600 shadow-purple-500/20'}`}>
                <Sparkles size={40} className="text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                  {mode === 'MOTION' ? 'Motion AI' : 'Swap AI'}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em] italic leading-none">
                  NODE_INFRASTRUCTURE_STABLE
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-cyan-500 italic flex items-center gap-4">
                <BookOpen size={18} /> {t('animate.intel.guide')}
              </h4>
              <div className="space-y-4">
                  <p className="text-xl text-slate-700 dark:text-gray-200 font-bold leading-relaxed uppercase tracking-tight italic border-l-4 border-brand-blue pl-8 transition-colors">
                    {mode === 'MOTION' 
                      ? 'Animate an identity using a reference movement.' 
                      : 'Replace a character identity from an image source.'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic pl-8">
                    {mode === 'MOTION' 
                      ? "You can input an image and a video to generate a new video that keeps the image's background and follows the actions in the reference video."
                      : "You can input a video and a replacement image to generate a new video that keeps the original video's background. This enables features such as video character swapping and character replacement."}
                  </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                  { label: 'IDENTITY LOCK', desc: 'Duy trì nhân dạng' },
                  { label: 'BACKGROUND FIX', desc: 'Giữ nguyên bối cảnh' },
                  { label: 'ACTION SYNC', desc: 'Đồng bộ hành động' },
                  { label: '60FPS FLOW', desc: 'Chuyển động mượt' }
              ].map(chip => (
                  <div key={chip.label} className="p-4 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl flex items-center gap-3 group hover:border-brand-blue/30 transition-all">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white">{chip.label}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase italic">{chip.desc}</span>
                    </div>
                  </div>
              ))}
            </div>
            
            <div className="pt-6">
              <button onClick={onShowTemplates} className="px-12 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all group">
                  <LayoutGrid size={20} className="group-hover:rotate-12 transition-transform" /> {t('animate.results.template')}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em]">
                  <LayoutGrid size={18} /> Industrial Sample Flow
              </div>
              <span className="text-[8px] font-black text-brand-blue uppercase opacity-50">Reference: Standard_Uplink</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest ml-2 italic flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-cyan-500"></div> {mode === 'MOTION' ? 'Input Image' : 'Input Video'}
                  </p>
                  <div className="aspect-[3/4] bg-slate-100 dark:bg-black border border-black/5 dark:border-white/5 rounded-[1.5rem] relative overflow-hidden group/img shadow-xl">
                    {mode === 'MOTION' ? (
                      <img src={EXAMPLE_MEDIA.motion.input} className="w-full h-full object-cover grayscale opacity-60 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all duration-1000 group-hover:scale-105" alt="Sample Input" />
                    ) : (
                      <video src={EXAMPLE_MEDIA.swap.input} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 transition-opacity" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/20 text-white shadow-2xl">
                          {mode === 'MOTION' ? <ImageIcon size={20} /> : <Film size={20} />}
                        </div>
                    </div>
                  </div>
              </div>

              <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest ml-2 italic flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-500"></div> {mode === 'MOTION' ? 'Reference Video' : 'Input Image'}
                  </p>
                  <div className="aspect-[3/4] bg-slate-100 dark:bg-black border border-black/5 dark:border-white/5 rounded-[1.5rem] relative overflow-hidden group/vid shadow-xl">
                    {mode === 'MOTION' ? (
                      <video src={EXAMPLE_MEDIA.motion.ref} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 group-hover/vid:opacity-100 transition-opacity" />
                    ) : (
                      <img src={EXAMPLE_MEDIA.swap.ref} className="w-full h-full object-cover grayscale opacity-60 group-hover/vid:grayscale-0 group-hover/vid:opacity-100 transition-all duration-1000 group-hover:scale-105" alt="Sample Ref" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-purple-600/80 flex items-center justify-center text-white shadow-2xl animate-pulse">
                          {mode === 'MOTION' ? <Play size={16} fill="white" className="ml-1" /> : <ImageIcon size={20} />}
                        </div>
                    </div>
                  </div>
              </div>

              <div className="col-span-2 space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                  <div className="flex justify-between items-center px-2">
                    <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em] italic flex items-center gap-2">
                        <Sparkles size={14} fill="currentColor" /> Final Output Video
                    </p>
                    <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">QUALITY: VERIFIED</span>
                  </div>
                  <div className="aspect-video bg-slate-100 dark:bg-black border-2 border-brand-blue/30 rounded-[2rem] relative overflow-hidden group/res shadow-3xl">
                    <video src={mode === 'MOTION' ? EXAMPLE_MEDIA.motion.output : EXAMPLE_MEDIA.swap.output} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/res:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-6 left-6 flex items-center gap-4 opacity-0 group-hover/res:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <button onClick={() => onDownload(mode === 'MOTION' ? EXAMPLE_MEDIA.motion.output : EXAMPLE_MEDIA.swap.output, "sample_output.mp4")} className="px-6 py-2 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-2">
                          <Download size={14} /> Download Sample
                        </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
