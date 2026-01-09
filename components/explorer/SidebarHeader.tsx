import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarHeaderProps {
  authorName: string;
  onClose: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ authorName, onClose }) => {
  const { t } = useLanguage();
  return (
    <div className="p-4 md:p-8 border-b md:border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/20 md:bg-slate-50 md:dark:bg-black/20 transition-colors rounded-xl md:rounded-none">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-brand-blue to-purple-600 p-[1.5px] shadow-lg">
          <div className="w-full h-full rounded-[10.5px] md:rounded-[14.5px] bg-white dark:bg-[#0d0d0f] flex items-center justify-center text-slate-900 dark:text-white font-black italic text-xs transition-colors">
            {(authorName || 'S').charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="space-y-0.5">
          <h3 className="text-[12px] md:text-[13px] font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">{authorName || t('explorer.modal.architect')}</h3>
          <p className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-[0.3em]">{t('explorer.modal.architect')}</p>
        </div>
      </div>
      <button 
        onClick={onClose}
        className="hidden md:flex p-2 text-slate-400 dark:text-gray-500 hover:text-red-500 transition-all hover:rotate-90"
      >
        <X size={28} />
      </button>
    </div>
  );
};

export default SidebarHeader;