
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, Image as ImageIcon,
  Globe, ChevronDown, Paperclip, X, FileText,
} from 'lucide-react';
import {
  SLIDE_STYLES, SLIDE_COUNT_OPTIONS,
  StylePreset,
} from '../../hooks/useSlideStudio';
import { useDocxImport } from '../../hooks/useDocxImport';
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
  const docxFileRef = React.useRef<HTMLInputElement>(null);
  const { parseDocx } = useDocxImport();
  const [isDocxLoading, setIsDocxLoading] = React.useState(false);

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

  const handleDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDocxLoading(true);
    try {
      const outline = await parseDocx(file);
      
      // Set slide count based on number of slides in DOCX
      const count = Math.min(Math.max(outline.length, 4), 12); // Clamp between 4-12
      setSlideCount(count);
      
      // Set deck topic from outline titles
      const titles = outline.map(o => o.title).join(', ');
      setDeckTopic(titles);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi nhập DOCX';
      alert(`Failed to import DOCX: ${message}`);
    } finally {
      setIsDocxLoading(false);
      // Reset file input
      if (docxFileRef.current) {
        docxFileRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-80 h-full flex flex-col bg-white dark:bg-[#1a1a1e] border-r border-black/[0.05] dark:border-white/[0.05] overflow-y-auto">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.05]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
          ⚙️ Slide Studio Settings
        </p>
      </div>

      {/* ── Section: Topic ────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1.5">
          📝 Chủ đề Deck
        </label>
        <textarea
          value={deckTopic}
          onChange={(e) => setDeckTopic(e.target.value)}
          placeholder="Nhập chủ đề bản trình chiếu..."
          className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[11px] placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-brand-blue/40 resize-none h-20 text-slate-900 dark:text-white"
        />
        <div className="mt-2 space-y-1">
          {FEATURED_TEMPLATES.slice(0, 2).map(t => (
            <button
              key={t.label}
              onClick={() => setDeckTopic(t.prompt)}
              className="w-full text-left px-2 py-1 text-[9px] rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white/60 transition-colors"
            >
              💡 {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section: Slide Count ──────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1.5">
          📊 Số lượng Slide
        </label>
        <div className="grid grid-cols-5 gap-2">
          {SLIDE_COUNT_OPTIONS.map(count => (
            <button
              key={count}
              onClick={() => setSlideCount(count)}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                slideCount === count
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section: Style ────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1.5">
          🎨 Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SLIDE_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setDeckStyle(style.id)}
              className={`px-2.5 py-2 rounded-lg text-[9px] font-semibold transition-all ${
                deckStyle === style.id
                  ? 'bg-brand-blue/20 border border-brand-blue/50 text-brand-blue'
                  : 'bg-slate-100 dark:bg-white/5 border border-transparent text-slate-700 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {style.emoji} {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section: Language ─────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1.5">
          🌐 Ngôn ngữ
        </label>
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[11px] font-medium text-slate-700 dark:text-white/80 flex items-center justify-between hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <span>{currentLang.flag} {currentLang.label}</span>
            <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#252530] border border-black/[0.08] dark:border-white/[0.08] rounded-lg shadow-lg z-10 overflow-hidden"
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.value}
                    onClick={() => {
                      setDeckLanguage(lang.value);
                      setLangOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-[11px] font-medium transition-colors ${
                      deckLanguage === lang.value
                        ? 'bg-brand-blue/10 text-brand-blue'
                        : 'text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Section: Reference Images ────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1.5">
          🖼️ Ảnh tham chiếu (tuỳ chọn)
        </label>
        <div className="flex gap-2 flex-wrap">
          {refImages.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`ref-${i}`}
                className="w-14 h-14 rounded-lg object-cover border border-black/[0.08] dark:border-white/[0.08]"
              />
              <button
                onClick={() => setRefImages(refImages.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* ── Section: Import DOCX ───────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1.5">
          📄 Import DOCX Outline (tuỳ chọn)
        </label>
        <button
          onClick={() => docxFileRef.current?.click()}
          disabled={isDocxLoading}
          className="w-full py-2 rounded-xl border-2 border-dashed border-brand-blue/40 text-brand-blue text-[11px] font-medium hover:bg-brand-blue/[0.05] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isDocxLoading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <FileText size={12} />
              Tải DOCX Outline
            </>
          )}
        </button>
        <input
          ref={docxFileRef}
          type="file"
          accept=".docx"
          onChange={handleDocxImport}
          disabled={isDocxLoading}
          className="hidden"
        />
        <p className="text-[9px] text-slate-400 dark:text-white/20 mt-1">Tệp DOCX được phân tích từng heading → slide titles</p>
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
