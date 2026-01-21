
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Layers, BookOpen, LayoutGrid, ImageIcon, Film, Play, Download, Zap, ChevronRight 
} from 'lucide-react';
import { AnimateMode } from '../../hooks/useVideoAnimate';

const DEMO_LIST = [
  {
    id: 'd1',
    title: 'Product Review BG',
    desc: 'Thay đổi bối cảnh sản phẩm chuyên nghiệp.',
    video: 'https://video.aidancing.net/video-avatar/ai-change-bg-review-product.mp4',
    tag: 'E-COMMERCE'
  },
  {
    id: 'd2',
    title: 'AI Fashion Walking',
    desc: 'Diễn hoạt dáng đi thời trang chuẩn Runway.',
    video: 'https://video.aidancing.net/video-avatar/ai-fashion-walking-posing-1.mp4',
    tag: 'FASHION'
  }
];

interface AnimateIntelViewProps {
  mode: AnimateMode;
  onShowTemplates: () => void;
  onDownload: (url: string, filename: string) => void;
}

export const AnimateIntelView: React.FC<AnimateIntelViewProps> = ({ mode, onShowTemplates, onDownload }) => {
  return (
    <motion.div 
      key="intel-view"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-grow flex flex-col p-6 lg:p-16 overflow-y-auto no-scrollbar"
    >
      <div className="max-w-7xl mx-auto w-full space-y-16">
        
        {/* TOP SECTION: INTRO */}
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
                  INDUSTRIAL_SYNTHESIS_ACTIVE
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-cyan-500 italic flex items-center gap-4">
                <BookOpen size={18} /> Kiến thức vận hành
              </h4>
              <div className="space-y-4">
                  <p className="text-xl text-slate-700 dark:text-gray-200 font-bold leading-relaxed uppercase tracking-tight italic border-l-4 border-brand-blue pl-8 transition-colors">
                    {mode === 'MOTION' 
                      ? 'Animate an identity using a reference movement.' 
                      : 'Replace a character identity from an image source.'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic pl-8">
                    {mode === 'MOTION' 
                      ? "Kết hợp một ảnh tĩnh và một video mẫu để tạo ra video mới giữ nguyên gương mặt nhưng chuyển động theo video tham chiếu."
                      : "Thay thế gương mặt trong video gốc bằng một nhân dạng mới từ ảnh chân dung mà không làm thay đổi bối cảnh."}
                  </p>
              </div>
            </div>

            <div className="pt-6">
              <button onClick={onShowTemplates} className="px-12 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all group">
                  <LayoutGrid size={20} className="group-hover:rotate-12 transition-transform" /> Mở thư viện kịch bản mẫu
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
                { label: 'IDENTITY LOCK', desc: 'Khóa chặt nhân dạng' },
                { label: 'BACKGROUND FIX', desc: 'Bối cảnh ổn định' },
                { label: 'ACTION SYNC', desc: 'Đồng bộ hành động' },
                { label: '60FPS FLOW', desc: 'Chuyển động mượt' }
            ].map(chip => (
                <div key={chip.label} className="p-6 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl flex flex-col gap-3 group hover:border-brand-blue/30 transition-all shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">{chip.label}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase italic">{chip.desc}</span>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* BOTTOM SECTION: INDUSTRIAL SAMPLE FLOW (VIDEO CARDS) */}
        <div className="space-y-8 pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                 <LayoutGrid size={20} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Industrial Sample Flow</h3>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Kết quả thực tế từ hệ thống</p>
              </div>
            </div>
            <span className="text-[8px] font-black text-brand-blue uppercase opacity-50 tracking-[0.2em]">VALIDATED_OUTPUT_v4.2</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {DEMO_LIST.map((demo) => (
              <div key={demo.id} className="group relative bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-brand-blue/40 transition-all duration-500">
                <div className="aspect-video bg-black relative overflow-hidden">
                  <video 
                    src={demo.video} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" 
                  />
                  
                  {/* Overlay Tags */}
                  <div className="absolute top-6 left-6 z-20">
                    <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black uppercase text-white tracking-widest shadow-xl">
                      {demo.tag}
                    </span>
                  </div>

                  {/* Play/Control Icon - Subtle in center */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                     <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-3xl">
                        <Play size={28} fill="white" className="ml-1" />
                     </div>
                  </div>
                </div>

                <div className="p-8 flex justify-between items-end">
                   <div className="space-y-2">
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">{demo.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400 font-medium italic">"{demo.desc}"</p>
                   </div>
                   <button 
                     onClick={() => onDownload(demo.video, `${demo.id}.mp4`)}
                     className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 dark:text-gray-500 hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                   >
                     <Download size={20} />
                   </button>
                </div>
              </div>
            ))}

            {/* CTA CARD */}
            <div className="p-10 bg-brand-blue/5 border border-dashed border-brand-blue/20 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-6 group hover:bg-brand-blue/10 transition-all cursor-pointer" onClick={onShowTemplates}>
               <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                  <Zap size={32} fill="currentColor" />
               </div>
               <div className="space-y-2">
                  <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">Thêm nhiều mẫu hơn?</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest max-w-[200px]">Truy cập thư viện Template để xem hàng trăm kịch bản đã tối ưu.</p>
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase text-brand-blue tracking-[0.2em] pt-4">
                  KHÁM PHÁ NGAY <ChevronRight size={14} />
               </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

const CheckCircle2 = ({ size, className }: { size?: number, className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
