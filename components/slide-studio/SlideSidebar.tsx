
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, Image as ImageIcon,
  Globe, ChevronDown, X, FileText,
  LayoutTemplate, Tag, Upload,
} from 'lucide-react';
import {
  SLIDE_STYLES, SLIDE_COUNT_OPTIONS,
} from '../../hooks/useSlideStudio';
import { useDocxImport, DocxOutline } from '../../hooks/useDocxImport';
import { useToast } from '../../context/ToastContext';
import { Language } from '../../types';

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en', label: 'English',    flag: '🇺🇸' },
  { value: 'ko', label: '한국어',      flag: '🇰🇷' },
  { value: 'ja', label: '日本語',      flag: '🇯🇵' },
];

interface Template {
  label: string;
  emoji: string;
  style: string;
  slideCount: number;
  language: Language;
  prompt: string;
}

const FEATURED_TEMPLATES: Template[] = [
  {
    label: 'Startup Pitch',
    emoji: '🚀',
    style: 'dark',
    slideCount: 8,
    language: 'en',
    prompt: 'Startup pitch deck for a tech company seeking Series A funding — problem, solution, market, team, traction',
  },
  {
    label: 'Báo cáo DN',
    emoji: '📊',
    style: 'corporate',
    slideCount: 6,
    language: 'vi',
    prompt: 'Báo cáo tổng kết kinh doanh quý 3 năm 2025 — kết quả, phân tích, kế hoạch',
  },
  {
    label: 'Bài giảng',
    emoji: '🎓',
    style: 'gradient',
    slideCount: 10,
    language: 'vi',
    prompt: 'Bài giảng Machine Learning cơ bản cho sinh viên đại học — khái niệm, thuật toán, ứng dụng',
  },
  {
    label: 'Marketing',
    emoji: '📣',
    style: 'creative',
    slideCount: 8,
    language: 'vi',
    prompt: 'Chiến dịch marketing Q4 cho sản phẩm mới — thị trường, chiến lược, KPIs, timeline',
  },
  {
    label: 'Product Launch',
    emoji: '✨',
    style: 'dark',
    slideCount: 8,
    language: 'en',
    prompt: 'Product launch presentation for a new mobile application — features, demo, roadmap, go-to-market',
  },
  {
    label: 'Portfolio',
    emoji: '🎨',
    style: 'minimal',
    slideCount: 6,
    language: 'en',
    prompt: 'Creative portfolio showcase for a design agency — about us, work samples, process, contact',
  },
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
  // DOCX import
  onDocxImport: (outline: DocxOutline[]) => void;
  // Brand identity
  brandLogo: string | null;
  setBrandLogo: (v: string | null) => void;
  brandSlogan: string;
  setBrandSlogan: (v: string) => void;
  brandDescription: string;
  setBrandDescription: (v: string) => void;
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
  onDocxImport,
  brandLogo, setBrandLogo,
  brandSlogan, setBrandSlogan,
  brandDescription, setBrandDescription,
}) => {
  const { showToast } = useToast();
  const [langOpen, setLangOpen] = React.useState(false);
  const [templatesOpen, setTemplatesOpen] = React.useState(false);
  const [brandOpen, setBrandOpen] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const docxFileRef = React.useRef<HTMLInputElement>(null);
  const logoFileRef = React.useRef<HTMLInputElement>(null);
  const { parseDocx } = useDocxImport();
  const [isDocxLoading, setIsDocxLoading] = React.useState(false);

  const currentLang = LANGUAGES.find(l => l.value === deckLanguage) ?? LANGUAGES[0];

  // ── Reference image upload ───────────────────────────────────────────────────
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

  // ── DOCX import ──────────────────────────────────────────────────────────────
  const handleDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDocxLoading(true);
    try {
      const outline = await parseDocx(file);
      showToast(`Đã nhập ${outline.length} slides từ DOCX — đang tạo...`, 'success');
      onDocxImport(outline);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi nhập DOCX';
      showToast(message, 'error');
    } finally {
      setIsDocxLoading(false);
      if (docxFileRef.current) docxFileRef.current.value = '';
    }
  };

  // ── Logo upload ──────────────────────────────────────────────────────────────
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setBrandLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ── Template apply ───────────────────────────────────────────────────────────
  const applyTemplate = (t: Template) => {
    setDeckTopic(t.prompt);
    setDeckStyle(t.style);
    setSlideCount(t.slideCount);
    setDeckLanguage(t.language);
    setTemplatesOpen(false);
    showToast(`Đã áp dụng template "${t.label}"`, 'success');
  };

  return (
    <div className="w-80 h-full flex flex-col bg-white dark:bg-[#1a1a1e] border-l border-black/[0.05] dark:border-white/[0.05] overflow-y-auto no-scrollbar">
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
      </div>

      {/* ── Section: Templates ───────────────────────────────────────── */}
      <div className="border-b border-black/[0.05] dark:border-white/[0.04]">
        <button
          onClick={() => setTemplatesOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
        >
          <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-slate-400 dark:text-white/40">
            <LayoutTemplate size={10} />
            Templates
          </span>
          <ChevronDown
            size={10}
            className={`text-slate-400 transition-transform duration-200 ${templatesOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {templatesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                {FEATURED_TEMPLATES.map(t => (
                  <button
                    key={t.label}
                    onClick={() => applyTemplate(t)}
                    className="group flex flex-col items-start gap-1 p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] hover:border-brand-blue/40 hover:bg-brand-blue/[0.04] transition-all text-left"
                  >
                    <span className="text-base leading-none">{t.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-white/80 leading-tight">
                      {t.label}
                    </span>
                    <span className="text-[8px] text-slate-400 dark:text-white/30">
                      {t.slideCount} slides · {t.style}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                <X size={9} className="text-white" />
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
        <p className="text-[9px] text-slate-400 dark:text-white/20 mt-1">Tối đa 3 ảnh — AI dùng làm tham chiếu style/brand</p>
      </div>

      {/* ── Section: Brand Identity ──────────────────────────────────── */}
      <div className="border-b border-black/[0.05] dark:border-white/[0.04]">
        <button
          onClick={() => setBrandOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
        >
          <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-slate-400 dark:text-white/40">
            <Tag size={10} />
            Brand Identity (tuỳ chọn)
          </span>
          <ChevronDown
            size={10}
            className={`text-slate-400 transition-transform duration-200 ${brandOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {brandOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Logo */}
                <div>
                  <label className="text-[9px] font-semibold uppercase text-slate-400 dark:text-white/30 block mb-1">
                    Logo
                  </label>
                  <div className="flex items-center gap-2">
                    {brandLogo ? (
                      <div className="relative group shrink-0">
                        <img
                          src={brandLogo}
                          alt="brand logo"
                          className="w-12 h-12 rounded-lg object-contain border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-white/5"
                        />
                        <button
                          onClick={() => setBrandLogo(null)}
                          className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={8} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => logoFileRef.current?.click()}
                        className="w-12 h-12 rounded-lg border-2 border-dashed border-black/[0.08] dark:border-white/[0.08] flex flex-col items-center justify-center gap-0.5 hover:border-brand-blue/40 transition-colors shrink-0"
                      >
                        <Upload size={11} className="text-slate-400 dark:text-white/30" />
                        <span className="text-[7px] text-slate-400 dark:text-white/30">Logo</span>
                      </button>
                    )}
                    <p className="text-[9px] text-slate-400 dark:text-white/30 leading-snug">
                      Logo sẽ được dùng làm tham chiếu thương hiệu khi tạo slide
                    </p>
                  </div>
                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                {/* Slogan */}
                <div>
                  <label className="text-[9px] font-semibold uppercase text-slate-400 dark:text-white/30 block mb-1">
                    Slogan / Tagline
                  </label>
                  <input
                    value={brandSlogan}
                    onChange={e => setBrandSlogan(e.target.value)}
                    placeholder="VD: Innovate · Connect · Grow"
                    maxLength={80}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[11px] placeholder-slate-300 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[9px] font-semibold uppercase text-slate-400 dark:text-white/30 block mb-1">
                    Mô tả dự án
                  </label>
                  <textarea
                    value={brandDescription}
                    onChange={e => setBrandDescription(e.target.value.slice(0, 200))}
                    placeholder="Mô tả ngắn về dự án / thương hiệu để AI có ngữ cảnh..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[11px] placeholder-slate-300 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40 resize-none h-16 text-slate-900 dark:text-white"
                  />
                  <p className="text-right text-[8px] text-slate-300 dark:text-white/20 mt-0.5">
                    {brandDescription.length}/200
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Section: Import DOCX ───────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1.5">
          📄 Import DOCX (tuỳ chọn)
        </label>
        <button
          onClick={() => docxFileRef.current?.click()}
          disabled={isDocxLoading || isGeneratingDeck}
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
        <p className="text-[9px] text-slate-400 dark:text-white/20 mt-1">
          Import DOCX → AI tự phân tách từng slide + gen ảnh tuần tự
        </p>
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
