
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutGrid, ImageIcon, Film, Play, Check, Move, User } from 'lucide-react';
import { AnimateMode } from '../../hooks/useVideoAnimate';
import { useLanguage } from '../../context/LanguageContext';

interface Template {
  id: string;
  name: string;
  desc: string;
  input: string;
  ref: string;
  output: string;
  type: AnimateMode;
  tag: string;
}

const TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Street Dance Motion',
    desc: 'Diễn hoạt nhân vật nhảy đường phố cực mượt, giữ nguyên định danh.',
    input: "https://help-static-aliyun-doc.aliyuncs.com/assets/img/en-US/3287512671/p1008736.jpeg",
    ref: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20251031/stylii/move_input_video+%282%29.mp4",
    output: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20251031/stalwr/move_output_std+%281%29.mp4",
    type: 'MOTION',
    tag: 'DYNAMIC'
  },
  {
    id: 't2',
    name: 'Identity Swap Pro',
    desc: 'Thay thế nhân vật trong video bằng gương mặt mới từ ảnh chân dung.',
    input: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20250919/uuzbqu/mix_input_video.mp4",
    ref: "https://help-static-aliyun-doc.aliyuncs.com/assets/img/en-US/0050602671/p1008733.jpeg",
    output: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20250919/wmcqkb/mix_output_std.mp4",
    type: 'SWAP',
    tag: 'PRODUCTION'
  },
  {
    id: 't3',
    name: 'Cyberpunk Walk',
    desc: 'Chuyển động đi bộ trong môi trường tương lai với ánh sáng neon.',
    input: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400",
    ref: "https://framerusercontent.com/assets/U4v4W7xT3tL0N8I.mp4",
    output: "https://framerusercontent.com/assets/U4v4W7xT3tL0N8I.mp4",
    type: 'MOTION',
    tag: 'CINEMATIC'
  }
];

interface AnimateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (template: Template) => void;
  initialMode: AnimateMode;
}

export const AnimateTemplateModal: React.FC<AnimateTemplateModalProps> = ({ 
  isOpen, onClose, onApply, initialMode 
}) => {
  const { t } = useLanguage();
  const [filterMode, setFilterMode] = useState<AnimateMode>(initialMode);

  if (!isOpen) return null;

  const filteredTemplates = TEMPLATES.filter(t => t.type === filterMode);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-12"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#0d0d0f] border border-white/10 rounded-[2.5rem] w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden shadow-3xl"
      >
        <div className="p-8 border-b border-black/5 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 dark:bg-black/40 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-purple-600/10 rounded-xl text-purple-500">
              <LayoutGrid size={24} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl font-black uppercase tracking-tight italic text-slate-900 dark:text-white leading-none">{t('animate.results.template')}</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Khám phá các mẫu chuyển động công nghiệp</p>
            </div>
          </div>

          <div className="flex bg-slate-200 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10 shadow-inner">
             <button 
               onClick={() => setFilterMode('MOTION')}
               className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 transition-all ${filterMode === 'MOTION' ? 'bg-white dark:bg-[#1a1a1e] text-cyan-500 shadow-lg' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
             >
                <Move size={12} /> {t('animate.mode.motion')}
             </button>
             <button 
               onClick={() => setFilterMode('SWAP')}
               className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 transition-all ${filterMode === 'SWAP' ? 'bg-white dark:bg-[#1a1a1e] text-purple-500 shadow-lg' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
             >
                <User size={12} /> {t('animate.mode.swap')}
             </button>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <X size={28} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto no-scrollbar p-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map(tmpl => (
                  <motion.div 
                    layout
                    key={tmpl.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 hover:border-purple-500/50 transition-all shadow-sm hover:shadow-2xl"
                  >
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="space-y-3">
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest ml-1 italic flex items-center gap-2">
                          <ImageIcon size={10} /> {tmpl.type === 'MOTION' ? 'Input Image' : 'Input Video'}
                        </p>
                        <div className="aspect-[3/4] bg-black rounded-2xl overflow-hidden border border-white/5 shadow-lg group-hover:scale-[1.02] transition-transform duration-500">
                          {tmpl.type === 'MOTION' ? (
                            <img src={tmpl.input} className="w-full h-full object-cover" alt="Input" />
                          ) : (
                            <video src={tmpl.input} autoPlay loop muted className="w-full h-full object-cover opacity-60" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest ml-1 italic flex items-center gap-2">
                          <Film size={10} /> {tmpl.type === 'MOTION' ? 'Ref Video' : 'Input Image'}
                        </p>
                        <div className="aspect-[3/4] bg-black rounded-2xl overflow-hidden border border-white/5 shadow-lg relative group-hover:scale-[1.02] transition-transform duration-500">
                          {tmpl.type === 'MOTION' ? (
                            <video src={tmpl.ref} autoPlay loop muted className="w-full h-full object-cover opacity-60" />
                          ) : (
                            <img src={tmpl.ref} className="w-full h-full object-cover" />
                          )}
                          {tmpl.type === 'MOTION' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play size={20} fill="white" className="text-white opacity-40" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-[8px] font-black uppercase text-brand-blue tracking-[0.3em] ml-1 italic flex items-center gap-2">
                          <LayoutGrid size={10} /> Cinematic Sample Output
                        </p>
                        <div className="aspect-video bg-black rounded-[1.5rem] overflow-hidden border border-brand-blue/20 shadow-xl group-hover:scale-[1.02] transition-transform duration-500">
                          <video src={tmpl.output} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{tmpl.name}</h4>
                          <span className={`px-3 py-1 bg-brand-blue/10 text-brand-blue text-[8px] font-black uppercase rounded-full border border-brand-blue/20 ${tmpl.type === 'SWAP' ? 'text-purple-500 border-purple-500/30' : ''}`}>
                            {tmpl.tag}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic">"{tmpl.desc}"</p>
                        <button 
                          onClick={() => onApply(tmpl)}
                          className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-brand-blue dark:hover:bg-purple-600 dark:hover:text-white transition-all shadow-xl active:scale-95 group/btn overflow-hidden relative"
                        >
                          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                          <Check size={16} strokeWidth={4} className="relative z-10" /> <span className="relative z-10">{t('animate.results.use_template')}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
