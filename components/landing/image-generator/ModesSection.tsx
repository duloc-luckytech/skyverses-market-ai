import React from 'react';
import { Image as ImageIcon, Layers, ArrowUpCircle } from 'lucide-react';

const MODES = [
  {
    icon: ImageIcon, title: 'Đơn lẻ (Single)',
    features: ['Nhập 1 prompt → tạo 1–4 bản cùng lúc', 'Tải tối đa 6 ảnh tham chiếu hướng dẫn AI', 'Fullscreen preview + Edit trực tiếp', 'Auto Download & chọn nhiều bản để tải'],
  },
  {
    icon: Layers, title: 'Hàng loạt (Batch)',
    features: ['Tối đa 10 prompt song song', 'Nhập nhanh từ clipboard — mỗi dòng 1 prompt', 'Mỗi prompt tạo ảnh riêng biệt', 'Quản lý, retry, xóa từng bản ghi'],
  },
  {
    icon: ArrowUpCircle, title: 'Nâng cấp ảnh (Upscale)',
    features: ['Model: Nâng cấp ảnh AI', '3 chế độ: Professional, Standard, Generative Real', 'Upscale lên 2K / 4K / 8K / 10K / 12K', 'Giữ nguyên chi tiết, cải thiện độ sắc nét'],
  },
];

export const ModesSection: React.FC = () => (
  <section className="px-6 lg:px-16 py-16 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-6xl mx-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-500/60 dark:text-rose-400/60 mb-2">CHẾ ĐỘ TẠO ẢNH</p>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">3 chế độ sáng tạo</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODES.map(m => (
          <div key={m.title} className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015] hover:border-rose-500/15 transition-all">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <m.icon size={14} className="text-rose-500 dark:text-rose-400" />
              </div>
              <h3 className="text-sm font-semibold">{m.title}</h3>
            </div>
            <ul className="space-y-2">
              {m.features.map((f, i) => (
                <li key={i} className="text-[11px] text-slate-500 dark:text-white/30 leading-relaxed flex items-start gap-2">
                  <span className="text-rose-500/50 mt-0.5">▸</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);
