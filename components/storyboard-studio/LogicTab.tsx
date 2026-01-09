
import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Terminal, Settings, Loader2 } from 'lucide-react';

interface LogicTabProps {
  systemPrompt: string;
  setSystemPrompt: (v: string) => void;
}

export const LogicTab: React.FC<LogicTabProps> = ({ systemPrompt, setSystemPrompt }) => {
  return (
    <motion.div 
      key="tab-logic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-grow flex flex-col p-10 lg:p-20 overflow-y-auto no-scrollbar"
    >
      <div className="max-w-6xl mx-auto w-full space-y-16 pb-40">
         <div className="space-y-8">
            <div className="flex items-center gap-4 text-brand-blue">
               <Code2 size={24} />
               <h3 className="text-xl font-black uppercase tracking-widest italic">LOGIC KỊCH BẢN (SYSTEM PROMPT)</h3>
            </div>
            <div className="relative group">
               <textarea 
                 value={systemPrompt}
                 onChange={(e) => setSystemPrompt(e.target.value)}
                 className="w-full h-[400px] bg-white/[0.02] border border-white/10 p-10 font-mono text-sm leading-relaxed text-[#00ff41] outline-none focus:border-brand-blue/40 shadow-2xl transition-all rounded-xl"
               />
               <div className="absolute top-4 right-4"><Terminal size={20} className="text-white/20" /></div>
            </div>
         </div>

         <div className="p-10 bg-white/[0.01] border border-white/5 space-y-12 rounded-2xl">
            <div className="flex items-center gap-4 text-gray-500">
               <Settings size={20} />
               <h3 className="text-xl font-black uppercase tracking-widest italic">CÀI ĐẶT NÂNG CAO</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-gray-400">SỐ LẦN THỬ LẠI KHI LỖI</label>
                  <div className="flex items-center gap-4">
                     <input type="number" defaultValue={2} className="w-32 bg-white/[0.03] border border-white/10 p-4 text-xl font-black outline-none focus:border-brand-blue rounded-lg" />
                     <span className="text-xs text-gray-600 uppercase font-bold">lần</span>
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-gray-400">SỐ LUỒNG TỐI ĐA</label>
                  <div className="flex items-center gap-4">
                     <input type="number" defaultValue={5} className="w-32 bg-white/[0.03] border border-white/10 p-4 text-xl font-black outline-none focus:border-brand-blue rounded-lg" />
                     <span className="text-xs text-gray-600 uppercase font-bold">luồng</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
};
