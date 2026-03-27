
import React from 'react';
import { Upload, Scan, Maximize2 } from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const steps = [
    { s: '01', t: 'Tải ảnh cũ', d: 'Tải lên các tấm ảnh bị mờ, xước, đen trắng hoặc độ phân giải thấp từ kho lưu trữ của bạn.', icon: Upload },
    { s: '02', t: 'AI Phân tích', d: 'Neural Core nhận diện các điểm lỗi, nhiễu hạt và các chi tiết khuôn mặt cần phục hồi.', icon: Scan },
    { s: '03', t: 'Kết xuất 4K', d: 'Hệ thống tổng hợp lại pixel, khử nhiễu và nâng cấp độ phân giải lên 4K sắc nét tuyệt đối.', icon: Maximize2 }
  ];

  return (
    <section className="py-32 lg:py-40 bg-slate-50 dark:bg-[#070708] border-y border-slate-100 dark:border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center space-y-4 mb-20 lg:mb-24">
          <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">The Restoration Path</h2>
          <p className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Upload → Analyze → Synchronize</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="p-10 lg:p-12 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-2xl relative group hover:border-emerald-500/30 transition-all shadow-sm hover:shadow-xl hover:shadow-emerald-500/5">
                <div className="absolute top-4 right-8 text-5xl font-black italic text-black/[0.03] dark:text-white/5 group-hover:text-emerald-500/10 transition-colors">{step.s}</div>
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-emerald-500/[0.06] dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8 lg:mb-10 rounded-xl group-hover:scale-110 transition-transform border border-emerald-500/10">
                  <Icon size={26} />
                </div>
                <h4 className="text-xl lg:text-2xl font-black uppercase italic tracking-tight mb-4 text-slate-900 dark:text-white">{step.t}</h4>
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-wider leading-loose">"{step.d}"</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
