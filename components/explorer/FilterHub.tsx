
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ImageIcon, UserCircle,
  Film, Gamepad2, Box, Video,
  ChevronDown, Filter, LucideProps
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FilterHubProps {
  activeFilter: string;
  setActiveFilter: (filter: any) => void;
}

export const FilterHub: React.FC<FilterHubProps> = ({ activeFilter, setActiveFilter }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = [
    { id: 'all', label: t('explorer.type.all'), icon: <Activity size={13} /> },
    { id: 'image', label: 'Image', icon: <ImageIcon size={13} /> },
    { id: 'video', label: 'Video', icon: <Video size={13} /> },
    { id: 'image_video', label: t('explorer.type.image_video'), icon: <ImageIcon size={13} /> },
    { id: 'character', label: t('explorer.type.character'), icon: <UserCircle size={13} /> },
    { id: 'cinematic', label: t('explorer.type.cinematic'), icon: <Film size={13} /> },
    { id: 'gameplay', label: t('explorer.type.gameplay'), icon: <Gamepad2 size={13} /> },
    { id: 'game_asset_3d', label: t('explorer.type.game_asset_3d'), icon: <Box size={13} /> }
  ];

  const activeOption = filterOptions.find(f => f.id === activeFilter) || filterOptions[0];

  return (
    <div className="w-full">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex md:hidden items-center justify-between w-full px-4 py-3 bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl transition-all shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-atlas-purple" />
          <span className="text-[13px] font-semibold text-slate-600 dark:text-gray-300">{activeOption.label}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Grid — Premium pills */}
      <motion.div
        initial={false}
        animate={{ height: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'auto' : (isExpanded ? 'auto' : 0) }}
        className="flex flex-wrap gap-2 overflow-hidden md:!h-auto mt-2 md:mt-0"
      >
        {filterOptions.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <motion.button
              key={f.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveFilter(f.id as any); setIsExpanded(false); }}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-atlas-purple text-white shadow-md shadow-atlas-purple/25'
                  : 'bg-white dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 hover:text-atlas-purple hover:bg-atlas-purple/[0.06] border border-black/[0.06] dark:border-white/[0.06] hover:border-atlas-purple/20'
              }`}
            >
              {React.cloneElement(f.icon as React.ReactElement<LucideProps>, { size: 13 })}
              <span>{f.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeFilterGlow"
                  className="absolute inset-0 rounded-xl bg-atlas-purple -z-10"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};
