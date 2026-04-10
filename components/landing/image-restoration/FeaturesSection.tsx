import React from 'react';
import { motion } from 'framer-motion';
import {
  User, Eraser, Palette, Activity, Maximize2,
  Zap, ShieldCheck, Clock,
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
    icon: User,
    title: 'Face Enhancement AI',
    desc: 'Khôi phục chân dung với độ chính xác tuyệt đối — giữ nguyên đặc điểm nhận dạng, xóa mờ, tái tạo chi tiết.',
    featured: true,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/f8370ab1-1b97-42bb-f6d7-912baf993d00/public',
  },
  {
    icon: Palette,
    title: 'Color Synthesis AI',
    desc: 'AI thông minh tô màu ảnh đen trắng một cách tự nhiên — màu da, trời, cây cỏ chân thực như ảnh gốc.',
    featured: true,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/09280e89-4837-4944-8634-921cfae12b00/public',
  },
  {
    icon: Eraser,
    title: 'Scratch Removal',
    desc: 'Tự động xóa vết xước, nếp gấp, vết ố bẩn của thời gian — mà không ảnh hưởng chi tiết xung quanh.',
    featured: false,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/300ab37d-687e-4c65-4dd5-a362a2267300/public',
  },
  {
    icon: Activity,
    title: 'Noise Reduction',
    desc: 'Loại bỏ nhiễu hạt (grain) và lỗi nén kỹ thuật số — ảnh sạch, rõ, chi tiết sắc bén.',
    featured: false,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/89ea6cb1-912c-4c5c-2fc2-e463f2557100/public',
  },
  {
    icon: Maximize2,
    title: '8K Upscaling',
    desc: 'Nâng cấp kích thước ảnh lên 8× mà không bị vỡ hình — pixel được AI tái tạo từ dữ liệu gốc.',
    featured: false,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/068b8e1e-9672-41d7-4d95-eca54dfe1f00/public',
  },
  {
    icon: Zap,
    title: 'Tốc Độ H100 GPU',
    desc: 'Xử lý phục chế trong dưới 5 giây nhờ cụm H100 GPU — batch nhiều ảnh cùng lúc.',
    featured: false,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/6366c625-eb62-477d-5de5-4d9ecec8db00/public',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy Vault',
    desc: 'Ảnh cá nhân được mã hóa đầu-cuối trong VPC riêng — tự động xóa sau 24 giờ.',
    featured: false,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/1a82f750-62b9-45ae-ac83-83ec9bd5b600/public',
  },
  {
    icon: Clock,
    title: 'History Sync',
    desc: 'Lưu trữ lịch sử phục chế đồng bộ trên mọi thiết bị trong Cloud Registry.',
    featured: false,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/45d58fd4-2fe5-4766-08e4-20c583eef200/public',
  },
];

export const FeaturesSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>TÍNH NĂNG</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Công nghệ phục chế toàn diện</h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-lg">
          Từ chân dung đến phong cảnh — mọi loại ảnh đều được phục chế với chất lượng studio.
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
            {f.thumbnail && (
              <div className={`relative w-full overflow-hidden ${f.featured ? 'h-36' : 'h-24'}`}>
                <img
                  src={f.thumbnail}
                  alt={f.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
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
                <f.icon size={22} className="text-emerald-500 mb-3" />
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
