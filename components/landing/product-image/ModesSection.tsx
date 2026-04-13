import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, ImagePlus, Sparkles } from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

const MODES = [
  {
    icon: ImagePlus,
    title: 'Generate',
    badge: 'Text → Image',
    desc: 'Biến prompt thành ảnh đẹp — chọn trong 22+ AI models từ Midjourney, Imagen 4, Stable Diffusion đến FLUX và nhiều hơn nữa.',
    highlights: ['22+ AI Models', 'Tất cả tỷ lệ', 'Style tùy chọn'],
    color: '#0090ff',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/dbd0c88d-b47e-47d0-0309-d0fa43d7ee00/public',
  },
  {
    icon: Wand2,
    title: 'Edit & Enhance',
    badge: 'Upload → Chỉnh sửa',
    desc: 'Upload ảnh + mô tả chỉnh sửa bằng ngôn ngữ tự nhiên — xóa nền, thay phong cách, inpainting, style transfer chỉ trong giây lát.',
    highlights: ['Xóa nền AI', 'Style Transfer', 'Inpainting'],
    color: '#8b5cf6',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/a88c0836-3564-4c90-2b9e-83b5399f9800/public',
  },
  {
    icon: Sparkles,
    title: 'AI Upscale',
    badge: '1K → 12K',
    desc: 'Nâng cấp độ phân giải lên đến 12K với AI. Sharpen, denoise, và khôi phục chi tiết bị mờ — tất cả tự động bằng một cú click.',
    highlights: ['Lên đến 12K', 'Auto Denoise', 'Chi tiết sắc nét'],
    color: '#10b981',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/d9b5a823-eed3-4112-7e73-a6bb3cd72600/public',
  },
];

export const ModesSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>3 CHẾ ĐỘ</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Một studio — mọi tác vụ</h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-lg">
          Generate từ đầu, chỉnh sửa ảnh có sẵn, hay nâng cấp chất lượng — tất cả trong một nơi.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {MODES.map(mode => (
          <HoverCard
            key={mode.title}
            className="overflow-hidden bg-black/[0.01] dark:bg-white/[0.015]"
          >
            {/* Thumbnail */}
            <div className="relative w-full h-36 overflow-hidden">
              <img
                src={mode.thumbnail}
                alt={mode.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              {/* Badge overlay */}
              <div
                className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold text-white"
                style={{ backgroundColor: `${mode.color}cc` }}
              >
                {mode.badge}
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <motion.div
                  whileHover={{ rotate: [-5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${mode.color}18`, color: mode.color }}
                >
                  <mode.icon size={18} />
                </motion.div>
                <h3 className="text-base font-bold">{mode.title}</h3>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-[#666] leading-relaxed mb-4">
                {mode.desc}
              </p>
              {/* Highlights */}
              <div className="flex flex-wrap gap-1.5">
                {mode.highlights.map(h => (
                  <span
                    key={h}
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${mode.color}15`,
                      color: mode.color,
                      border: `1px solid ${mode.color}30`,
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </HoverCard>
        ))}
      </StaggerChildren>
    </div>
  </section>
);
