
import React from 'react';
import { motion } from 'framer-motion';
import { Music, Sparkles, Maximize2, ChevronRight, Zap, Loader2, ChevronLeft } from 'lucide-react';

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
  selectedModel: string;
  isGenerating: boolean;
  onExpand: (type: 'desc' | 'lyrics') => void;
  onGenerate: () => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = (props) => {
  const labelStyle = "text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block";
  const inputBg = "bg-[#161b22] border border-transparent focus:border-brand-blue/30 rounded-xl transition-all outline-none text-white text-sm shadow-inner";

  return (
    <aside className="w-full lg:w-[400px] border-r border-white/5 flex flex-col shrink-0 bg-[#0d1117] transition-all z-20 shadow-2xl">
      <div className="h-16 lg:h-20 flex items-center px-6 border-b border-white/5 shrink-0">
        <button onClick={props.onClose} className="p-2 -ml-2 text-gray-500 hover:text-white transition-colors mr-2">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <Music size={20} className="text-brand-blue" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Create Music</h2>
        </div>
        <div className="ml-auto">
          <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue shadow-inner">
            <Sparkles size={16} />
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-3">
          <label className={labelStyle}>Tên bài hát</label>
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
            placeholder="Verse 1..."
            className={`${inputBg} w-full h-32 p-4 resize-none leading-relaxed`}
          />
        </div>

        <div className="space-y-3">
          <label className={labelStyle}>Mô hình</label>
          <button className="w-full p-5 bg-[#161b22] border border-white/5 rounded-xl flex items-center justify-between group hover:border-brand-blue/30 transition-all shadow-sm">
            <div className="text-left">
              <p className="text-sm font-black text-white">{props.selectedModel}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">2500 credits</p>
            </div>
            <ChevronRight size={18} className="text-gray-600 group-hover:text-brand-blue transition-all" />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 px-1">
          <span className="text-sm font-black uppercase text-gray-300 tracking-wider">Không lời</span>
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

      <div className="p-6 border-t border-white/5 bg-[#0d1117] space-y-4 shrink-0">
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Chi phí: <span className="text-white font-black italic">2500</span> credits</p>
          <Zap size={14} className="text-orange-500" fill="currentColor" />
        </div>
        <button 
          onClick={props.onGenerate}
          disabled={props.isGenerating || !props.description.trim()}
          className="w-full py-5 bg-gradient-to-r from-brand-blue to-[#8a3ffc] text-white rounded-xl text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group disabled:opacity-30 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          {props.isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Music size={18} fill="currentColor" />}
          Tạo Nhạc
        </button>
      </div>
    </aside>
  );
};
