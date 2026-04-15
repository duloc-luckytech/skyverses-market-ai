
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { userApi } from '../apis/user';
import { LOGIN_SLIDER_IMAGES } from '../data';
import {
  ChevronLeft, Loader2,
  ArrowRight, Sparkles,
  Cpu, Clapperboard, Check, User,
  TrendingUp, Image as ImageIcon,
  Hammer, Users, Building, Settings, Leaf, Rocket,
  Brain, Dna, Palette, ChevronDown, Gamepad,
  Gift, Camera, Mic, Wand2, Zap, Star, Shield
} from 'lucide-react';
import { Language } from '../types';

// ─── Flag Icon ───────────────────────────────────────────────────────────────
const FlagIcon = ({ code, className = "w-5 h-3.5" }: { code: string; className?: string }) => {
  const map: Record<string, string> = { en: 'us', vi: 'vn', ko: 'kr', ja: 'jp' };
  return <img src={`https://flagcdn.com/w40/${map[code] || code}.png`} className={`${className} object-cover rounded-[2px]`} alt={code} />;
};

// ─── Social Proof Avatars (static demo) ──────────────────────────────────────
const SOCIAL_AVATARS = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/28.jpg',
  'https://randomuser.me/api/portraits/men/75.jpg',
];

// ─── Onboarding Step Data (3 steps, more focused) ────────────────────────────
const ONBOARDING_STEPS = {
  1: {
    title: 'Bạn là ai?',
    desc: 'Chúng tôi sẽ cá nhân hóa trải nghiệm dành riêng cho bạn.',
    field: 'role',
    options: [
      { id: 'creative_director', label: 'Creative Director', sublabel: 'Thương hiệu & Hình ảnh', icon: <Palette />, color: 'from-violet-500/20 to-purple-500/10', border: 'violet' },
      { id: 'growth_marketer', label: 'Growth Marketer', sublabel: 'Quảng cáo & Nội dung', icon: <TrendingUp />, color: 'from-emerald-500/20 to-green-500/10', border: 'emerald' },
      { id: 'ai_architect', label: 'AI Architect', sublabel: 'Prompt & Pipelines', icon: <Cpu />, color: 'from-cyan-500/20 to-blue-500/10', border: 'cyan' },
      { id: 'studio_founder', label: 'Studio Founder', sublabel: 'Game, Design & Media', icon: <Building />, color: 'from-amber-500/20 to-orange-500/10', border: 'amber' },
      { id: 'freelancer', label: 'Freelancer / Cá nhân', sublabel: 'Sáng tạo tự do', icon: <User />, color: 'from-pink-500/20 to-rose-500/10', border: 'pink' },
      { id: 'student', label: 'Sinh viên / Học viên', sublabel: 'Nghiên cứu & Thực hành', icon: <Rocket />, color: 'from-sky-500/20 to-indigo-500/10', border: 'sky' },
    ]
  },
  2: {
    title: 'Bạn muốn tạo gì?',
    desc: 'Chọn tối đa 2 mục tiêu chính để Skyverses tối ưu cho bạn.',
    field: 'goals',
    options: [
      { id: 'ai_image', label: 'Hình ảnh AI', sublabel: 'Key visual, concept art', icon: <ImageIcon />, color: 'from-blue-500/20 to-indigo-500/10', border: 'blue' },
      { id: 'ai_video', label: 'Video & Motion', sublabel: 'Shorts, cinematic, ads', icon: <Clapperboard />, color: 'from-purple-500/20 to-violet-500/10', border: 'purple' },
      { id: 'game_assets', label: 'Game & 3D', sublabel: 'Characters, UI, VFX', icon: <Gamepad />, color: 'from-emerald-500/20 to-teal-500/10', border: 'emerald' },
      { id: 'voice_music', label: 'Voice & Music', sublabel: 'TTS, nhạc, lồng tiếng', icon: <Mic />, color: 'from-amber-500/20 to-yellow-500/10', border: 'amber' },
      { id: 'product_photo', label: 'Ảnh sản phẩm', sublabel: 'E-commerce, poster', icon: <Camera />, color: 'from-rose-500/20 to-pink-500/10', border: 'rose' },
      { id: 'full_pipeline', label: 'Full Production', sublabel: 'Ý tưởng → sản phẩm', icon: <Hammer />, color: 'from-cyan-500/20 to-sky-500/10', border: 'cyan' },
    ]
  },
  3: {
    title: 'Trình độ của bạn?',
    desc: 'Skyverses sẽ điều chỉnh giao diện và gợi ý phù hợp.',
    field: 'experience',
    options: [
      { id: 'beginner', label: 'Mới bắt đầu', sublabel: 'Muốn trải nghiệm AI lần đầu', icon: <Leaf />, color: 'from-emerald-500/20 to-green-500/10', border: 'emerald' },
      { id: 'intermediate', label: 'Đã có kinh nghiệm', sublabel: 'Từng dùng Midjourney, DALL·E...', icon: <Brain />, color: 'from-blue-500/20 to-indigo-500/10', border: 'blue' },
      { id: 'advanced', label: 'Chuyên nghiệp', sublabel: 'Workflow, batch, API', icon: <Dna />, color: 'from-violet-500/20 to-purple-500/10', border: 'violet' },
      { id: 'expert', label: 'Chuyên gia / Studio', sublabel: 'Sản xuất công nghiệp', icon: <Star />, color: 'from-amber-500/20 to-orange-500/10', border: 'amber' },
    ]
  }
} as const;

