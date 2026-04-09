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
}

const USE_CASES: UseCase[] = [
  {
    icon: Building,
    title: 'Chủ Đầu Tư',
    desc: 'Render phối cảnh dự án trước khi xây dựng — thuyết phục nhà đầu tư và khách hàng với hình ảnh photorealistic',
  },
  {
    icon: Users,
    title: 'Môi Giới BĐS',
    desc: 'Tạo ảnh staging ảo cho căn hộ trống, tăng tỷ lệ chốt deal với hình ảnh chuyên nghiệp',
  },
  {
    icon: LayoutGrid,
    title: 'Agency Marketing',
    desc: 'Sản xuất hàng loạt ảnh và video marketing BĐS — scale nội dung x10 với AI batch generation',
  },
  {
    icon: PenTool,
    title: 'Kiến Trúc Sư',
    desc: 'Visualize concept design trước khi triển khai — khách hàng thấy được sản phẩm cuối ngay từ đầu',
  },
  {
    icon: Home,
    title: 'Homebuyer',
    desc: 'Xem trước nội thất theo phong cách cá nhân — customize màu sắc, đồ nội thất theo sở thích',
  },
  {
    icon: Globe,
    title: 'Developer Website',
    desc: 'Thumbnail dự án chuyên nghiệp cho landing page — tăng conversion rate với hình ảnh ấn tượng',
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
          <HoverCard key={uc.title} className="p-5 bg-black/[0.01] dark:bg-white/[0.015]">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-3"
            >
              <uc.icon size={18} />
            </motion.div>
            <h3 className="text-sm font-semibold mb-1">{uc.title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-[#666] leading-relaxed">{uc.desc}</p>
          </HoverCard>
        ))}
      </StaggerChildren>
    </div>
  </section>
);
