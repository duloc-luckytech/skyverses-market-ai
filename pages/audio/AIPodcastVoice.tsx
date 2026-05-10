
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic, Headphones, Sparkles, Users, Zap, Volume2,
  Play, Pause, ChevronDown, ArrowRight, Wand2, Check,
  Music2, FileText, Globe, Radio,
} from 'lucide-react';
import { usePageMeta } from '../../hooks/usePageMeta';
import PodcastVoiceWorkspace from '../../components/PodcastVoiceWorkspace';

// ─── DATA ────────────────────────────────────────────────────────────────────

const PODCAST_ASSETS = {
  hero: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/6fefe3fa-5ffc-4f8f-5289-32478668ef00/public',
  script: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/8ddabe04-b3b9-40ca-b459-e175af399b00/public',
  voices: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/41117ac8-f886-4802-94a6-785e841ea500/public',
  export: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/a10abf09-9265-4419-34c1-3df034dd0300/public',
  thumb: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/0b19cde1-0a88-4670-2abb-feb9ca77ab00/public',
};

const STATS = [
  { num: '8+',   label: 'Giọng đọc preset' },
  { num: '4',    label: 'Ngôn ngữ' },
  { num: '~30s', label: 'Trung bình mỗi đoạn' },
  { num: '100%', label: 'Không cần studio' },
];

