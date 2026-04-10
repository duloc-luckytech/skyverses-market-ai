import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Layers, ArrowUpCircle } from 'lucide-react';

const MODES = [
  {
    icon: ImageIcon, title: 'Đơn lẻ (Single)',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/b7517569-0abd-4652-9113-10ef2d90ce00/public',
    features: ['Nhập 1 prompt → tạo 1–4 bản cùng lúc', 'Tải tối đa 6 ảnh tham chiếu hướng dẫn AI', 'Fullscreen preview + Edit trực tiếp', 'Auto Download & chọn nhiều bản để tải'],
  },
  {
    icon: Layers, title: 'Hàng loạt (Batch)',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/07580f2e-20f5-47ef-7020-0de17ab31200/public',
    features: ['Tối đa 10 prompt song song', 'Nhập nhanh từ clipboard — mỗi dòng 1 prompt', 'Mỗi prompt tạo ảnh riêng biệt', 'Quản lý, retry, xóa từng bản ghi'],
  },
  {
    icon: ArrowUpCircle, title: 'Nâng cấp ảnh (Upscale)',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/e450712b-1690-4aab-08d5-d54062e9aa00/public',
    features: ['Model: Nâng cấp ảnh AI', '3 chế độ: Professional, Standard, Generative Real', 'Upscale lên 2K / 4K / 8K / 10K / 12K', 'Giữ nguyên chi tiết, cải thiện độ sắc nét'],
  },
];

export const ModesSection: React.FC = () => (
  <section className="px-6 lg:px-16 py-16 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-6xl mx-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-500/60 dark:text-rose-400/60 mb-2">CHẾ ĐỘ TẠO ẢNH</p>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">3 chế độ sáng tạo</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODES.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ scale: 1.015 }}
            className="rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015] hover:border-rose-500/20 transition-all overflow-hidden group"
          >
            {/* Thumbnail */}
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '2/1' }}>
              <img
                src={m.thumbnail}
                alt={m.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* Icon badge */}
              <div className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-rose-500/80 backdrop-blur flex items-center justify-center">
                <m.icon size={13} className="text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-sm font-semibold mb-3">{m.title}</h3>
              <ul className="space-y-2">
                {m.features.map((f, j) => (
                  <li key={j} className="text-[11px] text-slate-500 dark:text-white/30 leading-relaxed flex items-start gap-2">
                    <span className="text-rose-500/50 mt-0.5 shrink-0">▸</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
