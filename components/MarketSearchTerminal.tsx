import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

/* =========================
   FIXED CONFIG FROM ARCHITECT
========================= */
const FILTER_CONFIG: Record<string, string[]> = {
  ALL: [
    "Game Development", "Art Production", "UI / UX Design", 
    "AI Video", "AI Image", "Automation", "Case Studies",
  ],
  GAMES: [
    "Game Prototyping", "Full Game Production", "Game Art", 
    "UI / UX for Games", "Live Ops Support",
  ],
  "ART & DESIGN": [
    "Concept Art", "Illustration", "UI / UX Design", 
    "Branding & Visual Identity", "Cinematic Assets",
  ],
  "AI TOOLS": [
    "AI Video", "AI Image", "AI Audio", 
    "AI Automation", "Custom AI Tools",
  ],
  "CASE STUDIES": [
    "Games", "Art & Design", "AI Tools", "Enterprise Projects",
  ],
};

interface MarketSearchTerminalProps {
  query: string;
  setQuery: (val: string) => void;
  primary: string;
  setPrimary: (val: string) => void;
  secondary: string;
  setSecondary: (val: string) => void;
}

const MarketSearchTerminal: React.FC<MarketSearchTerminalProps> = ({
  query, setQuery, primary, setPrimary, secondary, setSecondary
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [directiveIndex, setDirectiveIndex] = useState(0);

  const filterLabels: Record<string, string> = {
    ALL: t('market.filter.all'),
    GAMES: t('market.filter.games'),
    "ART & DESIGN": t('market.filter.design'),
    "AI TOOLS": t('market.filter.tools'),
    "CASE STUDIES": t('market.filter.cases'),
  };

  const searchPlaceholders: Record<string, string> = {
    ALL: t('market.placeholder.all'),
    GAMES: t('market.placeholder.games'),
    "ART & DESIGN": t('market.placeholder.design'),
    "AI TOOLS": t('market.placeholder.tools'),
    "CASE STUDIES": t('market.placeholder.cases'),
  };

  const directives = [
    t('market.search.directive.1'),
    t('market.search.directive.2'),
    t('market.search.directive.3'),
    t('market.search.directive.4'),
    t('market.search.directive.5'),
    t('market.search.directive.6'),
  ];

  useEffect(() => {
    if (primary !== 'ALL') return;
    const interval = setInterval(() => {
      setDirectiveIndex((prev) => (prev + 1) % directives.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [primary, directives.length]);

  const handlePrimaryChange = (key: string) => {
    setPrimary(key);
    setSecondary('ALL');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = query.trim().toLowerCase();
      if (command === 'terminal:admin') {
        setQuery(''); 
        navigate('/cms-admin');
      } else if (command === 'terminal:admin2') {
        setQuery('');
        navigate('/cms-admin-pro');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-10 md:mb-16 px-2 md:px-0">
      
      {/* Search Input Bar với hiệu ứng viền chạy và phát sáng */}
      <div className="relative group p-[2px] rounded-full overflow-hidden transition-all duration-500">
        
        {/* Lớp nền tạo hiệu ứng viền chạy (Running Border) */}
        <div className={`absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#0090ff_180deg,transparent_210deg,transparent_360deg)] animate-[spin_4s_linear_infinite] transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'}`}></div>

        {/* Thân chính của ô Search */}
        <div className={`relative flex items-center bg-white dark:bg-[#0a0a0c] transition-all duration-500 rounded-full overflow-hidden h-12 md:h-20 ${
          isFocused 
            ? 'shadow-[0_0_30px_rgba(0,144,255,0.25)]' 
            : 'shadow-xl'
        }`}>
          {/* Sparkles Icon in Blue Circle - Match with User Image */}
          <div className="pl-4 md:pl-6 shrink-0 z-10">
            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
              isFocused || query 
                ? 'bg-brand-blue text-white shadow-[0_0_15px_rgba(0,144,255,0.5)] scale-105' 
                : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600'
            }`}>
              <Sparkles size={16} fill={(isFocused || query) ? "currentColor" : "none"} className="md:w-6 md:h-6" />
            </div>
          </div>
          
          <div className="relative flex-grow h-full flex items-center">
            <AnimatePresence mode="wait">
              {!query && !isFocused && (
                <motion.div
                  key={primary === 'ALL' ? directiveIndex : primary}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute left-3 md:left-5 pointer-events-none text-base md:text-lg font-bold text-slate-500 dark:text-slate-400 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[80vw]"
                >
                  {primary === 'ALL' ? directives[directiveIndex] : (searchPlaceholders[primary] || searchPlaceholders.ALL)}
                </motion.div>
              )}
            </AnimatePresence>

            <input 
              type="text" 
              value={query}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none text-base md:text-lg font-bold text-black dark:text-white focus:outline-none tracking-tight px-3 md:px-5 z-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6 overflow-hidden">
        {/* Primary Filter Tabs */}
        <div className="flex overflow-x-auto no-scrollbar md:flex-wrap md:justify-center items-center gap-2 md:gap-3 pb-1 md:pb-0 px-2 md:px-0 scroll-smooth">
          {Object.keys(FILTER_CONFIG).map((key) => (
            <button
              key={key}
              onClick={() => handlePrimaryChange(key)}
              className={`px-4 md:px-8 py-1.5 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border-2 whitespace-nowrap shrink-0 ${
                primary === key
                  ? "bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20"
                  : "bg-white dark:bg-black/40 border-black/5 dark:border-white/5 text-slate-500 hover:border-black/20 dark:hover:border-white/20"
              }`}
            >
              {filterLabels[key] || key}
            </button>
          ))}
        </div>

        {/* Secondary Filter List */}
        <AnimatePresence mode="wait">
          {primary !== 'ALL' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex overflow-x-auto no-scrollbar md:flex-wrap md:justify-center items-center gap-x-4 md:gap-x-6 gap-y-2 md:gap-y-4 pt-3 md:pt-4 border-t border-black/5 dark:border-white/5 pb-2 md:pb-0 px-4 md:px-0 scroll-smooth"
            >
              <button 
                onClick={() => setSecondary('ALL')}
                className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap shrink-0 ${secondary === 'ALL' ? 'text-brand-blue' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}
              >
                {t('market.filter.secondary_all').replace('{0}', filterLabels[primary] || primary)}
              </button>
              {FILTER_CONFIG[primary].map((item) => (
                <button
                  key={item}
                  onClick={() => setSecondary(item)}
                  className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group whitespace-nowrap shrink-0 ${
                    secondary === item 
                      ? "text-brand-blue" 
                      : "text-slate-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <div className={`w-1 h-1 rounded-full transition-all ${secondary === item ? 'bg-brand-blue scale-150 shadow-[0_0_5px_#0090ff]' : 'bg-slate-300 dark:bg-gray-800'}`}></div>
                  {item}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default MarketSearchTerminal;
