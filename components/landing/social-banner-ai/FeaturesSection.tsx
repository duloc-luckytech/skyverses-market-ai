import React from 'react';
import { motion } from 'framer-motion';
import {
  Layout, Zap, Palette, Type, Download, ShieldCheck, Sparkles, RefreshCw,
} from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

const FEATURES = [
  {
    icon: Layout,
    title: 'Platform-Exact Dimensions',
    desc: 'Facebook cover 820×312, post 1200×630; X header 1500×500; Instagram 1080×1080, story 1080×1920; LinkedIn 1584×396 — tất cả tích hợp sẵn, không cần nhớ.',
    featured: true,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/dd3ddc15-7a7f-48ec-2d7d-f84f05bfa700/public',
  },
  {
    icon: Sparkles,
    title: 'AI Copy Generator',
    desc: 'AI tự viết tiêu đề, tagline và CTA phù hợp mục đích quảng bá — sale, sự kiện, thương hiệu hay tuyển dụng.',
    featured: true,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/76e91916-acec-440e-a531-77a5d19b6500/public',
  },
  {
    icon: Palette,
    title: 'Brand Color Injection',
    desc: 'Nhập màu HEX thương hiệu, upload logo — AI tự tích hợp vào banner một cách hài hòa.',
    featured: false,
  },
  {
    icon: Type,
    title: 'Smart Text Layout',
    desc: 'AI tự cân bằng font size, contrast và khoảng cách để text luôn đọc được trên mọi nền.',
    featured: false,
  },
  {
    icon: Download,
    title: 'Batch Export',
    desc: 'Xuất tất cả formats cùng lúc. PNG hoặc JPG 4K — sẵn sàng đăng lên mạng xã hội ngay lập tức.',
    featured: false,
  },
  {
    icon: RefreshCw,
    title: 'Auto Refund',
    desc: 'Nếu AI trả lỗi, credits được hoàn tự động. Retry 1-click không mất thêm phí.',
    featured: false,
  },
  {
    icon: Zap,
    title: 'Tốc độ 30 giây',
    desc: 'Pipeline tối ưu — từ prompt đến banner hoàn chỉnh trong trung bình 30 giây.',
    featured: false,
  },
  {
    icon: ShieldCheck,
    title: 'Bảo mật tài sản',
    desc: 'Mọi banner tạo ra chỉ bạn mới thấy. Không dùng dữ liệu thương hiệu để train model.',
    featured: false,
  },
];

export const FeaturesSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>TÍNH NĂNG</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Công cụ chuyên nghiệp</h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-lg">
          Mọi thứ bạn cần để tạo banner mạng xã hội đỉnh cao — từ thiết kế đến xuất file.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">
        {FEATURES.map(f => (
          <HoverCard
            key={f.title}
            className={`overflow-hidden bg-black/[0.01] dark:bg-white/[0.015] ${f.featured ? 'col-span-2' : 'col-span-1'}`}
          >
            {f.featured && f.thumbnail && (
              <div className="relative w-full h-24 overflow-hidden">
                <img src={f.thumbnail} alt={f.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}
            <div className="p-5">
              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
              >
                <f.icon size={22} className="text-brand-blue mb-3" />
              </motion.div>
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-[12px] text-slate-500 dark:text-[#666] leading-relaxed">{f.desc}</p>
            </div>
          </HoverCard>
        ))}
      </StaggerChildren>
    </div>
  </section>
);
