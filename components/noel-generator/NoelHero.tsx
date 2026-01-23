
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Snowflake, Gift, Camera, Star, Zap, ArrowRight } from 'lucide-react';

interface NoelHeroProps {
  onStartStudio: () => void;
}

const FEATURES = [
  { label: 'CHỦ ĐỀ NOEL', icon: <Gift size={16}/>, desc: '30+ Mẫu kịch bản' },
  { label: 'HIỆU ỨNG TUYẾT', icon: <Snowflake size={16}/>, desc: 'Chân thực nhất' },
  { label: 'CHẤT LƯỢNG 4K', icon: <Camera size={16}/>, desc: 'Độ nét cực cao' },
  { label: 'KHÓA GƯƠNG MẶT', icon: <Star size={16}/>, desc: 'Giữ nguyên nhân dạng' }
];

export const NoelHero: React.FC<NoelHeroProps> = ({ onStartStudio }) => {
  return (
    <div className="lg:col-span-6 space-y-12">
      <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors tracking-[0.4em]">
        <ChevronLeft size={14} /> Quay lại cửa hàng
      </Link>
      
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-600 dark:text-rose-400 text-[11px] font-black uppercase tracking-[0.3em] italic"
        >
          <Snowflake size={14} className="animate-spin-slow" /> Studio Sáng tạo Giáng sinh
        </motion.div>

        <div className="space-y-6">
          <h1 className="text-7xl lg:text-[110px] font-black leading-[0.8] tracking-tighter italic uppercase text-slate-900 dark:text-white transition-all">
            AI <span className="text-rose-500">Noel</span> <br /> <span className="text-emerald-500">Studio.</span>
          </h1>
          <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-rose-500 pl-8 max-w-2xl italic">
            “Biến mọi ý tưởng Giáng sinh thành hiện thực 4K. Từ ông già Noel phong cách mới đến bối cảnh tuyết rơi huyền ảo.”
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {FEATURES.map(item => (
           <div key={item.label} className="p-5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col gap-3 group hover:border-rose-500/30 transition-all shadow-sm">
              <div className="text-rose-500 group-hover:scale-110 transition-transform">{item.icon}</div>
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
          className="bg-rose-600 text-white px-16 py-8 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(225,29,72,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group"
        >
          Vào Studio Noel <Zap size={22} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
};
