import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles, Globe, ChevronDown } from 'lucide-react';
import { Language } from '../../types';
import { SLIDE_STYLES, SLIDE_COUNT_OPTIONS } from '../../hooks/useSlideStudio';

// ─── Constants ────────────────────────────────────────────────────────────────

export const SLIDE_WIZARD_KEY = 'skyverses_slide_wizard_done';

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
];

interface DeckType {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  style: string;
  count: number;
  language: Language;
  topic: string;
}

const DECK_TYPES: DeckType[] = [
  {
    id: 'pitch',
    emoji: '🚀',
    label: 'Startup Pitch',
    hint: 'Series A, pitch deck',
    style: 'dark',
    count: 8,
    language: 'en',
    topic: 'Startup pitch deck for a tech company seeking Series A funding — problem, solution, market, team, traction',
  },
  {
    id: 'report',
    emoji: '📊',
    label: 'Báo cáo DN',
    hint: 'Tổng kết kinh doanh',
    style: 'corporate',
    count: 6,
    language: 'vi',
    topic: 'Báo cáo tổng kết kinh doanh quý 3 năm 2025 — kết quả, phân tích, kế hoạch',
  },
  {
    id: 'edu',
    emoji: '🎓',
    label: 'Bài giảng',
    hint: 'Tutorial, giáo trình',
    style: 'gradient',
    count: 10,
    language: 'vi',
    topic: 'Bài giảng Machine Learning cơ bản cho sinh viên đại học — khái niệm, thuật toán, ứng dụng',
  },
  {
    id: 'marketing',
    emoji: '📣',
    label: 'Marketing',
    hint: 'Chiến dịch, KPIs',
    style: 'creative',
    count: 8,
    language: 'vi',
    topic: 'Chiến dịch marketing Q4 cho sản phẩm mới — thị trường, chiến lược, KPIs, timeline',
  },
  {
    id: 'product',
    emoji: '✨',
    label: 'Product Launch',
    hint: 'Features, go-to-market',
    style: 'dark',
    count: 8,
    language: 'en',
    topic: 'Product launch presentation for a new mobile application — features, demo, roadmap, go-to-market',
  },
  {
    id: 'portfolio',
    emoji: '🎨',
    label: 'Portfolio',
    hint: 'Showcase, creative',
    style: 'minimal',
    count: 6,
    language: 'en',
    topic: 'Creative portfolio showcase for a design agency — about us, work samples, process, contact',
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WizardSettings {
  deckTopic: string;
  deckStyle: string;
  slideCount: number;
  deckLanguage: Language;
}

interface Props {
  onComplete: (settings: WizardSettings) => void;
  onSkip: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SlideOnboardingWizard: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<DeckType | null>(null);
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('corporate');
  const [count, setCount] = useState(6);
  const [language, setLanguage] = useState<Language>('vi');
  const [langOpen, setLangOpen] = useState(false);

  const handleSelectType = (type: DeckType) => {
    setSelectedType(type);
    setTopic(type.topic);
    setStyle(type.style);
    setCount(type.count);
    setLanguage(type.language);
    setStep(2);
  };

  const handleStart = () => {
    localStorage.setItem(SLIDE_WIZARD_KEY, '1');
    onComplete({ deckTopic: topic.trim(), deckStyle: style, slideCount: count, deckLanguage: language });
  };

  const handleSkip = () => {
    localStorage.setItem(SLIDE_WIZARD_KEY, '1');
    onSkip();
  };

  const currentLang = LANGUAGES.find(l => l.value === language) ?? LANGUAGES[0];
  const styleLabel = SLIDE_STYLES.find(s => s.id === style)?.label ?? style;
  const langLabel = currentLang.flag + ' ' + currentLang.label;

  const STEP_TITLES: Record<1 | 2 | 3, string> = {
    1: '👋 Bạn muốn tạo deck gì?',
    2: '⚙️ Tuỳ chỉnh bản trình chiếu',
    3: '🚀 Sẵn sàng tạo!',
  };

  const STEP_SUBTITLES: Record<1 | 2 | 3, string> = {
    1: 'Chọn loại deck để bắt đầu nhanh hơn',
    2: `Chủ đề: ${selectedType?.emoji ?? ''} ${selectedType?.label ?? ''}`,
    3: 'Xem lại cài đặt trước khi AI tạo deck',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.96 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full sm:max-w-lg bg-white dark:bg-[#0e0e12] rounded-t-3xl sm:rounded-2xl border border-black/[0.06] dark:border-white/[0.06] shadow-2xl flex flex-col overflow-hidden max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1.5">
                  {([1, 2, 3] as const).map(s => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        s === step
                          ? 'w-7 bg-brand-blue'
                          : s < step
                          ? 'w-3.5 bg-brand-blue/40'
                          : 'w-3.5 bg-black/[0.08] dark:bg-white/[0.08]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                  Bước {step}/3
                </span>
              </div>

              <h2 className="text-[17px] font-bold text-slate-900 dark:text-white leading-snug">
                {STEP_TITLES[step]}
              </h2>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {STEP_SUBTITLES[step]}
              </p>
            </div>

            <button
              onClick={handleSkip}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all shrink-0 mt-0.5"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-2">
          <AnimatePresence mode="wait">

            {/* Step 1: Chọn loại deck */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-2.5 pb-2"
              >
                {DECK_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleSelectType(type)}
                    className="flex flex-col items-start gap-2 p-4 rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.01] dark:bg-white/[0.02] hover:border-brand-blue/40 hover:bg-brand-blue/[0.05] dark:hover:bg-brand-blue/[0.08] transition-all text-left group"
                  >
                    <span className="text-2xl leading-none">{type.emoji}</span>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight group-hover:text-brand-blue transition-colors">
                        {type.label}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">
                        {type.hint}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Tuỳ chỉnh topic + settings */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 pb-2"
              >
                {/* Topic */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 block mb-1.5">
                    📝 Chủ đề Deck
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Nhập hoặc chỉnh sửa chủ đề bản trình chiếu..."
                    rows={4}
                    autoFocus
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] rounded-xl outline-none focus:border-brand-blue/50 transition-colors text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
                    <Sparkles size={10} className="text-brand-blue" />
                    Viết càng chi tiết, AI tạo slide càng chuẩn.
                  </p>
                </div>

                {/* Style */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 block mb-1.5">
                    🎨 Phong cách
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SLIDE_STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyle(s.id)}
                        className={`px-2.5 py-2.5 rounded-xl text-[11px] font-semibold transition-all border ${
                          style === s.id
                            ? 'bg-brand-blue/15 border-brand-blue/50 text-brand-blue'
                            : 'bg-slate-50 dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06] text-slate-600 dark:text-white/60 hover:border-brand-blue/30 hover:bg-brand-blue/[0.04]'
                        }`}
                      >
                        {s.emoji} {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slide count + Language row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Count */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 block mb-1.5">
                      📊 Số Slides
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {SLIDE_COUNT_OPTIONS.map((n) => (
                        <button
                          key={n}
                          onClick={() => setCount(n)}
                          className={`w-9 h-9 rounded-lg text-[11px] font-bold transition-all ${
                            count === n
                              ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30'
                              : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 block mb-1.5">
                      <Globe size={9} className="inline mr-1" />
                      Ngôn ngữ
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setLangOpen((v) => !v)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-black/[0.07] dark:border-white/[0.07] text-[12px] font-medium text-slate-700 dark:text-white/80 flex items-center justify-between hover:border-brand-blue/30 transition-all"
                      >
                        <span>{currentLang.flag} {currentLang.label}</span>
                        <ChevronDown size={11} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {langOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a22] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-xl z-20 overflow-hidden"
                          >
                            {LANGUAGES.map((lang) => (
                              <button
                                key={lang.value}
                                onClick={() => { setLanguage(lang.value); setLangOpen(false); }}
                                className={`w-full px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                                  language === lang.value
                                    ? 'bg-brand-blue/10 text-brand-blue'
                                    : 'text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.05]'
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
                </div>
              </motion.div>
            )}

            {/* Step 3: Summary + CTA */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 pb-2"
              >
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { icon: '📝', label: 'Chủ đề', value: topic.length > 50 ? topic.slice(0, 50) + '…' : topic },
                    { icon: '📊', label: 'Số slides', value: `${count} slides` },
                    { icon: '🎨', label: 'Phong cách', value: styleLabel },
                    { icon: '🌐', label: 'Ngôn ngữ', value: langLabel },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]"
                    >
                      <p className="text-[10px] text-slate-400 dark:text-white/30 mb-1">
                        {item.icon} {item.label}
                      </p>
                      <p className="text-[12px] font-semibold text-slate-800 dark:text-white/90 leading-snug line-clamp-2">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div className="rounded-xl bg-brand-blue/[0.06] border border-brand-blue/20 p-4 space-y-2.5">
                  <p className="text-[11px] font-bold text-brand-blue uppercase tracking-wider">
                    💡 Sau khi tạo xong bạn có thể:
                  </p>
                  {[
                    '✏️  Nhấp vào slide để chỉnh tiêu đề & nội dung trực tiếp',
                    '🖼️  Dùng toolbar để đổi layout hoặc tạo lại ảnh nền AI',
                    '⬇️  Xuất PPTX / PDF / PNG từ nút "Xuất" ở góc phải header',
                    '📁  Quản lý nhiều projects từ nút "Project Switcher" header',
                  ].map((tip, i) => (
                    <p key={i} className="text-[12px] text-slate-600 dark:text-white/60 leading-snug">
                      {tip}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-6 pb-6 pt-4 shrink-0 border-t border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between gap-3">
          {/* Left: back or skip */}
          <button
            onClick={step > 1 ? () => setStep((s) => (s - 1) as 1 | 2 | 3) : handleSkip}
            className="text-[12px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            {step > 1 ? '← Quay lại' : 'Bỏ qua'}
          </button>

          {/* Right: next / start */}
          {step === 1 && (
            <p className="text-[11px] text-slate-400 italic">Chọn loại deck để tiếp tục →</p>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              disabled={!topic.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-[13px] font-semibold shadow-lg shadow-brand-blue/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Xem tóm tắt
              <ChevronRight size={14} />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-[13px] font-bold shadow-lg shadow-brand-blue/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Sparkles size={14} />
              Tạo Deck ngay!
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const shouldShowSlideWizard = (): boolean => {
  return !localStorage.getItem(SLIDE_WIZARD_KEY);
};

export default SlideOnboardingWizard;
