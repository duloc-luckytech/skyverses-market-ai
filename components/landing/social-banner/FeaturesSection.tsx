import React from 'react';
import {
  Monitor, Palette, Type, Download,
  Ratio, Zap, ShieldCheck, History,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Monitor,
    title: '4 Nền tảng, 14+ Formats',
    desc: 'Hỗ trợ X Cover (1500×500), FB Cover & Post, IG Story & Post & Reels, LinkedIn Banner — đúng kích thước pixel chuẩn của từng nền tảng.',
  },
  {
    icon: Palette,
    title: 'Brand Colors & Fonts',
    desc: 'Nhập màu HEX thương hiệu, chọn font và style (Modern, Luxury, Minimal, Cyberpunk). AI giữ nhất quán brand identity xuyên suốt mọi banner.',
  },
  {
    icon: Type,
    title: 'AI Copywriting',
    desc: 'Nhập ý tưởng, AI tự viết headline hấp dẫn, tagline ngắn gọn và CTA phù hợp mục tiêu quảng cáo — hỗ trợ Tiếng Việt, Anh, Hàn, Nhật.',
  },
  {
    icon: Ratio,
    title: 'Pixel-Perfect Dimensions',
    desc: 'Mỗi banner xuất ra đúng kích thước chuẩn — không bị crop, không bị scale. Đảm bảo hiển thị sắc nét trên mọi thiết bị và màn hình.',
  },
  {
    icon: Zap,
    title: 'Tạo nhanh trong vài giây',
    desc: 'AI render banner chất lượng cao trong 10–30 giây. Hỗ trợ tạo nhiều phiên bản cùng lúc để A/B testing hiệu quả.',
  },
  {
    icon: Download,
    title: 'PNG / JPG Export',
    desc: 'Tải xuống file PNG hoặc JPG chất lượng cao, ready-to-upload lên social media mà không cần chỉnh sửa thêm.',
  },
  {
    icon: ShieldCheck,
    title: 'Auto-Refund khi lỗi',
    desc: 'Credit được hoàn tự động nếu job thất bại. Không mất tiền oan — hệ thống đảm bảo bạn luôn nhận được kết quả.',
  },
  {
    icon: History,
    title: 'Cloud History',
    desc: 'Mọi banner đã tạo được lưu trong Thư viện cá nhân trên cloud. Xem lại, tải về hoặc dùng làm ảnh tham chiếu cho lần sau.',
  },
];

export const FeaturesSection: React.FC = () => (
  <section className="px-6 lg:px-16 py-16 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-6xl mx-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-blue/60 mb-2">TÍNH NĂNG</p>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">Mọi thứ bạn cần để tạo banner đỉnh</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(f => (
          <div
            key={f.title}
            className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015] hover:border-brand-blue/20 dark:hover:border-brand-blue/15 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center mb-3 group-hover:bg-brand-blue/15 transition-colors">
              <f.icon size={14} className="text-brand-blue" />
            </div>
            <h3 className="text-[11px] font-semibold mb-1.5">{f.title}</h3>
            <p className="text-[10px] text-slate-500 dark:text-white/30 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
