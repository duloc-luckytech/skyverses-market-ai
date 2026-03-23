
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Video, ImageIcon, Music, Mic, Sparkles, ArrowRight,
  Zap, Globe2, Shield, Users, Cpu, Rocket,
  Star, Heart, TrendingUp, Code2, Layers, Bot,
  ChevronRight, Play, Eye, Camera, Palette
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../context/LanguageContext';

/* ═══════════════════════════════════════════ */
/*            ANIMATION VARIANTS              */
/* ═══════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

/* ═══════════════════════════════════════════ */
/*                  DATA                      */
/* ═══════════════════════════════════════════ */
const STATS = [
  { value: '20+', label: 'AI Models', icon: <Cpu size={18} /> },
  { value: '50K+', label: 'Creations Generated', icon: <Sparkles size={18} /> },
  { value: '99.9%', label: 'Uptime', icon: <Shield size={18} /> },
  { value: '< 3s', label: 'Avg Response', icon: <Zap size={18} /> },
];

const PRODUCTS = [
  { name: 'Video AI', desc: 'Text, image → cinematic video. VEO3, WAN, Gommo engines.', icon: <Video size={22} />, color: 'from-violet-500 to-purple-600', route: '/product/ai-video-generator' },
  { name: 'Image AI', desc: 'Generate, edit, upscale — any style, any resolution.', icon: <ImageIcon size={22} />, color: 'from-blue-500 to-cyan-500', route: '/product/ai-image-generator' },
  { name: 'Music AI', desc: 'From text to full instrumentals. Custom voices & sounds.', icon: <Music size={22} />, color: 'from-pink-500 to-rose-500', route: '/product/ai-music-generator' },
  { name: 'Voice AI', desc: 'Text-to-speech, voice cloning, audio design studio.', icon: <Mic size={22} />, color: 'from-amber-500 to-orange-500', route: '/product/voice-design-ai' },
  { name: 'Fashion AI', desc: 'Virtual try-on, AI stylist, product photography.', icon: <Camera size={22} />, color: 'from-emerald-500 to-teal-500', route: '/product/ai-stylist' },
  { name: 'Design AI', desc: 'Poster, marketing, comic engine & 3D spatial.', icon: <Palette size={22} />, color: 'from-indigo-500 to-blue-600', route: '/product/poster-marketing-ai' },
];

const VALUES = [
  { title: 'Creator-First', desc: 'Every tool is designed for creators — not engineers. Beautiful, fast, intuitive.', icon: <Heart size={24} /> },
  { title: 'AI-Native', desc: 'Built on cutting-edge models: VEO3, WAN, Flux, GPT. Always the latest.', icon: <Bot size={24} /> },
  { title: 'Fair Pricing', desc: 'Pay-per-credit model. No subscriptions, no lock-in. Only pay for what you create.', icon: <Star size={24} /> },
  { title: 'Vietnamese Innovation', desc: 'Proudly built in Vietnam. Designed for the global creator economy.', icon: <Globe2 size={24} /> },
];

const TECH_STACK = [
  'React', 'TypeScript', 'Node.js', 'MongoDB', 'Vite',
  'Google Cloud', 'VEO3', 'WAN AI', 'Flux', 'Gommo',
  'FFmpeg', 'PM2', 'TailwindCSS', 'Framer Motion'
];

