
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, Loader2, Search, Command,
  Cpu, Gamepad2, Palette, Globe,
  Briefcase, ChevronRight, BarChart3, ArrowRight,
  Filter, Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL, getHeaders } from '../apis/config';

interface ISubCategory {
  code: string;
  name: string;
  services: string[];
}

interface ICategory {
  _id: string;
  code: string;
  name: string;
  subCategories: ISubCategory[];
  status: string;
}

interface MarketSearchTerminalProps {
  query: string;
  setQuery: (val: string) => void;
  primary: string; 
  setPrimary: (val: string) => void;
  secondary: string; 
  setSecondary: (val: string) => void;
}

const PLACEHOLDERS = [
  "Tìm sản phẩm AI...",
  "Video quảng cáo AI",
  "Xoá phông, nâng cấp ảnh",
  "Tạo nhạc AI cho video",
  "Workflow tự động hoá",
  "Thiết kế nhân vật AI",
];

const MarketSearchTerminal: React.FC<MarketSearchTerminalProps> = ({
  query, setQuery, primary, setPrimary, secondary, setSecondary
}) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (primary && primary !== 'ALL') queryParams.append('category', primary);
        
        const response = await fetch(`${API_BASE_URL}/category?${queryParams.toString()}`, {
          headers: getHeaders()
        });
        const result = await response.json();
        if (result.success) setCategories(result.data);
      } catch (err) {
        console.error("Failed to load market categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [primary]);

  // Placeholder rotation
  useEffect(() => {
    if (query || isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIdx(p => (p + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [query, isFocused]);

  // Click outside modal
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setIsModalOpen(false);
    };
    if (isModalOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isModalOpen]);

  // Keyboard shortcut ⌘K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const activeCategory = useMemo(() => categories.find(c => c.code === primary) || null, [primary, categories]);
  const activeSubCategory = useMemo(() => {
    if (!activeCategory || secondary === 'ALL') return null;
    return activeCategory.subCategories.find(s => s.code === secondary) || null;
  }, [secondary, activeCategory]);
  const filteredCategories = useMemo(() => categories.filter(c => c.status === 'active'), [categories]);

  const handleSelectNode = (pCode: string, sCode: string = 'ALL', serviceQuery: string = '') => {
    setPrimary(pCode);
    setSecondary(sCode);
    if (serviceQuery) setQuery(serviceQuery);
    setIsModalOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPrimary('ALL');
    setSecondary('ALL');
    setQuery('');
  };

  const getIcon = (code: string) => {
    switch (code) {
      case 'AI_TOOLS': return <Cpu size={18} />;
      case 'GAMES': return <Gamepad2 size={18} />;
      case 'ART_DESIGN': return <Palette size={18} />;
      case 'WORLD': return <Globe size={18} />;
      case 'CASE_STUDIES': return <BarChart3 size={18} />;
      default: return <Briefcase size={18} />;
    }
  };

  const hasFilter = primary !== 'ALL' || query;

  return (
    <div className="max-w-4xl mx-auto md:mb-12 relative">
      {/* ─── Search Bar ─── */}
      <div className="relative">
        {/* Focus glow */}
        <div className={`absolute -inset-3 bg-brand-blue/8 dark:bg-brand-blue/12 blur-2xl rounded-full transition-opacity duration-500 pointer-events-none ${isFocused || isModalOpen ? 'opacity-100' : 'opacity-0'}`} />
        
        <div 
          className={`relative flex items-center gap-3 bg-white dark:bg-[#0a0a0c] rounded-2xl md:rounded-full h-14 md:h-[60px] px-5 md:px-6 border transition-all duration-300 ${
            isFocused || isModalOpen
              ? 'border-brand-blue/50 shadow-lg shadow-brand-blue/10' 
              : 'border-black/[0.06] dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-black/10 dark:hover:border-white/10'
          }`}
        >
          {/* Search icon */}
          <Search size={18} className={`shrink-0 transition-colors ${isFocused || isModalOpen || hasFilter ? 'text-brand-blue' : 'text-slate-300 dark:text-gray-600'}`} />
          
          {/* Active filter pill */}
          <AnimatePresence>
            {primary !== 'ALL' && activeCategory && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white rounded-lg shrink-0 text-[10px] font-bold tracking-wide"
              >
                {activeCategory.name}{activeSubCategory ? ` › ${activeSubCategory.name}` : ''}
                <button onClick={handleClear} className="ml-0.5 hover:bg-white/20 rounded p-0.5"><X size={10} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input with animated placeholder */}
          <div className="flex-grow relative h-full flex items-center min-w-0">
            <input 
              ref={inputRef}
              type="text" 
              value={query}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white focus:outline-none tracking-tight relative z-10"
              placeholder=""
            />
            {!query && !isFocused && primary === 'ALL' && (
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-0 text-sm font-medium text-slate-300 dark:text-gray-600 pointer-events-none whitespace-nowrap"
                >
                  {PLACEHOLDERS[placeholderIdx]}
                </motion.span>
              </AnimatePresence>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {query && (
              <button onClick={handleClear} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-500/10">
                <X size={14} />
              </button>
            )}
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${
                isModalOpen 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:text-brand-blue hover:bg-brand-blue/5'
              }`}
            >
              <Filter size={12} />
              <span className="hidden sm:inline uppercase tracking-wider">Bộ lọc</span>
            </button>

            <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg text-[10px] font-bold text-slate-300 dark:text-gray-600">
              <Command size={10} /> K
            </div>
          </div>
        </div>
      </div>

      {/* ─── Category Modal ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[199]"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              ref={modalRef}
              initial={{ opacity: 0, y: 8, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="absolute top-full left-0 right-0 mt-3 z-[200] bg-white dark:bg-[#0c0c0e] border border-black/[0.06] dark:border-white/[0.06] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
            >
              {/* Header */}
              <div className="px-6 md:px-8 py-5 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layers size={16} className="text-brand-blue" />
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Danh mục sản phẩm</span>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-500 dark:text-gray-600 dark:hover:text-gray-400 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-grow overflow-y-auto p-6 md:p-8">
                {loading ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3 opacity-40">
                    <Loader2 size={24} className="animate-spin text-brand-blue" />
                    <p className="text-xs font-medium text-slate-400">Đang tải...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* ALL card */}
                    <button 
                      onClick={() => handleSelectNode('ALL')}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group ${
                        primary === 'ALL' 
                          ? 'border-brand-blue bg-brand-blue/5 shadow-md' 
                          : 'border-transparent bg-slate-50/80 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        primary === 'ALL' ? 'bg-brand-blue text-white' : 'bg-white dark:bg-white/5 text-slate-400 group-hover:text-brand-blue border border-black/[0.04] dark:border-white/[0.06]'
                      }`}>
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tất cả sản phẩm</h4>
                        <p className="text-[10px] text-slate-400 dark:text-gray-600 font-medium mt-0.5">Toàn bộ hệ sinh thái</p>
                      </div>
                    </button>

                    {/* Category cards */}
                    {filteredCategories.map((cat) => (
                      <button 
                        key={cat._id}
                        onClick={() => handleSelectNode(cat.code)}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group ${
                          primary === cat.code 
                            ? 'border-brand-blue bg-brand-blue/5 shadow-md' 
                            : 'border-transparent bg-slate-50/80 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          primary === cat.code ? 'bg-brand-blue text-white' : 'bg-white dark:bg-white/5 text-slate-400 group-hover:text-brand-blue border border-black/[0.04] dark:border-white/[0.06]'
                        }`}>
                          {getIcon(cat.code)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{cat.name}</h4>
                          <p className="text-[10px] text-slate-400 dark:text-gray-600 font-medium mt-0.5">{cat.subCategories.reduce((a, s) => a + s.services.length, 0)} sản phẩm</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-200 dark:text-gray-700 group-hover:text-brand-blue shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Services tags for selected category */}
                {primary !== 'ALL' && activeCategory && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t border-black/[0.04] dark:border-white/[0.04]"
                  >
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Dịch vụ trong {activeCategory.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {activeCategory.subCategories.flatMap(s => s.services).map((service, idx) => (
                        <button 
                          key={`${service}-${idx}`}
                          onClick={() => handleSelectNode(primary, 'ALL', service)}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] rounded-lg text-[10px] font-medium text-slate-500 dark:text-gray-400 hover:text-brand-blue hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all"
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketSearchTerminal;
