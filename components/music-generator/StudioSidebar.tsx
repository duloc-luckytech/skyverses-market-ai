
import React from 'react';
import { motion } from 'framer-motion';
import { Music, Maximize2, Zap, Loader2, ChevronLeft, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { PricingModel } from '../../apis/pricing';
import { ResourceControl } from '../fashion-studio/ResourceControl';

interface StudioSidebarProps {
  onClose: () => void;
  songName: string;
  setSongName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  lyrics: string;
  setLyrics: (v: string) => void;
  isInstrumental: boolean;
  setIsInstrumental: (v: boolean) => void;
  // Infrastructure props
  selectedEngine: string;
  setSelectedEngine: (v: string) => void;
  availableModels: PricingModel[];
  selectedModelObj: PricingModel | null;
  setSelectedModelObj: (m: PricingModel) => void;
  currentUnitCost: number;
  usagePreference: 'credits' | 'key';
  credits: number;
  setShowResourceModal: (val: boolean) => void;
  // UI props
  isGenerating: boolean;
  onExpand: (type: 'desc' | 'lyrics') => void;
  onGenerate: () => void;
  isMobileExpanded: boolean;
  setIsMobileExpanded: (val: boolean) => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = (props) => {
  const labelStyle = "text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-3 block px-1";
  const inputBg = "bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-transparent focus:border-brand-blue/30 rounded-xl transition-all outline-none text-slate-900 dark:text-white text-sm shadow-inner";
  const selectStyle = "w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/5 p-2.5 rounded-lg text-[10px] font-black uppercase outline-none appearance-none focus:border-brand-blue transition-all cursor-pointer text-slate-900 dark:text-white shadow-inner";

  const isInputValid = props.songName.trim().length >= 5 && props.description.trim().length > 0 && (props.isInstrumental || props.lyrics.trim().length > 0);

  return (
    <aside 
      className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[400px] bg-white dark:bg-[#0d1117] border-t lg:border-t-0 lg:border-r border-black/5 dark:border-white/5 flex flex-col z-[150] lg:z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-2xl transition-all duration-500 ease-in-out ${props.isMobileExpanded ? 'h-[92dvh] rounded-t-[2.5rem]' : 'h-16 lg:h-full lg:rounded-none'}`}
    >
      {/* Mobile Handle Bar */}
      <div 
        className="lg:hidden h-16 flex flex-col items-center justify-center shrink-0 cursor-pointer relative"
        onClick={() => props.setIsMobileExpanded(!props.isMobileExpanded)}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-white/10 rounded-full mb-2"></div>
        <div className="flex items-center gap-2">
          <Music size={14} className="text-brand-blue" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
            {props.isMobileExpanded ? 'Vuốt xuống để thu gọn' : 'Thiết lập âm nhạc'}
          </span>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          {props.isMobileExpanded ? <ChevronDown size={20} className="text-slate-400"/> : <ChevronUp size={20} className="text-slate-400"/>}
        </div>
      </div>

      {/* Header (Desktop Only) */}
      <div className="hidden lg:flex h-16 lg:h-20 items-center px-6 border-b border-black/5 dark:border-white/5 shrink-0">
        <button onClick={props.onClose} className="p-2 -ml-2 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors mr-2">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <Music size={20} className="text-brand-blue" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white italic leading-none">Music Studio</h2>
        </div>
      </div>

      {/* Content: Main Input Section */}
      <div className={`flex-grow overflow-y-auto no-scrollbar p-6 space-y-8 ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <div className="space-y-3">
          <label className={labelStyle}>Tên bài hát (Tối thiểu 5 ký tự)</label>
          <input 
            value={props.songName} onChange={(e) => props.setSongName(e.target.value)}
            placeholder="Nhập tên bài hát..."
            className={`${inputBg} w-full p-4`}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className={labelStyle}>Phong cách & Mô tả</label>
            <button onClick={() => props.onExpand('desc')} className="text-[10px] font-black text-brand-blue uppercase flex items-center gap-1 hover:underline">
              <Maximize2 size={12} /> Mở rộng
            </button>
          </div>
          <textarea 
            value={props.description} onChange={(e) => props.setDescription(e.target.value)}
            placeholder="Pop, sôi động, giọng nữ..."
            className={`${inputBg} w-full h-32 p-4 resize-none leading-relaxed`}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className={labelStyle}>Lời bài hát</label>
            <button onClick={() => props.onExpand('lyrics')} className="text-[10px] font-black text-brand-blue uppercase flex items-center gap-1 hover:underline">
              <Maximize2 size={12} /> Mở rộng
            </button>
          </div>
          <textarea 
            value={props.lyrics} onChange={(e) => props.setLyrics(e.target.value)}
            placeholder="Nhập lời bài hát tại đây..."
            className={`${inputBg} w-full h-32 p-4 resize-none leading-relaxed`}
          />
        </div>

        <div className="flex items-center justify-between py-4 px-1 border-t border-black/5 dark:border-white/5">
          <span className="text-xs font-black uppercase text-slate-600 dark:text-gray-300 tracking-wider italic">Nhạc không lời</span>
          <button 
            onClick={() => props.setIsInstrumental(!props.isInstrumental)}
            className={`w-12 h-6 rounded-full relative transition-colors ${props.isInstrumental ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-gray-700'}`}
          >
            <motion.div 
              animate={{ x: props.isInstrumental ? 26 : 2 }}
              className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
            />
          </button>
        </div>
      </div>

      {/* Infrastructure & Action */}
      <div className={`p-6 border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-black/40 space-y-6 shrink-0 backdrop-blur-md ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <div className="flex items-center justify-between gap-4">
           <ResourceControl 
             usagePreference={props.usagePreference}
             credits={props.credits}
             actionCost={props.currentUnitCost}
             onSettingsClick={() => props.setShowResourceModal(true)}
           />
           
           <div className="flex flex-col gap-1 flex-grow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Globe size={10} className="text-brand-blue" />
                   <select 
                     value={props.selectedEngine}
                     onChange={(e) => props.setSelectedEngine(e.target.value)}
                     className="bg-transparent border-none p-0 text-[9px] font-black uppercase text-slate-500 dark:text-gray-400 outline-none cursor-pointer hover:text-slate-900 dark:hover:text-white"
                   >
                     <option value="gommo" className="bg-white dark:bg-[#0d1117] text-slate-900 dark:text-white">Gommo</option>
                     <option value="fxlab" className="bg-white dark:bg-[#0d1117] text-slate-900 dark:text-white">FxLab</option>
                   </select>
                </div>
              </div>
              
              <div className="relative">
                <select 
                  value={props.selectedModelObj?._id || ''}
                  onChange={(e) => {
                    const found = props.availableModels.find(m => m._id === e.target.value);
                    if (found) props.setSelectedModelObj(found);
                  }}
                  className={selectStyle}
                >
                  {props.availableModels.length > 0 ? (
                    props.availableModels.map(m => (
                      <option key={m._id} value={m._id} className="bg-white dark:bg-[#0d1117] text-slate-900 dark:text-white">{m.name}</option>
                    ))
                  ) : (
                    <option disabled>Loading Engine...</option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
              </div>
           </div>
        </div>

        <button 
          onClick={props.onGenerate}
          disabled={props.isGenerating || !isInputValid}
          className="w-full py-5 bg-gradient-to-r from-brand-blue to-[#8a3ffc] text-white rounded-xl text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-30 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          {props.isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
          TẠO NHẠC
        </button>
      </div>
    </aside>
  );
};
