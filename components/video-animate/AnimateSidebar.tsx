
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImageIcon, Film, User, ChevronDown, Cpu, Zap, 
  Settings2, Loader2, X, ExternalLink, Globe, Server
} from 'lucide-react';
import { RATIOS, QUALITY_MODES, AnimateMode } from '../../hooks/useVideoAnimate';
import { PricingModel } from '../../apis/pricing';

interface Props {
  mode: AnimateMode;
  setMode: (m: AnimateMode) => void;
  selectedModel: PricingModel | null;
  setSelectedModel: (m: PricingModel) => void;
  selectedEngine: string;
  setSelectedEngine: (val: string) => void;
  availableModels: PricingModel[];
  selectedRatio: string;
  setSelectedRatio: (r: string) => void;
  selectedQuality: string;
  setSelectedQuality: (q: string) => void;
  sourceImg: string | null;
  setSourceImg: (s: string | null) => void;
  refVideo: string | null;
  setRefVideo: (v: string | null) => void;
  isGenerating: boolean;
  estimatedCost: number;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'IMG' | 'VID') => void;
  handleSynthesize: () => void;
}

export const AnimateSidebar: React.FC<Props> = (props) => {
  const [showModelMenu, setShowModelMenu] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  const activeGradient = props.mode === 'MOTION' 
    ? 'from-cyan-500 to-blue-600 shadow-cyan-500/20' 
    : 'from-purple-600 to-fuchsia-600 shadow-purple-500/20';

  return (
    <div className="w-full lg:w-[500px] flex flex-col h-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative transition-colors">
      <div className="flex-grow overflow-y-auto no-scrollbar p-8 lg:p-10 space-y-10">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.02] pointer-events-none text-slate-900 dark:text-white">
          <Settings2 size={240} />
        </div>

        {/* DUAL ASSET UPLOAD */}
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em]">
              <ImageIcon size={14} className="text-cyan-500" /> Identity Anchor
            </div>
            <div 
              className={`relative aspect-[3/4] rounded-3xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 cursor-pointer group ${props.sourceImg ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-slate-200 dark:border-white/10 hover:border-cyan-500/40 bg-slate-50 dark:bg-white/[0.02]'}`}
              onClick={() => !props.sourceImg && imgInputRef.current?.click()}
            >
              {props.sourceImg ? (
                <>
                  <img src={props.sourceImg} className="w-full h-full object-cover" alt="Identity" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); props.setSourceImg(null); }}
                    className="absolute top-4 right-4 p-2 bg-red-500 rounded-full hover:scale-110 transition-transform shadow-xl text-white"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </>
              ) : (
                <div className="text-center space-y-2 p-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-500 mx-auto group-hover:scale-110 transition-transform shadow-inner">
                    <User size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Tải nhân vật</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Image Keyframe</p>
                  </div>
                </div>
              )}
              <input type="file" ref={imgInputRef} className="hidden" accept="image/*" onChange={(e) => props.handleFileUpload(e, 'IMG')} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em]">
              <Film size={14} className="text-purple-500" /> Motion Reference
            </div>
            <div 
              className={`relative aspect-[3/4] rounded-3xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 cursor-pointer group ${props.refVideo ? 'border-purple-500 shadow-[0_0_30_rgba(147,51,234,0.1)]' : 'border-slate-200 dark:border-white/10 hover:border-purple-500/40 bg-slate-50 dark:bg-white/[0.02]'}`}
              onClick={() => !props.refVideo && vidInputRef.current?.click()}
            >
              {props.refVideo ? (
                <>
                  <div className="w-full h-full bg-slate-900 dark:bg-black flex items-center justify-center">
                    <Film className="text-purple-500 animate-pulse" size={48} />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); props.setRefVideo(null); }}
                    className="absolute top-4 right-4 p-2 bg-red-500 rounded-full hover:scale-110 transition-transform shadow-xl text-white"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </>
              ) : (
                <div className="text-center space-y-2 p-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-500 mx-auto group-hover:scale-110 transition-transform shadow-inner">
                    <Film size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Tải Video Mẫu</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Physics Source</p>
                  </div>
                </div>
              )}
              <input type="file" ref={vidInputRef} className="hidden" accept="video/*" onChange={(e) => props.handleFileUpload(e, 'VID')} />
            </div>
          </div>
        </div>

        {/* SOURCE & MODEL ORCHESTRATION */}
        <div className="space-y-6 pt-4 relative z-20">
          <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em] text-center italic">Infrastructure & Logic</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SOURCE SELECTOR */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1 italic flex items-center gap-2">
                <Globe size={12} className="text-brand-blue" /> Infrastructure
              </label>
              <select 
                value={props.selectedEngine}
                onChange={(e) => props.setSelectedEngine(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white appearance-none cursor-pointer shadow-sm"
              >
                <option value="fxlab">Fxlab Node</option>
                <option value="gommo">Gommo Cluster</option>
                <option value="wan">Wan Direct</option>
              </select>
            </div>

            {/* MODEL SELECTOR */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1 italic flex items-center gap-2">
                <Server size={12} className="text-brand-blue" /> Neural Model
              </label>
              <div className="relative">
                <button 
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-3 rounded-xl flex items-center justify-between group hover:border-brand-blue/30 transition-all shadow-sm"
                >
                  <span className="font-black text-[10px] tracking-tight uppercase italic text-slate-900 dark:text-white truncate pr-4">
                    {props.selectedModel?.name || 'Loading...'}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showModelMenu ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showModelMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-2 w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[110] overflow-hidden max-h-60 overflow-y-auto no-scrollbar"
                    >
                      {props.availableModels.map(m => (
                        <button 
                          key={m._id} 
                          onClick={() => { props.setSelectedModel(m); setShowModelMenu(false); }}
                          className={`w-full p-4 flex flex-col items-start rounded-xl transition-all ${props.selectedModel?._id === m._id ? 'bg-brand-blue/10 text-brand-blue' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400'}`}
                        >
                          <p className="text-[10px] font-black uppercase italic">{m.name}</p>
                          <p className="text-[8px] font-medium opacity-60 uppercase tracking-widest mt-1 line-clamp-1">{m.description || 'Professional production model'}</p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* MODE & RATIO */}
        <div className="grid grid-cols-2 gap-6 pb-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-2 italic">Dung lượng / Resolution</label>
            <select 
              value={props.selectedQuality} 
              onChange={e => props.setSelectedQuality(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-4 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-cyan-500/30 text-slate-900 dark:text-white shadow-inner"
            >
              {QUALITY_MODES.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-2 italic">Tỉ lệ / Ratio</label>
            <select 
              value={props.selectedRatio} 
              onChange={e => props.setSelectedRatio(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-4 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-cyan-500/30 text-slate-900 dark:text-white shadow-inner"
            >
              {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div className="p-10 border-t border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#141414]/80 backdrop-blur-md shrink-0 space-y-4">
        <button 
          onClick={props.handleSynthesize}
          disabled={props.isGenerating || !props.sourceImg}
          className={`w-full py-7 rounded-[2.5rem] flex items-center justify-center gap-4 text-[14px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-[0.97] group overflow-hidden relative ${props.sourceImg ? `bg-gradient-to-r ${activeGradient} text-white` : 'bg-slate-100 dark:bg-[#222] text-slate-400 dark:text-gray-500 cursor-not-allowed'}`}
        >
          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          {props.isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} fill="currentColor" />}
          {props.mode === 'MOTION' ? 'Khởi chạy Motion' : 'Khởi chạy Face Swap'} 
          <span className="opacity-40 ml-1 text-xs">({props.estimatedCost} CR)</span>
        </button>
        <div className="text-center">
          <p className="text-[9px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.4em] italic">
            Industrial Neural Lattice // v4.2 Stable Node
          </p>
        </div>
      </div>
    </div>
  );
};
