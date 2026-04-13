
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Fingerprint, ArrowRight, Users, CheckCircle2, X,
  Upload, UserCheck, Zap, Activity, Star,
  ChevronLeft, BrainCircuit, RefreshCw, Maximize2,
  Database, Sparkles, Quote, Shield, Play
} from 'lucide-react';
import CharacterSyncWorkspace from '../components/CharacterSyncWorkspace';
import { usePageMeta } from '../hooks/usePageMeta';

// ─── CDN IMAGES ────────────────────────────────────────────────
// Run: bash scripts/gen_charactersync_landing_images.sh
// Then replace with values from scripts/charactersync_cdn_urls.sh
const CDN = {
  hero_main:               'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/b6cb8a64-e7ca-4ae8-ee41-7e4901828600/public',
  problem_broken_identity: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/1247acb3-3fc8-4f19-3d89-70b573eaca00/public',
  feat_dna_anchoring:      'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/f1ef27a7-5eee-4342-8e61-b6a848585600/public',
  feat_semantic_binding:   'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/a1c88938-3554-494e-3324-28ea91b70300/public',
  feat_context_memory:     'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/44e564aa-271d-42c8-5197-b6d148e52b00/public',
  feat_zero_drift:         'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/8dc2a353-3e41-4575-229e-190bba2ff600/public',
  feat_multi_actor:        'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/09cce2e7-6c1e-4576-cad6-9110f3260300/public',
  feat_shared_library:     'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/b3b332a7-0573-417e-305a-4e4d9ceb9200/public',
  step_upload:             'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/363b0a32-f368-4e20-3479-c7312ff7e300/public',
  step_naming:             'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/caa65b86-17c2-4260-4ddf-4b284b1c2e00/public',
  step_scripting:          'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/b4ab437c-3227-4b2c-2923-eea26f200b00/public',
  step_output:             'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/c6fe8f70-9edf-420b-0805-217bcff17a00/public',
  usecase_manga_webtoon:   'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/83d37479-769e-4a5d-e1a0-7d18674d8300/public',
  usecase_short_film:      'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/52cf39ca-8c4f-496d-3533-8e72227cef00/public',
  usecase_content_series:  'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/587b4777-d746-45bb-206e-a412d1a6a400/public',
  usecase_game_npc:        'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2ac999df-b44c-478d-d0e9-89ea77d16c00/public',
  usecase_ai_anchor:       'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/e6440b55-171e-49d8-0b55-f5be50cf9100/public',
  usecase_virtual_model:   'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/188da88f-4df4-4ca1-91cf-6fe686774800/public',
  testimonial_avatar_1:    'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/cf35be98-bc9e-420e-61b5-9639c1b6a800/public',
  testimonial_avatar_2:    'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/5b8a2ba8-fd5f-413a-5bc2-372f28ccd100/public',
};

/* ─── DATA ─── */
const FEATURES = [
  {
    img: CDN.feat_dna_anchoring,
    icon: <Fingerprint />,
    title: 'DNA Anchoring',
    desc: 'Upload lên 10 ảnh để định danh nhân vật. Mỗi ảnh trở thành nguồn sự thật hình ảnh.',
    badge: 'Identity Core',
  },
  {
    img: CDN.feat_semantic_binding,
    icon: <BrainCircuit />,
    title: 'Semantic Binding',
    desc: 'Prompt tham chiếu nhân vật theo tên — y như kịch bản đạo diễn chuyên nghiệp.',
    badge: 'Name Reference',
  },
  {
    img: CDN.feat_context_memory,
    icon: <Activity />,
    title: 'Context Memory',
    desc: 'AI ghi nhớ mối quan hệ nhân vật và đặc điểm tính cách xuyên suốt.',
    badge: 'Persistent',
  },
  {
    img: CDN.feat_zero_drift,
    icon: <RefreshCw />,
    title: 'Zero-Drift Sync',
    desc: 'Duy trì khuôn mặt, tóc, trang phục ổn định ở mọi tư thế và góc nhìn.',
    badge: 'Zero-Drift',
  },
  {
    img: CDN.feat_multi_actor,
    icon: <Users />,
    title: 'Multi-Actor Control',
    desc: 'Tham chiếu đồng thời đến 3 nhân vật trong một cảnh mà không bị lẫn.',
    badge: '3 Actors',
  },
  {
    img: CDN.feat_shared_library,
    icon: <Database />,
    title: 'Shared Library',
    desc: 'Kho nhân vật tập trung — tái sử dụng xuyên suốt mọi dự án và video.',
    badge: 'Cross-Project',
  },
];

