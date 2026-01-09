
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, Zap, MonitorPlay, 
  Film, Clapperboard, Sparkles,
  AlignLeft, LayoutGrid, Fingerprint, Workflow,
  Quote, ArrowRight, ShieldCheck, History as HistoryIcon,
  Settings2, Sliders, Activity, BookOpen,
  RefreshCw
} from 'lucide-react';
import SequenceWorkspace from '../../components/SequenceWorkspace';

const SequenceProduct = () => {
  const solution = SOLUTIONS.find(s => s.id === 'SEQUENCE-STORY-ENGINE');
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <SequenceWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden transition-colors duration-500 pb-32">
      
      {/* Nền Cinematic tối giản */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#0090ff08_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,_#0090ff15_0%,_transparent_50%)]"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="min-h-[80vh] flex flex-col justify-center py-10 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-6">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-blue transition-all group">
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[11px] font-bold uppercase tracking-widest italic">Danh mục giải pháp</span>
                </Link>

                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-brand-blue">
                      <Clapperboard size={24} />
                      <span className="text-[12px] font-bold uppercase tracking-[0.3em]">AI Cinematic Engine</span>
                   </div>
                   <h1 className="text-6xl lg:text-[110px] font-black uppercase tracking-tighter italic leading-[0.8] italic">
                     Sequence.
                   </h1>
                </div>
                
                <p className="text-xl lg:text-3xl text-gray-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-brand-blue pl-6 max-w-2xl">
                  Viết kịch bản, nhận phim điện ảnh. <br /> 
                  <span className="opacity-50">Giải pháp video đa cảnh quay nhất quán đầu tiên cho doanh nghiệp.</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-brand-blue text-white px-12 py-6 text-[12px] font-bold uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 rounded-sm">
                    Khởi tạo Studio <Play size={18} fill="currentColor" />
                 </button>
                 <div className="flex flex-col justify-center px-4">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Tiêu chuẩn điện ảnh</p>
                    <p className="text-xs text-gray-500">Video 4K chất lượng cao</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-gray-100 dark:bg-black border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl rounded-sm">
                  <img src={solution.imageUrl} className="w-full h-full object-cover opacity-60 grayscale dark:grayscale-0" alt="Sequence Cinema" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-8 left-8">
                     <p className="text-[10px] font-bold uppercase text-brand-blue tracking-widest mb-2">Phân cảnh 01</p>
                     <h3 className="text-2xl font-bold italic text-black dark:text-white leading-tight uppercase">Sáng tạo không rào cản</h3>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- QUY TRÌNH VẬN HÀNH --- */}
        <section className="py-24 border-t border-black/5 dark:border-white/5 text-center">
           <div className="max-w-4xl mx-auto space-y-20">
              <div className="space-y-4">
                 <h2 className="text-4xl font-black uppercase italic tracking-tight">Quy trình chuyên nghiệp</h2>
                 <p className="text-[11px] text-gray-500 uppercase font-bold tracking-widest">Ý tưởng → Phân cảnh → Tổng hợp → Thành phẩm</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 {[
                   { label: 'Uplink', desc: 'Nhập nội dung câu chuyện tự nhiên.', icon: <AlignLeft /> },
                   { label: 'Decompose', desc: 'Tự động phân tách thành các cảnh quay.', icon: <LayoutGrid /> },
                   { label: 'Anchor', desc: 'Khóa nhân vật và bối cảnh nhất quán.', icon: <Fingerprint /> },
                   { label: 'Orchestrate', desc: 'Kết xuất thành dòng chảy phim hoàn thiện.', icon: <Workflow /> }
                 ].map((step) => (
                    <div key={step.label} className="space-y-6 group">
                       <div className="w-16 h-16 mx-auto rounded-full bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                          {React.cloneElement(step.icon as React.ReactElement<any>, { size: 24 })}
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-lg font-bold uppercase tracking-tight">{step.label}</h4>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight opacity-70 leading-relaxed">{step.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* --- TÍNH NĂNG CỐT LÕI --- */}
        <section className="py-24">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              {[
                { title: 'Phân tích ngữ nghĩa', icon: <BookOpen />, desc: 'Hiểu sâu sắc ý đồ câu chuyện, không chỉ là từ khóa máy móc.' },
                { title: 'Nhất quán nhân vật', icon: <Fingerprint />, desc: 'Khóa chặt đặc điểm nhân vật xuyên suốt hàng trăm khung hình.' },
                { title: 'Điều khiển theo nhịp', icon: <Sliders />, desc: 'Tùy chỉnh nhịp độ và tiêu điểm cho từng phân đoạn nhỏ nhất.' },
                { title: 'Giao diện Đạo diễn', icon: <Settings2 />, desc: 'Điều khiển trực quan, loại bỏ hoàn toàn các prompt phức tạp.' },
                { title: 'Chỉnh sửa cục bộ', icon: <RefreshCw />, desc: 'Thay đổi một phân cảnh mà không làm ảnh hưởng toàn bộ mạch phim.' },
                { title: 'Xuất bản 4K', icon: <MonitorPlay />, desc: 'Kết xuất video chất lượng cao nhất cho các dự án thương mại.' }
              ].map(f => (
                <div key={f.title} className="p-12 bg-white dark:bg-[#0a0a0c] space-y-6 hover:bg-brand-blue/[0.02] transition-all duration-500 group">
                   <div className="w-10 h-10 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all">
                      {React.cloneElement(f.icon as React.ReactElement<any>, { size: 20 })}
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-xl font-bold uppercase tracking-tight italic">{f.title}</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-tight opacity-60">"{f.desc}"</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* --- KÊU GỌI HÀNH ĐỘNG --- */}
        <section className="py-40 text-center">
           <div className="space-y-12 max-w-4xl mx-auto">
              <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic">
                Write. <span className="text-brand-blue">Director.</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-brand-blue text-white px-16 py-7 text-xs font-bold uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all rounded-sm">
                    Trải nghiệm Studio ngay
                 </button>
                 <Link to="/booking" className="px-16 py-7 border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white text-xs font-bold uppercase tracking-widest transition-all rounded-sm italic">
                    Tư vấn giải pháp B2B
                 </Link>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

export default SequenceProduct;