const FEATURES = [
  { icon: Users,   title: 'Multi-speaker hội thoại', desc: 'Tự động phân vai host & khách mời, mỗi người một giọng riêng nhất quán.', color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  { icon: Wand2,   title: 'AI viết kịch bản',          desc: 'Nhập outline → AI biến thành dialogue 8-12 đoạn theo tone bạn chọn.',     color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { icon: Volume2, title: 'Thư viện giọng Việt',       desc: '6 giọng preset Bắc / Nam, nam nữ, đầy đủ tone trầm ấm đến năng lượng.',  color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: Music2,  title: 'Nhạc nền + intro/outro',    desc: 'Mix background music tự động, fade in/out chuyên nghiệp.',                color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  { icon: Globe,   title: '4 ngôn ngữ chính',           desc: 'Vietnamese / English / Korean / Japanese — accent tự nhiên.',             color: 'text-rose-500',   bg: 'bg-rose-500/10' },
  { icon: Zap,     title: 'Xuất MP3 1 click',           desc: 'Tổng hợp toàn tập + bg music thành file MP3 chuẩn streaming platform.',  color: 'text-cyan-500',   bg: 'bg-cyan-500/10' },
];

const USE_CASES = [
  { emoji: '🎙', title: 'Podcast hàng tuần',  desc: 'Tập đối thoại 15–30 phút giữa 2-3 host về tin tức, công nghệ, lifestyle.' },
  { emoji: '📚', title: 'Audiobook tiếng Việt', desc: 'Chuyển sách / blog dài thành audio đọc tự nhiên, chia chapter rõ ràng.' },
  { emoji: '🏫', title: 'Bài giảng audio',     desc: 'Giáo viên thu khoá học chuyên nghiệp không cần phòng thu.' },
  { emoji: '📰', title: 'Daily news brief',     desc: 'Tóm tắt tin tức mỗi sáng phát trên Spotify / Apple Podcasts.' },
  { emoji: '📣', title: 'Quảng cáo / TVC',      desc: 'Voiceover quảng cáo banner, social ads, video sản phẩm.' },
  { emoji: '🎮', title: 'Game / animation',    desc: 'Lồng tiếng nhân vật, narration mở màn cho game indie / animation ngắn.' },
];

const FAQS = [
  { q: 'Có thể dùng cho mục đích thương mại không?',    a: 'Có. Tất cả giọng đọc preset đều được cấp phép thương mại. Bạn có thể đăng lên Spotify, YouTube, Apple Podcasts mà không lo bản quyền.' },
  { q: 'Mỗi tập tiêu tốn bao nhiêu credit?',             a: 'Tính theo tổng số ký tự — trung bình 1 phút audio (~150 từ tiếng Việt) tốn 50 CR. Tập 20 phút khoảng 1.000 CR.' },
  { q: 'Tôi có thể clone giọng riêng của mình không?',  a: 'Phiên bản hiện tại hỗ trợ tạo voice profile custom (description-based). Voice clone từ sample audio sẽ có trong cập nhật sắp tới.' },
  { q: 'Format xuất là gì?',                              a: 'Mặc định MP3 192kbps stereo. Có thể chọn WAV hoặc M4A trong cài đặt nâng cao. Bao gồm timestamps cho chapters tự động.' },
  { q: 'AI viết kịch bản có hỗ trợ tiếng Việt không?',   a: 'Có, mặc định sinh tiếng Việt. AI hiểu context văn hoá Việt (xưng hô anh/chị, ngữ pháp tự nhiên, không dịch máy cứng).' },
];

const WORKFLOW_STEPS = [
  {
    icon: FileText,
    title: 'Viết kịch bản',
    desc: 'Nhập outline, chủ đề, tone và AI chuyển thành hội thoại có nhịp dẫn tự nhiên.',
    image: PODCAST_ASSETS.script,
    alt: 'AI Podcast Voice script builder preview',
  },
  {
    icon: Headphones,
    title: 'Chọn giọng đọc',
    desc: 'Gán host, khách mời và narrator với accent Bắc / Nam, nam / nữ, năng lượng riêng.',
    image: PODCAST_ASSETS.voices,
    alt: 'AI Podcast Voice mixer preview',
  },
  {
    icon: Check,
    title: 'Mix & xuất file',
    desc: 'Ghép nhạc nền, chia chapter, xuất MP3 hoàn chỉnh để đăng lên nền tảng podcast.',
    image: PODCAST_ASSETS.export,
    alt: 'AI Podcast Voice export-ready timeline preview',
  },
];

// ─── SECTIONS ────────────────────────────────────────────────────────────────

const HeroSection: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <section className="relative min-h-[calc(100vh-4rem)] pt-20 lg:pt-28 pb-16 px-4 overflow-hidden flex items-center">
    <img
      src={PODCAST_ASSETS.hero}
      alt=""
      aria-hidden="true"
      loading="eager"
      className="absolute inset-0 h-full w-full object-cover object-[62%_50%] opacity-80"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/45 dark:from-[#05070d] dark:via-[#05070d]/86 dark:to-[#05070d]/35" />
    <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white dark:from-[#0a0d14] to-transparent" />

    <div className="relative z-10 max-w-6xl mx-auto w-full">
      <div className="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-bold mb-4"
      >
        <Radio size={11} /> Mới · AI Podcast Voice
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
        className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight"
      >
        Tạo <span className="bg-gradient-to-r from-brand-blue via-purple-500 to-pink-500 bg-clip-text text-transparent">Podcast AI</span><br />
        bằng giọng người Việt
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-5 text-[14px] sm:text-[16px] text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
      >
        Viết kịch bản hội thoại bằng AI, chọn 2-3 giọng đọc tự nhiên, xuất MP3 chỉ trong vài phút —
        không cần phòng thu, không cần biên tập viên.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-8 flex flex-wrap items-center gap-3"
      >
        <button
          onClick={onStart}
          className="group relative px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-blue to-purple-500 text-white text-[13px] font-bold shadow-2xl shadow-brand-blue/30 hover:shadow-brand-blue/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Mic size={15} /> Tạo podcast ngay
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
        <a href="#features" className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-white/80 text-[13px] font-bold hover:border-brand-blue/40 hover:text-brand-blue transition-colors flex items-center gap-1.5">
          Xem tính năng <ChevronDown size={13} />
        </a>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl"
      >
        {STATS.map(s => (
          <div key={s.label} className="rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] backdrop-blur p-4">
            <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-br from-brand-blue to-purple-500 bg-clip-text text-transparent">{s.num}</p>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 font-semibold">{s.label}</p>
          </div>
        ))}
      </motion.div>
      </div>
    </div>
  </section>
);

const PreviewSection: React.FC = () => {
  const [playing, setPlaying] = useState<number | null>(null);
  const samples = [
    { speaker: '♂ Host nam Bắc', text: 'Chào mừng quý vị đến với tập đầu tiên của podcast Skyverses.', tone: 'Trầm ấm' },
    { speaker: '♀ Khách nữ Nam', text: 'Cảm ơn anh đã mời em. Hôm nay em rất hào hứng được chia sẻ về startup AI.', tone: 'Năng lượng' },
    { speaker: '◆ Người dẫn truyện', text: 'Trong một ngôi làng nhỏ giữa núi rừng Tây Bắc, có một người thợ rèn.', tone: 'Kể chuyện' },
  ];
  return (
    <section className="py-16 px-4 bg-slate-50 dark:bg-[var(--atlas-bg-panel)]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Nghe thử các giọng đọc</h2>
        <p className="text-center text-[12px] text-slate-500 dark:text-gray-400 mt-2 mb-8">Mỗi giọng có tone & accent riêng — chọn người dẫn phù hợp nội dung tập</p>
        <div className="space-y-3">
          {samples.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[var(--atlas-bg-page)] border border-slate-200 dark:border-white/[0.08]">
              <button
                onClick={() => setPlaying(p => p === i ? null : i)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-purple-500 text-white flex items-center justify-center hover:brightness-110 shrink-0"
              >
                {playing === i ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-white">{s.speaker}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-gray-400 font-semibold">{s.tone}</span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-gray-300 italic">"{s.text}"</p>
                {/* Waveform placeholder */}
                <div className="mt-1.5 flex items-end gap-0.5 h-4">
                  {Array.from({ length: 40 }).map((_, j) => {
                    const h = playing === i ? Math.random() * 100 : 25 + ((j * 7) % 75);
                    return <div key={j} className="flex-1 bg-brand-blue/30 rounded-sm transition-all" style={{ height: `${h}%` }} />;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-slate-400 dark:text-gray-500 mt-4">Demo waveform — preview audio thật khi mở workspace</p>
      </div>
    </section>
  );
};

const FeaturesSection: React.FC = () => (
  <section id="features" className="py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 dark:text-white">6 tính năng <span className="text-brand-blue">PRO</span> sẵn sàng</h2>
        <p className="text-[13px] text-slate-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">Đầy đủ workflow cho creator chuyên nghiệp — từ kịch bản đến file MP3 hoàn chỉnh</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white dark:bg-[var(--atlas-bg-panel)] border border-slate-200 dark:border-white/[0.08] p-5 hover:border-brand-blue/40 hover:shadow-lg transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-3`}>
              <f.icon size={18} className={f.color} />
            </div>
            <h3 className="text-[14px] font-bold text-slate-800 dark:text-white">{f.title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const WorkflowSection: React.FC = () => (
  <section className="py-20 px-4 bg-slate-50 dark:bg-[var(--atlas-bg-panel)]">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[11px] font-bold mb-4">
            <Sparkles size={11} /> Workflow studio
          </div>
          <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 dark:text-white">Từ outline tới file podcast</h2>
        </div>
        <p className="text-[13px] text-slate-500 dark:text-gray-400 max-w-md leading-relaxed">
          Bộ visual mô phỏng đúng ba bước chính của workspace: dựng kịch bản, mix giọng, rồi xuất audio hoàn chỉnh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {WORKFLOW_STEPS.map((step, i) => (
          <motion.article
            key={step.title}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-lg bg-white dark:bg-[var(--atlas-bg-page)] border border-slate-200 dark:border-white/[0.08] shadow-sm hover:border-brand-blue/40 hover:shadow-xl hover:shadow-brand-blue/10 transition-all"
          >
            <div className="aspect-[16/10] overflow-hidden bg-slate-900">
              <img
                src={step.image}
                alt={step.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="p-5">
              <div className="w-9 h-9 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-4">
                <step.icon size={17} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-blue mb-2">Bước 0{i + 1}</p>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="text-[12px] text-slate-500 dark:text-gray-400 leading-relaxed mt-2">{step.desc}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

const UseCasesSection: React.FC = () => (
  <section className="py-20 px-4 bg-gradient-to-b from-transparent via-slate-50 to-transparent dark:via-[#13171f]">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 dark:text-white">Dùng cho mọi kiểu nội dung</h2>
        <p className="text-[13px] text-slate-500 dark:text-gray-400 mt-3">Từ podcast hàng tuần tới audiobook dài tập</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {USE_CASES.map(uc => (
          <div key={uc.title} className="rounded-xl bg-white dark:bg-[var(--atlas-bg-panel)] border border-slate-200 dark:border-white/[0.08] p-4 hover:scale-[1.02] hover:border-brand-blue/30 transition-all">
            <span className="text-2xl">{uc.emoji}</span>
            <h4 className="text-[12px] font-bold text-slate-800 dark:text-white mt-2">{uc.title}</h4>
            <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">{uc.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center text-2xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">Câu hỏi thường gặp</h2>
        <p className="text-center text-[12px] text-slate-500 dark:text-gray-400 mb-10">Còn thắc mắc? Liên hệ team Skyverses qua chat support</p>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <div key={i} className="rounded-2xl bg-white dark:bg-[var(--atlas-bg-panel)] border border-slate-200 dark:border-white/[0.08] overflow-hidden">
              <button
                onClick={() => setOpen(o => o === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-[13px] font-bold text-slate-800 dark:text-white">{f.q}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-[12px] text-slate-600 dark:text-gray-400 leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <section className="py-20 px-4">
    <div className="max-w-4xl mx-auto rounded-xl p-10 lg:p-14 text-center bg-gradient-to-br from-brand-blue via-purple-500 to-pink-500 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <h2 className="relative text-2xl lg:text-4xl font-bold text-white">Sẵn sàng làm podcast đầu tiên?</h2>
      <p className="relative text-[13px] text-white/85 mt-3 max-w-md mx-auto">5 phút setup. Tập đầu free. Không cần thẻ tín dụng.</p>
      <button
        onClick={onStart}
        className="relative mt-6 px-7 py-3.5 rounded-2xl bg-white text-brand-blue text-[13px] font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
      >
        <Mic size={15} /> Mở Workspace
        <ArrowRight size={14} />
      </button>
    </div>
  </section>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const AIPodcastVoice: React.FC = () => {
  usePageMeta({
    title: 'AI Podcast Voice | Tạo podcast AI bằng giọng người Việt | Skyverses',
    description: 'Tạo tập podcast AI hoàn chỉnh chỉ trong vài phút: AI viết kịch bản, multi-speaker giọng Việt tự nhiên, mix nhạc nền, xuất MP3 1 click. Không cần phòng thu.',
    keywords: 'AI podcast, voice AI Việt Nam, tạo podcast tự động, TTS tiếng Việt, multi-speaker AI, podcast script generator, audiobook AI',
    canonical: '/product/ai-podcast-voice',
  });

  const [open, setOpen] = useState(false);

  if (open) return (
    <div className="fixed inset-0 z-[500] bg-white dark:bg-[var(--atlas-bg-page)] animate-in fade-in duration-500">
      <PodcastVoiceWorkspace onClose={() => setOpen(false)} />
    </div>
  );

  return (
    <div className="bg-white dark:bg-[var(--atlas-bg-page)] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-16 transition-colors duration-300">
      <HeroSection onStart={() => setOpen(true)} />
      <PreviewSection />
      <FeaturesSection />
      <WorkflowSection />
      <UseCasesSection />
      <FAQSection />
      <FinalCTA onStart={() => setOpen(true)} />

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white dark:from-[#0a0d14] via-white/95 dark:via-[#0a0d14]/95 to-transparent">
        <button
          onClick={() => setOpen(true)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-purple-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/30 hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          <Mic size={14} /> Tạo Podcast Ngay — Miễn phí thử
        </button>
      </div>
    </div>
  );
};

export default AIPodcastVoice;
