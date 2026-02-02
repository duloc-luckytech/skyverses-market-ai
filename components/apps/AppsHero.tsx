
import React from 'react';
import { motion } from 'framer-motion';
import { Orbit } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AppsHero: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative py-20 lg:py-32 px-6 lg:px-12 overflow-hidden border-b border-black/5 dark:border-white/5">
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[150px] animate-pulse"></div>
         <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      </div>

      <div className="max-w-[1600px] mx-auto flex flex-col items-center text-center space-y-12 relative z-10">
         <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-3 px-5 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[11px] font-black uppercase tracking-[0.4em] italic"
         >
            <Orbit size={14} className="animate-spin-slow" /> HỆ SINH THÁI ỨNG DỤNG AI
         </motion.div>
         
         <div className="space-y-6">
           <motion.h1 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
             className="text-6xl lg:text-[120px] font-black uppercase tracking-tighter italic leading-[0.85] text-slate-900 dark:text-white"
           >
             The <span className="text-brand-blue">App</span> Console.
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
             className="text-lg lg:text-2xl text-slate-500 dark:text-gray-400 font-medium max-w-3xl mx-auto italic leading-relaxed"
           >
             “Điều phối các nút mạng nơ-ron chuyên biệt cho sáng tạo, tự động hóa và hạ tầng kỹ thuật chuyên sâu.”
           </motion.p>
         </div>
      </div>
    </section>
  );
};
