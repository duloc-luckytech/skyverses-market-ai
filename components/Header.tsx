
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Moon, Sun, ChevronRight, Languages, LogOut, 
  User, Settings, CheckCircle2, 
  Zap, ArrowRight, BarChart3, Image as ImageIcon,
  ChevronDown, Bookmark, Loader2, Sparkles,
  Database, HelpCircle, Users, Gift, Plus
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
import CreditPurchaseModal from './CreditPurchaseModal';
import { creditsApi } from '../apis/credits';

const DEFAULT_AVATAR = "https://framerusercontent.com/images/EIgpJkAezmTH65ZZbHE7BDbzD60.png";

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

const DropdownLink = ({ 
  to, 
  icon, 
  label, 
  onClick, 
  external = false 
}: { 
  to: string; 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void; 
  external?: boolean;
}) => {
  const className = "w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-slate-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-all rounded-lg";
  
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
        {icon} {label}
      </a>
    );
  }
  
  return (
    <Link to={to} onClick={onClick} className={className}>
      {icon} {label}
    </Link>
  );
};

interface HeaderProps {
  onOpenLibrary: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenLibrary }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDesktopLang, setShowDesktopLang] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimingDaily, setIsClaimingDaily] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated, credits, claimWelcomeCredits, refreshUserInfo } = useAuth();
  
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowDesktopLang(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClaim = async () => {
    setIsClaiming(true);
    await claimWelcomeCredits();
    setIsClaiming(false);
  };

  const handleClaimDaily = async () => {
    if (isClaimingDaily) return;
    setIsClaimingDaily(true);
    try {
      const res = await creditsApi.claimDaily();
      if (res.success) {
        await refreshUserInfo();
      } else {
        alert(res.message || "Failed to claim daily credits");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClaimingDaily(false);
    }
  };

  const navLinks = [
    { id: '02', name: t('nav.browse'), path: '/market' },
    { id: '03', name: t('nav.explorer'), path: '/explorer' },
    { id: '05', name: t('nav.about'), path: 'https://skyverses.com/', external: true },
  ];

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'EN' },
    { code: 'vi', name: 'VI' },
    { code: 'ko', name: 'KO' },
    { code: 'ja', name: 'JA' }
  ];

  const logoUrl = "https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268";

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-brand-blue z-[160] opacity-50"></div>
      
      <nav className={`fixed w-full z-[150] transition-all duration-500 top-0 ${scrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl h-16 shadow-sm border-b border-black/5 dark:border-white/5' : 'h-20 bg-transparent'}`}>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-full">
          <div className="flex justify-between items-center h-full gap-4">
            
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <img src={logoUrl} alt="Logo" className="w-7 h-7 md:w-9 md:h-9 object-contain" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-xl font-black tracking-tighter italic text-black dark:text-white transition-colors">Skyverses</span>
                  <span className="px-1.5 py-0.5 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[8px] font-black rounded-sm tracking-widest leading-none">BETA</span>
                </div>
                <span className="text-[7px] font-black tracking-[0.4em] uppercase text-brand-blue/70">Market</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-10 ml-10 flex-grow">
              {navLinks.map((link) => (
                link.external ? (
                  <a 
                    key={link.name} href={link.path} target="_blank" rel="noopener noreferrer" 
                    className="text-[13px] font-bold uppercase tracking-widest transition-colors duration-200 text-black/40 dark:text-white/40 hover:text-brand-blue"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link 
                    key={link.name} to={link.path} 
                    className={`text-[13px] font-bold uppercase tracking-widest transition-colors duration-200 ${location.pathname === link.path ? 'text-brand-blue' : 'text-black/40 dark:text-white/40 hover:text-brand-blue'}`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>

            <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
              
              <div className="flex items-center gap-2 md:gap-4">
                {isAuthenticated && (
                  <div className="flex items-center gap-2 md:gap-3">
                    <AnimatePresence>
                      {user?.canDailyClaim && (
                        <motion.button 
                          initial={{ opacity: 0, y: -20, scale: 0.8 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            transition: {
                              y: {
                                repeat: Infinity,
                                repeatType: "mirror",
                                duration: 2,
                                ease: "easeInOut"
                              }
                            }
                          }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          onClick={handleClaimDaily}
                          disabled={isClaimingDaily}
                          className="hidden lg:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          {isClaimingDaily ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} className="animate-bounce" />}
                          <span className="text-[11px] font-black uppercase tracking-wider">Quà</span>
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {user && !user.claimWelcomeCredit && (
                      <button 
                        onClick={handleClaim}
                        disabled={isClaiming}
                        className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadowFLG shadow-orange-500/20 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        {isClaiming ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="animate-pulse" />}
                        <span className="text-[10px] font-black uppercase tracking-wider">Claim +1000</span>
                      </button>
                    )}
                    
                    <Link to="/credits" className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full hover:border-brand-blue/30 transition-all">
                      <Zap size={10} className="text-yellow-500" fill="currentColor" />
                      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white">{(credits || 0).toLocaleString()}</span>
                    </Link>
                  </div>
                )}
                
                <button onClick={toggleTheme} className="hidden md:flex p-2 text-slate-400 dark:text-gray-500 hover:text-brand-blue transition-colors rounded-full">
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>

              {/* Language Switcher - Desktop - Flags Only */}
              <div className="hidden md:block relative" ref={langRef}>
                <button onClick={() => setShowDesktopLang(!showDesktopLang)} className="p-2 text-slate-400 dark:text-gray-500 hover:text-brand-blue transition-colors flex items-center gap-2">
                  <FlagIcon code={lang} />
                  <ChevronDown size={12} className={`transition-transform ${showDesktopLang ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showDesktopLang && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 right-0 w-24 bg-white dark:bg-[#0c0c0e] border border-black/5 dark:border-white/5 shadow-2xl rounded-xl overflow-hidden z-[200]"
                    >
                      {languages.map((l) => (
                        <button key={l.code} onClick={() => { setLang(l.code); setShowDesktopLang(false); }} className={`w-full flex items-center justify-center py-3 transition-colors ${lang === l.code ? 'bg-brand-blue/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                          <FlagIcon code={l.code} />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isAuthenticated ? (
                <div className="relative" ref={userRef}>
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 border border-black/5 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                    <img 
                      src={user?.avatar || user?.picture || DEFAULT_AVATAR} 
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-black/5 dark:border-white/10 object-cover" 
                      alt="Avatar" 
                    />
                    <ChevronDown size={14} className={`hidden md:block text-slate-400 dark:text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-3 right-0 w-64 bg-white dark:bg-[#0c0c0e] border border-black/10 dark:border-white/5 shadow-2xl rounded-2xl p-2 z-[200] overflow-hidden"
                      >
                        <div className="px-4 py-4 border-b border-black/5 dark:border-white/5 mb-1 bg-slate-50/50 dark:bg-white/[0.02] rounded-t-xl">
                            <p className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-1.5">{t('user.menu.credits_label')}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[14px] font-black italic text-slate-900 dark:text-white">{(credits || 0).toLocaleString()} CR</span>
                              <button onClick={() => { setIsPurchaseModalOpen(true); setShowUserMenu(false); }} className="text-[9px] font-black text-brand-blue uppercase hover:underline">Topup +</button>
                            </div>
                        </div>
                        <div className="py-2">
                            <DropdownLink to="/settings" icon={<User size={16}/>} label={t('user.menu.profile')} onClick={() => setShowUserMenu(false)} />
                            <DropdownLink to="/referral" icon={<Users size={16}/>} label={t('user.menu.referral')} onClick={() => setShowUserMenu(false)} />
                            {(user?.email === 'duloc2708@gmail.com') && (
                              <DropdownLink to="/cms-admin-pro" icon={<Database size={16}/>} label={t('user.menu.admin')} onClick={() => setShowUserMenu(false)} />
                            )}
                            <DropdownLink to="/favorites" icon={<Bookmark size={16}/>} label={t('user.menu.favorites')} onClick={() => setShowUserMenu(false)} />
                            <DropdownLink to="/usage" icon={<BarChart3 size={16}/>} label={t('user.menu.usage')} onClick={() => setShowUserMenu(false)} />
                            <DropdownLink to="/settings" icon={<Settings size={16}/>} label={t('user.menu.settings')} onClick={() => setShowUserMenu(false)} />
                            <div className="h-px bg-black/5 dark:bg-white/5 my-1 mx-2"></div>
                            <DropdownLink to="https://skyverses.com/support" external icon={<HelpCircle size={16}/>} label={t('user.menu.support')} onClick={() => setShowUserMenu(false)} />
                        </div>
                        <div className="pt-1 mt-1 border-t border-black/5 dark:border-white/5">
                            <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-lg">
                              <LogOut size={16} /> {t('user.menu.signout')}
                            </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex text-[11px] font-black uppercase tracking-widest px-6 py-2 border border-black/10 dark:border-white/10 text-slate-700 dark:text-white hover:border-brand-blue transition-all rounded-full">
                  {t('nav.login')}
                </Link>
              )}

              <div className="hidden md:flex items-center gap-4">
                <Link to="/booking" className="bg-brand-blue text-white px-8 py-2.5 text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-brand-blue/20 rounded-full">
                  {t('nav.deploy')}
                </Link>
              </div>

              <button onClick={() => setIsOpen(true)} className="md:hidden p-2 text-black dark:text-white bg-black/5 dark:bg-white/5 rounded-full hover:bg-brand-blue/10 transition-colors">
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU DRAWER */}
      <div className={`fixed inset-0 z-[500] transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-[85%] max-sm max-w-sm bg-white dark:bg-[#050506] shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                <span className="text-sm font-black uppercase tracking-widest italic">Skyverses</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-full text-slate-400 dark:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 space-y-10 no-scrollbar">
              <div className="space-y-1">
                 {navLinks.map((link) => (
                    link.external ? (
                      <a key={link.name} href={link.path} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-4 group border-b border-black/[0.03] dark:border-white/[0.03]">
                         <div className="flex items-center gap-5">
                            <span className="text-[10px] font-black text-brand-blue opacity-40">{link.id}</span>
                            <span className="text-xl font-black uppercase tracking-tighter italic transition-all group-hover:translate-x-2 group-hover:text-brand-blue text-slate-800 dark:text-white">{link.name}</span>
                         </div>
                         <ArrowRight size={16} className="text-slate-200 dark:text-gray-800" />
                      </a>
                    ) : (
                      <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="flex items-center justify-between py-4 group border-b border-black/[0.03] dark:border-white/[0.03]">
                         <div className="flex items-center gap-5">
                            <span className="text-[10px] font-black text-brand-blue opacity-40">{link.id}</span>
                            <span className={`text-xl font-black uppercase tracking-tighter italic transition-all group-hover:translate-x-2 ${location.pathname === link.path ? 'text-brand-blue' : 'text-slate-800 dark:text-white'}`}>{link.name}</span>
                         </div>
                         <ChevronRight size={16} className="text-slate-200 dark:text-gray-800" />
                      </Link>
                    )
                 ))}
              </div>

              <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-[0.3em] flex items-center gap-2 px-1">
                    <Languages size={14} /> {t('nav.lang_settings')}
                  </span>
                  
                  {/* Language Selector Mobile - Icons Only */}
                  <div className="grid grid-cols-4 gap-2">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); }}
                        className={`py-3 flex items-center justify-center rounded-lg border transition-all ${lang === l.code ? 'bg-brand-blue border-brand-blue text-white shadow-lg' : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-500 dark:text-gray-500'}`}
                      >
                        <FlagIcon code={l.code} />
                      </button>
                    ))}
                  </div>
                </div>

                {!isAuthenticated && (
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full py-4 bg-brand-blue text-white text-center rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-blue/20">
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-black/5 dark:border-white/5 bg-[#fafafa] dark:bg-[#030304] space-y-6">
               <div className="flex items-center justify-between gap-4">
                  <button onClick={toggleTheme} className="w-12 h-12 flex items-center justify-center border border-black/10 dark:border-white/10 rounded-full text-slate-400 dark:text-gray-500 transition-colors shrink-0">
                     {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  <Link to="/booking" onClick={() => setIsOpen(false)} className="flex-grow flex items-center justify-center gap-3 py-3 bg-brand-blue text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                     {t('nav.deploy')}
                  </Link>
               </div>
               <p className="text-[8px] font-black text-gray-400 text-center uppercase tracking-[0.3em] opacity-50 italic">© 2025 SKYVERSES MARKET</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPurchaseModalOpen && (
          <CreditPurchaseModal 
            isOpen={isPurchaseModalOpen} 
            onClose={() => setIsPurchaseModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
