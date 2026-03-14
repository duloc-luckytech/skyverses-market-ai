
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Loader2, Sparkles, ArrowRight,
  Cpu, Gamepad2, Palette, Globe, Briefcase, BarChart3,
  Layers, TrendingUp, Clock, ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { API_BASE_URL, getHeaders } from '../apis/config';

interface ISubCategory { code: string; name: string; services: string[]; }
interface ICategory { _id: string; code: string; name: string; subCategories: ISubCategory[]; status: string; }

const SUGGESTIONS = [
  "AI Video Generator",
  "Xoá phông ảnh",
  "Tạo nhạc AI",
  "Character Sync",
  "Workflow tự động",
  "Voice Studio",
];

const CommandPalette: React.FC = () => {
  const { query, setQuery, primary, setPrimary, secondary, setSecondary, isOpen, close } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState('');

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setLocalQuery(query);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, query]);

  // Fetch categories once
  useEffect(() => {
    if (!isOpen || categories.length > 0) return;
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/category`, { headers: getHeaders() });
        const result = await response.json();
        if (result.success) setCategories(result.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchCategories();
  }, [isOpen]);

  // ⌘K / Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); close(); }
      if (e.key === 'Escape') close();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  const filteredCategories = useMemo(() => categories.filter(c => c.status === 'active'), [categories]);

  const getIcon = (code: string) => {
    switch (code) {
      case 'AI_TOOLS': return <Cpu size={16} />;
      case 'GAMES': return <Gamepad2 size={16} />;
      case 'ART_DESIGN': return <Palette size={16} />;
      case 'WORLD': return <Globe size={16} />;
      case 'CASE_STUDIES': return <BarChart3 size={16} />;
      default: return <Briefcase size={16} />;
    }
  };

  const handleSearch = () => {
    setQuery(localQuery);
    close();
    if (location.pathname !== '/' && location.pathname !== '/market') {
      navigate('/');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSelectCategory = (code: string) => {
    setPrimary(code);
    setSecondary('ALL');
    setQuery('');
    setLocalQuery('');
    close();
    if (location.pathname !== '/' && location.pathname !== '/market') {
      navigate('/');
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    setLocalQuery(text);
    close();
    if (location.pathname !== '/' && location.pathname !== '/market') {
      navigate('/');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[500]"
            onClick={close}
          />

          {/* Palette */}
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed top-[12vh] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[501] px-4"
          >
            <div className="bg-white dark:bg-[#0c0c0e] rounded-2xl shadow-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
              
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 h-16 border-b border-black/[0.04] dark:border-white/[0.04]">
                <Search size={18} className="text-brand-blue shrink-0" />
                <input 
                  ref={inputRef}
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tìm sản phẩm, công cụ AI..."
                  className="flex-grow bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 focus:outline-none"
                />
                {localQuery && (
                  <button onClick={() => setLocalQuery('')} className="p-1 text-slate-300 hover:text-slate-500 transition-colors">
                    <X size={14} />
                  </button>
                )}
                <button onClick={close} className="px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-400 text-[10px] font-bold rounded-md">
                  ESC
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[50vh] overflow-y-auto p-4 space-y-5">
                
                {/* Quick suggestions */}
                {!localQuery && (
                  <div>
                    <div className="flex items-center gap-2 px-2 mb-3">
                      <TrendingUp size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-wider">Gợi ý tìm kiếm</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSelectSuggestion(s)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors group"
                        >
                          <Clock size={12} className="text-slate-300 dark:text-gray-700 shrink-0" />
                          <span className="text-sm text-slate-600 dark:text-gray-400 font-medium truncate group-hover:text-brand-blue transition-colors">{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search action */}
                {localQuery && (
                  <button
                    onClick={handleSearch}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-brand-blue/5 dark:bg-brand-blue/10 hover:bg-brand-blue/10 dark:hover:bg-brand-blue/15 transition-colors group"
                  >
                    <Search size={16} className="text-brand-blue shrink-0" />
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300 flex-grow text-left">
                      Tìm "<span className="font-bold text-brand-blue">{localQuery}</span>"
                    </span>
                    <ArrowRight size={14} className="text-brand-blue group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                {/* Categories */}
                <div>
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <Layers size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-wider">Danh mục</span>
                  </div>
                  
                  {loading ? (
                    <div className="py-8 flex justify-center"><Loader2 size={20} className="animate-spin text-brand-blue opacity-40" /></div>
                  ) : (
                    <div className="space-y-1">
                      <button
                        onClick={() => handleSelectCategory('ALL')}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
                          primary === 'ALL' ? 'bg-brand-blue/5 dark:bg-brand-blue/10' : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          primary === 'ALL' ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                        }`}>
                          <Sparkles size={16} />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">Tất cả sản phẩm</p>
                          <p className="text-[10px] text-slate-400 dark:text-gray-600 font-medium">Toàn bộ hệ sinh thái</p>
                        </div>
                      </button>

                      {filteredCategories.map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => handleSelectCategory(cat.code)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left group ${
                            primary === cat.code ? 'bg-brand-blue/5 dark:bg-brand-blue/10' : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            primary === cat.code ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-brand-blue'
                          }`}>
                            {getIcon(cat.code)}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{cat.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-600 font-medium">
                              {cat.subCategories.reduce((a, s) => a + s.services.length, 0)} sản phẩm
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-slate-200 dark:text-gray-700 shrink-0 group-hover:text-brand-blue transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-medium text-slate-300 dark:text-gray-600">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[9px] font-bold">↵</kbd> Tìm</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[9px] font-bold">ESC</kbd> Đóng</span>
                </div>
                <span className="text-[9px] font-bold text-slate-300 dark:text-gray-700 uppercase tracking-wider">Skyverses Search</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
