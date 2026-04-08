import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, Globe, X, ChevronDown, ArrowRight, Sparkles, Home, LayoutGrid, Languages } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';

const LANGUAGES: { key: Language; label: string; flag: string }[] = [
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { key: 'ko', label: '한국어', flag: '🇰🇷' },
  { key: 'ja', label: '日本語', flag: '🇯🇵' },
];

const NAV_LINKS = [
  { label: 'Articles', to: '/' },
  { label: 'Tutorials', to: '/category/Tutorials' },
  { label: 'News', to: '/category/News' },
];

const TOPICS = [
  { label: 'Tutorials', to: '/category/Tutorials' },
  { label: 'News & Updates', to: '/category/News' },
  { label: 'Tips & Tricks', to: '/category/Tips' },
  { label: 'Case Studies', to: '/category/Case Study' },
  { label: 'Community', to: '/category/Community' },
];

const DEBOUNCE_MS = 400;

const BlogHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<null | 'topics' | 'search' | 'lang'>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    if (mobileSheet === 'search') setTimeout(() => mobileSearchRef.current?.focus(), 100);
  }, [mobileSheet]);

  // Close on route change
  useEffect(() => { setMobileSheet(null); }, [location]);

  // Sync search input when navigating away from /search
  useEffect(() => {
    if (!location.pathname.startsWith('/search')) {
      setSearch('');
    }
  }, [location.pathname]);

  // Desktop: debounce navigate to /search on input change
  const handleDesktopInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = val.trim();
      if (trimmed) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    }, DEBOUNCE_MS);
  };

  // Desktop: submit → navigate immediately
  const handleDesktopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = search.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setSearchOpen(false);
      setSearch('');
    }
  };

  // Mobile: submit → navigate to /search
  const handleMobileSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = search.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setSearch('');
      setMobileSheet(null);
    }
  };

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to === '/' ? '/_never_' : to);
  const isHome = location.pathname === '/';
  const isTopics = location.pathname.startsWith('/category/');
  const isSearch = location.pathname === '/search';

  return (
    <>
      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-blue to-transparent z-[200]" />

      {/* ── DESKTOP + MOBILE top header ── */}
      <header className={`fixed top-[2px] left-0 right-0 z-[150] transition-all duration-300 bg-white/90 dark:bg-[#080809]/90 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.06] ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="h-14 md:h-16 flex items-center gap-6">

            {/* Logo */}
            <Link to="/" onClick={() => setMobileSheet(null)} className="flex items-center gap-2.5 shrink-0 group">
              <img
                src="https://ai.skyverses.com/assets/skyverses-logo.png"
                alt="Skyverses"
                className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-200"
              />
              <div className="hidden sm:flex items-baseline gap-1">
                <span className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white">Skyverses</span>
                <span className="text-[15px] font-black text-brand-blue">Insights</span>
              </div>
              {/* Mobile: show brand short */}
              <div className="flex sm:hidden items-baseline gap-1">
                <span className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white">Insights</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link key={link.to} to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                    isActive(link.to)
                      ? 'text-brand-blue bg-brand-blue/[0.07]'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  }`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex-1" />

            {/* Right actions */}
            <div className="flex items-center gap-1">

              {/* Desktop Search */}
              <div className="hidden md:block">
                {searchOpen ? (
                  <form onSubmit={handleDesktopSubmit} className="flex items-center gap-2 animate-in slide-in-from-right duration-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        ref={searchRef}
                        type="text" value={search} onChange={handleDesktopInputChange}
                        placeholder="Search articles…"
                        className="w-52 md:w-72 bg-white dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.10] pl-9 pr-4 py-2 rounded-xl text-[13px] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all"
                      />
                    </div>
                    <button type="button" onClick={() => { setSearchOpen(false); setSearch(''); if (debounceRef.current) clearTimeout(debounceRef.current); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all">
                      <X size={15} />
                    </button>
                  </form>
                ) : (
                  <button onClick={() => setSearchOpen(true)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isSearch ? 'text-brand-blue bg-brand-blue/[0.07]' : 'text-slate-400 hover:text-brand-blue hover:bg-brand-blue/[0.06]'}`}>
                    <Search size={16} />
                  </button>
                )}
              </div>

              {/* Desktop Theme */}
              <button onClick={toggleTheme}
                className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/[0.06] transition-all">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Desktop Language */}
              <div className="hidden md:block relative">
                <button onClick={() => setShowLang(!showLang)}
                  className="flex items-center gap-1 h-8 px-2 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/[0.06] transition-all text-[11px] font-bold">
                  <Globe size={14} />
                  <span>{lang.toUpperCase()}</span>
                  <ChevronDown size={10} className={`transition-transform ${showLang ? 'rotate-180' : ''}`} />
                </button>
                {showLang && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLang(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-[#111118] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden min-w-[160px]">
                      {LANGUAGES.map(l => (
                        <button key={l.key} onClick={() => { setLang(l.key); setShowLang(false); }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold transition-colors ${lang === l.key
                            ? 'bg-brand-blue/[0.08] text-brand-blue'
                            : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                          }`}>
                          <span className="text-base">{l.flag}</span> {l.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Desktop CTA */}
              <a href="https://ai.skyverses.com" target="_blank" rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-brand-blue text-white text-[12px] font-bold rounded-xl hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-brand-blue/20 ml-1">
                <Sparkles size={11} fill="currentColor" /> Try Skyverses AI
              </a>

              {/* Mobile CTA — compact */}
              <a href="https://ai.skyverses.com" target="_blank" rel="noopener noreferrer"
                className="md:hidden flex items-center gap-1 px-3 py-1.5 bg-brand-blue text-white text-[11px] font-bold rounded-xl ml-1">
                <Sparkles size={10} fill="currentColor" /> Try AI
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION BAR
      ══════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[150] bg-white/95 dark:bg-[#0d0d12]/95 backdrop-blur-2xl border-t border-black/[0.07] dark:border-white/[0.07] shadow-2xl">
        <div className="flex items-stretch h-[60px]">

          {/* Home */}
          <Link to="/"
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
              isHome ? 'text-brand-blue' : 'text-slate-400 dark:text-gray-500'
            }`}>
            <Home size={18} strokeWidth={isHome ? 2.5 : 1.8} />
            <span className="text-[9px] font-bold tracking-wide">Home</span>
            {isHome && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-blue" />}
          </Link>

          {/* Topics */}
          <button
            onClick={() => setMobileSheet(mobileSheet === 'topics' ? null : 'topics')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
              isTopics || mobileSheet === 'topics' ? 'text-brand-blue' : 'text-slate-400 dark:text-gray-500'
            }`}>
            <LayoutGrid size={18} strokeWidth={(isTopics || mobileSheet === 'topics') ? 2.5 : 1.8} />
            <span className="text-[9px] font-bold tracking-wide">Topics</span>
            {(isTopics || mobileSheet === 'topics') && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-blue" />}
          </button>

          {/* Search */}
          <Link to="/search"
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
              isSearch ? 'text-brand-blue' : 'text-slate-400 dark:text-gray-500'
            }`}>
            <Search size={18} strokeWidth={isSearch ? 2.5 : 1.8} />
            <span className="text-[9px] font-bold tracking-wide">Search</span>
            {isSearch && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-blue" />}
          </Link>

          {/* Language */}
          <button
            onClick={() => setMobileSheet(mobileSheet === 'lang' ? null : 'lang')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
              mobileSheet === 'lang' ? 'text-brand-blue' : 'text-slate-400 dark:text-gray-500'
            }`}>
            <Languages size={18} strokeWidth={mobileSheet === 'lang' ? 2.5 : 1.8} />
            <span className="text-[9px] font-bold tracking-wide">{lang.toUpperCase()}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-gray-500 transition-all active:scale-90">
            {theme === 'dark'
              ? <Sun size={18} strokeWidth={1.8} />
              : <Moon size={18} strokeWidth={1.8} />
            }
            <span className="text-[9px] font-bold tracking-wide">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* Safe area bottom spacer (notched phones) */}
        <div className="h-safe-bottom bg-white/95 dark:bg-[#0d0d12]/95" style={{ height: 'env(safe-area-inset-bottom)' }} />
      </nav>

      {/* ══════════════════════════════════════════
          MOBILE BOTTOM SHEET — Topics
      ══════════════════════════════════════════ */}
      {mobileSheet === 'topics' && (
        <>
          <div className="md:hidden fixed inset-0 z-[140] bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileSheet(null)} />
          <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-[145] bg-white dark:bg-[#0d0d12] rounded-t-3xl border-t border-l border-r border-black/[0.08] dark:border-white/[0.08] shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-white/[0.12]" />
            </div>
            <div className="px-5 pb-5 pt-3">
              <p className="text-[10px] font-black tracking-[0.18em] text-slate-400 uppercase mb-4">Browse Topics</p>
              <div className="space-y-1">
                <Link to="/"
                  className="flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] font-semibold text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-brand-blue transition-all">
                  All Articles <ArrowRight size={14} className="text-slate-300" />
                </Link>
                {TOPICS.map(topic => (
                  <Link key={topic.to} to={topic.to}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] font-semibold text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-brand-blue transition-all">
                    {topic.label} <ArrowRight size={14} className="text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          MOBILE BOTTOM SHEET — Language
      ══════════════════════════════════════════ */}
      {mobileSheet === 'lang' && (
        <>
          <div className="md:hidden fixed inset-0 z-[140] bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileSheet(null)} />
          <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-[145] bg-white dark:bg-[#0d0d12] rounded-t-3xl border-t border-l border-r border-black/[0.08] dark:border-white/[0.08] shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-white/[0.12]" />
            </div>
            <div className="px-5 pt-3 pb-8">
              <p className="text-[10px] font-black tracking-[0.18em] text-slate-400 uppercase mb-4">Language</p>
              <div className="space-y-1">
                {LANGUAGES.map(l => (
                  <button key={l.key}
                    onClick={() => { setLang(l.key); setMobileSheet(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-semibold transition-all ${
                      lang === l.key
                        ? 'bg-brand-blue/[0.08] text-brand-blue border border-brand-blue/20'
                        : 'text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`}>
                    <span className="text-xl">{l.flag}</span>
                    {l.label}
                    {lang === l.key && <span className="ml-auto text-[10px] font-black text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full">Active</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BlogHeader;
