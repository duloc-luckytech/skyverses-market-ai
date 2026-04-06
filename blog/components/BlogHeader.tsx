import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, Globe, X, Menu, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
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

const BlogHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setSearchOpen(false);
    }
  };

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to === '/' ? '/_never_' : to);

  return (
    <>
      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-blue to-transparent z-[200]" />

      <header className={`fixed top-[2px] left-0 right-0 z-[150] transition-all duration-300 bg-white/90 dark:bg-[#080809]/90 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.06] ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="h-16 flex items-center gap-6">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <img
                src="https://ai.skyverses.com/assets/skyverses-logo.png"
                alt="Skyverses"
                className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-200"
              />
              <div className="hidden sm:flex items-baseline gap-1">
                <span className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white">Skyverses</span>
                <span className="text-[15px] font-black text-brand-blue">Insights</span>
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

              {/* Search Toggle */}
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2 animate-in slide-in-from-right duration-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      ref={searchRef}
                      type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search articles…"
                      className="w-52 md:w-72 bg-white dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.10] pl-9 pr-4 py-2 rounded-xl text-[13px] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all"
                    />
                  </div>
                  <button type="button" onClick={() => { setSearchOpen(false); setSearch(''); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all">
                    <X size={15} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/[0.06] transition-all">
                  <Search size={16} />
                </button>
              )}

              {/* Theme */}
              <button onClick={toggleTheme}
                className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/[0.06] transition-all">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Language */}
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

              {/* CTA */}
              <a href="https://ai.skyverses.com" target="_blank" rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-brand-blue text-white text-[12px] font-bold rounded-xl hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-brand-blue/20 ml-1">
                <Sparkles size={11} fill="currentColor" /> Try Skyverses AI
              </a>

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex w-8 h-8 items-center justify-center rounded-lg text-slate-500 hover:text-brand-blue transition-colors ml-1">
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[140] transition-all duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className={`absolute top-[66px] left-0 right-0 bg-white dark:bg-[#0d0d12] border-b border-black/[0.06] dark:border-white/[0.06] shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-y-0' : '-translate-y-4'}`}>
          <div className="max-w-7xl mx-auto px-4 py-5 space-y-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search articles…"
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none" />
            </form>
            {/* Mobile nav links */}
            <div className="space-y-1">
              {NAV_LINKS.map(link => (
                <Link key={link.to} to={link.to}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-semibold text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-brand-blue transition-all">
                  {link.label} <ArrowRight size={14} className="text-slate-300" />
                </Link>
              ))}
            </div>
            {/* Mobile bottom row */}
            <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex gap-1.5">
                {LANGUAGES.map(l => (
                  <button key={l.key} onClick={() => setLang(l.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${lang === l.key ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500'}`}>
                    {l.flag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={toggleTheme} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-500">
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>
                <a href="https://ai.skyverses.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white text-[12px] font-bold rounded-xl">
                  <Sparkles size={11} fill="currentColor" /> Try AI
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogHeader;
