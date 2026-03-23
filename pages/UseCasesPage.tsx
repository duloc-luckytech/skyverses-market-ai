
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Video, ImageIcon, Music, Mic, ArrowRight, Sparkles,
  ShoppingBag, Film, Megaphone, GraduationCap, Building2,
  Palette, Camera, PenTool, Gamepad2, Globe2,
  ChevronRight, Play, Zap, Star, TrendingUp
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

/* ═══════════════════ DATA ═══════════════════ */

const USE_CASE_CATEGORIES = [
  {
    title: 'Content Creation',
    subtitle: 'Social media, YouTube, TikTok',
    icon: <Film size={24} />,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    cases: [
      'Generate viral short-form videos from a single text prompt',
      'Create eye-catching thumbnails and cover art with AI Image',
      'Produce background music and sound effects with Music AI',
      'Clone your voice for consistent narration across all content',
    ],
    tools: ['Video AI', 'Image AI', 'Music AI', 'Voice AI'],
    cta: { label: 'Start Creating Content', route: '/product/ai-video-generator' },
  },
  {
    title: 'E-Commerce',
    subtitle: 'Product photos, marketing assets',
    icon: <ShoppingBag size={24} />,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    cases: [
      'Transform flat product photos into professional studio shots',
      'Generate lifestyle mockups with AI background & lighting',
      'Auto-create marketing posters and social ads at scale',
      'Produce product demo videos without hiring videographers',
    ],
    tools: ['Product Image', 'Background Removal', 'Poster AI', 'Video AI'],
    cta: { label: 'Upgrade Your Store', route: '/product/product-image' },
  },
  {
    title: 'Marketing & Ads',
    subtitle: 'Campaigns, branding, ads',
    icon: <Megaphone size={24} />,
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    cases: [
      'Generate ad creatives in seconds — test 100 variations instantly',
      'Create branded video ads for any platform with text prompt',
      'Design promotional posters with consistent brand identity',
      'Produce jingles and ad audio with custom AI music',
    ],
    tools: ['Image AI', 'Video AI', 'Poster AI', 'Music AI'],
    cta: { label: 'Supercharge Campaigns', route: '/product/poster-marketing-ai' },
  },
  {
    title: 'Fashion & Lifestyle',
    subtitle: 'Virtual try-on, styling, catalogs',
    icon: <Camera size={24} />,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    cases: [
      'Virtual try-on: see any outfit on your model instantly',
      'AI-powered fashion catalog generation — no photoshoot needed',
      'Background swap for lifestyle product photography',
      'Generate fashion lookbooks with consistent model identity',
    ],
    tools: ['AI Stylist', 'Fashion Center', 'Background Removal', 'Image AI'],
    cta: { label: 'Launch Fashion Studio', route: '/product/ai-stylist' },
  },
  {
    title: 'Real Estate',
    subtitle: 'Interior, architecture, staging',
    icon: <Building2 size={24} />,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    cases: [
      'Virtual staging: transform empty rooms into furnished spaces',
      'Generate architectural renderings from floor plans',
      'Create property video tours with AI narration',
      '3D spatial visualization for interior design concepts',
    ],
    tools: ['Real Estate AI', '3D Architect', 'Video AI', 'Voice AI'],
    cta: { label: 'Explore Real Estate AI', route: '/product/bat-dong-san-ai' },
  },
  {
    title: 'Education & Training',
    subtitle: 'Courses, tutorials, presentations',
    icon: <GraduationCap size={24} />,
    color: 'indigo',
    gradient: 'from-indigo-500 to-blue-600',
    cases: [
      'Generate explainer videos with AI avatar presenters',
      'Create course thumbnails and visual materials at scale',
      'Produce multi-language voiceovers for global courses',
      'Animated storyboards for educational content planning',
    ],
    tools: ['Avatar Sync', 'Image AI', 'Voice AI', 'Storyboard Studio'],
    cta: { label: 'Build Course Content', route: '/product/avatar-sync-ai' },
  },
];

const STATS = [
  { value: '6+', label: 'Industries Served' },
  { value: '20+', label: 'AI-Powered Tools' },
  { value: '10x', label: 'Faster Than Traditional' },
  { value: '90%', label: 'Cost Reduction' },
];

/* ═══════════════════ COMPONENTS ═══════════════════ */

const UseCasesPage = () => {
  usePageMeta({
    title: 'Use Cases | Skyverses - AI for Every Industry',
    description: 'Discover how businesses use Skyverses AI tools across content creation, e-commerce, marketing, fashion, real estate, and education.',
    keywords: 'AI use cases, Skyverses industries, AI content creation, AI marketing, AI fashion',
    canonical: '/use-cases'
  });

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  return (
    <div className="bg-[#050507] min-h-screen text-white font-sans overflow-x-hidden pt-16">

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial="hidden" animate={heroInView ? "visible" : "hidden"} variants={staggerContainer}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <motion.div variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-8"
          >
            <TrendingUp size={14} /> Industry Solutions
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            AI That Works for{' '}
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Your Industry
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            See how creators, businesses, and enterprises use Skyverses to transform their workflows
            and produce professional content 10x faster.
          </motion.p>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section ref={statsRef} className="py-6 px-6 max-w-5xl mx-auto">
        <motion.div
          initial="hidden" animate={statsInView ? "visible" : "hidden"} variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {STATS.map((s, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center"
            >
              <div className="text-3xl font-black bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-1">{s.value}</div>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── USE CASE CARDS ── */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="space-y-8">
          {USE_CASE_CATEGORIES.map((cat, idx) => {
            const cardRef = useRef(null);
            const cardInView = useInView(cardRef, { once: true, margin: "-80px" });

            return (
              <motion.div
                key={idx} ref={cardRef}
                initial={{ opacity: 0, y: 40 }}
                animate={cardInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 transition-all duration-500"
              >
                {/* Top gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${cat.gradient} opacity-0 group-hover:opacity-60 transition-opacity`} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Left: Info */}
                  <div className="lg:col-span-4 p-8 lg:p-10 flex flex-col justify-between border-r border-white/5">
                    <div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white mb-5 shadow-lg`}>
                        {cat.icon}
                      </div>
                      <h3 className="text-2xl font-black mb-1">{cat.title}</h3>
                      <p className="text-sm text-gray-500 mb-6">{cat.subtitle}</p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {cat.tools.map((tool, i) => (
                          <span key={i} className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-white/5 text-gray-400 border border-white/5">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link to={cat.cta.route}
                      className={`group/btn mt-auto inline-flex items-center gap-2 bg-gradient-to-r ${cat.gradient} text-white px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg w-fit`}
                    >
                      {cat.cta.label} <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Right: Use cases list */}
                  <div className="lg:col-span-8 p-8 lg:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cat.cases.map((c, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group/item">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Star size={10} className="text-white" />
                          </div>
                          <p className="text-sm text-gray-400 group-hover/item:text-gray-300 leading-relaxed transition-colors">{c}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/80 via-slate-900/80 to-blue-950/80 backdrop-blur-xl p-12 md:p-20 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gradient-to-b from-violet-500/20 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-6">
                Don't See Your Industry?
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-10">
                Skyverses AI tools are universal. Whatever you create, our platform adapts to your workflow.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/apps"
                  className="bg-white text-black px-10 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
                >
                  Explore All Tools <ArrowRight size={18} />
                </Link>
                <Link to="/booking"
                  className="px-10 py-4 rounded-2xl font-bold text-sm border border-white/20 hover:bg-white/10 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UseCasesPage;
