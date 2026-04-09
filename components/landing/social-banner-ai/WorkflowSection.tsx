import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Layers, Wand2, Share2 } from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

const STEPS = [
  {
    icon: PenTool,
    n: 1,
    title: 'Chọn nền tảng & kích thước',
    desc: 'Chọn mạng xã hội: X, Facebook, Instagram, LinkedIn, TikTok… Hệ thống tự load đúng tỷ lệ & kích thước chuẩn của từng platform.',
  },
  {
    icon: Wand2,
    n: 2,
    title: 'Mô tả ý tưởng banner',
    desc: 'Nhập prompt bằng tiếng Việt hoặc tiếng Anh. AI Boost tự động làm giàu nội dung, thêm màu thương hiệu, style và thông điệp marketing.',
  },
  {
    icon: Layers,
    n: 3,
    title: 'Tinh chỉnh style & màu sắc',
    desc: 'Chọn style (Hiện đại, Luxury, Minimalist…), thêm màu brand, tiêu đề chính/phụ. AI sẽ tích hợp tất cả vào banner một cách hài hòa.',
  },
  {
    icon: Share2,
    n: 4,
    title: 'Tải về & đăng ngay',
    desc: 'Banner xuất PNG/JPG độ phân giải cao, đúng tỷ lệ từng platform. Đăng trực tiếp lên mạng xã hội — không cần chỉnh sửa thêm.',
  },
];

export const WorkflowSection: React.FC = () => (
  <section className="px-6 lg:px-12 py-20 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-12">
        <SectionLabel>CÁCH HOẠT ĐỘNG</SectionLabel>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
          4 bước tạo banner <span className="text-brand-blue">chuẩn platform</span>
        </h2>
        <p className="mt-3 text-sm text-slate-500 dark:text-[#666] max-w-md">
          Từ ý tưởng đến banner publish-ready trong dưới 60 giây.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STEPS.map((step) => (
          <HoverCard key={step.n} className="p-5 bg-black/[0.01] dark:bg-white/[0.015]">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue mb-3 flex items-center justify-center"
            >
              <step.icon size={20} />
            </motion.div>
            <p className="text-[10px] font-bold text-brand-blue mb-1 uppercase tracking-wider">BƯỚC {step.n}</p>
            <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-[#666] leading-relaxed">{step.desc}</p>
          </HoverCard>
        ))}
      </StaggerChildren>
    </div>
  </section>
);
