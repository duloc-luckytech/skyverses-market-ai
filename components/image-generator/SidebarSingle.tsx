
import React from 'react';
import { Terminal } from 'lucide-react';

interface SidebarSingleProps {
  prompt: string;
  setPrompt: (v: string) => void;
}

export const SidebarSingle: React.FC<SidebarSingleProps> = ({ prompt, setPrompt }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest flex items-center gap-2">
          <Terminal size={14} className="text-brand-blue" /> Kịch bản (Prompt)
        </label>
        <textarea 
          value={prompt} onChange={e => setPrompt(e.target.value)}
          className="w-full h-40 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xs font-medium focus:border-brand-blue outline-none transition-all resize-none text-slate-800 dark:text-white shadow-inner"
          placeholder="Mô tả hình ảnh bạn muốn tạo..."
        />
      </div>
    </div>
  );
};
