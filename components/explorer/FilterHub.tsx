import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, FileText, ImageIcon, UserCircle, 
  Film, Gamepad2, Terminal as TerminalIcon, Box,
  ChevronDown, Filter, LucideProps
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FilterHubProps {
  activeFilter: string;
  setActiveFilter: (filter: any) => void;
}

export const FilterHub: React.FC<FilterHubProps> = ({ activeFilter, setActiveFilter }) => {
  const { t } = useLanguage();
  // Mặc định ẩn thu gọn trên mobile
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = [
    { id: 'all', label: t('explorer.type.all'), icon: <Activity size={14} /> },
    { id: 'text_video', label: t('explorer.type.text_video'), icon: <FileText size={14} /> },
    { id: 'image_video', label: t('explorer.type.image_video'), icon: <ImageIcon size={14} /> },
    { id: 'character', label: t('explorer.type.character'), icon: <UserCircle size={14} /> },
    { id: 'cinematic', label: t('explorer.type.cinematic'), icon: <Film size={14} /> },
    { id: 'gameplay', label: t('explorer.type.gameplay'), icon: <Gamepad2 size={14} /> },
    { id: 'game_asset_3d', label: t('explorer.type.game_asset_3d'), icon: <Box size={14} /> }
  ];

  const activeOption = filterOptions.find(f => f.id === activeFilter) || filterOptions[0];

  return (
    <div className="relative w-full max-w-2xl ml-auto">
      <div className="bg-transparent rounded-none p-0 md:p-6 relative overflow-hidden group">
        {/* Interior technical grid - Hidden on mobile for minimalism */}
        <div className="absolute inset-0 opacity-[0.02] md:opacity-[0.05] pointer-events-none hidden md:block" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="flex flex-col gap-2 md:gap-5 relative z-10">
          
          {/* Mobile Toggle Header - FLAT */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex md:hidden items-center justify-between w-full px-4 py-3 bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 transition-all rounded-none"
          >
            <div className="flex items-center gap-3">
              <Filter size={14} className="text-brand-blue" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{t('explorer.filter.label')}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue italic">{activeOption.label}</span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Desktop Labels / Mobile Telemetry */}
          <div className="hidden md:flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-brand-blue/40">
              <TerminalIcon size={14} />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-none bg-emerald-500/30 animate-pulse"></div>
            </div>
          </div>

          {/* Grid of Modalities - FLAT */}
          <motion.div 
            initial={false}
            animate={{ height: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'auto' : (isExpanded ? 'auto' : 0) }}
            className={`grid grid-cols-2 gap-1.5 md:gap-2 overflow-hidden md:!h-auto`}
          >
            {filterOptions.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <button 
                  key={f.id}
                  onClick={() => {
                    setActiveFilter(f.id as any);
                    setIsExpanded(false);
                  }}
                  className={`group relative flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2.5 md:py-3 rounded-none text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                    isActive 
                    ? 'bg-brand-blue border-brand-blue text-white shadow-none' 
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent text-slate-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1 md:p-1.5 rounded-none transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/5 text-slate-400 group-hover:text-brand-blue'}`}>
                    {React.cloneElement(f.icon as React.ReactElement<LucideProps>, { size: 10 })}
                  </div>
                  <span className="flex-grow text-left truncate">{f.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeFilterIndicator"
                      className="w-1 h-1 rounded-none bg-white shadow-[0_0_8px_#fff]"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>

          {/* Footer Stats - Only show on desktop or when expanded on mobile */}
          <AnimatePresence>
            {(isExpanded || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-2 border-t border-black/5 dark:border-white/10 flex justify-between items-center px-1 hidden md:flex"
              >
                <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic">
                   <Activity size={10} className="text-brand-blue/30" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};