
import React from 'react';

const BENEFITS = [
  { t: 'Đa dạng chủ đề', d: 'Từ tiệc trà cổ điển đến không gian Cyberpunk rực rỡ sắc màu.' },
  { t: 'Cá nhân hóa cao', d: 'AI hiểu và giữ nguyên nét đẹp gương mặt bạn trong mọi concept.' },
  { t: 'Quà tặng độc đáo', d: 'Tạo thiệp mời và ảnh kỷ niệm ấn tượng chỉ trong vài giây.' },
  { t: 'Tiết kiệm thời gian', d: 'Sở hữu bộ ảnh tiệc chuyên nghiệp mà không cần trang trí hay chuẩn bị kỳ công.' }
];

export const BirthdayBenefits: React.FC = () => {
  return (
    <section className="py-40 bg-slate-50 dark:bg-[#08080a] border-y border-slate-100 dark:border-white/5 transition-colors">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
        <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white">
          Khoảnh khắc tỏa sáng <br /><span className="text-purple-600">Với Công Nghệ AI.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {BENEFITS.map((item, i) => (
            <div key={i} className="p-8 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl group hover:border-purple-500/30 transition-all shadow-sm">
              <span className="text-3xl font-black italic text-purple-500/20 group-hover:text-purple-500 transition-colors leading-none">0{i+1}</span>
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
