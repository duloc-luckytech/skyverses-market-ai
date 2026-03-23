
import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Video, ImageIcon, Music, Mic, ArrowRight, Sparkles,
  ChevronRight, Zap, Star, Eye, Layers,
  Camera, Palette, Scissors, TrendingUp,
  MonitorPlay, Shirt, PenTool, Gamepad2, Box,
  Volume2, Wand2, RefreshCw
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  })
};

/* ═══════════════════ DATA ═══════════════════ */

type Category = 'all' | 'video' | 'image' | 'audio' | 'creative';

interface Solution {
  name: string;
  desc: string;
  icon: React.ReactNode;
  category: Category;
  gradient: string;
  route: string;
  features: string[];
  badge?: string;
}

const SOLUTIONS: Solution[] = [
  // VIDEO
  {
    name: 'AI Video Generator',
    desc: 'Text or image → cinematic video. Multiple engines: VEO3, WAN, Gommo.',
    icon: <Video size={22} />,
    category: 'video',
    gradient: 'from-violet-500 to-purple-600',
    route: '/product/ai-video-generator',
    features: ['Text-to-Video', 'Image-to-Video', 'Multi-engine'],
    badge: '🔥 Hot',
  },
  {
    name: 'Video Animate AI',
    desc: 'Bring static images to life with natural motion and physics.',
    icon: <MonitorPlay size={22} />,
    category: 'video',
    gradient: 'from-blue-500 to-indigo-600',
    route: '/product/video-animate-ai',
    features: ['Image animation', 'Motion transfer', 'Character sync'],
  },
  {
    name: 'Avatar Lipsync AI',
    desc: 'Generate talking-head videos with perfect lip sync from any audio.',
    icon: <Volume2 size={22} />,
    category: 'video',
    gradient: 'from-rose-500 to-pink-600',
    route: '/product/avatar-sync-ai',
    features: ['Lip sync', 'Avatar generation', 'Multi-language'],
  },
  {
    name: 'Storyboard Studio',
    desc: 'Plan your video scenes visually before production.',
    icon: <Layers size={22} />,
    category: 'video',
    gradient: 'from-amber-500 to-orange-600',
    route: '/product/storyboard-studio',
    features: ['Scene planning', 'Shot composition', 'Export to video'],
  },
  // IMAGE
  {
    name: 'AI Image Generator',
    desc: 'Create any image from text. Multiple styles, resolutions, and models.',
    icon: <ImageIcon size={22} />,
    category: 'image',
    gradient: 'from-cyan-500 to-blue-500',
    route: '/product/ai-image-generator',
    features: ['Text-to-Image', 'Multi-model', 'Style control'],
    badge: '⭐ Core',
  },
  {
    name: 'Background Removal',
    desc: 'One-click AI background removal. Perfect edge detection.',
    icon: <Scissors size={22} />,
    category: 'image',
    gradient: 'from-emerald-500 to-teal-500',
    route: '/product/background-removal-ai',
    features: ['Auto segment', 'PNG export', 'Hair-level precision'],
  },
  {
    name: 'AI Stylist',
    desc: 'Virtual try-on studio. Upload portrait, try any outfit.',
    icon: <Shirt size={22} />,
    category: 'image',
    gradient: 'from-pink-500 to-rose-500',
    route: '/product/ai-stylist',
    features: ['Virtual try-on', 'Pose transfer', 'Identity lock'],
  },
  {
    name: 'Image Upscale AI',
    desc: 'Enhance and upscale images to 4K-8K with AI super-resolution.',
    icon: <TrendingUp size={22} />,
    category: 'image',
    gradient: 'from-indigo-500 to-violet-500',
    route: '/product/image-upscale-ai',
    features: ['Super resolution', '4K-8K export', 'Detail restoration'],
  },
  {
    name: 'Poster & Marketing AI',
    desc: 'Generate professional marketing posters and ad creatives.',
    icon: <PenTool size={22} />,
    category: 'image',
    gradient: 'from-orange-500 to-red-500',
    route: '/product/poster-marketing-ai',
    features: ['Ad creative', 'Brand templates', 'Batch generation'],
  },
  {
    name: 'Product Photography',
    desc: 'Transform flat product photos into professional studio shots.',
    icon: <Camera size={22} />,
    category: 'image',
    gradient: 'from-lime-500 to-green-500',
    route: '/product/product-image',
    features: ['Studio lighting', 'Background swap', 'E-commerce ready'],
  },
  // AUDIO
  {
    name: 'AI Music Generator',
    desc: 'Create original music from text. Any genre, any mood.',
    icon: <Music size={22} />,
    category: 'audio',
    gradient: 'from-fuchsia-500 to-purple-600',
    route: '/product/ai-music-generator',
    features: ['Text-to-Music', 'Multi-genre', 'Custom length'],
    badge: '🎵 Popular',
  },
  {
    name: 'Voice Design AI',
    desc: 'Voice cloning, custom TTS, and audio design studio.',
    icon: <Mic size={22} />,
    category: 'audio',
    gradient: 'from-yellow-500 to-amber-600',
    route: '/product/voice-design-ai',
    features: ['Voice clone', 'Multi-language', 'Emotion control'],
  },
  {
    name: 'Text to Speech',
    desc: 'Natural-sounding speech from text. Multiple voices and languages.',
    icon: <Volume2 size={22} />,
    category: 'audio',
    gradient: 'from-teal-500 to-cyan-600',
    route: '/product/text-to-speech',
    features: ['Natural voice', '100+ languages', 'SSML support'],
  },
  // CREATIVE
  {
    name: 'Fashion Center AI',
    desc: 'Full fashion production pipeline — from design to catalog.',
    icon: <Palette size={22} />,
    category: 'creative',
    gradient: 'from-red-500 to-rose-600',
    route: '/product/fashion-center-ai',
    features: ['Outfit gen', 'Model fitting', 'Catalog export'],
  },
  {
    name: 'Comic Engine',
    desc: 'Generate manga/comic pages with consistent characters.',
    icon: <Gamepad2 size={22} />,
    category: 'creative',
    gradient: 'from-violet-500 to-indigo-600',
    route: '/product/banana-pro-comic-engine',
    features: ['Panel layout', 'Character lock', 'Style transfer'],
  },
  {
    name: '3D Spatial Architect',
    desc: 'Generate 3D environments and architectural visualizations.',
    icon: <Box size={22} />,
    category: 'creative',
    gradient: 'from-emerald-500 to-green-600',
    route: '/product/3d-spatial-architect',
    features: ['3D mesh gen', 'PBR materials', 'CAD export'],
  },
];

