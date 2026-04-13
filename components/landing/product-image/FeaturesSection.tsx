import React from 'react';
import { motion } from 'framer-motion';
import {
  Layers, Cpu, Scissors, Palette, ArrowUp, PackageOpen, RefreshCw, BarChart2,
} from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

const FEATURES = [
  {
    icon: Layers,
    title: 'Platform Dimensions',
    desc: '11 tỷ lệ chuẩn — 1:1, 4:3, 16:9, 9:16, 3:2, 2:3, 21:9 và nhiều hơn. Không cần nhớ số pixel.',
    featured: true,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/661a19bd-c386-47af-6685-3d2dfa5d0600/public',
  },
  {
    icon: Cpu,
    title: 'Multi-model AI',
    desc: '22+ models, 10+ families — Imagen 4, FLUX, Stable Diffusion, Midjourney-style, anime và nhiều hơn. Chọn theo nhu cầu: tốc độ hoặc chất lượng.',
    featured: true,
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/90aa5ce2-d070-4a96-aafa-04b911c29b00/public',
  },
  {
    icon: Scissors,
    title: 'Background Magic',
    desc: 'Xóa nền chính xác bằng AI chỉ với 1 click. Phát hiện chủ thể thông minh, không bị viền.',
    featured: false,
    thumbnail: undefined,
  },
  {
    icon: Palette,
    title: 'Style Transfer',
    desc: 'Upload ảnh + prompt style — AI chuyển đổi sang anime, oil painting, watercolor, 3D render trong giây lát.',
    featured: false,
    thumbnail: undefined,
  },
  {
    icon: ArrowUp,
    title: 'AI Upscale 12K',
    desc: 'Nâng cấp từ 1K lên đến 12K. Sharpen edge, denoise, khôi phục chi tiết — tất cả tự động.',
    featured: false,
    thumbnail: undefined,
  },
  {
    icon: PackageOpen,
    title: 'Batch Processing',
    desc: 'Xử lý hàng loạt — tạo nhiều ảnh cùng lúc, xuất ZIP một phát. Tiết kiệm thời gian gấp 10 lần.',
    featured: false,
    thumbnail: undefined,
  },
  {
    icon: RefreshCw,
    title: 'Auto Refund',
    desc: 'Nếu AI trả lỗi, credits được hoàn tự động. Retry 1-click không mất thêm phí.',
    featured: false,
    thumbnail: undefined,
  },
  {
    icon: BarChart2,
    title: 'Production Log',
    desc: 'Theo dõi tất cả jobs realtime. Xem lịch sử, download lại bất kỳ lúc nào — không mất ảnh.',
    featured: false,
    thumbnail: undefined,
  },
];

export const FeaturesSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>TÍNH NĂNG</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Công cụ chuyên nghiệp</h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-lg">
          Mọi thứ bạn cần để tạo, chỉnh sửa và nâng cấp ảnh bằng AI — trong một nơi duy nhất.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">
        {FEATURES.map(f => (
          <HoverCard
            key={f.title}
            className={`overflow-hidden bg-black/[0.01] dark:bg-white/[0.015] ${f.featured ? 'col-span-2' : 'col-span-1'}`}
          >
            {f.thumbnail && (
              <div className={`relative w-full overflow-hidden ${f.featured ? 'h-28' : 'h-20'}`}>
                <img src={f.thumbnail} alt={f.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
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
