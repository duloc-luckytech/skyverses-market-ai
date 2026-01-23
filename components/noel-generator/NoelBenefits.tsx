
import React from 'react';

const BENEFITS = [
  { t: 'Tốc độ', d: 'Tạo hàng chục concept thiệp và banner Noel chỉ trong vài phút thay vì hàng giờ chụp studio.' },
  { t: 'Đồng nhất', d: 'Duy trì khuôn mặt người mẫu trong các trang phục lễ hội phức tạp nhất.' },
  { t: 'Độ nét', d: 'Kết xuất chất lượng 4K sắc nét từng bông tuyết và ánh đèn neon.' },
  { t: 'Sáng tạo', d: 'Phong cách Giáng sinh độc bản giúp hình ảnh của bạn luôn nổi bật.' }
];

export const NoelBenefits: React.FC = () => {
  return (
    <section className="py-40 bg-slate-50 dark:bg-[#08080a] border-y border-slate-100 dark:border-white/5 transition-colors">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
        <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white">
          Phép màu từ <br /><span className="text-rose-600">Công nghệ AI.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {BENEFITS.map((item, i) => (
            <div key={i} className="p-8 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl group hover:border-rose-500/30 transition-all shadow-sm">
              <span className="text-3xl font-black italic text-rose-500/20 group-hover:text-rose-500 transition-colors leading-none">0{i+1}</span>
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
