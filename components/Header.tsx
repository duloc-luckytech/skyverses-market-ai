
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, ChevronRight, Languages, LogOut,
  User, Settings,
  Zap, ArrowRight, BarChart3,
  Bookmark, Loader2, Sparkles,
  Database, HelpCircle, Users, Gift, Plus, Crown,
  Search, Coins
} from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
const CreditPurchaseModal = lazy(() => import('./CreditPurchaseModal'));
const UpgradeModal = lazy(() => import('./UpgradeModal').then(m => ({ default: m.UpgradeModal })));
import { creditsApi } from '../apis/credits';
import { skytokenApi } from '../apis/skytoken';
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
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimingDaily, setIsClaimingDaily] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [sktBalance, setSktBalance] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const { theme } = useTheme();
  const { user, logout, isAuthenticated, credits, claimWelcomeCredits, refreshUserInfo, isPro } = useAuth();
  const search = useSearch();

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isAuthenticated) {
      skytokenApi.getBalance().then(r => setSktBalance(r.skyTokenBalance || 0)).catch(() => {});
    }
  }, [isAuthenticated]);

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
    return `uppercase text-[14px] font-medium tracking-wide transition-colors ${active ? 'text-[#C9A84C]' : 'text-[#e0e0e4] hover:text-white'}`;
  };

  return (
    <>
      {/* ═══ NAVBAR — Atlas Cloud glassmorphism ═══ */}
      <nav
        aria-label="Main navigation"
        className="fixed w-full z-[150] top-0 transition-all duration-300"
        style={{
          height: 48,
          backgroundColor: overHero
            ? 'rgba(15,15,20,0.4)'
            : scrolled ? 'rgba(15,15,20,0.92)' : 'rgba(15,15,20,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: overHero ? 'none' : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="h-full flex items-center" style={{ maxWidth: 1300, margin: '0 auto', padding: '0 40px' }}>

          {/* Logo */}
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 shrink-0">
            <img src={logoUrl} alt="Logo" className="w-7 h-7 object-contain brightness-0 invert" />
            <span
              className="text-[15px] font-bold tracking-tight transition-colors"
              style={{ color: '#ffffff' }}
            >
              Skyverses
            </span>
          </Link>

          {/* Nav Links — Desktop (Atlas: uppercase, 14px, weight 400, spaced 40px) */}
          <div className="hidden md:flex items-center" style={{ marginLeft: 40, gap: 32 }}>
            {/* CREATOR TOOLS */}
            <Link to="/markets" className={navLinkCls(location.pathname.startsWith('/markets') || location.pathname === '/models')}>
              Creator Tools
            </Link>

            {/* GIẢI PHÁP */}
            <Link to="/booking" className={navLinkCls(location.pathname.startsWith('/booking'))}>
              Giải pháp
            </Link>

            {/* SHOWCASE */}
            <Link to="/showcase" className={navLinkCls(location.pathname.startsWith('/showcase'))}>
              Showcase
            </Link>

            {/* PROMPTS */}
            <Link to="/prompt-market" className={navLinkCls(location.pathname.startsWith('/prompt-market'))}>
              Prompts
            </Link>

            {/* EXPLORER */}
            <Link to="/explorer" className={navLinkCls(location.pathname.startsWith('/explorer'))}>
              Explorer
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
                        background: 'rgba(201,168,76,0.1)',
                        border: '1px solid rgba(201,168,76,0.25)',
                        color: '#C9A84C',
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
                      background: 'rgba(201,168,76,0.1)',
                      border: '1px solid rgba(201,168,76,0.25)',
                      color: '#C9A84C',
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
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <Sparkles size={12} style={{ color: '#C9A84C' }} fill="currentColor" />
                  <span className="text-[12px] font-bold" style={{ color: '#faf7f8' }}>{(credits || 0).toLocaleString()}</span>
                </Link>

                {/* PRO Badge */}
                {isPro && (
                  <div
                    className="hidden md:flex items-center gap-1 px-2.5 h-7 rounded text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: 'rgba(201, 168, 76,0.1)', border: '1px solid rgba(201, 168, 76,0.25)', color: '#B8963F' }}
                  >
                    <Crown size={11} /> PRO
                  </div>
                )}

                {/* Credits — Mobile */}
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="md:hidden flex items-center gap-1.5 px-3 h-8 rounded text-[11px] font-bold active:scale-95 transition-all"
                  style={{ background: '#B8963F', color: '#faf7f8' }}
                >
                  <Sparkles size={11} fill="currentColor" />
                  {(credits || 0).toLocaleString()}
                  <Plus size={11} />
                </button>
              </>
            )}

            {/* Search — Desktop (icon only) */}
            <button
              onClick={() => search.open()}
              aria-label="Search (⌘K)"
              className="hidden md:flex w-8 h-8 items-center justify-center rounded transition-all"
              style={{
                color: 'rgba(250,247,248,0.85)',
              }}
            >
              <Search size={16} />
            </button>

            {/* Language Switcher — Desktop (icon only) */}
            <div className="hidden md:block relative" ref={langRef}>
              <button
                onClick={() => setShowDesktopLang(!showDesktopLang)}
                aria-label="Change language"
                aria-expanded={showDesktopLang}
                aria-haspopup="true"
                className="w-8 h-8 flex items-center justify-center rounded transition-all"
                style={{
                  color: 'rgba(250,247,248,0.85)',
                }}
              >
                <Languages size={16} />
              </button>
              <AnimatePresence>
                {showDesktopLang && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full mt-1 right-0 w-20 overflow-hidden z-[200]"
                    style={{
                      background: '#1a2330',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    }}
                  >
                    {languages.map((l) => (
                      <button key={l.code} onClick={() => { setLang(l.code); setShowDesktopLang(false); localStorage.setItem('skyverses_lang_detected', '1'); }}
                        className="w-full flex items-center justify-center py-2.5 transition-all hover:bg-[rgba(201, 168, 76,0.06)]"
                        style={{ background: lang === l.code ? 'rgba(201, 168, 76,0.08)' : 'transparent' }}
                      >
                        <FlagIcon code={l.code} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                        background: theme === 'dark' ? '#1a2330' : '#fff',
                        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
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
                            <p className="text-sm font-bold truncate" style={{ color: theme === 'dark' ? '#faf7f8' : '#1a2330' }}>{user?.name || 'User'}</p>
                            <p className="text-[11px] truncate" style={{ color: theme === 'dark' ? 'rgba(250,247,248,0.5)' : 'rgba(26,35,48,0.5)' }}>{user?.email}</p>
                          </div>
                        </div>
                        {/* Credits card */}
                        <div
                          className="flex items-center justify-between p-2 rounded"
                          style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)' }}
                        >
                          <div className="flex items-center gap-1.5">
                            <Sparkles size={13} style={{ color: '#B8963F' }} fill="currentColor" />
                            <span className="text-xs font-bold" style={{ color: theme === 'dark' ? '#faf7f8' : '#1a2330' }}>{(credits || 0).toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => { setIsPurchaseModalOpen(true); setShowUserMenu(false); }}
                            className="text-[10px] font-bold hover:underline flex items-center gap-0.5"
                            style={{ color: '#B8963F' }}
                          >
                            <Plus size={10} /> {t('header.topup')}
                          </button>
                        </div>

                        {/* SKT balance card */}
                        <Link
                          to="/skytoken"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center justify-between p-2 rounded mt-1.5 transition-all hover:opacity-80"
                          style={{ background: theme === 'dark' ? 'rgba(201,168,76,0.06)' : 'rgba(201,168,76,0.04)', border: theme === 'dark' ? '1px solid rgba(201,168,76,0.15)' : '1px solid rgba(201,168,76,0.1)' }}
                        >
                          <div className="flex items-center gap-1.5">
                            <Coins size={13} style={{ color: '#C9A84C' }} />
                            <span className="text-xs font-bold" style={{ color: theme === 'dark' ? '#faf7f8' : '#1a2330' }}>{(sktBalance || 0).toLocaleString()} SKT</span>
                          </div>
                          <span className="text-[10px] font-bold flex items-center gap-0.5" style={{ color: '#C9A84C' }}>
                            <Plus size={10} /> Nạp SKT
                          </span>
                        </Link>

                        {/* Plan badge */}
                        {isPro ? (
                          <div
                            className="mt-1.5 flex items-center gap-1.5 px-2 py-1.5 rounded"
                            style={{ background: 'rgba(201, 168, 76,0.08)', border: '1px solid rgba(201, 168, 76,0.15)' }}
                          >
                            <Crown size={11} style={{ color: '#B8963F' }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#B8963F' }}>Pro Member</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setIsUpgradeModalOpen(true); setShowUserMenu(false); }}
                            className="mt-1.5 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-80"
                            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', color: '#C9A84C' }}
                          >
                            <Zap size={11} /> Nâng cấp lên Pro
                          </button>
                        )}
                      </div>

                      <div style={{ height: 1, background: 'rgba(0,0,0,0.04)' }} />

                      {/* Menu Items */}
                      <div className="p-1.5 space-y-0.5">
                        <UserMenuLink to="/settings" icon={<User size={15} />} label={t('user.menu.profile')} onClick={() => setShowUserMenu(false)} />
                        <UserMenuLink to="/favorites" icon={<Bookmark size={15} />} label={t('user.menu.favorites')} onClick={() => setShowUserMenu(false)} />
                        <UserMenuLink to="/prompt-market/my-purchases" icon={<Database size={15} />} label="My Prompts" onClick={() => setShowUserMenu(false)} />
                        <UserMenuLink to="/usage" icon={<BarChart3 size={15} />} label={t('user.menu.usage')} onClick={() => setShowUserMenu(false)} />
                        <div style={{ height: 1, background: 'rgba(0,0,0,0.04)', margin: '2px 8px' }} />
                        <UserMenuLink to="/referral" icon={<Gift size={15} />} label={t('user.menu.referral')} onClick={() => setShowUserMenu(false)} />
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
                    color: overHero ? '#E5C767' : '#B8963F',
                    border: overHero ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(184,150,63,0.3)',
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
                    background: '#B8963F',
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
              style={{ color: overHero || theme === 'dark' ? '#faf7f8' : '#1a2330' }}
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
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm shadow-atlas-lg transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
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
                  { label: 'Creator Tools', to: '/markets' },
                  { label: 'AI for Business', to: '/booking' },
                  { label: 'Showcase', to: '/showcase' },
                  { label: 'App Development', to: '/product/nocode-export' },
                  { label: 'Use Cases', to: '/use-cases' },
                  { label: 'Explorer', to: '/explorer' },
                  { label: 'Prompts', to: '/prompt-market' },
                ].map(link => (
                  <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-lg transition-all"
                    style={{
                      color: isActive(link.to) ? '#B8963F' : '#1a2330',
                      background: isActive(link.to) ? 'rgba(201, 168, 76,0.06)' : 'transparent',
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
                      color: isActive('/apps') ? '#B8963F' : '#1a2330',
                      background: isActive('/apps') ? 'rgba(201, 168, 76,0.06)' : 'transparent',
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
                        background: lang === l.code ? 'rgba(201, 168, 76,0.08)' : 'rgba(0,0,0,0.03)',
                        border: lang === l.code ? '1px solid rgba(201, 168, 76,0.25)' : '1px solid transparent',
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
                  style={{ background: '#B8963F', color: '#faf7f8' }}
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2">
                <Link
                  to="/booking"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 flex items-center justify-center py-2.5 rounded text-sm font-bold uppercase tracking-wide transition-all"
                  style={{ background: '#B8963F', color: '#faf7f8' }}
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

export default Header;
