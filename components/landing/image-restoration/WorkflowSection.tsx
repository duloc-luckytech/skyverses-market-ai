import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Scan, Maximize2, Download } from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel, TimelineConnector } from '../_shared/SectionAnimations';

const STEPS = [
  {
    n: 1,
    icon: Upload,
    title: 'Tải ảnh cũ lên',
    desc: 'Upload ảnh bị mờ, xước, đen trắng hoặc độ phân giải thấp từ máy tính hoặc thư viện Cloud.',
    thumb: null,
  },
  {
    n: 2,
    icon: Scan,
    title: 'AI Phân Tích',
    desc: 'Neural Core nhận diện điểm lỗi, nhiễu hạt, chi tiết khuôn mặt và các vùng cần phục hồi.',
    thumb: null,
  },
  {
    n: 3,
    icon: Maximize2,
    title: 'Tái Tạo 4K',
    desc: 'Hệ thống tổng hợp lại pixel, khử nhiễu và nâng cấp độ phân giải lên 4K / 8K sắc nét.',
    thumb: null,
  },
  {
    n: 4,
    icon: Download,
    title: 'Tải Về Ngay',
    desc: 'Export PNG 4K hoặc JPG — sẵn sàng in ấn, đóng khung, chia sẻ hoặc lưu trữ lâu dài.',
    thumb: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=400',
  },
];

export const WorkflowSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>CÁCH HOẠT ĐỘNG</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">4 bước phục chế ảnh chuyên nghiệp</h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-md">
          Từ ảnh hỏng đến ký ức 4K — không cần kỹ năng kỹ thuật, AI làm tất cả.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.n}>
            <HoverCard className="p-5">
              {step.thumb && (
                <div className="w-full h-20 rounded-lg overflow-hidden mb-3 border border-black/[0.06] dark:border-white/[0.04]">
                  <img
                    src={step.thumb}
                    alt="Kết quả phục chế"
                    className="w-full h-full object-cover opacity-75"
                    loading="lazy"
                  />
                </div>
              )}
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 mb-3 flex items-center justify-center"
              >
                <step.icon size={20} />
              </motion.div>
              <p className="text-[10px] font-bold text-emerald-500 mb-1">BƯỚC {step.n}</p>
              <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-[#666] leading-relaxed">{step.desc}</p>
            </HoverCard>
          </React.Fragment>
        ))}
      </StaggerChildren>

      {/* Timeline connector */}
      <div className="hidden md:block mt-2 px-[calc(12.5%+20px)]">
        <TimelineConnector vertical={false} className="opacity-40" />
      </div>
    </div>
  </section>
);
