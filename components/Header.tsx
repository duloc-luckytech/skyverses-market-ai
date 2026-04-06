
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Moon, Sun, ChevronRight, Languages, LogOut,
  User, Settings,
  Zap, ArrowRight, BarChart3,
  ChevronDown, Bookmark, Loader2, Sparkles,
  Database, HelpCircle, Users, Gift, Plus,
  Compass, Box, Search, Command, Layers
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
const CreditPurchaseModal = lazy(() => import('./CreditPurchaseModal'));
import { creditsApi } from '../apis/credits';
import { useSearch } from '../context/SearchContext';

const DEFAULT_AVATAR = "https://framerusercontent.com/images/EIgpJkAezmTH65ZZbHE7BDbzD60.png";

const FlagIcon = ({ code, className = "w-5 h-3.5" }: { code: string; className?: string }) => {
  const map: Record<string, string> = { en: 'us', vi: 'vn', ko: 'kr', ja: 'jp' };
  return (
    <img
      src={`https://flagcdn.com/w40/${map[code] || code}.png`}
      className={`${className} object-cover rounded-[2px] shadow-sm`}
      alt={code}
    />
  );
};

const DropdownLink = ({
  to, icon, label, onClick, external = false
}: {
  to: string; icon: React.ReactNode; label: string; onClick: () => void; external?: boolean;
}) => {
  const cls = "w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-gray-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-all rounded-lg";
  if (external) {
    return <a href={to} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>{icon} {label}</a>;
  }
  return <Link to={to} onClick={onClick} className={cls}>{icon} {label}</Link>;
};

