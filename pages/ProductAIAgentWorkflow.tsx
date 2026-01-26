import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, Terminal, 
  ShieldCheck, Cpu, Database, 
  X, Layers, Save, 
  Download, Share2, Plus, Sliders,
  Workflow, Target, FileJson, 
  ArrowRight, LayoutGrid, Sparkles,
  CheckCircle2, Clock, Shield, BarChart,
  // Added Activity and Maximize2 imports
  Activity, Maximize2
} from 'lucide-react';
import AetherFlowInterface from '../components/AetherFlowInterface';
import { useLanguage } from '../context/LanguageContext';

const ProductAIAgentWorkflow = () => {
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#050505] animate-in fade-in duration-500">
        <div className="h-full flex flex-col">
           <div className="h-16 border-b border-black/10 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Hệ thống xử lý kịch bản tự động</span>
             </div>
             <button onClick={() => setIsStudioOpen(false)} className="w-10 h-10 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-all">
                <X size={18} />
             </button>
          </div>
          <div className="flex-grow overflow-hidden">
             <AetherFlowInterface />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden transition-colors duration-500 pb-32">
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#10b98108_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        {/* HERO SECTION */}
        <section className="min-h-[80vh] flex flex-col justify-center py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-6">
                <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-emerald-500 transition-all rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md shadow-sm">
                  <ChevronLeft size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Trở về trang chủ</span>
                </Link>

                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-emerald-500">
                      <Workflow size={28} />
                      <span className="text-sm font-bold uppercase tracking-[0.2em]">Quy trình tự động hóa AI</span>
                   </div>
                   <h1 className="text-5xl lg:text-8xl font-extrabold tracking-tight leading-tight">
                     Tạo kịch bản <br /> <span className="text-emerald-500">vận hành AI.</span>
                   </h1>
                </div>
                
                <p className="text-lg lg:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                  Xây dựng và triển khai các quy trình sáng tạo hình ảnh chuyên nghiệp. Tối ưu hóa hiệu suất làm việc của đội ngũ thiết kế bằng công nghệ AI node-based tiên tiến.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-emerald-600 text-white px-10 py-5 rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                    Bắt đầu xây dựng quy trình <Zap size={18} fill="currentColor" />
                 </button>
                 <div className="flex flex-col justify-center px-4 border-l border-slate-200 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Hạ tầng H100</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tương thích Wan 2.2 Turbo</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-2xl rounded-3xl p-10 flex flex-col justify-between group">
                  <div className="space-y-6">
                    <div className="h-1.5 w-16 bg-emerald-500/40 rounded-full"></div>
                    <div className="space-y-6">
                       <div className="flex justify-between items-end border-b border-black/5 dark:border-white/10 pb-4">
                          <span className="text-xs font-bold text-slate-400 uppercase">Độ ổn định</span>
                          <span className="text-2xl font-bold text-emerald-500">99.9%</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-black/5 dark:border-white/10 pb-4">
                          <span className="text-xs font-bold text-slate-400 uppercase">Tốc độ xử lý</span>
                          <span className="text-2xl font-bold text-emerald-500">Real-time</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-black/5 dark:border-white/10 pb-4">
                          <span className="text-xs font-bold text-slate-400 uppercase">Model mặc định</span>
                          <span className="text-xl font-bold text-emerald-500">Wan 2.2</span>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Hệ thống vận hành</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Kiến trúc Node-Based</h3>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="py-24 border-t border-slate-100 dark:border-white/5">
           <div className="text-center mb-20 space-y-4">
              <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">Tính năng cốt lõi</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Mọi công cụ bạn cần để quản lý và tự động hóa quy trình sản xuất nội dung hình ảnh chất lượng cao.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Quản lý quy trình linh hoạt', icon: <Layers className="text-blue-500" />, desc: 'Sử dụng hệ thống Node để kết nối các bước tạo ảnh, lọc và xử lý hậu kỳ một cách trực quan.' },
                { title: 'Nhất quán dữ liệu', icon: <Database className="text-emerald-500" />, desc: 'Duy trì đặc điểm nhân vật và phong cách hình ảnh xuyên suốt các phiên làm việc khác nhau.' },
                { title: 'Xử lý tốc độ cao', icon: <Cpu className="text-orange-500" />, desc: 'Tích hợp mô hình Wan 2.2 Turbo mới nhất cho phép tạo hình ảnh chất lượng cao trong vài giây.' },
                { title: 'Sản xuất hàng loạt', icon: <LayoutGrid className="text-purple-500" />, desc: 'Tự động hóa việc tạo ra hàng trăm biến thể hình ảnh chỉ với một kịch bản duy nhất.' },
                { title: 'Bảo mật dữ liệu', icon: <ShieldCheck className="text-red-500" />, desc: 'Hệ thống vận hành trong môi trường riêng tư, đảm bảo bản quyền và dữ liệu của doanh nghiệp.' },
                { title: 'Xuất bản định dạng chuẩn', icon: <FileJson className="text-cyan-500" />, desc: 'Hỗ trợ xuất và nhập kịch bản quy trình dưới dạng tệp JSON để dễ dàng chia sẻ và tái sử dụng.' }
              ].map((f, i) => (
                <div key={i} className="p-10 bg-white dark:bg-[#08080a] border border-slate-100 dark:border-white/5 rounded-3xl space-y-6 hover:shadow-2xl transition-all duration-300">
                   <div className="w-14 h-14 bg-slate-50 dark:bg-white/[0.03] rounded-2xl flex items-center justify-center shadow-inner">
                      {f.icon}
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-xl font-bold">{f.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* --- PERFORMANCE SECTION --- */}
        <section className="py-24 border-t border-slate-100 dark:border-white/5">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                 <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Hiệu suất và <br /> <span className="text-emerald-500">độ tin cậy cao.</span></h2>
                 <div className="space-y-6">
                    {[
                      { l: 'Mô hình xử lý', v: 'Wan 2.2 / Flux / SDXL', icon: <Sparkles size={18} className="text-emerald-500"/> },
                      { l: 'Hạ tầng GPU', v: 'NVIDIA H100 Cluster', icon: <Activity size={18} className="text-emerald-500"/> },
                      { l: 'Độ phân giải hỗ trợ', v: 'Lên đến 4K (Ultra HD)', icon: <Maximize2 size={18} className="text-emerald-500"/> },
                      { l: 'Thời gian phản hồi', v: '< 5 giây cho mỗi tác vụ', icon: <Clock size={18} className="text-emerald-500"/> }
                    ].map(item => (
                       <div key={item.l} className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4 group">
                          <div className="flex items-center gap-3">
                             {item.icon}
                             <span className="text-sm font-bold text-slate-500">{item.l}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{item.v}</span>
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className="p-12 bg-emerald-500/5 border border-emerald-500/20 rounded-[3rem] relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Shield size={120} className="text-emerald-500" />
                 </div>
                 <div className="relative z-10 space-y-6">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                    <h3 className="text-3xl font-extrabold tracking-tight">Cam kết bảo mật</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Dữ liệu hình ảnh và quy trình kịch bản của bạn được xử lý trong môi trường độc lập. Chúng tôi cam kết không sử dụng dữ liệu của khách hàng để huấn luyện mô hình công cộng.
                    </p>
                    <ul className="space-y-3">
                       {['Mã hóa dữ liệu đầu cuối', 'Không lưu trữ kịch bản nhạy cảm', 'Quyền sở hữu tài sản 100%'].map(text => (
                         <li key={text} className="flex items-center gap-3 text-sm font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            {text}
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>
           </div>
        </section>

        {/* --- FINAL CALL TO ACTION --- */}
        <section className="py-40 text-center relative overflow-hidden bg-slate-900 rounded-[3rem] shadow-3xl mx-4">
           <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[200px] font-black text-white leading-none tracking-tighter select-none">
              WORKFLOW WORKFLOW
           </div>
           
           <div className="relative z-10 space-y-12 max-w-4xl mx-auto px-6">
              <h2 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
                Bắt đầu tự động hóa <br /> <span className="text-emerald-500">quy trình ngay hôm nay.</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl">
                 Giải phóng sức sáng tạo và tối ưu hóa thời gian sản xuất cho doanh nghiệp của bạn.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-emerald-500 text-white px-16 py-6 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-600 shadow-2xl transition-all">
                    Mở trình quản lý quy trình
                 </button>
                 <Link to="/booking" className="px-16 py-6 border border-white/20 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all">
                    Liên hệ tư vấn giải pháp
                 </Link>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default ProductAIAgentWorkflow;
