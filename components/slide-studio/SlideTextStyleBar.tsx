
import React from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Minus, Plus } from 'lucide-react';
import { TextStyle } from '../../hooks/useSlideStudio';

// ── Available fonts (loaded via Google Fonts in index.html) ───────────────────
export const SLIDE_FONTS = [
  { label: 'Inter',       value: 'Inter, sans-serif' },
  { label: 'Montserrat',  value: 'Montserrat, sans-serif' },
  { label: 'Poppins',     value: 'Poppins, sans-serif' },
  { label: 'Roboto',      value: 'Roboto, sans-serif' },
  { label: 'Playfair',    value: '"Playfair Display", serif' },
  { label: 'Merriweather',value: 'Merriweather, serif' },
  { label: 'Georgia',     value: 'Georgia, serif' },
  { label: 'Bebas Neue',  value: '"Bebas Neue", sans-serif' },
  { label: 'Oswald',      value: 'Oswald, sans-serif' },
];

export const TITLE_SIZES  = [24, 28, 32, 36, 40, 48, 56, 64, 72, 80];
export const BODY_SIZES   = [12, 14, 16, 18, 20, 24, 28, 32];

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  /** Which text block is being styled — 'title' or 'body' */
  target: 'title' | 'body';
  style: TextStyle;
  onChange: (patch: Partial<TextStyle>) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const SlideTextStyleBar: React.FC<Props> = ({ target, style, onChange }) => {
  const sizes = target === 'title' ? TITLE_SIZES : BODY_SIZES;
  const currentSize = style.fontSize ?? (target === 'title' ? 40 : 18);

  const decreaseSize = () => {
    const idx = sizes.indexOf(currentSize);
    if (idx > 0) onChange({ fontSize: sizes[idx - 1] });
  };
  const increaseSize = () => {
    const idx = sizes.indexOf(currentSize);
    if (idx < sizes.length - 1) onChange({ fontSize: sizes[idx + 1] });
  };

  const isBold   = style.fontWeight === 'bold' || style.fontWeight === '900';
  const isItalic = style.fontStyle === 'italic';

  return (
    <div className="flex items-center gap-1 h-8 bg-white dark:bg-[#1a1a1e] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-2 shadow-lg shadow-black/10 flex-wrap">

      {/* Font family */}
      <select
        value={style.fontFamily ?? SLIDE_FONTS[0].value}
        onChange={e => onChange({ fontFamily: e.target.value })}
        className="text-[10px] font-medium bg-transparent text-slate-700 dark:text-white/70 outline-none border-none cursor-pointer max-w-[88px] truncate"
        style={{ fontFamily: style.fontFamily }}
      >
        {SLIDE_FONTS.map(f => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
            {f.label}
          </option>
        ))}
      </select>

      <div className="w-px h-4 bg-black/[0.08] dark:bg-white/[0.08] shrink-0" />

      {/* Font size stepper */}
      <button onClick={decreaseSize} className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors">
        <Minus size={9} />
      </button>
      <span className="text-[10px] font-bold text-slate-700 dark:text-white/80 w-6 text-center select-none tabular-nums">
        {currentSize}
      </span>
      <button onClick={increaseSize} className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors">
        <Plus size={9} />
      </button>

      <div className="w-px h-4 bg-black/[0.08] dark:bg-white/[0.08] shrink-0" />

      {/* Bold */}
      <button
        onClick={() => onChange({ fontWeight: isBold ? 'normal' : 'bold' })}
        title="Bold"
        className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
          isBold ? 'bg-brand-blue/15 text-brand-blue' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
        }`}
      >
        <Bold size={10} />
      </button>

      {/* Italic */}
      <button
        onClick={() => onChange({ fontStyle: isItalic ? 'normal' : 'italic' })}
        title="Italic"
        className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
          isItalic ? 'bg-brand-blue/15 text-brand-blue' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
        }`}
      >
        <Italic size={10} />
      </button>

      <div className="w-px h-4 bg-black/[0.08] dark:bg-white/[0.08] shrink-0" />

      {/* Alignment */}
      {(['left', 'center', 'right'] as const).map(align => {
        const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
        const isActive = (style.textAlign ?? 'center') === align;
        return (
          <button
            key={align}
            onClick={() => onChange({ textAlign: align })}
            title={`Căn ${align}`}
            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
              isActive ? 'bg-brand-blue/15 text-brand-blue' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
            }`}
          >
            <Icon size={10} />
          </button>
        );
      })}

      {/* Label */}
      <div className="ml-1 flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-300 dark:text-white/20">
        <Type size={8} />
        {target === 'title' ? 'Tiêu đề' : 'Nội dung'}
      </div>
    </div>
  );
};

export default SlideTextStyleBar;
