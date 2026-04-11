
import React from 'react';
import {
  Briefcase, GraduationCap, TrendingUp,
  Megaphone, Heart, ShoppingBag,
} from 'lucide-react';
import {
  FadeInUp, StaggerChildren, SectionLabel, HoverCard,
} from '../_shared/SectionAnimations';

interface UseCase {
  icon: React.ElementType;
  title: string;
  desc: string;
  tag: string;
  color: string;
  bg: string;
  dot: string;
  useCases: string[];
}

const USE_CASES: UseCase[] = [
  {
    icon: Briefcase,
    title: 'Business Pitch',
    desc: 'Tạo investor deck chuyên nghiệp trong 2 phút. AI viết story, gen background cinematic.',
    tag: 'Business',
    color: 'text-brand-blue',
    bg: 'bg-brand-blue/10',
    dot: 'bg-brand-blue/60',
    useCases: ['Investor Pitch Deck', 'Board Presentation', 'Partnership Proposal'],
  },
  {
    icon: GraduationCap,
    title: 'Giáo dục',
    desc: 'Bài giảng, slide học thuật đẹp mắt với cấu trúc nội dung rõ ràng.',
    tag: 'Education',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    dot: 'bg-violet-500/60',
    useCases: ['Bài giảng đại học', 'Seminar & Workshop', 'Luận văn tốt nghiệp'],
  },
  {
    icon: TrendingUp,
    title: 'Business Report',
    desc: 'Báo cáo kinh doanh, KPI quarterly với AI outline nhất quán.',
    tag: 'Corporate',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    dot: 'bg-emerald-500/60',
    useCases: ['Báo cáo doanh thu Q4', 'OKR Review Deck', 'Team Performance Brief'],
  },
  {
    icon: Megaphone,
    title: 'Marketing Campaign',
    desc: 'Campaign deck vibrant, CTA mạnh, phù hợp pitch cho client.',
    tag: 'Marketing',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    dot: 'bg-amber-500/60',
    useCases: ['Client Campaign Deck', 'Brand Strategy Slides', 'Campaign Post-mortem'],
  },
  {
    icon: Heart,
    title: 'Healthcare',
    desc: 'Medical briefing, conference slide chuẩn chỉnh, phong cách minimal sạch.',
    tag: 'Healthcare',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    dot: 'bg-rose-500/60',
    useCases: ['Medical Conference', 'Patient Education', 'Clinical Research Brief'],
  },
  {
    icon: ShoppingBag,
    title: 'Product Launch',
    desc: 'Launch deck showcase sản phẩm mới với visual AI ấn tượng.',
    tag: 'E-commerce',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    dot: 'bg-cyan-500/60',
    useCases: ['New Product Launch', 'Retailer Pitch', 'E-commerce Campaign'],
  },
];

export const UseCasesSection: React.FC = () => (
  <section className="py-20 px-6 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="text-center mb-14">
        <SectionLabel>ỨNG DỤNG THỰC TẾ</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
          Phù hợp với mọi ngành nghề
        </h2>
        <p className="text-base text-slate-500 dark:text-white/40 max-w-lg mx-auto">
          Từ startup đến giáo dục, từ marketing đến y tế — AI Slide Creator đều xử lý được.
        </p>
      </FadeInUp>

      <StaggerChildren
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        staggerDelay={0.07}
      >
        {USE_CASES.map(uc => {
          const Icon = uc.icon;
          return (
            <HoverCard key={uc.title} className="p-5 bg-white dark:bg-[#111]">
              {/* Icon + tag */}
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${uc.bg} ${uc.color} flex items-center justify-center shrink-0`}>
                  <Icon size={18} />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${uc.bg} ${uc.color} border border-current/20`}>
                  {uc.tag}
                </span>
              </div>

              {/* Title + desc */}
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1.5">{uc.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-white/40 leading-relaxed mb-4">{uc.desc}</p>

              {/* Use case list */}
              <div className="space-y-1.5 pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
                {uc.useCases.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${uc.dot}`} />
                    <p className="text-[11px] text-slate-600 dark:text-white/50 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </HoverCard>
          );
        })}
      </StaggerChildren>
    </div>
  </section>
);
