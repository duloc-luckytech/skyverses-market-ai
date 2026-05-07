
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Moon, Sun, ChevronRight, Languages, LogOut,
  User, Settings,
  Zap, ArrowRight, BarChart3,
  ChevronDown, Bookmark, Loader2, Sparkles,
  Database, HelpCircle, Users, Gift, Plus, Crown,
  Search, Command
} from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
const CreditPurchaseModal = lazy(() => import('./CreditPurchaseModal'));
const UpgradeModal = lazy(() => import('./UpgradeModal').then(m => ({ default: m.UpgradeModal })));
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

const UserMenuLink = ({
  to, icon, label, onClick, external = false
}: {
  to: string; icon: React.ReactNode | null; label: string; onClick: () => void; external?: boolean;
}) => {
  const cls = `w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold text-slate-600 dark:text-gray-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-all rounded-lg`;
  if (external) {
    return <a href={to} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>{icon}{label}</a>;
  }
  return <Link to={to} onClick={onClick} className={cls}>{icon}{label}</Link>;
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
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated, credits, claimWelcomeCredits, refreshUserInfo, isPro } = useAuth();
  const search = useSearch();

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setPastHero(y > window.innerHeight * 0.7);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setPastHero(window.scrollY > window.innerHeight * 0.7);
  }, [location.pathname]);

  // On home hero: glassmorphism dark overlay. Otherwise: frosted light/dark bar.
  const overHero = location.pathname === '/' && !pastHero;

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

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'EN' }, { code: 'vi', name: 'VI' }, { code: 'ko', name: 'KO' }, { code: 'ja', name: 'JA' }
  ];

  const logoUrl = "/assets/skyverses-logo.png";
  const isActive = (path: string) => location.pathname === path;

  /* ═══ Atlas-style nav link classes ═══ */
  const navLinkCls = (active: boolean) => {
    if (overHero) {
      return `uppercase text-[14px] font-normal tracking-wide transition-colors ${active ? 'text-white' : 'text-[#faf7f8] hover:text-white'}`;
    }
    return `uppercase text-[14px] font-normal tracking-wide transition-colors ${active ? 'text-[#5f41cf]' : 'text-[#1a2330] dark:text-[#faf7f8] hover:text-[#5f41cf] dark:hover:text-[#8c6aec]'}`;
  };

  return (
    <>
      {/* ═══ NAVBAR — Atlas Cloud glassmorphism ═══ */}
      <nav
        aria-label="Main navigation"
        className="fixed w-full z-[150] top-0 transition-all duration-300"
        style={{
          height: 48,
          backgroundColor: overHero ? 'rgba(27,27,29,0.4)' : scrolled ? 'rgba(245,245,247,0.8)' : 'rgba(245,245,247,0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: overHero ? 'none' : '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <div className="h-full flex items-center" style={{ maxWidth: 1300, margin: '0 auto', padding: '0 40px' }}>

          {/* Logo */}
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 shrink-0">
            <img src={logoUrl} alt="Logo" className={`w-7 h-7 object-contain transition-all ${overHero ? 'brightness-0 invert' : ''}`} />
            <span
              className="text-[15px] font-bold tracking-tight transition-colors"
              style={{ color: overHero ? '#faf7f8' : '#1a2330' }}
            >
              Skyverses
            </span>
          </Link>

          {/* Nav Links — Desktop (Atlas: uppercase, 14px, weight 400, spaced 40px) */}
          <div className="hidden md:flex items-center" style={{ marginLeft: 40, gap: 32 }}>
            {/* MODELS */}
            <Link to="/markets" className={navLinkCls(location.pathname.startsWith('/markets') || location.pathname === '/models')}>
              Models
            </Link>

            {/* EXPLORE — dropdown */}
            <div className="relative" ref={exploreRef}>
              <button
                onClick={() => setShowExploreMenu(!showExploreMenu)}
                onMouseEnter={() => setShowExploreMenu(true)}
                aria-expanded={showExploreMenu}
                aria-haspopup="true"
                className={`${navLinkCls(location.pathname.startsWith('/explorer') || location.pathname.startsWith('/use-cases') || location.pathname.startsWith('/solutions'))} flex items-center gap-1`}
              >
                Explore
                <ChevronDown size={11} className={`transition-transform duration-200 ${showExploreMenu ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showExploreMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    onMouseLeave={() => setShowExploreMenu(false)}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[200]"
                    style={{
                      width: 520,
                      background: '#5f41cf',
                      borderRadius: 8,
                      padding: '20px 24px',
                      boxShadow: '0 20px 40px rgba(0,0,0,.25)',
                    }}
                    role="menu"
                  >
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                      <DropdownNavLink to="/explorer" label="Explorer Gallery" desc="Browse AI-generated artworks" onClick={() => setShowExploreMenu(false)} />
                      <DropdownNavLink to="/use-cases" label="Use Cases" desc="Real-world AI applications" onClick={() => setShowExploreMenu(false)} />
                      <DropdownNavLink to="/solutions" label="Solutions" desc="Industry-specific tools" onClick={() => setShowExploreMenu(false)} />
                      <DropdownNavLink to="/models" label="AI Models" desc="Explore all available models" onClick={() => setShowExploreMenu(false)} />
                      {isAuthenticated && (
                        <DropdownNavLink to="/apps" label="My Workspace" desc="Your creative dashboard" onClick={() => setShowExploreMenu(false)} />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PRICING */}
            <Link to="/credits" className={navLinkCls(isActive('/credits') || isActive('/pricing'))}>
              Pricing
            </Link>

            {/* DEVELOPER */}
            <a href="https://insights.skyverses.com" target="_blank" rel="noopener noreferrer" className={navLinkCls(false)}>
              Developer
            </a>

            {/* ENTERPRISE */}
            <Link to="/booking" className={navLinkCls(isActive('/booking'))}>
              Enterprise
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* ═══ Right side actions ═══ */}
          <div className="flex items-center gap-2">

            {/* Authenticated inline actions */}
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
                      className="hidden lg:flex items-center gap-1.5 px-2.5 h-8 rounded text-xs font-medium transition-all"
                      style={{
                        background: 'rgba(243,130,54,0.1)',
                        border: '1px solid rgba(243,130,54,0.25)',
                        color: '#f38236',
                      }}
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
                    className="hidden sm:flex items-center gap-1.5 px-2.5 h-8 rounded text-[11px] font-medium transition-all"
                    style={{
                      background: 'rgba(243,130,54,0.1)',
                      border: '1px solid rgba(243,130,54,0.25)',
                      color: '#f38236',
                    }}
                  >
                    {isClaiming ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Claim +1000
                  </button>
                )}

                {/* Credits — Desktop */}
                <Link
                  to="/credits"
                  className="hidden md:flex items-center gap-1.5 px-2.5 h-8 rounded transition-all"
                  style={{
                    background: overHero ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                    border: overHero ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <Sparkles size={12} style={{ color: '#8c6aec' }} fill="currentColor" />
                  <span className="text-[12px] font-bold" style={{ color: overHero ? '#faf7f8' : '#1a2330' }}>{(credits || 0).toLocaleString()}</span>
                </Link>

                {/* PRO Badge / Upgrade CTA */}
                {isPro ? (
                  <div
                    className="hidden md:flex items-center gap-1 px-2.5 h-7 rounded text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: 'rgba(95,65,207,0.1)', border: '1px solid rgba(95,65,207,0.25)', color: '#5f41cf' }}
                  >
                    <Crown size={11} /> PRO
                  </div>
                ) : (
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="hidden md:flex items-center gap-1.5 px-2.5 h-7 rounded text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-80"
                    style={{ background: 'rgba(243,130,54,0.1)', border: '1px solid rgba(243,130,54,0.2)', color: '#f38236' }}
                  >
                    <Zap size={11} /> Upgrade
                  </button>
                )}

                {/* Credits — Mobile */}
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="md:hidden flex items-center gap-1.5 px-3 h-8 rounded text-[11px] font-bold active:scale-95 transition-all"
                  style={{ background: '#5f41cf', color: '#faf7f8' }}
                >
                  <Sparkles size={11} fill="currentColor" />
                  {(credits || 0).toLocaleString()}
                  <Plus size={11} />
                </button>
              </>
            )}

            {/* Search — Desktop (compact) */}
            <button
              onClick={() => search.open()}
              aria-label="Search (⌘K)"
              className="hidden md:flex items-center gap-1.5 px-2.5 h-8 rounded transition-all"
              style={{
                background: overHero ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                border: overHero ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Search size={13} style={{ color: overHero ? 'rgba(250,247,248,0.6)' : 'rgba(26,35,48,0.4)' }} />
              <kbd
                className="text-[9px] font-medium px-1 py-0.5 rounded flex items-center gap-0.5"
                style={{
                  color: overHero ? 'rgba(250,247,248,0.5)' : 'rgba(26,35,48,0.35)',
                  background: overHero ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  border: overHero ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <Command size={8} />K
              </kbd>
            </button>

            {/* Language Switcher — Desktop */}
            <div className="hidden md:block relative" ref={langRef}>
              <button
                onClick={() => setShowDesktopLang(!showDesktopLang)}
                aria-label="Change language"
                aria-expanded={showDesktopLang}
                aria-haspopup="true"
                className="w-8 h-8 flex items-center justify-center rounded transition-all"
                style={{
                  color: overHero ? 'rgba(250,247,248,0.7)' : 'rgba(26,35,48,0.5)',
                }}
              >
                <FlagIcon code={lang} className="w-5 h-3.5" />
              </button>
              <AnimatePresence>
                {showDesktopLang && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full mt-1 right-0 w-20 overflow-hidden z-[200]"
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 8,
                      boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    }}
                  >
                    {languages.map((l) => (
                      <button key={l.code} onClick={() => { setLang(l.code); setShowDesktopLang(false); localStorage.setItem('skyverses_lang_detected', '1'); }}
                        className="w-full flex items-center justify-center py-2.5 transition-all hover:bg-[rgba(95,65,207,0.06)]"
                        style={{ background: lang === l.code ? 'rgba(95,65,207,0.08)' : 'transparent' }}
                      >
                        <FlagIcon code={l.code} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded transition-all"
              style={{ color: overHero ? 'rgba(250,247,248,0.7)' : 'rgba(26,35,48,0.5)' }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* User Menu / Contact + Login */}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button onClick={() => setShowUserMenu(!showUserMenu)} aria-label="User menu" aria-expanded={showUserMenu} aria-haspopup="true" className="flex items-center gap-1 ml-1">
                  <img
                    src={user?.avatar || user?.picture || DEFAULT_AVATAR}
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                    className="w-8 h-8 rounded object-cover transition-all"
                    style={{ border: '1px solid rgba(0,0,0,0.06)' }}
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
                      className="absolute top-full mt-1 right-0 w-64 overflow-hidden z-[200]"
                      style={{
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.06)',
                        borderRadius: 12,
                        boxShadow: '0 20px 40px rgba(0,0,0,.15)',
                      }}
                    >
                      {/* User Info */}
                      <div className="px-3 pt-3 pb-2">
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <img
                            src={user?.avatar || user?.picture || DEFAULT_AVATAR}
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                            className="w-9 h-9 rounded object-cover"
                            style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                            alt="Avatar"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: '#1a2330' }}>{user?.name || 'User'}</p>
                            <p className="text-[11px] truncate" style={{ color: 'rgba(26,35,48,0.5)' }}>{user?.email}</p>
                          </div>
                        </div>
                        {/* Credits card */}
                        <div
                          className="flex items-center justify-between p-2 rounded"
                          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)' }}
                        >
                          <div className="flex items-center gap-1.5">
                            <Sparkles size={13} style={{ color: '#5f41cf' }} fill="currentColor" />
                            <span className="text-xs font-bold" style={{ color: '#1a2330' }}>{(credits || 0).toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => { setIsPurchaseModalOpen(true); setShowUserMenu(false); }}
                            className="text-[10px] font-bold hover:underline flex items-center gap-0.5"
                            style={{ color: '#5f41cf' }}
                          >
                            <Plus size={10} /> {t('header.topup')}
                          </button>
                        </div>

                        {/* Plan badge */}
                        {isPro ? (
                          <div
                            className="mt-1.5 flex items-center gap-1.5 px-2 py-1.5 rounded"
                            style={{ background: 'rgba(95,65,207,0.08)', border: '1px solid rgba(95,65,207,0.15)' }}
                          >
                            <Crown size={11} style={{ color: '#5f41cf' }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#5f41cf' }}>Pro Member</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setIsUpgradeModalOpen(true); setShowUserMenu(false); }}
                            className="mt-1.5 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-80"
                            style={{ background: 'rgba(243,130,54,0.08)', border: '1px solid rgba(243,130,54,0.15)', color: '#f38236' }}
                          >
                            <Zap size={11} /> Nâng cấp lên Pro
                          </button>
                        )}
                      </div>

                      <div style={{ height: 1, background: 'rgba(0,0,0,0.04)' }} />

                      {/* Menu Items */}
                      <div className="p-1.5 space-y-0.5">
                        <UserMenuLink to="/settings" icon={<User size={15} />} label={t('user.menu.profile')} onClick={() => setShowUserMenu(false)} />
                        <UserMenuLink to="/referral" icon={<Users size={15} />} label={t('user.menu.referral')} onClick={() => setShowUserMenu(false)} />
                        <UserMenuLink to="/favorites" icon={<Bookmark size={15} />} label={t('user.menu.favorites')} onClick={() => setShowUserMenu(false)} />
                        <UserMenuLink to="/usage" icon={<BarChart3 size={15} />} label={t('user.menu.usage')} onClick={() => setShowUserMenu(false)} />
                        <UserMenuLink to="/settings" icon={<Settings size={15} />} label={t('user.menu.settings')} onClick={() => setShowUserMenu(false)} />
                        <div style={{ height: 1, background: 'rgba(0,0,0,0.04)', margin: '2px 8px' }} />
                        <UserMenuLink to="https://skyverses.com/support" external icon={<HelpCircle size={15} />} label={t('user.menu.support')} onClick={() => setShowUserMenu(false)} />
                      </div>

                      {/* Logout */}
                      <div className="p-1.5 pt-0">
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded transition-all"
                          style={{ color: '#CE2301' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(206,35,1,0.04)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut size={15} /> {t('user.menu.signout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                {/* Contact — Atlas bordered button */}
                <Link
                  to="/booking"
                  className="hidden md:flex items-center justify-center uppercase text-[14px] font-normal tracking-wide rounded transition-all hover:opacity-80"
                  style={{
                    height: 32,
                    padding: '0 18px',
                    color: overHero ? '#dad0ff' : '#8c6aec',
                    border: overHero ? '1px solid rgba(218,208,255,0.3)' : '1px solid rgba(140,106,236,0.3)',
                    background: 'transparent',
                  }}
                >
                  Contact
                </Link>

                {/* Login — Atlas solid purple button */}
                <Link
                  to="/login"
                  className="hidden md:flex items-center justify-center uppercase text-[14px] font-medium tracking-wide rounded transition-all hover:opacity-90"
                  style={{
                    height: 32,
                    padding: '0 18px',
                    background: '#5f41cf',
                    color: '#faf7f8',
                  }}
                >
                  {t('nav.login')}
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              className="md:hidden w-8 h-8 flex items-center justify-center rounded transition-all ml-1"
              style={{ color: overHero ? '#faf7f8' : '#1a2330' }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════ MOBILE DRAWER ═══════════ */}
      <div className={`fixed inset-0 z-[500] transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setIsOpen(false)} />
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ background: '#fff' }}
        >
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2">
                <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                <span className="text-sm font-bold" style={{ color: '#1a2330' }}>Skyverses</span>
              </div>
              <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="w-8 h-8 flex items-center justify-center rounded transition-all" style={{ color: 'rgba(26,35,48,0.4)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 no-scrollbar">
              <div className="space-y-1">
                {[
                  { label: 'Home', to: '/' },
                  { label: 'Models', to: '/markets' },
                  { label: 'Explorer', to: '/explorer' },
                  { label: 'Use Cases', to: '/use-cases' },
                  { label: 'Pricing', to: '/credits' },
                  { label: 'Enterprise', to: '/booking' },
                ].map(link => (
                  <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-lg transition-all"
                    style={{
                      color: isActive(link.to) ? '#5f41cf' : '#1a2330',
                      background: isActive(link.to) ? 'rgba(95,65,207,0.06)' : 'transparent',
                    }}
                  >
                    <span className="text-sm font-bold uppercase tracking-wide">{link.label}</span>
                    <ChevronRight size={16} style={{ color: 'rgba(26,35,48,0.3)' }} />
                  </Link>
                ))}

                <a href="https://insights.skyverses.com" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-lg transition-all"
                  style={{ color: '#1a2330' }}
                >
                  <span className="text-sm font-bold uppercase tracking-wide">Developer</span>
                  <ChevronRight size={16} style={{ color: 'rgba(26,35,48,0.3)' }} />
                </a>

                {isAuthenticated && (
                  <Link to="/apps" onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-lg transition-all"
                    style={{
                      color: isActive('/apps') ? '#5f41cf' : '#1a2330',
                      background: isActive('/apps') ? 'rgba(95,65,207,0.06)' : 'transparent',
                    }}
                  >
                    <span className="text-sm font-bold uppercase tracking-wide">Create</span>
                    <ChevronRight size={16} style={{ color: 'rgba(26,35,48,0.3)' }} />
                  </Link>
                )}
              </div>

              {/* Language */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-1" style={{ color: 'rgba(26,35,48,0.4)' }}>
                  <Languages size={12} /> {t('nav.lang_settings')}
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => { setLang(l.code); localStorage.setItem('skyverses_lang_detected', '1'); }}
                      className="py-2.5 flex items-center justify-center rounded transition-all"
                      style={{
                        background: lang === l.code ? 'rgba(95,65,207,0.08)' : 'rgba(0,0,0,0.03)',
                        border: lang === l.code ? '1px solid rgba(95,65,207,0.25)' : '1px solid transparent',
                      }}
                    >
                      <FlagIcon code={l.code} />
                    </button>
                  ))}
                </div>
              </div>

              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 text-center rounded text-sm font-bold uppercase tracking-wide transition-all"
                  style={{ background: '#5f41cf', color: '#faf7f8' }}
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 flex items-center justify-center rounded shrink-0"
                  style={{ border: '1px solid rgba(0,0,0,0.06)', color: 'rgba(26,35,48,0.5)' }}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <Link
                  to="/booking"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 flex items-center justify-center py-2.5 rounded text-sm font-bold uppercase tracking-wide transition-all"
                  style={{ background: '#5f41cf', color: '#faf7f8' }}
                >
                  Contact
                </Link>
              </div>
              <p className="text-[9px] text-center" style={{ color: 'rgba(26,35,48,0.3)' }}>© 2026 Skyverses</p>
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

      <Suspense fallback={null}>
        <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
      </Suspense>
    </>
  );
};

/* ═══ Atlas-style dropdown nav link (purple bg) ═══ */
const DropdownNavLink: React.FC<{
  to: string;
  label: string;
  desc: string;
  onClick: () => void;
}> = ({ to, label, desc, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-3 py-2.5 rounded-lg transition-all"
    style={{ color: '#faf7f8' }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
  >
    <span className="block text-[14px] font-medium" style={{ color: '#faf7f8' }}>{label}</span>
    <span className="block text-[11px] mt-0.5" style={{ color: '#dad0ff' }}>{desc}</span>
  </Link>
);

export default Header;
