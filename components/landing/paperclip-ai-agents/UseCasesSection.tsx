import React from 'react';
import { motion } from 'framer-motion';
import {
  Building, Code2, ShoppingBag, GraduationCap,
  HeartPulse, Megaphone, Banknote, Globe,
} from 'lucide-react';
import { FadeInUp, HoverCard, SectionLabel } from '../_shared/SectionAnimations';
import { PAPERCLIP_CDN } from '../../../src/constants/paperclip-cdn';

interface UseCase {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  img: string;
}

const USE_CASES: UseCase[] = [
  {
    icon: Building,
    title: 'Startup & Scale-up',
    desc: 'Chạy toàn bộ operations với team nhỏ. Marketing AI viết content, Sales AI outreach, DevOps AI deploy — bạn chỉ cần review kết quả.',
    color: '#0090ff',
    img: PAPERCLIP_CDN.usecaseStartup,
  },
  {
    icon: Code2,
    title: 'Software Agency',
    desc: 'CEO Agent nhận brief từ client, tự phân việc cho devs AI: Cursor viết code, GPT-4o review, claude-sonnet viết docs. Delivery nhanh 3x.',
    color: '#8b5cf6',
    img: PAPERCLIP_CDN.usecaseSoftwareAgency,
  },
  {
    icon: Megaphone,
    title: 'Marketing Agency',
    desc: 'Scale content cho nhiều client cùng lúc. Mỗi client có Marketing AI riêng với brand voice riêng, budget guard riêng, không bao giờ cross-pollinate.',
    color: '#f59e0b',
    img: PAPERCLIP_CDN.usecaseMarketingAgency,
  },
  {
    icon: ShoppingBag,
    title: 'E-commerce',
    desc: 'Sales AI quản lý product listings, Marketing AI chạy ads, DevOps AI monitor uptime. Toàn bộ autonomous — chủ shop chỉ approve big decisions.',
    color: '#10b981',
    img: PAPERCLIP_CDN.usecaseEcommerce,
  },
  {
    icon: GraduationCap,
    title: 'Edtech & Online Learning',
    desc: 'AI tạo curriculum, grading rubrics, marketing campaigns và support FAQs. Human teachers tập trung vào teaching, AI lo phần còn lại.',
    color: '#06b6d4',
    img: PAPERCLIP_CDN.usecaseEdtech,
  },
  {
    icon: HeartPulse,
    title: 'Healthcare Admin',
    desc: 'AI agents xử lý appointment scheduling, insurance pre-auth docs, patient FAQs — với governance layer đảm bảo compliance HIPAA.',
    color: '#ef4444',
    img: PAPERCLIP_CDN.usecaseHealthcare,
  },
  {
    icon: Banknote,
    title: 'FinTech & Finance',
    desc: 'AI agents phân tích risk, generate reports, draft compliance docs. Human-in-the-loop enforced cho mọi financial decisions quan trọng.',
    color: '#84cc16',
    img: PAPERCLIP_CDN.usecaseFintech,
  },
  {
    icon: Globe,
    title: 'Remote-first Company',
    desc: 'Org chart AI hoạt động 24/7 across timezones. Khi team ngủ, agents vẫn xử lý tasks, gửi reports, chuẩn bị briefings cho sáng hôm sau.',
    color: '#ec4899',
    img: PAPERCLIP_CDN.usecaseRemote,
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {USE_CASES.map((uc, i) => (
          <motion.div
            key={uc.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
          <HoverCard className="p-0 overflow-hidden bg-black/[0.01] dark:bg-white/[0.015] h-full">
            {/* Illustration */}
            <div className="relative overflow-hidden group" style={{ height: '112px' }}>
              <img
                src={uc.img}
                alt={uc.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                className="transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: `linear-gradient(to bottom, transparent 50%, ${uc.color})` }}
              />
            </div>
            <div className="p-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5"
                style={{ backgroundColor: `${uc.color}15` }}
              >
                <uc.icon size={16} style={{ color: uc.color }} />
              </motion.div>
              <h3 className="text-sm font-semibold mb-1">{uc.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-[#666] leading-relaxed">{uc.desc}</p>
            </div>
          </HoverCard>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
