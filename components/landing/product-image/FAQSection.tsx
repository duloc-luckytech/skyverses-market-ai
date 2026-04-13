import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';

const FAQ_ITEMS = [
  {
    q: 'Ảnh tạo ra có thuộc về tôi không?',
    a: 'Có — 100%. Toàn bộ ảnh bạn tạo ra bằng Skyverses AI đều thuộc quyền sở hữu của bạn, bao gồm cả quyền thương mại. Dùng cho quảng cáo, sản phẩm, hay bán lại đều được mà không cần xin phép.',
  },
  {
    q: 'Credits có hết hạn không?',
    a: 'Credits không bao giờ hết hạn. Bạn mua rồi dùng dần theo tiến độ dự án, không có deadline. Nếu job thất bại, credits được hoàn tự động ngay lập tức.',
  },
  {
    q: 'Hỗ trợ những AI model nào?',
    a: 'Hỗ trợ 22+ models từ 10+ families: Google Imagen 4, FLUX (Pro, Dev, Schnell), Stable Diffusion XL, Stable Diffusion 3.5, Midjourney-style models, anime-specific models và nhiều hơn nữa. Danh sách liên tục được cập nhật.',
  },
  {
    q: 'Chất lượng ảnh có đạt 4K/8K không?',
    a: 'Có. Bạn chọn độ phân giải output trong Studio — từ 512px đến 4K trực tiếp khi generate. Tính năng AI Upscale có thể nâng lên đến 12K sau đó. Ảnh đủ sắc nét để in poster khổ lớn hoặc dùng làm hero image.',
  },
  {
    q: 'Xóa nền có chính xác không?',
    a: 'Rất chính xác. AI phát hiện chủ thể tự động — tóc, chi tiết nhỏ, nhiều lớp đều được xử lý tốt. Bạn nhận PNG nền trong suốt sẵn sàng dùng ngay. Nếu kết quả chưa ưng, có thể fine-tune bằng inpainting.',
  },
  {
    q: 'Batch processing tối đa bao nhiêu ảnh?',
    a: 'Tùy gói. Gói cơ bản xử lý 10 ảnh cùng lúc, gói Pro không giới hạn batch size. Toàn bộ ảnh trong batch đều được xử lý song song — không phải chờ từng ảnh một. Kết quả xuất ZIP tự động.',
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
            Mọi thắc mắc về AI Image Studio — giải đáp nhanh.
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