/* ═══════════════════════════════════════════ */
/*                SECTION: HERO               */
/* ═══════════════════════════════════════════ */
const HeroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      <motion.div
        initial="hidden" animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="relative z-10 max-w-5xl mx-auto text-center px-6 py-32"
      >
        <motion.div variants={fadeUp} custom={0}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-8"
        >
          <Sparkles size={14} /> AI Creative Platform
        </motion.div>

        <motion.h1 variants={fadeUp} custom={1}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8"
        >
          We Are{' '}
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Skyverses
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} custom={2}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12"
        >
          The all-in-one AI creative platform powering the next generation of content creators.
          Generate stunning videos, images, music, and voices — all from one unified workspace.
        </motion.p>

        <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/apps"
            className="group bg-gradient-to-r from-violet-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105 transition-all"
          >
            Explore Products <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/credits"
            className="px-8 py-4 rounded-2xl font-bold text-sm border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-3"
          >
            <Zap size={16} /> Get Credits
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ═══════════════════════════════════════════ */
/*              SECTION: STATS                */
/* ═══════════════════════════════════════════ */
const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-6 px-6 max-w-6xl mx-auto">
      <motion.div
        initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {STATS.map((s, i) => (
          <motion.div key={i} variants={fadeUp} custom={i}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-500"
          >
            <div className="text-violet-400 flex justify-center mb-3 opacity-60 group-hover:opacity-100 transition-opacity">{s.icon}</div>
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-1">{s.value}</div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

/* ═══════════════════════════════════════════ */
/*            SECTION: PRODUCTS               */
/* ═══════════════════════════════════════════ */
const ProductsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
        <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            One Platform, <span className="text-violet-400">Every Medium</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From text to cinematic video, photorealistic images, original music, and natural voices —
            Skyverses unifies the entire creative pipeline.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map((p, i) => (
            <motion.div key={i} variants={fadeUp} custom={i + 1}>
              <Link to={p.route}
                className="group block relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:border-white/20 transition-all duration-500 h-full"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${p.color} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-700`} />

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  {p.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{p.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{p.desc}</p>
                <span className="text-violet-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Try Now <ChevronRight size={14} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

/* ═══════════════════════════════════════════ */
/*             SECTION: VALUES                */
/* ═══════════════════════════════════════════ */
const ValuesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              What Drives <span className="text-blue-400">Us</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Our core principles shape every feature, every pixel, every model we deploy.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {VALUES.map((v, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 1}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:border-violet-500/20 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
                    {v.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════ */
/*            SECTION: TECH STACK             */
/* ═══════════════════════════════════════════ */
const TechSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
          <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Built With <span className="text-cyan-400">Modern Tech</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Enterprise-grade infrastructure powering creative AI at scale.</p>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="flex flex-wrap justify-center gap-3">
            {TECH_STACK.map((tech, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.03] border border-white/5 text-gray-400 hover:border-cyan-500/30 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════ */
/*            SECTION: FINAL CTA              */
/* ═══════════════════════════════════════════ */
const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6">
      <motion.div
        initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}
        className="max-w-5xl mx-auto relative"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/80 via-slate-900/80 to-blue-950/80 backdrop-blur-xl p-12 md:p-20 text-center">
          {/* Decorative */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-b from-violet-500/20 to-transparent blur-3xl pointer-events-none" />

          <motion.div variants={fadeUp} custom={0} className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Ready to
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> Create?</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
              Join thousands of creators already using Skyverses to produce professional content at the speed of thought.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/apps"
                className="group bg-white text-black px-10 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-white/10"
              >
                Start Creating <Rocket size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/credits"
                className="px-10 py-4 rounded-2xl font-bold text-sm border border-white/20 hover:bg-white/10 transition-all flex items-center gap-3"
              >
                View Pricing <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

/* ═══════════════════════════════════════════ */
/*                  MAIN PAGE                 */
/* ═══════════════════════════════════════════ */
const AboutPage = () => {
  usePageMeta({
    title: 'About Skyverses | AI Creative Platform',
    description: 'Skyverses is the all-in-one AI creative platform for video, image, music, and voice generation. Built in Vietnam for the global creator economy.',
    keywords: 'Skyverses, about, AI platform, video generator, image generator, Vietnamese AI',
    canonical: '/about'
  });

  return (
    <div className="bg-[#050507] min-h-screen text-white font-sans overflow-x-hidden pt-16">
      <HeroSection />
      <StatsSection />
      <ProductsSection />
      <ValuesSection />
      <TechSection />
      <CTASection />
    </div>
  );
};

export default AboutPage;
