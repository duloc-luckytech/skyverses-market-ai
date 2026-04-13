
import React, { useRef } from 'react';
import { Plus, Loader2, X, Bot, RefreshCw } from 'lucide-react';
import { Slide } from '../../hooks/useSlideStudio';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  slide: Slide | null;
  onUpdateSlide: (id: string, patch: Partial<Slide>) => void;
  onGenSlideBg: (id: string) => void;
  onAISuggest: (id: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const SlidePromptBar: React.FC<Props> = ({
  slide,
  onUpdateSlide,
  onGenSlideBg,
  onAISuggest,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  if (!slide) return null;

  const images = slide.slideRefImages ?? [];

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      onUpdateSlide(slide.id, { slideRefImages: [...images.slice(0, 1), url] });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = (idx: number) => {
    onUpdateSlide(slide.id, { slideRefImages: images.filter((_, i) => i !== idx) });
  };

  return (
    <div className="shrink-0 px-3 py-2 bg-white dark:bg-[#111] border-t-2 border-black/[0.07] dark:border-white/[0.07]">

      {/* ── Inner framed row ── */}
      <div className="flex items-center gap-2 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.04] shadow-sm px-3 h-10 focus-within:border-brand-blue/50 focus-within:ring-2 focus-within:ring-brand-blue/10 transition-all">

        {/* ── Ref images ── */}
        <div className="flex items-center gap-1 shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleRemoveImage(i)}
              title="Xoá ảnh tham chiếu"
              className="relative w-6 h-6 rounded-md overflow-hidden border border-black/10 dark:border-white/10 group shrink-0"
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <X size={9} className="text-white" />
              </div>
            </button>
          ))}

          {images.length < 2 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title="Thêm ảnh tham chiếu"
              className="w-6 h-6 rounded-md border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center text-slate-400 dark:text-white/30 hover:text-brand-blue hover:border-brand-blue/50 transition-colors shrink-0"
            >
              <Plus size={10} />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAddImage} className="hidden" />
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-black/[0.08] dark:bg-white/[0.08] shrink-0" />

        {/* ── Prompt input ── */}
        <input
          type="text"
          value={slide.bgPrompt ?? ''}
          onChange={(e) => onUpdateSlide(slide.id, { bgPrompt: e.target.value })}
          placeholder="Mô tả hình nền AI cho slide này..."
          className="flex-1 min-w-0 text-[12px] bg-transparent text-slate-700 dark:text-white/80 placeholder-slate-400 dark:placeholder-white/30 outline-none font-medium"
        />

        {/* Divider */}
        <div className="w-px h-5 bg-black/[0.08] dark:bg-white/[0.08] shrink-0" />

        {/* ── AI Gợi ý ── */}
        <button
          type="button"
          onClick={() => onAISuggest(slide.id)}
          disabled={slide.isSuggestLoading}
          title="AI gợi ý nội dung slide"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] font-bold hover:bg-violet-500/20 active:scale-95 transition-all disabled:opacity-40 shrink-0 border border-violet-300/30 dark:border-violet-500/20"
        >
          {slide.isSuggestLoading
            ? <Loader2 size={11} className="animate-spin" />
            : <Bot size={11} />
          }
          <span className="hidden sm:inline">Gợi ý</span>
        </button>

        {/* ── Gen BG ── */}
        <button
          type="button"
          onClick={() => onGenSlideBg(slide.id)}
          disabled={slide.bgStatus === 'generating'}
          title="Tạo hình nền AI cho slide này"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-blue text-white text-[11px] font-bold hover:bg-brand-blue/90 active:scale-95 transition-all disabled:opacity-50 shrink-0 shadow-sm shadow-brand-blue/20"
        >
          {slide.bgStatus === 'generating'
            ? <Loader2 size={11} className="animate-spin" />
            : <RefreshCw size={11} />
          }
          <span className="hidden sm:inline">
            {slide.bgStatus === 'generating' ? 'Đang gen...' : 'Gen BG'}
          </span>
        </button>

      </div>
    </div>
  );
};

export default SlidePromptBar;
