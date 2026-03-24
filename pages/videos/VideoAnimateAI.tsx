
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Zap, Sparkles, ArrowRight, CheckCircle2,
  Video, UserCircle, Music, Mic2, UserCheck,
  Film, Clapperboard, Upload, Cpu, Star, ChevronLeft
} from 'lucide-react';
import VideoAnimateWorkspace from '../../components/VideoAnimateWorkspace';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';

/* ─── DATA ─── */
const HERO_VIDEOS = [
  { url: 'https://video.aidancing.net/video-avatar/ai-talking-intro-product-2.mp4', title: 'AI Presenter Pro', tag: 'Talking Avatar' },
  { url: 'https://video.aidancing.net/video-avatar/ai-change-bg-review-product.mp4', title: 'Review Sản Phẩm', tag: 'E-Commerce' },
  { url: 'https://video.aidancing.net/video-avatar/ai-fashion-walking-posing-1.mp4', title: 'Fashion Catwalk', tag: 'Fashion AI' },
];

const FEATURES = [
  { icon: <UserCircle />, title: 'AI Talking Avatar', desc: 'Chuyển ảnh tĩnh thành nhân vật nói chuyện với khẩu hình miệng chính xác theo audio.' },
  { icon: <Music />, title: 'AI Singing', desc: 'Tạo video nhân vật hát với biểu cảm theo nhịp điệu, tối ưu cho TikTok & MV.' },
  { icon: <Mic2 />, title: 'Speech-to-Speech', desc: 'Truyền biểu cảm từ video mẫu sang nhân vật khác mà giữ nguyên cảm xúc.' },
  { icon: <UserCheck />, title: 'Identity Swap', desc: 'Thay đổi nhân dạng chuẩn điện ảnh, xử lý góc xoay đầu lên 90°.' },
  { icon: <Zap />, title: 'E-commerce Video', desc: 'Tự động tạo video review sản phẩm hàng loạt, tách nền & chèn bối cảnh AI.' },
  { icon: <Sparkles />, title: 'Fashion Catwalk', desc: 'Mô phỏng vật lý vải vóc, dáng đi người mẫu từ ảnh quần áo.' },
];

const SHOWCASES = [
  {
    title: 'AI Talking Avatar',
    headline: 'Khẩu hình miệng chính xác từng mili giây',
    desc: 'Chuyển ảnh tĩnh thành nhân vật kỹ thuật số sống động. Hệ thống phân tích khối cơ mặt để tái tạo lip-sync chính xác theo audio đầu vào.',
    video: 'https://video.aidancing.net/video-avatar/ai-talking-intro-product-2.mp4',
    benefits: ['Tiết kiệm 95% chi phí quay phim', 'Hỗ trợ đa ngôn ngữ', 'Output 4K'],
    icon: <UserCircle />, accent: 'cyan',
  },
  {
    title: 'AI Singing Performance',
    headline: 'Biểu diễn âm nhạc kỹ thuật số',
    desc: 'Nhân vật thực hiện hát phức tạp với biểu cảm cảm xúc theo giai điệu. Tự động cân chỉnh ánh sáng và tương phản.',
    video: 'https://video.aidancing.net/video-avatar/ai-singing.mp4',
    benefits: ['Emotion sync theo giai điệu', 'Rhythm-aware motion', 'Tối ưu cho TikTok'],
    icon: <Music />, accent: 'pink',
  },
  {
    title: 'Speech-to-Speech Sync',
    headline: 'Truyền biểu cảm chuyên sâu',
    desc: 'Sử dụng video mẫu làm khuôn mẫu chuyển động, áp dụng định danh nhân vật khác vào. Sắc thái từ nháy mắt đến nhếch môi được truyền tải nguyên vẹn.',
    video: 'https://video.aidancing.net/video-avatar/ai-sts.mp4',
    benefits: ['Giữ cảm xúc video gốc', 'Zero identity drift', 'Temporal noise fix'],
    icon: <Mic2 />, accent: 'emerald',
  },
  {
    title: 'Identity Swap Master',
    headline: 'Thay đổi nhân dạng chuẩn điện ảnh',
    desc: 'Tái cấu trúc xương mặt và phản xạ ánh sáng trên da để khớp hoàn toàn với video gốc. Không ghosting artifacts.',
    video: 'https://video.aidancing.net/video-avatar/face-swap.mp4',
    benefits: ['Xoay đầu đến 90°', 'Auto color matching', 'Chất lượng TVC'],
    icon: <UserCheck />, accent: 'violet',
  },
  {
    title: 'E-commerce Automation',
    headline: 'Video review sản phẩm tự động',
    desc: 'Tự động tách nền, chèn bối cảnh lifestyle và diễn hoạt nhân vật tương tác sản phẩm. Hàng ngàn video trong vài giờ.',
    video: 'https://video.aidancing.net/video-avatar/ai-change-bg-review-product.mp4',
    benefits: ['Tăng tỷ lệ chuyển đổi', 'Bối cảnh linh hoạt', 'Beauty filter AI'],
    icon: <Zap />, accent: 'amber',
  },
  {
    title: 'AI Fashion Catwalk',
    headline: 'Sàn diễn thời trang kỹ thuật số',
    desc: 'Mô phỏng chuyển động vải vóc và dáng đi người mẫu. Thay đổi người mẫu, tư thế và bối cảnh sàn diễn.',
    video: 'https://video.aidancing.net/video-avatar/ai-fashion-walking-posing-1.mp4',
    benefits: ['Fabric physics simulation', 'Tùy biến người mẫu', '4K output'],
    icon: <Sparkles />, accent: 'blue',
  },
];

