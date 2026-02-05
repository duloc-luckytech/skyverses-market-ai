import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Sparkles } from 'lucide-react';

interface SidebarSingleProps {
  prompt: string;
  setPrompt: (v: string) => void;
}

export const SidebarSingle: React.FC<SidebarSingleProps> = ({ prompt, setPrompt }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.3em] flex items-center gap-2">
            <Terminal size={14} className="text-brand-blue" /> Kịch bản (Prompt)
          </label>
          <div className="flex items-center gap-1.5 text-[8px] font-mono text-brand-blue/60 uppercase">
            <div className="w-1 h-1 rounded-full bg-brand-blue animate-pulse"></div>
            Direct_Inference
          </div>
        </div>
        
        <div className="relative group">
          <textarea 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)}
            className="w-full h-44 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-5 text-sm font-medium focus:border-brand-blue/40 outline-none transition-all resize-none text-slate-800 dark:text-white shadow-inner leading-relaxed"
            placeholder="Mô tả hình ảnh bạn muốn kiến tạo... (Ví dụ: Một phi hành gia đứng giữa rừng hoa neon dưới ánh trăng tím)"
          />
          <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none group-focus-within:opacity-30 transition-opacity">
            <Sparkles size={24} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};