const FILTERS: { key: Category; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All Tools', icon: <Sparkles size={14} /> },
  { key: 'video', label: 'Video', icon: <Video size={14} /> },
  { key: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
  { key: 'audio', label: 'Audio', icon: <Music size={14} /> },
  { key: 'creative', label: 'Creative', icon: <Palette size={14} /> },
];

/* ═══════════════════ PAGE ═══════════════════ */

const SolutionsPage = () => {
  const [activeFilter, setActiveFilter] = useState<Category>('all');

  usePageMeta({
    title: 'AI Solutions | Skyverses - Complete Creative Toolkit',
    description: 'Browse 16+ AI-powered creative tools: video generation, image creation, music composition, voice cloning, fashion AI, and more.',
    keywords: 'AI solutions, Skyverses tools, video AI, image AI, music AI, voice AI',
    canonical: '/solutions'
  });

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const filtered = activeFilter === 'all'
    ? SOLUTIONS
    : SOLUTIONS.filter(s => s.category === activeFilter);

  return (
    <div className="bg-[#050507] min-h-screen text-white font-sans overflow-x-hidden pt-16">

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial="hidden" animate={heroInView ? "visible" : "hidden"}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <motion.div variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-8"
          >
            <Wand2 size={14} /> Creative Toolkit
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            Every AI Tool You{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Need
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            {SOLUTIONS.length} professional AI tools, one platform. Generate videos, images, music, voices, and more —
            all powered by the latest AI models.
          </motion.p>

          {/* Filters */}
          <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-2">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeFilter === f.key
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── GRID ── */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((sol) => (
              <motion.div
                key={sol.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
              >
                <Link to={sol.route}
                  className="group block relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-7 hover:border-white/15 transition-all duration-500 h-full"
                >
                  {/* Glow */}
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${sol.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-700`} />

                  {/* Badge */}
                  {sol.badge && (
                    <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                      {sol.badge}
                    </div>
                  )}

                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${sol.gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    {sol.icon}
                  </div>

                  <h3 className="text-lg font-bold mb-1.5 group-hover:text-white transition-colors">{sol.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{sol.desc}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {sol.features.map((f, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/5 text-gray-500 border border-white/5">
                        {f}
                      </span>
                    ))}
                  </div>

                  <span className="text-violet-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Launch <ChevronRight size={13} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950/80 via-slate-900/80 to-violet-950/80 backdrop-blur-xl p-12 md:p-16 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-5">
                Start with <span className="text-violet-400">Free Credits</span>
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                No subscription needed. Buy credits and use any tool — pay only for what you create.
              </p>
              <Link to="/credits"
                className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-xl"
              >
                Get Credits <Zap size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SolutionsPage;
