
import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

export const AssetsTab: React.FC = () => {
  return (
    <motion.div 
      key="tab-assets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="flex-grow flex flex-col p-6 lg:p-20 overflow-y-auto no-scrollbar bg-white dark:bg-[#050506]"
    >
       <div className="max-w-6xl mx-auto w-full space-y-8 pb-32 lg:pb-0">
          <h2 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Thư viện tài nguyên</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="aspect-square bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl lg:rounded-2xl flex items-center justify-center">
                <ImageIcon size={24} className="opacity-10 lg:w-8 lg:h-8" />
              </div>
            ))}
          </div>
       </div>
    </motion.div>
  );
};
