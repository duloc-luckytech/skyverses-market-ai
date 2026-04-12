import React from 'react';
import { motion } from 'framer-motion';
import {
  Building, Code2, ShoppingBag, GraduationCap,
  HeartPulse, Megaphone, Banknote, Globe,
} from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

interface UseCase {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
}

const USE_CASES: UseCase[] = [
  {
    icon: Building,
    title: 'Startup & Scale-up',
    desc: 'Chạy toàn bộ operations với team nhỏ. Marketing AI viết content, Sales AI outreach, DevOps AI deploy — bạn chỉ cần review kết quả.',
    color: '#0090ff',
  },
  {
    icon: Code2,
    title: 'Software Agency',
    desc: 'CEO Agent nhận brief từ client, tự phân việc cho devs AI: Cursor viết code, GPT-4o review, claude-sonnet viết docs. Delivery nhanh 3x.',
    color: '#8b5cf6',
  },
  {
    icon: Megaphone,
    title: 'Marketing Agency',
    desc: 'Scale content cho nhiều client cùng lúc. Mỗi client có Marketing AI riêng với brand voice riêng, budget guard riêng, không bao giờ cross-pollinate.',
    color: '#f59e0b',
  },
  {
    icon: ShoppingBag,
    title: 'E-commerce',
    desc: 'Sales AI quản lý product listings, Marketing AI chạy ads, DevOps AI monitor uptime. Toàn bộ autonomous — chủ shop chỉ approve big decisions.',
    color: '#10b981',
  },
  {
    icon: GraduationCap,
    title: 'Edtech & Online Learning',
    desc: 'AI tạo curriculum, grading rubrics, marketing campaigns và support FAQs. Human teachers tập trung vào teaching, AI lo phần còn lại.',
    color: '#06b6d4',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare Admin',
    desc: 'AI agents xử lý appointment scheduling, insurance pre-auth docs, patient FAQs — với governance layer đảm bảo compliance HIPAA.',
    color: '#ef4444',
  },
  {
    icon: Banknote,
    title: 'FinTech & Finance',
    desc: 'AI agents phân tích risk, generate reports, draft compliance docs. Human-in-the-loop enforced cho mọi financial decisions quan trọng.',
    color: '#84cc16',
  },
  {
    icon: Globe,
    title: 'Remote-first Company',
    desc: 'Org chart AI hoạt động 24/7 across timezones. Khi team ngủ, agents vẫn xử lý tasks, gửi reports, chuẩn bị briefings cho sáng hôm sau.',
    color: '#ec4899',
  },
];

export const UseCasesSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>DÀNH CHO</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Phù hợp mọi loại tổ chức</h2>
        <p className="text-slate-500 dark:text-[#666] mt-2 text-sm max-w-lg">
          Từ startup 3 người đến enterprise 300 người — AI org orchestration scale theo bạn.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {USE_CASES.map(uc => (
          <HoverCard key={uc.title} className="p-5 bg-black/[0.01] dark:bg-white/[0.015]">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${uc.color}15` }}
            >
              <uc.icon size={18} style={{ color: uc.color }} />
            </motion.div>
            <h3 className="text-sm font-semibold mb-1">{uc.title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-[#666] leading-relaxed">{uc.desc}</p>
          </HoverCard>
        ))}
      </StaggerChildren>
    </div>
  </section>
);
