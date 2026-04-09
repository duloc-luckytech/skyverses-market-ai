import React from 'react';
import { motion } from 'framer-motion';
import {
  Store, Building, Shirt, GraduationCap, Heart,
  Coffee, Plane, MessageCircle,
} from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

interface UseCase {
  icon: React.ElementType;
  title: string;
  desc: string;
}

const USE_CASES: UseCase[] = [
  {
    icon: Store,
    title: 'Cửa hàng online',
    desc: 'Tạo banner sale, flash deal, new arrival trong 30s. Không cần thuê designer cho mỗi chiến dịch.',
  },
  {
    icon: Building,
    title: 'Agency Marketing',
    desc: 'Scale content cho nhiều khách hàng cùng lúc. Batch export đúng kích thước từng nền tảng tự động.',
  },
  {
    icon: Coffee,
    title: 'Nhà hàng & F&B',
    desc: 'Quảng bá menu, khuyến mãi đặc biệt, sự kiện. Banner đẹp thu hút khách ngay trên Facebook & X.',
  },
  {
    icon: Shirt,
    title: 'Thương hiệu thời trang',
    desc: 'Ra mắt BST mới, campaign theo mùa với banner nhất quán màu thương hiệu và phong cách premium.',
  },
  {
    icon: GraduationCap,
    title: 'Giáo dục & Khoá học',
    desc: 'Quảng cáo tuyển sinh, webinar, sự kiện học thuật với banner chuyên nghiệp tạo nhanh.',
  },
  {
    icon: MessageCircle,
    title: 'KOL & Content Creator',
    desc: 'Tạo cover profile, banner thông báo bài đăng mới, merch launch — đồng bộ visual nhận diện.',
  },
];

export const UseCasesSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>DÀNH CHO</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Phù hợp mọi lĩnh vực</h2>
        <p className="text-slate-500 dark:text-[#666] mt-2 text-sm max-w-lg">
          Từ cửa hàng nhỏ đến agency lớn — AI giúp bạn tạo banner chuyên nghiệp trong vài giây.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {USE_CASES.map(uc => (
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
