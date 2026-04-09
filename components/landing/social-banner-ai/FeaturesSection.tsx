import React from 'react';
import { motion } from 'framer-motion';
import {
  Maximize2, Palette, Sparkles, Type,
  Layers, Download, Smartphone, ShieldCheck,
} from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

const FEATURES = [
  {
    icon: Layers,
    title: '8+ Platform Formats',
    desc: 'X Cover, X Post, Facebook Cover, Facebook Post, Instagram Post, Instagram Story, LinkedIn Banner, TikTok — tất cả kích thước chuẩn, không cần nhớ số liệu.',
    featured: true,
  },
  {
    icon: Palette,
    title: 'Brand Colors AI',
    desc: 'Nhập mã HEX thương hiệu — AI tự áp palette vào toàn bộ banner, đảm bảo nhận diện nhất quán.',
    featured: true,
  },
  {
    icon: Sparkles,
    title: 'AI Copywriting',
    desc: 'AI tự sinh tiêu đề, tagline phù hợp với từng platform.',
    featured: false,
  },
  {
    icon: Type,
    title: 'Typography Smart',
    desc: 'Font chữ tự động scale đúng với từng kích thước banner.',
    featured: false,
  },
  {
    icon: Maximize2,
    title: 'High-res Export',
    desc: 'PNG / JPG độ phân giải chuẩn. Không vỡ ảnh khi đăng.',
    featured: false,
  },
  {
    icon: Download,
    title: 'One-click Download',
    desc: 'Tải xuống ngay, không watermark, ready to post.',
    featured: false,
  },
  {
    icon: Smartphone,
    title: 'Mobile Preview',
    desc: 'Xem trước giao diện trên mobile trước khi xuất file.',
    featured: false,
  },
  {
    icon: ShieldCheck,
    title: 'Commercial License',
    desc: 'Toàn quyền sử dụng thương mại, đăng quảng cáo không giới hạn.',
    featured: false,
  },
];

export const FeaturesSection: React.FC = () => (
  <section className="px-6 lg:px-12 py-20 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-12">
        <SectionLabel>TÍNH NĂNG</SectionLabel>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
          Mọi thứ bạn cần để{' '}
          <span className="text-brand-blue">tạo banner chuyên nghiệp</span>
        </h2>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">
        {FEATURES.map((f) => (
          <HoverCard
            key={f.title}
            className={`p-5 bg-black/[0.01] dark:bg-white/[0.015] ${f.featured ? 'col-span-2' : 'col-span-1'}`}
          >
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
            >
              <f.icon size={22} className="text-brand-blue mb-3" />
            </motion.div>
            <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
            <p className="text-[12px] text-slate-500 dark:text-[#666] leading-relaxed">{f.desc}</p>
          </HoverCard>
        ))}
      </StaggerChildren>
    </div>
  </section>
);
