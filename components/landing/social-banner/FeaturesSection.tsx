import React from 'react';
import { Wand2, Ratio, Palette, ImageIcon, Type, ArrowDownToLine, ShieldCheck, History } from 'lucide-react';

const FEATURES = [
  {
    icon: Ratio, title: '14+ Kích thước chuẩn',
    desc: 'Tất cả format native: X Cover 1500×500, FB Post 1200×630, IG Story 1080×1920, LI Banner 1584×396. AI tự lock tỷ lệ đúng — không bao giờ bị crop.'
  },
  {
    icon: Wand2, title: 'AI Prompt Optimizer',
    desc: 'Tự động tối ưu mô tả thành prompt chuyên nghiệp phù hợp với từng platform và định dạng. Không cần biết cách viết prompt AI.'
  },
  {
    icon: Palette, title: 'Brand Color DNA',
    desc: 'Khóa màu thương hiệu chính xác với color picker + HEX input. AI luôn sử dụng đúng bảng màu brand qua mọi lần generate.'
  },
  {
    icon: ImageIcon, title: 'Ảnh tham chiếu',
    desc: 'Upload tối đa 6 ảnh sản phẩm / thương hiệu để AI giữ nhất quán visual. Cùng hệ thống reference image như trang tạo hình AI.'
  },
  {
    icon: Type, title: 'Headline & Subheadline',
    desc: 'Thêm tiêu đề và phụ đề trực tiếp vào ảnh. Kiểm soát bật/tắt text overlay trước khi generate.'
  },
  {
    icon: ArrowDownToLine, title: '4K PNG Export',
    desc: 'Download trực tiếp PNG chất lượng 4K, sẵn sàng đăng lên mọi platform. Commercial safe — không bản quyền.'
  },
  {
    icon: History, title: 'Session History',
    desc: 'Lịch sử tạo banner lưu local, hiện 5 phiên gần nhất. Mở lại và tiếp tục bất kỳ lúc nào mà không mất cài đặt.'
  },
  {
    icon: ShieldCheck, title: 'AI Panel chuẩn',
    desc: 'Cùng AI panel cấu hình như trang tạo hình — model, style, mode, resolution. Người đã dùng Image Studio quen ngay.'
  },
];

export const FeaturesSection: React.FC = () => (
  <section className="px-6 lg:px-16 py-16 border-t border-black/[0.06] dark:border-white/[0.04]">
    <div className="max-w-6xl mx-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-blue/60 dark:text-brand-blue/60 mb-2">TÍNH NĂNG</p>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">Đầy đủ công cụ banner chuyên nghiệp</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(f => (
          <div key={f.title} className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015] hover:border-brand-blue/20 dark:hover:border-brand-blue/20 transition-all">
            <div className="flex items-center gap-2.5 mb-3">
              <f.icon size={14} className="text-brand-blue dark:text-brand-blue" />
              <h3 className="text-sm font-semibold">{f.title}</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-white/30 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
