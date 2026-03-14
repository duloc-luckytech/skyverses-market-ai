import React from 'react';
import { PenTool, Cpu, SlidersHorizontal, Zap } from 'lucide-react';

const STEPS = [
  {
    icon: PenTool, num: '01', title: 'Nhập Prompt',
    desc: 'Mô tả hình ảnh bằng ngôn ngữ tự nhiên. Hệ thống tự động dịch & tối ưu prompt cho engine AI. Hỗ trợ tải ảnh tham chiếu để hướng dẫn bố cục.'
  },
  {
    icon: Cpu, num: '02', title: 'Chọn Model Family',
    desc: 'Chọn nhóm model: Nano Banana Pro (5 chế độ), Seedream 5 (lên 8K), Midjourney 7 (turbo), Kling 3.0 Omni (12K), hoặc IMAGE O1 — hệ thống tự chọn phiên bản tối ưu.'
  },
  {
    icon: SlidersHorizontal, num: '03', title: 'Tinh chỉnh Config',
    desc: 'Tùy chỉnh tỷ lệ (11 lựa chọn từ 1:1 đến 21:9), độ phân giải (1K → 12K), chế độ ưu tiên (vip3/fast/relaxed), và số lượng bản tạo cùng lúc.'
  },
  {
    icon: Zap, num: '04', title: 'Tạo & Quản lý',
    desc: 'Click tạo — theo dõi Production Log real-time. Kết quả hiện tại Grid view với Fullscreen preview, Edit, Download, Auto Refund khi lỗi. Lịch sử lưu trên Cloud.'
  },
];

export const WorkflowSection: React.FC = () => (
  <section className="px-6 lg:px-16 py-16 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-6xl mx-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-500/60 dark:text-rose-400/60 mb-2">QUY TRÌNH</p>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">4 bước tạo hình ảnh AI</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map(s => (
          <div key={s.num} className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015] hover:border-black/[0.1] dark:hover:border-white/[0.08] transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <s.icon size={14} className="text-rose-500 dark:text-rose-400" />
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
