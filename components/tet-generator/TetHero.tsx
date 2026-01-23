
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Flower2, Gift, Camera, Star, Zap, ArrowRight } from 'lucide-react';

interface TetHeroProps {
  onStartStudio: () => void;
}

const FEATURES = [
  { label: 'ÁO DÀI TRUYỀN THỐNG', icon: <Gift size={16}/>, desc: 'Đa dạng mẫu mã' },
  { label: 'HOA MAI & ĐÀO', icon: <Flower2 size={16}/>, desc: 'Sắc xuân rạng rỡ' },
  { label: 'CHẤT LƯỢNG 8K', icon: <Camera size={16}/>, desc: 'Độ nét tối đa' },
  { label: 'CÔNG NGHỆ FACE-SYNC', icon: <Star size={16}/>, desc: 'Nhất quán gương mặt' }
];

export const TetHero: React.FC<TetHeroProps> = ({ onStartStudio }) => {
  return (
    <div className="lg:col-span-6 space-y-12">
      <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors tracking-[0.4em]">
        <ChevronLeft size={14} /> Quay lại cửa hàng
      </Link>
      
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-5 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-600 dark:text-red-400 text-[11px] font-black uppercase tracking-[0.3em] italic"
        >
          <Flower2 size={14} className="animate-pulse" /> Studio Ảnh Tết Giáp Thìn
        </motion.div>

        <div className="space-y-6">
          <h1 className="text-7xl lg:text-[110px] font-black leading-[0.8] tracking-tighter italic uppercase text-slate-900 dark:text-white transition-all">
            AI <span className="text-red-600">Tết</span> <br /> <span className="text-amber-500">Studio.</span>
          </h1>
          <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-red-500 pl-8 max-w-2xl italic">
            “Kỷ niệm ngày Tết truyền thống trong không gian nghệ thuật AI hiện đại. Biến mọi khoảnh khắc thành tác phẩm sắc xuân rực rỡ.”
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {FEATURES.map(item => (
           <div key={item.label} className="p-5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col gap-3 group hover:border-red-500/30 transition-all shadow-sm">
              <div className="text-red-500 group-hover:scale-110 transition-transform">{item.icon}</div>
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
          className="bg-red-600 text-white px-16 py-8 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group"
        >
          Vào Studio Tết <Zap size={22} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
};
