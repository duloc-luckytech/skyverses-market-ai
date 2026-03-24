import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';

interface SidebarSingleProps {
  prompt: string;
  setPrompt: (v: string) => void;
}

const QUICK_PROMPTS = [
  { emoji: '🏙️', text: 'A futuristic cyberpunk city at night, neon reflections, cinematic' },
  { emoji: '🎨', text: 'Fashion portrait, golden hour, bokeh, studio quality, 8K' },
  { emoji: '🌌', text: 'Dragon flying over mountains at sunset, epic fantasy, hyperrealistic' },
  { emoji: '📦', text: 'Premium product on marble, studio lighting, white background' },
];

export const SidebarSingle: React.FC<SidebarSingleProps> = ({ prompt, setPrompt }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
      <div className="flex justify-between items-center px-0.5">
        <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Prompt</p>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="flex items-center gap-1 text-[9px] font-medium text-rose-400/60 hover:text-rose-400 transition-colors"
        >
          <Sparkles size={10} /> Gợi ý
          <ChevronDown size={10} className={`transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <p className="text-[9px] text-slate-400 dark:text-slate-500 px-0.5 leading-relaxed">Mô tả chi tiết hình ảnh bạn muốn, bao gồm phong cách, ánh sáng, màu sắc, góc chụp.</p>

      {showSuggestions && (
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_PROMPTS.map((q, i) => (
            <button
              key={i}
              onClick={() => { setPrompt(q.text); setShowSuggestions(false); }}
              className="p-2 rounded-lg border border-black/[0.06] dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.015] hover:border-rose-500/20 text-left transition-all"
            >
              <span className="text-sm">{q.emoji}</span>
              <p className="text-[8px] text-slate-500 dark:text-[#666] mt-1 line-clamp-2 leading-relaxed">{q.text}</p>
            </button>
          ))}
        </div>
      )}

      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        className="w-full min-h-[100px] bg-slate-50 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-lg p-3 text-xs font-medium focus:border-rose-500/30 outline-none transition-all resize-y text-slate-800 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-[#333] leading-relaxed"
        placeholder="VD: Chân dung cô gái mặc áo dài trắng, nền vườn hoa sen, ánh sáng tự nhiên, phong cách nhiếp ảnh chân dung 8K..."
      />
    </motion.div>
  );
};