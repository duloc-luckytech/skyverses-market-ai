import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, LayoutGrid, Play, ChevronRight, Activity, UserCircle, Film, ArrowRight, Layers, Info, MonitorPlay } from 'lucide-react';
import { AnimateMode } from '../../hooks/useVideoAnimate';

interface Props {
  mode: AnimateMode;
}

const DEMOS = [
  { 
    id: 1, 
    label: 'AI Fashion Walking', 
    color: 'bg-cyan-500', 
    video: 'https://video.aidancing.net/video-avatar/ai-fashion-walking-posing-1.mp4' 
  },
  { 
    id: 2, 
    label: 'Product Review BG', 
    color: 'bg-purple-500', 
    video: 'https://video.aidancing.net/video-avatar/ai-change-bg-review-product.mp4' 
  },
];

export const AnimateViewport: React.FC<Props> = ({ mode }) => {
  return (
    <div className="w-full max-w-[480px] flex flex-col h-full gap-8 overflow-y-auto no-scrollbar pb-32">
      <div className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 space-y-10 shadow-2xl transition-all">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl transition-colors duration-500 ${mode === 'MOTION' ? 'bg-cyan-500 shadow-cyan-500/20' : 'bg-purple-600 shadow-purple-500/20'}`}>
            <Sparkles size={32} className="text-white dark:text-black" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Production Intel</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest italic leading-none">Industrial_Engine_Active</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan-500 italic flex items-center gap-3">
            <Layers size={14} /> Capabilities
          </h4>
          <p className="text-[13px] text-slate-600 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight italic border-l border-slate-200 dark:border-white/10 pl-6">
            Giải pháp chuyên biệt cho Agency & Studios. 
            Sử dụng mỏ neo <span className="text-cyan-500 font-black">Identity Lock</span> để duy trì đặc điểm nhân vật 100% trong quá trình diễn hoạt phức tạp. 
            Khử nhiễu và làm mượt chuyển động bằng AI nội bộ.
          </p>
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em]">
              <LayoutGrid size={14} /> Production Showcase
            </div>
            <span className="text-[8px] font-bold text-cyan-500 uppercase opacity-50 tracking-[0.2em]">Validated Takes</span>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {DEMOS.map(demo => (
              <div key={demo.id} className="aspect-video bg-slate-100 dark:bg-black border border-slate-100 dark:border-white/5 rounded-2xl relative overflow-hidden group cursor-pointer shadow-xl">
                <video 
                  src={demo.video} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase text-white shadow-2xl ${demo.color}`}>
                    {demo.label}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                    <MonitorPlay size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5 transition-colors">
          <button className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform shadow-inner">
                <Activity size={24} />
              </div>
              <div className="text-left space-y-0.5">
                <p className="text-[12px] font-black uppercase italic tracking-widest text-slate-800 dark:text-white leading-none">Motion Transfer</p>
                <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tight">Tái cấu trúc chuyển động tham chiếu</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 dark:text-gray-600 group-hover:text-cyan-500" />
          </button>
          
          <button className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform shadow-inner">
                <UserCircle size={24} />
              </div>
              <div className="text-left space-y-0.5">
                <p className="text-[12px] font-black uppercase italic tracking-widest text-slate-800 dark:text-white leading-none">Identity Swap Pro</p>
                <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tight">Thay thế chân dung chất lượng cao</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 dark:text-gray-600 group-hover:text-purple-500" />
          </button>
        </div>
      </div>

      <div className="p-8 bg-brand-blue/5 border border-brand-blue/10 rounded-[2rem] space-y-4">
        <div className="flex items-center gap-3 text-brand-blue">
          <Info size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Hỗ trợ kỹ thuật</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase italic">
          Gặp khó khăn? Liên hệ Node_Admin tại <span className="text-brand-blue underline cursor-pointer">support@skyverses.com</span> để được tối ưu hóa tham số riêng.
        </p>
      </div>
    </div>
  );
};