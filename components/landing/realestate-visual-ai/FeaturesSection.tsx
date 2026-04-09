import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Video, Sparkles, Layers, Wand2, Download,
} from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

interface Feature {
  icon: React.ElementType;
  title: string;
  desc: string;
  featured: boolean;
  thumbnail?: string;
}

const FEATURES: Feature[] = [
  {
    icon: Building2,
    title: 'Render Kiến Trúc 4K',
    desc: 'Tạo ảnh kiến trúc photorealistic độ phân giải 4K — chuẩn chuyên nghiệp như studio design cao cấp',
    featured: true,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/6e175c4c-8442-419d-5fa1-2d1897131000/public',
  },
  {
    icon: Video,
    title: 'Tạo Video Tour AI',
    desc: 'Video walkthrough, drone aerial, cinematic tour 360° — không cần quay thực tế, AI tạo toàn bộ',
    featured: true,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/82d54ec9-2db4-44cf-db15-572d7667b900/public',
  },
  {
    icon: Sparkles,
    title: '60+ Phong Cách Thiết Kế',
    desc: 'Modern, luxury, minimalist, traditional, eco — đa dạng phong cách cho mọi dự án',
    featured: false,
  },
  {
    icon: Layers,
    title: 'Staging Nội Thất Ảo',
    desc: 'Biến căn phòng trống thành showroom ấn tượng chỉ trong 10 giây',
    featured: false,
  },
  {
    icon: Wand2,
    title: 'AI Prompt Thông Minh',
    desc: 'AI hiểu context BĐS, tự tối ưu prompt để tạo ra kết quả chuyên nghiệp nhất',
    featured: false,
  },
  {
    icon: Download,
    title: 'Xuất Đa Định Dạng',
    desc: 'PNG 4K, JPG, PDF, MP4 video — sẵn sàng cho website, brochure, social media',
    featured: false,
  },
];

export const FeaturesSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>TÍNH NĂNG</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Công cụ AI chuyên biệt cho BĐS</h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-lg">
          Mọi thứ bạn cần để tạo visual bất động sản đỉnh cao — từ render kiến trúc đến video tour.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">
        {FEATURES.map((f) => (
          <HoverCard
            key={f.title}
            className={`overflow-hidden bg-black/[0.01] dark:bg-white/[0.015] ${
              f.featured ? 'col-span-2' : 'col-span-1'
            }`}
          >
            {f.featured && f.thumbnail && (
              <div className="relative w-full h-36 overflow-hidden">
                <img
                  src={f.thumbnail}
                  alt={f.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}
            <div className="p-5">
              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
                className="inline-block"
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