const PROBLEMS = [
  'Nhân vật thay đổi khuôn mặt mỗi lần generate.',
  'Trang phục và phong cách trôi dạt giữa các prompt.',
  'AI không ghi nhớ đặc điểm nhân vật dài hạn.',
  'Quản lý nhiều nhân vật trong một cảnh rất hỗn loạn.',
];

const WORKFLOW = [
  {
    step: '01',
    title: 'Upload ảnh nhân vật',
    desc: 'Upload 1-10 ảnh để xây dựng bộ DNA hình ảnh.',
    icon: <Upload size={22} />,
    img: CDN.step_upload,
  },
  {
    step: '02',
    title: 'Đặt tên & vai trò',
    desc: 'Gán tên (VD: Luna) và mô tả tính cách.',
    icon: <UserCheck size={22} />,
    img: CDN.step_naming,
  },
  {
    step: '03',
    title: 'Viết kịch bản',
    desc: '"Luna bước vào phòng lab" → AI tự áp dụng DNA.',
    icon: <Zap size={22} />,
    img: CDN.step_scripting,
  },
  {
    step: '04',
    title: 'Tổng hợp & xuất',
    desc: 'AI xử lý và xuất ảnh/video nhất quán.',
    icon: <Maximize2 size={22} />,
    img: CDN.step_output,
  },
];

const COMPARISON = [
  { label: 'Visual Memory',        old: 'Ngẫu nhiên',       next: 'Cố định vĩnh viễn' },
  { label: 'Tham chiếu nhân vật',  old: 'Re-prompt thủ công', next: 'Gọi tên trực tiếp' },
  { label: 'Identity Drifting',    old: 'Thường xuyên',     next: 'Zero-Drift' },
  { label: 'Lịch sử nhân vật',     old: 'Không có',         next: 'Full Registry' },
  { label: 'Multi-scene support',  old: 'Giới hạn',         next: 'Không giới hạn' },
];

const USE_CASES = [
  { title: 'Truyện tranh AI',   desc: 'Nhân vật nhất quán qua mọi trang', img: CDN.usecase_manga_webtoon },
  { title: 'Phim ngắn AI',      desc: 'Diễn viên ảo xuyên suốt cốt truyện', img: CDN.usecase_short_film },
  { title: 'Content Series',    desc: 'Persona thống nhất cho social media', img: CDN.usecase_content_series },
  { title: 'Game Characters',   desc: 'NPC nhất quán trong game AI', img: CDN.usecase_game_npc },
  { title: 'AI Anchor',         desc: 'MC ảo cho bản tin, podcast', img: CDN.usecase_ai_anchor },
  { title: 'Virtual Model',     desc: 'Model ảo cho lookbook, quảng cáo', img: CDN.usecase_virtual_model },
];

const TESTIMONIALS = [
  {
    name: 'Minh Khoa',
    role: 'Manga Creator · 12K followers',
    avatar: CDN.testimonial_avatar_1,
    text: 'Trước đây mỗi chương truyện tôi phải re-describe nhân vật 30+ lần. Giờ chỉ cần gọi tên là xong. Character Sync là game-changer thực sự.',
    stars: 5,
  },
  {
    name: 'Thu Hà',
    role: 'Game Developer · Indie Studio',
    avatar: CDN.testimonial_avatar_2,
    text: 'NPCs trong game của tôi cuối cùng trông nhất quán qua toàn bộ cutscene. Không còn cảnh nhân vật bị "mất mặt" nữa.',
    stars: 5,
  },
];

const STATS = [
  { value: '800+', label: 'Creators đang dùng' },
  { value: '10K+', label: 'Nhân vật đã tạo' },
  { value: '99%',  label: 'Identity consistency' },
  { value: '3s',   label: 'Sync time trung bình' },
];

