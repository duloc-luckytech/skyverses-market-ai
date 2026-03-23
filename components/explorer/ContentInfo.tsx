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
    <div className="space-y-5">
      {/* Title & Description */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-400 dark:text-gray-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Prompt Section */}
      {prompt && (
        <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2.5 border-b border-black/[0.04] dark:border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Terminal size={13} className="text-brand-blue" />
              <span className="text-[12px] font-medium text-slate-500 dark:text-gray-400">Prompt</span>
            </div>
            <button 
              onClick={handleCopyPrompt}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                isCopied 
                ? 'bg-emerald-500/10 text-emerald-600' 
                : 'text-slate-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-slate-600 dark:hover:text-white'
              }`}
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
              {isCopied ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>
          <div className="p-4">
            <p className="text-[13px] leading-relaxed text-slate-600 dark:text-gray-300 selection:bg-brand-blue/20 line-clamp-6 hover:line-clamp-none transition-all cursor-text">
              {prompt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentInfo;
