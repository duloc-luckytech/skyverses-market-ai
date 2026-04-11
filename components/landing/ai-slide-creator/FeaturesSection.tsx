
import React from 'react';
import {
  Sparkles, Edit3, Bot, LayoutGrid, Download, Image,
} from 'lucide-react';
import {
  FadeInUp, StaggerChildren, SectionLabel, HoverCard,
} from '../_shared/SectionAnimations';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI sinh nội dung thông minh',
    desc: 'Nhập chủ đề → AI viết outline + nội dung từng slide ngay lập tức, nhất quán style và ngôn ngữ toàn bộ deck.',
    featured: true,
  },
  {
    icon: Image,
    title: 'Ảnh nền AI riêng mỗi slide',
    desc: 'Mỗi slide được gen 1 ảnh background độc đáo, đúng tone topic và phong cách bạn chọn. Hoàn toàn tự động.',
    featured: true,
  },
  {
    icon: Edit3,
    title: 'Live editor trực tiếp',
    desc: 'Click vào text bất kỳ để chỉnh ngay trên canvas. Không cần mở tool khác.',
    featured: false,
  },
  {
    icon: Bot,
    title: 'AI Suggest per slide',
    desc: '3 gợi ý nội dung thay thế cho mỗi slide. 1 click để áp dụng ngay.',
    featured: false,
  },
  {
    icon: LayoutGrid,
    title: '5 Layout templates',
    desc: 'title-center, title-left, two-col, full-bg, image-right. Đổi layout 1 click.',
    featured: false,
  },
  {
    icon: Download,
    title: 'Export đa định dạng',
    desc: 'Xuất PPTX (PowerPoint), PDF, hoặc PNG từng slide. Dùng được ngay.',
    featured: false,
  },
];

export const FeaturesSection: React.FC = () => (
  <section className="py-20 px-6 bg-black/[0.01] dark:bg-white/[0.01]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="text-center mb-14">
        <SectionLabel>TÍNH NĂNG</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
          Tất cả trong một workspace
        </h2>
        <p className="text-base text-slate-500 dark:text-white/40 max-w-lg mx-auto">
          Từ AI tạo nội dung, gen ảnh nền, live edit, đến export — không cần rời khỏi trang.
        </p>
      </FadeInUp>

      <StaggerChildren
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        staggerDelay={0.07}
      >
        {FEATURES.map(f => {
          const Icon = f.icon;
          return (
            <HoverCard
              key={f.title}
              className={`p-5 bg-white dark:bg-[#111] ${f.featured ? 'md:col-span-1 ring-1 ring-brand-blue/20' : ''}`}
            >
              {/* Featured badge */}
              {f.featured && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/[0.08] text-brand-blue text-[8px] font-bold mb-3 border border-brand-blue/20">
                  <Sparkles size={7} />
                  Nổi bật
                </div>
              )}
              <div className={`w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-3`}>
                <Icon size={17} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">{f.title}</h3>
              <p className="text-[12px] text-slate-500 dark:text-white/40 leading-relaxed">{f.desc}</p>
            </HoverCard>
          );
        })}
      </StaggerChildren>
    </div>
  </section>
);
