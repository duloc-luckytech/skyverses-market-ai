
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
  Brain, Dna, Palette, Languages, ChevronDown, Gamepad
} from 'lucide-react';
import { Language } from '../types';

const FlagIcon = ({ code, className = "w-5 h-3.5" }: { code: string; className?: string }) => {
  const map: Record<string, string> = { en: 'us', vi: 'vn', ko: 'kr', ja: 'jp' };
  return <img src={`https://flagcdn.com/w40/${map[code] || code}.png`} className={`${className} object-cover rounded-[2px]`} alt={code} />;
};

const LoginPage = () => {
  const { login, loginWithEmail, isAuthenticated, user } = useAuth();
  // Note: loginWithEmail kept for onboarding flow compatibility
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  usePageMeta({
    title: 'Đăng nhập | Skyverses',
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
    role: '', goals: [] as string[], workingStyle: '', experience: ''
  });

  const logoUrl = "/assets/skyverses-logo.png";

  const navigateWithTransition = (path = '/') => {
    setShowTransition(true);
    setTimeout(() => navigate(path), 2000);
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
    if (onboardingStep < 4) {
      setOnboardingStep(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        await userApi.submitOnboarding({
          role: surveyData.role, goals: surveyData.goals,
          workStyle: surveyData.workingStyle, experienceLevel: surveyData.experience, complete: true
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
    if (onboardingStep === 3) return !surveyData.workingStyle;
    if (onboardingStep === 4) return !surveyData.experience;
    return false;
  };

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'EN' }, { code: 'vi', name: 'VI' }, { code: 'ko', name: 'KO' }, { code: 'ja', name: 'JA' }
  ];

  // — Selection Card for Onboarding —
  const SelectionCard = ({ icon, label, id, field, sublabel }: any) => {
    const isSelected = field === 'goals' ? surveyData.goals.includes(id) : (surveyData as any)[field] === id;
    return (
      <button 
        onClick={() => field === 'goals' ? toggleGoal(id) : setSurveyData({...surveyData, [field]: id})}
        className={`p-4 border transition-all text-left flex items-center gap-3.5 rounded-xl group relative ${
          isSelected 
            ? 'border-brand-blue bg-brand-blue/[0.04] dark:bg-brand-blue/[0.06]' 
            : 'border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-brand-blue/30'
        }`}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
          isSelected ? 'bg-brand-blue text-white' : 'bg-slate-50 dark:bg-white/[0.04] text-slate-400 group-hover:text-brand-blue'
        }`}>
          {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 16 })}
        </div>
        <div className="min-w-0">
          <span className="text-[13px] font-semibold text-slate-800 dark:text-white block leading-tight">{label}</span>
          {sublabel && <span className="text-[11px] text-slate-400 dark:text-gray-500 block mt-0.5 leading-tight">{sublabel}</span>}
        </div>
        {isSelected && (
          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center">
            <Check size={11} strokeWidth={3} className="text-white" />
          </div>
        )}
      </button>
    );
  };

  // — Onboarding Step Data —
  const stepData: Record<number, { title: string; desc: string }> = {
    1: { title: 'Vai trò của bạn', desc: 'Chúng tôi sẽ tùy chỉnh trải nghiệm phù hợp với bạn.' },
    2: { title: 'Mục tiêu chính', desc: 'Bạn muốn xây dựng gì với Skyverses? (Chọn tối đa 2)' },
    3: { title: 'Phong cách làm việc', desc: 'Bạn thường làm việc như thế nào?' },
    4: { title: 'Trình độ kinh nghiệm', desc: 'Chúng tôi sẽ điều chỉnh công cụ phù hợp.' },
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#0a0a0c] text-black dark:text-white transition-colors duration-300 overflow-hidden">
      
      {/* Progress bar (mobile, onboarding only) */}
      {onboardingStep > 0 && (
        <div className="lg:hidden fixed top-0 left-0 right-0 h-0.5 z-[100] bg-black/5 dark:bg-white/5">
          <motion.div className="h-full bg-brand-blue" animate={{ width: `${(onboardingStep / 4) * 100}%` }} transition={{ type: 'spring', damping: 20 }} />
        </div>
      )}

      {/* ═══════════ LEFT PANEL ═══════════ */}
      <div className="w-full lg:w-[44%] flex flex-col min-h-screen relative z-20 bg-white dark:bg-[#0a0a0c]">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 lg:px-10 pt-6 lg:pt-8 shrink-0">
          {onboardingStep === 0 ? (
            <Link to="/" className="flex items-center gap-1.5 text-slate-400 hover:text-brand-blue transition-colors group">
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[13px] font-medium">{t('login.back')}</span>
            </Link>
          ) : (
            <button onClick={() => setOnboardingStep(prev => Math.max(0, prev - 1))} className="flex items-center gap-1.5 text-slate-400 hover:text-brand-blue transition-colors group">
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[13px] font-medium">Quay lại</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all">
              <FlagIcon code={lang} />
              <ChevronDown size={11} className={`text-slate-400 transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full right-0 mt-1 w-16 bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.06] shadow-xl rounded-lg overflow-hidden z-[160]"
                >
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(false); localStorage.setItem('skyverses_lang_detected', '1'); }}
                      className={`w-full py-2 flex items-center justify-center transition-all ${lang === l.code ? 'bg-brand-blue/8' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'}`}
                    >
                      <FlagIcon code={l.code} />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Content — Centered */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-10">
          <div className="w-full max-w-[400px] py-10">
            <AnimatePresence mode="wait">

              {/* ═══════ LOGIN STEP ═══════ */}
              {onboardingStep === 0 && (
                <motion.div key="login" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-8">
                  
                  {/* Logo + Title */}
                  <div className="space-y-4">
                    <img src={logoUrl} alt="Skyverses" className="w-10 h-10 object-contain" />
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">{t('login.title')}</h1>
                      <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">{t('login.subtitle')}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Google Login */}
                    <button 
                      onClick={handleGoogleLogin}
                      disabled={isGoogleLoading}
                      className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] rounded-xl hover:border-black/20 dark:hover:border-white/20 hover:shadow-md transition-all disabled:opacity-70"
                    >
                      {isGoogleLoading ? (
                        <Loader2 size={18} className="animate-spin text-brand-blue" />
                      ) : (
                        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
                      )}
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-200">
                        {isGoogleLoading ? 'Đang kết nối...' : t('login.google')}
                      </span>
                    </button>
                  </div>

                  {/* Terms */}
                  <p className="text-[11px] text-slate-300 dark:text-gray-600 text-center leading-relaxed">
                    Bằng cách tiếp tục, bạn đồng ý với{' '}
                    <a href="/privacy-policy" className="underline hover:text-brand-blue transition-colors">Chính sách bảo mật</a>{' '}và{' '}
                    <a href="/terms-of-use-agreement" className="underline hover:text-brand-blue transition-colors">Điều khoản sử dụng</a>.
                  </p>
                </motion.div>
              )}

              {/* ═══════ ONBOARDING STEPS ═══════ */}
              {onboardingStep >= 1 && onboardingStep <= 4 && (
                <motion.div 
                  key={`step-${onboardingStep}`} 
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Step Header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {[1,2,3,4].map(s => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= onboardingStep ? 'bg-brand-blue' : 'bg-black/[0.06] dark:bg-white/[0.06]'}`} />
                      ))}
                    </div>
                    <div className="pt-2">
                      <p className="text-[11px] font-medium text-brand-blue mb-1">Bước {onboardingStep} / 4</p>
                      <h2 className="text-xl font-bold tracking-tight">{stepData[onboardingStep]?.title}</h2>
                      <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">{stepData[onboardingStep]?.desc}</p>
                    </div>
                  </div>
                  
                  {/* Selection Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {onboardingStep === 1 && (
                      <>
                        <SelectionCard field="role" id="creative_director" label="Creative Director" sublabel="Thương hiệu, hình ảnh" icon={<Palette />} />
                        <SelectionCard field="role" id="growth_marketer" label="Growth Marketer" sublabel="Quảng cáo, nội dung" icon={<TrendingUp />} />
                        <SelectionCard field="role" id="ai_architect" label="AI Architect" sublabel="Prompt, pipelines" icon={<Cpu />} />
                        <SelectionCard field="role" id="studio_founder" label="Studio Founder" sublabel="Game, design, media" icon={<Building />} />
                      </>
                    )}
                    {onboardingStep === 2 && (
                      <>
                        <SelectionCard field="goals" id="ai_image" label="Hình ảnh & Visual" sublabel="Concept, key visual" icon={<ImageIcon />} />
                        <SelectionCard field="goals" id="ai_video" label="Video & Motion" sublabel="Shorts, cinematic" icon={<Clapperboard />} />
                        <SelectionCard field="goals" id="game_assets" label="Game & Prototyping" sublabel="Characters, UI, VFX" icon={<Gamepad />} />
                        <SelectionCard field="goals" id="prompt_workflow" label="Prompt Workflows" sublabel="Batch jobs, pipelines" icon={<Brain />} />
                        <SelectionCard field="goals" id="full_pipeline" label="Full Production" sublabel="Ý tưởng → sản phẩm" icon={<Hammer />} />
                      </>
                    )}
                    {onboardingStep === 3 && (
                      <>
                        <SelectionCard field="workingStyle" id="solo" label="Cá nhân" sublabel="Làm việc độc lập" icon={<User />} />
                        <SelectionCard field="workingStyle" id="small_team" label="Nhóm nhỏ (2–5)" sublabel="Designer, marketer, dev" icon={<Users />} />
                        <SelectionCard field="workingStyle" id="studio" label="Studio / Agency" sublabel="Đa dự án, quy mô" icon={<Building />} />
                        <SelectionCard field="workingStyle" id="hybrid" label="Hybrid (AI + Con người)" sublabel="Tự động hóa + kiểm soát" icon={<Settings />} />
                      </>
                    )}
                    {onboardingStep === 4 && (
                      <>
                        <SelectionCard field="experience" id="beginner" label="Mới bắt đầu" sublabel="Preset dễ sử dụng" icon={<Leaf />} />
                        <SelectionCard field="experience" id="intermediate" label="Trung cấp" sublabel="Tuỳ chỉnh nâng cao" icon={<Rocket />} />
                        <SelectionCard field="experience" id="advanced" label="Nâng cao / Pro" sublabel="Kiểm soát sâu" icon={<Brain />} />
                        <SelectionCard field="experience" id="expert" label="Chuyên gia" sublabel="Sản xuất công nghiệp" icon={<Dna />} />
                      </>
                    )}
                  </div>

                  {/* Next Button */}
                  <button 
                    disabled={isSubmitting || isNextDisabled()}
                    onClick={handleOnboardingNext}
                    className="w-full py-3 bg-brand-blue text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-30"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {onboardingStep === 4 ? 'Bắt đầu sáng tạo' : 'Tiếp tục'}
                    {!isSubmitting && <ArrowRight size={16} />}
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL — Image Showcase ═══════════ */}
      <div className="hidden lg:block w-[56%] relative overflow-hidden">
        {/* Image Slider */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`slider-${loginImageIndex}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img src={LOGIN_SLIDER_IMAGES[loginImageIndex]} className="w-full h-full object-cover" alt="" />
          </motion.div>
        </AnimatePresence>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-12 lg:p-16 z-20">
          <div className="space-y-6 max-w-lg">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brand-blue" fill="currentColor" />
              <span className="text-xs font-medium text-brand-blue">AI-Powered Creative Studio</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Sáng tạo không giới hạn với <span className="text-brand-blue">Skyverses</span>
            </h2>
            <p className="text-sm text-white/50 leading-relaxed max-w-md">
              Nền tảng AI hàng đầu cho sản xuất hình ảnh, video, game assets và workflow tự động hóa.
            </p>

            {/* Dots */}
            <div className="flex gap-1.5 pt-2">
              {LOGIN_SLIDER_IMAGES.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === loginImageIndex ? 'w-8 bg-brand-blue' : 'w-2 bg-white/20'}`} />
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
            className="fixed inset-0 z-[9999] bg-white dark:bg-[#0a0a0c] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <img src={logoUrl} alt="Skyverses" className="w-14 h-14 object-contain" />
                <motion.div
                  className="absolute -inset-3 border-2 border-brand-blue/20 rounded-2xl"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-1 h-1 rounded-full bg-brand-blue"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-1 h-1 rounded-full bg-brand-blue"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-1 h-1 rounded-full bg-brand-blue"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <p className="text-[13px] font-medium text-slate-400 dark:text-gray-500">Đang khởi tạo workspace...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;