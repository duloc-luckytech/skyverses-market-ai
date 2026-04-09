import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'Ảnh và video tạo ra có thuộc về tôi không?',
    a: 'Có — 100%. Mọi ảnh và video bạn tạo trên Skyverses đều thuộc quyền sở hữu hoàn toàn của bạn. Bạn có thể dùng cho website, brochure, mạng xã hội, tài liệu marketing mà không cần lo về bản quyền.',
  },
  {
    q: 'Credits có hết hạn không?',
    a: 'Credits không bao giờ hết hạn. Bạn nạp một lần và dùng bao lâu cũng được. 100 CR miễn phí khi đăng ký — không cần thẻ tín dụng.',
  },
  {
    q: 'Chất lượng render có đủ để dùng cho marketing chuyên nghiệp?',
    a: 'Hoàn toàn có thể. AI render của Skyverses đạt độ phân giải 4K, photorealistic — đủ tiêu chuẩn in ấn brochure cao cấp, hiển thị trên website, và đăng lên mạng xã hội.',
  },
  {
    q: 'Mất bao lâu để tạo 1 ảnh/video?',
    a: 'Thường từ 10-30 giây cho ảnh 4K. Video tour mất từ 1-3 phút tùy độ dài và chất lượng. Bạn có thể tạo nhiều file cùng lúc.',
  },
  {
    q: 'Ảnh AI có được dùng trong tài liệu pháp lý và hồ sơ dự án?',
    a: 'Ảnh AI phù hợp cho marketing, brochure, website, và tài liệu giới thiệu. Với hồ sơ pháp lý chính thức, bạn nên kết hợp với ảnh thực tế theo yêu cầu cơ quan chức năng.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <FadeInUp className="mb-10 text-center">
          <SectionLabel>HỎI ĐÁP</SectionLabel>
          <h2 className="text-3xl font-bold mt-2">Câu hỏi thường gặp</h2>
          <p className="text-slate-500 dark:text-[#666] mt-2 text-sm">
            Mọi thắc mắc về Real Estate Visual AI — giải đáp trong 30 giây.
          </p>
        </FadeInUp>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="border border-black/[0.06] dark:border-white/[0.05] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-brand-blue/[0.02] transition-colors"
              >
                <span className="text-[13px] font-semibold text-slate-800 dark:text-white/90">
                  {item.q}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-slate-400 dark:text-[#555]"
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-[13px] text-slate-500 dark:text-[#777] leading-relaxed border-t border-black/[0.04] dark:border-white/[0.04] pt-3">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <FadeInUp delay={0.2} className="mt-8 text-center">
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
