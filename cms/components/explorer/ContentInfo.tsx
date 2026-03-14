
import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

interface ContentInfoProps {
  title: string;
  description?: string;
  prompt?: string;
}

const ContentInfo: React.FC<ContentInfoProps> = ({ title, description, prompt }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Tiêu đề & Mô tả */}
      <div className="space-y-4">
         <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white leading-tight">
           {title}
         </h2>
         {description && (
           <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-brand-blue pl-4 py-1">
             "{description}"
           </p>
         )}
      </div>

      {/* Khu vực Prompt */}
      {prompt && (
        <div className="space-y-4 p-6 bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl relative group overflow-hidden transition-colors shadow-inner">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue opacity-50"></div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <Terminal size={14} className="text-brand-blue" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500">Kịch bản (Prompt)</h4>
            </div>
            <button 
              onClick={handleCopyPrompt}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
                isCopied 
                ? 'bg-emerald-500 text-white' 
                : 'bg-white dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:bg-brand-blue hover:text-white'
              }`}
            >
              {isCopied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
              {isCopied ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP'}
            </button>
          </div>
          <p className="text-[14px] leading-relaxed text-slate-700 dark:text-gray-300 font-medium italic selection:bg-brand-blue/30 line-clamp-6 group-hover:line-clamp-none transition-all duration-500">
            {prompt}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentInfo;
