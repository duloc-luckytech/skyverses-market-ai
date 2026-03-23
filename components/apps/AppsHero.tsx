
import React from 'react';
import { motion } from 'framer-motion';
import { Blocks, ArrowRight } from 'lucide-react';

export const AppsHero: React.FC = () => {
  return (
    <section className="relative py-16 lg:py-24 px-4 md:px-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-brand-blue/[0.04] to-transparent dark:from-brand-blue/[0.08] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto text-center relative z-10 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/8 dark:bg-brand-blue/15 border border-brand-blue/15 dark:border-brand-blue/25 rounded-full"
        >
          <Blocks size={14} className="text-brand-blue" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue">App Ecosystem</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]"
        >
          Hệ sinh thái{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-500">
            ứng dụng AI
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="text-base md:text-lg text-slate-400 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed"
        >
          Khám phá các ứng dụng AI chuyên dụng — từ sáng tạo nội dung, tự động hoá quy trình đến hạ tầng kỹ thuật.
        </motion.p>
      </div>
    </section>
  );
};
