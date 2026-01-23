
import React from 'react';
import { Zap, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';

export const ModesSection: React.FC = () => {
  return (
    <section className="py-40 bg-white dark:bg-[#050507] relative z-10 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center space-y-4 mb-32">
          <span className="text-indigo-600 font-black uppercase tracking-[0.6em] text-[11px]">Production Logic</span>
          <h2 className="text-4xl lg:text-8xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white transition-colors">Operational <span className="text-indigo-600">Modes.</span></h2>
          <p className="text-slate-500 dark:text-gray-400 font-medium max-w-2xl mx-auto italic">Lựa chọn chế độ vận hành tối ưu cho quy mô sáng tạo của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl rounded-sm overflow-hidden">
          {/* Single Mode */}
          <div className="p-12 lg:p-16 bg-white dark:bg-[#0d0d0f] space-y-10 transition-all hover:bg-indigo-600/[0.01] border-r border-black/5 dark:border-white/5">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
                <Zap size={28} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 italic">Rapid Take</span>
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white transition-colors">Đơn lẻ (Single)</h3>
              <p className="text-base text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-indigo-600 pl-4">"Khởi tạo video nhanh từ một kịch bản hoặc một ảnh mỏ neo duy nhất."</p>
            </div>
            <ul className="space-y-3">
              {['Kết xuất tức thì 4-8 giây', 'Dễ dàng thử nghiệm concept', 'Tối ưu cho social media content', 'Hỗ trợ một ảnh tham chiếu'].map(f => (
                <li key={f} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400 italic">
                  <CheckCircle2 size={14} className="text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Multi Mode */}
          <div className="p-12 lg:p-16 bg-white dark:bg-[#0d0d0f] space-y-10 transition-all hover:bg-purple-600/[0.01] border-r border-black/5 dark:border-white/5">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 rounded-[1.5rem] bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-inner">
                <Layers size={28} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 italic">Storytelling</span>
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white transition-colors">Đa cảnh (Multi)</h3>
              <p className="text-base text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-purple-600 pl-4">"Điều phối chuỗi phân cảnh phức tạp, giữ vững sự nhất quán định danh."</p>
            </div>
            <ul className="space-y-3">
              {['Quản lý dòng thời gian phim', 'Khóa nhân vật xuyên suốt cảnh', 'Tùy chỉnh góc máy cho mỗi nhịp', 'Ghép nối kịch bản liền mạch'].map(f => (
                <li key={f} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400 italic">
                  <CheckCircle2 size={14} className="text-purple-500" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Auto Mode */}
          <div className="p-12 lg:p-16 bg-white dark:bg-[#0d0d0f] space-y-10 transition-all hover:bg-blue-600/[0.01]">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                <RefreshCw size={28} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 italic">Scale Hub</span>
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white transition-colors">Tự động (Auto)</h3>
              <p className="text-base text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-blue-600 pl-4">"Sản xuất quy mô công nghiệp. Tự động hóa từ danh sách kịch bản."</p>
            </div>
            <ul className="space-y-3">
              {['Hỗ trợ Bulk Import kịch bản', 'Tự động gán tài nguyên thư viện', 'Xử lý song song đa luồng H100', 'Tăng tốc sản xuất lên 500%'].map(f => (
                <li key={f} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400 italic">
                  <CheckCircle2 size={14} className="text-blue-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
