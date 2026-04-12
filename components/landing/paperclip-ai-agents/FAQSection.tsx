import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';

const FAQ_ITEMS = [
  {
    q: 'Paperclip khác gì so với AutoGPT hay CrewAI?',
    a: 'Paperclip tập trung vào enterprise use-case với Budget Guard và Governance Layer built-in — không có ở AutoGPT hay CrewAI. Bạn không chỉ chạy agents, bạn chạy cả một tổ chức với spending controls, audit logs và human approval workflows. Ngoài ra, Paperclip có dashboard GUI đầy đủ, không cần code để setup org chart.',
  },
  {
    q: 'Tôi có thể dùng LLM model nào?',
    a: 'Paperclip hỗ trợ: Claude (Sonnet, Haiku, Opus), GPT-4o / GPT-4-turbo / GPT-3.5, Cursor, GitHub Copilot, Codex, và bất kỳ OpenAI-compatible API nào. Bạn có thể mix LLMs — Claude cho creative tasks, Cursor cho code, GPT-4o cho analysis — tất cả trong cùng một org.',
  },
  {
    q: 'Budget Guard hoạt động như thế nào?',
    a: 'Bạn đặt hard spend limit (USD) cho từng agent, từng department, và toàn org per day/week/month. Khi agent sắp vượt giới hạn, Paperclip tự động: (1) pause agent, (2) gửi alert, (3) chờ human approval để continue. Không có agent nào có thể bypass Budget Guard — kể cả CEO Agent.',
  },
  {
    q: 'Self-hosted nghĩa là tôi cần infrastructure gì?',
    a: 'Minimal: Docker + PostgreSQL + Redis. Bạn có thể chạy trên VPS $10/tháng cho small org, hoặc Kubernetes cluster cho enterprise. Full Docker Compose file có sẵn trong repo. Setup time ước tính ~5 phút cho người quen Docker.',
  },
  {
    q: 'Data của tôi có bị dùng để train model không?',
    a: 'Không — với self-hosted deployment, data chỉ tồn tại trong infrastructure của bạn và được gửi thẳng tới LLM provider (Anthropic, OpenAI) qua API keys của bạn. Paperclip không có server trung gian nào xử lý data. Với managed cloud, chúng tôi ký BAA và commit zero data retention.',
  },
  {
    q: 'Open source MIT có nghĩa là gì với tôi?',
    a: 'MIT license cho phép: dùng thương mại miễn phí, fork và customize, deploy không giới hạn instances, không cần attribution. Chúng tôi kiếm tiền từ managed cloud hosting và enterprise support — không bao giờ "open-core" hay giới hạn core features.',
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
            Mọi thắc mắc về Paperclip AI Agents — giải đáp rõ ràng.
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
            <a
              href="https://github.com/paperclip-ing/paperclip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue hover:underline font-semibold"
            >
              Mở issue trên GitHub →
            </a>
          </p>
        </FadeInUp>
      </div>
    </section>
  );
};
