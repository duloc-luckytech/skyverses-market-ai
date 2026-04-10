import React from 'react';
import { Palette, ChevronRight } from 'lucide-react';

interface StyleGuideChipsProps {
  format: string;
  style: string;
  culture: string;
  onOpenAestheticModal: () => void;
}

export const StyleGuideChips: React.FC<StyleGuideChipsProps> = ({
  format,
  style,
  culture,
  onOpenAestheticModal,
}) => {
  const chips = [
    { label: format,  color: 'bg-brand-blue/20 text-brand-blue border-brand-blue/40' },
    { label: style,   color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { label: culture, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  ].filter(c => !!c.label);

  return (
    <div className="px-5 py-4 border-b border-white/8 space-y-2.5">
      {/* Header */}
      <button
        onClick={onOpenAestheticModal}
        className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors group"
      >
        <span className="flex items-center gap-1.5">
          <Palette size={12} />
          Style Guide
        </span>
        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Chips */}
      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {chips.map(chip => (
            <button
              key={chip.label}
              onClick={onOpenAestheticModal}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all hover:scale-105 active:scale-95 ${chip.color}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={onOpenAestheticModal}
          className="text-[10px] text-white/25 italic hover:text-white/50 transition-colors"
        >
          Chưa cấu hình — Click để thiết lập
        </button>
      )}
    </div>
  );
};
