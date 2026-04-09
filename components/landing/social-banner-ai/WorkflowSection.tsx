import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquarePlus, SlidersHorizontal, Sparkles, Download } from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

const STEPS = [
  {
    n: 1,
    icon: MessageSquarePlus,
    title: 'Mô tả Banner',
    desc: 'Nhập nội dung bạn muốn quảng bá bằng ngôn ngữ tự nhiên. AI hiểu ngữ cảnh và tự động đề xuất copy, CTA và layout phù hợp.',
  },
  {
    n: 2,
    icon: SlidersHorizontal,
    title: 'Chọn Platform & Format',
    desc: 'Chọn nền tảng (Facebook / X) và loại banner (Cover, Post, Story). Kích thước chuẩn được áp dụng tự động — không cần nhớ số.',
  },
  {
    n: 3,
    icon: Sparkles,
    title: 'AI Tạo Banner',
    desc: 'AI sinh banner với màu thương hiệu, font, và bố cục tối ưu cho từng nền tảng. Xem trước kết quả realtime ngay trong Studio.',
  },
  {
    n: 4,
    icon: Download,
    title: 'Xuất & Đăng',
    desc: 'Tải xuống PNG / JPG 4K chất lượng cao. Hỗ trợ xuất hàng loạt tất cả formats cùng lúc — sẵn sàng đăng lên mạng xã hội ngay.',
  },
];

export const WorkflowSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>CÁCH HOẠT ĐỘNG</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">4 bước tạo banner trong 30 giây</h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-md">
          Từ ý tưởng đến banner đăng được — không cần Photoshop, không cần designer.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STEPS.map(step => (
          <HoverCard key={step.n} className="p-5">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue mb-3 flex items-center justify-center"
            >
              <step.icon size={20} />
            </motion.div>
            <p className="text-[10px] font-bold text-brand-blue mb-1">BƯỚC {step.n}</p>
            <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-[#666] leading-relaxed">{step.desc}</p>
          </HoverCard>
        ))}
      </StaggerChildren>
    </div>
  </section>
);
