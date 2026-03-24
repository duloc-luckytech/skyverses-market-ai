
import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, BookOpen, LayoutGrid, Play, Download, Zap,
  ChevronRight, CheckCircle2, Move, User, ArrowRight
} from 'lucide-react';
import { AnimateMode } from '../../hooks/useVideoAnimate';

const DEMO_LIST = [
  {
    id: 'd1', title: 'Product Review BG', desc: 'Thay đổi bối cảnh sản phẩm chuyên nghiệp.',
    video: 'https://video.aidancing.net/video-avatar/ai-change-bg-review-product.mp4', tag: 'E-Commerce'
  },
  {
    id: 'd2', title: 'AI Fashion Walking', desc: 'Diễn hoạt dáng đi thời trang chuẩn Runway.',
    video: 'https://video.aidancing.net/video-avatar/ai-fashion-walking-posing-1.mp4', tag: 'Fashion'
  },
  {
    id: 'd3', title: 'AI Presenter Intro', desc: 'Giới thiệu sản phẩm với Avatar nói tự nhiên.',
    video: 'https://video.aidancing.net/video-avatar/ai-talking-intro-product-2.mp4', tag: 'Talking Avatar'
  },
  {
    id: 'd4', title: 'AI Singing', desc: 'Diễn hoạt ca hát chuyên nghiệp từ ảnh mẫu.',
    video: 'https://video.aidancing.net/video-avatar/ai-singing.mp4', tag: 'Singing'
  },
  {
    id: 'd5', title: 'Speech-to-Speech', desc: 'Đồng bộ giọng nói và biểu cảm khuôn mặt.',
    video: 'https://video.aidancing.net/video-avatar/ai-sts.mp4', tag: 'STS Sync'
  },
  {
    id: 'd6', title: 'Face Swap Pro', desc: 'Thay đổi nhân dạng chính xác cao trong video.',
    video: 'https://video.aidancing.net/video-avatar/face-swap.mp4', tag: 'Identity Swap'
  }
];

const CAPABILITIES = [
  { label: 'Identity Lock', desc: 'Khóa chặt nhân dạng' },
  { label: 'Background Fix', desc: 'Bối cảnh ổn định' },
  { label: 'Action Sync', desc: 'Đồng bộ hành động' },
  { label: '60FPS Flow', desc: 'Chuyển động mượt' },
];

interface AnimateIntelViewProps {
  mode: AnimateMode;
  onShowTemplates: () => void;
  onDownload: (url: string, filename: string) => void;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export const AnimateIntelView: React.FC<AnimateIntelViewProps> = ({ mode, onShowTemplates, onDownload }) => {
  return (
    <motion.div key="intel-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-grow flex flex-col overflow-y-auto no-scrollbar">

      {/* ═══ HERO SECTION ═══ */}
      <div className="px-6 lg:px-12 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
            {/* Left: Info */}
            <motion.div {...fadeUp(0)} className="space-y-8">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500 ${mode === 'MOTION'
                    ? 'bg-gradient-to-br from-indigo-500 to-blue-500 shadow-indigo-500/20'
                    : 'bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-violet-500/20'}`}>
                  {mode === 'MOTION' ? <Move size={24} className="text-white" /> : <User size={24} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                    {mode === 'MOTION' ? 'Motion AI' : 'Swap AI'}
                  </h2>
                  <p className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mt-1">
                    {mode === 'MOTION' ? 'Animate • Transfer • Create' : 'Replace • Transform • Swap'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <BookOpen size={14} className="text-indigo-400" /> Cách hoạt động
                </div>
                <p className="text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {mode === 'MOTION'
                    ? 'Kết hợp ảnh tĩnh + video mẫu → AI tạo video mới giữ nguyên gương mặt nhưng chuyển động theo video tham chiếu.'
                    : 'Thay thế gương mặt trong video gốc bằng nhân dạng mới từ ảnh chân dung — giữ nguyên bối cảnh và hành động.'}
                </p>
              </div>

              <button onClick={onShowTemplates}
                className="group bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3">
                <LayoutGrid size={18} />
                Mở thư viện kịch bản mẫu
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Right: Capability Cards */}
            <motion.div {...fadeUp(0.15)} className="grid grid-cols-2 gap-3">
              {CAPABILITIES.map((chip, i) => (
                <div key={chip.label}
                  className="p-5 bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-xl flex flex-col gap-2.5 group hover:border-indigo-500/20 hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white/90">{chip.label}</span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{chip.desc}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ SAMPLE VIDEOS ═══ */}
      <div className="px-6 lg:px-12 py-12 border-t border-slate-200/80 dark:border-white/[0.03] bg-white/50 dark:bg-black/20">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div {...fadeUp(0.1)} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                <LayoutGrid size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Ví dụ thực tế</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Video mẫu từ hệ thống AI</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {DEMO_LIST.map((demo, i) => (
              <motion.div key={demo.id} {...fadeUp(0.05 * i)}
                className="group bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl overflow-hidden hover:border-indigo-500/20 hover:shadow-lg transition-all duration-500">
                <div className="aspect-video bg-black relative overflow-hidden">
                  <video src={demo.video} autoPlay loop muted playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-md text-[8px] font-bold uppercase text-white tracking-wider">
                      {demo.tag}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
                      <Play size={20} fill="white" className="ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div className="space-y-0.5 min-w-0 pr-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white/90 truncate">{demo.title}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{demo.desc}</p>
                  </div>
                  <button onClick={() => onDownload(demo.video, `${demo.id}.mp4`)}
                    className="shrink-0 p-2.5 bg-slate-100 dark:bg-white/[0.03] rounded-xl text-slate-400 dark:text-slate-500 hover:bg-indigo-500 hover:text-white transition-all">
                    <Download size={16} />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* CTA Card */}
            <motion.div {...fadeUp(0.3)}
              onClick={onShowTemplates}
              className="cursor-pointer p-8 bg-indigo-500/5 dark:bg-indigo-500/[0.03] border border-dashed border-indigo-500/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 group hover:bg-indigo-500/10 dark:hover:bg-indigo-500/[0.06] transition-all min-h-[240px]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-slate-800 dark:text-white">Khám phá kịch bản?</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">
                  Truy cập thư viện Template để xem các kịch bản đã tối ưu.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-500 pt-2 group-hover:gap-3 transition-all">
                Xem tất cả <ChevronRight size={14} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
