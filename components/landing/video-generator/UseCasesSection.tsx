import React from 'react';
import { Box, Settings, CreditCard, Shield, Download, Clock } from 'lucide-react';

const FEATURES = [
  { icon: <Box size={16} />, title: 'Model Family Selector', desc: 'Chọn family (VEO, Kling, Hailuo...) rồi chọn phiên bản cụ thể. Modes, ratios, resolutions tự động load theo family.' },
  { icon: <Settings size={16} />, title: 'Cấu hình linh hoạt', desc: 'Chế độ: Relaxed / Fast / Quality / Professional. Tỷ lệ: 16:9, 9:16, 1:1, 21:9. Resolution: 480p → 4K.' },
  { icon: <CreditCard size={16} />, title: 'Credits hoặc API Key', desc: 'Sử dụng credits của hệ thống hoặc kết nối API Key cá nhân. Chi phí hiển thị trước khi tạo.' },
  { icon: <Shield size={16} />, title: 'Auto Refund', desc: 'Nếu video lỗi do engine, credits tự động hoàn trả. Error message chi tiết hiển thị trên card.' },
  { icon: <Download size={16} />, title: 'Auto Download', desc: 'Bật auto-download để video tự tải xuống khi hoàn thành. Hoặc tải thủ công từ thư viện kết quả.' },
  { icon: <Clock size={16} />, title: 'Production Log', desc: 'Theo dõi toàn bộ pipeline real-time: từ API handshake, polling, đến CDN delivery với timestamps chính xác.' },
];

export const UseCasesSection: React.FC = () => (
  <section className="py-24 border-y border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-5xl mx-auto px-6 lg:px-12">
      <div className="text-center space-y-3 mb-14">
        <span className="text-indigo-500/60 dark:text-indigo-400 font-semibold uppercase tracking-wider text-[9px]">Features</span>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Tính năng <span className="text-indigo-500 dark:text-indigo-400">nổi bật</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {FEATURES.map(f => (
          <div key={f.title} className="p-4 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-2xl space-y-2.5 group hover:border-indigo-500/20 transition-all">
            <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform">{f.icon}</div>
            <h4 className="text-[11px] font-semibold">{f.title}</h4>
            <p className="text-[9px] text-slate-500 dark:text-[#555] font-medium leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
