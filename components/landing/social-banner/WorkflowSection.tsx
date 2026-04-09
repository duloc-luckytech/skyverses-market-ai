import React from 'react';
import { LayoutGrid, Wand2, Zap, Download } from 'lucide-react';

const STEPS = [
  {
    icon: LayoutGrid,
    num: '01',
    title: 'Chọn Platform & Format',
    desc: 'Chọn nền tảng đích: X (Twitter), Facebook, Instagram, LinkedIn hoặc TikTok. Hệ thống tự hiển thị đúng các định dạng — Cover, Post, Story, Banner — với kích thước chuẩn từng platform.',
  },
  {
    icon: Wand2,
    num: '02',
    title: 'Nhập nội dung & thương hiệu',
    desc: 'Nhập tiêu đề banner, tagline, tên thương hiệu và màu sắc. Bật AI Copywriting để hệ thống tự viết headline hấp dẫn. Upload logo hoặc ảnh tham chiếu nếu cần.',
  },
  {
    icon: Zap,
    num: '03',
    title: 'AI tạo banner',
    desc: 'Nhấn Tạo Banner — AI kết hợp prompt, màu thương hiệu và layout chuẩn nền tảng để render hình ảnh chất lượng cao. Theo dõi tiến trình real-time, auto-refund nếu lỗi.',
  },
  {
    icon: Download,
    num: '04',
    title: 'Xem trước & tải xuống',
    desc: 'Preview fullscreen, so sánh các phiên bản. Tải PNG hoặc JPG đúng kích thước chuẩn từng nền tảng. Lịch sử banner lưu trên cloud để tái sử dụng.',
  },
];

export const WorkflowSection: React.FC = () => (
  <section className="px-6 lg:px-16 py-16 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-6xl mx-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-blue/60 mb-2">QUY TRÌNH</p>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">4 bước tạo banner chuyên nghiệp</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map(s => (
          <div
            key={s.num}
            className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015] hover:border-black/[0.1] dark:hover:border-white/[0.08] transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                <s.icon size={14} className="text-brand-blue" />
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
