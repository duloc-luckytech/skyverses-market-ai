import React from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, FileText, Cpu, Download } from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

const STEPS = [
  {
    n: 1,
    icon: ToggleLeft,
    title: 'Chọn Mode',
    desc: 'Chọn Generate (tạo ảnh từ prompt), Edit & Enhance (chỉnh sửa ảnh upload), hoặc AI Upscale (nâng cấp độ phân giải). Mỗi mode có tùy chỉnh riêng.',
  },
  {
    n: 2,
    icon: FileText,
    title: 'Upload hoặc Nhập Prompt',
    desc: 'Kéo thả ảnh vào Studio hoặc nhập prompt mô tả chi tiết. AI hỗ trợ tiếng Việt và tiếng Anh — mô tả tự nhiên là đủ.',
  },
  {
    n: 3,
    icon: Cpu,
    title: 'Chọn AI Model',
    desc: 'Chọn model phù hợp: nhanh (Nano) hay chất lượng cao (Pro). Xem preview thời gian và chi phí trước khi chạy. 22+ models từ 10+ families.',
  },
  {
    n: 4,
    icon: Download,
    title: 'Xuất Chất Lượng Cao',
    desc: 'Tải ảnh PNG/JPG lên đến 8K. Batch download nhiều ảnh cùng lúc. Ảnh lưu trong Production Log — truy cập lại bất kỳ lúc nào.',
  },
];

export const WorkflowSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>CÁCH HOẠT ĐỘNG</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">4 bước — từ idea đến ảnh đẹp</h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-md">
          Không cần Photoshop, không cần kỹ năng design — chỉ cần mô tả điều bạn muốn.
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
