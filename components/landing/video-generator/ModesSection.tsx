import React from 'react';
import { Zap, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';

const MODES = [
  {
    icon: <Zap size={18} />, accent: 'indigo', label: 'Đơn lẻ', sub: 'Single Mode',
    desc: 'Tạo video từ một kịch bản. Hỗ trợ Start Frame và End Frame để kiểm soát đầu-cuối video.',
    features: [
      'Text-to-Video hoặc Image-to-Video',
      'Start Frame + End Frame tùy chọn',
      'Xuất cùng lúc 1-4 video/lần',
      'Tất cả 30+ models khả dụng',
    ],
  },
  {
    icon: <Layers size={18} />, accent: 'violet', label: 'Đa cảnh', sub: 'Multi-Frame Mode',
    desc: 'Điều phối chuỗi keyframes liên tiếp. Mỗi đoạn chuyển cảnh có prompt riêng, tối đa 6 keyframes.',
    features: [
      'Tối đa 6 keyframes mỗi chuỗi',
      'Prompt riêng cho mỗi transition',
      'Upload hoặc chọn từ thư viện ảnh',
      'Tự động ghép nối liền mạch',
    ],
  },
  {
    icon: <RefreshCw size={18} />, accent: 'blue', label: 'Tự động', sub: 'Auto / Batch Mode',
    desc: 'Sản xuất hàng loạt. Bulk import nhiều kịch bản cùng lúc, mỗi tác vụ có Start/End riêng.',
    features: [
      'Bulk import: mỗi dòng = 1 kịch bản',
      'Ảnh tham chiếu riêng cho mỗi tác vụ',
      'Xử lý song song tự động',
      'Credit refund nếu lỗi rendering',
    ],
  },
];

const accentBorder: Record<string, string> = {
  indigo: 'border-indigo-500/15 hover:border-indigo-500/30',
  violet: 'border-violet-500/15 hover:border-violet-500/30',
  blue: 'border-blue-500/15 hover:border-blue-500/30'
};
const iconBg: Record<string, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400',
  violet: 'bg-violet-500/10 text-violet-500 dark:text-violet-400',
  blue: 'bg-blue-500/10 text-blue-500 dark:text-blue-400'
};
const checkColor: Record<string, string> = {
  indigo: 'text-indigo-500 dark:text-indigo-400',
  violet: 'text-violet-500 dark:text-violet-400',
  blue: 'text-blue-500 dark:text-blue-400'
};

export const ModesSection: React.FC = () => (
  <section className="py-24 relative z-10">
    <div className="max-w-5xl mx-auto px-6 lg:px-12">
      <div className="text-center space-y-3 mb-14">
        <span className="text-indigo-500/60 dark:text-indigo-400 font-semibold uppercase tracking-wider text-[9px]">3 Chế độ sản xuất</span>
        <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">Creation <span className="text-indigo-500 dark:text-indigo-400">Modes</span></h2>
        <p className="text-slate-500 dark:text-[#555] font-medium text-sm max-w-xl mx-auto">Chọn chế độ phù hợp: tạo nhanh 1 video, dàn dựng đa cảnh, hoặc sản xuất hàng loạt.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MODES.map(m => (
          <div key={m.sub} className={`p-5 bg-black/[0.01] dark:bg-white/[0.015] border rounded-2xl space-y-4 transition-all ${accentBorder[m.accent]}`}>
            <div className="flex justify-between items-start">
              <div className={`w-9 h-9 rounded-xl ${iconBg[m.accent]} flex items-center justify-center`}>{m.icon}</div>
              <span className="text-[7px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#444]">{m.sub}</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{m.label}</h3>
              <p className="text-[10px] text-slate-500 dark:text-[#555] font-medium leading-relaxed">{m.desc}</p>
            </div>
            <ul className="space-y-1.5 pt-1">
              {m.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-[9px] font-medium text-slate-500 dark:text-[#555]">
                  <CheckCircle2 size={10} className={`${checkColor[m.accent]} shrink-0 mt-0.5`} /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);
