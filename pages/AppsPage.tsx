
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Sparkles, LayoutGrid, Rocket, Globe, 
  ShieldCheck, ArrowRight, Bot, 
  Terminal, Activity, Zap, X, 
  CheckCircle2, Cpu, Code2, Boxes,
  Orbit, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryButton: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border ${
      active 
      ? 'bg-brand-blue border-brand-blue text-white shadow-xl shadow-brand-blue/20' 
      : 'bg-white dark:bg-white/5 border-black/5 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    {label}
  </button>
);

const AppsPage = () => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [showApplyModal, setShowApplyModal] = useState(false);

  const categories = ['Tất cả', 'Video', 'Thiết kế', 'Tự động hóa', 'Âm thanh', '3D'];

  return (
    <div className="pt-24 min-h-screen bg-[#fcfcfd] dark:bg-[#030304] text-slate-900 dark:text-white font-sans transition-all duration-500 selection:bg-brand-blue/30 overflow-x-hidden pb-40">
      
      {/* 1. HERO SECTION */}
      <section className="relative py-20 lg:py-32 px-6 lg:px-12 overflow-hidden border-b border-black/5 dark:border-white/5">
        <div className="absolute inset-0 z-0 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[150px] animate-pulse"></div>
           <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12 relative z-10">
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-3 px-5 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[11px] font-black uppercase tracking-[0.4em] italic"
           >
              <Sparkles size={14} fill="currentColor" /> TRUNG TÂM SÁNG TẠO AI
           </motion.div>
           
           <div className="space-y-6">
             <motion.h1 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
               className="text-6xl lg:text-[120px] font-black uppercase tracking-tighter italic leading-[0.85]"
             >
               Kho Ứng Dụng <br /> <span className="text-brand-blue">Thông Minh.</span>
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
               className="text-lg lg:text-2xl text-slate-500 dark:text-gray-400 font-medium max-w-3xl mx-auto italic leading-relaxed"
             >
               “Nơi hội tụ những công cụ và giải pháp AI tiên tiến nhất, giúp tối ưu hóa quy trình làm việc và khai phá tiềm năng sáng tạo của bạn.”
             </motion.p>
           </div>
        </div>
      </section>

      {/* 2. COMING SOON SECTION */}
      <section className="py-32 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full justify-center pb-12 mb-12 border-b border-black/5 dark:border-white/5 opacity-50 pointer-events-none">
          {categories.map(cat => (
            <CategoryButton key={cat} label={cat} active={activeCategory === cat} onClick={() => {}} />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative w-full max-w-4xl aspect-[21/9] bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[3rem] shadow-3xl overflow-hidden flex flex-col items-center justify-center group"
        >
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, currentColor 1px, transparent 1px), linear-gradient(-45deg, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-[100px] animate-pulse"></div>

          <div className="relative z-10 text-center space-y-8 p-12">
            <div className="flex justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shadow-inner relative">
                 <div className="absolute inset-0 bg-brand-blue/20 blur-xl animate-ping rounded-full"></div>
                 <Orbit size={32} className="relative z-10 animate-spin-slow" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                Sắp <span className="text-brand-blue">Ra Mắt.</span>
              </h2>
              <p className="text-sm md:text-base text-slate-500 dark:text-gray-400 font-bold uppercase tracking-[0.4em] max-w-lg mx-auto leading-relaxed">
                CHÚNG TÔI ĐANG KIỂM DUYỆT NHỮNG ỨNG DỤNG TỐT NHẤT DÀNH CHO BẠN
              </p>
            </div>

            <div className="pt-6 flex justify-center">
              <div className="flex items-center gap-3 px-6 py-2.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
                <Activity size={14} className="text-emerald-500 animate-pulse" />
                Hệ thống sẵn sàng: 100%
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. DEVELOPER CTA SECTION */}
      <section className="py-40 bg-slate-50 dark:bg-[#08080a] relative overflow-hidden transition-colors duration-500">
         <div className="absolute right-0 top-0 opacity-10 translate-x-1/2 -translate-y-1/2">
            <Globe size={800} strokeWidth={0.5} className="text-brand-blue" />
         </div>

         <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
               <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                    className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[9px] font-black uppercase tracking-[0.3em] italic"
                  >
                    <Code2 size={12} /> DÀNH CHO NHÀ PHÁT TRIỂN
                  </motion.div>
                  <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Cùng xây dựng <br /> <span className="text-brand-blue">Tương lai.</span></h2>
                  <p className="text-xl text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic">
                    Chúng tôi đồng hành cùng các lập trình viên và studio sáng tạo để đưa những giải pháp AI đến gần hơn với cộng đồng.
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    { t: 'Hạ tầng mạnh mẽ', d: 'Truy cập tài nguyên tính toán GPU hiệu suất cao.', i: <Cpu /> },
                    { t: 'Tích hợp dễ dàng', d: 'Kết nối nhanh chóng qua các bộ SDK tiêu chuẩn.', i: <Terminal /> },
                    { t: 'Phân phối doanh thu', d: 'Mô hình chia sẻ lợi nhuận minh bạch và bền vững.', i: <Zap /> },
                    { t: 'Bảo mật dữ liệu', d: 'Môi trường phát triển riêng tư và an toàn tuyệt đối.', i: <ShieldCheck /> }
                  ].map((item, i) => (
                    <div key={i} className="space-y-3 group">
                       <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                          {React.cloneElement(item.i as React.ReactElement<any>, { size: 20 })}
                       </div>
                       <h4 className="text-sm font-black uppercase italic tracking-tight text-slate-800 dark:text-white">{item.t}</h4>
                       <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">"{item.d}"</p>
                    </div>
                  ))}
               </div>

               <button 
                 onClick={() => setShowApplyModal(true)}
                 className="px-16 py-6 bg-brand-blue text-white rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all"
               >
                 Gửi kịch bản ứng dụng
               </button>
            </div>

            <div className="relative group">
               <div className="absolute inset-0 bg-brand-blue/10 blur-[120px] rounded-full animate-pulse"></div>
               <div className="relative p-12 lg:p-20 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[3rem] shadow-3xl overflow-hidden transition-colors">
                  <div className="space-y-10 relative z-10">
                     <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Trình trạng ổn định</span>
                        <CheckCircle2 size={24} className="text-emerald-500" />
                     </div>
                     <div className="space-y-6">
                        <div className="h-2 w-3/4 bg-slate-100 dark:bg-white/5 rounded-full"></div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full"></div>
                        <div className="h-2 w-5/6 bg-slate-100 dark:bg-white/5 rounded-full"></div>
                        <div className="h-2 w-2/3 bg-slate-100 dark:bg-white/5 rounded-full"></div>
                     </div>
                     <div className="pt-10 flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10"></div>
                        <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/30"></div>
                        <div className="flex-grow"></div>
                        <Boxes size={48} className="text-slate-200 dark:text-gray-800" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* APPLY MODAL */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowApplyModal(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] border border-black/10 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col transition-colors"
            >
               <div className="p-8 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg"><Plus size={20} strokeWidth={3} /></div>
                     <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Hợp tác phát triển</h3>
                  </div>
                  <button onClick={() => setShowApplyModal(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
               </div>
               
               <div className="flex-grow overflow-y-auto p-10 space-y-8 no-scrollbar">
                  <div className="p-6 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl flex gap-6 items-start">
                     <Info className="text-brand-blue shrink-0 mt-1" size={20} />
                     <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase leading-relaxed italic">
                       Hãy mô tả giải pháp của bạn. Đội ngũ Skyverses sẽ xem xét và phản hồi cho bạn trong thời gian sớm nhất.
                     </p>
                  </div>

                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Đã gửi thông tin đăng ký thành công."); setShowApplyModal(false); }}>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-widest ml-2">Tên của bạn hoặc Studio</label>
                        <input required className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm font-bold outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white shadow-inner" placeholder="VD: Skyverses Team" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-widest ml-2">Email liên hệ</label>
                        <input required type="email" className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm font-bold outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white shadow-inner" placeholder="name@company.com" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-widest ml-2">Ý tưởng ứng dụng</label>
                        <input required className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm font-bold outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white shadow-inner" placeholder="VD: Công cụ tạo kịch bản phim AI" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-widest ml-2">Chi tiết về giải pháp</label>
                        <textarea required className="w-full h-32 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm font-medium outline-none focus:border-brand-blue transition-colors text-slate-800 dark:text-white resize-none shadow-inner" placeholder="Giải pháp của bạn mang lại giá trị gì?..." />
                     </div>
                     
                     <div className="pt-4">
                        <button type="submit" className="w-full py-5 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 group">
                           Gửi thông tin <ArrowRight size={18} />
                        </button>
                     </div>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-20 border-t border-black/5 dark:border-white/5 text-center transition-colors">
         <p className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-400 dark:text-gray-700">© 2025 SKYVERSES - HỆ SINH THÁI SÁNG TẠO AI</p>
      </footer>

      <style>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AppsPage;
