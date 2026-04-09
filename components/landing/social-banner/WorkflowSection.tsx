import React from 'react';
import { Layout, Monitor, Share2, Wand2 } from 'lucide-react';

const STEPS = [
  {
    icon: Share2, num: '01', title: 'Chọn Platform & Format',
    desc: 'Chọn nền tảng (X, Facebook, Instagram, LinkedIn) và định dạng banner — Cover, Post, Story, Event. AI tự biết tỷ lệ và kích thước pixel chuẩn của từng format.'
  },
  {
    icon: Wand2, num: '02', title: 'Nhập ý tưởng & AI Boost',
    desc: 'Mô tả ý tưởng banner bằng ngôn ngữ tự nhiên. Dùng AI Prompt Boost để tối ưu hóa prompt tự động theo platform và định dạng đã chọn.'
  },
  {
    icon: Layout, num: '03', title: 'Cấu hình thương hiệu',
    desc: 'Thêm màu thương hiệu, ảnh tham chiếu sản phẩm, headline và subheadline. Cùng AI panel cấu hình như trang tạo hình — model, style, mode, resolution.'
  },
  {
    icon: Monitor, num: '04', title: 'Generate & Download 4K',
    desc: 'AI sinh banner đúng chuẩn pixel platform. Xem kết quả với aspect ratio chuẩn, download PNG 4K chất lượng cao, sẵn sàng đăng ngay lên mọi nền tảng.'
  },
];

export const WorkflowSection: React.FC = () => (
  <section className="px-6 lg:px-16 py-16 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-6xl mx-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-blue/60 dark:text-brand-blue/60 mb-2">QUY TRÌNH</p>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">4 bước tạo Social Banner AI</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map(s => (
          <div key={s.num} className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015] hover:border-black/[0.1] dark:hover:border-white/[0.08] transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                <s.icon size={14} className="text-brand-blue dark:text-brand-blue" />
              </div>
              <span className="text-[10px] font-semibold text-slate-300 dark:text-white/20">{s.num}</span>
              <h3 className="text-sm font-semibold">{s.title}</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-white/30 leading-relaxed pl-11">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
