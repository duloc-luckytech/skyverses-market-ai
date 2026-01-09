
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Command, Zap, ArrowRight, CornerDownLeft } from 'lucide-react';
import { SOLUTIONS } from '../data';
import { useLanguage } from '../context/LanguageContext';

const UniversalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lọc kết quả dựa trên query
  const results = query.trim() === '' 
    ? [] 
    : SOLUTIONS.filter(s => 
        s.name[lang].toLowerCase().includes(query.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
        s.category[lang].toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);

  // Xử lý phím tắt / và thoát Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen(true);
          inputRef.current?.focus();
        }
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Điều hướng bằng bàn phím
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleNavigate(results[selectedIndex].slug);
      } else if (results.length > 0) {
        handleNavigate(results[0].slug);
      }
    }
  };

  const handleNavigate = (slug: string) => {
    navigate(`/product/${slug}`);
    setIsOpen(false);
    setQuery('');
  };

  // Đóng khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full max-w-xl group">
      {/* Search Input Container */}
      <div className={`relative flex items-center transition-all duration-500 ${isOpen ? 'scale-[1.02]' : ''}`}>
        <div className={`absolute inset-0 bg-brand-blue/20 rounded-full blur-xl transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}></div>
        
        <div className={`relative flex items-center w-full transition-all duration-300 overflow-hidden rounded-full border ${
          isOpen 
            ? 'border-brand-blue ring-1 ring-brand-blue/50 bg-white dark:bg-black' 
            : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/60 group-hover:border-black/20 dark:group-hover:border-white/20'
        }`}>
          <Search className={`ml-5 w-4 h-4 transition-colors ${isOpen ? 'text-brand-blue' : 'text-gray-400 dark:text-gray-600'}`} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search AI products, apps, and systems..."
            className="w-full bg-transparent border-none py-3 px-4 text-[11px] font-black tracking-[0.15em] focus:outline-none text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-800 uppercase"
          />

          <div className="flex items-center gap-2 mr-5">
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
            {!isOpen && (
              <div className="flex items-center gap-1 px-2 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded text-[8px] text-gray-400 dark:text-gray-500 font-bold">
                <span className="text-[10px]">/</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-4 w-full bg-white/95 dark:bg-[#080808]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          {results.length > 0 ? (
            <div className="py-2">
              <div className="px-6 py-3 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Verified AI Systems</span>
                <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">{results.length} Found</span>
              </div>
              {results.map((sol, index) => (
                <button
                  key={sol.id}
                  onClick={() => handleNavigate(sol.slug)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all ${
                    selectedIndex === index 
                      ? 'bg-black/5 dark:bg-white/5 border-l-2 border-brand-blue' 
                      : 'border-l-2 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 shrink-0 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded overflow-hidden">
                    <img src={sol.imageUrl} className="w-full h-full object-cover grayscale opacity-50" alt="" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] font-black text-black dark:text-white uppercase tracking-tight truncate">{sol.name[lang]}</span>
                       <span className="text-[8px] font-bold text-brand-blue uppercase px-1.5 py-0.5 bg-brand-blue/10 rounded-sm">{sol.category[lang]}</span>
                    </div>
                    <div className="text-[9px] text-gray-500 font-medium truncate mt-0.5 mono tracking-tight">{sol.description[lang]}</div>
                  </div>
                  {selectedIndex === index && (
                    <CornerDownLeft className="w-3 h-3 text-brand-blue animate-pulse" />
                  )}
                </button>
              ))}
              <div className="p-4 bg-black/[0.02] dark:bg-black/40 border-t border-black/5 dark:border-white/5 flex justify-center">
                 <button onClick={() => setIsOpen(false)} className="text-[9px] font-black text-gray-400 dark:text-gray-700 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors">Terminate Session</button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center space-y-6">
              {query.trim() === '' ? (
                <>
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Command className="w-8 h-8 text-black dark:text-white" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Awaiting System Query...</p>
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">
                    Image · Video · Voice · Game
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {['VIDEO_GEN', 'IMAGE_DNA', 'VOICE_MATRIX', 'NEURAL_EDGE'].map(cmd => (
                      <button 
                        key={cmd} 
                        onClick={() => setQuery(cmd)}
                        className="p-3 border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-[9px] font-black text-gray-400 dark:text-gray-600 hover:text-brand-blue hover:border-brand-blue/30 dark:hover:border-brand-blue/30 transition-all uppercase tracking-widest"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                   <div className="inline-block p-4 rounded-full bg-red-500/10 text-red-500 mb-2">
                      <Zap className="w-6 h-6 opacity-40" />
                   </div>
                   <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">No matching systems found in repository</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;
