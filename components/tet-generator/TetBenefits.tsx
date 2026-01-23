
import React from 'react';

const BENEFITS = [
  { t: 'Trang phục', d: 'Thử mọi loại Áo dài, Việt phục truyền thống chỉ với 1 tấm ảnh chân dung.' },
  { t: 'Bối cảnh', d: 'Tái hiện không gian chợ Tết, phố cổ, hay vườn hoa xuân lung linh.' },
  { t: 'Tiết kiệm', d: 'Không cần thuê ekip chuyên nghiệp hay phòng studio đắt đỏ.' },
  { t: 'Độc bản', d: 'Tạo ra những thiệp Tết và hình ảnh chúc xuân không đụng hàng.' }
];

export const TetBenefits: React.FC = () => {
  return (
    <section className="py-40 bg-slate-50 dark:bg-[#08080a] border-y border-slate-100 dark:border-white/5 transition-colors">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
        <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white">
          Đón Tết rạng rỡ <br /><span className="text-red-600">Với Trí Tuệ Nhân Tạo.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {BENEFITS.map((item, i) => (
            <div key={i} className="p-8 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl group hover:border-red-500/30 transition-all shadow-sm">
              <span className="text-3xl font-black italic text-red-500/20 group-hover:text-red-500 transition-colors leading-none">0{i+1}</span>
              <div className="mt-6 space-y-2">
                <h4 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">{item.t}</h4>
                <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">"{item.d}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
