
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SidebarAccordionProps {
  id?: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  hasActiveItems?: boolean;
  children: React.ReactNode;
}

export const SidebarAccordion: React.FC<SidebarAccordionProps> = ({ 
  title, icon, isOpen, onToggle, hasActiveItems, children 
}) => {
  return (
    <div className="border-b border-black/5 dark:border-white/5 overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="text-slate-400 dark:text-gray-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{icon}</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white">{title}</span>
            {hasActiveItems && <div className="w-1.5 h-1.5 rounded-full bg-[#dfff1a] shadow-[0_0_8px_#dfff1a]"></div>}
          </div>
        </div>
        {isOpen ? <ChevronUp size={14} className="text-slate-400 dark:text-gray-600" /> : <ChevronDown size={14} className="text-slate-400 dark:text-gray-600" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50 dark:bg-black/40"
          >
            <div className="p-5 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