interface HeaderProps {
  onOpenLibrary: () => void;
  resetSearch?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenLibrary, resetSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDesktopLang, setShowDesktopLang] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimingDaily, setIsClaimingDaily] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated, credits, claimWelcomeCredits, refreshUserInfo } = useAuth();
  const search = useSearch();

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowDesktopLang(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) setShowExploreMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); search.toggle(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [search]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (resetSearch) resetSearch();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClaim = async () => { setIsClaiming(true); await claimWelcomeCredits(); setIsClaiming(false); };

  const handleClaimDaily = async () => {
    if (isClaimingDaily) return;
    setIsClaimingDaily(true);
    try {
      const res = await creditsApi.claimDaily();
      if (res.success) await refreshUserInfo();
      else alert(res.message || "Failed to claim daily credits");
    } catch (err) { console.error(err); }
    finally { setIsClaimingDaily(false); }
  };

  const navLinks = [
    { name: t('nav.browse'), path: '/market' },
    ...(isAuthenticated ? [{ name: 'Create', path: '/apps' }] : []),
  ];

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'EN' }, { code: 'vi', name: 'VI' }, { code: 'ko', name: 'KO' }, { code: 'ja', name: 'JA' }
  ];

  const logoUrl = "/assets/skyverses-logo.png";

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/40 to-transparent z-[160]"></div>

      <nav aria-label="Main navigation" className={`fixed w-full z-[150] top-0 transition-all duration-300 ${
        scrolled 
          ? 'h-14 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.04] shadow-sm shadow-black/[0.03] dark:shadow-black/20' 
          : 'h-16 bg-white/50 dark:bg-transparent backdrop-blur-sm'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-full">
          <div className="flex items-center h-full">

            {/* Logo */}
            <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 shrink-0 mr-8">
              <img src={logoUrl} alt="Logo" className="w-7 h-7 object-contain" />
              <span className="text-base font-black tracking-tight text-black dark:text-white">Skyverses</span>
            </Link>

            {/* Nav Links — Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {/* Home */}
              <Link to="/" className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${isActive('/') ? 'text-brand-blue bg-brand-blue/[0.06]' : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}>
                Home
              </Link>

              {/* Marketplace */}
              <Link to="/markets" className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${isActive('/markets') ? 'text-brand-blue bg-brand-blue/[0.06]' : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}>
                Marketplace
              </Link>

              {/* Explore Dropdown */}
              <div className="relative" ref={exploreRef}>
                <button
                  onClick={() => setShowExploreMenu(!showExploreMenu)}
                  onMouseEnter={() => setShowExploreMenu(true)}
                  aria-expanded={showExploreMenu}
                  aria-haspopup="true"
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1 ${
                    location.pathname.startsWith('/explorer') || location.pathname === '/models'
                      ? 'text-brand-blue bg-brand-blue/[0.06]' 
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                  }`}
                >
                  {t('nav.explore')}
                  <ChevronDown size={12} className={`transition-transform duration-200 ${showExploreMenu ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showExploreMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.12 }}
                      onMouseLeave={() => setShowExploreMenu(false)}
                      className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.06] shadow-xl rounded-xl p-1 z-[200]"
                      role="menu"
                    >
                      <DropdownLink to="/explorer" icon={<Compass size={15} />} label={t('nav.explorer')} onClick={() => setShowExploreMenu(false)} />
                      <DropdownLink to="/models" icon={<Box size={15} />} label={t('nav.models')} onClick={() => setShowExploreMenu(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Other nav links */}
              {navLinks.slice(1).map((link) => (
                <Link key={link.name} to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${isActive(link.path) ? 'text-brand-blue bg-brand-blue/[0.06]' : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}
                >{link.name}</Link>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search Trigger — Desktop */}
            <button
              onClick={() => search.open()}
              aria-label="Search (⌘K)"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-lg hover:border-brand-blue/20 transition-all group mr-2"
            >
              <Search size={13} className="text-slate-300 dark:text-gray-600 group-hover:text-brand-blue transition-colors" />
              <span className="text-[11px] text-slate-300 dark:text-gray-600 w-16">{t('header.search')}</span>
              <kbd className="text-[9px] font-medium text-slate-300 dark:text-gray-600 bg-white dark:bg-white/5 px-1 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-0.5">
                <Command size={8} />K
              </kbd>
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">

              {/* Authenticated Actions */}
              {isAuthenticated && (
                <>
                  {/* Daily Claim */}
                  <AnimatePresence>
                    {user?.canDailyClaim && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleClaimDaily}
                        disabled={isClaimingDaily}
                        className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold hover:bg-amber-500/15 transition-all"
                      >
                        {isClaimingDaily ? <Loader2 size={13} className="animate-spin" /> : <Gift size={13} />}
                        <span className="text-[11px]">{t('header.daily_gift')}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Welcome Claim */}
                  {user && !user.claimWelcomeCredit && (
                    <button
                      onClick={handleClaim}
                      disabled={isClaiming}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg text-[11px] font-bold hover:bg-amber-500/15 transition-all"
                    >
                      {isClaiming ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Claim +1000
                    </button>
                  )}

                  {/* Credits — Desktop */}
                  <Link
                    to="/credits"
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-lg hover:border-brand-blue/20 transition-all"
                  >
                    <Sparkles size={12} className="text-brand-blue" fill="currentColor" />
                    <span className="text-[12px] font-bold text-slate-700 dark:text-white">{(credits || 0).toLocaleString()}</span>
                  </Link>

                  {/* Credits — Mobile */}
                  <button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white rounded-lg text-[11px] font-bold active:scale-95 transition-all"
                  >
                    <Sparkles size={11} fill="currentColor" />
                    {(credits || 0).toLocaleString()}
                    <Plus size={11} />
                  </button>
                </>
              )}

              {/* Theme Toggle */}
              <button onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} className="hidden md:flex w-8 h-8 items-center justify-center text-slate-400 dark:text-gray-500 hover:text-brand-blue hover:bg-black/[0.03] dark:hover:bg-white/[0.04] rounded-lg transition-all">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Language Switcher — Desktop */}
              <div className="hidden md:block relative" ref={langRef}>
                <button onClick={() => setShowDesktopLang(!showDesktopLang)} aria-label="Change language" aria-expanded={showDesktopLang} aria-haspopup="true" className="flex items-center gap-1 w-8 h-8 justify-center text-slate-400 hover:text-brand-blue hover:bg-black/[0.03] dark:hover:bg-white/[0.04] rounded-lg transition-all">
                  <FlagIcon code={lang} className="w-5 h-3.5" />
                </button>
                <AnimatePresence>
                  {showDesktopLang && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                      className="absolute top-full mt-1 right-0 w-20 bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.06] shadow-xl rounded-xl overflow-hidden z-[200]"
                    >
                      {languages.map((l) => (
                        <button key={l.code} onClick={() => { setLang(l.code); setShowDesktopLang(false); localStorage.setItem('skyverses_lang_detected', '1'); }}
                          className={`w-full flex items-center justify-center py-2.5 transition-all ${lang === l.code ? 'bg-brand-blue/8' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'}`}
                        >
                          <FlagIcon code={l.code} />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu / Login */}
              {isAuthenticated ? (
                <div className="relative" ref={userRef}>
                  <button onClick={() => setShowUserMenu(!showUserMenu)} aria-label="User menu" aria-expanded={showUserMenu} aria-haspopup="true" className="flex items-center gap-1 ml-1">
                    <img 
                      src={user?.avatar || user?.picture || DEFAULT_AVATAR} 
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                      className="w-8 h-8 rounded-lg border border-black/[0.06] dark:border-white/[0.06] object-cover hover:border-brand-blue/30 transition-all" 
                      alt="Avatar" 
                    />
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 6, scale: 0.97 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full mt-1 right-0 w-64 bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.06] shadow-2xl rounded-xl overflow-hidden z-[200]"
                      >
                        {/* User Info */}
                        <div className="px-3 pt-3 pb-2">
                          <div className="flex items-center gap-2.5 mb-2.5">
                            <img 
                              src={user?.avatar || user?.picture || DEFAULT_AVATAR}
                              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                              className="w-9 h-9 rounded-lg border border-black/[0.04] dark:border-white/[0.06] object-cover"
                              alt="Avatar"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                              <p className="text-[11px] text-slate-400 dark:text-gray-500 truncate">{user?.email}</p>
                            </div>
                          </div>
                          {/* Credits card */}
                          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-lg">
                            <div className="flex items-center gap-1.5">
                              <Sparkles size={13} className="text-brand-blue" fill="currentColor" />
                              <span className="text-xs font-bold text-slate-700 dark:text-gray-200">{(credits || 0).toLocaleString()}</span>
                            </div>
                            <button 
                              onClick={() => { setIsPurchaseModalOpen(true); setShowUserMenu(false); }} 
                              className="text-[10px] font-bold text-brand-blue hover:underline flex items-center gap-0.5"
                            >
                              <Plus size={10} /> {t('header.topup')}
                            </button>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-black/[0.04] dark:bg-white/[0.04]" />

                        {/* Menu Items */}
                        <div className="p-1.5 space-y-0.5">
                          <DropdownLink to="/settings" icon={<User size={15} />} label={t('user.menu.profile')} onClick={() => setShowUserMenu(false)} />
                          <DropdownLink to="/referral" icon={<Users size={15} />} label={t('user.menu.referral')} onClick={() => setShowUserMenu(false)} />
                          <DropdownLink to="/favorites" icon={<Bookmark size={15} />} label={t('user.menu.favorites')} onClick={() => setShowUserMenu(false)} />
                          <DropdownLink to="/usage" icon={<BarChart3 size={15} />} label={t('user.menu.usage')} onClick={() => setShowUserMenu(false)} />
                          <DropdownLink to="/settings" icon={<Settings size={15} />} label={t('user.menu.settings')} onClick={() => setShowUserMenu(false)} />
                          <div className="h-px bg-black/[0.04] dark:bg-white/[0.04] mx-2 my-0.5" />
                          <DropdownLink to="https://skyverses.com/support" external icon={<HelpCircle size={15} />} label={t('user.menu.support')} onClick={() => setShowUserMenu(false)} />
                        </div>

                        {/* Logout */}
                        <div className="p-1.5 pt-0">
                          <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all rounded-lg">
                            <LogOut size={15} /> {t('user.menu.signout')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex items-center px-4 py-1.5 text-[13px] font-semibold text-slate-600 dark:text-gray-300 hover:text-brand-blue border border-black/[0.06] dark:border-white/[0.06] hover:border-brand-blue/30 rounded-lg transition-all">
                  {t('nav.login')}
                </Link>
              )}

              {/* CTA — Desktop */}
              <Link to="/booking" className="hidden md:flex items-center px-4 py-1.5 bg-brand-blue text-white text-[13px] font-semibold rounded-lg hover:brightness-110 transition-all shadow-sm shadow-brand-blue/20 ml-1">
                {t('nav.deploy')}
              </Link>

              {/* Mobile Menu Toggle */}
              <button onClick={() => setIsOpen(true)} aria-label="Open menu" className="md:hidden w-8 h-8 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] rounded-lg transition-all ml-1">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════ MOBILE DRAWER ═══════════ */}
      <div className={`fixed inset-0 z-[500] transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-[#0c0c10] shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-2">
                <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">Skyverses</span>
              </div>
              <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 no-scrollbar">
              {/* Nav Links */}
              <div className="space-y-1">
                <Link to="/" onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all ${isActive('/') ? 'bg-brand-blue/[0.06] text-brand-blue' : 'text-slate-700 dark:text-gray-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}
                >
                  <span className="text-sm font-bold">Home</span>
                  <ChevronRight size={16} className="text-slate-300 dark:text-gray-600" />
                </Link>

                <Link to="/markets" onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all ${isActive('/markets') ? 'bg-brand-blue/[0.06] text-brand-blue' : 'text-slate-700 dark:text-gray-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}
                >
                  <span className="text-sm font-bold">Marketplace</span>
                  <ChevronRight size={16} className="text-slate-300 dark:text-gray-600" />
                </Link>

                {/* Explore Sub-links */}
                <div className="px-3 py-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('nav.explore')}</p>
                  <div className="pl-3 space-y-1">
                    <Link to="/explorer" onClick={() => setIsOpen(false)} className={`flex items-center justify-between py-2 text-sm font-medium ${isActive('/explorer') ? 'text-brand-blue' : 'text-slate-600 dark:text-gray-300'}`}>
                      {t('nav.explorer')} <ArrowRight size={14} className="text-slate-300" />
                    </Link>
                    <Link to="/models" onClick={() => setIsOpen(false)} className={`flex items-center justify-between py-2 text-sm font-medium ${isActive('/models') ? 'text-brand-blue' : 'text-slate-600 dark:text-gray-300'}`}>
                      {t('nav.models')} <ArrowRight size={14} className="text-slate-300" />
                    </Link>
                  </div>
                </div>

                {navLinks.slice(1).map((link) => (
                  <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-all ${isActive(link.path) ? 'bg-brand-blue/[0.06] text-brand-blue' : 'text-slate-700 dark:text-gray-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}
                  >
                    {link.name} <ChevronRight size={16} className="text-slate-300 dark:text-gray-600" />
                  </Link>
                ))}
              </div>

              {/* Language */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                  <Languages size={12} /> {t('nav.lang_settings')}
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => { setLang(l.code); localStorage.setItem('skyverses_lang_detected', '1'); }}
                      className={`py-2.5 flex items-center justify-center rounded-lg border transition-all ${lang === l.code ? 'bg-brand-blue/10 border-brand-blue/30' : 'bg-slate-50 dark:bg-white/[0.03] border-transparent hover:border-brand-blue/20'}`}
                    >
                      <FlagIcon code={l.code} />
                    </button>
                  ))}
                </div>
              </div>

              {!isAuthenticated && (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full py-3 bg-brand-blue text-white text-center rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/20">
                  {t('nav.login')}
                </Link>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-5 py-4 border-t border-black/[0.04] dark:border-white/[0.04] space-y-3">
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-slate-400 shrink-0">
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <Link to="/booking" onClick={() => setIsOpen(false)} className="flex-1 flex items-center justify-center py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold">
                  {t('nav.deploy')}
                </Link>
              </div>
              <p className="text-[9px] text-slate-300 dark:text-gray-700 text-center">© 2025 Skyverses Market</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPurchaseModalOpen && (
          <Suspense fallback={null}>
            <CreditPurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
