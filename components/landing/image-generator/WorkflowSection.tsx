import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Cpu, SlidersHorizontal, Zap } from 'lucide-react';

const STEPS = [
  {
    icon: PenTool, num: '01', title: 'Nhập Prompt',
    // step-prompt-input failed → dùng feat-config-settings làm fallback
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/0dc9c6ea-9501-4545-9c9d-43ad5d938200/public',
    desc: 'Mô tả hình ảnh bằng ngôn ngữ tự nhiên. Hệ thống tự động dịch & tối ưu prompt cho engine AI. Hỗ trợ tải ảnh tham chiếu để hướng dẫn bố cục.',
  },
  {
    icon: Cpu, num: '02', title: 'Chọn Model Family',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/61175234-382a-4761-9be6-fbff77b38100/public',
    desc: 'Chọn nhóm model: Nano Banana Pro (5 chế độ), Seedream 5 (lên 8K), Midjourney 7 (turbo), Kling 3.0 Omni (12K), hoặc IMAGE O1 — hệ thống tự chọn phiên bản tối ưu.',
  },
  {
    icon: SlidersHorizontal, num: '03', title: 'Tinh chỉnh Config',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/296a18d1-c84c-492f-ce6f-d4730adc9600/public',
    desc: 'Tùy chỉnh tỷ lệ (11 lựa chọn từ 1:1 đến 21:9), độ phân giải (1K → 12K), chế độ ưu tiên (vip3/fast/relaxed), và số lượng bản tạo cùng lúc.',
  },
  {
    icon: Zap, num: '04', title: 'Tạo & Quản lý',
    // step-generate-manage failed → dùng feat-production-log làm fallback
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/af086aaa-4f54-4bb1-0fc2-dd7c531a7100/public',
    desc: 'Click tạo — theo dõi Production Log real-time. Kết quả hiện tại Grid view với Fullscreen preview, Edit, Download, Auto Refund khi lỗi. Lịch sử lưu trên Cloud.',
  },
];

export const WorkflowSection: React.FC = () => (
  <section className="px-6 lg:px-16 py-16 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-6xl mx-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-500/60 dark:text-rose-400/60 mb-2">QUY TRÌNH</p>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">4 bước tạo hình ảnh AI</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.012 }}
            className="rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015] hover:border-rose-500/15 transition-all overflow-hidden group"
          >
            {/* Thumbnail */}
            <div className="relative w-full overflow-hidden" style={{ height: '140px' }}>
              <img
                src={s.thumbnail}
                alt={s.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

              {/* Step number + icon */}
              <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <s.icon size={13} className="text-white" />
                </div>
                <span className="text-white/50 text-[10px] font-bold tracking-widest">{s.num}</span>
                <h3 className="text-[13px] font-bold text-white">{s.title}</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-[11px] text-slate-500 dark:text-white/30 leading-relaxed">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
