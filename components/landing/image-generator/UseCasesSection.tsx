import React from 'react';
import { Boxes, SlidersHorizontal, CreditCard, Shield, ArrowDownToLine, ScrollText } from 'lucide-react';

const FEATURES = [
  {
    icon: Boxes, title: 'Model Family Selector',
    desc: '10+ nhóm model — chọn Family, hệ thống tự chọn phiên bản tối ưu theo mode + resolution. Hỗ trợ 3 engine: Gommo, FxLab, Running.'
  },
  {
    icon: SlidersHorizontal, title: 'Cấu hình linh hoạt',
    desc: '11 tỷ lệ (1:1, 16:9, 21:9, 4:5...), 6 cấp phân giải (1K→12K), 5+ chế độ speed (vip3, vip, fast, relaxed, turbo), số lượng 1–4 bản.'
  },
  {
    icon: CreditCard, title: 'Credits & API Key',
    desc: 'Thanh toán bằng Credits (tính theo resolution + mode) hoặc API Key cá nhân cho UNLIMITED. Hiển thị chi phí trước khi tạo.'
  },
  {
    icon: Shield, title: 'Auto Refund lỗi',
    desc: 'Khi engine trả lỗi, hệ thống tự động hoàn Credits. Card hiện trạng thái REFUNDED rõ ràng. Retry 1-click không mất thêm phí.'
  },
  {
    icon: ArrowDownToLine, title: 'Auto Download',
    desc: 'Bật Auto Download — ảnh tự tải ngay khi hoàn thành. Manual Download hỗ trợ chọn nhiều bản tải đồng thời.'
  },
  {
    icon: ScrollText, title: 'Production Log',
    desc: 'Mỗi tác vụ tạo ảnh có nhật ký chi tiết: Pipeline init, Resource auth, Polling status, Error trace — hỗ trợ debug nhanh.'
  },
];

export const UseCasesSection: React.FC = () => (
  <section className="px-6 lg:px-16 py-16 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-6xl mx-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-500/60 dark:text-rose-400/60 mb-2">TÍNH NĂNG</p>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">Công cụ chuyên nghiệp</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(f => (
          <div key={f.title} className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015] hover:border-black/[0.1] dark:hover:border-white/[0.08] transition-all">
            <div className="flex items-center gap-2.5 mb-3">
              <f.icon size={14} className="text-rose-500 dark:text-rose-400" />
              <h3 className="text-sm font-semibold">{f.title}</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-white/30 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
