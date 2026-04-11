
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';

const FAQS = [
  {
    q: 'AI tạo ảnh nền cho từng slide như thế nào?',
    a: 'Mỗi slide được gen 1 ảnh background riêng bằng Skyverses Image Gen API. AI nhận context từ tiêu đề slide + phong cách bạn chọn để tạo ảnh phù hợp tone và nội dung. Hoàn toàn tự động — slide hiện ra ngay khi xong, không cần đợi toàn bộ deck.',
  },
  {
    q: 'Có thể edit thủ công sau khi AI gen không?',
    a: 'Có. Workspace có live editor — click trực tiếp vào title hoặc body text để chỉnh ngay trên canvas. Ngoài ra, nút "AI Gợi ý" sẽ cho 3 phiên bản nội dung thay thế cho mỗi slide. 1 click để áp dụng ngay.',
  },
  {
    q: 'Export PPTX có tương thích với PowerPoint?',
    a: 'Có. File PPTX xuất ra tương thích hoàn toàn với Microsoft PowerPoint và Google Slides. Ngoài PPTX, bạn còn xuất được PDF (in ấn chất lượng cao) và PNG từng slide (nén thành file .zip). Tất cả đều dùng được ngay.',
  },
  {
    q: 'Tốn bao nhiêu credits để tạo 1 deck?',
    a: 'Tạo nội dung slide bằng Claude AI tốn khoảng 20–50 CR tùy số lượng slide. Mỗi ảnh nền AI tốn thêm ~40–80 CR (tùy model). Ví dụ: deck 8 slide hoàn chỉnh với ảnh AI ~ 400–700 CR. Người dùng mới nhận 100 CR miễn phí khi đăng ký.',
  },
  {
    q: 'Có hỗ trợ thêm ảnh thương hiệu không?',
    a: 'Hiện tại workspace hỗ trợ chỉnh sửa text và layout trực tiếp. Tính năng upload logo và brand kit đang được phát triển và sẽ ra mắt trong phiên bản tiếp theo. Bạn có thể export PPTX và thêm logo trong PowerPoint hoặc Google Slides.',
  },
  {
    q: 'Ngôn ngữ nào được hỗ trợ?',
    a: 'Hiện tại hỗ trợ 4 ngôn ngữ: Tiếng Việt, English, 한국어 (Korean), 日本語 (Japanese). AI sẽ tạo toàn bộ nội dung slide theo ngôn ngữ bạn chọn — bao gồm tiêu đề, body text và gợi ý AI.',
  },
];

const FAQItem: React.FC<{ item: typeof FAQS[0]; isOpen: boolean; onToggle: () => void }> = ({
  item, isOpen, onToggle,
}) => (
  <div className="border-b border-black/[0.05] dark:border-white/[0.04] last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 text-left gap-4 group"
    >
      <span className={`text-[13px] font-semibold transition-colors ${isOpen ? 'text-brand-blue' : 'text-slate-800 dark:text-white group-hover:text-brand-blue'}`}>
        {item.q}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-brand-blue text-white' : 'bg-black/[0.04] dark:bg-white/[0.04] text-slate-400'}`}
      >
        <ChevronDown size={13} />
      </motion.div>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <p className="pb-4 text-[12px] text-slate-500 dark:text-white/50 leading-relaxed max-w-2xl">
            {item.a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 px-6 border-t border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.01]">
      <div className="max-w-[800px] mx-auto">
        <FadeInUp className="text-center mb-12">
          <SectionLabel>CÂU HỎI THƯỜNG GẶP</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
            Bạn cần biết gì?
          </h2>
          <p className="text-base text-slate-500 dark:text-white/40">
            Tìm câu trả lời cho những thắc mắc phổ biến nhất về AI Slide Creator.
          </p>
        </FadeInUp>

        <FadeInUp delay={0.08}>
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-black/[0.06] dark:border-white/[0.04] px-6 divide-y divide-black/[0.04] dark:divide-white/[0.03]">
            {FAQS.map((faq, i) => (
              <FAQItem
                key={i}
                item={faq}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </FadeInUp>

        <FadeInUp delay={0.15} className="mt-8 text-center">
          <p className="text-[12px] text-slate-400 dark:text-[#555]">
            Còn câu hỏi khác?{' '}
            <a href="mailto:support@skyverses.com" className="text-brand-blue hover:underline font-semibold">
              Liên hệ support →
            </a>
          </p>
        </FadeInUp>
      </div>
    </section>
  );
};
