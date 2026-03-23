
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
    { id: 'all', label: t('explorer.type.all'), icon: <Activity size={14} /> },
    { id: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
    { id: 'video', label: 'Video', icon: <Video size={14} /> },
    { id: 'image_video', label: t('explorer.type.image_video'), icon: <ImageIcon size={14} /> },
    { id: 'character', label: t('explorer.type.character'), icon: <UserCircle size={14} /> },
    { id: 'cinematic', label: t('explorer.type.cinematic'), icon: <Film size={14} /> },
    { id: 'gameplay', label: t('explorer.type.gameplay'), icon: <Gamepad2 size={14} /> },
    { id: 'game_asset_3d', label: t('explorer.type.game_asset_3d'), icon: <Box size={14} /> }
  ];

  const activeOption = filterOptions.find(f => f.id === activeFilter) || filterOptions[0];

  return (
    <div className="w-full">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex md:hidden items-center justify-between w-full px-4 py-3 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl transition-all"
      >
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-brand-blue" />
          <span className="text-[13px] font-medium text-slate-500">{activeOption.label}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Grid */}
      <motion.div 
        initial={false}
        animate={{ height: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'auto' : (isExpanded ? 'auto' : 0) }}
        className="flex flex-wrap gap-1.5 overflow-hidden md:!h-auto mt-2 md:mt-0"
      >
        {filterOptions.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button 
              key={f.id}
              onClick={() => { setActiveFilter(f.id as any); setIsExpanded(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                isActive 
                  ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20' 
                  : 'bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-gray-400 hover:bg-brand-blue/5 hover:text-brand-blue border border-black/[0.04] dark:border-white/[0.04]'
              }`}
            >
              {React.cloneElement(f.icon as React.ReactElement<LucideProps>, { size: 14 })}
              <span>{f.label}</span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};
