
import React from 'react';
import { motion } from 'framer-motion';
import { Music, Sparkles, Maximize2, Zap, Loader2, ChevronLeft, Globe, Cpu, ChevronDown } from 'lucide-react';
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
}

export const StudioSidebar: React.FC<StudioSidebarProps> = (props) => {
  const labelStyle = "text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest mb-3 block px-1";
  const inputBg = "bg-[#161b22] border border-transparent focus:border-brand-blue/30 rounded-xl transition-all outline-none text-white text-sm shadow-inner";
  const selectStyle = "w-full bg-[#0d1117] border border-white/5 p-2.5 rounded-lg text-[10px] font-black uppercase outline-none appearance-none focus:border-brand-blue transition-all cursor-pointer text-white shadow-inner";

  // Check if inputs are sufficient for enabling the button
  const isInputValid = props.songName.trim().length >= 5 && props.description.trim().length > 0 && (props.isInstrumental || props.lyrics.trim().length > 0);

  return (
    <aside className="w-full lg:w-[400px] border-r border-white/5 flex flex-col shrink-0 bg-[#0d1117] transition-all z-20 shadow-2xl">
      {/* Header */}
      <div className="h-16 lg:h-20 flex items-center px-6 border-b border-white/5 shrink-0">
        <button onClick={props.onClose} className="p-2 -ml-2 text-gray-500 hover:text-white transition-colors mr-2">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <Music size={20} className="text-brand-blue" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Music Studio</h2>
        </div>
        <div className="ml-auto">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shadow-inner">
             <Sparkles size={20} />
          </div>
        </div>
      </div>

      {/* Content: Main Input Section */}
      <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8">
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

        <div className="flex items-center justify-between py-4 px-1 border-t border-white/5">
          <span className="text-xs font-black uppercase text-gray-300 tracking-wider italic">Nhạc không lời</span>
          <button 
            onClick={() => props.setIsInstrumental(!props.isInstrumental)}
            className={`w-12 h-6 rounded-full relative transition-colors ${props.isInstrumental ? 'bg-brand-blue' : 'bg-gray-700'}`}
          >
            <motion.div 
              animate={{ x: props.isInstrumental ? 26 : 2 }}
              className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
            />
          </button>
        </div>
      </div>

      {/* Infrastructure & Action: Moved to Bottom */}
      <div className="p-6 border-t border-white/5 bg-black/40 space-y-6 shrink-0 backdrop-blur-md">
        {/* Resource Selection Row */}
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
                     className="bg-transparent border-none p-0 text-[9px] font-black uppercase text-gray-400 outline-none cursor-pointer hover:text-white"
                   >
                     <option value="gommo" className="bg-[#0d1117]">Gommo</option>
                     <option value="fxlab" className="bg-[#0d1117]">FxLab</option>
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
                      <option key={m._id} value={m._id} className="bg-[#0d1117]">{m.name}</option>
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
