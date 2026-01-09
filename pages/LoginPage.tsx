import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { userApi } from '../apis/user';
import { LOGIN_SLIDER_IMAGES } from '../data';
import { 
  ChevronLeft, Mail, CheckCircle2, Loader2, 
  Zap, ArrowRight, Sparkles, LayoutGrid,
  Bot, Film, Gamepad, ShoppingBag, Globe,
  Cpu, Clapperboard, Lock, Check, User, ShieldAlert,
  Twitter, TrendingUp, Puzzle, Image as ImageIcon,
  Hammer, Users, Building, Settings, Leaf, Rocket,
  Brain, Dna, Palette, Languages, ChevronDown
} from 'lucide-react';
import { Language } from '../types';
import { handleAdminQuickLogin } from '../utils/adminAuth';

const FlagIcon = ({ code, className = "w-5 h-3.5" }: { code: string; className?: string }) => {
  const map: Record<string, string> = { en: 'us', vi: 'vn', ko: 'kr', ja: 'jp' };
  return (
    <img 
      src={`https://flagcdn.com/w40/${map[code] || code}.png`} 
      className={`${className} object-cover rounded-[1px] shadow-sm border border-black/5 dark:border-white/5`} 
      alt={code} 
    />
  );
};

const LoginPage = () => {
  const { login, mockLogin, loginWithEmail, isAuthenticated, user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminLogging, setIsAdminLogging] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0); 
  const [loginImageIndex, setLoginImageIndex] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  const langRef = useRef<HTMLDivElement>(null);

  const [surveyData, setSurveyData] = useState({
    role: '',
    goals: [] as string[],
    workingStyle: '',
    experience: ''
  });

  const logoUrl = "https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268";

  useEffect(() => {
    if (isAuthenticated) {
      const hasDoneOnboarding = localStorage.getItem(`onboarding_complete_${user?.email || email}`) === 'true';
      if (hasDoneOnboarding) {
        navigate('/');
      } else if (onboardingStep === 0) {
        setOnboardingStep(1);
      }
    }
  }, [isAuthenticated, user, email, navigate, onboardingStep]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoginImageIndex((prev) => (prev + 1) % LOGIN_SLIDER_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSocialLogin = () => {
    login();
  };

  const handleStartOnboardingEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsSubmitting(true);
    const hasDoneOnboarding = localStorage.getItem(`onboarding_complete_${email}`) === 'true';

    if (hasDoneOnboarding) {
      try {
        const success = await loginWithEmail(email, name);
        if (success) {
          navigate('/');
          return;
        }
      } catch (err) {
        console.error("Login failed:", err);
      }
    }

    setIsSubmitting(false);
    setOnboardingStep(1);
  };

  const onboardingTotalSteps = 4;

  const handleOnboardingNext = async () => {
    if (onboardingStep < onboardingTotalSteps) {
      setOnboardingStep(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        if (!isAuthenticated) {
          const success = await loginWithEmail(email, name);
          if (!success) mockLogin();
        }
        
        const payload = {
          role: surveyData.role,
          goals: surveyData.goals,
          workStyle: surveyData.workingStyle,
          experienceLevel: surveyData.experience,
          complete: true
        };

        await userApi.submitOnboarding(payload);

        const finalEmail = user?.email || email;
        localStorage.setItem(`onboarding_complete_${finalEmail}`, 'true');
        navigate('/');
      } catch (err) {
        console.error("Finalization failed:", err);
        navigate('/');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleGoal = (id: string) => {
    setSurveyData(prev => {
      const isSelected = prev.goals.includes(id);
      if (isSelected) {
        return { ...prev, goals: prev.goals.filter(g => g !== id) };
      } else {
        if (prev.goals.length >= 2) {
          return { ...prev, goals: [prev.goals[1], id] };
        }
        return { ...prev, goals: [...prev.goals, id] };
      }
    });
  };

  const SelectionCard = ({ icon, label, id, field, sublabel }: any) => {
    const isSelected = field === 'goals' 
      ? surveyData.goals.includes(id)
      : (surveyData as any)[field] === id;

    return (
      <button 
        onClick={() => {
          if (field === 'goals') toggleGoal(id);
          else setSurveyData({...surveyData, [field]: id});
        }}
        className={`p-4 sm:p-5 border-2 transition-all text-left flex flex-col gap-2 sm:gap-3 rounded-xl group relative overflow-hidden ${
          isSelected 
            ? 'border-brand-blue bg-brand-blue/5 shadow-[0_0_30px_rgba(0,144,255,0.1)]' 
            : 'border-black/5 dark:border-white/5 bg-white dark:bg-white/5 hover:border-brand-blue/30'
        }`}
      >
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors ${
          isSelected ? 'bg-brand-blue text-white' : 'bg-black/5 dark:bg-white/10 text-gray-400 group-hover:text-brand-blue'
        }`}>
          {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 18 })}
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest block leading-tight">{label}</span>
          {sublabel && <span className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-600 font-bold uppercase leading-tight block">{sublabel}</span>}
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 text-brand-blue">
            <Check size={16} strokeWidth={4} />
          </div>
        )}
      </button>
    );
  };

  const isNextDisabled = () => {
    if (onboardingStep === 1) return !surveyData.role;
    if (onboardingStep === 2) return surveyData.goals.length === 0;
    if (onboardingStep === 3) return !surveyData.workingStyle;
    if (onboardingStep === 4) return !surveyData.experience;
    return false;
  };

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'EN' },
    { code: 'vi', name: 'VI' },
    { code: 'ko', name: 'KO' },
    { code: 'ja', name: 'JA' }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-black text-black dark:text-white transition-colors duration-500 relative overflow-x-hidden">
      
      {onboardingStep > 0 && (
         <div className="lg:hidden fixed top-0 left-0 right-0 h-1 z-[100] bg-black/10 dark:bg-white/10">
            <motion.div 
               className="h-full bg-brand-blue"
               animate={{ width: `${(onboardingStep / 4) * 100}%` }}
               transition={{ type: 'spring', damping: 20 }}
            />
         </div>
      )}

      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 sm:p-10 md:p-16 relative z-20 bg-[#fdfdfe] dark:bg-[#000000] border-r border-black/5 dark:border-white/5 shrink-0 overflow-y-auto min-h-screen">
        
        {onboardingStep === 0 ? (
          <Link to="/" className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 text-gray-400 hover:text-brand-blue transition-colors group z-50">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('login.back')}</span>
          </Link>
        ) : (
          <button 
            onClick={() => setOnboardingStep(prev => prev - 1)}
            className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 text-gray-400 hover:text-brand-blue transition-colors group z-50"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Quay lại</span>
          </button>
        )}

        {/* Language Switcher - Flags Only */}
        <div className="absolute top-6 right-6 sm:top-10 sm:right-10 z-[150]" ref={langRef}>
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/20 rounded-full hover:border-brand-blue/50 transition-all shadow-sm"
          >
            <FlagIcon code={lang} />
            <ChevronDown size={12} className={`text-slate-400 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showLangMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-20 bg-white dark:bg-[#0c0c0e] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-[160]"
              >
                {languages.map((l) => (
                  <button 
                    key={l.code} 
                    onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                    className={`w-full py-3 flex items-center justify-center transition-colors ${lang === l.code ? 'bg-brand-blue/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    <FlagIcon code={l.code} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full max-w-[480px] space-y-8 sm:space-y-12 py-10">
          <AnimatePresence mode="wait">
            {onboardingStep === 0 && (
              <motion.div 
                key="step-login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="space-y-8 sm:space-y-12"
              >
                <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                  <img src={logoUrl} alt="Skyverses" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase italic">{t('login.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">{t('login.subtitle')}</p>
                  </div>
                </div>

                {!showEmailForm ? (
                  <div className="space-y-3">
                    <button 
                      onClick={handleSocialLogin}
                      className="w-full flex items-center justify-center gap-4 py-3.5 sm:py-4 px-6 bg-gray-50 dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all rounded-xl group"
                    >
                      <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
                      <span className="text-xs font-bold opacity-90">{t('login.google')}</span>
                    </button>
                    
                    <button 
                      disabled
                      className="w-full flex items-center justify-center gap-4 py-3.5 sm:py-4 px-6 bg-gray-50 dark:bg-[#0a0a0a] border border-black/5 dark:border-white/10 rounded-xl group opacity-50 cursor-not-allowed grayscale"
                    >
                      <Twitter size={18} className="text-black dark:text-white" fill="currentColor" />
                      <span className="text-xs font-bold opacity-90">{t('login.x')}</span>
                    </button>

                    <button 
                      disabled
                      className="w-full flex items-center justify-center gap-4 py-3.5 sm:py-4 px-6 bg-gray-50 dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 transition-all rounded-xl group opacity-50 cursor-not-allowed grayscale"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5 h-5 dark:invert" alt="Apple" />
                      <span className="text-xs font-bold opacity-90">{t('login.apple')}</span>
                    </button>

                    <div className="pt-4">
                       <button onClick={() => setShowEmailForm(true)} className="w-full text-[10px] font-black uppercase text-gray-400 hover:text-brand-blue transition-colors tracking-widest underline underline-offset-8">Continue with email</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleStartOnboardingEmail} className="space-y-6">
                    <div className="space-y-4">
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 p-4 rounded-xl text-sm font-bold focus:ring-1 focus:ring-brand-blue outline-none text-black dark:text-white" />
                      <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 p-4 rounded-xl text-sm font-bold focus:ring-1 focus:ring-brand-blue outline-none text-black dark:text-white" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight size={18} />} Sign In
                    </button>
                    <button type="button" onClick={() => setShowEmailForm(false)} className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors">Back to social login</button>
                  </form>
                )}
              </motion.div>
            )}

            {onboardingStep >= 1 && onboardingStep <= 4 && (
              <motion.div 
                key={`step-${onboardingStep}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                className="space-y-8 sm:space-y-10"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-brand-blue uppercase tracking-[0.4em] italic">Step 0{onboardingStep} / 04</span>
                  <div className="space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic leading-none">
                      {onboardingStep === 1 ? 'Professional Identity.' : 
                       onboardingStep === 2 ? 'Primary Goal.' : 
                       onboardingStep === 3 ? 'Working Style.' : 
                       'Experience Level.'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                      {onboardingStep === 1 ? 'Tell us who you are — we’ll tailor Skyverses for you.' :
                       onboardingStep === 2 ? 'What do you want to build with Skyverses?' :
                       onboardingStep === 3 ? 'How do you usually work?' :
                       'We’ll match tools & defaults to your level.'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 overflow-visible">
                  {onboardingStep === 1 && (
                    <>
                      <SelectionCard field="role" id="creative_director" label="Creative Director" sublabel="Brand, visual, storytelling" icon={<Palette />} />
                      <SelectionCard field="role" id="growth_marketer" label="Growth Marketer" sublabel="Ads, content, social" icon={<TrendingUp />} />
                      <SelectionCard field="role" id="ai_architect" label="AI Architect" sublabel="Prompt systems, pipelines" icon={<Cpu />} />
                      <SelectionCard field="role" id="studio_founder" label="Studio Founder" sublabel="Game, design, media teams" icon={<Building />} />
                    </>
                  )}

                  {onboardingStep === 2 && (
                    <>
                      <SelectionCard field="goals" id="ai_image" label="Image & Visuals" sublabel="Concept, key visual, ads" icon={<ImageIcon />} />
                      <SelectionCard field="goals" id="ai_video" label="Video & Motion" sublabel="Shorts, scenes, cinematic" icon={<Clapperboard />} />
                      <SelectionCard field="goals" id="game_assets" label="Game & Prototyping" sublabel="Characters, UI, VFX" icon={<Gamepad />} />
                      <SelectionCard field="goals" id="prompt_workflow" label="Prompt Workflows" sublabel="Pipelines, batch jobs" icon={<Brain />} />
                      <SelectionCard field="goals" id="full_pipeline" label="Full Production" sublabel="Idea → delivery" icon={<Hammer />} />
                    </>
                  )}

                  {onboardingStep === 3 && (
                    <>
                      <SelectionCard field="workingStyle" id="solo" label="Solo Creator" sublabel="Individual workflow" icon={<User />} />
                      <SelectionCard field="workingStyle" id="small_team" label="Small Team (2–5)" sublabel="Designer, marketer, dev" icon={<Users />} />
                      <SelectionCard field="workingStyle" id="studio" label="Studio / Agency" sublabel="Multi-project scale" icon={<Building />} />
                      <SelectionCard field="workingStyle" id="hybrid" label="Hybrid (AI + Human)" sublabel="Automation + control" icon={<Settings />} />
                    </>
                  )}

                  {onboardingStep === 4 && (
                    <>
                      <SelectionCard field="experience" id="beginner" label="Beginner" sublabel="Easy-to-use presets" icon={<Leaf />} />
                      <SelectionCard field="experience" id="intermediate" label="Intermediate" sublabel="Custom settings" icon={<Rocket />} />
                      <SelectionCard field="experience" id="advanced" label="Advanced / Pro" sublabel="Deep control, pipelines" icon={<Brain />} />
                      <SelectionCard field="experience" id="expert" label="Expert" sublabel="Industrial production" icon={<Dna />} />
                    </>
                  )}
                </div>

                <button 
                  disabled={isSubmitting || isNextDisabled()}
                  onClick={handleOnboardingNext}
                  className="w-full py-5 sm:py-6 bg-brand-blue text-white rounded-xl text-[11px] font-black uppercase tracking-[0.4em] shadow-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-20"
                >
                  {isSubmitting ? <Loader2 className="animate-spin inline mr-2" size={16} /> : <Check size={16} className="inline mr-2" />}
                  {onboardingStep === 4 ? 'START BUILDING' : 'CONTINUE'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {onboardingStep === 0 && (
          <div className="absolute bottom-16 sm:bottom-10 left-0 right-0 px-8 text-center">
            <p className="text-[10px] sm:text-[12px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed tracking-tight">
              By continuing, I acknowledge the{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-blue transition-colors">Privacy Policy</a>
              {' '}and agree to the{' '}
              <a href="/terms-of-use-agreement" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-blue transition-colors">Terms of Use</a>.
            </p>
          </div>
        )}

        {onboardingStep === 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0">
            <button 
              onClick={() => handleAdminQuickLogin(loginWithEmail, navigate, setIsAdminLogging)}
              disabled={isAdminLogging}
              className="flex items-center gap-2.5 px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-blue transition-all group"
            >
              {isAdminLogging ? (
                <Loader2 size={12} className="animate-spin text-brand-blue" />
              ) : (
                <ShieldAlert size={12} className="group-hover:text-brand-blue transition-colors" />
              )}
              {isAdminLogging ? 'Authenticating...' : 'Admin Hub'}
            </button>
          </div>
        )}
      </div>

      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-black h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={`login-slider-${loginImageIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={LOGIN_SLIDER_IMAGES[loginImageIndex]} 
              className="w-full h-full object-cover" 
              alt="Login Slider"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 bg-black/20 pointer-events-none z-10"></div>
        
        <div className="relative z-20 w-full h-full flex flex-col justify-end p-16 lg:p-24 space-y-12">
           <h2 className="text-[100px] md:text-[120px] font-black uppercase tracking-tighter leading-[0.85] italic text-white drop-shadow-2xl">
             {onboardingStep === 0 ? 'SKYVERSES' : 'BUILDING'} <br /> 
             <span className="text-brand-blue">
               MARKET.
             </span>
           </h2>

           <div className="space-y-6 pl-8 border-l-2 border-brand-blue/40">
              {[
                'AI-Powered Image, Video & Game Assets',
                'Smart Prompt & Creative Workflows',
                'One Platform for Creators, Game Studios & Design Teams'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                   <div className="w-6 h-6 rounded-full border-2 border-brand-blue flex items-center justify-center shadow-[0_0_15px_rgba(0,144,255,0.4)]">
                      <Check size={12} strokeWidth={4} className="text-brand-blue" />
                   </div>
                   <span className="text-[14px] font-black uppercase tracking-[0.2em] text-white/90 group-hover:text-brand-blue transition-colors duration-300">
                      {item}
                   </span>
                </div>
              ))}
           </div>

           {onboardingStep !== 0 && (
             <div className="pt-8 w-full max-w-md">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-brand-blue"
                     animate={{ width: `${(onboardingStep / 4) * 100}%` }}
                     transition={{ type: 'spring', damping: 20 }}
                   />
                </div>
             </div>
           )}

           <div className="flex gap-2">
              {LOGIN_SLIDER_IMAGES.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i === loginImageIndex ? 'w-12 bg-brand-blue shadow-[0_0_10px_rgba(0,144,255,1)]' : 'w-3 bg-white/20'}`} 
                />
              ))}
           </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;