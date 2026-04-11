
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, Image as ImageIcon,
  Globe, ChevronDown, Paperclip, X,
} from 'lucide-react';
import {
  SLIDE_STYLES, SLIDE_COUNT_OPTIONS,
  StylePreset,
} from '../../hooks/useSlideStudio';
import { Language } from '../../types';

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en', label: 'English',    flag: '🇺🇸' },
  { value: 'ko', label: '한국어',      flag: '🇰🇷' },
  { value: 'ja', label: '日本語',      flag: '🇯🇵' },
];

const FEATURED_TEMPLATES = [
  { label: 'Startup Pitch',         prompt: 'Pitch deck startup công nghệ, 8 slides, tối giản premium, navy + gold' },
  { label: 'Báo cáo doanh nghiệp', prompt: 'Business report Q3 2025, 6 slides, professional, xanh dương + trắng' },
  { label: 'Bài giảng đại học',    prompt: 'Bài giảng Machine Learning, 10 slides, educational, màu tươi dễ đọc' },
  { label: 'Marketing Campaign',   prompt: 'Marketing campaign Q4, 7 slides, vibrant colorful, social media focus' },
];

interface Props {
  deckTopic: string;
  setDeckTopic: (v: string) => void;
  deckStyle: string;
  setDeckStyle: (v: string) => void;
  deckLanguage: Language;
  setDeckLanguage: (v: Language) => void;
  slideCount: number;
  setSlideCount: (v: number) => void;
  refImages: string[];
  setRefImages: (v: string[]) => void;
  isGeneratingDeck: boolean;
  onOpenGenerateModal: () => void;
  onCancelGeneration: () => void;
}

const SlideSidebar: React.FC<Props> = ({
  deckTopic, setDeckTopic,
  deckStyle, setDeckStyle,
  deckLanguage, setDeckLanguage,
  slideCount, setSlideCount,
  refImages, setRefImages,
  isGeneratingDeck,
  onOpenGenerateModal,
  onCancelGeneration,
}) => {
  const [langOpen, setLangOpen] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const currentLang = LANGUAGES.find(l => l.value === deckLanguage) ?? LANGUAGES[0];

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setRefImages([...refImages, reader.result as string].slice(0, 3));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-[240px] shrink-0 flex flex-col h-full border-l border-black/[0.06] dark:border-white/[0.05] bg-white/60 dark:bg-[#0f0f11]/60 backdrop-blur overflow-y-auto">
      {/* ── Section: Chủ đề ─────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 block mb-2">
          Chủ đề / Topic
        </label>
        <textarea
          value={deckTopic}
          onChange={e => setDeckTopic(e.target.value)}
          placeholder="VD: Chiến lược marketing Q3, Startup pitch deck, Bài giảng AI..."
          rows={3}
          className="w-full text-[12px] bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-brand-blue/50 placeholder-slate-400 dark:placeholder-white/20 text-slate-700 dark:text-white/80 transition-colors"
        />

        {/* Featured templates */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FEATURED_TEMPLATES.map(t => (
            <button
              key={t.label}
              onClick={() => setDeckTopic(t.prompt)}
              className="px-2 py-1 rounded-md bg-black/[0.03] dark:bg-white/[0.03] text-[9px] font-medium text-slate-500 dark:text-white/40 border border-black/[0.05] dark:border-white/[0.05] hover:border-brand-blue/40 hover:text-brand-blue transition-all"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section: Số slides ───────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 block mb-2">
          Số slides
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {SLIDE_COUNT_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setSlideCount(n)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all
                ${slideCount === n
                  ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] text-slate-500 dark:text-white/40 hover:border-brand-blue/30 hover:text-brand-blue'
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section: Style ───────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 block mb-2">
          Phong cách
        </label>
        <div className="flex flex-col gap-1.5">
          {SLIDE_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setDeckStyle(style.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all
                ${deckStyle === style.id
                  ? 'bg-brand-blue/[0.08] border-brand-blue/30 text-brand-blue'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-600 dark:text-white/50 hover:border-brand-blue/20'
                }`}
            >
              <span className="text-base leading-none">{style.emoji}</span>
              <div>
                <p className="text-[11px] font-semibold leading-none mb-0.5">{style.label}</p>
                <p className="text-[9px] opacity-60">{style.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Section: Ngôn ngữ ────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 block mb-2">
          <Globe size={9} className="inline mr-1" />
          Ngôn ngữ
        </label>
        <div className="relative">
          <button
            onClick={() => setLangOpen(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 transition-all"
          >
            <span>{currentLang.flag} {currentLang.label}</span>
            <ChevronDown size={11} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.13 }}
                className="absolute top-full mt-1 left-0 right-0 z-50 bg-white dark:bg-[#1a1a1e] border border-black/[0.06] dark:border-white/[0.06] rounded-xl shadow-xl overflow-hidden"
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.value}
                    onClick={() => { setDeckLanguage(lang.value); setLangOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium transition-colors hover:bg-brand-blue/[0.06]
                      ${deckLanguage === lang.value ? 'text-brand-blue' : 'text-slate-600 dark:text-white/60'}`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Section: Ảnh tham chiếu ─────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 block mb-2">
          <Paperclip size={9} className="inline mr-1" />
          Ảnh tham chiếu (tuỳ chọn)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {refImages.map((img, i) => (
            <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-black/[0.06] dark:border-white/[0.06]">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setRefImages(refImages.filter((_, j) => j !== i))}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500"
              >
                <X size={9} />
              </button>
            </div>
          ))}
          {refImages.length < 3 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-14 h-14 rounded-lg border-2 border-dashed border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center hover:border-brand-blue/40 transition-colors"
            >
              <ImageIcon size={14} className="text-slate-400 dark:text-white/30" />
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleRefImageUpload} className="hidden" />
        <p className="text-[9px] text-slate-400 dark:text-white/20">Tối đa 3 ảnh — AI dùng làm tham chiếu style/brand</p>
      </div>

      {/* ── CTA: Generate Deck ───────────────────────────────────────────────── */}
      <div className="p-4 mt-auto">
        {isGeneratingDeck ? (
          <motion.button
            onClick={onCancelGeneration}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[12px] font-semibold hover:bg-red-500/20 transition-all"
          >
            <X size={14} />
            Hủy tạo
          </motion.button>
        ) : (
          <motion.button
            onClick={onOpenGenerateModal}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,144,255,0.25)' }}
            whileTap={{ scale: 0.97 }}
            disabled={!deckTopic.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-blue text-white text-[12px] font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Sparkles size={14} />
            Tạo toàn bộ Deck
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default SlideSidebar;
