
import React from 'react';
import { Coins, Zap, MailCheck, ShieldCheck, Activity } from 'lucide-react';

const plans = [
  { 
    name: 'Gói Dùng Thử', 
    tokens: '10', 
    latency: '350ms', 
    price: '0', 
    unit: 'VNĐ',
    popular: false,
    note: 'Cần xác thực email',
    features: ['Hỗ trợ v2/v3', 'Hỗ trợ cơ bản', 'Tài nguyên chia sẻ']
  },
  { 
    name: 'Gói Cơ Bản', 
    tokens: '2,000', 
    latency: '242ms', 
    price: '100.000', 
    unit: 'VNĐ',
    popular: false,
    note: 'Kích hoạt tức thì',
    features: ['Ưu tiên xử lý', 'Mọi loại Captcha', 'Truy cập API']
  },
  { 
    name: 'Gói Chuyên Nghiệp', 
    tokens: '6,000', 
    latency: '180ms', 
    price: '250.000', 
    unit: 'VNĐ',
    popular: true,
    note: 'Dành cho doanh nghiệp',
    features: ['Độ trễ siêu thấp', 'Xử lý hàng loạt', 'Hệ thống riêng biệt']
  },
];

export const PricingMatrix: React.FC = () => {
  return (
    <section className="mt-32 border-t border-black/5 dark:border-white/5 pt-20">
       <div className="text-center space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] italic mb-2">
             <Zap size={12} fill="currentColor" /> Biểu phí dịch vụ
          </div>
          <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white">Gói cước <span className="text-indigo-600">Token.</span></h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-[0.5em] italic leading-none">Mô hình giá linh hoạt theo nhu cầu quy mô</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map(plan => (
            <div key={plan.name} className={`p-10 lg:p-14 bg-white dark:bg-[#0d0d0f] border-2 rounded-[2.5rem] flex flex-col justify-between transition-all duration-500 group relative overflow-hidden shadow-sm ${plan.popular ? 'border-indigo-600 shadow-2xl scale-105 z-10' : 'border-black/5 dark:border-white/5 opacity-80 hover:opacity-100 hover:border-black/10'}`}>
               
               {plan.popular && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white px-8 py-2 text-[8px] font-black uppercase tracking-widest rounded-bl-2xl shadow-xl italic z-20">ĐƯỢC ĐỀ XUẤT</div>
               )}

               <div className="space-y-10 text-left relative z-10">
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] italic leading-none">Phân hạng gói</p>
                        {plan.name === 'Gói Dùng Thử' && (
                           <div className="flex items-center gap-1 text-orange-500 animate-pulse">
                              <MailCheck size={12} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Xác thực Email</span>
                           </div>
                        )}
                     </div>
                     <h4 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">{plan.name}</h4>
                  </div>

                  <div className="py-8 border-y border-black/5 dark:border-white/5 space-y-6">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hạn ngạch Token</span>
                        <span className="text-2xl font-black italic text-indigo-600">{plan.tokens}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Độ trễ cam kết</span>
                        <span className="text-sm font-black italic text-emerald-500">{plan.latency}</span>
                     </div>
                     <div className="space-y-3 pt-2">
                        {plan.features.map(f => (
                           <div key={f} className="flex items-center gap-3">
                              <ShieldCheck size={14} className="text-indigo-500/40" />
                              <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">{f}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="text-center space-y-1">
                        <div className="flex items-center justify-center gap-3 text-4xl lg:text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">
                           {plan.price} <span className="text-xs not-italic text-gray-400 tracking-normal">{plan.unit}</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{plan.note}</p>
                     </div>
                     
                     <button className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all shadow-xl active:scale-[0.95] relative overflow-hidden group/btn ${plan.popular ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-slate-100 dark:bg-white/5 text-gray-500 border border-black/5 dark:border-white/10 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'}`}>
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                        <span className="relative z-10">Đăng ký sử dụng</span>
                     </button>
                  </div>
               </div>

               {/* Background Watermark */}
               <div className="absolute -bottom-4 -right-4 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-[3s]">
                  <Activity size={180} />
               </div>
            </div>
          ))}
       </div>
    </section>
  );
};