const WORKFLOW = [
  { step: '01', title: 'Upload ảnh hoặc video', desc: 'Tải ảnh nhân vật hoặc video mẫu làm nguồn đầu vào.', icon: <Upload size={20} /> },
  { step: '02', title: 'Chọn chế độ AI', desc: 'Talking, Singing, Face Swap, STS — chọn công nghệ phù hợp.', icon: <Cpu size={20} /> },
  { step: '03', title: 'Cung cấp audio/video mẫu', desc: 'Upload audio hoặc video tham chiếu để AI đồng bộ.', icon: <Film size={20} /> },
  { step: '04', title: 'Xuất video', desc: 'AI xử lý và xuất video chất lượng cao, sẵn sàng sử dụng.', icon: <Clapperboard size={20} /> },
];

const USE_CASES = [
  { emoji: '🎬', title: 'Quảng cáo', desc: 'TVC & Digital ads tự động' },
  { emoji: '📱', title: 'Social Media', desc: 'Content TikTok, Reels, YouTube' },
  { emoji: '📦', title: 'E-commerce', desc: 'Video review sản phẩm hàng loạt' },
  { emoji: '🎵', title: 'Âm nhạc', desc: 'MV AI, lyric video động' },
  { emoji: '👗', title: 'Thời trang', desc: 'Lookbook video, catwalk AI' },
  { emoji: '📰', title: 'Tin tức', desc: 'AI anchor, bản tin tự động' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const VideoAnimateAI: React.FC = () => {
  usePageMeta({
    title: 'AI Video Animation Studio | Skyverses',
    description: 'Diễn hoạt hình ảnh và video chuyên nghiệp bằng AI. Talking avatar, singing, face swap, STS và nhiều hơn nữa.',
    keywords: 'video animation, AI video, talking avatar, face swap, Skyverses',
    canonical: '/product/video-animate-ai'
  });

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % HERO_VIDEOS.length), 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white dark:bg-[#050508] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 transition-colors duration-500">

      <AnimatePresence>
        {isWorkspaceOpen && (
          <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[1000] bg-white dark:bg-[#050507]">
            <VideoAnimateWorkspace onClose={() => setIsWorkspaceOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-24 px-6 lg:px-12 min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-indigo-500/8 via-violet-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto w-full z-10 space-y-12 text-center">
          <motion.div {...fadeUp(0)}>
            <Link to="/market" className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-indigo-500 transition-colors mb-6">
              <ChevronLeft size={14} /> Quay lại
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-[0.15em]"
          >
            <Video size={14} /> AI Video Animation Studio
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
            Diễn hoạt video
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">bằng AI chuyên sâu</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Talking avatar, singing, face swap, STS — tất cả trong một studio.
            Chỉ cần ảnh + audio, AI sẽ tạo video chuyên nghiệp.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button onClick={() => setIsWorkspaceOpen(true)}
              className="group bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-10 py-5 rounded-2xl font-bold text-sm shadow-[0_20px_50px_rgba(99,102,241,0.25)] hover:shadow-[0_25px_60px_rgba(99,102,241,0.35)] hover:scale-[1.02] transition-all flex items-center gap-3">
              <Video size={18} />
              Mở Video Studio
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#showcases" className="px-10 py-5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              Xem Showcases
            </a>
          </motion.div>

          <motion.div {...fadeUp(0.4)} className="flex flex-wrap items-center justify-center gap-6 pt-6">
            {['Identity Lock', 'Lip-sync Pro', '4K Output', 'Multi-mode'].map((badge, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-500" /> {badge}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Hero video carousel */}
        <motion.div {...fadeUp(0.5)} className="relative max-w-5xl mx-auto mt-16 w-full border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c10] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="h-10 border-b border-slate-100 dark:border-white/[0.04] bg-slate-50/80 dark:bg-white/[0.02] flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-3 uppercase tracking-wider">AI Video Studio — Preview</span>
          </div>
          <div className="aspect-[16/7] bg-black relative group cursor-pointer" onClick={() => setIsWorkspaceOpen(true)}>
            <AnimatePresence mode="wait">
              <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="absolute inset-0">
                <video src={HERO_VIDEOS[currentSlide].url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2 z-10">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold uppercase text-white tracking-wider">{HERO_VIDEOS[currentSlide].tag}</span>
            </div>
            <div className="absolute bottom-6 left-6 z-10">
              <h3 className="text-2xl lg:text-3xl font-black text-white leading-tight">{HERO_VIDEOS[currentSlide].title}</h3>
            </div>
            {/* Slide indicators */}
            <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
              {HERO_VIDEOS.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setCurrentSlide(i); }}
                  className={`w-8 h-1 rounded-full transition-all ${i === currentSlide ? 'bg-indigo-400 w-12' : 'bg-white/30 hover:bg-white/50'}`} />
              ))}
            </div>
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
                <Play size={24} fill="white" className="ml-0.5" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-32 border-t border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Công nghệ <span className="text-indigo-500">diễn hoạt</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
              6 engine AI chuyên biệt cho mọi nhu cầu tạo video — từ talking avatar đến fashion catwalk.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="p-8 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl space-y-5 group hover:border-indigo-500/20 hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all duration-500">
                <div className="w-12 h-12 border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 group-hover:border-indigo-500/30 transition-all rounded-xl">
                  {React.cloneElement(f.icon as React.ReactElement<any>, { size: 22 })}
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white/90">{f.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SHOWCASES (zig-zag) ═══ */}
      <section id="showcases" className="py-32 border-t border-slate-100 dark:border-white/[0.03] transition-colors">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-24">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Thư viện <span className="text-indigo-500">giải pháp</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
              Mỗi engine AI được tối ưu cho một use case cụ thể, mang lại chất lượng cấp doanh nghiệp.
            </p>
          </motion.div>

          <div className="space-y-32 lg:space-y-40">
            {SHOWCASES.map((item, idx) => (
              <motion.div key={idx} {...fadeUp(0.1)}
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Video */}
                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl group border border-slate-100 dark:border-white/[0.04] hover:border-indigo-500/20 transition-all">
                    <video src={item.video} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
                        <Play size={20} fill="white" className="ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                      {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 })}
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{item.title}</h3>
                  </div>
                  <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{item.headline}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  <div className="space-y-2.5 pt-2">
                    {item.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{b}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setIsWorkspaceOpen(true)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors group/btn pt-2">
                    Thử nghiệm ngay <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WORKFLOW ═══ */}
      <section className="py-32 border-t border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Quy trình <span className="text-indigo-500">đơn giản</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Chỉ 4 bước để tạo video chuyên nghiệp</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WORKFLOW.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="flex gap-5 p-6 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl group hover:border-indigo-500/20 transition-all">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Bước {s.step}</span>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white/90">{s.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="py-32 border-t border-slate-100 dark:border-white/[0.03] transition-colors">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Ứng dụng <span className="text-indigo-500">đa ngành</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Từ quảng cáo đến thời trang — Video AI phục vụ mọi lĩnh vực.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {USE_CASES.map((uc, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}
                className="p-6 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl text-center group hover:border-indigo-500/20 hover:shadow-md transition-all">
                <span className="text-3xl">{uc.emoji}</span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white/90 mt-3">{uc.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-40 text-center relative overflow-hidden border-t border-slate-100 dark:border-white/[0.03] bg-white dark:bg-[#050508] transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/5 to-violet-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-10 relative z-10 px-6">
          <motion.div {...fadeUp()} className="space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white">
              Bắt đầu <br />
              <span className="text-indigo-500">diễn hoạt ngay</span>
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Chỉ cần ảnh + audio — AI sẽ tạo video chuyên nghiệp trong vài phút.
            </p>
          </motion.div>
          <motion.button {...fadeUp(0.15)} onClick={() => setIsWorkspaceOpen(true)}
            className="group bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-14 py-6 rounded-2xl text-sm font-bold shadow-[0_25px_60px_rgba(99,102,241,0.3)] hover:shadow-[0_30px_70px_rgba(99,102,241,0.4)] hover:scale-[1.03] transition-all inline-flex items-center gap-3">
            <Video size={18} />
            Mở Video Studio
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.div {...fadeUp(0.25)} className="flex items-center justify-center gap-2 pt-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Được tin dùng bởi 1,500+ content creators</span>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default VideoAnimateAI;