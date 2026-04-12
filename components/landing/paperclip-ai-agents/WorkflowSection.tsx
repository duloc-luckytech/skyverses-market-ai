import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Cpu, ShieldCheck, BarChart3 } from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

const STEPS = [
  {
    n: 1,
    icon: Building2,
    title: 'Định nghĩa Org Chart',
    desc: 'Tạo cấu trúc tổ chức AI của bạn: CEO Agent làm orchestrator, các department agents (Marketing, DevOps, Sales, HR) ở tier dưới. Chỉ cần kéo-thả trong dashboard.',
  },
  {
    n: 2,
    icon: Cpu,
    title: 'Gán LLM & Tool cho mỗi Agent',
    desc: 'Gán Claude cho tasks sáng tạo, GPT-4o cho phân tích, Cursor cho code generation. Mỗi agent có system prompt riêng, tool access riêng và budget cap riêng.',
  },
  {
    n: 3,
    icon: ShieldCheck,
    title: 'Thiết lập Budget Guard & Governance',
    desc: 'Đặt hard spend limit theo agent, department hoặc toàn org. Cấu hình human-in-the-loop checkpoints cho các decisions quan trọng. Mọi action đều có audit log.',
  },
  {
    n: 4,
    icon: BarChart3,
    title: 'Chạy & Monitor',
    desc: 'Giao task cho CEO Agent, quan sát toàn bộ org hoạt động autonomous. Xem real-time dashboard: agents nào đang chạy, spend bao nhiêu, output gì.',
  },
];

export const WorkflowSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>CÁCH HOẠT ĐỘNG</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Từ idea đến AI company trong 4 bước</h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-md">
          Setup toàn bộ AI workforce của bạn — không cần viết code, không cần infrastructure phức tạp.
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

      {/* Timeline connector — desktop only */}
      <div className="hidden md:flex items-center justify-between mt-6 px-8">
        {[1, 2, 3, 4].map((n, i) => (
          <React.Fragment key={n}>
            <div className="w-7 h-7 rounded-full bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center">
              <span className="text-[9px] font-bold text-brand-blue">{n}</span>
            </div>
            {i < 3 && (
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.3, duration: 0.5, ease: 'easeOut' }}
                className="flex-1 h-px bg-gradient-to-r from-brand-blue/30 to-brand-blue/10 origin-left"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);
