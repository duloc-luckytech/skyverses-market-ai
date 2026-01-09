
import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

export const AssetsTab: React.FC = () => {
  return (
    <motion.div 
      key="tab-assets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="flex-grow flex flex-col p-10 lg:p-20 overflow-y-auto no-scrollbar"
    >
       <div className="max-w-6xl mx-auto w-full space-y-8">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Thư viện tài nguyên</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-square bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center">
                <ImageIcon size={32} className="opacity-20" />
              </div>
            ))}
          </div>
       </div>
    </motion.div>
  );
};
