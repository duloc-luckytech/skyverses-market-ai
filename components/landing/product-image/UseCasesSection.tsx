import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Monitor, Feather, Building2, Shirt, Gamepad2 } from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

interface UseCase {
  icon: React.ElementType;
  title: string;
  desc: string;
  thumbnail?: string;
}

const USE_CASES: UseCase[] = [
  {
    icon: ShoppingBag,
    title: 'E-commerce',
    desc: 'Ảnh sản phẩm chất lượng cao, xóa nền tự động, background thay thế — scale hàng trăm SKU không cần studio chụp.',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/63c5fc2f-3663-4fa0-f24b-01a6a4a04100/public',
  },
  {
    icon: Monitor,
    title: 'Social Media',
    desc: 'Tạo content ảnh cho mạng xã hội đa kênh — thumbnail YouTube, Instagram post, TikTok cover trong 30 giây.',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/d07830a6-7e75-4d42-1d71-eb34b907bc00/public',
  },
  {
    icon: Feather,
    title: 'Creative Design',
    desc: 'Concept art, illustration, digital painting — AI tạo artwork chất lượng studio theo phong cách bất kỳ bạn mô tả.',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/24dfa080-1398-4ca1-88c8-df13b6b55300/public',
  },
  {
    icon: Building2,
    title: 'Bất động sản',
    desc: 'Ảnh nội thất, kiến trúc, CGI dự án bất động sản — render chất lượng cao không cần thuê nhiếp ảnh gia.',
    thumbnail: undefined,
  },
  {
    icon: Shirt,
    title: 'Thời trang',
    desc: 'Lookbook, catalog AI — đặt sản phẩm trên người mẫu ảo, background thay đổi theo mùa. Không cần buổi chụp.',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/1e6fc974-6f22-4cce-e759-d9da577af800/public',
  },
  {
    icon: Gamepad2,
    title: 'Game & NFT',
    desc: 'Character art, weapon design, environment concept, NFT collection — từ pixel art đến cinematic fantasy theo yêu cầu.',
    thumbnail: undefined,
  },
];

export const UseCasesSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>DÀNH CHO</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Phù hợp mọi ngành</h2>
        <p className="text-slate-500 dark:text-[#666] mt-2 text-sm max-w-lg">
          Từ e-commerce đến game studio — AI Image Studio giúp bạn tạo ảnh chuyên nghiệp trong vài giây.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {USE_CASES.map(uc => (
          <HoverCard key={uc.title} className="overflow-hidden bg-black/[0.01] dark:bg-white/[0.015]">
            {uc.thumbnail && (
              <div className="relative w-full h-24 overflow-hidden">
                <img src={uc.thumbnail} alt={uc.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}
            <div className="p-5">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-3"
              >
                <uc.icon size={18} />
              </motion.div>
              <h3 className="text-sm font-semibold mb-1">{uc.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-[#666] leading-relaxed">{uc.desc}</p>
            </div>
          </HoverCard>
        ))}
      </StaggerChildren>
    </div>
  </section>
);
