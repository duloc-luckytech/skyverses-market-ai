import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Globe, BookOpen, X, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';

const LANGUAGES: { key: Language; label: string; flag: string }[] = [
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { key: 'ko', label: '한국어', flag: '🇰🇷' },
  { key: 'ja', label: '日本語', flag: '🇯🇵' },
];

const BlogHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showLang, setShowLang] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileMenu(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-blue/20 group-hover:shadow-brand-blue/40 transition-shadow">
            <BookOpen size={16} />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Skyverses</span>
            <span className="text-sm font-bold text-brand-blue ml-1">{t('blog.title')}</span>
          </div>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={15} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('blog.search')}
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] pl-9 pr-4 py-2 rounded-xl text-[13px] focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600"
            />
          </div>
        </form>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/" className="px-3 py-1.5 text-[12px] font-semibold text-slate-600 dark:text-gray-300 hover:text-brand-blue transition-colors rounded-lg hover:bg-brand-blue/[0.04]">
            {t('blog.home')}
          </Link>
          <a href="https://ai.skyverses.com" target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 text-[12px] font-semibold text-slate-600 dark:text-gray-300 hover:text-brand-blue transition-colors rounded-lg hover:bg-brand-blue/[0.04]">
            Skyverses AI
          </a>

          {/* Language */}
          <div className="relative">
            <button onClick={() => setShowLang(!showLang)}
              className="p-2 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/[0.04] transition-all">
              <Globe size={16} />
            </button>
            {showLang && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLang(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.06] rounded-xl shadow-xl p-1.5 min-w-[140px]">
                  {LANGUAGES.map(l => (
                    <button key={l.key} onClick={() => { setLang(l.key); setShowLang(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors ${lang === l.key ? 'bg-brand-blue text-white' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]'}`}>
                      <span>{l.flag}</span> {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme */}
          <button onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/[0.04] transition-all">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg text-slate-500 hover:text-brand-blue transition-colors">
          {mobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-white dark:bg-[#0a0a0c] border-b border-black/[0.04] dark:border-white/[0.04] px-4 pb-4 space-y-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('blog.search')}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none" />
            </div>
          </form>
          <div className="flex items-center gap-2">
            {LANGUAGES.map(l => (
              <button key={l.key} onClick={() => { setLang(l.key); setMobileMenu(false); }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${lang === l.key ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500'}`}>
                {l.flag}
              </button>
            ))}
            <button onClick={toggleTheme} className="ml-auto p-2 rounded-lg text-slate-400 hover:text-brand-blue bg-slate-100 dark:bg-white/[0.04]">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default BlogHeader;
