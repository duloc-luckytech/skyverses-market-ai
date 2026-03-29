
import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight, ShieldCheck, Clock, Zap } from 'lucide-react';

export const SubmissionHero: React.FC = () => {
  return (
    <section className="relative py-16 lg:py-24 px-4 md:px-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-brand-blue/[0.04] to-transparent dark:from-brand-blue/[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-500/[0.02] dark:bg-purple-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto text-center relative z-10 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/8 dark:bg-brand-blue/15 border border-brand-blue/15 dark:border-brand-blue/25 rounded-full"
        >
          <Rocket size={14} className="text-brand-blue" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue">Submit Your Product</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]"
        >
          Đưa sản phẩm vào{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-500">
            Skyverses Marketplace
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="text-sm md:text-base text-slate-400 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed"
        >
          Điền thông tin sản phẩm AI của bạn — đội ngũ Skyverses sẽ review và đưa sản phẩm lên Marketplace. 
          Tiếp cận hàng ngàn người dùng tiềm năng.
        </motion.p>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          {[
            { icon: <Clock size={12} />, text: 'Review trong 48h' },
            { icon: <ShieldCheck size={12} />, text: 'Miễn phí đăng ký' },
            { icon: <Zap size={12} />, text: '10,000+ Users' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-lg">
              <span className="text-brand-blue">{badge.icon}</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500">{badge.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
