
import React from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';

interface MarketSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  count: number;
  colorClass: string;
  subtitle?: string;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
}

export const MarketSectionHeader: React.FC<MarketSectionHeaderProps> = ({ 
  icon: Icon, 
  title, 
  count, 
  colorClass,
  subtitle,
  onScrollLeft,
  onScrollRight
}) => (
  <div className="flex items-center justify-between mb-8 px-1">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl bg-opacity-10 shadow-sm ${colorClass.replace('text-', 'bg-')}`}>
        <Icon size={24} className={colorClass} />
      </div>
      <div className="flex flex-col">
        <h2 className={`text-2xl md:text-4xl font-black uppercase tracking-tighter italic ${colorClass}`}>{title}</h2>
        <div className="flex items-center gap-2">
          <div className={`h-0.5 w-12 rounded-full ${colorClass.replace('text-', 'bg-')}`}></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {subtitle || `${count} giải pháp`}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="hidden md:flex items-center gap-2 mr-4">
        <button 
          onClick={onScrollLeft}
          className="p-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          onClick={onScrollRight}
          className="p-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <button className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-brand-blue transition-colors">
        Xem tất cả <ChevronRight size={14} />
      </button>
    </div>
  </div>
);
