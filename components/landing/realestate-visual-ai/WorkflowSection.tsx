import React from 'react';
import { motion } from 'framer-motion';
import { Building, Wand2, Cpu, Download } from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel, TimelineConnector } from '../_shared/SectionAnimations';

const CDN_RESULT_THUMB = 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/080ab1ce-da26-4afa-ff67-a48d025fb800/public';

const STEPS = [
  {
    n: 1,
    icon: Building,
    title: 'Chọn Loại BĐS',
    desc: 'Căn hộ, biệt thự, văn phòng, shophouse — chọn đúng loại để AI hiểu context và tối ưu phong cách render.',
  },
  {
    n: 2,
    icon: Wand2,
    title: 'Mô tả Phong Cách',
    desc: 'Nhập prompt hoặc dùng AI gợi ý — phong cách modern, luxury, traditional, scandinavian và hơn 60 style khác.',
  },
  {
    n: 3,
    icon: Cpu,
    title: 'AI Render Chuyên Nghiệp',
    desc: 'Mô hình AI xử lý trong 10-30 giây, tạo ra ảnh/video chuẩn studio với ánh sáng tự nhiên và chi tiết sắc nét.',
  },
  {
    n: 4,
    icon: Download,
    title: 'Tải Về & Dùng Ngay',
    desc: 'Export PNG 4K, JPG, hoặc video MP4 — sẵn sàng đăng marketing, gửi khách hàng, hoặc in bảng quảng cáo.',
  },
];

export const WorkflowSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>CÁCH HOẠT ĐỘNG</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">4 bước render BĐS chuyên nghiệp</h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-md">
          Từ ý tưởng đến ảnh render 4K — không cần phần mềm đồ họa, không cần kỹ năng thiết kế.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.n}>
            <HoverCard className="p-5">
              {step.n === STEPS.length && (
                <div className="w-full h-20 rounded-lg overflow-hidden mb-3 border border-black/[0.06] dark:border-white/[0.04]">
                  <img
                    src={CDN_RESULT_THUMB}
                    alt="Kết quả AI"
                    className="w-full h-full object-cover opacity-75"
                    loading="lazy"
                  />
                </div>
              )}
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue mb-3 flex items-center justify-center"
              >
                <step.icon size={20} />
              </motion.div>
              <p className="text-[10px] font-bold text-brand-blue mb-1">BƯỚC {step.n}</p>
              <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-[#666] leading-relaxed">{step.desc}</p>
            </HoverCard>

            {/* Connector between cards (desktop only) */}
            {idx < STEPS.length - 1 && (
              <div className="hidden md:flex items-center -mx-2 col-span-0" style={{ display: 'none' }} />
            )}
          </React.Fragment>
        ))}
      </StaggerChildren>

      {/* Horizontal timeline connector (desktop) */}
      <div className="hidden md:block mt-2 px-[calc(12.5%+20px)]">
        <TimelineConnector vertical={false} className="opacity-60" />
      </div>
    </div>
  </section>
);
