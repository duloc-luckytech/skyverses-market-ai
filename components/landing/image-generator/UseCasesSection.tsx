import React from 'react';
import { motion } from 'framer-motion';
import { Boxes, SlidersHorizontal, CreditCard, Shield, ArrowDownToLine, ScrollText } from 'lucide-react';

const FEATURES = [
  {
    icon: Boxes, title: 'Model Family Selector',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/d2b9df18-97f6-4e6f-fbad-c349bb91ab00/public',
    desc: '10+ nhóm model — chọn Family, hệ thống tự chọn phiên bản tối ưu theo mode + resolution. Hỗ trợ 3 engine: Gommo, FxLab, Running.',
  },
  {
    icon: SlidersHorizontal, title: 'Cấu hình linh hoạt',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/0dc9c6ea-9501-4545-9c9d-43ad5d938200/public',
    desc: '11 tỷ lệ (1:1, 16:9, 21:9, 4:5...), 6 cấp phân giải (1K→12K), 5+ chế độ speed (vip3, vip, fast, relaxed, turbo), số lượng 1–4 bản.',
  },
  {
    icon: CreditCard, title: 'Credits & API Key',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/b933780b-7720-40cc-9200-a7ff316a1200/public',
    desc: 'Thanh toán bằng Credits (tính theo resolution + mode) hoặc API Key cá nhân cho UNLIMITED. Hiển thị chi phí trước khi tạo.',
  },
  {
    icon: Shield, title: 'Auto Refund lỗi',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/7daca5b0-7a91-4903-5929-b1485f32ce00/public',
    desc: 'Khi engine trả lỗi, hệ thống tự động hoàn Credits. Card hiện trạng thái REFUNDED rõ ràng. Retry 1-click không mất thêm phí.',
  },
  {
    icon: ArrowDownToLine, title: 'Auto Download',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/362e0953-cc79-4234-eabe-97797935bf00/public',
    desc: 'Bật Auto Download — ảnh tự tải ngay khi hoàn thành. Manual Download hỗ trợ chọn nhiều bản tải đồng thời.',
  },
  {
    icon: ScrollText, title: 'Production Log',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/af086aaa-4f54-4bb1-0fc2-dd7c531a7100/public',
    desc: 'Mỗi tác vụ tạo ảnh có nhật ký chi tiết: Pipeline init, Resource auth, Polling status, Error trace — hỗ trợ debug nhanh.',
  },
];

export const UseCasesSection: React.FC = () => (
  <section className="px-6 lg:px-16 py-16 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-6xl mx-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-500/60 dark:text-rose-400/60 mb-2">TÍNH NĂNG</p>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">Công cụ chuyên nghiệp</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.45 }}
            whileHover={{ scale: 1.015 }}
            className="rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015] hover:border-rose-500/15 transition-all overflow-hidden group"
          >
            {/* Thumbnail */}
            <div className="relative w-full overflow-hidden" style={{ height: '120px' }}>
              <img
                src={f.thumbnail}
                alt={f.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-rose-500/80 flex items-center justify-center">
                  <f.icon size={11} className="text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-[12px] font-semibold mb-1.5">{f.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-white/30 leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
