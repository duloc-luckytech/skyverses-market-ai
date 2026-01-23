
import React from 'react';
import { ImageIcon, LayoutGrid, CheckCircle2 } from 'lucide-react';

export const ModesSection: React.FC = () => {
  return (
    <section className="py-40 bg-white dark:bg-[#050507] relative z-10 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center space-y-4 mb-32">
          <span className="text-brand-blue font-black uppercase tracking-[0.6em] text-[11px]">Operation Modes</span>
          <h2 className="text-4xl lg:text-8xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white transition-colors">Single vs Batch <span className="text-brand-blue">Mode.</span></h2>
          <p className="text-slate-500 dark:text-gray-400 font-medium max-w-2xl mx-auto italic">Chọn chế độ vận hành tối ưu cho mục đích sáng tạo hoặc sản xuất quy mô.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl rounded-sm overflow-hidden">
          {/* Single Mode */}
          <div className="p-16 lg:p-24 bg-white dark:bg-[#0d0d0f] space-y-12 transition-all hover:bg-brand-blue/[0.01] border-r border-black/5 dark:border-white/5">
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 rounded-[2rem] bg-brand-blue/10 flex items-center justify-center text-brand-blue shadow-inner">
                <ImageIcon size={32} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 italic">Concept Testing</span>
            </div>
            <div className="space-y-6">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white transition-colors">Đơn lẻ (Single)</h3>
              <p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-brand-blue pl-6">"Phù hợp để test ý tưởng, tinh chỉnh concept và hoàn thiện kịch bản chi tiết."</p>
            </div>
            <ul className="space-y-4">
              {['Kiến tạo từng ảnh với độ tập trung cao', 'Tối ưu hóa prompt theo từng lượt render', 'Hoàn hảo cho giai đoạn lên Concept Art', 'Kiểm soát chi tiết nhân dạng chính xác'].map(f => (
                <li key={f} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400 italic">
                  <CheckCircle2 size={16} className="text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Batch Mode */}
          <div className="p-16 lg:p-24 bg-white dark:bg-[#0d0d0f] space-y-12 transition-all hover:bg-purple-500/[0.01]">
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 rounded-[2rem] bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-inner">
                <LayoutGrid size={32} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 italic">Production Scale</span>
            </div>
            <div className="space-y-6">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white transition-colors">Hàng loạt (Batch)</h3>
              <p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-purple-500 pl-6">"Hiệu suất quy mô lớn. Một kịch bản tạo ra hàng chục biến thể phục vụ marketing."</p>
            </div>
            <ul className="space-y-4">
              {['Một kịch bản tạo ra nhiều biến thể cùng lúc', 'Phục vụ nhu cầu Content Scale đa nền tảng', 'Dùng cho các chiến dịch Marketing, Social', 'Tăng hiệu suất sản xuất lên 400%'].map(f => (
                <li key={f} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400 italic">
                  <CheckCircle2 size={16} className="text-purple-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
