
import React from 'react';
import { FileText, Sparkles, Image, Edit3 } from 'lucide-react';
import {
  FadeInUp, StaggerChildren, SectionLabel,
  HoverCard, TimelineConnector,
} from '../_shared/SectionAnimations';

const STEPS = [
  {
    n: 1,
    icon: FileText,
    title: 'Nhập chủ đề',
    desc: 'Mô tả chủ đề, chọn phong cách (Corporate, Creative, Minimal...), số slide và ngôn ngữ xuất ra.',
  },
  {
    n: 2,
    icon: Sparkles,
    title: 'AI sinh nội dung',
    desc: 'AI tự viết outline đầy đủ: tiêu đề + bullet points cho từng slide — nhất quán với toàn bộ deck.',
  },
  {
    n: 3,
    icon: Image,
    title: 'Gen ảnh nền AI',
    desc: 'Mỗi slide nhận 1 ảnh background AI riêng biệt, đúng tone + style bạn chọn. Slide hiện ra ngay khi xong.',
  },
  {
    n: 4,
    icon: Edit3,
    title: 'Chỉnh & Xuất file',
    desc: 'Live editor: click trực tiếp vào text/layout để sửa. AI gợi ý nội dung thay thế. Xuất PPTX / PDF / PNG.',
  },
];

// ─── Step number badge ───────────────────────────────────────────────────────
const StepNumberBadge: React.FC<{ n: number }> = ({ n }) => (
  <div className="w-7 h-7 rounded-full bg-brand-blue text-white text-[11px] font-black flex items-center justify-center shadow-md shadow-brand-blue/30 shrink-0">
    {n}
  </div>
);

export const WorkflowSection: React.FC = () => (
  <section className="py-20 px-6 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="text-center mb-14">
        <SectionLabel>CÁCH HOẠT ĐỘNG</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
          4 bước — từ ý tưởng đến slide hoàn chỉnh
        </h2>
        <p className="text-base text-slate-500 dark:text-white/40 max-w-xl mx-auto">
          Không cần kỹ năng thiết kế. Không cần chờ đợi. Slide đẹp trong dưới 2 phút.
        </p>
      </FadeInUp>

      <div className="relative">
        {/* Timeline connector line — desktop only */}
        <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px">
          <TimelineConnector />
        </div>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-5" staggerDelay={0.1}>
          {STEPS.map(step => {
            const Icon = step.icon;
            return (
              <HoverCard key={step.n} className="p-5 bg-white dark:bg-[#111] relative">
                <div className="flex flex-col items-start">
                  {/* Step number + icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <StepNumberBadge n={step.n} />
                    <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                      <Icon size={17} />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-brand-blue mb-1.5 uppercase tracking-wider">BƯỚC {step.n}</p>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-[12px] text-slate-500 dark:text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </HoverCard>
            );
          })}
        </StaggerChildren>
      </div>
    </div>
  </section>
);
