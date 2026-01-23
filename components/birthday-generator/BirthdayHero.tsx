
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Cake, Gift, Camera, Star, Zap, ArrowRight } from 'lucide-react';

interface BirthdayHeroProps {
  onStartStudio: () => void;
}

const FEATURES = [
  { label: 'OUTFIT TIỆC TÙNG', icon: <Gift size={16}/>, desc: 'Hàng trăm phong cách' },
  { label: 'CONCEPT SÁNG TẠO', icon: <Cake size={16}/>, desc: 'Từ kỳ ảo đến hiện thực' },
  { label: 'CHẤT LƯỢNG 8K', icon: <Camera size={16}/>, desc: 'Độ nét in ấn thiệp' },
  { label: 'FACE LOCK PRO', icon: <Star size={16}/>, desc: 'Chính xác nhân dạng' }
];

export const BirthdayHero: React.FC<BirthdayHeroProps> = ({ onStartStudio }) => {
  return (
    <div className="lg:col-span-6 space-y-12">
      <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-purple-500 transition-colors tracking-[0.4em]">
        <ChevronLeft size={14} /> Quay lại cửa hàng
      </Link>
      
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-5 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-600 dark:text-purple-400 text-[11px] font-black uppercase tracking-[0.3em] italic"
        >
          <Cake size={14} className="animate-pulse" /> AI Birthday Photography Studio
        </motion.div>

        <div className="space-y-6">
          <h1 className="text-7xl lg:text-[110px] font-black leading-[0.8] tracking-tighter italic uppercase text-slate-900 dark:text-white transition-all">
            ẢNH SINH <br /> NHẬT <span className="text-purple-600">AI.</span>
          </h1>
          <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-purple-500 pl-8 max-w-2xl italic">
            “Kỷ niệm ngày đặc biệt của bạn theo cách chưa từng có. Biến mọi ý tưởng tiệc tùng thành những tác phẩm nghệ thuật kỹ thuật số đỉnh cao.”
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {FEATURES.map(item => (
           <div key={item.label} className="p-5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col gap-3 group hover:border-purple-500/30 transition-all shadow-sm">
              <div className="text-purple-500 group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{item.desc}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 pt-4">
        <button 
          onClick={onStartStudio}
          className="bg-purple-600 text-white px-16 py-8 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(147,51,234,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group"
        >
          Vào Studio Sinh Nhật <Zap size={22} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
};
