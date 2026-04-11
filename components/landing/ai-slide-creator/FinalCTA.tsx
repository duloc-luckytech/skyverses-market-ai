
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Gift, Laptop, HeadphonesIcon, ArrowRight } from 'lucide-react';
import { GradientMesh, FadeInUp } from '../_shared/SectionAnimations';

interface FinalCTAProps { onStartStudio: () => void; }

const TRUST_ITEMS = [
  { icon: Gift,             label: 'Miễn phí hoàn toàn',    sub: 'Không cần thẻ tín dụng' },
  { icon: ShieldCheck,      label: 'Bảo mật dữ liệu',        sub: 'Không chia sẻ với bên thứ 3' },
  { icon: Laptop,           label: 'Không cần cài đặt',      sub: 'Chạy hoàn toàn trên trình duyệt' },
  { icon: HeadphonesIcon,   label: 'Hỗ trợ 24/7',            sub: 'Live chat & email hỗ trợ' },
];

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStartStudio }) => (
  <section className="relative py-28 px-6 overflow-hidden border-t border-black/[0.06] dark:border-white/[0.04]">
    <GradientMesh intensity="strong" accent="violet-600" />

    <div className="relative z-10 max-w-[700px] mx-auto text-center">
      <FadeInUp>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/[0.08] border border-brand-blue/20 text-brand-blue text-[11px] font-bold mb-6">
          <Sparkles size={11} />
          Bắt đầu ngay hôm nay — miễn phí
        </div>

        {/* Headline */}
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-5 leading-tight">
          Deck đầu tiên của bạn
          <br />
          <span className="text-brand-blue">chỉ mất 2 phút</span>
        </h2>

        <p className="text-base text-slate-500 dark:text-white/50 mb-10 max-w-md mx-auto leading-relaxed">
          Không cần thiết kế. Không cần chờ. AI làm hết — bạn chỉ cần nhập chủ đề và chỉnh sửa nếu muốn.
        </p>

        {/* CTA button */}
        <motion.button
          onClick={onStartStudio}
          whileHover={{ scale: 1.04, boxShadow: '0 20px 60px rgba(0,144,255,0.35)' }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 px-9 py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-blue-500 text-white font-black text-base shadow-2xl shadow-brand-blue/25 hover:brightness-110 transition-all mb-4 group"
        >
          <Sparkles size={18} />
          ✨ Tạo Slide Ngay — Miễn phí
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </motion.button>

        <p className="text-[10px] text-slate-400 dark:text-[#555] mb-12 uppercase tracking-widest">
          Không cần đăng nhập để thử · Xuất không giới hạn
        </p>

        {/* 4 trust items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex flex-col items-center gap-2 text-center">
                <div className="w-9 h-9 rounded-xl bg-brand-blue/[0.08] border border-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-white/70 leading-tight">{item.label}</p>
                  <p className="text-[9px] text-slate-400 dark:text-white/30 mt-0.5">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </FadeInUp>
    </div>
  </section>
);