/* ─── ANIMATION ─── */
const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 28 } as const,
  whileInView: { opacity: 1, y: 0  } as const,
  viewport:    { once: true }         as const,
  transition:  { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const fadeIn = (delay = 0) => ({
  initial:     { opacity: 0 } as const,
  whileInView: { opacity: 1 } as const,
  viewport:    { once: true } as const,
  transition:  { duration: 0.6, delay } as const,
});

/* ─── COMPONENT ─── */
const ProductCharacterSync = () => {
  usePageMeta({
    title: 'Character Sync AI — Nhất quán nhân vật | Skyverses',
    description: 'Duy trì nhất quán hình ảnh nhân vật xuyên suốt ảnh, cảnh, truyện tranh và video bằng AI.',
    keywords: 'character sync, AI identity, consistency, Skyverses',
    canonical: '/product/character-sync-ai',
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-black animate-in fade-in duration-500">
        <CharacterSyncWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050508] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-purple-500/30 transition-colors duration-500">

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Hero BG image */}
        <div className="absolute inset-0 z-0">
          <img
            src={CDN.hero_main}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#050508]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
          {/* Purple tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-fuchsia-900/10" />
        </div>

        {/* Animated glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 pt-32 pb-24 text-center space-y-8">

          <motion.div {...fadeUp(0)}>
            <Link to="/market" className="inline-flex items-center gap-2 text-[11px] font-semibold text-white/50 hover:text-purple-400 transition-colors">
              <ChevronLeft size={14} /> Quay lại Marketplace
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.05)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold uppercase tracking-[0.15em] backdrop-blur-sm">
            <Fingerprint size={13} /> Identity Persistence Engine
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] text-white drop-shadow-2xl">
            Nhất quán nhân vật
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              xuyên mọi sáng tạo
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Định danh nhân vật một lần — duy trì 100% nhất quán trên mọi ảnh, cảnh, truyện tranh và video AI.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button onClick={() => setIsStudioOpen(true)}
              className="group bg-gradient-to-r from-purple-500 to-violet-600 text-white px-10 py-5 rounded-2xl font-bold text-sm shadow-[0_20px_50px_rgba(147,51,234,0.4)] hover:shadow-[0_25px_60px_rgba(147,51,234,0.5)] hover:scale-[1.02] transition-all flex items-center gap-3">
              <Fingerprint size={18} />
              Thử Character Sync
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#features"
              className="group px-10 py-5 border border-white/20 rounded-2xl font-bold text-sm text-white/70 hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-sm flex items-center gap-2">
              <Play size={14} className="group-hover:text-purple-400 transition-colors" /> Tìm hiểu thêm
            </a>
          </motion.div>

          {/* Badges */}
          <motion.div {...fadeUp(0.4)} className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {['DNA Lock', 'Zero-Drift', 'Multi-Actor', 'Name Reference'].map((badge, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-white/50">
                <CheckCircle2 size={13} className="text-emerald-400" /> {badge}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="w-1 h-1.5 rounded-full bg-white/40"
            />
          </div>
        </motion.div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="border-y border-slate-100 dark:border-white/[0.04] bg-white dark:bg-white/[0.01] transition-colors">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div key={i} {...fadeIn(i * 0.08)} className="text-center">
              <p className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 mt-1 uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="py-32 border-b border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text */}
          <motion.div {...fadeUp()} className="space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider">
              ⚠ Vấn đề phổ biến
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Vì sao nhất quán nhân vật{' '}
              <span className="text-red-400">rất khó</span> với AI?
            </h2>
            <div className="space-y-4">
              {PROBLEMS.map((point, i) => (
                <motion.div key={i} {...fadeUp(i * 0.08)} className="flex gap-3 items-start group">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                    <X size={11} strokeWidth={3} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{point}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Image */}
          <motion.div {...fadeUp(0.15)} className="relative rounded-2xl overflow-hidden order-1 lg:order-2 shadow-2xl">
            <img
              src={CDN.problem_broken_identity}
              alt="Broken character identity"
              className="w-full aspect-[16/9] object-cover"
            />
            {/* Overlay badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <span className="bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-xl -rotate-2">
                ✗ Broken Identity
              </span>
              <span className="bg-black/60 backdrop-blur-sm text-red-400 border border-red-500/30 px-3 py-2 rounded-lg text-[10px] font-semibold">
                Identity Drift
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-32 border-b border-slate-100 dark:border-white/[0.03] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={12} /> Giải pháp
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Character Sync <span className="text-purple-500">giải quyết</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
              Một Character Layer nằm trên prompt — định danh nhân vật một lần, tham chiếu bằng tên xuyên suốt mọi dự án.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.07)}
                className="group bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl overflow-hidden hover:border-purple-500/25 hover:shadow-xl dark:hover:shadow-purple-500/5 transition-all duration-500">
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={f.img}
                    alt={f.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-purple-500/90 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    {f.badge}
                  </span>
                </div>
                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 transition-all group-hover:bg-purple-500/20">
                      {React.cloneElement(f.icon as React.ReactElement<any>, { size: 17 })}
                    </div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-white/90">{f.title}</h4>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WORKFLOW ═══ */}
      <section className="py-32 border-b border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-[10px] font-bold uppercase tracking-wider">
              <Zap size={12} /> Quy trình
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Chỉ <span className="text-purple-500">4 bước</span> để có nhân vật nhất quán
            </h2>
          </motion.div>

          {/* Step selector tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {WORKFLOW.map((s, i) => (
              <button key={i} onClick={() => setActiveStep(i)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeStep === i
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 hover:border-purple-500/30'
                }`}>
                Bước {s.step}
              </button>
            ))}
          </div>

          {/* Active step detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

              {/* Image */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/[0.05]">
                <img
                  src={WORKFLOW[activeStep].img}
                  alt={WORKFLOW[activeStep].title}
                  className="w-full aspect-[16/9] object-cover"
                />
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/15 to-violet-500/15 border border-purple-500/25 flex items-center justify-center text-purple-500">
                    {WORKFLOW[activeStep].icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block mb-1">Bước {WORKFLOW[activeStep].step}</span>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{WORKFLOW[activeStep].title}</h3>
                  </div>
                </div>
                <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">{WORKFLOW[activeStep].desc}</p>

                {/* Step dots */}
                <div className="flex gap-2">
                  {WORKFLOW.map((_, i) => (
                    <button key={i} onClick={() => setActiveStep(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeStep === i ? 'w-8 bg-purple-500' : 'w-1.5 bg-slate-300 dark:bg-white/20 hover:bg-purple-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section className="py-32 border-b border-slate-100 dark:border-white/[0.03] transition-colors">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
              <Shield size={12} /> So sánh
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Vượt trội <span className="text-purple-500">hoàn toàn</span>
            </h2>
          </motion.div>

          <motion.div {...fadeUp(0.1)}
            className="bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-xl dark:shadow-black/40">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.04]">
                  <th className="p-5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/3">Tiêu chí</th>
                  <th className="p-5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-1/3">AI Truyền thống</th>
                  <th className="p-5 text-center text-[11px] font-bold uppercase tracking-wider text-purple-500 w-1/3">Character Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                {COMPARISON.map((row, i) => (
                  <motion.tr key={row.label} {...fadeIn(i * 0.06)}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-sm font-semibold text-slate-700 dark:text-white/80">{row.label}</td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center gap-1.5 text-sm text-red-400 font-medium">
                        <X size={13} strokeWidth={2.5} /> {row.old}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center justify-center gap-1.5 text-sm text-emerald-500 font-bold">
                        <CheckCircle2 size={14} /> {row.next}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="py-32 border-b border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-500 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={12} /> Ứng dụng
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Dùng được cho <span className="text-purple-500">mọi dự án</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Từ truyện tranh đến phim ngắn — nhân vật AI luôn nhất quán.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map((uc, i) => (
              <motion.div key={i} {...fadeUp(i * 0.07)}
                className="group relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.04] cursor-pointer hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-purple-500/5">
                <img
                  src={uc.img}
                  alt={uc.title}
                  className="w-full aspect-[3/2] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h4 className="text-base font-bold text-white">{uc.title}</h4>
                  <p className="text-[12px] text-white/60 mt-1">{uc.desc}</p>
                </div>
                {/* Hover CTA */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-purple-500/90 flex items-center justify-center backdrop-blur-sm">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-32 border-b border-slate-100 dark:border-white/[0.03] transition-colors">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
              <Star size={12} className="fill-amber-500" /> Đánh giá
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Creators <span className="text-purple-500">tin dùng</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} {...fadeUp(i * 0.12)}
                className="group p-8 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl space-y-5 hover:border-purple-500/20 hover:shadow-xl dark:hover:shadow-purple-500/5 transition-all duration-500">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                {/* Quote */}
                <div className="relative">
                  <Quote size={20} className="text-purple-500/30 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"{t.text}"</p>
                </div>
                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-purple-500/20"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{t.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-40 text-center relative overflow-hidden bg-white dark:bg-[#050508] transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-r from-purple-500/6 via-violet-500/8 to-fuchsia-500/6 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-10 relative z-10 px-6">
          <motion.div {...fadeUp()} className="space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white">
              Xây dựng thế giới
              <br />
              <span className="bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                nhân vật AI
              </span>
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Định danh nhân vật một lần — sáng tạo câu chuyện mãi mãi.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.15)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setIsStudioOpen(true)}
              className="group bg-gradient-to-r from-purple-500 to-violet-600 text-white px-14 py-6 rounded-2xl text-sm font-bold shadow-[0_25px_60px_rgba(147,51,234,0.3)] hover:shadow-[0_30px_70px_rgba(147,51,234,0.45)] hover:scale-[1.03] transition-all inline-flex items-center gap-3">
              <Fingerprint size={18} />
              Bắt đầu tạo nhân vật
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link to="/booking"
              className="px-10 py-6 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              Enterprise Access
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.25)} className="flex items-center justify-center gap-2 pt-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Được tin dùng bởi 800+ creators</span>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default ProductCharacterSync;