const TOTAL_STEPS = 3;

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const LoginPage = () => {
  const { login, loginWithEmail, isAuthenticated, user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  usePageMeta({
    title: 'Đăng nhập | Skyverses — AI Creative Studio',
    description: 'Đăng nhập vào Skyverses để trải nghiệm hơn 30+ công cụ AI sáng tạo cho hình ảnh, video, nhạc và giọng nói.',
    canonical: '/login'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [loginImageIndex, setLoginImageIndex] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);

  const [surveyData, setSurveyData] = useState({
    role: '', goals: [] as string[], experience: ''
  });

  const logoUrl = "/assets/skyverses-logo.png";

  const navigateWithTransition = (path = '/') => {
    setShowTransition(true);
    setTimeout(() => navigate(path), 2200);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const hasDoneOnboarding = localStorage.getItem(`onboarding_complete_${user?.email}`) === 'true';
      if (hasDoneOnboarding) navigateWithTransition('/');
      else if (onboardingStep === 0) setOnboardingStep(1);
    }
  }, [isAuthenticated, user, navigate, onboardingStep]);

  useEffect(() => {
    const interval = setInterval(() => setLoginImageIndex((prev) => (prev + 1) % LOGIN_SLIDER_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLangMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      login();
      setTimeout(() => setIsGoogleLoading(false), 3000);
    }, 1200);
  };

  const handleOnboardingNext = async () => {
    if (onboardingStep < TOTAL_STEPS) {
      setOnboardingStep(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        await userApi.submitOnboarding({
          role: surveyData.role, goals: surveyData.goals,
          experienceLevel: surveyData.experience, complete: true
        });
        localStorage.setItem(`onboarding_complete_${user?.email}`, 'true');
        navigateWithTransition('/');
      } catch (err) { navigateWithTransition('/'); }
      finally { setIsSubmitting(false); }
    }
  };

  const toggleGoal = (id: string) => {
    setSurveyData(prev => {
      const isSelected = prev.goals.includes(id);
      if (isSelected) return { ...prev, goals: prev.goals.filter(g => g !== id) };
      if (prev.goals.length >= 2) return { ...prev, goals: [prev.goals[1], id] };
      return { ...prev, goals: [...prev.goals, id] };
    });
  };

  const isNextDisabled = () => {
    if (onboardingStep === 1) return !surveyData.role;
    if (onboardingStep === 2) return surveyData.goals.length === 0;
    if (onboardingStep === 3) return !surveyData.experience;
    return false;
  };

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'EN' }, { code: 'vi', name: 'VI' }, { code: 'ko', name: 'KO' }, { code: 'ja', name: 'JA' }
  ];

  // ─── Selection Card (Premium Glassmorphism) ─────────────────────────────────
  const SelectionCard = ({ icon, label, id, field, sublabel, color, borderColor }: any) => {
    const isSelected = field === 'goals' ? surveyData.goals.includes(id) : (surveyData as any)[field] === id;
    return (
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => field === 'goals' ? toggleGoal(id) : setSurveyData({...surveyData, [field]: id})}
        className={`relative p-4 rounded-2xl text-left flex items-center gap-4 transition-all duration-300 group overflow-hidden ${
          isSelected
            ? 'ring-2 ring-brand-blue shadow-lg shadow-brand-blue/10'
            : 'ring-1 ring-white/[0.06] hover:ring-white/[0.12]'
        }`}
        style={{
          background: isSelected
            ? 'linear-gradient(135deg, rgba(0,144,255,0.08), rgba(0,144,255,0.02))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {React.cloneElement(icon as React.ReactElement<{ size?: number; className?: string }>, {
            size: 18,
            className: `${isSelected ? 'text-white' : 'text-white/70'} transition-colors`
          })}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <span className={`text-[13px] font-semibold block leading-tight transition-colors ${isSelected ? 'text-white' : 'text-white/80'}`}>{label}</span>
          {sublabel && <span className="text-[11px] text-white/30 block mt-0.5 leading-tight">{sublabel}</span>}
        </div>

        {/* Checkmark */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/30"
            >
              <Check size={12} strokeWidth={3} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  // ─── Current Step Config ────────────────────────────────────────────────────
  const currentStepData = onboardingStep >= 1 && onboardingStep <= TOTAL_STEPS
    ? ONBOARDING_STEPS[onboardingStep as 1 | 2 | 3]
    : null;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden relative" style={{ background: '#08080c' }}>

      {/* ═══ CUSTOM STYLES ═══ */}
      <style>{`
        @keyframes meshFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(40px, 10px) scale(1.05); }
        }
        @keyframes shimmerText {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(0,144,255,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(0,144,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,144,255,0); }
        }
        .login-mesh-1 { animation: meshFloat 20s ease-in-out infinite; }
        .login-mesh-2 { animation: meshFloat 25s ease-in-out infinite reverse; }
        .login-mesh-3 { animation: meshFloat 18s ease-in-out infinite 5s; }
      `}</style>

      {/* ═══ ANIMATED MESH GRADIENTS (Background) ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="login-mesh-1 absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(0,144,255,0.15) 0%, transparent 70%)' }} />
        <div className="login-mesh-2 absolute -bottom-20 right-[20%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
        <div className="login-mesh-3 absolute top-[30%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)' }} />
      </div>

      {/* ═══ PROGRESS BAR (mobile, onboarding) ═══ */}
      {onboardingStep > 0 && (
        <div className="lg:hidden fixed top-0 left-0 right-0 h-1 z-[100]" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <motion.div
            className="h-full rounded-r-full"
            style={{ background: 'linear-gradient(90deg, #0090ff, #7c3aed)' }}
            animate={{ width: `${(onboardingStep / TOTAL_STEPS) * 100}%` }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>
      )}

      {/* ═══════════ LEFT PANEL ═══════════ */}
      <div className="w-full lg:w-[44%] flex flex-col min-h-screen relative z-20">

        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 lg:px-10 pt-6 lg:pt-8 shrink-0">
          {onboardingStep === 0 ? (
            <Link to="/" className="flex items-center gap-1.5 text-white/30 hover:text-brand-blue transition-colors group">
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[13px] font-medium">{t('login.back')}</span>
            </Link>
          ) : (
            <button onClick={() => setOnboardingStep(prev => Math.max(0, prev - 1))} className="flex items-center gap-1.5 text-white/30 hover:text-brand-blue transition-colors group">
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[13px] font-medium">Quay lại</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
            >
              <FlagIcon code={lang} />
              <ChevronDown size={11} className={`text-white/30 transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full right-0 mt-1 w-16 overflow-hidden z-[160] rounded-xl"
                  style={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
                >
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(false); localStorage.setItem('skyverses_lang_detected', '1'); }}
                      className={`w-full py-2 flex items-center justify-center transition-all ${lang === l.code ? 'bg-brand-blue/10' : 'hover:bg-white/[0.04]'}`}
                    >
                      <FlagIcon code={l.code} />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ═══ MAIN Content ═══ */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-10">
          <div className="w-full max-w-[440px] py-10">
            <AnimatePresence mode="wait">

              {/* ═══════ LOGIN STEP 0 ═══════ */}
              {onboardingStep === 0 && (
                <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }} className="space-y-8">

                  {/* Logo + Title */}
                  <div className="space-y-6">
                    <motion.img
                      src={logoUrl} alt="Skyverses"
                      className="w-11 h-11 object-contain"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    />
                    <div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="flex items-center gap-2 mb-3"
                      >
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em]"
                          style={{
                            background: 'linear-gradient(90deg, rgba(0,144,255,0.12), rgba(139,92,246,0.08))',
                            border: '1px solid rgba(0,144,255,0.2)',
                            color: '#0090ff'
                          }}
                        >
                          <Sparkles size={10} fill="currentColor" />
                          AI Creative Studio
                        </span>
                      </motion.div>

                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl lg:text-[34px] font-bold tracking-tight leading-[1.15]"
                        style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #a0aec0 50%, #ffffff 100%)',
                          backgroundSize: '200% auto',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {t('login.title')}
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="text-sm text-white/35 mt-2 leading-relaxed"
                      >
                        {t('login.subtitle')}
                      </motion.p>
                    </div>
                  </div>

                  {/* ⭐ Free Image Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-2xl p-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(139,92,246,0.04))',
                      border: '1px solid rgba(251,191,36,0.15)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))',
                          border: '1px solid rgba(251,191,36,0.2)',
                        }}
                      >
                        <Gift size={18} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-white/90">🎁 Đăng ký nhận ngay 100 ảnh miễn phí</p>
                        <p className="text-[11px] text-white/30 mt-0.5">Không cần thẻ tín dụng · Bắt đầu tạo ảnh AI ngay</p>
                      </div>
                    </div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.03), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmerText 4s linear infinite',
                      }}
                    />
                  </motion.div>

                  {/* Google Login CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-4"
                  >
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isGoogleLoading}
                      className="group w-full flex items-center justify-center gap-3 py-4 px-4 rounded-2xl transition-all duration-300 disabled:opacity-70"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,144,255,0.3)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(0,144,255,0.1)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
                      }}
                    >
                      {isGoogleLoading ? (
                        <Loader2 size={18} className="animate-spin text-brand-blue" />
                      ) : (
                        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
                      )}
                      <span className="text-sm font-semibold text-white/80">
                        {isGoogleLoading ? 'Đang kết nối...' : t('login.google')}
                      </span>
                    </button>
                  </motion.div>

                  {/* Social Proof */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <div className="flex -space-x-2">
                      {SOCIAL_AVATARS.map((avatar, i) => (
                        <img key={i} src={avatar} className="w-7 h-7 rounded-full object-cover" alt=""
                          style={{ border: '2px solid #08080c' }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className="text-amber-400" fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-[11px] text-white/25 font-medium">30,000+ creators</span>
                    </div>
                  </motion.div>

                  {/* Security + Terms */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-center gap-2 text-[10px] text-white/15 font-medium">
                      <Shield size={10} />
                      <span>Bảo mật bởi Google OAuth 2.0</span>
                    </div>
                    <p className="text-[11px] text-white/15 text-center leading-relaxed">
                      Bằng cách tiếp tục, bạn đồng ý với{' '}
                      <a href="/policy" className="underline hover:text-brand-blue transition-colors">Chính sách bảo mật</a>{' '}và{' '}
                      <a href="/policy" className="underline hover:text-brand-blue transition-colors">Điều khoản sử dụng</a>.
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* ═══════ ONBOARDING STEPS 1-3 ═══════ */}
              {onboardingStep >= 1 && onboardingStep <= TOTAL_STEPS && currentStepData && (
                <motion.div
                  key={`step-${onboardingStep}`}
                  initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-7"
                >
                  {/* Step Header */}
                  <div className="space-y-4">
                    {/* Progress Segments */}
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map(s => (
                        <div key={s} className="h-1.5 flex-1 rounded-full transition-all duration-500 overflow-hidden"
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #0090ff, #7c3aed)' }}
                            initial={{ width: 0 }}
                            animate={{ width: s <= onboardingStep ? '100%' : '0%' }}
                            transition={{ duration: 0.5, delay: s <= onboardingStep ? (s - 1) * 0.1 : 0 }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">
                          Bước {onboardingStep}/{TOTAL_STEPS}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">{currentStepData.title}</h2>
                      <p className="text-sm text-white/35 mt-1.5 leading-relaxed">{currentStepData.desc}</p>
                    </div>
                  </div>

                  {/* Selection Cards Grid */}
                  <div className={`grid gap-3 ${currentStepData.options.length <= 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {currentStepData.options.map((opt: any) => (
                      <SelectionCard
                        key={opt.id}
                        field={currentStepData.field}
                        id={opt.id}
                        label={opt.label}
                        sublabel={opt.sublabel}
                        icon={opt.icon}
                        color={opt.color}
                        borderColor={opt.border}
                      />
                    ))}
                  </div>

                  {/* Continue Button */}
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={isSubmitting || isNextDisabled()}
                    onClick={handleOnboardingNext}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-20"
                    style={{
                      background: isNextDisabled()
                        ? 'rgba(255,255,255,0.05)'
                        : 'linear-gradient(135deg, #0090ff, #0070cc)',
                      color: 'white',
                      boxShadow: isNextDisabled() ? 'none' : '0 8px 32px rgba(0,144,255,0.25)',
                    }}
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {onboardingStep === TOTAL_STEPS ? (
                      <>
                        <Sparkles size={16} fill="currentColor" />
                        Bắt đầu sáng tạo
                      </>
                    ) : (
                      <>
                        Tiếp tục
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>

                  {/* Skip option */}
                  <button
                    onClick={() => {
                      localStorage.setItem(`onboarding_complete_${user?.email}`, 'true');
                      navigateWithTransition('/');
                    }}
                    className="w-full text-center text-[11px] font-medium text-white/15 hover:text-white/30 transition-colors py-1"
                  >
                    Bỏ qua, trải nghiệm ngay
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL — Cinematic Showcase ═══════════ */}
      <div className="hidden lg:block w-[56%] relative overflow-hidden">

        {/* Top edge gradient — blends panel into background */}
        <div className="absolute top-0 left-0 right-0 h-8 z-20 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #08080c, transparent)' }} />

        {/* Video Demo Strip — 2 videos side-by-side at top of right panel */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-0.5" style={{ height: '35%' }}>
          {['https://cdn.seedance2.ai/examples/seedance2/18.mp4', 'https://cdn.seedance2.ai/examples/seedance2/13.mp4'].map((src, i) => (
            <video
              key={i}
              src={src}
              autoPlay
              muted
              loop
              playsInline
              className="flex-1 h-full object-cover"
            />
          ))}
          {/* Bottom fade — blends video strip into image slider below */}
          <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to bottom, transparent, #08080c)' }} />
        </div>

        {/* Image Slider with Ken Burns */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`slider-${loginImageIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <img
              src={LOGIN_SLIDER_IMAGES[loginImageIndex]}
              className="w-full h-full object-cover"
              alt=""
              style={{ animation: 'kenBurns 10s ease-out forwards' }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 z-10" style={{
          background: 'linear-gradient(to top, rgba(8,8,12,0.95) 0%, rgba(8,8,12,0.3) 40%, rgba(8,8,12,0.15) 100%)'
        }} />
        <div className="absolute inset-0 z-10" style={{
          background: 'linear-gradient(to right, rgba(8,8,12,0.6) 0%, transparent 30%)'
        }} />

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-12 lg:p-16 z-20">
          <div className="space-y-5 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-brand-blue" fill="currentColor" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-blue">Powered by AI</span>
              </div>
              <h2 className="text-4xl lg:text-[44px] font-bold text-white leading-[1.08] tracking-tight">
                Sáng tạo
                <br />
                <span style={{
                  background: 'linear-gradient(90deg, #0090ff, #7c3aed, #ec4899)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmerText 4s linear infinite',
                }}>
                  không giới hạn
                </span>
              </h2>
              <p className="text-sm text-white/30 mt-4 leading-relaxed max-w-sm">
                Hơn 30+ công cụ AI cho hình ảnh, video, nhạc và giọng nói. Bắt đầu miễn phí ngay hôm nay.
              </p>
            </motion.div>

            {/* Stat Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 flex-wrap"
            >
              {[
                { icon: <ImageIcon size={12} />, text: '30+ AI Tools' },
                { icon: <Zap size={12} />, text: '100 Free Images' },
                { icon: <Shield size={12} />, text: 'Enterprise Grade' },
              ].map((pill, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold text-white/40"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {pill.icon}
                  {pill.text}
                </span>
              ))}
            </motion.div>

            {/* Dots */}
            <div className="flex gap-1.5 pt-1">
              {LOGIN_SLIDER_IMAGES.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === loginImageIndex ? 24 : 6 }}
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    background: i === loginImageIndex
                      ? 'linear-gradient(90deg, #0090ff, #7c3aed)'
                      : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ GLOBAL TRANSITION OVERLAY ═══════════ */}
      <AnimatePresence>
        {showTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
            style={{ background: '#08080c' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <img src={logoUrl} alt="Skyverses" className="w-14 h-14 object-contain relative z-10" />
                <motion.div
                  className="absolute -inset-4 rounded-2xl"
                  style={{
                    border: '2px solid rgba(0,144,255,0.15)',
                    animation: 'pulseRing 2s ease-in-out infinite',
                  }}
                />
                <div className="absolute -inset-8 rounded-[2rem] opacity-20"
                  style={{ background: 'radial-gradient(circle, rgba(0,144,255,0.3) 0%, transparent 70%)' }} />
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-brand-blue"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay }}
                    />
                  ))}
                </div>
                <p className="text-[13px] font-medium text-white/30">Đang khởi tạo workspace...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;