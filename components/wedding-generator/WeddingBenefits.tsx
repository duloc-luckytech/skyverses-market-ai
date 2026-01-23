
import React from 'react';

const BENEFITS = [
  { t: 'Đa dạng bối cảnh', d: 'Từ châu Âu cổ kính đến bờ biển Maldives hay studio Hàn Quốc hiện đại.' },
  { t: 'Tùy biến trang phục', d: 'Thử hàng trăm mẫu váy cưới, veston cao cấp nhất mà không cần may đo.' },
  { t: 'Đồng bộ gương mặt', d: 'Công nghệ Face-Lock giữ nguyên vẹn cảm xúc và đường nét của cả hai bạn.' },
  { t: 'Tiết kiệm 90% chi phí', d: 'Sở hữu bộ ảnh cưới đẳng cấp chỉ với vài trăm credits, bỏ qua ekip tốn kém.' }
];

export const WeddingBenefits: React.FC = () => {
  return (
    <section className="py-40 bg-slate-50 dark:bg-[#08080a] border-y border-slate-100 dark:border-white/5 transition-colors">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
        <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white">
          Hạnh phúc thăng hoa <br /><span className="text-pink-600">Bằng Trí Tuệ Nhân Tạo.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {BENEFITS.map((item, i) => (
            <div key={i} className="p-8 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl group hover:border-pink-500/30 transition-all shadow-sm">
              <span className="text-3xl font-black italic text-pink-500/20 group-hover:text-pink-500 transition-colors leading-none">0{i+1}</span>
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
