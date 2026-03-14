import React from 'react';
import { motion } from 'framer-motion';
import { PenLine, Image, SlidersHorizontal, Sparkles, Mic, Move3d } from 'lucide-react';

const STEPS = [
  {
    step: '01', title: 'Nhập kịch bản', icon: <PenLine size={18} />,
    desc: 'Viết prompt bằng tiếng Việt hoặc tiếng Anh. Hệ thống tự động dịch và tối ưu prompt cho từng model engine.',
    tags: ['Tự động dịch', 'Prompt Optimize'],
  },
  {
    step: '02', title: 'Tải ảnh tham chiếu', icon: <Image size={18} />,
    desc: 'Hỗ trợ Start Frame & End Frame để kiểm soát chính xác điểm bắt đầu và kết thúc video. Upload hoặc chọn từ thư viện.',
    tags: ['Start Frame', 'End Frame', 'Image Library'],
  },
  {
    step: '03', title: 'Chọn Model & Cấu hình', icon: <SlidersHorizontal size={18} />,
    desc: 'Chọn từ 30+ models: VEO 3.1 (4K), Kling 3.0 (Motion Control), Sora 2, Hailuo 2.3... Tùy chỉnh chế độ, tỷ lệ, độ phân giải.',
    tags: ['30+ Models', 'Relaxed/Fast/Quality', '480p→4K'],
  },
  {
    step: '04', title: 'Tạo & Nhận video', icon: <Sparkles size={18} />,
    desc: 'Theo dõi tiến trình real-time qua Production Log. Video hoàn thành tự động giao tới thư viện, hỗ trợ auto-download.',
    tags: ['Real-time Log', 'Auto Download', 'Credit Refund'],
  },
];

const EXTRAS = [
  { icon: <Mic size={16} />, title: 'LipSync', desc: 'Kling LipSync đồng bộ khẩu hình với audio.' },
  { icon: <Move3d size={16} />, title: 'Motion Control', desc: 'Kling Motion Control điều khiển chuyển động camera.' },
];

export const WorkflowSection: React.FC = () => (
  <section className="py-24 border-y border-black/[0.06] dark:border-white/[0.04] relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-6 lg:px-12">
      <div className="text-center space-y-3 mb-16">
        <span className="text-indigo-500/60 dark:text-indigo-400 font-semibold uppercase tracking-wider text-[9px]">How It Works</span>
        <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">4 bước <span className="text-indigo-500 dark:text-indigo-400">tạo video</span></h2>
        <p className="text-slate-500 dark:text-[#555] font-medium text-sm max-w-lg mx-auto">Từ kịch bản đến video hoàn thiện, mọi thứ đều tự động.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.08 }}
            className="p-5 bg-black/[0.01] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-2xl flex gap-4 group hover:border-indigo-500/20 transition-all"
          >
            <div className="shrink-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform">{s.icon}</div>
              <p className="text-[7px] font-medium text-slate-300 dark:text-[#333] text-center mt-1">{s.step}</p>
            </div>
            <div className="space-y-2 min-w-0">
              <h3 className="text-sm font-semibold">{s.title}</h3>
              <p className="text-[10px] text-slate-500 dark:text-[#555] font-medium leading-relaxed">{s.desc}</p>
              <div className="flex flex-wrap gap-1">
                {s.tags.map(t => (
                  <span key={t} className="px-1.5 py-0.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.04] rounded text-[7px] font-medium text-slate-400 dark:text-[#444]">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Extra features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EXTRAS.map(e => (
          <div key={e.title} className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 dark:text-violet-400 shrink-0">{e.icon}</div>
            <div>
              <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-300">{e.title}</p>
              <p className="text-[9px] text-slate-500 dark:text-[#555] font-medium">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
