import React from 'react';
import { motion } from 'framer-motion';
import {
  Building, Users, LayoutGrid, PenTool, Home, Globe,
} from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

interface UseCase {
  icon: React.ElementType;
  title: string;
  desc: string;
  thumbnail?: string;
}

const USE_CASES: UseCase[] = [
  {
    icon: Building,
    title: 'Chủ Đầu Tư',
    desc: 'Render phối cảnh dự án trước khi xây dựng — thuyết phục nhà đầu tư và khách hàng với hình ảnh photorealistic',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/51f45fc6-fb8c-4058-7382-0dc52c83d900/public',
  },
  {
    icon: Users,
    title: 'Môi Giới BĐS',
    desc: 'Tạo ảnh staging ảo cho căn hộ trống, tăng tỷ lệ chốt deal với hình ảnh chuyên nghiệp',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2fbbca1f-9dd4-4b50-d1f4-72e300f2b300/public',
  },
  {
    icon: LayoutGrid,
    title: 'Agency Marketing',
    desc: 'Sản xuất hàng loạt ảnh và video marketing BĐS — scale nội dung x10 với AI batch generation',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/f0fb3737-347c-476a-5abb-d146a61f7d00/public',
  },
  {
    icon: PenTool,
    title: 'Kiến Trúc Sư',
    desc: 'Visualize concept design trước khi triển khai — khách hàng thấy được sản phẩm cuối ngay từ đầu',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/7b4eb989-534d-45f1-bffe-977e4947b300/public',
  },
  {
    icon: Home,
    title: 'Homebuyer',
    desc: 'Xem trước nội thất theo phong cách cá nhân — customize màu sắc, đồ nội thất theo sở thích',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/94cdb21e-b06d-4bae-460b-8064b00ecf00/public',
  },
  {
    icon: Globe,
    title: 'Developer Website',
    desc: 'Thumbnail dự án chuyên nghiệp cho landing page — tăng conversion rate với hình ảnh ấn tượng',
    thumbnail: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/8d74b460-7413-431d-59e8-042654722100/public',
  },
];

export const UseCasesSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>DÀNH CHO</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Phù hợp mọi lĩnh vực BĐS</h2>
        <p className="text-slate-500 dark:text-[#666] mt-2 text-sm max-w-lg">
          Từ chủ đầu tư lớn đến môi giới cá nhân — AI tạo visual chuyên nghiệp trong vài giây
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {USE_CASES.map((uc) => (
          <HoverCard key={uc.title} className="overflow-hidden bg-black/[0.01] dark:bg-white/[0.015]">
            {uc.thumbnail && (
              <div className="relative w-full h-28 overflow-hidden">
                <img
                  src={uc.thumbnail}
                  alt={uc.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
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
